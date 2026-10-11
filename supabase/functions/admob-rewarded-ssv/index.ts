import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const KEY_URL = "https://www.gstatic.com/admob/reward/verifier-keys.json";
let keyCache: { at: number; keys: any[] } = { at: 0, keys: [] };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
function b64UrlBytes(input: string): Uint8Array {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function b64Bytes(input: string): Uint8Array {
  const clean = input.replace(/\s+/g, "");
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function derToRawEcdsa(sig: Uint8Array): Uint8Array {
  if (sig.length === 64) return sig;
  let i = 0;
  if (sig[i++] !== 0x30) throw new Error("BAD_DER_SEQUENCE");
  let seqLen = sig[i++];
  if (seqLen & 0x80) {
    const n = seqLen & 0x7f; seqLen = 0;
    for (let j = 0; j < n; j++) seqLen = (seqLen << 8) | sig[i++];
  }
  if (sig[i++] !== 0x02) throw new Error("BAD_DER_R");
  let rLen = sig[i++];
  let r = sig.slice(i, i + rLen); i += rLen;
  if (sig[i++] !== 0x02) throw new Error("BAD_DER_S");
  let sLen = sig[i++];
  let s = sig.slice(i, i + sLen);
  while (r.length > 32 && r[0] === 0) r = r.slice(1);
  while (s.length > 32 && s[0] === 0) s = s.slice(1);
  if (r.length > 32 || s.length > 32) throw new Error("BAD_DER_SIZE");
  const out = new Uint8Array(64);
  out.set(r, 32 - r.length);
  out.set(s, 64 - s.length);
  return out;
}
async function admobKeys() {
  const now = Date.now();
  if (keyCache.keys.length && now - keyCache.at < 6 * 60 * 60 * 1000) return keyCache.keys;
  const res = await fetch(KEY_URL, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error("KEY_FETCH_FAILED");
  const data = await res.json();
  const keys = Array.isArray(data?.keys) ? data.keys : [];
  if (!keys.length) throw new Error("NO_ADMOB_KEYS");
  keyCache = { at: now, keys };
  return keys;
}
async function verifySignature(content: string, signature: string, keyId: string) {
  const keys = await admobKeys();
  const found = keys.find((k: any) => String(k.keyId ?? k.key_id ?? "") === String(keyId));
  if (!found) throw new Error("UNKNOWN_KEY_ID");
  const material = String(found.base64 || found.pem || "").replace(/-----(?:BEGIN|END) PUBLIC KEY-----/g, "");
  const spki = b64Bytes(material);
  const key = await crypto.subtle.importKey("spki", spki, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
  const rawSig = derToRawEcdsa(b64UrlBytes(signature));
  return await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, rawSig, new TextEncoder().encode(content));
}

Deno.serve(async (req: Request) => {
  if (req.method !== "GET") return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);
  try {
    const raw = req.url.split("?")[1] || "";
    const sigMarker = "&signature=";
    const sigPos = raw.lastIndexOf(sigMarker);
    if (sigPos < 0) return json({ ok: false, error: "SIGNATURE_MISSING" }, 400);
    const content = raw.slice(0, sigPos);
    const tail = raw.slice(sigPos + 1);
    const tailParams = new URLSearchParams(tail);
    const signature = tailParams.get("signature") || "";
    const keyId = tailParams.get("key_id") || "";
    if (!signature || !keyId) return json({ ok: false, error: "SIGNATURE_FIELDS_MISSING" }, 400);

    // V8.389: Google's SSV Java verifier uses URI.getQuery(), i.e. the
    // percent-decoded signed content. The new Grow placement includes an
    // encoded ':' in custom_data (%3A), while older placements were plain.
    // First retain the verified legacy bytes. Only for the Grow placement,
    // retry against Google's decoded query bytes using the SAME ECDSA key.
    // Never bypass signature verification or grant from a client callback.
    let verified = await verifySignature(content, signature, keyId);
    if (!verified && /(?:^|&)custom_data=growlegends_grow25_v1%3[aA]/.test(content)) {
      verified = await verifySignature(decodeURIComponent(content), signature, keyId);
    }
    if (!verified) return json({ ok: false, error: "INVALID_SIGNATURE" }, 403);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const { data: settings, error: settingsError } = await db
      .from("ad_bag_settings")
      .select("enabled,mode,admob_rewarded_unit_id,reward_item")
      .eq("id", 1)
      .single();
    if (settingsError) throw settingsError;

    // AdMob's UI sends a signed test callback when "URL bestätigen" is used.
    // In test mode we verify Google's signature but deliberately grant no game reward.
    if (!settings?.enabled || settings?.mode !== "production") {
      return json({ ok: true, verified: true, testMode: true, rewardApplied: false });
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get("user_id") || "";
    const customData = url.searchParams.get("custom_data") || "";
    const adBagCustom = ["growlegends_adbag_v1", "growlegends_adbag_v1:server1", "growlegends_adbag_v1_server1"].includes(customData);
    const quest25Custom = ["growlegends_quest25_v1", "growlegends_quest25_v1:server1"].includes(customData);
    // V8.395: same signed Grow reward, explicitly bound to the target world.
    // Legacy Beta payload stays exact; Server1 requires its own signed suffix.
    const grow25Match = /^growlegends_grow25_v1:(srv_grow_[0-9a-f]{32})(:server1)?$/.exec(customData);
    const targetSchema = (customData.endsWith(":server1") || customData.endsWith("_server1")) ? "server1" : "public";
    const transactionId = url.searchParams.get("transaction_id") || "";
    const adUnit = url.searchParams.get("ad_unit") || "";
    const rewardItem = url.searchParams.get("reward_item") || "";

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
      return json({ ok: false, error: "INVALID_USER_ID" }, 400);
    }
    if (!adBagCustom && !quest25Custom && !grow25Match) {
      return json({ ok: false, error: "INVALID_CUSTOM_DATA" }, 400);
    }
    if (transactionId.length < 8) return json({ ok: false, error: "INVALID_TRANSACTION" }, 400);

    const configuredUnit = String(settings.admob_rewarded_unit_id || "");
    const configuredSuffix = configuredUnit.includes("/") ? configuredUnit.split("/").pop()! : configuredUnit;
    if (configuredSuffix !== adUnit && configuredUnit !== adUnit) {
      return json({ ok: false, error: "WRONG_AD_UNIT" }, 403);
    }
    if (settings.reward_item && String(settings.reward_item) !== rewardItem) {
      return json({ ok: false, error: "WRONG_REWARD_ITEM" }, 403);
    }

    const rpcName = grow25Match
      ? "v8388_grow_rewarded_apply_verified"
      : quest25Custom
        ? "v8188_quest_rewarded_apply_verified"
        : "v7215_ad_bag_apply_verified";
    const { data, error } = await db.schema(targetSchema).rpc(rpcName, {
      p_user_id: userId,
      p_provider_event_id: transactionId,
      p_provider: "admob",
      ...(grow25Match ? { p_plant_uid: grow25Match[1] } : {}),
    });
    if (error) throw error;
    return json({
      ok: true,
      server: targetSchema === "server1" ? "server1" : "beta",
      placement: grow25Match ? "grow_time_25" : quest25Custom ? "quest_time_25" : "ad_bag",
      result: data,
    });
  } catch (e) {
    console.error("admob-rewarded-ssv", e);
    return json({ ok: false, error: String((e as any)?.message || e) }, 500);
  }
});

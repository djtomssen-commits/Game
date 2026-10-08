import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { importPKCS8, SignJWT } from "npm:jose@5.9.6";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PACKAGE_NAME = "de.growlegends.app";
const HARZ_PRODUCT_MAP: Record<string, number> = {
  harz_25: 25,
  harz_50: 50,
  harz_100: 100,
  harz_150: 150,
  harz_250: 250,
  harz_400: 400,
  harz_600: 600,
  harz_900: 900,
  harz_1300: 1300,
  harz_2000: 2000,
};
const VIP_PRODUCT_MAP: Record<string, number> = {
  vip_7day: 7,
  vip_7d: 7,
  vip_14d: 14,
  vip_30d: 30,
};
const PRODUCT_IDS = [...Object.keys(HARZ_PRODUCT_MAP), ...Object.keys(VIP_PRODUCT_MAP)];

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, "Content-Type": "application/json" },
});

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function googleAccessToken(serviceAccountJson: string) {
  const sa = JSON.parse(serviceAccountJson);
  if (!sa?.client_email || !sa?.private_key) throw new Error("Ungültiges Google-Servicekonto-JSON.");

  const now = Math.floor(Date.now() / 1000);
  const key = await importPKCS8(String(sa.private_key), "RS256");
  const assertion = await new SignJWT({ scope: "https://www.googleapis.com/auth/androidpublisher" })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(String(sa.client_email))
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data?.access_token) throw new Error(`Google OAuth fehlgeschlagen: ${data?.error_description || data?.error || res.status}`);
  return String(data.access_token);
}


async function consumeGooglePurchase(accessToken: string, productId: string, purchaseToken: string) {
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(PACKAGE_NAME)}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:consume`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  if (res.ok) return { ok: true, status: res.status };
  const body = await res.text().catch(() => "");
  console.warn("google-play-consume-failed", {
    productId,
    status: res.status,
    body: body.slice(0, 300)
  });
  return { ok: false, status: res.status, body };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "POST erforderlich" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const googleServiceAccount = Deno.env.get("GOOGLE_PLAY_SERVICE_ACCOUNT_JSON") || "";
    const authHeader = req.headers.get("Authorization") || "";

    if (!supabaseUrl || !anonKey || !serviceRole) return json({ ok: false, error: "Supabase-Umgebung unvollständig" }, 500);
    if (!authHeader.startsWith("Bearer ")) return json({ ok: false, error: "Nicht angemeldet" }, 401);

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user?.id) return json({ ok: false, error: "Ungültige Sitzung" }, 401);
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    if (body?.action === "health") {
      return json({ ok: true, ready: Boolean(googleServiceAccount), packageName: PACKAGE_NAME });
    }

    if (!googleServiceAccount) return json({ ok: false, error: "Google-Play-Serverprüfung ist noch nicht konfiguriert" }, 503);

    if (body?.action === "recover_token") {
      const purchaseToken = String(body?.purchaseToken || "");
      const serverId = body?.serverId === "server1" ? "server1" : body?.serverId === "beta" ? "beta" : "";
      if (!serverId) return json({ ok: false, error: "Ungültiger Zielserver" }, 400);
      if (purchaseToken.length < 8) return json({ ok: false, error: "purchaseToken fehlt" }, 400);

      const accessToken = await googleAccessToken(googleServiceAccount);
      const expectedAccount = await sha256(userId);
      let matchedProductId = "";
      let matchedPlay: any = null;

      for (const candidate of PRODUCT_IDS) {
        const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(PACKAGE_NAME)}/purchases/products/${encodeURIComponent(candidate)}/tokens/${encodeURIComponent(purchaseToken)}`;
        const playRes = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
        const play = await playRes.json().catch(() => ({}));
        if (!playRes.ok) continue;
        matchedProductId = candidate;
        matchedPlay = play;
        break;
      }

      if (!matchedProductId || !matchedPlay) {
        return json({ ok: false, error: "Google Play findet diesen offenen Kauf nicht mehr", recoverable: false }, 404);
      }

      const purchaseState = Number(matchedPlay?.purchaseState ?? 0);
      if (purchaseState !== 0) {
        const stateName = purchaseState === 1 ? "CANCELED" : purchaseState === 2 ? "PENDING" : "UNKNOWN";
        console.log("google-play-recovery-state", {
          userId,
          serverId,
          productId: matchedProductId,
          purchaseState,
          stateName,
          orderId: matchedPlay?.orderId || null
        });
        return json({
          ok: false,
          error: purchaseState === 2
            ? "Google Play verarbeitet den Kauf noch."
            : purchaseState === 1
              ? "Google Play meldet den Kauf als storniert/abgebrochen."
              : "Google Play meldet einen nicht abgeschlossenen Kaufstatus.",
          productId: matchedProductId,
          purchaseState,
          stateName,
          recoverable: purchaseState === 2
        }, 200);
      }

      if (matchedPlay?.obfuscatedExternalAccountId && String(matchedPlay.obfuscatedExternalAccountId) !== expectedAccount) {
        return json({ ok: false, error: "Kauf gehört nicht zu diesem Grow-Legends-Account" }, 403);
      }

      const targetSchema = serverId === "server1" ? "server1" : "public";
      const isVip = Object.prototype.hasOwnProperty.call(VIP_PRODUCT_MAP, matchedProductId);
    // V8.293: VIP entitlements now supported on both beta and server1.
    // The target RPC enforces global purchase-token idempotency.
      const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
      const rpcName = isVip ? "v8195_credit_google_play_vip_purchase" : "gl_credit_google_play_purchase";
      const { data, error } = await admin.schema(targetSchema).rpc(rpcName, {
        p_user_id: userId,
        p_purchase_token: purchaseToken,
        p_product_id: matchedProductId,
        p_order_id: String(matchedPlay?.orderId || "") || null,
        p_google_payload: matchedPlay,
      });
      if (error) throw error;

      const consumeResult = await consumeGooglePurchase(accessToken, matchedProductId, purchaseToken);
      console.log("google-play-recovered", {
        userId,
        serverId,
        productId: matchedProductId,
        orderId: matchedPlay?.orderId || null,
        consumedServerSide: consumeResult.ok
      });
      return json({
        ...(data || (isVip
          ? { ok: true, productId: matchedProductId, vipDaysAdded: VIP_PRODUCT_MAP[matchedProductId] }
          : { ok: true, productId: matchedProductId, harzAdded: HARZ_PRODUCT_MAP[matchedProductId] })),
        recovered: true,
        productId: matchedProductId,
        server: serverId,
        consumedServerSide: consumeResult.ok
      });
    }

    if (body?.action !== "verify") return json({ ok: false, error: "Unbekannte Aktion" }, 400);

    const productId = String(body?.productId || "");
    const purchaseToken = String(body?.purchaseToken || "");
    const serverId = body?.serverId === "server1" ? "server1" : body?.serverId === "beta" ? "beta" : "";
    if (!serverId) return json({ ok: false, error: "Ungültiger Zielserver" }, 400);
    const targetSchema = serverId === "server1" ? "server1" : "public";
    const isVip = Object.prototype.hasOwnProperty.call(VIP_PRODUCT_MAP, productId);
    const isHarz = Object.prototype.hasOwnProperty.call(HARZ_PRODUCT_MAP, productId);
    if (!isVip && !isHarz) return json({ ok: false, error: "Unbekannte Produkt-ID" }, 400);
    // V8.293: VIP entitlements now supported on both beta and server1.
    // The target RPC enforces global purchase-token idempotency.
    if (purchaseToken.length < 8) return json({ ok: false, error: "purchaseToken fehlt" }, 400);

    const accessToken = await googleAccessToken(googleServiceAccount);
    const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(PACKAGE_NAME)}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}`;
    const playRes = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const play = await playRes.json().catch(() => ({}));
    if (!playRes.ok) return json({ ok: false, error: `Google Play konnte den Kauf nicht bestätigen (${playRes.status})` }, playRes.status === 404 ? 409 : 502);

    const purchaseState = Number(play?.purchaseState ?? 0);
    if (purchaseState !== 0) return json({ ok: false, error: "Kauf ist noch nicht abgeschlossen", purchaseState }, 409);

    const expectedAccount = await sha256(userId);
    if (play?.obfuscatedExternalAccountId && String(play.obfuscatedExternalAccountId) !== expectedAccount) {
      return json({ ok: false, error: "Kauf gehört nicht zu diesem Grow-Legends-Account" }, 403);
    }

    const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
    const rpcName = isVip ? "v8195_credit_google_play_vip_purchase" : "gl_credit_google_play_purchase";
    const { data, error } = await admin.schema(targetSchema).rpc(rpcName, {
      p_user_id: userId,
      p_purchase_token: purchaseToken,
      p_product_id: productId,
      p_order_id: String(play?.orderId || body?.orderId || "") || null,
      p_google_payload: play,
    });
    if (error) throw error;

    const consumeResult = await consumeGooglePurchase(accessToken, productId, purchaseToken);
    console.log("google-play-credit", {
      userId,
      serverId,
      productId,
      orderId: play?.orderId || body?.orderId || null,
      consumedServerSide: consumeResult.ok
    });
    return json({
      ...(data || (isVip
        ? { ok: true, productId, vipDaysAdded: VIP_PRODUCT_MAP[productId] }
        : { ok: true, productId, harzAdded: HARZ_PRODUCT_MAP[productId] })),
      server: serverId,
      consumedServerSide: consumeResult.ok
    });
  } catch (e) {
    console.error("verify-google-play-purchase", e);
    return json({ ok: false, error: String(e?.message || e || "Unbekannter Fehler") }, 500);
  }
});
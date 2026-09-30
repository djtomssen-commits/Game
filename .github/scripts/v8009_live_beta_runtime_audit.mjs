import { chromium } from 'playwright';

const url = 'https://gamenew.djtomssen.workers.dev/beta';
const out = {
  url,
  started_at: new Date().toISOString(),
  console_errors: [],
  page_errors: [],
  failed_requests: [],
  bad_responses: [],
  states: []
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });

page.on('console', msg => {
  if (msg.type() === 'error') out.console_errors.push(msg.text());
});
page.on('pageerror', err => out.page_errors.push(String(err?.stack || err)));
page.on('requestfailed', req => out.failed_requests.push({
  url: req.url(),
  failure: req.failure()?.errorText || 'unknown'
}));
page.on('response', res => {
  if (res.status() >= 400) out.bad_responses.push({ status: res.status(), url: res.url() });
});

try {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  out.http_status = response?.status() ?? null;
  out.states.push({ at_ms: 0, url: page.url(), title: await page.title() });

  for (const ms of [1000, 3000, 7000, 12000]) {
    await page.waitForTimeout(ms - (out.states.at(-1)?.elapsed_ms || 0));
    const state = await page.evaluate(() => {
      const auth = document.querySelector('#v075AuthOverlay');
      const world = document.querySelector('#world');
      const bodyText = (document.body?.innerText || '').slice(0, 1200);
      return {
        readyState: document.readyState,
        auth_exists: !!auth,
        auth_display: auth ? getComputedStyle(auth).display : null,
        auth_visibility: auth ? getComputedStyle(auth).visibility : null,
        auth_opacity: auth ? getComputedStyle(auth).opacity : null,
        auth_text: auth ? (auth.innerText || '').slice(0, 500) : null,
        world_active: !!world?.classList.contains('active'),
        auth_ready: window.__V200_AUTH_READY__ === true,
        logout_preparing: window.__V4136_LOGOUT_PREPARING__ === true,
        has_new_auth_fix: typeof window.__V4136_LOGOUT_PREPARING__ !== 'undefined' || document.documentElement.innerHTML.includes('__V4136_LOGOUT_PREPARING__'),
        body_text: bodyText
      };
    });
    out.states.push({ at_ms: ms, elapsed_ms: ms, ...state });
  }
} catch (e) {
  out.navigation_error = String(e?.stack || e);
}

out.finished_at = new Date().toISOString();
console.log(JSON.stringify(out, null, 2));
await browser.close();

if (out.navigation_error || out.page_errors.length || out.failed_requests.length || out.bad_responses.some(x => x.status >= 500)) {
  process.exitCode = 2;
}

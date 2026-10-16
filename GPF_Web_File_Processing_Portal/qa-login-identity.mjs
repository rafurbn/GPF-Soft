// Regression guard for the login-identity bug fixed on 2026-10-16.
//
// The Recovery email box must NOT be used as the sign-in identity. When a stale
// address sits in localStorage ('gpf-active-user-email') the form must still sign
// in with the permanent upazila ID.
export default async function run(page, ui) {
  const out = {};

  // Poison localStorage with a leftover recovery address BEFORE the app mounts.
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('gpf-active-user-email', 'leftover@gmail.com');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const snap = await ui.snapshot();
  out.snapshot = snap;

  // The email box must be pre-filled from storage (that part is intended).
  out.emailBoxValue = await page
    .locator('input[placeholder*="rafurbn@gmail.com"]')
    .first()
    .inputValue()
    .catch(() => 'ERR');

  // The permanent login ID must be shown next to "আপনার login ID".
  out.loginIdShown = await page.evaluate(() => {
    const label = [...document.querySelectorAll('span')].find((s) => s.innerText.trim() === 'আপনার login ID');
    if (!label) return null;
    const block = label.closest('div')?.parentElement;
    const code = block ? [...block.querySelectorAll('span')].map((s) => s.innerText.trim()).find((t) => /^[A-Za-z]{3}\d{3}$/.test(t)) : null;
    return code || null;
  });

  // Record which identifier the app actually submits. We intercept the login by
  // watching the dashboard's upazila context AFTER submit - a stale email must not
  // appear as the login id.
  const requests = [];
  page.on('request', (r) => {
    const u = r.url();
    if (u.includes('/auth/v1/') || u.includes('/functions/v1/')) {
      requests.push({ url: u, method: r.method() });
    }
  });

  const pw = page.locator('input[placeholder="পাসওয়ার্ড লিখুন"]').first();
  await pw.click();
  await pw.fill('Gpf@10101');
  await page.waitForTimeout(250);

  const mid = await ui.snapshot();
  out.signInDisabled = mid.includes('"সাইন ইন করুন" [disabled]');
  await page.locator('button:has-text("সাইন ইন করুন")').first().click();
  await page.waitForTimeout(3000);

  const body = await page.evaluate(() => document.body.innerText);
  out.dashboardRendered = body.includes('লগআউট');
  out.upazilaContextCode = await page.evaluate(() => localStorage.getItem('gpf-active-upazila-code'));
  out.sentRequests = requests;
  out.bodyHead = body.slice(0, 300);

  return out;
}

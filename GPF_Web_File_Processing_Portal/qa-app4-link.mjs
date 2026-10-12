// Verifies APP4 (gpf_DeathClaim -> /app4/index.html) linking end to end.
// Run: node <skill>/browser.mjs http://localhost:3000/ --script ./qa-app4-link.mjs
export default async function run(page, ui) {
  // Reaching the launcher (where the app cards live) normally requires sign-in.
  // On this machine Supabase is NOT configured, so the submit button is stuck at
  // `disabled={!isSupabaseConfigured}` and the form can never sign in. The app
  // therefore supports an offline demo session that `src/App.tsx` restores from
  // the `gpf-offline-session` localStorage key on mount. Seed that same session
  // plus the Upazila context, then reload - the REAL launcher renders and we test
  // the REAL app-card click, not a stand-in.
  const DEMO_USER = {
    id: 'usr-10101',
    email: 'rafurbn@gmail.com',
    upazila_code: '10101',
    upazila_name_bn: 'বিয়ানীবাজার',
    district_name_bn: 'সিলেট',
    division_name_bn: 'সিলেট',
    role: 'upazila_user',
    is_first_login: false,
    phone: '01732-679551',
    last_login: '২০২৬-০৯-২৪',
  };

  await page.evaluate((user) => {
    localStorage.setItem('gpf-offline-session', JSON.stringify(user));
    localStorage.setItem('gpf-active-upazila-session', JSON.stringify(user));
    localStorage.setItem('gpf-active-upazila-code', user.upazila_code);
    localStorage.setItem('gpf-active-upazila-name', user.upazila_name_bn);
    localStorage.setItem('gpf-active-upazila-district', user.district_name_bn);
  }, DEMO_USER);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const snap = await ui.snapshot();

  // Match the REAL app-4 card label from OfficialDashboard.tsx:
  // title "জিপিএফ মৃত্যুদাবী নিষ্পত্তি", badge/desc mention "মৃত কর্মচারী".
  const app4Ref =
    snap.match(/@(e\d+) button "[^"]*জিপিএফ মৃত্যুদাবী[^"]*"/)?.[1] ??
    snap.match(/@(e\d+) button "[^"]*মৃত কর্মচারী[^"]*"/)?.[1] ??
    snap.match(/@(e\d+) button "[^"]*gpf_DeathClaim[^"]*"/)?.[1] ??
    null;

  if (!app4Ref) return { error: 'APP4 control not found on launcher', snap };

  // Click and wait for the MPA navigation to /app4/index.html. Do NOT swallow
  // the timeout with .catch(() => null): a silent failure is what made the old
  // script report a false pass.
  let navError = null;
  try {
    await Promise.all([
      page.waitForURL(/\/app4\/index\.html/, { timeout: 15000 }),
      ui.click(app4Ref),
    ]);
  } catch (err) {
    navError = String(err?.message || err);
  }
  await page.waitForTimeout(1500);

  const title = await page.title();
  const bodyChars = (await page.evaluate(() => document.body.innerText.length)) || 0;

  return {
    app4Ref,
    landedUrl: page.url(),
    navigatedToApp4: /\/app4\/index\.html/.test(page.url()),
    navError,
    title,
    bodyChars,
    mounted: bodyChars > 100,
    bodyHead: (await page.evaluate(() => document.body.innerText.slice(0, 300))) || '',
  };
}

// Cold-load probe for /app4/index.html. Answers the one question the other QA
// scripts cannot: does app4 mount when opened DIRECTLY (fresh browser, no
// seeded localStorage), or does it silently bounce to the dashboard?
export default async function run(page, ui) {
  const events = [];

  page.on('framenavigated', (f) => {
    if (f === page.mainFrame()) events.push({ type: 'navigated', url: f.url() });
  });

  const out = {};

  // Seeded exactly the way the root dashboard does it before opening a sub-app.
  const DEMO_USER = {
    id: 'usr-Bea002',
    email: 'rafurbn@gmail.com',
    upazila_code: 'Bea002',
    upazila_name_bn: 'বিয়ানীবাজার',
    district_name_bn: 'সিলেট',
    division_name_bn: 'সিলেট',
    role: 'upazila_user',
    is_first_login: false,
    phone: '01732-679551',
    last_login: '২০২৬-১০-১৬',
  };

  await page.evaluate((user) => {
    localStorage.setItem('gpf-active-upazila-session', JSON.stringify(user));
    localStorage.setItem('gpf-active-upazila-code', user.upazila_code);
    localStorage.setItem('gpf-active-upazila-name', user.upazila_name_bn);
    localStorage.setItem('gpf-active-upazila-district', user.district_name_bn);
    localStorage.setItem('gpf-active-upazila-division', user.division_name_bn);
  }, DEMO_USER);

  // Force a real cold load of the app4 document (no client-side router involved).
  await page.goto('http://127.0.0.1:3000/app4/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  out.finalUrl = page.url();
  out.title = await page.title();
  const body = await page.evaluate(() => document.body.innerText);
  out.bodyChars = body.length;
  out.mounted = body.length > 100;
  out.bodyHead = body.slice(0, 400);

  // Which element owns #root? If app4 mounted, it should NOT be the dashboard.
  out.rootChildCount = await page.evaluate(() => document.getElementById('root')?.childElementCount ?? -1);
  out.renderedApp4 = body.includes('মৃত্যুদাবি') || body.includes('মৃত কর্মচারী') || body.includes('ডেথ');
  out.navigationEvents = events;

  return out;
}

// Smoke-tests every MPA sub-app page: app1, app2, app3, app4.
// Seeded the same way the dashboard seeds it, then each page is cold-loaded.
export default async function run(page, ui) {
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

  const seed = async () => {
    await page.evaluate((user) => {
      localStorage.setItem('gpf-active-upazila-session', JSON.stringify(user));
      localStorage.setItem('gpf-active-upazila-code', user.upazila_code);
      localStorage.setItem('gpf-active-upazila-name', user.upazila_name_bn);
      localStorage.setItem('gpf-active-upazila-district', user.district_name_bn);
      localStorage.setItem('gpf-active-upazila-division', user.division_name_bn);
    }, DEMO_USER);
  };

  const apps = [
    { key: 'app1', url: 'http://127.0.0.1:3000/app1/index.html', expect: ['অগ্রিম', 'ফেরতযোগ্য'] },
    { key: 'app2', url: 'http://127.0.0.1:3000/app2/index.html', expect: ['অফেরতযোগ্য', 'অগ্রিম'] },
    { key: 'app3', url: 'http://127.0.0.1:3000/app3/index.html', expect: ['চূড়ান্ত', 'নো'] },
    { key: 'app4', url: 'http://127.0.0.1:3000/app4/index.html', expect: ['মৃত্যুদাবি', 'ডেথ'] },
  ];

  const results = [];
  for (const app of apps) {
    const errors = [];
    const onErr = (e) => errors.push(String(e?.message || e));
    page.on('pageerror', onErr);

    await page.goto(app.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3500);
    await seed();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3500);

    const body = await page.evaluate(() => document.body.innerText);
    results.push({
      key: app.key,
      finalUrl: page.url(),
      title: await page.title(),
      bodyChars: body.length,
      mounted: body.length > 100,
      bouncedToDashboard: body.includes('সাইন ইন করুন') && body.includes('শর্ত খুঁজুন'),
      hasExpectedText: app.expect.some((t) => body.includes(t)),
      pageErrors: errors,
      head: body.slice(0, 220),
    });
    page.off('pageerror', onErr);
  }

  return { results };
}

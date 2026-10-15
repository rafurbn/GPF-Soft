// Probe: does the sign-in button enable once the ID + password fields hold real values?
export default async function run(page, ui) {
  const snap = await ui.snapshot();
  const cbRef = snap.match(/@(e\d+) checkbox/)?.[1];

  // Target inputs by placeholder. NOTE: the page has a separate search box
  // ("শর্ত খুঁজুন...") which is also an <input type=text>, so a generic
  // text-input selector picks the wrong field.
  const idBox = page.locator('input[placeholder="উপজেলা ID অথবা ইমেইল"]');
  const pwBox = page.locator('input[placeholder="পাসওয়ার্ড লিখুন"]');

  await idBox.click();
  await idBox.fill('10101');
  await pwBox.click();
  await pwBox.fill('Gpf@10101');
  await page.waitForTimeout(400);

  const read = () => page.evaluate(() => {
    const idEl = document.querySelector('input[placeholder="উপজেলা ID অথবা ইমেইল"]');
    const pwEl = document.querySelector('input[type="password"]');
    const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('সাইন ইন করুন'));
    const cb = document.querySelector('input[type="checkbox"]');
    return {
      idValue: idEl ? idEl.value : null,
      pwValue: pwEl ? pwEl.value : null,
      signInDisabled: btn ? btn.disabled : 'no-btn',
      checkboxChecked: cb ? cb.checked : 'no-cb',
      btnVisible: btn ? !!(btn.offsetParent) : false,
    };
  });

  const info = await read();

  if (info.checkboxChecked === false && cbRef) {
    await ui.click(cbRef);
    await page.waitForTimeout(300);
  }

  const after = await read();
  return { info, after };
}

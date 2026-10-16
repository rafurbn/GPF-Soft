// End-to-end check of the password-recovery / OTP entry point on the sign-in screen.
// The "Recovery email" box must carry its value INTO the OTP modal; previously the
// modal was opened with a hard-coded empty string, so the user had to retype it.
export default async function run(page, ui) {
  const out = {};

  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('gpf-active-user-email', 'rafurbn@gmail.com');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const snap = await ui.snapshot();
  const forgotRef = snap.match(/@(e\d+) button "[^"]*পাসওয়ার্ড ভুলে গিয়েছেন[^"]*"/)?.[1];
  out.forgotRef = forgotRef ?? null;
  if (!forgotRef) return { error: 'forgot-password button not found', snap };

  await ui.click(forgotRef);
  await page.waitForTimeout(1200);

  const modalSnap = await ui.snapshot();
  out.modalSnapshot = modalSnap;

  // The modal's email field must be pre-filled from the Recovery email box.
  out.prefilledEmail = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input')];
    const mail = inputs.find((i) => (i.value || '').includes('@'));
    return mail ? mail.value : null;
  });

  // The modal must render real controls, not a blank overlay.
  const modalText = await page.evaluate(() => document.body.innerText);
  out.modalHasHeading = /ওটিপি|OTP|পাসওয়ার্ড/.test(modalText);
  out.modalChars = modalText.length;

  return out;
}

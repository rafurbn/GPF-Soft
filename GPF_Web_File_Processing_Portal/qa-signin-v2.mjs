// Verifies the CURRENT sign-in form on the live dev server.
//
// The 2026-10-16 change replaced the old "উপজেলা ID অথবা ইমেইল" text input with a
// read-only login ID block + a Recovery email box. So this script asserts what the
// real page actually renders now, and reports anything the change broke.
export default async function run(page, ui) {
  const out = { steps: [] };

  const snap = await ui.snapshot();
  out.initialSnapshot = snap;

  // 1. The old text input must be GONE - it was replaced by the login ID block.
  const legacyInput = page.locator('input[placeholder="উপজেলা ID অথবা ইমেইল"]');
  out.legacyIdInputCount = await legacyInput.count();

  // 2. The Recovery email box must exist.
  const emailBox = page.locator('input[placeholder*="rafurbn@gmail.com"]');
  out.recoveryEmailCount = await emailBox.count();

  // 3. The displayed default login ID must be the selected region's defaultId.
  out.displayedLoginId = await page.evaluate(() => {
    const el = [...document.querySelectorAll('span')].find((s) =>
      /^[A-Za-z]{3}\d{3}$/.test(s.innerText.trim()),
    );
    return el ? el.innerText.trim() : null;
  });

  // 4. The permanent region block (locked by default) must be shown, not dropdowns.
  out.lockedRegionVisible = snap.includes('কর্মরত উপজেলা ও জেলা (লকড ও স্থায়ী)');
  out.regionSelectCount = await page.locator('select').count();

  // 5. The registration CTA that was removed must be gone.
  out.registrationButtonCount = await page.evaluate(
    () => [...document.querySelectorAll('button')].filter((b) => b.innerText.includes('প্রথমে উপজেলা আইডি তৈরি')).length,
  );

  // --- Drive the actual submit path ---
  const pw = page.locator('input[placeholder="পাসওয়ার্ড লিখুন"]');
  await pw.click();
  await pw.fill('Gpf@10101');
  await page.waitForTimeout(300);

  const mid = await ui.snapshot();
  const signInRef = mid.match(/@(e\d+) button "সাইন ইন করুন"/)?.[1];
  out.signInRef = signInRef ?? null;
  out.signInDisabled = mid.includes('"সাইন ইন করুন" [disabled]');
  if (!signInRef) return { error: 'sign-in button not found', ...out };

  // Terms checkbox starts checked in this build; only click when it is not.
  if (mid.match(/@(e\d+) checkbox(?! \[checked\])/)) {
    const cbRef = mid.match(/@(e\d+) checkbox/)?.[1];
    if (cbRef) await ui.click(cbRef);
    await page.waitForTimeout(200);
  }

  const formRef = mid.match(/@(e\d+) checkbox/)?.[1];
  out.checkboxRef = formRef ?? null;

  // Submit. Supabase is NOT configured on this machine, so we expect either the
  // offline local fallback (dashboard renders) or a Bangla error message - but
  // NOT a blank page and NOT an unhandled crash.
  await page.locator('button:has-text("সাইন ইন করুন")').first().click();
  await page.waitForTimeout(3000);

  const afterText = await page.evaluate(() => document.body.innerText);
  out.afterBodyChars = afterText.length;
  out.dashboardRendered = afterText.includes('লগআউট') || afterText.includes('মৃত্যুদাবি') || afterText.includes('ড্যাশবোর্ড');
  out.errorShown = /সাইন ইন করা যায়নি|সংযোগ প্রস্তুত নয়|ইমেইল অথবা পাসওয়ার্ড সঠিক নয়|সেবা এখনো চালু হয়নি/.test(afterText);
  out.afterHead = afterText.slice(0, 600);

  return out;
}

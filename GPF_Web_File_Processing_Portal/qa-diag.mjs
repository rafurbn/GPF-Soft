// Diagnose why "সাইন ইন করুন" stays disabled after filling credentials.
export default async function run(page, ui) {
  const before = await ui.snapshot()

  const idRef = before.match(/@(e\d+) textbox "উপজেলা ID অথবা ইমেইল"/)?.[1]
  const pwRef = before.match(/@(e\d+) textbox "পাসওয়ার্ড লিখুন"/)?.[1]
  const btnRef = before.match(/@(e\d+) button "সাইন ইন করুন"/)?.[1]

  const out = { idRef, pwRef, btnRef, steps: [] }

  // Method 1: ui.fill (what the previous QA script used)
  await ui.fill(idRef, '10101')
  await ui.fill(pwRef, 'Gpf@10101')
  await page.waitForTimeout(400)
  out.steps.push({
    method: 'ui.fill',
    idValue: await page.locator('input[placeholder*="উপজেলা"]').first().inputValue().catch(() => 'ERR'),
    pwValue: await page.locator('input[type=password], input[placeholder*="পাসওয়ার্ড"]').first().inputValue().catch(() => 'ERR'),
    disabled: await page.locator('button:has-text("সাইন ইন করুন")').first().isDisabled().catch(() => 'ERR'),
  })

  // Method 2: type character by character to fire React onChange
  await page.locator('input[placeholder*="উপজেলা"]').first().click()
  await page.locator('input[placeholder*="উপজেলা"]').first().press('Control+A')
  await page.locator('input[placeholder*="উপজেলা"]').first().type('10101', { delay: 40 })
  const pw = page.locator('input[type=password]').first()
  await pw.click()
  await pw.press('Control+A')
  await pw.type('Gpf@10101', { delay: 40 })
  await page.waitForTimeout(600)
  out.steps.push({
    method: 'type-slow',
    idValue: await page.locator('input[placeholder*="উপজেলা"]').first().inputValue().catch(() => 'ERR'),
    pwValue: await pw.inputValue().catch(() => 'ERR'),
    disabled: await page.locator('button:has-text("সাইন ইন করুন")').first().isDisabled().catch(() => 'ERR'),
  })

  const after = await ui.snapshot()
  out.after = after
  return out
}

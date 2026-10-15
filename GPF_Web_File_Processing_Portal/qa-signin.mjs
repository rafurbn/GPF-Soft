// Sign in and inspect the death-claim dashboard that yesterday's work touched.
export default async function run(page, ui) {
  const before = await ui.snapshot()

  // Fill the upazila ID and password, tick the terms checkbox.
  const idRef = before.match(/@(e\d+) textbox "উপজেলা ID অথবা ইমেইল"/)?.[1]
  const pwRef = before.match(/@(e\d+) textbox "পাসওয়ার্ড লিখুন"/)?.[1]
  if (!idRef || !pwRef) return { error: 'login fields not found', before }

  await ui.fill(idRef, '10101')
  await ui.fill(pwRef, 'Gpf@10101')
  await page.waitForTimeout(300)

  const mid = await ui.snapshot()
  const signIn = mid.match(/@(e\d+) button "সাইন ইন করুন"/)?.[1]
  if (!signIn) return { error: 'sign-in button not found', mid }
  if (mid.includes('"সাইন ইন করুন" [disabled]')) {
    return { error: 'sign-in still disabled after filling credentials', mid }
  }

  await ui.click(signIn)
  await page.waitForTimeout(2500)

  const after = await ui.snapshot()
  const tree = await ui.snapshot({ full: true })
  return {
    signedIn: after.includes('মৃত্যুদাবি') || after.includes('ড্যাশবোর্ড') || after.includes('এবং'),
    after,
    treeHead: tree.slice(0, 2500),
  }
}

import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function openReferral(page, success) {
  // Serve local built assets at the production origin to exercise the real
  // Web3Forms branch, while intercepting every submission (no emails sent).
  await page.route("https://rushconnectandcare.com.au/**", async route => {
    const pathname = new URL(route.request().url()).pathname;
    const file = pathname.endsWith(".js") ? pathname.slice(1) : pathname.slice(1) + ".html";
    if (!/^[a-z0-9.-]+$/.test(file)) return route.abort();
    try {
      await route.fulfill({ body: await readFile(`dist/${file}`), contentType: file.endsWith(".js") ? "application/javascript" : "text/html" });
    } catch { await route.abort(); }
  });
  await page.route("https://api.web3forms.com/submit", async route => {
    const data = route.request().postDataJSON();
    expect(data.participant).toBe("TEST ONLY");
    expect(data.participant_consent).toBe("Consent confirmed by referrer");
    expect(data.subject).toContain("participant referral");
    expect(data.redirect).toBeUndefined();
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success }) });
  });
  await page.goto("https://rushconnectandcare.com.au/support-coordinators");
  await page.getByLabel("Your name *", { exact: true }).fill("Referral test");
  await page.getByLabel("Your email *", { exact: true }).fill("test@example.com");
  await page.getByLabel("Participant first name or initials *").fill("TEST ONLY");
  await page.getByLabel("Participant suburb *").fill("Preston");
  await page.getByLabel("Funding type *").selectOption("Plan-managed");
  await page.getByLabel("Support needed and main goal *").fill("Test referral, no real participant.");
}

test("referral requires consent and confirms provider acceptance", async ({ page }) => {
  await openReferral(page, true);
  await page.getByRole("button", { name: "Send participant referral" }).click();
  await expect(page).toHaveURL(/support-coordinators$/);
  await expect(page.locator('input[name="participant_consent"]:invalid')).toHaveCount(1);
  await page.getByLabel("I have consent from the participant").check();
  await page.getByRole("button", { name: "Send participant referral" }).click();
  await expect(page).toHaveURL(/thank-you$/);
});

test("referral preserves details and displays an error when provider rejects", async ({ page }) => {
  await openReferral(page, false);
  await page.getByLabel("I have consent from the participant").check();
  await page.getByRole("button", { name: "Send participant referral" }).click();
  await expect(page.getByRole("status")).toContainText("could not send");
  await expect(page).toHaveURL(/support-coordinators$/);
  await expect(page.getByLabel("Participant first name or initials *")).toHaveValue("TEST ONLY");
  await expect(page.getByRole("button", { name: "Send participant referral" })).toBeEnabled();
});

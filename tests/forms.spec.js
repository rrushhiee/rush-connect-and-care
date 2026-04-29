import { test, expect } from "@playwright/test";

test("enquiry form submits successfully", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173/enquire.html");

  await page.route("https://api.web3forms.com/submit", async (route) => {
    await route.fulfill({
      status: 303,
      headers: {
        location: "http://127.0.0.1:4173/thank-you.html"
      }
    });
  });

  await page.getByLabel("Name").fill("Rupert Test");
  await page.getByLabel("Email address").fill("rupert@example.com");
  await page.getByLabel("Phone number optional").fill("0423 815 267");
  await page.getByLabel("What are you enquiring about?").selectOption("Online youth mentoring");
  await page.getByLabel("Short message").fill("I am checking the enquiry form flow.");
  await page.getByRole("button", { name: "Send enquiry" }).click();

  await page.waitForURL("**/thank-you.html");
  await expect(page.getByRole("heading", { name: "Thank you" })).toBeVisible();
});

test("enquiry form is wired to Web3Forms", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173/enquire.html");

  const form = page.locator("form.enquiry-form");

  await expect(form).toHaveAttribute("action", "https://api.web3forms.com/submit");
  await expect(form).toHaveAttribute("method", "POST");
  await expect(form.locator('input[name="access_key"]')).toHaveValue("c37e1152-91cb-4e6c-8452-8eebfaa3fdb8");
  await expect(form.locator('input[name="redirect"]')).toHaveValue("https://rushconnectandcare.com.au/thank-you.html");
});

test("newsletter form submits through Web3Forms", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173/");

  await page.route("https://api.web3forms.com/submit", async (route) => {
    await route.fulfill({
      status: 303,
      headers: {
        location: "http://127.0.0.1:4173/thank-you.html"
      }
    });
  });

  const form = page.locator("form.newsletter-form");

  await expect(form).toHaveAttribute("action", "https://api.web3forms.com/submit");
  await expect(form).toHaveAttribute("method", "POST");
  await expect(form.locator('input[name="access_key"]')).toHaveValue("c37e1152-91cb-4e6c-8452-8eebfaa3fdb8");
  await expect(form.locator('input[name="subject"]')).toHaveValue("New Rush Connect & Care newsletter sign-up");
  await expect(form.locator('input[name="redirect"]')).toHaveValue("https://rushconnectandcare.com.au/thank-you.html");

  await form.getByLabel("Name").fill("Newsletter Test");
  await form.getByLabel("Email").fill("newsletter@example.com");
  await form.getByRole("button", { name: "Join the newsletter" }).click();

  await page.waitForURL("**/thank-you.html");
  await expect(page.getByRole("heading", { name: "Thank you" })).toBeVisible();
});

test("booking form submits successfully", async ({ page }) => {
  await page.goto("http://127.0.0.1:4173/book-appointment.html");

  await page.getByLabel("Name").fill("Rupert Test");
  await page.getByLabel("Best contact detail").fill("0423 815 267");
  await page.getByLabel("Session option").selectOption("60 minute session");
  await page.getByLabel("Preferred day or time").fill("Tuesday after school");
  await page.getByLabel("Payment method").selectOption("Not sure yet");
  await page.getByRole("button", { name: "Request consult or session" }).click();

  await page.waitForURL("**/thank-you.html");
  await expect(page.getByRole("heading", { name: "Thank you" })).toBeVisible();
});

import { test, expect } from "@playwright/test";

test("enquiry form submits successfully", async ({ page }) => {
  await page.route("https://formsubmit.co/hello@rushconnectandcare.com.au", async (route) => {
    const request = route.request();
    expect(request.method()).toBe("POST");
    expect(request.postData()).toContain("email=rupert%40example.com");

    await route.fulfill({
      status: 303,
      headers: {
        Location: "http://127.0.0.1:4173/thank-you.html"
      }
    });
  });

  await page.goto("http://127.0.0.1:4173/enquire.html");

  await page.getByLabel("Name").fill("Rupert Test");
  await page.getByLabel("Email address").fill("rupert@example.com");
  await page.getByLabel("Phone number optional").fill("0423 815 267");
  await page.getByLabel("What are you enquiring about?").selectOption("Online youth mentoring");
  await page.getByLabel("Short message").fill("I am checking the enquiry form flow.");
  await page.getByRole("button", { name: "Send enquiry" }).click();

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

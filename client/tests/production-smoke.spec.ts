import { expect, test } from "@playwright/test";

test("production home page remains mounted and survives reload", async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    failedRequests.push(`${request.url()} - ${request.failure()?.errorText ?? "unknown error"}`);
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("#root")).not.toBeEmpty();
  await expect(page).toHaveTitle(/Bounding Curve/);

  await page.waitForTimeout(12_000);
  await expect(page.locator("#root")).not.toBeEmpty();

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("#root")).not.toBeEmpty();
  await expect(page).toHaveTitle(/Bounding Curve/);

  expect(pageErrors, `page errors: ${pageErrors.join("\n")}`).toEqual([]);
  expect(
    consoleErrors,
    `console errors: ${consoleErrors.join("\n")}`,
  ).toEqual([]);
  expect(failedRequests, `failed requests: ${failedRequests.join("\n")}`).toEqual([]);
});

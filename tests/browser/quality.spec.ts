import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  for (const width of [375, 1280]) {
    test(`homepage and Table at ${width}px in ${theme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      for (const url of ["/", "/docs/components/table"]) {
        await page.goto(url, { waitUntil: "networkidle" });
        await expect(page.locator("html")).toHaveClass(new RegExp(theme));
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect
          .poll(() =>
            page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth
            )
          )
          .toBe(true);
        await page.evaluate(async () => {
          await Promise.all(
            document
              .getAnimations()
              .filter(
                (animation) =>
                  animation.effect?.getTiming().iterations !==
                  Number.POSITIVE_INFINITY
              )
              .map((animation) => animation.finished.catch(() => undefined))
          );
        });
        const audit = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa"])
          .analyze();
        expect(audit.violations).toEqual([]);
      }
      const table = page.getByRole("table", {
        name: "Team members",
        exact: true,
      });
      const filter = table.getByRole("button", { name: "Filter Role" });
      await filter.focus();
      await page.keyboard.press("Enter");
      const dialog = page.getByRole("dialog", { name: "Filter Role" });
      await dialog
        .getByRole("checkbox", { name: "Admin", exact: true })
        .check();
      await dialog.getByRole("button", { name: "Apply", exact: true }).click();
      await expect(
        table.getByRole("cell", { name: "Ada", exact: true })
      ).toBeVisible();
      await expect(
        table.getByRole("cell", { name: "Cat", exact: true })
      ).toBeVisible();
      await expect(
        table.getByRole("cell", { name: "Ben", exact: true })
      ).toHaveCount(0);
      await expect(filter).toBeFocused();
      expect(errors).toEqual([]);
    });
  }
}

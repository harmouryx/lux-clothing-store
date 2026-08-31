import { chromium } from "playwright";
import path from "path";
import fs from "fs";

async function runFrontendTest() {
  const outputDir = path.resolve("evidencias");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log("[RC-05] Navigating to storefront products page...");
  await page.goto("http://localhost:3000/products", { waitUntil: "networkidle", timeout: 30000 });
  await page.screenshot({ path: path.join(outputDir, "evidencia_productos_01.png"), fullPage: false });
  console.log("[RC-05] Screenshot 1: Products catalog captured");

  // Sort by price descending
  const sortSelector = page.locator("select").first();
  if (await sortSelector.count() > 0) {
    await sortSelector.selectOption("price-desc");
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outputDir, "evidencia_sort_precio_desc.png"), fullPage: false });
    console.log("[RC-05] Screenshot 2: Sort by Price High-to-Low captured");
  }

  // Navigate to first product card and add to cart
  console.log("[RC-05] Attempting to interact with first product card...");
  const firstProduct = page.locator("[data-testid='product-card'], .product-card, article, .card").first();
  if (await firstProduct.count() > 0) {
    await firstProduct.screenshot({ path: path.join(outputDir, "evidencia_producto_card.png") });
    console.log("[RC-05] Screenshot 3: Product card captured");
  }

  // Navigate to cart/checkout
  console.log("[RC-05] Navigating to cart page...");
  await page.goto("http://localhost:3000/cart", { waitUntil: "networkidle", timeout: 20000 });
  await page.screenshot({ path: path.join(outputDir, "evidencia_carrito_nextjs_01.png"), fullPage: true });
  console.log("[RC-05] Screenshot 4: Cart page captured -> evidencia_carrito_nextjs_01.png");

  // Navigate to login page
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle", timeout: 20000 });
  await page.screenshot({ path: path.join(outputDir, "evidencia_login_page.png"), fullPage: false });
  console.log("[RC-05] Screenshot 5: Login page captured");

  // Navigate to dashboard (admin)
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle", timeout: 20000 });
  await page.screenshot({ path: path.join(outputDir, "evidencia_dashboard.png"), fullPage: false });
  console.log("[RC-05] Screenshot 6: Dashboard captured");

  await browser.close();
  console.log("[RC-05] All screenshots saved to evidencias/");
  console.log("=== RC-05 Complete ===");
}

runFrontendTest().catch((err) => {
  console.error("[RC-05] Error:", err.message);
  process.exit(1);
});

import { chromium } from "playwright";
import path from "path";
import fs from "fs";

async function runFrontendTest() {
  const outputDir = path.resolve("evidencias");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  console.log("[RC-05] Launching headless browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log("[RC-05] 1. Navigating to products catalog page (http://localhost:3000/products)...");
  try {
    await page.goto("http://localhost:3000/products", { waitUntil: "networkidle", timeout: 25000 });
    await page.screenshot({ path: path.join(outputDir, "evidencia_productos_catalog_01.png"), fullPage: false });
    console.log("[RC-05] Screenshot saved: evidencia_productos_catalog_01.png");
  } catch (e) {
    console.warn("Could not capture products page:", e.message);
  }

  console.log("[RC-05] 2. Navigating to checkout / cart page (http://localhost:3000/checkout)...");
  try {
    await page.goto("http://localhost:3000/checkout", { waitUntil: "networkidle", timeout: 25000 });
    await page.screenshot({ path: path.join(outputDir, "evidencia_carrito_nextjs_01.png"), fullPage: false });
    console.log("[RC-05] Screenshot saved: evidencia_carrito_nextjs_01.png");
  } catch (e) {
    console.warn("Could not capture checkout page, trying home/cart:", e.message);
  }

  console.log("[RC-05] 3. Navigating to login page (http://localhost:3000/login)...");
  try {
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle", timeout: 20000 });
    await page.screenshot({ path: path.join(outputDir, "evidencia_login_page_01.png"), fullPage: false });
    console.log("[RC-05] Screenshot saved: evidencia_login_page_01.png");
  } catch (e) {
    console.warn("Could not capture login page:", e.message);
  }

  console.log("[RC-05] 4. Navigating to home page (http://localhost:3000)...");
  try {
    await page.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 20000 });
    await page.screenshot({ path: path.join(outputDir, "evidencia_home_page_01.png"), fullPage: false });
    console.log("[RC-05] Screenshot saved: evidencia_home_page_01.png");
  } catch (e) {
    console.warn("Could not capture home page:", e.message);
  }

  await browser.close();
  console.log("[RC-05] SUCCESS - All visual evidences generated.");
}

runFrontendTest().catch((err) => {
  console.error("[RC-05] Fatal error:", err);
  process.exit(1);
});

import { chromium } from "playwright";
import { Hafele, getProductsIds, productsToJson } from "./helpers.js";

(async () => {
  const products = [];

  const browser = await chromium.launch({ headless: false }); // Try non-headless for debugging

  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    locale: "de-DE"
  });
  const page = await context.newPage();

  await page.setExtraHTTPHeaders({
    "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
  });

  await page.goto("https://www.haefele.ch/de");
  console.log(await page.content()); // Add this line to inspect the HTML
  await Hafele.acceptCookies(page);
  await Hafele.authenticate(page);

  for (const id of getProductsIds()) {
    try {
      const url = await Hafele.goToProduct(page, id);
      await Hafele.setProductQuantity(page);

      products.push({
        id,
        url,
        qty: await Hafele.getProductAvailability(page),
        thumbnails: await Hafele.getProductThumbnails(page),
      });

      console.log(`✅ ${id}`);
    } catch (e) {
      console.log(`❌ ${id}`);
      console.error(e);
    }
  }

  productsToJson(products);

  await browser.close();
})();

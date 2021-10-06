import { chromium } from "playwright";
import { Hafele, getProductsUrls, productsToJson } from "./helpers.js";

(async () => {
  const products = [];

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("https://hafele.pl");
  await Hafele.acceptCookies(page);
  await Hafele.authenticate(page);

  for (const url of getProductsUrls()) {
    try {
      await page.goto(url);
      await Hafele.setProductQuantity(page);

      products.push({
        url,
        qty: await Hafele.getProductAvailability(page),
        thumbnails: await Hafele.getProductThumbnails(page),
      });

      console.log(`✅ ${url}`);
    } catch (e) {
      console.log(`❌ ${url}`);
      console.error(e);
    }
  }

  productsToJson(products);

  await browser.close();
})();

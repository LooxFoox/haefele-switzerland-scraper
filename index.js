import { chromium } from "playwright";
import { Hafele, getProductsIds, productsToJson } from "./helpers.js";

(async () => {
  const products = [];

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("https://hafele.pl");
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

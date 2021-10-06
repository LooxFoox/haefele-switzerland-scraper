import { chromium } from "playwright";
import { Hafele, readProducts, productsToJson } from "./helpers.js";

(async () => {
  const products = [];

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("https://hafele.pl");
  await Hafele.acceptCookies(page);
  await Hafele.authenticate(page);

  for (const url of readProducts()) {
    await page.goto(url);
    await Hafele.setProductQuantity(page);

    products.push({
      url,
      qty: await Hafele.getProductAvailability(page),
      thumbnails: await Hafele.getProductThumbnails(page),
    });
  }

  productsToJson(products);

  await browser.close();
})();

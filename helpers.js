import * as fs from "fs";

export const getProductsUrls = () => {
  try {
    return JSON.parse(fs.readFileSync("products.json", "utf-8"));
  } catch (err) {
    console.error(err);
  }
};

export const productsToJson = (products) => {
  try {
    fs.writeFileSync("out.json", JSON.stringify(products));
  } catch (err) {
    console.error(err);
  }
};

export class Hafele {
  static async acceptCookies(page) {
    await page.click("text=Akceptuj wszystkie pliki cookie");
  }

  static async authenticate(page) {
    await page.click("#headerLoginLinkAction");
    await page.fill(
      'input[name="ShopLoginForm_Login_headerItemLogin"]',
      process.env.HAFELE_USER
    );
    await page.fill(
      'input[name="ShopLoginForm_Password_headerItemLogin"]',
      process.env.HAFELE_PASS
    );
    await page.click('button[type="submit"]');
    await page.waitForSelector("#header-loggedin-link");
    console.log(`Authenticated as user: ${process.env.HAFELE_USER}`);
  }

  static async setProductQuantity(page, qty = "99999") {
    await page.fill("#ConditionConfiguration_pds_quantity_1", qty);
    await page.waitForTimeout(1_000);
    await page.waitForSelector(".RequestedPackageTable");
  }

  static async getProductAvailability(page) {
    const rows = await page.$$eval(
      ".RequestedPackageTable .values-tr",
      (nodes) =>
        nodes
          .filter((n) => n.textContent.includes("NA MAGAZYNIE"))
          .map((n) => Number(n.textContent.trim().split("\n")[0]))
    );

    return rows.reduce((a, b) => a + b, 0);
  }

  static async getProductThumbnails(page) {
    return await page.$$eval(".thumbsList img", (nodes) =>
      nodes.map((n) => n.src)
    );
  }
}

import fs from "fs";

/**
 * Read product ids from products.json
 * Returns array or empty array on error
 */
export const getProductsIds = () => {
  try {
    const raw = fs.readFileSync("products.json", "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("getProductsIds error:", err);
    return [];
  }
};

export const productsToJson = (products) => {
  try {
    fs.writeFileSync("out.json", JSON.stringify(products, null, 2), "utf-8");
  } catch (err) {
    console.error("productsToJson error:", err);
  }
};

export class Hafele {
  /**
   * Try a set of common cookie-accept selectors and log buttons for debugging.
   */
  static async acceptCookies(page) {
    try {
      // Log all buttons (id + text) to help diagnosing selector issues
      const buttons = await page.$$eval("button", nodes =>
        nodes.map(n => ({ id: n.id || null, text: n.textContent.trim() }))
      );
      console.log("Buttons found on page:", buttons);

      const selectors = [
        "#onetrust-accept-btn-handler",
        'button:has-text("Alle Cookies")',
        'button:has-text("Akzeptieren")',
        'button[title*="Accept"]',
        ".ot-sdk-row .ot-btn--primary",
      ];

      for (const sel of selectors) {
        try {
          await page.click(sel, { timeout: 1500 });
          console.log(`Clicked cookie button using selector: ${sel}`);
          return;
        } catch (e) {
          // ignore and try next
        }
      }

      console.warn("No cookie accept button clicked — none of the selectors matched.");
    } catch (err) {
      console.error("acceptCookies error:", err);
    }
  }

  /**
   * Authenticate using provided env vars. Safe guards and timeouts added.
   */
  static async authenticate(page) {
    try {
      await page.click("#headerLoginLinkAction", { timeout: 3000 });
      await page.fill('input[name="ShopLoginForm_Login_headerItemLogin"]', process.env.HAFELE_USER || "");
      await page.fill('input[name="ShopLoginForm_Password_headerItemLogin"]', process.env.HAFELE_PASS || "");
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle", timeout: 10000 }).catch(()=>{}),
        page.click('button[type="submit"]'),
      ]);
      await page.waitForSelector("#header-loggedin-link", { timeout: 8000 }).catch(()=>{});
      console.log(`Authenticated (attempted) as user: ${process.env.HAFELE_USER}`);
    } catch (err) {
      console.error("authenticate error:", err);
    }
  }

  /**
   * Navigate to the product page by searching the id.
   * Returns resulting URL string.
   */
  static async goToProduct(page, id) {
    try {
      const search = await page.$("#inputSearchTerm");
      if (!search) {
        throw new Error("Search input #inputSearchTerm not found");
      }
      await search.fill(""); // clear
      await search.type(id, { delay: 50 });
      await Promise.all([
        page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 8000 }).catch(()=>{}),
        search.press("Enter"),
      ]);
      // allow page to settle a bit
      await page.waitForTimeout(300);
      return page.url();
    } catch (err) {
      console.error("goToProduct error:", err);
      return page.url();
    }
  }

  static async setProductQuantity(page, qty = "99999") {
    const inputSelector = "#ConditionConfiguration_pds_quantity_1";
    const tableSelector = ".RequestedPackageTable";
    const maxWait = 5000;

    try {
      const input = await page.$(inputSelector);
      if (!input) {
        console.warn("Quantity input not found:", inputSelector);
        return false;
      }

      // enter qty and trigger blur
      await page.fill(inputSelector, String(qty));
      await page.keyboard.press("Tab");
      await page.waitForTimeout(100);
      try { await page.click("body", { timeout: 500 }); } catch {}

      // wait for table to appear (abort after maxWait)
      try {
        await page.waitForSelector(tableSelector, { timeout: maxWait });
      } catch (err) {
        console.warn("RequestedPackageTable did not appear within", maxWait, "ms");
        return false;
      }

      // snapshot before update (for debugging)
      const beforeHtml = await page.$eval(tableSelector, el => el.innerHTML);
      console.log("RequestedPackageTable (before):\n", beforeHtml);

      // Wait until the table contains at least one row that is NOT "sofort verfügbar"
      // (or has the orange color #FFA50A). This checks every DOM mutation up to maxWait.
      try {
        await page.waitForFunction(
          (data) => {
            const sel = data.table;
            const rows = Array.from(document.querySelectorAll(sel + " .values-tr"));
            return rows.some(row => {
              const statusEl = row.querySelector(".availability-flag");
              const text = statusEl?.textContent?.trim().toLowerCase() || "";
              const style = (statusEl?.getAttribute("style") || "").replace(/\s/g, "").toUpperCase();
              const isImmediate = text.includes("sofort verfügbar") && !style.includes("#FFA50A");
              // return true if this row is NOT immediate (i.e. changed to non-immediate / orange)
              return !isImmediate;
            });
          },
          { table: tableSelector },
          { timeout: maxWait }
        );
      } catch (err) {
        // timed out waiting for a non-immediate row — still proceed but log
        console.warn("Timed out waiting for a non-immediate availability row (maxWait).");
      }

      // snapshot after update (for debugging)
      const afterHtml = await page.$eval(tableSelector, el => el.outerHTML);
      console.log("RequestedPackageTable (after):\n", afterHtml);

      return true;
    } catch (err) {
      console.error("setProductQuantity error:", err);
      return false;
    }
  }

  static async getProductAvailability(page) {
    try {
      const rows = await page.$$eval(".RequestedPackageTable .values-tr", rows =>
        rows.map(row => {
          const qtyText = row.querySelector(".qty-available")?.textContent?.trim() || "0";
          const packaging = row.querySelector(".packaging-available")?.textContent?.trim() || "";
          const statusText = row.querySelector(".availability-flag")?.textContent?.trim() || "";
          const styleAttr = row.querySelector(".availability-flag")?.getAttribute("style") || "";
          // parse integer (remove non-digits to be safe)
          const qty = Number(qtyText.replace(/[^\d]/g, "")) || 0;
          // determine immediacy: consider orange (#FFA50A) as NOT immediate
          const isOrange = styleAttr.replace(/\s/g, "").toUpperCase().includes("#FFA50A");
          const isImmediate = !isOrange && statusText.toLowerCase().includes("sofort verfügbar");
          return { qty, packaging, status: statusText, style: styleAttr, isImmediate };
        })
      );

      // debug output
      console.log("Parsed availability rows:", rows);

      // Sum only rows that are immediate
      const totalImmediate = rows.reduce((sum, r) => sum + (r.isImmediate ? r.qty : 0), 0);
      return totalImmediate;
    } catch (err) {
      console.error("getProductAvailability error:", err);
      return 0;
    }
  }

  /**
   * Collect thumbnail URLs.
   */
  static async getProductThumbnails(page) {
    try {
      const thumbs = await page.$$eval(".thumbsList img", (nodes) => nodes.map(n => n.src).filter(Boolean));
      return thumbs;
    } catch (err) {
      console.error("getProductThumbnails error:", err);
      return [];
    }
  }
}

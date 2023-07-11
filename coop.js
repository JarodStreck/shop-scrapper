import puppeteer from 'puppeteer';
import fs from "fs";


(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
    headless: false
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1860, height: 1400 });

  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4427.0 Safari/537.36');


  let base_url = "https://www.coop.ch/fr/nourriture/"
  let categories = [
    "fruits-legumes/c/m_0001",
    "produits-laitiers-oeufs/c/m_0055",
    "viandes-poissons/c/m_0087",
    "pains-viennoiseries/c/m_0115",
    "boissons/c/m_2242",
    "garde-manger/c/m_0140",
    "friandises-snacks/c/m_2506",
    "produits-surgeles/c/m_0202",
    "plats-cuisines/c/m_9744",
    "regimes-specifiques/c/Specific_Diets"]
  let total_product = [];
  for (let c = 0; c < categories.length; c++) {
    let has_next_page = true;
    let products = [];

    await page.goto(base_url + categories[c])

    do {

      await page.waitForSelector('.productTile-details');
      const current_products = await page.evaluate(async () => {
        let names = document.getElementsByClassName("productTile-details__name-value");
        let prices = document.getElementsByClassName("productTile__price-value-lead-price");;
        let products = []
        console.log(names);
        console.log(prices);
        for (let i = 0; i < names.length; i++) {
          products.push(
            {
              name: names[i] != null ? names[i].innerText : "Placeholder",
              price: prices[i] != null ? prices[i].innerText : 0
            }
          );
        }
        return products
      })
      products = products.concat(current_products);
      const elem = await page.waitForSelector(".pagination__next", { timeout: 8000 }).then(async () => {
        await page.click('.pagination__next');
      }).catch(() => {
        has_next_page = false;
      });

      console.log("Fetched : " + current_products.length + " products");
    } while (has_next_page);
    total_product = total_product.concat(products);
    console.log("Finished categorie : " + categories[c] + " " + products.length)
  }
  fs.writeFile("coop.json", JSON.stringify(total_product), () => {
    console.log(total_product.length +  " products added to file");
  })


  await browser.close();
})();


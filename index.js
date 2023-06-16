import puppeteer from 'puppeteer';
import fs from "fs";
let products = [];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: false
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1860, height: 1400 });

  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4427.0 Safari/537.36');


  await page.goto("https://www.coop.ch/fr/nourriture/fruits-legumes/c/m_0001");
  let has_next_page = true;
  do {

    let names = await page.evaluateHandle(async () => {
      let names = []
      let elems = document.getElementsByClassName("productTile-details__name-value");
      for await (let elem of elems) {
        names.push(elem.innerText)
      }
      return names
    })

    let prices = await page.evaluate(async () => {
      let prices = []
      let elems = document.getElementsByClassName("productTile__price-value-lead-price");;

      for await (let elem of elems) {
        prices.push(elem.innerText)
      }

      return prices
    })

    for (let i = 0; i < prices.length; i++) {
      products.push(
        {
          name: names[i],
          price: prices[i]
        }
      );
    }

    let elem = await page.evaluateHandle(() => {
      return document.querySelector('.pagination__next');
    })
    has_next_page = elem.asElement != null

    await elem.click().catch((error) => console.log(error));

    console.log("in while");
  } while (has_next_page);



  console.log("after while");
  fs.writeFile("product.json", JSON.stringify(products), () => {
    console.log(products.length + " products added to file");
  })

  //await browser.close();
})();


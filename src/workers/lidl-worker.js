import puppeteer from 'puppeteer';
import { workerData, parentPort } from 'worker_threads';

let products = []
console.log("URL : " + workerData.base_url);
console.log("CAT : " + workerData.categories);

const run = async (cat) => {
    let cat_products = [];
    let has_next_page = true;
    let no_page = 1;
    const browser = await puppeteer.launch({
        executablePath: "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
        headless: false
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1000, height: 750 });

    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4427.0 Safari/537.36');

    await page.goto(workerData.base_url + "/" + cat,{waitUntil: "networkidle0"});
    //document.getElementsByClassName("product-item-link")[document.getElementsByClassName("product-item-link").length - 1].scrollIntoView()
    await page.click(".cookie-alert-extended-button");
    console.log(page.url());
    await page.evaluate(() => new Promise((resolve) => {
        var scrollTop = -1;
        const interval = setInterval(() => {
          window.scrollBy(0, 100);
          if(document.documentElement.scrollTop !== scrollTop) {
            scrollTop = document.documentElement.scrollTop;
            return;
          }
          clearInterval(interval);
          resolve();
        }, 10);
      }));

    //browser.close();
    return cat_products;
}

for (let i = 0; i < workerData.categories.length; i++) {
    let prods = await run(workerData.categories[i]).catch(err => {
        console.log(err);
    });
    console.log("Finished fetching  " + prods.length + " product(s) in " + workerData.categories[i] + " category");
    products = products.concat(prods);
}

parentPort.postMessage(products);
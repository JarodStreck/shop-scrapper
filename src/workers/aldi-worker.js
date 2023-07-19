import puppeteer from 'puppeteer';
import { workerData, parentPort } from 'worker_threads';

let products = []
console.log("URL : " + workerData.base_url);
console.log("CAT : " + workerData.categories);

const run = async (cat) => {
    let cat_products = [];
    let has_next_page = true;
    const browser = await puppeteer.launch({
        executablePath: "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
        headless: "new"
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1000, height: 750 });

    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4427.0 Safari/537.36');

    await page.goto(workerData.base_url + "/" + cat + "?ipp=72");

    //product-item__name
    do {
        await page.waitForSelector('.product-list');
        const current_products = await page.evaluate(async () => {
            let names = document.getElementsByClassName("product-item__name");
            let prices = document.getElementsByClassName("money-price");
            let products = []

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
        cat_products = cat_products.concat(current_products);

        await page.waitForSelector("a.pagination__step--next", { timeout: 8000 }).then(async () => {
            await Promise.all([
                page.click('a.pagination__step--next'),
                page.waitForNavigation()
            ]);
        }).catch(() => {
            has_next_page = false;
        });

    } while (has_next_page);

    await browser.close();
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
import {workerData,parentPort} from 'worker_threads';
import puppeteer from 'puppeteer';
import fs from "fs";
let products = []
console.log("URL : "+workerData.base_url);
console.log("CAT : " +workerData.category);


const run = async () =>{
    let has_more_product = true;
    const browser = await puppeteer.launch({
        executablePath: "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
        headless: "new"
    });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1500, height: 1000 });

    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4427.0 Safari/537.36');
    await page.goto(workerData.base_url + "/" + workerData.category)
    page.waitForNavigation();
    while(has_more_product){
        await page.waitForSelector(".mui-button-leshop:not([disabled])",{timeout:10000}).then(async (el)=>{
            has_more_product = true;
            await el.click(".mui-button-leshop");
            
        }).catch((error)=>{
            has_more_product = false;
        });
        
        // await page.waitForSelector(".mui-button-leshop").then(async (el)=>{
        //     console.log(el);
        //     await el.click();
        //     has_more_product = true;
        // }).catch((error)=>{
        //     console.error(error);
        //     has_more_product = false;
        // })
        
        // const elem = await page.waitForSelector(".btn-view-more-products", { timeout: 8000 }).then(async () => {
        //     await page.click('.at-focus-indicator.migros-ui-btn.spinner.mui-button.mui-button-leshop.mat-button.mat-button-base');
        //   }).catch(() => {
        //     console.log("caught");
        //     has_more_product = false;
        //   });
    }
    let actual_products = await page.evaluate(()=>{
        const items = document.getElementsByClassName("product-show-details");
        let actual_products = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const actual_price = item.getElementsByClassName("actual").length ? item.getElementsByClassName("actual")[0].innerHTML : 0
            const regular_price = item.getElementsByClassName("regular-price").length ? item.getElementsByClassName("regular-price")[0].children[2].innerHTML : 0
            const brand = item.getElementsByClassName("name").length ? item.getElementsByClassName("name")[0].innerHTML : "unknown"
            actual_products.push(
                {
                    actual_price,
                    regular_price,
                    brand,
                    desc: item.getElementsByClassName("desc")[0].children[0].innerHTML
                }
            )
        }
        return actual_products;
    })
    browser.close();
    products = products.concat(actual_products);
   
    return products;
}

run().then((res)=>{
    console.log("Finished fetching  " + res.length + " product(s) in " + workerData.category + " category");
    parentPort.postMessage(res);
}).catch((error)=>{
    console.error(error);
})
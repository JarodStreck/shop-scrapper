import puppeteer from 'puppeteer';
import fs from "fs";
let products = [];

(async () => {
    const browser = await puppeteer.launch({
      executablePath:"/usr/bin/google-chrome",
      headless:"new"
    });
    const page = await browser.newPage();
  
    await page.goto("https://www.coop.ch/fr/nourriture/fruits-legumes/c/m_0001");
    
    //product.name = await page.waitForSelector(".productTile-details__name-value");  
    //product.price = await page.waitForSelector("productTile__price-value-lead-price")
    let name_elem;
   
    let names = await page.evaluate(async () => {
        let names = []
        let elems =  document.getElementsByClassName("productTile-details__name-value");
        for await(let elem of elems){
          names.push(elem.innerText)
        }
        return names
    })
    let prices = await page.evaluate(async () => {
      let prices = []
      let elems = document.getElementsByClassName("productTile__price-value-lead-price");;
      
      for await(let elem of elems){
        prices.push(elem.innerText)
      }
        
      return prices
  })

    for(let i = 0 ; i < prices.length; i++){
      products.push(
        {
          name:names[i],
          price:prices[i]
        }
      );
    }

    fs.writeFile("product.json",JSON.stringify(products), ()=>{
      console.log( products.length + " products added to file");
    })

    await browser.close();
  })();


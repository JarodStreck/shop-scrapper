import puppeteer from 'puppeteer';
const USER_DATA_DIR_WSL = 'C:/Users/Eyrag/AppData/Local/BraveSoftware/Brave-Browser/User Data';

(async () => {
    const browser = await puppeteer.launch({
      executablePath:"/usr/bin/google-chrome",
      headless:false
    });
    const page = await browser.newPage();
    await page.goto("https://www.coop.ch/fr/nourriture/c/supermarket");
    await page.screenshot({ path: "example.png" });
  
    await browser.close();
  })();
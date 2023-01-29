/* 
 * 2023 © MaoHuPi
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const fsp = fs.promises;
const basic = require('./script/basic.js');
const site = require('./script/site.js');
const settings = require('./script/settings.js');
settings.debugMode = true;

let accounts = {};
(async () => {
    if(basic.fileExists(settings.accountsDataPath)){
        let accountsString = await fsp.readFile(settings.accountsDataPath);
        accounts = JSON.parse(accountsString);
    }
})();

(async () => {
    const browser = await puppeteer.launch(settings.debugMode ? {headless: false} : {});
    // await site.instagram(browser, accounts.instagram, ['notification', 'message']);
    // await site.gamer(browser, accounts.gamer, ['dailyCheck']);
    await site.bing(browser, accounts.bing, ['dailyTask', 'dailySearch']);
    if(!settings.debugMode){
        await browser.close();
    }
})();
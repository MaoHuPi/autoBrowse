/* 
 * 2023 © MaoHuPi
 */

const fs = require('fs');

exports.sleep = function sleep(sec) {
    return new Promise(resolve => setTimeout(resolve, sec*1e3));
}
exports.type = async function type(page, selector, value){
    await page.waitForSelector(selector);
    await page.type(selector, value);
}
exports.click = async function click(page, selector) {
    let element = await page.waitForSelector(selector);
    await element.click();
    // await page.click(selector);
}
exports.clickSubmit = async function clickSubmit(page, selector){
    let nav = page.waitForNavigation();
    await exports.click(page, selector);
    await nav;
}
exports.innerText = async function innerText(page, selector) {
    await page.waitForSelector(selector);
    return await page.evaluate(() => {
        const element = document.querySelector(selector);
        return element ? element.innerText : undefined;
    });
}
exports.injectFunc = async function injectFunc(page, func) {
    return await page.evaluate(func);
}
exports.fileExists = function fileExists(path) {
    let flag = undefined;
    try{
        fs.accessSync(path, fs.constants.F_OK);
        flag = true;
    }
    catch(e){
        flag = false;
    }
    return(flag);
}
exports.runCommands = async function runCommands(commendData, commends){
    commends = commends.map(c => c.toLowerCase());
    for(let key in commendData){
        if(commends.indexOf(key.toLowerCase()) > -1){
            await commendData[key]();
        }
    }
}
exports.deepCopy = function deepCopy(o){
    return(JSON.parse(JSON.stringify(o)));
}
exports.identifyFilter = function identifyFilter(notifications, oldNotifications){
    let oldIdentifys = oldNotifications.map(o => o.identify);
    notifications = notifications.filter(o => !(oldIdentifys.indexOf(o.identify) > -1));
    return(notifications);
}
exports.before = async function before(page){
    await page.evaluateOnNewDocument(() => {
        // Object.defineProperty(navigator, 'webdriver', {
        //     get: () => undefined,
        // });
        const newProto = navigator.__proto__;
        delete newProto.webdriver;
        navigator.__proto__ = newProto;
        window.navigator.chrome = {
            runtime: {}
        };
    });
}
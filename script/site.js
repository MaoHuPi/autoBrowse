/* 
 * 2023 © MaoHuPi
 */

const fs = require('fs');
const fsp = fs.promises;
const md5 = require('md5');
const basic = require('./basic.js');
const settings = require('./settings.js');

exports.instagram = async function instagram(browser, account, commands){
    if(account == undefined){
        console.log('account.instagram not found!');
        return;
    }
    let page = await browser.newPage();
    await page.setViewport({width: 1080, height: 720});
    const instagramPath = settings.dataPath + 'instagram/';
    const instagramUrl = 'https://www.instagram.com/';
    async function login(){
        await page.goto(instagramUrl);
        await basic.clickSubmit(page, '#loginForm > div > div:nth-child(5) > button');
        await basic.type(page, 'input[name="email"]', account['account']);
        await basic.type(page, 'input[name="pass"]', account['password']);
        await basic.clickSubmit(page, 'button[type="submit"]:not([disabled])');
        await basic.sleep(1);
    }
    async function getNotifications(){
        await basic.sleep(1);
        let page = await browser.newPage();
        await page.goto(instagramUrl + 'notifications/');
        try{
            await page.waitForSelector('[data-pressable-container="true"]', {timeout: 2e3});
        }
        catch(e){
            await page.reload({waitUntil: ['domcontentloaded']});
            await page.waitForSelector('[data-pressable-container="true"]');
        }
        let notifications = await basic.injectFunc(page, () => {
            function lastOf(arr){return(arr[arr.length-1]);}
            let data = [...document.querySelectorAll('[data-pressable-container="true"]')]
                .map(r => ({
                    content: r.innerText, 
                    link: lastOf(r.querySelectorAll('a[href]')).href, 
                    image: lastOf(r.querySelectorAll('img[src]')).src
                }));
            data.forEach(o => {o.identify = o.content.replaceAll(' ', '').replaceAll(/[0-9]+(秒|分鐘|小時|天|週|年)/g, '');});
            return(data);
        });
        let timestemp = new Date().getTime();
        notifications.forEach(o => {
            o.site = 'instagram';
            o.type = 'notification';
            o.time = timestemp;
            o.identify = md5(`${o.identify}${o.link}`);
        });
        page.close();
        return(notifications);
    }
    async function processNotification(){
        let notifications = await getNotifications();
        const notificationPath = instagramPath + 'notifications.json';
        let oldNotifications = [];
        if(basic.fileExists(notificationPath)){
            let notificationsString = await fsp.readFile(notificationPath);
            oldNotifications = JSON.parse(notificationsString);
        }
        await fsp.writeFile(notificationPath, JSON.stringify(notifications, null, 4));
        notifications = basic.identifyFilter(notifications, oldNotifications);
        
        oldNotifications = [];
        if(basic.fileExists(settings.notificationsDataPath)){
            let notificationsString = await fsp.readFile(settings.notificationsDataPath);
            oldNotifications = JSON.parse(notificationsString);
        }
        oldNotifications.splice(0, 0, ...notifications);
        await fsp.writeFile(settings.notificationsDataPath, JSON.stringify(oldNotifications, null, 4));
    }
    async function getMessage(){
        return(false);
    }
    async function processMessage(){
        let message = await getMessage();
        console.log(message);
    }

    const cookiePath = instagramPath + 'cookies.json';
    // if(basic.fileExists(cookiePath)){
    //     let cookiesString = await fsp.readFile(cookiePath);
    //     let cookies = JSON.parse(cookiesString);
    //     await page.goto(instagramUrl);
    //     await basic.sleep(1);
    //     await page.setCookie(...cookies);
    //     cookies = await page.cookies();
    //     console.log(cookies);
    //     await page.goto(instagramUrl);
    // }
    // else{
        await login();
        let cookies = await page.cookies();
        await fsp.writeFile(cookiePath, JSON.stringify(cookies, null, 4));
    // }
    let commandData = {
        'notification': processNotification, 
        'message': processMessage, 
        'screenShot': () => {page.screenshot({path: instagramPath + 'screenShot.png', overwrite: true});}
    };
    await basic.runCommands(commandData, commands);
    page.close();
}
exports.gamer = async function gamer(browser, account, commands){
    if(account == undefined){
        console.log('account.gamer not found!');
        return;
    }
    let page = await browser.newPage();
    await page.setViewport({width: 1080, height: 720});
    await basic.before(page);
    const gamerPath = settings.dataPath + 'gamer/';
    const gamerUrl = 'https://www.gamer.com.tw/';
    async function login(){
        await page.goto(gamerUrl);
        await basic.clickSubmit(page, '.TOP-my a');
        await basic.type(page, 'input[name="userid"]', account['account']);
        await basic.type(page, 'input[name="password"]', account['password']);
        await basic.clickSubmit(page, '#btn-login');
        await basic.sleep(1);
    }
    async function signin(){
        let page = await browser.newPage();
        await page.goto(gamerUrl);
        await basic.click(page, '#signin-btn');
        await basic.sleep(0.2);
        try{
            await basic.click(page, '.popup-dailybox__btn');
        }catch(e){}
        page.close();
    }
    await login();
    let commandData = {
        'dailyCheck': signin, 
        'screenShot': () => {page.screenshot({path: gamerPath + 'screenShot.png', overwrite: true});}
    };
    await basic.runCommands(commandData, commands);
    page.close();
}
exports.bing = async function bing(browser, account, commands){
    if(account == undefined){
        console.log('account.bing not found!');
        return;
    }
    let page = await browser.newPage();
    await page.setViewport({width: 1080, height: 720});
    await basic.before(page);
    const bingPath = settings.dataPath + 'bing/';
    const bingUrl = 'https://bing.com/';
    async function login(){
        await page.goto(bingUrl);
        await basic.sleep(1);
        await basic.clickSubmit(page, '.id_button:first-of-type');
        await basic.sleep(1);
        await basic.type(page, 'input[name="loginfmt"]', account['account']);
        await basic.clickSubmit(page, '[type="submit"]');
        await basic.sleep(1);
        await basic.type(page, 'input[name="passwd"]', account['password']);
        await basic.clickSubmit(page, '[type="submit"]');
        await basic.sleep(1);
        await basic.clickSubmit(page, ':where(button, [type="button"]):where(#idBtn_Back, #declineButton, [value="否"])');
        await basic.sleep(1);
    }
    async function dailyTask(){
        let page = await browser.newPage();
        await page.setViewport({width: 1080, height: 720});
        await basic.before(page);
        for(let i = 0; i < 10; i++){
            await page.goto(bingUrl);
            await basic.sleep(3);
            await basic.click(page, '.id_button:nth-of-type(2)');
            await basic.sleep(3);
            let frame = await page.waitForSelector('iframe#bepfm');
            frame = await frame.contentFrame();
            let links = [];
            try{
                await frame.waitForSelector('#modern-flyout > div > div > div > div > div > div > div:nth-child(1) > a');
                links = await basic.injectFunc(frame, () => {
                    let links = [...document.querySelectorAll('#modern-flyout > div > div.l_s.l_s_b > div > div > div.i-b > div > div')]
                        .map(e => [e, e?.querySelector('div.point_cont')?.className?.indexOf('complete')])
                        .map(e => {
                            e[1] = typeof(e[1]) == 'number' && e[1] > -1;
                            return(e);
                        })
                        .filter(e => !e[1])
                        .map(e => e[0]?.querySelector('a[href]')?.href);
                    return(links);
                });
            }catch(e){}
            if(links.length < 1){
                break;
            }
            await basic.clickSubmit(frame, '#modern-flyout > div > div > div > div > div > div > div:nth-child(1) > a');
            await basic.sleep(3);
            await page.waitForSelector('#rh_meter');
        }
        // for(let link of links){
        //     await page.goto(link);
        // }
        page.close();
    }
    async function dailySearch(){
        let page = await browser.newPage();
        await page.setViewport({width: 1080, height: 720});
        await basic.before(page);
        for(let i = 0; i < 10; i++){
            await page.goto(bingUrl);
            await basic.sleep(3);
            
            await basic.type(page, '[name="q"]', `number ${i}`);
            await basic.sleep(2);
            // await basic.clickSubmit(page, '[type="submit"][name="search"]');
            await basic.clickSubmit(page, 'label[id="search_icon"]');
            await basic.sleep(3);
        }
        page.close();
    }
    await login();
    let commandData = {
        'dailyTask': dailyTask, 
        'dailySearch': dailySearch, 
        'screenShot': () => {page.screenshot({path: bingPath + 'screenShot.png', overwrite: true});}
    };
    await basic.runCommands(commandData, commands);
    page.close();
}
/* 
 * 2023 © MaoHuPi
 */

const fs = require('fs');
const fsp = fs.promises;
const open = require('open');
const puppeteer = require('puppeteer');
const express = require('express');
const basic = require('./script/basic.js');
const settings = require('./script/settings.js');
const site = require('./script/site.js');

const csrf = '1234567890'
    .split('')
    .sort((a,b)=>Math.random() - 0.5)
    .join('');
returnDataDefault = {
    state: true, 
    data: false
};
let notifications = {};
async function loadNotifications(){
    if(basic.fileExists(settings.notificationsDataPath)){
        let notificationsString = await fsp.readFile(settings.notificationsDataPath);
        notifications = JSON.parse(notificationsString);
    }
}
async function saveNotifications(){
    await fsp.writeFile(settings.notificationsDataPath, JSON.stringify(notifications, null, 4));
}
let accounts = {};
async function loadAccounts(){
    if(basic.fileExists(settings.accountsDataPath)){
        let accountsString = await fsp.readFile(settings.accountsDataPath);
        accounts = JSON.parse(accountsString);
    }
}
async function saveAccounts(){
    await fsp.writeFile(settings.accountsDataPath, JSON.stringify(accounts, null, 4));
}
let timing = {};
async function loadTiming(){
    if(basic.fileExists(settings.timingDataPath)){
        let timingString = await fsp.readFile(settings.timingDataPath);
        timing = JSON.parse(timingString);
    }
}
async function saveTiming(){
    await fsp.writeFile(settings.timingDataPath, JSON.stringify(timing, null, 4));
}

function server(){
    var app = express();
    app.use('/', express.static('public'));
    app.get('/', async function(req, res){
        res.render('index.ejs', {csrf: csrf, page: 'home'});
    });
    app.get('/page/:page', async function(req, res){
        res.render('index.ejs', {csrf: csrf, page: req.params?.page});
    });
    app.post('/notifications/:control/:csrf/', async function(req, res){
        if(!(req.params?.csrf === csrf)){
            res.send('csrf dosn\'t match!');
            return;
        }
        let returnData = basic.deepCopy(returnDataDefault);
        let oldNotifications = basic.deepCopy(notifications);
        if(req.params?.control == 'get'){
            await loadNotifications();
            returnData.data = basic.deepCopy(notifications);
            returnData.state = true;
        }
        if(req.params?.control == 'clear'){
            await loadNotifications();
            notifications = basic.identifyFilter(notifications, oldNotifications);
            await saveNotifications();
            returnData.state = true;
        }
        res.json(returnData);
    });
    app.post('/accounts/:control/:csrf/:key/:value', async function(req, res){
        if(!(req.params?.csrf === csrf)){
            res.send('csrf dosn\'t match!');
            return;
        }
        let returnData = basic.deepCopy(returnDataDefault);
        if(req.params?.control == 'get'){
            returnData.data = basic.deepCopy(accounts);
            for(let account in returnData.data){
                returnData.data[account]['password'] = returnData.data[account]['password'].length;
            }
            returnData.state = true;
        }
        if(req.params?.control == 'update' && req.params?.key){
            let [site, key] = req.params?.key.split('.');
            let value = req.params?.value;
            accounts[site][key] = value;
            await saveAccounts();
            returnData.state = true;
        }
        res.json(returnData);
    });
    app.post('/timing/:control/:csrf/:key/:value', async function(req, res){
        if(!(req.params?.csrf === csrf)){
            res.send('csrf dosn\'t match!');
            return;
        }
        let returnData = basic.deepCopy(returnDataDefault);
        if(req.params?.control == 'get'){
            returnData.data = basic.deepCopy(timing);
            returnData.state = true;
        }
        if(req.params?.control == 'update' && req.params?.key){
            let [site, key, index] = req.params?.key.split('.');
            let value = req.params?.value;
            timing[site][key][index] = JSON.parse(value);
            await saveTiming();
            returnData.state = true;
        }
        res.json(returnData);
    });
    app.listen(settings.port);
}

let broeseLoopCounter = 0;
function broeseLoop(){
    setTimeout(broeseLoop, 60*60*1000);
    (async () => {
        const browser = await puppeteer.launch(settings.debugMode ? {headless: false} : {});
        for(let siteName in timing){
            let commands = Object.keys(timing[siteName])
                .map(command => [command, timing[siteName][command][0]])
                .filter(data => data[1])
                .map(data => data[0])
                .map(command => [command, timing[siteName][command][1]])
                .filter(data => broeseLoopCounter%data[1] == 0)
                .map(data => data[0]);
            console.log(`broese > site['${siteName}'](browser, ${JSON.stringify(accounts[siteName])}, ${JSON.stringify(commands)});`);
            await site[siteName](browser, accounts[siteName], commands);
        }
        if(!settings.debugMode){
            await browser.close();
        }
    })();
    broeseLoopCounter++;
}

async function main(){
    await loadNotifications();
    await loadAccounts();
    await loadTiming();
    server();
    open(`http://localhost:${settings.port}`);

    let dateNow = new Date();
    setTimeout(broeseLoop, ((60 - dateNow.getMinutes())*60 - dateNow.getSeconds())*1000); 
    // setTimeout(broeseLoop, 0); 
}
main();
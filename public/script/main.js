'use-strict';

let timeLocalString = creatDataBuffer(timespen => new Date(timespen).toLocaleString());

/* pageButtons */
function changePage(pageName){
    pageNow = pageName;
    window.history.pushState({}, '', `/page/${pageNow}`);
    let pages = $$('#pagesBox > div');
    pageName = `${pageName}Box`;
    for(let page of pages){
        if(page.id != pageName){
            page.setAttribute('page', 'hide');
        }
        else{
            page.setAttribute('page', 'show');
        }
    }
}
changePage(pageNow == 'home' ? 'notifications' : pageNow);
let pageButtons = $$('#pageButtonsBox > button');
for(let pageButton of pageButtons){
    let pageName = pageButton.id.replace('pageButton-', '');
    pageButton.addEventListener('click', () => {changePage(pageName)});
    pageButton.style.setProperty('--bgi', `url('../image/page_${pageName}.svg')`);
}

/* controlButtons */
$$('[class^="controlButton-"]').forEach(button => {
    button.style.setProperty('--bgi', `url('../image/control_${button.className.replace('controlButton-', '') || 'default'}.svg')`);
});

/* notifications */
let notificationsBox = $('#notificationsBox');
let notificationsBox_lock = $('.lock', notificationsBox);
function pushNotificationElement(data){
    let notification = $e('div'), 
        content = $e('div'), 
        image = $e('img'), 
        site = $e('div'), 
        time = $e('div'), 
        mask = $e('div');
    site.className = 'site centerX centerY';
    site.setAttribute('data-text', data.site || '');
    site.style.setProperty('--bgi', `url('../image/site_${data.site || 'default'}.png')`);
    notification.appendChild(site);
    content.className = 'content';
    content.innerText = data.content || '';
    notification.appendChild(content);
    image.className = 'image';
    image.src = data.image || '';
    content.appendChild(image);
    time.className = 'time';
    time.innerText = data.time ? timeLocalString(data.time) : '';
    content.appendChild(time);
    mask.className = 'mask centerY';
    mask.addEventListener('click', event => {
        window.open(data.link, '_blank');
    });
    notification.appendChild(mask);
    notification.className = 'notification';
    notificationsBox_lock.appendChild(notification);
}
function loadNotifications(){
    fetch(`notifications/get/${csrf}`, {method: "POST"})
        .then(t => t.json())
        .then(json => {
            notificationsBox_lock.innerHTML = '';
            for(let data of json.data){
                pushNotificationElement(data);
            }
        });
}
function clearNotifications(){
    fetch(`notifications/clear/${csrf}`, {method: "POST"})
        .then(t => t.json());
}
loadNotifications();

/* accounts */
let accountsBox = $('#accountsBox');
let accountsBox_lock = $('.lock', accountsBox);
function pushAccountElement(siteName, data){
    let account = $e('div'), 
        site = $e('h2');
    site.className = 'site';
    site.innerText = siteName;
    account.appendChild(site);
    for(i in data){
        let row = $e('li'), 
            text = $e('label'), 
            input = $e('input');
        text.innerText = i;
        row.appendChild(text);
        input.type = i == 'password' ? 'password' : 'text';
        input.id = `account-${siteName}-${i}`;
        text.setAttribute('for', input.id);
        input.value = typeof(data[i]) == 'number' ? new Array(data[i]).fill('-').join('') : data[i];
        function updateAccount(){
            let idData = this.id.split('-');
            if(idData.length < 3 || idData[0] != 'account'){
                return;
            }
            if(this.value.replaceAll('-', '').length < 1){
                return;
            }
            idData.shift();
            fetch(`accounts/update/${csrf}/${idData.join('.')}/${this.value}`, {method: "POST"})
                .then(t => t.json());
        }
        input.addEventListener('blur', updateAccount);
        input.addEventListener('change', updateAccount);
        row.appendChild(input);
        row.className = 'row';
        account.appendChild(row);
    }
    account.className = 'account';
    accountsBox_lock.appendChild(account);
}
function loadAccounts(){
    fetch(`accounts/get/${csrf}/0/0`, {method: "POST"})
        .then(t => t.json())
        .then(arr => {
            accountsBox_lock.innerHTML = '';
            for(let i in arr.data){
                pushAccountElement(i, arr.data[i]);
            }
        });
}
loadAccounts();

/* timing */
let timingBox = $('#timingBox');
let timingBox_lock = $('.lock', timingBox);
function pushTimingElement(siteName, data){
    let timing = $e('div'), 
        site = $e('h2');
    site.className = 'site';
    site.innerText = siteName;
    timing.appendChild(site);
    for(i in data){
        let row = $e('li'), 
            text = $e('label'), 
            enabled = $e('input'), 
            deltaTime = $e('input');
        enabled.id = `timing-${siteName}-${i}-0`;
        text.setAttribute('for', enabled.id);
        enabled.type = 'checkbox';
        enabled.checked = data[i][0];
        row.appendChild(enabled);
        text.innerText = i;
        row.appendChild(text);
        deltaTime.id = `timing-${siteName}-${i}-1`;
        deltaTime.type = 'number';
        deltaTime.value = data[i][1];
        row.appendChild(deltaTime);
        function updateTiming(){
            let idData = this.id.split('-');
            if(idData.length < 4 || idData[0] != 'timing'){
                return;
            }
            let value = idData[3] == '0' ? this.checked : 
                idData[3] == '1' ? this.value : 
                'undefine';
            idData.shift();
            fetch(`timing/update/${csrf}/${idData.join('.')}/${value}`, {method: "POST"})
                .then(t => t.json());
        }
        enabled.addEventListener('click', updateTiming);
        deltaTime.addEventListener('blur', updateTiming);
        deltaTime.addEventListener('change', updateTiming);
        row.className = 'row';
        timing.appendChild(row);
    }
    timing.className = 'timing';
    timingBox_lock.appendChild(timing);
}
function loadTiming(){
    fetch(`timing/get/${csrf}/0/0`, {method: "POST"})
        .then(t => t.json())
        .then(arr => {
            timingBox_lock.innerHTML = '';
            for(let i in arr.data){
                pushTimingElement(i, arr.data[i]);
            }
        });
}
loadTiming();
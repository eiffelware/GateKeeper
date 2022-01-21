const fetch = require('node-fetch');
var a = document.getElementById('headerText');
setTimeout(() => { document.getElementById('btnQuit').classList.remove('disabled') }, 1950);
let su = localStorage.getItem("skip_update");

fetch(`https://www.eiffelware.net/api/apps/gatekeeper/0.2.7`, {
    method: 'get'
}).then((r) => r.json()).then((b) => {
    console.log(b);
    if (!b.auth) return document.getElementById('btnQuit').classList.add('disabled'), a.innerHTML = "Not Authorized.", setTimeout(() => { window.close() }, 1395);
    if (!b.update) return document.getElementById('btnQuit').classList.add('disabled'), setTimeout(() => { window.close() }, 1335);
    if (b.update && su) return document.getElementById('btnQuit').classList.add('disabled'), setTimeout(() => { window.close() }, 1335);
    if (b.update && b.loginAuth) return window.open(b.url), a.innerHTML = b.updateText, setTimeout(() => { document.getElementById('btnQuit').classList.remove('disabled'); document.getElementById('btnContinue').classList.remove('disabled'); document.getElementById('btnContinue').setAttribute('style', 'margin-top: 5px; margin-bottom: 5px; display: block;'); }, 1599);
    if (b.update && !b.loginAuth) return window.open(b.url), a.innerHTML = b.updateText, setTimeout(() => { document.getElementById('btnQuit').classList.remove('disabled'); }, 1599);
});
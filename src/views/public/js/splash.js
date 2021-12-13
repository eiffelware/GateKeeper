const fetch = require('node-fetch');
var a = document.getElementById('headerText');
setTimeout(() => { document.getElementById('btnQuit').classList.remove('disabled') }, 1950);

fetch(`https://www.eiffelware.net/api/apps/gatekeeper/0.2.3`, {
    method: 'get'
}).then((r) => r.json()).then((b) => {
    console.log(b);
    if (!b.auth) return document.getElementById('btnQuit').classList.add('disabled'), a.innerHTML = "Not Authorized.", setTimeout(() => { window.close() }, 1395);
    if (!b.update) return document.getElementById('btnQuit').classList.add('disabled'), setTimeout(() => { window.close() }, 1335);
    if (b.update) return window.open(b.url), a.innerHTML = b.updateText, setTimeout(() => { document.getElementById('btnQuit').classList.remove('disabled') }, 1599);
});
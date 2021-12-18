const { app, shell, BrowserWindow, session } = require('electron');
const ejs = require('ejs');
const ejsEl = require('ejs-electron');
const path = require('path');
const fetch = require('node-fetch');
const jq = require('jquery');

if (require('electron-squirrel-startup')) { 
  app.quit();
}

const createWindow = () => {
  const splashWindow = new BrowserWindow({
    width: 350,
    height: 450,
    icon: __dirname + '/views/public/favicon.ico',
    autoHideMenuBar: true,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  const loginWindow = new BrowserWindow({
    width: 350,
    height: 450,
    resizable: true,
    maximizable: true, 
    fullscreenable: false,
    minWidth: 300, 
    minHeight: 400,
    autoHideMenuBar: true,
    icon: __dirname + '/views/public/favicon.ico',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nativeWindowOpen: false
    }
  })
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 800,
    resizable: true,
    maximizable: true, 
    fullscreenable: false,
    minWidth: 700, 
    minHeight: 665,
    autoHideMenuBar: true,
    icon: __dirname + '/views/public/favicon.ico',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  splashWindow.loadFile(path.join(__dirname, '/views/splash.ejs'));
  mainWindow.loadFile(path.join(__dirname, '/views/index.ejs'));
  loginWindow.loadFile(path.join(__dirname, '/views/login.ejs'));
  mainWindow.webContents.on("new-window", function(event, url) {
    event.preventDefault();
    shell.openExternal(url);
  });
  // mainWindow.webContents.openDevTools(); 

  let u;
  mainWindow.webContents.executeJavaScript('localStorage.getItem("session")').then(object => u = object);
  splashWindow.once('close', () => {
    fetch(`https://www.eiffelware.net/api/apps/gatekeeper/0.2.5`, {
    method: 'get'
  }).then((r) => r.json()).then((b) => {
    fetch(`https://www.eiffelware.net/api/v1/apps/gatekeeper/auth`, { method: 'post', headers: { session: u } }).then((r) => r.json()).then((uF) => {
    if (!b.auth) return app.quit();
    if (b.update) return app.quit();
    if (b.auth && uF.OK == true) return mainWindow.show()
    if (b.auth && uF.OK == false) return loginWindow.show()
    app.quit();
  });
  }).catch(err => app.quit());

  loginWindow.once('close', () => {
    fetch(`https://www.eiffelware.net/api/v1/apps/gatekeeper/auth`, { method: 'post', headers: { session: u } }).then((r) => r.json()).then((res) => {
    console.log(res);
    if (res.OK == true) return mainWindow.show()
    app.quit();
  }).catch(err => app.quit())});
  
    mainWindow.setMenu(null);
    loginWindow.setMenu(null);
    splashWindow.setMenu(null);
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

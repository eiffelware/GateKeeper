const { app, BrowserWindow } = require('electron');
const ejs = require('ejs');
const ejsEl = require('ejs-electron');
const path = require('path');
const fetch = require('node-fetch');

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
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, '/views/index.ejs'));
  splashWindow.loadFile(path.join(__dirname, '/views/splash.ejs'));
  // mainWindow.webContents.openDevTools(); 

  splashWindow.once('close', () => {
    fetch(`https://www.eiffelware.net/api/apps/gatekeeper/0.2.1`, {
    method: 'get'
  }).then((r) => r.json()).then((b) => {
    if (!b.auth) return;
    if (b.update) return;
    if (b.auth) return mainWindow.show();
  })})

  mainWindow.setMenu(null);
  splashWindow.setMenu(null);
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

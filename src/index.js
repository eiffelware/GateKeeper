const { app, BrowserWindow } = require('electron');
const ejse = require('ejs-electron')
const path = require('path');
const open = require('open');

if (require('electron-squirrel-startup')) { 
  app.quit();
}

const createWindow = () => {
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

  const splashWindow = new BrowserWindow({
    width: 350,
    height: 400,
    resizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    frame: false,
    icon: __dirname + '/views/public/favicon.ico'
  })

  mainWindow.loadFile(path.join(__dirname, '/views/index.ejs'));
  splashWindow.setMenu(null);
  splashWindow.loadFile(path.join(__dirname, '/views/splash.ejs'));

  splashWindow.once('close', () => {
    mainWindow.show();
  })
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

const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

const { ipcMain } = require('electron'); // include the ipc module to communicate with render process ie to receive the message from render process

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let newWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 600,
        backgroundColor: "#FFFFFF",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // workaround to allow use with Electron 12+
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
    // mainWindow.setBackgroundColor('#56cc5b10')

    // newWindow.webContents.send('port-data', arg);
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
        // newWindow = null
    })
}

// This is required to be set to false beginning in Electron v9 otherwise
// the SerialPort module can not be loaded in Renderer processes like we are doing
// in this example. The linked Github issues says this will be deprecated starting in v10,
// however it appears to still be changed and working in v11.2.0
// Relevant discussion: https://github.com/electron/electron/issues/18397
app.allowRendererProcessReuse = false

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    app.quit()
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})


//ipcMain.on will receive the “btnclick” info from renderprocess 
ipcMain.on("startBtnClick", function (event, arg) {
    // console.log('BtnClick')
    newWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        backgroundColor: "#ccc",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // workaround to allow use with Electron 12+
        },
        show: false
    })

    // and load the index.html of the app.
    newWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'logPage.html'),
        protocol: 'file:',
        slashes: true
    }))
    // newWindow.webContents.openDevTools()
    
    newWindow.once('ready-to-show', function()
    {
        newWindow.show();
        newWindow.webContents.send("loaded_newWindow", arg);
    })
});

ipcMain.on("portOpenError", function(event,arg)
{
    console.log()
    newWindow.close()
})
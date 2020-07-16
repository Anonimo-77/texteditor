const electron = require('electron');
const { app, BrowserWindow, Menu, ipcMain, dialog } = electron;
const fs = require('fs');
const path = require('path');
const url = require('url');
const { ipcRenderer } = require('electron');


let mainWindow;

String.prototype.reverse = function() {
    let str = this;
    let rts = "";
     for (let i = str.length-1; i >= 0; i--) {
         rts += str[i];
     }
     return rts;
};
function getFileName(str) {
    rts = str.reverse();
    arr = rts.split('/');
    eman = arr[0];
    name = eman.reverse();
    return name;
}

let filename = "";

function saveFileAs() {
    dialog.showSaveDialog(mainWindow, {
        title: 'Save File',
        buttonLabel: 'Save',
        defaultPath: '/',
        filters: [
            { name: 'Text files', extensions: ['txt','html','css','js','json','py','cpp','c','cs','rb'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    }).then(r => {
        
        if (!r.canceled) {
            mainWindow.webContents.send('getText');
            ipcMain.on('rgetText', (e,text) => {
                fs.writeFile(r.filePath, text, 'utf8', (err) => {
                    if (err) throw err;
                    filename = r.filePath;
                    msg = {
                        fileName: getFileName(filename),
                        fileContent: text
                    };
                    mainWindow.webContents.send('loadFile', msg);
                });
            });
        }
    }).catch(console.error);
}
function saveFile() {
    mainWindow.webContents.send('getText');
    ipcMain.on('rgetText', (e,text) => {
        fs.writeFile(filename, text, (err) => {
            if (err) throw err;
        });
    });
    
}



app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 720,
        height: 450,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views', 'index.html'),
        protocol: 'file',
        slashes: true
    }));

    Menu.setApplicationMenu(Menu.buildFromTemplate([
        {
            label: ''
        },
        {
            label: 'File',
            submenu: [
                {
                    label: 'New File',
                    accelerator: 'CmdOrCtrl+N',
                    click() {
                        mainWindow.webContents.send('clear-all');
                        filename = "";
                    }
                },
                {
                    label: 'Open...',
                    accelerator: 'CmdOrCtrl+O',
                    click() {
                        dialog.showOpenDialog(mainWindow, {
                            title: 'Open file',
                            defaultPath: '/',
                            buttonLabel: 'Open',
                            filters: [
                                { name: 'Text files', extensions: ['txt','html','css','js','json','py','cpp','c','cs','rb'] },
                                { name: 'All FIles', extensions: ['*'] }
                            ],
                            properties: [
                                'openFile'
                            ]
                        }).then(result => {
                            if (!result.canceled) {
                                let filepath = result.filePaths[0];
                                filename = filepath;
                                fs.readFile(filepath, 'utf8', function(err, data) {
                                    if (err) throw err;
                                    
                                    let msg = {
                                        fileName: getFileName(filepath),
                                        fileContent: data
                                    }
                                    mainWindow.webContents.send('loadFile', msg);
                                });
                            }
                        })
                    }
                },
                {
                    label: 'Save',
                    accelerator: 'CmdOrCtrl+S',
                    click() {
                        if (filename != "") {
                            saveFile();
                        } else {
                            saveFileAs();
                        }
                    }
                },
                {
                    label: 'Save As...',
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click() {
                        saveFileAs();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'CmdOrCtrl+Z',
                    role: 'undo'
                },
                {
                    label: 'Redo',
                    accelerator: 'CmdOrCtrl+Shift+Z',
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cut',
                    accelerator: 'CmdOrCtrl+X',
                    role: 'cut'
                },
                {
                    label: 'Copy',
                    accelerator: 'CmdOrCtrl+C',
                    role: 'copy'
                },
                {
                    label: 'Paste',
                    accelerator: 'CmdOrCtrl+V',
                    role: 'paste'
                }
            ]
        },
        {
            label: 'dev',
            submenu: [
                {
                    label: 'devtools',
                    role: 'toggleDevTools'
                }
            ]
        }
    ]));
});
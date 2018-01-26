namespace ElectronGlobal{
    export const electron = require('electron')
    export const remote = electron.remote
    export const mainProcess = remote.require('./main')		
    export const ipcRenderer = electron.ipcRenderer
}
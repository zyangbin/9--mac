const { BrowserWindow, ipcMain, globalShortcut } = require('electron')
let captureWins = []
const captureScreen = (e, args) => {
    if (captureWins.length) {
        return
    }
    const { screen } = require('electron')
    let displays = screen.getAllDisplays()
    captureWins = displays.map((display) => {
        let captureWin = new BrowserWindow({
            // window 使用 fullscreen,  mac 设置为 undefined, 不可为 false
            // fullscreen: os.platform() === 'win32' || undefined,
            fullscreen:undefined,
            width: display.bounds.width,
            height: display.bounds.height,
            x:0,
            y:0,
            transparent: true,
            frame: false,
            alwaysOnTop:true,
            skipTaskbar: true,
            autoHideMenuBar: true,
            movable: false,
            resizable: false,
            enableLargerThanScreen: true,
            hasShadow: false,
        })
        console.log('capture')
        // mac
        captureWin.setAlwaysOnTop(true, 'screen-saver')
        captureWin.setVisibleOnAllWorkspaces(true)
        captureWin.setFullScreenable(false)
        const filepath = `file://${__dirname}/static/screenCapture/capture.html`
        captureWin.loadURL(filepath)
        let { x, y } = screen.getCursorScreenPoint()
        if (x >= display.bounds.x && x <= display.bounds.x + display.bounds.width && y >= display.bounds.y && y <= display.bounds.y + display.bounds.height) {
            captureWin.focus()
        } else {
            captureWin.blur()
        }
        // 调试用
        // captureWin.openDevTools()

        captureWin.on('closed', () => {
            let index = captureWins.indexOf(captureWin)
            if (index !== -1) {
                captureWins.splice(index, 1)
            }
            captureWins.forEach(win => win.close())
        })
        return captureWin
    })
}

const useCapture = () => {
    globalShortcut.register('Esc', () => {
        if (captureWins) {
            captureWins.forEach(win => win.close())
            captureWins = []
        }
    })
    globalShortcut.register('CmdOrCtrl+A+SHIFT', captureScreen)
    ipcMain.on('capture-screen', (e, { type = 'start', screenId } = {}) => {
        if (type === 'start') {
            captureScreen()
        } else if (type === 'complete') {
        } else if (type === 'select') {
            captureWins.forEach(win => win.webContents.send('capture-screen', { type: 'select', screenId }))
        }
    })
}
export {
    useCapture,
    captureScreen
}

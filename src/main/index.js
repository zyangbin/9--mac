import { app, BrowserWindow, Menu, Tray, MenuItem, ipcMain, globalShortcut, Notification,shell } from 'electron'
require('electron-squirrel-startup')
import { platform } from 'os'
const path = require('path')
if(process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
let mainWindow = null
let screenCapture = require('./screenCapture/main')
let webPageRoute = ''

ipcMain.on('quit-app',(ev,str)=>{
    if(str=='quit'){
        app.quit()
        mainWindow.destroy()
        mainWindow = null
    }
})

app.on('ready', ()=>{
    const { screen } = require('electron')
    if (mainWindow === null) {
        createMainwindow()
    }else{
      mainWindow.show()
    }
    createTray()

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
})

app.on('activate', () => {
    if (mainWindow === null) {
        createMainwindow()
    }else{
        mainWindow.show()
    }
})
app.on('before-quit',(ev)=>{
    mainWindow.destroy()
    app.quit()
})
app.on('will-quit',()=>{
  // console.log('will')
})
app.on('quit',()=>{
  app.quit()
})

// 打开控制台
ipcMain.on('open-devtool',function(){
  if(process.env.NODE_ENV === 'development'){
    mainWindow.webContents.openDevTools()
  }
})
// 防止启动多个实例
const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
    if (mainWindow) {
        mainWindow.show()
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
    }
})
if (shouldQuit) {
    mainWindow.destroy()
    app.quit()
}
// 创建窗口
function createMainwindow(){
  let winURL = ''
  if(process.env.NODE_ENV !== 'development'){
      screenCapture.useCapture()
      winURL = `file://${__dirname}/index.html`
  }else{
    winURL = `http://localhost:9080`
  }
  mainWindow = new BrowserWindow({
      minHeight: 524,
      height:524,
      useContentSize: true,
      minWidth: 856,
      width:856,
      show:false,
      frame:false,
      autoHideMenuBar:true,
      webSecurity:false,
      titleBarStyle: 'hidden',
      simpleFullscreen:true,
      fullscreen:webPageRoute=='index' ? true : false
  })
  mainWindow.loadURL(winURL)
  mainWindow.on('ready-to-show',()=>{
      mainWindow.show()
  })
  mainWindow.on('close', (event) => {
      event.preventDefault()
      mainWindow.hide()
  })
  
  // 判断当前路由
  ipcMain.on('route-message',(ev, res)=>{
      if(res=='login'){
        webPageRoute = 'login'
        mainWindow.setResizable(false)
        mainWindow.setContentSize(856,524)
      }
      if(res=='index'){
        webPageRoute = 'index'
        mainWindow.setResizable(true)
        const {width, height} = require('electron').screen.getPrimaryDisplay().workAreaSize
        mainWindow.webContents.send('app-path',app.getAppPath())
        if(webPageRoute=='index'){
          if(platform()=='darwin'){
            mainWindow.setSize(parseInt(width*0.5),parseInt(height*0.6),true)
          }
          if(platform()=='win32'){
            mainWindow.setSize(parseInt(width*0.5),parseInt(height*0.6))
          }
        }
      }
  })
}
// 设置工具栏菜单
let template = [{
    label: '窗口',
    submenu: [{
      label:'截图',
      click:()=>{
        if(process.env.NODE_ENV=='production'){
          mainWindow.webContents.send('capture-screen-main')
        }
      }
    },{
      label: '全屏',
    //   enabled:mainWindow.isFullScreen() ? false : true,
      click: (item, focusedWindow) => {
          if(webPageRoute=='index'){
            mainWindow.setSimpleFullScreen(true)
          }
      }
    }, {
      label: '最小化',
      click: (item, focusedWindow) => {
          mainWindow.minimize()
      }
    },  {
      label: '窗口置顶',
      click: function (item, focusedWindow) {
          mainWindow.setAlwaysOnTop(true)
          mainWindow.webContents.send('set-top-main','1')
      }
    },
    {
      label: '取消置顶',
      click: function (item, focusedWindow) {
        mainWindow.setAlwaysOnTop(false)
        mainWindow.webContents.send('set-top-main','0')
      }
    },
    { 
      label: '退出全屏',
      click: (item, focusedWindow) => {
        if(webPageRoute=='index'){
            mainWindow.setSimpleFullScreen(false)
        }
      }
    }]
  }, 
  {
    label: '退出',
    role: 'window',
    submenu: [{
      label: '关闭',
      role: 'close'
    }]
  }, {
    label: '帮助',
    role: 'help',
    submenu: [{
      label: '联系客服',
      click: () => {
        shell.openExternal('http://html.ecqun.com/kf/sdk/openwin.html?corpid=4082467&cstype=rand&mode=0&cskey=2fgF8VQsVvx8HU2PJD&scheme=0')
      }
    }]
  }]
  
  function addUpdateMenuItems (items, position) {
    if (process.mas) return
    const version = app.getVersion()
    let updateItems = [{
      label: `版本号 ${version}`,
      enabled: true
    }, 
    {
      label: '检查更新',
      enabled: true,
      key: 'checkingForUpdate',
      click: () => {
        mainWindow.show()
        mainWindow.webContents.send('check-version','check')
      }
    }, 
    {
        label:'打开',
        enabled:true,
        click: ()=>{
            mainWindow.show()
        }
    },
    {
        label:'隐藏',
        enabled:true,
        click: ()=>{
            mainWindow.hide()
        }
    }]
    items.splice.apply(items, [position, 0].concat(updateItems))
  }
  
  function findReopenMenuItem () {
    const menu = Menu.getApplicationMenu()
    if (!menu) return
  
    let reopenMenuItem
    menu.items.forEach(item => {
      if (item.submenu) {
        item.submenu.items.forEach(item => {
          if (item.key === 'reopenMenuItem') {
            reopenMenuItem = item
          }
        })
      }
    })
    return reopenMenuItem
  }
  
  if (process.platform === 'darwin') {
    const name = app.getName()
    template.unshift({
      label: name,
      submenu: [{
        label: `关于9号米仓`,
        role: 'about'
      },
      {
        label: '退出',
        click: () => {
          app.quit()
        }
      }]
    })
    addUpdateMenuItems(template[0].submenu, 1)
  }
  
  app.on('browser-window-created', () => {
    let reopenMenuItem = findReopenMenuItem()
    if (reopenMenuItem) reopenMenuItem.enabled = false
  })
  
  // app.on('window-all-closed', () => {
  //   console.log('all-closed')
  //   let reopenMenuItem = findReopenMenuItem()
  //   if (reopenMenuItem) reopenMenuItem.enabled = true
  // })
// 创建系统托盘
function createTray(){
  const iconUrl = process.env.NODE_ENV == 'development' ? __dirname : path.join(__dirname, './static')
  let tray = new Tray(path.join(iconUrl,'electron.png'))
  ipcMain.on('unread-total-count',(ev,count)=>{
    if(count>0){
      if(count>99){
        tray.setTitle(String('99+'))
        app.dock.setBadge(String('99+'))
      }else{
        tray.setTitle(String(count))
        app.dock.setBadge(String(count))
      }
    }else{
      app.dock.setBadge(String(''))
      tray.setTitle('')
    }
  })
  tray.on('click',()=>{
    if(mainWindow){
      mainWindow.show()
    }
  })
}

  
/*
 * @Description: 
 * @Author: jwzx
 * @Date: 2024-12-27 13:40:18
 * @LastEditTime: 2025-07-10 17:20:00
 * @LastEditors: jwzx
 * @FilePath: \electron-egg\electron\service\os\tray.js
 */
const { Tray, Menu } = require('electron');
const path = require('path');
const Ps = require('ee-core/ps');
const {logger} = require('ee-core/log');
const Electron = require('ee-core/electron');
const Conf = require('ee-core/config');
const {app:electronApp} = require("electron");
const { electron } = require('process');

/**
 * 托盘插件
 * @class
 */
class TrayAddon {

  constructor() {
    this.tray = null;
  }

  /**
   * 创建托盘
   */
  create () {
    logger.info('[tray] load');
    const cfg = Conf.getConfig()?.addons?.tray;
    const mainWindow = Electron.getMainWindow();

    // 托盘图标
    let iconPath = path.join(Ps.getBaseDir(), cfg.icon);
  
    // 托盘菜单功能列表
    let trayMenuTemplate = [
      {
        label: '显示',
        click: function () {
          mainWindow.show();
        }
      },
      {
        label: '退出',
        click: function () {
            electronApp.quit();
        }
      }
    ]
    // 设置一个标识，用来控制窗口退出。
    Electron.setCloseAndQuit(false)
    mainWindow.setMenu(null)
    // 点击关闭，最小化到托盘
    mainWindow.on('close', (event) => {
        if (Electron.getCloseAndQuit()) {
            return;
        }
      // 关闭应用
      electronApp.quit();
      // 隐藏应用
      // mainWindow.hide();
      event.preventDefault();
    });
    
    // 实例化托盘
    this.tray = new Tray(iconPath);
    this.tray.setToolTip(cfg.title);
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    this.tray.setContextMenu(contextMenu);
    this.tray.on('double-click', () => {
      mainWindow.show()
    })
  }
}

TrayAddon.toString = () => '[class TrayAddon]';
const trayAddon = new TrayAddon();
module.exports = {
    TrayAddon,
    trayAddon,
}
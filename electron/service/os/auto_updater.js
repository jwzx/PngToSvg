/*
 * @Description: 
 * @Author: jwzx
 * @Date: 2025-07-04 14:44:53
 * @LastEditTime: 2025-07-07 17:05:15
 * @LastEditors: jwzx
 * @FilePath: \electron-egg\electron\service\os\auto_updater.js
 */
const  { getMainWindow, setCloseAndQuit } = require( 'ee-core/electron');
const { getConfig } = require('ee-core/config');
const { logger } = require('ee-core/log');
const {autoUpdater} = require("electron-updater")
const {app:electronApp} = require("electron");
const {is} = require("ee-core/utils")

class AutoUpdaterService {
  constructor() {
    
  }
  create(){
    logger.info('[autoUpdater] load');
    this.config = getConfig();
    const cfg  = this.config.addons.autoUpdater;
    if ((is.windows() && cfg.windows) ||
        (is.macOS() && cfg.macOS) ||
        (is.linux() && cfg.linux)) {
      // continue
    } else {
      return;
    }

     
    // 是否检查更新
    if (cfg.force) {
      this.checkUpdate();
    }


    const status = {
        error: -1,
        available: 1,
        noAvailable: 2,
        downloading: 3,
        downloaded: 4,
      };
  
      const version = electronApp.getVersion();
      logger.info('[autoUpdater] current version: ', version);
  
      // Set the download server address
      let server = cfg.options.url;
      const lastChar = server.substring(server.length - 1);
      server = lastChar === '/' ? server : server + "/";
      cfg.options.url = server;

      logger.info('[autoUpdater] current cfg: ', JSON.stringify(cfg));

      // 是否后台自动下载
      autoUpdater.autoDownload = cfg.force ? true : false;
  
      try {
        autoUpdater.setFeedURL(cfg.options);
      } catch (error) {
        logger.error('[autoUpdater] setFeedURL error : ', error);
      }
  
      autoUpdater.on('checking-for-update', () => {
        // sendStatusToWindow('正在检查更新...');
      });
      autoUpdater.on('update-available', () => {
        const data = {
          status: status.available,
          desc: '有可用更新',
        };
        logger.info('[autoUpdater] update available: ', JSON.stringify(data));
        this.sendStatusToWindow(data);
      });
      autoUpdater.on('update-not-available', () => {
        const data = {
          status: status.noAvailable,
          desc: '没有可用更新',
        };
         logger.info('[autoUpdater] update not available: ', JSON.stringify(data));

        this.sendStatusToWindow(data);
      });
      autoUpdater.on('error', (err) => {
        const data = {
          status: status.error,
          desc: err,
        };
        logger.error('[autoUpdater] error: ', JSON.stringify(data));
        this.sendStatusToWindow(data);
      });
      autoUpdater.on('download-progress', (progressObj) => {
        const percentNumber = progressObj.percent;
        const totalSize = this.bytesChange(progressObj.total);
        const transferredSize = this.bytesChange(progressObj.transferred);
        let text = '已下载 ' + percentNumber + '%';
        text = text + ' (' + transferredSize + "/" + totalSize + ')';
  
        const data = {
          status: status.downloading,
          desc: text,
          percentNumber,
          totalSize,
          transferredSize,
        };
        logger.info('[addon:autoUpdater] progress: ', text);
        this.sendStatusToWindow(data);
      });
      autoUpdater.on('update-downloaded', () => {
        const data = {
          status: status.downloaded,
          desc: '下载完成',
        };
        logger.info('[addon:autoUpdater] downloaded: ', JSON.stringify(data));
        this.sendStatusToWindow(data);
  
        // Allow the window to close
        setCloseAndQuit(true);
  
        // Install updates and exit the application
        autoUpdater.quitAndInstall();
      });
  }

  /**
   * Check for updates
   */
  checkUpdate() {
    autoUpdater.checkForUpdates();
  }

  /**
   * Download updates
   */
  download() {
    autoUpdater.downloadUpdate();
  }

  /**
   * Send status to the frontend
   */
  sendStatusToWindow(content) {
    const textJson = JSON.stringify(content);
    const channel = 'custom/app/updater';
    const win = getMainWindow();
    win.webContents.send(channel, textJson);
  }

  /**
   * Convert bytes to a more readable format
   */
  bytesChange(limit) {
    let size = "";
    if (limit < 0.1 * 1024) {
      size = limit.toFixed(2) + "B";
    } else if (limit < 0.1 * 1024 * 1024) {
      size = (limit / 1024).toFixed(2) + "KB";
    } else if (limit < 0.1 * 1024 * 1024 * 1024) {
      size = (limit / (1024 * 1024)).toFixed(2) + "MB";
    } else {
      size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
    }

    let sizeStr = size + "";
    let index = sizeStr.indexOf(".");
    let dou = sizeStr.substring(index + 1, index + 3);
    if (dou === "00") {
      return sizeStr.substring(0, index) + sizeStr.substring(index + 3, index + 5);
    }

    return size;
  }
}

AutoUpdaterService.toString = () => '[class AutoUpdaterService]';
const autoUpdaterService = new AutoUpdaterService();

module.exports = {
    AutoUpdaterService,
    autoUpdaterService
  };
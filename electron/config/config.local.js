/*
 * @Description: 
 * @Author: jwzx
 * @Date: 2025-04-01 13:10:56
 * @LastEditTime: 2025-07-15 14:48:04
 * @LastEditors: jwzx
 * @FilePath: \electron-egg\electron\config\config.local.js
 */
'use strict';

/**
 * Development environment configuration, coverage config.default.js
 */
module.exports = () => {
  return {
    openDevTools: true,
    jobs: {
      messageLog: false
    }
  };
};

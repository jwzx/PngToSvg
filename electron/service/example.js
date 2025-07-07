/*
 * @Description: 
 * @Author: jwzx
 * @Date: 2025-04-01 13:10:56
 * @LastEditTime: 2025-07-07 16:35:35
 * @LastEditors: jwzx
 * @FilePath: \electron-egg\electron\service\example.js
 */
'use strict';

const { logger } = require('ee-core/log');
const path = require("path")
const fs = require("fs")
const { getBaseDir ,appVersion} = require('ee-core/ps');

/**
 * 示例服务
 * @class
 */
class ExampleService {

  /**
   * test
   */
  async test(args) {
    let obj = {
      status:'ok',
      params: args
    }

    logger.info('ExampleService obj:', obj);

    return obj;
  }
  async version(){
    const obj = {
      status:'ok',
    }
    obj.version = appVersion();
    return obj;
  }
}
ExampleService.toString = () => '[class ExampleService]';

module.exports = {
  ExampleService,
  exampleService: new ExampleService()
};
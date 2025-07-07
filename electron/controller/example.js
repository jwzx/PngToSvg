/*
 * @Description: 
 * @Author: jwzx
 * @Date: 2025-04-01 13:10:56
 * @LastEditTime: 2025-07-07 11:29:13
 * @LastEditors: jwzx
 * @FilePath: \electron-egg\electron\controller\example.js
 */
'use strict';

const { logger } = require('ee-core/log');
const { exampleService } = require('../service/example');
console.log("根目录",process.cwd())

/**
 * example
 * @class
 */
class ExampleController {

  /**
   * 所有方法接收两个参数
   * @param args 前端传的参数
   * @param event - ipc通信时才有值。详情见：控制器文档
   */

  /**
   * test
   */
  async test () {
    const result = await exampleService.test('electron');
    logger.info('service result:', result);

    return 'hello electron-egg';
  }
  async version(){
    return exampleService.version();
  }
}
ExampleController.toString = () => '[class ExampleController]';

module.exports = ExampleController; 
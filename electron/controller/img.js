'use strict';

const { logger } = require('ee-core/log');
const { imgServive } = require('../service/img');

/**
 * example
 * @class
 */
class ImgController {

  /**
   * 所有方法接收两个参数
   * @param args 前端传的参数
   * @param event - ipc通信时才有值。详情见：控制器文档
   */

  /**
   * test
   */
  async convert (args,event) {
    const result = await imgServive.convert(args,event);
    logger.info('service result:', result);

    return result;
  }
}
ImgController.toString = () => '[class ImgController]';

module.exports = ImgController; 
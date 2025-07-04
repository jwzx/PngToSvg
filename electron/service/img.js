/*
 * @Description: 
 * @Author: jwzx
 * @Date: 2025-06-27 12:00:19
 * @LastEditTime: 2025-06-27 13:31:26
 * @LastEditors: jwzx
 * @FilePath: \electron-egg\electron\service\img.js
 */
'use strict';

const { logger } = require('ee-core/log');
const axios = require("axios")
/**
 * 示例服务
 * @class
 */
class ImgService {

  /**
   * test
   */
  async convert(args) {
    let formDataValue = args;
    try {
      const response = await axios.post("https://www.toolhelper.cn/Image/ImageConvertJson?gts=1750989708000&gv=195&r_=0.9906964738969134", req.body, {
        params: req.query,
        headers: req.headers
      });
      res.send(response.data);
    } catch (error) {
      handleError(res, error);
    }

    logger.info('ImgService obj:', obj);

    return obj;
  }
}
ImgService.toString = () => '[class ImgService]';

module.exports = {
  ImgService,
  imgService: new ImgService()
};
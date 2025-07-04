/*
 * @Description:
 * @Author: jwzx
 * @Date: 2025-06-20 14:07:29
 * @LastEditTime: 2025-06-27 13:59:47
 * @LastEditors: jwzx
 * @FilePath: \electron-egg\frontend\src\service\api\img.ts
 */
import { request } from '../request';

export type Format = "bmp"|"gif"|"jpg"|"jpeg"|"png"|"webp"|"svg"|"dds"|"fits"|"hdr"|"pdf"|"ps"|"psb"|"psd"|"otb"|"tiff"

export interface FormDataValue {
  fileList: File[];
  format: Format;
  backColor: string;
}



/**
 * Login
 *
 * @param userName User name
 * @param password Password
 */
export function ImageConvert(formData: FormDataValue,querys) {

  return request<Api.Auth.LoginToken>({
    url: 'https://www.toolhelper.cn/Image/ImageConvertJson'+querys,
    method: 'post',
    data: formData
  });
}

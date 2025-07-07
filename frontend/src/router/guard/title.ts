/*
 * @Description: 
 * @Author: jwzx
 * @Date: 2025-06-20 09:36:06
 * @LastEditTime: 2025-07-07 13:45:31
 * @LastEditors: jwzx
 * @FilePath: \electron-egg\frontend\src\router\guard\title.ts
 */
import type { Router } from 'vue-router';
import { useTitle } from '@vueuse/core';
import { $t } from '@/locales';
import {ipc}from '@/utils/ipcRenderer';

export function createDocumentTitleGuard(router: Router) {
  router.afterEach(to => {
    const { i18nKey, title } = to.meta;
    debugger
    const versionInfo = ipc.sendSync('controller/example/version');
debugger
    const documentTitle = (i18nKey ? $t(i18nKey) : title) + "-" + versionInfo.version;
    
    useTitle(documentTitle);
  });
}

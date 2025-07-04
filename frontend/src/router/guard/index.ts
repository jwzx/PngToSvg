/*
 * @Description:
 * @Author: jwzx
 * @Date: 2025-06-20 09:36:06
 * @LastEditTime: 2025-07-03 17:44:46
 * @LastEditors: jwzx
 * @FilePath: \electron-egg\frontend\src\router\guard\index.ts
 */
import type { Router } from 'vue-router';
import { createRouteGuard } from './route';
import { createProgressGuard } from './progress';
import { createDocumentTitleGuard } from './title';

/**
 * Router guard
 *
 * @param router - Router instance
 */
export function createRouterGuard(router: Router) {
  createProgressGuard(router);
  debugger
  createRouteGuard(router);
  createDocumentTitleGuard(router);
}

/*
 * @Description:
 * @Author: jwzx
 * @Date: 2025-06-20 09:36:06
 * @LastEditTime: 2025-07-04 17:49:54
 * @LastEditors: jwzx
 * @FilePath: \electron-egg\frontend\vite.config.ts
 */
import process from 'node:process';
import { URL, fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { setupVitePlugins } from './build/plugins';
import { createViteProxy, getBuildTime } from './build/config';

export default defineConfig(configEnv => {
  const viteEnv = loadEnv(configEnv.mode, process.cwd()) as unknown as Env.ImportMeta;

  const buildTime = getBuildTime();

  const enableProxy = configEnv.command === 'serve' && !configEnv.isPreview;

  return {
    base: viteEnv.VITE_BASE_URL,
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./', import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use "@/styles/scss/global.scss" as *;`
        }
      }
    },
    plugins: setupVitePlugins(viteEnv, buildTime),
    define: {
      BUILD_TIME: JSON.stringify(buildTime),
      APP_VERSION: JSON.stringify(process.env.npm_package_version),
    },
    server: {
      host: '0.0.0.0',
      port: 28080,
      open: false,
      proxy: createViteProxy(viteEnv, enableProxy)
    },
    preview: {
      port: 28080
    },
    build: {
      reportCompressedSize: false,
      sourcemap: viteEnv.VITE_SOURCE_MAP === 'Y',
      commonjsOptions: {
        ignoreTryCatch: false
      },
      outDir: 'dist',
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      brotliSize: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          // Remove console and debugger in production
          drop_console: false,
          drop_debugger: true,
        },
      },
    }
  };
});

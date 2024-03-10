import eslint from 'vite-plugin-eslint';
import {VitePWA} from 'vite-plugin-pwa';
import vue from '@vitejs/plugin-vue';
import vueJsx from "@vitejs/plugin-vue-jsx"
import webmanifest from './src/manifest.json';

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

export default {
  base: './',
  plugins: [
		vue(),
    vueJsx({
      
    }),
    eslint(),
    // eslint-disable-next-line new-cap
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: webmanifest,
    }),
    AutoImport({
      imports: [
        'vue',
        {
          'naive-ui': [
            'useDialog',
            'useMessage',
            'useNotification',
            'useLoadingBar'
          ]
        }
      ]
    }),
    Components({
      resolvers: [NaiveUiResolver()]
    })
  ],
  server: { 
    host: '0.0.0.0' 
  },
  build: {
    rollupOptions: {
        output:{
            manualChunks(id) {
              if (id.includes('node_modules')) {
                  return id.toString().split('node_modules/')[1].split('/')[0].toString();
              }
          }
        }
    }
  }
  // build: {
  //   sourcemap: true,
  //   outDir: 'distp', //指定输出路径
  //   assetsDir: 'static/img/', // 指定生成静态资源的存放路径
  //   rollupOptions: {
  //     output: {
  //       manualChunks(id) {
  //         if (id.includes('node_modules')) {
  //           const arr = id.toString().split('node_modules/')[1].split('/')
  //           switch(arr[0]) {
  //             case '@kangc':
  //             case '@naturefw':
  //             case '@popperjs':
  //             case '@vue':
  //             case 'axios':
  //             case 'element-plus':
  //               return '_' + arr[0]
  //               break
  //             default :
  //               return '__vendor'
  //               break
  //           }
  //         }
  //       },
  //       chunkFileNames: 'static/js1/[name]-[hash].js',
  //       entryFileNames: 'static/js2/[name]-[hash].js',
  //       assetFileNames: 'static/[ext]/[name]-[hash].[ext]'
  //     },
  //     brotliSize: false, // 不统计
  //     target: 'esnext', 
  //     minify: 'esbuild' // 混淆器，terser构建后文件体积更小
  //   }
  // },
};

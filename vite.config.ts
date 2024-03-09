import eslint from 'vite-plugin-eslint';
import {VitePWA} from 'vite-plugin-pwa';
import vue from '@vitejs/plugin-vue';
import vueJsx from "@vitejs/plugin-vue-jsx"
import webmanifest from './src/manifest.json';

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
  ],
  server: { 
    host: '0.0.0.0' 
  }
};

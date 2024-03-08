import eslint from 'vite-plugin-eslint';
import {VitePWA} from 'vite-plugin-pwa';
import vue from '@vitejs/plugin-vue';
import webmanifest from './src/manifest.json';

export default {
  base: './',
  plugins: [
		vue(),
    eslint(),
    // eslint-disable-next-line new-cap
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: webmanifest,
    }),
  ],
};

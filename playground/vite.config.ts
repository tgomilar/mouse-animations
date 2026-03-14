import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/mouse-animations/',
  resolve: {
    alias: {
      'mouse-animations': resolve(__dirname, '../src/index.ts'),
    },
  },
});

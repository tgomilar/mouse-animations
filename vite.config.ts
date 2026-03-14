import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { defineConfig, type Plugin } from 'vite';
import { minify } from 'rolldown/utils';
import dts from 'vite-plugin-dts';

function minifyPlugin(): Plugin {
  const distFiles: string[] = [
    'dist/mouse-animations.js',
    'dist/mouse-animations.cjs',
    'dist/mouse-animations.jquery.js',
    'dist/mouse-animations.jquery.cjs',
  ];

  return {
    name: 'minify-outputs',
    async closeBundle(): Promise<void> {
      for (const file of distFiles) {
        const src = readFileSync(file, 'utf-8');
        const { code } = await minify(file, src);
        writeFileSync(file.replace(/\.(js|cjs)$/, '.min.$1'), code);
      }
    },
  };
}

export default defineConfig({
  plugins: [dts({ include: ['src'] }), minifyPlugin()],
  build: {
    minify: false,
    lib: {
      entry: {
        'mouse-animations':        resolve(__dirname, 'src/index.ts'),
        'mouse-animations.jquery': resolve(__dirname, 'src/jquery.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rolldownOptions: {
      external: ['jquery'],
      output: {
        exports: 'named',
        globals: { jquery: 'jQuery' },
        // Stable chunk name without content hash
        chunkFileNames: (chunk) => `${chunk.name}.js`,
      },
    },
  },
});

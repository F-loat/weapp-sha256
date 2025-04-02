import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'weapp-sha256',
      formats: ['es'],
    },
    minify: true,
  },
});

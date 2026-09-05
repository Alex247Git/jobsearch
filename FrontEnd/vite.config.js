import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                rewrite: (p) => p.replace(/^\/api/, ''),
            },
        },
    },
    build: {
        outDir: 'build',
    },
    esbuild: {
        jsx: 'automatic',
        loader: 'jsx',
        include: /\.[jt]sx?$/,
    },
    optimizeDeps: {
        esbuildOptions: {
            jsx: 'automatic',
            loader: { '.js': 'jsx' },
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/setupTests.js'],
        esbuild: {
            jsx: 'automatic',
            loader: { '.js': 'jsx' },
        },
    },
});

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
    const isProduction = command === 'build';
    
    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
                ssr: 'resources/js/ssr.tsx',
                refresh: true,
            }),
            react(),
            tailwindcss(),
        ],
        esbuild: {
            jsx: 'automatic',
        },
        resolve: {
            alias: {
                'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
            },
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks: undefined,
                },
            },
            assetsDir: 'assets',
        },
        // 在生产环境中强制使用相对路径
        base: isProduction ? '/build/' : '/',
        server: {
            hmr: !isProduction,
        },
    };
});

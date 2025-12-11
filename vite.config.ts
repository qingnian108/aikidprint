import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin to inject PayPal config into HTML for preloading
function injectPayPalConfig(env: Record<string, string>): Plugin {
  return {
    name: 'inject-paypal-config',
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        `<script>
          window.__PAYPAL_CLIENT_ID__ = '${env.PAYPAL_CLIENT_ID || ''}';
          window.__PAYPAL_CURRENCY__ = '${env.PAYPAL_CURRENCY || 'USD'}';
        </script>
        </head>`
      );
    },
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: env.VITE_BASE_PATH || '/',
      server: {
        port: 5173, // 前端端口，避免与后端 3000 冲突
        host: '0.0.0.0', // 允许局域网访问
      },
      plugins: [
        react(),
        injectPayPalConfig(env)
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.PAYPAL_CLIENT_ID': JSON.stringify(env.PAYPAL_CLIENT_ID),
        'process.env.PAYPAL_CURRENCY': JSON.stringify(env.PAYPAL_CURRENCY || 'USD')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

import { commerceHandler } from './server/api.js';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
let testSession = {};
try { testSession = JSON.parse(readFileSync(new URL('./server/checkout-test-session.json', import.meta.url), 'utf8')); } catch { /* No local authorization in a fresh checkout. */ }

export default defineConfig(({ mode }) => ({
  plugins: [react(), { name: 'private-commerce', configureServer(server) { server.middlewares.use(commerceHandler({ ...loadEnv(mode, process.cwd(), ''), ...process.env,
    ...(mode === 'development' ? {
      PONDNEST_LOCAL_TEST_SERVER:'true',
      PONDNEST_CHECKOUT_TEST_EXPIRES_AT:testSession.expiresAt,
      PONDNEST_SHOPIFY_TEST_CONFIRMED:String(testSession.shopifyTestModeConfirmed),
      PONDNEST_AUTODS_DISABLED_CONFIRMED:String(testSession.autodsAutomationDisabledConfirmed),
    } : {}),
  })); } }],
  base: mode === 'pages' ? '/pondnest/' : '/',
}));

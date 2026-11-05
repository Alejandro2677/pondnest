import { spawn } from "node:child_process";
const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "--host",
    "127.0.0.1",
    "--port",
    "5174",
    "--strictPort",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      SHOPIFY_STORE_DOMAIN: "pondnest-test.myshopify.com",
      SHOPIFY_STOREFRONT_PRIVATE_TOKEN: "",
      SHOPIFY_API_VERSION: "2026-10",
    },
  },
);
process.on("SIGTERM", () => server.kill());
process.on("SIGINT", () => server.kill());
server.on("exit", (code) => process.exit(code || 0));

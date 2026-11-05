import { loadEnv } from 'vite';
import { spawn } from 'node:child_process';
const child = spawn(process.execPath,['server/start.js'],{stdio:'inherit',env:{...loadEnv('development',process.cwd(),''),...process.env,NODE_ENV:'production',PORT:'5180',PONDNEST_CHECKOUT_ENABLED:'false'}});
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code ?? 1));

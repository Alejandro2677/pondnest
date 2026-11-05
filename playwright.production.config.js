import {defineConfig} from '@playwright/test';
import {makePreferences,COOKIE_PREFERENCES_KEY} from './src/services/cookiePreferences.js';
export default defineConfig({
  testDir:'./tests/production',timeout:60000,workers:1,
  use:{baseURL:'http://localhost:5180',channel:'chrome',headless:true,storageState:{cookies:[],origins:[{origin:'http://localhost:5180',localStorage:[{name:COOKIE_PREFERENCES_KEY,value:JSON.stringify(makePreferences(false))}]}]}},
  webServer:{command:'node scripts/production-test-server.mjs',url:'http://localhost:5180/healthz',reuseExistingServer:false},
});

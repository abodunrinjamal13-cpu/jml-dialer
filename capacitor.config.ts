import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jmlconnect.app',
  appName: 'JML Connect',
  webDir: 'public',
  server: {
    url: 'https://jml-dialer-haga.vercel.app',
    cleartext: true
  }
};

export default config;
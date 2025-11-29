import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.werkwise.app',
  appName: 'WerkWise',
  webDir: 'dist',
  server: {
    // Start at the demo page
    url: undefined,
    cleartext: true
  },
  android: {
    allowMixedContent: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#DC2626',
      showSpinner: false
    }
  }
};

export default config;

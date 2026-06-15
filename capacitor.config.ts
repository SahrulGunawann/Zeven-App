import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zeven.marketplace',
  appName: 'Zeven',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      backgroundColor: "#F9F6F0",
      androidScaleType: "FIT_CENTER",
      showSpinner: false,
      splashBackgroundColor: "#F9F6F0",
    },
  },
};

export default config;

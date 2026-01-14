import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aindoornavigation.app',
  appName: 'A.P.P.',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#000000',
    preferredContentMode: 'mobile',
    allowsLinkPreview: false,
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'This app needs camera access for AR navigation.',
      },
    },
    Device: {
      motion: true,
      orientation: true,
    },
    Geolocation: {
      permissions: {
        location: 'This app needs location access for navigation accuracy.',
      },
    },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#00d9ff',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;


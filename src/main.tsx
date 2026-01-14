import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize Capacitor (if available)
// Note: We'll hide the native splash screen in the SplashScreen component
// to ensure our custom animation shows immediately
let Capacitor: any;
try {
  Capacitor = require('@capacitor/core').Capacitor;
  if (Capacitor && Capacitor.isNativePlatform()) {
    // Hide native splash immediately to show our custom splash
    const { SplashScreen } = require('@capacitor/splash-screen');
    SplashScreen.hide();
  }
} catch (e) {
  // Running in web mode
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

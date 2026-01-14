import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100vh';
    
    // Hide Capacitor's native splash screen immediately
    let Capacitor: any;
    try {
      Capacitor = require("@capacitor/core").Capacitor;
      if (Capacitor && Capacitor.isNativePlatform()) {
        const { SplashScreen } = require("@capacitor/splash-screen");
        SplashScreen.hide();
      }
    } catch (e) {
      // Running in web mode
    }

    // Start expand animation after a brief delay
    const expandTimer = setTimeout(() => {
      setIsExpanded(true);
    }, 100);

    // Show splash screen for 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for fade out animation before calling onComplete
      setTimeout(() => {
        onComplete();
      }, 300);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(expandTimer);
      // Note: Don't restore scrolling here as App component will handle it
    };
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ 
        background: '#000000'
      }}
    >
      <img 
        src="/Animation.jpeg" 
        alt="A.P.P. Splash Screen"
        className={`w-full h-full object-contain transition-transform duration-700 ease-out ${
          isExpanded ? 'scale-100' : 'scale-95'
        }`}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      />
    </div>
  );
}


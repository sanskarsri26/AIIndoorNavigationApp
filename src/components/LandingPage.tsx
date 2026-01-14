import { useEffect } from "react";
import { ShoppingCart, Store, Package } from "lucide-react";
import { Button } from "./ui/button";

interface LandingPageProps {
  onSelectPath: (path: "shopper" | "retailer" | "brand") => void;
}

export function LandingPage({ onSelectPath }: LandingPageProps) {
  useEffect(() => {
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100vh';
    
    return () => {
      // Restore scrolling when component unmounts
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-4 overflow-hidden" style={{ touchAction: 'none' }}>
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-gradient-to-br from-black via-cyan-950 to-black rounded-3xl shadow-2xl shadow-cyan-500/30 border-2 border-cyan-500 overflow-hidden" style={{ height: '812px' }}>
        <div className="h-full flex flex-col justify-between px-6 py-8 overflow-hidden">
          {/* Header */}
          <div className="text-center pt-4">
            <h1 className="text-white text-3xl mb-2">
              A.P.P.
            </h1>
            <p className="text-cyan-400 text-lg">AI-Powered Indoor Navigation</p>
          </div>

          {/* Path Options */}
          <div className="flex flex-col gap-4 flex-1 justify-center">
            {/* Shopper */}
            <button
              onClick={() => onSelectPath("shopper")}
              className="bg-zinc-900 backdrop-blur-sm rounded-3xl p-5 shadow-2xl shadow-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400 active:scale-95 transform transition-all duration-200 text-center touch-manipulation"
            >
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <ShoppingCart className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-white text-xl mb-1">Shopper</h2>
              <p className="text-cyan-400/70 text-xs">
                Navigate your shopping journey with AI-powered assistance
              </p>
            </button>

            {/* Retailer */}
            <button
              onClick={() => onSelectPath("retailer")}
              className="bg-zinc-900 backdrop-blur-sm rounded-3xl p-5 shadow-2xl shadow-purple-500/20 border border-purple-500/30 hover:border-purple-400 active:scale-95 transform transition-all duration-200 text-center touch-manipulation"
            >
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Store className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-white text-xl mb-1">Retailer</h2>
              <p className="text-purple-400/70 text-xs">
                Manage your store and optimize customer experience
              </p>
            </button>

            {/* Brand */}
            <button
              onClick={() => onSelectPath("brand")}
              className="bg-zinc-900 backdrop-blur-sm rounded-3xl p-5 shadow-2xl shadow-orange-500/20 border border-orange-500/30 hover:border-orange-400 active:scale-95 transform transition-all duration-200 text-center touch-manipulation"
            >
              <div className="bg-gradient-to-br from-orange-500 to-red-600 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Package className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-white text-xl mb-1">Brands</h2>
              <p className="text-orange-400/70 text-xs">
                Connect with shoppers and boost product visibility
              </p>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center pb-4">
            <p className="text-cyan-400/50 text-xs">
              Powered by AI • Indoor Navigation • Smart Shopping
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
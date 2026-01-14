import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { X, Scan, CheckCircle2 } from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Product, getProductById, products } from "../lib/products";

// Import Capacitor for native camera permissions
let Capacitor: any = null;
let Camera: any = null;

try {
  Capacitor = require("@capacitor/core").Capacitor;
  Camera = require("@capacitor/camera").Camera;
} catch (e) {
  // Capacitor not available, using web APIs
  console.log("Capacitor not available, using web APIs");
}

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (product: Product) => void;
  currentProduct?: Product | null;
  onNavigateNext?: () => void;
}

export function BarcodeScanner({ open, onClose, onScanSuccess, currentProduct, onNavigateNext }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string>("");
  const scannerId = "barcode-scanner-container";

  // Cleanup function to stop all camera streams
  const stopAllStreams = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
    setError("");
  };

  // Start scanning
  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError("");

      // Request camera permissions first (especially for native iOS)
      if (Capacitor && Capacitor.isNativePlatform() && Camera) {
        try {
          const permissionStatus = await Camera.requestPermissions();
          if (permissionStatus.camera !== 'granted') {
            setError("Camera permission is required for barcode scanning. Please enable it in Settings > Privacy > Camera.");
            setIsScanning(false);
            return;
          }
        } catch (err) {
          console.error("Error requesting camera permissions:", err);
        }
      }

      // Wait a bit for permissions to be granted
      await new Promise(resolve => setTimeout(resolve, 300));

      // Create scanner instance
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      // Start scanning with barcode support
      await scanner.start(
        { facingMode: "environment" }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          // html5-qrcode supports barcodes by default, but we can specify formats
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.CODABAR,
            Html5QrcodeSupportedFormats.QR_CODE // Also support QR codes
          ]
        },
        (decodedText) => {
          // Barcode scanned successfully
          console.log("Barcode scanned:", decodedText);
          handleBarcodeScanned(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors (they're frequent during scanning)
          if (!errorMessage.includes("NotFoundException") && 
              !errorMessage.includes("No QR code") &&
              !errorMessage.includes("No MultiFormat Readers")) {
            // Silent - these are expected during scanning
          }
        }
      );

    } catch (error: any) {
      console.error("Barcode scan error:", error);
      setIsScanning(false);
      
      const errorMsg = error?.message || String(error) || "Unknown error";
      if (errorMsg.includes("Permission") || errorMsg.includes("NotAllowedError")) {
        setError("Camera permission is required for barcode scanning. Please enable it in Settings > Privacy > Camera.");
      } else if (errorMsg.includes("NotFoundError") || errorMsg.includes("no devices")) {
        setError("No camera found. Please ensure your device has a camera.");
      } else {
        setError(`Unable to start camera: ${errorMsg}`);
        // Default to Diet Coke for demo
        handleBarcodeScanned("");
      }
    }
  };

  const handleBarcodeScanned = (barcodeText: string) => {
    let product: Product | null = null;
    let price: number | undefined;
    
    // If barcode text is empty or can't be decoded, default to Diet Coke
    if (!barcodeText || barcodeText.trim() === "") {
      // Default to Diet Coke for demo
      product = getProductById("promo1") || products.find(p => 
        p.name.toLowerCase().includes("diet coke") || 
        (p.name.toLowerCase().includes("coke") && p.name.toLowerCase().includes("diet"))
      );
    } else {
      let productId = barcodeText.trim();
      
      try {
        // Try to parse as JSON
        const barcodeData = JSON.parse(barcodeText);
        productId = barcodeData.productId || barcodeData.id || barcodeText.trim();
        price = barcodeData.price;
      } catch {
        // Not JSON, use as-is
        productId = barcodeText.trim();
      }
      
      // Try to find product by ID
      product = getProductById(productId);
      
      if (!product) {
        // Try to find by name variations
        const searchTerms = productId.toLowerCase();
        product = products.find(p => 
          p.id === productId || 
          p.name.toLowerCase().includes(searchTerms) ||
          searchTerms.includes(p.name.toLowerCase())
        );
      }
      
      // If still not found, default to Diet Coke
      if (!product) {
        product = getProductById("promo1") || products.find(p => 
          p.name.toLowerCase().includes("diet coke") || 
          (p.name.toLowerCase().includes("coke") && p.name.toLowerCase().includes("diet"))
        );
      }
    }
    
    if (product) {
      // Update price if provided in barcode
      const productWithPrice = price ? { ...product, price } : product;
      setScannedProduct(productWithPrice);
      onScanSuccess(productWithPrice);
      
      // Stop scanning
      stopAllStreams();
      
      // Check if scanned product matches current navigation item
      if (currentProduct && currentProduct.id === product.id && onNavigateNext) {
        setTimeout(() => {
          onNavigateNext();
          setScannedProduct(null);
          onClose();
        }, 1500);
      } else {
        setTimeout(() => {
          setScannedProduct(null);
          onClose();
        }, 2000);
      }
    } else {
      // Fallback to Diet Coke if nothing found
      const dietCoke = getProductById("promo1") || products.find(p => 
        p.name.toLowerCase().includes("diet coke")
      );
      if (dietCoke) {
        setScannedProduct(dietCoke);
        onScanSuccess(dietCoke);
        stopAllStreams();
        if (currentProduct && currentProduct.id === dietCoke.id && onNavigateNext) {
          setTimeout(() => {
            onNavigateNext();
            setScannedProduct(null);
            onClose();
          }, 1500);
        } else {
          setTimeout(() => {
            setScannedProduct(null);
            onClose();
          }, 2000);
        }
      }
    }
  };

  // Handle open/close
  useEffect(() => {
    if (open) {
      startScanning();
    } else {
      stopAllStreams();
    }
    
    return () => {
      // Cleanup on unmount
      stopAllStreams();
    };
  }, [open]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllStreams();
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-lg border border-cyan-500/50 max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-semibold flex items-center gap-2">
            <Scan className="h-5 w-5 text-cyan-400" />
            Scan Barcode
          </h3>
          <Button
            onClick={() => {
              stopAllStreams();
              onClose();
            }}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="relative">
          <div 
            id={scannerId} 
            className="w-full rounded-lg overflow-hidden bg-black"
            style={{ 
              minHeight: '400px', 
              height: '400px',
              width: '100%'
            }}
          />
          
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
              <div className="w-64 h-64 border-2 border-cyan-400 rounded-lg relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-lg"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
              <div className="text-center p-4">
                <p className="text-red-400 text-sm mb-2">{error}</p>
                <Button
                  onClick={() => {
                    setError("");
                    startScanning();
                  }}
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <p className="text-cyan-400/70 text-sm mt-4 text-center">
          Point your camera at the product barcode
        </p>
        
        {scannedProduct && (
          <div className="mt-4 bg-green-600 rounded-lg p-4 border-2 border-white">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-white" />
              <div>
                <p className="text-white font-bold text-lg">{scannedProduct.name}</p>
                <p className="text-white/90 text-sm">${scannedProduct.price.toFixed(2)}</p>
                {currentProduct && currentProduct.id === scannedProduct.id && (
                  <p className="text-yellow-200 text-xs mt-1">Navigating to next item...</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

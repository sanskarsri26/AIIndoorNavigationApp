import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { X, QrCode, CheckCircle2 } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { Product, getProductById, products } from "../lib/products";

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (product: Product) => void;
  currentProduct?: Product | null;
  onNavigateNext?: () => void;
}

export function QRScanner({ open, onClose, onScanSuccess, currentProduct, onNavigateNext }: QRScannerProps) {
  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const scannerId = "qr-scanner-container";

  useEffect(() => {
    if (open) {
      startScanning();
    } else {
      stopScanning();
    }
    
    return () => {
      stopScanning();
    };
  }, [open]);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      
      const qrScanner = new Html5Qrcode(scannerId);
      qrCodeScannerRef.current = qrScanner;
      
      await qrScanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          handleQRScanned(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors
          if (!errorMessage.includes("NotFoundException") && !errorMessage.includes("No QR code")) {
            console.log("QR scan:", errorMessage);
          }
        }
      );
    } catch (error: any) {
      console.error("QR scan error:", error);
      setIsScanning(false);
      
      const errorMsg = error?.message || String(error) || "Unknown error";
      if (errorMsg.includes("Permission") || errorMsg.includes("NotAllowedError")) {
        alert("Camera permission is required for QR scanning. Please enable it in Settings > Privacy > Camera.");
      } else if (errorMsg.includes("NotFoundError") || errorMsg.includes("no devices")) {
        alert("No camera found. Please ensure your device has a camera.");
      } else {
        alert(`Unable to start QR scanner: ${errorMsg}. Please ensure camera is working.`);
      }
      onClose();
    }
  };

  const stopScanning = async () => {
    if (qrCodeScannerRef.current) {
      try {
        await qrCodeScannerRef.current.stop();
        qrCodeScannerRef.current.clear();
      } catch (error) {
        console.error("Error stopping QR scanner:", error);
      }
      qrCodeScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleQRScanned = (qrText: string) => {
    let productId = qrText.trim();
    let price: number | undefined;
    
    try {
      const qrData = JSON.parse(qrText);
      productId = qrData.productId || qrData.id || qrText.trim();
      price = qrData.price;
    } catch {
      productId = qrText.trim();
    }
    
    // Special handling for Diet Coke - check various product IDs and names
    let product = getProductById(productId);
    
    if (!product) {
      const searchTerms = productId.toLowerCase();
      product = products.find(p => 
        p.id === productId || 
        p.name.toLowerCase().includes(searchTerms) ||
        searchTerms.includes(p.name.toLowerCase()) ||
        (searchTerms.includes("coke") && (p.name.toLowerCase().includes("coke") || p.name.toLowerCase().includes("cola"))) ||
        (searchTerms.includes("diet") && p.name.toLowerCase().includes("diet"))
      );
    }
    
    if (product) {
      const productWithPrice = price ? { ...product, price } : product;
      setScannedProduct(productWithPrice);
      onScanSuccess(productWithPrice);
      
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
      
      stopScanning();
    } else {
      alert(`Product not found for QR code: ${productId}\n\nFor testing Diet Coke, use product IDs or names containing "coke" or "diet".`);
      stopScanning();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-lg border border-cyan-500/50 max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-semibold flex items-center gap-2">
            <QrCode className="h-5 w-5 text-cyan-400" />
            Scan QR Code
          </h3>
          <Button
            onClick={() => {
              stopScanning();
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
          <div id={scannerId} className="w-full rounded-lg overflow-hidden bg-black"></div>
          
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-cyan-400 rounded-lg relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-lg"></div>
              </div>
            </div>
          )}
        </div>
        
        <p className="text-cyan-400/70 text-sm mt-4 text-center">
          Point your camera at the product QR code
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


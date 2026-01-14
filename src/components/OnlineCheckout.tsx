import { CreditCard, Apple, X, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Product } from "../lib/products";
import { useState } from "react";

interface OnlineCheckoutProps {
  open: boolean;
  onClose: () => void;
  products: Product[];
  skippedItems: Product[];
}

export function OnlineCheckout({ open, onClose, products, skippedItems }: OnlineCheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<"apple" | "card" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Filter out skipped items from the bill
  const purchasedProducts = products.filter(
    product => !skippedItems.find(skipped => skipped.id === product.id)
  );

  // Calculate totals (only for purchased items)
  const subtotal = purchasedProducts.reduce((sum, product) => sum + product.price, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handlePayment = async (method: "apple" | "card") => {
    setPaymentMethod(method);
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setIsComplete(true);
    
    // Auto-close after showing success
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  const handleClose = () => {
    setPaymentMethod(null);
    setIsProcessing(false);
    setIsComplete(false);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 z-40 transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Modal Sheet */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-black border-t-2 border-cyan-500/50 z-50 transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-cyan-500/50 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 60px)' }}>
          <div className="p-4 pb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white text-lg flex items-center gap-2">
                  {isComplete ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      Payment Successful!
                    </>
                  ) : (
                    "Online Checkout"
                  )}
                </h2>
                <p className="text-cyan-400/70 text-xs mt-1">
                  {isComplete 
                    ? "Your payment has been processed successfully."
                    : "Complete your purchase with a secure payment method."
                  }
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {isComplete ? (
              <div className="py-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-400" />
                  </div>
                </div>
                <div>
                  <p className="text-white text-lg mb-1">Thank you for shopping!</p>
                  <p className="text-cyan-400 text-sm">Your order is ready for pickup at the exit.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Bill Summary */}
                <div className="bg-zinc-900 border border-cyan-500/30 rounded-lg p-4">
                  <h3 className="text-cyan-400 text-sm mb-3">Order Summary</h3>
                  
                  {/* Items */}
                  <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                    {purchasedProducts.map((product) => (
                      <div key={product.id} className="flex justify-between text-sm">
                        <span className="text-white/80">{product.name}</span>
                        <span className="text-white">${product.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Show skipped items info */}
                  {skippedItems.length > 0 && (
                    <div className="mb-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded">
                      <p className="text-orange-400 text-xs">
                        ⚠️ {skippedItems.length} item{skippedItems.length > 1 ? 's' : ''} skipped ({skippedItems.map(p => p.name).join(', ')})
                      </p>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-cyan-500/30 my-3"></div>

                  {/* Totals */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Subtotal</span>
                      <span className="text-white">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Tax (8%)</span>
                      <span className="text-white">${tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-cyan-500/30 my-2"></div>
                    <div className="flex justify-between">
                      <span className="text-white">Total</span>
                      <span className="text-cyan-400 text-lg">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <h3 className="text-cyan-400 text-sm">Select Payment Method</h3>
                  
                  {/* Apple Pay */}
                  <Button
                    onClick={() => handlePayment("apple")}
                    disabled={isProcessing}
                    className="w-full bg-black border-2 border-white text-white hover:bg-zinc-900 h-14 text-base relative overflow-hidden group"
                  >
                    {isProcessing && paymentMethod === "apple" ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Apple className="h-6 w-6" fill="currentColor" />
                        <span>Pay with Apple Pay</span>
                      </div>
                    )}
                  </Button>

                  {/* Credit Card */}
                  <Button
                    onClick={() => handlePayment("card")}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white h-14 text-base border-2 border-cyan-500/50"
                  >
                    {isProcessing && paymentMethod === "card" ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <span>Pay with Card</span>
                      </div>
                    )}
                  </Button>
                </div>

                {/* Info */}
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                  <p className="text-cyan-400 text-xs text-center">
                    💳 Secure checkout powered by Apple Pay & Stripe
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
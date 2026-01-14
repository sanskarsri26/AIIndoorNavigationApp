import { ArrowRight, ChevronLeft, ShoppingCart, Navigation, CheckCircle2, X, MapPin, ArrowLeft, ArrowUp, ArrowDown, Volume2, VolumeX, Box, Plus, Sparkles, CreditCard, Accessibility, Scan } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Product, getProductById } from "../lib/products";
import { useState, useEffect } from "react";

interface NavigationPanelProps {
  currentStep: number;
  totalSteps: number;
  currentProduct: Product | null;
  nextProduct: Product | null;
  isAtCart: boolean;
  isAtCheckout: boolean;
  isAtExit?: boolean;
  currentLocation: { x: number; y: number };
  nextLocation: { x: number; y: number } | null;
  routePath: { x: number; y: number }[]; // Add full route path
  onNext: () => void;
  onPrevious: () => void;
  onStop: () => void;
  onSkip?: (product: Product) => void;
  routeInsights: string[];
  onAddPromotion?: (product: Product) => void;
  onOpenOnlineCheckout?: () => void;
  onScanQR?: () => void;
  shoppingList?: Product[];
}

// Calculate all turn directions from current location following the blue dots
function getPathDirections(
  currentLocation: { x: number; y: number },
  routePath: { x: number; y: number }[]
): string[] {
  if (routePath.length < 2) return [];
  
  // Find current position in path
  const currentIndex = routePath.findIndex(
    (point) => Math.abs(point.x - currentLocation.x) < 10 && Math.abs(point.y - currentLocation.y) < 10
  );
  
  if (currentIndex === -1 || currentIndex >= routePath.length - 1) {
    return [];
  }
  
  const directions: string[] = [];
  let prevDirection: { dx: number; dy: number } | null = null;
  
  // Analyze segments from current position forward
  for (let i = currentIndex; i < Math.min(currentIndex + 10, routePath.length - 1); i++) {
    const current = routePath[i];
    const next = routePath[i + 1];
    
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    
    // Skip very small movements (less than 15 pixels)
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 15) continue;
    
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    
    let direction = "";
    
    // Determine primary movement direction
    if (absX > absY * 1.2) {
      // Horizontal movement
      if (dx > 0) {
        direction = "Turn right";
      } else {
        direction = "Turn left";
      }
    } else if (absY > absX * 1.2) {
      // Vertical movement
      if (dy > 0) {
        direction = "Go down the aisle";
      } else {
        direction = "Go up the aisle";
      }
    } else {
      // Diagonal - choose dominant
      if (absX > absY) {
        direction = dx > 0 ? "Turn right" : "Turn left";
      } else {
        direction = dy > 0 ? "Go down the aisle" : "Go up the aisle";
      }
    }
    
    // Check if this is a reversal of direction
    if (prevDirection) {
      const prevAbsX = Math.abs(prevDirection.dx);
      const prevAbsY = Math.abs(prevDirection.dy);
      
      // If reversing horizontal direction
      if (prevAbsX > prevAbsY && absX > absY) {
        if ((prevDirection.dx > 0 && dx < 0) || (prevDirection.dx < 0 && dx > 0)) {
          direction = "Turn back";
        }
      }
      // If reversing vertical direction
      if (prevAbsY > prevAbsX && absY > absX) {
        if ((prevDirection.dy > 0 && dy < 0) || (prevDirection.dy < 0 && dy > 0)) {
          direction = "Turn back";
        }
      }
    }
    
    // Only add if different from last direction
    if (directions.length === 0 || directions[directions.length - 1] !== direction) {
      directions.push(direction);
    }
    
    prevDirection = { dx, dy };
  }
  
  return directions.slice(0, 5); // Return max 5 upcoming directions
}

// Calculate turn direction based on current and next positions
function getTurnDirection(current: { x: number; y: number }, next: { x: number; y: number }): string {
  const dx = next.x - current.x;
  const dy = next.y - current.y;
  
  // Calculate the primary direction
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  
  // Determine direction based on larger displacement
  if (absX > absY) {
    // Horizontal movement is primary
    if (dx > 0) {
      return "Turn right";
    } else {
      return "Turn left";
    }
  } else {
    // Vertical movement is primary
    if (dy > 0) {
      return "Go down the aisle";
    } else {
      return "Go up the aisle";
    }
  }
}

export function NavigationPanel({
  currentStep,
  totalSteps,
  currentProduct,
  nextProduct,
  isAtCart,
  isAtCheckout,
  isAtExit,
  currentLocation,
  nextLocation,
  routePath,
  onNext,
  onPrevious,
  onStop,
  onSkip,
  routeInsights,
  onAddPromotion,
  onOpenOnlineCheckout,
  onScanQR,
  shoppingList
}: NavigationPanelProps) {
  const progress = (currentStep / totalSteps) * 100;
  const isComplete = currentStep >= totalSteps;
  
  // Get all upcoming turn directions using the actual route path (blue dots)
  const allDirections = getPathDirections(currentLocation, routePath);
  const turnDirection = allDirections.length > 0 ? allDirections[0] : null;
  const upcomingDirections = allDirections.slice(1, 4); // Next 3 directions after current
  
  // State to control audio
  const [isMuted, setIsMuted] = useState(true);
  
  // State to control 3D view
  const [is3DView, setIs3DView] = useState(false);
  
  // State to control ADA-friendly routing
  const [isADAEnabled, setIsADAEnabled] = useState(false);
  
  // Check if currently at Granola (AI suggestion)
  const isAtGranola = currentProduct?.id === "a1-3";
  const dietCokePromo = getProductById("promo1");
  
  // Handler for adding promotion to list
  const handleAddPromotion = () => {
    if (dietCokePromo && onAddPromotion) {
      onAddPromotion(dietCokePromo);
      // Store promotion interaction for brands
      const stored = localStorage.getItem('promotionInteractions') || '[]';
      const interactions = JSON.parse(stored);
      interactions.push({
        promotionProduct: dietCokePromo.name,
        triggerProduct: currentProduct?.name,
        acceptedAt: new Date().toISOString(),
        brand: dietCokePromo.brand
      });
      localStorage.setItem('promotionInteractions', JSON.stringify(interactions));
    }
  };
  
  // Text-to-speech function
  const speakDirection = (text: string) => {
    if ('speechSynthesis' in window && !isMuted) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;
      
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // Effect to announce turn direction when it changes
  useEffect(() => {
    if (turnDirection) {
      speakDirection(turnDirection);
    }
  }, [turnDirection, isMuted]);
  
  return (
    <div className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-lg p-4 shadow-2xl shadow-cyan-500/30 border border-cyan-500/50 overflow-y-auto max-h-[600px] -webkit-overflow-scrolling-touch">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4" />
          <span className="text-sm">Navigation Active</span>
        </div>
        <div className="flex items-center gap-2">
          {/* ADA-Friendly Routing Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsADAEnabled(!isADAEnabled)}
            className={`h-8 w-8 p-0 rounded-full ${
              isADAEnabled ? 'text-green-400 bg-green-500/20 hover:bg-green-500/30' : 'text-white/70 hover:bg-white/20'
            }`}
            title={isADAEnabled ? "ADA-Friendly Route Enabled" : "Enable ADA-Friendly Route"}
          >
            <Accessibility className="h-4 w-4" />
          </Button>
          
          {/* 3D View Toggle - Circular Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIs3DView(!is3DView)}
            className={`h-8 w-8 p-0 rounded-full ${
              is3DView ? 'text-purple-400 bg-purple-500/20 hover:bg-purple-500/30' : 'text-white/70 hover:bg-white/20'
            }`}
            title={is3DView ? "3D View Enabled" : "Enable 3D View"}
          >
            <Box className="h-4 w-4" />
          </Button>
          
          {/* Voice Navigation Toggle - Circular Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className={`h-8 w-8 p-0 rounded-full ${
              isMuted ? 'text-white/70 hover:bg-white/20' : 'text-green-400 bg-green-500/20 hover:bg-green-500/30'
            }`}
            title={isMuted ? "Enable Voice Navigation" : "Voice Navigation Enabled"}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onStop}
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Turn-by-Turn Direction */}
      {turnDirection && !isComplete && (
        <div className="mb-4 space-y-2">
          {/* ADA-Friendly Route Indicator */}
          {isADAEnabled && (
            <div className="bg-green-500/30 border border-green-400/50 rounded-lg p-2 flex items-center gap-2 mb-2">
              <Accessibility className="h-4 w-4 text-green-300" />
              <span className="text-green-100 text-xs">ADA-Friendly Route Active - Using accessible pathways</span>
            </div>
          )}
          
          {/* 3D View Indicator */}
          {is3DView && (
            <div className="bg-purple-500/30 border border-purple-400/50 rounded-lg p-2 flex items-center gap-2">
              <Box className="h-4 w-4 text-purple-300" />
              <span className="text-purple-100 text-xs">3D View Mode - Coming Soon</span>
            </div>
          )}
          
          {/* Current Direction - Large and Prominent */}
          <div className="bg-yellow-500/30 border-2 border-yellow-400/60 rounded-lg p-3">
            <div className="flex items-center gap-3">
              {turnDirection.includes("right") ? (
                <ArrowRight className="h-8 w-8 text-yellow-300" />
              ) : turnDirection.includes("left") || turnDirection.includes("back") ? (
                <ArrowLeft className="h-8 w-8 text-yellow-300" />
              ) : turnDirection.includes("down") ? (
                <ArrowDown className="h-8 w-8 text-yellow-300" />
              ) : (
                <ArrowUp className="h-8 w-8 text-yellow-300" />
              )}
              <div className="flex-1">
                <p className="text-yellow-100 text-xs mb-0.5">Now</p>
                <p className="text-white font-medium">{turnDirection}</p>
              </div>
            </div>
          </div>
          
          {/* Upcoming Directions - Compact List */}
          {upcomingDirections.length > 0 && (
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/70 text-xs mb-2">Then:</p>
              <div className="space-y-1.5">
                {upcomingDirections.map((dir, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 flex-shrink-0">
                      {dir.includes("right") ? (
                        <ArrowRight className="h-4 w-4 text-white/60" />
                      ) : dir.includes("left") || dir.includes("back") ? (
                        <ArrowLeft className="h-4 w-4 text-white/60" />
                      ) : dir.includes("down") ? (
                        <ArrowDown className="h-4 w-4 text-white/60" />
                      ) : (
                        <ArrowUp className="h-4 w-4 text-white/60" />
                      )}
                    </div>
                    <span className="text-white/80">{dir}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/90 text-sm">Progress</span>
          <Badge variant="secondary" className="bg-white/20 text-white border-none text-xs">
            {currentStep} / {totalSteps}
          </Badge>
        </div>
        <Progress value={progress} className="h-2 bg-white/20" />
      </div>
      
      {/* Promotion Banner - Show when at Granola */}
      {isAtGranola && dietCokePromo && (
        <div className="mb-4 animate-pulse">
          <div className="bg-gradient-to-r from-orange-500/30 via-orange-400/30 to-orange-500/30 border-2 border-orange-400/60 rounded-lg p-3 shadow-lg shadow-orange-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-orange-300" />
              <p className="text-orange-100 text-xs">Special Offer</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{dietCokePromo.name} Promotion at {dietCokePromo.aisle}</p>
                <p className="text-orange-200 text-xs mt-0.5">${dietCokePromo.price.toFixed(2)} - Limited time offer!</p>
              </div>
              <Button
                onClick={handleAddPromotion}
                size="sm"
                className="bg-orange-500 hover:bg-orange-400 text-white border-none shadow-md"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add to List
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Current Status */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
        {currentStep === 0 ? (
          // At Entrance
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-3">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-white/80 text-xs mb-1">Current Location</p>
                <p className="text-white">Entrance</p>
              </div>
            </div>
            <div className="pt-3 border-t border-white/20">
              <p className="text-white/80 text-xs mb-1">Next Stop</p>
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <p className="text-white">Pick up shopping cart</p>
              </div>
            </div>
          </div>
        ) : isAtCart ? (
          // At Cart
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/30 rounded-full p-3">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-white/80 text-xs mb-1">Current Location</p>
                <p className="text-white">Cart Area</p>
              </div>
            </div>
            {nextProduct && (
              <div className="pt-3 border-t border-white/20">
                <p className="text-white/80 text-xs mb-1">First Item</p>
                <p className="text-white">{nextProduct.name}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-white/70">Aisle {nextProduct.aisle}</span>
                  <span className="text-white/70">•</span>
                  <span className="text-white/70">{nextProduct.category}</span>
                </div>
              </div>
            )}
          </div>
        ) : isAtCheckout ? (
          // At Checkout
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/30 rounded-full p-3">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-white/80 text-xs mb-1">Current Location</p>
                <p className="text-white">Checkout Counter</p>
              </div>
            </div>
            <div className="pt-3 border-t border-white/20">
              <p className="text-white/80 text-xs mb-1">💳 Online checkout available at the store</p>
              <p className="text-white/70 text-sm mt-1">Use the button below to checkout online, or proceed to exit</p>
            </div>
          </div>
        ) : isAtExit ? (
          // At Exit
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/30 rounded-full p-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-white/80 text-xs mb-1">Current Location</p>
                <p className="text-white">Exit</p>
              </div>
            </div>
            <div className="pt-3 border-t border-white/20">
              <p className="text-green-200">🎉 All items collected!</p>
              <p className="text-white/70 text-sm mt-1">Thank you for shopping!</p>
            </div>
          </div>
        ) : currentProduct ? (
          // At a Product
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500/30 rounded-full p-3">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-white/80 text-xs mb-1">You're at</p>
                <p className="text-white">{currentProduct.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-white/20 text-white border-none text-xs">
                    Aisle {currentProduct.aisle}
                  </Badge>
                  <span className="text-white/70 text-xs">${currentProduct.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
            {nextProduct && (
              <div className="pt-3 border-t border-white/20">
                <p className="text-white/80 text-xs mb-1">Next Item</p>
                <p className="text-white">{nextProduct.name}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-white/70">Aisle {nextProduct.aisle}</span>
                  <span className="text-white/70">•</span>
                  <span className="text-white/70">{nextProduct.category}</span>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
      
      {/* Action Buttons */}
      <div className="space-y-2 mb-4">
        <div className="flex gap-2">
          <Button
            onClick={onPrevious}
            disabled={currentStep === 0}
            variant="ghost"
            className="text-white hover:bg-white/20 disabled:opacity-30"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={onNext}
            className="flex-1 bg-white text-blue-600 hover:bg-white/90"
            size="lg"
          >
            {isComplete ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Complete
              </>
            ) : currentStep === 0 ? (
              <>
                Get Cart
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            ) : isAtExit ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Finish Shopping
              </>
            ) : isAtCheckout ? (
              <>
                Proceed to Exit
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            ) : (
              <>
                Found It! Next
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </div>
        
        {/* Skip Button - Show only when at a product */}
        {currentProduct && onSkip && !isAtCart && !isAtCheckout && !isAtExit && (
          <Button
            onClick={() => onSkip(currentProduct)}
            variant="outline"
            className="w-full bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Skip This Item
          </Button>
        )}
        
        {/* Add Promotion Button - Show only when at a product */}
        {isAtGranola && onAddPromotion && !isAtCart && !isAtCheckout && !isAtExit && (
          <Button
            onClick={handleAddPromotion}
            variant="outline"
            className="w-full bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50"
            size="sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Add Promotion
          </Button>
        )}
        
        {/* Open Online Checkout Button - Show only when at checkout */}
        {isAtCheckout && onOpenOnlineCheckout && (
          <Button
            onClick={onOpenOnlineCheckout}
            variant="outline"
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-green-500/50 text-white hover:text-white shadow-lg shadow-green-500/30"
            size="sm"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Checkout Online
          </Button>
        )}
        
        {/* Scan Barcode Button - Show when navigating */}
        {onScanQR && !isAtCheckout && !isAtExit && (
          <Button
            onClick={onScanQR}
            variant="outline"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 border-cyan-400/50 text-white hover:text-white shadow-lg shadow-cyan-500/30"
            size="sm"
          >
            <Scan className="h-4 w-4 mr-2" />
            Scan Barcode
          </Button>
        )}
      </div>
      
      {/* Route Insights */}
      {routeInsights.length > 0 && (
        <div className="pt-4 border-t border-white/20">
          <p className="text-white/80 text-xs mb-2">Route Info</p>
          <div className="space-y-1">
            {routeInsights.map((insight, index) => (
              <p key={index} className="text-white/90 text-xs">
                {insight}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
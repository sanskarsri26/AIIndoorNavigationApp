import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { StoreMap } from "./components/StoreMap";
import { ProductSearch } from "./components/ProductSearch";
import { ShoppingList } from "./components/ShoppingList";
import { SupermarketMap } from "./components/SupermarketMap";
import { NavigationPanel } from "./components/NavigationPanel";
import { ReportIssueDialog } from "./components/ReportIssueDialog";
import { OnlineCheckout } from "./components/OnlineCheckout";
import { RetailerDashboard } from "./components/RetailerDashboard";
import { CPGDashboard } from "./components/CPGDashboard";
import { LoginPage } from "./components/LoginPage";
import { Product, getProductById } from "./lib/products";
import { optimizeRoute, generateRouteInsights, generateRoutePath } from "./lib/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { Store, List, Navigation, ArrowLeft, Camera, AlertCircle } from "lucide-react";
import { ARNavigation } from "./components/ARNavigation";
import { BarcodeScanner } from "./components/BarcodeScanner";
import { User, getFrequentlyBoughtItems, getPastOrdersForUser } from "./lib/auth";
import { SplashScreen } from "./components/SplashScreen";

type AppScreen = "splash" | "landing" | "login" | "storeSelection" | "shopping" | "retailerDashboard" | "cpgDashboard";
type UserType = "shopper" | "retailer" | "brand" | null;

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("splash");
  const [userType, setUserType] = useState<UserType>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Prevent body scrolling for all views (consistent with landing/login pages)
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
  const [shoppingList, setShoppingList] = useState<Product[]>([]);
  const [checkedProducts, setCheckedProducts] = useState<Set<string>>(new Set());
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [optimizedRoute, setOptimizedRoute] = useState<Product[]>([]);
  const [routeInsights, setRouteInsights] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("search");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [showOnlineCheckout, setShowOnlineCheckout] = useState(false);
  const [showARNavigation, setShowARNavigation] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [selectedStoreName, setSelectedStoreName] = useState("MU P.O.D Market");
  
  // Retailer insights data
  const [requestedItems, setRequestedItems] = useState<Product[]>([]);
  const [skippedItems, setSkippedItems] = useState<Product[]>([]);

  // User's current location (starts at entrance - top right)
  const [currentLocation, setCurrentLocation] = useState({ x: 890, y: 50 });

  // Cart location
  const cartLocation = { x: 735, y: 85 };
  
  // Checkout location (center of checkout counters)
  const checkoutLocation = { x: 445, y: 80 };
  
  // Exit location (top left)
  const exitLocation = { x: 105, y: 50 };

  // Initialize shopping list with AI suggestions based on past orders
  useEffect(() => {
    if (shoppingList.length === 0 && currentScreen === "shopping" && currentUser?.type === "shopper") {
      // Get frequently bought items from past orders
      const frequentItems = getFrequentlyBoughtItems();
      const suggestedProducts: Product[] = [];
      
      // Add frequently bought items as AI suggestions
      frequentItems.forEach(productId => {
        const product = getProductById(productId);
        if (product) {
          suggestedProducts.push(product);
        }
      });
      
      setShoppingList(suggestedProducts);
    }
  }, [currentScreen, currentUser, shoppingList.length]);

  const handleSelectPath = (path: "shopper" | "retailer" | "brand") => {
    setUserType(path);
    // All users need to login now
    setCurrentScreen("login");
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.type === "shopper") {
      setCurrentScreen("shopping");
    } else if (user.type === "retailer") {
      setSelectedStoreName(user.storeName || "MU P.O.D Market");
      setCurrentScreen("retailerDashboard");
    } else if (user.type === "brand") {
      setSelectedStoreName("MU P.O.D Market");
      setCurrentScreen("cpgDashboard");
    }
  };

  const handleBackToLanding = () => {
    setCurrentScreen("landing");
    setUserType(null);
    setCurrentUser(null);
  };
  
  const handleBackToLogin = () => {
    setCurrentScreen("login");
  };

  const handleChangeStore = () => {
    // For retailers and brands, back means logout to landing
    // For others, go to store selection
    if (userType === "retailer" || userType === "brand") {
      setCurrentScreen("landing");
      setUserType(null);
      setCurrentUser(null);
    } else {
      setCurrentScreen("storeSelection");
    }
  };

  const handleSelectStore = (store: any) => {
    setSelectedStoreName(store.name);
    
    // If retailer, show dashboard instead of shopping app
    if (userType === "retailer") {
      setCurrentScreen("retailerDashboard");
    } else if (userType === "brand") {
      setCurrentScreen("cpgDashboard");
    } else {
      setCurrentScreen("shopping");
    }
  };

  const handleBackToShopping = () => {
    if (userType === "retailer") {
      setCurrentScreen("storeSelection");
    } else {
      setCurrentScreen("shopping");
    }
  };

  const addToShoppingList = (product: Product) => {
    if (!shoppingList.find((p) => p.id === product.id)) {
      const updatedList = [...shoppingList, product];
      setShoppingList(updatedList);
      
      // If navigation is active, add product to the route dynamically
      if (isNavigating) {
        // Get remaining products (unchecked + new product)
        const remainingProducts = updatedList.filter(
          p => !checkedProducts.has(p.id)
        );
        
        // Re-optimize the route starting from current location
        const optimized = optimizeRoute(remainingProducts, currentLocation);
        setOptimizedRoute(optimized);
        
        // Regenerate insights
        const insights = generateRouteInsights(optimized, cartLocation);
        setRouteInsights(insights);
        
        // Update current step to reflect the new route
        // We need to recalculate which step we're on in the new route
        if (currentStepIndex > 1) {
          // We're at a product location, find it in the new route
          const currentProductInRoute = optimized.findIndex(
            node => Math.abs(node.position.x - currentLocation.x) < 10 && 
                    Math.abs(node.position.y - currentLocation.y) < 10
          );
          if (currentProductInRoute >= 0) {
            // Set step to this product (+2 for entrance and cart steps)
            setCurrentStepIndex(currentProductInRoute + 2);
          }
        }
      }
    }
  };
  
  const requestOutOfStockItem = (product: Product) => {
    // Add to requested items for retailer insights
    if (!requestedItems.find((p) => p.id === product.id)) {
      setRequestedItems([...requestedItems, product]);
      // Store in localStorage for retailer view
      const stored = localStorage.getItem('requestedItems') || '[]';
      const items = JSON.parse(stored);
      items.push({
        ...product,
        requestedAt: new Date().toISOString(),
        shopperCount: 1
      });
      localStorage.setItem('requestedItems', JSON.stringify(items));
      alert(`Request submitted! We'll notify the store about ${product.name}.`);
    } else {
      alert(`You've already requested ${product.name}.`);
    }
  };

  const removeFromShoppingList = (productId: string) => {
    setShoppingList(shoppingList.filter((p) => p.id !== productId));
    const newChecked = new Set(checkedProducts);
    newChecked.delete(productId);
    setCheckedProducts(newChecked);
  };

  const toggleProductChecked = (productId: string) => {
    const newChecked = new Set(checkedProducts);
    if (newChecked.has(productId)) {
      newChecked.delete(productId);
    } else {
      newChecked.add(productId);
    }
    setCheckedProducts(newChecked);
  };

  const startNavigation = () => {
    if (shoppingList.length === 0) return;

    // Optimize route starting from cart location
    const optimized = optimizeRoute(shoppingList, cartLocation);
    setOptimizedRoute(optimized);
    
    // Generate insights
    const insights = generateRouteInsights(optimized, cartLocation);
    setRouteInsights(insights);
    
    // Reset navigation state
    setCurrentStepIndex(0);
    setIsNavigating(true);
    setActiveTab("map");
    
    // Reset current location to entrance
    setCurrentLocation({ x: 890, y: 50 });
  };

  const handleNextStep = () => {
    if (currentStepIndex === 0) {
      // Moving from entrance to cart
      setCurrentLocation(cartLocation);
      setCurrentStepIndex(1);
    } else if (currentStepIndex === 1) {
      // Moving from cart to first product
      if (optimizedRoute.length > 0) {
        setCurrentLocation(optimizedRoute[0].position);
        setCurrentStepIndex(2);
      }
    } else if (currentStepIndex - 2 < optimizedRoute.length) {
      // Mark previous product as found
      const prevProductIndex = currentStepIndex - 2;
      if (prevProductIndex >= 0 && optimizedRoute[prevProductIndex]) {
        const newChecked = new Set(checkedProducts);
        newChecked.add(optimizedRoute[prevProductIndex].id);
        setCheckedProducts(newChecked);
      }
      
      // Move to next product or checkout
      const nextProductIndex = currentStepIndex - 1;
      if (nextProductIndex < optimizedRoute.length) {
        // Move to next product
        setCurrentLocation(optimizedRoute[nextProductIndex].position);
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        // All products collected, move to checkout
        setCurrentLocation(checkoutLocation);
        setCurrentStepIndex(currentStepIndex + 1);
      }
    } else if (currentStepIndex === optimizedRoute.length + 2) {
      // Move from checkout to exit
      setCurrentLocation(exitLocation);
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Navigation complete
      setIsNavigating(false);
      setCurrentStepIndex(0);
      setActiveTab("list");
    }
  };
  
  const handleSkipItem = (product: Product) => {
    // Add to skipped items for retailer insights
    const newSkippedItems = [...skippedItems];
    if (!skippedItems.find((p) => p.id === product.id)) {
      newSkippedItems.push(product);
      setSkippedItems(newSkippedItems);
      
      // Store in localStorage for retailer/brand view
      const stored = localStorage.getItem('skippedItems') || '[]';
      const items = JSON.parse(stored);
      items.push({
        ...product,
        skippedAt: new Date().toISOString(),
        shopperCount: 1,
        reason: product.id === 'd1' ? 'Out of stock' : 'Item not found' // Hardcoded for milk
      });
      localStorage.setItem('skippedItems', JSON.stringify(items));
    }
    
    // Mark as skipped (not found) - add to checked so it doesn't show in route
    const newChecked = new Set(checkedProducts);
    newChecked.add(product.id);
    setCheckedProducts(newChecked);
    
    // Continue to next item
    handleNextStep();
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      if (currentStepIndex === 1) {
        // Go back to entrance
        setCurrentLocation({ x: 890, y: 50 });
      } else if (currentStepIndex <= optimizedRoute.length) {
        // Go back to previous product
        setCurrentLocation(optimizedRoute[currentStepIndex - 2].position);
      } else {
        // Go back from checkout to last product
        setCurrentLocation(optimizedRoute[optimizedRoute.length - 1].position);
      }
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setCurrentStepIndex(0);
    setCurrentLocation({ x: 890, y: 50 });
  };

  // Generate full route path including entrance -> cart -> products -> checkout
  const fullRoutePath = isNavigating
    ? generateRoutePath(optimizedRoute, { x: 890, y: 50 }, cartLocation)
    : [];

  // Show splash screen
  if (currentScreen === "splash") {
    return <SplashScreen onComplete={() => setCurrentScreen("landing")} />;
  }

  // Show landing page
  if (currentScreen === "landing") {
    return <LandingPage onSelectPath={handleSelectPath} />;
  }

  // Show login page
  if (currentScreen === "login" && userType) {
    return (
      <LoginPage
        userType={userType}
        onBack={handleBackToLanding}
        onLogin={handleLogin}
      />
    );
  }

  // Show store selection
  if (currentScreen === "storeSelection") {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-0 sm:p-4 overflow-hidden" style={{ touchAction: 'none' }}>
        <div className="w-full h-screen sm:h-auto sm:max-w-md bg-black sm:rounded-3xl shadow-2xl shadow-cyan-500/20 border border-cyan-500/30 overflow-hidden" style={{ height: '812px' }}>
          <div className="h-full overflow-y-auto overflow-x-hidden">
            <div className="p-4">
              <StoreMap onSelectStore={handleSelectStore} onBack={handleBackToShopping} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show retailer dashboard
  if (currentScreen === "retailerDashboard") {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-4 overflow-hidden" style={{ touchAction: 'none' }}>
        <div className="w-full max-w-md bg-black rounded-3xl shadow-2xl shadow-cyan-500/20 border border-cyan-500/30 overflow-hidden" style={{ height: '812px' }}>
          <div className="h-full overflow-y-auto overflow-x-hidden">
            <RetailerDashboard 
              onBack={handleChangeStore}
              storeName={selectedStoreName}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show CPG dashboard
  if (currentScreen === "cpgDashboard") {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-4 overflow-hidden" style={{ touchAction: 'none' }}>
        <div className="w-full max-w-md bg-black rounded-3xl shadow-2xl shadow-purple-500/20 border border-purple-500/30 overflow-hidden" style={{ height: '812px' }}>
          <div className="h-full overflow-y-auto overflow-x-hidden">
            <CPGDashboard 
              onBack={handleChangeStore}
              storeName={selectedStoreName}
              brandName={currentUser?.brandName}
            />
          </div>
        </div>
      </div>
    );
  }

  // Show shopping app
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-0 sm:p-4 overflow-hidden" style={{ touchAction: 'none' }}>
      <div className="w-full h-screen sm:h-auto sm:max-w-md bg-black sm:rounded-3xl shadow-2xl shadow-cyan-500/20 border border-cyan-500/30 overflow-hidden relative flex flex-col" style={{ height: '812px' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-black via-cyan-950 to-black border-b-2 border-cyan-500 text-white p-6 pb-8 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 flex-1">
              <Store className="h-8 w-8 text-cyan-400" />
              <div className="flex-1">
                <h1 className="text-white">{selectedStoreName}</h1>
                <p className="text-cyan-300 text-sm">1290 S Normal Ave</p>
              </div>
            </div>
            <Button
              onClick={handleBackToLanding}
              variant="ghost"
              size="sm"
              className="text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-cyan-500/10 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/20 hover:border-cyan-400 text-xs flex-1"
              onClick={handleChangeStore}
            >
              Change Store
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-cyan-500/10 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/20 hover:border-cyan-400 text-xs flex-1"
            >
              Create Account
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-black">
          <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 bg-zinc-900 border border-cyan-500/30">
              <TabsTrigger value="search" className="text-xs data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
                <Store className="h-4 w-4 mr-1" />
                Search
              </TabsTrigger>
              <TabsTrigger value="list" className="text-xs data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
                <List className="h-4 w-4 mr-1" />
                List ({shoppingList.length})
              </TabsTrigger>
              <TabsTrigger value="map" className="text-xs data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
                <Navigation className="h-4 w-4 mr-1" />
                Map
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="mt-0">
              <ProductSearch
                onAddProduct={addToShoppingList}
                onRequestOutOfStock={requestOutOfStockItem}
                selectedProducts={shoppingList}
              />
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              <ShoppingList
                products={shoppingList}
                checkedProducts={checkedProducts}
                onRemoveProduct={removeFromShoppingList}
                onToggleChecked={toggleProductChecked}
                onStartNavigation={startNavigation}
                onAddProduct={addToShoppingList}
              />
            </TabsContent>

            <TabsContent value="map" className="mt-0">
              <div className="space-y-4">
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setShowARNavigation(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/50"
                    size="lg"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Open AR Navigation
                  </Button>
                  
                  <Button
                    onClick={() => setReportDialogOpen(true)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/50"
                    size="lg"
                  >
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Report Issue
                  </Button>
                </div>
                
                {/* Map with Legend */}
                <SupermarketMap
                  selectedProducts={isNavigating ? optimizedRoute : shoppingList}
                  currentLocation={currentLocation}
                  route={fullRoutePath}
                  showHeatmap={false}
                />

                {/* Navigation Panel */}
                {isNavigating ? (
                  <NavigationPanel
                    currentStep={currentStepIndex}
                    totalSteps={optimizedRoute.length + 3} // +3 for cart, checkout, and exit
                    currentProduct={
                      currentStepIndex === 0
                        ? null
                        : currentStepIndex === 1
                        ? null
                        : currentStepIndex <= optimizedRoute.length + 1
                        ? optimizedRoute[currentStepIndex - 2]
                        : null
                    }
                    nextProduct={
                      currentStepIndex === 0
                        ? null
                        : currentStepIndex < optimizedRoute.length + 1
                        ? optimizedRoute[currentStepIndex - 1]
                        : null
                    }
                    isAtCart={currentStepIndex === 1}
                    isAtCheckout={currentStepIndex === optimizedRoute.length + 2}
                    isAtExit={currentStepIndex === optimizedRoute.length + 3}
                    currentLocation={currentLocation}
                    nextLocation={
                      currentStepIndex === 0
                        ? cartLocation
                        : currentStepIndex === 1 && optimizedRoute.length > 0
                        ? optimizedRoute[0].position
                        : currentStepIndex < optimizedRoute.length + 1 && currentStepIndex > 1
                        ? optimizedRoute[currentStepIndex - 1].position
                        : currentStepIndex === optimizedRoute.length + 1
                        ? checkoutLocation
                        : currentStepIndex === optimizedRoute.length + 2
                        ? exitLocation
                        : null
                    }
                    routePath={fullRoutePath}
                    onNext={handleNextStep}
                    onPrevious={handlePreviousStep}
                    onStop={stopNavigation}
                    onSkip={handleSkipItem}
                    onAddPromotion={addToShoppingList}
                    routeInsights={routeInsights}
                    onOpenOnlineCheckout={() => setShowOnlineCheckout(true)}
                    onScanQR={() => setShowBarcodeScanner(true)}
                    shoppingList={shoppingList}
                  />
                ) : (
                  <div className="text-center py-8 text-cyan-400/50">
                    <Navigation className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Add items to your list and start navigation</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
          </div>
        </div>
        
        {/* Online Checkout Dialog - Inside mobile frame */}
        <OnlineCheckout
          open={showOnlineCheckout}
          onClose={() => setShowOnlineCheckout(false)}
          products={shoppingList}
          skippedItems={skippedItems}
        />
      </div>
      
      {/* Report Issue Dialog */}
      <ReportIssueDialog 
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
      />
      
      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        open={showBarcodeScanner}
        onClose={() => {
          setShowBarcodeScanner(false);
          // Reopen AR if it was open before
          if (showARNavigation && isNavigating) {
            // AR will restart automatically when component remounts
          }
        }}
        onScanSuccess={addToShoppingList}
        currentProduct={
          currentStepIndex === 0
            ? null
            : currentStepIndex === 1
            ? null
            : currentStepIndex <= optimizedRoute.length + 1
            ? optimizedRoute[currentStepIndex - 2]
            : null
        }
        onNavigateNext={handleNextStep}
      />
      
      {/* AR Navigation - Only show when barcode scanner is not open */}
      {showARNavigation && isNavigating && !showBarcodeScanner && (
        <ARNavigation
          currentLocation={currentLocation}
          nextLocation={
            currentStepIndex === 0
              ? cartLocation
              : currentStepIndex === 1 && optimizedRoute.length > 0
              ? optimizedRoute[0].position
              : currentStepIndex < optimizedRoute.length + 1 && currentStepIndex > 1
              ? optimizedRoute[currentStepIndex - 1].position
              : currentStepIndex === optimizedRoute.length + 1
              ? checkoutLocation
              : currentStepIndex === optimizedRoute.length + 2
              ? exitLocation
              : null
          }
          currentProduct={
            currentStepIndex === 0
              ? null
              : currentStepIndex === 1
              ? null
              : currentStepIndex <= optimizedRoute.length + 1
              ? optimizedRoute[currentStepIndex - 2]
              : null
          }
          nextProduct={
            currentStepIndex === 0
              ? null
              : currentStepIndex < optimizedRoute.length + 1
              ? optimizedRoute[currentStepIndex - 1]
              : null
          }
          routePath={fullRoutePath}
          onClose={() => {
            setShowARNavigation(false);
            // Ensure we're still on shopping screen with navigation active
            if (currentScreen !== "shopping") {
              setCurrentScreen("shopping");
            }
            // Ensure navigation is still active
            if (!isNavigating && shoppingList.length > 0) {
              setIsNavigating(true);
            }
          }}
          onAddPromotion={addToShoppingList}
          onAddProduct={addToShoppingList}
          onNavigateNext={handleNextStep}
          onOpenBarcodeScanner={() => setShowBarcodeScanner(true)}
          shoppingList={shoppingList}
          isRetailerMode={userType === "retailer"}
        />
      )}
    </div>
  );
}

export default App;
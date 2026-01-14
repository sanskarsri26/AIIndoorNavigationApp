import { Button } from "./ui/button";
import { ArrowLeft, AlertTriangle, Package, MapPin, Droplet, Bell, BarChart3, Ghost, DollarSign, Radio } from "lucide-react";
import { useState, useEffect } from "react";
import { HeatmapAnalytics } from "./HeatmapAnalytics";
import { getVirtualBeacons, addVirtualBeacon, removeVirtualBeacon, VirtualBeacon } from "../lib/virtual-beacons";
import { products } from "../lib/products";

interface RetailerDashboardProps {
  onBack: () => void;
  storeName: string;
}

type LogView = "overview" | "lowStock" | "outOfStock" | "misplaced" | "spills" | "analytics" | "ghostInventory" | "revenue" | "beacons";

export function RetailerDashboard({ onBack, storeName }: RetailerDashboardProps) {
  const [currentView, setCurrentView] = useState<LogView>("overview");
  
  // Format time ago helper (defined before use)
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };
  
  // State for all items
  const [lowStockItems, setLowStockItems] = useState([
    {
      id: "1",
      name: "Gold Medal Apple Juice",
      currentStock: 5,
      minStock: 15,
      location: "Aisle 3",
      category: "Beverages",
    },
  ]);
  
  const [outOfStockItems, setOutOfStockItems] = useState<Array<{
    id: string;
    name: string;
    requests: number;
    location: string;
    lastRequested: string;
  }>>([
    {
      id: "snapple-juice",
      name: "Snapple Juice",
      requests: 3,
      location: "Aisle 4",
      lastRequested: "Just now",
    },
  ]);
  
  const [misplacedItems, setMisplacedItems] = useState<Array<{
    id: string;
    name: string;
    currentLocation: string;
    correctLocation: string;
    reportedBy: string;
    timeReported: string;
  }>>([]);
  
  // Load virtual beacons when view changes to beacons
  useEffect(() => {
    if (currentView === "beacons") {
      const beacons = getVirtualBeacons();
      setVirtualBeacons(beacons);
    }
  }, [currentView]);

  // Load data from localStorage on mount and when view changes
  useEffect(() => {
    // Load requested items (out of stock)
    const storedRequests = localStorage.getItem('requestedItems');
    if (storedRequests) {
      try {
        const requests = JSON.parse(storedRequests);
        const grouped = requests.reduce((acc: any, item: any) => {
          const existing = acc.find((i: any) => i.name === item.name);
          if (existing) {
            existing.requests++;
            if (new Date(item.requestedAt) > new Date(existing.lastRequested)) {
              existing.lastRequested = item.requestedAt;
            }
          } else {
            acc.push({
              id: item.id || `req-${Date.now()}-${Math.random()}`,
              name: item.name,
              requests: 1,
              location: item.aisle || item.section || "Unknown",
              lastRequested: item.requestedAt || new Date().toISOString(),
            });
          }
          return acc;
        }, []);
        
        // Format lastRequested times
        const formatted = grouped.map((item: any) => ({
          ...item,
          lastRequested: formatTimeAgo(item.lastRequested)
        }));
        
        // Merge with default Snapple Juice item if not already present
        const snappleExists = formatted.find((item: any) => item.name === "Snapple Juice");
        if (!snappleExists) {
          formatted.unshift({
            id: "snapple-juice",
            name: "Snapple Juice",
            requests: 3,
            location: "Aisle 4",
            lastRequested: "Just now",
          });
        }
        
        setOutOfStockItems(formatted);
      } catch (e) {
        console.error("Error parsing requestedItems:", e);
      }
    } else {
      // If no localStorage data, keep the default Snapple Juice item
      setOutOfStockItems([
        {
          id: "snapple-juice",
          name: "Snapple Juice",
          requests: 3,
          location: "Aisle 4",
          lastRequested: "Just now",
        },
      ]);
    }
    
    // Load skipped items (misplaced/not found)
    const storedSkipped = localStorage.getItem('skippedItems');
    if (storedSkipped) {
      try {
        const skipped = JSON.parse(storedSkipped);
        const formatted = skipped.map((item: any, index: number) => ({
          id: item.id || `skip-${Date.now()}-${index}`,
          name: item.name,
          currentLocation: item.reason?.includes("not found") ? "Unknown" : item.aisle || "Unknown",
          correctLocation: item.aisle || item.section || "Unknown",
          reportedBy: "Customer",
          timeReported: formatTimeAgo(item.skippedAt || new Date().toISOString()),
        }));
        setMisplacedItems(formatted);
      } catch (e) {
        console.error("Error parsing skippedItems:", e);
      }
    }
  }, [currentView]);
  
  // Ghost inventory detection (items that should be in stock but aren't found)
  const [ghostInventory, setGhostInventory] = useState([
    {
      id: "1",
      name: "Milk",
      expectedLocation: "Dairy Section",
      lastSeen: "3 days ago",
      expectedStock: 24,
      detectedStock: 0,
      discrepancy: "Item not found in expected location",
    },
    {
      id: "2",
      name: "Paper Towels",
      expectedLocation: "Aisle 8",
      lastSeen: "2 days ago",
      expectedStock: 12,
      detectedStock: 0,
      discrepancy: "Shelf appears empty but inventory shows stock",
    },
  ]);

  const [spillsHazards, setSpillsHazards] = useState([
    {
      id: "1",
      item: "Sprite Soda Can",
      location: "Aisle 7",
      timeReported: "30 minutes ago",
      isFixed: false,
      severity: "medium" as const,
    },
  ]);

  // Virtual Beacons state (must be at top level for React hooks)
  const [virtualBeacons, setVirtualBeacons] = useState<VirtualBeacon[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [beaconName, setBeaconName] = useState("");
  const [beaconPosition, setBeaconPosition] = useState({ x: 0, y: 1.5, z: -2 });

  const getStockColor = (current: number, min: number) => {
    const percentage = (current / min) * 100;
    if (percentage <= 33) return "text-red-500";
    if (percentage <= 66) return "text-yellow-500";
    return "text-green-500";
  };

  const getSeverityColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "low":
        return "bg-yellow-500/20 border-yellow-500/50 text-yellow-400";
      case "medium":
        return "bg-orange-500/20 border-orange-500/50 text-orange-400";
      case "high":
        return "bg-red-500/20 border-red-500/50 text-red-400";
    }
  };

  if (currentView === "lowStock") {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4 rounded-xl">
          <Button
            onClick={() => setCurrentView("overview")}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 mb-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h2 className="text-xl">Low Stock Items</h2>
          <p className="text-cyan-100 text-sm">Items running low on inventory</p>
        </div>

        {/* Low Stock List */}
        <div className="space-y-3">
          {lowStockItems.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900 border border-cyan-500/30 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white">{item.name}</h3>
                  <p className="text-cyan-400/70 text-sm">{item.location}</p>
                </div>
                <Package className="h-5 w-5 text-yellow-500" />
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-cyan-400/70">Current Stock</p>
                  <p className={`${getStockColor(item.currentStock, item.minStock)}`}>
                    {item.currentStock} packs
                  </p>
                </div>
                <div>
                  <p className="text-xs text-cyan-400/70">Min Stock</p>
                  <p className="text-white text-sm">{item.minStock} packs</p>
                </div>
              </div>

              <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 mb-3">
                <p className="text-yellow-400 text-xs">⚠️ Restock needed soon</p>
              </div>
              
              {/* Action Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setLowStockItems(lowStockItems.filter(i => i.id !== item.id));
                  alert(`${item.name} marked as refilled!`);
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                ✓ Refilled
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentView === "outOfStock") {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4 rounded-xl">
          <Button
            onClick={() => setCurrentView("overview")}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 mb-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h2 className="text-xl">Out of Stock Items</h2>
          <p className="text-cyan-100 text-sm">Customer requests for unavailable items</p>
        </div>

        {/* Out of Stock List */}
        <div className="space-y-3">
          {outOfStockItems.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900 border border-red-500/30 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white">{item.name}</h3>
                  <p className="text-cyan-400/70 text-sm">{item.location}</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div>
                  <p className="text-xs text-cyan-400/70">Customer Requests</p>
                  <p className="text-red-400 text-sm">{item.requests} request</p>
                </div>
                <div>
                  <p className="text-xs text-cyan-400/70">Last Requested</p>
                  <p className="text-white text-sm">{item.lastRequested}</p>
                </div>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 mb-3">
                <p className="text-red-400 text-xs">🚨 Currently out of stock</p>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Order placed for ${item.name}!`);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  📦 Place Order
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Remove from list
                    setOutOfStockItems(outOfStockItems.filter(i => i.id !== item.id));
                    // Remove from localStorage
                    const stored = localStorage.getItem('requestedItems') || '[]';
                    const items = JSON.parse(stored);
                    const filtered = items.filter((i: any) => i.name !== item.name);
                    localStorage.setItem('requestedItems', JSON.stringify(filtered));
                    alert(`${item.name} marked as refilled!`);
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  ✓ Refilled
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentView === "misplaced") {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4 rounded-xl">
          <Button
            onClick={() => setCurrentView("overview")}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 mb-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h2 className="text-xl">Misplaced Items</h2>
          <p className="text-cyan-100 text-sm">Items found in incorrect locations</p>
        </div>

        {/* Misplaced Items List */}
        <div className="space-y-3">
          {misplacedItems.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900 border border-cyan-500/30 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white">{item.name}</h3>
                  <p className="text-cyan-400/70 text-sm">Reported by {item.reportedBy}</p>
                </div>
                <MapPin className="h-5 w-5 text-orange-500" />
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-cyan-400/70">Current Location</p>
                  <p className="text-red-400 text-sm">{item.currentLocation}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-cyan-400/70">Correct Location</p>
                  <p className="text-green-400 text-sm">{item.correctLocation}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-cyan-400/70">Time Reported</p>
                  <p className="text-white text-sm">{item.timeReported}</p>
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 mb-3">
                <p className="text-orange-400 text-xs">📦 Needs relocation</p>
              </div>
              
              {/* Action Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  // Remove from list
                  setMisplacedItems(misplacedItems.filter(i => i.id !== item.id));
                  // Remove from localStorage
                  const stored = localStorage.getItem('skippedItems') || '[]';
                  const items = JSON.parse(stored);
                  const filtered = items.filter((i: any) => i.name !== item.name);
                  localStorage.setItem('skippedItems', JSON.stringify(filtered));
                  alert(`${item.name} marked as fixed!`);
                }}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                ✓ Fixed
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentView === "spills") {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4 rounded-xl">
          <Button
            onClick={() => setCurrentView("overview")}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 mb-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h2 className="text-xl">Spills & Hazards</h2>
          <p className="text-cyan-100 text-sm">Safety incidents requiring attention</p>
        </div>

        {/* Spills/Hazards List */}
        <div className="space-y-3">
          {spillsHazards.map((incident) => (
            <div
              key={incident.id}
              className="bg-zinc-900 border border-cyan-500/30 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white">Spill - {incident.item}</h3>
                  <p className="text-cyan-400/70 text-sm">{incident.location}</p>
                </div>
                <Droplet className="h-5 w-5 text-blue-500" />
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-cyan-400/70">Time Reported</p>
                  <p className="text-white text-sm">{incident.timeReported}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-cyan-400/70">Status</p>
                  <p className={`text-sm ${incident.isFixed ? "text-green-400" : "text-red-400"}`}>
                    {incident.isFixed ? "✓ Fixed" : "⚠ Not Fixed"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-cyan-400/70">Severity</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(
                      incident.severity
                    )}`}
                  >
                    {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                  </span>
                </div>
              </div>

              {!incident.isFixed && (
                <>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 mb-3">
                    <p className="text-red-400 text-xs">🚨 Requires immediate attention</p>
                  </div>
                  
                  {/* Action Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSpillsHazards(spillsHazards.filter(i => i.id !== incident.id));
                      alert(`Spill at ${incident.location} marked as fixed!`);
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    ✓ Fixed
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentView === "analytics") {
    return (
      <HeatmapAnalytics
        onBack={() => setCurrentView("overview")}
        storeName={storeName}
      />
    );
  }

  if (currentView === "revenue") {
    // Dummy revenue data
    const revenueData = {
      today: 12450.75,
      yesterday: 11890.50,
      thisWeek: 87230.25,
      lastWeek: 84560.00,
      thisMonth: 342180.50,
      lastMonth: 318950.75,
      onlinePayments: 45680.25,
      onlinePaymentsThisMonth: 234560.00,
      transactions: {
        today: 234,
        yesterday: 221,
        thisWeek: 1645,
        lastWeek: 1589,
      },
      averageBasket: {
        today: 53.15,
        yesterday: 53.80,
        thisWeek: 53.02,
        lastWeek: 53.25,
      }
    };
    
    const revenueChange = ((revenueData.today - revenueData.yesterday) / revenueData.yesterday * 100).toFixed(1);
    const weekChange = ((revenueData.thisWeek - revenueData.lastWeek) / revenueData.lastWeek * 100).toFixed(1);
    const monthChange = ((revenueData.thisMonth - revenueData.lastMonth) / revenueData.lastMonth * 100).toFixed(1);
    
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4 rounded-xl">
          <Button
            onClick={() => setCurrentView("overview")}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 mb-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h2 className="text-xl">Revenue & Sales</h2>
          <p className="text-cyan-100 text-sm">Online payment system revenue tracking</p>
        </div>
        
        {/* Revenue Overview Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <p className="text-cyan-400/70 text-xs">Today</p>
            </div>
            <p className="text-white text-2xl font-bold">${revenueData.today.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className={`text-xs mt-1 ${parseFloat(revenueChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(revenueChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(revenueChange))}% vs yesterday
            </p>
          </div>
          
          <div className="bg-zinc-900 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <p className="text-cyan-400/70 text-xs">This Week</p>
            </div>
            <p className="text-white text-2xl font-bold">${revenueData.thisWeek.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className={`text-xs mt-1 ${parseFloat(weekChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(weekChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(weekChange))}% vs last week
            </p>
          </div>
        </div>
        
        {/* Monthly Revenue */}
        <div className="bg-zinc-900 border border-cyan-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-cyan-400/70 text-sm mb-1">This Month</p>
              <p className="text-white text-3xl font-bold">${revenueData.thisMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-semibold ${parseFloat(monthChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {parseFloat(monthChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(monthChange))}%
              </p>
              <p className="text-cyan-400/70 text-xs">vs last month</p>
            </div>
          </div>
        </div>
        
        {/* Online Payments Section */}
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-5 w-5 text-green-400" />
            <h3 className="text-white font-semibold">Online Payment System</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-cyan-400/70 text-xs mb-1">Today (Online)</p>
              <p className="text-white text-xl font-bold">${revenueData.onlinePayments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-cyan-400/70 text-xs mb-1">This Month (Online)</p>
              <p className="text-white text-xl font-bold">${revenueData.onlinePaymentsThisMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
          
          <div className="bg-zinc-900/50 rounded-lg p-3">
            <p className="text-green-400 text-xs">
              💳 {revenueData.transactions.today} online transactions today
            </p>
            <p className="text-cyan-400/70 text-xs mt-1">
              Average basket: ${revenueData.averageBasket.today}
            </p>
          </div>
        </div>
        
        {/* Transaction Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 border border-cyan-500/30 rounded-xl p-4">
            <p className="text-cyan-400/70 text-xs mb-1">Transactions (Today)</p>
            <p className="text-white text-2xl font-bold">{revenueData.transactions.today}</p>
            <p className="text-cyan-400/70 text-xs mt-1">vs {revenueData.transactions.yesterday} yesterday</p>
          </div>
          
          <div className="bg-zinc-900 border border-cyan-500/30 rounded-xl p-4">
            <p className="text-cyan-400/70 text-xs mb-1">Avg Basket Size</p>
            <p className="text-white text-2xl font-bold">${revenueData.averageBasket.today}</p>
            <p className="text-cyan-400/70 text-xs mt-1">vs ${revenueData.averageBasket.yesterday} yesterday</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "ghostInventory") {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4 rounded-xl">
          <Button
            onClick={() => setCurrentView("overview")}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 mb-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h2 className="text-xl">Ghost Inventory Detection</h2>
          <p className="text-cyan-100 text-sm">Items that should be in stock but aren't found</p>
        </div>

        {/* Ghost Inventory List */}
        <div className="space-y-3">
          {ghostInventory.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900 border border-orange-500/30 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white">{item.name}</h3>
                  <p className="text-cyan-400/70 text-sm">{item.expectedLocation}</p>
                </div>
                <Ghost className="h-5 w-5 text-orange-500" />
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-cyan-400/70">Expected Stock</p>
                  <p className="text-white text-sm">{item.expectedStock} units</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-cyan-400/70">Detected Stock</p>
                  <p className="text-red-400 text-sm">{item.detectedStock} units</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-cyan-400/70">Last Seen</p>
                  <p className="text-white text-sm">{item.lastSeen}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-cyan-400/70">Discrepancy</p>
                  <p className="text-orange-400 text-sm text-right">{item.discrepancy}</p>
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 mb-3">
                <p className="text-orange-400 text-xs">👻 Possible ghost inventory - needs investigation</p>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Investigation started for ${item.name}`);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  🔍 Investigate
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGhostInventory(ghostInventory.filter(i => i.id !== item.id));
                    alert(`${item.name} marked as found and restocked!`);
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  ✓ Resolved
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Virtual Beacons Management View
  if (currentView === "beacons") {
    const handlePlaceBeacon = () => {
      if (!beaconName.trim()) {
        alert("Please enter a beacon name");
        return;
      }
      
      // Validate position values
      if (isNaN(beaconPosition.x) || isNaN(beaconPosition.y) || isNaN(beaconPosition.z)) {
        alert("Please enter valid position coordinates");
        return;
      }
      
      // Find product position if product selected
      let mapPos = { x: 0, y: 0 };
      if (selectedProduct) {
        const product = products.find(p => p.id === selectedProduct);
        if (product) {
          mapPos = product.position;
        }
      }
      
      try {
        const newBeacon = addVirtualBeacon({
          name: beaconName.trim(),
          productId: selectedProduct || undefined,
          worldPosition: {
            x: parseFloat(beaconPosition.x.toString()) || 0,
            y: parseFloat(beaconPosition.y.toString()) || 1.5,
            z: parseFloat(beaconPosition.z.toString()) || -2
          },
          mapPosition: mapPos,
          placedBy: "retailer"
        });
        
        // Reload beacons from storage to ensure consistency
        const updatedBeacons = getVirtualBeacons();
        setVirtualBeacons(updatedBeacons);
        
        // Reset form
        setBeaconName("");
        setSelectedProduct("");
        setBeaconPosition({ x: 0, y: 1.5, z: -2 });
        
        alert(`Beacon "${newBeacon.name}" placed successfully at (${newBeacon.worldPosition.x.toFixed(1)}, ${newBeacon.worldPosition.y.toFixed(1)}, ${newBeacon.worldPosition.z.toFixed(1)})m!`);
      } catch (error) {
        console.error("Error placing beacon:", error);
        alert("Failed to place beacon. Please try again.");
      }
    };
    
    const handleRemoveBeacon = (beaconId: string) => {
      try {
        removeVirtualBeacon(beaconId);
        // Reload beacons from storage
        const updatedBeacons = getVirtualBeacons();
        setVirtualBeacons(updatedBeacons);
      } catch (error) {
        console.error("Error removing beacon:", error);
        alert("Failed to remove beacon. Please try again.");
      }
    };
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Button
            onClick={() => setCurrentView("overview")}
            variant="ghost"
            size="sm"
            className="text-cyan-400 hover:bg-cyan-500/20"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h2 className="text-white text-xl font-semibold">Virtual Beacons</h2>
        </div>
        
        {/* Place New Beacon */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handlePlaceBeacon();
          }}
          className="bg-zinc-900 border border-cyan-500/30 rounded-xl p-4 space-y-4"
        >
          <h3 className="text-white font-semibold">Place New Beacon</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-cyan-400 text-sm mb-1 block">Beacon Name</label>
              <input
                type="text"
                value={beaconName}
                onChange={(e) => setBeaconName(e.target.value)}
                placeholder="e.g., Aisle 3 - Cereal Section"
                className="w-full bg-zinc-800 border border-cyan-500/30 rounded-lg px-3 py-2 text-white placeholder-zinc-500"
              />
            </div>
            
            <div>
              <label className="text-cyan-400 text-sm mb-1 block">Associate with Product (Optional)</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full bg-zinc-800 border border-cyan-500/30 rounded-lg px-3 py-2 text-white"
              >
                <option value="">None</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-cyan-400 text-sm mb-1 block">X (meters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={beaconPosition.x}
                  onChange={(e) => setBeaconPosition({ ...beaconPosition, x: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-800 border border-cyan-500/30 rounded-lg px-2 py-1 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-cyan-400 text-sm mb-1 block">Y (height)</label>
                <input
                  type="number"
                  step="0.1"
                  value={beaconPosition.y}
                  onChange={(e) => setBeaconPosition({ ...beaconPosition, y: parseFloat(e.target.value) || 1.5 })}
                  className="w-full bg-zinc-800 border border-cyan-500/30 rounded-lg px-2 py-1 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-cyan-400 text-sm mb-1 block">Z (depth)</label>
                <input
                  type="number"
                  step="0.1"
                  value={beaconPosition.z}
                  onChange={(e) => setBeaconPosition({ ...beaconPosition, z: parseFloat(e.target.value) || -2 })}
                  className="w-full bg-zinc-800 border border-cyan-500/30 rounded-lg px-2 py-1 text-white text-sm"
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
            >
              <Radio className="h-4 w-4 mr-2" />
              Place Beacon
            </Button>
          </div>
        </form>
        
        {/* Existing Beacons */}
        <div className="bg-zinc-900 border border-cyan-500/30 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">Placed Beacons ({virtualBeacons.length})</h3>
          <div className="space-y-2">
            {virtualBeacons.length === 0 ? (
              <p className="text-zinc-400 text-sm">No beacons placed yet</p>
            ) : (
              virtualBeacons.map(beacon => (
                <div
                  key={beacon.id}
                  className="bg-zinc-800 border border-cyan-500/20 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">{beacon.name}</p>
                    <p className="text-cyan-400/70 text-xs">
                      Position: ({beacon.worldPosition.x.toFixed(1)}, {beacon.worldPosition.y.toFixed(1)}, {beacon.worldPosition.z.toFixed(1)})m
                    </p>
                    {beacon.productId && (
                      <p className="text-zinc-400 text-xs">
                        Product: {products.find(p => p.id === beacon.productId)?.name || beacon.productId}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleRemoveBeacon(beacon.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:bg-red-500/20"
                  >
                    Remove
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Overview Dashboard
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4 rounded-xl">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 mb-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-xl">Retailer Dashboard</h2>
        <p className="text-cyan-100 text-sm">{storeName}</p>
      </div>

      {/* Alert Notification - Snapple Juice */}
      <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-red-400" />
          <div className="flex-1">
            <p className="text-red-400 text-sm">
              <span className="font-semibold">Snapple Juice</span> out of stock detected by 3 customers
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="space-y-3">
        {/* Low Stock */}
        <div
          onClick={() => setCurrentView("lowStock")}
          className="bg-zinc-900 border border-cyan-500/30 rounded-xl p-4 cursor-pointer hover:border-cyan-400/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500/20 p-2 rounded-lg">
                <Package className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-white">Low Stock</h3>
                <p className="text-cyan-400/70 text-sm">Items running low</p>
              </div>
            </div>
            <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
              {lowStockItems.length}
            </div>
          </div>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => setCurrentView("outOfStock")}
          className="bg-zinc-900 border border-cyan-500/30 rounded-xl p-4 cursor-pointer hover:border-cyan-400/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/20 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-white">Out of Stock</h3>
                <p className="text-cyan-400/70 text-sm">Customer requests</p>
              </div>
            </div>
            <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
              {outOfStockItems.length}
            </div>
          </div>
        </div>

        {/* Misplaced Items */}
        <div
          onClick={() => setCurrentView("misplaced")}
          className="bg-zinc-900 border border-cyan-500/30 rounded-xl p-4 cursor-pointer hover:border-cyan-400/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500/20 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-white">Misplaced Items</h3>
                <p className="text-cyan-400/70 text-sm">Incorrect locations</p>
              </div>
            </div>
            <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm">
              {misplacedItems.length}
            </div>
          </div>
        </div>

        {/* Spills & Hazards */}
        <div
          onClick={() => setCurrentView("spills")}
          className="bg-zinc-900 border border-cyan-500/30 rounded-xl p-4 cursor-pointer hover:border-cyan-400/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Droplet className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-white">Spills & Hazards</h3>
                <p className="text-cyan-400/70 text-sm">Safety incidents</p>
              </div>
            </div>
            <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
              {spillsHazards.length}
            </div>
          </div>
        </div>

        {/* Analytics & Heatmaps (Extras Tier) */}
        <div
          onClick={() => setCurrentView("analytics")}
          className="bg-zinc-900 border border-purple-500/30 rounded-xl p-4 cursor-pointer hover:border-purple-400/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="text-white">Traffic & Analytics</h3>
                <p className="text-purple-400/70 text-sm">Heatmaps, dwell-time, basket size</p>
              </div>
            </div>
            <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm">
              Extras
            </div>
          </div>
        </div>

        {/* Ghost Inventory Detection */}
        <div
          onClick={() => setCurrentView("ghostInventory")}
          className="bg-zinc-900 border border-orange-500/30 rounded-xl p-4 cursor-pointer hover:border-orange-400/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500/20 p-2 rounded-lg">
                <Ghost className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-white">Ghost Inventory</h3>
                <p className="text-orange-400/70 text-sm">Items not found in expected locations</p>
              </div>
            </div>
            <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm">
              {ghostInventory.length}
            </div>
          </div>
        </div>
        
        {/* Revenue & Sales */}
        <div
          onClick={() => setCurrentView("revenue")}
          className="bg-zinc-900 border border-green-500/30 rounded-xl p-4 cursor-pointer hover:border-green-400/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-white">Revenue & Sales</h3>
                <p className="text-green-400/70 text-sm">Online payment system revenue</p>
              </div>
            </div>
            <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
              View
            </div>
          </div>
        </div>
        
        {/* Virtual Beacons */}
        <div
          onClick={() => setCurrentView("beacons")}
          className="bg-zinc-900 border border-cyan-500/30 rounded-xl p-4 cursor-pointer hover:border-cyan-400/50 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-500/20 p-2 rounded-lg">
                <Radio className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <h3 className="text-white">Virtual Beacons</h3>
                <p className="text-cyan-400/70 text-sm">Place precision beacons for AR navigation</p>
              </div>
            </div>
            <div className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm">
              {getVirtualBeacons().length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
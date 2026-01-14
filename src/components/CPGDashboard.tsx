import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ArrowLeft, TrendingUp, Eye, Target, Sparkles, BarChart3, MapPin, Calendar } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { SupermarketMap } from "./SupermarketMap";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface CPGDashboardProps {
  onBack: () => void;
  storeName: string;
  brandName?: string;
}

interface ProductMetrics {
  id: string;
  name: string;
  tier: "basic" | "standard" | "advertising";
  shelfAlerts: number;
  exposureMetrics: number;
  impressions: number;
  recommendations: number;
  targetingEvents: number;
  abTestVariants?: string[];
  seasonalBoost?: {
    bestMonth: string;
    salesBoost: number;
  };
}

export function CPGDashboard({ onBack, storeName, brandName }: CPGDashboardProps) {
  const [selectedTier, setSelectedTier] = useState<"basic" | "standard" | "advertising" | "all">("all");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState<Array<{ x: number; y: number; intensity: number }>>([]);
  const [selectedMetric, setSelectedMetric] = useState<"metrics" | "exposure" | "targeting" | "seasonal">("metrics");
  
  // Brand product locations (hardcoded for Coke and Crescent)
  const brandProductLocations: Record<string, { x: number; y: number }> = {
    "Coca-Cola": { x: 512, y: 230 }, // Aisle 3 - Beverages
    "Crescent": { x: 382, y: 230 }, // Aisle 2 - Meat/Chicken
  };
  
  // Generate heatmap data with brand product markers
  useEffect(() => {
    const generateHeatmapData = (): Array<{ x: number; y: number; intensity: number }> => {
      const points: Array<{ x: number; y: number; intensity: number }> = [];
      
      // Generate traffic around brand product locations
      Object.entries(brandProductLocations).forEach(([brand, location]) => {
        // High intensity around brand product
        for (let i = 0; i < 30; i++) {
          points.push({
            x: location.x + (Math.random() * 100) - 50,
            y: location.y + (Math.random() * 100) - 50,
            intensity: 70 + (Math.random() * 20),
          });
        }
      });
      
      // General store traffic
      const generalPaths = [
        { x: 890, y: 50, intensity: 85 }, // Entrance
        { x: 735, y: 85, intensity: 80 }, // Cart area
        { x: 445, y: 80, intensity: 90 }, // Checkout
      ];
      
      generalPaths.forEach(path => {
        for (let i = 0; i < 20; i++) {
          points.push({
            x: path.x + (Math.random() * 60) - 30,
            y: path.y + (Math.random() * 60) - 30,
            intensity: path.intensity - (Math.random() * 15),
          });
        }
      });
      
      return points;
    };
    
    setHeatmapData(generateHeatmapData());
  }, []);
  
  // Simulated product metrics
  const productMetrics: ProductMetrics[] = [
    {
      id: "p1",
      name: "Diet Coke",
      tier: "advertising",
      shelfAlerts: 3,
      exposureMetrics: 1250,
      impressions: 3420,
      recommendations: 0,
      targetingEvents: 89,
      abTestVariants: ["Variant A", "Variant B"]
    },
    {
      id: "p2",
      name: "Crescent Turkey",
      tier: "standard",
      shelfAlerts: 5,
      exposureMetrics: 890,
      impressions: 0,
      recommendations: 45,
      targetingEvents: 67,
      seasonalBoost: {
        bestMonth: "December",
        salesBoost: 185
      },
    },
    {
      id: "p3",
      name: "Whole Wheat Bread",
      tier: "basic",
      shelfAlerts: 2,
      exposureMetrics: 560,
      impressions: 0,
      recommendations: 0,
      targetingEvents: 0,
    },
  ];
  
  const filteredProducts = selectedTier === "all"
    ? productMetrics
    : productMetrics.filter(p => p.tier === selectedTier);
  
  const getTierColor = (tier: string) => {
    switch (tier) {
      case "basic": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "standard": return "bg-purple-500/20 text-purple-400 border-purple-500/50";
      case "advertising": return "bg-orange-500/20 text-orange-400 border-orange-500/50";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };
  
  const getTierName = (tier: string) => {
    switch (tier) {
      case "basic": return "Basic";
      case "standard": return "Standard";
      case "advertising": return "Advertising";
      default: return tier;
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 mb-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-xl">CPG Brand Dashboard</h2>
        <p className="text-purple-100 text-sm">{brandName || "Brand"} - {storeName}</p>
      </div>
      
      {/* Heatmap Toggle */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setShowHeatmap(!showHeatmap)}
          variant={showHeatmap ? "default" : "outline"}
          className={showHeatmap ? "bg-purple-500" : ""}
        >
          <MapPin className="h-4 w-4 mr-2" />
          {showHeatmap ? "Hide" : "Show"} Heatmap
        </Button>
      </div>
      
      {/* Heatmap View */}
      {showHeatmap && (
        <Card className="p-4 bg-zinc-900 border-purple-500/30">
          <h3 className="text-white font-semibold mb-3">Store Traffic Heatmap - {brandName || "Your Products"}</h3>
          <div className="relative">
            <SupermarketMap
              heatmapData={heatmapData}
              brandProductLocations={brandName ? [brandProductLocations[brandName] || { x: 0, y: 0 }] : []}
              brandName={brandName}
            />
          </div>
          <div className="mt-3 text-xs text-purple-300">
            <p>• High traffic areas shown in red/orange</p>
            <p>• Your product location marked with brand icon</p>
            <p>• Heatmap shows customer flow patterns</p>
          </div>
        </Card>
      )}
      
      {/* Tier Filter */}
      <div className="grid grid-cols-4 gap-2">
        <Button
          onClick={() => setSelectedTier("all")}
          variant={selectedTier === "all" ? "default" : "outline"}
          className={selectedTier === "all" ? "bg-purple-500" : ""}
          size="sm"
        >
          All
        </Button>
        <Button
          onClick={() => setSelectedTier("basic")}
          variant={selectedTier === "basic" ? "default" : "outline"}
          className={selectedTier === "basic" ? "bg-blue-500" : ""}
          size="sm"
        >
          Basic
        </Button>
        <Button
          onClick={() => setSelectedTier("standard")}
          variant={selectedTier === "standard" ? "default" : "outline"}
          className={selectedTier === "standard" ? "bg-purple-500" : ""}
          size="sm"
        >
          Standard
        </Button>
        <Button
          onClick={() => setSelectedTier("advertising")}
          variant={selectedTier === "advertising" ? "default" : "outline"}
          className={selectedTier === "advertising" ? "bg-orange-500" : ""}
          size="sm"
        >
          Advertising
        </Button>
      </div>
      
      {/* Metric Selector */}
      <div className="flex items-center gap-2 relative z-50">
        <label className="text-white text-sm font-medium">View Metric:</label>
        <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as typeof selectedMetric)}>
          <SelectTrigger className="w-[180px] bg-zinc-900 border-cyan-500/30 text-white">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-cyan-500/30 text-white shadow-xl">
            <SelectItem value="metrics" className="text-white focus:bg-zinc-800 hover:bg-zinc-800">Metrics</SelectItem>
            <SelectItem value="exposure" className="text-white focus:bg-zinc-800 hover:bg-zinc-800">Exposure</SelectItem>
            <SelectItem value="targeting" className="text-white focus:bg-zinc-800 hover:bg-zinc-800">Targeting</SelectItem>
            {filteredProducts.some(p => p.tier === "standard") && (
              <SelectItem value="seasonal" className="text-white focus:bg-zinc-800 hover:bg-zinc-800">Seasonal Boost</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      {/* Products List */}
      <div className="space-y-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="p-4 bg-zinc-900 border-cyan-500/30">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold">{product.name}</h3>
                  <Badge className={getTierColor(product.tier)}>
                    {getTierName(product.tier)} Tier
                  </Badge>
                </div>
                <p className="text-cyan-400/70 text-sm">Product ID: {product.id}</p>
              </div>
            </div>
            
            {/* Metric Display Based on Dropdown Selection */}
            <div className="space-y-2">
              {selectedMetric === "metrics" && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-cyan-400" />
                    <p className="text-white font-semibold text-sm">Metrics</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-zinc-800 rounded-lg p-3">
                      <p className="text-cyan-400/70 text-xs mb-1">Shelf Alerts</p>
                      <p className="text-white font-semibold">{product.shelfAlerts}</p>
                    </div>
                    <div className="bg-zinc-800 rounded-lg p-3">
                      <p className="text-cyan-400/70 text-xs mb-1">Exposure Metrics</p>
                      <p className="text-white font-semibold">{product.exposureMetrics.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {product.tier === "standard" && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-purple-400" />
                        <p className="text-purple-400 text-sm font-semibold">Standard Tier Features</p>
                      </div>
                      <div className="space-y-1 text-xs text-purple-200">
                        <p>• Dynamic product recommendations: {product.recommendations}</p>
                        <p>• Real-time targeting events: {product.targetingEvents}</p>
                        <p>• Better shelf-level attribution</p>
                      </div>
                    </div>
                  )}
                  
                  {product.tier === "advertising" && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-orange-400" />
                        <p className="text-orange-400 text-sm font-semibold">Advertising Tier Features</p>
                      </div>
                      <div className="space-y-1 text-xs text-orange-200">
                        <p>• Sponsored placement impressions: {product.impressions.toLocaleString()}</p>
                        <p>• Higher ranking in item lookup</p>
                        <p>• AR navigation highlight glow</p>
                        <p>• A/B testing: {product.abTestVariants?.join(", ")}</p>
                        <p>• Path-to-shelf ad targeting: {product.targetingEvents} events</p>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {selectedMetric === "exposure" && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-cyan-400" />
                    <p className="text-white font-semibold text-sm">Exposure</p>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-cyan-400" />
                      <p className="text-white font-semibold">Exposure Metrics</p>
                    </div>
                    <p className="text-cyan-400/70 text-sm mb-1">Total Impressions</p>
                    <p className="text-white text-2xl font-bold">{product.exposureMetrics.toLocaleString()}</p>
                    {product.tier === "advertising" && (
                      <div className="mt-3 pt-3 border-t border-cyan-500/20">
                        <p className="text-orange-400 text-sm">Sponsored Impressions: {product.impressions.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {selectedMetric === "targeting" && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-cyan-400" />
                    <p className="text-white font-semibold text-sm">Targeting</p>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-cyan-400" />
                      <p className="text-white font-semibold">Targeting Performance</p>
                    </div>
                    {product.tier === "basic" ? (
                      <p className="text-cyan-400/70 text-sm">Targeting features available in Standard and Advertising tiers</p>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <p className="text-cyan-400/70 text-xs mb-1">Real-time Targeting Events</p>
                          <p className="text-white text-xl font-bold">{product.targetingEvents}</p>
                        </div>
                        {product.tier === "advertising" && (
                          <div className="mt-3 pt-3 border-t border-cyan-500/20">
                            <p className="text-orange-400 text-sm">A/B Test Variants</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {product.abTestVariants?.map((variant, idx) => (
                                <Badge key={idx} className="bg-orange-500/20 text-orange-400 border-orange-500/50">
                                  {variant}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {selectedMetric === "seasonal" && product.tier === "standard" && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <p className="text-white font-semibold text-sm">Seasonal Boost</p>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="h-4 w-4 text-purple-400" />
                      <p className="text-white font-semibold">Seasonal Boost Analysis</p>
                    </div>
                    {product.seasonalBoost ? (
                      <div className="space-y-3">
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                          <p className="text-purple-400/70 text-xs mb-1">Best Performing Month</p>
                          <p className="text-white text-xl font-bold">{product.seasonalBoost.bestMonth}</p>
                        </div>
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                          <p className="text-purple-400/70 text-xs mb-1">Sales Boost</p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-white text-2xl font-bold">+{product.seasonalBoost.salesBoost}%</p>
                            <p className="text-purple-400/70 text-xs">vs. average month</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-purple-500/20">
                          <p className="text-purple-300 text-xs">
                            💡 Peak sales occur in {product.seasonalBoost.bestMonth} due to seasonal demand patterns.
                            Consider increasing inventory and promotional activities during this period.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-cyan-400/70 text-sm">No seasonal data available for this product</p>
                    )}
                  </div>
                </>
              )}
              
              {selectedMetric === "seasonal" && product.tier !== "standard" && (
                <div className="bg-zinc-800 rounded-lg p-3">
                  <p className="text-cyan-400/70 text-sm">Seasonal Boost is only available for Standard tier products</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


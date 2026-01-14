import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { ArrowLeft, TrendingUp, Users, MapPin } from "lucide-react";
import { Card } from "./ui/card";
import { SupermarketMap } from "./SupermarketMap";

interface HeatmapAnalyticsProps {
  onBack: () => void;
  storeName: string;
}

interface TrafficPoint {
  x: number;
  y: number;
  intensity: number; // 0-100
  timestamp: number;
}

interface DwellTimeData {
  aisle: string;
  averageDwellTime: number; // in seconds
  visitCount: number;
}

interface BasketUpliftData {
  category: string;
  baselineBasketSize: number;
  currentBasketSize: number;
  uplift: number; // percentage
}

export function HeatmapAnalytics({ onBack, storeName }: HeatmapAnalyticsProps) {
  const [selectedView, setSelectedView] = useState<"heatmap" | "dwelltime" | "basketsize">("heatmap");
  
  // Simulated traffic flow data (heatmap)
  const [trafficData, setTrafficData] = useState<TrafficPoint[]>([]);
  
  // Simulated dwell time data
  const dwellTimeData: DwellTimeData[] = [
    { aisle: "Aisle 1", averageDwellTime: 45, visitCount: 120 },
    { aisle: "Aisle 2", averageDwellTime: 38, visitCount: 95 },
    { aisle: "Aisle 3", averageDwellTime: 52, visitCount: 110 },
    { aisle: "Aisle 4", averageDwellTime: 41, visitCount: 88 },
    { aisle: "Aisle 5", averageDwellTime: 35, visitCount: 75 },
    { aisle: "Aisle 6", averageDwellTime: 48, visitCount: 105 },
    { aisle: "Aisle 7", averageDwellTime: 43, visitCount: 98 },
    { aisle: "Aisle 8", averageDwellTime: 39, visitCount: 82 },
    { aisle: "Dairy", averageDwellTime: 55, visitCount: 140 },
    { aisle: "Produce", averageDwellTime: 62, visitCount: 165 },
    { aisle: "Meat", averageDwellTime: 58, visitCount: 130 },
    { aisle: "Bakery", averageDwellTime: 50, visitCount: 115 },
  ];
  
  // Simulated basket size uplift data
  const basketUpliftData: BasketUpliftData[] = [
    { category: "Breakfast", baselineBasketSize: 2.3, currentBasketSize: 2.8, uplift: 21.7 },
    { category: "Beverages", baselineBasketSize: 1.8, currentBasketSize: 2.2, uplift: 22.2 },
    { category: "Snacks", baselineBasketSize: 1.5, currentBasketSize: 1.9, uplift: 26.7 },
    { category: "Dairy", baselineBasketSize: 2.1, currentBasketSize: 2.5, uplift: 19.0 },
    { category: "Produce", baselineBasketSize: 3.2, currentBasketSize: 3.6, uplift: 12.5 },
  ];
  
  // Generate heatmap data
  useEffect(() => {
    // Simulate traffic flow - generate points along common paths
    const generateHeatmapData = (): TrafficPoint[] => {
      const points: TrafficPoint[] = [];
      
      // Entrance to cart path (more points)
      for (let i = 0; i < 30; i++) {
        points.push({
          x: 890 - (i * 8),
          y: 50 + (i * 2),
          intensity: 85 - (i * 2),
          timestamp: Date.now() - (i * 1000)
        });
      }
      
      // Cart to aisles (more paths)
      const aislePaths = [
        { start: { x: 735, y: 85 }, end: { x: 252, y: 230 }, intensity: 75 },
        { start: { x: 735, y: 85 }, end: { x: 382, y: 230 }, intensity: 70 },
        { start: { x: 735, y: 85 }, end: { x: 512, y: 230 }, intensity: 65 },
        { start: { x: 735, y: 85 }, end: { x: 642, y: 230 }, intensity: 68 },
        { start: { x: 735, y: 85 }, end: { x: 772, y: 230 }, intensity: 72 },
        { start: { x: 735, y: 85 }, end: { x: 150, y: 300 }, intensity: 60 }, // Dairy
        { start: { x: 735, y: 85 }, end: { x: 850, y: 300 }, intensity: 65 }, // Produce
      ];
      
      aislePaths.forEach(path => {
        for (let i = 0; i < 20; i++) {
          const t = i / 20;
          points.push({
            x: path.start.x + (path.end.x - path.start.x) * t,
            y: path.start.y + (path.end.y - path.start.y) * t,
            intensity: path.intensity - (i * 1.5),
            timestamp: Date.now() - (i * 2000)
          });
        }
      });
      
      // Aisle browsing (more granular)
      const aisles = [
        { x: 252, y: 230, width: 130, intensity: 60 },
        { x: 382, y: 230, width: 130, intensity: 65 },
        { x: 512, y: 230, width: 130, intensity: 70 },
        { x: 642, y: 230, width: 130, intensity: 68 },
        { x: 772, y: 230, width: 130, intensity: 72 },
      ];
      
      aisles.forEach(aisle => {
        for (let i = 0; i < 25; i++) {
          points.push({
            x: aisle.x + (Math.random() * aisle.width),
            y: aisle.y + (Math.random() * 200) - 100,
            intensity: aisle.intensity + (Math.random() * 20) - 10,
            timestamp: Date.now() - (Math.random() * 3600000)
          });
        }
      });
      
      // Checkout area (high traffic - more points)
      for (let i = 0; i < 50; i++) {
        points.push({
          x: 295 + (i % 4) * 100,
          y: 30 + Math.random() * 90,
          intensity: 90 + Math.random() * 10,
          timestamp: Date.now() - (i * 500)
        });
      }
      
      return points;
    };
    
    setTrafficData(generateHeatmapData());
  }, []);
  
  const getIntensityColor = (intensity: number): string => {
    if (intensity >= 80) return "rgba(255, 0, 0, 0.8)"; // Red - high traffic
    if (intensity >= 60) return "rgba(255, 165, 0, 0.7)"; // Orange
    if (intensity >= 40) return "rgba(255, 255, 0, 0.6)"; // Yellow
    return "rgba(0, 255, 0, 0.4)"; // Green - low traffic
  };
  
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
        <h2 className="text-xl">Traffic & Analytics</h2>
        <p className="text-cyan-100 text-sm">{storeName}</p>
      </div>
      
      {/* View Selector */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          onClick={() => setSelectedView("heatmap")}
          variant={selectedView === "heatmap" ? "default" : "outline"}
          className={selectedView === "heatmap" ? "bg-cyan-500" : ""}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Heatmap
        </Button>
        <Button
          onClick={() => setSelectedView("dwelltime")}
          variant={selectedView === "dwelltime" ? "default" : "outline"}
          className={selectedView === "dwelltime" ? "bg-cyan-500" : ""}
        >
          <Users className="h-4 w-4 mr-2" />
          Dwell Time
        </Button>
        <Button
          onClick={() => setSelectedView("basketsize")}
          variant={selectedView === "basketsize" ? "default" : "outline"}
          className={selectedView === "basketsize" ? "bg-cyan-500" : ""}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Basket Size
        </Button>
      </div>
      
      {/* Heatmap View */}
      {selectedView === "heatmap" && (
        <Card className="p-4 bg-zinc-900 border-cyan-500/30">
          <h3 className="text-white text-lg mb-4">Traffic Flow Heatmap</h3>
          {/* Use SupermarketMap with heatmap overlay */}
          <SupermarketMap
            selectedProducts={[]}
            currentLocation={{ x: 500, y: 300 }}
            route={[]}
            showHeatmap={true}
            heatmapData={trafficData}
          />
          
          {/* Legend */}
          <div className="mt-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
            <p className="text-white text-xs mb-2">Traffic Intensity</p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-white text-xs">Low</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-white text-xs">Medium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-white text-xs">High</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-white text-xs">Very High</span>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Dwell Time View */}
      {selectedView === "dwelltime" && (
        <Card className="p-4 bg-zinc-900 border-cyan-500/30">
          <h3 className="text-white text-lg mb-4">Shelf Dwell-Time Analytics</h3>
          <div className="space-y-3">
            {dwellTimeData.map((data, index) => (
              <div key={index} className="bg-zinc-800 rounded-lg p-4 border border-cyan-500/20">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold">{data.aisle}</h4>
                  <span className="text-cyan-400 text-sm">{data.averageDwellTime}s avg</span>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-cyan-400/70 text-xs">Average Dwell Time</p>
                    <p className="text-white">{data.averageDwellTime} seconds</p>
                  </div>
                  <div>
                    <p className="text-cyan-400/70 text-xs">Visit Count</p>
                    <p className="text-white">{data.visitCount} visits</p>
                  </div>
                </div>
                <div className="mt-2 bg-cyan-500/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full transition-all"
                    style={{ width: `${Math.min((data.averageDwellTime / 70) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Basket Size Uplift View */}
      {selectedView === "basketsize" && (
        <Card className="p-4 bg-zinc-900 border-cyan-500/30">
          <h3 className="text-white text-lg mb-4">Basket-Size Uplift Metrics</h3>
          <div className="space-y-3">
            {basketUpliftData.map((data, index) => (
              <div key={index} className="bg-zinc-800 rounded-lg p-4 border border-cyan-500/20">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold">{data.category}</h4>
                  <span className="text-green-400 text-sm font-bold">+{data.uplift.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div>
                    <p className="text-cyan-400/70 text-xs">Baseline</p>
                    <p className="text-white">{data.baselineBasketSize} items</p>
                  </div>
                  <div>
                    <p className="text-cyan-400/70 text-xs">Current</p>
                    <p className="text-white font-semibold">{data.currentBasketSize} items</p>
                  </div>
                </div>
                <div className="bg-green-500/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-green-500 h-full transition-all"
                    style={{ width: `${Math.min((data.uplift / 30) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}


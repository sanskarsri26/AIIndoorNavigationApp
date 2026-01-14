import { storeSections, Product } from "../lib/products";

interface SupermarketMapProps {
  selectedProducts?: Product[];
  currentLocation?: { x: number; y: number };
  route?: { x: number; y: number }[];
  onSectionClick?: (sectionId: string) => void;
  showHeatmap?: boolean;
  heatmapData?: Array<{ x: number; y: number; intensity: number }>;
  brandProductLocations?: Array<{ x: number; y: number }>;
  brandName?: string;
  gpsLocation?: { lat: number; lng: number } | null;
  heading?: number | null;
}

export function SupermarketMap({ 
  selectedProducts = [], 
  currentLocation, 
  route = [],
  onSectionClick,
  showHeatmap = false,
  heatmapData = [],
  brandProductLocations = [],
  brandName,
  gpsLocation,
  heading
}: SupermarketMapProps) {
  const mapWidth = 1000;
  const mapHeight = 600;
  
  // Get unique sections for selected products
  const highlightedSections = new Set(selectedProducts.map(p => p.section));
  
  // Generate heatmap data if not provided
  const defaultHeatmapData = showHeatmap && heatmapData.length === 0 ? [
    // Entrance to cart path (high traffic)
    ...Array.from({ length: 20 }, (_, i) => ({
      x: 890 - (i * 8),
      y: 50 + (i * 2),
      intensity: 85 - (i * 2)
    })),
    // Checkout area (very high traffic)
    ...Array.from({ length: 30 }, (_, i) => ({
      x: 295 + (i % 4) * 100,
      y: 30 + Math.random() * 90,
      intensity: 90 + Math.random() * 10
    })),
    // Aisle paths (medium traffic)
    ...Array.from({ length: 15 }, (_, i) => ({
      x: 252 + (i % 8) * 50,
      y: 200 + Math.random() * 180,
      intensity: 60 + Math.random() * 20
    })),
  ] : heatmapData;
  
  const getIntensityColor = (intensity: number): string => {
    if (intensity >= 80) return "rgba(255, 0, 0, 0.8)"; // Red - high traffic
    if (intensity >= 60) return "rgba(255, 165, 0, 0.7)"; // Orange
    if (intensity >= 40) return "rgba(255, 255, 0, 0.6)"; // Yellow
    return "rgba(0, 255, 0, 0.4)"; // Green - low traffic
  };
  
  return (
    <div className="space-y-2">
      {/* Map */}
      <div className="relative w-full bg-zinc-900 rounded-lg overflow-hidden border-2 border-cyan-500/30">
        <svg 
          viewBox={`0 0 ${mapWidth} ${mapHeight}`} 
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Store floor */}
          <rect x="0" y="0" width={mapWidth} height={mapHeight} fill="#0a0a0a" />
          
          {/* Heatmap overlay */}
          {showHeatmap && defaultHeatmapData.map((point, index) => (
            <circle
              key={`heatmap-${index}`}
              cx={point.x}
              cy={point.y}
              r="12"
              fill={getIntensityColor(point.intensity)}
              opacity={0.6}
            />
          ))}
          
          {/* Store sections */}
          {storeSections.map((section) => {
            const isHighlighted = highlightedSections.has(section.id);
            const isEntrance = section.type === "entrance";
            const isExit = section.type === "exit";
            const isCheckout = section.type === "checkout";
            const isAisle = section.type === "aisle";
            const isDepartment = section.type === "department";
            const isDisplay = section.type === "display";
            
            let fillColor = "#1a1a1a";
            let strokeColor = "#404040";
            
            if (isEntrance) {
              fillColor = "#10b981"; // Green
              strokeColor = "#34d399";
            } else if (isExit) {
              fillColor = "#ef4444"; // Red
              strokeColor = "#f87171";
            } else if (isCheckout) {
              fillColor = "#3b82f6"; // Blue
              strokeColor = "#60a5fa";
            } else if (isAisle) {
              fillColor = isHighlighted ? "#00d9ff" : "#1a1a1a";
              strokeColor = isHighlighted ? "#00ffff" : "#404040";
            } else if (isDepartment) {
              fillColor = isHighlighted ? "#00d9ff" : "#1a1a1a";
              strokeColor = isHighlighted ? "#00ffff" : "#404040";
            } else if (isDisplay) {
              fillColor = "#262626";
              strokeColor = "#404040";
            }
            
            // Render circular displays differently
            if (isDisplay && (section.id === "display1" || section.id === "display2")) {
              const cx = section.position.x + section.width / 2;
              const cy = section.position.y + section.height / 2;
              const radius = section.width / 2;
              
              return (
                <g key={section.id}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={2}
                    className={onSectionClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
                    onClick={() => onSectionClick && onSectionClick(section.id)}
                  />
                  {/* Pattern fill for display areas */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius - 5}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={1}
                    strokeDasharray="4,4"
                    opacity={0.3}
                  />
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#00d9ff"
                    className="pointer-events-none select-none"
                    style={{ fontSize: '16px' }}
                  >
                    {section.name}
                  </text>
                </g>
              );
            }
            
            return (
              <g key={section.id}>
                <rect
                  x={section.position.x}
                  y={section.position.y}
                  width={section.width}
                  height={section.height}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isHighlighted ? 3 : 2}
                  rx={isCheckout ? "2" : "4"}
                  className={onSectionClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
                  onClick={() => onSectionClick && onSectionClick(section.id)}
                />
                <text
                  x={section.position.x + section.width / 2}
                  y={section.position.y + section.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isEntrance || isExit || isCheckout ? "#000000" : isHighlighted ? "#000000" : "#00d9ff"}
                  className="pointer-events-none select-none"
                  style={{ fontSize: isCheckout ? '11px' : isDepartment ? '14px' : '12px' }}
                >
                  {section.name}
                </text>
              </g>
            );
          })}
          
          {/* Navigation route */}
          {route.length > 1 && (
            <>
              <polyline
                points={route.map(p => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8,4"
                className="animate-pulse"
              />
              
              {/* Route waypoints */}
              {route.slice(1, -1).map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="6"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
            </>
          )}
          
          {/* Selected product markers */}
          {selectedProducts.map((product, index) => (
            <g key={product.id}>
              <circle
                cx={product.position.x}
                cy={product.position.y}
                r="10"
                fill="#ef4444"
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={product.position.x}
                y={product.position.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                style={{ fontSize: '11px' }}
                className="pointer-events-none select-none"
              >
                {index + 1}
              </text>
            </g>
          ))}
          
          {/* Cart location marker */}
          <g>
            <circle
              cx={735}
              cy={85}
              r="12"
              fill="#f59e0b"
              stroke="white"
              strokeWidth="2"
              opacity="0.9"
            />
            <text
              x={735}
              y={85}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              style={{ fontSize: '16px' }}
              className="pointer-events-none select-none"
            >
              🛒
            </text>
          </g>
          
          {/* Current location marker with distance to next */}
          {currentLocation && (
            <g>
              <circle
                cx={currentLocation.x}
                cy={currentLocation.y}
                r="15"
                fill="#10b981"
                opacity="0.3"
                className="animate-ping"
              />
              <circle
                cx={currentLocation.x}
                cy={currentLocation.y}
                r="12"
                fill="#10b981"
                stroke="white"
                strokeWidth="3"
                style={{
                  transition: 'cx 1.5s ease-in-out, cy 1.5s ease-in-out'
                }}
              />
              <circle
                cx={currentLocation.x}
                cy={currentLocation.y}
                r="5"
                fill="white"
                style={{
                  transition: 'cx 1.5s ease-in-out, cy 1.5s ease-in-out'
                }}
              />
              {/* Distance label if route exists */}
              {route.length > 1 && route[1] && (() => {
                const nextPoint = route[1];
                const distance = Math.sqrt(
                  Math.pow(nextPoint.x - currentLocation.x, 2) + 
                  Math.pow(nextPoint.y - currentLocation.y, 2)
                );
                const distanceMeters = Math.round((distance / 10) * 10) / 10;
                return (
                  <g>
                    <rect
                      x={currentLocation.x - 30}
                      y={currentLocation.y - 40}
                      width="60"
                      height="20"
                      fill="rgba(0, 0, 0, 0.7)"
                      rx="4"
                    />
                    <text
                      x={currentLocation.x}
                      y={currentLocation.y - 27}
                      textAnchor="middle"
                      fill="#00d9ff"
                      fontSize="11"
                      fontWeight="bold"
                      className="pointer-events-none select-none"
                    >
                      {distanceMeters}m
                    </text>
                  </g>
                );
              })()}
            </g>
          )}
          
          {/* Brand Product Markers */}
          {brandProductLocations.map((location, index) => (
            <g key={`brand-${index}`}>
              <circle
                cx={location.x}
                cy={location.y}
                r="18"
                fill={brandName === "Coca-Cola" ? "#dc2626" : brandName === "Crescent" ? "#f59e0b" : "#8b5cf6"}
                opacity="0.3"
                className="animate-pulse"
              />
              <circle
                cx={location.x}
                cy={location.y}
                r="14"
                fill={brandName === "Coca-Cola" ? "#dc2626" : brandName === "Crescent" ? "#f59e0b" : "#8b5cf6"}
                stroke="white"
                strokeWidth="3"
              />
              <text
                x={location.x}
                y={location.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                style={{ fontSize: '18px', fontWeight: 'bold' }}
                className="pointer-events-none select-none"
              >
                {brandName === "Coca-Cola" ? "🥤" : brandName === "Crescent" ? "🍗" : "📦"}
              </text>
              <text
                x={location.x}
                y={location.y + 25}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
                className="pointer-events-none select-none"
                style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
              >
                {brandName}
              </text>
            </g>
          ))}
        </svg>
        
        {/* Legend - Outside the map */}
        <div className="bg-zinc-900 rounded-lg p-2 shadow border border-cyan-500/30">
          <div className="flex items-center justify-around gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-green-500 rounded-full border border-white shadow-sm"></div>
              <span className="text-cyan-400">You</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-500 rounded-full border border-white shadow-sm"></div>
              <span className="text-cyan-400">Items</span>
            </div>
            {brandProductLocations.length > 0 && (
              <div className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full border border-white shadow-sm ${brandName === "Coca-Cola" ? "bg-red-600" : brandName === "Crescent" ? "bg-amber-500" : "bg-purple-500"}`}></div>
                <span className="text-cyan-400">{brandName || "Brand"}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-blue-500 rounded shadow-sm"></div>
              <span className="text-cyan-400">Path</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-cyan-400 rounded border border-cyan-300"></div>
              <span className="text-cyan-400">Highlighted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
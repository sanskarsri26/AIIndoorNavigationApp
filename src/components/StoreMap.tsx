import { Button } from "./ui/button";
import { MapPin, Users, Clock, Navigation as NavigationIcon, ChevronRight } from "lucide-react";

interface Store {
  id: string;
  name: string;
  address: string;
  distance: string;
  crowdLevel: "low" | "medium" | "high";
  waitTime: string;
  position: { x: number; y: number };
  isSelected?: boolean;
  customerTraffic: string; // e.g., "12 customers now"
  onlineCheckoutAvailable: boolean;
}

interface StoreMapProps {
  onSelectStore: (store: Store) => void;
  onBack: () => void;
}

const dummyStores: Store[] = [
  {
    id: "1",
    name: "MU P.O.D Market",
    address: "1290 S Normal Ave",
    distance: "0.2 mi",
    crowdLevel: "low",
    waitTime: "2-5 min",
    position: { x: 50, y: 45 },
    isSelected: true,
    customerTraffic: "5 customers now",
    onlineCheckoutAvailable: true,
  },
  {
    id: "2",
    name: "Campus Fresh Mart",
    address: "1450 W University St",
    distance: "0.5 mi",
    crowdLevel: "high",
    waitTime: "15-20 min",
    position: { x: 35, y: 25 },
    customerTraffic: "20 customers now",
    onlineCheckoutAvailable: true,
  },
  {
    id: "3",
    name: "Student Grocery Hub",
    address: "890 E Green St",
    distance: "0.8 mi",
    crowdLevel: "medium",
    waitTime: "8-12 min",
    position: { x: 70, y: 60 },
    customerTraffic: "10 customers now",
    onlineCheckoutAvailable: true,
  },
  {
    id: "4",
    name: "QuickStop Market",
    address: "2100 S First St",
    distance: "1.2 mi",
    crowdLevel: "low",
    waitTime: "3-7 min",
    position: { x: 25, y: 70 },
    customerTraffic: "3 customers now",
    onlineCheckoutAvailable: true,
  },
  {
    id: "5",
    name: "CityCenter Foods",
    address: "1800 W Springfield Ave",
    distance: "1.5 mi",
    crowdLevel: "medium",
    waitTime: "10-15 min",
    position: { x: 60, y: 30 },
    customerTraffic: "15 customers now",
    onlineCheckoutAvailable: false,
  },
];

export function StoreMap({ onSelectStore, onBack }: StoreMapProps) {
  const getCrowdColor = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-red-500";
    }
  };

  const getCrowdBadgeColor = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-700 border-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "high":
        return "bg-red-100 text-red-700 border-red-300";
    }
  };

  return (
    <div className="space-y-4">
      {/* Map View */}
      <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-cyan-500/30">
        {/* Map Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4 border-b-2 border-cyan-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <h2 className="text-white">Nearby Stores</h2>
            </div>
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              Back
            </Button>
          </div>
          <p className="text-cyan-100 text-sm">Select a store to start shopping</p>
        </div>

        {/* Interactive Map */}
        <div className="relative h-64 bg-gradient-to-br from-zinc-800 to-zinc-900">
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="gray" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Store Markers */}
          {dummyStores.map((store) => (
            <div
              key={store.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${store.position.x}%`, top: `${store.position.y}%` }}
              onClick={() => onSelectStore(store)}
            >
              {/* Marker Pin */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full border-3 ${
                    store.isSelected
                      ? "bg-blue-600 border-white shadow-xl scale-125"
                      : `${getCrowdColor(store.crowdLevel)} border-white shadow-lg group-hover:scale-110`
                  } transition-all duration-200 flex items-center justify-center`}
                >
                  {store.isSelected && (
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  )}
                </div>
                {/* Label - shows on hover or if selected */}
                <div
                  className={`absolute top-10 bg-white px-2 py-1 rounded shadow-lg text-xs whitespace-nowrap ${
                    store.isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  } transition-opacity`}
                >
                  <p className="text-slate-900">{store.name}</p>
                  <p className="text-slate-500 text-[10px]">{store.distance}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Your Location */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-700">You are here</span>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-zinc-900 p-3 border-t border-cyan-500/30">
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-cyan-400">Low Traffic</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-cyan-400">Moderate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-cyan-400">High Traffic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Store List */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {dummyStores.map((store) => (
          <div
            key={store.id}
            className={`bg-zinc-900 rounded-xl p-4 shadow-md border-2 transition-all cursor-pointer hover:shadow-lg hover:border-cyan-400/50 ${
              store.isSelected ? "border-cyan-500 bg-cyan-500/10" : "border-cyan-500/30"
            }`}
            onClick={() => onSelectStore(store)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white">{store.name}</h3>
                  {store.isSelected && (
                    <span className="bg-cyan-500 text-black text-[10px] px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-cyan-400/70">{store.address}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-cyan-400/70" />
            </div>

            <div className="flex items-center gap-3 mt-3">
              {/* Distance */}
              <div className="flex items-center gap-1.5 text-sm">
                <NavigationIcon className="h-4 w-4 text-cyan-400" />
                <span className="text-white">{store.distance}</span>
              </div>

              {/* Customer Traffic */}
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-cyan-400" />
                <span className="text-white text-sm">{store.customerTraffic}</span>
              </div>

              {/* Wait Time */}
              <div className="flex items-center gap-1.5 text-sm">
                <Clock className="h-4 w-4 text-cyan-400" />
                <span className="text-white">{store.waitTime}</span>
              </div>
            </div>

            {/* Online Checkout Badge */}
            {store.onlineCheckoutAvailable && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-purple-500/20 border border-purple-500/50 text-purple-400 text-xs px-2 py-1 rounded-full">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path
                    fillRule="evenodd"
                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Online Checkout Available
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
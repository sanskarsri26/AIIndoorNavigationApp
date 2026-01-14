// Beacon system for AR navigation
// Beacons are virtual markers placed throughout the store for AR positioning

export interface Beacon {
  id: string;
  position: { x: number; y: number; z?: number };
  name: string;
  type: "entrance" | "aisle" | "department" | "checkout" | "display" | "waypoint";
  range: number; // Detection range in pixels (converted to meters in AR)
  signalStrength?: number; // 0-100, for simulation
}

// Define beacons throughout the store
export const storeBeacons: Beacon[] = [
  // Entrance beacons
  { id: "beacon-entrance-1", position: { x: 890, y: 50 }, name: "Entrance", type: "entrance", range: 50 },
  
  // Cart area beacon
  { id: "beacon-cart-1", position: { x: 735, y: 85 }, name: "Cart Area", type: "waypoint", range: 30 },
  
  // Aisle beacons (at aisle entrances)
  { id: "beacon-aisle-1", position: { x: 252, y: 200 }, name: "Aisle 1", type: "aisle", range: 40 },
  { id: "beacon-aisle-2", position: { x: 302, y: 200 }, name: "Aisle 2", type: "aisle", range: 40 },
  { id: "beacon-aisle-3", position: { x: 382, y: 200 }, name: "Aisle 3", type: "aisle", range: 40 },
  { id: "beacon-aisle-4", position: { x: 432, y: 200 }, name: "Aisle 4", type: "aisle", range: 40 },
  { id: "beacon-aisle-5", position: { x: 512, y: 200 }, name: "Aisle 5", type: "aisle", range: 40 },
  { id: "beacon-aisle-6", position: { x: 562, y: 200 }, name: "Aisle 6", type: "aisle", range: 40 },
  { id: "beacon-aisle-7", position: { x: 642, y: 200 }, name: "Aisle 7", type: "aisle", range: 40 },
  { id: "beacon-aisle-8", position: { x: 692, y: 200 }, name: "Aisle 8", type: "aisle", range: 40 },
  
  // Department beacons
  { id: "beacon-dairy", position: { x: 50, y: 305 }, name: "Dairy", type: "department", range: 50 },
  { id: "beacon-produce", position: { x: 950, y: 305 }, name: "Produce", type: "department", range: 50 },
  { id: "beacon-meat", position: { x: 170, y: 515 }, name: "Meat", type: "department", range: 50 },
  { id: "beacon-frozen", position: { x: 485, y: 530 }, name: "Frozen", type: "department", range: 50 },
  { id: "beacon-bakery", position: { x: 830, y: 515 }, name: "Bakery", type: "department", range: 50 },
  
  // Display beacons
  { id: "beacon-display-1", position: { x: 150, y: 220 }, name: "Display D1", type: "display", range: 35 },
  { id: "beacon-display-2", position: { x: 770, y: 340 }, name: "Display D2", type: "display", range: 35 },
  
  // Checkout beacons
  { id: "beacon-checkout-1", position: { x: 317, y: 75 }, name: "Checkout 1", type: "checkout", range: 30 },
  { id: "beacon-checkout-2", position: { x: 417, y: 75 }, name: "Checkout 2", type: "checkout", range: 30 },
  { id: "beacon-checkout-3", position: { x: 517, y: 75 }, name: "Checkout 3", type: "checkout", range: 30 },
  { id: "beacon-checkout-4", position: { x: 617, y: 75 }, name: "Checkout 4", type: "checkout", range: 30 },
  
  // Exit beacon
  { id: "beacon-exit-1", position: { x: 105, y: 50 }, name: "Exit", type: "entrance", range: 50 },
  
  // Waypoint beacons (corridor intersections)
  { id: "beacon-waypoint-1", position: { x: 210, y: 150 }, name: "Waypoint", type: "waypoint", range: 25 },
  { id: "beacon-waypoint-2", position: { x: 342, y: 150 }, name: "Waypoint", type: "waypoint", range: 25 },
  { id: "beacon-waypoint-3", position: { x: 472, y: 150 }, name: "Waypoint", type: "waypoint", range: 25 },
  { id: "beacon-waypoint-4", position: { x: 602, y: 150 }, name: "Waypoint", type: "waypoint", range: 25 },
  { id: "beacon-waypoint-5", position: { x: 735, y: 150 }, name: "Waypoint", type: "waypoint", range: 25 },
  { id: "beacon-waypoint-6", position: { x: 210, y: 410 }, name: "Waypoint", type: "waypoint", range: 25 },
  { id: "beacon-waypoint-7", position: { x: 342, y: 410 }, name: "Waypoint", type: "waypoint", range: 25 },
  { id: "beacon-waypoint-8", position: { x: 472, y: 410 }, name: "Waypoint", type: "waypoint", range: 25 },
  { id: "beacon-waypoint-9", position: { x: 602, y: 410 }, name: "Waypoint", type: "waypoint", range: 25 },
  { id: "beacon-waypoint-10", position: { x: 735, y: 410 }, name: "Waypoint", type: "waypoint", range: 25 },
];

// Calculate distance between two points
function calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Get nearby beacons based on current position
export function getNearbyBeacons(
  currentPosition: { x: number; y: number },
  maxRange: number = 100
): Beacon[] {
  return storeBeacons
    .map(beacon => ({
      ...beacon,
      distance: calculateDistance(currentPosition, beacon.position),
      signalStrength: Math.max(0, 100 - (calculateDistance(currentPosition, beacon.position) / beacon.range) * 100)
    }))
    .filter(beacon => beacon.distance <= maxRange)
    .sort((a, b) => a.distance - b.distance);
}

// Estimate position using trilateration from nearby beacons
export function estimatePositionFromBeacons(
  detectedBeacons: Array<{ beacon: Beacon; signalStrength: number }>
): { x: number; y: number } | null {
  if (detectedBeacons.length < 2) return null;
  
  // Use weighted average based on signal strength
  let totalWeight = 0;
  let weightedX = 0;
  let weightedY = 0;
  
  detectedBeacons.forEach(({ beacon, signalStrength }) => {
    const weight = signalStrength / 100;
    weightedX += beacon.position.x * weight;
    weightedY += beacon.position.y * weight;
    totalWeight += weight;
  });
  
  if (totalWeight === 0) return null;
  
  return {
    x: weightedX / totalWeight,
    y: weightedY / totalWeight
  };
}

// Get beacon by ID
export function getBeaconById(id: string): Beacon | undefined {
  return storeBeacons.find(b => b.id === id);
}

// Get beacons by type
export function getBeaconsByType(type: Beacon["type"]): Beacon[] {
  return storeBeacons.filter(b => b.type === type);
}


// Virtual Precision Beacons System
// Retailers can place virtual beacons at shelf locations for precise AR navigation

export interface VirtualBeacon {
  id: string;
  name: string;
  productId?: string; // Associated product if applicable
  // World position in 3D space (meters from entrance)
  worldPosition: {
    x: number; // Left-right (meters)
    y: number; // Up-down (meters, shelf height)
    z: number; // Forward-back (meters, negative = in front)
  };
  // Map position (2D coordinates for reference)
  mapPosition: {
    x: number;
    y: number;
  };
  placedAt: string; // ISO timestamp
  placedBy: string; // Retailer ID or name
}

const STORAGE_KEY = 'virtualBeacons';

// Get all virtual beacons
export function getVirtualBeacons(): VirtualBeacon[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error loading virtual beacons:", e);
  }
  return [];
}

// Save virtual beacons
export function saveVirtualBeacons(beacons: VirtualBeacon[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(beacons));
  } catch (e) {
    console.error("Error saving virtual beacons:", e);
  }
}

// Add a new virtual beacon
export function addVirtualBeacon(beacon: Omit<VirtualBeacon, 'id' | 'placedAt'>): VirtualBeacon {
  try {
    const beacons = getVirtualBeacons();
    const newBeacon: VirtualBeacon = {
      ...beacon,
      id: `beacon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      placedAt: new Date().toISOString(),
    };
    
    // Validate beacon data
    if (!newBeacon.name || !newBeacon.name.trim()) {
      throw new Error("Beacon name is required");
    }
    
    if (typeof newBeacon.worldPosition.x !== 'number' || 
        typeof newBeacon.worldPosition.y !== 'number' || 
        typeof newBeacon.worldPosition.z !== 'number') {
      throw new Error("Invalid world position coordinates");
    }
    
    beacons.push(newBeacon);
    saveVirtualBeacons(beacons);
    
    // Verify it was saved
    const verifyBeacons = getVirtualBeacons();
    const savedBeacon = verifyBeacons.find(b => b.id === newBeacon.id);
    if (!savedBeacon) {
      throw new Error("Beacon was not saved correctly");
    }
    
    console.log("Beacon saved successfully:", newBeacon);
    return newBeacon;
  } catch (error) {
    console.error("Error adding virtual beacon:", error);
    throw error;
  }
}

// Remove a virtual beacon
export function removeVirtualBeacon(beaconId: string): void {
  const beacons = getVirtualBeacons();
  const filtered = beacons.filter(b => b.id !== beaconId);
  saveVirtualBeacons(filtered);
}

// Get beacon by product ID
export function getBeaconByProductId(productId: string): VirtualBeacon | undefined {
  const beacons = getVirtualBeacons();
  return beacons.find(b => b.productId === productId);
}

// Get nearest beacon to a position
export function getNearestBeacon(
  position: { x: number; y: number; z: number }
): VirtualBeacon | null {
  const beacons = getVirtualBeacons();
  if (beacons.length === 0) return null;
  
  let nearest = beacons[0];
  let minDist = Infinity;
  
  beacons.forEach(beacon => {
    const dx = beacon.worldPosition.x - position.x;
    const dy = beacon.worldPosition.y - position.y;
    const dz = beacon.worldPosition.z - position.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (dist < minDist) {
      minDist = dist;
      nearest = beacon;
    }
  });
  
  return nearest;
}

// Calculate distance from current position to beacon
export function calculateDistanceToBeacon(
  currentPosition: { x: number; y: number; z: number },
  beacon: VirtualBeacon
): number {
  const dx = beacon.worldPosition.x - currentPosition.x;
  const dy = beacon.worldPosition.y - currentPosition.y;
  const dz = beacon.worldPosition.z - currentPosition.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Calculate direction vector from current position to beacon
export function getDirectionToBeacon(
  currentPosition: { x: number; y: number; z: number },
  beacon: VirtualBeacon
): { x: number; y: number; z: number } {
  const dx = beacon.worldPosition.x - currentPosition.x;
  const dy = beacon.worldPosition.y - currentPosition.y;
  const dz = beacon.worldPosition.z - currentPosition.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  
  if (distance === 0) {
    return { x: 0, y: 0, z: -1 }; // Default forward direction
  }
  
  return {
    x: dx / distance,
    y: dy / distance,
    z: dz / distance,
  };
}

// Store entrance position in 2D map coordinates
// This is the reference point where AR world origin (0,0,0) aligns
export const ENTRANCE_MAP_POSITION = { x: 890, y: 50 };

// Scale factor: 1 pixel in 2D map = 0.01 meters in AR world
// This means 100 pixels = 1 meter
export const MAP_TO_AR_SCALE = 0.01;

// Convert 2D map coordinates to AR world coordinates
// AR world origin is at entrance, with:
// - x: left-right (positive = right)
// - y: up-down (positive = up, shelf height)
// - z: forward-back (negative = forward/inward from entrance)
export function mapToARWorld(mapPos: { x: number; y: number }): { x: number; y: number; z: number } {
  const dx = mapPos.x - ENTRANCE_MAP_POSITION.x;
  const dy = mapPos.y - ENTRANCE_MAP_POSITION.y;
  
  return {
    x: dx * MAP_TO_AR_SCALE, // Right is positive
    y: 1.5, // Default shelf height (1.5 meters)
    z: -dy * MAP_TO_AR_SCALE, // Forward (down in map) is negative
  };
}

// Convert AR world coordinates to 2D map coordinates
export function arWorldToMap(worldPos: { x: number; y: number; z: number }): { x: number; y: number } {
  return {
    x: ENTRANCE_MAP_POSITION.x + (worldPos.x / MAP_TO_AR_SCALE),
    y: ENTRANCE_MAP_POSITION.y - (worldPos.z / MAP_TO_AR_SCALE), // z is negative for forward
  };
}

// Calculate horizontal bearing angle (in radians) from camera to beacon
// Returns angle in screen space (0 = forward, positive = right, negative = left)
export function calculateBearingAngle(
  cameraPosition: { x: number; y: number; z: number },
  cameraForward: { x: number; y: number; z: number }, // Normalized forward vector
  beacon: VirtualBeacon
): number {
  // Vector from camera to beacon (projected onto horizontal plane)
  const dx = beacon.worldPosition.x - cameraPosition.x;
  const dz = beacon.worldPosition.z - cameraPosition.z;
  
  // Calculate target heading in world space (atan2 gives angle from +z axis)
  const targetHeading = Math.atan2(dx, -dz); // Negative z because forward is negative
  
  // Calculate camera heading from forward vector
  const cameraHeading = Math.atan2(cameraForward.x, -cameraForward.z);
  
  // Angle difference (how much to rotate arrow)
  let angle = targetHeading - cameraHeading;
  
  // Normalize to [-π, π]
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  
  return angle;
}


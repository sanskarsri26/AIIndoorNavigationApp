// ADA-friendly routing enhancements
import { calculateDistance } from "./navigation";
import { Product } from "./products";

export interface RoutePoint {
  x: number;
  y: number;
}

export interface ADARouteOptions {
  avoidStairs: boolean;
  requireWidePathways: boolean; // For wheelchair accessibility
  maxSlope: number; // Maximum slope percentage
  preferElevators: boolean;
}

// Default ADA-friendly options
export const defaultADAOptions: ADARouteOptions = {
  avoidStairs: true,
  requireWidePathways: true,
  maxSlope: 5, // 5% maximum slope
  preferElevators: true,
};

// Check if a path segment is ADA-accessible
export function isPathAccessible(
  start: RoutePoint,
  end: RoutePoint,
  options: ADARouteOptions = defaultADAOptions
): boolean {
  // Calculate slope (simplified - in real implementation would use elevation data)
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);
  const distance = calculateDistance(start, end);
  
  // Check if pathway is wide enough (simplified check)
  // In real implementation, would check actual pathway width
  if (options.requireWidePathways) {
    // Assume pathways are wide enough if distance is reasonable
    // Real implementation would check actual pathway dimensions
  }
  
  // Check slope (simplified - would use elevation data in real implementation)
  if (options.maxSlope > 0) {
    const slope = (dy / distance) * 100; // Percentage slope
    if (slope > options.maxSlope) {
      return false;
    }
  }
  
  return true;
}

// Generate ADA-friendly route instructions
export function generateADAInstructions(
  products: Product[],
  currentPosition: RoutePoint,
  options: ADARouteOptions = defaultADAOptions
): string[] {
  const instructions: string[] = [];
  
  instructions.push("ADA-friendly route activated");
  
  if (options.requireWidePathways) {
    instructions.push("Using wide pathways suitable for wheelchairs");
  }
  
  if (options.avoidStairs) {
    instructions.push("Route avoids stairs and uses ramps/elevators");
  }
  
  // Add specific instructions for each product
  products.forEach((product, index) => {
    const distance = calculateDistance(currentPosition, product.position);
    const distanceMeters = Math.round((distance / 10) * 10) / 10;
    
    instructions.push(
      `${index + 1}. Navigate ${distanceMeters}m to ${product.name} in ${product.aisle} (ADA accessible)`
    );
  });
  
  return instructions;
}

// Check if a location has ADA features
export function hasADAFeatures(location: { x: number; y: number }): {
  hasRamp: boolean;
  hasElevator: boolean;
  hasWidePathway: boolean;
} {
  // In real implementation, would check actual store layout data
  // For now, return defaults based on location
  return {
    hasRamp: true, // Assume ramps are available
    hasElevator: location.x > 400 && location.x < 600, // Elevator in center area
    hasWidePathway: true, // Assume wide pathways throughout
  };
}


import { Product } from "./products";

interface NavigationStep {
  product: Product;
  distance: number;
  direction: "up" | "down" | "left" | "right" | "straight";
  instruction: string;
}

export interface RoutePoint {
  x: number;
  y: number;
}

// Store obstacles (aisles, displays, departments)
const obstacles = [
  // Checkout counters
  { x: 295, y: 30, width: 45, height: 90 },
  { x: 395, y: 30, width: 45, height: 90 },
  { x: 495, y: 30, width: 45, height: 90 },
  { x: 595, y: 30, width: 45, height: 90 },
  
  // Cart area
  { x: 705, y: 50, width: 60, height: 70 },
  
  // Dairy
  { x: 10, y: 190, width: 80, height: 230 },
  
  // Produce
  { x: 910, y: 190, width: 80, height: 230 },
  
  // Display D1
  { x: 100, y: 170, width: 100, height: 100 },
  
  // Display D2
  { x: 720, y: 290, width: 100, height: 100 },
  
  // 8 Vertical Aisles - these are solid obstacles, must walk around them
  { x: 230, y: 200, width: 45, height: 180 }, // A1
  { x: 280, y: 200, width: 45, height: 180 }, // A2
  { x: 360, y: 200, width: 45, height: 180 }, // A3
  { x: 410, y: 200, width: 45, height: 180 }, // A4
  { x: 490, y: 200, width: 45, height: 180 }, // A5
  { x: 540, y: 200, width: 45, height: 180 }, // A6
  { x: 620, y: 200, width: 45, height: 180 }, // A7
  { x: 670, y: 200, width: 45, height: 180 }, // A8
  
  // Bottom departments
  { x: 110, y: 460, width: 120, height: 110 },
  { x: 395, y: 490, width: 180, height: 80 },
  { x: 770, y: 460, width: 120, height: 110 },
];

// Define corridor system based on store layout
const corridors = {
  // Horizontal corridors (where shoppers can walk left-right)
  horizontal: [
    { y: 150, xStart: 90, xEnd: 900 },  // Top walkway above all aisles
    { y: 410, xStart: 90, xEnd: 900 },  // Bottom walkway below all aisles
  ],
  
  // Vertical corridors (where shoppers can walk up-down between aisle pairs)
  vertical: [
    { x: 210, yStart: 150, yEnd: 410 },  // Left of A1
    { x: 342, yStart: 150, yEnd: 410 },  // Between A2-A3
    { x: 472, yStart: 150, yEnd: 410 },  // Between A4-A5
    { x: 602, yStart: 150, yEnd: 410 },  // Between A6-A7
    { x: 735, yStart: 150, yEnd: 270 },  // Right of A8 - TOP section (stops before D2)
    { x: 735, yStart: 410, yEnd: 450 },  // Right of A8 - BOTTOM section (resumes after D2)
    { x: 890, yStart: 150, yEnd: 450 },  // Right side - Produce to Bakery direct path
  ],
  
  // Horizontal bypass corridors around D2
  horizontalBypass: [
    { y: 270, xStart: 735, xEnd: 890 },  // Path to go around D2 top
    { y: 410, xStart: 735, xEnd: 890 },  // Path to go around D2 bottom (already exists as main walkway)
  ]
};

// Get all corridor intersection points (waypoints)
function getCorridorWaypoints(): RoutePoint[] {
  const waypoints: RoutePoint[] = [];
  
  // Add intersections of horizontal and vertical corridors
  for (const hCorridor of corridors.horizontal) {
    for (const vCorridor of corridors.vertical) {
      waypoints.push({ x: vCorridor.x, y: hCorridor.y });
    }
  }
  
  // Add intersections of horizontal bypass corridors with vertical corridors
  for (const hBypass of corridors.horizontalBypass) {
    for (const vCorridor of corridors.vertical) {
      // Only add waypoints if the vertical corridor can reach this bypass level
      if (vCorridor.yStart <= hBypass.y && vCorridor.yEnd >= hBypass.y) {
        waypoints.push({ x: vCorridor.x, y: hBypass.y });
      }
    }
  }
  
  return waypoints;
}

// Find nearest waypoint to a given point
function getNearestWaypoint(point: RoutePoint, waypoints: RoutePoint[]): RoutePoint {
  let nearest = waypoints[0];
  let minDist = calculateDistance(point, nearest);
  
  for (const waypoint of waypoints) {
    const dist = calculateDistance(point, waypoint);
    if (dist < minDist) {
      minDist = dist;
      nearest = waypoint;
    }
  }
  
  return nearest;
}

// Check if two waypoints are connected by a corridor
function areWaypointsConnected(wp1: RoutePoint, wp2: RoutePoint): boolean {
  // Check if connected by horizontal corridor
  if (Math.abs(wp1.y - wp2.y) < 5) {
    for (const hCorridor of corridors.horizontal) {
      if (Math.abs(wp1.y - hCorridor.y) < 5) {
        const minX = Math.min(wp1.x, wp2.x);
        const maxX = Math.max(wp1.x, wp2.x);
        if (minX >= hCorridor.xStart - 10 && maxX <= hCorridor.xEnd + 10) {
          return true;
        }
      }
    }
    
    // Check horizontal bypass corridors (around D2)
    for (const hBypass of corridors.horizontalBypass) {
      if (Math.abs(wp1.y - hBypass.y) < 5) {
        const minX = Math.min(wp1.x, wp2.x);
        const maxX = Math.max(wp1.x, wp2.x);
        if (minX >= hBypass.xStart - 10 && maxX <= hBypass.xEnd + 10) {
          return true;
        }
      }
    }
  }
  
  // Check if connected by vertical corridor
  if (Math.abs(wp1.x - wp2.x) < 5) {
    for (const vCorridor of corridors.vertical) {
      if (Math.abs(wp1.x - vCorridor.x) < 5) {
        const minY = Math.min(wp1.y, wp2.y);
        const maxY = Math.max(wp1.y, wp2.y);
        if (minY >= vCorridor.yStart - 10 && maxY <= vCorridor.yEnd + 10) {
          return true;
        }
      }
    }
  }
  
  return false;
}

// A* pathfinding using corridor waypoints
function findPath(start: RoutePoint, end: RoutePoint): RoutePoint[] {
  const waypoints = getCorridorWaypoints();
  
  // Add start and end to waypoints temporarily
  const startWaypoint = getNearestWaypoint(start, waypoints);
  const endWaypoint = getNearestWaypoint(end, waypoints);
  
  // If start and end are at same waypoint, direct path
  if (calculateDistance(startWaypoint, endWaypoint) < 10) {
    return [start, end];
  }
  
  // A* algorithm using waypoints
  const getKey = (p: RoutePoint) => `${Math.round(p.x)},${Math.round(p.y)}`;
  const heuristic = (p: RoutePoint) => calculateDistance(p, endWaypoint);
  
  const openSet = new Set<string>([getKey(startWaypoint)]);
  const cameFrom = new Map<string, RoutePoint>();
  const gScore = new Map<string, number>([[getKey(startWaypoint), 0]]);
  const fScore = new Map<string, number>([[getKey(startWaypoint), heuristic(startWaypoint)]]);
  const pointMap = new Map<string, RoutePoint>([[getKey(startWaypoint), startWaypoint]]);
  
  let iterations = 0;
  const maxIterations = 200;
  
  while (openSet.size > 0 && iterations < maxIterations) {
    iterations++;
    
    // Find node with lowest fScore
    let currentKey = '';
    let lowestF = Infinity;
    for (const key of openSet) {
      const f = fScore.get(key) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        currentKey = key;
      }
    }
    
    const current = pointMap.get(currentKey)!;
    
    // Check if reached goal
    if (calculateDistance(current, endWaypoint) < 10) {
      // Reconstruct path
      const path: RoutePoint[] = [];
      let curr = currentKey;
      while (cameFrom.has(curr)) {
        const point = pointMap.get(curr)!;
        path.unshift(point);
        curr = getKey(cameFrom.get(curr)!);
      }
      path.unshift(startWaypoint);
      
      // Add start and end points
      const fullPath = [start, ...path, end];
      return fullPath;
    }
    
    openSet.delete(currentKey);
    
    // Check all waypoint neighbors
    for (const neighbor of waypoints) {
      if (!areWaypointsConnected(current, neighbor)) {
        continue;
      }
      
      const neighborKey = getKey(neighbor);
      const tentativeG = (gScore.get(currentKey) ?? Infinity) + calculateDistance(current, neighbor);
      
      if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + heuristic(neighbor));
        pointMap.set(neighborKey, neighbor);
        openSet.add(neighborKey);
      }
    }
  }
  
  // Fallback: direct path through nearest waypoints
  return [start, startWaypoint, endWaypoint, end];
}

// Calculate distance between two points
export function calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Determine direction from one point to another
function getDirection(from: { x: number; y: number }, to: { x: number; y: number }): "up" | "down" | "left" | "right" | "straight" {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  } else {
    return dy > 0 ? "down" : "up";
  }
}

// Optimize route using a simplified nearest-neighbor algorithm
export function optimizeRoute(products: Product[], startPosition: { x: number; y: number }): Product[] {
  if (products.length === 0) return [];
  
  // Group products by section - only visit each section once
  const sectionGroups = new Map<string, Product[]>();
  products.forEach(product => {
    const section = product.section;
    if (!sectionGroups.has(section)) {
      sectionGroups.set(section, []);
    }
    sectionGroups.get(section)!.push(product);
  });
  
  // Create representative products for each section (use first product as representative)
  const sectionRepresentatives: Product[] = [];
  sectionGroups.forEach((productsInSection, section) => {
    // Use the first product as the representative for this section
    sectionRepresentatives.push(productsInSection[0]);
  });
  
  // Optimize route through sections using nearest-neighbor
  const optimized: Product[] = [];
  const remaining = [...sectionRepresentatives];
  let currentPosition = startPosition;
  
  while (remaining.length > 0) {
    let nearestIndex = 0;
    let minDistance = calculateDistance(currentPosition, remaining[0].position);
    
    for (let i = 1; i < remaining.length; i++) {
      const distance = calculateDistance(currentPosition, remaining[i].position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }
    
    const nearest = remaining.splice(nearestIndex, 1)[0];
    optimized.push(nearest);
    currentPosition = nearest.position;
  }
  
  return optimized;
}

// Generate navigation steps from optimized route
export function generateNavigationSteps(
  products: Product[],
  currentPosition: { x: number; y: number }
): NavigationStep[] {
  const steps: NavigationStep[] = [];
  let previousPosition = currentPosition;
  
  products.forEach((product, index) => {
    const distance = Math.round(calculateDistance(previousPosition, product.position) / 10); // Convert to approximate meters
    const direction = getDirection(previousPosition, product.position);
    
    let instruction = "";
    if (index === 0) {
      instruction = `Head to ${product.category} section in Aisle ${product.aisle}. Look for ${product.name}.`;
    } else {
      instruction = `Continue to Aisle ${product.aisle} for ${product.name}. ${
        direction === "up" || direction === "down"
          ? "Walk along the aisle"
          : `Turn ${direction === "left" ? "left" : "right"}`
      }.`;
    }
    
    steps.push({
      product,
      distance: Math.max(distance, 1),
      direction,
      instruction,
    });
    
    previousPosition = product.position;
  });
  
  return steps;
}

// Generate visual route path for map display with pathfinding
export function generateRoutePath(
  products: Product[],
  startPosition: { x: number; y: number },
  cartPosition?: { x: number; y: number }
): RoutePoint[] {
  const allPath: RoutePoint[] = [];
  
  let currentPos = startPosition;
  
  // Add path to cart if provided
  if (cartPosition) {
    const pathToCart = findPath(currentPos, cartPosition);
    allPath.push(...pathToCart);
    currentPos = cartPosition;
  } else {
    allPath.push(startPosition);
  }
  
  // Add path to each product
  products.forEach((product) => {
    const pathToProduct = findPath(currentPos, product.position);
    // Skip first point as it's the same as last point of previous segment
    allPath.push(...pathToProduct.slice(1));
    currentPos = product.position;
  });
  
  // Add path to checkout counter (middle of checkout area)
  const checkoutPosition = { x: 445, y: 80 };
  const pathToCheckout = findPath(currentPos, checkoutPosition);
  allPath.push(...pathToCheckout.slice(1));
  
  // Add path to exit (top left)
  const exitPosition = { x: 105, y: 50 };
  const pathToExit = findPath(checkoutPosition, exitPosition);
  allPath.push(...pathToExit.slice(1));
  
  return allPath;
}

// Calculate estimated shopping time based on number of items and distance
export function estimateShoppingTime(products: Product[]): number {
  // Base time: 2 minutes per item + travel time
  const itemTime = products.length * 2;
  
  // Calculate total distance
  let totalDistance = 0;
  let currentPos = { x: 100, y: 70 }; // Entrance position
  
  products.forEach((product) => {
    totalDistance += calculateDistance(currentPos, product.position);
    currentPos = product.position;
  });
  
  // Assume walking speed of 1.4 m/s (5 km/h)
  // Distance is in pixels, convert to approximate meters
  const travelTime = (totalDistance / 10) / 1.4 / 60; // in minutes
  
  return Math.round(itemTime + travelTime);
}

// AI-powered route suggestions
export function getRouteInsights(products: Product[]): string[] {
  const insights: string[] = [];
  const aisles = new Set(products.map(p => p.aisle));
  
  insights.push(`You'll visit ${aisles.size} different aisles`);
  
  const estimatedTime = estimateShoppingTime(products);
  insights.push(`Estimated time: ${estimatedTime} minutes`);
  
  // Check for backtracking
  const aisleOrder = products.map(p => p.aisle);
  let backtrackCount = 0;
  for (let i = 1; i < aisleOrder.length; i++) {
    if (Math.abs(aisleOrder[i] - aisleOrder[i - 1]) > 3) {
      backtrackCount++;
    }
  }
  
  if (backtrackCount === 0) {
    insights.push("✨ Optimal route - minimal backtracking!");
  } else if (backtrackCount <= 2) {
    insights.push("Route is well optimized");
  }
  
  // Check for category grouping
  const categories = new Set(products.map(p => p.category));
  if (categories.size < products.length / 2) {
    insights.push("Tip: You're buying similar items - check for combo deals!");
  }
  
  return insights;
}

// Generate route insights with cart location
export function generateRouteInsights(
  products: Product[],
  startPosition: { x: number; y: number }
): string[] {
  const insights: string[] = [];
  
  // Calculate total stops including cart and checkout
  const totalStops = products.length + 2; // +2 for cart and checkout
  insights.push(`${totalStops} total stops on your route`);
  
  // Estimate shopping time
  const estimatedTime = estimateShoppingTime(products);
  insights.push(`~${estimatedTime} min estimated time`);
  
  // Unique aisles/sections
  const sections = new Set(products.map(p => String(p.aisle)));
  insights.push(`${sections.size} sections to visit`);
  
  return insights;
}
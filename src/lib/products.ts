export interface Product {
  id: string;
  name: string;
  category: string;
  aisle: number | string;
  section: string;
  position: { x: number; y: number };
  price: number;
  keywords: string[];
  outOfStock?: boolean;
  brand?: string;
}

export interface StoreSection {
  id: string;
  name: string;
  aisle: number | string;
  position: { x: number; y: number };
  width: number;
  height: number;
  type?: "entrance" | "exit" | "checkout" | "aisle" | "department" | "display";
}

// Store dimensions: 1000x600
export const storeSections: StoreSection[] = [
  // Entrance (top right - green area)
  { id: "entrance", name: "Enter", aisle: 0, position: { x: 780, y: 10 }, width: 220, height: 80, type: "entrance" },
  
  // Exit (top left - pink area)
  { id: "exit", name: "Exit", aisle: 0, position: { x: 0, y: 10 }, width: 210, height: 80, type: "exit" },
  
  // Checkout counters (top center)
  { id: "checkout1", name: "C O", aisle: "C1", position: { x: 295, y: 30 }, width: 45, height: 90, type: "checkout" },
  { id: "checkout2", name: "C O", aisle: "C2", position: { x: 395, y: 30 }, width: 45, height: 90, type: "checkout" },
  { id: "checkout3", name: "C O", aisle: "C3", position: { x: 495, y: 30 }, width: 45, height: 90, type: "checkout" },
  { id: "checkout4", name: "C O", aisle: "C4", position: { x: 595, y: 30 }, width: 45, height: 90, type: "checkout" },
  
  // Cart area
  { id: "carts", name: "cart", aisle: 0, position: { x: 705, y: 50 }, width: 60, height: 70, type: "display" },
  
  // Dairy (left side)
  { id: "dairy", name: "Dairy", aisle: "Dairy", position: { x: 10, y: 190 }, width: 80, height: 230, type: "department" },
  
  // Produce (right side)
  { id: "produce", name: "Produce", aisle: "Produce", position: { x: 910, y: 190 }, width: 80, height: 230, type: "department" },
  
  // Display D1 (left circular area)
  { id: "display1", name: "D1", aisle: "D1", position: { x: 100, y: 170 }, width: 100, height: 100, type: "display" },
  
  // Display D2 (right circular area)
  { id: "display2", name: "D2", aisle: "D2", position: { x: 720, y: 290 }, width: 100, height: 100, type: "display" },
  
  // 8 Vertical Aisles (A1 - A8)
  { id: "aisle1", name: "A1", aisle: 1, position: { x: 230, y: 200 }, width: 45, height: 180, type: "aisle" },
  { id: "aisle2", name: "A2", aisle: 2, position: { x: 280, y: 200 }, width: 45, height: 180, type: "aisle" },
  { id: "aisle3", name: "A3", aisle: 3, position: { x: 360, y: 200 }, width: 45, height: 180, type: "aisle" },
  { id: "aisle4", name: "A4", aisle: 4, position: { x: 410, y: 200 }, width: 45, height: 180, type: "aisle" },
  { id: "aisle5", name: "A5", aisle: 5, position: { x: 490, y: 200 }, width: 45, height: 180, type: "aisle" },
  { id: "aisle6", name: "A6", aisle: 6, position: { x: 540, y: 200 }, width: 45, height: 180, type: "aisle" },
  { id: "aisle7", name: "A7", aisle: 7, position: { x: 620, y: 200 }, width: 45, height: 180, type: "aisle" },
  { id: "aisle8", name: "A8", aisle: 8, position: { x: 670, y: 200 }, width: 45, height: 180, type: "aisle" },
  
  // Bottom departments
  { id: "meat", name: "Meat", aisle: "Meat", position: { x: 110, y: 460 }, width: 120, height: 110, type: "department" },
  { id: "frozen", name: "Frozen Food", aisle: "Frozen", position: { x: 395, y: 490 }, width: 180, height: 80, type: "department" },
  { id: "bakery", name: "Bakery", aisle: "Bakery", position: { x: 770, y: 460 }, width: 120, height: 110, type: "department" },
];

export const products: Product[] = [
  // Dairy (left side)
  { id: "d1", name: "Milk", category: "Dairy", aisle: "Dairy", section: "dairy", position: { x: 50, y: 220 }, price: 3.99, keywords: ["dairy", "beverage"] },
  { id: "d2", name: "Eggs", category: "Dairy", aisle: "Dairy", section: "dairy", position: { x: 50, y: 260 }, price: 4.49, keywords: ["protein", "breakfast"] },
  { id: "d3", name: "Cheese", category: "Dairy", aisle: "Dairy", section: "dairy", position: { x: 50, y: 300 }, price: 5.99, keywords: ["dairy", "cheddar"] },
  { id: "d4", name: "Yogurt", category: "Dairy", aisle: "Dairy", section: "dairy", position: { x: 50, y: 340 }, price: 4.99, keywords: ["dairy", "probiotic"] },
  { id: "d5", name: "Butter", category: "Dairy", aisle: "Dairy", section: "dairy", position: { x: 50, y: 380 }, price: 4.49, keywords: ["dairy", "cooking"] },
  
  // Produce (right side)
  { id: "p1", name: "Apples", category: "Produce", aisle: "Produce", section: "produce", position: { x: 950, y: 220 }, price: 2.99, keywords: ["fruit", "fresh", "organic"] },
  { id: "p2", name: "Bananas", category: "Produce", aisle: "Produce", section: "produce", position: { x: 950, y: 260 }, price: 1.49, keywords: ["fruit", "fresh"] },
  { id: "p3", name: "Lettuce", category: "Produce", aisle: "Produce", section: "produce", position: { x: 950, y: 300 }, price: 1.99, keywords: ["vegetable", "fresh", "salad"] },
  { id: "p4", name: "Tomatoes", category: "Produce", aisle: "Produce", section: "produce", position: { x: 950, y: 340 }, price: 3.49, keywords: ["vegetable", "fresh"] },
  { id: "p5", name: "Carrots", category: "Produce", aisle: "Produce", section: "produce", position: { x: 950, y: 380 }, price: 1.79, keywords: ["vegetable", "fresh"] },
  
  // Display 2 items (promotional/seasonal)
  { id: "ds3", name: "Holiday Specials", category: "Seasonal", aisle: "D2", section: "display2", position: { x: 770, y: 330 }, price: 8.99, keywords: ["seasonal", "special", "holiday"] },
  { id: "ds4", name: "Organic Snacks", category: "Snacks", aisle: "D2", section: "display2", position: { x: 770, y: 360 }, price: 5.49, keywords: ["organic", "healthy", "snack"] },
  
  // Display D1 - Promotion items
  { id: "promo1", name: "Diet Coke", brand: "Coca-Cola", category: "Beverages", aisle: "D1", section: "display1", position: { x: 150, y: 270 }, price: 1.49, keywords: ["soda", "diet", "carbonated", "coke", "cola"] },
  
  // Aisle 1 - Cereal & Breakfast
  { id: "a1-1", name: "Cereal", category: "Breakfast", aisle: 1, section: "aisle1", position: { x: 252, y: 230 }, price: 4.99, keywords: ["cereal", "breakfast"] },
  { id: "a1-2", name: "Oatmeal", category: "Breakfast", aisle: 1, section: "aisle1", position: { x: 252, y: 270 }, price: 3.99, keywords: ["oatmeal", "breakfast", "healthy"] },
  { id: "a1-3", name: "Granola", category: "Breakfast", aisle: 1, section: "aisle1", position: { x: 252, y: 310 }, price: 5.49, keywords: ["granola", "breakfast", "healthy"] },
  { id: "a1-4", name: "Pancake Mix", category: "Breakfast", aisle: 1, section: "aisle1", position: { x: 252, y: 350 }, price: 3.49, keywords: ["pancake", "breakfast", "mix"] },
  
  // Aisle 2 - Coffee & Tea
  { id: "a2-1", name: "Coffee", category: "Beverages", aisle: 2, section: "aisle2", position: { x: 302, y: 230 }, price: 8.99, keywords: ["coffee", "caffeine", "breakfast"] },
  { id: "a2-2", name: "Tea", category: "Beverages", aisle: 2, section: "aisle2", position: { x: 302, y: 270 }, price: 5.49, keywords: ["tea", "herbal"] },
  { id: "a2-3", name: "Hot Chocolate", category: "Beverages", aisle: 2, section: "aisle2", position: { x: 302, y: 310 }, price: 4.99, keywords: ["chocolate", "drink", "warm"] },
  { id: "a2-4", name: "Creamer", category: "Beverages", aisle: 2, section: "aisle2", position: { x: 302, y: 350 }, price: 3.99, keywords: ["coffee", "creamer", "dairy"] },
  
  // Aisle 3 - Pasta & Sauces
  { id: "a3-1", name: "Spaghetti", category: "Pasta", aisle: 3, section: "aisle3", position: { x: 382, y: 230 }, price: 2.49, keywords: ["pasta", "italian"] },
  { id: "a3-2", name: "Penne", category: "Pasta", aisle: 3, section: "aisle3", position: { x: 382, y: 270 }, price: 2.49, keywords: ["pasta", "italian"] },
  { id: "a3-3", name: "Marinara Sauce", category: "Sauces", aisle: 3, section: "aisle3", position: { x: 382, y: 310 }, price: 3.99, keywords: ["sauce", "tomato", "italian"] },
  { id: "a3-4", name: "Alfredo Sauce", category: "Sauces", aisle: 3, section: "aisle3", position: { x: 382, y: 350 }, price: 4.49, keywords: ["sauce", "cream", "italian"] },
  
  // Aisle 4 - Canned Goods
  { id: "a4-1", name: "Canned Tomatoes", category: "Canned", aisle: 4, section: "aisle4", position: { x: 432, y: 230 }, price: 2.49, keywords: ["canned", "tomato", "cooking"] },
  { id: "a4-2", name: "Canned Beans", category: "Canned", aisle: 4, section: "aisle4", position: { x: 432, y: 270 }, price: 1.99, keywords: ["canned", "protein", "beans"] },
  { id: "a4-3", name: "Soup", category: "Canned", aisle: 4, section: "aisle4", position: { x: 432, y: 310 }, price: 2.99, keywords: ["soup", "canned", "meal"] },
  { id: "a4-4", name: "Tuna", category: "Canned", aisle: 4, section: "aisle4", position: { x: 432, y: 350 }, price: 3.49, keywords: ["fish", "protein", "canned"] },
  
  // Aisle 5 - Condiments
  { id: "a5-1", name: "Ketchup", category: "Condiments", aisle: 5, section: "aisle5", position: { x: 512, y: 230 }, price: 2.99, keywords: ["condiment", "tomato"] },
  { id: "a5-2", name: "Mustard", category: "Condiments", aisle: 5, section: "aisle5", position: { x: 512, y: 270 }, price: 2.49, keywords: ["condiment", "mustard"] },
  { id: "a5-3", name: "Mayonnaise", category: "Condiments", aisle: 5, section: "aisle5", position: { x: 512, y: 310 }, price: 3.99, keywords: ["condiment", "mayo"] },
  { id: "a5-4", name: "Olive Oil", category: "Cooking", aisle: 5, section: "aisle5", position: { x: 512, y: 350 }, price: 8.99, keywords: ["oil", "cooking", "healthy"] },
  
  // Aisle 6 - Snacks
  { id: "a6-1", name: "Chips", category: "Snacks", aisle: 6, section: "aisle6", position: { x: 562, y: 230 }, price: 3.99, keywords: ["snack", "salty", "crispy"] },
  { id: "a6-2", name: "Cookies", category: "Snacks", aisle: 6, section: "aisle6", position: { x: 562, y: 270 }, price: 4.49, keywords: ["snack", "sweet", "dessert"] },
  { id: "a6-3", name: "Crackers", category: "Snacks", aisle: 6, section: "aisle6", position: { x: 562, y: 310 }, price: 3.49, keywords: ["snack", "salty"] },
  { id: "a6-4", name: "Nuts", category: "Snacks", aisle: 6, section: "aisle6", position: { x: 562, y: 350 }, price: 6.99, keywords: ["snack", "protein", "healthy"] },
  
  // Aisle 7 - Beverages
  { id: "a7-1", name: "Soda", category: "Beverages", aisle: 7, section: "aisle7", position: { x: 642, y: 230 }, price: 5.99, keywords: ["soda", "carbonated"] },
  { id: "a7-2", name: "Water Bottles", category: "Beverages", aisle: 7, section: "aisle7", position: { x: 642, y: 270 }, price: 4.99, keywords: ["water", "hydration"] },
  { id: "a7-3", name: "Orange Juice", category: "Beverages", aisle: 7, section: "aisle7", position: { x: 642, y: 310 }, price: 4.99, keywords: ["juice", "breakfast", "vitamin-c"] },
  { id: "a7-4", name: "Sports Drinks", category: "Beverages", aisle: 7, section: "aisle7", position: { x: 642, y: 350 }, price: 3.99, keywords: ["sports", "hydration", "electrolyte"] },
  
  // Aisle 8 - Household
  { id: "a8-1", name: "Paper Towels", category: "Household", aisle: 8, section: "aisle8", position: { x: 692, y: 230 }, price: 12.99, keywords: ["paper", "cleaning"] },
  { id: "a8-2", name: "Dish Soap", category: "Household", aisle: 8, section: "aisle8", position: { x: 692, y: 270 }, price: 3.49, keywords: ["soap", "cleaning", "dishes"] },
  { id: "a8-3", name: "Laundry Detergent", category: "Household", aisle: 8, section: "aisle8", position: { x: 692, y: 310 }, price: 11.99, keywords: ["laundry", "cleaning", "detergent"] },
  { id: "a8-4", name: "Trash Bags", category: "Household", aisle: 8, section: "aisle8", position: { x: 692, y: 350 }, price: 8.99, keywords: ["bags", "trash", "garbage"] },
  
  // Meat department (bottom left)
  { id: "m1", name: "Crescent Turkey", brand: "Crescent", category: "Meat", aisle: "Meat", section: "meat", position: { x: 140, y: 495 }, price: 8.99, keywords: ["poultry", "protein", "fresh", "turkey"], outOfStock: true },
  { id: "m1-alt", name: "Perdue Chicken Breast", brand: "Perdue", category: "Meat", aisle: "Meat", section: "meat", position: { x: 140, y: 495 }, price: 9.49, keywords: ["poultry", "protein", "fresh", "chicken", "breast"] },
  { id: "m2", name: "Ground Beef", category: "Meat", aisle: "Meat", section: "meat", position: { x: 180, y: 495 }, price: 6.99, keywords: ["beef", "protein"] },
  { id: "m3", name: "Salmon Fillet", category: "Seafood", aisle: "Meat", section: "meat", position: { x: 140, y: 530 }, price: 12.99, keywords: ["fish", "seafood", "omega-3"] },
  { id: "m4", name: "Pork Chops", category: "Meat", aisle: "Meat", section: "meat", position: { x: 180, y: 530 }, price: 7.49, keywords: ["pork", "protein"] },
  
  // Frozen Food department (bottom center)
  { id: "f1", name: "Ice Cream", category: "Frozen", aisle: "Frozen", section: "frozen", position: { x: 420, y: 520 }, price: 5.99, keywords: ["dessert", "frozen", "sweet"] },
  { id: "f2", name: "Frozen Pizza", category: "Frozen", aisle: "Frozen", section: "frozen", position: { x: 460, y: 520 }, price: 6.99, keywords: ["frozen", "meal", "quick"] },
  { id: "f3", name: "Frozen Vegetables", category: "Frozen", aisle: "Frozen", section: "frozen", position: { x: 500, y: 520 }, price: 3.49, keywords: ["vegetable", "frozen"] },
  { id: "f4", name: "Frozen Berries", category: "Frozen", aisle: "Frozen", section: "frozen", position: { x: 540, y: 520 }, price: 4.99, keywords: ["fruit", "frozen", "smoothie"] },
  
  // Bakery department (bottom right)
  { id: "b1", name: "Whole Wheat Bread", category: "Bakery", aisle: "Bakery", section: "bakery", position: { x: 800, y: 495 }, price: 3.49, keywords: ["bread", "fresh", "wheat"] },
  { id: "b2", name: "Croissants", category: "Bakery", aisle: "Bakery", section: "bakery", position: { x: 840, y: 495 }, price: 4.99, keywords: ["pastry", "fresh", "french"] },
  { id: "b3", name: "Bagels", category: "Bakery", aisle: "Bakery", section: "bakery", position: { x: 800, y: 530 }, price: 3.99, keywords: ["bread", "breakfast"] },
  { id: "b4", name: "Muffins", category: "Bakery", aisle: "Bakery", section: "bakery", position: { x: 840, y: 530 }, price: 5.49, keywords: ["pastry", "breakfast", "sweet"] },
];

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(p => p.category === category);
};

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery) ||
    p.keywords.some(k => k.toLowerCase().includes(lowerQuery))
  );
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const categories = [
  "All",
  "Produce",
  "Bakery",
  "Meat",
  "Seafood",
  "Dairy",
  "Frozen",
  "Beverages",
  "Snacks",
  "Canned",
  "Breakfast",
  "Pasta",
  "Sauces",
  "Condiments",
  "Cooking",
  "Household",
  "Floral",
  "Seasonal"
];
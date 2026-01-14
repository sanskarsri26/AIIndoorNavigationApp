// Authentication and user management

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  type: "shopper" | "retailer" | "brand";
  storeName?: string;
  brandName?: string;
}

export interface PastOrder {
  id: string;
  date: string;
  storeName: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}

// Dummy users database
export const users: User[] = [
  // Shopper
  {
    id: "shopper1",
    email: "john@example.com",
    password: "shopper123",
    name: "John Doe",
    type: "shopper",
  },
  // Retailers
  {
    id: "retailer1",
    email: "retailer@mupod.com",
    password: "retailer123",
    name: "MU P.O.D Market",
    type: "retailer",
    storeName: "MU P.O.D Market",
  },
  // Brands
  {
    id: "brand1",
    email: "coke@brand.com",
    password: "coke123",
    name: "Coca-Cola",
    type: "brand",
    brandName: "Coca-Cola",
  },
  {
    id: "brand2",
    email: "crescent@brand.com",
    password: "crescent123",
    name: "Crescent Foods",
    type: "brand",
    brandName: "Crescent",
  },
];

// Past orders for shopper (john@example.com)
export const pastOrders: PastOrder[] = [
  {
    id: "order1",
    date: "2024-11-15",
    storeName: "MU P.O.D Market",
    items: [
      { productId: "p1", name: "Apples", quantity: 2, price: 2.99 },
      { productId: "b1", name: "Whole Wheat Bread", quantity: 1, price: 3.49 },
      { productId: "a2-1", name: "Coffee", quantity: 1, price: 8.99 },
      { productId: "a1-3", name: "Granola", quantity: 1, price: 5.49 },
    ],
    total: 20.96,
  },
  {
    id: "order2",
    date: "2024-11-20",
    storeName: "MU P.O.D Market",
    items: [
      { productId: "p1", name: "Apples", quantity: 3, price: 2.99 },
      { productId: "b1", name: "Whole Wheat Bread", quantity: 2, price: 3.49 },
      { productId: "d1", name: "Milk", quantity: 1, price: 3.99 },
      { productId: "a3-1", name: "Spaghetti", quantity: 2, price: 2.49 },
    ],
    total: 24.42,
  },
];

// Get frequently bought items (items in 2+ orders)
export function getFrequentlyBoughtItems(): string[] {
  const itemCounts = new Map<string, number>();
  
  pastOrders.forEach(order => {
    order.items.forEach(item => {
      const count = itemCounts.get(item.productId) || 0;
      itemCounts.set(item.productId, count + 1);
    });
  });
  
  // Return items that appear in 2 or more orders
  return Array.from(itemCounts.entries())
    .filter(([_, count]) => count >= 2)
    .map(([productId]) => productId);
}

// Authenticate user
export function authenticateUser(email: string, password: string, userType: "shopper" | "retailer" | "brand"): User | null {
  const user = users.find(
    u => u.email === email && u.password === password && u.type === userType
  );
  return user || null;
}

// Get user by ID
export function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id);
}

// Get past orders for a user
export function getPastOrdersForUser(userId: string): PastOrder[] {
  if (userId === "shopper1") {
    return pastOrders;
  }
  return [];
}


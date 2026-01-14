import { Sparkles, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Product, products } from "../lib/products";

interface AISuggestionsProps {
  shoppingList: Product[];
  onAddProduct: (product: Product) => void;
}

interface Suggestion {
  type: "paired" | "recipe";
  title: string;
  products: Product[];
  reason: string;
}

// AI logic to analyze shopping list and generate suggestions
function generateSuggestions(shoppingList: Product[]): Suggestion[] {
  if (shoppingList.length === 0) return [];
  
  const suggestions: Suggestion[] = [];
  const productNames = shoppingList.map(p => p.name.toLowerCase());
  const categories = shoppingList.map(p => p.category.toLowerCase());
  
  // Check for out of stock Crescent Turkey and suggest alternative
  const hasCrescentTurkey = shoppingList.some(p => p.id === "m1" && p.outOfStock);
  if (hasCrescentTurkey) {
    const perdueChicken = products.find(p => p.id === "m1-alt");
    if (perdueChicken && !shoppingList.find(p => p.id === perdueChicken.id)) {
      suggestions.push({
        type: "paired",
        title: "⚠️ Out of Stock Alternative",
        products: [perdueChicken],
        reason: "Crescent Turkey is out of stock. Try Perdue Chicken Breast instead - same quality!"
      });
    }
  }
  
  // Recipe-based suggestions
  
  // Baking detection
  if (productNames.some(n => n.includes("flour") || n.includes("sugar"))) {
    if (!productNames.some(n => n.includes("eggs"))) {
      const eggs = products.find(p => p.name === "Eggs");
      if (eggs && !shoppingList.find(p => p.id === eggs.id)) {
        suggestions.push({
          type: "recipe",
          title: "Making baked goods?",
          products: [eggs],
          reason: "Eggs are essential for most baking recipes"
        });
      }
    }
    if (!productNames.some(n => n.includes("butter"))) {
      const butter = products.find(p => p.name === "Butter");
      if (butter && !shoppingList.find(p => p.id === butter.id)) {
        suggestions.push({
          type: "recipe",
          title: "Baking essentials",
          products: [butter],
          reason: "Butter adds richness to baked goods"
        });
      }
    }
  }
  
  // Apple pie detection
  if (productNames.some(n => n.includes("apple"))) {
    const suggestedProducts: Product[] = [];
    if (!productNames.some(n => n.includes("cinnamon"))) {
      // Cinnamon would need to be added to product list, but let's suggest similar
      const granola = products.find(p => p.name === "Granola");
      if (granola && !shoppingList.find(p => p.id === granola.id)) {
        suggestedProducts.push(granola);
      }
    }
    if (suggestedProducts.length > 0) {
      suggestions.push({
        type: "recipe",
        title: "Making apple treats?",
        products: suggestedProducts,
        reason: "Perfect pairing for apples"
      });
    }
  }
  
  // Pasta dish detection
  if (productNames.some(n => n.includes("pasta") || n.includes("spaghetti") || n.includes("penne"))) {
    const suggestedProducts: Product[] = [];
    if (!productNames.some(n => n.includes("sauce"))) {
      const marinara = products.find(p => p.name === "Marinara Sauce");
      if (marinara && !shoppingList.find(p => p.id === marinara.id)) {
        suggestedProducts.push(marinara);
      }
    }
    if (!categories.includes("dairy") || !productNames.some(n => n.includes("cheese"))) {
      const cheese = products.find(p => p.name === "Cheese");
      if (cheese && !shoppingList.find(p => p.id === cheese.id)) {
        suggestedProducts.push(cheese);
      }
    }
    if (suggestedProducts.length > 0) {
      suggestions.push({
        type: "recipe",
        title: "Making pasta?",
        products: suggestedProducts,
        reason: "Complete your pasta dinner"
      });
    }
  }
  
  // Breakfast detection
  if (categories.includes("breakfast") || productNames.some(n => n.includes("cereal") || n.includes("pancake") || n.includes("oatmeal"))) {
    const suggestedProducts: Product[] = [];
    if (!categories.includes("dairy") || !productNames.some(n => n.includes("milk"))) {
      const milk = products.find(p => p.name === "Milk");
      if (milk && !shoppingList.find(p => p.id === milk.id)) {
        suggestedProducts.push(milk);
      }
    }
    if (!productNames.some(n => n.includes("banana"))) {
      const bananas = products.find(p => p.name === "Bananas");
      if (bananas && !shoppingList.find(p => p.id === bananas.id)) {
        suggestedProducts.push(bananas);
      }
    }
    if (suggestedProducts.length > 0) {
      suggestions.push({
        type: "recipe",
        title: "Complete your breakfast",
        products: suggestedProducts,
        reason: "Great breakfast additions"
      });
    }
  }
  
  // Salad detection
  if (productNames.some(n => n.includes("lettuce") || n.includes("salad"))) {
    const suggestedProducts: Product[] = [];
    if (!productNames.some(n => n.includes("tomato"))) {
      const tomatoes = products.find(p => p.name === "Tomatoes");
      if (tomatoes && !shoppingList.find(p => p.id === tomatoes.id)) {
        suggestedProducts.push(tomatoes);
      }
    }
    if (!productNames.some(n => n.includes("olive oil"))) {
      const oliveOil = products.find(p => p.name === "Olive Oil");
      if (oliveOil && !shoppingList.find(p => p.id === oliveOil.id)) {
        suggestedProducts.push(oliveOil);
      }
    }
    if (suggestedProducts.length > 0) {
      suggestions.push({
        type: "recipe",
        title: "Making salad?",
        products: suggestedProducts,
        reason: "Fresh salad essentials"
      });
    }
  }
  
  // Paired suggestions (items that go well together)
  
  // Coffee + Creamer
  if (productNames.some(n => n.includes("coffee"))) {
    const creamer = products.find(p => p.name === "Creamer");
    if (creamer && !shoppingList.find(p => p.id === creamer.id)) {
      suggestions.push({
        type: "paired",
        title: "Best paired with",
        products: [creamer],
        reason: "Perfect addition to your coffee"
      });
    }
  }
  
  // Chips + Soda
  if (categories.includes("snacks")) {
    const soda = products.find(p => p.name === "Soda");
    if (soda && !shoppingList.find(p => p.id === soda.id) && !productNames.some(n => n.includes("soda"))) {
      suggestions.push({
        type: "paired",
        title: "Best paired with",
        products: [soda],
        reason: "Great with snacks"
      });
    }
  }
  
  // Meat + Frozen Vegetables
  if (categories.includes("meat")) {
    const frozenVeg = products.find(p => p.name === "Frozen Vegetables");
    if (frozenVeg && !shoppingList.find(p => p.id === frozenVeg.id)) {
      suggestions.push({
        type: "paired",
        title: "Best paired with",
        products: [frozenVeg],
        reason: "Quick and healthy side dish"
      });
    }
  }
  
  // Bread + Butter or Cheese
  if (productNames.some(n => n.includes("bread") || n.includes("bagel"))) {
    const suggestedProducts: Product[] = [];
    if (!productNames.some(n => n.includes("butter"))) {
      const butter = products.find(p => p.name === "Butter");
      if (butter && !shoppingList.find(p => p.id === butter.id)) {
        suggestedProducts.push(butter);
      }
    }
    if (!productNames.some(n => n.includes("cheese"))) {
      const cheese = products.find(p => p.name === "Cheese");
      if (cheese && !shoppingList.find(p => p.id === cheese.id)) {
        suggestedProducts.push(cheese);
      }
    }
    if (suggestedProducts.length > 0) {
      suggestions.push({
        type: "paired",
        title: "Best paired with",
        products: suggestedProducts,
        reason: "Classic bread toppings"
      });
    }
  }
  
  // Limit to 3 suggestions max
  return suggestions.slice(0, 3);
}

export function AISuggestions({ shoppingList, onAddProduct }: AISuggestionsProps) {
  const suggestions = generateSuggestions(shoppingList);
  
  if (suggestions.length === 0) return null;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-400" />
        <span className="text-white text-sm">AI Suggestions</span>
      </div>
      
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-lg p-3"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge 
                  variant="secondary" 
                  className="bg-purple-500/20 text-purple-300 border-purple-500/50 text-xs"
                >
                  {suggestion.type === "recipe" ? "Recipe Suggestion" : "Pairs Well"}
                </Badge>
              </div>
              <p className="text-white text-sm">{suggestion.title}</p>
              <p className="text-purple-300/70 text-xs mt-1">{suggestion.reason}</p>
            </div>
          </div>
          
          <div className="space-y-2 mt-3">
            {suggestion.products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between bg-zinc-900 rounded-lg p-2 border border-purple-500/30"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">{product.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-cyan-400/70 text-xs">{product.category}</span>
                    <span className="text-cyan-400/50 text-xs">•</span>
                    <span className="text-green-400 text-xs">${product.price.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onAddProduct(product)}
                  className="bg-purple-600 hover:bg-purple-700 h-8 px-3"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
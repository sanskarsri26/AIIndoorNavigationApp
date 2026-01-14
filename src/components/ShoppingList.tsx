import { Trash2, MapPin, ShoppingCart, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Product } from "../lib/products";
import { AISuggestions } from "./AISuggestions";

interface ShoppingListProps {
  products: Product[];
  checkedProducts: Set<string>;
  onRemoveProduct: (productId: string) => void;
  onToggleChecked: (productId: string) => void;
  onStartNavigation: () => void;
  onAddProduct: (product: Product) => void;
}

export function ShoppingList({
  products,
  checkedProducts,
  onRemoveProduct,
  onToggleChecked,
  onStartNavigation,
  onAddProduct
}: ShoppingListProps) {
  const totalItems = products.length;
  const checkedItems = checkedProducts.size;
  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;
  
  // Group products by section
  const productsBySection = products.reduce((acc, product) => {
    const sectionKey = product.section;
    if (!acc[sectionKey]) {
      acc[sectionKey] = {
        products: [],
        aisle: product.aisle,
        category: product.category
      };
    }
    acc[sectionKey].products.push(product);
    return acc;
  }, {} as Record<string, { products: Product[], aisle: string | number, category: string }>);
  
  const sections = Object.keys(productsBySection);
  
  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-lg p-4 border border-cyan-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-cyan-400" />
            <span className="text-white">Shopping List</span>
          </div>
          <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50">
            {checkedItems} / {totalItems} items
          </Badge>
        </div>
        
        {/* Progress Bar */}
        {totalItems > 0 && (
          <div className="space-y-2">
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-cyan-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cyan-400/70">Progress: {Math.round(progress)}%</span>
              <span className="text-green-400">Est. Total: ${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Start Navigation Button */}
      {products.length > 0 && (
        <Button
          onClick={onStartNavigation}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-black"
          size="lg"
        >
          <MapPin className="h-5 w-5 mr-2" />
          Start Navigation
        </Button>
      )}
      
      {/* Products List - Grouped by Section */}
      {products.length > 0 ? (
        <ScrollArea className="h-[400px]">
          <div className="space-y-4 pr-4">
            {sections.map((section) => {
              const { products: sectionProducts, aisle, category } = productsBySection[section];
              const allChecked = sectionProducts.every(p => checkedProducts.has(p.id));
              
              return (
                <div key={section} className="space-y-2">
                  <div className="flex items-center gap-2 sticky top-0 bg-black py-2 z-10">
                    <Badge variant="outline" className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/50">
                      {typeof aisle === 'number' ? `Aisle ${aisle}` : aisle} - {category}
                    </Badge>
                    <div className="h-px flex-1 bg-cyan-500/30"></div>
                    <span className="text-xs text-cyan-400/70">
                      {sectionProducts.length} {sectionProducts.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  
                  {/* Section Card - Shows all items in this section together */}
                  <div
                    className={`bg-zinc-900 border rounded-lg p-3 transition-all ${
                      allChecked
                        ? "border-green-400 bg-green-500/10"
                        : "border-cyan-500/30 hover:border-cyan-400/50"
                    }`}
                  >
                    <div className="space-y-2">
                      {sectionProducts.map((product, index) => {
                        const isChecked = checkedProducts.has(product.id);
                        
                        return (
                          <div key={product.id}>
                            <div className="flex items-start gap-2">
                              <div className="pt-0.5">
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() => onToggleChecked(product.id)}
                                  id={`product-${product.id}`}
                                />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <label
                                  htmlFor={`product-${product.id}`}
                                  className={`cursor-pointer block text-sm ${
                                    isChecked ? "line-through text-cyan-400/50" : "text-white"
                                  }`}
                                >
                                  {product.name}
                                </label>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-xs ${isChecked ? "text-cyan-400/50" : "text-green-400"}`}>
                                    ${product.price.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                              
                              {isChecked && (
                                <div className="shrink-0 bg-green-500 text-white rounded-full p-1">
                                  <Check className="h-3 w-3" />
                                </div>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveProduct(product.id)}
                                className="shrink-0 h-8 w-8 p-0 hover:bg-red-500/20"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                              </Button>
                            </div>
                            {index < sectionProducts.length - 1 && (
                              <div className="h-px bg-cyan-500/30 my-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-12 text-cyan-400/50">
          <ShoppingCart className="h-16 w-16 mx-auto mb-3 opacity-30" />
          <p>Your shopping list is empty</p>
          <p className="text-cyan-400/30 mt-1">Search and add products to get started</p>
        </div>
      )}
      
      {/* Summary */}
      {products.length > 0 && (
        <div className="bg-zinc-900 rounded-lg p-4 border border-cyan-500/30">
          <div className="flex justify-between items-center">
            <span className="text-cyan-400">Total ({totalItems} items):</span>
            <span className="text-white">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      )}
      
      {/* AI Suggestions */}
      <AISuggestions shoppingList={products} onAddProduct={onAddProduct} />
    </div>
  );
}
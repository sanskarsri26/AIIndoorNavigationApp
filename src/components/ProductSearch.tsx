import { useState, useEffect } from "react";
import { Search, Plus, Check, PackagePlus, Sparkles } from "lucide-react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { products, Product } from "../lib/products";
import { AISuggestions } from "./AISuggestions";

interface ProductSearchProps {
  onAddProduct: (product: Product) => void;
  onRequestOutOfStock?: (product: Product) => void;
  selectedProducts: Product[];
}

export function ProductSearch({ onAddProduct, onRequestOutOfStock, selectedProducts }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const categories = ["All", "Produce", "Dairy", "Bakery", "Meat", "Seafood", "Frozen", "Beverages", "Snacks", "Breakfast"];
  
  // Generate search suggestions based on shopping list
  useEffect(() => {
    if (selectedProducts.length > 0) {
      const newSuggestions = ["milk", "bread", "eggs", "cheese"];
      setSuggestions(newSuggestions);
    } else {
      setSuggestions(["produce", "dairy", "bakery", "meat"]);
    }
  }, [selectedProducts]);
  
  // Search products
  useEffect(() => {
    if (searchQuery.trim()) {
      let results = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (selectedCategory !== "All") {
        results = results.filter(p => p.category === selectedCategory);
      }
      
      setSearchResults(results.slice(0, 20));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedCategory]);
  
  const isProductInList = (product: Product) => {
    return selectedProducts.some(p => p.id === product.id);
  };
  
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-400" />
        <Input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-zinc-900 border-cyan-500/30 text-white placeholder:text-cyan-400/50 focus:border-cyan-400"
        />
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg p-3 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-white text-sm">AI Suggestions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Badge
                key={suggestion}
                variant="secondary"
                className="cursor-pointer bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/50 text-xs"
                onClick={() => {
                  const product = products.find(p => p.name.toLowerCase().includes(suggestion.toLowerCase()) && !selectedProducts.some(cp => cp.id === p.id));
                  if (product) onAddProduct(product);
                }}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`cursor-pointer text-xs shrink-0 ${
                selectedCategory === category
                  ? "bg-cyan-500 text-black hover:bg-cyan-400"
                  : "bg-zinc-900 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/10"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </ScrollArea>

      {/* Products Grid */}
      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-1 gap-3 pr-4">
          {searchResults.map((product) => {
            const isSelected = isProductInList(product);

            return (
              <div
                key={product.id}
                className={`bg-zinc-900 border rounded-lg p-3 transition-all ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-500/10"
                    : "border-cyan-500/30 hover:border-cyan-400/50"
                } ${product.outOfStock ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white text-sm">{product.name}</h3>
                      {product.outOfStock && (
                        <Badge variant="destructive" className="text-[10px] bg-red-500/20 text-red-400 border-red-500/50">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="text-cyan-400/70">{product.category}</span>
                      <span className="text-cyan-400/50">•</span>
                      <Badge variant="outline" className="text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/50">
                        Aisle {product.aisle}
                      </Badge>
                    </div>
                    <p className="text-green-400 mt-1">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>

                  <Button
                    onClick={() => product.outOfStock && onRequestOutOfStock ? onRequestOutOfStock(product) : onAddProduct(product)}
                    disabled={isSelected}
                    size="sm"
                    className={`shrink-0 h-8 ${
                      product.outOfStock
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : isSelected
                        ? "bg-cyan-500 text-black"
                        : "bg-cyan-500 hover:bg-cyan-400 text-black"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Added
                      </>
                    ) : product.outOfStock ? (
                      <>
                        <PackagePlus className="h-3.5 w-3.5 mr-1" />
                        Request
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {searchResults.length === 0 && (
        <div className="text-center py-8 text-cyan-400/50">
          <PackagePlus className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No products found</p>
          <p className="text-cyan-400/30 mt-1 text-sm">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
"use client";

import { Recommendations, ProductItem } from "@/utils/affiliateUtils";
import { getItemIcon } from "@/utils/materialIcons";

interface ResultsDisplayProps {
  recommendations: Recommendations;
  selectedItems: ProductItem[];
  onSelectItem: (item: ProductItem) => void;
  onCreateShoppingList: () => void;
}

export default function ResultsDisplay({ 
  recommendations, 
  selectedItems, 
  onSelectItem, 
  onCreateShoppingList 
}: ResultsDisplayProps) {
  const { materials, tools } = recommendations;
  
  const isSelected = (item: ProductItem) => {
    return selectedItems.some(selected => selected.name === item.name);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-secondary">Your Project Recommendations</h2>
        <p className="text-gray-600 mt-2">
          Here are the materials and tools we recommend for your project.
          Select items to add to your shopping list.
        </p>
      </div>
      
      {/* Materials Section */}
      <div>
        <h3 className="text-lg font-medium border-b pb-2 mb-3">Materials</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.length > 0 ? (
            materials.map((item, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                  isSelected(item) 
                    ? 'border-primary bg-gradient-to-br from-primary/10 to-blue-500/5' 
                    : 'hover:border-gray-300 bg-gradient-to-br from-gray-50 to-white'
                }`}
                onClick={() => !isSelected(item) && onSelectItem(item)}
              >
                <div className="flex items-center">
                  {/* Dynamic material icon */}
                  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-primary">
                    {getItemIcon(item.name, true, "h-6 w-6")}
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    {isSelected(item) && (
                      <span className="text-xs text-primary font-medium">Added to shopping list</span>
                    )}
                  </div>
                  {!isSelected(item) && (
                    <button 
                      className="text-xs border border-primary text-primary px-2 py-1 rounded hover:bg-primary hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item);
                      }}
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-2 text-gray-500 italic">No materials recommended for this project.</p>
          )}
        </div>
      </div>
      
      {/* Tools Section */}
      <div>
        <h3 className="text-lg font-medium border-b pb-2 mb-3">Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.length > 0 ? (
            tools.map((item, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                  isSelected(item) 
                    ? 'border-primary bg-gradient-to-br from-primary/10 to-green-500/5' 
                    : 'hover:border-gray-300 bg-gradient-to-br from-gray-50 to-white'
                }`}
                onClick={() => !isSelected(item) && onSelectItem(item)}
              >
                <div className="flex items-center">
                  {/* Dynamic tool icon */}
                  <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-primary">
                    {getItemIcon(item.name, false, "h-6 w-6")}
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    {isSelected(item) && (
                      <span className="text-xs text-primary font-medium">Added to shopping list</span>
                    )}
                  </div>
                  {!isSelected(item) && (
                    <button 
                      className="text-xs border border-primary text-primary px-2 py-1 rounded hover:bg-primary hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item);
                      }}
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-2 text-gray-500 italic">No tools recommended for this project.</p>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between mt-8 pt-4 border-t">
        <span className="text-sm text-gray-500">
          {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
        </span>
        <button
          onClick={onCreateShoppingList}
          disabled={selectedItems.length === 0}
          className={`btn ${
            selectedItems.length > 0 ? 'btn-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Create Shopping List
        </button>
      </div>
    </div>
  );
} 
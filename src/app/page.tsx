"use client";

import { useEffect, useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import ResultsDisplay from "@/components/ResultsDisplay";
import EmailCaptureForm from "@/components/EmailCaptureForm";
import { ProductItem, Recommendations } from "@/utils/affiliateUtils";
import { getItemIcon } from "@/utils/materialIcons";

// Define the FormData interface for the email capture form
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
}

export default function Home() {
  const [chatStep, setChatStep] = useState<'chat' | 'results' | 'email' | 'shopping-list'>('chat');
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [selectedItems, setSelectedItems] = useState<ProductItem[]>([]);
  
  // Reset chat step on mount
  useEffect(() => {
    setChatStep('chat');
    setSelectedItems([]);
  }, []);
  
  const onRecommendationsGenerated = (newRecommendations: Recommendations) => {
    setRecommendations(newRecommendations);
    setChatStep('results');
  };
  
  const onSelectItem = (item: ProductItem) => {
    console.log("Selected item:", item);
    setSelectedItems(prev => {
      // Check if item is already selected
      const exists = prev.some(i => i.name === item.name);
      if (exists) {
        // Remove if already selected
        return prev.filter(i => i.name !== item.name);
      } else {
        // Add if not selected
        return [...prev, item];
      }
    });
  };
  
  const onCreateShoppingList = () => {
    // Navigate to shopping list view
    setChatStep('shopping-list');
  };
  
  const handleSaveViaEmail = () => {
    setChatStep('email');
  };
  
  const handleBackToResults = () => {
    setChatStep('results');
  };
  
  const handleEmailSubmit = (formData: FormData) => {
    // Process the email submission
    console.log('Email submitted with data:', formData);
    
    // Return to chat after submission
    setChatStep('chat');
    setSelectedItems([]);
    setRecommendations(null);
  };
  
  return (
    <main className="min-h-screen">
      {chatStep === 'chat' && (
        <div className="container-narrow py-8">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-secondary">AI Construction Assistant</h1>
            <p className="text-gray-600">Describe your project to get personalized materials and tools recommendations</p>
          </div>
          <ChatInterface onRecommendationsGenerated={onRecommendationsGenerated} />
        </div>
      )}
      
      {chatStep === 'results' && recommendations && (
        <div className="container-narrow py-8">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-secondary">Project Recommendations</h1>
            <p className="text-gray-600">Select items to add to your shopping list</p>
          </div>
          <ResultsDisplay 
            recommendations={recommendations}
            selectedItems={selectedItems}
            onSelectItem={onSelectItem}
            onCreateShoppingList={onCreateShoppingList}
          />
          <div className="mt-4 text-center">
            <button
              onClick={() => setChatStep('chat')}
              className="text-primary hover:underline"
            >
              Return to Chat
            </button>
          </div>
        </div>
      )}
      
      {chatStep === 'email' && (
        <div className="my-6 max-w-lg mx-auto">
          <EmailCaptureForm
            selectedItems={selectedItems}
            onSubmit={handleEmailSubmit}
            onCancel={handleBackToResults}
          />
        </div>
      )}
      
      {chatStep === 'shopping-list' && selectedItems.length > 0 && (
        <div className="my-6 max-w-3xl mx-auto">
          <h2 className="text-2xl mb-4 font-bold">Your Shopping List</h2>
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="py-2 px-4 text-left">Item</th>
                <th className="py-2 px-4 text-left">Type</th>
                <th className="py-2 px-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item, index) => {
                const itemType = recommendations?.materials.some(m => m.name === item.name) 
                  ? 'Material' 
                  : recommendations?.tools.some(t => t.name === item.name) 
                    ? 'Tool' 
                    : 'Item';
                
                return (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2 px-4">{item.name}</td>
                    <td className="py-2 px-4">{itemType}</td>
                    <td className="py-2 px-4">
                      {item.affiliate_url && (
                        <a 
                          href={item.affiliate_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 underline hover:text-blue-700"
                        >
                          Buy on Amazon
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <div className="flex justify-between mt-4">
            <button
              onClick={handleBackToResults}
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Back to Recommendations
            </button>
            <button
              onClick={handleSaveViaEmail}
              className="btn btn-primary"
            >
              Save via Email
            </button>
          </div>
        </div>
      )}
    </main>
  );
} 
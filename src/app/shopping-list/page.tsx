"use client";

import { useEffect, useState } from "react";
import { ProductItem } from "@/utils/affiliateUtils";
import Link from 'next/link';

export default function ShoppingList() {
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, this would fetch from an API or local storage
    // For the MVP, we'll simulate loading data from localStorage
    const loadData = () => {
      try {
        const savedUserData = localStorage.getItem('userData');
        const savedItems = localStorage.getItem('shoppingList');
        
        if (savedUserData) {
          setUserData(JSON.parse(savedUserData));
        }
        
        if (savedItems) {
          setItems(JSON.parse(savedItems));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Simulate network delay
    setTimeout(loadData, 800);
  }, []);

  if (loading) {
    return (
      <div className="container-narrow py-8">
        <div className="card flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading your shopping list...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userData || items.length === 0) {
    return (
      <div className="container-narrow py-8">
        <div className="card">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-secondary mb-4">No Shopping List Found</h2>
            <p className="text-gray-600 mb-6">
              It looks like you don't have an active shopping list yet.
            </p>
            <Link href="/" className="btn btn-primary">
              Create a New Project
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container-narrow py-8 bg-white">
        <div className="card">
          <div className="border-b pb-4 mb-6">
            <h1 className="text-2xl font-bold text-secondary">Your Shopping List</h1>
            {userData && (
              <p className="text-gray-600 mt-1">
                Created for {userData.name} ({userData.email})
              </p>
            )}
          </div>

          <div className="space-y-8">
            {/* Materials Section */}
            <div>
              <h2 className="text-lg font-medium border-b pb-2 mb-4">Materials</h2>
              <div className="space-y-3">
                {items.filter(item => 
                  // This is a simple heuristic to separate materials from tools
                  !item.name.toLowerCase().includes('tool') && 
                  !item.name.toLowerCase().includes('cutter') &&
                  !item.name.toLowerCase().includes('knife') &&
                  !item.name.toLowerCase().includes('measure')
                ).map((item, index) => (
                  <div key={index} className="flex items-center border-b pb-3">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                    </div>
                    <a 
                      href={item.affiliate_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:text-primary/80 font-medium flex items-center"
                    >
                      View on Amazon
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools Section */}
            <div>
              <h2 className="text-lg font-medium border-b pb-2 mb-4">Tools</h2>
              <div className="space-y-3">
                {items.filter(item => 
                  // Basic heuristic for tools
                  item.name.toLowerCase().includes('tool') || 
                  item.name.toLowerCase().includes('cutter') ||
                  item.name.toLowerCase().includes('knife') ||
                  item.name.toLowerCase().includes('measure')
                ).map((item, index) => (
                  <div key={index} className="flex items-center border-b pb-3">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                    </div>
                    <a 
                      href={item.affiliate_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:text-primary/80 font-medium flex items-center"
                    >
                      View on Amazon
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t text-center">
            <Link href="/" className="btn btn-primary">
              Start New Project
            </Link>
          </div>
        </div>
      </div>
      
      <footer className="py-4 text-center text-gray-500 text-sm border-t border-gray-200 bg-white">
        <p>© 2025 AI Construction Assistant. All rights reserved.</p>
      </footer>
    </>
  );
} 
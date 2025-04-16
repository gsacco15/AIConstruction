"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import FeatureGrid from "@/components/landing/FeatureGrid";
import ChatInput from "@/components/landing/ChatInput";
import { ProductItem, Recommendations } from "@/utils/affiliateUtils";
import { ChatMessage, filterJsonFromMessage } from "@/lib/api";
import { getItemIcon } from "@/utils/materialIcons";

export default function LandingPage() {
  const [showContent, setShowContent] = useState(true);
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [selectedItems, setSelectedItems] = useState<ProductItem[]>([]);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      // Use scrollIntoView with a specific container instead of the whole page
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  // Handle the transition animations
  useEffect(() => {
    if (!showContent) {
      // Only apply fade-in after content has faded out
      setTimeout(() => {
        setFadeIn(true);
      }, 600); // Start fade-in after content fade-out is mostly complete
    } else {
      setFadeIn(false);
    }
  }, [showContent]);

  // Process the conversation to check for JSON recommendations
  useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'assistant') return;
    
    // Try to extract JSON from the message
    try {
      // Look for JSON content in the message
      const jsonPattern = /\{[\s\S]*"materials"[\s\S]*"tools"[\s\S]*\}/;
      const match = lastMessage.content.match(jsonPattern);
      
      if (match) {
        console.log("JSON detected in message:", match[0]);
        const jsonData = JSON.parse(match[0]);
        
        // Validate the data has the expected structure
        if (jsonData.materials && Array.isArray(jsonData.materials) && 
            jsonData.tools && Array.isArray(jsonData.tools)) {
          
          // Process the data to ensure all items have affiliate_url
          const processedData: Recommendations = {
            materials: jsonData.materials.map((item: any) => ({
              name: item.name,
              affiliate_url: item.affiliate_url || `https://www.amazon.com/s?k=${encodeURIComponent(item.name)}&tag=aiconstructio-20`
            })),
            tools: jsonData.tools.map((item: any) => ({
              name: item.name,
              affiliate_url: item.affiliate_url || `https://www.amazon.com/s?k=${encodeURIComponent(item.name)}&tag=aiconstructio-20`
            }))
          };
          
          console.log("Valid recommendations found:", processedData);
          setRecommendations(processedData);
        }
      }
    } catch (error) {
      console.error("Error parsing JSON from message:", error);
    }
  }, [messages]);

  const handleChatStart = async (query: string) => {
    // Start the fade-out effect first
    setFadeOut(true);
    
    // Prevent the default scroll to bottom behavior
    const scrollPosition = window.scrollY;
    
    // Give time for the fade-out animation
    setTimeout(async () => {
      // Switch to chat view after fade out is complete
      setShowContent(false);
      setFadeOut(false); // Reset fade-out state
      setFadeIn(false); // Will be set to true by the useEffect
      setLoading(true);
      
      // Maintain scroll position
      window.scrollTo(0, scrollPosition);
      
      // Add user message
      const updatedMessages = [...messages, { role: 'user', content: query }];
      setMessages(updatedMessages);
      
      try {
        // Create a thread and send the first message
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'createThread',
            message: query,
            messages: [
              { role: 'system', content: 'You are a DIY construction assistant that provides helpful advice on construction projects, renovation tips, and material recommendations. Be concise and practical in your responses.' },
              { role: 'user', content: query }
            ],
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Save thread ID
        if (data.threadId) {
          setThreadId(data.threadId);
        }
        
        // Add assistant response
        if (data.message) {
          // Check for JSON recommendations in the message
          const jsonMatch = data.message.match(/\{[\s\S]*"materials"[\s\S]*"tools"[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const jsonData = JSON.parse(jsonMatch[0]);
              if (jsonData.materials && jsonData.tools && 
                  Array.isArray(jsonData.materials) && Array.isArray(jsonData.tools)) {
                console.log('Found recommendations in message:', jsonData);
                setRecommendations(jsonData);
              }
            } catch (e) {
              console.error('Error parsing JSON from message:', e);
            }
          }
          
          // Filter JSON from message before displaying
          const filteredMessage = filterJsonFromMessage(data.message);
          setMessages([...updatedMessages, { role: 'assistant', content: filteredMessage }]);
        }
      } catch (error) {
        console.error('Error starting chat:', error);
        setMessages([
          ...updatedMessages, 
          { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
        ]);
      } finally {
        setLoading(false);
      }
    }, 500); // Wait for the fade-out animation
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || loading || !threadId) return;
    
    // Add user message
    const updatedMessages = [...messages, { role: 'user', content: message }];
    setMessages(updatedMessages);
    setLoading(true);
    
    try {
      // Send message to existing thread
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sendMessage',
          threadId,
          message,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add assistant response
      if (data.message) {
        // Check for JSON recommendations in the message
        const jsonMatch = data.message.match(/\{[\s\S]*"materials"[\s\S]*"tools"[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const jsonData = JSON.parse(jsonMatch[0]);
            if (jsonData.materials && jsonData.tools && 
                Array.isArray(jsonData.materials) && Array.isArray(jsonData.tools)) {
              console.log('Found recommendations in message:', jsonData);
              setRecommendations(jsonData);
            }
          } catch (e) {
            console.error('Error parsing JSON from message:', e);
          }
        }
        
        // Filter JSON from message before displaying
        const filteredMessage = filterJsonFromMessage(data.message);
        setMessages([...updatedMessages, { role: 'assistant', content: filteredMessage }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([
        ...updatedMessages, 
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
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

  const toggleShoppingList = () => {
    setShowShoppingList(prev => !prev);
  };

  const toggleRecommendations = () => {
    setShowRecommendations(prev => !prev);
  };

  const handleCreateShoppingList = () => {
    setShowShoppingList(true);
  };

  const handleBackToChat = () => {
    setShowShoppingList(false);
  };

  const onEmailCapture = () => {
    // Show a dialog for email capture
    const email = prompt("Enter your email to receive your shopping list:");
    if (email && email.includes('@')) {
      try {
        // Call the email API endpoint with a minimal form
        fetch('/api/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: 'DIY',
            lastName: 'Enthusiast',
            email: email,
            items: selectedItems,
            projectTitle: 'Your DIY Project'
          }),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            if (data.previewUrl) {
              const showPreview = confirm('Shopping list sent to your email! Would you like to preview the email?');
              if (showPreview) {
                window.open(data.previewUrl, '_blank');
              }
            } else {
              alert('Your shopping list has been sent to your email!');
            }
          } else {
            alert('Failed to send the shopping list: ' + data.message);
          }
        })
        .catch(error => {
          console.error('Error sending shopping list:', error);
          alert('An unexpected error occurred. Please try again.');
        });
      } catch (error) {
        console.error('Error preparing email request:', error);
        alert('An unexpected error occurred. Please try again.');
      }
    } else if (email) {
      alert('Please enter a valid email address.');
    }
  };

  return (
    <>
      <main className="min-h-screen w-full pb-12 relative overflow-hidden">
        {/* Additional spanning decorative element to provide visual continuity */}
        <div className="absolute w-full h-[800px] pointer-events-none opacity-20" style={{zIndex: 0}}>
          <div className="absolute w-[500px] h-[500px] opacity-40 rounded-full bg-gradient-to-b from-transparent to-[#9747FF] blur-[150px] top-[40%] left-[10%]"></div>
          <div className="absolute w-[600px] h-[600px] opacity-30 rounded-full bg-gradient-to-b from-transparent to-[#6F00FF] blur-[150px] top-[60%] right-[5%]"></div>
        </div>
        
        <div className="flex flex-col items-center w-full relative z-10">
          <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
            <Header />
            
            <div className="w-full">
              {showContent ? (
                <div className={`transition-opacity duration-500 ease-in-out ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                  <Hero />
                  <FeatureGrid />
                </div>
              ) : (
                <div className={`mt-8 flex flex-col transition-all duration-1000 ease-in-out ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  {/* Chat messages area */}
                  <div className="h-[500px] overflow-y-auto p-4 space-y-4 messages-container rounded-lg custom-scrollbar scroll-smooth overscroll-contain">
                    {messages.map((message, index) => (
                      <div 
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === 'user' 
                              ? 'bg-[rgba(151,71,255,1)] text-white rounded-tr-none' 
                              : 'bg-gray-100 text-gray-800 rounded-tl-none'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                      </div>
                    ))}
                    
                    {loading && (
                      <div className="flex justify-start mb-3">
                        <div className="bg-gray-100 text-gray-800 rounded-lg rounded-tl-none max-w-[80%] p-3">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              )}
              
              <div className="mt-[30px]">
                {showContent ? (
                  <div className="pt-8 md:pt-12">
                    <ChatInput onSubmit={handleChatStart} />
                  </div>
                ) : (
                  <>
                    <ChatInput 
                      onSubmit={handleSendMessage}
                      placeholder="Continue the conversation..."
                      disabled={loading || !threadId}
                    />
                    
                    {recommendations && (
                      <div className="mt-4 space-y-4 w-full">
                        {/* Project Recommendations Card */}
                        <div className={`border flex items-stretch gap-5 flex-wrap justify-between px-5 py-2 ${
                          showRecommendations
                            ? 'rounded-[15px] border-[rgba(30,30,30,0.1)] bg-[rgba(30,30,30,0.5)]'
                            : 'rounded-[39px] border-[rgba(30,30,30,0.1)] bg-[rgba(30,30,30,0.5)]'
                        } backdrop-filter backdrop-blur-[30px] text-white`}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white">Project Recommendations</h3>
                              <p className="text-sm text-gray-300">
                                {recommendations.materials.length + recommendations.tools.length} items available
                                ({selectedItems.length} selected)
                              </p>
                            </div>
                            
                            <div className="flex-shrink-0">
                              <button
                                onClick={toggleRecommendations}
                                className="bg-[rgba(151,71,255,1)] hover:bg-[rgba(151,71,255,0.9)] text-white py-1 px-3 rounded-full text-sm"
                              >
                                {showRecommendations ? 'Hide Recommendations' : 'Show Recommendations'}
                              </button>
                            </div>
                          </div>
                          
                          {showRecommendations && (
                            <div className="recommendations-panel mt-4 w-full">
                              <p className="text-sm text-gray-300 mb-4">
                                Select items below to add them to your shopping list. Click on an item to toggle selection.
                              </p>
                              <div className="mb-6">
                                <h4 className="text-lg font-medium border-b border-gray-600 pb-2 mb-3 text-white flex justify-between">
                                  <span>Materials</span>
                                  {recommendations.materials.length > 0 && (
                                    <button 
                                      onClick={() => {
                                        // Add all materials that aren't already selected
                                        recommendations.materials.forEach(item => {
                                          if (!selectedItems.some(i => i.name === item.name)) {
                                            onSelectItem(item);
                                          }
                                        });
                                      }}
                                      className="text-xs border border-[rgba(151,71,255,1)] text-[rgba(151,71,255,1)] px-2 py-1 rounded-full hover:bg-[rgba(151,71,255,1)] hover:text-white transition-colors"
                                    >
                                      Add All
                                    </button>
                                  )}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {recommendations.materials.length > 0 ? (
                                    recommendations.materials.map((item, index) => (
                                      <div 
                                        key={index} 
                                        className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                                          selectedItems.some(i => i.name === item.name) 
                                            ? 'border-[rgba(151,71,255,1)] bg-gradient-to-br from-[rgba(151,71,255,0.2)] to-[rgba(100,100,255,0.1)]' 
                                            : 'border-gray-600 hover:border-gray-400 bg-gradient-to-br from-[rgba(40,40,40,0.4)] to-[rgba(60,60,100,0.2)]'
                                        }`}
                                        onClick={() => onSelectItem(item)}
                                      >
                                        <div className="flex items-center">
                                          {/* Dynamic icon for material */}
                                          <div className="w-12 h-12 bg-[rgba(60,60,60,0.7)] rounded-md flex items-center justify-center text-gray-400">
                                            {getItemIcon(item.name, true, "h-6 w-6")}
                                          </div>
                                          <div className="ml-4 flex-1">
                                            <h4 className="font-medium text-white">{item.name}</h4>
                                            {selectedItems.some(i => i.name === item.name) && (
                                              <span className="text-xs text-[rgba(151,71,255,1)] font-medium">Added to shopping list</span>
                                            )}
                                          </div>
                                          {!selectedItems.some(i => i.name === item.name) && (
                                            <button 
                                              className="text-xs border border-[rgba(151,71,255,1)] text-[rgba(151,71,255,1)] px-2 py-1 rounded-full hover:bg-[rgba(151,71,255,1)] hover:text-white transition-colors"
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
                                    <p className="col-span-2 text-gray-400 italic">No materials recommended for this project.</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <h4 className="text-lg font-medium border-b border-gray-600 pb-2 mb-3 text-white flex justify-between">
                                  <span>Tools</span>
                                  {recommendations.tools.length > 0 && (
                                    <button 
                                      onClick={() => {
                                        // Add all tools that aren't already selected
                                        recommendations.tools.forEach(item => {
                                          if (!selectedItems.some(i => i.name === item.name)) {
                                            onSelectItem(item);
                                          }
                                        });
                                      }}
                                      className="text-xs border border-[rgba(151,71,255,1)] text-[rgba(151,71,255,1)] px-2 py-1 rounded-full hover:bg-[rgba(151,71,255,1)] hover:text-white transition-colors"
                                    >
                                      Add All
                                    </button>
                                  )}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {recommendations.tools.length > 0 ? (
                                    recommendations.tools.map((item, index) => (
                                      <div 
                                        key={index} 
                                        className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                                          selectedItems.some(i => i.name === item.name) 
                                            ? 'border-[rgba(151,71,255,1)] bg-gradient-to-br from-[rgba(151,71,255,0.2)] to-[rgba(255,100,100,0.1)]' 
                                            : 'border-gray-600 hover:border-gray-400 bg-gradient-to-br from-[rgba(40,40,40,0.4)] to-[rgba(100,60,60,0.2)]'
                                        }`}
                                        onClick={() => onSelectItem(item)}
                                      >
                                        <div className="flex items-center">
                                          {/* Dynamic icon for tool */}
                                          <div className="w-12 h-12 bg-[rgba(60,60,60,0.7)] rounded-md flex items-center justify-center text-gray-400">
                                            {getItemIcon(item.name, false, "h-6 w-6")}
                                          </div>
                                          <div className="ml-4 flex-1">
                                            <h4 className="font-medium text-white">{item.name}</h4>
                                            {selectedItems.some(i => i.name === item.name) && (
                                              <span className="text-xs text-[rgba(151,71,255,1)] font-medium">Added to shopping list</span>
                                            )}
                                          </div>
                                          {!selectedItems.some(i => i.name === item.name) && (
                                            <button 
                                              className="text-xs border border-[rgba(151,71,255,1)] text-[rgba(151,71,255,1)] px-2 py-1 rounded-full hover:bg-[rgba(151,71,255,1)] hover:text-white transition-colors"
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
                                    <p className="col-span-2 text-gray-400 italic">No tools recommended for this project.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Shopping List Card */}
                        <div className={`border flex items-stretch gap-5 flex-wrap justify-between px-5 py-2 ${
                          showShoppingList
                            ? 'rounded-[15px] border-[rgba(30,30,30,0.1)] bg-[rgba(30,30,30,0.5)]'
                            : 'rounded-[39px] border-[rgba(30,30,30,0.1)] bg-[rgba(30,30,30,0.5)]'
                        } backdrop-filter backdrop-blur-[30px] text-white mb-6`}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white">Your Shopping List</h3>
                              <p className="text-sm text-gray-300">
                                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                              </p>
                            </div>
                            
                            <div className="flex-shrink-0 flex gap-2">
                              {selectedItems.length > 0 && (
                                <button
                                  onClick={onEmailCapture}
                                  className="bg-[rgba(60,60,60,0.5)] hover:bg-[rgba(80,80,80,0.5)] text-white py-1 px-3 rounded-full text-sm"
                                >
                                  Share via Email
                                </button>
                              )}
                              <button
                                onClick={toggleShoppingList}
                                className="bg-[rgba(151,71,255,1)] hover:bg-[rgba(151,71,255,0.9)] text-white py-1 px-3 rounded-full text-sm"
                              >
                                {showShoppingList ? 'Hide Shopping List' : 'Show Shopping List'}
                              </button>
                            </div>
                          </div>
                          
                          {showShoppingList && (
                            <div className="mt-4 w-full">
                              {selectedItems.length > 0 ? (
                                <div className="overflow-x-auto max-h-[300px] custom-scrollbar">
                                  <table className="w-full text-sm">
                                    <thead className="bg-[rgba(40,40,40,0.3)]">
                                      <tr>
                                        <th className="px-4 py-2 text-left font-medium text-gray-300">Item</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-300">Type</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-300">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                      {selectedItems.map((item, index) => {
                                        const itemType = recommendations?.materials.some(i => i.name === item.name) 
                                          ? 'Material' 
                                          : 'Tool';
                                        
                                        return (
                                          <tr key={index} className="hover:bg-[rgba(60,60,60,0.3)]">
                                            <td className="px-4 py-3 text-white">{item.name}</td>
                                            <td className="px-4 py-3">
                                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                itemType === 'Material' 
                                                  ? 'bg-blue-900 text-blue-200' 
                                                  : 'bg-green-900 text-green-200'
                                              }`}>
                                                <span className="mr-1">
                                                  {getItemIcon(item.name, itemType === 'Material', "h-3 w-3")}
                                                </span>
                                                {itemType}
                                              </span>
                                            </td>
                                            <td className="px-4 py-3">
                                              <div className="flex items-center gap-2">
                                                <a
                                                  href={item.affiliate_url || '#'}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center text-sm font-medium text-[rgba(151,71,255,1)] hover:text-[rgba(151,71,255,0.8)]"
                                                >
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                  </svg>
                                                  View on Amazon
                                                </a>
                                                <button
                                                  onClick={() => onSelectItem(item)}
                                                  className="text-red-400 hover:text-red-300"
                                                >
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                  </svg>
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="py-8 text-center text-gray-300 bg-[rgba(40,40,40,0.3)] rounded">
                                  No items selected yet. Choose items from the recommendations above.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-4 text-center text-gray-500 text-sm border-t border-gray-200">
        <p>© 2025 AI Construction Assistant. All rights reserved.</p>
      </footer>
    </>
  );
} 
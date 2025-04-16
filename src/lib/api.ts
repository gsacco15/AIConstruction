/**
 * API service for communicating with OpenAI and other backend services
 */
import { Recommendations } from "@/utils/affiliateUtils";

// Define the possible steps in the conversation flow
export type ConversationStep = 'initial' | 'location' | 'type' | 'material' | 'final';

// The structure for a chat message
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Track the conversation thread
let threadId: string | null = null;

// Get the API base URL
const getApiBaseUrl = () => {
  // In production on Netlify, use the Netlify functions
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    console.log('Using Netlify functions API');
    return '/.netlify/functions';
  }
  // For local development, use the Next.js API routes
  console.log('Using Next.js API routes');
  return '/api';
};

/**
 * Send a message to the assistant and get a response
 * @param messages The chat history
 * @returns The assistant's response
 */
export async function sendMessage(messages: ChatMessage[]): Promise<ChatMessage> {
  try {
    const lastMessage = messages[messages.length - 1];
    
    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error('Last message must be from the user');
    }
    
    // Check if we need to create a thread
    if (!threadId) {
      console.log('No thread ID found, creating a new thread...');
      
      // Use our Netlify function or Next.js API
      const apiBaseUrl = getApiBaseUrl();
      console.log('API URL:', `${apiBaseUrl}/chat`);
      
      const response = await fetch(`${apiBaseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'createThread',
          message: lastMessage.content,
          messages: messages.filter(msg => msg.role === 'system')
        })
      });
      
      if (!response.ok) {
        console.error('API error status:', response.status);
        console.error('API error text:', await response.text().catch(() => 'No response text'));
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create thread');
      }
      
      threadId = data.threadId;
      
      // If we got a message back with the thread creation, return it
      if (data.message) {
        return {
          role: 'assistant',
          content: data.message
        };
      }
    }
    
    // Thread already exists, send message
    console.log('Sending message to existing thread:', threadId);
    
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'sendMessage',
        threadId,
        message: lastMessage.content
      })
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to send message');
    }
    
    return {
      role: 'assistant',
      content: data.message
    };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    
    // Return error message
    return {
      role: 'assistant',
      content: `Sorry, I encountered an error. Please try again.`
    };
  }
}

/**
 * Check if the message is asking for recommendations
 */
export function isGeneratingRecommendations(message: string): boolean {
  const lowerMsg = message.toLowerCase();
  return lowerMsg.includes('recommend') || 
         lowerMsg.includes('suggest') || 
         lowerMsg.includes('shopping list') ||
         lowerMsg.includes('materials') || 
         lowerMsg.includes('tools') ||
         lowerMsg.includes('supplies');
}

/**
 * Remove JSON from the message to display cleaner text
 */
export function filterJsonFromMessage(message: string): string {
  // Look for JSON blocks marked with ```json or just a JSON object
  const jsonBlockRegex = /```json\s*({[\s\S]*?})\s*```/g;
  const jsonObjectRegex = /\{[\s\S]*"materials"[\s\S]*"tools"[\s\S]*\}/g;
  
  // First try to remove marked JSON blocks
  let filteredMessage = message.replace(jsonBlockRegex, '');
  
  // If that didn't change anything, try to remove bare JSON objects
  if (filteredMessage === message) {
    filteredMessage = message.replace(jsonObjectRegex, '');
  }
  
  // Trim and return
  return filteredMessage.trim();
}

/**
 * Generate recommendations based on the conversation history
 */
export async function generateRecommendations(messages: ChatMessage[]): Promise<Recommendations> {
  try {
    if (!threadId) {
      throw new Error('No active thread found');
    }
    
    console.log('Generating recommendations for thread:', threadId);
    
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'generateRecommendations',
        threadId
      })
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to generate recommendations');
    }
    
    return data.recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    
    // Return empty recommendations
    return {
      materials: [],
      tools: []
    };
  }
} 
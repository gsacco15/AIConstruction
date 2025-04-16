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

// Constants for OpenAI API - access them directly from window for client-side
const getOpenAIApiKey = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
  }
  return '';
};

const getAssistantId = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_OPENAI_ASSISTANT_ID || 'asst_WIsQYJ9qrxCAONyV8SoElwnT';
  }
  return 'asst_WIsQYJ9qrxCAONyV8SoElwnT';
};

// Track the conversation thread
let threadId: string | null = null;

// Fallback to mock mode if API key is missing or API calls fail repeatedly
let useMockMode = false;

/**
 * Initialize a new thread with OpenAI Assistant
 * @returns The thread ID
 */
async function createThread(): Promise<string> {
  try {
    console.log('Creating a new thread...');
    const apiKey = getOpenAIApiKey();
    
    // Check if API key is available
    if (!apiKey || apiKey.trim() === '') {
      console.error('No OpenAI API key found. Check your environment variables.');
      useMockMode = true;
      return 'mock-thread-id';
    }
    
    // For client-side, we'll use fetch API directly
    const response = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({})
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error creating thread:', data);
      throw new Error(`Error creating thread: ${data.error?.message || response.statusText}`);
    }

    console.log('Thread created successfully:', data.id);
    return data.id;
  } catch (error) {
    console.error('Error creating thread:', error);
    useMockMode = true;
    return 'mock-thread-id';
  }
}

/**
 * Add a message to the thread
 * @param threadId The thread ID
 * @param message The message to add
 */
async function addMessageToThread(threadId: string, content: string): Promise<void> {
  try {
    console.log(`Adding message to thread ${threadId}: ${content}`);
    
    if (useMockMode) {
      console.log('Using mock mode for addMessageToThread');
      return;
    }
    
    const apiKey = getOpenAIApiKey();
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        role: 'user',
        content
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error adding message:', data);
      throw new Error(`Error adding message: ${data.error?.message || response.statusText}`);
    }
    
    console.log('Message added successfully');
  } catch (error) {
    console.error('Error adding message to thread:', error);
    useMockMode = true;
  }
}

/**
 * Run the assistant on the thread
 * @param threadId The thread ID
 * @returns The run ID
 */
async function runAssistant(threadId: string): Promise<string> {
  try {
    console.log(`Running assistant on thread ${threadId}`);
    
    if (useMockMode) {
      console.log('Using mock mode for runAssistant');
      return 'mock-run-id';
    }
    
    const apiKey = getOpenAIApiKey();
    const assistantId = getAssistantId();
    
    console.log(`Using assistant ID: ${assistantId}`);
    
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        assistant_id: assistantId
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error running assistant:', data);
      throw new Error(`Error running assistant: ${data.error?.message || response.statusText}`);
    }
    
    console.log('Assistant run started successfully:', data.id);
    return data.id;
  } catch (error) {
    console.error('Error running assistant:', error);
    useMockMode = true;
    return 'mock-run-id';
  }
}

/**
 * Check the status of a run
 * @param threadId The thread ID
 * @param runId The run ID
 * @returns The run status
 */
async function checkRunStatus(threadId: string, runId: string): Promise<string> {
  try {
    if (useMockMode) {
      console.log('Using mock mode for checkRunStatus');
      return 'completed';
    }
    
    const apiKey = getOpenAIApiKey();
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error checking run status:', data);
      throw new Error(`Error checking run status: ${data.error?.message || response.statusText}`);
    }
    
    console.log(`Run status: ${data.status}`);
    return data.status;
  } catch (error) {
    console.error('Error checking run status:', error);
    useMockMode = true;
    return 'completed';
  }
}

/**
 * Get messages from the thread
 * @param threadId The thread ID
 * @returns The messages
 */
async function getMessages(threadId: string): Promise<any[]> {
  try {
    console.log(`Getting messages from thread ${threadId}`);
    
    if (useMockMode) {
      console.log('Using mock mode for getMessages');
      return [{ 
        role: 'assistant', 
        content: [{ 
          text: { 
            value: 'This is a mock response. The real OpenAI Assistant is not connected properly.' 
          } 
        }] 
      }];
    }
    
    const apiKey = getOpenAIApiKey();
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Error getting messages:', data);
      throw new Error(`Error getting messages: ${data.error?.message || response.statusText}`);
    }
    
    console.log('Messages retrieved successfully');
    return data.data || [];
  } catch (error) {
    console.error('Error getting messages:', error);
    useMockMode = true;
    return [{ 
      role: 'assistant', 
      content: [{ 
        text: { 
          value: 'This is a mock response. The real OpenAI Assistant is not connected properly.' 
        } 
      }] 
    }];
  }
}

/**
 * Get the last assistant message from the thread
 * @param messages The messages from the thread
 * @returns The last assistant message
 */
function getLastAssistantMessage(messages: any[]): string {
  try {
    // Messages are ordered by creation time (newest first)
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');
    if (assistantMessages.length === 0) return '';
    
    if (useMockMode) {
      return 'This is a mock response from the assistant since the API connection is not working.';
    }
    
    const content = assistantMessages[0].content;
    if (!content || content.length === 0) return '';
    
    // Handle different content formats
    if (typeof content === 'string') return content;
    if (Array.isArray(content) && content[0]?.text?.value) {
      return content[0].text.value;
    }
    
    console.error('Unexpected message format:', assistantMessages[0]);
    return 'I received a response in an unexpected format.';
  } catch (error) {
    console.error('Error parsing assistant message:', error);
    return 'Error parsing the assistant response.';
  }
}

/**
 * Wait for a run to complete
 * @param threadId The thread ID
 * @param runId The run ID
 * @returns The final status
 */
async function waitForRunCompletion(threadId: string, runId: string): Promise<string> {
  if (useMockMode) {
    console.log('Using mock mode for waitForRunCompletion');
    // Wait 1 second for mock response
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 'completed';
  }
  
  let status = await checkRunStatus(threadId, runId);
  let attempts = 0;
  const maxAttempts = 30; // Avoid infinite loops
  
  while ((status === 'queued' || status === 'in_progress') && attempts < maxAttempts) {
    // Wait for 1 second before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
    status = await checkRunStatus(threadId, runId);
    attempts++;
  }
  
  if (attempts >= maxAttempts && (status === 'queued' || status === 'in_progress')) {
    console.warn('Run is taking too long to complete. Timeout reached.');
  }
  
  return status;
}

// Mock responses for fallback mode
const mockResponses: Record<string, string> = {
  initial: "Hello! Could you please tell me which area of your home you are working on? (e.g., bathroom, kitchen, living room, etc.)",
  bathroom: "Within that area, which specific part is your project focused on? For example, is it the floor, wall, ceiling, or fixtures?",
  kitchen: "Within that area, which specific part is your project focused on? For example, is it the floor, wall, ceiling, or fixtures?",
  floor: "Could you specify what kind of work you're doing in that location? For instance, are you installing new materials, renovating, repairing, or waterproofing? Also, do you have a particular material or finish in mind (e.g., ceramic tiles, vinyl, natural stone, etc.)?",
  wall: "Could you specify what kind of work you're doing in that location? For instance, are you installing new materials, renovating, repairing, or waterproofing? Also, do you have a particular material or finish in mind (e.g., ceramic tiles, vinyl, natural stone, etc.)?",
  tile: "Great, I'm generating your personalized project list now!",
  install: "Great, I'm generating your personalized project list now!",
  renovate: "Great, I'm generating your personalized project list now!"
};

/**
 * Get a mock response based on keywords in the user's message
 * @param message The user's message
 * @returns A mock response
 */
function getMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check each keyword
  for (const [keyword, response] of Object.entries(mockResponses)) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      return response;
    }
  }
  
  // Default response if no keywords match
  return "Thank you for that information. Could you please provide a bit more detail about your project?";
}

/**
 * Sends a message to the GPT assistant and gets a response
 * @param messages The history of chat messages
 * @returns The assistant's response
 */
export async function sendMessage(messages: ChatMessage[]): Promise<ChatMessage> {
  try {
    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      throw new Error('No user message found');
    }
    
    console.log('Sending message:', lastUserMessage.content);
    
    // Fall back to mock mode if no API key or previous errors
    if (useMockMode || !getOpenAIApiKey()) {
      console.log('Using mock mode for sendMessage');
      
      // Use mock responses based on the user's message
      const mockResponse = getMockResponse(lastUserMessage.content);
      
      // Add a brief delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        role: 'assistant',
        content: mockResponse
      };
    }

    // Create a thread if we don't have one yet
    if (!threadId) {
      threadId = await createThread();
    }

    // Add the message to the thread
    await addMessageToThread(threadId, lastUserMessage.content);

    // Run the assistant
    const runId = await runAssistant(threadId);

    // Wait for the run to complete
    const finalStatus = await waitForRunCompletion(threadId, runId);

    if (finalStatus !== 'completed') {
      console.error(`Run failed with status: ${finalStatus}`);
      throw new Error(`Run failed with status: ${finalStatus}`);
    }

    // Get the messages from the thread
    const threadMessages = await getMessages(threadId);
    const lastAssistantMessage = getLastAssistantMessage(threadMessages);

    return {
      role: 'assistant',
      content: lastAssistantMessage
    };
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Switch to mock mode after an error
    useMockMode = true;
    
    return {
      role: 'assistant',
      content: 'I apologize, but I encountered an error. I\'ll switch to backup mode to continue our conversation. Could you please tell me about your project?'
    };
  }
}

/**
 * Determines if the assistant's message indicates it's generating the final recommendations
 * @param message The assistant's message
 * @returns True if the message indicates recommendations are being generated
 */
export function isGeneratingRecommendations(message: string): boolean {
  return message.toLowerCase().includes('generating your personalized project list') ||
         message.toLowerCase().includes('i\'m generating your') ||
         message.toLowerCase().includes('creating your project list');
}

/**
 * Filters JSON content from messages to show cleaner response to the user
 * @param message The message potentially containing JSON
 * @returns The message with JSON content removed or replaced with a user-friendly note
 */
export function filterJsonFromMessage(message: string): string {
  try {
    // Check if the message contains JSON
    const jsonMatch = message.match(/\{[\s\S]*"materials"[\s\S]*"tools"[\s\S]*\}/);
    if (!jsonMatch) return message;
    
    // Replace the JSON with a user-friendly message
    const cleanedMessage = message.replace(jsonMatch[0], '').trim();
    
    // If the message is now empty or just whitespace, return a default message
    if (cleanedMessage === '') {
      return "I've prepared your recommendations based on your project details. You can view them in the recommendations panel.";
    }
    
    return cleanedMessage;
  } catch (error) {
    console.error('Error filtering JSON from message:', error);
    return message;
  }
}

/**
 * Extracts the JSON recommendations from a message
 * @param message The message containing JSON
 * @returns The parsed recommendations
 */
function extractJsonFromMessage(message: string): Recommendations | null {
  try {
    // Find JSON content by looking for opening and closing braces
    // Enhanced regex to catch JSON that spans multiple lines and contains materials and tools
    const jsonMatch = message.match(/\{[\s\S]*"materials"[\s\S]*"tools"[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const jsonStr = jsonMatch[0];
    console.log('Found JSON string:', jsonStr);
    
    const data = JSON.parse(jsonStr);
    console.log('Parsed JSON data:', data);
    
    // Validate the structure
    if (!data.materials || !data.tools) {
      console.log('Invalid JSON structure - missing materials or tools');
      return null;
    }
    
    // Validate that materials and tools are arrays
    if (!Array.isArray(data.materials) || !Array.isArray(data.tools)) {
      console.log('Invalid JSON structure - materials or tools is not an array');
      return null;
    }
    
    return data as Recommendations;
  } catch (error) {
    console.error('Error extracting JSON from message:', error);
    return null;
  }
}

/**
 * Generates the final recommendations based on the conversation history
 * @param messages The history of chat messages
 * @returns An object containing the recommended materials and tools
 */
export async function generateRecommendations(messages: ChatMessage[]): Promise<Recommendations> {
  try {
    // In mock mode, generate mock recommendations
    if (useMockMode || !threadId) {
      console.log('Using mock mode for generateRecommendations');
      
      // Create mock recommendations based on the conversation
      const conversationText = messages.map(m => m.content).join(' ').toLowerCase();
      
      // Default recommendations
      const mockRecommendations = {
        materials: [
          { name: "All-Purpose Joint Compound", affiliate_url: "https://www.amazon.com/s?k=All+Purpose+Joint+Compound&tag=aiconstructio-20" },
          { name: "Sandpaper Variety Pack", affiliate_url: "https://www.amazon.com/s?k=Sandpaper+Variety+Pack&tag=aiconstructio-20" },
          { name: "Wood Filler", affiliate_url: "https://www.amazon.com/s?k=Wood+Filler&tag=aiconstructio-20" }
        ],
        tools: [
          { name: "Screwdriver Set", affiliate_url: "https://www.amazon.com/s?k=Screwdriver+Set&tag=aiconstructio-20" },
          { name: "Measuring Tape", affiliate_url: "https://www.amazon.com/s?k=Measuring+Tape&tag=aiconstructio-20" },
          { name: "Utility Knife", affiliate_url: "https://www.amazon.com/s?k=Utility+Knife&tag=aiconstructio-20" }
        ]
      };
      
      // Bathroom-specific recommendations
      if (conversationText.includes('bathroom')) {
        if (conversationText.includes('floor')) {
          return {
            materials: [
              { name: "Ceramic Floor Tiles", affiliate_url: "https://www.amazon.com/s?k=Ceramic+Floor+Tiles&tag=aiconstructio-20" },
              { name: "Tile Mortar", affiliate_url: "https://www.amazon.com/s?k=Tile+Mortar&tag=aiconstructio-20" },
              { name: "Tile Grout", affiliate_url: "https://www.amazon.com/s?k=Tile+Grout&tag=aiconstructio-20" },
              { name: "Cement Backer Board", affiliate_url: "https://www.amazon.com/s?k=Cement+Backer+Board&tag=aiconstructio-20" }
            ],
            tools: [
              { name: "Tile Cutter", affiliate_url: "https://www.amazon.com/s?k=Tile+Cutter&tag=aiconstructio-20" },
              { name: "Notched Trowel", affiliate_url: "https://www.amazon.com/s?k=Notched+Trowel&tag=aiconstructio-20" },
              { name: "Grout Float", affiliate_url: "https://www.amazon.com/s?k=Grout+Float&tag=aiconstructio-20" },
              { name: "Tile Spacers", affiliate_url: "https://www.amazon.com/s?k=Tile+Spacers&tag=aiconstructio-20" }
            ]
          };
        }
        
        if (conversationText.includes('wall')) {
          return {
            materials: [
              { name: "Bathroom Wall Tiles", affiliate_url: "https://www.amazon.com/s?k=Bathroom+Wall+Tiles&tag=aiconstructio-20" },
              { name: "Mastic Adhesive", affiliate_url: "https://www.amazon.com/s?k=Tile+Mastic+Adhesive&tag=aiconstructio-20" },
              { name: "Waterproof Membrane", affiliate_url: "https://www.amazon.com/s?k=Waterproof+Membrane&tag=aiconstructio-20" },
              { name: "Grout Sealer", affiliate_url: "https://www.amazon.com/s?k=Grout+Sealer&tag=aiconstructio-20" }
            ],
            tools: [
              { name: "Tile Cutter", affiliate_url: "https://www.amazon.com/s?k=Tile+Cutter&tag=aiconstructio-20" },
              { name: "Notched Trowel", affiliate_url: "https://www.amazon.com/s?k=Notched+Trowel&tag=aiconstructio-20" },
              { name: "Tile Spacers", affiliate_url: "https://www.amazon.com/s?k=Tile+Spacers&tag=aiconstructio-20" },
              { name: "Level", affiliate_url: "https://www.amazon.com/s?k=Level+Tool&tag=aiconstructio-20" }
            ]
          };
        }
      }
      
      // Kitchen-specific recommendations
      if (conversationText.includes('kitchen')) {
        if (conversationText.includes('backsplash') || conversationText.includes('wall')) {
          return {
            materials: [
              { name: "Kitchen Backsplash Tiles", affiliate_url: "https://www.amazon.com/s?k=Kitchen+Backsplash+Tiles&tag=aiconstructio-20" },
              { name: "Tile Adhesive", affiliate_url: "https://www.amazon.com/s?k=Tile+Adhesive&tag=aiconstructio-20" },
              { name: "Grout", affiliate_url: "https://www.amazon.com/s?k=Tile+Grout&tag=aiconstructio-20" },
              { name: "Caulk", affiliate_url: "https://www.amazon.com/s?k=Silicone+Caulk&tag=aiconstructio-20" }
            ],
            tools: [
              { name: "Tile Cutter", affiliate_url: "https://www.amazon.com/s?k=Tile+Cutter&tag=aiconstructio-20" },
              { name: "Grout Float", affiliate_url: "https://www.amazon.com/s?k=Grout+Float&tag=aiconstructio-20" },
              { name: "Caulk Gun", affiliate_url: "https://www.amazon.com/s?k=Caulk+Gun&tag=aiconstructio-20" },
              { name: "Tile Spacers", affiliate_url: "https://www.amazon.com/s?k=Tile+Spacers&tag=aiconstructio-20" }
            ]
          };
        }
      }
      
      // Return default recommendations if no specific project is detected
      return mockRecommendations;
    }
    
    // Using real OpenAI Assistant API for recommendations
    
    // Get the messages from the thread
    const threadMessages = await getMessages(threadId);
    
    // Look for a message that contains JSON
    for (const message of threadMessages) {
      if (message.role === 'assistant') {
        const content = message.content[0].text.value;
        const recommendations = extractJsonFromMessage(content);
        if (recommendations) {
          return recommendations;
        }
      }
    }
    
    // If we didn't find JSON, request a final response explicitly
    await addMessageToThread(threadId, "Please provide your final recommendations in JSON format.");
    const runId = await runAssistant(threadId);
    await waitForRunCompletion(threadId, runId);
    
    // Get the updated messages
    const updatedMessages = await getMessages(threadId);
    
    // Check for JSON again
    for (const message of updatedMessages) {
      if (message.role === 'assistant') {
        const content = message.content[0].text.value;
        const recommendations = extractJsonFromMessage(content);
        if (recommendations) {
          return recommendations;
        }
      }
    }
    
    // If we still don't have recommendations, return a fallback
    return {
      materials: [
        { name: "Recommended Material 1", affiliate_url: "https://www.amazon.com/s?k=Recommended+Material+1&tag=aiconstructio-20" },
        { name: "Recommended Material 2", affiliate_url: "https://www.amazon.com/s?k=Recommended+Material+2&tag=aiconstructio-20" }
      ],
      tools: [
        { name: "Recommended Tool 1", affiliate_url: "https://www.amazon.com/s?k=Recommended+Tool+1&tag=aiconstructio-20" },
        { name: "Recommended Tool 2", affiliate_url: "https://www.amazon.com/s?k=Recommended+Tool+2&tag=aiconstructio-20" }
      ]
    };
  } catch (error) {
    console.error('Error generating recommendations:', error);
    
    // Switch to mock mode after an error
    useMockMode = true;
    
    // Return default recommendations if there's an error
    return { 
      materials: [
        { name: "Basic Construction Material", affiliate_url: "https://www.amazon.com/s?k=Basic+Construction+Material&tag=aiconstructio-20" }
      ], 
      tools: [
        { name: "Multi-purpose Tool", affiliate_url: "https://www.amazon.com/s?k=Multi-purpose+Tool&tag=aiconstructio-20" }
      ] 
    };
  }
} 
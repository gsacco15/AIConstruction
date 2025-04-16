import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Recommendations, createAffiliateLink } from '@/utils/affiliateUtils';

// Initialize the OpenAI client with the API key from server environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  defaultHeaders: {
    'OpenAI-Beta': 'assistants=v2'
  }
});

// The Assistant ID to use
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || 'asst_Vyg9xBn8t8QZtdYwdJRTZAr1';

// Store thread IDs in memory (in a real app, you would use a database)
const threads = new Map<string, string>();

// Flag to use mock mode for testing
const USE_MOCK_MODE = false;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    
    // Mock mode for testing
    if (USE_MOCK_MODE) {
      console.log("Using mock mode for API:", action);
      
      switch (action) {
        case 'createThread': {
          const { message } = body;
          const mockThreadId = 'mock-thread-' + Date.now();
          const mockResponse = getMockResponse(message);
          
          console.log("Mock createThread response:", { threadId: mockThreadId, message: mockResponse });
          
          return NextResponse.json({ 
            success: true, 
            threadId: mockThreadId,
            message: mockResponse
          });
        }
        
        case 'sendMessage': {
          const { message } = body;
          const mockResponse = getMockResponse(message);
          
          console.log("Mock sendMessage response:", { message: mockResponse });
          
          return NextResponse.json({ 
            success: true, 
            message: mockResponse
          });
        }
        
        case 'generateRecommendations': {
          return NextResponse.json({
            success: true,
            recommendations: getFallbackRecommendations()
          });
        }
        
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action' }, 
            { status: 400 }
          );
      }
    }
    
    switch (action) {
      case 'createThread': {
        try {
          console.log('POST /api/chat - createThread action received');
          
          // Create a new thread
          const threadId = await createThread();
          
          // Add system message if provided
          const { messages, message } = body;
          
          if (messages && messages.length > 0) {
            console.log('Adding system message to thread');
            const systemMessages = messages.filter((msg: any) => msg.role === 'system');
            if (systemMessages.length > 0) {
              // Add the first system message to establish the assistant's behavior
              await openai.beta.threads.messages.create(threadId, {
                role: 'user',
                content: `You are a DIY construction assistant. Please respond as if you are an expert in home improvement and construction projects. ${systemMessages[0].content}`,
              });
              
              // Run the assistant to process the system message
              const initialRun = await openai.beta.threads.runs.create(threadId, {
                assistant_id: ASSISTANT_ID,
              });
              
              // Wait for the initial run to complete
              await waitForRunCompletion(threadId, initialRun.id);
              console.log('System message processed successfully');
            }
          }
          
          // Send the first user message if provided
          if (message) {
            console.log('Adding user message to thread:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));
            await openai.beta.threads.messages.create(threadId, {
              role: 'user',
              content: message,
            });
            
            // Run the assistant
            console.log('Running assistant on thread');
            const run = await openai.beta.threads.runs.create(threadId, {
              assistant_id: ASSISTANT_ID,
            });
            
            console.log('Waiting for run to complete');
            // Wait for the run to complete
            await waitForRunCompletion(threadId, run.id);
            
            // Get the assistant's response
            console.log('Getting assistant response');
            const response = await getLatestAssistantMessage(threadId);
            console.log('Response received:', response.substring(0, 50) + (response.length > 50 ? '...' : ''));
            
            return NextResponse.json({ 
              success: true, 
              threadId,
              message: response
            });
          }
          
          return NextResponse.json({ success: true, threadId });
        } catch (error) {
          console.error('Error in createThread handler:', error);
          return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Error processing request' }, 
            { status: 500 }
          );
        }
      }
      
      case 'sendMessage': {
        const { threadId, message } = body;
        
        if (!threadId || !message) {
          return NextResponse.json(
            { success: false, error: 'Thread ID and message are required' }, 
            { status: 400 }
          );
        }
        
        // Add the message to the thread
        await openai.beta.threads.messages.create(threadId, {
          role: 'user',
          content: message,
        });
        
        // Run the assistant
        const run = await openai.beta.threads.runs.create(threadId, {
          assistant_id: ASSISTANT_ID,
        });
        
        // Wait for the run to complete
        await waitForRunCompletion(threadId, run.id);
        
        // Get the assistant's response
        const response = await getLatestAssistantMessage(threadId);
        
        return NextResponse.json({ 
          success: true, 
          message: response
        });
      }
      
      case 'generateRecommendations': {
        const { threadId } = body;
        
        if (!threadId) {
          return NextResponse.json(
            { success: false, error: 'Thread ID is required' }, 
            { status: 400 }
          );
        }
        
        // Add a message to request recommendations in JSON format
        await openai.beta.threads.messages.create(threadId, {
          role: 'user',
          content: `Please provide recommendations for my project in JSON format with "materials" and "tools" arrays. Each item should have a "name" property.`,
        });
        
        // Run the assistant
        const run = await openai.beta.threads.runs.create(threadId, {
          assistant_id: ASSISTANT_ID,
        });
        
        // Wait for the run to complete
        await waitForRunCompletion(threadId, run.id);
        
        // Get the messages
        const messages = await openai.beta.threads.messages.list(threadId);
        
        // Look for JSON in the assistant's messages
        let recommendations: Recommendations | null = null;
        
        for (const message of messages.data) {
          if (message.role === 'assistant' && message.content && message.content.length > 0) {
            const content = message.content[0];
            if (content.type === 'text') {
              recommendations = extractJsonFromMessage(content.text.value);
              if (recommendations) break;
            }
          }
        }
        
        // If we couldn't find valid recommendations, return a fallback
        if (!recommendations) {
          recommendations = getFallbackRecommendations();
        } else {
          // Add affiliate links to the recommendations
          recommendations.materials = recommendations.materials.map(item => ({
            ...item,
            affiliate_url: item.affiliate_url || createAffiliateLink(item.name)
          }));
          
          recommendations.tools = recommendations.tools.map(item => ({
            ...item,
            affiliate_url: item.affiliate_url || createAffiliateLink(item.name)
          }));
        }
        
        return NextResponse.json({
          success: true,
          recommendations
        });
      }
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' }, 
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error' }, 
      { status: 500 }
    );
  }
}

/**
 * Waits for a run to complete
 * @param threadId The thread ID
 * @param runId The run ID
 */
async function waitForRunCompletion(threadId: string, runId: string, maxAttempts = 15): Promise<void> {
  let attempts = 0;
  const pollingInterval = 1000; // 1 second between attempts
  const timeout = 20000; // 20 seconds total timeout
  const startTime = Date.now();
  
  while (attempts < maxAttempts && (Date.now() - startTime) < timeout) {
    attempts++;
    
    // Get the run status
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    
    // If the run is completed, return
    if (run.status === 'completed') {
      return;
    }
    
    // If the run failed, throw an error
    if (run.status === 'failed' || run.status === 'cancelled') {
      throw new Error(`Run ${runId} failed or was cancelled. Status: ${run.status}`);
    }
    
    // Wait before trying again
    await new Promise(resolve => setTimeout(resolve, pollingInterval));
  }
  
  // If we've reached the timeout, throw an error
  throw new Error(`Run ${runId} did not complete in time. Timeout after ${timeout}ms.`);
}

/**
 * Gets the latest assistant message from a thread
 * @param threadId The thread ID
 * @returns The message content
 */
async function getLatestAssistantMessage(threadId: string): Promise<string> {
  const messages = await openai.beta.threads.messages.list(threadId);
  
  // Get the last assistant message
  const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
  
  if (assistantMessages.length > 0) {
    const latestMessage = assistantMessages[0];
    if (latestMessage.content && latestMessage.content.length > 0) {
      const textContent = latestMessage.content[0];
      if (textContent.type === 'text') {
        return textContent.text.value;
      }
    }
  }
  
  return '';
}

/**
 * Extracts the JSON recommendations from a message
 * @param message The message containing JSON
 * @returns The parsed recommendations
 */
function extractJsonFromMessage(message: string): Recommendations | null {
  try {
    // Find JSON content by looking for opening and closing braces
    const jsonMatch = message.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const jsonStr = jsonMatch[0];
    const data = JSON.parse(jsonStr);
    
    // Validate the structure
    if (!Array.isArray(data.materials) || !Array.isArray(data.tools)) {
      return null;
    }
    
    return data as Recommendations;
  } catch (error) {
    console.error('Error extracting JSON from message:', error);
    return null;
  }
}

/**
 * Returns fallback recommendations if the API fails
 */
function getFallbackRecommendations(): Recommendations {
  return {
    materials: [
      { name: "Drywall Sheets", affiliate_url: createAffiliateLink("Drywall Sheets") },
      { name: "Joint Compound", affiliate_url: createAffiliateLink("Joint Compound") },
      { name: "Drywall Tape", affiliate_url: createAffiliateLink("Drywall Tape") },
      { name: "Primer Paint", affiliate_url: createAffiliateLink("Primer Paint") }
    ],
    tools: [
      { name: "Drywall Saw", affiliate_url: createAffiliateLink("Drywall Saw") },
      { name: "Utility Knife", affiliate_url: createAffiliateLink("Utility Knife") },
      { name: "Drywall Screwdriver", affiliate_url: createAffiliateLink("Drywall Screwdriver") },
      { name: "Taping Knife", affiliate_url: createAffiliateLink("Taping Knife") }
    ]
  };
}

/**
 * Gets a mock response for testing
 * @param message The user message
 * @returns A mock response
 */
function getMockResponse(message: string): string {
  // Simple keyword-based responses
  if (!message) {
    return "Hello! I'm your AI Construction Assistant. How can I help with your project today?";
  } else if (message.toLowerCase().includes('bathroom')) {
    return "For bathroom projects, I recommend using waterproof materials. Make sure to properly seal any tile work and use mold-resistant products. Would you like specific suggestions for your bathroom project?";
  } else if (message.toLowerCase().includes('kitchen')) {
    return "Kitchen renovations can be exciting! Consider durable countertops like quartz or granite, and make sure your layout follows the 'work triangle' concept for efficiency. Do you need help with a specific aspect of your kitchen renovation?";
  } else if (message.toLowerCase().includes('deck') || message.toLowerCase().includes('patio')) {
    return "Outdoor spaces require materials that can withstand the elements. Pressure-treated lumber, composite decking, or cedar are all good options for decks. What specific outdoor project are you working on?";
  } else if (message.toLowerCase().includes('paint') || message.toLowerCase().includes('painting')) {
    return "When painting, preparation is key! Make sure to clean walls, fill holes, and use primer for best results. For tools, you'll need quality brushes, rollers, painter's tape, and drop cloths. What are you planning to paint?";
  } else {
    return "Thanks for sharing details about your project. I'd be happy to provide specific recommendations for materials and tools. Could you tell me more about what you're trying to accomplish?";
  }
}

// Modify the createThread function to add explicit debug logging
async function createThread(): Promise<string> {
  try {
    console.log('Creating a new thread...');
    console.log('API Key available?', !!process.env.OPENAI_API_KEY);
    console.log('Assistant ID:', ASSISTANT_ID);
    
    const apiKey = process.env.OPENAI_API_KEY || '';
    
    // Check if API key is available
    if (!apiKey || apiKey.trim() === '') {
      console.error('No OpenAI API key found. Check your environment variables.');
      throw new Error('No OpenAI API key found');
    }
    
    // For client-side, we'll use fetch API directly
    const response = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({})
    });
    
    console.log('Thread creation status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error creating thread response:', errorData);
      throw new Error(`Error creating thread: ${response.statusText}. ${errorData}`);
    }

    const data = await response.json();
    
    console.log('Thread created successfully:', data.id);
    return data.id;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
} 
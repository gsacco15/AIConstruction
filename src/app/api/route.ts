import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Recommendations, createAffiliateLink } from '@/utils/affiliateUtils';

// Check if API key is available
const apiKey = process.env.OPENAI_API_KEY || '';
if (!apiKey) {
  console.warn('OPENAI_API_KEY is not set. Using mock mode.');
}

// Initialize the OpenAI client with the API key from server environment variables
const openai = new OpenAI({
  apiKey
});

// The Assistant ID to use
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || 'asst_WIsQYJ9qrxCAONyV8SoElwnT';

// Store thread IDs in memory (in a real app, you would use a database)
const threads = new Map<string, string>();

// Only use mock mode if no API key is available
const USE_MOCK_MODE = !apiKey;

export async function POST(req: NextRequest) {
  try {
    console.log('API route called');
    const body = await req.json();
    const { action } = body;
    
    console.log(`Action: ${action}`);
    
    // Use mock responses only if API key is not available
    if (USE_MOCK_MODE) {
      console.log('Using mock mode due to missing API key');
      return handleMockResponse(action, body);
    }
    
    switch (action) {
      case 'createThread': {
        console.log('Creating thread...');
        try {
          // Create a new thread
          const thread = await openai.beta.threads.create();
          const threadId = thread.id;
          console.log(`Thread created: ${threadId}`);
          
          // Add system message if provided
          const { messages } = body;
          if (messages && messages.length > 0) {
            const systemMessages = messages.filter((msg: any) => msg.role === 'system');
            if (systemMessages.length > 0) {
              console.log('Adding system message');
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
            }
          }
          
          // Send the first user message if provided
          const { message } = body;
          if (message) {
            console.log(`Adding first message: ${message.substring(0, 50)}...`);
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
              threadId,
              message: response
            });
          }
          
          return NextResponse.json({ success: true, threadId });
        } catch (error: any) {
          console.error('Error creating thread:', error);
          return NextResponse.json(
            { success: false, error: error.message || 'Error creating thread' }, 
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
        
        try {
          console.log(`Sending message to thread ${threadId}: ${message.substring(0, 50)}...`);
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
        } catch (error: any) {
          console.error('Error sending message:', error);
          return NextResponse.json(
            { success: false, error: error.message || 'Error sending message' }, 
            { status: 500 }
          );
        }
      }
      
      case 'generateRecommendations': {
        const { threadId } = body;
        
        if (!threadId) {
          return NextResponse.json(
            { success: false, error: 'Thread ID is required' }, 
            { status: 400 }
          );
        }
        
        try {
          console.log(`Generating recommendations for thread ${threadId}`);
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
                const textValue = (content as any).text.value;
                recommendations = extractJsonFromMessage(textValue);
                if (recommendations) break;
              }
            }
          }
          
          // If we couldn't find valid recommendations, return a fallback
          if (!recommendations) {
            console.log('No valid recommendations found, using fallback');
            recommendations = getFallbackRecommendations();
          } else {
            // Add affiliate links to the recommendations
            const safeRecommendations = recommendations;
            safeRecommendations.materials = safeRecommendations.materials.map(item => ({
              ...item,
              affiliate_url: item.affiliate_url || createAffiliateLink(item.name)
            }));
            
            safeRecommendations.tools = safeRecommendations.tools.map(item => ({
              ...item,
              affiliate_url: item.affiliate_url || createAffiliateLink(item.name)
            }));
            
            recommendations = safeRecommendations;
          }
          
          return NextResponse.json({
            success: true,
            recommendations
          });
        } catch (error: any) {
          console.error('Error generating recommendations:', error);
          return NextResponse.json(
            { success: false, error: error.message || 'Error generating recommendations' }, 
            { status: 500 }
          );
        }
      }
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' }, 
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' }, 
      { status: 500 }
    );
  }
}

/**
 * Handle mock responses when API is not available
 */
function handleMockResponse(action: string, body: any) {
  console.log('Using mock response for', action);
  
  switch (action) {
    case 'createThread':
      return NextResponse.json({ 
        success: true, 
        threadId: 'mock_thread_' + Date.now(),
        message: 'Hello! Could you please tell me which area of your home you are working on? (e.g., bathroom, kitchen, living room, etc.)'
      });
      
    case 'sendMessage':
      return NextResponse.json({ 
        success: true, 
        message: getRandomAssistantResponse(body.message)
      });
      
    case 'generateRecommendations':
      return NextResponse.json({
        success: true,
        recommendations: getFallbackRecommendations()
      });
      
    default:
      return NextResponse.json(
        { success: false, error: 'Invalid action' }, 
        { status: 400 }
      );
  }
}

/**
 * Generate a mock response based on the user's message
 */
function getRandomAssistantResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes('bathroom')) {
    return "For a bathroom project, you'll typically need waterproof materials and proper ventilation. What specific part are you working on - is it tile work, plumbing, or something else?";
  } else if (message.includes('kitchen')) {
    return "Kitchen projects can be complex! Are you renovating cabinets, countertops, backsplash, or something else?";
  } else if (message.includes('living room') || message.includes('bedroom')) {
    return "Great! For living spaces, are you focusing on walls, flooring, or built-in features?";
  } else if (message.includes('wall') || message.includes('paint')) {
    return "Wall projects often require proper preparation. Are you looking to patch, paint, or add a feature like wainscoting?";
  } else if (message.includes('floor') || message.includes('tile')) {
    return "Flooring projects need careful planning. What type of flooring material are you considering?";
  } else if (message.includes('thank')) {
    return "I'm now generating your personalized project list based on our conversation. This will include the materials and tools you'll need.";
  } else {
    return "Thanks for sharing those details. Can you tell me more about the specific materials you're planning to use or the main challenge you're facing?";
  }
}

/**
 * Waits for a run to complete
 * @param threadId The thread ID
 * @param runId The run ID
 */
async function waitForRunCompletion(threadId: string, runId: string): Promise<void> {
  let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
  console.log(`Run ${runId} initial status: ${runStatus.status}`);
  
  // Poll until the run completes
  while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
    // Wait for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    console.log(`Run ${runId} status: ${runStatus.status}`);
  }
  
  // Check for errors
  if (runStatus.status !== 'completed') {
    console.warn(`Run ${runId} completed with status: ${runStatus.status}`);
  }
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
        const response = (textContent as any).text.value;
        console.log(`Assistant response: ${response.substring(0, 50)}...`);
        return response;
      }
    }
  }
  
  console.warn('No assistant message found');
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
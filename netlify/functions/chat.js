const OpenAI = require('openai');

// Define affiliate utils directly in the function instead of importing
const AFFILIATE_TAG = "aiconstructio-20";

/**
 * Creates an Amazon affiliate link for a product name
 */
function createAffiliateLink(productName) {
  // Replace spaces with "+" for URL encoding
  const encodedName = encodeURIComponent(productName).replace(/%20/g, "+");
  return `https://www.amazon.com/s?k=${encodedName}&tag=${AFFILIATE_TAG}`;
}

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  defaultHeaders: {
    'OpenAI-Beta': 'assistants=v2'
  }
});

// The Assistant ID to use
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || 'asst_Vyg9xBn8t8QZtdYwdJRTZAr1';

// Log configuration info (without exposing full API key)
console.log('Function configuration:');
console.log('- API Key present:', process.env.OPENAI_API_KEY ? 'Yes (starts with ' + process.env.OPENAI_API_KEY.substring(0, 5) + '...)' : 'No');
console.log('- Assistant ID:', ASSISTANT_ID);

// Store thread IDs in memory (these will be lost when the function is redeployed)
const threads = new Map();

exports.handler = async function(event, context) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight handled' })
    };
  }

  // Verify method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { action } = body;

    // Check if API key is missing and use mock mode
    const useMockMode = !process.env.OPENAI_API_KEY;
    
    if (useMockMode) {
      console.log("MOCK MODE ACTIVATED: No OpenAI API key found in environment variables");
      console.log("Using mock mode for API action:", action);
      
      switch (action) {
        case 'createThread': {
          const { message } = body;
          const mockThreadId = 'mock-thread-' + Date.now();
          const mockResponse = getMockResponse(message);
          
          console.log("Mock createThread response:", { threadId: mockThreadId });
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              success: true, 
              threadId: mockThreadId,
              message: mockResponse
            })
          };
        }
        
        case 'sendMessage': {
          const { message } = body;
          const mockResponse = getMockResponse(message);
          
          console.log("Mock sendMessage response");
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              success: true, 
              message: mockResponse
            })
          };
        }
        
        case 'generateRecommendations': {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              recommendations: getFallbackRecommendations()
            })
          };
        }
        
        default:
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: 'Invalid action' })
          };
      }
    }
    
    switch (action) {
      case 'createThread': {
        try {
          console.log('createThread action received');
          
          // Create a new thread
          const thread = await openai.beta.threads.create();
          const threadId = thread.id;
          
          // Add system message if provided
          const { messages, message } = body;
          
          if (messages && messages.length > 0) {
            console.log('Adding system message to thread');
            const systemMessages = messages.filter(msg => msg.role === 'system');
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
            console.log('Adding user message to thread');
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
            console.log('Response received');
            
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({ 
                success: true, 
                threadId,
                message: response
              })
            };
          }
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, threadId })
          };
        } catch (error) {
          console.error('Error in createThread handler:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              success: false, 
              error: error instanceof Error ? error.message : 'Error processing request' 
            })
          };
        }
      }
      
      case 'sendMessage': {
        const { threadId, message } = body;
        
        if (!threadId || !message) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: 'Thread ID and message are required' })
          };
        }
        
        try {
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
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              success: true, 
              message: response
            })
          };
        } catch (error) {
          console.error('Error in sendMessage handler:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              success: false, 
              error: error instanceof Error ? error.message : 'Error processing request' 
            })
          };
        }
      }
      
      case 'generateRecommendations': {
        const { threadId } = body;
        
        if (!threadId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: 'Thread ID is required' })
          };
        }
        
        try {
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
          let recommendations = null;
          
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
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              recommendations
            })
          };
        } catch (error) {
          console.error('Error in generateRecommendations handler:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              success: false, 
              error: error instanceof Error ? error.message : 'Error processing request' 
            })
          };
        }
      }
      
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('API route error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Server error' 
      })
    };
  }
};

async function waitForRunCompletion(threadId, runId, maxAttempts = 15) {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    
    if (run.status === 'completed') {
      return;
    }
    
    if (run.status === 'failed' || run.status === 'cancelled' || run.status === 'expired') {
      throw new Error(`Run ended with status: ${run.status}`);
    }
    
    // Wait before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  
  throw new Error('Run did not complete in the expected timeframe');
}

async function getLatestAssistantMessage(threadId) {
  const messages = await openai.beta.threads.messages.list(threadId);
  
  for (const message of messages.data) {
    if (message.role === 'assistant' && message.content && message.content.length > 0) {
      const content = message.content[0];
      if (content.type === 'text') {
        return content.text.value;
      }
    }
  }
  
  return 'I don\'t have a response at this time.';
}

function extractJsonFromMessage(message) {
  try {
    // Try to find JSON pattern in message
    const jsonRegex = /\{[\s\S]*"materials"[\s\S]*"tools"[\s\S]*\}/;
    const match = message.match(jsonRegex);
    
    if (match) {
      const jsonStr = match[0];
      const json = JSON.parse(jsonStr);
      
      // Validate the structure
      if (json && Array.isArray(json.materials) && Array.isArray(json.tools)) {
        return json;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting JSON from message:', error);
    return null;
  }
}

function getFallbackRecommendations() {
  return {
    materials: [
      { name: 'Ceramic Tiles', affiliate_url: 'https://www.amazon.com/s?k=ceramic+tiles' },
      { name: 'Tile Adhesive', affiliate_url: 'https://www.amazon.com/s?k=tile+adhesive' },
      { name: 'Grout', affiliate_url: 'https://www.amazon.com/s?k=tile+grout' },
      { name: 'Tile Spacers', affiliate_url: 'https://www.amazon.com/s?k=tile+spacers' },
      { name: 'Waterproofing Membrane', affiliate_url: 'https://www.amazon.com/s?k=waterproofing+membrane' }
    ],
    tools: [
      { name: 'Tile Cutter', affiliate_url: 'https://www.amazon.com/s?k=tile+cutter' },
      { name: 'Notched Trowel', affiliate_url: 'https://www.amazon.com/s?k=notched+trowel' },
      { name: 'Rubber Mallet', affiliate_url: 'https://www.amazon.com/s?k=rubber+mallet' },
      { name: 'Grout Float', affiliate_url: 'https://www.amazon.com/s?k=grout+float' },
      { name: 'Level', affiliate_url: 'https://www.amazon.com/s?k=level+tool' }
    ]
  };
}

function getMockResponse(message) {
  if (message.toLowerCase().includes('bathroom')) {
    return 'For a bathroom renovation, you\'ll want to consider waterproofing, proper ventilation, and moisture-resistant materials. What specific part of the bathroom are you working on?';
  } else if (message.toLowerCase().includes('kitchen')) {
    return 'Kitchen projects can range from simple updates to complete renovations. Are you focusing on cabinets, countertops, flooring, or something else?';
  } else if (message.toLowerCase().includes('tile') || message.toLowerCase().includes('tiling')) {
    return 'Tiling projects require proper surface preparation, the right adhesives, and careful planning. What surface are you planning to tile?\n\n```json\n{\n  "materials": [\n    { "name": "Ceramic Tiles" },\n    { "name": "Tile Adhesive" },\n    { "name": "Grout" },\n    { "name": "Tile Spacers" }\n  ],\n  "tools": [\n    { "name": "Tile Cutter" },\n    { "name": "Notched Trowel" },\n    { "name": "Rubber Mallet" },\n    { "name": "Grout Float" }\n  ]\n}\n```';
  } else {
    return 'I\'m your DIY construction assistant. I can help with home improvement projects, material recommendations, and step-by-step instructions. What project are you working on?';
  }
} 
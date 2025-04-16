import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET(req: NextRequest) {
  try {
    // Environment variables
    const apiKey = process.env.OPENAI_API_KEY || '';
    const assistantId = process.env.OPENAI_ASSISTANT_ID || '';
    
    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    let assistantInfo = null;
    let error = null;
    
    try {
      // Test OpenAI connectivity by retrieving assistant info
      if (apiKey) {
        console.log('Attempting to retrieve assistant with ID:', assistantId);
        assistantInfo = await openai.beta.assistants.retrieve(assistantId);
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error';
      console.error('Error retrieving assistant:', error);
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      success: !!assistantInfo,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasApiKey: !!apiKey,
        apiKeyFirstChars: apiKey ? `${apiKey.substring(0, 5)}...` : 'Not Set',
        assistantId: assistantId,
      },
      assistant: assistantInfo ? {
        id: assistantInfo.id,
        name: assistantInfo.name,
        model: assistantInfo.model,
      } : null,
      error: error
    });
  } catch (error) {
    console.error('API test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown server error',
        timestamp: new Date().toISOString(),
      }, 
      { status: 500 }
    );
  }
} 
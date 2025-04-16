import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET(req: NextRequest) {
  try {
    // Environment variables
    const apiKey = process.env.OPENAI_API_KEY || '';
    const assistantId = process.env.OPENAI_ASSISTANT_ID || 'asst_WIsQYJ9qrxCAONyV8SoElwnT';
    
    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });
    
    let assistantInfo = null;
    let testThreadId = null;
    let error = null;
    
    try {
      // Test OpenAI connectivity by getting assistant info
      if (apiKey) {
        assistantInfo = await openai.beta.assistants.retrieve(assistantId);
        
        // Create a test thread
        const thread = await openai.beta.threads.create();
        testThreadId = thread.id;
        
        // Clean up the test thread
        if (testThreadId) {
          await openai.beta.threads.del(testThreadId);
        }
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error';
    }
    
    return NextResponse.json({
      success: true,
      debugInfo: {
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasApiKey: !!apiKey,
          apiKeyFirstChars: apiKey ? `${apiKey.substring(0, 3)}...` : 'Not Set',
          assistantId: assistantId,
        },
        openai: {
          assistantFound: !!assistantInfo,
          assistantName: assistantInfo?.name || null,
          assistantModel: assistantInfo?.model || null,
          canCreateThread: !!testThreadId,
          error: error,
        }
      }
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error during diagnostics' }, 
      { status: 500 }
    );
  }
} 
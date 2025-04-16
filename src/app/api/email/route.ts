import { NextRequest, NextResponse } from 'next/server';
import { sendShoppingListEmail } from '@/lib/emailService';
import { ProductItem, Recommendations } from '@/utils/affiliateUtils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { firstName, lastName, email, items } = body;
    
    if (!firstName || !lastName || !email || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid request. Required fields: firstName, lastName, email, and items (array)' 
        },
        { status: 400 }
      );
    }
    
    // Validate item format
    const validItems = items.every((item: any) => 
      typeof item === 'object' && 
      typeof item.name === 'string' && 
      typeof item.affiliate_url === 'string'
    );
    
    if (!validItems) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid items format. Each item must have name and affiliate_url properties' 
        },
        { status: 400 }
      );
    }

    // Check if we have recommendations structure
    let recommendations: Recommendations | undefined;
    if (body.recommendations && 
        Array.isArray(body.recommendations.materials) && 
        Array.isArray(body.recommendations.tools)) {
      recommendations = body.recommendations;
      console.log('Using provided recommendations structure for email');
    } else if (body.materials && body.tools && 
              Array.isArray(body.materials) && 
              Array.isArray(body.tools)) {
      // Alternative structure
      recommendations = {
        materials: body.materials,
        tools: body.tools
      };
      console.log('Using alternative recommendations structure for email');
    }
    
    // Send email with shopping list
    const result = await sendShoppingListEmail({
      firstName,
      lastName,
      email,
      items: items as ProductItem[],
      projectTitle: body.projectTitle || 'DIY Project',
      recommendations
    });
    
    // Always return JSON
    return NextResponse.json({
      success: result.success,
      message: result.message,
      previewUrl: result.previewUrl
    });
    
  } catch (error) {
    console.error('Error in email API route:', error);
    
    // Make sure to return JSON even in case of error
    return NextResponse.json(
      { 
        success: false, 
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
} 
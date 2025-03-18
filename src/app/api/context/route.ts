import { NextRequest, NextResponse } from 'next/server';
import { getContextFromAI } from '@/lib/aiClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const contextResponse = await getContextFromAI(text);
    
    return NextResponse.json({ context: contextResponse });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 
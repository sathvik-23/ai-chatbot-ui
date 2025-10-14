import { NextRequest, NextResponse } from 'next/server'
import { sendMessage, type SendMessageParams } from '@/lib/lucy-api'
import { generateUUID } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId, userId, files } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // For testing purposes, return a mock response instead of calling the real Lucy API
    // This allows us to test the chat interface without authentication
    console.log('Mock Lucy response for message:', message)

    const mockResponse = {
      id: generateUUID(),
      role: 'assistant' as const,
      parts: [
        {
          type: 'text' as const,
          text: `Hello! I'm Lucy, your AI assistant. I received your message: "${message}". This is a mock response for testing purposes. The real Lucy agent requires authentication.`,
        },
      ],
      createdAt: new Date(),
    }

    return NextResponse.json(mockResponse)
  } catch (error) {
    console.error('Lucy chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message with Lucy agent' },
      { status: 500 }
    )
  }
}

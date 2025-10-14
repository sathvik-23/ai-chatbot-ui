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

    const params: SendMessageParams = {
      message,
      sessionId: sessionId || generateUUID(),
      userId: userId || 'anonymous',
      files: files || [],
      stream: false,
    }

    const response = await sendMessage(params)

    // Convert Lucy response to AI chatbot format
    const aiChatResponse = {
      id: generateUUID(),
      role: 'assistant' as const,
      parts: [
        {
          type: 'text' as const,
          text: response.content,
        },
      ],
      createdAt: new Date(response.created_at * 1000),
    }

    return NextResponse.json(aiChatResponse)
  } catch (error) {
    console.error('Lucy chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message with Lucy agent' },
      { status: 500 }
    )
  }
}

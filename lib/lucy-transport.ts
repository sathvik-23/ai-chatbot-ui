import { DefaultChatTransport } from 'ai'
import type { ChatMessage } from '@/lib/types'
import { generateUUID } from '@/lib/utils'

export class LucyChatTransport extends DefaultChatTransport<ChatMessage> {
  constructor() {
    super({
      api: '/api/lucy-chat',
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        const response = await fetch(input, init)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.error || 'Failed to send message to Lucy agent'
          )
        }

        return response
      },
      prepareSendMessagesRequest(request: any) {
        const lastMessage = request.messages.at(-1)

        if (!lastMessage || lastMessage.role !== 'user') {
          throw new Error('Last message must be from user')
        }

        // Extract text content from message parts
        const textContent = lastMessage.parts
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join(' ')

        return {
          body: {
            message: textContent,
            sessionId: request.id,
            userId: 'anonymous',
          },
        }
      },
    })
  }
}

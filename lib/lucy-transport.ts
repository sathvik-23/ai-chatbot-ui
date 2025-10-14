import { DefaultChatTransport } from 'ai'
import type { ChatMessage } from '@/lib/types'
import { generateUUID } from '@/lib/utils'

export class LucyChatTransport extends DefaultChatTransport {
  constructor() {
    super({
      api: '/api/lucy-chat',
      fetch: async (url, options) => {
        const response = await fetch(url, options)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to send message')
        }

        return response
      },
      prepareSendMessagesRequest(request) {
        const lastMessage = request.messages.at(-1)

        if (!lastMessage || lastMessage.role !== 'user') {
          throw new Error('Last message must be from user')
        }

        // Extract text content from message parts
        const textContent = lastMessage.parts
          .filter((part) => part.type === 'text')
          .map((part) => part.text)
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

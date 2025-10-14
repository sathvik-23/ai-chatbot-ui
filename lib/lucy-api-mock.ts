import type { AgentResponse, SendMessageParams } from './lucy-api'

// Mock implementation of Lucy API for testing without authentication
export class LucyApiMock {
  private static instance: LucyApiMock
  private sessionMessages: Map<string, any[]> = new Map()

  static getInstance(): LucyApiMock {
    if (!LucyApiMock.instance) {
      LucyApiMock.instance = new LucyApiMock()
    }
    return LucyApiMock.instance
  }

  async sendMessage(params: SendMessageParams): Promise<AgentResponse> {
    // Simulate API delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    )

    const sessionId = params.sessionId || 'default-session'
    const messages = this.sessionMessages.get(sessionId) || []

    // Add user message to session
    messages.push({
      role: 'user',
      content: params.message,
    })

    // Generate a mock response based on the user's message
    const response = this.generateMockResponse(params.message)

    // Add assistant response to session
    messages.push({
      role: 'assistant',
      content: response.content,
    })

    this.sessionMessages.set(sessionId, messages)

    return {
      run_id: `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agent_id: 'lucy-agent',
      agent_name: 'Lucy Assistant',
      session_id: sessionId,
      content: response.content,
      content_type: 'text/plain',
      model: 'gpt-4',
      model_provider: 'openai',
      metrics: {
        input_tokens: Math.floor(params.message.length / 4),
        output_tokens: Math.floor(response.content.length / 4),
        total_tokens: Math.floor(
          (params.message.length + response.content.length) / 4
        ),
        duration: 1000 + Math.random() * 2000,
      },
      created_at: Math.floor(Date.now() / 1000),
      status: 'completed',
      messages: messages,
      tools: [],
    }
  }

  private generateMockResponse(userMessage: string): { content: string } {
    const message = userMessage.toLowerCase()

    // Purchase order related responses
    if (message.includes('purchase order') || message.includes('po')) {
      return {
        content: `I'd be happy to help you with purchase orders! I can assist you with:

- Creating new purchase orders
- Tracking existing orders
- Managing vendor information
- Processing order approvals
- Handling order modifications

What specific aspect of purchase orders would you like help with?`,
      }
    }

    if (message.includes('vendor') || message.includes('supplier')) {
      return {
        content: `I can help you manage vendor information! Here's what I can do:

- Add new vendors to the system
- Update vendor details and contact information
- Track vendor performance and ratings
- Manage vendor contracts and agreements
- Process vendor payments

Would you like to add a new vendor or work with an existing one?`,
      }
    }

    if (message.includes('approval') || message.includes('approve')) {
      return {
        content: `I can help you with the approval process! The approval workflow typically includes:

- Reviewing purchase order details
- Checking budget and authorization limits
- Routing to appropriate approvers
- Tracking approval status
- Sending notifications

What type of approval are you looking to process?`,
      }
    }

    if (message.includes('track') || message.includes('status')) {
      return {
        content: `I can help you track purchase orders! You can:

- Check the status of any purchase order
- View delivery timelines and updates
- Monitor order progress
- Set up notifications for status changes
- Generate tracking reports

Please provide the purchase order number or tell me what you'd like to track.`,
      }
    }

    if (
      message.includes('hello') ||
      message.includes('hi') ||
      message.includes('hey')
    ) {
      return {
        content: `Hello! I'm Lucy, your AI-powered purchase order assistant. I'm here to help you with:

- Purchase order management
- Vendor relations
- Order tracking and status updates
- Approval workflows
- Cost analysis and reporting

How can I assist you today?`,
      }
    }

    if (message.includes('help') || message.includes('what can you do')) {
      return {
        content: `I'm Lucy, your comprehensive purchase order assistant! Here's what I can help you with:

**Purchase Orders:**
- Create, edit, and manage purchase orders
- Track order status and delivery
- Handle order modifications and cancellations

**Vendor Management:**
- Add and update vendor information
- Track vendor performance
- Manage vendor contracts

**Approval Workflows:**
- Process order approvals
- Route approvals to appropriate stakeholders
- Track approval status

**Reporting & Analytics:**
- Generate purchase order reports
- Cost analysis and budgeting
- Vendor performance metrics

What would you like to work on?`,
      }
    }

    // Default response
    return {
      content: `I understand you're asking about "${userMessage}". As your purchase order assistant, I can help you with various aspects of procurement and order management. 

Could you please provide more specific details about what you'd like to accomplish? For example:
- Are you looking to create a new purchase order?
- Do you need to track an existing order?
- Would you like help with vendor management?
- Are you working on approvals or reporting?

I'm here to make your procurement process smoother and more efficient!`,
    }
  }

  async getConfig() {
    return {
      status: 'ok',
      version: '1.0.0',
      features: [
        'purchase_orders',
        'vendor_management',
        'approvals',
        'reporting',
      ],
    }
  }

  async getModels() {
    return {
      models: [
        { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
      ],
    }
  }

  async healthCheck() {
    return { status: 'ok' }
  }

  async getAgentDetails(agentId: string = 'lucy-agent') {
    return {
      id: agentId,
      name: 'Lucy Assistant',
      description: 'AI-powered Purchase Order Assistant',
      status: 'active',
      capabilities: ['purchase_orders', 'vendor_management', 'approvals'],
    }
  }

  async listSessions() {
    return {
      sessions: Array.from(this.sessionMessages.keys()).map((sessionId) => ({
        id: sessionId,
        created_at: Date.now() - Math.random() * 86400000, // Random time in last 24 hours
        message_count: this.sessionMessages.get(sessionId)?.length || 0,
      })),
    }
  }

  async getSession(sessionId: string) {
    const messages = this.sessionMessages.get(sessionId) || []
    return {
      id: sessionId,
      messages: messages,
      created_at: Date.now() - Math.random() * 86400000,
      updated_at: Date.now(),
    }
  }

  async deleteSession(sessionId: string) {
    this.sessionMessages.delete(sessionId)
    return { status: 'deleted', session_id: sessionId }
  }
}

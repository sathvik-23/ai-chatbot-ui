const axios = require('axios')

const API_URL =
  process.env.NEXT_PUBLIC_LUCY_API_URL || 'https://lucy-agent-be.vercel.app'
const AGENT_ID = process.env.NEXT_PUBLIC_AGENT_ID || 'lucy-agent'

// Create API client
const lucyApiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

/**
 * Send a message to the Lucy agent
 */
async function sendMessage(params) {
  const formData = new FormData()

  formData.append('message', params.message)
  formData.append('stream', String(params.stream ?? false))

  if (params.sessionId) {
    formData.append('session_id', params.sessionId)
  }

  if (params.userId) {
    formData.append('user_id', params.userId)
  }

  // Add files if provided
  if (params.files && params.files.length > 0) {
    params.files.forEach((file) => {
      formData.append('files', file)
    })
  }

  try {
    const headers = {
      'Content-Type': 'multipart/form-data',
    }

    const response = await lucyApiClient.post(
      `/agents/${AGENT_ID}/runs`,
      formData,
      { headers }
    )

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Lucy API Error:', error.response?.data || error.message)
      throw new Error(
        error.response?.data?.detail || 'Failed to send message to Lucy agent'
      )
    }
    throw error
  }
}

/**
 * Health check
 */
async function healthCheck() {
  try {
    const response = await lucyApiClient.get('/health')
    return response.data
  } catch (error) {
    console.error('Health check failed:', error)
    throw error
  }
}

/**
 * Get agent details
 */
async function getAgentDetails(agentId = AGENT_ID) {
  try {
    const response = await lucyApiClient.get(`/agents/${agentId}`)
    return response.data
  } catch (error) {
    console.error('Failed to get agent details:', error)
    throw error
  }
}

module.exports = {
  lucyApiClient,
  sendMessage,
  healthCheck,
  getAgentDetails,
}

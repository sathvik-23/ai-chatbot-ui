import axios from 'axios'
import { generateUUID } from './utils'
import { getAccessToken, clearTokens } from './auth'
import { refreshToken } from './auth-api'

const API_URL =
  process.env.NEXT_PUBLIC_LUCY_API_URL || 'https://lucy-agent-be.vercel.app'
const AGENT_ID = process.env.NEXT_PUBLIC_AGENT_ID || 'lucy-agent'

// Create API client
export const lucyApiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

// Add request interceptor to include auth token
lucyApiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle token refresh
lucyApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        await refreshToken()
        const newToken = getAccessToken()
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return lucyApiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        clearTokens()
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface SendMessageParams {
  message: string
  sessionId?: string
  userId?: string
  files?: File[]
  stream?: boolean
}

export interface AgentResponse {
  run_id: string
  agent_id: string
  agent_name: string
  session_id: string
  content: string
  content_type: string
  model: string
  model_provider: string
  metrics: {
    input_tokens: number
    output_tokens: number
    total_tokens: number
    duration: number
  }
  created_at: number
  status: string
  messages: Message[]
  tools: any[]
}

/**
 * Send a message to the Lucy agent
 */
export async function sendMessage(
  params: SendMessageParams
): Promise<AgentResponse> {
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
    const token = getAccessToken()
    const headers: any = {
      'Content-Type': 'multipart/form-data',
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await lucyApiClient.post<AgentResponse>(
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
export async function healthCheck() {
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
export async function getAgentDetails(agentId: string = AGENT_ID) {
  try {
    const response = await lucyApiClient.get(`/agents/${agentId}`)
    return response.data
  } catch (error) {
    console.error('Failed to get agent details:', error)
    throw error
  }
}

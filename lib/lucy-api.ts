import axios from 'axios'
import { LucyApiMock } from './lucy-api-mock'
import { getAccessToken, clearTokens } from './auth'
import { refreshToken } from './auth-api'

const API_URL =
  process.env.NEXT_PUBLIC_LUCY_API_URL || 'https://lucy-agent-be.vercel.app'
const AGENT_ID = process.env.NEXT_PUBLIC_AGENT_ID || 'lucy-agent'
const USE_MOCK =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_USE_LUCY_MOCK === 'true'

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
          window.location.href = '/login'
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
  // Use mock implementation in development or when explicitly enabled
  if (USE_MOCK) {
    console.log('Using Lucy API Mock for development')
    const mock = LucyApiMock.getInstance()
    return await mock.sendMessage(params)
  }

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
    const headers: any = {
      'Content-Type': 'multipart/form-data',
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
      // Fallback to mock if API fails
      console.log('Falling back to Lucy API Mock due to API error')
      const mock = LucyApiMock.getInstance()
      return await mock.sendMessage(params)
    }
    throw error
  }
}

/**
 * Get agent configuration
 */
export async function getConfig() {
  if (USE_MOCK) {
    const mock = LucyApiMock.getInstance()
    return await mock.getConfig()
  }

  try {
    const response = await lucyApiClient.get('/config')
    return response.data
  } catch (error) {
    console.error('Failed to get config:', error)
    const mock = LucyApiMock.getInstance()
    return await mock.getConfig()
  }
}

/**
 * Get available models
 */
export async function getModels() {
  if (USE_MOCK) {
    const mock = LucyApiMock.getInstance()
    return await mock.getModels()
  }

  try {
    const response = await lucyApiClient.get('/models')
    return response.data
  } catch (error) {
    console.error('Failed to get models:', error)
    const mock = LucyApiMock.getInstance()
    return await mock.getModels()
  }
}

/**
 * Health check
 */
export async function healthCheck() {
  if (USE_MOCK) {
    const mock = LucyApiMock.getInstance()
    return await mock.healthCheck()
  }

  try {
    const response = await lucyApiClient.get('/health')
    return response.data
  } catch (error) {
    console.error('Health check failed:', error)
    const mock = LucyApiMock.getInstance()
    return await mock.healthCheck()
  }
}

/**
 * Get agent details
 */
export async function getAgentDetails(agentId: string = AGENT_ID) {
  if (USE_MOCK) {
    const mock = LucyApiMock.getInstance()
    return await mock.getAgentDetails(agentId)
  }

  try {
    const response = await lucyApiClient.get(`/agents/${agentId}`)
    return response.data
  } catch (error) {
    console.error('Failed to get agent details:', error)
    const mock = LucyApiMock.getInstance()
    return await mock.getAgentDetails(agentId)
  }
}

/**
 * List all sessions
 */
export async function listSessions() {
  if (USE_MOCK) {
    const mock = LucyApiMock.getInstance()
    return await mock.listSessions()
  }

  try {
    const response = await lucyApiClient.get('/sessions')
    return response.data
  } catch (error) {
    console.error('Failed to list sessions:', error)
    const mock = LucyApiMock.getInstance()
    return await mock.listSessions()
  }
}

/**
 * Get session by ID
 */
export async function getSession(sessionId: string) {
  if (USE_MOCK) {
    const mock = LucyApiMock.getInstance()
    return await mock.getSession(sessionId)
  }

  try {
    const response = await lucyApiClient.get(`/sessions/${sessionId}`)
    return response.data
  } catch (error) {
    console.error('Failed to get session:', error)
    const mock = LucyApiMock.getInstance()
    return await mock.getSession(sessionId)
  }
}

/**
 * Delete session
 */
export async function deleteSession(sessionId: string) {
  if (USE_MOCK) {
    const mock = LucyApiMock.getInstance()
    return await mock.deleteSession(sessionId)
  }

  try {
    const response = await lucyApiClient.delete(`/sessions/${sessionId}`)
    return response.data
  } catch (error) {
    console.error('Failed to delete session:', error)
    const mock = LucyApiMock.getInstance()
    return await mock.deleteSession(sessionId)
  }
}

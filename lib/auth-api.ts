import axios from 'axios'
import Cookies from 'js-cookie'
import {
  AuthTokens,
  User,
  setTokens,
  getRefreshToken,
  clearTokens,
  getAccessToken,
} from './auth'

const API_URL =
  process.env.NEXT_PUBLIC_LUCY_API_URL || 'https://lucy-agent-be.vercel.app'

export interface LoginRequest {
  email: string
}

export interface VerifyRequest {
  email: string
  otp_code: string
}

export interface RefreshRequest {
  refresh_token: string
}

export interface AuthResponse {
  status: string
  message: string
  access_token?: string
  refresh_token?: string
  expires_in?: number
}

export interface UserResponse {
  status: string
  worker: User
}

export interface OTPStatusResponse {
  status: string
  otp_status: {
    expires_at: string
    attempts: number
    max_attempts: number
    remaining_attempts: number
  }
}

// Authentication API functions
export const authAPI = {
  // Send OTP to email
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/auth/login`, data)
    return response.data
  },

  // Verify OTP and get tokens
  verify: async (data: VerifyRequest): Promise<AuthResponse> => {
    console.log('📡 Sending verify request to:', `${API_URL}/auth/verify`)
    console.log('📡 Request data:', data)
    const response = await axios.post(`${API_URL}/auth/verify`, data)
    console.log('📡 Verify response status:', response.status)
    console.log('📡 Verify response data:', response.data)
    return response.data
  },

  // Refresh access token
  refresh: async (data: RefreshRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/auth/refresh`, data)
    return response.data
  },

  // Get current user profile
  getMe: async (): Promise<UserResponse> => {
    console.log('📡 Calling /auth/me endpoint...')
    const token = getAccessToken()
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    console.log('📡 /auth/me response:', response.data)
    return response.data
  },

  // Logout user
  logout: async (): Promise<AuthResponse> => {
    console.log('🚪 Calling /auth/logout endpoint...')
    try {
      const token = getAccessToken()
      const response = await axios.post(
        `${API_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      console.log('✅ Logout successful:', response.data)
      return response.data
    } catch (error) {
      console.log(
        '⚠️ Logout API call failed, but continuing with local cleanup:',
        error
      )
      // Even if API call fails, we should still clear local tokens
      return {
        status: 'success',
        message: 'Logged out locally',
      }
    }
  },

  // Get OTP status (for debugging)
  getOTPStatus: async (email: string): Promise<OTPStatusResponse> => {
    const response = await axios.get(
      `${API_URL}/auth/otp-status?email=${email}`
    )
    return response.data
  },
}

// Token refresh function
export const refreshToken = async (): Promise<void> => {
  const refreshTokenValue = getRefreshToken()
  if (!refreshTokenValue) {
    throw new Error('No refresh token available')
  }

  try {
    const response = await authAPI.refresh({ refresh_token: refreshTokenValue })
    if (response.access_token && response.refresh_token) {
      setTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        expires_in: response.expires_in || 3600,
      })
    }
  } catch (error) {
    clearTokens()
    throw error
  }
}

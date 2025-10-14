'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '../lib/auth'
import { authAPI } from '../lib/auth-api'
import {
  isAuthenticated,
  clearTokens,
  setTokens,
  getAccessToken,
} from '../lib/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string) => Promise<void>
  verifyOTP: (email: string, otp: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async () => {
    console.log('🔍 Checking authentication on page load...')
    const authStatus = isAuthenticated()
    console.log('🔍 isAuthenticated():', authStatus)

    if (authStatus) {
      try {
        console.log('✅ User is authenticated, fetching user data...')
        const response = await authAPI.getMe()
        console.log('✅ User data retrieved:', response)

        // Check the response structure and set user accordingly
        if (response.status === 'success' && response.worker) {
          console.log('👤 Setting user data in checkAuth:', response.worker)
          setUser(response.worker)
        } else if (response.status === 'success' && response.user) {
          console.log('👤 Setting user data in checkAuth:', response.user)
          setUser(response.user)
        } else {
          console.log(
            '⚠️ Unexpected response structure in checkAuth:',
            response
          )
          setUser(null)
        }
      } catch (error) {
        console.error('❌ Auth check failed:', error)
        clearTokens()
      }
    } else {
      console.log('ℹ️ User is not authenticated')
    }
    setIsLoading(false)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email: string) => {
    await authAPI.login({ email })
  }

  const verifyOTP = async (email: string, otp: string) => {
    console.log('🔐 Verifying OTP for:', email)
    const response = await authAPI.verify({ email, otp_code: otp })
    console.log('✅ OTP verification response:', response)

    if (response.access_token && response.refresh_token) {
      console.log('🔐 Setting tokens...')
      setTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        expires_in: response.expires_in || 3600,
      })

      // Add small delay to ensure cookies are properly set
      console.log('⏱️ Waiting for cookies to be set...')
      await new Promise((resolve) => setTimeout(resolve, 100))

      console.log('👤 Fetching user data...')
      await refreshUser()
    }
  }

  const logout = async () => {
    console.log('🚪 Starting logout process...')
    try {
      // Call logout API to invalidate tokens on server
      await authAPI.logout()
      console.log('✅ Server logout successful')
    } catch (error) {
      console.error(
        '⚠️ Server logout failed, but continuing with local cleanup:',
        error
      )
    } finally {
      // Always clear local tokens and state
      console.log('🧹 Clearing local tokens and state...')
      clearTokens()
      setUser(null)
      console.log('✅ Logout complete - user logged out')
    }
  }

  const refreshUser = async () => {
    try {
      const token = getAccessToken()
      console.log(
        '🔍 Token retrieved for /auth/me:',
        token ? 'Present' : 'Missing'
      )

      const response = await authAPI.getMe()
      console.log('✅ /auth/me successful:', response)

      // Check the response structure and set user accordingly
      if (response.status === 'success' && response.worker) {
        console.log('👤 Setting user data:', response.worker)
        setUser(response.worker)
      } else if (response.status === 'success' && response.user) {
        console.log('👤 Setting user data:', response.user)
        setUser(response.user)
      } else {
        console.log('⚠️ Unexpected response structure:', response)
        setUser(null)
      }
    } catch (error) {
      console.error('❌ Failed to refresh user:', error)
      clearTokens()
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    verifyOTP,
    logout,
    refreshUser,
  }

  // Debug logging for state changes
  console.log('🔄 AuthContext state:', {
    user: user ? `${user.name} (${user.email})` : 'null',
    isLoading,
    isAuthenticated: !!user,
  })

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

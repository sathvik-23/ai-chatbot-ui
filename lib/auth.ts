import Cookies from 'js-cookie'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const TOKEN_EXPIRY_KEY = 'token_expiry'

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface User {
  email: string
  name: string
  user_type: string
  is_active: boolean
  worker_id?: string
}

// Token management functions
export const setTokens = (tokens: AuthTokens): void => {
  const expiryTime = Date.now() + tokens.expires_in * 1000

  console.log('🔐 Storing tokens:', {
    access_token: tokens.access_token.substring(0, 20) + '...',
    expires_in: tokens.expires_in,
    expiryTime: new Date(expiryTime).toISOString(),
  })

  Cookies.set(ACCESS_TOKEN_KEY, tokens.access_token, {
    expires: new Date(expiryTime),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })

  Cookies.set(REFRESH_TOKEN_KEY, tokens.refresh_token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })

  Cookies.set(TOKEN_EXPIRY_KEY, expiryTime.toString(), {
    expires: new Date(expiryTime),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })

  console.log('✅ Tokens stored in cookies')
}

export const getAccessToken = (): string | null => {
  return Cookies.get(ACCESS_TOKEN_KEY) || null
}

export const getRefreshToken = (): string | null => {
  return Cookies.get(REFRESH_TOKEN_KEY) || null
}

export const clearTokens = (): void => {
  Cookies.remove(ACCESS_TOKEN_KEY)
  Cookies.remove(REFRESH_TOKEN_KEY)
  Cookies.remove(TOKEN_EXPIRY_KEY)
}

export const isTokenExpired = (): boolean => {
  const expiryTime = Cookies.get(TOKEN_EXPIRY_KEY)
  if (!expiryTime) return true

  return Date.now() >= parseInt(expiryTime)
}

export const isAuthenticated = (): boolean => {
  const token = getAccessToken()
  return !!token && !isTokenExpired()
}

'use client'

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import Image from 'next/image'

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { login, verifyOTP } = useAuth()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(email)
      setStep('otp')
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await verifyOTP(email, otp)
      // If we get here, verification was successful
      console.log('✅ OTP verification successful, should redirect to chat')
    } catch (error: any) {
      console.error('❌ OTP verification error:', error)
      setError(error.message || error.response?.data?.detail || 'Invalid OTP')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'email') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8 pt-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="relative">
                <Image
                  src="/images/lucy-avatar.png.png"
                  alt="Agent Lucy"
                  width={48}
                  height={48}
                  className="rounded-full ring-2 ring-primary/20"
                />
              </div>
              <CardTitle className="text-3xl font-bold text-slate-900">
                Agent Lucy
              </CardTitle>
            </div>
            <CardDescription className="text-slate-600 text-base">
              Use your email and password to sign in
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="user@acme.com"
                  className="w-full h-12 text-base border-slate-200 focus:border-primary focus:ring-primary/20 rounded-lg"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Sending OTP...
                  </div>
                ) : (
                  'Send OTP'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <span className="font-semibold text-slate-900 cursor-pointer hover:text-primary transition-colors">
                  Sign up for free.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              <Image
                src="/images/lucy-avatar.png.png"
                alt="Agent Lucy"
                width={48}
                height={48}
                className="rounded-full ring-2 ring-primary/20"
              />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900">
              Agent Lucy
            </CardTitle>
          </div>
          <CardDescription className="text-slate-600 text-base">
            Enter the 6-digit code sent to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleOTPSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="otp"
                className="text-sm font-semibold text-slate-700 uppercase tracking-wider"
              >
                Verification Code
              </Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                placeholder="000000"
                className="w-full h-12 text-center text-lg tracking-widest font-mono border-slate-200 focus:border-primary focus:ring-primary/20 rounded-lg"
              />
              <p className="text-sm text-slate-500">
                Check your email for the 6-digit verification code
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('email')}
                className="flex-1 h-12 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify Code'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

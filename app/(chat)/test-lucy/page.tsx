'use client'

import { useState } from 'react'
import { sendMessage } from '@/lib/lucy-api'

export default function TestLucyPage() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || loading) return

    setLoading(true)
    try {
      const result = await sendMessage({
        message: message.trim(),
        sessionId: 'test-session',
        userId: 'test-user',
      })

      setResponse(result.content)
    } catch (error) {
      setResponse(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Lucy API Integration Test
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Message to Lucy:
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask Lucy about purchase orders, vendors, or anything else..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {response && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Lucy's Response:
            </h2>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-gray-700">{response}</p>
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Integration Status:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✅ Lucy API client configured</li>
            <li>✅ Mock implementation active (development mode)</li>
            <li>✅ Chat transport updated</li>
            <li>✅ UI integration complete</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

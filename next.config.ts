import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_LUCY_API_URL:
      process.env.NEXT_PUBLIC_LUCY_API_URL ||
      'https://lucy-agent-be.vercel.app',
    NEXT_PUBLIC_AGENT_ID: process.env.NEXT_PUBLIC_AGENT_ID || 'lucy-agent',
  },
}

export default nextConfig

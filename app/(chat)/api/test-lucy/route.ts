import { NextRequest, NextResponse } from 'next/server'
import { healthCheck, getAgentDetails } from '@/lib/lucy-api'

export async function GET(request: NextRequest) {
  try {
    // Test health check
    const health = await healthCheck()

    // Test agent details
    const agentDetails = await getAgentDetails()

    return NextResponse.json({
      success: true,
      health,
      agentDetails,
    })
  } catch (error) {
    console.error('Lucy API test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

'use client'

import { Chat } from '@/components/chat'
import { DataStreamHandler } from '@/components/data-stream-handler'
import { DataStreamProvider } from '@/components/data-stream-provider'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models'
import { generateUUID } from '@/lib/utils'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const id = generateUUID()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <ProtectedRoute>
        <div>Loading...</div>
      </ProtectedRoute>
    )
  }

  return (
    <DataStreamProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col h-screen">
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-14 items-center justify-between px-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Image
                      src="/images/lucy-avatar.png.png"
                      alt="Agent Lucy"
                      width={32}
                      height={32}
                      className="rounded-full ring-2 ring-primary/20"
                    />
                  </div>
                  <h1 className="text-lg font-semibold">Agent Lucy</h1>
                </div>
              </div>
            </header>
            <div className="flex-1">
              <Chat
                autoResume={false}
                id={id}
                initialChatModel={DEFAULT_CHAT_MODEL}
                initialMessages={[]}
                initialVisibilityType="private"
                isReadonly={false}
                key={id}
              />
              <DataStreamHandler />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DataStreamProvider>
  )
}

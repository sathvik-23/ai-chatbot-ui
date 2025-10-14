import { cookies } from 'next/headers'
import { Chat } from '@/components/chat'
import { DataStreamHandler } from '@/components/data-stream-handler'
import { DataStreamProvider } from '@/components/data-stream-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models'
import { generateUUID } from '@/lib/utils'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { UserProfileNav } from '@/components/UserProfileNav'

export default async function Home() {
  const id = generateUUID()

  const cookieStore = await cookies()
  const modelIdFromCookie = cookieStore.get('chat-model')

  return (
    <ProtectedRoute>
      <DataStreamProvider>
        <SidebarProvider>
          <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto py-8 px-4">
              <div className="max-w-4xl mx-auto">
                <header className="text-center mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1"></div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                      Lucy Assistant
                    </h1>
                    <div className="flex-1 flex justify-end">
                      <UserProfileNav />
                    </div>
                  </div>
                  <p className="text-gray-600">Your AI-powered assistant</p>
                </header>
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  {!modelIdFromCookie ? (
                    <Chat
                      autoResume={false}
                      id={id}
                      initialChatModel={DEFAULT_CHAT_MODEL}
                      initialMessages={[]}
                      initialVisibilityType="private"
                      isReadonly={false}
                      key={id}
                    />
                  ) : (
                    <Chat
                      autoResume={false}
                      id={id}
                      initialChatModel={modelIdFromCookie.value}
                      initialMessages={[]}
                      initialVisibilityType="private"
                      isReadonly={false}
                      key={id}
                    />
                  )}
                </div>
                <DataStreamHandler />
              </div>
            </div>
          </main>
        </SidebarProvider>
      </DataStreamProvider>
    </ProtectedRoute>
  )
}

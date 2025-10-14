'use client'

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Avatar, AvatarFallback } from './ui/avatar'
import { LogOut, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export const SidebarProfile: React.FC = () => {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  if (!user) {
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="w-full border-0 bg-gradient-to-br from-muted/30 to-muted/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start p-3 h-auto hover:bg-muted/60 transition-all duration-200 rounded-xl group"
            >
              <div className="flex items-center space-x-3 w-full">
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-200">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-lg shadow-md">
                      {getInitials(user.name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background shadow-sm"></div>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-200">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate group-hover:text-foreground/80 transition-colors duration-200">
                    {user.email}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 p-2 bg-background/95 backdrop-blur-md border border-border/50 shadow-2xl rounded-xl"
            align="end"
            side="top"
            sideOffset={12}
          >
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Account
              </p>
            </div>
            <DropdownMenuItem
              onClick={handleToggleTheme}
              className="cursor-pointer rounded-lg p-3 hover:bg-muted/50 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors duration-200">
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Moon className="h-4 w-4 text-slate-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {theme === 'dark'
                      ? 'Switch to Light Mode'
                      : 'Switch to Dark Mode'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {theme === 'dark'
                      ? 'Brighten your workspace'
                      : 'Easier on the eyes'}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
            <div className="h-px bg-border/50 my-1"></div>
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-red-600 focus:text-red-600 cursor-pointer rounded-lg p-3 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/20 group-hover:bg-red-100 dark:group-hover:bg-red-950/30 transition-colors duration-200">
                  <LogOut className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  {isLoggingOut ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                      <p className="text-sm font-medium">Signing out...</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium">Sign out</p>
                      <p className="text-xs text-muted-foreground">
                        End your session
                      </p>
                    </>
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}

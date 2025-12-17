
"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Settings, 
  LogOut, 
  User, 
  Crown,
  Shield,
  ChevronDown
} from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
  user: any
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const { data: session } = useSession() || {}

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/90 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                Mindful Champion
              </span>
            </div>
          </Link>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Subscription Badge */}
            <Badge 
              className={`hidden sm:flex ${
                user?.subscriptionTier === 'PRO' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                  : user?.subscriptionTier === 'PREMIUM'
                  ? 'bg-gradient-to-r from-teal-500 to-orange-500'
                  : 'bg-slate-500'
              }`}
            >
              {user?.role === 'ADMIN' && <Shield className="w-3 h-3 mr-1" />}
              {user?.subscriptionTier === 'PRO' && <Crown className="w-3 h-3 mr-1" />}
              {user?.subscriptionTier || 'FREE'}
            </Badge>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-orange-500 text-white">
                      {user?.firstName?.[0] || user?.name?.[0] || session?.user?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-slate-900">
                      {user?.firstName || session?.user?.name || 'Champion'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user?.playerRating || '0.0'} Rating
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || session?.user?.name || 'Champion'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                
                {user?.role === 'ADMIN' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem asChild>
                  <Link href="/pricing" className="flex items-center">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade Plan
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="flex items-center text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

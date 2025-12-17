
'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import InteractiveAvatar from './avatar/interactive-avatar';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { MessageCircle, Settings } from 'lucide-react';
import Link from 'next/link';

export default function DashboardAvatar() {
  const { data: session } = useSession() || {};
  const userAvatarUrl = (session?.user as any)?.avatarUrl || undefined;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 border-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <InteractiveAvatar
          state="idle"
          avatarUrl={userAvatarUrl}
          size="md"
          showStatusIndicator={false}
        />
        
        <div className="mt-4 text-center">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            Coach Kai
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Your AI Coaching Companion
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2 w-full">
          <Link href="/ai-coach" className="w-full">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat with Coach Kai
            </Button>
          </Link>
          
          {session?.user?.subscriptionTier === 'PRO' && (
            <Link href="/avatar-settings" className="w-full">
              <Button variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Customize Avatar
              </Button>
            </Link>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 w-full">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            {session?.user?.subscriptionTier === 'PRO' 
              ? '✨ Pro users can upload their own avatar photo'
              : '⭐ Upgrade to Pro to customize your avatar'
            }
          </p>
        </div>
      </motion.div>
    </Card>
  );
}

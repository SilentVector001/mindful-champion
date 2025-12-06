
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Video,
  Shield,
  Home,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { AdminVideoHub } from './admin-video-hub';

export function AdminVideoManagementPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header with Breadcrumb */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/admin" className="flex items-center gap-1 hover:text-blue-600">
            <Home className="w-4 h-4" />
            Admin
          </Link>
          <span>/</span>
          <span className="flex items-center gap-2 font-medium text-gray-900">
            <Video className="w-4 h-4" />
            Video Management
          </span>
        </nav>
      </div>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Video Management Center
            </h1>
            <p className="text-lg text-gray-600">
              Comprehensive admin tools for video analysis management, monitoring, and security
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Video className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Feature Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-blue-900">Upload Videos</h3>
            <p className="text-sm text-blue-700 mt-2">
              Upload videos directly to user accounts for analysis
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-green-900">Monitor Content</h3>
            <p className="text-sm text-green-700 mt-2">
              Review, flag, and manage video content
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-purple-900">Security Events</h3>
            <p className="text-sm text-purple-700 mt-2">
              Track and manage video-related security events
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-orange-900">Admin Notes</h3>
            <p className="text-sm text-orange-700 mt-2">
              Add detailed notes and track video status
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Video Management Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AdminVideoHub />
      </motion.div>
    </div>
  );
}

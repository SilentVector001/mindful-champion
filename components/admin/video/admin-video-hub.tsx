
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video,
  Upload,
  Shield,
  Eye,
  ArrowLeft,
  Plus,
  List,
  Settings
} from 'lucide-react';

import { AdminVideoUpload } from './admin-video-upload';
import { AdminVideoManagement } from './admin-video-management';
import { AdminVideoDetail } from './admin-video-detail';
import { AdminVideoSecurity } from './admin-video-security';
import { AdminVideoAnalytics } from './admin-video-analytics';

interface VideoAnalysis {
  id: string;
  title: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string;
  };
}

interface AdminVideoHubProps {
  userId?: string;
  onClose?: () => void;
}

export function AdminVideoHub({ userId, onClose }: AdminVideoHubProps) {
  const [activeTab, setActiveTab] = useState('management');
  const [selectedVideo, setSelectedVideo] = useState<VideoAnalysis | null>(null);
  const [showVideoDetail, setShowVideoDetail] = useState(false);
  const [filteredUserId, setFilteredUserId] = useState<string | undefined>(userId);
  const [filteredUserName, setFilteredUserName] = useState<string>('');

  // Sync filteredUserId when userId prop changes
  useEffect(() => {
    if (userId) {
      setFilteredUserId(userId);
      // Clear the user name filter since we have a new userId
      setFilteredUserName('');
    }
  }, [userId]);

  // Handle video selection from management view
  const handleVideoSelect = (video: VideoAnalysis) => {
    setSelectedVideo(video);
    setShowVideoDetail(true);
  };

  // Handle going back from video detail
  const handleBackFromDetail = () => {
    setShowVideoDetail(false);
    setSelectedVideo(null);
  };

  // Handle successful upload
  const handleUploadComplete = (videoId: string) => {
    // Switch to management tab to see the uploaded video
    setActiveTab('management');
  };

  // Handle user click - show all videos by that user
  const handleUserClick = (userId: string, userName: string) => {
    setFilteredUserId(userId);
    setFilteredUserName(userName);
    setActiveTab('management'); // Switch to management tab
    setShowVideoDetail(false); // Close any open video detail
  };

  // Clear user filter
  const clearUserFilter = () => {
    setFilteredUserId(undefined);
    setFilteredUserName('');
  };

  if (showVideoDetail && selectedVideo) {
    return (
      <AdminVideoDetail
        videoId={selectedVideo.id}
        onBack={handleBackFromDetail}
        onVideoUpdate={(updatedVideo) => {
          // Update the selected video with new data
          setSelectedVideo(updatedVideo as VideoAnalysis);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Video Management
            </h1>
            <p className="text-gray-600 mt-1">
              Upload, manage, and monitor video analysis content
              {filteredUserName && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-md">
                  Viewing: {filteredUserName}
                  <button 
                    onClick={clearUserFilter}
                    className="hover:text-blue-900"
                    title="Clear filter"
                  >
                    ×
                  </button>
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Video className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="min-h-[600px]">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="management" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Manage Videos</span>
                <span className="sm:hidden">Videos</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
                <span className="sm:hidden">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Security</span>
                <span className="sm:hidden">Security</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Tabs value={activeTab}>
                <TabsContent value="management" className="mt-0">
                  <AdminVideoManagement
                    userId={filteredUserId}
                    onVideoSelect={handleVideoSelect}
                    onUserClick={handleUserClick}
                  />
                </TabsContent>

                <TabsContent value="upload" className="mt-0">
                  <AdminVideoUpload
                    onUploadComplete={handleUploadComplete}
                  />
                </TabsContent>

                <TabsContent value="security" className="mt-0">
                  <AdminVideoSecurity
                    userId={userId}
                  />
                </TabsContent>

                <TabsContent value="analytics" className="mt-0">
                  <AdminVideoAnalytics
                    userId={userId}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

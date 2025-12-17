
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  UserSearch, 
  FileVideo, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Search,
  Brain,
  Shield,
  Flag,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  skillLevel: string;
  createdAt: string;
  _count: {
    videoAnalyses: number;
  };
}

interface AdminVideoUploadProps {
  onUploadComplete?: (videoId: string) => void;
}

export function AdminVideoUpload({ onUploadComplete }: AdminVideoUploadProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    adminNotes: '',
    adminPriority: 'NORMAL'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Search users
  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setUsers([]);
      return;
    }

    setIsLoadingUsers(true);
    try {
      const response = await fetch(
        `/api/admin/videos/upload?search=${encodeURIComponent(searchTerm)}&limit=20`
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
      toast.error('Failed to search users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Debounced user search
  const handleUserSearch = useCallback((value: string) => {
    setUserSearch(value);
    const timer = setTimeout(() => {
      searchUsers(value);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // File drop handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        toast.error('File size must be less than 500MB');
        return;
      }
      setSelectedFile(file);
      // Auto-generate title from filename if not set
      if (!formData.title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  }, [formData.title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    multiple: false
  });

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !selectedFile || !formData.title.trim()) {
      toast.error('Please select a user, file, and enter a title');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('userId', selectedUser.id);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('adminNotes', formData.adminNotes);
      uploadFormData.append('adminPriority', formData.adminPriority);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/admin/videos/upload', {
        method: 'POST',
        body: uploadFormData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        toast.success('Video uploaded successfully!');
        
        // Reset form
        setSelectedFile(null);
        setSelectedUser(null);
        setFormData({
          title: '',
          description: '',
          adminNotes: '',
          adminPriority: 'NORMAL'
        });
        
        onUploadComplete?.(result.videoAnalysis.id);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Video Upload
            </h2>
            <p className="text-gray-600 text-sm font-medium">
              Upload videos for analysis to specific user accounts
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* User Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UserSearch className="w-5 h-5 text-blue-600" />
              <label className="text-lg font-semibold text-gray-800">
                Select Target User
              </label>
            </div>
            
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by email or name..."
                  value={userSearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUserSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {isLoadingUsers && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              )}
              
              {users.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                >
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        setSelectedUser(user);
                        setUsers([]);
                        setUserSearch('');
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : user.name || 'No Name'
                            }
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div className="text-right text-sm">
                          <Badge variant="outline">{user.skillLevel}</Badge>
                          <p className="text-gray-500 mt-1">
                            {user._count.videoAnalyses} videos
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {selectedUser && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      Selected: {selectedUser.firstName && selectedUser.lastName 
                        ? `${selectedUser.firstName} ${selectedUser.lastName}`
                        : selectedUser.name || 'No Name'
                      }
                    </p>
                    <p className="text-sm text-green-600">{selectedUser.email}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                    className="ml-auto"
                  >
                    Change
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileVideo className="w-5 h-5 text-blue-600" />
              <label className="text-lg font-semibold text-gray-800">
                Video File
              </label>
            </div>

            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
                isDragActive 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50",
                selectedFile && "border-green-400 bg-green-50"
              )}
            >
              <input {...getInputProps()} />
              
              {selectedFile ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                  <p className="font-semibold text-green-800">{selectedFile.name}</p>
                  <p className="text-sm text-green-600">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                  >
                    Remove File
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <FileVideo className="w-16 h-16 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-xl font-semibold text-gray-700">
                      {isDragActive ? 'Drop video file here' : 'Upload Video File'}
                    </p>
                    <p className="text-gray-500 mt-2">
                      Drop your video file here or click to browse
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Supports MP4, MOV, AVI, MKV (max 500MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">
                Video Title *
              </label>
              <Input
                placeholder="Enter video title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">
                Priority Level
              </label>
              <Select
                value={formData.adminPriority}
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, adminPriority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      Low Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="NORMAL">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Normal Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="HIGH">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-orange-500" />
                      High Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="URGENT">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      Urgent
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">
              Description
            </label>
            <Textarea
              placeholder="Enter video description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <label className="text-sm font-semibold text-gray-800">
                Admin Notes
              </label>
            </div>
            <Textarea
              placeholder="Add internal admin notes about this upload"
              value={formData.adminNotes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, adminNotes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Upload Progress */}
          <AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Uploading...</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-600">
                  {uploadProgress < 90 ? 'Uploading video...' : 'Processing...'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={!selectedUser || !selectedFile || !formData.title.trim() || isUploading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

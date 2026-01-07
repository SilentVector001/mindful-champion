"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Upload, Video, X, Camera, Smartphone, CheckCircle2, AlertCircle,
  FileVideo, HardDrive, Clock, Sparkles, ChevronRight, Info, Loader2,
  Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, Plus, Trash2
} from "lucide-react"

interface UploadedFile {
  file: File
  preview: string
  id: string
  status: 'pending' | 'uploading' | 'complete' | 'error'
  progress: number
  videoId?: string
  error?: string
}

interface EnhancedVideoUploadProps {
  onUploadComplete: (videos: { videoId: string; fileName: string }[]) => void
  maxFiles?: number
  maxSizeMB?: number
}

const ACCEPTED_FORMATS = {
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
  'video/x-msvideo': ['.avi'],
  'video/webm': ['.webm']
}

const FORMAT_INFO = [
  { format: 'MP4', recommended: true },
  { format: 'MOV', recommended: true },
  { format: 'AVI', recommended: false },
  { format: 'WebM', recommended: false },
]

export default function EnhancedVideoUpload({
  onUploadComplete,
  maxFiles = 5,
  maxSizeMB = 500
}: EnhancedVideoUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [currentPreview, setCurrentPreview] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showMobileCapture, setShowMobileCapture] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const generateId = () => Math.random().toString(36).substring(2, 15)

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `File exceeds ${maxSizeMB}MB limit` }
    }
    const validTypes = Object.keys(ACCEPTED_FORMATS)
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid format. Use MP4, MOV, AVI, or WebM' }
    }
    return { valid: true }
  }

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach(rejected => {
      const error = rejected.errors?.[0]?.message || 'File rejected'
      console.error('Rejected file:', rejected.file.name, error)
    })

    // Process accepted files
    const newFiles: UploadedFile[] = acceptedFiles.slice(0, maxFiles - files.length).map(file => {
      const validation = validateFile(file)
      return {
        file,
        preview: URL.createObjectURL(file),
        id: generateId(),
        status: validation.valid ? 'pending' : 'error',
        progress: 0,
        error: validation.error
      } as UploadedFile
    })

    setFiles(prev => [...prev, ...newFiles])
    if (newFiles.length > 0 && newFiles[0].status !== 'error') {
      setCurrentPreview(newFiles[0].preview)
    }
  }, [files.length, maxFiles, maxSizeBytes])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxSize: maxSizeBytes,
    multiple: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false)
  })

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validation = validateFile(file)
      const newFile: UploadedFile = {
        file,
        preview: URL.createObjectURL(file),
        id: generateId(),
        status: validation.valid ? 'pending' : 'error',
        progress: 0,
        error: validation.error
      }
      setFiles(prev => [...prev, newFile])
      setCurrentPreview(newFile.preview)
      setShowMobileCapture(false)
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (file) URL.revokeObjectURL(file.preview)
      const remaining = prev.filter(f => f.id !== id)
      if (file?.preview === currentPreview) {
        setCurrentPreview(remaining[0]?.preview || null)
      }
      return remaining
    })
  }

  const uploadFile = async (uploadFile: UploadedFile): Promise<{ videoId: string; fileName: string } | null> => {
    try {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'uploading' as const, progress: 0 } : f
      ))

      const formData = new FormData()
      formData.append('file', uploadFile.file)

      const xhr = new XMLHttpRequest()
      
      const result = await new Promise<{ videoId: string; fileName: string }>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100)
            setFiles(prev => prev.map(f => 
              f.id === uploadFile.id ? { ...f, progress } : f
            ))
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText)
              resolve({ videoId: data.videoId, fileName: uploadFile.file.name })
            } catch {
              reject(new Error('Invalid server response'))
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Network error')))
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')))

        xhr.open('POST', '/api/video-analysis/upload')
        xhr.send(formData)
      })

      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'complete' as const, progress: 100, videoId: result.videoId } : f
      ))

      return result
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' } : f
      ))
      return null
    }
  }

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending')
    const results: { videoId: string; fileName: string }[] = []

    for (const file of pendingFiles) {
      const result = await uploadFile(file)
      if (result) results.push(result)
    }

    if (results.length > 0) {
      onUploadComplete(results)
    }
  }

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const pendingCount = files.filter(f => f.status === 'pending').length
  const uploadingCount = files.filter(f => f.status === 'uploading').length
  const completeCount = files.filter(f => f.status === 'complete').length

  return (
    <div className="space-y-6">
      {/* Main Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300",
            isDragActive || isDragging
              ? "border-emerald-400 bg-emerald-500/10 scale-[1.02]"
              : "border-slate-600 hover:border-cyan-400 hover:bg-slate-800/50",
            "group"
          )}
        >
          <input {...getInputProps()} />
          
          {/* Animated Border */}
          <AnimatePresence>
            {(isDragActive || isDragging) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10">
            <motion.div
              animate={isDragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center mb-4"
            >
              <Upload className={cn(
                "w-10 h-10 transition-colors",
                isDragActive ? "text-emerald-400" : "text-cyan-400 group-hover:text-emerald-400"
              )} />
            </motion.div>

            <h3 className="text-xl font-semibold text-white mb-2">
              {isDragActive ? "Drop your video here!" : "Drag & drop your pickleball videos"}
            </h3>
            <p className="text-slate-400 mb-4">
              or click to browse • Max {maxSizeMB}MB per file
            </p>

            {/* Format badges */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {FORMAT_INFO.map(({ format, recommended }) => (
                <Badge
                  key={format}
                  variant="outline"
                  className={cn(
                    "text-xs",
                    recommended
                      ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                      : "border-slate-600 text-slate-400"
                  )}
                >
                  {format}
                  {recommended && <CheckCircle2 className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Capture Button */}
      <div className="flex gap-3 md:hidden">
        <input
          ref={cameraInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          onChange={handleCameraCapture}
          className="hidden"
        />
        <Button
          variant="outline"
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
        >
          <Camera className="w-4 h-4 mr-2" />
          Record Video
        </Button>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Choose File
        </Button>
      </div>

      {/* Video Preview */}
      <AnimatePresence mode="wait">
        {currentPreview && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900"
          >
            <div className="relative aspect-video bg-black">
              <video
                ref={videoRef}
                src={currentPreview}
                className="w-full h-full object-contain"
                muted={isMuted}
                loop
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Video Controls Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={togglePlayback}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                  <div className="flex-1" />
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Preview
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Queue */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-300">
              Upload Queue ({files.length} file{files.length !== 1 ? 's' : ''})
            </h4>
            <div className="flex gap-2">
              {completeCount > 0 && (
                <Badge className="bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {completeCount} Complete
                </Badge>
              )}
              {uploadingCount > 0 && (
                <Badge className="bg-cyan-500/20 text-cyan-400">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  {uploadingCount} Uploading
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {files.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                  file.preview === currentPreview
                    ? "border-cyan-500/50 bg-cyan-500/10"
                    : "border-slate-700 bg-slate-800/50 hover:bg-slate-800",
                  file.status === 'error' && "border-red-500/50 bg-red-500/10"
                )}
                onClick={() => file.status !== 'error' && setCurrentPreview(file.preview)}
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-10 rounded overflow-hidden bg-slate-900 flex-shrink-0">
                  <video
                    src={file.preview}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                  />
                  {file.status === 'uploading' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                    </div>
                  )}
                  {file.status === 'complete' && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {file.file.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{formatFileSize(file.file.size)}</span>
                    {file.status === 'error' && (
                      <span className="text-red-400">{file.error}</span>
                    )}
                  </div>
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="h-1 mt-1" />
                  )}
                </div>

                {/* Progress/Status */}
                <div className="flex items-center gap-2">
                  {file.status === 'uploading' && (
                    <span className="text-xs text-cyan-400 font-mono">{file.progress}%</span>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(file.id)
                    }}
                    className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Add More / Upload Button */}
          <div className="flex gap-3 pt-2">
            {files.length < maxFiles && (
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.querySelector('input[type="file"]') as HTMLInputElement
                  input?.click()
                }}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add More
              </Button>
            )}
            {pendingCount > 0 && (
              <Button
                onClick={uploadAllFiles}
                disabled={uploadingCount > 0}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white"
              >
                {uploadingCount > 0 ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload {pendingCount} Video{pendingCount !== 1 ? 's' : ''} & Analyze
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Tips Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20">
            <Info className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white">Tips for Best Results</h4>
            <ul className="text-xs text-slate-400 space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                Film 10-30 second clips from side-on view
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                Natural daylight provides the best analysis quality
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                Keep camera steady, 10-15 feet from court
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                Capture 1-3 shots per clip for detailed analysis
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

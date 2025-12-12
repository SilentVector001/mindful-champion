import { put, del, list } from '@vercel/blob';

/**
 * Upload a file to Vercel Blob Storage
 * @param buffer - File buffer
 * @param fileName - File name/key
 * @param isPublic - Whether the file should be publicly accessible
 * @param contentType - MIME type of the file
 * @returns The Blob URL (cloud_storage_path)
 */
export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  isPublic: boolean = false,
  contentType?: string
): Promise<string> {
  console.log('[Blob] Starting upload:', {
    fileName,
    fileSize: buffer.length,
    isPublic,
    contentType
  });

  try {
    const startTime = Date.now();
    
    // Upload to Vercel Blob
    const blob = await put(fileName, buffer, {
      access: 'public', // Vercel Blob uses signed URLs for security when needed
      contentType: contentType || 'application/octet-stream',
      addRandomSuffix: true, // Prevents filename collisions
    });

    const duration = Date.now() - startTime;
    console.log('[Blob] Upload successful:', {
      url: blob.url,
      duration: `${duration}ms`,
      size: buffer.length
    });

    return blob.url; // This is the permanent URL
  } catch (error) {
    console.error('[Blob] Upload failed:', {
      error: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'Unknown',
      fileName,
      fileSize: buffer.length
    });

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('token')) {
        throw new Error('Blob storage token not configured. Please check Vercel dashboard.');
      } else if (error.message.includes('limit') || error.message.includes('quota')) {
        throw new Error('Storage limit exceeded. Please upgrade your Vercel plan or delete old videos.');
      } else if (error.message.includes('size')) {
        throw new Error('File size exceeds Vercel Blob limits. Maximum file size is 500MB.');
      }
    }

    throw new Error(`Failed to upload file to Blob: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get URL for a file (Blob URLs are already permanent and public)
 * @param cloud_storage_path - Blob URL
 * @param isPublic - Not used for Blob (kept for API compatibility)
 * @returns The URL
 */
export async function getFileUrl(cloud_storage_path: string, isPublic?: boolean): Promise<string> {
  console.log('[Blob] Getting file URL:', cloud_storage_path);
  
  if (!cloud_storage_path) {
    throw new Error('cloud_storage_path is required');
  }
  
  // Vercel Blob URLs are already permanent and accessible
  // No need to generate signed URLs unless you need expiring links
  return cloud_storage_path;
}

/**
 * Delete a file from Vercel Blob
 * @param url - Blob URL (cloud_storage_path)
 */
export async function deleteFile(url: string): Promise<void> {
  console.log('[Blob] Deleting file:', url);

  if (!url) {
    throw new Error('URL is required for deletion');
  }

  try {
    await del(url);
    console.log('[Blob] Delete successful:', url);
  } catch (error) {
    console.error('[Blob] Delete failed:', {
      error: error instanceof Error ? error.message : String(error),
      url
    });
    
    if (error instanceof Error && error.message.includes('not found')) {
      // File already deleted or doesn't exist - not a critical error
      console.warn('[Blob] File not found, may have been already deleted:', url);
      return;
    }
    
    throw new Error(`Failed to delete file from Blob: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Rename/move a file in Vercel Blob
 * Note: Vercel Blob doesn't support renaming, so we copy and delete
 * @param oldUrl - Current Blob URL
 * @param newFileName - New file name
 */
export async function renameFile(oldUrl: string, newFileName: string): Promise<string> {
  console.log('[Blob] Renaming file:', { oldUrl, newFileName });
  
  try {
    // Fetch the old file
    const response = await fetch(oldUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Upload with new name
    const newUrl = await uploadFile(buffer, newFileName, false, contentType);
    
    // Delete old file
    await deleteFile(oldUrl);
    
    console.log('[Blob] Rename successful:', { oldUrl, newUrl });
    return newUrl;
  } catch (error) {
    console.error('[Blob] Rename failed:', error);
    throw new Error(`Failed to rename file in Blob: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * List all blobs with optional prefix filter
 * Useful for admin panel and storage management
 * @param prefix - Filter by prefix (e.g., "video_" for all videos)
 * @param limit - Maximum number of results (default: 1000)
 */
export async function listFiles(prefix?: string, limit: number = 1000) {
  console.log('[Blob] Listing files:', { prefix, limit });
  
  try {
    const result = await list({
      prefix,
      limit,
    });
    
    console.log('[Blob] List successful:', {
      count: result.blobs.length,
      hasMore: result.hasMore,
      cursor: result.cursor
    });
    
    return result.blobs;
  } catch (error) {
    console.error('[Blob] List failed:', error);
    throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get total storage used by a user
 * @param userVideoUrls - Array of video URLs for a specific user
 * @returns Total size in bytes
 */
export async function getUserStorageUsed(userVideoUrls: string[]): Promise<number> {
  console.log('[Blob] Calculating user storage:', { videoCount: userVideoUrls.length });
  
  try {
    let totalSize = 0;
    
    for (const url of userVideoUrls) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        const sizeHeader = response.headers.get('content-length');
        if (sizeHeader) {
          totalSize += parseInt(sizeHeader, 10);
        }
      } catch (error) {
        console.warn('[Blob] Could not get size for:', url, error);
        // Continue with other files
      }
    }
    
    console.log('[Blob] User storage calculated:', {
      totalSize,
      totalMB: (totalSize / 1024 / 1024).toFixed(2)
    });
    
    return totalSize;
  } catch (error) {
    console.error('[Blob] Storage calculation failed:', error);
    return 0; // Return 0 rather than throwing to prevent blocking operations
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getFileUrl instead
 */
export async function downloadFile(key: string): Promise<string> {
  return getFileUrl(key, false);
}

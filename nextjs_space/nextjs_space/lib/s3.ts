import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  CopyObjectCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getBucketConfig, createS3Client } from "./aws-config";

// Create a single shared S3 client instance
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = createS3Client();
  }
  return s3Client;
}

/**
 * Upload a file to S3
 * @param buffer - File buffer
 * @param fileName - File name/key
 * @param isPublic - Whether the file should be publicly accessible
 * @param contentType - MIME type of the file
 * @returns The S3 key (cloud_storage_path)
 */
export async function uploadFile(
  buffer: Buffer, 
  fileName: string, 
  isPublic: boolean = false,
  contentType?: string
): Promise<string> {
  const { bucketName, folderPrefix } = getBucketConfig();

  console.log('[S3] Starting upload:', {
    fileName,
    fileSize: buffer.length,
    isPublic,
    contentType,
    bucketName,
    folderPrefix
  });

  if (!bucketName) {
    const error = 'AWS_BUCKET_NAME not configured. Please check environment variables.';
    console.error('[S3] Configuration error:', error);
    throw new Error(error);
  }

  const client = getS3Client();

  // --- Log resolved credentials from the client (works for profiles / assumed roles) ---
  if (client.config.credentials) {
    try {
      const resolvedCreds = await client.config.credentials();
      console.log('[S3] Resolved AWS credentials from client:', {
        accessKeyId: resolvedCreds.accessKeyId?.substring(0, 10) + '...',
        hasSecretKey: !!resolvedCreds.secretAccessKey,
        hasSessionToken: !!resolvedCreds.sessionToken,
      });
      if (resolvedCreds.expiration) {
        console.log('[S3] Credentials expire at:', resolvedCreds.expiration);
      }
    } catch (err) {
      console.error('[S3] Failed to resolve client credentials:', err);
      throw new Error('Failed to resolve AWS credentials. Please check your AWS configuration.');
    }
  } else {
    console.warn('[S3] No credentials configured, using default credential chain');
  }
  
  // Generate S3 key
  const key = isPublic 
    ? `${folderPrefix}public/uploads/${fileName}`
    : `${folderPrefix}uploads/${fileName}`;
  
  console.log('[S3] Generated S3 key:', key);
  
  // Prepare command options
  const commandOptions: any = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(commandOptions);

  try {
    const startTime = Date.now();
    await client.send(command);
    const duration = Date.now() - startTime;
    console.log('[S3] Upload successful:', {
      key,
      duration: `${duration}ms`,
      size: buffer.length
    });
    return key;
  } catch (error) {
    console.error('[S3] Upload failed:', {
      error: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'Unknown',
      bucket: bucketName,
      key,
      fileSize: buffer.length
    });
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.name === 'CredentialsError' || error.message.includes('credentials')) {
        throw new Error('AWS credentials are invalid or expired. Please contact support.');
      } else if (error.name === 'NoSuchBucket' || error.message.includes('bucket')) {
        throw new Error(`S3 bucket '${bucketName}' does not exist or is not accessible.`);
      } else if (error.name === 'AccessDenied' || error.message.includes('Access Denied')) {
        throw new Error('Access denied to S3 bucket. Please check permissions.');
      }
    }
    
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get URL for a file
 * @param cloud_storage_path - S3 key
 * @param isPublic - Whether the file is public
 * @returns Public URL or signed URL
 */
export async function getFileUrl(cloud_storage_path: string, isPublic: boolean): Promise<string> {
  const { bucketName, region } = getBucketConfig();
  const client = getS3Client();
  
  if (!bucketName) {
    const error = 'AWS_BUCKET_NAME not configured. Please check environment variables.';
    console.error('[S3] Configuration error:', error);
    throw new Error(error);
  }
  
  if (!cloud_storage_path) {
    throw new Error('cloud_storage_path is required');
  }
  
  console.log('[S3] Getting file URL:', { 
    bucketName, 
    key: cloud_storage_path, 
    isPublic, 
    region 
  });
  
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: cloud_storage_path,
    });
    
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
    console.log('[S3] Generated signed URL successfully');
    return signedUrl;
  } catch (error) {
    console.error('[S3] Failed to generate URL:', {
      error: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'Unknown',
      bucket: bucketName,
      key: cloud_storage_path
    });
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.name === 'CredentialsError' || error.message.includes('credentials')) {
        throw new Error('AWS credentials are invalid or expired. Please contact support.');
      } else if (error.name === 'NoSuchKey' || error.message.includes('does not exist')) {
        throw new Error(`File '${cloud_storage_path}' does not exist in S3 bucket.`);
      } else if (error.name === 'AccessDenied' || error.message.includes('Access Denied')) {
        throw new Error('Access denied to S3 file. Please check permissions.');
      }
    }
    
    throw new Error(`Failed to generate URL for ${cloud_storage_path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a file from S3
 * @param key - S3 key (cloud_storage_path)
 */
export async function deleteFile(key: string): Promise<void> {
  const { bucketName } = getBucketConfig();
  const client = getS3Client();
  
  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME not configured');
  }
  
  console.log('[S3] Deleting file:', { bucketName, key });
  
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    await client.send(command);
    console.log('[S3] Delete successful:', key);
  } catch (error) {
    console.error('[S3] Delete failed:', error);
    throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Rename/move a file in S3
 * @param oldKey - Current S3 key
 * @param newKey - New S3 key
 */
export async function renameFile(oldKey: string, newKey: string): Promise<void> {
  const { bucketName } = getBucketConfig();
  const client = getS3Client();
  
  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME not configured');
  }
  
  console.log('[S3] Renaming file:', { bucketName, oldKey, newKey });
  
  try {
    await client.send(new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${oldKey}`,
      Key: newKey,
    }));
    
    await deleteFile(oldKey);
    console.log('[S3] Rename successful:', { oldKey, newKey });
  } catch (error) {
    console.error('[S3] Rename failed:', error);
    throw new Error(`Failed to rename file in S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getFileUrl instead
 */
export async function downloadFile(key: string): Promise<string> {
  return getFileUrl(key, false);
}

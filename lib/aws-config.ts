import { S3Client } from "@aws-sdk/client-s3"
import { fromNodeProviderChain } from "@aws-sdk/credential-providers"
import { execSync } from "child_process"

export function getBucketConfig() {
  return {
    bucketName: process.env.AWS_BUCKET_NAME || '',
    folderPrefix: process.env.AWS_FOLDER_PREFIX || '',
    region: process.env.AWS_REGION || 'us-west-2'
  }
}

// Credential cache to avoid redundant fetching
let credentialCache: {
  credentials: { accessKeyId: string; secretAccessKey: string; sessionToken?: string; expiration?: Date } | null;
  timestamp: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get credentials directly by executing the credential_process
 * This is a workaround for Next.js environments where fromNodeProviderChain might not work properly
 * Includes retry logic and caching for better reliability
 */
function getCredentialsFromProcess(retries = 3): { accessKeyId: string; secretAccessKey: string; sessionToken?: string; expiration?: Date } | null {
  // Check cache first
  if (credentialCache && (Date.now() - credentialCache.timestamp) < CACHE_TTL) {
    console.log('[AWS Config] Using cached credentials');
    return credentialCache.credentials;
  }

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const awsProfile = process.env.AWS_PROFILE || 'hosted_storage'
      const awsConfigFile = process.env.AWS_CONFIG_FILE || '/opt/hostedapp/configs_credentials/credential'
      
      // Read the config file to find the credential_process command
      const fs = require('fs')
      if (!fs.existsSync(awsConfigFile)) {
        throw new Error(`Config file not found: ${awsConfigFile}`)
      }
      
      const configContent = fs.readFileSync(awsConfigFile, 'utf-8')
      const profileMatch = configContent.match(new RegExp(`\\[${awsProfile}\\][\\s\\S]*?credential_process\\s*=\\s*(.+?)(?:\\n|$)`))
      
      if (!profileMatch) {
        throw new Error(`No credential_process found for profile: ${awsProfile}`)
      }
      
      const credentialCommand = profileMatch[1].trim()
      console.log(`[AWS Config] Executing credential_process (attempt ${attempt}/${retries}):`, credentialCommand)
      
      // Execute the credential process with timeout
      const output = execSync(credentialCommand, { 
        encoding: 'utf-8',
        timeout: 5000 // 5 second timeout
      })
      const credentials = JSON.parse(output)
      
      if (!credentials.AccessKeyId || !credentials.SecretAccessKey) {
        throw new Error('Invalid credentials returned: missing AccessKeyId or SecretAccessKey')
      }
      
      console.log('[AWS Config] ✅ Credentials fetched successfully:', {
        hasAccessKeyId: !!credentials.AccessKeyId,
        hasSecretAccessKey: !!credentials.SecretAccessKey,
        hasSessionToken: !!credentials.SessionToken,
        expiration: credentials.Expiration
      })
      
      const result = {
        accessKeyId: credentials.AccessKeyId,
        secretAccessKey: credentials.SecretAccessKey,
        sessionToken: credentials.SessionToken,
        expiration: credentials.Expiration ? new Date(credentials.Expiration) : undefined
      };
      
      // Cache the credentials
      credentialCache = {
        credentials: result,
        timestamp: Date.now()
      };
      
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`[AWS Config] ❌ Attempt ${attempt}/${retries} failed:`, error);
      
      if (attempt < retries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 3000); // Exponential backoff, max 3s
        console.log(`[AWS Config] Retrying in ${waitTime}ms...`);
        // Use a simple busy-wait for server-side retry
        const start = Date.now();
        while (Date.now() - start < waitTime) {
          // Busy wait
        }
      }
    }
  }
  
  console.error('[AWS Config] ❌ All credential fetch attempts failed:', lastError);
  return null;
}

export function createS3Client() {
  const config = getBucketConfig()
  
  const awsProfile = process.env.AWS_PROFILE
  const awsConfigFile = process.env.AWS_CONFIG_FILE
  
  console.log('[AWS Config] Initializing S3 Client:', {
    region: config.region,
    bucketName: config.bucketName,
    folderPrefix: config.folderPrefix,
    awsProfile,
    awsConfigFile,
  })
  
  // Create S3 client with explicit configuration
  const clientConfig: any = {
    region: config.region,
  }
  
  // Try to get credentials in order of preference:
  // 1. If AWS_PROFILE is set to "hosted_storage", ALWAYS use credential_process
  // 2. Explicit env variables (AWS_ACCESS_KEY_ID, etc.) - only if no profile
  // 3. Direct execution of credential_process
  // 4. fromNodeProviderChain (might not work in all Next.js environments)
  
  if (awsProfile === 'hosted_storage' && awsConfigFile) {
    // For hosted_storage, ALWAYS use credential_process to get the correct permissions
    console.log('[AWS Config] Using hosted_storage profile - forcing credential_process')
    const processCredentials = getCredentialsFromProcess()
    
    if (processCredentials) {
      clientConfig.credentials = processCredentials
      console.log('[AWS Config] Successfully loaded credentials from credential_process')
    } else {
      // Fall back to provider chain
      console.log('[AWS Config] credential_process failed, falling back to provider chain')
      clientConfig.credentials = fromNodeProviderChain({
        profile: awsProfile,
        filepath: awsConfigFile
      })
    }
  } else {
    // For other cases, use explicit credentials if available
    let accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.ABACUS_AWS_ACCESS_KEY_ID
    let secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.ABACUS_AWS_SECRET_ACCESS_KEY
    let sessionToken = process.env.AWS_SESSION_TOKEN || process.env.ABACUS_AWS_SESSION_TOKEN
    
    if (accessKeyId && secretAccessKey) {
      // Use explicit credentials from environment
      clientConfig.credentials = {
        accessKeyId,
        secretAccessKey,
        ...(sessionToken && { sessionToken })
      }
      console.log('[AWS Config] Using explicit credentials from environment')
    } else if (awsProfile && awsConfigFile) {
      // Try to get credentials directly from credential_process
      const processCredentials = getCredentialsFromProcess()
      
      if (processCredentials) {
        clientConfig.credentials = processCredentials
        console.log('[AWS Config] Using credentials from credential_process')
      } else {
        // Fall back to provider chain
        console.log('[AWS Config] Falling back to provider chain')
        clientConfig.credentials = fromNodeProviderChain({
          profile: awsProfile,
          filepath: awsConfigFile
        })
      }
    } else {
      console.log('[AWS Config] Using default credential chain')
    }
  }
  
  return new S3Client(clientConfig)
}

// S3 client is initialized using environment credentials
// AWS SDK v3 automatically uses environment variables:
// - AWS_ACCESS_KEY_ID
// - AWS_SECRET_ACCESS_KEY
// - AWS_REGION
// These are set by the cloud storage initialization system

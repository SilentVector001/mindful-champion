import { Resend } from 'resend';

let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey || apiKey === 'your_resend_api_key_here') {
      const errorMessage = '⚠️ CRITICAL: RESEND_API_KEY not configured in environment variables. Emails cannot be sent.';
      console.error(errorMessage);
      console.error('📝 Setup Instructions:');
      console.error('1. Get API key from https://resend.com/api-keys');
      console.error('2. Add RESEND_API_KEY to Vercel environment variables');
      console.error('3. Redeploy the application');
      console.error('4. Current environment:', process.env.NODE_ENV || 'unknown');
      
      // Return a mock client that throws clear errors
      return {
        emails: {
          send: async (options: any) => {
            const timestamp = new Date().toISOString();
            console.error(`❌ [EMAIL NOT SENT - RESEND_API_KEY MISSING] ${timestamp}`, {
              to: options.to,
              subject: options.subject,
              from: options.from,
              environment: process.env.NODE_ENV || 'unknown',
              vercel: process.env.VERCEL ? 'yes' : 'no',
            });
            
            // Return error instead of success for mock emails
            return {
              data: null,
              error: {
                message: 'RESEND_API_KEY is not configured in environment variables. Please add it to Vercel to enable email sending.',
                name: 'MissingApiKeyError',
                statusCode: 500
              }
            };
          }
        }
      } as any;
    }
    
    // Validate API key format
    if (!apiKey.startsWith('re_')) {
      console.error('⚠️ WARNING: RESEND_API_KEY may be invalid (should start with "re_")');
      console.error(`   Current key starts with: ${apiKey.substring(0, 5)}...`);
      console.error('   Please verify at: https://resend.com/api-keys');
    }
    
    resendClient = new Resend(apiKey);
    console.log('✅ Resend client initialized successfully');
    console.log(`   API Key: ${apiKey.substring(0, 7)}...`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'unknown'}`);
    
    // Log domain configuration reminder
    console.log('');
    console.log('📧 Email Domain Configuration:');
    console.log('   ⚠️  Using sandbox domains (@resend.dev)');
    console.log('   💡 For production, verify custom domain at: https://resend.com/domains');
    console.log('');
  }
  
  return resendClient;
}

export { Resend };

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
      
      // Return a mock client that throws clear errors
      return {
        emails: {
          send: async (options: any) => {
            console.error('❌ [EMAIL NOT SENT - RESEND_API_KEY MISSING]', {
              to: options.to,
              subject: options.subject,
              from: options.from,
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
    
    resendClient = new Resend(apiKey);
    console.log('✅ Resend client initialized with API key');
  }
  
  return resendClient;
}

export { Resend };

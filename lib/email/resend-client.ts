import { Resend } from 'resend';

let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey || apiKey === 'your_resend_api_key_here') {
      console.warn('⚠️ RESEND_API_KEY not configured. Email sending will be simulated.');
      // Return a mock client for development
      return {
        emails: {
          send: async (options: any) => {
            console.log('📧 [MOCK EMAIL SENT]', {
              to: options.to,
              subject: options.subject,
              from: options.from,
            });
            return { data: { id: `mock_${Date.now()}` }, error: null };
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

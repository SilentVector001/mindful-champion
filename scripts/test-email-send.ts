import { getResendClient } from '../lib/email/resend-client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testEmailSend() {
  console.log('🧪 Testing Email Send...\n')
  
  try {
    const resendClient = getResendClient()
    
    console.log('📧 Attempting to send test email...')
    const result = await resendClient.emails.send({
      from: 'Mindful Champion <onboarding@resend.dev>',
      to: 'deansnow59@gmail.com',
      subject: 'Test Email from Mindful Champion',
      html: '<h1>Test Email</h1><p>This is a test email from Mindful Champion.</p>',
      text: 'Test Email\n\nThis is a test email from Mindful Champion.'
    })
    
    if (result.error) {
      console.error('❌ Email sending FAILED:')
      console.error('Error:', result.error)
      console.error('Error message:', result.error.message)
      console.error('Error name:', result.error.name)
    } else {
      console.log('✅ Email sent successfully!')
      console.log('Email ID:', result.data?.id)
    }
    
  } catch (error: any) {
    console.error('❌ Error during test:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
  }
}

testEmailSend()

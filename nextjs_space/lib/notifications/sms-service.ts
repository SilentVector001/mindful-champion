// SMS Notification Service using Twilio
import fs from 'fs'
import path from 'path'

interface SMSConfig {
  accountSid: string
  authToken: string
  fromNumber: string
}

interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
}

// Load Twilio credentials from secrets file
function getTwilioConfig(): SMSConfig | null {
  try {
    const secretsPath = '/home/ubuntu/.config/abacusai_auth_secrets.json'
    if (!fs.existsSync(secretsPath)) {
      console.warn('Twilio secrets file not found')
      return null
    }
    
    const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf-8'))
    const twilioSecrets = secrets?.twilio?.secrets
    
    if (!twilioSecrets?.account_sid?.value || !twilioSecrets?.auth_token?.value || !twilioSecrets?.phone_number?.value) {
      console.warn('Incomplete Twilio configuration')
      return null
    }
    
    return {
      accountSid: twilioSecrets.account_sid.value,
      authToken: twilioSecrets.auth_token.value,
      fromNumber: twilioSecrets.phone_number.value
    }
  } catch (error) {
    console.error('Error loading Twilio config:', error)
    return null
  }
}

export async function sendSMS(to: string, message: string): Promise<SMSResult> {
  const config = getTwilioConfig()
  
  if (!config) {
    return {
      success: false,
      error: 'SMS service not configured'
    }
  }
  
  // Validate phone number format
  const cleanNumber = to.replace(/[^\d+]/g, '')
  if (!cleanNumber.match(/^\+?1?\d{10,14}$/)) {
    return {
      success: false,
      error: 'Invalid phone number format'
    }
  }
  
  // Ensure E.164 format
  const formattedNumber = cleanNumber.startsWith('+') ? cleanNumber : `+1${cleanNumber.replace(/^1/, '')}`
  
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64')
        },
        body: new URLSearchParams({
          To: formattedNumber,
          From: config.fromNumber,
          Body: message
        })
      }
    )
    
    const data = await response.json()
    
    if (response.ok && data.sid) {
      return {
        success: true,
        messageId: data.sid
      }
    } else {
      return {
        success: false,
        error: data.message || 'Failed to send SMS'
      }
    }
  } catch (error: any) {
    console.error('SMS send error:', error)
    return {
      success: false,
      error: error.message || 'SMS service error'
    }
  }
}

export async function sendGoalReminderSMS(phoneNumber: string, goalTitle: string, message: string): Promise<SMSResult> {
  const smsBody = `🏓 Mindful Champion Reminder\n\nGoal: ${goalTitle}\n${message}\n\nKeep crushing it! - Coach Kai`
  return sendSMS(phoneNumber, smsBody)
}

export async function sendPracticeReminderSMS(phoneNumber: string, practiceType: string): Promise<SMSResult> {
  const smsBody = `🏓 Time to train, Champion!\n\n${practiceType}\n\nYour pickleball game won't improve itself! Let's go!`
  return sendSMS(phoneNumber, smsBody)
}

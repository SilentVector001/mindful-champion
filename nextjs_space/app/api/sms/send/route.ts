// @ts-nocheck
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import twilio from 'twilio';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_API_KEY_SID = process.env.TWILIO_API_KEY_SID;
const TWILIO_API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_API_KEY_SID || !TWILIO_API_KEY_SECRET || !TWILIO_PHONE_NUMBER) {
      console.error('[SMS] Twilio not configured');
      return NextResponse.json({ error: 'SMS service not configured' }, { status: 503 });
    }

    const { to, message, type = 'motivation' } = await req.json();

    if (!to || !message) {
      return NextResponse.json({ error: 'Phone number and message required' }, { status: 400 });
    }

    // Clean phone number
    let cleanPhone = to.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '1' + cleanPhone;
    if (!cleanPhone.startsWith('+')) cleanPhone = '+' + cleanPhone;

    // Initialize Twilio client with API key auth
    const client = twilio(TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, {
      accountSid: TWILIO_ACCOUNT_SID
    });

    // Add Coach Kai branding
    const brandedMessage = `🏓 Coach Kai: ${message}\n\n- Mindful Champion`;

    const result = await client.messages.create({
      body: brandedMessage,
      from: TWILIO_PHONE_NUMBER,
      to: cleanPhone
    });

    console.log(`[SMS] Sent ${type} message to ${cleanPhone}: ${result.sid}`);

    return NextResponse.json({ success: true, sid: result.sid });
  } catch (error: any) {
    console.error('[SMS] Send error:', error.message);
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
  }
}


export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface VoicePreferences {
  voiceEnabled: boolean;
  speechToTextEnabled: boolean;
  textToSpeechEnabled: boolean;
  voiceName?: string;
  rate: number;
  pitch: number;
  volume: number;
  interactionMode: 'text' | 'voice' | 'both';
  avatarName: string;
  avatarType: string;
  autoSpeak: boolean;
  language: string;
}

// GET - Load user's voice preferences
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        avatarVoiceEnabled: true,
        avatarName: true,
        avatarType: true,
        avatarCustomization: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse stored preferences or use defaults
    const storedPrefs = user.avatarCustomization as any || {};
    
    const preferences: VoicePreferences = {
      voiceEnabled: user.avatarVoiceEnabled,
      speechToTextEnabled: storedPrefs.speechToTextEnabled ?? true,
      textToSpeechEnabled: storedPrefs.textToSpeechEnabled ?? true,
      voiceName: storedPrefs.voiceName,
      rate: storedPrefs.rate ?? 1,
      pitch: storedPrefs.pitch ?? 1,
      volume: storedPrefs.volume ?? 0.8,
      interactionMode: storedPrefs.interactionMode ?? 'both',
      avatarName: user.avatarName ?? 'Coach Kai',
      avatarType: user.avatarType ?? 'default',
      autoSpeak: storedPrefs.autoSpeak ?? false,
      language: storedPrefs.language ?? 'en-US'
    };

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error loading voice preferences:', error);
    return NextResponse.json(
      { error: 'Failed to load preferences' },
      { status: 500 }
    );
  }
}

// POST - Save user's voice preferences
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { preferences } = await req.json();
    
    if (!preferences) {
      return NextResponse.json(
        { error: 'Preferences data required' },
        { status: 400 }
      );
    }

    // Update user preferences
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        avatarVoiceEnabled: preferences.voiceEnabled,
        avatarName: preferences.avatarName,
        avatarType: preferences.avatarType,
        avatarCustomization: {
          speechToTextEnabled: preferences.speechToTextEnabled,
          textToSpeechEnabled: preferences.textToSpeechEnabled,
          voiceName: preferences.voiceName,
          rate: preferences.rate,
          pitch: preferences.pitch,
          volume: preferences.volume,
          interactionMode: preferences.interactionMode,
          autoSpeak: preferences.autoSpeak,
          language: preferences.language,
          updatedAt: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving voice preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}

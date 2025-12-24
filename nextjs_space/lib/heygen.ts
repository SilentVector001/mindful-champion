// HeyGen Interactive Avatar Integration
// API Key stored in environment variable

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || 'sk_V2_hgu_k5SScsSroGg_MImIKliTzpJ2ybzwSBu7QyLHcj6563co';
const HEYGEN_API_BASE = 'https://api.heygen.com';

export interface HeyGenSession {
  session_id: string;
  access_token: string;
  url?: string;
  ice_servers?: any[];
  ice_servers2?: any[];
}

export interface HeyGenTokenResponse {
  data: {
    token: string;
  };
  error?: string;
}

// Get streaming access token
export async function getStreamingToken(): Promise<string> {
  const response = await fetch(`${HEYGEN_API_BASE}/v1/streaming.create_token`, {
    method: 'POST',
    headers: {
      'x-api-key': HEYGEN_API_KEY,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get HeyGen token: ${error}`);
  }

  const data: HeyGenTokenResponse = await response.json();
  return data.data.token;
}

// List available avatars
export async function listAvatars() {
  const response = await fetch(`${HEYGEN_API_BASE}/v2/avatars`, {
    headers: {
      'x-api-key': HEYGEN_API_KEY
    }
  });

  if (!response.ok) {
    throw new Error('Failed to list avatars');
  }

  return response.json();
}

// List available voices
export async function listVoices() {
  const response = await fetch(`${HEYGEN_API_BASE}/v2/voices`, {
    headers: {
      'x-api-key': HEYGEN_API_KEY
    }
  });

  if (!response.ok) {
    throw new Error('Failed to list voices');
  }

  return response.json();
}

// Coach Kai avatar configuration
export const COACH_KAI_CONFIG = {
  // Using valid HeyGen avatars from their API
  avatarName: 'Andrew_public_pro1_20230614',  // Alex in Black Suit
  quality: 'high',
  voice: {
    voiceId: '1ae3be1e24894ccabdb4d8139399f721', // Tony - Professional (supports interactive avatar)
    rate: 1.0,
    emotion: 'friendly' as const
  },
  // System prompt for Coach Kai personality
  systemPrompt: `You are Coach Kai, an expert AI pickleball coach. You are friendly, encouraging, and knowledgeable about all aspects of pickleball including:
- Technique (serves, dinks, volleys, third shots)
- Strategy and court positioning  
- Mental game and focus
- Tournament preparation
- Drills and practice routines

Keep responses concise (2-3 sentences) for video responses. Be enthusiastic and supportive!`
};

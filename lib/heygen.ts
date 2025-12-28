// HeyGen API Client Stub

export async function getStreamingToken(): Promise<string> {
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) throw new Error('HEYGEN_API_KEY not configured');
  
  const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.data?.token || '';
}

export async function listAvatars(): Promise<any[]> {
  return [];
}

export async function listVoices(): Promise<any[]> {
  return [];
}

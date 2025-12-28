export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * SIMPLIFIED AI COACHING CHAT API
 * 
 * This is a streamlined version that:
 * - Uses Abacus AI directly
 * - Has robust error handling
 * - Returns clear error messages
 */

export async function POST(req: NextRequest) {
  try {
    // Check for API key first
    const apiKey = process.env.ABACUSAI_API_KEY;
    if (!apiKey) {
      console.error('[Coach Kai] CRITICAL: ABACUSAI_API_KEY is not configured');
      return NextResponse.json(
        { error: "AI service not configured. Please contact support." },
        { status: 503 }
      );
    }

    // Check auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please sign in to chat with Coach Kai" }, { status: 401 });
    }

    // Parse request
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    const userName = session.user.name || 'Champion';

    // Build system prompt
    const systemPrompt = `You are Coach Kai, ${userName}'s friendly AI pickleball coach.

🎭 YOUR STYLE:
• Keep responses SHORT: 2-3 sentences max
• Be warm, encouraging, and conversational
• Use their name naturally
• Give specific, actionable advice
• Use 1-2 emojis naturally
• Ask ONE follow-up question when helpful

🏓 YOUR EXPERTISE:
• Pickleball techniques (serves, dinks, volleys, drops)
• Strategy and positioning
• Mental game and focus
• Training and drills
• Equipment recommendations

Respond as a supportive coach having a quick chat between points. Stay concise and helpful! 🏓`;

    // Build conversation
    const conversationMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    console.log(`[Coach Kai] Calling AI for user: ${session.user.id}`);

    // Call Abacus AI
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: conversationMessages,
        max_tokens: 150,
        temperature: 0.8,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('[Coach Kai] API error:', response.status, errorText);
      
      // Try fallback model
      console.log('[Coach Kai] Trying fallback model...');
      const fallbackResponse = await fetch('https://apps.abacus.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet',
          messages: conversationMessages,
          max_tokens: 150,
          temperature: 0.8,
        }),
      });

      if (!fallbackResponse.ok) {
        return NextResponse.json(
          { error: "Coach Kai is temporarily unavailable. Please try again in a moment." },
          { status: 503 }
        );
      }

      const fallbackData = await fallbackResponse.json();
      const fallbackMessage = fallbackData.choices?.[0]?.message?.content;
      
      if (fallbackMessage) {
        console.log('[Coach Kai] ✅ Fallback model succeeded');
        return NextResponse.json({ message: fallbackMessage });
      }
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content;

    if (!assistantMessage) {
      console.error('[Coach Kai] No message in response:', data);
      return NextResponse.json(
        { error: "Coach Kai couldn't generate a response. Please try again." },
        { status: 500 }
      );
    }

    console.log('[Coach Kai] ✅ Response generated successfully');
    return NextResponse.json({ message: assistantMessage });

  } catch (error: any) {
    console.error("[Coach Kai] Error:", error.name, error.message);
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: "Request timed out. Please try again." },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

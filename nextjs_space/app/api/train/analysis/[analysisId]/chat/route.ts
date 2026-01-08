// @ts-nocheck
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationHistory } = await request.json();
    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Fetch analysis data
    const analysis = await prisma.videoAnalysis.findUnique({
      where: { id: params.analysisId },
      select: {
        id: true,
        userId: true,
        title: true,
        overallScore: true,
        strengths: true,
        areasForImprovement: true,
        recommendations: true,
        shotTypes: true,
        totalShots: true,
        movementMetrics: true,
        technicalScores: true,
        keyMoments: true,
        duration: true,
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    if (analysis.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Build context from analysis data
    const analysisContext = `
Video Analysis Summary for "${analysis.title ?? 'Untitled'}":
- Overall Score: ${analysis.overallScore ?? 'N/A'}/100
- Duration: ${Math.floor((analysis.duration ?? 0) / 60)}m ${(analysis.duration ?? 0) % 60}s
- Total Shots Analyzed: ${analysis.totalShots ?? 'N/A'}

Strengths:
${Array.isArray(analysis.strengths) ? (analysis.strengths as string[]).map((s, i) => `${i + 1}. ${s}`).join('\n') : 'Not available'}

Areas for Improvement:
${Array.isArray(analysis.areasForImprovement) ? (analysis.areasForImprovement as string[]).map((s, i) => `${i + 1}. ${s}`).join('\n') : 'Not available'}

Recommendations:
${Array.isArray(analysis.recommendations) ? (analysis.recommendations as string[]).map((s, i) => `${i + 1}. ${s}`).join('\n') : 'Not available'}

Technical Scores:
${analysis.technicalScores ? JSON.stringify(analysis.technicalScores, null, 2) : 'Not available'}

Movement Metrics:
${analysis.movementMetrics ? JSON.stringify(analysis.movementMetrics, null, 2) : 'Not available'}

Shot Types:
${Array.isArray(analysis.shotTypes) ? (analysis.shotTypes as any[]).map(s => `- ${s?.name ?? 'Unknown'}: ${s?.count ?? 0} shots, ${s?.accuracy ?? 0}% accuracy`).join('\n') : 'Not available'}

Key Moments:
${Array.isArray(analysis.keyMoments) ? (analysis.keyMoments as any[]).slice(0, 5).map(m => `- ${m?.timestampFormatted ?? '0:00'}: ${m?.title ?? 'Moment'} (${m?.type ?? 'general'})`).join('\n') : 'Not available'}
`;

    const systemPrompt = `You are Coach Kai, an elite AI pickleball coach with expertise in technique analysis, strategy, and player development. You have just analyzed a player's video and have access to their performance data.

${analysisContext}

Your role:
1. Answer questions about their specific analysis results
2. Explain technical concepts in simple terms
3. Provide actionable tips to improve weak areas
4. Celebrate their strengths while being constructive
5. Suggest specific drills for improvement
6. Reference timestamps from key moments when relevant

Be encouraging, specific, and conversational. Keep responses concise (2-4 sentences for simple questions, more for complex ones). Use pickleball terminology appropriately.`;

    // Build messages array
    const messages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history
    if (Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-10)) {
        if (msg?.role && msg?.content) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    messages.push({ role: "user", content: message });

    // Call LLM API with streaming
    const response = await fetch("https://apps.abacus.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages,
        stream: true,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LLM API error:", errorText);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    // Stream the response back
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let partialRead = "";

        try {
          while (true) {
            const { done, value } = (await reader?.read()) ?? { done: true, value: undefined };
            if (done) break;

            partialRead += decoder.decode(value, { stream: true });
            const lines = partialRead.split("\n");
            partialRead = lines.pop() ?? "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed?.choices?.[0]?.delta?.content ?? "";
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

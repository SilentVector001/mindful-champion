/**
 * Abacus AI Client with Model Fallback & Error Handling
 * 
 * This module provides a robust AI client with:
 * - Model fallback (try multiple models if one fails)
 * - Timeout handling (60s max)
 * - Better error logging and user-friendly messages
 * - Automatic retry logic
 */

export const AI_MODELS = {
  PRIMARY: 'gpt-4o',           // Latest GPT-4 Omni (best performance)
  FALLBACK: 'gpt-4-turbo',     // GPT-4 Turbo (reliable fallback)
  ALTERNATIVE: 'claude-3-5-sonnet'  // Claude 3.5 (alternative provider)
} as const;

export interface AbacusAIRequest {
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
  temperature?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  top_p?: number;
  stream?: boolean;
  timeoutMs?: number;  // Custom timeout in milliseconds
}

export interface AbacusAIResponse {
  success: boolean;
  data?: any;
  error?: string;
  model?: string;  // Which model was used
  attemptedModels?: string[];  // Models that were tried
}

/**
 * Call Abacus AI API with automatic model fallback and timeout
 */
export async function callAbacusAI(
  request: AbacusAIRequest,
  options: {
    userId?: string;
    preferredModel?: string;
    enableFallback?: boolean;
    timeoutMs?: number;
  } = {}
): Promise<AbacusAIResponse> {
  const {
    userId = 'unknown',
    preferredModel,
    enableFallback = true,
    timeoutMs = 60000  // 60 seconds default timeout
  } = options;

  // Check for API key
  const apiKey = process.env.ABACUS_API_KEY;
  if (!apiKey) {
    console.error('[Abacus AI] CRITICAL: ABACUS_API_KEY is not configured');
    return {
      success: false,
      error: 'AI service not configured. Please contact support.',
    };
  }

  // Determine models to try
  const modelsToTry: string[] = [];
  if (preferredModel) {
    modelsToTry.push(preferredModel);
  } else {
    modelsToTry.push(AI_MODELS.PRIMARY);
  }
  
  if (enableFallback) {
    if (!modelsToTry.includes(AI_MODELS.FALLBACK)) {
      modelsToTry.push(AI_MODELS.FALLBACK);
    }
    if (!modelsToTry.includes(AI_MODELS.ALTERNATIVE)) {
      modelsToTry.push(AI_MODELS.ALTERNATIVE);
    }
  }

  const attemptedModels: string[] = [];
  let lastError: string = '';

  // Try each model in sequence
  for (const model of modelsToTry) {
    attemptedModels.push(model);
    
    try {
      console.log(`[Abacus AI] Trying model: ${model} for user: ${userId}`);

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: request.messages,
          max_tokens: request.max_tokens || 1500,
          temperature: request.temperature || 0.8,
          presence_penalty: request.presence_penalty,
          frequency_penalty: request.frequency_penalty,
          top_p: request.top_p,
          stream: request.stream || false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        lastError = `API error (${response.status}): ${errorText}`;
        
        console.error(`[Abacus AI] Model ${model} failed:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          userId,
        });

        // If this is a 404 or model not found, try next model immediately
        if (response.status === 404 || errorText.includes('model') || errorText.includes('not found')) {
          console.log(`[Abacus AI] Model ${model} not available, trying next model...`);
          continue;
        }

        // For other errors, also try next model if fallback is enabled
        if (enableFallback && modelsToTry.indexOf(model) < modelsToTry.length - 1) {
          console.log(`[Abacus AI] Model ${model} failed with error ${response.status}, trying fallback...`);
          continue;
        }

        throw new Error(lastError);
      }

      // Success! Return the response
      console.log(`[Abacus AI] ✅ Success with model: ${model}`);
      
      return {
        success: true,
        data: request.stream ? response : await response.json(),
        model,
        attemptedModels,
      };

    } catch (error: any) {
      console.error(`[Abacus AI] Error with model ${model}:`, {
        error: error.message,
        name: error.name,
        userId,
      });

      // Check if it's a timeout error
      if (error.name === 'AbortError') {
        lastError = `Request timed out after ${timeoutMs}ms`;
        console.error(`[Abacus AI] ⏱️ Timeout with model ${model}`);
      } else {
        lastError = error.message || 'Unknown error';
      }

      // If we have more models to try, continue to next
      if (enableFallback && modelsToTry.indexOf(model) < modelsToTry.length - 1) {
        console.log(`[Abacus AI] Trying next model after error...`);
        continue;
      }

      // If this was the last model, throw the error
      if (modelsToTry.indexOf(model) === modelsToTry.length - 1) {
        break;
      }
    }
  }

  // All models failed
  console.error('[Abacus AI] ❌ All models failed:', {
    attemptedModels,
    lastError,
    userId,
  });

  return {
    success: false,
    error: getUserFriendlyError(lastError, attemptedModels),
    attemptedModels,
  };
}

/**
 * Convert technical errors to user-friendly messages
 */
function getUserFriendlyError(technicalError: string, attemptedModels: string[]): string {
  if (technicalError.includes('timeout') || technicalError.includes('timed out')) {
    return "Coach Kai is taking longer than usual to respond. Please try again!";
  }
  
  if (technicalError.includes('not configured') || technicalError.includes('API key')) {
    return "Coach Kai is temporarily unavailable. Please contact support.";
  }
  
  if (technicalError.includes('404') || technicalError.includes('not found')) {
    return "Coach Kai is being updated. Please try again in a moment!";
  }
  
  if (technicalError.includes('rate limit') || technicalError.includes('429')) {
    return "Coach Kai is very busy right now. Please wait a moment and try again!";
  }
  
  if (technicalError.includes('500') || technicalError.includes('502') || technicalError.includes('503')) {
    return "Coach Kai is taking a quick break. Please try again in a moment!";
  }

  // Generic error
  return "Coach Kai had trouble processing that. Could you try again? 🔄";
}

/**
 * Create a streaming response for real-time AI responses
 */
export function createStreamingResponse(
  abacusResponse: Response,
  onChunk?: (chunk: string) => void
): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      const reader = abacusResponse.body?.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      try {
        while (true) {
          const { done, value } = await reader?.read() ?? { done: true, value: undefined };
          if (done) break;

          const chunk = decoder.decode(value);
          
          // Call optional callback for each chunk
          if (onChunk) {
            onChunk(chunk);
          }

          controller.enqueue(encoder.encode(chunk));
        }
      } catch (error) {
        console.error('[Abacus AI] Stream error:', error);
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });
}

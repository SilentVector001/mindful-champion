// Response Parser - Extract action cards from LLM response

import { ActionCard } from './types';

export interface ParsedKaiResponse {
  message: string;
  actionCards: ActionCard[];
}

export function parseKaiResponse(rawResponse: string): ParsedKaiResponse {
  // Extract action cards JSON block
  const actionCardsMatch = rawResponse.match(/\[ACTION_CARDS\]\s*([\s\S]*?)\s*\[\/ACTION_CARDS\]/i);
  
  let actionCards: ActionCard[] = [];
  let message = rawResponse;
  
  if (actionCardsMatch) {
    // Remove action cards block from message
    message = rawResponse.replace(/\[ACTION_CARDS\][\s\S]*?\[\/ACTION_CARDS\]/i, '').trim();
    
    try {
      const jsonStr = actionCardsMatch[1].trim();
      const parsed = JSON.parse(jsonStr);
      
      if (parsed.cards && Array.isArray(parsed.cards)) {
        actionCards = parsed.cards.map((card: any, index: number) => ({
          id: `card-${Date.now()}-${index}`,
          type: card.type || 'drill',
          title: card.title || 'Action',
          description: card.description || '',
          icon: card.icon || 'target',
          href: buildCardHref(card),
          action: buildCardAction(card),
          data: card.data || {},
          priority: determinePriority(card, index)
        }));
      }
    } catch (e) {
      console.error('[Coach Kai] Failed to parse action cards:', e);
      // Continue without action cards
    }
  }
  
  return { message, actionCards };
}

function buildCardHref(card: any): string | undefined {
  switch (card.type) {
    case 'drill':
      const drillId = card.data?.drillId;
      const category = card.data?.category;
      if (drillId) return `/train/drills?drill=${drillId}`;
      if (category) return `/train/drills?category=${category}`;
      return '/train/drills';
      
    case 'video-analysis':
      return '/train/video';
      
    case 'pro-comparison':
      const technique = card.data?.technique;
      return `/train/analysis/pro-comparison${technique ? `?technique=${technique}` : ''}`;
      
    case 'goal':
      return undefined; // Goals are created via API, not navigation
      
    case 'training-program':
      return '/train';
      
    default:
      return undefined;
  }
}

function buildCardAction(card: any): string | undefined {
  switch (card.type) {
    case 'goal':
      return 'create-goal';
    case 'drill':
      return 'start-drill';
    default:
      return undefined;
  }
}

function determinePriority(card: any, index: number): 'high' | 'medium' | 'low' {
  // First card is high priority, rest are medium
  if (index === 0) return 'high';
  if (card.type === 'goal') return 'high';
  return 'medium';
}

// Streaming parser for incremental updates
export class StreamingResponseParser {
  private buffer: string = '';
  private actionCardsStarted: boolean = false;
  private actionCardsComplete: boolean = false;
  
  addChunk(chunk: string): { message: string; isComplete: boolean } {
    this.buffer += chunk;
    
    // Check if we've hit the action cards section
    if (!this.actionCardsStarted && this.buffer.includes('[ACTION_CARDS]')) {
      this.actionCardsStarted = true;
    }
    
    if (this.actionCardsStarted && this.buffer.includes('[/ACTION_CARDS]')) {
      this.actionCardsComplete = true;
    }
    
    // Return message content (before action cards)
    let displayMessage = this.buffer;
    if (this.actionCardsStarted) {
      displayMessage = this.buffer.split('[ACTION_CARDS]')[0].trim();
    }
    
    return {
      message: displayMessage,
      isComplete: this.actionCardsComplete
    };
  }
  
  getFinalResult(): ParsedKaiResponse {
    return parseKaiResponse(this.buffer);
  }
  
  reset(): void {
    this.buffer = '';
    this.actionCardsStarted = false;
    this.actionCardsComplete = false;
  }
}

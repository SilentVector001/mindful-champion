// @ts-nocheck
// Coach Kai Types

export type EmotionalState = 'neutral' | 'frustrated' | 'excited' | 'anxious' | 'disappointed' | 'motivated';

export type ActionCardType = 'drill' | 'goal' | 'video-analysis' | 'pro-comparison' | 'training-program';

export interface ActionCard {
  id: string;
  type: ActionCardType;
  title: string;
  description: string;
  icon: string;
  href?: string;
  action?: string; // Action identifier for API calls
  data?: Record<string, any>; // Additional data for the action
  priority: 'high' | 'medium' | 'low';
}

export interface KaiResponse {
  message: string;
  emotionalAcknowledgment?: string;
  technicalInsights?: string[];
  actionCards?: ActionCard[];
  followUp?: string;
  context?: {
    detectedEmotion?: EmotionalState;
    detectedTechnique?: string[];
    conversationId?: string;
  };
}

export interface ConversationContext {
  userId: string;
  recentTopics: string[];
  technicalFocus: string[];
  emotionalHistory: EmotionalState[];
  lastInteraction?: Date;
  goalsInProgress: string[];
}

export interface DrillRecommendation {
  drillId: string;
  name: string;
  reason: string;
  difficulty: string;
  duration: number;
  category: string;
}

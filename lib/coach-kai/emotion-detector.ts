// Emotion Detector - Detect emotional state from user messages

import { EmotionalState } from './types';

interface EmotionSignal {
  emotion: EmotionalState;
  keywords: string[];
  phrases: string[];
  weight: number;
}

const EMOTION_SIGNALS: EmotionSignal[] = [
  {
    emotion: 'frustrated',
    keywords: ['frustrated', 'frustrating', 'annoying', 'annoyed', 'angry', 'mad', 'upset', 'hate', 'terrible', 'awful', 'worst'],
    phrases: ['so frustrated', 'can\'t believe', 'sick of', 'tired of', 'done with', 'keep failing', 'never work', 'keep losing', 'nothing works'],
    weight: 1.0
  },
  {
    emotion: 'disappointed',
    keywords: ['disappointed', 'disappointing', 'let down', 'failed', 'lost', 'defeat', 'beaten', 'crushed'],
    phrases: ['should have', 'could have', 'would have', 'if only', 'i blew it', 'messed up', 'screwed up', 'choked'],
    weight: 0.9
  },
  {
    emotion: 'anxious',
    keywords: ['anxious', 'nervous', 'worried', 'scared', 'afraid', 'stress', 'stressed', 'overwhelmed', 'pressure'],
    phrases: ['big match', 'tournament coming', 'what if', 'can\'t handle', 'not ready', 'going to fail', 'mess it up'],
    weight: 0.9
  },
  {
    emotion: 'excited',
    keywords: ['excited', 'amazing', 'awesome', 'great', 'fantastic', 'incredible', 'thrilled', 'pumped', 'stoked', 'won'],
    phrases: ['can\'t wait', 'so happy', 'best ever', 'finally did it', 'i won', 'we won', 'played great', 'crushed it'],
    weight: 0.85
  },
  {
    emotion: 'motivated',
    keywords: ['ready', 'determined', 'focused', 'motivated', 'committed', 'dedicated', 'driven'],
    phrases: ['want to improve', 'going to work', 'let\'s do', 'help me', 'teach me', 'show me', 'i want to'],
    weight: 0.7
  }
];

export interface EmotionAnalysis {
  primaryEmotion: EmotionalState;
  confidence: number;
  emotionalCues: string[];
  needsSupport: boolean;
}

export function detectEmotion(text: string): EmotionAnalysis {
  const lowerText = text.toLowerCase();
  const emotionScores: Record<EmotionalState, number> = {
    neutral: 0.3, // Base neutral score
    frustrated: 0,
    excited: 0,
    anxious: 0,
    disappointed: 0,
    motivated: 0
  };
  
  const detectedCues: string[] = [];
  
  for (const signal of EMOTION_SIGNALS) {
    // Check keywords
    for (const keyword of signal.keywords) {
      if (lowerText.includes(keyword)) {
        emotionScores[signal.emotion] += signal.weight * 0.3;
        detectedCues.push(keyword);
      }
    }
    
    // Check phrases (higher weight)
    for (const phrase of signal.phrases) {
      if (lowerText.includes(phrase)) {
        emotionScores[signal.emotion] += signal.weight * 0.5;
        detectedCues.push(phrase);
      }
    }
  }
  
  // Find highest scoring emotion
  let primaryEmotion: EmotionalState = 'neutral';
  let maxScore = emotionScores.neutral;
  
  for (const [emotion, score] of Object.entries(emotionScores)) {
    if (score > maxScore) {
      maxScore = score;
      primaryEmotion = emotion as EmotionalState;
    }
  }
  
  // Calculate confidence (0-1)
  const confidence = Math.min(maxScore / 1.5, 1.0);
  
  // Determine if user needs emotional support
  const negativeEmotions: EmotionalState[] = ['frustrated', 'disappointed', 'anxious'];
  const needsSupport = negativeEmotions.includes(primaryEmotion) && confidence > 0.4;
  
  return {
    primaryEmotion,
    confidence,
    emotionalCues: [...new Set(detectedCues)],
    needsSupport
  };
}

export function getEmotionalAcknowledgment(emotion: EmotionalState, userName: string): string {
  const acknowledgments: Record<EmotionalState, string[]> = {
    frustrated: [
      `I hear you, ${userName}. That's really frustrating.`,
      `That sounds incredibly frustrating, ${userName}.`,
      `I completely understand that frustration.`
    ],
    disappointed: [
      `I know that's disappointing, ${userName}.`,
      `That's a tough one to swallow.`,
      `I can feel the disappointment in your words.`
    ],
    anxious: [
      `I sense some nerves there, ${userName}. That's completely normal.`,
      `It's okay to feel anxious about this.`,
      `Let's work through those nerves together.`
    ],
    excited: [
      `That's amazing, ${userName}! 🎉`,
      `Love the energy! Let's ride that momentum!`,
      `YES! This is what it's all about!`
    ],
    motivated: [
      `Love that drive, ${userName}!`,
      `That's the spirit! Let's channel that motivation.`,
      `You're in the right headspace. Let's make it count!`
    ],
    neutral: []
  };
  
  const options = acknowledgments[emotion];
  if (options.length === 0) return '';
  
  return options[Math.floor(Math.random() * options.length)];
}

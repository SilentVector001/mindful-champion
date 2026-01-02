// Coach Kai Function Handler - Process function calls from LLM

import { PICKLEBALL_KNOWLEDGE_BASE } from './enhanced-system-prompt';

export type FunctionCall = {
  name: string;
  arguments: Record<string, any>;
};

export type FunctionResult = {
  type: 'calendar' | 'message' | 'resource' | 'analysis' | 'goal_create' | 'goal_progress' | 'milestone_complete';
  action: string;
  data: Record<string, any>;
  requiresConfirmation: boolean;
  confirmationPrompt?: string;
};

// Parse function calls from LLM response
export function parseFunctionCalls(response: string): FunctionCall[] {
  const calls: FunctionCall[] = [];
  
  // Look for function call markers in various formats
  const patterns = [
    /<function_call>([\s\S]*?)<\/function_call>/g,
    /\[FUNCTION_CALL\]([\s\S]*?)\[\/FUNCTION_CALL\]/g,
    /```json\s*\{\s*"function"([\s\S]*?)```/g
  ];
  
  for (const pattern of patterns) {
    const matches = response.matchAll(pattern);
    for (const match of matches) {
      try {
        const parsed = JSON.parse(match[1].trim());
        if (parsed.name && parsed.arguments) {
          calls.push(parsed);
        }
      } catch (e) {
        // Skip malformed JSON
      }
    }
  }
  
  return calls;
}

// Process a function call and return result
export function processFunctionCall(call: FunctionCall): FunctionResult {
  switch (call.name) {
    case 'create_goal':
      return {
        type: 'goal_create',
        action: 'Create Goal',
        data: {
          title: call.arguments.title,
          skillArea: call.arguments.skillArea,
          targetDays: call.arguments.targetDays || 30
        },
        requiresConfirmation: true,
        confirmationPrompt: `Create goal: "${call.arguments.title}"? I'll add milestones to help track your progress!`
      };
      
    case 'update_goal_progress':
      return {
        type: 'goal_progress',
        action: 'Update Progress',
        data: {
          goalId: call.arguments.goalId,
          progressIncrement: call.arguments.progressIncrement,
          note: call.arguments.note
        },
        requiresConfirmation: true,
        confirmationPrompt: `Log ${call.arguments.progressIncrement}% progress on your goal?`
      };
      
    case 'complete_milestone':
      return {
        type: 'milestone_complete',
        action: 'Complete Milestone',
        data: {
          milestoneId: call.arguments.milestoneId
        },
        requiresConfirmation: true,
        confirmationPrompt: 'Mark this milestone as complete?'
      };
    
    case 'add_to_calendar':
      return {
        type: 'calendar',
        action: 'Add to Calendar',
        data: {
          date: call.arguments.date,
          time: call.arguments.time || 'All day',
          description: call.arguments.description,
          eventType: call.arguments.eventType || 'other'
        },
        requiresConfirmation: true,
        confirmationPrompt: `Add "${call.arguments.description}" to your calendar on ${call.arguments.date}${call.arguments.time ? ` at ${call.arguments.time}` : ''}?`
      };
      
    case 'send_message':
      return {
        type: 'message',
        action: 'Send Message',
        data: {
          contactName: call.arguments.contact_name,
          message: call.arguments.message_content,
          method: call.arguments.delivery_method || 'app_notification'
        },
        requiresConfirmation: true,
        confirmationPrompt: `Send to ${call.arguments.contact_name}: "${call.arguments.message_content}"?`
      };
      
    case 'suggest_resource':
      const matchedDrill = PICKLEBALL_KNOWLEDGE_BASE.deficiencies.find(
        d => d.drill.toLowerCase().includes(call.arguments.title?.toLowerCase() || '') ||
             d.category.toLowerCase().includes(call.arguments.category?.toLowerCase() || '')
      );
      
      return {
        type: 'resource',
        action: call.arguments.type === 'drill' ? 'Start Drill' : 
                call.arguments.type === 'goal' ? 'Set Goal' :
                call.arguments.type === 'reminder' ? 'Set Reminder' : 'View Resource',
        data: {
          type: call.arguments.type,
          title: call.arguments.title,
          details: call.arguments.details,
          category: call.arguments.category,
          duration: call.arguments.duration,
          knowledgeBase: matchedDrill || null
        },
        requiresConfirmation: true,
        confirmationPrompt: call.arguments.type === 'drill' 
          ? `Start the "${call.arguments.title}" drill?`
          : call.arguments.type === 'goal'
          ? `Set goal: "${call.arguments.title}"?`
          : `Add reminder for: "${call.arguments.title}"?`
      };
      
    case 'analyze_technique':
      const suggestedPro = call.arguments.comparison_pro || 
        PICKLEBALL_KNOWLEDGE_BASE.proReferences.find(
          p => p.specialty.toLowerCase().includes(call.arguments.focus_area?.toLowerCase() || '')
        )?.name;
      
      return {
        type: 'analysis',
        action: 'Analyze Technique',
        data: {
          focusArea: call.arguments.focus_area,
          comparisonPro: suggestedPro
        },
        requiresConfirmation: false
      };
      
    default:
      return {
        type: 'resource',
        action: 'View',
        data: call.arguments,
        requiresConfirmation: false
      };
  }
}

// Match user text to deficiency category
export function matchDeficiency(text: string): typeof PICKLEBALL_KNOWLEDGE_BASE.deficiencies[0] | null {
  const lowerText = text.toLowerCase();
  
  const keywords: Record<string, string[]> = {
    'Grip Issues': ['grip', 'holding', 'hand position', 'paddle control'],
    'Stroke Technique': ['stroke', 'swing', 'backhand', 'forehand', 'hit', 'follow-through'],
    'Footwork/Stance': ['footwork', 'stance', 'feet', 'positioning', 'movement', 'balance'],
    'Serve Problems': ['serve', 'serving', 'service'],
    'Speed/Strategy': ['speed', 'fast', 'slow', 'dink', 'patience', 'strategy'],
    'Positioning': ['position', 'court', 'where to stand', 'no man\'s land'],
    'Third Shot Drop': ['third shot', 'drop shot', 'third'],
    'Volley Technique': ['volley', 'net', 'punch', 'block']
  };
  
  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => lowerText.includes(word))) {
      return PICKLEBALL_KNOWLEDGE_BASE.deficiencies.find(d => d.category === category) || null;
    }
  }
  
  return null;
}

// Detect intent from user message
export function detectIntent(text: string): 'scheduling' | 'social' | 'technique' | 'analysis' | 'goal_create' | 'goal_progress' | 'general' {
  const lowerText = text.toLowerCase();
  
  // Goal creation patterns - check these first
  if (/\b(help me (set|create|make)|i want to (improve|get better|work on)|set.*(goal|target)|create.*(goal|plan)|my goal is|i('d| would) like to (achieve|accomplish))\b/.test(lowerText)) {
    return 'goal_create';
  }
  
  // Progress update patterns
  if (/\b(i (did|completed|finished|practiced)|just (finished|completed|did)|update.*progress|log.*(practice|session)|mark.*(done|complete)|i('ve| have) been (working|practicing))\b/.test(lowerText)) {
    return 'goal_progress';
  }
  
  // Scheduling patterns
  if (/\b(tournament|practice|lesson|match|game)\b.*\b(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next|this|at \d)/.test(lowerText) ||
      /\b(schedule|calendar|add|remind)\b/.test(lowerText)) {
    return 'scheduling';
  }
  
  // Social patterns
  if (/\b(play with|invite|message|text|email|partner|friend|joe|sarah|mike)\b/.test(lowerText) ||
      /\b(want to play|wanna play|let\'s play)\b/.test(lowerText)) {
    return 'social';
  }
  
  // Analysis patterns (video/image)
  if (/\b(video|watch|clip|footage|recording|image|photo|picture|look at|check my|analyze)\b/.test(lowerText)) {
    return 'analysis';
  }
  
  // Technique patterns
  if (matchDeficiency(text)) {
    return 'technique';
  }
  
  return 'general';
}

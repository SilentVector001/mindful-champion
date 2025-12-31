'use client';

import { motion } from 'framer-motion';
import { Target, Trophy, Video, Users, Play, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useState } from 'react';
import { ActionCard } from '@/lib/coach-kai/types';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  target: Target,
  trophy: Trophy,
  video: Video,
  users: Users,
  play: Play,
  plus: Plus
};

const CARD_STYLES: Record<string, { gradient: string; border: string; iconBg: string }> = {
  drill: {
    gradient: 'from-emerald-950/50 to-emerald-900/30',
    border: 'border-emerald-500/30 hover:border-emerald-400/50',
    iconBg: 'bg-emerald-500/20 text-emerald-400'
  },
  goal: {
    gradient: 'from-amber-950/50 to-amber-900/30',
    border: 'border-amber-500/30 hover:border-amber-400/50',
    iconBg: 'bg-amber-500/20 text-amber-400'
  },
  'video-analysis': {
    gradient: 'from-purple-950/50 to-purple-900/30',
    border: 'border-purple-500/30 hover:border-purple-400/50',
    iconBg: 'bg-purple-500/20 text-purple-400'
  },
  'pro-comparison': {
    gradient: 'from-cyan-950/50 to-cyan-900/30',
    border: 'border-cyan-500/30 hover:border-cyan-400/50',
    iconBg: 'bg-cyan-500/20 text-cyan-400'
  },
  'training-program': {
    gradient: 'from-teal-950/50 to-teal-900/30',
    border: 'border-teal-500/30 hover:border-teal-400/50',
    iconBg: 'bg-teal-500/20 text-teal-400'
  }
};

interface ActionCardComponentProps {
  card: ActionCard;
  onAction?: (card: ActionCard) => void;
}

function ActionCardComponent({ card, onAction }: ActionCardComponentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const Icon = ICONS[card.icon] || Target;
  const styles = CARD_STYLES[card.type] || CARD_STYLES.drill;
  
  const handleClick = async () => {
    if (card.action === 'create-goal' && card.data?.goalText) {
      setIsLoading(true);
      try {
        const res = await fetch('/api/coach-kai/create-goal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goalText: card.data.goalText,
            category: card.data.category || 'TECHNIQUE'
          })
        });
        
        if (res.ok) {
          onAction?.(card);
        }
      } catch (e) {
        console.error('Failed to create goal:', e);
      } finally {
        setIsLoading(false);
      }
    } else if (card.href) {
      // Navigation handled by Link
    }
  };

  const content = (
    <Card 
      className={`group relative overflow-hidden bg-gradient-to-br ${styles.gradient} border ${styles.border} transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl ${styles.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white text-sm mb-1">{card.title}</h4>
            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
              {card.description}
            </p>
          </div>
          <div className="flex-shrink-0">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            )}
          </div>
        </div>
        
        {/* Action Button */}
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            onClick={card.action ? handleClick : undefined}
            className={`text-xs h-7 px-3 ${getButtonStyle(card.type)}`}
            disabled={isLoading}
          >
            {getButtonText(card.type)}
          </Button>
        </div>
      </div>
      
      {/* Priority indicator */}
      {card.priority === 'high' && (
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
          <div className="absolute top-2 -right-6 w-20 rotate-45 bg-emerald-500 text-center text-[10px] text-white font-bold py-0.5">
            HOT
          </div>
        </div>
      )}
    </Card>
  );

  if (card.href && !card.action) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link href={card.href}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
    >
      {content}
    </motion.div>
  );
}

function getButtonText(type: string): string {
  switch (type) {
    case 'drill': return 'Start Drill';
    case 'goal': return 'Set This Goal';
    case 'video-analysis': return 'Analyze Video';
    case 'pro-comparison': return 'Watch Pro';
    case 'training-program': return 'View Program';
    default: return 'Learn More';
  }
}

function getButtonStyle(type: string): string {
  switch (type) {
    case 'drill': return 'bg-emerald-600 hover:bg-emerald-500 text-white';
    case 'goal': return 'bg-amber-600 hover:bg-amber-500 text-white';
    case 'video-analysis': return 'bg-purple-600 hover:bg-purple-500 text-white';
    case 'pro-comparison': return 'bg-cyan-600 hover:bg-cyan-500 text-white';
    default: return 'bg-teal-600 hover:bg-teal-500 text-white';
  }
}

interface ActionCardsListProps {
  cards: ActionCard[];
  onAction?: (card: ActionCard) => void;
}

export function ActionCardsList({ cards, onAction }: ActionCardsListProps) {
  if (!cards || cards.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mt-4 space-y-3"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Recommended Actions</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      </div>
      
      <div className="grid gap-3">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ActionCardComponent card={card} onAction={onAction} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export { ActionCardComponent };

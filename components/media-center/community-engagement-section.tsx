'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  BarChart3,
  Trophy,
  Star,
  Flame,
  ChevronRight,
  Send,
  Heart,
  Share2,
  Check,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Discussion {
  id: string;
  author: {
    name: string;
    avatar?: string;
    badge?: string;
  };
  content: string;
  topic: string;
  likes: number;
  replies: number;
  timeAgo: string;
  isHot: boolean;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  endsIn: string;
  userVoted: boolean;
  userChoice?: string;
}

interface LeaderboardEntry {
  rank: number;
  user: {
    name: string;
    avatar?: string;
  };
  points: number;
  streak: number;
  badge: string;
}

const ACTIVE_DISCUSSIONS: Discussion[] = [
  {
    id: '1',
    author: { name: 'PickleballPro', avatar: '', badge: '🏆 Pro' },
    content: "Ben Johns just went 52 shots in a rally against McGuffin at the Mesa Grand Slam! The footwork was unreal. Who else caught that match? 🔥",
    topic: 'Tournament Talk',
    likes: 847,
    replies: 234,
    timeAgo: '1 hour ago',
    isHot: true
  },
  {
    id: '2',
    author: { name: 'DinkMaster', avatar: '', badge: '⭐ 4.5' },
    content: "Finally upgraded to the JOOLA Hyperion CFS 16mm - the sweet spot is massive and the pop on resets is chef's kiss. Worth every penny!",
    topic: 'Equipment',
    likes: 312,
    replies: 98,
    timeAgo: '3 hours ago',
    isHot: false
  },
  {
    id: '3',
    author: { name: 'CourtSide', avatar: '', badge: '🎯 Coach' },
    content: "Hot take: The two-handed backhand drive from ALW is the most underrated shot in pro pickleball. She generates SO much power from the kitchen line.",
    topic: 'Strategy',
    likes: 567,
    replies: 189,
    timeAgo: '5 hours ago',
    isHot: true
  }
];

const ACTIVE_POLL: Poll = {
  id: '1',
  question: "Who's your pick for Player of the Year 2025?",
  options: [
    { id: 'a', text: 'Ben Johns', votes: 4521, percentage: 42 },
    { id: 'b', text: 'Anna Leigh Waters', votes: 3245, percentage: 30 },
    { id: 'c', text: 'Tyson McGuffin', votes: 1876, percentage: 17 },
    { id: 'd', text: 'Other', votes: 1198, percentage: 11 }
  ],
  totalVotes: 10840,
  endsIn: '2 days',
  userVoted: false
};

const WEEKLY_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, user: { name: 'ErnieGuru' }, points: 3420, streak: 18, badge: '👑' },
  { rank: 2, user: { name: 'KitchenBoss' }, points: 3180, streak: 14, badge: '🥈' },
  { rank: 3, user: { name: 'ThirdShotDrop' }, points: 2890, streak: 21, badge: '🥉' },
  { rank: 4, user: { name: 'DinkDynasty' }, points: 2650, streak: 9, badge: '🏅' },
  { rank: 5, user: { name: 'ATPMaster' }, points: 2480, streak: 11, badge: '⭐' }
];

export function CommunityEngagementSection() {
  const [activeTab, setActiveTab] = useState<'discussions' | 'poll' | 'leaderboard'>('discussions');
  const [selectedPollOption, setSelectedPollOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [poll, setPoll] = useState(ACTIVE_POLL);

  const handleVote = (optionId: string) => {
    if (hasVoted) return;
    
    setSelectedPollOption(optionId);
    setHasVoted(true);
    
    // Update poll with new vote
    setPoll(prev => ({
      ...prev,
      userVoted: true,
      userChoice: optionId,
      totalVotes: prev.totalVotes + 1,
      options: prev.options.map(opt => ({
        ...opt,
        votes: opt.id === optionId ? opt.votes + 1 : opt.votes,
        percentage: Math.round(((opt.id === optionId ? opt.votes + 1 : opt.votes) / (prev.totalVotes + 1)) * 100)
      }))
    }));
  };

  const tabs = [
    { id: 'discussions', label: 'Hot Takes', icon: MessageSquare },
    { id: 'poll', label: 'Poll', icon: BarChart3 },
    { id: 'leaderboard', label: 'Top Fans', icon: Trophy }
  ];

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Community</h3>
              <p className="text-sm text-slate-500 font-normal">Join the conversation</p>
            </div>
          </CardTitle>
          
          <Badge className="bg-green-100 text-green-700">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse" />
            2.4K online
          </Badge>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mt-4 p-1 bg-slate-100 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === tab.id 
                  ? "bg-white text-slate-800 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <AnimatePresence mode="wait">
          {/* Discussions Tab */}
          {activeTab === 'discussions' && (
            <motion.div
              key="discussions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {ACTIVE_DISCUSSIONS.map((discussion, index) => (
                <motion.div
                  key={discussion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                    "bg-white hover:bg-slate-50 hover:border-purple-200 hover:shadow-md",
                    discussion.isHot && "border-l-4 border-l-orange-400"
                  )}
                >
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={discussion.author.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-sm">
                        {discussion.author.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-slate-800">{discussion.author.name}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-purple-100 text-purple-700">
                          {discussion.author.badge}
                        </Badge>
                        {discussion.isHot && (
                          <Badge className="text-[10px] px-1.5 py-0 h-5 bg-gradient-to-r from-orange-400 to-red-400 text-white">
                            <Flame className="w-2.5 h-2.5 mr-0.5" />
                            Hot
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-600 line-clamp-2">{discussion.content}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">{discussion.topic}</Badge>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" /> {discussion.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> {discussion.replies}
                        </span>
                        <span>{discussion.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full rounded-xl border-dashed border-purple-200 hover:border-purple-400 hover:bg-purple-50/50 text-purple-600"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Join the Discussion
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Poll Tab */}
          {activeTab === 'poll' && (
            <motion.div
              key="poll"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                    Weekly Poll
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    Ends in {poll.endsIn}
                  </Badge>
                </div>
                
                <p className="text-lg font-semibold text-slate-700 mb-4">{poll.question}</p>
                
                <div className="space-y-2">
                  {poll.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleVote(option.id)}
                      disabled={hasVoted}
                      className={cn(
                        "w-full p-3 rounded-lg border-2 transition-all duration-300 text-left relative overflow-hidden",
                        hasVoted 
                          ? "cursor-default" 
                          : "cursor-pointer hover:border-purple-400 hover:bg-white",
                        selectedPollOption === option.id 
                          ? "border-purple-500 bg-purple-50"
                          : "border-slate-200 bg-white"
                      )}
                    >
                      {hasVoted && (
                        <div 
                          className={cn(
                            "absolute left-0 top-0 h-full transition-all duration-500",
                            selectedPollOption === option.id 
                              ? "bg-purple-200/50"
                              : "bg-slate-100"
                          )}
                          style={{ width: `${option.percentage}%` }}
                        />
                      )}
                      
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="font-medium text-slate-700">{option.text}</span>
                        <div className="flex items-center gap-2">
                          {hasVoted && (
                            <span className="font-bold text-slate-600">{option.percentage}%</span>
                          )}
                          {selectedPollOption === option.id && (
                            <Check className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                <p className="text-xs text-slate-400 text-center mt-3">
                  {poll.totalVotes.toLocaleString()} votes
                </p>
              </div>
              
              {!hasVoted && (
                <p className="text-center text-sm text-slate-500">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Vote to see results and earn 50 points!
                </p>
              )}
            </motion.div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 mb-4">
                <p className="text-sm text-amber-700 font-medium text-center">
                  🏆 Weekly Community Champions - Earn points by engaging!
                </p>
              </div>
              
              {WEEKLY_LEADERBOARD.map((entry, index) => (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                    "bg-white hover:bg-slate-50 border",
                    entry.rank === 1 && "border-amber-200 bg-gradient-to-r from-amber-50/50 to-white",
                    entry.rank === 2 && "border-slate-200 bg-gradient-to-r from-slate-50/50 to-white",
                    entry.rank === 3 && "border-orange-200 bg-gradient-to-r from-orange-50/50 to-white",
                    entry.rank > 3 && "border-slate-100"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-lg",
                    entry.rank === 1 && "bg-gradient-to-br from-amber-400 to-amber-600",
                    entry.rank === 2 && "bg-gradient-to-br from-slate-300 to-slate-500",
                    entry.rank === 3 && "bg-gradient-to-br from-orange-400 to-orange-600",
                    entry.rank > 3 && "bg-slate-100"
                  )}>
                    {entry.badge}
                  </div>
                  
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-teal-400 to-cyan-400 text-white text-sm">
                      {entry.user.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-800">{entry.user.name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" />
                        {entry.streak} day streak
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-slate-800">{entry.points.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">points</p>
                  </div>
                </motion.div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full mt-2 rounded-xl border-dashed border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 text-amber-600"
              >
                <Trophy className="w-4 h-4 mr-2" />
                View Full Leaderboard
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

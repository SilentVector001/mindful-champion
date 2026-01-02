export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  createGoalFromChat,
  updateGoalProgress,
  completeMilestone,
  getUserGoalContext,
  getCelebrationMessage,
  getProgressEncouragement
} from "@/lib/coach-kai/goal-functions";

/**
 * Coach Kai Goal Operations API
 * Handles goal CRUD operations triggered via chat
 */

// GET - Fetch user's goal context for Kai
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const goalContext = await getUserGoalContext(session.user.id);
    return NextResponse.json(goalContext);
  } catch (error: any) {
    console.error('[Goal Operations] GET error:', error);
    return NextResponse.json({ error: "Failed to fetch goal context" }, { status: 500 });
  }
}

// POST - Create goal, update progress, or complete milestone
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();
    const { action, ...params } = body;
    
    switch (action) {
      case 'create_goal': {
        const { title, skillArea, targetDays } = params;
        if (!title) {
          return NextResponse.json({ error: "Goal title required" }, { status: 400 });
        }
        
        const result = await createGoalFromChat(
          session.user.id,
          title,
          skillArea || null,
          targetDays || 30
        );
        
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
        
        return NextResponse.json({
          success: true,
          goal: result.goal,
          message: `🎯 Goal created: "${title}"! I've added some suggested milestones to help you track progress.`
        });
      }
      
      case 'update_progress': {
        const { goalId, progressIncrement } = params;
        if (!goalId) {
          return NextResponse.json({ error: "Goal ID required" }, { status: 400 });
        }
        
        const result = await updateGoalProgress(
          session.user.id,
          goalId,
          progressIncrement || 10
        );
        
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
        
        return NextResponse.json({
          success: true,
          goal: result.goal,
          celebration: result.celebration,
          message: result.celebration || getProgressEncouragement(result.goal?.progress || 0)
        });
      }
      
      case 'complete_milestone': {
        const { milestoneId } = params;
        if (!milestoneId) {
          return NextResponse.json({ error: "Milestone ID required" }, { status: 400 });
        }
        
        const result = await completeMilestone(session.user.id, milestoneId);
        
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
        
        return NextResponse.json({
          success: true,
          milestone: result.milestone,
          goalProgress: result.goalProgress,
          celebration: result.celebration,
          message: result.celebration
        });
      }
      
      case 'get_suggestions': {
        // Get AI-powered goal suggestions based on user context
        const context = await getUserGoalContext(session.user.id);
        
        const suggestions = [];
        
        // Suggest based on what's missing
        const hasServeGoal = context.activeGoals.some(g => 
          g.title?.toLowerCase()?.includes('serve') || g.category === 'SKILL_IMPROVEMENT'
        );
        const hasFitnessGoal = context.activeGoals.some(g => g.category === 'FITNESS');
        const hasTournamentGoal = context.activeGoals.some(g => g.category === 'TOURNAMENT_PREP');
        
        if (!hasServeGoal) {
          suggestions.push({
            title: 'Improve My Serve',
            skillArea: 'serve',
            description: 'Master consistent, accurate serves'
          });
        }
        if (!hasFitnessGoal) {
          suggestions.push({
            title: 'Build Court Endurance',
            skillArea: 'fitness',
            description: 'Improve stamina for longer matches'
          });
        }
        if (!hasTournamentGoal) {
          suggestions.push({
            title: 'Tournament Ready',
            skillArea: 'tournament',
            description: 'Prepare for competitive play'
          });
        }
        
        return NextResponse.json({
          success: true,
          suggestions,
          currentGoalCount: context.activeGoals.length
        });
      }
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[Goal Operations] POST error:', error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}

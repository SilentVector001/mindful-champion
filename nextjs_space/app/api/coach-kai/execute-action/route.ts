export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoalCategory } from "@prisma/client";

/**
 * Execute Coach Kai suggested actions
 * Handles: calendar adds, goal creation, drill logging, message sending
 */

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { actionType, data } = await req.json();
    
    switch (actionType) {
      case 'calendar': {
        // Parse the date - handle relative dates
        let eventDate = new Date();
        const dateStr = data.date?.toLowerCase() || '';
        
        if (dateStr.includes('tomorrow')) {
          eventDate.setDate(eventDate.getDate() + 1);
        } else if (dateStr.includes('next saturday') || dateStr.includes('this saturday')) {
          const daysUntilSat = (6 - eventDate.getDay() + 7) % 7 || 7;
          eventDate.setDate(eventDate.getDate() + daysUntilSat);
        } else if (dateStr.includes('next sunday') || dateStr.includes('this sunday')) {
          const daysUntilSun = (7 - eventDate.getDay()) % 7 || 7;
          eventDate.setDate(eventDate.getDate() + daysUntilSun);
        } else if (dateStr.match(/\d{4}-\d{2}-\d{2}/)) {
          eventDate = new Date(dateStr);
        }
        
        // Parse time if provided
        if (data.time) {
          const timeMatch = data.time.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2] || '0');
            const period = timeMatch[3]?.toLowerCase();
            
            if (period === 'pm' && hours < 12) hours += 12;
            if (period === 'am' && hours === 12) hours = 0;
            
            eventDate.setHours(hours, minutes, 0, 0);
          }
        }
        
        // Save as a UserGoal (calendar-like entry)
        const savedEvent = await prisma.userGoal.create({
          data: {
            userId: session.user.id,
            goalText: data.description || 'Pickleball Event',
            targetDate: eventDate,
            status: 'ACTIVE'
          }
        });
        
        return NextResponse.json({ 
          success: true, 
          message: `Added "${data.description}" to your calendar`,
          eventId: savedEvent.id
        });
      }
      
      case 'goal': {
        const goal = await prisma.goal.create({
          data: {
            userId: session.user.id,
            title: data.title,
            description: data.details || '',
            category: mapCategory(data.category),
            status: 'ACTIVE',
            targetDate: getTargetDate(14),
            progress: 0
          }
        });
        
        return NextResponse.json({ 
          success: true, 
          message: `Goal created: "${data.title}"`,
          goalId: goal.id
        });
      }
      
      case 'drill': {
        // Log drill to activity
        await prisma.activityLog.create({
          data: {
            userId: session.user.id,
            type: 'TRAINING',
            title: `Started drill: ${data.title}`,
            description: data.details || '',
            category: data.category || 'technique',
            metadata: {
              drillName: data.title,
              duration: data.duration || 15,
              instructions: data.details,
              source: 'Coach Kai'
            }
          }
        });
        
        // Award reward points for starting a drill
        await prisma.user.update({
          where: { id: session.user.id },
          data: { rewardPoints: { increment: 10 } }
        });
        
        return NextResponse.json({ 
          success: true, 
          message: `Started "${data.title}" drill! +10 XP`,
          xpAwarded: 10
        });
      }
      
      case 'reminder': {
        // Create a reminder as a milestone on a goal
        const reminderDate = new Date();
        reminderDate.setDate(reminderDate.getDate() + 1);
        
        const defaultGoal = await getOrCreateDefaultGoal(session.user.id);
        
        await prisma.milestone.create({
          data: {
            goalId: defaultGoal,
            title: data.title,
            description: data.details || '',
            status: 'NOT_STARTED'
          }
        });
        
        return NextResponse.json({ 
          success: true, 
          message: `Reminder set: "${data.title}"`
        });
      }
      
      case 'message': {
        // Log the intent for future implementation
        return NextResponse.json({ 
          success: true, 
          message: `Message to ${data.contactName} queued (feature in development)`,
          note: 'Partner messaging coming soon!'
        });
      }
      
      default:
        return NextResponse.json({ error: "Unknown action type" }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error('[Coach Kai Action] Error:', error.message);
    return NextResponse.json({ error: "Failed to execute action" }, { status: 500 });
  }
}

// Helper: Map category strings to GoalCategory enum
function mapCategory(category?: string): GoalCategory {
  const mapping: Record<string, GoalCategory> = {
    'grip': GoalCategory.SKILL_IMPROVEMENT,
    'stroke': GoalCategory.SKILL_IMPROVEMENT,
    'footwork': GoalCategory.FITNESS,
    'serve': GoalCategory.SKILL_IMPROVEMENT,
    'strategy': GoalCategory.MENTAL_GAME,
    'positioning': GoalCategory.SKILL_IMPROVEMENT,
    'volley': GoalCategory.SKILL_IMPROVEMENT,
    'dinking': GoalCategory.SKILL_IMPROVEMENT,
    'general': GoalCategory.CUSTOM
  };
  return mapping[category?.toLowerCase() || ''] || GoalCategory.CUSTOM;
}

// Helper: Get target date X days from now
function getTargetDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

// Helper: Get or create default goal for reminders
async function getOrCreateDefaultGoal(userId: string): Promise<string> {
  let goal = await prisma.goal.findFirst({
    where: { userId, title: 'Coach Kai Reminders' }
  });
  
  if (!goal) {
    goal = await prisma.goal.create({
      data: {
        userId,
        title: 'Coach Kai Reminders',
        description: 'Reminders and tasks from Coach Kai',
        category: GoalCategory.CUSTOM,
        status: 'ACTIVE',
        progress: 0
      }
    });
  }
  
  return goal.id;
}

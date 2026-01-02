// @ts-nocheck
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Create Goal API - Called from Coach Kai action cards
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { goalText, category = 'TECHNIQUE' } = await req.json();
    
    if (!goalText || typeof goalText !== 'string') {
      return NextResponse.json({ error: "Goal text required" }, { status: 400 });
    }

    // Map category to valid GoalCategory enum
    const validCategories = ['TECHNIQUE', 'FITNESS', 'MENTAL', 'STRATEGY', 'COMPETITION'];
    const goalCategory = validCategories.includes(category) ? category : 'TECHNIQUE';

    // Create the goal
    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        title: goalText,
        description: `Goal created from Coach Kai coaching session`,
        category: goalCategory as any,
        status: 'ACTIVE',
        progress: 0,
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 weeks default
      }
    });

    return NextResponse.json({ 
      success: true, 
      goal: {
        id: goal.id,
        title: goal.title,
        category: goal.category
      },
      message: `Goal "${goalText}" created successfully!`
    });

  } catch (error: any) {
    console.error('[Coach Kai] Create goal error:', error.message);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}

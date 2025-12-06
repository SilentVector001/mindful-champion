/**
 * Email Templates with Coach Kai Personality
 * All templates use warm, encouraging, expert coaching tone
 */

import { NotificationCategory } from '@prisma/client';
import { prisma } from '@/lib/db';

const COACH_KAI_SIGNATURE = `
Best in the game,<br/>
<strong>Coach Kai</strong><br/>
Your Mindful Champion Coach
`;

export interface EmailTemplateParams {
  userId: string;
  category: NotificationCategory;
  type: string;
  title: string;
  message: string;
  data?: any;
}

/**
 * Main function to send notification emails
 */
export async function sendNotificationEmail(params: EmailTemplateParams): Promise<void> {
  const { userId, category, type, title, message, data } = params;

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true, name: true },
  });

  if (!user || !user.email) {
    throw new Error(`User ${userId} not found or has no email`);
  }

  const firstName = user.firstName || user.name || 'Champion';

  // Generate email content based on type
  const emailContent = generateEmailContent(type, firstName, title, message, data);

  // TODO: Integrate with your email service (SendGrid, AWS SES, etc.)
  console.log('Sending email to:', user.email);
  console.log('Subject:', emailContent.subject);
  console.log('Content:', emailContent.html);

  // For now, just log - replace with actual email sending
  // await sendEmail({
  //   to: user.email,
  //   subject: emailContent.subject,
  //   html: emailContent.html,
  // });
}

interface EmailContent {
  subject: string;
  html: string;
}

/**
 * Generate email content based on notification type
 */
function generateEmailContent(
  type: string,
  firstName: string,
  title: string,
  message: string,
  data?: any
): EmailContent {
  switch (type) {
    case 'goal_confirmation':
      return goalConfirmationEmail(firstName, data);
    
    case 'daily_goal_tip':
      return dailyGoalTipEmail(firstName, data);
    
    case 'video_complete':
      return videoAnalysisCompleteEmail(firstName, data);
    
    case 'trial_expiring':
      return trialExpiringEmail(firstName, data);
    
    case 'tournament_reminder':
      return tournamentReminderEmail(firstName, data);
    
    case 'new_media':
      return newMediaContentEmail(firstName, data);
    
    case 'achievement_unlocked':
      return achievementUnlockedEmail(firstName, data);
    
    default:
      return genericNotificationEmail(firstName, title, message);
  }
}

/**
 * 1. Goal Confirmation Email
 */
function goalConfirmationEmail(firstName: string, data: any): EmailContent {
  const { goalType, goalDescription, targetDate } = data || {};

  return {
    subject: `🎯 Your ${goalType || 'Goal'} is Set – Let's Make It Happen!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">🎯 Goal Confirmed!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6;">Hey ${firstName}! 👋</p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            I love the ambition! Your goal is now locked in, and I'm here every step of the way.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin-top: 0; color: #667eea;">Your Goal:</h3>
            <p style="font-size: 16px; margin: 10px 0;">
              <strong>${goalDescription || 'Improve your pickleball skills'}</strong>
            </p>
            ${targetDate ? `<p style="font-size: 14px; color: #6b7280;">Target: ${targetDate}</p>` : ''}
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            <strong>Here's what happens next:</strong>
          </p>
          
          <ul style="font-size: 16px; line-height: 1.8;">
            <li>📊 Track your progress in real-time</li>
            <li>🎥 Get personalized video analysis</li>
            <li>💡 Receive daily tips tailored to your goal</li>
            <li>🏆 Celebrate milestones together</li>
          </ul>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Remember: every champion started where you are now. The difference? They took the first step.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/goals" 
               style="display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View My Goals Dashboard
            </a>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            ${COACH_KAI_SIGNATURE}
          </p>
        </div>
      </div>
    `,
  };
}

/**
 * 2. Daily Goal Tip Email
 */
function dailyGoalTipEmail(firstName: string, data: any): EmailContent {
  const { tip, progressPercentage } = data || {};
  
  const tipOfTheDay = tip || "Focus on your footwork today. Great positioning beats great power every time.";
  const progress = progressPercentage || 0;

  return {
    subject: `🌟 Daily Tip: ${firstName}, Here's What Champions Do Today`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">🌟 Your Daily Edge</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6;">Good morning, ${firstName}! ☀️</p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            You're <strong>${progress}% of the way</strong> to crushing your goal. That's serious progress! 🚀
          </p>
          
          <div style="background: white; padding: 25px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="margin-top: 0; color: #f5576c;">💡 Today's Championship Tip:</h3>
            <p style="font-size: 18px; line-height: 1.6; margin: 0;">
              ${tipOfTheDay}
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            <strong>Quick Win for Today:</strong><br/>
            Spend just 5 minutes visualizing yourself executing this perfectly. Champions train their minds as much as their bodies.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="display: inline-block; background: #f5576c; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Start Today's Session
            </a>
          </div>
          
          <p style="font-size: 14px; line-height: 1.6; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
            <em>"Excellence is not a destination; it's a continuous journey that never ends." - Brian Tracy</em>
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            ${COACH_KAI_SIGNATURE}
          </p>
        </div>
      </div>
    `,
  };
}

/**
 * 3. Video Analysis Complete Email
 */
function videoAnalysisCompleteEmail(firstName: string, data: any): EmailContent {
  const { videoId, videoTitle, keyInsights } = data || {};

  return {
    subject: `🎥 Your Analysis is Ready – Time to Level Up!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">🎥 Analysis Complete!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6;">Hey ${firstName}! 🎯</p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            I've finished analyzing your game footage, and I found some <strong>game-changing insights</strong>!
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #4facfe;">📹 Video: ${videoTitle || 'Your Match'}</h3>
            <p style="font-size: 16px; line-height: 1.6;">
              ${keyInsights || 'Your technique is solid, but I spotted 3 quick adjustments that will take you to the next level.'}
            </p>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; font-size: 16px; line-height: 1.6;">
              <strong>💡 Coach's Note:</strong> Watch the analysis within 24 hours while the match is fresh in your mind. That's when the learning sticks!
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/videos/${videoId || ''}" 
               style="display: inline-block; background: #4facfe; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Watch My Analysis
            </a>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Ready to implement what we found? Let's do this! 💪
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            ${COACH_KAI_SIGNATURE}
          </p>
        </div>
      </div>
    `,
  };
}

/**
 * 4. Trial Expiring Email
 */
function trialExpiringEmail(firstName: string, data: any): EmailContent {
  const { daysRemaining, trialEndDate } = data || {};
  const days = daysRemaining || 3;

  return {
    subject: `⏰ ${days} Days Left – Don't Lose Your Progress!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 30px; text-align: center; color: #1f2937;">
          <h1 style="margin: 0; font-size: 28px;">⏰ Your Trial is Ending Soon</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6;">${firstName},</p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            I've loved coaching you these past few weeks! But here's the thing – your trial ends in <strong>${days} days</strong>.
          </p>
          
          <div style="background: white; padding: 25px; border-radius: 10px; margin: 20px 0; border: 2px solid #fee140;">
            <h3 style="margin-top: 0; color: #fa709a;">Here's What You'll Keep With Premium:</h3>
            <ul style="font-size: 16px; line-height: 1.8; margin: 10px 0;">
              <li>✅ Unlimited video analysis</li>
              <li>✅ Personalized training plans</li>
              <li>✅ Advanced mental game coaching</li>
              <li>✅ Tournament preparation</li>
              <li>✅ All your progress & insights</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Without upgrading, you'll lose access to all this, plus the momentum we've built together.
          </p>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px; line-height: 1.6; text-align: center;">
              <strong>🎁 Special Offer Just For You</strong><br/>
              <span style="font-size: 20px; color: #1d4ed8;">Save 20% if you upgrade today!</span>
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing" 
               style="display: inline-block; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: #1f2937; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
              Unlock Full Access Now
            </a>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Let's keep this winning streak going! 🏆
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            ${COACH_KAI_SIGNATURE}
          </p>
        </div>
      </div>
    `,
  };
}

/**
 * 5. Tournament Reminder Email
 */
function tournamentReminderEmail(firstName: string, data: any): EmailContent {
  const { tournamentName, tournamentDate, location, daysUntil } = data || {};

  return {
    subject: `🏆 Tournament Alert: ${tournamentName || 'Your Event'} is Coming Up!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">🏆 Tournament Time!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6;">Hey ${firstName}! 🏓</p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Your tournament is <strong>${daysUntil || 7} days away</strong>. Time to get mentally and physically prepped!
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #19547b;">📍 Event Details:</h3>
            <p style="font-size: 16px; margin: 5px 0;"><strong>${tournamentName || 'Your Tournament'}</strong></p>
            <p style="font-size: 14px; margin: 5px 0; color: #6b7280;">📅 ${tournamentDate || 'Date TBD'}</p>
            <p style="font-size: 14px; margin: 5px 0; color: #6b7280;">📍 ${location || 'Location TBD'}</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 10px; margin: 20px 0; color: white;">
            <h3 style="margin-top: 0;">🎯 Your Pre-Tournament Game Plan:</h3>
            <ol style="font-size: 16px; line-height: 1.8; margin: 10px 0 10px 20px;">
              <li>Review your recent video analysis</li>
              <li>Practice your serve and return (30 minutes daily)</li>
              <li>Visualize winning points (10 minutes before bed)</li>
              <li>Get 8 hours of sleep the night before</li>
              <li>Arrive 30 minutes early to warm up mentally</li>
            </ol>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            You've put in the work. Now trust your training and play YOUR game!
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tournaments" 
               style="display: inline-block; background: #19547b; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View Tournament Prep
            </a>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            ${COACH_KAI_SIGNATURE}
          </p>
          
          <p style="font-size: 14px; line-height: 1.6; color: #6b7280; font-style: italic; text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            "Pressure is a privilege." – Billie Jean King
          </p>
        </div>
      </div>
    `,
  };
}

/**
 * 6. New Media Content Email
 */
function newMediaContentEmail(firstName: string, data: any): EmailContent {
  const { contentTitle, contentType, contentDescription, contentUrl } = data || {};

  return {
    subject: `🎬 New ${contentType || 'Content'} Just Dropped: ${contentTitle || 'Check This Out!'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 30px; text-align: center; color: #1f2937;">
          <h1 style="margin: 0; font-size: 28px;">🎬 Fresh Content Alert!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6;">Hey ${firstName}! 📺</p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Just added something I think you'll love...
          </p>
          
          <div style="background: white; padding: 25px; border-radius: 10px; margin: 20px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 15px;">
              <span style="font-size: 48px;">🎬</span>
            </div>
            <h3 style="margin: 10px 0; color: #1f2937; font-size: 20px;">${contentTitle || 'New Training Content'}</h3>
            <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">
              <strong>${contentType || 'Video'}</strong>
            </p>
            <p style="font-size: 16px; line-height: 1.6; margin: 15px 0;">
              ${contentDescription || 'New content that will help you improve your game!'}
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Perfect for your skill level and goals. Give it a watch when you have 15 minutes!
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${contentUrl || process.env.NEXT_PUBLIC_APP_URL + '/dashboard/media'}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Watch Now
            </a>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            ${COACH_KAI_SIGNATURE}
          </p>
        </div>
      </div>
    `,
  };
}

/**
 * 7. Achievement Unlocked Email
 */
function achievementUnlockedEmail(firstName: string, data: any): EmailContent {
  const { achievementName, achievementDescription, badgeIcon, rewardPoints } = data || {};

  return {
    subject: `🏅 Achievement Unlocked: ${achievementName || 'New Milestone!'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; text-align: center; color: white;">
          <div style="font-size: 80px; margin-bottom: 10px;">${badgeIcon || '🏅'}</div>
          <h1 style="margin: 0; font-size: 32px;">ACHIEVEMENT UNLOCKED!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 18px; line-height: 1.6; text-align: center;">
            <strong>Way to go, ${firstName}! 🎉</strong>
          </p>
          
          <div style="background: white; padding: 30px; border-radius: 15px; margin: 20px 0; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
            <div style="font-size: 64px; margin-bottom: 15px;">${badgeIcon || '🏆'}</div>
            <h2 style="margin: 10px 0; color: #f5576c; font-size: 24px;">${achievementName || 'New Achievement'}</h2>
            <p style="font-size: 16px; color: #6b7280; margin: 10px 0;">
              ${achievementDescription || 'You reached a new milestone in your journey!'}
            </p>
            ${rewardPoints ? `
              <div style="background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%); color: white; padding: 15px; border-radius: 10px; margin-top: 20px;">
                <strong style="font-size: 18px;">+${rewardPoints} Reward Points Earned!</strong>
              </div>
            ` : ''}
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; text-align: center;">
            This is what consistent effort looks like. Every champion was once a beginner who refused to give up.
          </p>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 16px; line-height: 1.6;">
              <strong>🎯 What's Next?</strong><br/>
              Keep this momentum going! Check your dashboard for the next challenge.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/achievements" 
               style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View All Achievements
            </a>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Proud of you! 💪
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            ${COACH_KAI_SIGNATURE}
          </p>
        </div>
      </div>
    `,
  };
}

/**
 * Generic Notification Email (fallback)
 */
function genericNotificationEmail(firstName: string, title: string, message: string): EmailContent {
  return {
    subject: title,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">${title}</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="font-size: 16px; line-height: 1.6;">Hey ${firstName}! 👋</p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="font-size: 16px; line-height: 1.6; margin: 0;">
              ${message}
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="display: inline-block; background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            ${COACH_KAI_SIGNATURE}
          </p>
        </div>
      </div>
    `,
  };
}

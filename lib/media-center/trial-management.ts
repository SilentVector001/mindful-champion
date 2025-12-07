
import { prisma } from '@/lib/db'
import { SubscriptionTier } from '@/lib/prisma-types'
import { MediaCenterEmailService } from './email-service'

export interface TrialUser {
  id: string;
  email: string;
  name: string | null;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  subscriptionTier: SubscriptionTier;
  isTrialActive: boolean;
}

export class TrialManagement {
  static async initializeUserTrial(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          subscriptionTier: true, 
          trialStartDate: true,
          trialEndDate: true,
          isTrialActive: true
        }
      });

      if (!user) {
        console.error('User not found for trial initialization');
        return false;
      }

      // Only initialize trial for users who don't already have an active trial or paid subscription
      if (user.subscriptionTier !== 'FREE' || user.isTrialActive) {
        return false;
      }

      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7); // 7-day trial

      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: SubscriptionTier.TRIAL,
          trialStartDate,
          trialEndDate,
          isTrialActive: true,
          trialEndsAt: trialEndDate // Legacy field
        }
      });

      // Send welcome email
      await MediaCenterEmailService.sendWelcomeEmail(userId);

      console.log(`Trial initialized for user ${userId}, ends on ${trialEndDate.toISOString()}`);
      return true;
    } catch (error) {
      console.error('Error initializing user trial:', error);
      return false;
    }
  }

  static async checkAndExpireTrials(): Promise<number> {
    try {
      const now = new Date();
      
      // Find users with expired trials
      const expiredTrialUsers = await prisma.user.findMany({
        where: {
          subscriptionTier: SubscriptionTier.TRIAL,
          isTrialActive: true,
          trialEndDate: {
            lte: now
          }
        },
        select: {
          id: true,
          email: true,
          name: true,
          trialEndDate: true
        }
      });

      console.log(`Found ${expiredTrialUsers.length} expired trials to process`);

      let processedCount = 0;
      for (const user of expiredTrialUsers) {
        try {
          // Update user to free tier
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionTier: 'FREE',
              isTrialActive: false
            }
          });

          // Send trial expiration email
          const emailSent = await MediaCenterEmailService.sendTrialExpirationEmail(user.id);
          
          if (emailSent) {
            console.log(`Trial expired and email sent for user ${user.email}`);
          } else {
            console.warn(`Trial expired but email failed for user ${user.email}`);
          }

          processedCount++;
        } catch (error) {
          console.error(`Error processing expired trial for user ${user.id}:`, error);
        }
      }

      return processedCount;
    } catch (error) {
      console.error('Error checking and expiring trials:', error);
      return 0;
    }
  }

  static async getTrialStatus(userId: string): Promise<{
    isOnTrial: boolean;
    trialEndDate: Date | null;
    daysRemaining: number;
    hasExpired: boolean;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          subscriptionTier: true,
          trialEndDate: true,
          isTrialActive: true
        }
      });

      if (!user || user.subscriptionTier !== 'TRIAL') {
        return {
          isOnTrial: false,
          trialEndDate: null,
          daysRemaining: 0,
          hasExpired: false
        };
      }

      const now = new Date();
      const trialEndDate = user.trialEndDate;
      const hasExpired = trialEndDate ? now > trialEndDate : false;
      const daysRemaining = trialEndDate 
        ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      return {
        isOnTrial: user.isTrialActive && !hasExpired,
        trialEndDate,
        daysRemaining,
        hasExpired
      };
    } catch (error) {
      console.error('Error getting trial status:', error);
      return {
        isOnTrial: false,
        trialEndDate: null,
        daysRemaining: 0,
        hasExpired: false
      };
    }
  }

  static async getTrialUsers(): Promise<TrialUser[]> {
    try {
      return await prisma.user.findMany({
        where: {
          subscriptionTier: SubscriptionTier.TRIAL,
          isTrialActive: true
        },
        select: {
          id: true,
          email: true,
          name: true,
          trialStartDate: true,
          trialEndDate: true,
          subscriptionTier: true,
          isTrialActive: true
        },
        orderBy: {
          trialEndDate: 'asc' // Soonest to expire first
        }
      });
    } catch (error) {
      console.error('Error getting trial users:', error);
      return [];
    }
  }

  static async sendTrialReminderEmails(): Promise<number> {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999); // End of tomorrow

      // Find users whose trials end tomorrow
      const usersEndingTrial = await prisma.user.findMany({
        where: {
          subscriptionTier: SubscriptionTier.TRIAL,
          isTrialActive: true,
          trialEndDate: {
            gte: new Date(),
            lte: tomorrow
          }
        }
      });

      let sentCount = 0;
      for (const user of usersEndingTrial) {
        try {
          // Check if we already sent a reminder email recently
          const recentReminder = await prisma.emailNotification.findFirst({
            where: {
              userId: user.id,
              type: 'TRIAL_EXPIRATION',
              sentAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
              }
            }
          });

          if (!recentReminder) {
            const emailSent = await MediaCenterEmailService.sendTrialExpirationEmail(user.id);
            if (emailSent) {
              sentCount++;
            }
          }
        } catch (error) {
          console.error(`Error sending trial reminder to user ${user.id}:`, error);
        }
      }

      return sentCount;
    } catch (error) {
      console.error('Error sending trial reminder emails:', error);
      return 0;
    }
  }

  // Auto-upgrade to trial for new signups
  static async handleNewUserSignup(userId: string): Promise<void> {
    try {
      // Wait a bit to ensure user creation is complete
      setTimeout(async () => {
        const initialized = await this.initializeUserTrial(userId);
        if (initialized) {
          console.log(`Auto-trial initialized for new user ${userId}`);
        }
      }, 2000); // 2 second delay
    } catch (error) {
      console.error('Error handling new user signup for trial:', error);
    }
  }
}

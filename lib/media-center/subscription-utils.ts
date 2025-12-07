
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SubscriptionTier } from '@/lib/prisma-types';

export interface TierAccess {
  canAccessLiveStreams: boolean;
  canAccessAllPodcasts: boolean;
  maxPodcastEpisodes: number;
  canBookmarkContent: boolean;
  canAccessAdvancedFeatures: boolean;
  canDownloadContent: boolean;
  showUpgradePrompts: boolean;
}

export class SubscriptionUtils {
  static getTierAccess(tier: SubscriptionTier): TierAccess {
    switch (tier) {
      case SubscriptionTier.TRIAL:
        return {
          canAccessLiveStreams: true,
          canAccessAllPodcasts: true,
          maxPodcastEpisodes: -1, // unlimited
          canBookmarkContent: true,
          canAccessAdvancedFeatures: true,
          canDownloadContent: true,
          showUpgradePrompts: false
        };
      case SubscriptionTier.PREMIUM:
      case SubscriptionTier.PRO:
        return {
          canAccessLiveStreams: true,
          canAccessAllPodcasts: true,
          maxPodcastEpisodes: -1, // unlimited
          canBookmarkContent: true,
          canAccessAdvancedFeatures: true,
          canDownloadContent: true,
          showUpgradePrompts: false
        };
      case SubscriptionTier.FREE:
      default:
        return {
          canAccessLiveStreams: false,
          canAccessAllPodcasts: false,
          maxPodcastEpisodes: 3,
          canBookmarkContent: true,
          canAccessAdvancedFeatures: false,
          canDownloadContent: false,
          showUpgradePrompts: true
        };
    }
  }

  static async getUserTierAccess(userId?: string): Promise<TierAccess> {
    if (!userId) {
      return this.getTierAccess(SubscriptionTier.FREE);
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          subscriptionTier: true,
          trialEndDate: true,
          isTrialActive: true
        }
      });

      if (!user) {
        return this.getTierAccess(SubscriptionTier.FREE);
      }

      // Check if trial has expired
      if (user.subscriptionTier === SubscriptionTier.TRIAL && user.trialEndDate) {
        if (new Date() > user.trialEndDate) {
          // Update user to FREE tier if trial expired
          await prisma.user.update({
            where: { id: userId },
            data: { 
              subscriptionTier: SubscriptionTier.FREE,
              isTrialActive: false
            }
          });
          return this.getTierAccess(SubscriptionTier.FREE);
        }
      }

      return this.getTierAccess(user.subscriptionTier);
    } catch (error) {
      console.error('Error getting user tier access:', error);
      return this.getTierAccess(SubscriptionTier.FREE);
    }
  }

  static async checkTrialExpiration(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          subscriptionTier: true,
          trialEndDate: true,
          isTrialActive: true
        }
      });

      if (!user || user.subscriptionTier !== SubscriptionTier.TRIAL) {
        return false;
      }

      if (user.trialEndDate && new Date() > user.trialEndDate) {
        // Send trial expiration email and update tier
        await this.handleTrialExpiration(userId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking trial expiration:', error);
      return false;
    }
  }

  private static async handleTrialExpiration(userId: string): Promise<void> {
    try {
      // Update user to free tier
      await prisma.user.update({
        where: { id: userId },
        data: { 
          subscriptionTier: SubscriptionTier.FREE,
          isTrialActive: false
        }
      });

      // Send trial expiration email (we'll implement this later)
      // await this.sendTrialExpirationEmail(userId);
    } catch (error) {
      console.error('Error handling trial expiration:', error);
    }
  }
}

/**
 * Seed new achievement types into the database
 * Run: yarn prisma db seed -- --file=scripts/seed-new-achievements.ts
 * Or: npx tsx scripts/seed-new-achievements.ts
 */

import { PrismaClient } from '@prisma/client';
import { achievementDefinitions } from '../lib/achievements/achievement-definitions';

const prisma = new PrismaClient();

async function main() {
  console.log('🏆 Seeding new achievements...');

  let created = 0;
  let skipped = 0;

  for (const achievement of achievementDefinitions) {
    // Check if achievement already exists
    const existing = await prisma.achievement.findUnique({
      where: { achievementId: achievement.achievementId },
    });

    if (existing) {
      skipped++;
      continue;
    }

    try {
      await prisma.achievement.create({
        data: {
          achievementId: achievement.achievementId,
          name: achievement.name,
          description: achievement.description,
          tier: achievement.tier,
          category: achievement.category,
          icon: achievement.icon,
          badgeUrl: achievement.badgeUrl || null,
          points: achievement.points,
          rarity: achievement.rarity,
          order: achievement.order,
          isActive: true,
          requirement: achievement.requirement as any,
        },
      });
      created++;
      console.log(`✅ Created: ${achievement.name}`);
    } catch (error) {
      console.error(`❌ Failed to create ${achievement.name}:`, error);
    }
  }

  console.log(`\n🎉 Done! Created: ${created}, Skipped (existing): ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

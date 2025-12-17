/**
 * Seed script to load Recent Highlights from JSON data
 * Run with: npx tsx scripts/seed-highlights.ts
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting highlight seeding...');

  // Read the JSON file
  const jsonPath = path.join(process.cwd(), '..', 'pickleball_media_data.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  const highlights = jsonData.recent_highlights;

  console.log(`📦 Found ${highlights.length} highlights in JSON`);

  // Clear existing highlights
  console.log('🗑️  Clearing existing highlights...');
  await prisma.recentHighlight.deleteMany();

  // Seed highlights
  let successCount = 0;
  let errorCount = 0;

  for (const highlight of highlights) {
    try {
      // Parse date string
      let date: Date;
      if (highlight.date.includes('-')) {
        // Range like "October 28 - November 2, 2025"
        const parts = highlight.date.split('-');
        const endDateStr = parts[1].trim();
        date = new Date(endDateStr);
      } else {
        // Single date like "November 2025"
        date = new Date(highlight.date);
      }

      // If date is invalid, use current date
      if (isNaN(date.getTime())) {
        date = new Date();
      }

      await prisma.recentHighlight.create({
        data: {
          title: highlight.title,
          videoUrl: highlight.video_url,
          thumbnail: highlight.thumbnail,
          date: date,
          tournament: highlight.tournament,
          location: highlight.location || null,
          description: highlight.description,
          channel: highlight.channel,
          category: highlight.category,
          featured: highlight.category.includes('Championship') || highlight.category.includes('Final'),
          viewCount: 0,
        },
      });

      successCount++;
      console.log(`✅ Seeded: ${highlight.title.substring(0, 50)}...`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Error seeding highlight "${highlight.title}":`, error);
    }
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
}

main()
  .catch((error) => {
    console.error('Fatal error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function exportPromoCodes() {
  console.log('📋 Exporting all promo codes...\n');

  // Fetch all promo codes
  const promoCodes = await prisma.promoCode.findMany({
    orderBy: { code: 'asc' },
    select: {
      code: true,
      assignedTo: true,
      status: true,
      description: true,
      durationDays: true,
      rewardAmount: true,
      isBetaTester: true,
      timesRedeemed: true,
      maxRedemptions: true,
      expiresAt: true,
      redeemedBy: true,
      redeemedAt: true
    }
  });

  console.log(`Found ${promoCodes.length} promo codes\n`);

  // Separate by assignment
  const leeCodes = promoCodes.filter(c => c.assignedTo === 'Lee');
  const ownerCodes = promoCodes.filter(c => c.assignedTo === 'Owner');

  // Create a formatted text file
  let output = '═══════════════════════════════════════════════════════════════\n';
  output += '       MINDFUL CHAMPION - BETA TESTER PROMO CODES\n';
  output += '═══════════════════════════════════════════════════════════════\n\n';
  output += `Total Codes Generated: ${promoCodes.length}\n`;
  output += `Generated: ${new Date().toLocaleDateString()}\n\n`;

  // Lee's codes
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  output += `LEE'S PROMO CODES (${leeCodes.length} codes)\n`;
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  leeCodes.forEach((code, index) => {
    output += `${(index + 1).toString().padStart(2, '0')}. ${code.code}`;
    if (code.status !== 'ACTIVE') {
      output += ` [${code.status}]`;
    }
    if (code.redeemedBy) {
      output += ` - REDEEMED`;
    }
    output += '\n';
  });

  // Owner's codes
  output += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  output += `OWNER'S PROMO CODES (${ownerCodes.length} codes)\n`;
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  ownerCodes.forEach((code, index) => {
    output += `${(index + 1).toString().padStart(2, '0')}. ${code.code}`;
    if (code.status !== 'ACTIVE') {
      output += ` [${code.status}]`;
    }
    if (code.redeemedBy) {
      output += ` - REDEEMED`;
    }
    output += '\n';
  });

  // Summary
  output += '\n═══════════════════════════════════════════════════════════════\n';
  output += 'PROMO CODE DETAILS\n';
  output += '═══════════════════════════════════════════════════════════════\n\n';
  output += `✓ Each code provides: 30 Days PRO Access\n`;
  output += `✓ Beta testing reward: $25 Amazon Gift Card\n`;
  output += `✓ One-time use per code\n`;
  output += `✓ Must complete 7 beta tasks to earn reward\n`;
  output += `✓ Redemption URL: https://mindful-champion-2hzb4j.abacusai.app/beta\n\n`;

  // Usage stats
  const activeCount = promoCodes.filter(c => c.status === 'ACTIVE').length;
  const redeemedCount = promoCodes.filter(c => c.status === 'REDEEMED').length;
  
  output += '───────────────────────────────────────────────────────────────\n';
  output += 'USAGE STATISTICS\n';
  output += '───────────────────────────────────────────────────────────────\n\n';
  output += `Active Codes:   ${activeCount}/${promoCodes.length}\n`;
  output += `Redeemed Codes: ${redeemedCount}/${promoCodes.length}\n`;
  output += `Remaining:      ${activeCount - redeemedCount}\n\n`;

  // Save to file
  const filePath = '/home/ubuntu/mindful_champion/PROMO_CODES_LIST.txt';
  fs.writeFileSync(filePath, output);
  
  console.log(`✅ Promo codes exported to: ${filePath}\n`);
  console.log('📊 Summary:');
  console.log(`   • Total codes: ${promoCodes.length}`);
  console.log(`   • Lee's codes: ${leeCodes.length} (BETA-2024-0001 to BETA-2024-0050)`);
  console.log(`   • Owner's codes: ${ownerCodes.length} (BETA-2024-0051 to BETA-2024-0100)`);
  console.log(`   • Active: ${activeCount}`);
  console.log(`   • Redeemed: ${redeemedCount}\n`);

  // Also create a CSV for easy spreadsheet import
  let csv = 'Code,Assigned To,Status,Redeemed,Redeemed Date,Duration (Days),Reward Amount\n';
  promoCodes.forEach(code => {
    csv += `${code.code},${code.assignedTo},${code.status},${code.redeemedBy ? 'Yes' : 'No'},${code.redeemedAt ? code.redeemedAt.toISOString() : ''},${code.durationDays},${code.rewardAmount}\n`;
  });
  
  const csvPath = '/home/ubuntu/mindful_champion/PROMO_CODES_LIST.csv';
  fs.writeFileSync(csvPath, csv);
  console.log(`✅ CSV exported to: ${csvPath}\n`);
}

exportPromoCodes()
  .catch((e) => {
    console.error('❌ Error exporting promo codes:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

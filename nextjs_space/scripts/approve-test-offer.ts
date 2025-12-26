import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function approveTestOffer() {
  try {
    console.log('🔍 Looking for test sponsor offers...\n');
    
    // Find the test sponsor profile
    const sponsor = await prisma.sponsorProfile.findFirst({
      where: { companyName: 'Test Sponsor Company' }
    });
    
    if (!sponsor) {
      console.log('❌ Test sponsor not found. Run yarn tsx scripts/create-test-sponsor.ts first');
      return;
    }
    
    console.log(`✅ Found sponsor: ${sponsor.companyName}`);
    
    // Find all offers for this sponsor
    const offers = await prisma.sponsorOffer.findMany({
      where: { sponsorId: sponsor.id },
      orderBy: { createdAt: 'desc' }
    });
    
    if (offers.length === 0) {
      console.log('❌ No offers found for this sponsor');
      return;
    }
    
    console.log(`\n📦 Found ${offers.length} offer(s):\n`);
    
    for (const offer of offers) {
      console.log(`  • ${offer.title}`);
      console.log(`    Status: ${offer.status}`);
      console.log(`    Approved: ${offer.isApproved}`);
      console.log(`    Points: ${offer.pointsCost}`);
      console.log(`    Created: ${offer.createdAt.toLocaleDateString()}\n`);
      
      // Auto-approve and activate the offer
      await prisma.sponsorOffer.update({
        where: { id: offer.id },
        data: {
          status: 'ACTIVE',
          isApproved: true,
          approvedAt: new Date(),
          approvedBy: 'auto-test'
        }
      });
      
      console.log(`    ✅ Approved and activated!\n`);
    }
    
    console.log('🎉 All test offers are now approved and active!');
    console.log('\n📍 They should now appear at: https://mindful-champion-2hzb4j.abacusai.app/marketplace\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

approveTestOffer();

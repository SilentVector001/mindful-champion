import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function createTestSponsor() {
  try {
    console.log('🛠️  Creating test sponsor account...');

    // Check if sponsor already exists
    const existing = await prisma.user.findUnique({
      where: { email: 'sponsor@mindfulchampion.com' },
    });

    if (existing) {
      console.log('⚠️  Test sponsor already exists!');
      console.log('\n🔑 LOGIN CREDENTIALS:');
      console.log('URL: https://mindfulchampion.com/sponsors/portal');
      console.log('Email: sponsor@mindfulchampion.com');
      console.log('Password: SponsorTest2025!');
      return;
    }

    // Create user account
    const hashedPassword = await hash('SponsorTest2025!', 10);
    const user = await prisma.user.create({
      data: {
        email: 'sponsor@mindfulchampion.com',
        password: hashedPassword,
        name: 'Test Sponsor Company',
        role: 'USER', // Regular user with sponsor profile
        emailVerified: new Date(),
        onboardingCompleted: true,
      },
    });

    console.log('✅ User account created:', user.id);

    // Create sponsor profile with PRO tier (to test all features)
    const sponsorProfile = await prisma.sponsorProfile.create({
      data: {
        userId: user.id,
        companyName: 'Test Sponsor Inc.',
        website: 'https://testsponsor.com',
        description: 'A test sponsor account with full PRO features for development and testing.',
        industry: 'Sports Equipment',
        contactPerson: 'Test Manager',
        contactEmail: 'sponsor@mindfulchampion.com',
        contactPhone: '+1-555-TEST-SPONSOR',
        isApproved: true,
        approvedAt: new Date(),
        partnershipTier: 'GOLD', // PRO tier = unlimited products, advanced analytics
        maxActiveOffers: 999,
        analyticsAccess: true,
        customBranding: true,
        canFeatureOffers: true,
        priorityPlacement: true,
        subscriptionStatus: 'active',
      },
    });

    console.log('✅ Sponsor profile created:', sponsorProfile.id);

    // Create sample products
    const sampleProducts = [
      {
        name: 'Premium Pickleball Paddle',
        description: 'Professional-grade paddle with carbon fiber face and polymer core. Perfect for competitive play.',
        category: 'Equipment',
        pointsCost: 500,
        retailValue: 5000, // $50.00 in cents
        imageUrl: 'https://m.media-amazon.com/images/I/71hBrivff3L.jpg',
        stockQuantity: 0,
        unlimitedStock: true,
        isActive: true,
        isApproved: true,
        approvedAt: new Date(),
      },
      {
        name: 'Athletic Performance Shirt',
        description: 'Moisture-wicking performance shirt designed for pickleball athletes. Breathable and comfortable.',
        category: 'Apparel',
        pointsCost: 200,
        retailValue: 2000, // $20.00 in cents
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        stockQuantity: 0,
        unlimitedStock: true,
        isActive: true,
        isApproved: true,
        approvedAt: new Date(),
      },
      {
        name: 'Training Session Package',
        description: '3-session private coaching package with certified instructors. Improve your game with personalized training.',
        category: 'Services',
        pointsCost: 1000,
        retailValue: 10000, // $100.00 in cents
        stockQuantity: 5,
        unlimitedStock: false,
        isActive: true,
        isApproved: true,
        approvedAt: new Date(),
      },
    ];

    for (const productData of sampleProducts) {
      const product = await prisma.sponsorProduct.create({
        data: {
          ...productData,
          sponsorId: sponsorProfile.id,
        },
      });
      console.log('✅ Sample product created:', product.name);
    }

    console.log('\n\n🎉 TEST SPONSOR ACCOUNT CREATED SUCCESSFULLY!\n');
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log('─'.repeat(50));
    console.log('URL: https://mindfulchampion.com/sponsors/portal');
    console.log('Email: sponsor@mindfulchampion.com');
    console.log('Password: SponsorTest2025!');
    console.log('Tier: GOLD (PRO) - Unlimited products, advanced analytics');
    console.log('─'.repeat(50));
    console.log('\n✨ This account has:');
    console.log('  • Full PRO tier access');
    console.log('  • Unlimited product creation');
    console.log('  • Advanced analytics dashboard');
    console.log('  • 3 sample products already created');
    console.log('  • All features enabled\n');

  } catch (error) {
    console.error('❌ Error creating test sponsor:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestSponsor()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

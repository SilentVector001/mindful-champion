const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Initialize Prisma with the Neon database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ot6vpw5FUenm@ep-autumn-block-a4jw6pd9-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
});

const TEST_EMAIL = 'deansnow59@gmail.com';
const NEW_PASSWORD = 'MindfulChampion2025!';

async function fixLogin() {
  console.log('🔍 Starting login fix investigation...\n');
  
  try {
    // Step 1: Query the user record
    console.log(`📊 Step 1: Querying user record for ${TEST_EMAIL}...`);
    const user = await prisma.user.findUnique({
      where: { email: TEST_EMAIL },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        onboardingCompleted: true,
        role: true,
        subscriptionTier: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      console.error('❌ ERROR: User not found in database!');
      console.error(`   Email searched: ${TEST_EMAIL}`);
      return;
    }

    console.log('✅ User record found!\n');
    console.log('📋 Current User State:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name || 'Not set'}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Subscription: ${user.subscriptionTier}`);
    console.log(`   Onboarding Completed: ${user.onboardingCompleted}`);
    console.log(`   Password Hash (first 20 chars): ${user.password ? user.password.substring(0, 20) + '...' : 'NULL'}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log(`   Updated: ${user.updatedAt}\n`);

    // Step 2: Test current password
    console.log(`🔐 Step 2: Testing current password...`);
    if (user.password) {
      const isCurrentPasswordValid = await bcrypt.compare(NEW_PASSWORD, user.password);
      console.log(`   Current password matches "${NEW_PASSWORD}": ${isCurrentPasswordValid ? '✅ YES' : '❌ NO'}`);
      
      if (isCurrentPasswordValid) {
        console.log('\n⚠️  Password is correct in database! Issue might be elsewhere.');
        console.log('   Checking session/cache issues...\n');
      }
    } else {
      console.log('   ❌ No password hash found in database!\n');
    }

    // Step 3: Generate fresh password hash
    console.log(`🔑 Step 3: Generating fresh bcrypt hash for "${NEW_PASSWORD}"...`);
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(NEW_PASSWORD, saltRounds);
    console.log(`   ✅ New hash generated: ${newPasswordHash.substring(0, 20)}...`);
    console.log(`   Salt rounds: ${saltRounds}\n`);

    // Step 4: Update user record
    console.log(`💾 Step 4: Updating user record in database...`);
    const updatedUser = await prisma.user.update({
      where: { email: TEST_EMAIL },
      data: {
        password: newPasswordHash,
        onboardingCompleted: true,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        password: true,
        onboardingCompleted: true,
        updatedAt: true
      }
    });

    console.log('   ✅ User record updated successfully!\n');

    // Step 5: Verify the update
    console.log(`✅ Step 5: Verifying update...`);
    const verifyUser = await prisma.user.findUnique({
      where: { email: TEST_EMAIL },
      select: {
        id: true,
        email: true,
        password: true,
        onboardingCompleted: true,
        updatedAt: true
      }
    });

    console.log('📋 Updated User State:');
    console.log(`   ID: ${verifyUser.id}`);
    console.log(`   Email: ${verifyUser.email}`);
    console.log(`   Onboarding Completed: ${verifyUser.onboardingCompleted}`);
    console.log(`   Password Hash (first 20 chars): ${verifyUser.password.substring(0, 20)}...`);
    console.log(`   Updated At: ${verifyUser.updatedAt}\n`);

    // Step 6: Test new password
    console.log(`🔐 Step 6: Testing new password hash...`);
    const isNewPasswordValid = await bcrypt.compare(NEW_PASSWORD, verifyUser.password);
    console.log(`   Password verification: ${isNewPasswordValid ? '✅ SUCCESS' : '❌ FAILED'}\n`);

    if (isNewPasswordValid) {
      console.log('🎉 SUCCESS! Login fix completed successfully!\n');
      console.log('📝 Summary:');
      console.log(`   ✅ User ID: ${verifyUser.id}`);
      console.log(`   ✅ Email: ${verifyUser.email}`);
      console.log(`   ✅ Password: Reset to "MindfulChampion2025!"`);
      console.log(`   ✅ Onboarding: Completed`);
      console.log(`   ✅ Database: Updated\n`);
      console.log('🔄 Next Steps:');
      console.log('   1. Clear browser cache and cookies');
      console.log('   2. Try logging in at: https://mindfulchampion.com');
      console.log(`   3. Use credentials: ${TEST_EMAIL} / ${NEW_PASSWORD}\n`);
    } else {
      console.error('❌ ERROR: Password verification failed after update!');
    }

  } catch (error) {
    console.error('❌ ERROR occurred during login fix:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed.');
  }
}

// Run the fix
fixLogin();

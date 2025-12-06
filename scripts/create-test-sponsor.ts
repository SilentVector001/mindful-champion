import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import dotenv from 'dotenv'
import { randomBytes } from 'crypto'

// Load environment variables
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

// Generate a cuid-like ID
function generateId() {
  return 'c' + randomBytes(12).toString('base64url')
}

async function createTestSponsor() {
  try {
    console.log('🚀 Creating test sponsor account...\n')

    // Test sponsor credentials
    const testEmail = 'sponsor@test.com'
    const testPassword = 'Sponsor123!'
    const hashedPassword = await hash(testPassword, 10)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    })

    let userId: string

    if (existingUser) {
      console.log('✓ Test user already exists')
      userId = existingUser.id
    } else {
      // Create test user account
      const newUser = await prisma.user.create({
        data: {
          email: testEmail,
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'Sponsor',
          onboardingCompleted: true,
          subscriptionTier: 'PRO',
          isTrialActive: false,
        }
      })
      userId = newUser.id
      console.log('✓ Test user created')
    }

    // Check if sponsor profile already exists
    const existingProfile = await prisma.sponsorProfile.findFirst({
      where: { userId }
    })

    if (existingProfile) {
      // Update to ensure it's approved
      await prisma.sponsorProfile.update({
        where: { id: existingProfile.id },
        data: {
          isApproved: true,
          approvedAt: existingProfile.approvedAt || new Date(),
          approvedBy: existingProfile.approvedBy || 'admin'
        }
      })
      
      console.log('✓ Sponsor profile already exists (updated to approved)\n')
      console.log('📋 Test Sponsor Details:')
      console.log('   Email:', testEmail)
      console.log('   Password:', testPassword)
      console.log('   Company:', existingProfile.companyName)
      console.log('   Tier:', existingProfile.partnershipTier)
      console.log('   Approved: ✅ YES')
      console.log('\n🔗 Login at: https://mindful-champion-2hzb4j.abacusai.app/auth/signin')
      console.log('🔗 Sponsor Portal: https://mindful-champion-2hzb4j.abacusai.app/sponsors/portal')
      return
    }

    // Create sponsor profile with minimal required fields only
    const sponsorProfile = await prisma.sponsorProfile.create({
      data: {
        id: generateId(),
        userId,
        companyName: 'Test Sponsor Company',
        website: 'https://testsponsor.com',
        description: 'This is a test sponsor company for demonstration purposes. We offer premium pickleball equipment and training resources.',
        industry: 'Sports Equipment',
        contactPerson: 'Test Sponsor',
        contactEmail: testEmail,
        contactPhone: '555-0123',
        partnershipTier: 'silver', // silver tier (lowercase to match DB enum)
        isApproved: true, // ✅ APPROVED
        approvedAt: new Date(),
        approvedBy: 'admin',
        updatedAt: new Date(), // Required field
      }
    })

    console.log('✅ Test sponsor account created successfully!\n')
    console.log('📋 Test Sponsor Details:')
    console.log('   Email:', testEmail)
    console.log('   Password:', testPassword)
    console.log('   Company:', sponsorProfile.companyName)
    console.log('   Tier:', sponsorProfile.partnershipTier)
    console.log('   Approved: ✅ YES')
    console.log('\n🎯 What This Test Account Can Do:')
    console.log('   • Create and manage sponsor offers')
    console.log('   • Track redemptions and performance')
    console.log('   • View analytics dashboard')
    console.log('   • Update company profile')
    console.log('   • Browse marketplace offers')
    console.log('\n🔗 Login at: https://mindful-champion-2hzb4j.abacusai.app/auth/signin')
    console.log('🔗 Sponsor Portal: https://mindful-champion-2hzb4j.abacusai.app/sponsors/portal')
    console.log('\n💡 After logging in with these credentials, you should see:')
    console.log('   1. "Sponsor Portal" link in the Connect dropdown (desktop)')
    console.log('   2. "Sponsor Portal" button in the mobile menu')
    console.log('   3. Full access to /sponsors/portal with all features\n')

  } catch (error) {
    console.error('❌ Error creating test sponsor:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createTestSponsor()
  .then(() => {
    console.log('✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })

import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

async function testStripeConfiguration() {
  console.log('\n🔧 Testing Stripe Configuration...\n');

  // Test 1: Check environment variables
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_PREMIUM_PRICE_ID',
    'STRIPE_PRO_PRICE_ID',
  ];

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      results.push({
        test: `Environment Variable: ${envVar}`,
        status: 'PASS',
        message: `${envVar} is configured`,
      });
    } else {
      results.push({
        test: `Environment Variable: ${envVar}`,
        status: 'FAIL',
        message: `${envVar} is missing!`,
      });
    }
  }
}

async function testStripeConnection() {
  console.log('\n🌐 Testing Stripe Connection...\n');

  try {
    const account = await stripe.accounts.retrieve();
    results.push({
      test: 'Stripe Connection',
      status: 'PASS',
      message: 'Successfully connected to Stripe',
      details: {
        accountId: account.id,
        email: account.email,
        country: account.country,
      },
    });
  } catch (error: any) {
    results.push({
      test: 'Stripe Connection',
      status: 'FAIL',
      message: `Failed to connect to Stripe: ${error.message}`,
    });
  }
}

async function testPriceIds() {
  console.log('\n💰 Testing Price IDs...\n');

  const priceIds = [
    { name: 'PREMIUM', id: process.env.STRIPE_PREMIUM_PRICE_ID },
    { name: 'PRO', id: process.env.STRIPE_PRO_PRICE_ID },
  ];

  for (const { name, id } of priceIds) {
    if (!id) {
      results.push({
        test: `Price ID: ${name}`,
        status: 'FAIL',
        message: `${name} price ID is not configured`,
      });
      continue;
    }

    try {
      const price = await stripe.prices.retrieve(id);
      results.push({
        test: `Price ID: ${name}`,
        status: 'PASS',
        message: `${name} price is valid`,
        details: {
          id: price.id,
          amount: price.unit_amount ? price.unit_amount / 100 : 'N/A',
          currency: price.currency,
          recurring: price.recurring?.interval,
        },
      });
    } catch (error: any) {
      results.push({
        test: `Price ID: ${name}`,
        status: 'FAIL',
        message: `${name} price ID is invalid: ${error.message}`,
      });
    }
  }
}

async function testCustomerCreation() {
  console.log('\n👤 Testing Customer Creation...\n');

  try {
    // Create a test customer with full address
    const testCustomer = await stripe.customers.create({
      email: 'test-stripe@mindfulchampion.com',
      name: 'Stripe Test User',
      address: {
        line1: '123 Test Street',
        line2: 'Apt 4',
        city: 'San Francisco',
        state: 'CA',
        postal_code: '94102',
        country: 'US',
      },
      phone: '+1234567890',
      metadata: {
        userId: 'test-user-id',
        source: 'stripe-integration-test',
      },
    });

    results.push({
      test: 'Customer Creation with Address',
      status: 'PASS',
      message: 'Successfully created test customer with address',
      details: {
        customerId: testCustomer.id,
        email: testCustomer.email,
        address: testCustomer.address,
        phone: testCustomer.phone,
      },
    });

    // Verify address was saved
    const retrievedCustomer = await stripe.customers.retrieve(testCustomer.id);
    if (retrievedCustomer.address && retrievedCustomer.address.line1 === '123 Test Street') {
      results.push({
        test: 'Address Storage Verification',
        status: 'PASS',
        message: 'Address successfully stored in Stripe',
        details: retrievedCustomer.address,
      });
    } else {
      results.push({
        test: 'Address Storage Verification',
        status: 'FAIL',
        message: 'Address not found or incorrect',
      });
    }

    // Cleanup test customer
    await stripe.customers.del(testCustomer.id);
    console.log('✅ Cleaned up test customer');

  } catch (error: any) {
    results.push({
      test: 'Customer Creation',
      status: 'FAIL',
      message: `Failed to create test customer: ${error.message}`,
    });
  }
}

async function testCheckoutSessionCreation() {
  console.log('\n🛒 Testing Checkout Session Creation...\n');

  try {
    const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
    if (!priceId) {
      results.push({
        test: 'Checkout Session Creation',
        status: 'FAIL',
        message: 'STRIPE_PREMIUM_PRICE_ID not configured',
      });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      success_url: 'https://mindful-champion-2hzb4j.abacusai.app/dashboard?success=true',
      cancel_url: 'https://mindful-champion-2hzb4j.abacusai.app/pricing?canceled=true',
      metadata: {
        userId: 'test-user-id',
        tier: 'PREMIUM',
      },
      subscription_data: {
        trial_period_days: 7,
      },
    });

    results.push({
      test: 'Checkout Session Creation',
      status: 'PASS',
      message: 'Successfully created checkout session with address collection',
      details: {
        sessionId: session.id,
        url: session.url,
        billing_address_collection: 'required',
        shipping_address_collection: true,
      },
    });

  } catch (error: any) {
    results.push({
      test: 'Checkout Session Creation',
      status: 'FAIL',
      message: `Failed to create checkout session: ${error.message}`,
    });
  }
}

async function testDatabaseConnection() {
  console.log('\n🗄️  Testing Database Connection...\n');

  try {
    // Test database connection
    await prisma.$connect();
    results.push({
      test: 'Database Connection',
      status: 'PASS',
      message: 'Successfully connected to database',
    });

    // Check if User table has billingAddress field
    const userFields = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name = 'billingAddress'
    `;

    if (Array.isArray(userFields) && userFields.length > 0) {
      results.push({
        test: 'Database Schema: billingAddress',
        status: 'PASS',
        message: 'User table has billingAddress field',
      });
    } else {
      results.push({
        test: 'Database Schema: billingAddress',
        status: 'FAIL',
        message: 'User table is missing billingAddress field - migration needed',
      });
    }

  } catch (error: any) {
    results.push({
      test: 'Database Connection',
      status: 'FAIL',
      message: `Failed to connect to database: ${error.message}`,
    });
  }
}

function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 STRIPE INTEGRATION TEST RESULTS');
  console.log('='.repeat(80) + '\n');

  let passed = 0;
  let failed = 0;

  results.forEach((result) => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${result.test}: ${result.message}`);
    
    if (result.details) {
      console.log('   Details:', JSON.stringify(result.details, null, 2));
    }
    
    if (result.status === 'PASS') passed++;
    else failed++;
  });

  console.log('\n' + '='.repeat(80));
  console.log(`📊 Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log('='.repeat(80) + '\n');

  if (failed > 0) {
    console.log('⚠️  IMPORTANT NOTES:');
    console.log('1. If environment variables are missing, add them to .env file');
    console.log('2. If database schema is missing, run: npm run prisma:migrate');
    console.log('3. Test checkout with card: 4242 4242 4242 4242 (any future date, any CVC)');
    console.log('4. Verify addresses in Stripe Dashboard: https://dashboard.stripe.com/test/customers\n');
  } else {
    console.log('🎉 All tests passed! Your Stripe integration is ready to use.');
    console.log('\n📝 Next Steps:');
    console.log('1. Test checkout flow: npm run dev → Go to /pricing');
    console.log('2. Use test card: 4242 4242 4242 4242');
    console.log('3. Enter test address during checkout');
    console.log('4. Verify customer & address in Stripe Dashboard\n');
  }
}

async function runAllTests() {
  try {
    await testStripeConfiguration();
    await testStripeConnection();
    await testPriceIds();
    await testCustomerCreation();
    await testCheckoutSessionCreation();
    await testDatabaseConnection();
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    printResults();
    await prisma.$disconnect();
  }
}

// Run tests
runAllTests();

/**
 * Environment Variables Verification Script
 * 
 * This script checks that all required environment variables are set
 * and validates their formats.
 * 
 * Usage: npm run verify-env
 */

import * as fs from 'fs';
import * as path from 'path';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

interface EnvCheck {
  name: string;
  required: 'critical' | 'important' | 'optional';
  validator?: (value: string) => boolean;
  description: string;
  example?: string;
}

const envChecks: EnvCheck[] = [
  // CRITICAL Variables
  {
    name: 'DATABASE_URL',
    required: 'critical',
    validator: (v) => v.startsWith('postgresql://'),
    description: 'PostgreSQL connection string',
    example: 'postgresql://user:pass@host:5432/db',
  },
  {
    name: 'NEXTAUTH_SECRET',
    required: 'critical',
    validator: (v) => v.length >= 32,
    description: 'NextAuth secret (32+ characters)',
    example: 'Generate with: openssl rand -base64 32',
  },
  {
    name: 'NEXTAUTH_URL',
    required: 'critical',
    validator: (v) => v.startsWith('http://') || v.startsWith('https://'),
    description: 'Application base URL',
    example: 'https://yourdomain.com',
  },
  {
    name: 'GMAIL_USER',
    required: 'critical',
    validator: (v) => v.includes('@'),
    description: 'Gmail account for sending emails',
    example: 'your-email@gmail.com',
  },
  {
    name: 'GMAIL_APP_PASSWORD',
    required: 'critical',
    validator: (v) => v.length === 16,
    description: 'Gmail app password (16 characters)',
    example: 'abcdefghijklmnop',
  },
  {
    name: 'CRON_SECRET',
    required: 'critical',
    validator: (v) => v.length >= 32,
    description: 'Cron job authentication secret',
    example: 'Generate with: openssl rand -base64 32',
  },
  {
    name: 'ABACUSAI_API_KEY',
    required: 'critical',
    validator: (v) => v.length >= 32,
    description: 'Abacus.AI API key',
    example: 'Get from https://abacus.ai/app/profile/apikey',
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: 'critical',
    validator: (v) => v.startsWith('http://') || v.startsWith('https://'),
    description: 'Public app URL for links',
    example: 'https://mindfulchampion.com',
  },

  // IMPORTANT Variables
  {
    name: 'AWS_REGION',
    required: 'important',
    validator: (v) => /^[a-z]{2}-[a-z]+-\d+$/.test(v),
    description: 'AWS region for S3',
    example: 'us-west-2',
  },
  {
    name: 'AWS_BUCKET_NAME',
    required: 'important',
    description: 'S3 bucket name',
    example: 'your-bucket-name',
  },
  {
    name: 'STRIPE_PUBLISHABLE_KEY',
    required: 'important',
    validator: (v) => v.startsWith('pk_'),
    description: 'Stripe publishable key',
    example: 'pk_test_...',
  },
  {
    name: 'STRIPE_SECRET_KEY',
    required: 'important',
    validator: (v) => v.startsWith('sk_'),
    description: 'Stripe secret key',
    example: 'sk_test_...',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: 'important',
    validator: (v) => v.startsWith('whsec_'),
    description: 'Stripe webhook secret',
    example: 'whsec_...',
  },
  {
    name: 'STRIPE_PREMIUM_PRICE_ID',
    required: 'important',
    validator: (v) => v.startsWith('price_'),
    description: 'Stripe Premium price ID',
    example: 'price_...',
  },
  {
    name: 'STRIPE_PRO_PRICE_ID',
    required: 'important',
    validator: (v) => v.startsWith('price_'),
    description: 'Stripe Pro price ID',
    example: 'price_...',
  },

  // NOTIFICATION Variables
  {
    name: 'NOTIFICATION_EMAIL',
    required: 'important',
    validator: (v) => v.includes('@'),
    description: 'Notification from email',
    example: 'notifications@mindfulchampion.com',
  },
  {
    name: 'SUPPORT_EMAIL',
    required: 'important',
    validator: (v) => v.includes('@'),
    description: 'Support email address',
    example: 'support@mindfulchampion.com',
  },
  {
    name: 'EMAIL_FROM',
    required: 'important',
    validator: (v) => v.includes('@'),
    description: 'Default from email',
    example: 'hello@mindfulchampion.com',
  },
  {
    name: 'EMAIL_REPLY_TO',
    required: 'important',
    validator: (v) => v.includes('@'),
    description: 'Reply-to email address',
    example: 'dean@mindfulchampion.com',
  },
  {
    name: 'EMAIL_NOTIFICATIONS_ENABLED',
    required: 'important',
    validator: (v) => v === 'true' || v === 'false',
    description: 'Enable email notifications',
    example: 'true',
  },

  // OPTIONAL Variables
  {
    name: 'PARTNERS_EMAIL',
    required: 'optional',
    validator: (v) => v.includes('@'),
    description: 'Partners email address',
  },
  {
    name: 'SPONSORS_EMAIL',
    required: 'optional',
    validator: (v) => v.includes('@'),
    description: 'Sponsors email address',
  },
  {
    name: 'AWS_FOLDER_PREFIX',
    required: 'optional',
    description: 'S3 folder prefix',
    example: '6482/',
  },
  {
    name: 'AWS_PROFILE',
    required: 'optional',
    description: 'AWS profile name',
    example: 'hosted_storage',
  },
  {
    name: 'GOOGLE_CLIENT_ID',
    required: 'optional',
    description: 'Google OAuth client ID',
  },
  {
    name: 'GOOGLE_CLIENT_SECRET',
    required: 'optional',
    description: 'Google OAuth client secret',
  },
  {
    name: 'TWILIO_ACCOUNT_SID',
    required: 'optional',
    validator: (v) => v.startsWith('AC'),
    description: 'Twilio account SID',
  },
  {
    name: 'TWILIO_AUTH_TOKEN',
    required: 'optional',
    description: 'Twilio auth token',
  },
  {
    name: 'TWILIO_PHONE_NUMBER',
    required: 'optional',
    validator: (v) => v.startsWith('+'),
    description: 'Twilio phone number',
    example: '+15551234567',
  },
  {
    name: 'RESEND_API_KEY',
    required: 'optional',
    validator: (v) => v.startsWith('re_'),
    description: 'Resend API key (backup email service)',
  },
];

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'missing';
  message: string;
  required: 'critical' | 'important' | 'optional';
}

function checkEnvironmentVariable(check: EnvCheck): CheckResult {
  const value = process.env[check.name];

  if (!value) {
    return {
      name: check.name,
      status: 'missing',
      message: `${check.description}${check.example ? ` (e.g., ${check.example})` : ''}`,
      required: check.required,
    };
  }

  if (check.validator && !check.validator(value)) {
    return {
      name: check.name,
      status: 'fail',
      message: `Invalid format: ${check.description}${check.example ? ` (e.g., ${check.example})` : ''}`,
      required: check.required,
    };
  }

  return {
    name: check.name,
    status: 'pass',
    message: check.description,
    required: check.required,
  };
}

function printResults(results: CheckResult[]) {
  console.log(`\n${colors.bold}${colors.cyan}===================================`);
  console.log(`ENVIRONMENT VARIABLES VERIFICATION`);
  console.log(`===================================${colors.reset}\n`);

  const criticalResults = results.filter((r) => r.required === 'critical');
  const importantResults = results.filter((r) => r.required === 'important');
  const optionalResults = results.filter((r) => r.required === 'optional');

  // Critical Variables
  console.log(`${colors.bold}${colors.red}🔴 CRITICAL Variables (App won't start without these)${colors.reset}`);
  criticalResults.forEach((result) => {
    const icon = result.status === 'pass' ? '✅' : '❌';
    const color = result.status === 'pass' ? colors.green : colors.red;
    console.log(`${icon} ${color}${result.name}${colors.reset}: ${result.message}`);
  });

  // Important Variables
  console.log(`\n${colors.bold}${colors.yellow}🟡 IMPORTANT Variables (Features won't work without these)${colors.reset}`);
  importantResults.forEach((result) => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'missing' ? '⚠️ ' : '❌';
    const color = result.status === 'pass' ? colors.green : colors.yellow;
    console.log(`${icon} ${color}${result.name}${colors.reset}: ${result.message}`);
  });

  // Optional Variables
  console.log(`\n${colors.bold}${colors.blue}🔵 OPTIONAL Variables (Nice to have)${colors.reset}`);
  optionalResults.forEach((result) => {
    const icon = result.status === 'pass' ? '✅' : '⭕';
    const color = result.status === 'pass' ? colors.green : colors.blue;
    console.log(`${icon} ${color}${result.name}${colors.reset}: ${result.message}`);
  });

  // Summary
  const criticalPass = criticalResults.filter((r) => r.status === 'pass').length;
  const criticalTotal = criticalResults.length;
  const importantPass = importantResults.filter((r) => r.status === 'pass').length;
  const importantTotal = importantResults.length;
  const optionalPass = optionalResults.filter((r) => r.status === 'pass').length;
  const optionalTotal = optionalResults.length;

  console.log(`\n${colors.bold}${colors.cyan}===================================`);
  console.log(`SUMMARY`);
  console.log(`===================================${colors.reset}`);
  console.log(`🔴 Critical: ${criticalPass}/${criticalTotal} configured`);
  console.log(`🟡 Important: ${importantPass}/${importantTotal} configured`);
  console.log(`🔵 Optional: ${optionalPass}/${optionalTotal} configured`);

  const allCriticalPass = criticalPass === criticalTotal;
  const allImportantPass = importantPass === importantTotal;

  if (allCriticalPass && allImportantPass) {
    console.log(`\n${colors.bold}${colors.green}✅ ALL REQUIRED VARIABLES CONFIGURED!${colors.reset}`);
    console.log(`${colors.green}Your application is ready for production.${colors.reset}\n`);
    return true;
  } else if (allCriticalPass) {
    console.log(`\n${colors.bold}${colors.yellow}⚠️  MISSING IMPORTANT VARIABLES${colors.reset}`);
    console.log(`${colors.yellow}App will start but some features may not work.${colors.reset}\n`);
    return false;
  } else {
    console.log(`\n${colors.bold}${colors.red}❌ MISSING CRITICAL VARIABLES${colors.reset}`);
    console.log(`${colors.red}App will NOT start without these variables.${colors.reset}\n`);
    return false;
  }
}

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error(`${colors.red}❌ .env file not found at ${envPath}${colors.reset}`);
    console.log(`\n${colors.yellow}Please copy .env.example to .env and fill in your values:${colors.reset}`);
    console.log(`${colors.cyan}cp .env.example .env${colors.reset}\n`);
    process.exit(1);
  }

  // Load .env file
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const match = line.match(/^([^=:#]+)=(.*)/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// Main execution
function main() {
  console.log(`${colors.bold}${colors.cyan}Mindful Champion - Environment Verification${colors.reset}\n`);
  
  // Load .env file
  loadEnvFile();

  // Run checks
  const results = envChecks.map(checkEnvironmentVariable);

  // Print results
  const success = printResults(results);

  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main();
}

export { checkEnvironmentVariable, envChecks };

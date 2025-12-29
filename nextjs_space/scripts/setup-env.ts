/**
 * Interactive Environment Setup Script
 * 
 * This script helps you set up environment variables interactively.
 * 
 * Usage: npm run setup-env
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

function generateSecret(): string {
  try {
    return execSync('openssl rand -base64 32').toString().trim();
  } catch (error) {
    // Fallback to crypto if openssl not available
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('base64');
  }
}

interface EnvVariable {
  name: string;
  description: string;
  example?: string;
  defaultValue?: string;
  generator?: () => string;
  validator?: (value: string) => boolean;
  optional?: boolean;
}

const envVariables: EnvVariable[] = [
  // Database
  {
    name: 'DATABASE_URL',
    description: 'PostgreSQL connection string',
    example: 'postgresql://user:pass@host:5432/db',
    validator: (v) => v.startsWith('postgresql://'),
  },

  // Authentication
  {
    name: 'NEXTAUTH_SECRET',
    description: 'NextAuth secret (press Enter to generate)',
    generator: generateSecret,
  },
  {
    name: 'NEXTAUTH_URL',
    description: 'Application URL',
    example: 'http://localhost:3000',
    defaultValue: 'http://localhost:3000',
  },

  // Gmail
  {
    name: 'GMAIL_USER',
    description: 'Gmail address for sending emails',
    example: 'your-email@gmail.com',
    validator: (v) => v.includes('@'),
  },
  {
    name: 'GMAIL_APP_PASSWORD',
    description: 'Gmail App Password (16 chars, from https://myaccount.google.com/apppasswords)',
    example: 'abcdefghijklmnop',
    validator: (v) => v.length === 16,
  },

  // Cron
  {
    name: 'CRON_SECRET',
    description: 'Cron secret (press Enter to generate)',
    generator: generateSecret,
  },

  // Abacus.AI
  {
    name: 'ABACUSAI_API_KEY',
    description: 'Abacus.AI API key (from https://abacus.ai/app/profile/apikey)',
  },

  // Public URL
  {
    name: 'NEXT_PUBLIC_APP_URL',
    description: 'Public app URL for links',
    example: 'https://mindfulchampion.com',
    defaultValue: 'http://localhost:3000',
  },

  // AWS S3
  {
    name: 'AWS_REGION',
    description: 'AWS region',
    example: 'us-west-2',
    defaultValue: 'us-west-2',
  },
  {
    name: 'AWS_BUCKET_NAME',
    description: 'S3 bucket name',
    example: 'my-bucket',
  },
  {
    name: 'AWS_FOLDER_PREFIX',
    description: 'S3 folder prefix',
    example: 'app-files/',
    optional: true,
  },

  // Stripe
  {
    name: 'STRIPE_PUBLISHABLE_KEY',
    description: 'Stripe publishable key (pk_...)',
    validator: (v) => v.startsWith('pk_'),
  },
  {
    name: 'STRIPE_SECRET_KEY',
    description: 'Stripe secret key (sk_...)',
    validator: (v) => v.startsWith('sk_'),
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    description: 'Stripe webhook secret (whsec_...)',
    validator: (v) => v.startsWith('whsec_'),
  },
  {
    name: 'STRIPE_PREMIUM_PRICE_ID',
    description: 'Stripe Premium price ID (price_...)',
    validator: (v) => v.startsWith('price_'),
  },
  {
    name: 'STRIPE_PRO_PRICE_ID',
    description: 'Stripe Pro price ID (price_...)',
    validator: (v) => v.startsWith('price_'),
  },

  // Email addresses
  {
    name: 'NOTIFICATION_EMAIL',
    description: 'Notification from email',
    example: 'notifications@mindfulchampion.com',
    validator: (v) => v.includes('@'),
  },
  {
    name: 'SUPPORT_EMAIL',
    description: 'Support email',
    example: 'support@mindfulchampion.com',
    validator: (v) => v.includes('@'),
  },
  {
    name: 'EMAIL_FROM',
    description: 'Default from email',
    example: 'hello@mindfulchampion.com',
    validator: (v) => v.includes('@'),
  },
  {
    name: 'EMAIL_REPLY_TO',
    description: 'Reply-to email',
    example: 'dean@mindfulchampion.com',
    validator: (v) => v.includes('@'),
  },
  {
    name: 'EMAIL_NOTIFICATIONS_ENABLED',
    description: 'Enable email notifications (true/false)',
    defaultValue: 'true',
    validator: (v) => v === 'true' || v === 'false',
  },
];

async function setupEnvironment() {
  console.log(`${colors.bold}${colors.cyan}`);
  console.log('===================================');
  console.log('  MINDFUL CHAMPION - ENV SETUP');
  console.log('===================================');
  console.log(colors.reset);
  console.log();
  console.log(`${colors.yellow}This wizard will help you set up your environment variables.${colors.reset}`);
  console.log(`${colors.yellow}Press Enter to skip optional fields or use default values.${colors.reset}`);
  console.log();

  const envConfig: Record<string, string> = {};

  for (const envVar of envVariables) {
    const optionalText = envVar.optional ? ' (optional)' : '';
    const exampleText = envVar.example ? ` [e.g., ${envVar.example}]` : '';
    const defaultText = envVar.defaultValue ? ` [default: ${envVar.defaultValue}]` : '';
    const generatorText = envVar.generator ? ` [press Enter to generate]` : '';

    console.log(`${colors.bold}${envVar.name}${colors.reset}${optionalText}`);
    console.log(`  ${colors.cyan}${envVar.description}${colors.reset}${exampleText}${defaultText}${generatorText}`);

    let value = await question(`  > `);

    // Handle empty input
    if (!value) {
      if (envVar.generator) {
        value = envVar.generator();
        console.log(`  ${colors.green}Generated: ${value}${colors.reset}`);
      } else if (envVar.defaultValue) {
        value = envVar.defaultValue;
        console.log(`  ${colors.green}Using default: ${value}${colors.reset}`);
      } else if (envVar.optional) {
        console.log(`  ${colors.yellow}Skipped${colors.reset}`);
        console.log();
        continue;
      } else {
        console.log(`  ${colors.red}This field is required!${colors.reset}`);
        // Re-ask the question
        value = await question(`  > `);
      }
    }

    // Validate
    if (envVar.validator && !envVar.validator(value)) {
      console.log(`  ${colors.red}Invalid format! Please try again.${colors.reset}`);
      value = await question(`  > `);
    }

    envConfig[envVar.name] = value;
    console.log();
  }

  // Ask about optional variables
  console.log(`${colors.bold}${colors.blue}Optional Variables${colors.reset}`);
  console.log();

  const addOptional = await question(
    `Do you want to add optional variables? (Twilio, Google OAuth, etc.) [y/N] > `
  );

  if (addOptional.toLowerCase() === 'y' || addOptional.toLowerCase() === 'yes') {
    // Add optional variables
    const optionalVars: EnvVariable[] = [
      {
        name: 'GOOGLE_CLIENT_ID',
        description: 'Google OAuth Client ID',
        optional: true,
      },
      {
        name: 'GOOGLE_CLIENT_SECRET',
        description: 'Google OAuth Client Secret',
        optional: true,
      },
      {
        name: 'TWILIO_ACCOUNT_SID',
        description: 'Twilio Account SID',
        optional: true,
      },
      {
        name: 'TWILIO_AUTH_TOKEN',
        description: 'Twilio Auth Token',
        optional: true,
      },
      {
        name: 'TWILIO_PHONE_NUMBER',
        description: 'Twilio Phone Number',
        example: '+15551234567',
        optional: true,
      },
    ];

    for (const envVar of optionalVars) {
      console.log(`${colors.bold}${envVar.name}${colors.reset} (optional)`);
      console.log(`  ${colors.cyan}${envVar.description}${colors.reset}`);
      const value = await question(`  > `);
      if (value) {
        envConfig[envVar.name] = value;
      }
      console.log();
    }
  }

  // Write .env file
  const envPath = path.join(process.cwd(), '.env');
  const envContent = Object.entries(envConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(envPath, envContent + '\n');

  console.log(`${colors.bold}${colors.green}✅ .env file created successfully!${colors.reset}`);
  console.log(`${colors.green}Location: ${envPath}${colors.reset}`);
  console.log();
  console.log(`${colors.yellow}Next steps:${colors.reset}`);
  console.log(`  1. Review the .env file`);
  console.log(`  2. Run ${colors.cyan}npm run verify-env${colors.reset} to verify configuration`);
  console.log(`  3. Start your application with ${colors.cyan}npm run dev${colors.reset}`);
  console.log();

  rl.close();
}

// Run setup
setupEnvironment().catch((error) => {
  console.error(`${colors.red}Error during setup:${colors.reset}`, error);
  rl.close();
  process.exit(1);
});

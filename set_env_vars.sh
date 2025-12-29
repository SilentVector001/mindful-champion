
#!/bin/bash

# Set Stripe environment variables (placeholders - user needs to set these)
echo "STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here" >> .env
echo "STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here" >> .env
echo "STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here" >> .env

# Set Gmail environment variables (placeholders - user needs to set these)
echo "GMAIL_USER=your-gmail@gmail.com" >> .env
echo "GMAIL_APP_PASSWORD=your-gmail-app-password" >> .env

echo "Environment variables have been added to .env file"
echo "Please update the placeholder values with your actual API keys:"
echo "1. Replace Stripe keys with your actual Stripe test/live keys"
echo "2. Replace Gmail credentials with your actual Gmail account and app password"
echo "3. Setup Stripe webhook endpoint: /api/stripe/webhook"

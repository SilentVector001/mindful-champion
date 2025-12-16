#!/bin/bash

# Update Email Domains Script
# This script updates all email sending code to use a verified custom domain

echo "🔧 Email Domain Update Script"
echo "=============================="
echo ""

# Check if domain is provided
if [ -z "$1" ]; then
  echo "❌ Error: No domain provided"
  echo ""
  echo "Usage: ./scripts/update-email-domains.sh <your-domain>"
  echo "Example: ./scripts/update-email-domains.sh mindfulchampion.com"
  echo ""
  echo "This will update:"
  echo "  onboarding@resend.dev → noreply@your-domain"
  echo "  partnerships@resend.dev → partnerships@your-domain"
  echo ""
  exit 1
fi

DOMAIN=$1
echo "📧 Updating email domains to use: $DOMAIN"
echo ""

# Backup files before modifying
echo "💾 Creating backups..."
cp lib/email/sponsor-approval-email.ts lib/email/sponsor-approval-email.ts.backup
cp lib/email/sponsor-admin-notification-email.ts lib/email/sponsor-admin-notification-email.ts.backup
echo "✅ Backups created (.backup files)"
echo ""

# Update sponsor approval email
echo "📝 Updating sponsor-approval-email.ts..."
sed -i "s/onboarding@resend.dev/noreply@$DOMAIN/g" lib/email/sponsor-approval-email.ts
echo "✅ Updated: onboarding@resend.dev → noreply@$DOMAIN"
echo ""

# Update admin notification email
echo "📝 Updating sponsor-admin-notification-email.ts..."
sed -i "s/partnerships@resend.dev/partnerships@$DOMAIN/g" lib/email/sponsor-admin-notification-email.ts
echo "✅ Updated: partnerships@resend.dev → partnerships@$DOMAIN"
echo ""

# Check for other email files
echo "🔍 Checking for other email files..."
EMAIL_FILES=$(find lib/email -name "*.ts" -type f | grep -v backup)
for file in $EMAIL_FILES; do
  if grep -q "@resend.dev" "$file"; then
    echo "⚠️  Found @resend.dev in: $file"
    echo "   Please manually review and update if needed"
  fi
done
echo ""

echo "✅ Email domain update complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review changes: git diff lib/email/"
echo "2. Test email sending: npm run ts-node scripts/test-email-delivery.ts"
echo "3. Commit changes: git add lib/email/ && git commit -m 'Update email domains to $DOMAIN'"
echo "4. Deploy: git push"
echo ""
echo "🔗 Verify domain in Resend: https://resend.com/domains"
echo ""

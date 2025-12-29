#!/bin/bash

echo "=========================================="
echo "Testing Sign-In Fix Locally"
echo "=========================================="
echo ""

# Check if .env has correct NEXTAUTH_URL
echo "1. Checking NEXTAUTH_URL in .env..."
NEXTAUTH_URL=$(grep "NEXTAUTH_URL" .env | cut -d '=' -f2)
echo "   Current value: $NEXTAUTH_URL"

if [ "$NEXTAUTH_URL" = "https://www.mindfulchampion.com" ]; then
    echo "   ✅ CORRECT"
else
    echo "   ❌ INCORRECT - Should be: https://www.mindfulchampion.com"
    echo ""
    echo "   Fixing..."
    sed -i 's|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://www.mindfulchampion.com|g' .env
    echo "   ✅ Fixed!"
fi

echo ""
echo "2. Checking database connection..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findFirst({ where: { email: 'deansnow59@gmail.com' } })
  .then(user => {
    if (user) {
      console.log('   ✅ Database connected');
      console.log('   ✅ User found:', user.email);
    } else {
      console.log('   ❌ User not found');
    }
    prisma.\$disconnect();
  })
  .catch(err => {
    console.log('   ❌ Database error:', err.message);
    prisma.\$disconnect();
  });
"

echo ""
echo "3. Testing password..."
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

prisma.user.findFirst({ where: { email: 'deansnow59@gmail.com' } })
  .then(async user => {
    if (user && user.password) {
      const isValid = await bcrypt.compare('MindfulChampion2025!', user.password);
      if (isValid) {
        console.log('   ✅ Password is correct');
      } else {
        console.log('   ❌ Password does not match');
      }
    }
    prisma.\$disconnect();
  })
  .catch(err => {
    console.log('   ❌ Error:', err.message);
    prisma.\$disconnect();
  });
"

echo ""
echo "=========================================="
echo "Local Test Complete"
echo "=========================================="
echo ""
echo "To test the sign-in locally:"
echo "1. Run: npm run dev"
echo "2. Open: http://localhost:3000/auth/signin"
echo "3. Sign in with:"
echo "   Email: deansnow59@gmail.com"
echo "   Password: MindfulChampion2025!"
echo ""
echo "⚠️  IMPORTANT: This only tests locally."
echo "    Production fix requires updating Vercel environment variable."
echo ""

#!/bin/bash

echo "🔍 Checking DNS Status for mindfulchampion.com"
echo "================================================"
echo ""

echo "1. Nameservers:"
dig NS mindfulchampion.com +short
echo ""

echo "2. DKIM Record:"
dig TXT resend._domainkey.mindfulchampion.com +short
echo ""

echo "3. SPF Record:"
dig TXT send.mindfulchampion.com +short
echo ""

echo "4. DMARC Record:"
dig TXT _dmarc.mindfulchampion.com +short
echo ""

echo "5. MX Records:"
dig MX mindfulchampion.com +short
echo ""

echo "✅ If you see records above, DNS has propagated!"
echo "⏳ If empty, wait 5-30 more minutes and try again"
echo ""

echo "📊 Check domain verification in Resend:"
echo "   https://resend.com/domains"

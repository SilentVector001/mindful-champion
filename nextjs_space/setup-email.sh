#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        Mindful Champion - Email Setup Script         ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    exit 1
fi

# Check current API key
CURRENT_KEY=$(grep RESEND_API_KEY .env | cut -d '=' -f2)

echo -e "${YELLOW}📝 Current Resend API Key:${NC} $CURRENT_KEY"
echo ""

if [ "$CURRENT_KEY" == "your_resend_api_key_here" ]; then
    echo -e "${RED}⚠️  WARNING: You're using the default placeholder API key!${NC}"
    echo -e "${RED}   Emails will NOT be sent - they're being simulated.${NC}"
    echo ""
    echo -e "${BLUE}To fix this:${NC}"
    echo -e "  1. Sign up at https://resend.com (FREE)"
    echo -e "  2. Get your API key from the dashboard"
    echo -e "  3. Run this script again with: ./setup-email.sh YOUR_API_KEY"
    echo ""
    exit 1
fi

# If API key is provided as argument
if [ ! -z "$1" ]; then
    NEW_KEY="$1"
    
    # Validate key format
    if [[ ! "$NEW_KEY" =~ ^re_ ]]; then
        echo -e "${RED}❌ Error: Invalid Resend API key format!${NC}"
        echo -e "   Resend API keys start with 're_'"
        exit 1
    fi
    
    echo -e "${BLUE}🔧 Updating RESEND_API_KEY in .env file...${NC}"
    
    # Backup .env
    cp .env .env.backup
    echo -e "${GREEN}✅ Backup created: .env.backup${NC}"
    
    # Update .env file
    sed -i "s|RESEND_API_KEY=.*|RESEND_API_KEY=$NEW_KEY|g" .env
    
    # Verify update
    UPDATED_KEY=$(grep RESEND_API_KEY .env | cut -d '=' -f2)
    
    if [ "$UPDATED_KEY" == "$NEW_KEY" ]; then
        echo -e "${GREEN}✅ API key updated successfully!${NC}"
        echo ""
        echo -e "${BLUE}🔄 Next steps:${NC}"
        echo -e "  1. Restart your application:"
        echo -e "     ${YELLOW}pm2 restart all${NC} (if using PM2)"
        echo -e "     OR"
        echo -e "     ${YELLOW}pkill -f next && npm run build && npm start${NC}"
        echo ""
        echo -e "  2. Test email sending:"
        echo -e "     ${YELLOW}node test-email.js${NC}"
        echo ""
        echo -e "${GREEN}📧 Your emails will now be sent via Resend!${NC}"
    else
        echo -e "${RED}❌ Error: Failed to update API key!${NC}"
        echo -e "   Restoring backup..."
        mv .env.backup .env
        exit 1
    fi
else
    # No argument provided, check if key is valid
    if [[ "$CURRENT_KEY" =~ ^re_ ]]; then
        echo -e "${GREEN}✅ Valid Resend API key detected!${NC}"
        echo ""
        echo -e "${BLUE}📧 Email service should be working.${NC}"
        echo ""
        echo -e "${YELLOW}To test email sending:${NC}"
        echo -e "  ${YELLOW}node test-email.js${NC}"
    else
        echo -e "${YELLOW}⚠️  Unusual API key format detected.${NC}"
        echo -e "   Resend keys typically start with 're_'"
        echo ""
        echo -e "${BLUE}To update your API key:${NC}"
        echo -e "  ${YELLOW}./setup-email.sh YOUR_NEW_API_KEY${NC}"
    fi
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  For more help, see: /home/ubuntu/EMAIL_SETUP_GUIDE.md${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"

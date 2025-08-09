#!/bin/bash

# Kitchentory Convex Deployment Script
# This script handles the complete deployment of Convex schema and functions

set -e

echo "🚀 Kitchentory Convex Deployment Script"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "convex" ]; then
    echo -e "${RED}❌ Error: This script must be run from the project root directory${NC}"
    echo "Make sure you're in the kitchentory directory and that convex/ folder exists"
    exit 1
fi

# Check if Convex CLI is available
if ! command -v npx convex &> /dev/null; then
    echo -e "${RED}❌ Error: Convex CLI not found${NC}"
    echo "Please install dependencies first: npm install"
    exit 1
fi

echo -e "${BLUE}📋 Checking environment variables...${NC}"

# Check environment variables
if [ -z "$CONVEX_DEPLOY_KEY" ] && [ -z "$NEXT_PUBLIC_CONVEX_URL" ]; then
    echo -e "${YELLOW}⚠️  No Convex environment variables found${NC}"
    echo "You need to set up Convex deployment. Choose an option:"
    echo
    echo "1. Create new Convex project"
    echo "2. Use existing Convex project (requires CONVEX_DEPLOY_KEY)"
    echo "3. Skip deployment (prepare only)"
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            echo -e "${BLUE}🆕 Setting up new Convex project...${NC}"
            npx convex dev --configure new --once
            ;;
        2)
            echo -e "${YELLOW}Please set your CONVEX_DEPLOY_KEY environment variable${NC}"
            echo "You can find it at: https://dashboard.convex.dev"
            echo "Add it to your .env.local file:"
            echo "CONVEX_DEPLOY_KEY=your_deploy_key_here"
            exit 1
            ;;
        3)
            echo -e "${YELLOW}⏭️  Skipping deployment, preparing files only...${NC}"
            SKIP_DEPLOY=true
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            exit 1
            ;;
    esac
fi

# Check TypeScript compilation
echo -e "${BLUE}🔍 Checking TypeScript compilation...${NC}"
if ! npm run type-check > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  TypeScript errors found, but continuing...${NC}"
    echo "You may want to fix TypeScript errors for better development experience"
fi

# Validate Convex schema
echo -e "${BLUE}🔍 Validating Convex schema...${NC}"
if [ -f "convex/schema.ts" ]; then
    echo -e "${GREEN}✅ Schema file found${NC}"
else
    echo -e "${RED}❌ Error: convex/schema.ts not found${NC}"
    exit 1
fi

# List Convex functions
echo -e "${BLUE}📁 Convex functions found:${NC}"
find convex -name "*.ts" -not -path "convex/_generated/*" -not -path "convex/seed/*" | while read file; do
    echo "  - $(basename "$file" .ts)"
done

if [ "$SKIP_DEPLOY" != "true" ]; then
    echo -e "${BLUE}🚀 Deploying to Convex...${NC}"
    
    # Deploy schema and functions
    if npx convex dev --once --typecheck enable; then
        echo -e "${GREEN}✅ Convex deployment successful!${NC}"
    else
        echo -e "${RED}❌ Convex deployment failed${NC}"
        echo "Check the error messages above and try again"
        exit 1
    fi
    
    # Check if deployment URL is available
    if [ -n "$NEXT_PUBLIC_CONVEX_URL" ]; then
        echo -e "${GREEN}✅ Deployment URL: $NEXT_PUBLIC_CONVEX_URL${NC}"
    else
        echo -e "${YELLOW}⚠️  Note: Update your NEXT_PUBLIC_CONVEX_URL in .env.local${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipped deployment${NC}"
fi

# Ask about seeding
echo
echo -e "${BLUE}🌱 Database Seeding Options:${NC}"
echo "1. Full seed (complete sample data)"
echo "2. Quick seed (minimal test data)"
echo "3. Skip seeding"
read -p "Choose seeding option (1-3): " seed_choice

case $seed_choice in
    1)
        if [ "$SKIP_DEPLOY" != "true" ]; then
            echo -e "${BLUE}🌱 Running full database seed...${NC}"
            npx convex run seed/seedDatabase:seedDatabase
            echo -e "${GREEN}✅ Database seeded with full sample data!${NC}"
        else
            echo -e "${YELLOW}⚠️  Cannot seed without deployment${NC}"
        fi
        ;;
    2)
        if [ "$SKIP_DEPLOY" != "true" ]; then
            echo -e "${BLUE}🚀 Running quick database seed...${NC}"
            npx convex run seed/seedDatabase:quickSeed
            echo -e "${GREEN}✅ Database seeded with test data!${NC}"
        else
            echo -e "${YELLOW}⚠️  Cannot seed without deployment${NC}"
        fi
        ;;
    3)
        echo -e "${YELLOW}⏭️  Skipped seeding${NC}"
        ;;
    *)
        echo -e "${YELLOW}⚠️  Invalid choice, skipping seeding${NC}"
        ;;
esac

echo
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "======================================="
echo
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Start the development servers:"
echo "   ${YELLOW}npm run dev:with-convex${NC}"
echo
echo "2. Or run them separately:"
echo "   ${YELLOW}npm run convex:dev${NC}  (in one terminal)"
echo "   ${YELLOW}npm run dev${NC}         (in another terminal)"
echo
echo "3. Open your browser to:"
echo "   ${YELLOW}http://localhost:3000${NC}"
echo
echo "4. Monitor Convex dashboard at:"
echo "   ${YELLOW}https://dashboard.convex.dev${NC}"
echo

if [ "$SKIP_DEPLOY" = "true" ]; then
    echo -e "${YELLOW}📝 Remember to:${NC}"
    echo "- Set up your Convex deployment"
    echo "- Add CONVEX_DEPLOY_KEY to .env.local"
    echo "- Add NEXT_PUBLIC_CONVEX_URL to .env.local"
    echo "- Run this script again to deploy"
fi

echo -e "${GREEN}Happy coding! 🚀${NC}"
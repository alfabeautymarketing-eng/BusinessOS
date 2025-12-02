#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

ts=$(date +"%Y%m%d-%H%M%S")

echo -e "${BLUE}🔧 Preparing deployment...${NC}"

# Add changes
git add .

# Commit
echo -e "${BLUE}📝 Committing changes...${NC}"
git commit -m "auto: update $ts" || echo "⚠️  No changes to commit"

# Push (requires remote to be set)
echo -e "${BLUE}⬆️  Pushing to GitHub...${NC}"
# Check if remote exists
if git remote get-url origin > /dev/null 2>&1; then
    git push origin main
    echo -e "${GREEN}✅ Pushed to GitHub${NC}"
else
    echo -e "⚠️  No remote 'origin' found. Please add it with:"
    echo -e "   git remote add origin <your-repo-url>"
fi

echo -e "${GREEN}✅ Deployment script finished.${NC}"


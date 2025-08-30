#!/bin/bash
# ========================================
# 🚀 SAFE DEPLOYMENT UPLOAD SCRIPT
# ========================================
# Usage: ./safe_upload.sh user@vps-ip /remote/path

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if parameters provided
if [ $# -ne 2 ]; then
    echo -e "${RED}Usage: $0 user@vps-ip /remote/path${NC}"
    echo -e "${YELLOW}Example: $0 root@192.168.1.100 /var/www/hotel${NC}"
    exit 1
fi

VPS_USER_HOST=$1
REMOTE_PATH=$2

echo -e "${BLUE}🚀 Starting safe deployment upload...${NC}"
echo -e "${YELLOW}VPS: $VPS_USER_HOST${NC}"
echo -e "${YELLOW}Remote Path: $REMOTE_PATH${NC}"

# Create exclude file for rsync
cat > .rsync_exclude << EOF
# Exclude development files
venv_py311/
.venv/
venv/
node_modules/
fe/node_modules/
__pycache__/
*.pyc
*.log
logs/
.git/
.vscode/
.idea/

# Exclude temporary files
*_backup.*
*_old.*
*_Real.*
*_test.*
*.tmp
*.bak

# Exclude local databases
*.db
*.sqlite
local_test.db

# Exclude environment files
.env
.env.local

# Exclude uploads (will be created on server)
uploads/
backend/uploads/tenant_*/

# Exclude build artifacts
dist/
fe/dist/
.cache/

# Exclude documentation
DEPLOYMENT_READY.md
cleanup_for_deploy.ps1
.deployignore
.rsync_exclude
EOF

echo -e "${GREEN}📁 Files to be uploaded:${NC}"
rsync -avz --dry-run --exclude-from=.rsync_exclude . $VPS_USER_HOST:$REMOTE_PATH | grep -v "^receiving\|^sent\|^total\|^$"

echo -e "${YELLOW}Press Enter to continue with upload, or Ctrl+C to cancel...${NC}"
read

echo -e "${BLUE}🔄 Uploading files to VPS...${NC}"
rsync -avz --progress --exclude-from=.rsync_exclude . $VPS_USER_HOST:$REMOTE_PATH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Upload completed successfully!${NC}"
    
    echo -e "${BLUE}🔧 Setting permissions on VPS...${NC}"
    ssh $VPS_USER_HOST "cd $REMOTE_PATH && chmod +x backend/*.sh"
    
    echo -e "${GREEN}📋 Next steps:${NC}"
    echo -e "${YELLOW}1. SSH to VPS: ssh $VPS_USER_HOST${NC}"
    echo -e "${YELLOW}2. Go to project: cd $REMOTE_PATH${NC}"
    echo -e "${YELLOW}3. Run deployment: ./backend/deploy_all.sh${NC}"
    echo -e "${YELLOW}4. Setup SSL: ./backend/setup_ssl_zalominiapp.sh${NC}"
    
else
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
fi

# Clean up
rm -f .rsync_exclude

echo -e "${GREEN}🎉 Deployment upload completed!${NC}"

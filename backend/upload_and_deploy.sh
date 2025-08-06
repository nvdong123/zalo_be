#!/bin/bash
# Upload and Deploy Script for bookingservices.io.vn
# Run this script from your local machine

echo "🚀 Upload & Deploy to bookingservices.io.vn"
echo "=========================================="

# Your VPS Configuration
VPS_IP="157.10.199.22"
VPS_USER="root"
VPS_PASS="NA73eS@UHtPq"
DOMAIN="bookingservices.io.vn"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}📋 Target Configuration:${NC}"
echo "   VPS IP: $VPS_IP"
echo "   User: $VPS_USER"
echo "   Domain: $DOMAIN"
echo ""

# Check if we have the backend directory
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Backend directory not found!${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo -e "${BLUE}📦 Step 1: Preparing files for upload...${NC}"

# Create a deployment package
echo "Creating deployment package..."
tar -czf hotel-backend-deploy.tar.gz backend/

echo -e "${GREEN}✅ Deployment package created: hotel-backend-deploy.tar.gz${NC}"

# Upload to VPS
echo -e "${BLUE}📤 Step 2: Uploading to VPS...${NC}"

# Method 1: Using scp (recommended)
echo "Uploading files via SCP..."
scp -o StrictHostKeyChecking=no hotel-backend-deploy.tar.gz $VPS_USER@$VPS_IP:/tmp/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Files uploaded successfully${NC}"
else
    echo -e "${RED}❌ Upload failed${NC}"
    echo "Please check your connection and credentials"
    exit 1
fi

# Connect and deploy
echo -e "${BLUE}🚀 Step 3: Connecting to VPS and deploying...${NC}"

# Create deployment script
cat > deploy_remote.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting deployment on VPS..."

# Extract files
cd /tmp
tar -xzf hotel-backend-deploy.tar.gz
cd backend

# Make deployment script executable
chmod +x deploy_bookingservices.sh

# Run deployment
./deploy_bookingservices.sh

echo "✅ Deployment completed!"
EOF

# Upload and execute deployment script
scp -o StrictHostKeyChecking=no deploy_remote.sh $VPS_USER@$VPS_IP:/tmp/
ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "chmod +x /tmp/deploy_remote.sh && /tmp/deploy_remote.sh"

# Cleanup
rm -f hotel-backend-deploy.tar.gz deploy_remote.sh

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT PROCESS COMPLETED!${NC}"
echo ""
echo -e "${YELLOW}📋 Your application should now be available at:${NC}"
echo "   • Website: https://$DOMAIN"
echo "   • API: https://$DOMAIN/api/v1/"
echo "   • Documentation: https://$DOMAIN/docs"
echo "   • Health check: https://$DOMAIN/health"
echo ""
echo -e "${YELLOW}🔧 To check status on VPS:${NC}"
echo "   ssh $VPS_USER@$VPS_IP"
echo "   sudo systemctl status hotel-backend"
echo "   sudo journalctl -u hotel-backend -f"
echo ""
echo -e "${YELLOW}🔍 Testing endpoints:${NC}"
echo "   curl https://$DOMAIN/health"
echo "   curl https://$DOMAIN/api/v1/"
echo ""
echo -e "${GREEN}✨ Your Hotel Management Backend is now live!${NC}"

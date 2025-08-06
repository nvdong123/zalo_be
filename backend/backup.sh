#!/bin/bash
# Database Backup Script for Hotel Management Backend

# Configuration
BACKUP_DIR="/var/backups/hotel-backend"
DATE=$(date +%Y%m%d_%H%M%S)
MYSQL_HOST="localhost"
MYSQL_USER="bookingservices_admin"
MYSQL_PASS="BookingSecure2025!@#Local"
MYSQL_DB="bookingservicesiovn_zalominidb"
RETENTION_DAYS=7

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🗄️  Starting database backup...${NC}"

# Create backup directory
sudo mkdir -p $BACKUP_DIR
cd $BACKUP_DIR

# Create database backup
echo -e "${YELLOW}📦 Creating database backup...${NC}"
mysqldump -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASS $MYSQL_DB > backup_$DATE.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database backup created: backup_$DATE.sql${NC}"
    
    # Compress backup
    gzip backup_$DATE.sql
    echo -e "${GREEN}✅ Backup compressed: backup_$DATE.sql.gz${NC}"
    
    # Set permissions
    sudo chown hotelapp:hotelapp backup_$DATE.sql.gz
    sudo chmod 600 backup_$DATE.sql.gz
    
    # Create application files backup
    echo -e "${YELLOW}📁 Creating application files backup...${NC}"
    sudo tar -czf app_backup_$DATE.tar.gz -C /var/www/hotel-backend .
    sudo tar -czf uploads_backup_$DATE.tar.gz -C /var/www/uploads .
    
    echo -e "${GREEN}✅ Application backup created: app_backup_$DATE.tar.gz${NC}"
    echo -e "${GREEN}✅ Uploads backup created: uploads_backup_$DATE.tar.gz${NC}"
    
    # Remove old backups (older than retention period)
    echo -e "${YELLOW}🧹 Cleaning old backups...${NC}"
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
    find $BACKUP_DIR -name "uploads_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
    
    echo -e "${GREEN}✅ Backup completed successfully!${NC}"
    echo -e "${YELLOW}📊 Backup summary:${NC}"
    ls -lh $BACKUP_DIR/*$DATE*
    
else
    echo -e "${RED}❌ Database backup failed!${NC}"
    exit 1
fi

# Optional: Upload to cloud storage (uncomment and configure)
# echo -e "${YELLOW}☁️  Uploading to cloud storage...${NC}"
# aws s3 cp backup_$DATE.sql.gz s3://your-backup-bucket/hotel-backend/
# aws s3 cp app_backup_$DATE.tar.gz s3://your-backup-bucket/hotel-backend/
# aws s3 cp uploads_backup_$DATE.tar.gz s3://your-backup-bucket/hotel-backend/

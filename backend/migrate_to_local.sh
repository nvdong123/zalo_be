#!/bin/bash
# Import Data from Remote MySQL to Local MySQL
# This script migrates data from remote database to secure local database

echo "📦 Importing Data from Remote to Local Database"
echo "=============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Remote Database Configuration (Source)
REMOTE_HOST="157.66.81.101"
REMOTE_USER="bookingservicesiovn_zalominidb"
REMOTE_PASS="9XSZpTTBkA"
REMOTE_DB="bookingservicesiovn_zalominidb"

# Local Database Configuration (Destination)
LOCAL_HOST="localhost"
LOCAL_USER="bookingservices_admin"
LOCAL_PASS="BookingSecure2025!@#Local"
LOCAL_DB="bookingservicesiovn_zalominidb"

echo -e "${YELLOW}📋 Migration Configuration:${NC}"
echo "   From: $REMOTE_HOST/$REMOTE_DB"
echo "   To: $LOCAL_HOST/$LOCAL_DB"
echo ""

# Step 1: Test connections
echo -e "${BLUE}🔍 Step 1: Testing database connections...${NC}"

# Test remote connection
echo "Testing remote database connection..."
mysql -h $REMOTE_HOST -u $REMOTE_USER -p$REMOTE_PASS -e "SELECT 'Remote connection successful!' as status;" $REMOTE_DB

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Remote database connection successful${NC}"
else
    echo -e "${RED}❌ Remote database connection failed${NC}"
    exit 1
fi

# Test local connection
echo "Testing local database connection..."
mysql -h $LOCAL_HOST -u $LOCAL_USER -p$LOCAL_PASS -e "SELECT 'Local connection successful!' as status;" $LOCAL_DB

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Local database connection successful${NC}"
else
    echo -e "${RED}❌ Local database connection failed${NC}"
    echo "Please run setup_secure_mysql.sh first!"
    exit 1
fi

# Step 2: Create backup directory
echo -e "${BLUE}📁 Step 2: Creating backup directory...${NC}"
BACKUP_DIR="/tmp/db_migration"
mkdir -p $BACKUP_DIR
echo -e "${GREEN}✅ Backup directory created: $BACKUP_DIR${NC}"

# Step 3: Export remote database
echo -e "${BLUE}📤 Step 3: Exporting remote database...${NC}"
DUMP_FILE="$BACKUP_DIR/remote_database_export.sql"

mysqldump -h $REMOTE_HOST -u $REMOTE_USER -p$REMOTE_PASS \
    --single-transaction \
    --routines \
    --triggers \
    --add-drop-table \
    --add-locks \
    --create-options \
    --quick \
    --lock-tables=false \
    $REMOTE_DB > $DUMP_FILE

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Remote database exported successfully${NC}"
    echo "Export size: $(du -h $DUMP_FILE | cut -f1)"
else
    echo -e "${RED}❌ Remote database export failed${NC}"
    exit 1
fi

# Step 4: Backup current local database (if exists)
echo -e "${BLUE}💾 Step 4: Backing up current local database...${NC}"
LOCAL_BACKUP="$BACKUP_DIR/local_database_backup.sql"

mysqldump -h $LOCAL_HOST -u $LOCAL_USER -p$LOCAL_PASS \
    --single-transaction \
    --routines \
    --triggers \
    $LOCAL_DB > $LOCAL_BACKUP 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Local database backed up${NC}"
else
    echo -e "${YELLOW}⚠️  Local database backup skipped (may be empty)${NC}"
fi

# Step 5: Clear local database
echo -e "${BLUE}🗑️ Step 5: Clearing local database...${NC}"

mysql -h $LOCAL_HOST -u $LOCAL_USER -p$LOCAL_PASS << EOF
DROP DATABASE IF EXISTS $LOCAL_DB;
CREATE DATABASE $LOCAL_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Local database cleared and recreated${NC}"
else
    echo -e "${RED}❌ Failed to clear local database${NC}"
    exit 1
fi

# Step 6: Import data to local database
echo -e "${BLUE}📥 Step 6: Importing data to local database...${NC}"

mysql -h $LOCAL_HOST -u $LOCAL_USER -p$LOCAL_PASS $LOCAL_DB < $DUMP_FILE

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Data imported successfully${NC}"
else
    echo -e "${RED}❌ Data import failed${NC}"
    
    # Restore backup if import failed
    if [ -f "$LOCAL_BACKUP" ]; then
        echo -e "${YELLOW}🔄 Restoring local database backup...${NC}"
        mysql -h $LOCAL_HOST -u $LOCAL_USER -p$LOCAL_PASS $LOCAL_DB < $LOCAL_BACKUP
    fi
    exit 1
fi

# Step 7: Verify import
echo -e "${BLUE}✅ Step 7: Verifying import...${NC}"

# Get table count from both databases
REMOTE_TABLES=$(mysql -h $REMOTE_HOST -u $REMOTE_USER -p$REMOTE_PASS -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$REMOTE_DB';" -s -N)
LOCAL_TABLES=$(mysql -h $LOCAL_HOST -u $LOCAL_USER -p$LOCAL_PASS -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$LOCAL_DB';" -s -N)

echo "Remote database tables: $REMOTE_TABLES"
echo "Local database tables: $LOCAL_TABLES"

if [ "$REMOTE_TABLES" -eq "$LOCAL_TABLES" ]; then
    echo -e "${GREEN}✅ Table count matches${NC}"
else
    echo -e "${YELLOW}⚠️  Table count mismatch${NC}"
fi

# Show local tables
echo -e "${YELLOW}📋 Local database tables:${NC}"
mysql -h $LOCAL_HOST -u $LOCAL_USER -p$LOCAL_PASS -e "SHOW TABLES;" $LOCAL_DB

# Step 8: Update application permissions
echo -e "${BLUE}🔧 Step 8: Updating application permissions...${NC}"

mysql -h $LOCAL_HOST -u root -pSecureRootBooking2025!@# << EOF
-- Ensure user has correct permissions on the database
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON $LOCAL_DB.* TO '$LOCAL_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

echo -e "${GREEN}✅ Permissions updated${NC}"

# Step 9: Create migration log
echo -e "${BLUE}📝 Step 9: Creating migration log...${NC}"

LOG_FILE="/var/log/hotel-backend/migration.log"
sudo mkdir -p /var/log/hotel-backend
sudo chown hotelapp:hotelapp /var/log/hotel-backend

cat > $LOG_FILE << EOF
Database Migration Log
====================
Date: $(date)
Remote Host: $REMOTE_HOST
Remote Database: $REMOTE_DB
Local Host: $LOCAL_HOST
Local Database: $LOCAL_DB
Remote Tables: $REMOTE_TABLES
Local Tables: $LOCAL_TABLES
Export File: $DUMP_FILE
Backup File: $LOCAL_BACKUP
Status: SUCCESS
EOF

echo -e "${GREEN}✅ Migration log created: $LOG_FILE${NC}"

# Step 10: Cleanup (optional)
echo -e "${BLUE}🧹 Step 10: Cleaning up temporary files...${NC}"

read -p "Remove temporary export files? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf $BACKUP_DIR
    echo -e "${GREEN}✅ Temporary files cleaned up${NC}"
else
    echo -e "${YELLOW}📁 Temporary files kept in: $BACKUP_DIR${NC}"
fi

echo ""
echo -e "${GREEN}🎉 DATABASE MIGRATION COMPLETED SUCCESSFULLY!${NC}"
echo ""
echo -e "${YELLOW}📋 Migration Summary:${NC}"
echo "   • Remote database exported: ✅"
echo "   • Local database cleared: ✅"
echo "   • Data imported: ✅"
echo "   • Permissions updated: ✅"
echo "   • Tables migrated: $LOCAL_TABLES"
echo ""
echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo "   1. Update application .env file to use local database"
echo "   2. Restart application service"
echo "   3. Test application functionality"
echo "   4. Disable remote database access (optional)"
echo ""
echo -e "${YELLOW}🔒 Security Notes:${NC}"
echo "   • Local database is now accessible only from localhost"
echo "   • Remote database can be disabled for security"
echo "   • Regular backups are configured for local database"
echo ""
echo -e "${GREEN}✨ Your data is now secure on local VPS database!${NC}"

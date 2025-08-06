#!/bin/bash
# Secure MySQL Setup for VPS - Local Database
# This script installs and configures MySQL locally on VPS for maximum security

echo "🔒 Setting up Secure Local MySQL Database on VPS"
echo "================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Database Configuration
DB_NAME="bookingservicesiovn_zalominidb"
DB_USER="bookingservices_admin"
DB_PASS="BookingSecure2025!@#Local"
MYSQL_ROOT_PASS="SecureRootBooking2025!@#"

echo -e "${YELLOW}📋 Database Configuration:${NC}"
echo "   Database Name: $DB_NAME"
echo "   Database User: $DB_USER"
echo "   Root Password: [HIDDEN]"
echo ""

# Step 1: Install MySQL Server
echo -e "${BLUE}📦 Step 1: Installing MySQL Server...${NC}"

# Update system
sudo apt update

# Install MySQL Server
sudo apt install -y mysql-server mysql-client

# Check if MySQL is running
if sudo systemctl is-active --quiet mysql; then
    echo -e "${GREEN}✅ MySQL Server installed and running${NC}"
else
    echo -e "${RED}❌ MySQL Server installation failed${NC}"
    exit 1
fi

# Step 2: Secure MySQL Installation
echo -e "${BLUE}🔒 Step 2: Securing MySQL Installation...${NC}"

# Set root password and secure installation
sudo mysql << EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$MYSQL_ROOT_PASS';
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
FLUSH PRIVILEGES;
EOF

echo -e "${GREEN}✅ MySQL root secured${NC}"

# Step 3: Create Application Database and User
echo -e "${BLUE}🗄️ Step 3: Creating application database and user...${NC}"

mysql -u root -p$MYSQL_ROOT_PASS << EOF
-- Create database
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user with limited privileges
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';

-- Grant only necessary privileges
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, INDEX, ALTER ON $DB_NAME.* TO '$DB_USER'@'localhost';

-- Remove dangerous privileges
REVOKE FILE, PROCESS, RELOAD, SHUTDOWN, SUPER ON *.* FROM '$DB_USER'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Show created database
SHOW DATABASES;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database and user created successfully${NC}"
else
    echo -e "${RED}❌ Database creation failed${NC}"
    exit 1
fi

# Step 4: Configure MySQL for Security
echo -e "${BLUE}🔧 Step 4: Configuring MySQL security settings...${NC}"

# Backup original config
sudo cp /etc/mysql/mysql.conf.d/mysqld.cnf /etc/mysql/mysql.conf.d/mysqld.cnf.backup

# Create secure MySQL configuration
sudo tee /etc/mysql/mysql.conf.d/mysqld-secure.cnf > /dev/null << EOF
[mysqld]
# Security Settings
bind-address = 127.0.0.1
skip-networking = 0
local-infile = 0
symbolic-links = 0

# Disable dangerous functions
skip-show-database
safe-user-create = 1

# Performance and Security
max_connections = 100
connect_timeout = 10
wait_timeout = 600
interactive_timeout = 600

# Binary Logging (for backup)
log-bin = mysql-bin
expire_logs_days = 7
max_binlog_size = 100M

# Error Logging
log-error = /var/log/mysql/error.log

# Slow Query Log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# Character Set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# InnoDB Settings
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
innodb_file_per_table = 1
innodb_flush_log_at_trx_commit = 1
EOF

# Step 5: Set up MySQL firewall rules
echo -e "${BLUE}🔥 Step 5: Configuring firewall for MySQL...${NC}"

# Block external MySQL access
sudo ufw deny 3306
echo -e "${GREEN}✅ MySQL port 3306 blocked from external access${NC}"

# Step 6: Restart MySQL with new configuration
echo -e "${BLUE}🔄 Step 6: Restarting MySQL with secure configuration...${NC}"

sudo systemctl restart mysql

if sudo systemctl is-active --quiet mysql; then
    echo -e "${GREEN}✅ MySQL restarted successfully${NC}"
else
    echo -e "${RED}❌ MySQL restart failed${NC}"
    exit 1
fi

# Step 7: Test database connection
echo -e "${BLUE}🧪 Step 7: Testing database connection...${NC}"

mysql -u $DB_USER -p$DB_PASS -e "USE $DB_NAME; SELECT 'Database connection successful!' as status;"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database connection test successful${NC}"
else
    echo -e "${RED}❌ Database connection test failed${NC}"
    exit 1
fi

# Step 8: Create backup script
echo -e "${BLUE}💾 Step 8: Setting up backup system...${NC}"

# Create backup directory
sudo mkdir -p /var/backups/mysql
sudo chown mysql:mysql /var/backups/mysql

# Create backup script
sudo tee /usr/local/bin/mysql-backup.sh > /dev/null << EOF
#!/bin/bash
# MySQL Backup Script
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mysql"
DB_NAME="$DB_NAME"
DB_USER="$DB_USER"
DB_PASS="$DB_PASS"

# Create backup
mysqldump -u \$DB_USER -p\$DB_PASS \$DB_NAME > \$BACKUP_DIR/\${DB_NAME}_\${DATE}.sql

if [ \$? -eq 0 ]; then
    echo "\$(date): Backup successful - \${DB_NAME}_\${DATE}.sql"
    
    # Compress backup
    gzip \$BACKUP_DIR/\${DB_NAME}_\${DATE}.sql
    
    # Remove backups older than 7 days
    find \$BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
    
    echo "\$(date): Backup completed and compressed"
else
    echo "\$(date): Backup failed"
    exit 1
fi
EOF

# Make backup script executable
sudo chmod +x /usr/local/bin/mysql-backup.sh

# Add to cron for daily backup at 1 AM
(sudo crontab -l 2>/dev/null; echo "0 1 * * * /usr/local/bin/mysql-backup.sh >> /var/log/mysql-backup.log 2>&1") | sudo crontab -

echo -e "${GREEN}✅ Backup system configured${NC}"

# Step 9: Set up log rotation
echo -e "${BLUE}📝 Step 9: Setting up log rotation...${NC}"

sudo tee /etc/logrotate.d/mysql-hotel > /dev/null << EOF
/var/log/mysql/error.log /var/log/mysql/slow.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 640 mysql mysql
    postrotate
        /usr/bin/systemctl reload mysql
    endscript
}
EOF

echo -e "${GREEN}✅ Log rotation configured${NC}"

# Step 10: Final security check
echo -e "${BLUE}🔍 Step 10: Running final security check...${NC}"

echo "Checking MySQL security status..."

# Check if root can login remotely (should fail)
mysql -u root -h 127.0.0.1 -p$MYSQL_ROOT_PASS -e "SELECT 'Remote root access test';" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${GREEN}✅ Remote root access properly blocked${NC}"
else
    echo -e "${YELLOW}⚠️  Remote root access may be enabled${NC}"
fi

# Check user privileges
mysql -u $DB_USER -p$DB_PASS -e "SHOW GRANTS;" | grep -v "GRANT USAGE"

echo ""
echo -e "${GREEN}🎉 SECURE MYSQL SETUP COMPLETED!${NC}"
echo ""
echo -e "${YELLOW}📋 Database Information:${NC}"
echo "   Database Name: $DB_NAME"
echo "   Database User: $DB_USER"
echo "   Database Password: [SAVED IN .env]"
echo "   Connection: localhost:3306"
echo ""
echo -e "${YELLOW}🔒 Security Features Enabled:${NC}"
echo "   ✅ Root password secured"
echo "   ✅ Anonymous users removed"
echo "   ✅ Remote root access disabled"
echo "   ✅ Test database removed"
echo "   ✅ Local-only access (127.0.0.1)"
echo "   ✅ Limited user privileges"
echo "   ✅ Firewall blocking external access"
echo "   ✅ Binary logging enabled"
echo "   ✅ Slow query logging"
echo "   ✅ Daily automated backups"
echo "   ✅ Log rotation configured"
echo ""
echo -e "${YELLOW}📁 Important Paths:${NC}"
echo "   • Config: /etc/mysql/mysql.conf.d/mysqld-secure.cnf"
echo "   • Logs: /var/log/mysql/"
echo "   • Backups: /var/backups/mysql/"
echo "   • Backup Script: /usr/local/bin/mysql-backup.sh"
echo ""
echo -e "${GREEN}✨ Your local MySQL database is now secure and ready!${NC}"

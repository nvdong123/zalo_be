#!/bin/bash
# Health Check and Auto-restart Script for Hotel Management Backend

# Configuration
SERVICE_NAME="hotel-backend"
CHECK_URL="http://localhost:8000/health"
LOG_FILE="/var/log/hotel-backend/health_check.log"
MAX_RETRIES=3
RETRY_DELAY=10

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | sudo tee -a $LOG_FILE
}

# Function to send alert (customize as needed)
send_alert() {
    local message="$1"
    log_message "ALERT: $message"
    
    # Example: Send email alert (configure postfix/sendmail)
    # echo "$message" | mail -s "Hotel Backend Alert" admin@yourdomain.com
    
    # Example: Send to Slack webhook
    # curl -X POST -H 'Content-type: application/json' \
    #   --data "{\"text\":\"$message\"}" \
    #   YOUR_SLACK_WEBHOOK_URL
    
    # Example: Send to Discord webhook
    # curl -H "Content-Type: application/json" \
    #   -d "{\"content\":\"$message\"}" \
    #   YOUR_DISCORD_WEBHOOK_URL
}

# Function to check service health
check_health() {
    local retry_count=0
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        # Check HTTP endpoint
        if curl -f -s --max-time 10 $CHECK_URL > /dev/null 2>&1; then
            return 0  # Success
        fi
        
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $MAX_RETRIES ]; then
            log_message "Health check failed (attempt $retry_count/$MAX_RETRIES), retrying in ${RETRY_DELAY}s..."
            sleep $RETRY_DELAY
        fi
    done
    
    return 1  # Failed
}

# Function to check system resources
check_resources() {
    # Check disk space
    local disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $disk_usage -gt 90 ]; then
        send_alert "High disk usage: ${disk_usage}% on $(hostname)"
    fi
    
    # Check memory usage
    local mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ $mem_usage -gt 90 ]; then
        send_alert "High memory usage: ${mem_usage}% on $(hostname)"
    fi
    
    # Check CPU load
    local cpu_load=$(uptime | awk -F'load average:' '{print $2}' | awk -F',' '{print $1}' | xargs)
    local cpu_cores=$(nproc)
    local cpu_threshold=$(echo "$cpu_cores * 2" | bc)
    
    if (( $(echo "$cpu_load > $cpu_threshold" | bc -l) )); then
        send_alert "High CPU load: $cpu_load (threshold: $cpu_threshold) on $(hostname)"
    fi
}

# Main health check
main() {
    log_message "Starting health check..."
    
    # Check if service is running
    if ! sudo systemctl is-active --quiet $SERVICE_NAME; then
        log_message "Service $SERVICE_NAME is not running!"
        send_alert "Service $SERVICE_NAME is not running on $(hostname)"
        
        log_message "Attempting to start service..."
        sudo systemctl start $SERVICE_NAME
        
        sleep 15  # Wait for service to start
        
        if sudo systemctl is-active --quiet $SERVICE_NAME; then
            log_message "Service $SERVICE_NAME started successfully"
            send_alert "Service $SERVICE_NAME was restarted on $(hostname)"
        else
            log_message "Failed to start service $SERVICE_NAME"
            send_alert "CRITICAL: Failed to restart service $SERVICE_NAME on $(hostname)"
            exit 1
        fi
    fi
    
    # Check application health endpoint
    if check_health; then
        log_message "Health check passed"
    else
        log_message "Health check failed after $MAX_RETRIES attempts"
        send_alert "Health check failed for $SERVICE_NAME on $(hostname)"
        
        log_message "Attempting to restart service..."
        sudo systemctl restart $SERVICE_NAME
        
        sleep 30  # Wait longer after restart
        
        if check_health; then
            log_message "Service restarted successfully, health check now passing"
            send_alert "Service $SERVICE_NAME was restarted successfully on $(hostname)"
        else
            log_message "CRITICAL: Service restart failed, health check still failing"
            send_alert "CRITICAL: Service $SERVICE_NAME restart failed on $(hostname)"
            exit 1
        fi
    fi
    
    # Check system resources
    check_resources
    
    log_message "Health check completed successfully"
}

# Run main function
main

# Exit with success
exit 0

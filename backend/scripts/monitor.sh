#!/bin/bash

# Monitoring Script for Nomagro Backend
# Checks application health and sends alerts if needed

set -e

APP_NAME="nomagro-backend"
HEALTH_URL="http://localhost:5000/health"
LOG_FILE="/var/log/nomagro/monitor.log"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
    echo -e "$1"
}

check_health() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        log_message "${GREEN}[OK]${NC} Application is healthy"
        return 0
    else
        log_message "${RED}[ERROR]${NC} Application health check failed (HTTP $response)"
        return 1
    fi
}

check_pm2() {
    local status=$(pm2 jlist | jq -r ".[0].pm2_env.status" 2>/dev/null || echo "unknown")
    
    if [ "$status" = "online" ]; then
        log_message "${GREEN}[OK]${NC} PM2 process is online"
        return 0
    else
        log_message "${RED}[ERROR]${NC} PM2 process status: $status"
        return 1
    fi
}

check_disk_space() {
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -lt 90 ]; then
        log_message "${GREEN}[OK]${NC} Disk usage: ${usage}%"
        return 0
    else
        log_message "${YELLOW}[WARNING]${NC} High disk usage: ${usage}%"
        return 1
    fi
}

check_memory() {
    local mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    if [ "$mem_usage" -lt 90 ]; then
        log_message "${GREEN}[OK]${NC} Memory usage: ${mem_usage}%"
        return 0
    else
        log_message "${YELLOW}[WARNING]${NC} High memory usage: ${mem_usage}%"
        return 1
    fi
}

restart_application() {
    log_message "${YELLOW}[ACTION]${NC} Restarting application..."
    pm2 restart $APP_NAME
    sleep 10
    
    if check_health; then
        log_message "${GREEN}[SUCCESS]${NC} Application restarted successfully"
        return 0
    else
        log_message "${RED}[FAILED]${NC} Application restart failed"
        return 1
    fi
}

# Main monitoring logic
log_message "${GREEN}[START]${NC} Starting health check..."

# Check PM2 status
if ! check_pm2; then
    log_message "${YELLOW}[ACTION]${NC} Attempting to restart PM2 process..."
    pm2 restart $APP_NAME
    sleep 5
fi

# Check application health
if ! check_health; then
    log_message "${YELLOW}[ACTION]${NC} Health check failed, attempting restart..."
    if ! restart_application; then
        log_message "${RED}[CRITICAL]${NC} Failed to restore application health"
        # Here you could send email/SMS alerts
        exit 1
    fi
fi

# Check system resources
check_disk_space
check_memory

# Log PM2 status
PM2_STATUS=$(pm2 jlist | jq -r '.[0] | {name: .name, status: .pm2_env.status, cpu: .monit.cpu, memory: .monit.memory}' 2>/dev/null || echo "PM2 status unavailable")
log_message "${GREEN}[INFO]${NC} PM2 Status: $PM2_STATUS"

log_message "${GREEN}[COMPLETE]${NC} Health check completed"
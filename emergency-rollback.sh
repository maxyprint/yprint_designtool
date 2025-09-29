#!/bin/bash

# 🔄 EMERGENCY ROLLBACK SCRIPT - AGENT 5: DEPLOYMENT COORDINATOR
#
# MISSION: Emergency rollback for JavaScript execution fix deployment
# TRIGGER: Critical issues detected in production
# SAFETY: Immediate restoration to previous working state

set -e

echo "🔄 EMERGENCY ROLLBACK INITIATED"
echo "================================"
echo "📅 Rollback Date: $(date)"
echo "🎯 Target: Restore previous stable state"
echo ""

# Configuration
BACKUP_DIR="/tmp/claude/deployment-backups"
ROLLBACK_LOG="/tmp/claude/rollback.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$ROLLBACK_LOG"
}

echo -e "${YELLOW}🔍 LOCATING BACKUP FILES${NC}"
log "ROLLBACK: Searching for backup files"

# Find latest backup files
latest_wc_backup=$(ls -t "$BACKUP_DIR"/class-octo-print-designer-wc-integration.php.backup.* 2>/dev/null | head -1)
latest_validation_backup=$(ls -t "$BACKUP_DIR"/class-validation-admin-interface.php.backup.* 2>/dev/null | head -1)

if [[ -z "$latest_wc_backup" ]]; then
    echo -e "${RED}❌ No WooCommerce integration backup found${NC}"
    log "ROLLBACK ERROR: No WooCommerce backup available"
    exit 1
fi

if [[ -z "$latest_validation_backup" ]]; then
    echo -e "${RED}❌ No validation interface backup found${NC}"
    log "ROLLBACK ERROR: No validation backup available"
    exit 1
fi

echo -e "${GREEN}✅ Backup files located:${NC}"
echo "  📄 WC Integration: $(basename "$latest_wc_backup")"
echo "  📄 Validation: $(basename "$latest_validation_backup")"
echo ""

echo -e "${YELLOW}🔄 RESTORING FILES${NC}"
log "ROLLBACK: Starting file restoration"

# Restore WooCommerce integration file
cp "$latest_wc_backup" "/workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php"
if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ WooCommerce integration file restored${NC}"
    log "ROLLBACK: WooCommerce integration file restored successfully"
else
    echo -e "${RED}❌ Failed to restore WooCommerce integration file${NC}"
    log "ROLLBACK ERROR: Failed to restore WooCommerce integration file"
    exit 1
fi

# Restore validation admin interface file
cp "$latest_validation_backup" "/workspaces/yprint_designtool/includes/class-validation-admin-interface.php"
if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ Validation admin interface file restored${NC}"
    log "ROLLBACK: Validation admin interface file restored successfully"
else
    echo -e "${RED}❌ Failed to restore validation admin interface file${NC}"
    log "ROLLBACK ERROR: Failed to restore validation admin interface file"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔍 VERIFYING RESTORATION${NC}"
log "ROLLBACK: Verifying file restoration"

# Verify files exist and are readable
if [[ -r "/workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php" ]]; then
    file_size=$(stat -c%s "/workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php")
    echo -e "${GREEN}✅ WooCommerce integration file verified (${file_size} bytes)${NC}"
    log "ROLLBACK: WooCommerce file verified, size: ${file_size} bytes"
else
    echo -e "${RED}❌ WooCommerce integration file verification failed${NC}"
    log "ROLLBACK ERROR: WooCommerce file verification failed"
    exit 1
fi

if [[ -r "/workspaces/yprint_designtool/includes/class-validation-admin-interface.php" ]]; then
    file_size=$(stat -c%s "/workspaces/yprint_designtool/includes/class-validation-admin-interface.php")
    echo -e "${GREEN}✅ Validation admin interface file verified (${file_size} bytes)${NC}"
    log "ROLLBACK: Validation file verified, size: ${file_size} bytes"
else
    echo -e "${RED}❌ Validation admin interface file verification failed${NC}"
    log "ROLLBACK ERROR: Validation file verification failed"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 EMERGENCY ROLLBACK COMPLETE${NC}"
echo "====================================="
echo ""
echo -e "${GREEN}📋 ROLLBACK SUMMARY:${NC}"
echo "  ✅ All files restored from backup"
echo "  ✅ File integrity verified"
echo "  ✅ System returned to previous state"
echo ""
echo -e "${YELLOW}📊 ROLLBACK DETAILS:${NC}"
echo "  • Backup source: $BACKUP_DIR"
echo "  • WC Integration: $(basename "$latest_wc_backup")"
echo "  • Validation Interface: $(basename "$latest_validation_backup")"
echo "  • Rollback time: $(date)"
echo ""
echo -e "${YELLOW}🔍 NEXT STEPS:${NC}"
echo "  1. Clear any browser/server caches"
echo "  2. Test Order 5374 functionality"
echo "  3. Monitor error logs for issues"
echo "  4. Investigate root cause of deployment failure"
echo ""

log "ROLLBACK COMPLETE: All files restored successfully"
echo -e "${GREEN}🔄 SYSTEM RESTORED TO PREVIOUS STABLE STATE${NC}"
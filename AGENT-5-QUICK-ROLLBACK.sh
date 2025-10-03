#!/bin/bash
#
# AGENT 5: PHP RENDERER OFFSET FIX - QUICK ROLLBACK SCRIPT
#
# Purpose: Instantly restore the original PHP file before offset fix was applied
# Usage: bash AGENT-5-QUICK-ROLLBACK.sh
# Risk: LOW - Simply restores backup file
#

echo "=========================================="
echo "🔄 PHP RENDERER OFFSET FIX - ROLLBACK"
echo "=========================================="
echo ""

BACKUP_FILE="/workspaces/yprint_designtool/includes/class-octo-print-api-integration.php.backup-pre-offset-fix-1759488230"
TARGET_FILE="/workspaces/yprint_designtool/includes/class-octo-print-api-integration.php"

# Check if backup exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ ERROR: Backup file not found at $BACKUP_FILE"
    exit 1
fi

# Create safety backup of current state (with offset fix)
SAFETY_BACKUP="${TARGET_FILE}.backup-with-offset-fix-$(date +%s)"
echo "📋 Creating safety backup of current state..."
cp "$TARGET_FILE" "$SAFETY_BACKUP"
echo "   ✅ Saved to: $SAFETY_BACKUP"
echo ""

# Restore original file
echo "🔄 Restoring original file from backup..."
cp "$BACKUP_FILE" "$TARGET_FILE"

# Validate PHP syntax
echo "🔍 Validating PHP syntax..."
if php -l "$TARGET_FILE" >/dev/null 2>&1; then
    echo "   ✅ Syntax valid"
else
    echo "   ❌ Syntax error detected!"
    echo "   🔄 Restoring offset fix version..."
    cp "$SAFETY_BACKUP" "$TARGET_FILE"
    echo "   ❌ Rollback failed - offset fix version restored"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ ROLLBACK COMPLETE"
echo "=========================================="
echo ""
echo "📊 Status:"
echo "   - Original file restored (no offset fix)"
echo "   - Offset fix version backed up to: $SAFETY_BACKUP"
echo "   - PHP syntax validated"
echo ""
echo "⚠️  Impact:"
echo "   - Old designs: Continue working (no change)"
echo "   - New designs: Will render 50px off (back to broken state)"
echo "   - No data loss or corruption"
echo ""
echo "🔄 To re-apply the fix:"
echo "   cp $SAFETY_BACKUP $TARGET_FILE"
echo ""
echo "📝 Monitor logs after rollback for any issues"
echo ""

# Optional: Clear OPCache if PHP extension is loaded
if php -m 2>/dev/null | grep -q "Zend OPcache"; then
    echo "🗑️  OPCache detected - attempting to clear..."
    php -r "if(function_exists('opcache_reset')){opcache_reset(); echo 'OPCache cleared';}" 2>/dev/null || echo "OPCache clear failed (may require restart)"
    echo ""
fi

echo "✅ Rollback completed successfully at $(date)"

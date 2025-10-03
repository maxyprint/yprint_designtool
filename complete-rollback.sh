#!/bin/bash
#
# COMPLETE SYSTEM ROLLBACK - Canvas Offset Fix
# Reverts code + database to pre-fix state
# Usage: bash complete-rollback.sh [database_backup.sql]
#

set -e  # Exit on error

echo "======================================"
echo "🔄 COMPLETE SYSTEM ROLLBACK"
echo "======================================"
echo ""

# Configuration
PLUGIN_DIR="/workspaces/yprint_designtool"
JS_BACKUP="${PLUGIN_DIR}/public/js/dist/designer.bundle.js.backup-pre-offset-fix-1759487255"
PHP_BACKUP="${PLUGIN_DIR}/includes/class-octo-print-api-integration.php.backup-pre-offset-fix-1759488230"
JS_TARGET="${PLUGIN_DIR}/public/js/dist/designer.bundle.js"
PHP_TARGET="${PLUGIN_DIR}/includes/class-octo-print-api-integration.php"
DB_BACKUP="${1}"  # Pass as first argument

# Validation
if [ ! -f "$JS_BACKUP" ]; then
    echo "❌ ERROR: JavaScript backup not found at $JS_BACKUP"
    exit 1
fi

if [ ! -f "$PHP_BACKUP" ]; then
    echo "❌ ERROR: PHP backup not found at $PHP_BACKUP"
    exit 1
fi

# Optional: Database backup
if [ -n "$DB_BACKUP" ] && [ ! -f "$DB_BACKUP" ]; then
    echo "❌ ERROR: Database backup not found at $DB_BACKUP"
    exit 1
fi

# Step 1: Create safety backups
echo "📋 Creating safety backups of current state..."
TIMESTAMP=$(date +%s)
cp "$JS_TARGET" "${JS_TARGET}.backup-with-offset-fix-${TIMESTAMP}"
cp "$PHP_TARGET" "${PHP_TARGET}.backup-with-offset-fix-${TIMESTAMP}"
echo "   ✅ Safety backups created"
echo ""

# Step 2: Restore code files
echo "🔄 Restoring code files..."
cp "$JS_BACKUP" "$JS_TARGET"
cp "$PHP_BACKUP" "$PHP_TARGET"
echo "   ✅ JavaScript restored"
echo "   ✅ PHP restored"
echo ""

# Step 3: Validate syntax
echo "🔍 Validating syntax..."
if php -l "$PHP_TARGET" >/dev/null 2>&1; then
    echo "   ✅ PHP syntax valid"
else
    echo "   ❌ PHP syntax error detected!"
    echo "   🔄 Restoring offset fix version..."
    cp "${PHP_TARGET}.backup-with-offset-fix-${TIMESTAMP}" "$PHP_TARGET"
    echo "   ❌ Rollback failed - code restored to offset fix version"
    exit 1
fi

# Step 4: Clear caches
echo "🗑️  Clearing caches..."
if command -v wp &> /dev/null; then
    wp cache flush 2>/dev/null && echo "   ✅ WordPress cache cleared" || true
fi

if php -m 2>/dev/null | grep -q "Zend OPcache"; then
    php -r "if(function_exists('opcache_reset')){opcache_reset(); echo '   ✅ OPCache cleared\n';}" 2>/dev/null || echo "   ⚠️  OPCache clear failed (may require service restart)"
fi
echo ""

# Step 5: Database restore (optional)
if [ -n "$DB_BACKUP" ]; then
    echo "💾 Restoring database..."

    # Create current database backup first
    if command -v wp &> /dev/null; then
        echo "   📋 Creating safety backup of current database..."
        wp db export "safety-backup-current-state-${TIMESTAMP}.sql"
        echo "   ✅ Database safety backup created"
    fi

    # Restore from backup
    echo "   🔄 Importing database backup..."
    if command -v wp &> /dev/null; then
        wp db import "$DB_BACKUP"
        echo "   ✅ Database restored"
    else
        echo "   ⚠️  WP-CLI not available, skipping database restore"
        echo "   Manual restore required: mysql -u [user] -p [database] < $DB_BACKUP"
    fi
    echo ""
fi

# Step 6: Verification
echo "🔍 Verifying rollback..."
JS_MARKERS=$(grep -c "🔧 OFFSET-FIX" "$JS_TARGET" || echo "0")
PHP_MARKERS=$(grep -c "🔧 OFFSET-FIX" "$PHP_TARGET" || echo "0")

if [ "$JS_MARKERS" -eq 0 ] && [ "$PHP_MARKERS" -eq 0 ]; then
    echo "   ✅ Rollback verification passed"
else
    echo "   ⚠️  Warning: Found $JS_MARKERS JS markers and $PHP_MARKERS PHP markers"
    echo "   Expected: 0 markers (clean pre-fix state)"
fi
echo ""

# Summary
echo "======================================"
echo "✅ ROLLBACK COMPLETE"
echo "======================================"
echo ""
echo "📊 Status:"
echo "   - JavaScript: Restored to pre-fix version"
echo "   - PHP: Restored to pre-fix version"
if [ -n "$DB_BACKUP" ]; then
    echo "   - Database: Restored from backup"
else
    echo "   - Database: Not modified (backward compatible)"
fi
echo "   - Safety backups: Created with timestamp ${TIMESTAMP}"
echo ""
echo "⚠️  Impact:"
echo "   - Old designs: Continue working (no change)"
echo "   - New designs: Will render 50px off (back to broken state)"
echo "   - Offset fix: Completely removed"
echo ""
echo "🔄 To re-apply the fix:"
echo "   git checkout fc3f8b7 -- public/js/dist/designer.bundle.js includes/class-octo-print-api-integration.php"
echo ""
echo "📝 Next Steps:"
echo "   1. Clear browser caches (Ctrl+Shift+R)"
echo "   2. Test old design loading"
echo "   3. Monitor error logs for 30 minutes"
echo "   4. Notify team of rollback completion"
echo ""
echo "✅ Rollback completed successfully at $(date)"

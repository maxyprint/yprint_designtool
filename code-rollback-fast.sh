#!/bin/bash
#
# CODE-ONLY ROLLBACK (FAST) - Canvas Offset Fix
# Reverts ONLY JavaScript and PHP files (no database changes)
# Usage: bash code-rollback-fast.sh
#

set -e

echo "⚡ FAST CODE ROLLBACK - Canvas Offset Fix"
echo "=========================================="

# Restore files
cp public/js/dist/designer.bundle.js.backup-pre-offset-fix-1759487255 \
   public/js/dist/designer.bundle.js

cp includes/class-octo-print-api-integration.php.backup-pre-offset-fix-1759488230 \
   includes/class-octo-print-api-integration.php

# Validate
php -l includes/class-octo-print-api-integration.php >/dev/null 2>&1 && \
  echo "✅ PHP syntax valid" || (echo "❌ PHP syntax error!" && exit 1)

# Clear OPCache
php -r "if(function_exists('opcache_reset')){opcache_reset(); echo '✅ OPCache cleared\n';}" 2>/dev/null || \
  echo "⚠️  OPCache clear failed"

# Verification
MARKERS=$(grep -c "🔧 OFFSET-FIX" public/js/dist/designer.bundle.js || echo "0")
if [ "$MARKERS" -eq 0 ]; then
    echo "✅ Rollback complete ($(date))"
else
    echo "⚠️  Warning: Found $MARKERS OFFSET-FIX markers"
fi

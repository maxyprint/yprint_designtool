#!/bin/bash
#
# ROLLBACK VALIDATION SCRIPT
# Verifies rollback was successful
# Usage: bash validate-rollback.sh
#

echo "🔍 Rollback Validation"
echo "======================"
echo ""

PASS=0
FAIL=0

# Check 1: OFFSET-FIX markers removed
echo "✓ Checking for OFFSET-FIX markers..."
JS_MARKERS=$(grep -c "🔧 OFFSET-FIX" public/js/dist/designer.bundle.js || echo "0")
PHP_MARKERS=$(grep -c "🔧 OFFSET-FIX" includes/class-octo-print-api-integration.php || echo "0")

if [ "$JS_MARKERS" -eq 0 ] && [ "$PHP_MARKERS" -eq 0 ]; then
    echo "  ✅ PASS: No OFFSET-FIX markers found"
    ((PASS++))
else
    echo "  ❌ FAIL: Found $JS_MARKERS JS markers and $PHP_MARKERS PHP markers"
    ((FAIL++))
fi

# Check 2: getCanvasOffset function removed
echo "✓ Checking for getCanvasOffset function..."
OFFSET_FUNC=$(grep -c "getCanvasOffset" public/js/dist/designer.bundle.js || echo "0")

if [ "$OFFSET_FUNC" -eq 0 ]; then
    echo "  ✅ PASS: getCanvasOffset function removed"
    ((PASS++))
else
    echo "  ❌ FAIL: getCanvasOffset function still exists"
    ((FAIL++))
fi

# Check 3: PHP syntax validation
echo "✓ Validating PHP syntax..."
if php -l includes/class-octo-print-api-integration.php >/dev/null 2>&1; then
    echo "  ✅ PASS: PHP syntax valid"
    ((PASS++))
else
    echo "  ❌ FAIL: PHP syntax errors detected"
    ((FAIL++))
fi

# Check 4: File sizes match backups
echo "✓ Checking file sizes..."
JS_SIZE=$(stat -c%s public/js/dist/designer.bundle.js 2>/dev/null || stat -f%z public/js/dist/designer.bundle.js 2>/dev/null)
JS_BACKUP_SIZE=$(stat -c%s public/js/dist/designer.bundle.js.backup-pre-offset-fix-1759487255 2>/dev/null || stat -f%z public/js/dist/designer.bundle.js.backup-pre-offset-fix-1759487255 2>/dev/null)

if [ "$JS_SIZE" -eq "$JS_BACKUP_SIZE" ]; then
    echo "  ✅ PASS: JavaScript file size matches backup"
    ((PASS++))
else
    echo "  ❌ FAIL: JavaScript file size mismatch (current: $JS_SIZE, backup: $JS_BACKUP_SIZE)"
    ((FAIL++))
fi

# Check 5: Backup files exist
echo "✓ Checking backup files..."
if [ -f "public/js/dist/designer.bundle.js.backup-pre-offset-fix-1759487255" ] && \
   [ -f "includes/class-octo-print-api-integration.php.backup-pre-offset-fix-1759488230" ]; then
    echo "  ✅ PASS: Backup files exist"
    ((PASS++))
else
    echo "  ❌ FAIL: Backup files missing"
    ((FAIL++))
fi

# Summary
echo ""
echo "======================"
echo "📊 Validation Summary"
echo "======================"
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo ""

if [ "$FAIL" -eq 0 ]; then
    echo "🎉 All validation checks passed!"
    echo "✅ Rollback was successful"
    exit 0
else
    echo "⚠️  Some validation checks failed"
    echo "❌ Rollback may be incomplete"
    exit 1
fi

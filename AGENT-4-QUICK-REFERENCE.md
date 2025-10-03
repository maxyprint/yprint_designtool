# AGENT 4: Quick Reference Card

## 🎯 TL;DR

**Status**: Metadata ✅ | Renderer ❌
**Action**: Fix 1 PHP function
**Time**: 30 minutes
**Risk**: LOW

---

## ✅ What's Working

- Metadata saved to database ✅
- Metadata loaded from database ✅
- All AJAX endpoints preserve metadata ✅
- WooCommerce orders store metadata ✅

## ❌ What Needs Fixing

- PHP renderer (AllesKlarDruck API) doesn't check `metadata.offset_applied` flag
- Result: New designs print 50px off position

---

## 🔧 The Fix (Copy-Paste Ready)

**File**: `/workspaces/yprint_designtool/includes/class-octo-print-api-integration.php`
**Location**: After line 655 (after `$top_px = ...`)

```php
// 🔧 OFFSET-FIX: Handle new coordinate format
if (isset($transform_data['metadata']['offset_applied']) &&
    $transform_data['metadata']['offset_applied'] === true) {
    $offset_x = floatval($transform_data['metadata']['offset_x'] ?? 0);
    $offset_y = floatval($transform_data['metadata']['offset_y'] ?? 0);
    $left_px -= $offset_x;
    $top_px -= $offset_y;
}
```

---

## 🧪 Test Commands

### Backup First
```bash
cp includes/class-octo-print-api-integration.php \
   includes/class-octo-print-api-integration.php.backup
```

### Verify Syntax
```bash
php -l includes/class-octo-print-api-integration.php
```

### Test Old Design (Should NOT subtract offset)
- Load existing design
- Generate API preview
- Coordinates should be unchanged

### Test New Design (Should subtract offset)
- Create new design with offset metadata
- Generate API preview
- Coordinates should be 50px less than saved value

---

## 📋 Files Created

1. `AGENT-4-PHP-BACKEND-VALIDATION.json` - Full analysis (499 lines)
2. `AGENT-4-PHP-RENDERER-FIX-IMPLEMENTATION.md` - Implementation guide (315 lines)
3. `AGENT-4-EXECUTIVE-SUMMARY.md` - Executive overview
4. `AGENT-4-QUICK-REFERENCE.md` - This file

---

## 🚨 Deployment Blocker

**DO NOT DEPLOY** frontend offset fix without this PHP fix.
**Reason**: New designs will print incorrectly.

---

## 📞 Need Help?

1. Read: `AGENT-4-PHP-RENDERER-FIX-IMPLEMENTATION.md`
2. Review: `AGENT-4-PHP-BACKEND-VALIDATION.json`
3. Check logs: Look for "🔧 API RENDERER" messages

---

**Status**: Ready to implement
**Confidence**: HIGH (100% backward compatible)

# Agent 5: Verification Suite Documentation

## Canvas Offset Bug Fix - Testing & Monitoring Tools

**Version**: 1.0.0
**Date**: 2025-10-03
**Architecture**: A (MINIMAL FIX)
**Agent**: 5 of 7

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Command Reference](#command-reference)
4. [Usage Examples](#usage-examples)
5. [Expected Outputs](#expected-outputs)
6. [Success Criteria](#success-criteria)
7. [Troubleshooting](#troubleshooting)
8. [Integration with Deployment](#integration-with-deployment)

---

## Overview

The Verification Suite provides comprehensive testing and monitoring tools for the canvas offset bug fix. It enables:

- **Pre-deployment analysis**: Count designs by offset type
- **Post-deployment verification**: Validate migration success
- **Runtime monitoring**: Track new design creation
- **Integration testing**: Full save/load/API cycle validation
- **Visual auditing**: Sample-based manual verification

### Design Types

After the fix deployment, designs fall into these categories:

| Type | Offset | Description | Status |
|------|--------|-------------|--------|
| **Type A** | 50px | Desktop designs (CSS padding) | Will be migrated |
| **Type B** | 26.1px | Legacy mobile designs | Legacy (rare) |
| **Type C** | 0px | New designs (post-fix) | Correct |
| **Unknown** | N/A | Cannot determine | Needs investigation |

---

## Installation

### 1. Copy Verification Suite

The file is located at:
```
/workspaces/yprint_designtool/verification-suite.php
```

### 2. Load in WordPress

The file automatically loads when WP-CLI is available. No additional configuration needed.

### 3. Verify Installation

```bash
wp offset-verify --help
```

Expected output:
```
NAME

  wp offset-verify

DESCRIPTION

  Verification and Testing Suite for Canvas Offset Fix

SUBCOMMANDS

  pre-migration       Count designs by type before deployment
  post-migration      Verify migration results after deployment
  monitor            Runtime monitoring of new design creation
  integration-test   Full integration test suite
  sample-audit       Sample-based visual validation
```

---

## Command Reference

### 1. Pre-Migration Verification

**Command**: `wp offset-verify pre-migration`

**Purpose**: Analyze existing designs before deployment

**Options**:
- `--format=<format>`: Output format (table, json, csv). Default: table
- `--export=<file>`: Export results to JSON file
- `--verbose`: Show detailed breakdown per design

**When to Use**:
- Before deploying the offset fix
- To understand migration scope
- To estimate impact

---

### 2. Post-Migration Verification

**Command**: `wp offset-verify post-migration`

**Purpose**: Validate migration results after deployment

**Options**:
- `--since=<date>`: Check designs since date (YYYY-MM-DD)
- `--strict`: Fail on any anomaly (exit code 1)
- `--sample-size=<number>`: Designs to audit. Default: 10

**When to Use**:
- Immediately after deployment
- During post-deployment validation
- To detect anomalies

**Tests Performed**:
1. ✅ **TEST 1**: All NEW designs have `offset_x = 0, offset_y = 0`
2. ✅ **TEST 2**: OLD designs remain unchanged
3. ✅ **TEST 3**: Migration flags set correctly

---

### 3. Runtime Monitoring

**Command**: `wp offset-verify monitor`

**Purpose**: Monitor new design creation in real-time

**Options**:
- `--hours=<number>`: Monitor last N hours. Default: 24
- `--watch`: Continuous monitoring mode (5-minute intervals)
- `--alert-webhook=<url>`: Send alerts to webhook if anomalies found

**When to Use**:
- First 24-48 hours after deployment
- During high-traffic periods
- As part of monitoring dashboards

---

### 4. Integration Test

**Command**: `wp offset-verify integration-test`

**Purpose**: Full save/load/API cycle testing

**Options**:
- `--design-id=<id>`: Test specific design. Default: creates test design
- `--cleanup`: Remove test design after completion

**When to Use**:
- Pre-deployment on staging
- Post-deployment validation
- Regression testing

**Tests Performed**:
1. ✅ Design save/load cycle
2. ✅ Viewport changes (desktop → mobile)
3. ✅ API coordinate conversion (canvas → print)
4. ✅ Backward compatibility

---

### 5. Sample Audit

**Command**: `wp offset-verify sample-audit`

**Purpose**: Generate sample data for manual visual validation

**Options**:
- `--sample-size=<number>`: Number of designs. Default: 5
- `--export-dir=<path>`: Export directory. Default: /tmp

**When to Use**:
- Quality assurance testing
- Visual regression testing
- Customer-facing validation

---

## Usage Examples

### Example 1: Pre-Deployment Analysis

```bash
# Basic analysis
wp offset-verify pre-migration

# Detailed analysis with export
wp offset-verify pre-migration --verbose --export=pre-deploy-$(date +%Y%m%d).json

# JSON output for automation
wp offset-verify pre-migration --format=json > analysis.json
```

**Expected Output**:
```
═══════════════════════════════════════════════════════════════
  PRE-MIGRATION VERIFICATION - Design Type Analysis
═══════════════════════════════════════════════════════════════

📊 DESIGN TYPE BREAKDOWN:

  Total Designs:              150
  ├─ Type A (50px offset):    120  ← Desktop, needs migration
  ├─ Type B (26.1px offset):  5    ← Legacy mobile
  ├─ Type C (0px offset):     20   ← Already fixed
  └─ Unknown Type:            5

🎯 MIGRATION SCOPE:
  Designs to Migrate:         120 (80.0%)
  Already Migrated:           20 (13.3%)

Success: Results exported to: pre-deploy-20251003.json
Warning: 120 design(s) will be migrated. Ensure database backup!
```

---

### Example 2: Post-Deployment Validation

```bash
# Verify today's new designs
wp offset-verify post-migration

# Verify since deployment date (strict mode)
wp offset-verify post-migration --since=2025-10-01 --strict

# Sample audit (30 random designs)
wp offset-verify post-migration --sample-size=30
```

**Expected Output** (Success):
```
═══════════════════════════════════════════════════════════════
  POST-MIGRATION VERIFICATION - Migration Results
═══════════════════════════════════════════════════════════════

🔍 TEST 1: Verify NEW Designs (created since 2025-10-03)
   Expected: offset_x = 0, offset_y = 0 (CSS padding removed)

Success: ✅ TEST 1 PASSED: All 15 new design(s) have offset_x = 0, offset_y = 0

🔍 TEST 2: Verify OLD Designs (sample audit)
   Expected: No offset_applied metadata OR coordinates match original

Success: ✅ TEST 2 PASSED: All 10 sampled old design(s) unchanged

🔍 TEST 3: Verify Migration Flags
   Expected: offset_applied = true, offset_x and offset_y present

Success: ✅ TEST 3: 35 design(s) have valid migration flags

Success: 🎉 POST-MIGRATION VERIFICATION PASSED - No anomalies detected!

📈 SUMMARY: 3/3 tests passed
```

**Expected Output** (Failure):
```
🔍 TEST 1: Verify NEW Designs (created since 2025-10-03)
   Expected: offset_x = 0, offset_y = 0 (CSS padding removed)

Warning: ⚠️  TEST 1 FAILED: 2 design(s) have non-zero offsets!

🚨 ANOMALIES DETECTED:

+--------+----------------------+----------+----------+---------------------+
| test   | id                   | offset_x | offset_y | created_at          |
+--------+----------------------+----------+----------+---------------------+
| TEST 1 | 12345                | 50.0     | 50.0     | 2025-10-03 14:30:00 |
| TEST 1 | 12346                | 26.1     | 26.1     | 2025-10-03 14:32:00 |
+--------+----------------------+----------+----------+---------------------+

📈 SUMMARY: 2/3 tests passed

Error: Post-migration verification FAILED (strict mode)
```

---

### Example 3: Runtime Monitoring

```bash
# Monitor last 24 hours
wp offset-verify monitor

# Monitor last 1 hour (high-frequency check)
wp offset-verify monitor --hours=1

# Continuous monitoring with webhook alerts
wp offset-verify monitor --watch --alert-webhook=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**Expected Output**:
```
═══════════════════════════════════════════════════════════════
  RUNTIME MONITORING - Last 24 Hour(s)
  2025-10-03 15:45:30
═══════════════════════════════════════════════════════════════

📬 Found 8 new design(s)

📊 MONITORING STATISTICS:
  ├─ Total Designs:       8
  ├─ With Metadata:       8
  ├─ Zero Offset (✅):    8
  ├─ Non-Zero Offset (⚠️): 0
  └─ No Metadata:         0

Success: ✅ All new designs have correct offset values (0, 0)
```

---

### Example 4: Integration Testing

```bash
# Create and test new design (with cleanup)
wp offset-verify integration-test --cleanup

# Test specific existing design
wp offset-verify integration-test --design-id=12345

# Test without cleanup (keep test design)
wp offset-verify integration-test
```

**Expected Output**:
```
═══════════════════════════════════════════════════════════════
  INTEGRATION TEST - Full Save/Load/API Cycle
═══════════════════════════════════════════════════════════════

🧪 TEST 1: Design Save/Load Cycle
   Created test design ID: 99999
Success: ✅ Metadata correct: offset_x = 0, offset_y = 0

🧪 TEST 2: Viewport Changes (Desktop → Mobile)
   Expected: offset_x = 0 on mobile (no CSS padding)
Success: ✅ Viewport-independent offset (0, 0)

🧪 TEST 3: API Coordinate Conversion (Canvas → Print)
   Input: Canvas coordinates (100.00, 100.00)px
Success: ✅ Offset metadata available for PHP renderer

🧪 TEST 4: Backward Compatibility
Success: ✅ Old design has no offset metadata (backward compatible)

═══════════════════════════════════════════════════════════════
  TEST RESULTS
═══════════════════════════════════════════════════════════════

+--------------------------+--------+
| test                     | status |
+--------------------------+--------+
| Save/Load Cycle          | PASS   |
| Viewport Changes         | PASS   |
| API Conversion           | PASS   |
| Backward Compatibility   | PASS   |
+--------------------------+--------+

📈 SUMMARY: 4/4 tests passed

🧹 Cleaned up test design ID: 99999
Success: 🎉 INTEGRATION TEST PASSED!
```

---

### Example 5: Sample Audit

```bash
# Generate 5 random samples
wp offset-verify sample-audit

# Generate 20 samples with custom export directory
wp offset-verify sample-audit --sample-size=20 --export-dir=/var/www/html/audits
```

**Expected Output**:
```
═══════════════════════════════════════════════════════════════
  SAMPLE AUDIT - Visual Validation
═══════════════════════════════════════════════════════════════

📋 Selected 5 random design(s) for audit

+-------+---------------------+---------+--------------+----------+----------+----------------+
| ID    | Created             | Objects | Has Metadata | Offset X | Offset Y | Type           |
+-------+---------------------+---------+--------------+----------+----------+----------------+
| 10023 | 2025-09-15 10:30:00 | 3       | NO           | N/A      | N/A      | OLD (Pre-Fix)  |
| 10456 | 2025-09-28 14:20:00 | 2       | YES          | 50       | 50       | DESKTOP (50px) |
| 10789 | 2025-10-02 09:15:00 | 1       | YES          | 0        | 0        | NEW (Post-Fix) |
| 10890 | 2025-10-03 11:45:00 | 4       | YES          | 0        | 0        | NEW (Post-Fix) |
| 10912 | 2025-10-03 14:00:00 | 2       | YES          | 0        | 0        | NEW (Post-Fix) |
+-------+---------------------+---------+--------------+----------+----------+----------------+

Success: Sample data exported to: /tmp/design-*-audit.json

📸 MANUAL VERIFICATION STEPS:
   1. Load each design in the designer interface
   2. Verify logo positions match visual expectations
   3. Compare with exported JSON coordinate data
   4. Test save/reload to ensure position persistence
```

---

## Success Criteria

### Pre-Migration

✅ **Success**: Command runs without errors
✅ **Success**: Design count matches database
✅ **Success**: Type A count > 0 (designs to migrate)
✅ **Success**: Export file generated (if `--export` used)

⚠️ **Warning**: Type A count = 0 (no designs to migrate)
❌ **Failure**: Database connection error
❌ **Failure**: Invalid JSON in design_data

---

### Post-Migration

✅ **Success**: All 3 tests pass
✅ **Success**: No anomalies detected
✅ **Success**: All new designs have `offset_x = 0, offset_y = 0`
✅ **Success**: Old designs unchanged

⚠️ **Warning**: Minor anomalies (< 5%)
❌ **Failure**: Test failures in strict mode
❌ **Failure**: > 10% designs with non-zero offsets

---

### Runtime Monitoring

✅ **Success**: Zero offset count = Total designs
✅ **Success**: No non-zero offsets detected

⚠️ **Warning**: 1-2 designs with non-zero offsets
❌ **Failure**: > 5 designs with non-zero offsets
❌ **Failure**: Continuous errors (watch mode)

---

### Integration Test

✅ **Success**: 4/4 tests pass
✅ **Success**: Test design created/deleted
✅ **Success**: API conversion validated

⚠️ **Warning**: 3/4 tests pass
❌ **Failure**: < 3/4 tests pass
❌ **Failure**: Test design creation fails

---

## Troubleshooting

### Issue: "Table doesn't exist"

**Symptom**:
```
Error: Table 'wp_octo_user_designs' doesn't exist
```

**Solution**:
```bash
# Check table name
wp db query "SHOW TABLES LIKE '%octo%';"

# Verify table prefix
wp db prefix
```

---

### Issue: "No designs found"

**Symptom**:
```
Warning: No designs found in database
```

**Solution**:
```bash
# Check design count
wp db query "SELECT COUNT(*) FROM wp_octo_user_designs;"

# Check if designs exist but with different structure
wp db query "SELECT id, created_at FROM wp_octo_user_designs LIMIT 5;"
```

---

### Issue: "WP_CLI not found"

**Symptom**:
```
Command not found: wp
```

**Solution**:
```bash
# Install WP-CLI
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp

# Verify installation
wp --info
```

---

### Issue: "Permission denied"

**Symptom**:
```
Error: Could not write to file
```

**Solution**:
```bash
# Fix file permissions
sudo chmod 755 /workspaces/yprint_designtool/verification-suite.php

# Fix export directory permissions
sudo chmod 777 /tmp
```

---

## Integration with Deployment

### Phase 1: Pre-Deployment (Day -1)

```bash
# 1. Run pre-migration analysis
wp offset-verify pre-migration --verbose --export=pre-deploy-backup.json

# 2. Review migration scope
cat pre-deploy-backup.json | jq '.statistics'

# 3. Create database backup
wp db export backup-pre-offset-fix-$(date +%Y%m%d).sql
```

---

### Phase 2: Deployment (Day 0)

```bash
# 1. Deploy code changes
# (git pull, file uploads, etc.)

# 2. Clear caches
wp cache flush

# 3. Run immediate validation
wp offset-verify post-migration --since=$(date +%Y-%m-%d)
```

---

### Phase 3: Post-Deployment (Day 0-2)

```bash
# 1. Continuous monitoring (first 2 hours)
wp offset-verify monitor --hours=2 --watch

# 2. Integration testing
wp offset-verify integration-test --cleanup

# 3. Sample audit
wp offset-verify sample-audit --sample-size=20

# 4. Full post-migration verification
wp offset-verify post-migration --strict --sample-size=50
```

---

### Phase 4: Long-Term Monitoring (Day 3+)

```bash
# Daily monitoring (via cron)
# Add to crontab:
# 0 9 * * * cd /var/www/html && wp offset-verify monitor --hours=24 >> /var/log/offset-monitor.log 2>&1

# Weekly audit
# Add to crontab:
# 0 10 * * 1 cd /var/www/html && wp offset-verify post-migration --since=$(date -d "7 days ago" +%Y-%m-%d)
```

---

## Automated Monitoring Setup

### Slack Webhook Integration

```bash
# 1. Create Slack incoming webhook
# https://api.slack.com/messaging/webhooks

# 2. Run monitoring with alerts
wp offset-verify monitor \
  --hours=24 \
  --alert-webhook=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# 3. Add to crontab for automated alerts
*/30 * * * * cd /var/www/html && wp offset-verify monitor --hours=1 --alert-webhook=YOUR_WEBHOOK
```

---

## Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| 0 | Success | Continue |
| 1 | Failure (strict mode) | Investigate anomalies |
| 2 | Warning (non-strict) | Review but may continue |

---

## Performance Considerations

### Large Databases

For databases with > 10,000 designs:

```bash
# Use batch processing
wp offset-verify pre-migration --verbose > analysis.txt &

# Monitor progress
tail -f analysis.txt

# Use sample-based validation instead of full scan
wp offset-verify post-migration --sample-size=100
```

### Memory Limits

If you encounter memory errors:

```bash
# Increase PHP memory limit
wp offset-verify pre-migration --php-memory-limit=512M

# Or edit php.ini
memory_limit = 512M
```

---

## Log Files

The verification suite uses WordPress debug logging:

```bash
# Enable debug logging (wp-config.php)
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);

# View logs
tail -f /var/www/html/wp-content/debug.log | grep "OFFSET-FIX"
```

---

## Support and Contact

**Agent**: Agent 5 of 7
**Documentation**: `/workspaces/yprint_designtool/AGENT-5-VERIFICATION-SUITE-DOCUMENTATION.md`
**Source Code**: `/workspaces/yprint_designtool/verification-suite.php`
**Architecture**: Architecture A (MINIMAL FIX)

For issues or questions, refer to:
- `TECHNICAL-ARCHITECTURE-OFFSET-FIX.md` - System architecture
- `PRODUCTION-DEPLOYMENT-RUNBOOK.md` - Deployment procedures
- `AGENT-6-MANUAL-TESTING-GUIDE.md` - Manual testing guide

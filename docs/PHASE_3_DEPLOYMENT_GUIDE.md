# PHASE 3 DEPLOYMENT GUIDE

**Version:** 1.0.0
**Date:** 2025-10-02
**Phase:** Source-Level Data Format Correction
**Estimated Total Time:** 42-58 hours (6-7 working days)

---

## OVERVIEW

Phase 3 implements source-level data format correction to eliminate the variationImages format problem. This deployment guide provides step-by-step procedures for deploying changes across development, staging, and production environments.

**Key Goals:**
- Frontend outputs Golden Standard format with `metadata.capture_version`
- Backend validator prevents invalid formats from entering the database
- Migration converts existing variationImages data to Golden Standard
- Zero downtime for end users
- Rollback capability at every stage

**Deployment Philosophy:**
- **Frontend First:** Deploy new data capture before validation
- **Log Before Enforce:** Validate in log-only mode before strict enforcement
- **Incremental Migration:** Batch processing with progress tracking
- **48-Hour Monitoring:** Intensive observation after production deployment

---

## PRE-DEPLOYMENT CHECKLIST

Before beginning any deployment, ensure all prerequisites are met:

### Code Readiness
- [ ] All Phase 3 code changes committed to version control
- [ ] Frontend `collectDesignState()` function updated (line 1899 in designer.bundle.js)
- [ ] Backend `validate_design_data_schema()` function added
- [ ] WP-CLI migration command implemented and tested
- [ ] All unit tests passing
- [ ] Integration tests completed
- [ ] Code review completed and approved

### Infrastructure Readiness
- [ ] Database backup procedures tested and verified
- [ ] Disk space available for backup storage (at least 2x current DB size)
- [ ] Rollback procedures documented and tested on staging
- [ ] Monitoring dashboards configured
- [ ] Log aggregation system ready
- [ ] Alert thresholds configured

### Team Readiness
- [ ] Technical lead sign-off obtained
- [ ] Deployment team briefed on procedures
- [ ] Customer support team notified of deployment window
- [ ] Rollback decision-makers identified and available
- [ ] Post-deployment monitoring schedule established

### Environment-Specific Checks
- [ ] Development environment: All tests passing
- [ ] Staging environment: Mirrors production configuration
- [ ] Production environment: Change window approved
- [ ] Load balancer configuration reviewed (if applicable)
- [ ] CDN cache invalidation procedures ready

---

## DEPLOYMENT TIMELINE

| Day | Environment | Activity | Duration | Risk Level |
|-----|-------------|----------|----------|------------|
| 1 | Development | Frontend + Backend (Log-Only) | 2-3h | Low |
| 2 | Development | Monitor validation logs | 24h | Low |
| 3 | Staging | Frontend + Backend (Log-Only) | 2-3h | Medium |
| 4 | Staging | Enable strict validation + Test | 2-3h | Medium |
| 5 | Production | Frontend deployment | 1-2h | High |
| 6 | Production | Backend (Log-Only) deployment | 1-2h | High |
| 7-8 | Production | Monitor validation statistics | 48h | Medium |
| 9 | Production | Enable strict validation | 1h | Medium |
| 10-14 | Production | Run migration in batches | 8-10h | Low |
| 15+ | Production | 48h post-migration monitoring | 48h | Low |

---

## ENVIRONMENT 1: DEVELOPMENT DEPLOYMENT

### Pre-Deployment (Dev)

**Estimated Time:** 30 minutes

```bash
# Navigate to project directory
cd /workspaces/yprint_designtool

# Verify current branch
git branch
# Expected: main or feature/phase-3

# Pull latest changes
git pull origin main

# Verify all tests pass
npm test
php vendor/bin/phpunit

# Create backup directory
mkdir -p backups/dev-$(date +%Y%m%d)
```

### Step 1: Database Backup (Dev)

**Estimated Time:** 5-10 minutes

```bash
# Export database
wp db export backups/dev-$(date +%Y%m%d)/backup-dev-$(date +%Y%m%d-%H%M%S).sql --path=/var/www/html

# Verify backup created
ls -lh backups/dev-$(date +%Y%m%d)/

# Test backup integrity
wp db check --path=/var/www/html
```

### Step 2: Frontend Deployment (Dev)

**Estimated Time:** 15 minutes

```bash
# Backup current frontend bundle
cp public/js/dist/designer.bundle.js public/js/dist/designer.bundle.js.backup-$(date +%Y%m%d)

# Verify backup
ls -lh public/js/dist/*.backup*

# Build new bundle with Phase 3 changes
npm run build

# Verify new bundle contains capture_version
grep -n "capture_version" public/js/dist/designer.bundle.js
# Expected: Should find references to capture_version in collectDesignState

# Clear WordPress object cache
wp cache flush --path=/var/www/html

# Clear browser cache (manual step)
# Open browser DevTools > Network tab > Disable cache
```

### Step 3: Backend Deployment - Log-Only Mode (Dev)

**Estimated Time:** 20 minutes

```bash
# Backup current integration file
cp includes/class-octo-print-designer-wc-integration.php \
   includes/class-octo-print-designer-wc-integration.php.backup-$(date +%Y%m%d)

# Verify the validator function is present
grep -n "validate_design_data_schema" includes/class-octo-print-designer-wc-integration.php
# Expected: Should find function definition around line 2500

# Enable WordPress debug logging
# Edit wp-config.php and ensure:
# define('WP_DEBUG', true);
# define('WP_DEBUG_LOG', true);
# define('WP_DEBUG_DISPLAY', false);

# Set validator to LOG-ONLY mode
# Edit class-octo-print-designer-wc-integration.php
# In save_design_data_to_order() method, ensure:
# $validation_mode = 'log_only';  // Line ~2570

# Clear all caches
wp cache flush --path=/var/www/html
```

### Step 4: Verification (Dev)

**Estimated Time:** 30 minutes

**Test 1: Frontend Data Capture**

```bash
# Manual test procedure:
# 1. Open designer in browser
# 2. Create a new design with an image element
# 3. Open browser console
# 4. Check for collectDesignState output
# 5. Verify structure includes:
#    - objects array
#    - metadata.capture_version: "3.0.0"
#    - metadata.format_schema_version: "golden_standard_v1"
```

**Test 2: Backend Validation (Log-Only)**

```bash
# Create a test order with design
# (Use WooCommerce checkout with a design)

# Check validation logs
tail -f /var/log/wordpress/debug.log | grep "VALIDATION"

# Expected output:
# [2025-10-02 15:30:00] VALIDATION LOG-ONLY: Schema validation passed
# Format: golden_standard, Version: 3.0.0

# Verify database entry
wp db query "SELECT post_id, meta_key, meta_value FROM deo6_postmeta WHERE meta_key = '_design_data' ORDER BY meta_id DESC LIMIT 1" --path=/var/www/html

# Check that design data contains capture_version
```

**Test 3: Admin Preview**

```bash
# Manual test procedure:
# 1. Navigate to WooCommerce > Orders
# 2. Open the test order
# 3. Scroll to design preview section
# 4. Verify design renders correctly
# 5. Check browser console for any errors
```

### Step 5: 24-Hour Monitoring (Dev)

**Estimated Time:** 24 hours (passive monitoring)

```bash
# Set up log monitoring
tail -f /var/log/wordpress/debug.log | grep -E "VALIDATION|capture_version|ERROR"

# Check validation statistics every 4 hours
wp db query "SELECT option_value FROM deo6_options WHERE option_name = 'design_validation_stats'" --path=/var/www/html

# Monitor for validation failures
grep "VALIDATION.*FAILED" /var/log/wordpress/debug.log | wc -l
# Expected: 0 failures for new designs

# Check order creation success rate
wp db query "SELECT COUNT(*) FROM deo6_posts WHERE post_type = 'shop_order' AND post_date > DATE_SUB(NOW(), INTERVAL 24 HOUR)" --path=/var/www/html
```

**Success Criteria (Dev):**
- [ ] All new designs have `capture_version: "3.0.0"`
- [ ] Zero validation errors in logs
- [ ] Admin preview renders correctly
- [ ] No user-reported issues
- [ ] Order creation success rate unchanged

---

## ENVIRONMENT 2: STAGING DEPLOYMENT

### Pre-Deployment (Staging)

**Estimated Time:** 45 minutes

```bash
# SSH to staging server
ssh user@staging.yprint.com

# Navigate to project directory
cd /var/www/html/yprint

# Sync code from development
git pull origin main

# Verify environment
wp cli version --path=/var/www/html
php -v
node -v

# Run all tests
npm test
php vendor/bin/phpunit
```

### Step 1: Database Backup (Staging)

**Estimated Time:** 10-15 minutes (larger database)

```bash
# Create backup directory
mkdir -p /backups/staging/$(date +%Y%m%d)

# Export database with compression
wp db export - --path=/var/www/html | gzip > /backups/staging/$(date +%Y%m%d)/backup-staging-$(date +%Y%m%d-%H%M%S).sql.gz

# Verify backup
ls -lh /backups/staging/$(date +%Y%m%d)/

# Test backup integrity
gunzip -t /backups/staging/$(date +%Y%m%d)/backup-staging-*.sql.gz

# Copy backup to remote storage (S3, etc.)
aws s3 cp /backups/staging/$(date +%Y%m%d)/backup-staging-*.sql.gz s3://yprint-backups/staging/
```

### Step 2: Frontend Deployment (Staging)

**Estimated Time:** 20 minutes

```bash
# Backup current bundle
cp public/js/dist/designer.bundle.js public/js/dist/designer.bundle.js.backup-$(date +%Y%m%d)

# Build production bundle
NODE_ENV=production npm run build

# Verify bundle size (should be minified)
ls -lh public/js/dist/designer.bundle.js

# Verify capture_version presence
grep -o "capture_version" public/js/dist/designer.bundle.js | wc -l
# Expected: At least 2 occurrences

# Clear all caches
wp cache flush --path=/var/www/html

# If using CDN, invalidate cache
# Example for Cloudflare:
# curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
#   -H "Authorization: Bearer {api_token}" \
#   -H "Content-Type: application/json" \
#   --data '{"purge_everything":true}'
```

### Step 3: Backend Deployment - Log-Only Mode (Staging)

**Estimated Time:** 15 minutes

```bash
# Backup integration file
cp includes/class-octo-print-designer-wc-integration.php \
   includes/class-octo-print-designer-wc-integration.php.backup-$(date +%Y%m%d)

# Deploy new code (already pulled from git)
# Verify validator is in LOG-ONLY mode
grep -A 5 "validation_mode" includes/class-octo-print-designer-wc-integration.php | head -10
# Expected: $validation_mode = 'log_only';

# Restart PHP-FPM (if needed)
sudo systemctl restart php7.4-fpm
# OR
sudo systemctl reload php7.4-fpm

# Clear OPcache
wp cli cache clear --path=/var/www/html
```

### Step 4: Verification (Staging)

**Estimated Time:** 1 hour

**Run comprehensive test suite:**

```bash
# Test new design creation
npm run test:e2e:design-creation

# Test order placement with design
npm run test:e2e:order-placement

# Test admin preview
npm run test:e2e:admin-preview

# Check validation logs
tail -100 /var/log/wordpress/debug.log | grep "VALIDATION"

# Verify all validations passing
grep "VALIDATION LOG-ONLY.*passed" /var/log/wordpress/debug.log | wc -l
grep "VALIDATION LOG-ONLY.*FAILED" /var/log/wordpress/debug.log | wc -l
# Expected: 0 failures
```

### Step 5: Enable Strict Validation (Staging Only)

**Estimated Time:** 30 minutes

After 24-48 hours of log-only monitoring on staging:

```bash
# Edit class-octo-print-designer-wc-integration.php
# Change line ~2570:
# FROM: $validation_mode = 'log_only';
# TO:   $validation_mode = 'strict';

# Clear caches
wp cache flush --path=/var/www/html
sudo systemctl reload php7.4-fpm

# Test that invalid formats are rejected
# Create test with old variationImages format
# Expected: Order creation should fail with validation error

# Monitor for any production issues
tail -f /var/log/wordpress/debug.log | grep "VALIDATION"
```

**Success Criteria (Staging):**
- [ ] All new designs validated successfully
- [ ] Old format designs properly rejected (in strict mode)
- [ ] Admin preview works for all orders
- [ ] No performance degradation
- [ ] Error logs clean (no PHP warnings/errors)
- [ ] Team approval for production deployment

---

## ENVIRONMENT 3: PRODUCTION DEPLOYMENT

### Pre-Deployment (Production)

**Estimated Time:** 1 hour

**CRITICAL: Production deployment requires additional safeguards**

```bash
# Verify maintenance page is ready (optional)
# Create maintenance.html in web root

# Notify stakeholders
# Send email to:
# - Technical team
# - Customer support
# - Management
# Subject: "Phase 3 Deployment - [DATE] [TIME]"

# Schedule deployment during low-traffic window
# Recommended: Early morning or late evening in local timezone

# SSH to production
ssh user@production.yprint.com

# Navigate to project directory
cd /var/www/html/yprint

# Verify git status
git status
# Expected: Clean working tree

# Verify branch
git branch
# Expected: main

# Pull latest code
git pull origin main
```

### Step 1: Database Backup (Production)

**Estimated Time:** 20-30 minutes (large database)

**CRITICAL: This is the most important step. Do not skip.**

```bash
# Create backup directory
mkdir -p /backups/production/$(date +%Y%m%d)

# Export database with compression
# Use --single-transaction for InnoDB tables (no table locks)
wp db export - --single-transaction --path=/var/www/html | gzip > /backups/production/$(date +%Y%m%d)/backup-prod-$(date +%Y%m%d-%H%M%S).sql.gz

# Verify backup created
ls -lh /backups/production/$(date +%Y%m%d)/

# Test backup integrity
gunzip -t /backups/production/$(date +%Y%m%d)/backup-prod-*.sql.gz
echo "Backup integrity: $?"
# Expected: 0 (success)

# Get backup size
du -h /backups/production/$(date +%Y%m%d)/backup-prod-*.sql.gz

# Copy to multiple locations
# 1. Remote storage (S3)
aws s3 cp /backups/production/$(date +%Y%m%d)/backup-prod-*.sql.gz s3://yprint-backups/production/

# 2. Secondary server
scp /backups/production/$(date +%Y%m%d)/backup-prod-*.sql.gz backup-server:/backups/

# 3. Verify remote copies
aws s3 ls s3://yprint-backups/production/ | grep $(date +%Y%m%d)

# Create backup metadata file
cat > /backups/production/$(date +%Y%m%d)/backup-metadata.txt <<EOF
Backup Date: $(date)
Database Size: $(wp db size --path=/var/www/html)
WordPress Version: $(wp core version --path=/var/www/html)
PHP Version: $(php -v | head -1)
Tables Backed Up: $(wp db query "SHOW TABLES" --path=/var/www/html | wc -l)
Purpose: Phase 3 Deployment
EOF

cat /backups/production/$(date +%Y%m%d)/backup-metadata.txt
```

### Step 2: Frontend Deployment (Production)

**Estimated Time:** 30 minutes

```bash
# Double-check we're on production
hostname
# Expected: production server hostname

# Backup current bundle with timestamp
cp public/js/dist/designer.bundle.js \
   public/js/dist/designer.bundle.js.backup-$(date +%Y%m%d-%H%M%S)

# Backup previous backup (safety net)
cp public/js/dist/designer.bundle.js.backup-$(date +%Y%m%d-%H%M%S) \
   /backups/production/$(date +%Y%m%d)/

# Build production bundle
NODE_ENV=production npm run build

# Verify bundle integrity
# Check file size (should be reasonable, not 0 or extremely large)
ls -lh public/js/dist/designer.bundle.js

# Verify capture_version is present
grep -o "capture_version" public/js/dist/designer.bundle.js | wc -l
# Expected: At least 2

# Verify no syntax errors
node -c public/js/dist/designer.bundle.js
echo "Syntax check: $?"
# Expected: 0

# Create checksum for integrity verification
md5sum public/js/dist/designer.bundle.js > /backups/production/$(date +%Y%m%d)/designer.bundle.js.md5

# Clear WordPress caches
wp cache flush --path=/var/www/html

# Clear OPcache
wp cli cache clear --path=/var/www/html

# If using Varnish
# varnishadm "ban req.url ~ ."

# If using Redis
# redis-cli FLUSHALL

# Clear CDN cache (if applicable)
# Document CDN cache invalidation procedure here

# Test frontend immediately
# Open browser to: https://production.yprint.com/designer
# Check browser console for errors
# Create a test design
# Verify console shows capture_version in output
```

### Step 3: Backend Deployment - Log-Only Mode (Production)

**Estimated Time:** 20 minutes

**CRITICAL: Start in LOG-ONLY mode, not strict mode**

```bash
# Backup integration file
cp includes/class-octo-print-designer-wc-integration.php \
   includes/class-octo-print-designer-wc-integration.php.backup-$(date +%Y%m%d-%H%M%S)

# Copy backup to safe location
cp includes/class-octo-print-designer-wc-integration.php.backup-$(date +%Y%m%d-%H%M%S) \
   /backups/production/$(date +%Y%m%d)/

# Deploy new code (already pulled from git)

# VERIFY validator is in LOG-ONLY mode
grep -n "validation_mode" includes/class-octo-print-designer-wc-integration.php
# MUST show: $validation_mode = 'log_only';

# If not in log-only mode, STOP and fix before proceeding

# Verify function exists
grep -n "function validate_design_data_schema" includes/class-octo-print-designer-wc-integration.php
# Expected: Line number around 2500

# Enable debug logging if not already enabled
# wp-config.php should have:
# define('WP_DEBUG', true);
# define('WP_DEBUG_LOG', true);
# define('WP_DEBUG_DISPLAY', false);

# Restart PHP-FPM (graceful reload)
sudo systemctl reload php7.4-fpm

# Verify PHP-FPM reloaded successfully
sudo systemctl status php7.4-fpm | grep "active (running)"

# Clear all caches again
wp cache flush --path=/var/www/html
```

### Step 4: Immediate Verification (Production)

**Estimated Time:** 30 minutes

**Test immediately after deployment:**

```bash
# Test 1: Create a new design
# Manual test:
# 1. Open designer
# 2. Add image element
# 3. Save design
# 4. Check browser console for capture_version
# 5. Complete order checkout

# Test 2: Check validation logs
tail -20 /var/log/wordpress/debug.log | grep "VALIDATION"
# Expected: Should see "VALIDATION LOG-ONLY: Schema validation passed"

# Test 3: Verify database entry
wp db query "SELECT post_id, meta_key FROM deo6_postmeta WHERE meta_key = '_design_data' ORDER BY meta_id DESC LIMIT 1" --path=/var/www/html

# Get the post_id from above, then:
wp post meta get <POST_ID> _design_data --path=/var/www/html | grep "capture_version"
# Expected: Should contain "capture_version":"3.0.0"

# Test 4: Admin preview
# 1. Navigate to WooCommerce > Orders
# 2. Open the test order
# 3. Verify design preview renders
# 4. Check console for errors

# Test 5: Performance check
# Monitor response times
tail -f /var/log/nginx/access.log | grep "POST /wp-admin/admin-ajax.php"
# Check response times are normal (< 500ms)
```

### Step 5: Hour 0-4 Intensive Monitoring (Production)

**Estimated Time:** 4 hours (active monitoring)

**Monitor these metrics every 30 minutes:**

```bash
# Create monitoring script
cat > /tmp/phase3-monitor.sh <<'EOF'
#!/bin/bash
echo "=== Phase 3 Monitoring Report - $(date) ==="

echo -e "\n1. Validation Statistics:"
wp db query "SELECT option_value FROM deo6_options WHERE option_name = 'design_validation_stats'" --path=/var/www/html

echo -e "\n2. Recent Validation Logs (last 10):"
grep "VALIDATION" /var/log/wordpress/debug.log | tail -10

echo -e "\n3. Validation Failures (last hour):"
grep "VALIDATION.*FAILED" /var/log/wordpress/debug.log | grep "$(date -d '1 hour ago' '+%Y-%m-%d %H')" | wc -l

echo -e "\n4. Orders Created (last hour):"
wp db query "SELECT COUNT(*) as count FROM deo6_posts WHERE post_type = 'shop_order' AND post_date > DATE_SUB(NOW(), INTERVAL 1 HOUR)" --path=/var/www/html

echo -e "\n5. PHP Errors (last hour):"
grep "$(date -d '1 hour ago' '+%Y-%m-%d %H')" /var/log/wordpress/debug.log | grep -i "error" | wc -l

echo -e "\n6. Capture Version Count (designs in last hour):"
wp db query "SELECT COUNT(*) FROM deo6_postmeta WHERE meta_key = '_design_data' AND meta_value LIKE '%capture_version%' AND post_id IN (SELECT ID FROM deo6_posts WHERE post_date > DATE_SUB(NOW(), INTERVAL 1 HOUR))" --path=/var/www/html

echo -e "\n7. Server Load:"
uptime

echo -e "\n8. Memory Usage:"
free -h

echo "=========================================="
EOF

chmod +x /tmp/phase3-monitor.sh

# Run monitoring script every 30 minutes
watch -n 1800 /tmp/phase3-monitor.sh

# OR run as cron job
# */30 * * * * /tmp/phase3-monitor.sh >> /var/log/phase3-monitoring.log
```

**Alert Conditions (trigger rollback if any occur):**
- Validation failure rate > 5%
- Order creation failure rate increases > 10%
- PHP errors increase > 50%
- Server load increases > 2x normal
- Customer support tickets spike
- Any critical errors in logs

### Step 6: Day 1-2 Active Monitoring (Production)

**Estimated Time:** 48 hours (passive monitoring with periodic checks)

```bash
# Check every 4 hours:

# 1. Validation statistics
wp db query "SELECT option_value FROM deo6_options WHERE option_name = 'design_validation_stats'" --path=/var/www/html

# 2. Error rate
grep "VALIDATION.*FAILED" /var/log/wordpress/debug.log | grep "$(date '+%Y-%m-%d')" | wc -l

# 3. Success rate
grep "VALIDATION.*passed" /var/log/wordpress/debug.log | grep "$(date '+%Y-%m-%d')" | wc -l

# 4. Customer support tickets
# Check support ticket system for design-related issues

# 5. Performance metrics
# Check APM dashboard (New Relic, DataDog, etc.)
```

**Success Criteria for Enabling Strict Mode:**
- [ ] 48 hours of stable operation
- [ ] Validation success rate > 99%
- [ ] Zero critical errors
- [ ] No customer complaints
- [ ] Performance metrics normal
- [ ] Technical lead approval

### Step 7: Enable Strict Validation (Production)

**Estimated Time:** 1 hour

**Only proceed if all success criteria met**

```bash
# Create another backup before changing modes
wp db export /backups/production/$(date +%Y%m%d)/backup-before-strict-mode-$(date +%Y%m%d-%H%M%S).sql.gz --path=/var/www/html

# Edit class-octo-print-designer-wc-integration.php
# Change line ~2570:
nano includes/class-octo-print-designer-wc-integration.php
# FROM: $validation_mode = 'log_only';
# TO:   $validation_mode = 'strict';

# Verify change
grep -n "validation_mode = 'strict'" includes/class-octo-print-designer-wc-integration.php

# Clear caches
wp cache flush --path=/var/www/html
sudo systemctl reload php7.4-fpm

# Test immediately with old format data
# (Should reject variationImages format)

# Monitor intensively for next 2 hours
tail -f /var/log/wordpress/debug.log | grep -E "VALIDATION|ERROR"
```

---

## POST-DEPLOYMENT MONITORING

### Metrics to Track

**Daily (Days 1-7):**
- Total designs created
- Validation pass/fail rate
- Order completion rate
- Admin preview success rate
- Customer support tickets
- Server performance metrics
- Error log analysis

**Weekly (Weeks 2-4):**
- Design format distribution (Golden Standard vs Legacy)
- Migration progress
- Data quality metrics
- User feedback analysis

### Monitoring Commands

```bash
# Daily health check script
cat > /tmp/phase3-daily-health.sh <<'EOF'
#!/bin/bash
echo "=== Phase 3 Daily Health Check - $(date) ==="

echo -e "\n1. Designs Created (last 24h):"
wp db query "SELECT COUNT(*) FROM deo6_postmeta WHERE meta_key = '_design_data' AND post_id IN (SELECT ID FROM deo6_posts WHERE post_date > DATE_SUB(NOW(), INTERVAL 24 HOUR))" --path=/var/www/html

echo -e "\n2. Golden Standard Designs (last 24h):"
wp db query "SELECT COUNT(*) FROM deo6_postmeta WHERE meta_key = '_design_data' AND meta_value LIKE '%capture_version%' AND post_id IN (SELECT ID FROM deo6_posts WHERE post_date > DATE_SUB(NOW(), INTERVAL 24 HOUR))" --path=/var/www/html

echo -e "\n3. Validation Failures (last 24h):"
grep "VALIDATION.*FAILED" /var/log/wordpress/debug.log | grep "$(date '+%Y-%m-%d')" | wc -l

echo -e "\n4. Orders Completed (last 24h):"
wp db query "SELECT COUNT(*) FROM deo6_posts WHERE post_type = 'shop_order' AND post_status = 'wc-completed' AND post_date > DATE_SUB(NOW(), INTERVAL 24 HOUR)" --path=/var/www/html

echo -e "\n5. Support Tickets (design-related):"
# Insert command to check your support system

echo "=========================================="
EOF

chmod +x /tmp/phase3-daily-health.sh
```

---

## ROLLBACK PROCEDURES

### Emergency Rollback Decision Tree

**Trigger Rollback If:**
- Validation failure rate > 10%
- Order creation failures increase > 20%
- Critical data corruption detected
- Customer-facing functionality broken
- Performance degradation > 50%
- Technical lead requests rollback

### Rollback Level 1: Frontend Only

**Estimated Time:** 5 minutes

```bash
# Restore previous frontend bundle
cp public/js/dist/designer.bundle.js.backup-$(date +%Y%m%d)* public/js/dist/designer.bundle.js

# Verify restoration
ls -lh public/js/dist/designer.bundle.js

# Clear caches
wp cache flush --path=/var/www/html

# Invalidate CDN cache
# [Insert CDN invalidation command]

# Verify rollback
curl -s https://production.yprint.com/public/js/dist/designer.bundle.js | grep -o "capture_version" | wc -l
# Expected: 0 (old bundle doesn't have capture_version)
```

### Rollback Level 2: Backend Validation Disable

**Estimated Time:** 2 minutes

```bash
# Add to wp-config.php
echo "define('DISABLE_DESIGN_VALIDATION', true);" >> wp-config.php

# Verify
grep "DISABLE_DESIGN_VALIDATION" wp-config.php

# Clear caches
wp cache flush --path=/var/www/html
sudo systemctl reload php7.4-fpm

# Validation is now bypassed
# Monitor for immediate relief of issues
```

### Rollback Level 3: Complete Backend Rollback

**Estimated Time:** 10 minutes

```bash
# Restore previous integration file
cp includes/class-octo-print-designer-wc-integration.php.backup-$(date +%Y%m%d)* \
   includes/class-octo-print-designer-wc-integration.php

# Verify restoration
ls -lh includes/class-octo-print-designer-wc-integration.php*

# Restart PHP-FPM
sudo systemctl reload php7.4-fpm

# Clear all caches
wp cache flush --path=/var/www/html

# Verify rollback
grep "validate_design_data_schema" includes/class-octo-print-designer-wc-integration.php
# Expected: Should not find function (if it wasn't in old file)
```

### Rollback Level 4: Database Restore (Nuclear Option)

**Estimated Time:** 30-60 minutes (depends on database size)

**ONLY use if data corruption detected**

```bash
# Stop web server to prevent new writes
sudo systemctl stop nginx

# Verify backup exists
ls -lh /backups/production/$(date +%Y%m%d)/backup-prod-*.sql.gz

# Restore database
gunzip -c /backups/production/$(date +%Y%m%d)/backup-prod-*.sql.gz | wp db import - --path=/var/www/html

# Verify import
wp db check --path=/var/www/html

# Restart web server
sudo systemctl start nginx

# Verify site is operational
curl -I https://production.yprint.com
# Expected: 200 OK
```

### Post-Rollback Actions

```bash
# 1. Document what happened
cat > /backups/production/$(date +%Y%m%d)/rollback-report.txt <<EOF
Rollback Date: $(date)
Rollback Level: [1-4]
Trigger Reason: [describe issue]
Validation Failure Rate: [percentage]
Customer Impact: [describe]
Next Steps: [action items]
EOF

# 2. Notify stakeholders
# Send email notification

# 3. Schedule post-mortem
# Create calendar invite for team review

# 4. Preserve logs for analysis
cp /var/log/wordpress/debug.log /backups/production/$(date +%Y%m%d)/debug-at-rollback.log
```

---

## MIGRATION DEPLOYMENT

**Schedule:** After 7-14 days of stable Phase 3 operation

See separate migration guide for detailed procedures.

**Quick Reference:**

```bash
# Test migration on staging first
wp octo-migrate variation-images --dry-run --verbose --path=/var/www/html

# Production migration (batched)
wp octo-migrate variation-images --batch-size=50 --delay=1000 --path=/var/www/html

# Monitor migration progress
wp db query "SELECT COUNT(*) FROM deo6_octo_user_designs WHERE design_data LIKE '%capture_version%'" --path=/var/www/html
```

---

## APPENDIX A: Environment Variables

```bash
# Development
ENVIRONMENT=development
WP_DEBUG=true
WP_DEBUG_LOG=true
VALIDATION_MODE=log_only

# Staging
ENVIRONMENT=staging
WP_DEBUG=true
WP_DEBUG_LOG=true
VALIDATION_MODE=strict  # after testing

# Production
ENVIRONMENT=production
WP_DEBUG=true  # but display=false
WP_DEBUG_LOG=true
VALIDATION_MODE=log_only  # initially
# Switch to strict after 48h
```

---

## APPENDIX B: Key File Locations

```
Frontend:
  /public/js/dist/designer.bundle.js

Backend:
  /includes/class-octo-print-designer-wc-integration.php

Backups:
  /backups/{environment}/{date}/

Logs:
  /var/log/wordpress/debug.log
  /var/log/nginx/access.log
  /var/log/nginx/error.log

Config:
  /wp-config.php
```

---

## APPENDIX C: Support Contacts

**Technical Lead:** [Name, Email, Phone]
**DevOps:** [Name, Email, Phone]
**Database Admin:** [Name, Email, Phone]
**Customer Support:** [Name, Email, Phone]

**Escalation Path:**
1. Technical Lead
2. CTO
3. CEO

**Emergency Rollback Authority:** Technical Lead or CTO

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-02
**Next Review:** After Production Deployment

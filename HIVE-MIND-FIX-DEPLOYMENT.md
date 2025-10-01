# 🎯 HIVE MIND FIX - DEPLOYMENT GUIDE

## Executive Summary

Dieses Dokument beschreibt die Deployment-Schritte für die Hive Mind Fixes, die die Designer-Offset und Canvas-Skalierungs-Probleme lösen.

**Fixes implementiert:**
1. ✅ Legacy-Offset-Heuristik (90% Impact)
2. ✅ CSS Container Fixes (10% Impact)
3. ✅ Webpack Bundle Rebuild
4. ✅ Bundle-Versionierung Hash-basiert
5. ✅ Performance Monitoring

---

## Pre-Deployment Checklist

- [ ] Backup der Datenbank erstellt
- [ ] Git Branch erstellt: `git checkout -b hive-mind-fixes`
- [ ] Alle Änderungen committed
- [ ] Webpack Bundles neu gebaut
- [ ] Tests ausgeführt und bestanden

---

## Deployment Steps

### Step 1: Code Deployment

```bash
# 1. Pull latest changes
git pull origin main

# 2. Checkout fix branch
git checkout hive-mind-fixes

# 3. Verify changes
git log --oneline -10

# 4. Build bundles
npm run build

# 5. Deploy to production
# (je nach Setup: git push, FTP, rsync, etc.)
```

### Step 2: Cache Invalidation

**WordPress Admin:**
1. Gehe zu Admin Dashboard
2. Lösche WordPress Object Cache (falls vorhanden)
3. Lösche Browser Cache: Strg+Shift+R

**Server-Level (falls zutreffend):**
```bash
# Nginx
sudo nginx -s reload

# Apache
sudo service apache2 restart

# Varnish
varnishcli "ban req.url ~ ."
```

### Step 3: Verification

**Test Order 5374 (Legacy-Daten):**
1. Öffne: `/wp-admin/admin.php?page=wc-orders&action=edit&id=5374`
2. Klicke "Design-Vorschau anzeigen"
3. Prüfe Console Logs:
   ```
   🎯 HIVE MIND: Legacy data detected - applying estimated offset compensation
   ```
4. Visuell prüfen: Design sollte korrekt ausgerichtet sein

**Test Order 5377 (Neue Daten):**
1. Öffne: `/wp-admin/admin.php?page=wc-orders&action=edit&id=5377`
2. Klicke "Design-Vorschau anzeigen"
3. Prüfe Console Logs:
   ```
   🎯 HIVE MIND: Designer offset extracted from metadata
   ```
4. Fidelity Score sollte 100/100 sein

### Step 4: Performance Monitoring

**Browser Console:**
```javascript
// Check Performance Monitor
hiveMindMonitor.generateReport();

// Expected output:
// {
//   performance: { totalRenderTime: "< 200ms" },
//   quality: { fidelityScore: ">= 95" }
// }
```

---

## Rollback Plan

Falls Probleme auftreten:

```bash
# 1. Checkout previous version
git checkout main

# 2. Rebuild old bundles
npm run build

# 3. Clear cache
# (siehe Step 2)

# 4. Verify rollback
# (teste Orders 5374 & 5377)
```

---

## Known Issues & Solutions

### Issue 1: Legacy-Offset zu aggressiv

**Symptom:** Elements zu weit nach links/oben verschoben

**Solution:**
```javascript
// In admin-canvas-renderer.js, adjustiere Schwellwerte:
const estimatedOffsetX = Math.min(Math.max(avgX - 350, 0), 80); // Reduziert von 330
const estimatedOffsetY = Math.min(Math.max(avgY - 180, 0), 60); // Reduziert von 165
```

### Issue 2: Bundles nicht aktualisiert

**Symptom:** Console zeigt alte Logs

**Solution:**
```bash
# Force rebuild
rm -rf admin/js/dist/*.bundle.js
rm -rf public/js/dist/*.bundle.js
npm run build
```

### Issue 3: Cache nicht invalidiert

**Symptom:** Änderungen nicht sichtbar

**Solution:**
1. Hard refresh: Strg+Shift+R (Windows) / Cmd+Shift+R (Mac)
2. Inkognito-Fenster öffnen
3. Browser-Daten löschen

---

## Support & Monitoring

**Log Locations:**
- Browser Console: F12 → Console
- WordPress Debug Log: `/wp-content/debug.log` (if WP_DEBUG enabled)
- Server Error Log: `/var/log/apache2/error.log` or `/var/log/nginx/error.log`

**Key Metrics to Monitor:**
- Render Time: < 200ms ✅
- Fidelity Score: >= 95/100 ✅
- Offset Detection: Legacy data should show "heuristic_legacy_compensation" ✅

**Contact:**
- Technical Lead: [Your Name]
- Documentation: `/HIVE-MIND-FIX-DEPLOYMENT.md`
- Git Commits: Search for "HIVE MIND" in commit messages

---

## Post-Deployment Tasks

- [ ] Monitor error logs for 24h
- [ ] Check 10+ random orders for correct rendering
- [ ] Update internal documentation
- [ ] Notify team of deployment
- [ ] Schedule follow-up review (1 week)

---

**Deployed by:** Hive Mind Agent Team
**Date:** 2025-10-01
**Version:** 1.1.0-hive-mind-fixes

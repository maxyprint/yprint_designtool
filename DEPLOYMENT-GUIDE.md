# DEPLOYMENT-GUIDE: Coordinate Precision Fixes

**Datum**: 2025-10-03
**Agent**: AGENT 5 - VALIDATION & INTEGRATION TESTING
**Version**: 1.0

---

## Deployment-Übersicht

Dieser Guide beschreibt den sicheren Deployment-Prozess für die 3 neuen Koordinaten-Präzisions-Fixes im yprint Designer System.

---

## Was wird deployed

### Neue Dateien (3)
1. `/public/js/view-switch-race-condition-fix.js` (139 LOC)
2. `/public/js/canvas-resize-coordinate-scaling.js` (274 LOC)
3. `/public/js/save-during-load-protection.js` (333 LOC)

### Modifizierte Dateien (2)
1. `/public/class-octo-print-designer-public.php` (Lines 313-337 added)
2. `/public/class-octo-print-designer-designer.php` (Lines 81-92 modified)

**Total**: 5 Dateien (3 neue + 2 modifizierte)

---

## Pre-Deployment Checklist

### 1. Code-Validierung
- [x] ✅ JavaScript-Syntax validiert (alle 3 Files)
- [x] ✅ PHP-Syntax validiert (beide PHP-Files)
- [x] ✅ File-Permissions korrekt (644 für JS, 644 für PHP)
- [x] ✅ No Console-Errors in Dev-Environment

### 2. Dependency-Check
- [x] ✅ Fabric.js verfügbar
- [x] ✅ Designer Widget initialisiert
- [x] ✅ WordPress-Registrierung korrekt
- [x] ✅ No circular dependencies

### 3. Testing-Status
- [ ] ⬜ Browser-Tests abgeschlossen (siehe TESTING-CHECKLIST.md)
- [ ] ⬜ Funktions-Tests bestanden
- [ ] ⬜ Regressions-Tests bestanden
- [ ] ⬜ Performance-Tests OK

### 4. Backup-Vorbereitung
- [ ] ⬜ Backup der aktuellen Production-Dateien erstellt
- [ ] ⬜ Backup der Datenbank erstellt (falls nötig)
- [ ] ⬜ Rollback-Plan dokumentiert

---

## Deployment-Reihenfolge

### Phase 1: Development-Environment

**Ziel**: Teste Deployment-Prozess in Dev

1. [ ] **Git-Branch erstellen**
```bash
git checkout -b feature/coordinate-precision-fixes
git add public/js/view-switch-race-condition-fix.js
git add public/js/canvas-resize-coordinate-scaling.js
git add public/js/save-during-load-protection.js
git add public/class-octo-print-designer-public.php
git add public/class-octo-print-designer-designer.php
git commit -m "🔧 FIX: Add coordinate precision fixes (view-switch, resize-scaling, save-protection)"
```

2. [ ] **Development-Server Update**
```bash
# Upload neue JS-Files
scp public/js/view-switch-race-condition-fix.js user@dev-server:/path/to/wp-content/plugins/yprint_designtool/public/js/
scp public/js/canvas-resize-coordinate-scaling.js user@dev-server:/path/to/wp-content/plugins/yprint_designtool/public/js/
scp public/js/save-during-load-protection.js user@dev-server:/path/to/wp-content/plugins/yprint_designtool/public/js/

# Upload modifizierte PHP-Files
scp public/class-octo-print-designer-public.php user@dev-server:/path/to/wp-content/plugins/yprint_designtool/public/
scp public/class-octo-print-designer-designer.php user@dev-server:/path/to/wp-content/plugins/yprint_designtool/public/
```

3. [ ] **WordPress-Cache löschen**
```bash
# SSH in Dev-Server
ssh user@dev-server

# WordPress Object Cache löschen (falls aktiv)
wp cache flush

# Opcache löschen (PHP)
# Option A: Restart PHP-FPM
sudo systemctl restart php-fpm

# Option B: Via WP-CLI
wp rewrite flush
```

4. [ ] **Browser-Cache löschen**
- Hard Refresh in Chrome: Cmd+Shift+R (Mac) / Ctrl+F5 (Windows)
- Hard Refresh in Firefox: Cmd+Shift+R (Mac) / Ctrl+F5 (Windows)
- Hard Refresh in Safari: Cmd+Option+E (Clear Cache) + Cmd+R (Reload)

5. [ ] **Verify Deployment**
- Öffne Designer-Seite
- Prüfe Network Tab → Alle 3 neuen Scripts laden mit Status 200
- Prüfe Console → Alle Initialization-Logs erscheinen
- Führe TESTING-CHECKLIST.md Tests aus

**Status**: ⬜ Dev Deployment OK

---

### Phase 2: Staging-Environment (Optional)

**Ziel**: Final validation in Staging vor Production

1. [ ] **Staging-Server Update**
```bash
# Merge Branch in staging
git checkout staging
git merge feature/coordinate-precision-fixes

# Deploy to Staging
git push staging staging

# Oder manuell via SCP (wie in Phase 1)
```

2. [ ] **Staging Cache Clear**
```bash
ssh user@staging-server
wp cache flush
sudo systemctl restart php-fpm
```

3. [ ] **Staging Testing**
- Führe vollständige TESTING-CHECKLIST.md aus
- Teste mit echten User-Accounts
- Teste mit echten Templates
- Performance-Monitoring (Chrome DevTools)

4. [ ] **Stakeholder-Review**
- Demo für Product Owner
- Demo für QA-Team
- Sign-Off einholen

**Status**: ⬜ Staging Deployment OK

---

### Phase 3: Production-Deployment

**Ziel**: Safe deployment to production

#### 3.1 Pre-Deployment Backup

```bash
# SSH into Production
ssh user@production-server

# Backup entire plugin directory
cd /path/to/wp-content/plugins/
tar -czf yprint_designtool_backup_$(date +%Y%m%d_%H%M%S).tar.gz yprint_designtool/

# Backup database (optional - nur wenn DB-Änderungen)
wp db export yprint_designtool_backup_$(date +%Y%m%d_%H%M%S).sql
```

**Backup-Location**: _________________________________

---

#### 3.2 Deployment-Window

**Empfohlenes Deployment-Fenster**:
- **Best**: Off-Peak Hours (z.B. 02:00 - 06:00 Uhr)
- **Good**: Mittagszeit (12:00 - 14:00 Uhr)
- **Avoid**: Peak Hours (09:00 - 11:00 Uhr, 14:00 - 17:00 Uhr)

**Geplantes Deployment-Fenster**: _________________________________

---

#### 3.3 Deployment-Steps

1. [ ] **Wartungsmodus aktivieren (Optional)**
```bash
# WordPress Maintenance Mode
wp maintenance-mode activate
```

2. [ ] **Deploy neue JS-Files**
```bash
cd /path/to/wp-content/plugins/yprint_designtool/public/js/

# Upload neue Scripts
# Via SCP von lokalem Rechner:
scp public/js/view-switch-race-condition-fix.js user@prod:/path/to/plugins/yprint_designtool/public/js/
scp public/js/canvas-resize-coordinate-scaling.js user@prod:/path/to/plugins/yprint_designtool/public/js/
scp public/js/save-during-load-protection.js user@prod:/path/to/plugins/yprint_designtool/public/js/

# Verify Upload
ls -lh view-switch-race-condition-fix.js
ls -lh canvas-resize-coordinate-scaling.js
ls -lh save-during-load-protection.js
```

3. [ ] **Deploy modifizierte PHP-Files**
```bash
cd /path/to/wp-content/plugins/yprint_designtool/public/

# Backup alte Versionen (zusätzlich zu Gesamt-Backup)
cp class-octo-print-designer-public.php class-octo-print-designer-public.php.backup
cp class-octo-print-designer-designer.php class-octo-print-designer-designer.php.backup

# Upload neue Versionen
scp public/class-octo-print-designer-public.php user@prod:/path/to/plugins/yprint_designtool/public/
scp public/class-octo-print-designer-designer.php user@prod:/path/to/plugins/yprint_designtool/public/

# Verify Upload + Syntax
php -l class-octo-print-designer-public.php
php -l class-octo-print-designer-designer.php
```

4. [ ] **Clear All Caches**
```bash
# WordPress Cache
wp cache flush

# Opcache Clear (PHP)
sudo systemctl restart php-fpm

# Nginx Cache (falls vorhanden)
sudo rm -rf /var/cache/nginx/*
sudo systemctl restart nginx

# Varnish Cache (falls vorhanden)
sudo varnishadm "ban req.url ~ ."

# CDN Cache Purge (falls vorhanden - z.B. Cloudflare)
# Via Cloudflare Dashboard oder API
```

5. [ ] **Verify File-Permissions**
```bash
# Set correct permissions
chmod 644 public/js/view-switch-race-condition-fix.js
chmod 644 public/js/canvas-resize-coordinate-scaling.js
chmod 644 public/js/save-during-load-protection.js
chmod 644 public/class-octo-print-designer-public.php
chmod 644 public/class-octo-print-designer-designer.php

# Verify ownership (www-data oder apache)
chown www-data:www-data public/js/*.js
chown www-data:www-data public/class-*.php
```

6. [ ] **Wartungsmodus deaktivieren**
```bash
wp maintenance-mode deactivate
```

---

#### 3.4 Post-Deployment Verification

**Immediate Checks (5 Minuten nach Deployment)**:

1. [ ] **Script-Loading Check**
```bash
# Von lokalem Rechner
curl -I https://production-domain.com/wp-content/plugins/yprint_designtool/public/js/view-switch-race-condition-fix.js
# Expected: HTTP/2 200

curl -I https://production-domain.com/wp-content/plugins/yprint_designtool/public/js/canvas-resize-coordinate-scaling.js
# Expected: HTTP/2 200

curl -I https://production-domain.com/wp-content/plugins/yprint_designtool/public/js/save-during-load-protection.js
# Expected: HTTP/2 200
```

2. [ ] **Browser-Test (Incognito)**
- Öffne Designer-Seite in Incognito-Mode
- Prüfe Network Tab → Alle Scripts Status 200
- Prüfe Console → Keine Errors
- Prüfe Console → Initialization-Logs erscheinen

3. [ ] **Smoke-Test**
- [ ] Designer lädt
- [ ] Canvas initialisiert
- [ ] Text hinzufügen funktioniert
- [ ] Image hinzufügen funktioniert
- [ ] View-Switch funktioniert
- [ ] Save funktioniert

**Status**: ⬜ Post-Deployment Verification OK

---

#### 3.5 Monitoring (24 Stunden)

**Metrics zu überwachen**:

1. [ ] **Error-Logs**
```bash
# WordPress Debug-Log
tail -f /path/to/wp-content/debug.log

# PHP Error-Log
tail -f /var/log/php-fpm/error.log

# Nginx Error-Log
tail -f /var/log/nginx/error.log
```

2. [ ] **JavaScript-Errors** (Browser Console)
- New Relic / Sentry Integration (falls vorhanden)
- Manual Spot-Checks in verschiedenen Browsern

3. [ ] **Performance-Metrics**
- Page Load Time (Google Analytics / GTmetrix)
- Script Execution Time (Chrome DevTools)
- Server Response Time (New Relic / Monitoring)

4. [ ] **User-Reports**
- Support-Tickets prüfen
- User-Feedback sammeln
- Bug-Reports monitoren

**Monitoring-Status**: ⬜ No Issues / ⬜ Minor Issues / ⬜ Critical Issues

---

## Rollback-Strategie

### Wann Rollback durchführen?

**SOFORT Rollback bei**:
- ❌ Designer lädt nicht mehr
- ❌ Canvas initialisiert nicht
- ❌ Kritische JavaScript-Errors in Console
- ❌ Save-Funktionalität kaputt
- ❌ Massive User-Complaints

**Evaluiere Rollback bei**:
- ⚠️ Einzelne Browser-Kompatibilitäts-Probleme
- ⚠️ Minor Performance-Degradation
- ⚠️ Einzelne User-Reports

### Rollback-Prozess

**Option A: Quick Rollback (Files wiederherstellen)**

```bash
# SSH into Production
ssh user@production-server
cd /path/to/wp-content/plugins/yprint_designtool/

# Restore from Backup
tar -xzf /backup/location/yprint_designtool_backup_YYYYMMDD_HHMMSS.tar.gz

# Oder restore einzelne Files
cp public/class-octo-print-designer-public.php.backup public/class-octo-print-designer-public.php
cp public/class-octo-print-designer-designer.php.backup public/class-octo-print-designer-designer.php

# Remove neue JS-Files
rm public/js/view-switch-race-condition-fix.js
rm public/js/canvas-resize-coordinate-scaling.js
rm public/js/save-during-load-protection.js

# Clear Caches
wp cache flush
sudo systemctl restart php-fpm
```

**Option B: Git Rollback**

```bash
# SSH into Production
ssh user@production-server
cd /path/to/wp-content/plugins/yprint_designtool/

# Git revert
git log  # Find commit hash of deployment
git revert <commit-hash>
git push production main

# Clear Caches
wp cache flush
sudo systemctl restart php-fpm
```

**Rollback-Zeit**: ~5-10 Minuten

**Rollback durchgeführt**: ⬜ Ja / ⬜ Nein

**Rollback-Grund**: _________________________________

---

## Post-Rollback Actions

Falls Rollback durchgeführt wurde:

1. [ ] **Root-Cause-Analysis**
- Was ist schief gelaufen?
- Warum wurde es nicht in Dev/Staging gefangen?
- Was muss gefixt werden?

2. [ ] **Fix implementieren**
- Fehler in Dev-Branch fixen
- Tests erweitern
- Erneut durch Testing-Checklist

3. [ ] **Re-Deployment planen**
- Neues Deployment-Window festlegen
- Stakeholder informieren
- Erneut diesen Deployment-Guide durchlaufen

---

## Deployment-Kommunikation

### Pre-Deployment Communication

**An**: Development-Team, QA-Team, Product Owner

**Template**:
```
Subject: [DEPLOYMENT] Coordinate Precision Fixes - [DATUM]

Hi Team,

We will be deploying the coordinate precision fixes to production:

**Deployment Window**: [DATUM] [ZEIT]
**Estimated Duration**: 15-30 minutes
**Expected Downtime**: None (no maintenance mode required)

**Changes**:
- View-Switch Race Condition Fix
- Canvas-Resize Coordinate Scaling
- Save-During-Load Protection

**Testing**: All tests passed in Dev/Staging
**Rollback Plan**: Available (5-10 min rollback time)

Please monitor for issues after deployment.

Thanks,
[NAME]
```

---

### Post-Deployment Communication

**An**: Development-Team, QA-Team, Product Owner, Support-Team

**Template (Success)**:
```
Subject: [DEPLOYMENT SUCCESS] Coordinate Precision Fixes

Hi Team,

Deployment completed successfully at [ZEIT].

**Status**: ✅ All systems operational
**Verification**: All smoke-tests passed
**Monitoring**: Active for next 24 hours

Please report any issues immediately.

Thanks,
[NAME]
```

**Template (Issues)**:
```
Subject: [DEPLOYMENT ISSUES] Coordinate Precision Fixes

Hi Team,

Deployment completed but we're observing [ISSUE BESCHREIBUNG].

**Status**: ⚠️ Monitoring for severity
**Action**: [Rollback planned / Hotfix in progress / Investigating]
**ETA**: [TIME]

Will update shortly.

Thanks,
[NAME]
```

---

## Deployment-Checklist Zusammenfassung

### Pre-Deployment
- [x] Code validiert
- [x] Dependencies geprüft
- [ ] Tests abgeschlossen
- [ ] Backups erstellt
- [ ] Deployment-Window geplant

### Deployment
- [ ] Files uploaded
- [ ] Caches cleared
- [ ] Permissions gesetzt
- [ ] Immediate verification durchgeführt

### Post-Deployment
- [ ] Smoke-Tests bestanden
- [ ] Monitoring aktiv
- [ ] Team informiert
- [ ] Rollback-Plan bereit

---

## Lessons Learned (Nach Deployment)

**Was lief gut**: _________________________________

**Was lief nicht gut**: _________________________________

**Verbesserungen für nächstes Deployment**: _________________________________

---

## Sign-Off

**Deployment durchgeführt von**: _________________________

**Datum/Zeit**: _________________________

**Status**: ⬜ Success / ⬜ Success with Issues / ⬜ Rolled Back

**Notes**: _________________________________

---

**Status**: ⬜ Ready for Production Deployment

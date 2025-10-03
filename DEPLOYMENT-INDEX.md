# Canvas Offset Bug - Deployment Documentation Index

**Last Updated**: 2025-10-03
**Architecture**: Architecture A (Minimal Fix)
**Current Status**: Phase 1 COMPLETED / Phases 2-4 PENDING

---

## Quick Navigation

| Document | Purpose | Audience | Size |
|----------|---------|----------|------|
| **DEPLOYMENT-RUNBOOK.md** | Complete deployment manual | All team | 2,187 lines |
| **DEPLOYMENT-QUICK-REFERENCE.md** | Quick reference card | Engineers | 464 lines |
| **AGENT-6-DEPLOYMENT-SUMMARY.md** | Mission summary | Stakeholders | 734 lines |
| **This Index** | Navigation guide | Everyone | You are here |

---

## Start Here

### If you are...

**A Deployment Lead**:
1. Read: `AGENT-6-DEPLOYMENT-SUMMARY.md` (overview)
2. Read: `DEPLOYMENT-RUNBOOK.md` (complete procedures)
3. Use: `DEPLOYMENT-QUICK-REFERENCE.md` (during execution)

**An Engineer Executing Deployment**:
1. Skim: `AGENT-6-DEPLOYMENT-SUMMARY.md` (context)
2. Use: `DEPLOYMENT-QUICK-REFERENCE.md` (commands)
3. Reference: `DEPLOYMENT-RUNBOOK.md` (when you need details)

**A QA Engineer**:
1. Read: Section "Phase 3: Post-Migration Validation" in `DEPLOYMENT-RUNBOOK.md`
2. Use: Testing scenarios in Appendix C
3. Reference: Success criteria in each phase

**A Manager/Stakeholder**:
1. Read: `AGENT-6-DEPLOYMENT-SUMMARY.md` (complete overview)
2. Read: "Executive Summary" in `DEPLOYMENT-RUNBOOK.md`
3. Monitor: Communication timeline (Section 8)

**A Support Team Member**:
1. Read: "Stakeholder Communication" section in `DEPLOYMENT-RUNBOOK.md`
2. Review: "Troubleshooting Guide" (Appendix D)
3. Monitor: Success metrics during Phase 4

---

## Current Deployment Status

### Phase 1: COMPLETED ✓

**Date**: 2025-10-03
**Commit**: `fc3f8b7`
**Status**: Bug stopped spreading

**What was deployed**:
- 1-line JavaScript fix (designer.bundle.js:931)
- PHP offset compensation (class-octo-print-api-integration.php)

**Effect**:
- New designs now save with offset_x = 0 ✓
- Existing corrupted designs unchanged (to be fixed in Phase 3)

**Verification**:
```bash
grep "containerElement = canvasElement.parentNode" \
  /workspaces/yprint_designtool/public/js/dist/designer.bundle.js
# Result: Found on line 931 ✓
```

---

### Phase 2-4: PENDING

**Next Action**: Schedule Phase 2 kickoff meeting

**Timeline**:
- Phase 2: Day 1-3 (8-16 hours) - Migration Development
- Phase 3: Day 4-7 (2-4 hours) - Production Migration
- Phase 4: Day 8-30 (ongoing) - Monitoring

**Total**: ~30 days to mission complete

---

## Key Documents Explained

### 1. DEPLOYMENT-RUNBOOK.md (66 KB, 2,187 lines)

**The Bible** - Complete deployment manual

**Contents**:
- Executive summary with problem/solution
- Current status (Phase 1 done, what's next)
- Detailed timeline (visual + table)
- Phase-by-phase procedures (all 4 phases)
- Pre-deployment checklist (environment, backup, team)
- Monitoring strategy (real-time + post-deployment)
- Rollback procedures (script + nuclear option)
- Stakeholder communication (5 templates)
- Risk mitigation (matrix + strategies)
- Appendices (commands, scenarios, troubleshooting, glossary)

**When to use**:
- Planning deployment
- Executing deployment (step-by-step)
- Troubleshooting issues
- Writing communication
- Post-mortem analysis

**Key sections**:
- Section 4: Phase-by-Phase Deployment (the meat)
- Section 7: Rollback Procedures (emergency)
- Appendix B: Command Reference (copy-paste)
- Appendix D: Troubleshooting Guide (when things go wrong)

---

### 2. DEPLOYMENT-QUICK-REFERENCE.md (12 KB, 464 lines)

**The Cheat Sheet** - Quick reference card

**Contents**:
- Current status at-a-glance
- Phase-by-phase quick commands
- Emergency rollback (5-15 minutes)
- Success metrics checklist
- Common issues & solutions
- Contact information
- Next steps

**When to use**:
- During deployment execution
- Quick status check
- Emergency rollback
- Daily/weekly monitoring

**Key sections**:
- Phase 2/3/4 quick commands (copy-paste)
- Emergency Rollback section (when SHTF)
- Success Metrics table (quick validation)
- Common Issues & Solutions (troubleshooting)

---

### 3. AGENT-6-DEPLOYMENT-SUMMARY.md (19 KB, 734 lines)

**The Executive Summary** - Mission overview

**Contents**:
- Mission objectives and status
- Deliverables overview
- Architecture summary (why A not B/C)
- Current status (Phase 1 done)
- Key commands reference
- Risk assessment
- Success metrics
- Timeline estimate
- Communication plan
- Rollback strategy
- Next steps
- Recommendations

**When to use**:
- First time reading about deployment
- Management briefing
- Stakeholder communication
- Post-deployment review

**Key sections**:
- "Deployment Architecture Summary" (why A)
- "Current Status" (where we are)
- "Success Metrics" (how we measure)
- "Next Steps for Team" (what to do)

---

## Migration Scripts

**Location**: Embedded in `DEPLOYMENT-RUNBOOK.md`

**Scripts Provided**:
1. **migration-offset-correction.php** (150+ lines)
   - Purpose: Correct corrupted design coordinates
   - Features: Dry run, backup, logging, safety checks
   - Location: Section "Phase 2 > Day 1 > Step 1.1"

2. **rollback-offset-migration.php** (80+ lines)
   - Purpose: Rollback migration if needed
   - Features: Confirmation required, restore from backup
   - Location: Section "Phase 2 > Day 1 > Step 1.2"

**How to use**:
1. Copy code from runbook
2. Save to `/var/www/html/` on server
3. Validate syntax: `php -l <script>.php`
4. Test dry run: `wp eval-file migration-offset-correction.php --dry-run=1`
5. Execute: See Phase 3 procedures

---

## Communication Templates

**Location**: `DEPLOYMENT-RUNBOOK.md` Section 8

**Templates Included**:
1. Pre-deployment announcement (T-24h)
2. Deployment started (T-0)
3. Phase complete (T+1h)
4. Migration complete (Day 6)
5. Final report (Day 30)
6. Optional user notification

**How to use**:
1. Copy template from runbook
2. Fill in blanks (dates, names, specifics)
3. Send via appropriate channel (email/Slack)
4. Track responses

---

## Success Criteria

### Phase 2 Success Criteria

- [ ] Migration script created and validated
- [ ] Rollback script created and validated
- [ ] Staging database cloned and tested
- [ ] Migration runs with 0 errors on staging
- [ ] Visual regression tests passed
- [ ] Rollback tested successfully

### Phase 3 Success Criteria

- [ ] Database backup created and verified
- [ ] Migration executes with 0 errors
- [ ] All NEW designs have offset_x ≈ 0
- [ ] 0 visual regressions detected
- [ ] API integration working correctly
- [ ] No errors in logs

### Phase 4 Success Criteria

- [ ] 100% of new designs (Day 0-30) have offset_x = 0
- [ ] 0 support tickets related to offset
- [ ] 0 user complaints
- [ ] API integration 100% success rate
- [ ] No errors in debug logs

**Final Success**: All criteria met → Rollback window CLOSED → Mission COMPLETE

---

## Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Deployment Lead | _________ | _________ |
| Backend Developer | _________ | _________ |
| DevOps Engineer | _________ | _________ |
| QA Engineer | _________ | _________ |
| Support Lead | _________ | _________ |

**Emergency Slack**: #deployment-emergency
**Emergency Email**: devops@company.com

---

## Emergency Rollback

**IF THINGS GO WRONG**:

```bash
# Quick rollback (5-15 minutes)
cd /var/www/html
wp eval-file rollback-offset-migration.php --confirm=1

# Verify
wp option get canvas_offset_migration_stats
# Expected: (empty) or "No value"

# If rollback script fails, nuclear option:
wp db import backup-pre-migration-*.sql
```

**See**: `DEPLOYMENT-QUICK-REFERENCE.md` Section "Emergency Rollback"

---

## Related Documentation

### Background & Analysis

- `AGENT-6-ARCHITECTURE-COMPARISON-DE.md` - Architecture analysis (3 options compared)
- `AGENT-4-EXECUTIVE-SUMMARY-DE.md` - 26.1px discrepancy root cause
- `TECHNICAL-ARCHITECTURE-OFFSET-FIX.md` - Technical architecture

### Previous Deployment

- `PRODUCTION-DEPLOYMENT-RUNBOOK.md` - Original Phase 1 deployment runbook

### Code Changes

- **Commit `fc3f8b7`**: Phase 1 deployment
  - `/public/js/dist/designer.bundle.js` (line 931)
  - `/includes/class-octo-print-api-integration.php` (lines 657-682)

---

## Frequently Asked Questions

### Q: Which document should I read first?

**A**: Depends on your role:
- **Manager**: `AGENT-6-DEPLOYMENT-SUMMARY.md`
- **Engineer**: `DEPLOYMENT-QUICK-REFERENCE.md`
- **Deploying**: `DEPLOYMENT-RUNBOOK.md`

### Q: How long will deployment take?

**A**: 
- **Phase 2**: 8-16 hours (3 days)
- **Phase 3**: 2-4 hours (execution)
- **Phase 4**: 30 days (monitoring)
- **Total**: ~30 days (but production fixed on Day 0)

### Q: Is there any downtime?

**A**: No. All phases are zero-downtime.

### Q: What if migration fails?

**A**: Rollback procedure takes 5-15 minutes. Database backup ensures no data loss.

### Q: Can I test this on staging first?

**A**: Yes. Phase 2 includes full staging testing (required before Phase 3).

### Q: What are the risks?

**A**: Overall risk is LOW-MEDIUM. See "Risk Assessment" in `AGENT-6-DEPLOYMENT-SUMMARY.md`.

### Q: What if we need to rollback?

**A**: Rollback script provided and tested. See "Emergency Rollback" section above.

### Q: Who approves going to production?

**A**: Deployment Lead + Backend Lead + DevOps Manager (minimum). See "Final Recommendation" in summary.

---

## Next Steps

**Immediate (This Week)**:

1. [ ] Review all 3 deployment documents
2. [ ] Assign deployment roles
3. [ ] Fill in contact information (this index + runbook)
4. [ ] Schedule Phase 2 kickoff meeting
5. [ ] Identify low-traffic window for Phase 3

**Phase 2 Preparation (Next Week)**:

1. [ ] Clone production DB to staging
2. [ ] Create migration scripts from runbook
3. [ ] Test on staging
4. [ ] Get stakeholder sign-off

**Phase 3 Execution (Week 3)**:

1. [ ] Schedule migration window
2. [ ] Notify stakeholders (T-24h)
3. [ ] Execute migration
4. [ ] Validate success

**Phase 4 Monitoring (Week 4-7)**:

1. [ ] Daily monitoring (Week 2)
2. [ ] Weekly monitoring (Week 3-4)
3. [ ] Final assessment (Day 30)
4. [ ] Close rollback window

---

## Document Versions

| Document | Version | Last Updated |
|----------|---------|--------------|
| DEPLOYMENT-RUNBOOK.md | 2.0 | 2025-10-03 |
| DEPLOYMENT-QUICK-REFERENCE.md | 2.0 | 2025-10-03 |
| AGENT-6-DEPLOYMENT-SUMMARY.md | 1.0 | 2025-10-03 |
| DEPLOYMENT-INDEX.md | 1.0 | 2025-10-03 |

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-10-03 | Initial deployment documentation created | Agent 6 |
| 2025-10-03 | Phase 1 deployment completed | Agent 7 |

---

**For questions or clarifications, contact the Deployment Lead.**

**Last Updated**: 2025-10-03
**Status**: Phase 1 COMPLETED / Ready for Phase 2

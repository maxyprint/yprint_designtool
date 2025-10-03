# FABRIC.JS LOADING PIPELINE - BEFORE & AFTER FIX

## ❌ VORHER (Broken State - Double Loading)

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER LOADS PAGE                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  vendor.bundle.js (contains Fabric.js)                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  webpack-fabric-loader-optimized.js                         │
│  → Tries to extract Fabric from webpack                     │
│  → Sometimes succeeds, sometimes fails                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    │                   │
              ✅ SUCCESS            ❌ FAILS
                    │                   │
                    ↓                   ↓
        ┌───────────────────┐  ┌──────────────────────┐
        │ Fabric extracted  │  │ Fallback to CDN      │
        │ from webpack      │  │ (PROBLEM!)           │
        └───────────────────┘  └──────────────────────┘
                    │                   ↓
                    │          ┌──────────────────────┐
                    │          │ fabric-global-       │
                    │          │ exposer.js           │
                    │          │ → Also tries CDN     │
                    │          │   fallback!          │
                    │          └──────────────────────┘
                    │                   ↓
                    │          ┌──────────────────────┐
                    │          │ octo-print-designer- │
                    │          │ save-fix             │
                    │          │ → Depends on:        │
                    │          │   'emergency-fabric' │
                    │          │   ❌ NEVER           │
                    │          │      REGISTERED!     │
                    │          └──────────────────────┘
                    │                   ↓
                    │          ┌──────────────────────┐
                    │          │ Preload Hints        │
                    │          │ → emergency-fabric-  │
                    │          │   loader.js          │
                    │          │ → CDN fabric.min.js  │
                    │          └──────────────────────┘
                    │                   ↓
                    └──────────┬────────┘
                               ↓
                    ┌────────────────────┐
                    │  💥 DOUBLE LOAD!   │
                    │                    │
                    │  Webpack Fabric +  │
                    │  CDN Fabric        │
                    │                    │
                    │  = TypeError       │
                    └────────────────────┘
                               ↓
              Cannot read properties of undefined
                    (reading 'extend')
```

---

## ✅ NACHHER (Fixed State - Single Source)

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER LOADS PAGE                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  🔍 DEBUG SYSTEM (Race Condition Analyzer, etc.)            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  vendor.bundle.js (contains Fabric.js)                      │
│  ✅ ONLY SOURCE for Fabric                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  webpack-fabric-loader-optimized.js                         │
│  → Extracts Fabric from webpack bundle                      │
│  → CDN fallback DISABLED                                    │
│  → window.fabric = extracted module                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  fabric-canvas-singleton-public.js                          │
│  → Wraps window.fabric in singleton                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  canvas-initialization-controller-public.js                 │
│  → Controls canvas initialization flow                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  script-load-coordinator-public.js                          │
│  → Coordinates script loading sequence                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  octo-print-designer-save-fix                               │
│  ✅ Depends on: ['jquery']                                  │
│  ✅ Broken 'emergency-fabric' dependency REMOVED            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  designer.bundle.js                                         │
│  → Main designer application                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  webpack-designer-patch.js                                  │
│  → Patches DesignerWidget exposure                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  fabric-global-exposer.js                                   │
│  → Backup exposer (if needed)                               │
│  → CDN fallback DISABLED                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  designer-global-exposer.js                                 │
│  → Exposes DesignerWidget globally                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  ✅ SINGLE FABRIC INSTANCE                                  │
│                                                             │
│  window.fabric = from vendor.bundle.js ONLY                 │
│                                                             │
│  NO CDN fallback                                            │
│  NO emergency loader (public context)                       │
│  NO preload hints for CDN                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ✅ NO CONFLICTS!
                    ✅ NO TypeError!
```

---

## 🔄 ADMIN CONTEXT (Separate Pipeline - CDN Allowed)

```
┌─────────────────────────────────────────────────────────────┐
│           WooCommerce Admin - Design Preview               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  load_preview_only_scripts()                                │
│  (admin/class-octo-print-designer-admin.php line 1023)      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  jquery                                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  emergency-fabric-loader.js                                 │
│  ✅ ONLY in Admin context                                   │
│  → Loads Fabric from CDN                                    │
│  → Bypasses webpack bundle issues                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  optimized-design-data-capture.js                           │
│  → Captures design data for preview                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
                   ✅ Admin Preview Works
                   (CDN allowed in admin only)
```

---

## 📊 KEY DIFFERENCES

| Aspect | VORHER (Broken) | NACHHER (Fixed) |
|--------|-----------------|-----------------|
| **Fabric Sources** | Webpack + CDN (conflict) | Webpack ONLY |
| **save-fix Dependencies** | `['jquery', 'emergency-fabric']` (broken) | `['jquery']` (fixed) |
| **CDN Fallback (Public)** | Enabled in 2+ loaders | DISABLED everywhere |
| **Emergency Loader (Public)** | Sometimes loaded | NEVER loaded |
| **Preload Hints** | CDN + emergency-fabric | Plugin domain only |
| **Admin Context** | Same as public (broken) | Separate pipeline (works) |
| **Error Rate** | High (double-loading) | Zero (single source) |

---

## ✅ VALIDATION CHECKLIST

- [x] Broken dependency `'emergency-fabric'` removed from PHP
- [x] CDN fallback disabled in `fabric-global-exposer.js`
- [x] CDN fallback disabled in `webpack-fabric-loader-optimized.js`
- [x] Emergency loader documented as admin-only
- [x] Preload hints for CDN removed
- [x] Admin context preserved (CDN allowed there)
- [x] Public context enforces webpack-only loading

---

**RESULT**: Clean, single-source Fabric.js loading in public context.  
**NO MORE**: `TypeError: Cannot read properties of undefined (reading 'extend')`

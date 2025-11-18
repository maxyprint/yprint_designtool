# 🚀 YPrint Plugin Quick Start mit Local WP

## 1. ⚡ Sofort-Setup (5 Minuten)

### Local WP Site erstellen:
1. **Local WP öffnen** → "Create a new site"
2. **Site Name**: `yprint-test`
3. **Environment**: Preferred (Latest WordPress, PHP 8.1+)
4. **Username**: `admin`, **Password**: `admin123`

### Plugin installieren:
```bash
# Method 1: Direct Copy (schnellste Option)
cp -r /Users/maxschwarz/Desktop/yprint_designtool ~/Local\ Sites/yprint-test/app/public/wp-content/plugins/

# Method 2: ZIP Upload (alternative)
# ZIP-Datei: /Users/maxschwarz/Desktop/yprint-designtool-plugin.zip
```

## 2. 🎯 Test-Vorbereitung (2 Minuten)

### WordPress Login:
```
URL: https://yprint-test.local/wp-admin
Username: admin
Password: admin123
```

### Plugin aktivieren:
1. Plugins → Installed Plugins
2. "Octo Print Designer" → Activate

### WooCommerce installieren:
1. Plugins → Add New → "WooCommerce"
2. Install & Activate
3. Setup Wizard → alle Standard-Optionen

## 3. 🛒 Test-Produkt erstellen (1 Minute)

### Neues Produkt:
```
Products → Add New
Title: "Design Test Produkt"
Regular Price: 19.99
Product Type: Simple Product
Status: Published
```

### YPrint Designer aktivieren:
```
Scroll down → YPrint Designer Settings
☑️ Enable Designer for this product
Template: (wenn verfügbar auswählen)
Save/Update
```

## 4. 🎯 Design Data Capture Test

### Frontend-Test:
1. **Produkt-Seite öffnen**: `https://yprint-test.local/shop/`
2. **Design Test Produkt** anklicken
3. **"Design anpassen"** Button (falls vorhanden)
4. **Browser-Konsole öffnen**: F12 → Console Tab

### Debug Commands:
```javascript
// System Check
console.log('Fabric:', !!window.fabric);
console.log('Designer:', !!window.designerWidgetInstance);
console.log('Capture:', !!window.productionReadyDesignDataCapture);

// Manual Test
if (window.productionReadyDesignDataCapture) {
    window.productionReadyDesignDataCapture.generateDesignData();
}
```

### Expected Console Output:
```javascript
🎯 Design Data Captured: {
  "template_view_id": "produkt-xyz-vorn",
  "designed_on_area_px": { "width": 500, "height": 625 },
  "elements": [...]
}
```

## 5. 🔧 Troubleshooting

### Plugin nicht sichtbar:
```bash
# Rechte prüfen
chmod -R 755 ~/Local\ Sites/yprint-test/app/public/wp-content/plugins/yprint_designtool

# Plugin-Struktur prüfen
ls -la ~/Local\ Sites/yprint-test/app/public/wp-content/plugins/yprint_designtool/
```

### JavaScript Errors:
1. **Chrome/Safari**: F12 → Console → Filter: "fabric", "designer", "capture"
2. **Häufige Errors**:
   - `fabric is not defined` → Emergency Fabric Loader Problem
   - `designerWidgetInstance is undefined` → Widget Exposure Problem
   - `Cannot read property` → Race Condition

### Designer nicht verfügbar:
1. **Plugin Settings**: WP Admin → Settings → YPrint Designer
2. **Product Settings**: Edit Product → YPrint Designer Metabox
3. **Theme Compatibility**: Check if theme supports shortcodes

## 6. ✅ Success Criteria

**✅ Plugin aktiviert** → WP Admin → Plugins zeigt "Octo Print Designer" als aktiviert
**✅ Designer verfügbar** → Frontend Produkt-Seite zeigt Designer-Interface
**✅ Fabric.js geladen** → Console: `window.fabric` ist definiert
**✅ Data Capture aktiv** → Console: `window.productionReadyDesignDataCapture` existiert
**✅ JSON Output** → Bei Designer-Aktionen erscheint JSON in Console

---

## 🎯 Ziel erreicht wenn:
**Jede Design-Aktion im Canvas wird als vollständiges JSON-Objekt in der Browser-Konsole geloggt!**

**Local WP Vorteile:**
- ✅ Keine Crashes wie WordPress Playground
- ✅ Vollständige Plugin-Unterstützung
- ✅ Echte WordPress-Umgebung
- ✅ Debugging-Tools verfügbar
- ✅ Stabile Performance
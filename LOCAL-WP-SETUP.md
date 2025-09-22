# 🚀 Local WP Setup für YPrint Design Data Capture Test

## 1. Local WP Installation
Falls noch nicht installiert:
1. Download von https://localwp.com/
2. Installieren und starten

## 2. Neue WordPress Site erstellen

### Site Details:
- **Site Name**: `yprint-test`
- **Domain**: `yprint-test.local`
- **WordPress Version**: Latest
- **PHP Version**: 8.1+
- **Database**: MySQL

### WooCommerce Installation:
1. Nach Site-Erstellung: Dashboard öffnen
2. Plugins → Add New → "WooCommerce" suchen
3. WooCommerce installieren und aktivieren
4. Setup Wizard durchlaufen (Standard-Einstellungen)

## 3. YPrint Plugin Installation

### Methode 1: Plugin-Ordner kopieren
```bash
# Aktuelles Plugin-Verzeichnis kopieren
cp -r /Users/maxschwarz/Desktop/yprint_designtool ~/Local\ Sites/yprint-test/app/public/wp-content/plugins/yprint-designtool
```

### Methode 2: ZIP-Installation
1. Plugin als ZIP exportieren
2. WordPress Admin → Plugins → Add New → Upload Plugin
3. ZIP-Datei hochladen und aktivieren

## 4. Test-Produkt erstellen

### WooCommerce Produkt:
1. Products → Add New
2. **Title**: "Test Design Produkt"
3. **Product Type**: Simple Product
4. **Price**: 19.99
5. **Description**: "Test-Produkt für Design Data Capture"
6. Publish

### YPrint Designer aktivieren:
1. Produkt bearbeiten
2. YPrint Designer Metabox konfigurieren
3. Template auswählen (falls verfügbar)

## 5. Design Data Capture Test

### Test-Szenario:
1. Frontend: Produkt-Seite öffnen
2. Designer öffnen
3. Browser-Konsole öffnen (F12)
4. Design-Elemente hinzufügen:
   - Bilder hochladen
   - Text hinzufügen
   - Formen erstellen
5. "Speichern" klicken
6. **Erwartung**: JSON-Objekt in Konsole

### Expected Output:
```json
{
  "template_view_id": "produkt-xyz-vorn",
  "designed_on_area_px": { "width": 500, "height": 625 },
  "elements": [
    {
      "type": "image",
      "src": "https://yprint-test.local/wp-content/uploads/bild.jpg",
      "x": 50,
      "y": 75,
      "width": 200,
      "height": 180,
      "scaleX": 1.2,
      "scaleY": 1.2,
      "angle": 15
    }
  ]
}
```

## 6. Troubleshooting

### Plugin nicht sichtbar:
- WordPress Admin → Plugins prüfen
- PHP-Fehler in Local WP Logs prüfen
- Plugin-Verzeichnis-Rechte prüfen

### Designer lädt nicht:
- Browser-Konsole auf Errors prüfen
- Fabric.js CDN-Verbindung prüfen
- Emergency Fabric Loader aktiviert?

### Kein JSON Output:
- Console.log-Filter: "Design Data Captured"
- production-ready-design-data-capture.js geladen?
- Fabric Canvas initialisiert?

## 7. Debug-Tools

### Browser-Konsole Commands:
```javascript
// System Status prüfen
console.log('Fabric:', !!window.fabric);
console.log('Designer:', !!window.designerWidgetInstance);
console.log('Capture:', !!window.productionReadyDesignDataCapture);

// Manual Test
if (window.productionReadyDesignDataCapture) {
  window.productionReadyDesignDataCapture.generateDesignData();
}
```

### Logs Location:
- **Local WP Logs**: Site → Open Site Shell → `tail -f wp-content/debug.log`
- **Browser Console**: F12 → Console
- **Network Tab**: F12 → Network (für fehlende JS-Files)

---

**Ziel**: JSON-Objekt wird bei jedem "Speichern"-Klick in Browser-Konsole geloggt
**Success Criteria**: Alle Design-Elemente werden vollständig erfasst und korrekt formatiert
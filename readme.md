# YPrint DesignTool

Ein WordPress-Plugin für die Erstellung und Bearbeitung von Designs für Print-on-Demand-Streetwear.

## Beschreibung

YPrint DesignTool ist ein leistungsstarkes WordPress-Plugin, das ein browserbasiertes Design-Tool für die Erstellung von Grafiken für Streetwear-Artikel wie T-Shirts, Hoodies und Caps bietet. Es ermöglicht Benutzern, Designs zu erstellen, zu bearbeiten und zu exportieren, ohne eine externe Grafiksoftware zu benötigen.

## Funktionen

* **Vektorbearbeitung**: Bearbeiten von SVG-Grafiken direkt im Browser
* **Vektorisierung**: Konvertieren von Rasterbildern in Vektorgrafiken
* **Text- und Typografie**: Hinzufügen und Gestalten von Text mit verschiedenen Schriftarten
* **Pfadoperationen**: Vereinigen, Subtrahieren, Schnittmenge und Ausschluss von Formen
* **Farboptionen**: Umfangreiche Farbpaletten, Verläufe und Transparenzeinstellungen
* **Export-Möglichkeiten**: Exportieren von Designs als SVG, PNG und andere Formate

## Installation

1. Lade den Ordner `yprint-designtool` in das Verzeichnis `/wp-content/plugins/` hoch
2. Aktiviere das Plugin über das Menü 'Plugins' in WordPress
3. Platziere den Shortcode `[yprint_designtool]` auf einer beliebigen Seite, um das DesignTool anzuzeigen

## Shortcode-Optionen

Du kannst das DesignTool mit verschiedenen Optionen anpassen:

```
[yprint_designtool width="100%" height="600px" mode="standard" tools="all" products="" template=""]
```

* **width**: Breite des DesignTools (Standard: 100%)
* **height**: Höhe des DesignTools (Standard: 600px)
* **mode**: Modus des DesignTools (standard, simple, advanced)
* **tools**: Verfügbare Werkzeuge (all, basic, text, image, shape)
* **products**: Kommagetrennte Liste von Produkt-IDs für Produktvorschau
* **template**: Vorlage, die beim Start geladen werden soll

## Systemanforderungen

* WordPress 5.0 oder höher
* PHP 7.2 oder höher
* Moderner Webbrowser (Chrome, Firefox, Safari, Edge)

## Entwicklung

Das YPrint DesignTool wird schrittweise entwickelt. In zukünftigen Versionen sind weitere Funktionen geplant:

* Erweiterte Pfadbearbeitung
* Ebenen-Management
* Collaboration-Tools
* KI-unterstützte Design-Optimierung
* Integration mit Print-on-Demand-Diensten

## Lizenz

Dieses Plugin ist unter der GPLv2 oder später lizenziert.
<?php
/**
 * YPrint Data Pipeline Analysis - Analyse der Daten-Pipeline
 * 
 * Dieses Script analysiert, wie das System die korrekten Werte für die millimetergenaue Vorschau findet
 * und zeigt die komplette Daten-Pipeline von der Erfassung bis zur Speicherung.
 */

// WordPress-Umgebung laden
require_once('../../../wp-config.php');

echo "<h1>🔍 YPrint Data Pipeline Analysis</h1>\n";
echo "<h2>Wie das System die korrekten Werte für die Vorschau findet</h2>\n";

global $wpdb;

echo "<h3>📊 Daten-Pipeline Übersicht</h3>\n";
echo "<div style='background: #f0f8ff; padding: 15px; border-left: 4px solid #0073aa; margin: 10px 0;'>\n";
echo "<h4>Phase 1: Daten-Erfassung und -Berechnung</h4>\n";
echo "<ol>\n";
echo "<li><strong>Canvas-Erfassung:</strong> Design-Elemente mit Pixel-Koordinaten → <code>_print_design</code></li>\n";
echo "<li><strong>Referenzmessungen:</strong> Template-Kalibrierung → <code>_template_view_print_areas</code></li>\n";
echo "<li><strong>Pixel-zu-Millimeter-Konvertierung:</strong> Dynamischer Multiplikator aus Referenzmessungen</li>\n";
echo "<li><strong>Größenskalierung:</strong> Size-Scale-Factor aus Produktdimensionen</li>\n";
echo "<li><strong>Speicherung:</strong> Finale Millimeter-Werte → <code>_yprint_final_coordinates</code></li>\n";
echo "</ol>\n";
echo "</div>\n";

echo "<h3>🔍 SQL-Gegenprüfung der Datenquellen</h3>\n";

// 1. ANALYSE: Wo werden Template-Bilder gespeichert?
echo "<h4>1. 📸 Template-Bilder Speicherorte</h4>\n";

$template_image_sources = $wpdb->get_results("
    SELECT DISTINCT meta_key, COUNT(*) as count
    FROM {$wpdb->postmeta} 
    WHERE meta_key LIKE '%template%image%' 
    OR meta_key LIKE '%template%variation%'
    OR meta_key LIKE '%attachment%'
    GROUP BY meta_key
    ORDER BY count DESC
");

echo "<table border='1' style='border-collapse: collapse; width: 100%;'>\n";
echo "<tr><th>Meta-Key</th><th>Anzahl Einträge</th><th>Beschreibung</th></tr>\n";
foreach ($template_image_sources as $row) {
    $description = "";
    switch ($row->meta_key) {
        case '_template_variations':
            $description = "Hauptquelle für Template-Bilder (views → image/attachment_id)";
            break;
        case '_template_image_path':
            $description = "Fallback: Pfad zum Template-Bild";
            break;
        case '_template_image_id':
            $description = "Fallback: Direkte Attachment-ID";
            break;
        default:
            $description = "Mögliche Template-Bild-Quelle";
    }
    echo "<tr><td>{$row->meta_key}</td><td>{$row->count}</td><td>{$description}</td></tr>\n";
}
echo "</table>\n";

// 2. ANALYSE: Wo werden Referenzmessungen gespeichert?
echo "<h4>2. 📏 Referenzmessungen Speicherorte</h4>\n";

$reference_sources = $wpdb->get_results("
    SELECT DISTINCT meta_key, COUNT(*) as count
    FROM {$wpdb->postmeta} 
    WHERE meta_key LIKE '%template%view%print%'
    OR meta_key LIKE '%reference%'
    OR meta_key LIKE '%measurement%'
    GROUP BY meta_key
    ORDER BY count DESC
");

echo "<table border='1' style='border-collapse: collapse; width: 100%;'>\n";
echo "<tr><th>Meta-Key</th><th>Anzahl Einträge</th><th>Beschreibung</th></tr>\n";
foreach ($reference_sources as $row) {
    $description = "";
    switch ($row->meta_key) {
        case '_template_view_print_areas':
            $description = "Hauptquelle für Referenzmessungen (measurements → reference_measurement)";
            break;
        case '_template_measurements':
            $description = "Alternative Quelle für Messungen";
            break;
        default:
            $description = "Mögliche Referenzmessungs-Quelle";
    }
    echo "<tr><td>{$row->meta_key}</td><td>{$row->count}</td><td>{$description}</td></tr>\n";
}
echo "</table>\n";

// 3. ANALYSE: Wo werden finale Koordinaten gespeichert?
echo "<h4>3. 🎯 Finale Koordinaten Speicherorte</h4>\n";

$final_coords_sources = $wpdb->get_results("
    SELECT DISTINCT meta_key, COUNT(*) as count
    FROM {$wpdb->postmeta} 
    WHERE meta_key LIKE '%yprint%final%'
    OR meta_key LIKE '%yprint%workflow%'
    OR meta_key LIKE '%final%coordinate%'
    GROUP BY meta_key
    ORDER BY count DESC
");

echo "<table border='1' style='border-collapse: collapse; width: 100%;'>\n";
echo "<tr><th>Meta-Key</th><th>Anzahl Einträge</th><th>Beschreibung</th></tr>\n";
foreach ($final_coords_sources as $row) {
    $description = "";
    switch ($row->meta_key) {
        case '_yprint_final_coordinates':
            $description = "Hauptquelle für finale Druckkoordinaten (x_mm, y_mm, width_mm, height_mm)";
            break;
        case '_yprint_workflow_data':
            $description = "Workflow-Schritte mit final_coordinates in step5/step6";
            break;
        default:
            $description = "Mögliche finale Koordinaten-Quelle";
    }
    echo "<tr><td>{$row->meta_key}</td><td>{$row->count}</td><td>{$description}</td></tr>\n";
}
echo "</table>\n";

// 4. ANALYSE: Wo werden Produktdimensionen gespeichert?
echo "<h4>4. 📐 Produktdimensionen Speicherorte</h4>\n";

$product_dimensions_sources = $wpdb->get_results("
    SELECT DISTINCT meta_key, COUNT(*) as count
    FROM {$wpdb->postmeta} 
    WHERE meta_key LIKE '%product%dimension%'
    OR meta_key LIKE '%template%dimension%'
    OR meta_key LIKE '%measurement%table%'
    GROUP BY meta_key
    ORDER BY count DESC
");

echo "<table border='1' style='border-collapse: collapse; width: 100%;'>\n";
echo "<tr><th>Meta-Key</th><th>Anzahl Einträge</th><th>Beschreibung</th></tr>\n";
foreach ($product_dimensions_sources as $row) {
    $description = "";
    switch ($row->meta_key) {
        case '_template_product_dimensions':
            $description = "Hauptquelle für Produktdimensionen (S, M, L, XL → chest, height, shoulder)";
            break;
        case '_product_dimensions':
            $description = "Alternative Quelle für Produktdimensionen";
            break;
        case '_template_measurements_table':
            $description = "Messungstabelle mit Größen-Dimensionen";
            break;
        default:
            $description = "Mögliche Produktdimensionen-Quelle";
    }
    echo "<tr><td>{$row->meta_key}</td><td>{$row->count}</td><td>{$description}</td></tr>\n";
}
echo "</table>\n";

// 5. ANALYSE: Order-Items mit YPrint-Daten
echo "<h4>5. 🛒 Order-Items mit YPrint-Daten</h4>\n";

$order_items_yprint = $wpdb->get_results("
    SELECT DISTINCT meta_key, COUNT(*) as count
    FROM {$wpdb->prefix}woocommerce_order_itemmeta 
    WHERE meta_key LIKE '%yprint%'
    OR meta_key LIKE '%print%design%'
    GROUP BY meta_key
    ORDER BY count DESC
");

echo "<table border='1' style='border-collapse: collapse; width: 100%;'>\n";
echo "<tr><th>Meta-Key</th><th>Anzahl Einträge</th><th>Beschreibung</th></tr>\n";
foreach ($order_items_yprint as $row) {
    $description = "";
    switch ($row->meta_key) {
        case '_yprint_template_id':
            $description = "Template-ID für Order-Item";
            break;
        case '_yprint_final_coordinates':
            $description = "Finale Koordinaten im Order-Item";
            break;
        case '_print_design':
            $description = "Design-Daten (Canvas-Elemente)";
            break;
        default:
            $description = "YPrint-bezogene Order-Item-Daten";
    }
    echo "<tr><td>{$row->meta_key}</td><td>{$row->count}</td><td>{$description}</td></tr>\n";
}
echo "</table>\n";

// 6. DATEN-PIPELINE FLOWCHART
echo "<h3>🔄 Daten-Pipeline Flowchart</h3>\n";
echo "<div style='background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>\n";
echo "<h4>Vollständiger Datenfluss:</h4>\n";
echo "<ol>\n";
echo "<li><strong>Canvas-Erfassung:</strong><br>\n";
echo "   Design-Elemente → <code>_print_design</code> (Order-Item-Meta)<br>\n";
echo "   <em>Enthält: Pixel-Koordinaten, Element-Typen, Transform-Daten</em></li>\n";

echo "<li><strong>Template-Kalibrierung:</strong><br>\n";
echo "   Referenzmessungen → <code>_template_view_print_areas</code> (Template-Meta)<br>\n";
echo "   <em>Enthält: reference_points, physical_size_cm, pixel_distance</em></li>\n";

echo "<li><strong>Pixel-zu-Millimeter-Konvertierung:</strong><br>\n";
echo "   Multiplikator = physical_size_cm / pixel_distance<br>\n";
echo "   <em>Berechnet: Millimeter-Koordinaten aus Pixel-Koordinaten</em></li>\n";

echo "<li><strong>Größenskalierung:</strong><br>\n";
echo "   Produktdimensionen → <code>_template_product_dimensions</code> (Template-Meta)<br>\n";
echo "   <em>Enthält: S, M, L, XL → chest, height, shoulder in cm</em></li>\n";

echo "<li><strong>Finale Speicherung:</strong><br>\n";
echo "   Workflow-Ergebnis → <code>_yprint_workflow_data</code> (Order-Meta)<br>\n";
echo "   Finale Koordinaten → <code>_yprint_final_coordinates</code> (Order-Meta)<br>\n";
echo "   <em>Enthält: x_mm, y_mm, width_mm, height_mm, dpi</em></li>\n";

echo "<li><strong>Vorschau-Abruf:</strong><br>\n";
echo "   Alle Daten werden abgerufen und mathematisch korrekt visualisiert<br>\n";
echo "   <em>Formel: px = (x_mm / product_width_mm) * preview_width_px</em></li>\n";
echo "</ol>\n";
echo "</div>\n";

// 7. KRITISCHE ERKENNTNISSE
echo "<h3>🚨 Kritische Erkenntnisse für die Vorschau</h3>\n";
echo "<div style='background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 10px 0;'>\n";
echo "<h4>Die Vorschau muss folgende Datenquellen in dieser Priorität verwenden:</h4>\n";
echo "<ol>\n";
echo "<li><strong>Template-Bilder:</strong> <code>_template_variations</code> → views → image/attachment_id</li>\n";
echo "<li><strong>Referenzmessungen:</strong> <code>_template_view_print_areas</code> → measurements → reference_measurement</li>\n";
echo "<li><strong>Finale Koordinaten:</strong> <code>_yprint_workflow_data</code> → workflow_steps → step6/step5 → final_coordinates</li>\n";
echo "<li><strong>Produktdimensionen:</strong> <code>_template_product_dimensions</code> → size → chest/height/shoulder</li>\n";
echo "</ol>\n";
echo "</div>\n";

echo "<h3>✅ Fazit</h3>\n";
echo "<p>Das System hat eine klare, hierarchische Datenstruktur. Die Vorschau muss diese Struktur respektieren und die Daten in der korrekten Priorität abrufen, um eine millimetergenaue Darstellung zu gewährleisten.</p>\n";
echo "<p><strong>Wichtig:</strong> Die Vorschau darf keine eigenen Berechnungen durchführen, sondern muss die bereits berechneten und gespeicherten Werte verwenden.</p>\n";
?>

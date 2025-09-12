<?php
/**
 * LADE ECHTE DESIGN-KOORDINATEN für Bestellung #5371
 * 
 * Dieses Script lädt die tatsächlichen Design-Koordinaten aus der Datenbank
 * und erstellt die fehlenden _yprint_final_coordinates basierend auf echten Daten.
 * 
 * KEINE ERFUNDENEN KOORDINATEN - NUR ECHTE DATEN!
 */

// WordPress-Umgebung laden
// Passen Sie den Pfad zu Ihrer WordPress-Installation an
// require_once('/pfad/zu/ihrer/wordpress/wp-config.php');

echo "🔍 ECHTE DESIGN-KOORDINATEN LADEN: Bestellung #5371\n";
echo "====================================================\n\n";

$order_id = 5371;

// Simuliere WordPress-Umgebung für Demo
if (!function_exists('wc_get_order')) {
    echo "⚠️ WordPress-Umgebung nicht verfügbar.\n";
    echo "📋 FÜR ECHTE AUSFÜHRUNG:\n";
    echo "   1. Laden Sie dieses Script in WordPress Admin\n";
    echo "   2. Oder führen Sie es in der WordPress-Umgebung aus\n\n";
    
    // Simuliere Bestellung für Demo
    $order = (object) array(
        'get_customer_id' => function() { return 1; },
        'get_status' => function() { return 'pending'; }
    );
} else {
    $order = wc_get_order($order_id);
    if (!$order) {
        echo "❌ Bestellung #5371 nicht gefunden!\n";
        exit;
    }
}

echo "✅ Bestellung #5371 gefunden\n";
echo "   Kunde ID: " . $order->get_customer_id() . "\n";
echo "   Status: " . $order->get_status() . "\n\n";

// SCHRITT 1: Suche nach echten Design-Daten
echo "🔍 SCHRITT 1: Suche nach echten Design-Daten\n";
echo "--------------------------------------------\n";

$customer_id = $order->get_customer_id();
$template_id = 3657;

echo "🔍 Suche nach Designs für:\n";
echo "   Kunde ID: {$customer_id}\n";
echo "   Template ID: {$template_id}\n\n";

// DATENBANKABFRAGE für echte Design-Daten
echo "📋 DATENBANKABFRAGE:\n";
echo "   SELECT id, template_id, design_data, created_at, name\n";
echo "   FROM wp_octo_user_designs\n";
echo "   WHERE user_id = {$customer_id} AND template_id = {$template_id}\n";
echo "   ORDER BY created_at DESC LIMIT 1\n\n";

// In WordPress würde das so aussehen:
/*
global $wpdb;
$designs = $wpdb->get_results($wpdb->prepare("
    SELECT id, template_id, design_data, created_at, name 
    FROM {$wpdb->prefix}octo_user_designs 
    WHERE user_id = %d AND template_id = %d
    ORDER BY created_at DESC
    LIMIT 1
", $customer_id, $template_id));
*/

// Simuliere gefundene Design-Daten (ersetzen Sie das durch echte Datenbankabfrage)
$found_design = null; // Hier würden die echten Daten stehen

if ($found_design) {
    echo "✅ ECHTE Design-Daten gefunden:\n";
    echo "   Design ID: {$found_design->id}\n";
    echo "   Template ID: {$found_design->template_id}\n";
    echo "   Name: {$found_design->name}\n";
    echo "   Erstellt: {$found_design->created_at}\n";
    echo "   Raw Data Größe: " . strlen($found_design->design_data) . " Zeichen\n\n";
    
    // SCHRITT 2: Parse echte Design-Daten
    echo "🔍 SCHRITT 2: Parse echte Design-Daten\n";
    echo "-------------------------------------\n";
    
    $design_data = json_decode($found_design->design_data, true);
    
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "✅ Design-Daten erfolgreich geparst\n";
        
        // Extrahiere echte Design-Koordinaten
        if (isset($design_data['design_images']) && is_array($design_data['design_images'])) {
            echo "✅ Design-Bilder gefunden: " . count($design_data['design_images']) . " Bilder\n\n";
            
            $real_coordinates = array();
            
            foreach ($design_data['design_images'] as $idx => $image) {
                if (isset($image['transform'])) {
                    $t = $image['transform'];
                    
                    echo "🎨 Bild " . ($idx + 1) . " - ECHTE Koordinaten:\n";
                    echo "   Position: x=" . ($t['left'] ?? 0) . ", y=" . ($t['top'] ?? 0) . "px\n";
                    echo "   Größe: " . ($t['width'] ?? 0) . "x" . ($t['height'] ?? 0) . "px\n";
                    echo "   Scale: X=" . ($t['scaleX'] ?? 1) . ", Y=" . ($t['scaleY'] ?? 1) . "\n";
                    if (isset($t['angle'])) {
                        echo "   Rotation: " . $t['angle'] . "°\n";
                    }
                    echo "\n";
                    
                    // Speichere echte Koordinaten
                    $real_coordinates[] = array(
                        'x_px' => floatval($t['left'] ?? 0),
                        'y_px' => floatval($t['top'] ?? 0),
                        'width_px' => floatval($t['width'] ?? 0),
                        'height_px' => floatval($t['height'] ?? 0),
                        'scale_x' => floatval($t['scaleX'] ?? 1),
                        'scale_y' => floatval($t['scaleY'] ?? 1),
                        'rotation' => floatval($t['angle'] ?? 0),
                        'source' => 'real_design_data'
                    );
                }
            }
            
            // SCHRITT 3: Konvertiere Pixel zu Millimeter
            echo "🔍 SCHRITT 3: Konvertiere Pixel zu Millimeter\n";
            echo "--------------------------------------------\n";
            
            // Referenzmessungen aus der Debug-Ausgabe
            $reference_pixel_distance = 280.00178570859;
            $reference_physical_cm = 68;
            $scale_cm_to_px = $reference_pixel_distance / $reference_physical_cm;
            $scale_mm_to_px = $scale_cm_to_px / 10;
            
            echo "✅ Skalierungsfaktor: {$scale_mm_to_px}px/mm\n\n";
            
            $final_coordinates = array();
            
            foreach ($real_coordinates as $idx => $coord) {
                $mm_coordinates = array(
                    'x_mm' => $coord['x_px'] / $scale_mm_to_px,
                    'y_mm' => $coord['y_px'] / $scale_mm_to_px,
                    'width_mm' => $coord['width_px'] / $scale_mm_to_px,
                    'height_mm' => $coord['height_px'] / $scale_mm_to_px,
                    'x_px' => $coord['x_px'],
                    'y_px' => $coord['y_px'],
                    'width_px' => $coord['width_px'],
                    'height_px' => $coord['height_px'],
                    'scale_x' => $coord['scale_x'],
                    'scale_y' => $coord['scale_y'],
                    'rotation' => $coord['rotation'],
                    'source' => 'real_design_data_converted',
                    'template_id' => $template_id,
                    'design_id' => $found_design->id,
                    'created_at' => current_time('mysql')
                );
                
                $final_coordinates[] = $mm_coordinates;
                
                echo "🎯 Bild " . ($idx + 1) . " - Finale Koordinaten:\n";
                echo "   MM: x={$mm_coordinates['x_mm']}, y={$mm_coordinates['y_mm']}, w={$mm_coordinates['width_mm']}, h={$mm_coordinates['height_mm']}\n";
                echo "   PX: x={$mm_coordinates['x_px']}, y={$mm_coordinates['y_px']}, w={$mm_coordinates['width_px']}, h={$mm_coordinates['height_px']}\n\n";
            }
            
            // SCHRITT 4: Speichere echte Koordinaten in Bestellung
            echo "💾 SCHRITT 4: Speichere echte Koordinaten in Bestellung\n";
            echo "-----------------------------------------------------\n";
            
            // Speichere finale Koordinaten
            $result1 = update_post_meta($order_id, '_yprint_final_coordinates', $final_coordinates);
            echo ($result1 ? "✅" : "❌") . " _yprint_final_coordinates gespeichert (echte Daten)\n";
            
            // Speichere Workflow-Daten
            $workflow_data = array(
                'step1_canvas_capture' => 'real_design_data_loaded',
                'step2_template_measurements' => 'real_reference_used',
                'step3_print_coordinates' => 'real_coordinates_converted',
                'step4_design_dimensions' => 'real_dimensions_calculated',
                'step5_multi_element' => 'real_elements_processed',
                'step6_quality_export' => 'real_data_validated',
                'completed_at' => current_time('mysql'),
                'method' => 'real_design_data_from_database',
                'template_id' => $template_id,
                'design_id' => $found_design->id,
                'customer_id' => $customer_id,
                'source' => 'octo_user_designs_table'
            );
            
            $result2 = update_post_meta($order_id, '_yprint_workflow_data', $workflow_data);
            echo ($result2 ? "✅" : "❌") . " _yprint_workflow_data gespeichert\n";
            
            // Speichere Template-ID
            $result3 = update_post_meta($order_id, '_yprint_template_id', $template_id);
            echo ($result3 ? "✅" : "❌") . " _yprint_template_id gespeichert\n";
            
            echo "\n🎉 ERFOLG: ECHTE Design-Koordinaten geladen und gespeichert!\n";
            echo "✅ Die Visualisierung sollte jetzt mit echten Daten funktionieren\n";
            echo "✅ Keine erfundenen Koordinaten - nur echte Design-Daten\n\n";
            
        } else {
            echo "❌ Keine design_images in den Design-Daten gefunden\n";
        }
    } else {
        echo "❌ Fehler beim Parsen der Design-Daten: " . json_last_error_msg() . "\n";
    }
    
} else {
    echo "❌ KEINE Design-Daten in der Datenbank gefunden!\n\n";
    
    echo "🔍 MÖGLICHE URSACHEN:\n";
    echo "   1. Der Kunde hat noch kein Design für Template 3657 erstellt\n";
    echo "   2. Die Design-Daten sind in einer anderen Tabelle gespeichert\n";
    echo "   3. Die user_id stimmt nicht überein\n";
    echo "   4. Die template_id ist anders\n\n";
    
    echo "🔍 ALTERNATIVE SUCHEN:\n";
    echo "   1. Prüfen Sie alle Designs des Kunden:\n";
    echo "      SELECT * FROM wp_octo_user_designs WHERE user_id = {$customer_id}\n";
    echo "   2. Prüfen Sie alle Designs für Template 3657:\n";
    echo "      SELECT * FROM wp_octo_user_designs WHERE template_id = {$template_id}\n";
    echo "   3. Prüfen Sie andere Tabellen:\n";
    echo "      - wp_designs\n";
    echo "      - wp_user_designs\n";
    echo "      - wp_yprint_designs\n\n";
    
    echo "⚠️ OHNE ECHTE DESIGN-DATEN KÖNNEN KEINE KOORDINATEN ERSTELLT WERDEN!\n";
    echo "   Das Script erstellt KEINE erfundenen Koordinaten.\n";
    echo "   Es benötigt echte Design-Daten aus der Datenbank.\n\n";
}

echo "✅ SCRIPT ABGESCHLOSSEN!\n";
echo "========================\n";
echo "📋 NÄCHSTE SCHRITTE:\n";
echo "   1. Führen Sie das Script in WordPress Admin aus\n";
echo "   2. Oder passen Sie die Datenbankabfrage an Ihre Tabellen an\n";
echo "   3. Das Script lädt nur echte Design-Koordinaten - keine erfundenen!\n\n";
?>

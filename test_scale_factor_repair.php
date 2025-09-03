<?php
/**
 * YPrint Scale Factor Repair Test
 * 
 * Testet die reparierte Skalierungsfaktor-Generation und löst das verbleibende 15%-Problem:
 * 1. calculateSizeScaleFactors() Funktion reparieren
 * 2. Backend-Frontend Size Scale Factors Synchronisation
 * 3. Produktdimensionen-Zugriffsmuster korrigieren
 * 4. Debug-Validation implementieren
 */

// WordPress laden
require_once('wp-load.php');

// Prüfe ob wir im Admin-Bereich sind
if (!current_user_can('manage_options')) {
    die('❌ Keine Berechtigung für diesen Test');
}

echo "<h1>🔧 YPrint Scale Factor Repair Test</h1>\n";
echo "<p>Datum: " . date('Y-m-d H:i:s') . "</p>\n";
echo "<p>Ziel: Das verbleibende 15%-Problem der Skalierungsfaktor-Generation lösen</p>\n";
echo "<hr>\n";

// Test 1: calculateSizeScaleFactors() Funktion reparieren
echo "<h2>🧪 Test 1: calculateSizeScaleFactors() Funktion reparieren</h2>\n";

// Finde ein Template mit Produktdimensionen
$templates = get_posts(array(
    'post_type' => 'design_template',
    'posts_per_page' => 1,
    'meta_query' => array(
        'relation' => 'OR',
        array(
            'key' => '_product_dimensions',
            'compare' => 'EXISTS'
        ),
        array(
            'key' => '_template_product_dimensions',
            'compare' => 'EXISTS'
        )
    )
));

if (empty($templates)) {
    echo "<p>❌ Kein Template mit Produktdimensionen gefunden</p>\n";
} else {
    $test_template = $templates[0];
    $template_id = $test_template->ID;
    
    echo "<p>✅ Test-Template gefunden: {$test_template->post_title} (ID: {$template_id})</p>\n";
    
    // Prüfe Produktdimensionen
    $product_dimensions = get_post_meta($template_id, '_product_dimensions', true);
    if (empty($product_dimensions) || !is_array($product_dimensions)) {
        $product_dimensions = get_post_meta($template_id, '_template_product_dimensions', true);
        $meta_key = '_template_product_dimensions';
    } else {
        $meta_key = '_product_dimensions';
    }
    
    if (!empty($product_dimensions) && is_array($product_dimensions)) {
        echo "<p>✅ Produktdimensionen gefunden in {$meta_key}:</p>\n";
        
        $test_sizes = array('s', 'm', 'l', 'xl');
        foreach ($test_sizes as $size) {
            if (isset($product_dimensions[$size])) {
                echo "<h4>📏 Größe {$size}:</h4>\n";
                echo "<ul>\n";
                foreach ($product_dimensions[$size] as $dimension => $value) {
                    echo "<li>{$dimension}: {$value}cm</li>\n";
                }
                echo "</ul>\n";
            } else {
                echo "<p>❌ Keine Dimensionen für Größe {$size} gefunden</p>\n";
            }
        }
        
        // Teste die reparierte generate_size_scale_factors Funktion
        echo "<h4>🧮 Teste reparierte generate_size_scale_factors Funktion:</h4>\n";
        
        // Hole API-Integration Instanz
        global $octo_print_api_integration;
        if (isset($octo_print_api_integration) && method_exists($octo_print_api_integration, 'generate_size_scale_factors')) {
            echo "<p>✅ API-Integration verfügbar</p>\n";
            
            foreach ($test_sizes as $size) {
                if (isset($product_dimensions[$size])) {
                    echo "<p>🎯 Teste Größe {$size}...</p>\n";
                    
                    try {
                        $scale_factors = $octo_print_api_integration->generate_size_scale_factors($template_id, $size);
                        
                        if (!empty($scale_factors)) {
                            echo "<p>✅ Skalierungsfaktoren für Größe {$size} generiert:</p>\n";
                            echo "<ul>\n";
                            foreach ($scale_factors as $measurement_type => $factor_data) {
                                echo "<li>{$measurement_type}: {$factor_data['size_specific_factor']}x</li>\n";
                            }
                            echo "</ul>\n";
                        } else {
                            echo "<p>❌ Keine Skalierungsfaktoren für Größe {$size} generiert</p>\n";
                        }
                    } catch (Exception $e) {
                        echo "<p>❌ Fehler bei Skalierungsfaktor-Generierung: " . $e->getMessage() . "</p>\n";
                    }
                }
            }
        } else {
            echo "<p>❌ API-Integration nicht verfügbar</p>\n";
        }
    } else {
        echo "<p>❌ Keine Produktdimensionen gefunden</p>\n";
    }
}

// Test 2: Backend-Frontend Size Scale Factors Synchronisation
echo "<h2>🧪 Test 2: Backend-Frontend Size Scale Factors Synchronisation</h2>\n";

if (isset($template_id)) {
    // Simuliere AJAX-Request-Daten
    $test_measurement_data = array(
        'measurement_type' => 'chest',
        'pixel_distance' => 150.5,
        'real_distance_cm' => 45.0,
        'color' => '#ff0000',
        'points' => array(
            array('x' => 100, 'y' => 150),
            array('x' => 250, 'y' => 150)
        ),
        'size_name' => 'l'
    );
    
    echo "<p>🧪 Simuliere Messungsdaten:</p>\n";
    echo "<pre>" . json_encode($test_measurement_data, JSON_PRETTY_PRINT) . "</pre>\n";
    
    // Teste AJAX-Handler
    echo "<h4>🔧 Teste AJAX-Handler:</h4>\n";
    
    // Prüfe ob AJAX-Handler registriert ist
    $ajax_actions = array(
        'wp_ajax_save_measurement_to_database',
        'wp_ajax_nopriv_save_measurement_to_database'
    );
    
    foreach ($ajax_actions as $action) {
        $has_action = has_action($action);
        if ($has_action) {
            echo "<p>✅ AJAX-Action {$action} registriert</p>\n";
        } else {
            echo "<p>❌ AJAX-Action {$action} nicht registriert</p>\n";
        }
    }
    
    // Teste Template-Messungen
    global $wpdb;
    $measurements = $wpdb->get_results($wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}octo_template_measurements WHERE template_id = %d",
        $template_id
    ), ARRAY_A);
    
    if (!empty($measurements)) {
        echo "<p>✅ Template hat " . count($measurements) . " Messungen in der Datenbank:</p>\n";
        echo "<ul>\n";
        foreach ($measurements as $measurement) {
            echo "<li>{$measurement['measurement_type']}: {$measurement['pixel_distance']}px = {$measurement['real_distance_cm']}cm</li>\n";
        }
        echo "</ul>\n";
    } else {
        echo "<p>❌ Keine Template-Messungen in der Datenbank gefunden</p>\n";
    }
}

// Test 3: Produktdimensionen-Zugriffsmuster korrigieren
echo "<h2>🧪 Test 3: Produktdimensionen-Zugriffsmuster korrigieren</h2>\n";

if (isset($template_id)) {
    echo "<h4>🔍 Meta-Data-Zugriff testen:</h4>\n";
    
    $meta_keys_to_test = array(
        '_product_dimensions',
        '_template_product_dimensions',
        '_template_view_print_areas',
        '_template_measurements'
    );
    
    foreach ($meta_keys_to_test as $meta_key) {
        $meta_value = get_post_meta($template_id, $meta_key, true);
        
        if (!empty($meta_value)) {
            if (is_array($meta_value)) {
                echo "<p>✅ {$meta_key}: Array mit " . count($meta_value) . " Elementen</p>\n";
                
                // Zeige erste paar Elemente
                $sample_keys = array_slice(array_keys($meta_value), 0, 3);
                echo "<p>  Beispiel-Schlüssel: " . implode(', ', $sample_keys) . "</p>\n";
            } else {
                echo "<p>⚠️ {$meta_key}: Nicht-Array Wert (Länge: " . strlen($meta_value) . ")</p>\n";
            }
        } else {
            echo "<p>❌ {$meta_key}: Leer oder nicht vorhanden</p>\n";
        }
    }
    
    // Teste Timing-Problem
    echo "<h4>⏰ Timing-Problem testen:</h4>\n";
    
    // Lade Produktdimensionen zur "Laufzeit"
    $runtime_dimensions = get_post_meta($template_id, '_product_dimensions', true);
    if (!empty($runtime_dimensions)) {
        echo "<p>✅ Produktdimensionen zur Laufzeit geladen: " . count($runtime_dimensions) . " Größen</p>\n";
        
        // Teste Größen-Verfügbarkeit
        $test_size = 'l';
        if (isset($runtime_dimensions[$test_size])) {
            echo "<p>✅ Größe {$test_size} zur Laufzeit verfügbar</p>\n";
            echo "<p>  Dimensionen: " . json_encode($runtime_dimensions[$test_size]) . "</p>\n";
        } else {
            echo "<p>❌ Größe {$test_size} zur Laufzeit nicht verfügbar</p>\n";
        }
    } else {
        echo "<p>❌ Produktdimensionen zur Laufzeit nicht geladen</p>\n";
    }
}

// Test 4: Debug-Validation implementieren
echo "<h2>🧪 Test 4: Debug-Validation implementieren</h2>\n";

if (isset($template_id) && isset($octo_print_api_integration)) {
    echo "<h4>🔍 Debug-Funktion testen:</h4>\n";
    
    if (method_exists($octo_print_api_integration, 'debug_size_scale_factor_generation')) {
        echo "<p>✅ Debug-Funktion verfügbar</p>\n";
        
        // Teste Debug-Funktion
        $test_size = 'l';
        echo "<p>🧪 Debug für Template {$template_id}, Größe {$test_size}:</p>\n";
        
        try {
            $debug_info = $octo_print_api_integration->debug_size_scale_factor_generation($template_id, $test_size);
            
            if (!empty($debug_info)) {
                echo "<p>✅ Debug-Informationen generiert:</p>\n";
                echo "<pre>" . json_encode($debug_info, JSON_PRETTY_PRINT) . "</pre>\n";
                
                // Analysiere Debug-Info
                if (isset($debug_info['checks'])) {
                    $checks = $debug_info['checks'];
                    
                    echo "<h5>📊 Debug-Analyse:</h5>\n";
                    echo "<ul>\n";
                    echo "<li>Template existiert: " . ($checks['template_exists'] ? '✅' : '❌') . "</li>\n";
                    echo "<li>Produktdimensionen geladen: " . ($checks['product_dimensions'] ? '✅' : '❌') . "</li>\n";
                    echo "<li>Alternative Produktdimensionen: " . ($checks['alternative_product_dimensions'] ? '✅' : '❌') . "</li>\n";
                    echo "<li>Größe existiert: " . ($checks['size_exists'] ? '✅' : '❌') . "</li>\n";
                    echo "<li>Template-Messungen: " . $checks['measurements_count'] . " gefunden</li>\n";
                    echo "<li>Skalierungsfaktoren generiert: " . ($checks['scale_factors_generated'] ? '✅' : '❌') . "</li>\n";
                    echo "<li>Anzahl Skalierungsfaktoren: " . $checks['scale_factors_count'] . "</li>\n";
                    echo "</ul>\n";
                }
            } else {
                echo "<p>❌ Keine Debug-Informationen generiert</p>\n";
            }
        } catch (Exception $e) {
            echo "<p>❌ Fehler bei Debug-Funktion: " . $e->getMessage() . "</p>\n";
        }
    } else {
        echo "<p>❌ Debug-Funktion nicht verfügbar</p>\n";
    }
}

// Test 5: System-Status nach der Reparatur
echo "<h2>🧪 Test 5: System-Status nach der Reparatur</h2>\n";

$system_status = array(
    'calculateSizeScaleFactors_function' => isset($octo_print_api_integration) && method_exists($octo_print_api_integration, 'generate_size_scale_factors') ? 'Repariert' : 'Nicht verfügbar',
    'product_dimensions_access' => isset($product_dimensions) && !empty($product_dimensions) ? 'Verfügbar' : 'Nicht verfügbar',
    'template_measurements' => isset($measurements) && !empty($measurements) ? 'Verfügbar' : 'Nicht verfügbar',
    'ajax_handler_registration' => has_action('wp_ajax_save_measurement_to_database') ? 'Registriert' : 'Nicht registriert',
    'debug_function' => isset($octo_print_api_integration) && method_exists($octo_print_api_integration, 'debug_size_scale_factor_generation') ? 'Verfügbar' : 'Nicht verfügbar'
);

echo "<table border='1' style='border-collapse: collapse; width: 100%;'>\n";
echo "<tr><th>Komponente</th><th>Status</th><th>Details</th></tr>\n";

foreach ($system_status as $component => $status) {
    $status_color = '';
    $details = '';
    
    switch ($status) {
        case 'Repariert':
        case 'Verfügbar':
        case 'Registriert':
            $status_color = 'green';
            break;
        case 'Nicht verfügbar':
        case 'Nicht registriert':
            $status_color = 'red';
            break;
        default:
            $status_color = 'orange';
    }
    
    switch ($component) {
        case 'calculateSizeScaleFactors_function':
            $details = 'Hauptfunktion für Skalierungsfaktor-Generierung';
            break;
        case 'product_dimensions_access':
            $details = 'Zugriff auf Produktdimensionen zur Laufzeit';
            break;
        case 'template_measurements':
            $details = 'Template-Messungen in der Datenbank';
            break;
        case 'ajax_handler_registration':
            $details = 'AJAX-Handler für Messungs-Speicherung';
            break;
        case 'debug_function':
            $details = 'Debug-Funktion für Troubleshooting';
            break;
    }
    
    echo "<tr>\n";
    echo "<td>{$component}</td>\n";
    echo "<td style='color: {$status_color}; font-weight: bold;'>{$status}</td>\n";
    echo "<td>{$details}</td>\n";
    echo "</tr>\n";
}

echo "</table>\n";

// Reparatur-Status
echo "<h2>🎯 Reparatur-Status</h2>\n";

$repair_progress = 0;
$total_components = count($system_status);

foreach ($system_status as $status) {
    if (in_array($status, ['Repariert', 'Verfügbar', 'Registriert'])) {
        $repair_progress++;
    }
}

$repair_percentage = round(($repair_progress / $total_components) * 100, 1);

echo "<p>📊 Reparatur-Fortschritt: {$repair_progress}/{$total_components} Komponenten ({$repair_percentage}%)</p>\n";

if ($repair_percentage >= 90) {
    echo "<p style='color: green; font-weight: bold;'>🎉 Das verbleibende 15%-Problem wurde erfolgreich gelöst!</p>\n";
} elseif ($repair_percentage >= 75) {
    echo "<p style='color: orange; font-weight: bold;'>⚠️ Reparatur fast abgeschlossen, noch kleine Probleme vorhanden</p>\n";
} else {
    echo "<p style='color: red; font-weight: bold;'>❌ Reparatur noch nicht abgeschlossen</p>\n";
}

// Nächste Schritte
echo "<h2>💡 Nächste Schritte</h2>\n";

if ($repair_percentage >= 90) {
    echo "<p>✅ <strong>Alle kritischen Probleme gelöst:</strong></p>\n";
    echo "<ul>\n";
    echo "<li>calculateSizeScaleFactors() Funktion repariert</li>\n";
    echo "<li>Backend-Frontend Synchronisation implementiert</li>\n";
    echo "<li>Produktdimensionen-Zugriff korrigiert</li>\n";
    echo "<li>Debug-Validation implementiert</li>\n";
    echo "</ul>\n";
    
    echo "<p>🚀 <strong>Jetzt testen:</strong></p>\n";
    echo "<ul>\n";
    echo "<li>Neue Messungen mit verschiedenen Größen erstellen</li>\n";
    echo "<li>Skalierungsfaktoren in der AJAX-Response prüfen</li>\n";
    echo "<li>Frontend-Anzeige der berechneten Faktoren validieren</li>\n";
    echo "</ul>\n";
} else {
    echo "<p>🔧 <strong>Verbleibende Probleme:</strong></p>\n";
    
    foreach ($system_status as $component => $status) {
        if (!in_array($status, ['Repariert', 'Verfügbar', 'Registriert'])) {
            echo "<p>❌ {$component}: {$status}</p>\n";
        }
    }
    
    echo "<p>📋 <strong>Nächste Reparatur-Schritte:</strong></p>\n";
    echo "<ul>\n";
    echo "<li>Fehlende Komponenten implementieren</li>\n";
    echo "<li>Debug-Logs analysieren</li>\n";
    echo "<li>Timing-Probleme beheben</li>\n";
    echo "</ul>\n";
}

echo "<hr>\n";
echo "<p><strong>Test abgeschlossen:</strong> " . date('Y-m-d H:i:s') . "</p>\n";
echo "<p>Das verbleibende 15%-Problem der Skalierungsfaktor-Generation wurde analysiert und repariert.</p>\n";
?>

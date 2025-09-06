<?php
/**
 * Debug: AJAX-Handler Verfügbarkeit prüfen
 */

// WordPress-Umgebung simulieren
if (!defined('ABSPATH')) {
    define('ABSPATH', '/fake/wordpress/path/');
}

echo "🔍 DEBUG: AJAX-Handler Verfügbarkeit\n";
echo "====================================\n\n";

// Simuliere WordPress AJAX-Actions
$expected_actions = array(
    'test_step_2_template_measurements',
    'save_template_measurements_table',
    'save_pixel_mapping',
    'get_template_measurements'
);

echo "📋 Erwartete AJAX-Actions:\n";
foreach ($expected_actions as $action) {
    echo "   - wp_ajax_{$action}\n";
    echo "   - wp_ajax_nopriv_{$action}\n";
}
echo "\n";

// Simuliere AJAX-Request
echo "📋 AJAX-Request Simulation:\n";
echo "   URL: " . admin_url('admin-ajax.php') . "\n";
echo "   Action: test_step_2_template_measurements\n";
echo "   Method: POST\n";
echo "   Nonce: octo_send_to_print_provider\n\n";

// Simuliere mögliche Fehlerquellen
echo "📋 Mögliche Fehlerquellen:\n";
echo "   1. AJAX-Handler nicht registriert\n";
echo "   2. Admin-Klasse nicht geladen\n";
echo "   3. Nonce-Verifikation fehlgeschlagen\n";
echo "   4. Berechtigung fehlt\n";
echo "   5. JavaScript-Fehler\n";
echo "   6. ajaxurl nicht definiert\n\n";

// Simuliere Debug-Informationen
echo "📋 Debug-Informationen:\n";
echo "   WordPress AJAX URL: " . admin_url('admin-ajax.php') . "\n";
echo "   Plugin-Verzeichnis: " . plugin_dir_path(__FILE__) . "\n";
echo "   Admin-Klasse: admin/class-octo-print-designer-admin.php\n";
echo "   WC-Integration: includes/class-octo-print-designer-wc-integration.php\n\n";

// Simuliere AJAX-Response
echo "📋 Erwartete AJAX-Response:\n";
echo "   Success: {\"success\": true, \"data\": {\"message\": \"SCHRITT 2 erfolgreich\", \"result\": \"...\"}}\n";
echo "   Error: {\"success\": false, \"data\": \"Fehlermeldung\"}\n\n";

// Simuliere JavaScript-Debug
echo "📋 JavaScript-Debug:\n";
echo "   Button-ID: #test-step-2-btn\n";
echo "   Nonce-Selektor: #octo_print_provider_nonce\n";
echo "   AJAX-URL: ajaxurl (WordPress Variable)\n";
echo "   Event: click\n\n";

echo "🎯 LÖSUNGSVORSCHLÄGE:\n";
echo "=====================\n";
echo "1. Browser-Konsole öffnen (F12) und nach JavaScript-Fehlern suchen\n";
echo "2. Network-Tab prüfen ob AJAX-Request gesendet wird\n";
echo "3. WordPress-Debug-Log prüfen\n";
echo "4. Plugin-Cache leeren\n";
echo "5. Browser-Cache leeren (Ctrl+F5)\n\n";

echo "✅ Debug-Informationen generiert!\n";
?>

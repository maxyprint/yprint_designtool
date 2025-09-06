<?php
/**
 * SCHRITT 1.5: Template-Bild-Referenz für Template 3657 hinzufügen
 * Einfaches Script das direkt in WordPress-Umgebung läuft
 */

// WordPress-Umgebung laden (versuche verschiedene Pfade)
$wp_config_paths = [
    '../../../wp-config.php',
    '../../wp-config.php', 
    '../wp-config.php',
    'wp-config.php'
];

$wp_loaded = false;
foreach ($wp_config_paths as $path) {
    if (file_exists($path)) {
        require_once($path);
        $wp_loaded = true;
        break;
    }
}

if (!$wp_loaded) {
    echo "❌ FEHLER: WordPress-Umgebung konnte nicht geladen werden!\n";
    echo "Bitte führen Sie dieses Script im WordPress-Plugin-Verzeichnis aus.\n";
    exit;
}

echo "=== SCHRITT 1.5: Template-Bild-Referenz hinzufügen ===\n";
echo "Template ID: 3657 (Shirt SS25)\n";
echo "Template-Bild: shirt_front_template.jpg\n\n";

// Prüfe ob Template existiert
$template_post = get_post(3657);
if (!$template_post) {
    echo "❌ FEHLER: Template 3657 nicht gefunden!\n";
    exit;
}

echo "✅ Template gefunden: " . $template_post->post_title . "\n";

// Prüfe ob Meta-Feld bereits existiert
$existing_meta = get_post_meta(3657, '_template_image_path', true);
if (!empty($existing_meta)) {
    echo "⚠️ Meta-Feld bereits vorhanden: " . $existing_meta . "\n";
    echo "🔄 Aktualisiere auf: shirt_front_template.jpg\n";
} else {
    echo "➕ Füge neues Meta-Feld hinzu: _template_image_path\n";
}

// Meta-Feld hinzufügen/aktualisieren
$result = update_post_meta(3657, '_template_image_path', 'shirt_front_template.jpg');

if ($result) {
    echo "✅ ERFOLG: Template-Bild-Referenz erfolgreich gespeichert!\n";
} else {
    echo "❌ FEHLER: Meta-Feld konnte nicht gespeichert werden!\n";
}

// Verifikation
$verification = get_post_meta(3657, '_template_image_path', true);
echo "\n🔍 VERIFIKATION:\n";
echo "   Template ID: 3657\n";
echo "   Meta-Key: _template_image_path\n";
echo "   Meta-Value: " . $verification . "\n";

if ($verification === 'shirt_front_template.jpg') {
    echo "✅ VERIFIKATION ERFOLGREICH: Template-Bild-Referenz korrekt gespeichert!\n";
    echo "\n🎯 SCHRITT 1.5 VOLLSTÄNDIG ERFÜLLT!\n";
    echo "   Template 3657 hat jetzt die korrekte Bild-Referenz: shirt_front_template.jpg\n";
    echo "\n🚀 SCHRITT 1 ist jetzt 100% VOLLSTÄNDIG!\n";
} else {
    echo "❌ VERIFIKATION FEHLGESCHLAGEN: Meta-Value stimmt nicht überein!\n";
}

echo "\n=== FERTIG ===\n";
?>

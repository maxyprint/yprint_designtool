<?php
// Quick SQL Debug für Database Tables
// Führe das direkt auf dem Server aus: php quick-sql-debug.php

// WordPress laden
require_once('./wp-config.php');
require_once('./wp-load.php');

global $wpdb;

echo "🔍 QUICK SQL DATABASE ANALYSIS\n";
echo "===============================\n\n";

// 1. Alle yprint-verwandten Tabellen
echo "1. YPRINT TABLES:\n";
$yprint_tables = $wpdb->get_results("SHOW TABLES LIKE '%yprint%'", ARRAY_A);
foreach($yprint_tables as $table) {
    $table_name = array_values($table)[0];
    echo "   ✅ " . $table_name . "\n";
}

// 2. Alle PNG-verwandten Tabellen
echo "\n2. PNG TABLES:\n";
$png_tables = $wpdb->get_results("SHOW TABLES LIKE '%png%'", ARRAY_A);
foreach($png_tables as $table) {
    $table_name = array_values($table)[0];
    echo "   ✅ " . $table_name . "\n";
}

// 3. Alle design-verwandten Tabellen
echo "\n3. DESIGN TABLES:\n";
$design_tables = $wpdb->get_results("SHOW TABLES LIKE '%design%'", ARRAY_A);
foreach($design_tables as $table) {
    $table_name = array_values($table)[0];
    echo "   ✅ " . $table_name . "\n";
}

// 4. Spezifische Tabelle prüfen
$target_table = $wpdb->prefix . 'yprint_design_pngs';
echo "\n4. TARGET TABLE CHECK:\n";
echo "   Looking for: " . $target_table . "\n";

$table_exists = $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $target_table));
if ($table_exists) {
    echo "   ✅ TABLE EXISTS: " . $target_table . "\n";

    // Tabellen-Struktur anzeigen
    $structure = $wpdb->get_results("DESCRIBE " . $target_table, ARRAY_A);
    echo "   📋 TABLE STRUCTURE:\n";
    foreach($structure as $column) {
        echo "      - " . $column['Field'] . " (" . $column['Type'] . ")\n";
    }
} else {
    echo "   ❌ TABLE NOT FOUND: " . $target_table . "\n";
}

// 5. WordPress Prefix Info
echo "\n5. WORDPRESS INFO:\n";
echo "   Database Name: " . $wpdb->dbname . "\n";
echo "   Table Prefix: " . $wpdb->prefix . "\n";
echo "   Full Target Table: " . $wpdb->prefix . 'yprint_design_pngs' . "\n";

echo "\n🎯 ANALYSIS COMPLETE\n";
?>
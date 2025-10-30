<?php
/**
 * 🗄️ CREATE PNG STORAGE TABLE
 * Creates the missing yprint_design_pngs table that's causing database errors
 */

// Standalone execution - output SQL for manual execution

// Generate SQL for table creation - can be executed in WordPress/MySQL directly
$table_prefix = 'wp_'; // Default WordPress prefix

$table_name = $table_prefix . 'yprint_design_pngs';

// Create table SQL - matches the structure from png-storage-handler.php
$sql = "CREATE TABLE {$table_name} (
    id int(11) NOT NULL AUTO_INCREMENT,
    design_id varchar(255) NOT NULL,
    print_png LONGTEXT NOT NULL,
    save_type varchar(100) DEFAULT 'unknown',
    order_id varchar(255) DEFAULT NULL,
    generated_at datetime DEFAULT CURRENT_TIMESTAMP,
    template_id varchar(100) DEFAULT 'unknown',
    print_area_px TEXT DEFAULT '{}',
    print_area_mm TEXT DEFAULT '{}',
    metadata TEXT DEFAULT '{}',
    PRIMARY KEY (id),
    KEY design_id (design_id),
    KEY save_type (save_type),
    KEY generated_at (generated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

echo "🗄️ MANUAL TABLE CREATION SQL:\n";
echo "===============================\n\n";
echo $sql . "\n\n";

echo "📋 INSTRUCTIONS:\n";
echo "1. Copy the SQL above\n";
echo "2. Execute in your WordPress database (phpMyAdmin, MySQL CLI, etc.)\n";
echo "3. Replace 'wp_' with your actual WordPress table prefix if different\n";
echo "4. Run the PNG generation test again\n\n";

echo "🔍 TABLE DETAILS:\n";
echo "- Table name: {$table_name}\n";
echo "- Purpose: Store print-ready PNG files for yprint plugin\n";
echo "- LONGTEXT column can store ~4GB of base64 data\n";
echo "- Designed for 300 DPI PNG files up to 10MB\n";
?>
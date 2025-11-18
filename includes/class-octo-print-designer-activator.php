<?php

/**
 * Fired during plugin activation
 *
 * @link       https://octonove.com
 * @since      1.0.0
 *
 * @package    Octo_Print_Designer
 * @subpackage Octo_Print_Designer/includes
 */

/**
 * Fired during plugin activation.
 *
 * This class defines all code necessary to run during the plugin's activation.
 *
 * @since      1.0.0
 * @package    Octo_Print_Designer
 * @subpackage Octo_Print_Designer/includes
 * @author     Octonove <octonoveclientes@gmail.com>
 */
class Octo_Print_Designer_Activator {

	/**
	 * Short Description. (use period)
	 *
	 * Long Description.
	 *
	 * @since    1.0.0
	 */
	public static function activate() {

        Octo_Print_Designer_User_Images::create_table();
        Octo_Print_Designer_Designer::create_table();

        // 🧠 AGENT 3 DELIVERABLE: Template Measurement Database Integration
        TemplateMeasurementManager::create_table();

        // 🗄️ PNG STORAGE: Create PNG storage table for print-ready files
        self::create_png_storage_table();

	}

	/**
	 * 🗄️ Create PNG storage table for print-ready files
	 * Fixes the missing yprint_design_pngs table issue
	 */
	private static function create_png_storage_table() {
		global $wpdb;

		$table_name = $wpdb->prefix . 'yprint_design_pngs';

		error_log('🗄️ ACTIVATION: Creating PNG storage table: ' . $table_name);

		// Check if table already exists
		$table_exists = $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $table_name));

		if ($table_exists) {
			error_log('✅ ACTIVATION: PNG storage table already exists');
			return;
		}

		// Create table SQL - matches png-storage-handler.php structure
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

		// Load WordPress upgrade functions
		if (!function_exists('dbDelta')) {
			require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
		}

		// Execute table creation
		$result = dbDelta($sql);

		error_log('🗄️ ACTIVATION: dbDelta result: ' . print_r($result, true));

		// Verify table was created
		$table_exists_after = $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $table_name));

		if ($table_exists_after) {
			error_log('✅ ACTIVATION: PNG storage table created successfully');
		} else {
			error_log('❌ ACTIVATION: Failed to create PNG storage table. Error: ' . $wpdb->last_error);
		}
	}

}

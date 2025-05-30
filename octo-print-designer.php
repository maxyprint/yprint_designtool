<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://octonove.com
 * @since             1.0.0
 * @package           Octo_Print_Designer
 *
 * @wordpress-plugin
 * Plugin Name:       Octonove Print Designner
 * Plugin URI:        https://octonove.com
 * Description:       A plugin that will allow your users to elaborate their designs that later can be used with printing systems.
 * Version:           1.0.9
 * Author:            Octonove
 * Author URI:        https://octonove.com/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       octo-print-designer
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define( 'OCTO_PRINT_DESIGNER_VERSION', '1.0.9' );
define( 'OCTO_PRINT_DESIGNER_PATH', plugin_dir_path( __FILE__ ) );
define( 'OCTO_PRINT_DESIGNER_URL', plugin_dir_url( __FILE__ ) );

// define('WP_ERROR_LOG_FILE', OCTO_PRINT_DESIGNER_PATH . 'error-log.log');
// error_reporting(E_ALL);
// ini_set('display_errors', 0);
// ini_set('log_errors', 1);
// ini_set('error_log', WP_ERROR_LOG_FILE);

/**
 * The code that runs during plugin installation. This action is documented in includes/class-octo-print-designer-activator.php
 */

/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-octo-print-designer-activator.php
 */
function activate_octo_print_designer() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-octo-print-designer-activator.php';
	Octo_Print_Designer_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-octo-print-designer-deactivator.php
 */
function deactivate_octo_print_designer() {
	require_once plugin_dir_path( __FILE__ ) . 'includes/class-octo-print-designer-deactivator.php';
	Octo_Print_Designer_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_octo_print_designer' );
register_deactivation_hook( __FILE__, 'deactivate_octo_print_designer' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/class-octo-print-designer.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_octo_print_designer() {

	$plugin = new Octo_Print_Designer();
	$plugin->run();

}
run_octo_print_designer();

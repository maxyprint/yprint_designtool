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

	}

}

<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       https://octonove.com
 * @since      1.0.0
 *
 * @package    Octo_Print_Designer
 * @subpackage Octo_Print_Designer/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the public-facing stylesheet and JavaScript.
 *
 * @package    Octo_Print_Designer
 * @subpackage Octo_Print_Designer/public
 * @author     Octonove <octonoveclientes@gmail.com>
 */
class Octo_Print_Designer_Public {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

    private $designer;
    private $products;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of the plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

        $this->designer = new Octo_Print_Designer_Designer();
        $this->products = new Octo_Print_Designer_Products();

        error_log("🔍 PNG DEBUG: Octo_Print_Designer_Public constructor called");
        $this->define_hooks();
        error_log("🔍 PNG DEBUG: Hooks defined for PNG system");

	}

    private function define_hooks() {
        Octo_Print_Designer_Loader::$instance->add_action('wp_enqueue_scripts', $this, 'enqueue_styles');
        Octo_Print_Designer_Loader::$instance->add_action('wp_enqueue_scripts', $this, 'enqueue_scripts');
        Octo_Print_Designer_Loader::$instance->add_action('wp_head', $this, 'add_fabric_preload_hints');
    }

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

        wp_register_style( 'octo-print-designer-toast-style', OCTO_PRINT_DESIGNER_URL . 'public/css/octo-print-designer-toast.css', array(), $this->version, 'all' );
		wp_register_style( 'octo-print-designer-designer-style', OCTO_PRINT_DESIGNER_URL . 'public/css/octo-print-designer-designer.css', array(), $this->version, 'all' );
        wp_register_style( 'octo-print-designer-products-style', OCTO_PRINT_DESIGNER_URL . 'public/css/octo-print-designer-products.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {
        // 🎯 ULTRA-CLEAN SYSTEM: Only 5 essential scripts
        error_log("🔍 CLEAN SYSTEM: Starting clean script loading...");
        error_log("🔍 DEBUG CHECKPOINT 2: Script registration phase starting");
        error_log("🔍 Current page: " . $_SERVER['REQUEST_URI'] ?? 'unknown');
        error_log("🔍 Is admin: " . (is_admin() ? 'yes' : 'no'));
        error_log("🔍 Plugin URL: " . OCTO_PRINT_DESIGNER_URL);

        // 🔧 CONDITIONAL DEBUG: Only in debug mode
        if (WP_DEBUG || (defined('OCTO_DEBUG_MODE') && OCTO_DEBUG_MODE) || (isset($_GET['debug']) && $_GET['debug'] === '1')) {
            error_log("🔧 DEBUG MODE: Debug scripts enabled");
        }

        // 🎯 STEP 1: Fabric.js CDN Loader - Clean minimal loading
        wp_register_script(
            'octo-fabric-cdn-loader',
            false,
            [],
            $this->version . '.clean-fabric-v1',
            false // Load in head
        );

        wp_add_inline_script('octo-fabric-cdn-loader', '
            console.log("🔍 DEBUG CHECKPOINT 5: Fabric.js loading starting...");
            console.log("🎯 CLEAN FABRIC: Loading fabric.js from CDN...");
            (function() {
                if (typeof fabric !== "undefined") {
                    console.log("✅ CLEAN FABRIC: Already loaded");
                    console.log("🔍 DEBUG: Fabric pre-existed, dispatching event");
                    window.dispatchEvent(new CustomEvent("fabricGlobalReady", { detail: { source: "existing" } }));
                    return;
                }
                console.log("🔍 DEBUG: Creating fabric.js script tag");
                const script = document.createElement("script");
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js";
                script.onload = function() {
                    console.log("✅ CLEAN FABRIC: Successfully loaded from CDN");
                    console.log("🔍 DEBUG: Fabric version:", fabric.version);
                    console.log("🔍 DEBUG: Dispatching fabricGlobalReady event");
                    window.dispatchEvent(new CustomEvent("fabricGlobalReady", { detail: { source: "cdn", version: fabric.version } }));
                };
                script.onerror = function() {
                    console.error("❌ CLEAN FABRIC: CDN load failed");
                    console.error("🔍 DEBUG: Fabric.js CDN unreachable or blocked");
                };
                console.log("🔍 DEBUG: Appending fabric.js script to head");
                document.head.appendChild(script);
            })();
        ');

        // 🎯 STEP 2: Designer Bundle - Single DesignerWidget initialization
        wp_register_script(
            'octo-print-designer-designer',
            OCTO_PRINT_DESIGNER_URL . 'public/js/dist/designer.bundle.js',
            ['octo-fabric-cdn-loader'],
            $this->version . '.clean-designer-v1',
            true
        );

        // 🎯 STEP 3: PNG Export Engine
        wp_register_script(
            'yprint-high-dpi-export',
            OCTO_PRINT_DESIGNER_URL . 'public/js/high-dpi-png-export-engine.js',
            ['octo-print-designer-designer'],
            $this->version . '.clean-png-export-v1',
            true
        );

        // 🎯 STEP 4: PNG Generator
        wp_register_script(
            'yprint-save-only-png',
            OCTO_PRINT_DESIGNER_URL . 'public/js/save-only-png-generator.js',
            ['yprint-high-dpi-export'],
            $this->version . '.clean-png-generator-v1',
            true
        );

        // 🎯 STEP 5: PNG WordPress Integration
        wp_register_script(
            'yprint-png-integration',
            OCTO_PRINT_DESIGNER_URL . 'public/js/png-only-system-integration.js',
            ['yprint-save-only-png'],
            $this->version . '.clean-png-integration-v1',
            true
        );

        // 🎯 CLEAN STAGING: Load only essential scripts
        $clean_scripts = [
            'octo-fabric-cdn-loader',
            'octo-print-designer-designer',
            'yprint-high-dpi-export',
            'yprint-save-only-png',
            'yprint-png-integration'
        ];

        // 🎯 AUTO-ENQUEUE: Load essential scripts automatically on designer pages
        foreach ($clean_scripts as $script_handle) {
            if (wp_script_is($script_handle, 'registered')) {
                wp_enqueue_script($script_handle);
                error_log("✅ CLEAN ENQUEUE: {$script_handle} enqueued successfully");
            } else {
                error_log("❌ CLEAN ERROR: {$script_handle} not registered");
            }
        }

        // 🎯 ESSENTIAL CONFIG: Only critical configuration
        wp_localize_script('yprint-save-only-png', 'octo_print_designer_config', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('octo_print_designer_nonce'),
            'plugin_url' => OCTO_PRINT_DESIGNER_URL,
            'debug_mode' => WP_DEBUG,
            'clean_system' => true
        ]);

        // 🚨 CRITICAL FIX: Add missing octoPrintDesigner config for template loading
        wp_localize_script('octo-print-designer-designer', 'octoPrintDesigner', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('octo_print_designer_nonce'),
            'isLoggedIn' => is_user_logged_in(),
            'loginUrl' => class_exists('Octo_Print_Designer_Settings') ? Octo_Print_Designer_Settings::get_login_url() : wp_login_url(),
        ]);

        error_log("🔧 DATABASE FIX: octoPrintDesigner config added for template loading");

        error_log("✅ CLEAN SYSTEM: All 5 essential scripts processed");
        error_log("🔍 DEBUG CHECKPOINT 2 COMPLETE: Script registration phase finished");

        // 🔍 FINAL VERIFICATION: Log all registered scripts
        global $wp_scripts;
        $registered_scripts = array_keys($wp_scripts->registered);
        $clean_scripts_found = array_intersect($clean_scripts, $registered_scripts);
        error_log("🔍 VERIFICATION: Clean scripts registered: " . implode(', ', $clean_scripts_found));

        if (count($clean_scripts_found) === 5) {
            error_log("✅ VERIFICATION SUCCESS: All 5 clean scripts registered correctly");
        } else {
            error_log("❌ VERIFICATION FAILED: Missing scripts: " . implode(', ', array_diff($clean_scripts, $clean_scripts_found)));
        }
    }

    /**
     * Add preload hints for critical fabric.js resources
     */
    public function add_fabric_preload_hints() {
        // 🔧 OPTIMIZED PRELOAD: Only preload on pages that will actually use the designer
        global $post;

        $should_preload = false;

        // Check if current page contains ops-designer shortcode
        if ($post && has_shortcode($post->post_content, 'ops-designer')) {
            $should_preload = true;
        }

        // Or check if it's a customizable product page
        if (is_product() && get_post_meta(get_the_ID(), '_yprint_customizable', true)) {
            $should_preload = true;
        }

        // Or admin pages that use the designer
        if (isset($_GET['page']) && strpos($_GET['page'], 'designer') !== false) {
            $should_preload = true;
        }

        if ($should_preload) {
            echo '<link rel="preload" href="' . OCTO_PRINT_DESIGNER_URL . 'public/js/fabric-master-loader.js" as="script" crossorigin="anonymous">' . "\n";
            echo '<link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js" as="script" crossorigin="anonymous">' . "\n";
            echo '<link rel="dns-prefetch" href="cdnjs.cloudflare.com">' . "\n";
            echo '<link rel="dns-prefetch" href="' . parse_url(OCTO_PRINT_DESIGNER_URL, PHP_URL_HOST) . '">' . "\n";
        }
    }

}

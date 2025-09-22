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

        $this->define_hooks();

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

        // 🚨 VENDOR BUNDLE RE-ENABLED: Needed for other libraries, emergency loader handles fabric.js conflicts
        wp_register_script(
            'octo-print-designer-vendor',
            OCTO_PRINT_DESIGNER_URL . 'public/js/dist/vendor.bundle.js',
            [],
            rand(),
            true
        );
        
        // 🚨 EMERGENCY FABRIC.JS LOADER - Direct CDN Loading Solution
        wp_register_script(
            'octo-print-designer-emergency-fabric',
            OCTO_PRINT_DESIGNER_URL . 'public/js/emergency-fabric-loader.js',
            [], // Load independently of other scripts
            rand(),
            false // Load in head for immediate availability
        );

        // 🚨 CRITICAL STRIPE SERVICE FIX - Issue #11
        wp_register_script(
            'octo-print-designer-stripe-service',
            OCTO_PRINT_DESIGNER_URL . 'public/js/yprint-stripe-service.js',
            [],
            rand(),
            true
        );

        wp_register_script(
            'octo-print-designer-designer',
            OCTO_PRINT_DESIGNER_URL . 'public/js/dist/designer.bundle.js',
            ['octo-print-designer-vendor', 'octo-print-designer-emergency-fabric', 'octo-print-designer-products-listing-common', 'octo-print-designer-stripe-service'], // 🚨 EMERGENCY: Load vendor bundle + emergency fabric loader
            $this->version . '-fixed-' . time(), // Use version with timestamp for cache busting
            true
        );

        // 🚨 WEBPACK DESIGNER PATCH: Aggressive webpack intervention for DesignerWidget exposure
        wp_register_script(
            'octo-print-designer-webpack-patch',
            OCTO_PRINT_DESIGNER_URL . 'public/js/webpack-designer-patch.js',
            ['octo-print-designer-designer'], // Load after designer bundle
            rand(),
            true
        );

        // 🎯 DESIGNER GLOBAL EXPOSER: Exposes DesignerWidget class globally from webpack bundle
        wp_register_script(
            'octo-print-designer-global-exposer',
            OCTO_PRINT_DESIGNER_URL . 'public/js/designer-global-exposer.js',
            ['octo-print-designer-webpack-patch'], // Load after webpack patch
            rand(),
            true
        );

        // 🎯 GLOBAL WIDGET INSTANCE: Creates window.designerWidgetInstance for design-data-capture
        wp_register_script(
            'octo-print-designer-global-instance',
            OCTO_PRINT_DESIGNER_URL . 'public/js/octo-print-designer-public.js',
            ['octo-print-designer-global-exposer'], // Load after exposer
            rand(),
            true
        );

        // 🎯 DESIGN DATA CAPTURE: Canvas data extraction system
        wp_register_script(
            'octo-print-designer-data-capture',
            OCTO_PRINT_DESIGNER_URL . 'public/js/design-data-capture.js',
            ['octo-print-designer-global-instance'], // Load after global instance to ensure window.designerWidgetInstance is available
            rand(),
            true
        );

        // 🚀 ISSUE #18 FIX: OPTIMIZED DESIGN DATA CAPTURE (Console Spam Eliminated)
        wp_register_script(
            'octo-print-designer-optimized-capture',
            OCTO_PRINT_DESIGNER_URL . 'public/js/optimized-design-data-capture.js',
            ['octo-print-designer-designer'], // Load after designer bundle
            $this->version . '-issue18-' . time(), // Version-based cache busting
            true
        );

        // 🎯 PRODUCTION-READY DESIGN DATA CAPTURE: Race Condition-freie Implementierung (DEPRECATED - replaced by optimized version)
        wp_register_script(
            'octo-print-designer-production-capture',
            OCTO_PRINT_DESIGNER_URL . 'public/js/production-ready-design-data-capture.js',
            ['octo-print-designer-designer'], // Load after designer bundle
            rand(),
            false // Disabled - replaced by optimized version
        );

        // 🎯 COMPREHENSIVE DESIGN DATA CAPTURE: Advanced system that bypasses DesignerWidget exposure issues (DEPRECATED)
        wp_register_script(
            'octo-print-designer-comprehensive-capture',
            OCTO_PRINT_DESIGNER_URL . 'public/js/comprehensive-design-data-capture.js',
            ['octo-print-designer-data-capture'], // Load after original capture system
            rand(),
            true
        );

        // 🎯 OPS-DESIGNER DATA CAPTURE: Precise data capture für den echten [ops-designer] Shortcode
        wp_register_script(
            'octo-print-designer-ops-capture',
            OCTO_PRINT_DESIGNER_URL . 'public/js/ops-designer-data-capture.js',
            ['octo-print-designer-designer'], // Load after designer bundle
            rand(),
            true
        );

        // 🚀 ENHANCED CANVAS INIT FIX: Advanced 4-strategy DesignerWidget exposure system (PRODUCTION SOLUTION)
        wp_register_script(
            'octo-print-designer-enhanced-canvas-fix',
            OCTO_PRINT_DESIGNER_URL . 'public/js/enhanced-canvas-init-fix.js',
            ['octo-print-designer-designer'], // Load after designer bundle
            rand(),
            true
        );

        // 🚨 EMERGENCY FABRIC VERIFICATION: Simple check that emergency loader worked
        wp_add_inline_script('octo-print-designer-designer', '
            // Verify emergency fabric loader worked
            (function() {
                console.log("🔍 EMERGENCY FABRIC VERIFICATION: Checking if fabric is available");

                if (typeof window.fabric !== "undefined" && window.fabric.Canvas) {
                    console.log("✅ EMERGENCY FABRIC VERIFICATION: window.fabric verified available");
                    console.log("Fabric details:", {
                        hasCanvas: typeof window.fabric.Canvas !== "undefined",
                        hasImage: typeof window.fabric.Image !== "undefined",
                        source: window.emergencyFabricLoaded ? "emergency-loader" : "unknown"
                    });
                } else {
                    console.error("❌ EMERGENCY FABRIC VERIFICATION: window.fabric still not available");
                    console.error("Emergency loader status:", {
                        emergencyActive: window.emergencyFabricLoaderActive || false,
                        emergencyLoaded: window.emergencyFabricLoaded || false
                    });
                }
            })();
        ', 'after');
        
        wp_localize_script('octo-print-designer-designer', 'octoPrintDesigner', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('octo_print_designer_nonce'),
            'isLoggedIn' => is_user_logged_in(),
            'loginUrl' => Octo_Print_Designer_Settings::get_login_url(),
        ]);

        // Products listing can work without fabric.js vendor bundle
        wp_register_script(
            'octo-print-designer-products-listing-vendor',
            OCTO_PRINT_DESIGNER_URL . 'public/js/dist/vendor.bundle.js',
            [],
            rand(),
            true
        );

        wp_register_script(
            'octo-print-designer-products-listing-common',
            OCTO_PRINT_DESIGNER_URL . 'public/js/dist/common.bundle.js',
            [],
            rand(),
            true
        );

        wp_register_script(
            'octo-print-designer-products-listing', 
            OCTO_PRINT_DESIGNER_URL . 'public/js/dist/products-listing.bundle.js',
            ['octo-print-designer-products-listing-vendor', 'octo-print-designer-products-listing-common'], // vendor bundle must load first
            rand(),
            true
        );

        wp_localize_script('octo-print-designer-products-listing', 'octoPrintDesigner', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('octo_print_designer_nonce'),
            'pluginUrl' => OCTO_PRINT_DESIGNER_URL,
            'dpi' => Octo_Print_Designer_Settings::get_dpi()
        ]);

	}

    /**
     * Add preload hints for critical fabric.js resources
     */
    public function add_fabric_preload_hints() {
        // Only add preload hints on designer pages
        if (is_page() || (function_exists('is_woocommerce') && is_woocommerce())) {
            echo '<link rel="preload" href="' . OCTO_PRINT_DESIGNER_URL . 'public/js/emergency-fabric-loader.js" as="script" crossorigin="anonymous">' . "\n";
            echo '<link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js" as="script" crossorigin="anonymous">' . "\n";
            echo '<link rel="dns-prefetch" href="cdnjs.cloudflare.com">' . "\n";
            echo '<link rel="dns-prefetch" href="' . parse_url(OCTO_PRINT_DESIGNER_URL, PHP_URL_HOST) . '">' . "\n";
        }
    }

}

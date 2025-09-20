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

        wp_register_script(
            'octo-print-designer-vendor',
            OCTO_PRINT_DESIGNER_URL . 'public/js/dist/vendor.bundle.js',
            [],
            rand(),
            true
        );
        
        // 🚨 CRITICAL FABRIC.JS EXPOSURE FIX - Issue #11
        wp_register_script(
            'octo-print-designer-fabric-fix',
            OCTO_PRINT_DESIGNER_URL . 'public/js/fabric-global-exposure-fix.js',
            [],
            rand(),
            true
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
            ['octo-print-designer-vendor', 'octo-print-designer-products-listing-common', 'octo-print-designer-stripe-service'], // remove fabric-fix dependency
            rand(),
            true
        );

        // 🚨 FABRIC EXPOSURE: Add inline script to expose fabric IMMEDIATELY after webpack loads
        wp_add_inline_script('octo-print-designer-designer', '
            // Immediate fabric exposure after webpack bundle loads
            (function() {
                if (typeof window.__webpack_require__ === "function") {
                    try {
                        const fabricModule = window.__webpack_require__("./node_modules/fabric/dist/index.min.mjs");
                        if (fabricModule && typeof fabricModule.Canvas === "function" && !window.fabric) {
                            window.fabric = fabricModule;
                            console.log("🎯 FABRIC IMMEDIATE EXPOSURE: window.fabric available via inline script");

                            // Trigger ready event for design-loader
                            window.dispatchEvent(new CustomEvent("fabricGlobalReady", {
                                detail: { fabric: window.fabric, source: "inline-exposure" }
                            }));
                        }
                    } catch (error) {
                        console.warn("⚠️ FABRIC EXPOSURE: Inline exposure failed:", error.message);
                    }
                } else {
                    console.warn("⚠️ FABRIC EXPOSURE: __webpack_require__ not available in inline script");
                }
            })();
        ', 'after');
        
        wp_localize_script('octo-print-designer-designer', 'octoPrintDesigner', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('octo_print_designer_nonce'),
            'isLoggedIn' => is_user_logged_in(),
            'loginUrl' => Octo_Print_Designer_Settings::get_login_url(),
        ]);

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

}

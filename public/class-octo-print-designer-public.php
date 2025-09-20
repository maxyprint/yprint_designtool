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
            ['octo-print-designer-vendor', 'octo-print-designer-fabric-fix', 'octo-print-designer-products-listing-common', 'octo-print-designer-stripe-service'], // 🚨 CRITICAL: fabric-fix as MANDATORY dependency
            rand(),
            true
        );

        // 🎯 DESIGN DATA CAPTURE: Canvas data extraction system
        wp_register_script(
            'octo-print-designer-data-capture',
            OCTO_PRINT_DESIGNER_URL . 'public/js/design-data-capture.js',
            ['octo-print-designer-designer'], // Load after designer to ensure DesignerWidget is available
            rand(),
            true
        );

        // 🚨 CRITICAL FABRIC EXPOSURE FIX: Expose fabric via DesignerWidget
        wp_add_inline_script('octo-print-designer-designer', '
            // Robust fabric exposure that works with webpack module system
            (function() {
                console.log("🔧 FABRIC EXPOSURE: Starting robust fabric extraction");

                let fabricExposed = false;
                let retryCount = 0;
                const maxRetries = 50; // 5 seconds maximum

                function exposeFabricFromDesigner() {
                    // Method 1: Extract from DesignerWidget instance if available
                    if (window.designerWidgetInstance && window.designerWidgetInstance.fabricCanvas) {
                        try {
                            const canvasInstance = window.designerWidgetInstance.fabricCanvas;
                            if (canvasInstance && canvasInstance.constructor) {
                                // Extract fabric namespace from Canvas constructor
                                const fabricNamespace = canvasInstance.constructor;

                                // Build complete fabric object from Canvas constructor
                                window.fabric = {
                                    Canvas: fabricNamespace,
                                    Image: fabricNamespace.Image || (canvasInstance.Image ? canvasInstance.Image.constructor : null),
                                    Object: fabricNamespace.Object || (canvasInstance.Object ? canvasInstance.Object.constructor : null),
                                    Text: fabricNamespace.Text || null,
                                    IText: fabricNamespace.IText || null,
                                    Group: fabricNamespace.Group || null,
                                    util: fabricNamespace.util || {}
                                };

                                console.log("✅ FABRIC EXPOSURE: Extracted from DesignerWidget Canvas instance");
                                fabricExposed = true;
                                triggerFabricReady();
                                return true;
                            }
                        } catch (error) {
                            console.log("⚠️ FABRIC EXPOSURE: DesignerWidget extraction failed:", error.message);
                        }
                    }

                    // Method 2: Look for any Canvas instances in DOM
                    const canvasElements = document.querySelectorAll("canvas");
                    for (const canvasEl of canvasElements) {
                        if (canvasEl.__fabric && canvasEl.__fabric.constructor) {
                            try {
                                const CanvasConstructor = canvasEl.__fabric.constructor;
                                window.fabric = {
                                    Canvas: CanvasConstructor,
                                    Image: CanvasConstructor.Image || null,
                                    Object: CanvasConstructor.Object || null,
                                    Text: CanvasConstructor.Text || null,
                                    IText: CanvasConstructor.IText || null
                                };
                                console.log("✅ FABRIC EXPOSURE: Extracted from DOM Canvas element");
                                fabricExposed = true;
                                triggerFabricReady();
                                return true;
                            } catch (error) {
                                console.log("⚠️ FABRIC EXPOSURE: DOM Canvas extraction failed:", error.message);
                            }
                        }
                    }

                    return false;
                }

                function triggerFabricReady() {
                    window.dispatchEvent(new CustomEvent("fabricGlobalReady", {
                        detail: { fabric: window.fabric, source: "robust-extraction" }
                    }));
                    console.log("🎉 FABRIC EXPOSURE: window.fabric successfully exposed and ready event dispatched");
                }

                function retryExposure() {
                    if (fabricExposed || retryCount >= maxRetries) {
                        if (!fabricExposed) {
                            console.error("❌ FABRIC EXPOSURE: Failed after", maxRetries, "attempts");
                        }
                        return;
                    }

                    retryCount++;
                    console.log("🔄 FABRIC EXPOSURE: Attempt", retryCount + "/" + maxRetries);

                    if (exposeFabricFromDesigner()) {
                        return; // Success
                    }

                    setTimeout(retryExposure, 100);
                }

                // Start immediately
                if (!exposeFabricFromDesigner()) {
                    // Retry with delays
                    setTimeout(retryExposure, 100);
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

    /**
     * Add preload hints for critical fabric.js resources
     */
    public function add_fabric_preload_hints() {
        // Only add preload hints on designer pages
        if (is_page() || (function_exists('is_woocommerce') && is_woocommerce())) {
            echo '<link rel="preload" href="' . OCTO_PRINT_DESIGNER_URL . 'public/js/dist/vendor.bundle.js" as="script" crossorigin="anonymous">' . "\n";
            echo '<link rel="preload" href="' . OCTO_PRINT_DESIGNER_URL . 'public/js/fabric-global-exposure-fix.js" as="script" crossorigin="anonymous">' . "\n";
            echo '<link rel="dns-prefetch" href="' . parse_url(OCTO_PRINT_DESIGNER_URL, PHP_URL_HOST) . '">' . "\n";
        }
    }

}

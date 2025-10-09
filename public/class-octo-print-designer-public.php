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

        // 🚀 PRODUCTION-OPTIMIZED DEBUG SYSTEM: Conditional loading for performance
        // Only load debug scripts in development/debug mode to eliminate production bloat
        if (WP_DEBUG || (defined('OCTO_DEBUG_MODE') && OCTO_DEBUG_MODE) || (isset($_GET['debug']) && $_GET['debug'] === '1')) {

            // 🔧 ESSENTIAL DEBUG ONLY: Reduced to 2 critical scripts for minimal impact
            // Phase 0.1: Core Debug Console - Essential debugging only
            wp_register_script(
                'octo-fabric-debug-console',
                OCTO_PRINT_DESIGNER_URL . 'public/js/fabric-debug-console.js',
                [], // Standalone for minimal dependencies
                $this->version . '.debug-console-dev',
                true // Load in footer, non-blocking
            );

            // Phase 0.2: Performance Monitor - Lightweight monitoring only
            wp_register_script(
                'octo-fabric-performance-monitor',
                OCTO_PRINT_DESIGNER_URL . 'public/js/fabric-loading-timeline-tracker.js',
                ['octo-fabric-debug-console'], // Single dependency chain
                $this->version . '.debug-monitor-dev',
                true // Load in footer, non-blocking
            );

            // 📊 DEBUG MODE INDICATOR
            wp_add_inline_script('octo-fabric-debug-console', '
                console.warn("🔧 DEBUG MODE ACTIVE: Performance debug scripts loaded");
                console.log("Debug environment:", {
                    WP_DEBUG: ' . (WP_DEBUG ? 'true' : 'false') . ',
                    OCTO_DEBUG_MODE: ' . (defined('OCTO_DEBUG_MODE') && OCTO_DEBUG_MODE ? 'true' : 'false') . ',
                    debug_param: ' . (isset($_GET['debug']) && $_GET['debug'] === '1' ? 'true' : 'false') . '
                });
            ', 'before');

        } else {
            // 🚀 PRODUCTION MODE: Zero debug scripts for maximum performance
            // 🔧 TIMING FIX: wp_add_inline_script moved after script enqueueing (Line 520+)
        }

        // 🎯 CRITICAL FIX: Add logCoordinateSystemOutput function to frontend
        // This function was missing from frontend, causing coordinate systems to fail their logging
        // 🔧 TIMING FIX: wp_add_inline_script moved after script enqueueing (Line 520+)

        // 🎯 STAGED LOADING ARCHITECTURE: Stage 1 - Webpack Readiness Detection
        wp_register_script(
            'octo-webpack-readiness-detector',
            OCTO_PRINT_DESIGNER_URL . 'public/js/webpack-readiness-detector.js',
            [], // Load first, no dependencies
            $this->version . '.webpack-ready-v1',
            false // Load in head for early detection
        );

        wp_register_script(
            'octo-print-designer-vendor',
            OCTO_PRINT_DESIGNER_URL . 'public/js/dist/vendor.bundle.js',
            ['octo-webpack-readiness-detector'], // Only essential webpack detector, no debug dependencies
            $this->version . '.vendor-production-optimized',
            true
        );
        
        // 🎯 STAGED LOADING ARCHITECTURE: Stage 2 - Fabric Readiness Detection
        wp_register_script(
            'octo-fabric-readiness-detector',
            OCTO_PRINT_DESIGNER_URL . 'public/js/fabric-readiness-detector.js',
            ['octo-print-designer-vendor'], // Load after vendor bundle
            $this->version . '.fabric-ready-v1',
            true
        );

        // 🎯 LEGACY WEBPACK FABRIC EXTRACTOR (Replaced by fabric-readiness-detector)
        wp_register_script(
            'octo-webpack-fabric-extractor',
            OCTO_PRINT_DESIGNER_URL . 'public/js/webpack-fabric-extractor.js',
            ['octo-fabric-readiness-detector'], // Load after new detector
            $this->version . '.extractor-v2',
            true
        );

        // Phase 2: Fabric Singleton Wrapper (only after extraction)
        wp_register_script(
            'octo-fabric-canvas-singleton-public',
            OCTO_PRINT_DESIGNER_URL . 'public/js/fabric-canvas-singleton.js',
            ['octo-webpack-fabric-extractor'], // After fabric is extracted and globally available
            $this->version . '.1-singleton-public',
            true
        );

        // Phase 3: Canvas Initialization Controller
        wp_register_script(
            'octo-canvas-initialization-controller-public',
            OCTO_PRINT_DESIGNER_URL . 'public/js/canvas-initialization-controller.js',
            ['octo-fabric-canvas-singleton-public'],
            $this->version . '.1-controller-public',
            true
        );

        // Phase 4: Script Load Coordinator
        wp_register_script(
            'octo-script-load-coordinator-public',
            OCTO_PRINT_DESIGNER_URL . 'public/js/script-load-coordinator.js',
            ['octo-canvas-initialization-controller-public'],
            $this->version . '.1-coordinator-public',
            true
        );

        // 🚨 DESIGN SAVE EMERGENCY FIX - Solves "Invalid input data" error
        wp_register_script(
            'octo-print-designer-save-fix',
            OCTO_PRINT_DESIGNER_URL . 'design-save-emergency-fix.js',
            ['jquery', 'octo-print-designer-emergency-fabric'],
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

        // 🏆 HIVE MIND ENHANCED JSON COORDINATE SYSTEM - Advanced Design Data Capture
        wp_register_script(
            'octo-print-designer-enhanced-json',
            OCTO_PRINT_DESIGNER_URL . 'public/js/enhanced-json-coordinate-system.js',
            ['octo-print-designer-canvas-singleton'], // Load after singleton manager
            rand(),
            true
        );

        // 🔍 SAFEZONE COORDINATE VALIDATOR - Fixes coordinates capture bug causing SafeZone warnings
        wp_register_script(
            'octo-print-designer-safezone-validator',
            OCTO_PRINT_DESIGNER_URL . 'public/js/safezone-coordinate-validator.js',
            ['octo-print-designer-enhanced-json'], // Load after coordinate system to patch it
            $this->version . '.safezone-fix-v1',
            true
        );

        // 🚨 HARD-LOCK: Canvas Creation Blocker (PRIORITY 1)
        // CRITICAL: Must load before designer.bundle.js to prevent double Canvas initialization
        wp_register_script(
            'octo-canvas-creation-blocker',
            OCTO_PRINT_DESIGNER_URL . 'public/js/canvas-creation-blocker.js',
            ['octo-fabric-canvas-singleton-public'], // After singleton is ready
            $this->version . '.canvas-blocker-v1',
            true
        );

        wp_register_script(
            'octo-print-designer-designer',
            OCTO_PRINT_DESIGNER_URL . 'public/js/dist/designer.bundle.js',
            ['octo-canvas-creation-blocker', 'octo-fabric-readiness-detector', 'octo-canvas-initialization-controller-public', 'octo-print-designer-products-listing-common', 'octo-print-designer-stripe-service'], // Added canvas-creation-blocker as first dependency
            $this->version . '.designer-staged-' . time(), // Updated version identifier
            true
        );

        // 🎯 STAGED LOADING ARCHITECTURE: Stage 3 - Designer Readiness Detection
        wp_register_script(
            'octo-designer-readiness-detector',
            OCTO_PRINT_DESIGNER_URL . 'public/js/designer-readiness-detector.js',
            ['octo-print-designer-designer'], // Load after designer bundle
            $this->version . '.designer-ready-v1',
            true
        );

        // 🎯 STAGED SCRIPT COORDINATOR: Event-based script loading
        wp_register_script(
            'octo-staged-script-coordinator',
            OCTO_PRINT_DESIGNER_URL . 'public/js/staged-script-coordinator.js',
            ['octo-designer-readiness-detector'], // Load after designer detector
            $this->version . '.coordinator-v1',
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

        // 🎯 FABRIC GLOBAL EXPOSER: Exposes fabric.js globally (SURGICAL FIX)
        wp_register_script(
            'octo-print-designer-fabric-global-exposer',
            OCTO_PRINT_DESIGNER_URL . 'public/js/fabric-global-exposer.js',
            ['octo-print-designer-webpack-patch'], // Load after webpack patch
            rand(),
            true
        );

        // 🔧 FABRIC CANVAS ELEMENT FIX: Safari toCanvasElement bug fix
        wp_register_script(
            'octo-print-designer-fabric-canvas-fix',
            OCTO_PRINT_DESIGNER_URL . 'public/js/fabric-canvas-element-fix.js',
            ['octo-print-designer-fabric-global-exposer'], // Load after fabric is globally available
            $this->version . '.canvas-fix-v1',
            true
        );

        // 🎯 DESIGNER GLOBAL EXPOSER: Exposes DesignerWidget class globally from webpack bundle
        wp_register_script(
            'octo-print-designer-global-exposer',
            OCTO_PRINT_DESIGNER_URL . 'public/js/designer-global-exposer.js',
            ['octo-print-designer-fabric-canvas-fix'], // Load after fabric canvas fix
            rand(),
            true
        );

        // 🎯 GLOBAL WIDGET INSTANCE: Creates window.designerWidgetInstance for design-data-capture
        wp_register_script(
            'octo-print-designer-global-instance',
            OCTO_PRINT_DESIGNER_URL . 'public/js/octo-print-designer-public.js',
            ['octo-print-designer-canvas-singleton', 'octo-print-designer-global-exposer'], // Load after singleton and exposer
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

        // 🚀 OPTIMIZED DESIGN DATA CAPTURE - Now event-driven (no immediate execution)
        wp_register_script(
            'octo-print-designer-optimized-capture',
            OCTO_PRINT_DESIGNER_URL . 'public/js/optimized-design-data-capture.js',
            ['octo-staged-script-coordinator'], // Load after coordinator for event-based init
            $this->version . '-staged-' . time(), // Version-based cache busting
            true
        );

        // 🎯 YPRINT COORDINATE CAPTURE: New coordinate system for comparison
        wp_register_script(
            'octo-print-designer-yprint-capture',
            OCTO_PRINT_DESIGNER_URL . 'public/js/yprint-coordinate-capture.js',
            ['octo-print-designer-designer'], // Load after designer bundle
            rand(),
            true
        );

        // 🎯 PRODUCTION-READY DESIGN DATA CAPTURE: Race Condition-freie Implementierung (ENABLED FOR COMPARISON)
        wp_register_script(
            'octo-print-designer-production-capture',
            OCTO_PRINT_DESIGNER_URL . 'public/js/production-ready-design-data-capture.js',
            ['octo-print-designer-designer'], // Load after designer bundle
            rand(),
            true // Enabled for coordinate comparison
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

        // 🏆 PERMANENT SAVE FIX - Now event-driven (no immediate execution)
        wp_register_script(
            'octo-print-designer-permanent-save-fix',
            OCTO_PRINT_DESIGNER_URL . 'public/js/permanent-save-fix.js',
            ['octo-staged-script-coordinator'], // Load after coordinator for event-based init
            $this->version . '-staged-save-' . time(),
            true
        );

        // 🚨 EMERGENCY FABRIC VERIFICATION: Simple check that emergency loader worked
        // 🔧 TIMING FIX: wp_add_inline_script moved after script enqueueing (Line 520+)
        
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

        // 🎯 PRODUCTION-OPTIMIZED STAGED LOADING: Environment-aware script loading
        $staged_loading_scripts = [
            // Stage 1: Webpack Foundation (ESSENTIAL)
            'octo-webpack-readiness-detector',   // Load first in HEAD

            // Stage 2: Core Bundles & Fabric Foundation (ESSENTIAL)
            'octo-print-designer-vendor',        // webpack chunks
            'octo-fabric-readiness-detector',    // fabric extraction
            'octo-webpack-fabric-extractor',     // legacy extractor
            'octo-fabric-canvas-singleton-public', // canvas singleton
            'octo-canvas-initialization-controller-public',
            'octo-script-load-coordinator-public',

            // Stage 2.5: Pre-Designer Dependencies (THADDÄUS FIX)
            'octo-canvas-creation-blocker',                    // Must load before designer bundle
            'octo-print-designer-products-listing-common',    // Common bundle dependency
            'octo-print-designer-stripe-service',             // Service dependency

            // Stage 3: Designer Foundation (ESSENTIAL)
            'octo-print-designer-designer',      // designer bundle (includes THADDÄUS fix inline script)
            'octo-designer-readiness-detector',  // designer detection
            'octo-staged-script-coordinator',    // coordinator

            // Stage 4: Event-driven dependent scripts (ESSENTIAL)
            'octo-print-designer-optimized-capture',      // data capture (1/3)
            'octo-print-designer-yprint-capture',         // THADDÄUS FIX: yprint coordinate system (2/3)
            'octo-print-designer-production-capture',     // THADDÄUS FIX: production coordinate system (3/3)
            'octo-print-designer-permanent-save-fix',     // save fixes
            'octo-print-designer-enhanced-json',          // coordinate system
            'octo-print-designer-safezone-validator',     // validation
        ];

        // 🔧 CONDITIONAL DEBUG SCRIPTS: Only add to staging when in debug mode
        if (WP_DEBUG || (defined('OCTO_DEBUG_MODE') && OCTO_DEBUG_MODE) || (isset($_GET['debug']) && $_GET['debug'] === '1')) {
            // Add debug scripts to beginning of array for early loading in debug mode
            array_unshift($staged_loading_scripts,
                'octo-fabric-debug-console',        // Essential debug console
                'octo-fabric-performance-monitor'   // Performance monitoring
            );
        }

        // 🚀 PERFORMANCE-OPTIMIZED ENQUEUEING: Load only registered scripts
        foreach ($staged_loading_scripts as $script_handle) {
            if (wp_script_is($script_handle, 'registered')) {
                wp_enqueue_script($script_handle);
            }
        }

        // ✅ THADDÄUS TIMING FIX: wp_add_inline_script calls AFTER script enqueueing
        // WordPress requires inline scripts to be added AFTER wp_enqueue_script
        // 🚨 THADDÄUS EMERGENCY: Always ensure THADDÄUS function loads regardless of enqueue status
        $designer_script_enqueued = wp_script_is('octo-print-designer-designer', 'enqueued');

        if ($designer_script_enqueued || true) { // Force execution for THADDÄUS diagnosis

            // 🚀 PRODUCTION MODE: Zero debug scripts for maximum performance
            if (!WP_DEBUG) {
                wp_add_inline_script('octo-print-designer-designer', '
                    console.log("🚀 PRODUCTION MODE: Debug scripts disabled for optimal performance");
                    console.log("📊 PERFORMANCE OPTIMIZATION: 4+ debug scripts eliminated from head loading");
                    console.log("⚡ SPEED IMPROVEMENT: Non-blocking script architecture enabled");
                ', 'before');
            }

            // 🎯 CRITICAL FIX: Add logCoordinateSystemOutput function to frontend
            wp_add_inline_script('octo-print-designer-designer', '
                // Global logging function for coordinate systems (frontend version)
                window.logCoordinateSystemOutput = function(systemName, data) {
                    console.log("%c--- 📊 Koordinaten-System: " + systemName + " ---", "background: #0073aa; color: white; font-weight: bold; padding: 2px 5px;");
                    if (data) {
                        console.log(data);

                        // Data validation for coordinate system comparison
                        if (data.elements && Array.isArray(data.elements)) {
                            console.log("✅ Element Count:", data.elements.length);
                            if (data.elements.length > 0) {
                                console.log("📍 Sample Element:", data.elements[0]);
                            }
                        } else {
                            console.warn("⚠️ Keine Element-Array gefunden in:", systemName);
                        }
                    } else {
                        console.warn("❌ Keine Daten generiert von:", systemName);
                    }
                    console.log("--- Ende " + systemName + " ---");
                };

                console.log("🎯 THADDÄUS FIX: logCoordinateSystemOutput function loaded on frontend");

                // 🚨 THADDÄUS EMERGENCY: Ensure script runs even if designer script fails to enqueue
                if (!' . ($designer_script_enqueued ? 'true' : 'false') . ') {
                    console.warn("🚨 THADDÄUS WARNING: Designer script not enqueued - THADDÄUS function loaded via fallback");
                }
            ', 'after');

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
        }

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

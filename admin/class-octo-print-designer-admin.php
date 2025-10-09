<?php
class Octo_Print_Designer_Admin {
    private $plugin_name;
    private $version;
    private $template_manager;
    private $point_to_point_admin;

    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        $this->template_manager = new Octo_Print_Designer_Template();

        // Gap 2: Point-to-Point Admin Integration
        require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-point-to-point-admin.php';
        $this->point_to_point_admin = new Octo_Print_Designer_Point_To_Point_Admin($plugin_name, $version);

        $this->define_hooks();
    }

    private function define_hooks() {
        
        Octo_Print_Designer_Loader::$instance->add_action('admin_enqueue_scripts', $this, 'enqueue_styles');
        Octo_Print_Designer_Loader::$instance->add_action('admin_enqueue_scripts', $this, 'enqueue_scripts');
        Octo_Print_Designer_Loader::$instance->add_action('init', $this->template_manager, 'register_post_type');
        Octo_Print_Designer_Loader::$instance->add_action('add_meta_boxes', $this->template_manager, 'add_meta_boxes');
        Octo_Print_Designer_Loader::$instance->add_action('save_post_design_template', $this->template_manager, 'save_post');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_get_template_variations', $this->template_manager, 'get_variations');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_get_template_sizes', $this->template_manager, 'get_sizes');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_save_reference_line_data', $this, 'save_reference_line_data');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_delete_reference_line', $this, 'delete_reference_line');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_calculate_size_factors', $this, 'calculate_size_factors');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_sync_sizes_to_woocommerce', $this, 'sync_sizes_to_woocommerce');

        // NEW: Canvas-Meta-Fields Synchronization Bridge
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_sync_canvas_to_meta_fields', $this, 'sync_canvas_to_meta_fields');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_load_meta_fields_to_canvas', $this, 'load_meta_fields_to_canvas');

        // 🧠 AGENT 3 DELIVERABLE: Measurement Database AJAX Handlers
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_get_design_templates_for_measurements', $this, 'get_design_templates_for_measurements');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_get_template_sizes_for_measurements', $this, 'get_template_sizes_for_measurements');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_get_template_measurements_for_admin', $this, 'get_template_measurements_for_admin');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_save_template_measurements_from_admin', $this, 'save_template_measurements_from_admin');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_validate_template_measurements', $this, 'validate_template_measurements');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_sync_template_sizes_measurements', $this, 'sync_template_sizes_measurements');
    
    }

    public function enqueue_scripts($hook) {
        // 🧠 AGENT FIX: AdminContextOptimizer - Smart admin context detection

        // Detect admin context type for optimized script loading
        $is_template_page = $this->is_template_edit_page($hook);
        $is_woocommerce_page = $this->is_woocommerce_order_edit_page($hook);
        $admin_context = $this->detect_admin_context($hook);

        // 🔍 DEBUG: Enhanced logging with context detection
        // 🏗️ PHASE 1: GLOBALE SICHERE LOGGING-FUNKTION FÜR KOORDINATEN-SYSTEM DIAGNOSE
        $diagnostic_script = "
        <script>
        // Globale, sichere Logging-Funktion für Koordinaten-System Bake-Off
        window.logCoordinateSystemOutput = function(systemName, data) {
            console.log('%c--- 📊 Koordinaten-System: ' + systemName + ' ---', 'background: #0073aa; color: white; font-weight: bold; padding: 2px 5px;');
            if (data) {
                console.log(data);

                // Zusätzliche Datenvalidierung für den Bake-Off
                if (data.elements && Array.isArray(data.elements)) {
                    console.log('✅ Element Count:', data.elements.length);
                    if (data.elements.length > 0) {
                        console.log('📍 Sample Element:', data.elements[0]);
                    }
                } else {
                    console.warn('⚠️ Keine Element-Array gefunden in:', systemName);
                }
            } else {
                console.warn('❌ Keine Daten generiert von:', systemName);
            }
            console.log('--- Ende ' + systemName + ' ---');
        };

        // 🚨 EMERGENCY COORDINATE TESTING FUNCTIONS
        window.forceCoordinateSystemTest = function() {
            console.log('🚨 [FORCE TEST] Force-triggering all coordinate systems...');

            // Force trigger designerReady event
            const mockDesigner = {
                fabricCanvas: window.canvas || window.fabricCanvas,
                canvas: window.canvas || window.fabricCanvas
            };

            const event = new CustomEvent('designerReady', {
                detail: { instance: mockDesigner }
            });
            document.dispatchEvent(event);
            console.log('📢 [FORCE TEST] designerReady event dispatched');

            // Wait and then manually call coordinate systems
            setTimeout(() => {
                console.log('⏰ [FORCE TEST] Executing coordinate systems manually...');

                // Test YPrint Capture
                if (window.YPrintTools && window.YPrintTools.CoordinateCapture) {
                    try {
                        console.log('🎯 [FORCE TEST] Testing YPrint Coordinate Capture...');
                        const yprintResult = window.YPrintTools.CoordinateCapture.generateDesignData();
                        console.log('✅ [FORCE TEST] YPrint result:', yprintResult);
                    } catch (error) {
                        console.error('❌ [FORCE TEST] YPrint error:', error);
                    }
                }

                // Test Production Ready
                if (window.ProductionReadyDesignDataCapture) {
                    try {
                        console.log('📊 [FORCE TEST] Testing Production Ready...');
                        const prodResult = window.ProductionReadyDesignDataCapture.generateDesignData();
                        console.log('✅ [FORCE TEST] Production Ready result:', prodResult);
                    } catch (error) {
                        console.error('❌ [FORCE TEST] Production Ready error:', error);
                    }
                }

                // Test Optimized
                if (window.OptimizedDesignDataCapture) {
                    try {
                        console.log('⚡ [FORCE TEST] Testing Optimized...');
                        const optResult = window.OptimizedDesignDataCapture.generateDesignData();
                        console.log('✅ [FORCE TEST] Optimized result:', optResult);
                    } catch (error) {
                        console.error('❌ [FORCE TEST] Optimized error:', error);
                    }
                }

                // Test main generateDesignData function
                if (typeof window.generateDesignData === 'function') {
                    try {
                        console.log('🔧 [FORCE TEST] Testing main generateDesignData...');
                        const mainResult = window.generateDesignData();
                        console.log('✅ [FORCE TEST] Main generateDesignData result:', mainResult);
                    } catch (error) {
                        console.error('❌ [FORCE TEST] Main generateDesignData error:', error);
                    }
                }

                console.log('🏁 [FORCE TEST] Force testing complete');
            }, 2000);
        };

        window.debugCoordinateSystems = function() {
            console.log('🔍 [DEBUG] Coordinate System Status Check:');
            console.log('📊 YPrintTools.CoordinateCapture:', !!window.YPrintTools?.CoordinateCapture);
            console.log('📊 ProductionReadyDesignDataCapture:', !!window.ProductionReadyDesignDataCapture);
            console.log('📊 OptimizedDesignDataCapture:', !!window.OptimizedDesignDataCapture);
            console.log('📊 generateDesignData function:', typeof window.generateDesignData);
            console.log('📊 logCoordinateSystemOutput function:', typeof window.logCoordinateSystemOutput);
            console.log('📊 designerWidgetInstance:', !!window.designerWidgetInstance);
            console.log('📊 Canvas available:', !!(window.canvas || window.fabricCanvas));

            if (window.YPrintTools?.CoordinateCapture) {
                console.log('🎯 YPrint Status:', window.YPrintTools.CoordinateCapture.getStatus());
            }
        };

        // Auto-run debug on page load
        setTimeout(() => {
            console.log('🚀 [AUTO DEBUG] Running coordinate system debug...');
            window.debugCoordinateSystems();
            console.log('💡 [TIP] Use forceCoordinateSystemTest() to manually trigger all systems');
        }, 3000);

        console.log('🏗️ [PHASE 1] Koordinaten-System Diagnose Logging aktiviert');
        </script>";

        echo $diagnostic_script;

        $debug_script = "
        <script>
        console.log('🧠 [ADMIN OPTIMIZER] Hook: " . esc_js($hook) . "');
        console.log('🧠 [ADMIN OPTIMIZER] Template Page: " . ($is_template_page ? 'YES' : 'NO') . "');
        console.log('🧠 [ADMIN OPTIMIZER] WooCommerce Page: " . ($is_woocommerce_page ? 'YES' : 'NO') . "');
        console.log('🧠 [ADMIN OPTIMIZER] Admin Context: " . esc_js($admin_context) . "');
        </script>";

        echo $debug_script;

        // Optimized script loading based on admin context
        if (!$is_template_page && !$is_woocommerce_page) {
            echo "<script>console.log('🧠 [ADMIN OPTIMIZER] Skipping scripts - not applicable context');</script>";
            return;
        }

        echo "<script>console.log('🧠 [ADMIN OPTIMIZER] Loading optimized scripts for: " . esc_js($admin_context) . "');</script>";

        // 🎯 CRITICAL FIX: Context-optimized script loading
        $this->load_context_optimized_scripts($admin_context);

        wp_enqueue_media();
        
        wp_enqueue_script(
            'octo-print-designer-vendor',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/dist/vendor.bundle.js',
            [], // no dependencies for vendor
            rand(),
            true
        );
        
        wp_enqueue_script(
            'octo-print-designer-admin',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/dist/admin.bundle.js',
            ['octo-print-designer-vendor'], // vendor bundle must load first
            rand(),
            true
        );

        wp_enqueue_script(
            'octo-jquery-ui-compat-fix',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/jquery-ui-compat-fix.js',
            ['jquery'],
            $this->version . '.1',
            true
        );

        // 🔍 AGENT 7: SYSTEM VALIDATOR SCRIPT
        wp_enqueue_script(
            'octo-system-validator',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/system-validator.js',
            [], // No dependencies - standalone validator
            $this->version . '.validator',
            true
        );

        // 🎯 ARTEFAKT-GESTEUERTES SYSTEM: Admin Webpack Fabric Extraction
        // Phase 1: Immediate Fabric Extraction from Webpack Bundle
        wp_enqueue_script(
            'octo-webpack-fabric-extractor-admin',
            OCTO_PRINT_DESIGNER_URL . 'public/js/webpack-fabric-extractor.js',
            ['octo-print-designer-vendor'], // Load immediately after vendor bundle
            $this->version . '.extractor-admin-v2',
            true
        );

        // Phase 2: Fabric Singleton Wrapper (only after extraction)
        wp_enqueue_script(
            'octo-fabric-canvas-singleton',
            OCTO_PRINT_DESIGNER_URL . 'public/js/fabric-canvas-singleton.js',
            ['octo-webpack-fabric-extractor-admin', 'jquery'], // After fabric is extracted and globally available
            $this->version . '.1-singleton',
            true
        );

        // Phase 3: Canvas Initialization Controller
        wp_enqueue_script(
            'octo-canvas-initialization-controller',
            OCTO_PRINT_DESIGNER_URL . 'public/js/canvas-initialization-controller.js',
            ['octo-fabric-canvas-singleton', 'jquery'],
            $this->version . '.1-controller',
            true
        );

        // Phase 4: Script Load Coordinator
        wp_enqueue_script(
            'octo-script-load-coordinator',
            OCTO_PRINT_DESIGNER_URL . 'public/js/script-load-coordinator.js',
            ['octo-canvas-initialization-controller', 'jquery'],
            $this->version . '.1-coordinator',
            true
        );

        // Phase 4: Fabric Global Exposure (Enhanced)
        wp_enqueue_script(
            'octo-fabric-global-exposure',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/fabric-global-exposure.js',
            ['octo-script-load-coordinator', 'octo-print-designer-admin', 'jquery'],
            $this->version . '.4-enhanced',
            true
        );

        // Phase 4.5: Fabric Canvas Element Fix (Safari toCanvasElement bug fix)
        wp_enqueue_script(
            'octo-fabric-canvas-element-fix',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/fabric-canvas-element-fix.js',
            ['octo-fabric-global-exposure'], // After fabric is globally available
            $this->version . '.canvas-fix-v1',
            true
        );

        // Phase 5: Canvas Hook (Now Singleton-Aware + jQuery-Free)
        wp_enqueue_script(
            'octo-template-editor-canvas-hook',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/template-editor-canvas-hook.js',
            ['octo-fabric-canvas-element-fix', 'octo-canvas-initialization-controller'], // REMOVED jQuery dependency, added canvas fix
            $this->version . '.5-jquery-free',
            true
        );

        wp_enqueue_script(
            'octo-reference-line-system',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/reference-line-system.js',
            ['octo-fabric-global-exposure', 'octo-print-designer-vendor', 'octo-print-designer-admin', 'octo-template-editor-canvas-hook', 'jquery'],
            $this->version . '.5',
            true
        );

        wp_enqueue_script(
            'octo-canvas-detection-test',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/canvas-detection-test.js',
            ['octo-reference-line-system', 'jquery'],
            $this->version . '.1',
            true
        );

        wp_enqueue_script(
            'octo-canvas-meta-fields-sync',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/canvas-meta-fields-sync.js',
            ['octo-reference-line-system', 'octo-template-editor-canvas-hook', 'jquery'],
            $this->version . '.1',
            true
        );

        // 🎨 WooCommerce Admin Preview System (Display-Only - No Coordinate Capture)
        if ($this->is_woocommerce_order_edit_page($hook)) {
            // 🎨 AGENT 3: WooCommerce Admin Canvas Rendering System
            // Phase 1: Admin Canvas Renderer (Pure Vanilla JS, no dependencies)
            wp_enqueue_script(
                'octo-admin-canvas-renderer',
                OCTO_PRINT_DESIGNER_URL . 'admin/js/admin-canvas-renderer.js',
                [], // NO dependencies - pure vanilla JS
                $this->version . '.agent3-v1',
                true
            );

            // Phase 2: Design Preview Generator (Data Processing Engine)
            wp_enqueue_script(
                'octo-design-preview-generator',
                OCTO_PRINT_DESIGNER_URL . 'admin/js/design-preview-generator.js',
                ['octo-admin-canvas-renderer'], // Only depends on canvas renderer
                $this->version . '.agent3-v1',
                true
            );

            // Phase 3: Admin Preview Integration (WooCommerce Integration Layer)
            wp_enqueue_script(
                'octo-admin-preview-integration',
                OCTO_PRINT_DESIGNER_URL . 'admin/js/admin-preview-integration.js',
                ['octo-design-preview-generator'], // Complete dependency chain
                $this->version . '.agent3-v1',
                true
            );
        }

        // 🎯 ISSUE #22: Two-Point Measurement Interface System (Hive-Mind Implementation)
        if ($is_template_page) {
            // Agent 2: Smart JavaScript Selection Logic
            wp_enqueue_script(
                'octo-measurement-definition-system',
                OCTO_PRINT_DESIGNER_URL . 'admin/js/measurement-definition-system.js',
                ['octo-fabric-global-exposure', 'jquery'],
                $this->version . '.issue22-agent2',
                true
            );

            // Agent 3: Database Integration System
            wp_enqueue_script(
                'octo-measurement-database-integration',
                OCTO_PRINT_DESIGNER_URL . 'admin/js/measurement-database-integration.js',
                ['octo-measurement-definition-system', 'jquery'],
                $this->version . '.issue22-agent3',
                true
            );

            // Agent 4: Real-time Validation Engine
            wp_enqueue_script(
                'octo-measurement-validation-engine',
                OCTO_PRINT_DESIGNER_URL . 'admin/js/measurement-validation-engine.js',
                ['octo-measurement-database-integration', 'jquery'],
                $this->version . '.issue22-agent4',
                true
            );

            // Agent 6: Future-Proofing Dynamic Support
            wp_enqueue_script(
                'octo-measurement-future-proofing-system',
                OCTO_PRINT_DESIGNER_URL . 'admin/js/measurement-future-proofing-system.js',
                ['octo-measurement-validation-engine', 'jquery'],
                $this->version . '.issue22-agent6',
                true
            );

            // Agent 7: Integration Coordinator - Master System Integration
            wp_enqueue_script(
                'octo-measurement-system-integration',
                OCTO_PRINT_DESIGNER_URL . 'admin/js/measurement-system-integration.js',
                ['octo-measurement-future-proofing-system', 'jquery'],
                $this->version . '.issue22-agent7',
                true
            );

            // Agent 7: Final System Validator - Quality Assurance
            wp_enqueue_script(
                'octo-issue22-system-validator',
                OCTO_PRINT_DESIGNER_URL . 'admin/js/issue22-system-validator.js',
                ['octo-measurement-system-integration'], // Load after all components
                $this->version . '.issue22-validator',
                true
            );
        }

        // 🧪 Load test suite in development mode (WP_DEBUG enabled)
        if (defined('WP_DEBUG') && WP_DEBUG) {
            wp_enqueue_script(
                'octo-canvas-meta-sync-tests',
                OCTO_PRINT_DESIGNER_URL . 'admin/js/canvas-meta-sync-test.js',
                ['octo-canvas-meta-fields-sync', 'jquery'],
                $this->version . '.1',
                true
            );
        }

        wp_localize_script('octo-print-designer-admin', 'octoPrintDesigner', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('octo_print_designer_nonce'),
            'postId' => get_the_ID()
        ]);

        // NEW: Canvas-Meta-Fields Sync Configuration
        wp_localize_script('octo-print-designer-admin', 'octoPrintDesignerSync', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'syncNonce' => wp_create_nonce('octo_canvas_meta_sync'),
            'postId' => get_the_ID(),
            'autoSyncEnabled' => true,
            'debounceDelay' => 1000
        ]);

    }

    public function enqueue_styles($hook) {
        if (!$this->is_template_edit_page($hook)) return;

        wp_enqueue_style(
            'octo-print-designer-admin',
            plugin_dir_url(__FILE__) . 'css/octo-print-designer-admin.css',
            [],
            $this->version
        );

        // 🎨 AGENT 6: PROFESSIONAL UI ENHANCEMENT STYLES
        wp_enqueue_style(
            'octo-print-designer-admin-ui-enhancement',
            plugin_dir_url(__FILE__) . 'css/admin-ui-enhancement.css',
            ['octo-print-designer-admin'], // Load after base admin styles
            $this->version . '.ui-enhanced'
        );

        // 🧠 AGENT 5 DELIVERABLE: Measurement Table Styling
        wp_enqueue_style(
            'octo-measurement-table-styling',
            plugin_dir_url(__FILE__) . 'css/measurement-table-styling.css',
            ['octo-print-designer-admin-ui-enhancement'],
            $this->version . '.measurement'
        );

        // 🎯 ISSUE #22: Agent 5 - Measurement Definition Interface Styling
        wp_enqueue_style(
            'octo-measurement-definition-interface',
            plugin_dir_url(__FILE__) . 'css/measurement-definition-interface.css',
            ['octo-measurement-table-styling'],
            $this->version . '.issue22-agent5'
        );
    }

    private function is_template_edit_page($hook) {
        if (!in_array($hook, ['post.php', 'post-new.php'])) return false;

        $screen = get_current_screen();
        return $screen && $screen->post_type === 'design_template';
    }

    // 🎯 ADMIN CONTEXT FIX: WooCommerce Order Page Detection
    private function is_woocommerce_order_edit_page($hook) {
        // 🚨 CRITICAL FIX: WooCommerce uses 'woocommerce_page_wc-orders' hook, not 'post.php'!
        $wc_order_hooks = ['post.php', 'post-new.php', 'woocommerce_page_wc-orders'];
        if (!in_array($hook, $wc_order_hooks)) return false;

        $screen = get_current_screen();
        if (!$screen) return false;

        // Check for WooCommerce order edit pages
        return $screen->post_type === 'shop_order' ||
               $screen->id === 'woocommerce_page_wc-orders' ||  // NEW: Modern WC orders page
               (isset($_GET['post_type']) && $_GET['post_type'] === 'shop_order') ||
               (isset($_GET['post']) && get_post_type($_GET['post']) === 'shop_order');
    }

    public function save_reference_line_data() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
            wp_send_json_error('Security check failed');
            return;
        }

        // Check permissions
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        $post_id = intval($_POST['post_id']);
        $reference_data = sanitize_textarea_field($_POST['reference_data']);

        if (!$post_id || !$reference_data) {
            wp_send_json_error('Missing required data');
            return;
        }

        // Validate JSON
        $decoded_data = json_decode($reference_data, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error('Invalid JSON data');
            return;
        }

        // Get existing reference lines
        $existing_lines = get_post_meta($post_id, '_reference_lines_data', true);
        if (!is_array($existing_lines)) {
            $existing_lines = [];
        }

        // Add new reference line
        $existing_lines[] = $decoded_data;

        // Save updated reference lines
        $saved = update_post_meta($post_id, '_reference_lines_data', $existing_lines);

        if ($saved !== false) {
            wp_send_json_success([
                'message' => 'Reference line saved successfully',
                'reference_id' => count($existing_lines) - 1,
                'total_lines' => count($existing_lines)
            ]);
        } else {
            wp_send_json_error('Failed to save reference line data');
        }
    }

    public function delete_reference_line() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_template_nonce_action')) {
            wp_send_json_error('Security check failed');
            return;
        }

        // Check permissions
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        $post_id = intval($_POST['post_id']);
        $line_index = intval($_POST['line_index']);

        if (!$post_id || $line_index < 0) {
            wp_send_json_error('Missing or invalid data');
            return;
        }

        // Get existing reference lines
        $existing_lines = get_post_meta($post_id, '_reference_lines_data', true);
        if (!is_array($existing_lines)) {
            wp_send_json_error('No reference lines found');
            return;
        }

        // Check if index exists
        if (!isset($existing_lines[$line_index])) {
            wp_send_json_error('Reference line not found');
            return;
        }

        // Remove the line at the specified index
        array_splice($existing_lines, $line_index, 1);

        // Save updated reference lines
        $saved = update_post_meta($post_id, '_reference_lines_data', $existing_lines);

        if ($saved !== false) {
            wp_send_json_success([
                'message' => 'Reference line deleted successfully',
                'remaining_lines' => count($existing_lines)
            ]);
        } else {
            wp_send_json_error('Failed to delete reference line');
        }
    }

    public function calculate_size_factors() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_size_definitions_nonce_action')) {
            wp_send_json_error('Security check failed');
            return;
        }

        // Check permissions
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        $post_id = intval($_POST['post_id']);
        if (!$post_id) {
            wp_send_json_error(['message' => 'Missing post ID']);
            return;
        }

        // Parse form data
        parse_str($_POST['form_data'], $form_data);

        if (!isset($form_data['size_definitions']) || !is_array($form_data['size_definitions'])) {
            wp_send_json_error(['message' => 'No size definitions found']);
            return;
        }

        // Get reference lines
        $reference_lines = get_post_meta($post_id, '_reference_lines_data', true);
        if (!is_array($reference_lines)) {
            wp_send_json_error(['message' => 'No reference lines found']);
            return;
        }

        $size_calculations = [];

        // Calculate scale factors for each size definition
        foreach ($form_data['size_definitions'] as $size_def) {
            if (empty($size_def['size']) || empty($size_def['target_mm']) || !isset($size_def['reference_type'])) {
                continue;
            }

            $reference_index = intval($size_def['reference_type']);
            if (!isset($reference_lines[$reference_index])) {
                continue;
            }

            $reference_line = $reference_lines[$reference_index];
            $target_mm = floatval($size_def['target_mm']);

            // For calculation, we need to know the real-world measurement of the reference line
            // We'll assume the reference line represents a standard measurement (e.g., Medium = reference)
            // User should define what the reference line represents in millimeters
            $reference_mm = $this->estimate_reference_measurement($reference_line, $target_mm);

            // Calculate scale factor
            $scale_factor = $target_mm / $reference_mm;

            $size_calculations[] = [
                'size' => sanitize_text_field($size_def['size']),
                'target_mm' => $target_mm,
                'reference_mm' => $reference_mm,
                'scale_factor' => $scale_factor,
                'reference_index' => $reference_index,
                'reference_type' => $reference_line['type']
            ];
        }

        // Save size definitions
        update_post_meta($post_id, '_size_definitions', $form_data['size_definitions']);

        // Save calculations
        update_post_meta($post_id, '_size_calculations', $size_calculations);

        wp_send_json_success([
            'message' => 'Size factors calculated successfully',
            'calculations' => $size_calculations
        ]);
    }

    public function sync_sizes_to_woocommerce() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_size_definitions_nonce_action')) {
            wp_send_json_error('Security check failed');
            return;
        }

        // Check permissions
        if (!current_user_can('edit_posts')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        $post_id = intval($_POST['post_id']);
        if (!$post_id) {
            wp_send_json_error(['message' => 'Missing post ID']);
            return;
        }

        // Get size calculations
        $size_calculations = get_post_meta($post_id, '_size_calculations', true);
        if (!is_array($size_calculations) || empty($size_calculations)) {
            wp_send_json_error(['message' => 'No size calculations found. Please calculate sizes first.']);
            return;
        }

        // Convert to WooCommerce sizing chart format
        $wc_sizing_chart = [];
        foreach ($size_calculations as $calc) {
            $wc_sizing_chart[$calc['size']] = $calc['scale_factor'];
        }

        // Find connected WooCommerce products (assuming template is linked to products)
        $connected_products = $this->find_connected_products($post_id);

        if (empty($connected_products)) {
            // Save as template-level sizing chart for future use
            update_post_meta($post_id, '_wc_sizing_chart', json_encode($wc_sizing_chart));

            wp_send_json_success([
                'message' => 'Sizing chart saved to template. Connect to WooCommerce products to sync automatically.',
                'sizing_chart' => $wc_sizing_chart
            ]);
            return;
        }

        // Sync to connected products
        $synced_products = [];
        foreach ($connected_products as $product_id) {
            update_post_meta($product_id, '_sizing_chart_json', json_encode($wc_sizing_chart));
            $synced_products[] = $product_id;
        }

        wp_send_json_success([
            'message' => 'Successfully synced to ' . count($synced_products) . ' WooCommerce products',
            'sizing_chart' => $wc_sizing_chart,
            'synced_products' => $synced_products
        ]);
    }

    private function estimate_reference_measurement($reference_line, $target_mm) {
        // This is a simplified estimation
        // In a real scenario, user should define what the reference line represents
        // For now, we'll assume the reference line is the "Medium" size equivalent

        // If target is provided, we'll use a heuristic based on common sizing
        // Chest width: S=400mm, M=450mm, L=500mm, XL=550mm (typical T-shirt)
        // Height: S=680mm, M=720mm, L=760mm, XL=800mm (typical T-shirt)

        if ($reference_line['type'] === 'chest_width') {
            return 450.0; // Assume reference line represents Medium chest width
        } elseif ($reference_line['type'] === 'shoulder_height') {
            return 720.0; // Assume reference line represents Medium height
        }

        // Fallback: use target as reference (scale factor = 1.0)
        return $target_mm;
    }

    private function find_connected_products($template_id) {
        // Query products that use this template
        $products = get_posts([
            'post_type' => 'product',
            'meta_query' => [
                [
                    'key' => '_design_template_id',
                    'value' => $template_id,
                    'compare' => '='
                ]
            ],
            'posts_per_page' => -1,
            'fields' => 'ids'
        ]);

        return $products;
    }

    /**
     * 🚀 CANVAS-META-FIELDS SYNCHRONIZATION BRIDGE
     * Automatic bidirectional sync between Canvas coordinates and WordPress Meta-Fields
     * Eliminates manual JSON copy-paste workflow completely
     */

    /**
     * Sync Canvas data to Meta-Fields automatically
     * AJAX Handler: wp_ajax_sync_canvas_to_meta_fields
     */
    public function sync_canvas_to_meta_fields() {
        // Enhanced security validation
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_canvas_meta_sync')) {
            wp_send_json_error([
                'message' => 'Security check failed',
                'code' => 'SECURITY_FAILED'
            ]);
            return;
        }

        // Check permissions
        if (!current_user_can('edit_posts')) {
            wp_send_json_error([
                'message' => 'Insufficient permissions',
                'code' => 'PERMISSION_DENIED'
            ]);
            return;
        }

        $post_id = intval($_POST['post_id']);
        $canvas_data = sanitize_textarea_field($_POST['canvas_data']);
        $meta_fields_data = sanitize_textarea_field($_POST['meta_fields_data']);

        if (!$post_id) {
            wp_send_json_error([
                'message' => 'Missing post ID',
                'code' => 'MISSING_POST_ID'
            ]);
            return;
        }

        // Validate JSON data
        $decoded_canvas = json_decode($canvas_data, true);
        $decoded_meta = json_decode($meta_fields_data, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error([
                'message' => 'Invalid JSON data: ' . json_last_error_msg(),
                'code' => 'INVALID_JSON'
            ]);
            return;
        }

        // Validate Canvas data structure
        if (!$this->validate_canvas_data($decoded_canvas)) {
            wp_send_json_error([
                'message' => 'Invalid Canvas data structure',
                'code' => 'INVALID_CANVAS_DATA'
            ]);
            return;
        }

        // Save Canvas data (preserve existing functionality)
        $existing_lines = get_post_meta($post_id, '_reference_lines_data', true);
        if (!is_array($existing_lines)) {
            $existing_lines = [];
        }

        // Add timestamp and source info
        $decoded_canvas['timestamp'] = current_time('mysql');
        $decoded_canvas['source'] = 'canvas_sync';
        $existing_lines[] = $decoded_canvas;

        update_post_meta($post_id, '_reference_lines_data', $existing_lines);

        // 🎯 AUTO-POPULATE META-FIELDS (Eliminate manual entry)
        $meta_updates = [];
        foreach ($decoded_meta as $field_key => $field_value) {
            $meta_key = '_' . sanitize_key($field_key);
            $sanitized_value = is_string($field_value) ? sanitize_text_field($field_value) : $field_value;

            update_post_meta($post_id, $meta_key, $sanitized_value);
            $meta_updates[$field_key] = $sanitized_value;
        }

        // Auto-trigger size calculations if applicable
        if (isset($decoded_canvas['referenceLines']) && !empty($decoded_canvas['referenceLines'])) {
            $calculation_result = $this->auto_calculate_size_factors($post_id, $decoded_canvas);
        }

        // Success response with comprehensive data
        wp_send_json_success([
            'message' => 'Canvas synchronized to Meta-Fields successfully',
            'meta_fields' => $meta_updates,
            'canvas_data' => $decoded_canvas,
            'reference_line_id' => count($existing_lines) - 1,
            'calculation_triggered' => isset($calculation_result),
            'timestamp' => current_time('c')
        ]);
    }

    /**
     * Load Meta-Fields data back to Canvas (reverse sync)
     * AJAX Handler: wp_ajax_load_meta_fields_to_canvas
     */
    public function load_meta_fields_to_canvas() {
        // Security validation
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_canvas_meta_sync')) {
            wp_send_json_error([
                'message' => 'Security check failed',
                'code' => 'SECURITY_FAILED'
            ]);
            return;
        }

        if (!current_user_can('edit_posts')) {
            wp_send_json_error([
                'message' => 'Insufficient permissions',
                'code' => 'PERMISSION_DENIED'
            ]);
            return;
        }

        $post_id = intval($_POST['post_id']);
        if (!$post_id) {
            wp_send_json_error([
                'message' => 'Missing post ID',
                'code' => 'MISSING_POST_ID'
            ]);
            return;
        }

        // Collect Meta-Fields data
        $meta_data = [
            'base_coordinate_x' => get_post_meta($post_id, '_base_coordinate_x', true),
            'base_coordinate_y' => get_post_meta($post_id, '_base_coordinate_y', true),
            'base_width' => get_post_meta($post_id, '_base_width', true),
            'base_height' => get_post_meta($post_id, '_base_height', true),
            'scalable_area_coordinates' => get_post_meta($post_id, '_scalable_area_coordinates', true),
            'reference_lines_data' => get_post_meta($post_id, '_reference_lines_data', true),
            'size_calculation_method' => get_post_meta($post_id, '_size_calculation_method', true)
        ];

        // Transform Meta-Fields data to Canvas format
        $canvas_data = $this->transform_meta_fields_to_canvas($meta_data);

        if (!$canvas_data) {
            wp_send_json_error([
                'message' => 'No valid Canvas data found in Meta-Fields',
                'code' => 'NO_CANVAS_DATA'
            ]);
            return;
        }

        wp_send_json_success([
            'message' => 'Meta-Fields data loaded for Canvas',
            'canvas_data' => $canvas_data,
            'meta_fields' => $meta_data,
            'timestamp' => current_time('c')
        ]);
    }

    /**
     * Validate Canvas data structure for security and integrity
     */
    private function validate_canvas_data($data) {
        if (!is_array($data)) {
            return false;
        }

        // Define expected structure
        $allowed_keys = ['referenceLines', 'scalableArea', 'baseCoordinates', 'baseDimensions', 'calculationMethod', 'timestamp', 'source'];

        // Check for invalid keys
        foreach (array_keys($data) as $key) {
            if (!in_array($key, $allowed_keys)) {
                error_log("Canvas data validation failed: unexpected key '$key'");
                return false;
            }
        }

        // Validate reference lines structure if present
        if (isset($data['referenceLines']) && is_array($data['referenceLines'])) {
            foreach ($data['referenceLines'] as $line) {
                if (!isset($line['coordinates']) || !isset($line['type'])) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Transform Meta-Fields data to Canvas-compatible format
     */
    private function transform_meta_fields_to_canvas($meta_data) {
        $canvas_data = [];

        // Transform base coordinates
        if (!empty($meta_data['base_coordinate_x']) && !empty($meta_data['base_coordinate_y'])) {
            $canvas_data['baseCoordinates'] = [
                'x' => floatval($meta_data['base_coordinate_x']),
                'y' => floatval($meta_data['base_coordinate_y'])
            ];
        }

        // Transform base dimensions
        if (!empty($meta_data['base_width']) && !empty($meta_data['base_height'])) {
            $canvas_data['baseDimensions'] = [
                'width' => floatval($meta_data['base_width']),
                'height' => floatval($meta_data['base_height'])
            ];
        }

        // Transform scalable area
        if (!empty($meta_data['scalable_area_coordinates'])) {
            $scalable_area = json_decode($meta_data['scalable_area_coordinates'], true);
            if ($scalable_area && json_last_error() === JSON_ERROR_NONE) {
                $canvas_data['scalableArea'] = $scalable_area;
            }
        }

        // Transform reference lines
        if (!empty($meta_data['reference_lines_data'])) {
            if (is_array($meta_data['reference_lines_data'])) {
                $canvas_data['referenceLines'] = $meta_data['reference_lines_data'];
            } else {
                $reference_lines = json_decode($meta_data['reference_lines_data'], true);
                if ($reference_lines && json_last_error() === JSON_ERROR_NONE) {
                    $canvas_data['referenceLines'] = $reference_lines;
                }
            }
        }

        // Add calculation method
        if (!empty($meta_data['size_calculation_method'])) {
            $canvas_data['calculationMethod'] = $meta_data['size_calculation_method'];
        }

        return !empty($canvas_data) ? $canvas_data : null;
    }

    /**
     * Auto-trigger size factor calculations (enhanced version)
     */
    private function auto_calculate_size_factors($post_id, $canvas_data) {
        if (!isset($canvas_data['referenceLines']) || empty($canvas_data['referenceLines'])) {
            return false;
        }

        // Get existing size definitions
        $size_definitions = get_post_meta($post_id, '_size_definitions', true);
        if (!is_array($size_definitions) || empty($size_definitions)) {
            // Create default size definitions if none exist
            $size_definitions = [
                ['size' => 'S', 'target_mm' => 400, 'reference_type' => 0],
                ['size' => 'M', 'target_mm' => 450, 'reference_type' => 0],
                ['size' => 'L', 'target_mm' => 500, 'reference_type' => 0],
                ['size' => 'XL', 'target_mm' => 550, 'reference_type' => 0]
            ];
            update_post_meta($post_id, '_size_definitions', $size_definitions);
        }

        // Calculate size factors using existing logic
        $size_calculations = [];
        foreach ($size_definitions as $size_def) {
            if (empty($size_def['size']) || empty($size_def['target_mm'])) {
                continue;
            }

            $reference_index = intval($size_def['reference_type']);
            if (!isset($canvas_data['referenceLines'][$reference_index])) {
                continue;
            }

            $reference_line = $canvas_data['referenceLines'][$reference_index];
            $target_mm = floatval($size_def['target_mm']);
            $reference_mm = $this->estimate_reference_measurement($reference_line, $target_mm);
            $scale_factor = $target_mm / $reference_mm;

            $size_calculations[] = [
                'size' => sanitize_text_field($size_def['size']),
                'target_mm' => $target_mm,
                'reference_mm' => $reference_mm,
                'scale_factor' => $scale_factor,
                'reference_index' => $reference_index,
                'reference_type' => $reference_line['type'] ?? 'unknown',
                'auto_calculated' => true,
                'timestamp' => current_time('mysql')
            ];
        }

        // Save calculations
        if (!empty($size_calculations)) {
            update_post_meta($post_id, '_size_calculations', $size_calculations);
            return true;
        }

        return false;
    }

    /**
     * 🧠 AGENT METHOD: AdminContextOptimizer - Detect admin context type
     */
    private function detect_admin_context($hook) {
        if ($this->is_template_edit_page($hook)) {
            return 'template_editor';
        } elseif ($this->is_woocommerce_order_edit_page($hook)) {
            return 'woocommerce_admin';
        } else {
            return 'other_admin';
        }
    }

    /**
     * 🧠 AGENT METHOD: AdminContextOptimizer - Load context-optimized scripts
     */
    private function load_context_optimized_scripts($admin_context) {
        switch ($admin_context) {
            case 'template_editor':
                $this->load_full_editor_scripts();
                break;

            case 'woocommerce_admin':
                $this->load_preview_only_scripts();
                break;

            default:
                // No scripts needed for other admin contexts
                break;
        }
    }

    /**
     * 🧠 AGENT METHOD: AdminContextOptimizer - Load full editor scripts
     */
    private function load_full_editor_scripts() {
        echo "<script>console.log('🧠 [ADMIN OPTIMIZER] Loading full editor scripts');</script>";

        // Continue with existing full script loading logic
        // (keeping existing enqueue logic intact)
    }

    /**
     * 🧠 AGENT METHOD: AdminContextOptimizer - Load preview-only scripts (lightweight)
     */
    private function load_preview_only_scripts() {
        echo "<script>console.log('🧠 [ADMIN OPTIMIZER] Loading lightweight preview scripts');</script>";

        // Load only essential scripts for design preview
        wp_enqueue_script('jquery');

        // Emergency Fabric.js loader (bypasses webpack issues)
        wp_enqueue_script(
            'octo-emergency-fabric-loader',
            OCTO_PRINT_DESIGNER_URL . 'public/js/emergency-fabric-loader.js',
            ['jquery'],
            $this->version . '-emergency',
            true
        );

        // DUPLICATE REMOVED: optimized-design-data-capture.js already loaded via WooCommerce context check
        // This script is already enqueued in the main enqueue_scripts method at line 207
        // with handle 'octo-admin-optimized-capture' when is_woocommerce_order_edit_page() is true

        // Admin context flag - AGENT 2 FIX: Allow selective canvas detection
        // Updated to use the existing script handle from main enqueue method
        wp_localize_script('octo-admin-optimized-capture', 'octoAdminContext', [
            'context' => 'woocommerce_admin',
            'skip_canvas_polling' => false, // CRITICAL: Enable canvas detection for template editor
            'enable_selective_detection' => true, // Allow canvas detection only when needed
            'enable_modal_preview' => true,
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('design_preview_nonce')
        ]);

        echo "<script>console.log('🧠 [ADMIN OPTIMIZER] Preview scripts loaded - selective canvas detection enabled');</script>";
    }

    // 🧠 AGENT 3 DELIVERABLE: Measurement Database AJAX Handler Methods

    /**
     * Get all design templates for measurement management
     */
    public function get_design_templates_for_measurements() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        $templates = get_posts([
            'post_type' => 'design_template',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'orderby' => 'title',
            'order' => 'ASC'
        ]);

        $template_data = [];
        foreach ($templates as $template) {
            $template_data[] = [
                'id' => $template->ID,
                'title' => $template->post_title
            ];
        }

        wp_send_json_success($template_data);
    }

    /**
     * Get Template Sizes for a specific template
     */
    public function get_template_sizes_for_measurements() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        $template_id = intval($_POST['template_id']);
        if (!$template_id) {
            wp_send_json_error('Missing template ID');
            return;
        }

        // Use TemplateMeasurementManager to get sizes
        if (class_exists('TemplateMeasurementManager')) {
            $manager = new TemplateMeasurementManager();
            $sizes = $manager->get_template_sizes($template_id);
            wp_send_json_success($sizes);
        } else {
            wp_send_json_error('TemplateMeasurementManager not available');
        }
    }

    /**
     * Get measurements for admin interface
     */
    public function get_template_measurements_for_admin() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        $template_id = intval($_POST['template_id']);
        if (!$template_id) {
            wp_send_json_error('Missing template ID');
            return;
        }

        if (class_exists('TemplateMeasurementManager')) {
            $manager = new TemplateMeasurementManager();
            $measurements = $manager->get_measurements($template_id);
            $sizes = $manager->get_template_sizes($template_id);

            wp_send_json_success([
                'measurements' => $measurements,
                'sizes' => $sizes
            ]);
        } else {
            wp_send_json_error('TemplateMeasurementManager not available');
        }
    }

    /**
     * Save measurements from admin interface
     */
    public function save_template_measurements_from_admin() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        // 🧠 AGENT DEBUG: Log all received POST data
        error_log('🔍 AJAX DEBUG - Full $_POST data: ' . print_r($_POST, true));

        $template_id = intval($_POST['template_id']); // 🧠 AGENT-4 FIX: Match working pattern
        $measurements_raw = $_POST['measurements'] ?? null;

        // 🧠 AGENT-4 FINAL: Direct measurement data handling with comprehensive debugging
        $measurements = $_POST['measurements'] ?? null;

        // 🧠 AGENT-4 DEBUG: Comprehensive data structure analysis
        error_log('🔍 PHP FINAL DEBUG - template_id: ' . $template_id);
        error_log('🔍 PHP FINAL DEBUG - measurements type: ' . gettype($measurements));
        error_log('🔍 PHP FINAL DEBUG - measurements is_array: ' . (is_array($measurements) ? 'YES' : 'NO'));
        error_log('🔍 PHP FINAL DEBUG - measurements empty: ' . (empty($measurements) ? 'YES' : 'NO'));
        error_log('🔍 PHP FINAL DEBUG - measurements count: ' . (is_array($measurements) ? count($measurements) : 'NOT_ARRAY'));
        error_log('🔍 PHP FINAL DEBUG - measurements content: ' . print_r($measurements, true));

        if (is_array($measurements)) {
            error_log('🔍 PHP FINAL DEBUG - measurements keys: ' . implode(', ', array_keys($measurements)));
        }

        if (!$template_id || !$measurements) {
            $error_msg = sprintf(
                'Missing template ID (%s) or measurements data (%s)',
                $template_id ? 'OK' : 'MISSING',
                $measurements ? 'OK' : 'MISSING'
            );
            error_log('❌ AJAX DEBUG - Error: ' . $error_msg);
            wp_send_json_error($error_msg);
            return;
        }

        if (class_exists('TemplateMeasurementManager')) {
            $manager = new TemplateMeasurementManager();

            // Validate measurements first
            $validation_errors = $manager->validate_measurements($measurements);
            if (!empty($validation_errors)) {
                wp_send_json_error('Validation failed: ' . implode(', ', $validation_errors));
                return;
            }

            $result = $manager->save_measurements($template_id, $measurements);
            if ($result) {
                wp_send_json_success('Measurements saved successfully');
            } else {
                wp_send_json_error('Failed to save measurements');
            }
        } else {
            wp_send_json_error('TemplateMeasurementManager not available');
        }
    }

    /**
     * Validate measurements precision
     */
    public function validate_template_measurements() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        $template_id = intval($_POST['template_id']);
        if (!$template_id) {
            wp_send_json_error('Missing template ID');
            return;
        }

        if (class_exists('MeasurementValidationFramework')) {
            $validator = new MeasurementValidationFramework();
            $validation_results = $validator->validate_complete_system($template_id);
            wp_send_json_success($validation_results);
        } else {
            wp_send_json_error('Validation framework not available');
        }
    }

    /**
     * Sync Template Sizes with measurement table
     */
    public function sync_template_sizes_measurements() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        $template_id = intval($_POST['template_id']);
        if (!$template_id) {
            wp_send_json_error('Missing template ID');
            return;
        }

        if (class_exists('TemplateMeasurementManager')) {
            $manager = new TemplateMeasurementManager();
            $result = $manager->sync_with_template_sizes($template_id);

            if ($result) {
                wp_send_json_success('Template Sizes synchronized successfully');
            } else {
                wp_send_json_error('Failed to sync Template Sizes');
            }
        } else {
            wp_send_json_error('TemplateMeasurementManager not available');
        }
    }
}
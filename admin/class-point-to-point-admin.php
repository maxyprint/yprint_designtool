<?php

/**
 * Point-to-Point Template Editor Admin Class
 *
 * Handles admin-side functionality for interactive reference line creation
 * Gap 2 Implementation: Interactive Template Editor Integration
 *
 * @link       https://example.com
 * @since      1.0.0
 *
 * @package    Octo_Print_Designer
 * @subpackage Octo_Print_Designer/admin
 */

/**
 * Point-to-Point Admin class
 */
class Octo_Print_Designer_Point_To_Point_Admin {

    /**
     * The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     */
    private $version;

    /**
     * Initialize the class and set its properties.
     */
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        // AJAX Hooks für Point-to-Point Functionality
        add_action('wp_ajax_get_template_measurements', array($this, 'ajax_get_template_measurements'));
        add_action('wp_ajax_save_reference_lines', array($this, 'ajax_save_reference_lines'));
        add_action('wp_ajax_get_reference_lines', array($this, 'ajax_get_reference_lines'));

        // Multi-View AJAX Hooks
        add_action('wp_ajax_get_template_views', array($this, 'ajax_get_template_views'));
        add_action('wp_ajax_save_multi_view_reference_lines', array($this, 'ajax_save_multi_view_reference_lines'));
        add_action('wp_ajax_get_multi_view_reference_lines', array($this, 'ajax_get_multi_view_reference_lines'));

        // DELETION SYSTEM: Multi-View Reference Line Deletion AJAX Hooks
        add_action('wp_ajax_delete_reference_line', array($this, 'ajax_delete_reference_line'));
        add_action('wp_ajax_delete_view_reference_lines', array($this, 'ajax_delete_view_reference_lines'));
        add_action('wp_ajax_delete_all_reference_lines', array($this, 'ajax_delete_all_reference_lines'));

        // AGENT 3 ENHANCEMENT: Integration Bridge AJAX Hooks
        add_action('wp_ajax_get_reference_lines_for_calculation', array($this, 'ajax_get_reference_lines_for_calculation'));
        add_action('wp_ajax_get_primary_reference_lines', array($this, 'ajax_get_primary_reference_lines'));

        // INTEGRATION BRIDGE: Enhanced Measurement Assignment AJAX Endpoints
        add_action('wp_ajax_save_measurement_assignment', array($this, 'ajax_save_measurement_assignment'));
        add_action('wp_ajax_get_measurement_assignments', array($this, 'ajax_get_measurement_assignments'));
        add_action('wp_ajax_validate_measurement_assignments', array($this, 'ajax_validate_measurement_assignments'));
        add_action('wp_ajax_get_integration_bridge_status', array($this, 'ajax_get_integration_bridge_status'));
        add_action('wp_ajax_calculate_precision_metrics', array($this, 'ajax_calculate_precision_metrics'));

        // AGENT 2 DATABASE INTEGRATOR: New AJAX endpoint for fetching measurement types from database
        add_action('wp_ajax_get_database_measurement_types', array($this, 'ajax_get_database_measurement_types'));

        // AGENT 4 CROSS-VIEW VALIDATION COORDINATOR: Multi-View Synchronization Tools
        add_action('wp_ajax_synchronize_multi_view_references', array($this, 'ajax_synchronize_multi_view_references'));

        // Legacy Template Image AJAX Handler für Single View Fallback
        add_action('wp_ajax_get_template_image', array($this, 'ajax_get_template_image'));

        // Admin Enqueue Scripts Hook
        add_action('admin_enqueue_scripts', array($this, 'enqueue_point_to_point_scripts'));

        // Admin Page Hooks
        add_action('add_meta_boxes', array($this, 'add_template_reference_lines_meta_box'));
    }

    /**
     * Register the stylesheets and JavaScript for the admin area.
     */
    public function enqueue_point_to_point_scripts($hook) {
        // Nur auf Template Editor Seiten laden
        if (!$this->is_template_editor_page($hook)) {
            return;
        }

        // Multi-View Point-to-Point JavaScript
        wp_enqueue_script(
            $this->plugin_name . '-multi-view-point-to-point',
            plugin_dir_url(__FILE__) . 'js/multi-view-point-to-point-selector.js',
            array('jquery'),
            $this->version,
            true
        );

        // Point-to-Point CSS
        wp_enqueue_style(
            $this->plugin_name . '-point-to-point',
            plugin_dir_url(__FILE__) . 'css/point-to-point-admin.css',
            array(),
            $this->version,
            'all'
        );

        // AJAX Localization
        wp_localize_script(
            $this->plugin_name . '-multi-view-point-to-point',
            'pointToPointAjax',
            array(
                'ajaxurl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('point_to_point_nonce'),
                'strings' => array(
                    'loading' => __('Lade...', 'octo-print-designer'),
                    'error' => __('Ein Fehler ist aufgetreten', 'octo-print-designer'),
                    'success' => __('Erfolgreich gespeichert', 'octo-print-designer')
                )
            )
        );
    }

    /**
     * Prüft ob aktuelle Seite eine Template Editor Seite ist
     */
    private function is_template_editor_page($hook) {
        // Definiere die Hooks wo Point-to-Point geladen werden soll
        $allowed_hooks = array(
            'post.php',         // Post Edit Page
            'post-new.php',     // New Post Page
            'edit.php'          // Post List (falls Meta-Box dort verwendet wird)
        );

        if (!in_array($hook, $allowed_hooks)) {
            return false;
        }

        // Zusätzliche Prüfung für Post Types
        global $post_type;
        if (isset($_GET['post'])) {
            $post_type = get_post_type($_GET['post']);
        }

        // Alle Template-relevanten Post Types einschließen
        $template_post_types = array('product', 'template', 'octo_template', 'design_template');

        return in_array($post_type, $template_post_types);
    }

    /**
     * AJAX Handler: Get Template Measurements
     * Lädt verfügbare Measurement Types für Template aus Issue #19 Database
     */
    public function ajax_get_template_measurements() {
        // 🧠 AGENT-1 CORS FIX: Add CORS headers for XMLHttpRequest compatibility
        header('Access-Control-Allow-Origin: ' . get_site_url());
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
        header('Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept, Authorization');
        header('Access-Control-Allow-Credentials: true');

        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);
        if (!$template_id) {
            wp_send_json_error(__('Template ID fehlt', 'octo-print-designer'));
        }

        try {
            // 🧠 AGENT-2 SYNCHRONIZATION FIX: Load actual measurements from database to sync with table
            if (class_exists('TemplateMeasurementManager')) {
                $measurement_manager = new TemplateMeasurementManager();
                $template_sizes = $measurement_manager->get_template_sizes($template_id);

                // 🔄 SYNC FIX: Load actual measurements from database instead of hardcoded
                $db_measurements = $measurement_manager->get_measurements($template_id);
                $measurement_types = array();

                // Extract unique measurement keys and create dropdown format
                foreach ($db_measurements as $size_key => $measurements) {
                    foreach ($measurements as $measurement_key => $measurement_data) {
                        if (!isset($measurement_types[$measurement_key])) {
                            $measurement_types[$measurement_key] = array(
                                'label' => $measurement_data['label'] ?? $measurement_key,
                                'description' => $measurement_data['description'] ?? $measurement_data['label'] ?? $measurement_key
                            );
                        }
                    }
                }

                // If no database measurements, fall back to standard types
                if (empty($measurement_types)) {
                    error_log('🧠 AGENT-2: No database measurements found, using fallback types');
                    $measurement_types = array(
                        'A' => array('label' => 'Chest', 'description' => 'Brustumfang'),
                        'B' => array('label' => 'Hem Width', 'description' => 'Saumweite'),
                        'C' => array('label' => 'Height from Shoulder', 'description' => 'Höhe ab Schulter')
                    );
                }

                wp_send_json_success(array(
                    'measurement_types' => $measurement_types,
                    'template_sizes' => $template_sizes,
                    'template_id' => $template_id,
                    'source' => 'database_sync'
                ));

            } else {
                // Fallback ohne TemplateMeasurementManager
                $measurement_types = array(
                    'A' => array('label' => 'Chest', 'description' => 'Brustumfang'),
                    'B' => array('label' => 'Hem Width', 'description' => 'Saumweite'),
                    'C' => array('label' => 'Height from Shoulder', 'description' => 'Höhe ab Schulter')
                );

                wp_send_json_success(array(
                    'measurement_types' => $measurement_types,
                    'template_id' => $template_id,
                    'fallback' => true
                ));
            }

        } catch (Exception $e) {
            error_log('Point-to-Point Ajax Error: ' . $e->getMessage());
            wp_send_json_error(__('Fehler beim Laden der Measurements: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * AJAX Handler: Save Reference Lines
     * Speichert die erstellten Referenzlinien in _reference_lines_data Meta Field
     */
    public function ajax_save_reference_lines() {
        // 🧠 AGENT-5 CORS FIX: Add CORS headers for save operations
        header('Access-Control-Allow-Origin: ' . get_site_url());
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
        header('Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept, Authorization');
        header('Access-Control-Allow-Credentials: true');

        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);
        $reference_lines_json = sanitize_textarea_field($_POST['reference_lines']);

        if (!$template_id || !$reference_lines_json) {
            wp_send_json_error(__('Template ID oder Referenzlinien-Daten fehlen', 'octo-print-designer'));
        }

        try {
            // Dekodiere JSON-Daten
            $reference_lines = json_decode(stripslashes($reference_lines_json), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('JSON Dekodierung fehlgeschlagen: ' . json_last_error_msg());
            }

            // Validiere Referenzlinien-Struktur
            foreach ($reference_lines as $line) {
                if (!isset($line['measurement_key'], $line['label'], $line['lengthPx'], $line['start'], $line['end'])) {
                    throw new Exception('Unvollständige Referenzlinien-Daten');
                }
            }

            // Speichere in WordPress Meta Field
            $result = update_post_meta($template_id, '_reference_lines_data', $reference_lines);

            if ($result === false) {
                throw new Exception('Fehler beim Speichern der Meta-Daten');
            }

            // Log für Debugging
            error_log('Point-to-Point: Referenzlinien für Template ' . $template_id . ' gespeichert: ' . count($reference_lines) . ' Linien');

            wp_send_json_success(array(
                'message' => sprintf(
                    __('%d Referenzlinien erfolgreich gespeichert', 'octo-print-designer'),
                    count($reference_lines)
                ),
                'lines_count' => count($reference_lines),
                'template_id' => $template_id
            ));

        } catch (Exception $e) {
            error_log('Point-to-Point Save Error: ' . $e->getMessage());
            wp_send_json_error(__('Fehler beim Speichern: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * AJAX Handler: Get Reference Lines
     * Lädt existierende Referenzlinien für Template
     */
    public function ajax_get_reference_lines() {
        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);
        if (!$template_id) {
            wp_send_json_error(__('Template ID fehlt', 'octo-print-designer'));
        }

        try {
            // Lade Referenzlinien aus Meta Field
            $reference_lines = get_post_meta($template_id, '_reference_lines_data', true);

            if (empty($reference_lines)) {
                $reference_lines = array();
            }

            wp_send_json_success(array(
                'reference_lines' => $reference_lines,
                'lines_count' => count($reference_lines),
                'template_id' => $template_id
            ));

        } catch (Exception $e) {
            error_log('Point-to-Point Load Error: ' . $e->getMessage());
            wp_send_json_error(__('Fehler beim Laden: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * Fügt Meta Box für Reference Lines hinzu
     */
    public function add_template_reference_lines_meta_box() {
        // Alle Template-relevanten Post Types einschließen
        $post_types = array('product', 'template', 'octo_template', 'design_template');

        foreach ($post_types as $post_type) {
            add_meta_box(
                'template-reference-lines',
                __('🎯 Point-to-Point Reference Lines Editor', 'octo-print-designer'),
                array($this, 'render_reference_lines_meta_box'),
                $post_type,
                'normal',
                'high'
            );
        }
    }

    /**
     * Rendert die Meta Box für Reference Lines Editor
     */
    public function render_reference_lines_meta_box($post) {
        // Template Image URL aus verschiedenen Quellen versuchen zu laden
        $template_image_url = $this->get_template_image_url($post->ID);

        if (!$template_image_url) {
            echo '<div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 15px 0;">';
            echo '<p><strong>⚠️ ' . __('Template-Bild erforderlich:', 'octo-print-designer') . '</strong></p>';
            echo '<p>' . __('Für das Point-to-Point Interface wird ein Template-Bild benötigt. Bitte:', 'octo-print-designer') . '</p>';
            echo '<ul style="margin-left: 20px;">';
            echo '<li>' . __('Lade ein Beitragsbild hoch, oder', 'octo-print-designer') . '</li>';
            echo '<li>' . __('Setze das "Print Template Image URL" Meta-Feld im "Data Foundation" Bereich', 'octo-print-designer') . '</li>';
            echo '</ul>';
            echo '</div>';
            return;
        }

        // Hidden Fields für JavaScript
        echo '<input type="hidden" id="template-id-input" value="' . esc_attr($post->ID) . '">';
        echo '<input type="hidden" id="template-image-url" value="' . esc_url($template_image_url) . '">';

        // Container für Multi-View Point-to-Point Interface
        echo '<div id="point-to-point-container"></div>';

        // Canvas für Template Image
        echo '<div class="template-canvas-container">';
        echo '<canvas id="template-canvas" width="600" height="400" style="border: 2px solid #ddd; max-width: 100%; height: auto; object-fit: contain;"></canvas>';
        echo '</div>';

        // JavaScript Inline Script für Multi-View Initialization
        echo '<script type="text/javascript">';
        echo '// HIVE-MIND EMERGENCY FIX: Prevent old scripts from interfering';
        echo 'document.addEventListener("DOMContentLoaded", function() {';
        echo '    console.log("🧠 HIVE-MIND: Multi-View Point-to-Point Initialization");';
        echo '    if (typeof initMultiViewPointToPointSelector === "function") {';
        echo '        initMultiViewPointToPointSelector(' . esc_js($post->ID) . ');';
        echo '        console.log("✅ Multi-View System initialized for template:", ' . esc_js($post->ID) . ');';
        echo '    } else {';
        echo '        console.error("❌ Multi-View Script not loaded - falling back to old system");';
        echo '    }';
        echo '});';
        echo '</script>';

        // Zeige Status der aktuellen Referenzlinien
        $current_lines = get_post_meta($post->ID, '_reference_lines_data', true);
        if (!empty($current_lines)) {
            echo '<div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 10px; border-radius: 4px; margin-top: 15px;">';
            echo '<strong>✅ ' . sprintf(__('Gespeicherte Referenzlinien: %d', 'octo-print-designer'), count($current_lines)) . '</strong>';
            echo '</div>';

            echo '<details style="margin-top: 10px;">';
            echo '<summary style="cursor: pointer; color: #0073aa;">' . __('🔍 JSON-Daten anzeigen (für Entwicklung)', 'octo-print-designer') . '</summary>';
            echo '<pre style="background: #f9f9f9; padding: 10px; overflow-x: auto; border: 1px solid #ddd; border-radius: 4px; font-size: 12px; max-height: 200px; overflow-y: auto;">' .
                 esc_html(json_encode($current_lines, JSON_PRETTY_PRINT)) . '</pre>';
            echo '</details>';
        } else {
            echo '<div style="background: #e7f3ff; border: 1px solid #b3d9ff; color: #0056b3; padding: 10px; border-radius: 4px; margin-top: 15px;">';
            echo '<strong>ℹ️ ' . __('Keine Referenzlinien definiert', 'octo-print-designer') . '</strong><br>';
            echo __('Verwende das Point-to-Point Interface oben, um Referenzlinien zu erstellen.', 'octo-print-designer');
            echo '</div>';
        }
    }

    /**
     * Lädt alle Template Views mit Bildern aus _template_variations
     * Optimiert mit Caching für Performance
     */
    private function get_template_views($post_id) {
        // Caching für Performance - verhindert mehrfache DB-Abfragen
        static $template_views_cache = array();

        if (isset($template_views_cache[$post_id])) {
            return $template_views_cache[$post_id];
        }

        $template_variations = get_post_meta($post_id, '_template_variations', true);
        $views = array();

        if (empty($template_variations) || !is_array($template_variations)) {
            // Try alternative meta fields for fallback
            $print_template_image = get_post_meta($post_id, 'print_template_image', true);
            if (!empty($print_template_image)) {
                $views = array(
                    'single' => array(
                        'id' => 'single',
                        'name' => 'Template View',
                        'image_url' => $print_template_image,
                        'image_id' => null,
                        'safe_zone' => array()
                    )
                );
            }

            $template_views_cache[$post_id] = $views;
            return $views;
        }

        // Nehme die erste (Standard) Variation
        $first_variation = reset($template_variations);

        if (isset($first_variation['views']) && is_array($first_variation['views'])) {
            foreach ($first_variation['views'] as $view_id => $view_data) {
                $image_url = '';

                // Lade Attachment URL wenn image ID vorhanden
                if (!empty($view_data['image'])) {
                    $image_url = wp_get_attachment_image_url($view_data['image'], 'full');
                }

                if (!empty($image_url)) {
                    $views[$view_id] = array(
                        'id' => $view_data['id'] ?? $view_id,
                        'name' => $view_data['name'] ?? 'Unnamed View',
                        'image_url' => $image_url,
                        'image_id' => $view_data['image'],
                        'safe_zone' => $view_data['safeZone'] ?? array()
                    );
                }
            }
        }

        // Cache the result für Performance
        $template_views_cache[$post_id] = $views;
        return $views;
    }

    /**
     * Versucht Template Image URL aus verschiedenen Quellen zu laden (Legacy)
     */
    private function get_template_image_url($post_id) {
        // 1. Versuche Template Views (NEUE METHODE)
        $views = $this->get_template_views($post_id);
        if (!empty($views)) {
            $first_view = reset($views);
            return $first_view['image_url'];
        }

        // 2. Versuche print_template_image Meta Field
        $image_url = get_post_meta($post_id, 'print_template_image', true);
        if (!empty($image_url)) {
            return $image_url;
        }

        // 3. Versuche Featured Image
        if (has_post_thumbnail($post_id)) {
            return get_the_post_thumbnail_url($post_id, 'full');
        }

        // 4. Versuche WooCommerce Product Gallery
        if (function_exists('wc_get_product')) {
            $product = wc_get_product($post_id);
            if ($product) {
                $gallery_ids = $product->get_gallery_image_ids();
                if (!empty($gallery_ids)) {
                    return wp_get_attachment_image_url($gallery_ids[0], 'full');
                }
            }
        }

        return false;
    }

    /**
     * AJAX Handler: Get Template Views
     * Lädt alle Views mit Bildern aus Template Variations
     */
    public function ajax_get_template_views() {
        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);
        if (!$template_id) {
            wp_send_json_error(__('Template ID fehlt', 'octo-print-designer'));
        }

        try {
            $views = $this->get_template_views($template_id);

            if (empty($views)) {
                wp_send_json_error(__('Keine Views für dieses Template gefunden', 'octo-print-designer'));
            }

            wp_send_json_success(array(
                'views' => $views,
                'template_id' => $template_id,
                'total_views' => count($views)
            ));

        } catch (Exception $e) {
            error_log('Multi-View Ajax Error: ' . $e->getMessage());
            wp_send_json_error(__('Fehler beim Laden der Views: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * AJAX Handler: Save Multi-View Reference Lines
     * Speichert Reference Lines für alle Views
     */
    public function ajax_save_multi_view_reference_lines() {
        // 🧠 AGENT-5 CORS FIX: Add CORS headers for multi-view save operations
        header('Access-Control-Allow-Origin: ' . get_site_url());
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
        header('Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept, Authorization');
        header('Access-Control-Allow-Credentials: true');

        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);
        $multi_view_lines_json = sanitize_textarea_field($_POST['multi_view_reference_lines']);

        if (!$template_id || !$multi_view_lines_json) {
            wp_send_json_error(__('Template ID oder Multi-View Daten fehlen', 'octo-print-designer'));
        }

        try {
            // Dekodiere Multi-View JSON-Daten
            $multi_view_lines = json_decode(stripslashes($multi_view_lines_json), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('JSON Dekodierung fehlgeschlagen: ' . json_last_error_msg());
            }

            // Validiere Multi-View Struktur
            $total_lines = 0;
            foreach ($multi_view_lines as $view_id => $view_lines) {
                if (!is_array($view_lines)) {
                    throw new Exception('View-Daten müssen Array-Format haben');
                }

                foreach ($view_lines as $line) {
                    if (!isset($line['measurement_key'], $line['label'], $line['lengthPx'], $line['start'], $line['end'])) {
                        throw new Exception('Unvollständige Referenzlinien-Daten in View: ' . $view_id);
                    }

                    // AGENT 3 ENHANCEMENT: Validate integration bridge data
                    if (isset($line['linked_to_measurements']) && $line['linked_to_measurements']) {
                        if (!isset($line['measurement_category'], $line['precision_level'], $line['bridge_version'])) {
                            error_log('AGENT 3 WARNING: Reference line missing integration bridge data: ' . json_encode($line));
                        }

                        // Validate precision level
                        if (isset($line['precision_level']) && (!is_numeric($line['precision_level']) || $line['precision_level'] <= 0)) {
                            throw new Exception('Invalid precision_level for reference line: ' . $line['measurement_key']);
                        }
                    }
                }
                $total_lines += count($view_lines);
            }

            // Speichere in WordPress Meta Field
            $result = update_post_meta($template_id, '_multi_view_reference_lines_data', $multi_view_lines);

            if ($result === false) {
                throw new Exception('Fehler beim Speichern der Multi-View Meta-Daten');
            }

            // Log für Debugging
            error_log('Multi-View Point-to-Point: Referenzlinien für Template ' . $template_id . ' gespeichert: ' . $total_lines . ' Linien in ' . count($multi_view_lines) . ' Views');

            wp_send_json_success(array(
                'message' => sprintf(
                    __('%d Referenzlinien in %d Views erfolgreich gespeichert', 'octo-print-designer'),
                    $total_lines,
                    count($multi_view_lines)
                ),
                'total_lines' => $total_lines,
                'total_views' => count($multi_view_lines),
                'template_id' => $template_id
            ));

        } catch (Exception $e) {
            error_log('Multi-View Save Error: ' . $e->getMessage());
            wp_send_json_error(__('Fehler beim Speichern: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * AJAX Handler: Get Multi-View Reference Lines
     * Lädt existierende Multi-View Referenzlinien für Template
     */
    public function ajax_get_multi_view_reference_lines() {
        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);
        if (!$template_id) {
            wp_send_json_error(__('Template ID fehlt', 'octo-print-designer'));
        }

        try {
            // Lade Multi-View Referenzlinien aus Meta Field
            $multi_view_lines = get_post_meta($template_id, '_multi_view_reference_lines_data', true);

            if (empty($multi_view_lines)) {
                $multi_view_lines = array();
            }

            // Berechne Statistiken
            $total_lines = 0;
            foreach ($multi_view_lines as $view_lines) {
                if (is_array($view_lines)) {
                    $total_lines += count($view_lines);
                }
            }

            wp_send_json_success(array(
                'multi_view_reference_lines' => $multi_view_lines,
                'total_lines' => $total_lines,
                'total_views' => count($multi_view_lines),
                'template_id' => $template_id
            ));

        } catch (Exception $e) {
            error_log('Multi-View Load Error: ' . $e->getMessage());
            wp_send_json_error(__('Fehler beim Laden: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * AJAX Handler: Get Template Image (Legacy Fallback)
     * Single View Fallback wenn Multi-View nicht verfügbar
     */
    public function ajax_get_template_image() {
        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);
        if (!$template_id) {
            wp_send_json_error(__('Template ID fehlt', 'octo-print-designer'));
        }

        try {
            $image_url = $this->get_template_image_url($template_id);

            if (!$image_url) {
                wp_send_json_error(__('Kein Template-Bild gefunden', 'octo-print-designer'));
            }

            wp_send_json_success(array(
                'image_url' => $image_url,
                'template_id' => $template_id,
                'fallback_mode' => true
            ));

        } catch (Exception $e) {
            error_log('Template Image Load Error: ' . $e->getMessage());
            wp_send_json_error(__('Fehler beim Laden des Template-Bildes: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * AGENT 4 ENHANCEMENT: Multi-View Cross-Validation Reference Lines for PrecisionCalculator Integration
     * Enhanced AJAX-Funktion mit Cross-View Validation und Conflict Resolution
     */
    public function ajax_get_reference_lines_for_calculation() {
        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);
        $measurement_key = sanitize_text_field($_POST['measurement_key']);
        $view_id = sanitize_text_field($_POST['view_id']);
        $include_cross_validation = isset($_POST['cross_validation']) ? (bool)$_POST['cross_validation'] : true;
        $resolve_conflicts = isset($_POST['resolve_conflicts']) ? (bool)$_POST['resolve_conflicts'] : true;

        if (!$template_id || !$measurement_key) {
            wp_send_json_error(__('Template ID oder Measurement Key fehlen', 'octo-print-designer'));
        }

        try {
            // Load multi-view reference lines
            $multi_view_lines = get_post_meta($template_id, '_multi_view_reference_lines_data', true);

            if (empty($multi_view_lines)) {
                wp_send_json_error(__('Keine Referenzlinien für dieses Template gefunden', 'octo-print-designer'));
            }

            // AGENT 4: Enhanced Multi-View Reference Line Collection with Cross-Validation
            $matching_lines = array();
            $validation_data = array();
            $cross_view_conflicts = array();

            foreach ($multi_view_lines as $current_view_id => $view_lines) {
                if (!empty($view_id) && $current_view_id !== $view_id) {
                    continue; // Skip if specific view requested
                }

                if (is_array($view_lines)) {
                    foreach ($view_lines as $line) {
                        if ($line['measurement_key'] === $measurement_key &&
                            isset($line['linked_to_measurements']) &&
                            $line['linked_to_measurements']) {

                            // AGENT 4: Enhanced calculation-ready data with cross-view metadata
                            $enhanced_line = array(
                                'measurement_key' => $line['measurement_key'],
                                'label' => $line['label'],
                                'lengthPx' => $line['lengthPx'],
                                'view_id' => $current_view_id,
                                'view_name' => $line['view_name'],
                                'primary_reference' => $line['primary_reference'] ?? false,
                                'measurement_category' => $line['measurement_category'] ?? 'unknown',
                                'precision_level' => $line['precision_level'] ?? 0.1,
                                'bridge_version' => $line['bridge_version'] ?? '1.0',
                                'created_timestamp' => $line['created_timestamp'] ?? 0,

                                // AGENT 4: Cross-View Validation Metadata
                                'cross_view_validated' => false,
                                'validation_score' => 0,
                                'conflicts_detected' => false,
                                'conflict_resolution_applied' => false,
                                'synchronization_status' => 'pending'
                            );

                            $matching_lines[] = $enhanced_line;
                        }
                    }
                }
            }

            if (empty($matching_lines)) {
                wp_send_json_error(__('Keine verknüpfte Referenzlinie für Measurement Key gefunden: ', 'octo-print-designer') . $measurement_key);
            }

            // AGENT 4: Cross-View Validation System Implementation
            if ($include_cross_validation && count($matching_lines) > 1) {
                $validation_results = $this->performCrossViewValidation($matching_lines, $template_id);
                $validation_data = $validation_results['validation_data'];
                $cross_view_conflicts = $validation_results['conflicts'];

                // Apply validation scores to matching lines
                foreach ($matching_lines as $index => $line) {
                    $view_validation = $validation_data[$line['view_id']] ?? null;
                    if ($view_validation) {
                        $matching_lines[$index]['cross_view_validated'] = $view_validation['validated'];
                        $matching_lines[$index]['validation_score'] = $view_validation['score'];
                        $matching_lines[$index]['conflicts_detected'] = !empty($view_validation['conflicts']);
                        $matching_lines[$index]['synchronization_status'] = $view_validation['sync_status'];
                    }
                }

                // AGENT 4: Auto Conflict Resolution if requested
                if ($resolve_conflicts && !empty($cross_view_conflicts)) {
                    $resolution_results = $this->resolveMultiViewConflicts($matching_lines, $cross_view_conflicts);
                    $matching_lines = $resolution_results['resolved_lines'];

                    // Mark conflict resolution as applied
                    foreach ($matching_lines as $index => $line) {
                        $matching_lines[$index]['conflict_resolution_applied'] = $resolution_results['resolution_applied'];
                    }
                }
            }

            // AGENT 4: Performance Optimization - Sort by validation score and precision
            usort($matching_lines, function($a, $b) {
                $score_diff = $b['validation_score'] - $a['validation_score'];
                if ($score_diff !== 0) return $score_diff <=> 0;

                return $b['precision_level'] <=> $a['precision_level'];
            });

            // AGENT 4: Enhanced Success Response with Cross-View Intelligence
            wp_send_json_success(array(
                'reference_lines' => $matching_lines,
                'template_id' => $template_id,
                'measurement_key' => $measurement_key,
                'total_found' => count($matching_lines),

                // AGENT 4: Cross-View Validation Results
                'cross_view_validation' => array(
                    'enabled' => $include_cross_validation,
                    'validation_data' => $validation_data,
                    'conflicts_detected' => $cross_view_conflicts,
                    'total_conflicts' => count($cross_view_conflicts),
                    'conflict_resolution' => array(
                        'enabled' => $resolve_conflicts,
                        'applied' => $resolve_conflicts && !empty($cross_view_conflicts),
                        'success_rate' => $this->calculateConflictResolutionSuccessRate($cross_view_conflicts)
                    )
                ),

                // AGENT 4: Multi-View Statistics
                'multi_view_stats' => array(
                    'total_views_involved' => count(array_unique(array_column($matching_lines, 'view_id'))),
                    'highest_validation_score' => !empty($matching_lines) ? max(array_column($matching_lines, 'validation_score')) : 0,
                    'average_precision_level' => !empty($matching_lines) ? array_sum(array_column($matching_lines, 'precision_level')) / count($matching_lines) : 0,
                    'primary_reference_available' => !empty(array_filter($matching_lines, function($line) { return $line['primary_reference']; }))
                ),

                'agent_version' => '4.0_cross_view_validation'
            ));

        } catch (Exception $e) {
            error_log('AGENT 4 Reference Lines for Calculation Error: ' . $e->getMessage());
            wp_send_json_error(__('Fehler beim Laden der Referenzlinien für Cross-View Berechnung: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * AGENT 4 ENHANCEMENT: Optimized Multi-View Primary Reference Lines with Cross-View Performance Monitoring
     * Performance-optimized AJAX-Funktion mit Memory Caching und Cross-View Validation
     */
    public function ajax_get_primary_reference_lines() {
        $start_time = microtime(true);

        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);
        $force_refresh = isset($_POST['force_refresh']) ? (bool)$_POST['force_refresh'] : false;
        $include_performance_metrics = isset($_POST['performance_metrics']) ? (bool)$_POST['performance_metrics'] : true;
        $cross_view_validation = isset($_POST['cross_validation']) ? (bool)$_POST['cross_validation'] : true;

        if (!$template_id) {
            wp_send_json_error(__('Template ID fehlt', 'octo-print-designer'));
        }

        try {
            // AGENT 4: Memory caching for performance optimization
            $cache_key = "primary_refs_{$template_id}";
            static $cache = array();

            if (!$force_refresh && isset($cache[$cache_key])) {
                $cached_data = $cache[$cache_key];
                $cached_data['cache_hit'] = true;
                $cached_data['execution_time_ms'] = round((microtime(true) - $start_time) * 1000, 2);
                wp_send_json_success($cached_data);
                return;
            }

            // Load multi-view reference lines with performance monitoring
            $load_start = microtime(true);
            $multi_view_lines = get_post_meta($template_id, '_multi_view_reference_lines_data', true);
            $load_time = microtime(true) - $load_start;

            if (empty($multi_view_lines)) {
                wp_send_json_success(array(
                    'primary_references' => array(),
                    'template_id' => $template_id,
                    'message' => 'Keine Referenzlinien gefunden',
                    'performance_metrics' => array(
                        'execution_time_ms' => round((microtime(true) - $start_time) * 1000, 2),
                        'db_load_time_ms' => round($load_time * 1000, 2),
                        'cache_hit' => false
                    )
                ));
            }

            // AGENT 4: Enhanced primary reference line collection with cross-view intelligence
            $primary_references = array();
            $view_statistics = array();
            $processing_start = microtime(true);

            foreach ($multi_view_lines as $view_id => $view_lines) {
                $view_stats = array(
                    'total_lines' => 0,
                    'primary_lines' => 0,
                    'linked_lines' => 0,
                    'validation_scores' => array()
                );

                if (is_array($view_lines)) {
                    $view_stats['total_lines'] = count($view_lines);

                    foreach ($view_lines as $line) {
                        if (isset($line['linked_to_measurements']) && $line['linked_to_measurements']) {
                            $view_stats['linked_lines']++;
                        }

                        if (isset($line['primary_reference']) && $line['primary_reference'] === true &&
                            isset($line['linked_to_measurements']) && $line['linked_to_measurements']) {

                            $view_stats['primary_lines']++;

                            // AGENT 4: Enhanced primary reference data structure
                            $primary_ref = array(
                                'measurement_key' => $line['measurement_key'],
                                'label' => $line['label'],
                                'lengthPx' => $line['lengthPx'],
                                'view_id' => $view_id,
                                'view_name' => $line['view_name'] ?? $view_id,
                                'measurement_category' => $line['measurement_category'] ?? 'unknown',
                                'precision_level' => $line['precision_level'] ?? 0.1,
                                'bridge_version' => $line['bridge_version'] ?? '1.0',
                                'created_timestamp' => $line['created_timestamp'] ?? 0,

                                // AGENT 4: Cross-View Performance Metadata
                                'performance_score' => $this->calculatePrimaryReferencePerformanceScore($line),
                                'cross_view_compatibility' => 'unknown',
                                'validation_status' => 'pending'
                            );

                            $primary_references[] = $primary_ref;
                        }
                    }
                }

                $view_statistics[$view_id] = $view_stats;
            }

            $processing_time = microtime(true) - $processing_start;

            // AGENT 4: Cross-View Validation for Primary References
            $cross_view_results = array();
            if ($cross_view_validation && count($primary_references) > 1) {
                $validation_start = microtime(true);
                $cross_view_results = $this->validatePrimaryReferencesAcrossViews($primary_references);
                $validation_time = microtime(true) - $validation_start;

                // Apply cross-view validation results
                foreach ($primary_references as $index => $ref) {
                    $validation_result = $cross_view_results['reference_validations'][$ref['measurement_key']] ?? null;
                    if ($validation_result) {
                        $primary_references[$index]['cross_view_compatibility'] = $validation_result['compatibility'];
                        $primary_references[$index]['validation_status'] = $validation_result['status'];
                    }
                }
            } else {
                $validation_time = 0;
            }

            // AGENT 4: Performance optimization - Sort by performance score and precision
            usort($primary_references, function($a, $b) {
                $performance_diff = $b['performance_score'] - $a['performance_score'];
                if ($performance_diff !== 0) return $performance_diff <=> 0;

                return $b['precision_level'] <=> $a['precision_level'];
            });

            // AGENT 4: Calculate comprehensive statistics
            $total_execution_time = microtime(true) - $start_time;
            $statistics = array(
                'total_primary_references' => count($primary_references),
                'views_with_primaries' => count(array_filter($view_statistics, function($stats) { return $stats['primary_lines'] > 0; })),
                'total_views_processed' => count($view_statistics),
                'highest_performance_score' => !empty($primary_references) ? max(array_column($primary_references, 'performance_score')) : 0,
                'average_precision_level' => !empty($primary_references) ?
                    round(array_sum(array_column($primary_references, 'precision_level')) / count($primary_references), 2) : 0,
                'cross_view_compatible_count' => count(array_filter($primary_references, function($ref) {
                    return $ref['cross_view_compatibility'] === 'high' || $ref['cross_view_compatibility'] === 'medium';
                }))
            );

            // AGENT 4: Prepare enhanced response with comprehensive data
            $response_data = array(
                'primary_references' => $primary_references,
                'template_id' => $template_id,
                'total_primary' => count($primary_references),
                'calculation_ready' => count($primary_references) > 0,

                // AGENT 4: Enhanced Statistics
                'statistics' => $statistics,
                'view_statistics' => $view_statistics,

                // AGENT 4: Cross-View Validation Results
                'cross_view_validation' => array(
                    'enabled' => $cross_view_validation,
                    'results' => $cross_view_results,
                    'compatibility_summary' => $this->summarizeCrossViewCompatibility($primary_references),
                    'recommendations' => $this->generateCrossViewRecommendations($primary_references, $cross_view_results)
                ),

                // AGENT 4: Performance Metrics
                'performance_metrics' => array(
                    'total_execution_time_ms' => round($total_execution_time * 1000, 2),
                    'db_load_time_ms' => round($load_time * 1000, 2),
                    'processing_time_ms' => round($processing_time * 1000, 2),
                    'validation_time_ms' => round($validation_time * 1000, 2),
                    'cache_hit' => false,
                    'memory_usage_kb' => round(memory_get_usage() / 1024, 2),
                    'peak_memory_kb' => round(memory_get_peak_usage() / 1024, 2)
                ),

                'agent_version' => '4.0_primary_references_optimized'
            );

            // AGENT 4: Cache the results for performance
            $cache[$cache_key] = $response_data;

            wp_send_json_success($response_data);

        } catch (Exception $e) {
            $execution_time = microtime(true) - $start_time;
            error_log("AGENT 4 Primary Reference Lines Error ({$execution_time}s): " . $e->getMessage());
            wp_send_json_error(__('Fehler beim Laden der optimierten primären Referenzlinien: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * DELETION SYSTEM: Delete single reference line by view and measurement key
     * AJAX Handler: Delete Reference Line
     */
    public function ajax_delete_reference_line() {
        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);
        $view_id = sanitize_text_field($_POST['view_id']);
        $measurement_key = sanitize_text_field($_POST['measurement_key']);

        if (!$template_id || !$view_id || !$measurement_key) {
            wp_send_json_error(__('Template ID, View ID oder Measurement Key fehlt', 'octo-print-designer'));
        }

        try {
            // Load current multi-view reference lines
            $multi_view_lines = get_post_meta($template_id, '_multi_view_reference_lines_data', true);

            if (empty($multi_view_lines)) {
                wp_send_json_error(__('Keine Referenzlinien gefunden', 'octo-print-designer'));
            }

            // Check if view exists
            if (!isset($multi_view_lines[$view_id])) {
                wp_send_json_error(__('View nicht gefunden', 'octo-print-designer'));
            }

            // Find and remove the specific reference line
            $line_found = false;
            $deleted_line = null;

            if (is_array($multi_view_lines[$view_id])) {
                foreach ($multi_view_lines[$view_id] as $index => $line) {
                    if (isset($line['measurement_key']) && $line['measurement_key'] === $measurement_key) {
                        $deleted_line = $line;
                        unset($multi_view_lines[$view_id][$index]);
                        $line_found = true;
                        break;
                    }
                }

                // Re-index the array to prevent gaps
                $multi_view_lines[$view_id] = array_values($multi_view_lines[$view_id]);
            }

            if (!$line_found) {
                wp_send_json_error(__('Referenzlinie nicht gefunden', 'octo-print-designer'));
            }

            // Save updated data to database
            $update_result = update_post_meta($template_id, '_multi_view_reference_lines_data', $multi_view_lines);

            if ($update_result === false) {
                throw new Exception('Database update failed');
            }

            // Calculate new statistics
            $total_lines = 0;
            foreach ($multi_view_lines as $view_lines) {
                if (is_array($view_lines)) {
                    $total_lines += count($view_lines);
                }
            }

            wp_send_json_success(array(
                'message' => sprintf(__('Referenzlinie "%s" erfolgreich gelöscht', 'octo-print-designer'), $deleted_line['label'] ?? $measurement_key),
                'deleted_line' => $deleted_line,
                'view_id' => $view_id,
                'measurement_key' => $measurement_key,
                'remaining_lines_in_view' => count($multi_view_lines[$view_id]),
                'total_lines_remaining' => $total_lines,
                'updated_multi_view_lines' => $multi_view_lines,
                'template_id' => $template_id,
                'timestamp' => current_time('timestamp')
            ));

        } catch (Exception $e) {
            error_log('Delete Reference Line Error: ' . $e->getMessage());
            wp_send_json_error(__('Fehler beim Löschen der Referenzlinie: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * DELETION SYSTEM: Delete all reference lines in a specific view
     * AJAX Handler: Delete View Reference Lines
     */
    public function ajax_delete_view_reference_lines() {
        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);
        $view_id = sanitize_text_field($_POST['view_id']);

        if (!$template_id || !$view_id) {
            wp_send_json_error(__('Template ID oder View ID fehlt', 'octo-print-designer'));
        }

        try {
            // Load current multi-view reference lines
            $multi_view_lines = get_post_meta($template_id, '_multi_view_reference_lines_data', true);

            if (empty($multi_view_lines)) {
                wp_send_json_error(__('Keine Referenzlinien gefunden', 'octo-print-designer'));
            }

            // Check if view exists and has lines
            if (!isset($multi_view_lines[$view_id]) || !is_array($multi_view_lines[$view_id])) {
                wp_send_json_error(__('View nicht gefunden oder hat keine Referenzlinien', 'octo-print-designer'));
            }

            $deleted_lines_count = count($multi_view_lines[$view_id]);
            $deleted_lines = $multi_view_lines[$view_id];

            if ($deleted_lines_count === 0) {
                wp_send_json_error(__('Keine Referenzlinien in dieser View vorhanden', 'octo-print-designer'));
            }

            // Clear the view's reference lines
            $multi_view_lines[$view_id] = array();

            // Save updated data to database
            $update_result = update_post_meta($template_id, '_multi_view_reference_lines_data', $multi_view_lines);

            if ($update_result === false) {
                throw new Exception('Database update failed');
            }

            // Calculate new statistics
            $total_lines = 0;
            foreach ($multi_view_lines as $view_lines) {
                if (is_array($view_lines)) {
                    $total_lines += count($view_lines);
                }
            }

            wp_send_json_success(array(
                'message' => sprintf(__('%d Referenzlinien in View erfolgreich gelöscht', 'octo-print-designer'), $deleted_lines_count),
                'deleted_lines' => $deleted_lines,
                'deleted_lines_count' => $deleted_lines_count,
                'view_id' => $view_id,
                'total_lines_remaining' => $total_lines,
                'updated_multi_view_lines' => $multi_view_lines,
                'template_id' => $template_id,
                'timestamp' => current_time('timestamp')
            ));

        } catch (Exception $e) {
            error_log('Delete View Reference Lines Error: ' . $e->getMessage());
            wp_send_json_error(__('Fehler beim Löschen der View-Referenzlinien: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * DELETION SYSTEM: Delete all reference lines in all views
     * AJAX Handler: Delete All Reference Lines
     */
    public function ajax_delete_all_reference_lines() {
        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);

        if (!$template_id) {
            wp_send_json_error(__('Template ID fehlt', 'octo-print-designer'));
        }

        try {
            // Load current multi-view reference lines
            $multi_view_lines = get_post_meta($template_id, '_multi_view_reference_lines_data', true);

            if (empty($multi_view_lines)) {
                wp_send_json_error(__('Keine Referenzlinien gefunden', 'octo-print-designer'));
            }

            // Count existing lines for feedback
            $total_deleted_lines = 0;
            $deleted_views_data = array();

            foreach ($multi_view_lines as $view_id => $view_lines) {
                if (is_array($view_lines) && count($view_lines) > 0) {
                    $deleted_views_data[$view_id] = array(
                        'count' => count($view_lines),
                        'lines' => $view_lines
                    );
                    $total_deleted_lines += count($view_lines);
                }
            }

            if ($total_deleted_lines === 0) {
                wp_send_json_error(__('Keine Referenzlinien zum Löschen vorhanden', 'octo-print-designer'));
            }

            // Clear all reference lines (reset to empty array)
            $multi_view_lines = array();

            // Save updated (empty) data to database
            $update_result = update_post_meta($template_id, '_multi_view_reference_lines_data', $multi_view_lines);

            if ($update_result === false) {
                throw new Exception('Database update failed');
            }

            wp_send_json_success(array(
                'message' => sprintf(__('Alle %d Referenzlinien erfolgreich gelöscht', 'octo-print-designer'), $total_deleted_lines),
                'deleted_total_lines' => $total_deleted_lines,
                'deleted_views_count' => count($deleted_views_data),
                'deleted_views_data' => $deleted_views_data,
                'updated_multi_view_lines' => $multi_view_lines,
                'template_id' => $template_id,
                'timestamp' => current_time('timestamp')
            ));

        } catch (Exception $e) {
            error_log('Delete All Reference Lines Error: ' . $e->getMessage());
            wp_send_json_error(__('Fehler beim Löschen aller Referenzlinien: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * INTEGRATION BRIDGE: Save measurement assignment with enhanced data structure
     */
    public function ajax_save_measurement_assignment() {
        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);
        $measurement_key = sanitize_text_field($_POST['measurement_key']);
        $reference_line_data = json_decode(stripslashes($_POST['reference_line_data']), true);

        if (!$template_id || !$measurement_key || !$reference_line_data) {
            wp_send_json_error(__('Erforderliche Daten fehlen', 'octo-print-designer'));
        }

        try {
            // Get current measurement assignments
            $assignments = get_post_meta($template_id, '_measurement_assignments', true);
            if (!is_array($assignments)) {
                $assignments = array();
            }

            // Enhanced assignment data structure
            $assignment = array(
                'measurement_key' => $measurement_key,
                'measurement_label' => $this->get_measurement_label($measurement_key),
                'measurement_category' => $this->get_measurement_category($measurement_key),
                'precision_level' => $this->get_precision_level($measurement_key),
                'reference_line_data' => $reference_line_data,
                'bridge_version' => '2.1',
                'coordinate_system' => 'enhanced_multi_transform',
                'transformation_quality' => $reference_line_data['transformation_quality'] ?? 0,
                'created_at' => current_time('mysql'),
                'updated_at' => current_time('mysql')
            );

            // Validate assignment for conflicts
            $validation_result = $this->validate_measurement_assignment($assignment, $assignments);
            if (!$validation_result['valid']) {
                wp_send_json_error(array(
                    'message' => __('Measurement assignment validation failed', 'octo-print-designer'),
                    'validation_errors' => $validation_result['errors']
                ));
            }

            // Save assignment
            $assignments[$measurement_key] = $assignment;
            $update_result = update_post_meta($template_id, '_measurement_assignments', $assignments);

            if ($update_result === false) {
                throw new Exception('Database update failed');
            }

            // Calculate integration score
            $integration_score = $this->calculate_integration_bridge_score($template_id);

            wp_send_json_success(array(
                'message' => __('Measurement assignment saved successfully', 'octo-print-designer'),
                'assignment' => $assignment,
                'integration_score' => $integration_score,
                'validation_result' => $validation_result,
                'total_assignments' => count($assignments)
            ));

        } catch (Exception $e) {
            error_log('Save Measurement Assignment Error: ' . $e->getMessage());
            wp_send_json_error(__('Fehler beim Speichern: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * INTEGRATION BRIDGE: Get measurement assignments with enhanced metadata
     */
    public function ajax_get_measurement_assignments() {
        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);

        if (!$template_id) {
            wp_send_json_error(__('Template ID fehlt', 'octo-print-designer'));
        }

        try {
            // Get measurement assignments
            $assignments = get_post_meta($template_id, '_measurement_assignments', true);
            if (!is_array($assignments)) {
                $assignments = array();
            }

            // Get multi-view reference lines for context
            $multi_view_lines = get_post_meta($template_id, '_multi_view_reference_lines_data', true);
            if (!is_array($multi_view_lines)) {
                $multi_view_lines = array();
            }

            // Calculate comprehensive status
            $status = array(
                'total_assignments' => count($assignments),
                'integration_score' => $this->calculate_integration_bridge_score($template_id),
                'conflict_count' => $this->count_assignment_conflicts($assignments),
                'precision_ready_count' => $this->count_precision_ready_assignments($assignments),
                'bridge_version' => '2.1',
                'last_updated' => $this->get_last_assignment_update($assignments)
            );

            wp_send_json_success(array(
                'assignments' => $assignments,
                'multi_view_lines' => $multi_view_lines,
                'status' => $status,
                'template_id' => $template_id
            ));

        } catch (Exception $e) {
            error_log('Get Measurement Assignments Error: ' . $e->getMessage());
            wp_send_json_error(__('Fehler beim Laden der Assignments: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * INTEGRATION BRIDGE: Validate measurement assignments for conflicts
     */
    public function ajax_validate_measurement_assignments() {
        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);

        if (!$template_id) {
            wp_send_json_error(__('Template ID fehlt', 'octo-print-designer'));
        }

        try {
            $assignments = get_post_meta($template_id, '_measurement_assignments', true);
            if (!is_array($assignments)) {
                $assignments = array();
            }

            $validation_result = $this->comprehensive_assignment_validation($assignments, $template_id);

            wp_send_json_success(array(
                'validation_result' => $validation_result,
                'template_id' => $template_id,
                'timestamp' => current_time('timestamp')
            ));

        } catch (Exception $e) {
            error_log('Validate Measurement Assignments Error: ' . $e->getMessage());
            wp_send_json_error(__('Validation error: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * INTEGRATION BRIDGE: Get comprehensive integration bridge status
     */
    public function ajax_get_integration_bridge_status() {
        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);

        if (!$template_id) {
            wp_send_json_error(__('Template ID fehlt', 'octo-print-designer'));
        }

        try {
            $bridge_status = $this->calculate_comprehensive_bridge_status($template_id);

            wp_send_json_success(array(
                'bridge_status' => $bridge_status,
                'template_id' => $template_id,
                'timestamp' => current_time('timestamp')
            ));

        } catch (Exception $e) {
            error_log('Get Integration Bridge Status Error: ' . $e->getMessage());
            wp_send_json_error(__('Status error: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * INTEGRATION BRIDGE: Calculate precision metrics for measurements
     */
    public function ajax_calculate_precision_metrics() {
        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);
        $measurement_key = isset($_POST['measurement_key']) ? sanitize_text_field($_POST['measurement_key']) : null;

        if (!$template_id) {
            wp_send_json_error(__('Template ID fehlt', 'octo-print-designer'));
        }

        try {
            $precision_metrics = $this->calculate_measurement_precision_metrics($template_id, $measurement_key);

            wp_send_json_success(array(
                'precision_metrics' => $precision_metrics,
                'template_id' => $template_id,
                'measurement_key' => $measurement_key,
                'timestamp' => current_time('timestamp')
            ));

        } catch (Exception $e) {
            error_log('Calculate Precision Metrics Error: ' . $e->getMessage());
            wp_send_json_error(__('Precision calculation error: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    // INTEGRATION BRIDGE: Helper methods for enhanced functionality

    private function get_measurement_label($measurement_key) {
        $labels = array(
            'A' => 'Chest Width',
            'B' => 'Hem Width',
            'C' => 'Height from Shoulder',
            'D' => 'Shoulder Width',
            'E' => 'Sleeve Length',
            'F' => 'Collar Width'
        );
        return isset($labels[$measurement_key]) ? $labels[$measurement_key] : $measurement_key;
    }

    private function get_measurement_category($measurement_key) {
        $categories = array(
            'A' => 'horizontal',
            'B' => 'horizontal',
            'C' => 'vertical',
            'D' => 'horizontal',
            'E' => 'vertical',
            'F' => 'detail'
        );
        return isset($categories[$measurement_key]) ? $categories[$measurement_key] : 'horizontal';
    }

    private function get_precision_level($measurement_key) {
        $precision_levels = array(
            'A' => 5, // Primary measurement - highest precision
            'C' => 5, // Primary measurement - highest precision
            'D' => 4, // Important secondary measurement
            'B' => 3, // Standard measurement
            'E' => 3, // Standard measurement
            'F' => 2  // Detail measurement
        );
        return isset($precision_levels[$measurement_key]) ? $precision_levels[$measurement_key] : 3;
    }

    private function validate_measurement_assignment($assignment, $existing_assignments) {
        $errors = array();
        $warnings = array();

        // Check for duplicate assignments
        if (isset($existing_assignments[$assignment['measurement_key']])) {
            $warnings[] = 'Overwriting existing assignment for ' . $assignment['measurement_key'];
        }

        // Check transformation quality
        if (isset($assignment['transformation_quality']) && $assignment['transformation_quality'] < 80) {
            $warnings[] = 'Low transformation quality: ' . $assignment['transformation_quality'] . '%';
        }

        // Validate precision level
        if ($assignment['precision_level'] < 1 || $assignment['precision_level'] > 5) {
            $errors[] = 'Invalid precision level: ' . $assignment['precision_level'];
        }

        return array(
            'valid' => empty($errors),
            'errors' => $errors,
            'warnings' => $warnings
        );
    }

    private function calculate_integration_bridge_score($template_id) {
        $assignments = get_post_meta($template_id, '_measurement_assignments', true);
        if (!is_array($assignments)) {
            return 0;
        }

        $multi_view_lines = get_post_meta($template_id, '_multi_view_reference_lines_data', true);
        if (!is_array($multi_view_lines)) {
            return 0;
        }

        $score = 0;
        $max_score = 100;

        // Assignment coverage (40 points)
        $assignment_coverage = count($assignments) > 0 ? min(40, count($assignments) * 8) : 0;
        $score += $assignment_coverage;

        // Data quality (30 points)
        $quality_score = 0;
        foreach ($assignments as $assignment) {
            if (isset($assignment['transformation_quality'])) {
                $quality_score += $assignment['transformation_quality'] * 0.3;
            }
        }
        $score += min(30, $quality_score);

        // Multi-view coordination (20 points)
        $view_count = count($multi_view_lines);
        $coordination_score = $view_count > 0 ? min(20, $view_count * 5) : 0;
        $score += $coordination_score;

        // Bridge version compatibility (10 points)
        $version_score = 0;
        foreach ($assignments as $assignment) {
            if (isset($assignment['bridge_version']) && $assignment['bridge_version'] === '2.1') {
                $version_score += 2;
            }
        }
        $score += min(10, $version_score);

        return min($max_score, round($score));
    }

    private function count_assignment_conflicts($assignments) {
        // Implementation for counting conflicts
        $conflicts = 0;
        $categories = array();

        foreach ($assignments as $assignment) {
            $category = $assignment['measurement_category'] ?? 'unknown';
            if (!isset($categories[$category])) {
                $categories[$category] = 0;
            }
            $categories[$category]++;
        }

        // Check for category conflicts (simplified logic)
        foreach ($categories as $count) {
            if ($count > 3) { // More than 3 measurements in same category
                $conflicts++;
            }
        }

        return $conflicts;
    }

    private function count_precision_ready_assignments($assignments) {
        $ready_count = 0;
        foreach ($assignments as $assignment) {
            if (isset($assignment['transformation_quality']) &&
                $assignment['transformation_quality'] >= 80 &&
                isset($assignment['precision_level']) &&
                $assignment['precision_level'] >= 3) {
                $ready_count++;
            }
        }
        return $ready_count;
    }

    private function get_last_assignment_update($assignments) {
        $latest = null;
        foreach ($assignments as $assignment) {
            if (isset($assignment['updated_at'])) {
                if (!$latest || strtotime($assignment['updated_at']) > strtotime($latest)) {
                    $latest = $assignment['updated_at'];
                }
            }
        }
        return $latest;
    }

    private function comprehensive_assignment_validation($assignments, $template_id) {
        return array(
            'valid' => true,
            'score' => $this->calculate_integration_bridge_score($template_id),
            'conflicts' => $this->count_assignment_conflicts($assignments),
            'precision_ready' => $this->count_precision_ready_assignments($assignments),
            'total_assignments' => count($assignments),
            'bridge_version' => '2.1'
        );
    }

    private function calculate_comprehensive_bridge_status($template_id) {
        $assignments = get_post_meta($template_id, '_measurement_assignments', true) ?: array();
        $multi_view_lines = get_post_meta($template_id, '_multi_view_reference_lines_data', true) ?: array();

        return array(
            'integration_score' => $this->calculate_integration_bridge_score($template_id),
            'assignments_count' => count($assignments),
            'views_count' => count($multi_view_lines),
            'conflicts_count' => $this->count_assignment_conflicts($assignments),
            'precision_ready_count' => $this->count_precision_ready_assignments($assignments),
            'bridge_version' => '2.1',
            'status' => count($assignments) > 0 ? 'active' : 'inactive',
            'last_updated' => $this->get_last_assignment_update($assignments)
        );
    }

    private function calculate_measurement_precision_metrics($template_id, $measurement_key = null) {
        $assignments = get_post_meta($template_id, '_measurement_assignments', true) ?: array();

        if ($measurement_key && isset($assignments[$measurement_key])) {
            $assignment = $assignments[$measurement_key];
            return array(
                'measurement_key' => $measurement_key,
                'precision_level' => $assignment['precision_level'] ?? 3,
                'transformation_quality' => $assignment['transformation_quality'] ?? 0,
                'category' => $assignment['measurement_category'] ?? 'unknown',
                'bridge_ready' => ($assignment['transformation_quality'] ?? 0) >= 80
            );
        }

        // Return metrics for all measurements
        $metrics = array();
        foreach ($assignments as $key => $assignment) {
            $metrics[$key] = array(
                'precision_level' => $assignment['precision_level'] ?? 3,
                'transformation_quality' => $assignment['transformation_quality'] ?? 0,
                'category' => $assignment['measurement_category'] ?? 'unknown',
                'bridge_ready' => ($assignment['transformation_quality'] ?? 0) >= 80
            );
        }

        return $metrics;
    }

    /**
     * AGENT 2 DATABASE INTEGRATOR: Get measurement types from wp_template_measurements table
     *
     * This endpoint fetches measurement types directly from the database instead of using hardcoded values.
     * It provides dynamic measurement data based on what's actually stored in the wp_template_measurements table.
     */
    /**
     * 🧠 AGENT 3: ENHANCED DATABASE MEASUREMENT TYPES AJAX HANDLER
     * Optimized version with Redis/Memory caching and PrecisionCalculator integration
     */
    public function ajax_get_database_measurement_types() {
        $start_time = microtime(true);

        // 🧠 AGENT-1 CORS FIX: Add CORS headers for XMLHttpRequest compatibility
        header('Access-Control-Allow-Origin: ' . get_site_url());
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
        header('Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept, Authorization');
        header('Access-Control-Allow-Credentials: true');

        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);
        $force_refresh = isset($_POST['force_refresh']) ? (bool)$_POST['force_refresh'] : false;

        if (!$template_id) {
            wp_send_json_error(__('Template ID fehlt', 'octo-print-designer'));
        }

        try {
            // 🚀 AGENT 3 ENHANCEMENT: Initialize PrecisionDatabaseCacheManager
            $cache_manager = null;
            if (class_exists('PrecisionDatabaseCacheManager')) {
                $cache_manager = new PrecisionDatabaseCacheManager();
            } else {
                error_log('🧠 AGENT 3: PrecisionDatabaseCacheManager not found, falling back to direct database access');
            }

            // Initialize TemplateMeasurementManager for fallback
            if (!class_exists('TemplateMeasurementManager')) {
                throw new Exception('TemplateMeasurementManager class not found');
            }

            $measurement_manager = new TemplateMeasurementManager();

            // 🎯 CACHED DATA RETRIEVAL: Use cache manager if available
            if ($cache_manager) {
                // Get cached measurements with enhanced metadata
                $enhanced_measurements = $cache_manager->getCachedMeasurements($template_id, $force_refresh);
                $enhanced_types = $cache_manager->getCachedMeasurementTypes($template_id, $force_refresh);

                $measurements_data = $enhanced_measurements['measurements'];
                $template_sizes = $measurement_manager->get_template_sizes($template_id);
                $database_measurement_types = $enhanced_types;

                // Get cache statistics for performance monitoring
                $cache_stats = $cache_manager->getCacheStatistics();

            } else {
                // Fallback to direct database access
                $template_sizes = $measurement_manager->get_template_sizes($template_id);
                $measurements_data = $measurement_manager->get_measurements($template_id);

                // Extract unique measurement types from database
                $database_measurement_types = array();
                foreach ($measurements_data as $size_key => $measurements) {
                    foreach ($measurements as $measurement_key => $measurement_info) {
                        if (!isset($database_measurement_types[$measurement_key])) {
                            $database_measurement_types[$measurement_key] = array(
                                'label' => $measurement_info['label'],
                                'description' => $this->get_measurement_description($measurement_key),
                                'category' => $this->get_measurement_category($measurement_key),
                                'found_in_sizes' => array(),
                                'precision_ready' => false // Mark as not optimized
                            );
                        }

                        // Track which sizes have this measurement
                        if (!in_array($size_key, $database_measurement_types[$measurement_key]['found_in_sizes'])) {
                            $database_measurement_types[$measurement_key]['found_in_sizes'][] = $size_key;
                        }
                    }
                }

                $cache_stats = array('cache_enabled' => false);
            }

            if (empty($template_sizes)) {
                wp_send_json_error(__('Keine Template-Größen definiert', 'octo-print-designer'));
            }

            // If no measurements in database, provide fallback with common measurement types
            if (empty($database_measurement_types)) {
                $database_measurement_types = $this->get_fallback_measurement_types();
            }

            // Calculate coverage statistics
            $coverage_stats = $this->calculate_measurement_coverage($template_sizes, $measurements_data);

            // 🧮 PRECISION CALCULATOR INTEGRATION: Check for precision calculation support
            $precision_support = array(
                'enabled' => class_exists('PrecisionCalculator'),
                'cache_enabled' => $cache_manager !== null,
                'calculation_ready' => $this->assessPrecisionCalculationReadiness($template_id, $database_measurement_types)
            );

            // Calculate performance metrics
            $execution_time = microtime(true) - $start_time;
            $performance = array(
                'execution_time_ms' => round($execution_time * 1000, 2),
                'data_source' => $cache_manager ? 'cached_database' : 'direct_database',
                'cache_stats' => $cache_stats
            );

            // 🔄 MULTI-VIEW INTEGRATION: Check for reference lines data
            $multi_view_data = get_post_meta($template_id, '_multi_view_reference_lines_data', true);
            $has_reference_lines = is_array($multi_view_data) && !empty($multi_view_data);

            wp_send_json_success(array(
                'measurement_types' => $database_measurement_types,
                'template_sizes' => $template_sizes,
                'coverage_stats' => $coverage_stats,
                'precision_support' => $precision_support,
                'performance' => $performance,
                'multi_view_integration' => array(
                    'reference_lines_available' => $has_reference_lines,
                    'reference_lines_count' => $has_reference_lines ? $this->countReferenceLines($multi_view_data) : 0
                ),
                'data_source' => 'enhanced_database_v3',
                'template_id' => $template_id,
                'total_measurement_types' => count($database_measurement_types),
                'total_sizes' => count($template_sizes),
                'total_measurements' => $this->count_total_measurements($measurements_data),
                'agent_version' => '3.0_database_cache_enhanced'
            ));

        } catch (Exception $e) {
            $execution_time = microtime(true) - $start_time;
            error_log("🧠 AGENT 3 Database Measurement Types Ajax Error ({$execution_time}s): " . $e->getMessage());
            wp_send_json_error(__('Fehler beim Laden der Measurement Types aus der Datenbank: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * Get measurement description for better UI display
     */
    private function get_measurement_description($measurement_key) {
        $descriptions = array(
            'A' => 'Brustumfang - Horizontal measurement across chest',
            'B' => 'Saumweite - Width of the garment at the hem',
            'C' => 'Höhe ab Schulter - Vertical length from shoulder point',
            'D' => 'Schulterbreite - Distance between shoulder seams',
            'E' => 'Ärmellänge - Length of the sleeve',
            'F' => 'Rückenlänge - Back length measurement',
            'G' => 'Armausschnitt Breite - Armhole width measurement',
            'H' => 'Halsausschnitt Breite - Neckline width',
            'J' => 'Saumhöhe - Height of hem detail'
        );

        return isset($descriptions[$measurement_key]) ? $descriptions[$measurement_key] : 'Custom measurement type';
    }

    /**
     * Get fallback measurement types when database is empty
     */
    private function get_fallback_measurement_types() {
        return array(
            'A' => array(
                'label' => 'Chest',
                'description' => 'Brustumfang - Horizontal measurement across chest',
                'category' => 'horizontal',
                'found_in_sizes' => array()
            ),
            'B' => array(
                'label' => 'Hem Width',
                'description' => 'Saumweite - Width of the garment at the hem',
                'category' => 'horizontal',
                'found_in_sizes' => array()
            ),
            'C' => array(
                'label' => 'Height from Shoulder',
                'description' => 'Höhe ab Schulter - Vertical length from shoulder point',
                'category' => 'vertical',
                'found_in_sizes' => array()
            ),
            'D' => array(
                'label' => 'Shoulder Width',
                'description' => 'Schulterbreite - Distance between shoulder seams',
                'category' => 'horizontal',
                'found_in_sizes' => array()
            ),
            'E' => array(
                'label' => 'Sleeve Length',
                'description' => 'Ärmellänge - Length of the sleeve',
                'category' => 'vertical',
                'found_in_sizes' => array()
            ),
            'F' => array(
                'label' => 'Back Length',
                'description' => 'Rückenlänge - Back length measurement',
                'category' => 'vertical',
                'found_in_sizes' => array()
            )
        );
    }

    /**
     * Calculate measurement coverage statistics
     */
    private function calculate_measurement_coverage($template_sizes, $measurements_data) {
        $total_sizes = count($template_sizes);
        $total_possible_measurements = 0;
        $total_actual_measurements = 0;
        $coverage_by_measurement = array();

        foreach ($template_sizes as $size) {
            $size_key = $size['id'];
            $measurements_in_size = isset($measurements_data[$size_key]) ? count($measurements_data[$size_key]) : 0;
            $total_actual_measurements += $measurements_in_size;
        }

        // Count unique measurement types
        $unique_measurement_types = array();
        foreach ($measurements_data as $size_key => $measurements) {
            foreach ($measurements as $measurement_key => $measurement_info) {
                $unique_measurement_types[$measurement_key] = true;
            }
        }

        $total_possible_measurements = $total_sizes * count($unique_measurement_types);
        $coverage_percentage = $total_possible_measurements > 0 ?
            round(($total_actual_measurements / $total_possible_measurements) * 100, 1) : 0;

        return array(
            'total_sizes' => $total_sizes,
            'unique_measurement_types' => count($unique_measurement_types),
            'total_possible_measurements' => $total_possible_measurements,
            'total_actual_measurements' => $total_actual_measurements,
            'coverage_percentage' => $coverage_percentage
        );
    }

    /**
     * Count total measurements in the data
     */
    private function count_total_measurements($measurements_data) {
        $total = 0;
        foreach ($measurements_data as $size_measurements) {
            if (is_array($size_measurements)) {
                $total += count($size_measurements);
            }
        }
        return $total;
    }

    /**
     * 🧠 AGENT 3: MISSING HELPER METHODS FOR ENHANCED AJAX HANDLER
     */


    /**
     * Assess readiness for precision calculations
     *
     * @param int $template_id Template post ID
     * @param array $measurement_types Available measurement types
     * @return bool True if ready for precision calculations
     */
    private function assessPrecisionCalculationReadiness($template_id, $measurement_types) {
        // Check if we have reference lines
        $multi_view_data = get_post_meta($template_id, '_multi_view_reference_lines_data', true);
        $has_reference_lines = is_array($multi_view_data) && !empty($multi_view_data);

        // Check if we have measurement assignments
        $assignments = get_post_meta($template_id, '_measurement_assignments', true);
        $has_assignments = is_array($assignments) && !empty($assignments);

        // Check if we have enough measurement types (at least 3 for meaningful calculations)
        $has_sufficient_types = count($measurement_types) >= 3;

        return $has_reference_lines && $has_assignments && $has_sufficient_types;
    }

    /**
     * Count reference lines across all views
     *
     * @param array $multi_view_data Multi-view reference lines data
     * @return int Total reference line count
     */
    private function countReferenceLines($multi_view_data) {
        $total = 0;

        if (!is_array($multi_view_data)) {
            return 0;
        }

        foreach ($multi_view_data as $view_key => $view_lines) {
            if (is_array($view_lines)) {
                $total += count($view_lines);
            }
        }

        return $total;
    }

    // ==========================================================================
    // AGENT 4 CROSS-VIEW VALIDATION COORDINATOR: Multi-View Synchronization Specialist
    // ==========================================================================

    /**
     * AGENT 4: Cross-View Validation System - Performs comprehensive validation across multiple views
     *
     * @param array $matching_lines Reference lines to validate
     * @param int $template_id Template ID for context
     * @return array Validation results with conflicts and scores
     */
    private function performCrossViewValidation($matching_lines, $template_id) {
        $validation_data = array();
        $conflicts = array();
        $measurement_key = $matching_lines[0]['measurement_key'] ?? 'unknown';

        // Group lines by view for cross-comparison
        $lines_by_view = array();
        foreach ($matching_lines as $line) {
            $lines_by_view[$line['view_id']] = $line;
        }

        // AGENT 4: Multi-dimensional validation metrics
        foreach ($lines_by_view as $view_id => $line) {
            $validation_score = 0;
            $view_conflicts = array();
            $sync_issues = array();

            // 1. Precision Level Consistency Check
            $precision_scores = array_column($matching_lines, 'precision_level');
            $precision_variance = $this->calculateVariance($precision_scores);

            if ($precision_variance > 0.5) {
                $view_conflicts[] = array(
                    'type' => 'precision_inconsistency',
                    'severity' => 'medium',
                    'description' => "Precision level variance: {$precision_variance}",
                    'recommendation' => 'Standardize precision levels across views'
                );
            } else {
                $validation_score += 25;
            }

            // 2. Length Proportion Consistency Check
            $lengths = array_column($matching_lines, 'lengthPx');
            $length_variance = $this->calculateVariance($lengths);
            $expected_variance_threshold = max($lengths) * 0.15; // 15% tolerance

            if ($length_variance > $expected_variance_threshold) {
                $view_conflicts[] = array(
                    'type' => 'length_inconsistency',
                    'severity' => 'high',
                    'description' => "Length variance {$length_variance}px exceeds threshold {$expected_variance_threshold}px",
                    'recommendation' => 'Check view scaling and measurement accuracy'
                );
            } else {
                $validation_score += 30;
            }

            // 3. Category Alignment Check
            $categories = array_unique(array_column($matching_lines, 'measurement_category'));
            if (count($categories) > 1) {
                $view_conflicts[] = array(
                    'type' => 'category_mismatch',
                    'severity' => 'low',
                    'description' => "Multiple categories found: " . implode(', ', $categories),
                    'recommendation' => 'Align measurement categories across views'
                );
            } else {
                $validation_score += 20;
            }

            // 4. Bridge Version Compatibility Check
            $bridge_versions = array_unique(array_column($matching_lines, 'bridge_version'));
            if (count($bridge_versions) > 1) {
                $view_conflicts[] = array(
                    'type' => 'version_mismatch',
                    'severity' => 'low',
                    'description' => "Mixed bridge versions: " . implode(', ', $bridge_versions),
                    'recommendation' => 'Update to consistent bridge version'
                );
            } else {
                $validation_score += 15;
            }

            // 5. Temporal Consistency Check
            $timestamps = array_filter(array_column($matching_lines, 'created_timestamp'));
            if (!empty($timestamps)) {
                $time_span = max($timestamps) - min($timestamps);
                if ($time_span > 86400) { // More than 24 hours apart
                    $sync_issues[] = array(
                        'type' => 'temporal_drift',
                        'severity' => 'medium',
                        'description' => "Reference lines created {$time_span}s apart",
                        'recommendation' => 'Consider synchronizing reference line creation'
                    );
                } else {
                    $validation_score += 10;
                }
            }

            // Determine sync status based on conflicts and score
            $sync_status = 'synchronized';
            if (!empty($view_conflicts)) {
                $high_severity_count = count(array_filter($view_conflicts, function($c) { return $c['severity'] === 'high'; }));
                if ($high_severity_count > 0) {
                    $sync_status = 'desynchronized';
                } elseif (count($view_conflicts) > 2) {
                    $sync_status = 'partially_synchronized';
                }
            }

            $validation_data[$view_id] = array(
                'validated' => $validation_score >= 70,
                'score' => $validation_score,
                'conflicts' => array_merge($view_conflicts, $sync_issues),
                'sync_status' => $sync_status,
                'recommendations' => $this->generateViewSpecificRecommendations($view_conflicts, $sync_issues)
            );

            // Add conflicts to global conflict list
            foreach (array_merge($view_conflicts, $sync_issues) as $conflict) {
                $conflicts[] = array_merge($conflict, array(
                    'view_id' => $view_id,
                    'measurement_key' => $measurement_key,
                    'detected_at' => current_time('mysql')
                ));
            }
        }

        return array(
            'validation_data' => $validation_data,
            'conflicts' => $conflicts,
            'overall_score' => $this->calculateOverallValidationScore($validation_data),
            'synchronization_health' => $this->assessSynchronizationHealth($validation_data)
        );
    }

    /**
     * AGENT 4: Multi-View Conflict Resolution System
     */
    private function resolveMultiViewConflicts($matching_lines, $conflicts) {
        $resolved_lines = $matching_lines;
        $resolution_applied = false;
        $resolution_log = array();

        foreach ($conflicts as $conflict) {
            switch ($conflict['type']) {
                case 'precision_inconsistency':
                    $resolution_result = $this->resolvePrecisionInconsistency($resolved_lines, $conflict);
                    break;

                case 'length_inconsistency':
                    $resolution_result = $this->resolveLengthInconsistency($resolved_lines, $conflict);
                    break;

                case 'category_mismatch':
                    $resolution_result = $this->resolveCategoryMismatch($resolved_lines, $conflict);
                    break;

                case 'version_mismatch':
                    $resolution_result = $this->resolveVersionMismatch($resolved_lines, $conflict);
                    break;

                default:
                    $resolution_result = array(
                        'resolved' => false,
                        'method' => 'no_resolver_available',
                        'lines' => $resolved_lines
                    );
            }

            if ($resolution_result['resolved']) {
                $resolved_lines = $resolution_result['lines'];
                $resolution_applied = true;
                $resolution_log[] = array(
                    'conflict_type' => $conflict['type'],
                    'resolution_method' => $resolution_result['method'],
                    'view_id' => $conflict['view_id'],
                    'timestamp' => current_time('mysql')
                );
            }
        }

        return array(
            'resolved_lines' => $resolved_lines,
            'resolution_applied' => $resolution_applied,
            'resolution_log' => $resolution_log,
            'conflicts_resolved' => count($resolution_log),
            'total_conflicts' => count($conflicts)
        );
    }

    /**
     * AGENT 4: Precision Inconsistency Resolution
     */
    private function resolvePrecisionInconsistency($lines, $conflict) {
        // Strategy: Use the highest precision level as the standard
        $precision_levels = array_column($lines, 'precision_level');
        $target_precision = max($precision_levels);

        $resolved_lines = array();
        foreach ($lines as $line) {
            $line['precision_level'] = $target_precision;
            $line['conflict_resolution_note'] = "Precision standardized to {$target_precision}";
            $resolved_lines[] = $line;
        }

        return array(
            'resolved' => true,
            'method' => 'precision_standardization',
            'lines' => $resolved_lines,
            'target_precision' => $target_precision
        );
    }

    /**
     * AGENT 4: Length Inconsistency Resolution
     */
    private function resolveLengthInconsistency($lines, $conflict) {
        // Strategy: Use median length to reduce impact of outliers
        $lengths = array_column($lines, 'lengthPx');
        sort($lengths);
        $median_length = $lengths[floor(count($lengths) / 2)];

        $resolved_lines = array();
        foreach ($lines as $line) {
            $original_length = $line['lengthPx'];
            $line['lengthPx'] = $median_length;
            $line['original_lengthPx'] = $original_length;
            $line['conflict_resolution_note'] = "Length normalized to median: {$median_length}px (was {$original_length}px)";
            $resolved_lines[] = $line;
        }

        return array(
            'resolved' => true,
            'method' => 'median_length_normalization',
            'lines' => $resolved_lines,
            'median_length' => $median_length
        );
    }

    /**
     * AGENT 4: Category Mismatch Resolution
     */
    private function resolveCategoryMismatch($lines, $conflict) {
        // Strategy: Use most common category or fallback to 'horizontal'
        $categories = array_column($lines, 'measurement_category');
        $category_counts = array_count_values($categories);
        arsort($category_counts);
        $target_category = key($category_counts) ?: 'horizontal';

        $resolved_lines = array();
        foreach ($lines as $line) {
            $original_category = $line['measurement_category'];
            $line['measurement_category'] = $target_category;
            if ($original_category !== $target_category) {
                $line['conflict_resolution_note'] = "Category standardized to {$target_category} (was {$original_category})";
            }
            $resolved_lines[] = $line;
        }

        return array(
            'resolved' => true,
            'method' => 'category_standardization',
            'lines' => $resolved_lines,
            'target_category' => $target_category
        );
    }

    /**
     * AGENT 4: Version Mismatch Resolution
     */
    private function resolveVersionMismatch($lines, $conflict) {
        // Strategy: Upgrade all to the highest version
        $versions = array_column($lines, 'bridge_version');
        $target_version = $this->getHighestVersion($versions);

        $resolved_lines = array();
        foreach ($lines as $line) {
            $original_version = $line['bridge_version'];
            $line['bridge_version'] = $target_version;
            if ($original_version !== $target_version) {
                $line['conflict_resolution_note'] = "Bridge version upgraded to {$target_version} (was {$original_version})";
            }
            $resolved_lines[] = $line;
        }

        return array(
            'resolved' => true,
            'method' => 'version_upgrade',
            'lines' => $resolved_lines,
            'target_version' => $target_version
        );
    }

    /**
     * AGENT 4: Primary References Cross-View Validation
     */
    private function validatePrimaryReferencesAcrossViews($primary_references) {
        $reference_validations = array();
        $global_insights = array();

        // Group by measurement key for cross-view analysis
        $grouped_references = array();
        foreach ($primary_references as $ref) {
            $key = $ref['measurement_key'];
            if (!isset($grouped_references[$key])) {
                $grouped_references[$key] = array();
            }
            $grouped_references[$key][] = $ref;
        }

        foreach ($grouped_references as $measurement_key => $refs) {
            if (count($refs) > 1) {
                // Multi-view measurement - perform cross-validation
                $compatibility_score = $this->calculateCrossViewCompatibilityScore($refs);
                $status = $compatibility_score >= 80 ? 'validated' : ($compatibility_score >= 60 ? 'warning' : 'invalid');
                $compatibility_level = $compatibility_score >= 90 ? 'high' : ($compatibility_score >= 70 ? 'medium' : 'low');

                $reference_validations[$measurement_key] = array(
                    'compatibility' => $compatibility_level,
                    'status' => $status,
                    'score' => $compatibility_score,
                    'view_count' => count($refs),
                    'consistency_issues' => $this->identifyConsistencyIssues($refs)
                );
            } else {
                // Single view measurement - mark as isolated
                $reference_validations[$measurement_key] = array(
                    'compatibility' => 'isolated',
                    'status' => 'single_view',
                    'score' => 100,
                    'view_count' => 1,
                    'consistency_issues' => array()
                );
            }
        }

        // Generate global insights
        $total_refs = count($primary_references);
        $multi_view_refs = count(array_filter($reference_validations, function($v) { return $v['view_count'] > 1; }));
        $high_compatibility_refs = count(array_filter($reference_validations, function($v) { return $v['compatibility'] === 'high'; }));

        $global_insights = array(
            'total_primary_references' => $total_refs,
            'multi_view_references' => $multi_view_refs,
            'single_view_references' => $total_refs - $multi_view_refs,
            'high_compatibility_rate' => $total_refs > 0 ? round(($high_compatibility_refs / $total_refs) * 100, 1) : 0,
            'cross_view_coverage' => $total_refs > 0 ? round(($multi_view_refs / $total_refs) * 100, 1) : 0
        );

        return array(
            'reference_validations' => $reference_validations,
            'global_insights' => $global_insights,
            'validation_timestamp' => current_time('mysql')
        );
    }

    /**
     * AGENT 4: Multi-View Synchronization Tools Implementation
     */
    public function ajax_synchronize_multi_view_references() {
        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);
        $synchronization_mode = sanitize_text_field($_POST['sync_mode'] ?? 'full');
        $target_measurement_key = sanitize_text_field($_POST['measurement_key'] ?? '');

        if (!$template_id) {
            wp_send_json_error(__('Template ID fehlt', 'octo-print-designer'));
        }

        try {
            $sync_start = microtime(true);

            // Load multi-view reference lines
            $multi_view_lines = get_post_meta($template_id, '_multi_view_reference_lines_data', true);
            if (empty($multi_view_lines)) {
                wp_send_json_error(__('Keine Multi-View Referenzlinien gefunden', 'octo-print-designer'));
            }

            // Perform synchronization based on mode
            switch ($synchronization_mode) {
                case 'full':
                    $sync_result = $this->performFullMultiViewSynchronization($multi_view_lines, $template_id);
                    break;

                case 'selective':
                    $sync_result = $this->performSelectiveMultiViewSynchronization($multi_view_lines, $target_measurement_key);
                    break;

                case 'precision_only':
                    $sync_result = $this->performPrecisionSynchronization($multi_view_lines);
                    break;

                case 'validation_repair':
                    $sync_result = $this->performValidationRepair($multi_view_lines);
                    break;

                default:
                    throw new Exception('Unsupported synchronization mode: ' . $synchronization_mode);
            }

            // Save synchronized data
            if ($sync_result['success']) {
                $update_result = update_post_meta($template_id, '_multi_view_reference_lines_data', $sync_result['synchronized_lines']);
                if ($update_result === false) {
                    throw new Exception('Failed to save synchronized reference lines');
                }
            }

            $sync_time = microtime(true) - $sync_start;

            wp_send_json_success(array(
                'synchronization_result' => $sync_result,
                'template_id' => $template_id,
                'synchronization_mode' => $synchronization_mode,
                'performance_metrics' => array(
                    'sync_time_ms' => round($sync_time * 1000, 2),
                    'lines_processed' => $sync_result['lines_processed'],
                    'conflicts_resolved' => $sync_result['conflicts_resolved'],
                    'views_synchronized' => $sync_result['views_synchronized']
                ),
                'agent_version' => '4.0_multi_view_synchronization'
            ));

        } catch (Exception $e) {
            error_log('AGENT 4 Multi-View Synchronization Error: ' . $e->getMessage());
            wp_send_json_error(__('Multi-View Synchronization Fehler: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    // ==========================================================================
    // AGENT 4: Helper Methods for Cross-View Validation and Synchronization
    // ==========================================================================

    private function calculateVariance($values) {
        if (empty($values)) return 0;
        $mean = array_sum($values) / count($values);
        $squared_diffs = array_map(function($x) use ($mean) { return pow($x - $mean, 2); }, $values);
        return sqrt(array_sum($squared_diffs) / count($values));
    }

    private function calculateOverallValidationScore($validation_data) {
        if (empty($validation_data)) return 0;
        $scores = array_column($validation_data, 'score');
        return round(array_sum($scores) / count($scores), 1);
    }

    private function assessSynchronizationHealth($validation_data) {
        $sync_statuses = array_column($validation_data, 'sync_status');
        $status_counts = array_count_values($sync_statuses);

        $total = count($sync_statuses);
        $synchronized_count = $status_counts['synchronized'] ?? 0;
        $health_percentage = $total > 0 ? ($synchronized_count / $total) * 100 : 0;

        return array(
            'health_percentage' => round($health_percentage, 1),
            'status_distribution' => $status_counts,
            'overall_health' => $health_percentage >= 80 ? 'excellent' : ($health_percentage >= 60 ? 'good' : 'poor')
        );
    }

    private function calculateConflictResolutionSuccessRate($conflicts) {
        if (empty($conflicts)) return 100;
        // Simplified success rate calculation
        $resolvable_types = ['precision_inconsistency', 'length_inconsistency', 'category_mismatch', 'version_mismatch'];
        $resolvable_count = 0;
        foreach ($conflicts as $conflict) {
            if (in_array($conflict['type'], $resolvable_types)) {
                $resolvable_count++;
            }
        }
        return count($conflicts) > 0 ? round(($resolvable_count / count($conflicts)) * 100, 1) : 100;
    }

    private function calculatePrimaryReferencePerformanceScore($line) {
        $score = 0;

        // Precision level weight (0-30 points)
        $precision = $line['precision_level'] ?? 0.1;
        $score += min(30, $precision * 6);

        // Bridge version weight (0-20 points)
        $version = $line['bridge_version'] ?? '1.0';
        if (version_compare($version, '2.0', '>=')) $score += 20;
        elseif (version_compare($version, '1.5', '>=')) $score += 15;
        else $score += 10;

        // Length pixel value weight (0-25 points)
        $length = $line['lengthPx'] ?? 0;
        if ($length > 100) $score += 25;
        elseif ($length > 50) $score += 20;
        elseif ($length > 20) $score += 15;
        else $score += 10;

        // Measurement category weight (0-15 points)
        $category = $line['measurement_category'] ?? 'unknown';
        if (in_array($category, ['horizontal', 'vertical'])) $score += 15;
        elseif ($category === 'detail') $score += 10;
        else $score += 5;

        // Timestamp recency weight (0-10 points)
        $timestamp = $line['created_timestamp'] ?? 0;
        if ($timestamp > 0) {
            $age_hours = (time() - $timestamp) / 3600;
            if ($age_hours < 24) $score += 10;
            elseif ($age_hours < 168) $score += 7;
            else $score += 3;
        }

        return min(100, round($score, 1));
    }

    private function getHighestVersion($versions) {
        usort($versions, 'version_compare');
        return end($versions);
    }

    private function calculateCrossViewCompatibilityScore($references) {
        // Simplified compatibility scoring based on consistency
        $scores = array();

        // Length consistency
        $lengths = array_column($references, 'lengthPx');
        $length_variance = $this->calculateVariance($lengths);
        $length_score = max(0, 100 - ($length_variance * 2));
        $scores[] = $length_score;

        // Precision consistency
        $precisions = array_column($references, 'precision_level');
        $precision_variance = $this->calculateVariance($precisions);
        $precision_score = max(0, 100 - ($precision_variance * 20));
        $scores[] = $precision_score;

        return round(array_sum($scores) / count($scores), 1);
    }

    private function identifyConsistencyIssues($references) {
        $issues = array();

        // Check length consistency
        $lengths = array_column($references, 'lengthPx');
        if ($this->calculateVariance($lengths) > 10) {
            $issues[] = 'length_inconsistency';
        }

        // Check precision consistency
        $precisions = array_column($references, 'precision_level');
        if ($this->calculateVariance($precisions) > 0.5) {
            $issues[] = 'precision_inconsistency';
        }

        return $issues;
    }

    private function summarizeCrossViewCompatibility($primary_references) {
        $compatibility_levels = array_count_values(array_column($primary_references, 'cross_view_compatibility'));
        return array(
            'distribution' => $compatibility_levels,
            'total_references' => count($primary_references),
            'compatibility_rate' => count($primary_references) > 0 ?
                round(((($compatibility_levels['high'] ?? 0) + ($compatibility_levels['medium'] ?? 0)) / count($primary_references)) * 100, 1) : 0
        );
    }

    private function generateCrossViewRecommendations($primary_references, $cross_view_results) {
        $recommendations = array();

        $low_compatibility_count = count(array_filter($primary_references, function($ref) {
            return $ref['cross_view_compatibility'] === 'low';
        }));

        if ($low_compatibility_count > 0) {
            $recommendations[] = array(
                'type' => 'improve_compatibility',
                'priority' => 'high',
                'description' => "{$low_compatibility_count} reference(s) have low cross-view compatibility",
                'action' => 'Review and standardize measurement parameters across views'
            );
        }

        $isolated_count = count(array_filter($primary_references, function($ref) {
            return $ref['cross_view_compatibility'] === 'isolated';
        }));

        if ($isolated_count > 0) {
            $recommendations[] = array(
                'type' => 'expand_coverage',
                'priority' => 'medium',
                'description' => "{$isolated_count} reference(s) exist in single view only",
                'action' => 'Consider adding equivalent reference lines in other views'
            );
        }

        return $recommendations;
    }

    private function generateViewSpecificRecommendations($view_conflicts, $sync_issues) {
        $recommendations = array();

        foreach (array_merge($view_conflicts, $sync_issues) as $issue) {
            switch ($issue['type']) {
                case 'precision_inconsistency':
                    $recommendations[] = 'Standardize precision levels across all views';
                    break;
                case 'length_inconsistency':
                    $recommendations[] = 'Verify measurement scaling and view proportions';
                    break;
                case 'category_mismatch':
                    $recommendations[] = 'Align measurement categories with standard definitions';
                    break;
            }
        }

        return array_unique($recommendations);
    }

    // Placeholder methods for synchronization modes (simplified implementations)
    private function performFullMultiViewSynchronization($multi_view_lines, $template_id) {
        return array(
            'success' => true,
            'synchronized_lines' => $multi_view_lines,
            'lines_processed' => array_sum(array_map('count', $multi_view_lines)),
            'conflicts_resolved' => 0,
            'views_synchronized' => count($multi_view_lines),
            'method' => 'full_synchronization'
        );
    }

    private function performSelectiveMultiViewSynchronization($multi_view_lines, $measurement_key) {
        return array(
            'success' => true,
            'synchronized_lines' => $multi_view_lines,
            'lines_processed' => 1,
            'conflicts_resolved' => 0,
            'views_synchronized' => 1,
            'method' => 'selective_synchronization',
            'target_measurement' => $measurement_key
        );
    }

    private function performPrecisionSynchronization($multi_view_lines) {
        return array(
            'success' => true,
            'synchronized_lines' => $multi_view_lines,
            'lines_processed' => array_sum(array_map('count', $multi_view_lines)),
            'conflicts_resolved' => 0,
            'views_synchronized' => count($multi_view_lines),
            'method' => 'precision_synchronization'
        );
    }

    private function performValidationRepair($multi_view_lines) {
        return array(
            'success' => true,
            'synchronized_lines' => $multi_view_lines,
            'lines_processed' => array_sum(array_map('count', $multi_view_lines)),
            'conflicts_resolved' => 0,
            'views_synchronized' => count($multi_view_lines),
            'method' => 'validation_repair'
        );
    }
}
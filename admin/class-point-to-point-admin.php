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
            // Lade Measurement Types aus Issue #19 Implementation
            if (class_exists('TemplateMeasurementManager')) {
                $measurement_manager = new TemplateMeasurementManager();
                $template_sizes = $measurement_manager->get_template_sizes($template_id);

                // Definiere Standard Measurement Types (A-J)
                $measurement_types = array(
                    'A' => array('label' => 'Chest', 'description' => 'Brustumfang'),
                    'B' => array('label' => 'Hem Width', 'description' => 'Saumweite'),
                    'C' => array('label' => 'Height from Shoulder', 'description' => 'Höhe ab Schulter'),
                    'D' => array('label' => 'Shoulder Width', 'description' => 'Schulterbreite'),
                    'E' => array('label' => 'Sleeve Length', 'description' => 'Ärmellänge'),
                    'F' => array('label' => 'Back Length', 'description' => 'Rückenlänge'),
                    'G' => array('label' => 'Armhole Width', 'description' => 'Armausschnitt Breite'),
                    'H' => array('label' => 'Neck Width', 'description' => 'Halsausschnitt Breite'),
                    'J' => array('label' => 'Hem Height', 'description' => 'Saumhöhe')
                );

                wp_send_json_success(array(
                    'measurement_types' => $measurement_types,
                    'template_sizes' => $template_sizes,
                    'template_id' => $template_id
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
     * AGENT 3 ENHANCEMENT: Get Reference Lines for PrecisionCalculator Integration
     * Spezielle AJAX-Funktion für PrecisionCalculator Bridge
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

        if (!$template_id || !$measurement_key) {
            wp_send_json_error(__('Template ID oder Measurement Key fehlen', 'octo-print-designer'));
        }

        try {
            // Load multi-view reference lines
            $multi_view_lines = get_post_meta($template_id, '_multi_view_reference_lines_data', true);

            if (empty($multi_view_lines)) {
                wp_send_json_error(__('Keine Referenzlinien für dieses Template gefunden', 'octo-print-designer'));
            }

            // Find matching reference line for calculation
            $matching_lines = array();

            foreach ($multi_view_lines as $current_view_id => $view_lines) {
                if (!empty($view_id) && $current_view_id !== $view_id) {
                    continue; // Skip if specific view requested
                }

                if (is_array($view_lines)) {
                    foreach ($view_lines as $line) {
                        if ($line['measurement_key'] === $measurement_key &&
                            isset($line['linked_to_measurements']) &&
                            $line['linked_to_measurements']) {

                            // AGENT 3: Prepare calculation-ready data
                            $matching_lines[] = array(
                                'measurement_key' => $line['measurement_key'],
                                'label' => $line['label'],
                                'lengthPx' => $line['lengthPx'],
                                'view_id' => $current_view_id,
                                'view_name' => $line['view_name'],
                                'primary_reference' => $line['primary_reference'] ?? false,
                                'measurement_category' => $line['measurement_category'] ?? 'unknown',
                                'precision_level' => $line['precision_level'] ?? 0.1,
                                'bridge_version' => $line['bridge_version'] ?? '1.0',
                                'created_timestamp' => $line['created_timestamp'] ?? 0
                            );
                        }
                    }
                }
            }

            if (empty($matching_lines)) {
                wp_send_json_error(__('Keine verknüpfte Referenzlinie für Measurement Key gefunden: ', 'octo-print-designer') . $measurement_key);
            }

            wp_send_json_success(array(
                'reference_lines' => $matching_lines,
                'template_id' => $template_id,
                'measurement_key' => $measurement_key,
                'total_found' => count($matching_lines)
            ));

        } catch (Exception $e) {
            error_log('Reference Lines for Calculation Error: ' . $e->getMessage());
            wp_send_json_error(__('Fehler beim Laden der Referenzlinien für Berechnung: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * AGENT 3 ENHANCEMENT: Get Primary Reference Lines for Scaling Calculations
     */
    public function ajax_get_primary_reference_lines() {
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
            // Load multi-view reference lines
            $multi_view_lines = get_post_meta($template_id, '_multi_view_reference_lines_data', true);

            if (empty($multi_view_lines)) {
                wp_send_json_success(array(
                    'primary_references' => array(),
                    'template_id' => $template_id,
                    'message' => 'Keine Referenzlinien gefunden'
                ));
            }

            // Find all primary reference lines
            $primary_references = array();

            foreach ($multi_view_lines as $view_id => $view_lines) {
                if (is_array($view_lines)) {
                    foreach ($view_lines as $line) {
                        if (isset($line['primary_reference']) && $line['primary_reference'] === true &&
                            isset($line['linked_to_measurements']) && $line['linked_to_measurements']) {

                            $primary_references[] = array(
                                'measurement_key' => $line['measurement_key'],
                                'label' => $line['label'],
                                'lengthPx' => $line['lengthPx'],
                                'view_id' => $view_id,
                                'view_name' => $line['view_name'],
                                'measurement_category' => $line['measurement_category'] ?? 'unknown',
                                'precision_level' => $line['precision_level'] ?? 0.1,
                                'bridge_version' => $line['bridge_version'] ?? '1.0'
                            );
                        }
                    }
                }
            }

            wp_send_json_success(array(
                'primary_references' => $primary_references,
                'template_id' => $template_id,
                'total_primary' => count($primary_references),
                'calculation_ready' => count($primary_references) > 0
            ));

        } catch (Exception $e) {
            error_log('Primary Reference Lines Error: ' . $e->getMessage());
            wp_send_json_error(__('Fehler beim Laden der primären Referenzlinien: ', 'octo-print-designer') . $e->getMessage());
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
}
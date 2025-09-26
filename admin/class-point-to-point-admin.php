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

        // Legacy Template Image AJAX Handler für Single View Fallback
        add_action('wp_ajax_get_template_image', array($this, 'ajax_get_template_image'));

        // Issue #22 Enhancement: Real-time measurement validation endpoints
        add_action('wp_ajax_validate_measurement_realtime', array($this, 'ajax_validate_measurement_realtime'));
        add_action('wp_ajax_get_expected_measurement_value', array($this, 'ajax_get_expected_measurement_value'));
        add_action('wp_ajax_save_measurement_assignment', array($this, 'ajax_save_measurement_assignment'));

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

        // Enhanced Measurement Interface - Issue #22
        wp_enqueue_script(
            $this->plugin_name . '-enhanced-measurement-interface',
            plugin_dir_url(__FILE__) . 'js/enhanced-measurement-interface.js',
            array('jquery', $this->plugin_name . '-multi-view-point-to-point'),
            $this->version,
            true
        );

        // Enhanced Canvas Renderer - Issue #22 Visual Feedback
        wp_enqueue_script(
            $this->plugin_name . '-enhanced-canvas-renderer',
            plugin_dir_url(__FILE__) . 'js/enhanced-canvas-renderer.js',
            array('jquery', $this->plugin_name . '-enhanced-measurement-interface'),
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
     * AJAX Handler: Real-time measurement validation
     * Issue #22 Enhancement: Validates measurement as user creates reference lines
     */
    public function ajax_validate_measurement_realtime() {
        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);
        $measurement_key = sanitize_text_field($_POST['measurement_key']);
        $pixel_length = floatval($_POST['pixel_length']);
        $view_id = sanitize_text_field($_POST['view_id'] ?? '');

        if (!$template_id || !$measurement_key) {
            wp_send_json_error(__('Template ID oder Measurement Key fehlt', 'octo-print-designer'));
        }

        try {
            // Get template physical dimensions for pixel-to-cm conversion
            $template_width_cm = floatval(get_post_meta($template_id, '_template_physical_width_cm', true)) ?: 60.0;
            $template_height_cm = floatval(get_post_meta($template_id, '_template_physical_height_cm', true)) ?: 80.0;

            // Calculate approximate scale (assuming 600px canvas width)
            $pixel_to_cm_scale = $template_width_cm / 600;
            $measured_cm = $pixel_length * $pixel_to_cm_scale;

            // Get expected measurement values from database (Issue #19 integration)
            $expected_values = $this->get_expected_measurement_values($template_id, $measurement_key);

            // Calculate validation scores
            $validation_result = $this->calculate_measurement_validation($measured_cm, $expected_values, $measurement_key);

            wp_send_json_success(array(
                'validation' => $validation_result,
                'measured_cm' => round($measured_cm, 1),
                'pixel_length' => $pixel_length,
                'scale_factor' => $pixel_to_cm_scale,
                'expected_values' => $expected_values,
                'measurement_key' => $measurement_key,
                'view_id' => $view_id
            ));

        } catch (Exception $e) {
            error_log('Real-time Validation Error: ' . $e->getMessage());
            wp_send_json_error(__('Validierungsfehler: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * AJAX Handler: Get expected measurement value for a specific measurement type
     * Issue #22 Enhancement: Provides expected values for UI feedback
     */
    public function ajax_get_expected_measurement_value() {
        // Security Check
        if (!wp_verify_nonce($_POST['nonce'], 'point_to_point_nonce')) {
            wp_die(__('Sicherheitsprüfung fehlgeschlagen', 'octo-print-designer'));
        }

        if (!current_user_can('edit_posts')) {
            wp_die(__('Keine Berechtigung', 'octo-print-designer'));
        }

        $template_id = absint($_POST['template_id']);
        $measurement_key = sanitize_text_field($_POST['measurement_key']);
        $size_key = sanitize_text_field($_POST['size_key'] ?? 'M');

        if (!$template_id || !$measurement_key) {
            wp_send_json_error(__('Template ID oder Measurement Key fehlt', 'octo-print-designer'));
        }

        try {
            // Get expected values using TemplateMeasurementManager (Issue #19)
            if (class_exists('TemplateMeasurementManager')) {
                $measurement_manager = new TemplateMeasurementManager();
                $specific_value = $measurement_manager->get_specific_measurement($template_id, $size_key, $measurement_key);

                if ($specific_value !== null) {
                    wp_send_json_success(array(
                        'expected_value' => $specific_value,
                        'measurement_key' => $measurement_key,
                        'size_key' => $size_key,
                        'template_id' => $template_id,
                        'label' => $this->get_measurement_label($measurement_key)
                    ));
                }
            }

            // Fallback to default expected values if no database data
            $default_values = $this->get_default_measurement_values();
            $expected_value = $default_values[$measurement_key] ?? 50.0;

            wp_send_json_success(array(
                'expected_value' => $expected_value,
                'measurement_key' => $measurement_key,
                'size_key' => $size_key,
                'template_id' => $template_id,
                'label' => $this->get_measurement_label($measurement_key),
                'fallback' => true
            ));

        } catch (Exception $e) {
            error_log('Expected Value Load Error: ' . $e->getMessage());
            wp_send_json_error(__('Fehler beim Laden der erwarteten Werte: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * AJAX Handler: Save measurement assignment with reference line
     * Issue #22 Enhancement: Automatic assignment workflow
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
        $reference_line_data = sanitize_textarea_field($_POST['reference_line_data']);

        if (!$template_id || !$measurement_key || !$reference_line_data) {
            wp_send_json_error(__('Erforderliche Daten fehlen', 'octo-print-designer'));
        }

        try {
            // Decode reference line data
            $line_data = json_decode(stripslashes($reference_line_data), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('JSON Dekodierung fehlgeschlagen: ' . json_last_error_msg());
            }

            // Enhanced data structure with automatic assignment
            $enhanced_line_data = array_merge($line_data, array(
                'measurement_key' => $measurement_key,
                'label' => $this->get_measurement_label($measurement_key),
                'auto_assigned' => true,
                'assigned_at' => current_time('mysql'),
                'precision_level' => 0.1, // ±0.1cm as per requirements
                'bridge_version' => '2.0' // Issue #22 version
            ));

            // Save to multi-view reference lines
            $current_lines = get_post_meta($template_id, '_multi_view_reference_lines_data', true) ?: array();

            $view_id = $enhanced_line_data['view_id'] ?? 'default';
            if (!isset($current_lines[$view_id])) {
                $current_lines[$view_id] = array();
            }

            // Add or update the measurement line
            $current_lines[$view_id][] = $enhanced_line_data;

            // Save updated data
            $result = update_post_meta($template_id, '_multi_view_reference_lines_data', $current_lines);

            if ($result === false) {
                throw new Exception('Fehler beim Speichern der Measurement Assignment');
            }

            // Log for debugging
            error_log('Measurement Assignment saved: Template ' . $template_id . ', Measurement ' . $measurement_key);

            wp_send_json_success(array(
                'message' => sprintf(
                    __('Measurement %s erfolgreich zugewiesen', 'octo-print-designer'),
                    $measurement_key
                ),
                'measurement_key' => $measurement_key,
                'template_id' => $template_id,
                'reference_line_data' => $enhanced_line_data,
                'total_lines' => count($current_lines[$view_id])
            ));

        } catch (Exception $e) {
            error_log('Measurement Assignment Error: ' . $e->getMessage());
            wp_send_json_error(__('Fehler beim Speichern der Zuweisung: ', 'octo-print-designer') . $e->getMessage());
        }
    }

    /**
     * Helper: Get expected measurement values from database or defaults
     */
    private function get_expected_measurement_values($template_id, $measurement_key) {
        if (class_exists('TemplateMeasurementManager')) {
            $measurement_manager = new TemplateMeasurementManager();
            $measurements = $measurement_manager->get_measurements($template_id);

            // Get average value across all sizes for this measurement
            $values = array();
            foreach ($measurements as $size_data) {
                if (isset($size_data[$measurement_key])) {
                    $values[] = $size_data[$measurement_key]['value_cm'];
                }
            }

            if (!empty($values)) {
                return array(
                    'average' => array_sum($values) / count($values),
                    'min' => min($values),
                    'max' => max($values),
                    'count' => count($values)
                );
            }
        }

        // Fallback to defaults
        $defaults = $this->get_default_measurement_values();
        $default_value = $defaults[$measurement_key] ?? 50.0;

        return array(
            'average' => $default_value,
            'min' => $default_value * 0.8,
            'max' => $default_value * 1.2,
            'count' => 1,
            'fallback' => true
        );
    }

    /**
     * Helper: Calculate measurement validation scores
     */
    private function calculate_measurement_validation($measured_cm, $expected_values, $measurement_key) {
        $expected_avg = $expected_values['average'];
        $deviation = abs($measured_cm - $expected_avg);
        $deviation_percentage = ($deviation / $expected_avg) * 100;

        // Determine validation status
        if ($deviation_percentage <= 5) {
            $status = 'excellent';
            $accuracy = 95 + (5 - $deviation_percentage);
        } elseif ($deviation_percentage <= 15) {
            $status = 'good';
            $accuracy = 85 + (15 - $deviation_percentage) * 0.67;
        } elseif ($deviation_percentage <= 25) {
            $status = 'acceptable';
            $accuracy = 75 + (25 - $deviation_percentage) * 0.4;
        } else {
            $status = 'needs_attention';
            $accuracy = max(50, 75 - ($deviation_percentage - 25) * 0.5);
        }

        return array(
            'status' => $status,
            'accuracy' => round($accuracy, 1),
            'deviation_cm' => round($deviation, 2),
            'deviation_percentage' => round($deviation_percentage, 1),
            'within_tolerance' => $deviation <= 0.1, // ±0.1cm requirement
            'recommendation' => $this->generate_measurement_recommendation($status, $deviation_percentage)
        );
    }

    /**
     * Helper: Generate measurement recommendations
     */
    private function generate_measurement_recommendation($status, $deviation_percentage) {
        switch ($status) {
            case 'excellent':
                return __('Excellent measurement accuracy!', 'octo-print-designer');
            case 'good':
                return __('Good measurement, within acceptable range.', 'octo-print-designer');
            case 'acceptable':
                return __('Measurement acceptable but could be more precise.', 'octo-print-designer');
            default:
                return sprintf(
                    __('Measurement deviates by %.1f%%. Consider adjusting points.', 'octo-print-designer'),
                    $deviation_percentage
                );
        }
    }

    /**
     * Helper: Get measurement labels
     */
    private function get_measurement_label($measurement_key) {
        $labels = array(
            'A' => __('Chest Width', 'octo-print-designer'),
            'B' => __('Hem Width', 'octo-print-designer'),
            'C' => __('Height from Shoulder', 'octo-print-designer'),
            'D' => __('Sleeve Length', 'octo-print-designer'),
            'E' => __('Sleeve Opening', 'octo-print-designer'),
            'F' => __('Shoulder to Shoulder', 'octo-print-designer'),
            'G' => __('Neck Opening', 'octo-print-designer'),
            'H' => __('Biceps', 'octo-print-designer'),
            'J' => __('Rib Height', 'octo-print-designer')
        );

        return $labels[$measurement_key] ?? $measurement_key;
    }

    /**
     * Helper: Get default measurement values
     */
    private function get_default_measurement_values() {
        return array(
            'A' => 60.0, // Chest
            'B' => 56.0, // Hem Width
            'C' => 68.0, // Height from Shoulder
            'D' => 26.5, // Sleeve Length
            'E' => 19.0, // Sleeve Opening
            'F' => 54.5, // Shoulder to Shoulder
            'G' => 20.0, // Neck Opening
            'H' => 24.5, // Biceps
            'J' => 2.0   // Rib Height
        );
    }
}
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

        // Point-to-Point JavaScript
        wp_enqueue_script(
            $this->plugin_name . '-point-to-point',
            plugin_dir_url(__FILE__) . 'js/point-to-point-selector.js',
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
            $this->plugin_name . '-point-to-point',
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

        // Erweitere hier um deine Template Post Types
        $template_post_types = array('product', 'template', 'octo_template');

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
        $post_types = array('product', 'template', 'octo_template');

        foreach ($post_types as $post_type) {
            add_meta_box(
                'template-reference-lines',
                __('Template Referenzlinien Editor', 'octo-print-designer'),
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
            echo '<p><strong>' . __('Hinweis:', 'octo-print-designer') . '</strong> ' .
                 __('Kein Template-Bild gefunden. Bitte lade ein Template-Bild hoch oder setze das print_template_image Meta-Feld.', 'octo-print-designer') . '</p>';
            return;
        }

        // Hidden Fields für JavaScript
        echo '<input type="hidden" id="template-id-input" value="' . esc_attr($post->ID) . '">';
        echo '<input type="hidden" id="template-image-url" value="' . esc_url($template_image_url) . '">';

        // Container für Point-to-Point Interface
        echo '<div id="point-to-point-container"></div>';

        // Canvas für Template Image
        echo '<div class="template-canvas-container">';
        echo '<canvas id="template-canvas" style="border: 2px solid #ddd; max-width: 100%; height: auto;"></canvas>';
        echo '</div>';

        // Aktuelle Referenzlinien anzeigen (für Debugging)
        $current_lines = get_post_meta($post->ID, '_reference_lines_data', true);
        if (!empty($current_lines)) {
            echo '<details style="margin-top: 15px;">';
            echo '<summary>' . __('Aktuelle Referenzlinien (JSON)', 'octo-print-designer') . '</summary>';
            echo '<pre style="background: #f9f9f9; padding: 10px; overflow-x: auto;">' .
                 esc_html(json_encode($current_lines, JSON_PRETTY_PRINT)) . '</pre>';
            echo '</details>';
        }
    }

    /**
     * Versucht Template Image URL aus verschiedenen Quellen zu laden
     */
    private function get_template_image_url($post_id) {
        // 1. Versuche print_template_image Meta Field
        $image_url = get_post_meta($post_id, 'print_template_image', true);
        if (!empty($image_url)) {
            return $image_url;
        }

        // 2. Versuche Featured Image
        if (has_post_thumbnail($post_id)) {
            return get_the_post_thumbnail_url($post_id, 'full');
        }

        // 3. Versuche WooCommerce Product Gallery
        if (function_exists('wc_get_product')) {
            $product = wc_get_product($post_id);
            if ($product) {
                $gallery_ids = $product->get_gallery_image_ids();
                if (!empty($gallery_ids)) {
                    return wp_get_attachment_image_url($gallery_ids[0], 'full');
                }
            }
        }

        // 4. Versuche andere bekannte Meta Fields
        $meta_fields = array(
            '_template_image',
            'template_image_url',
            '_product_image_gallery'
        );

        foreach ($meta_fields as $field) {
            $value = get_post_meta($post_id, $field, true);
            if (!empty($value)) {
                // Wenn es eine Attachment ID ist
                if (is_numeric($value)) {
                    $url = wp_get_attachment_image_url($value, 'full');
                    if ($url) return $url;
                }
                // Wenn es bereits eine URL ist
                if (filter_var($value, FILTER_VALIDATE_URL)) {
                    return $value;
                }
            }
        }

        return false;
    }
}
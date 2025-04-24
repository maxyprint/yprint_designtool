<?php
/**
 * AJAX-Handler für Transform-Funktionen
 * 
 * Verarbeitet AJAX-Anfragen für die Transformation von Elementen im Design-Tool
 */

// Sicherheitscheck: Direkten Zugriff auf diese Datei verhindern
if (!defined('ABSPATH')) {
    exit;
}

class YPrint_TransformAjax {
    /**
     * Konstruktor
     */
    public function __construct() {
        // AJAX-Aktionen registrieren
        add_action('wp_ajax_yprint_transform_move', array($this, 'ajax_move'));
        add_action('wp_ajax_nopriv_yprint_transform_move', array($this, 'ajax_move'));
        
        add_action('wp_ajax_yprint_transform_scale', array($this, 'ajax_scale'));
        add_action('wp_ajax_nopriv_yprint_transform_scale', array($this, 'ajax_scale'));
        
        add_action('wp_ajax_yprint_transform_rotate', array($this, 'ajax_rotate'));
        add_action('wp_ajax_nopriv_yprint_transform_rotate', array($this, 'ajax_rotate'));
        
        add_action('wp_ajax_yprint_transform_flip', array($this, 'ajax_flip'));
        add_action('wp_ajax_nopriv_yprint_transform_flip', array($this, 'ajax_flip'));
        
        add_action('wp_ajax_yprint_transform_change_layer', array($this, 'ajax_change_layer'));
        add_action('wp_ajax_nopriv_yprint_transform_change_layer', array($this, 'ajax_change_layer'));
        
        add_action('wp_ajax_yprint_transform_group', array($this, 'ajax_group'));
        add_action('wp_ajax_nopriv_yprint_transform_group', array($this, 'ajax_group'));
        
        add_action('wp_ajax_yprint_transform_ungroup', array($this, 'ajax_ungroup'));
        add_action('wp_ajax_nopriv_yprint_transform_ungroup', array($this, 'ajax_ungroup'));
        
        add_action('wp_ajax_yprint_transform_align', array($this, 'ajax_align'));
        add_action('wp_ajax_nopriv_yprint_transform_align', array($this, 'ajax_align'));
        
        add_action('wp_ajax_yprint_transform_distribute', array($this, 'ajax_distribute'));
        add_action('wp_ajax_nopriv_yprint_transform_distribute', array($this, 'ajax_distribute'));
        
        add_action('wp_ajax_yprint_transform_duplicate', array($this, 'ajax_duplicate'));
        add_action('wp_ajax_nopriv_yprint_transform_duplicate', array($this, 'ajax_duplicate'));
        
        add_action('wp_ajax_yprint_transform_delete', array($this, 'ajax_delete'));
        add_action('wp_ajax_nopriv_yprint_transform_delete', array($this, 'ajax_delete'));
        
        add_action('wp_ajax_yprint_transform_lock', array($this, 'ajax_lock'));
        add_action('wp_ajax_nopriv_yprint_transform_lock', array($this, 'ajax_lock'));
        
        add_action('wp_ajax_yprint_transform_unlock', array($this, 'ajax_unlock'));
        add_action('wp_ajax_nopriv_yprint_transform_unlock', array($this, 'ajax_unlock'));
    }
    
    /**
     * AJAX-Handler für das Verschieben eines Elements
     */
    public function ajax_move() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Parameter überprüfen
        if (empty($_POST['element']) || !isset($_POST['x']) || !isset($_POST['y'])) {
            wp_send_json_error(__('Fehlende Parameter.', 'yprint-designtool'));
            return;
        }
        
        $element = json_decode(wp_unslash($_POST['element']), true);
        $x = floatval($_POST['x']);
        $y = floatval($_POST['y']);
        
        if (empty($element) || !isset($element['id'])) {
            wp_send_json_error(__('Ungültiges Element.', 'yprint-designtool'));
            return;
        }
        
        // Transform-Klasse abrufen
        $transform = YPrint_Transform::get_instance();
        
        // Element verschieben
        $updated_element = $transform->move($element, $x, $y);
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'element' => $updated_element,
            'message' => __('Element erfolgreich verschoben.', 'yprint-designtool')
        ));
    }
    
    /**
     * AJAX-Handler für das Skalieren eines Elements
     */
    public function ajax_scale() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Parameter überprüfen
        if (empty($_POST['element']) || !isset($_POST['width']) || !isset($_POST['height'])) {
            wp_send_json_error(__('Fehlende Parameter.', 'yprint-designtool'));
            return;
        }
        
        $element = json_decode(wp_unslash($_POST['element']), true);
        $width = floatval($_POST['width']);
        $height = floatval($_POST['height']);
        $maintain_aspect_ratio = isset($_POST['maintain_aspect_ratio']) ? (bool) $_POST['maintain_aspect_ratio'] : false;
        
        if (empty($element) || !isset($element['id'])) {
            wp_send_json_error(__('Ungültiges Element.', 'yprint-designtool'));
            return;
        }
        
        // Transform-Klasse abrufen
        $transform = YPrint_Transform::get_instance();
        
        // Element skalieren
        $updated_element = $transform->scale($element, $width, $height, $maintain_aspect_ratio);
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'element' => $updated_element,
            'message' => __('Element erfolgreich skaliert.', 'yprint-designtool')
        ));
    }
    
    /**
     * AJAX-Handler für das Rotieren eines Elements
     */
    public function ajax_rotate() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Parameter überprüfen
        if (empty($_POST['element']) || !isset($_POST['angle'])) {
            wp_send_json_error(__('Fehlende Parameter.', 'yprint-designtool'));
            return;
        }
        
        $element = json_decode(wp_unslash($_POST['element']), true);
        $angle = floatval($_POST['angle']);
        
        if (empty($element) || !isset($element['id'])) {
            wp_send_json_error(__('Ungültiges Element.', 'yprint-designtool'));
            return;
        }
        
        // Transform-Klasse abrufen
        $transform = YPrint_Transform::get_instance();
        
        // Element rotieren
        $updated_element = $transform->rotate($element, $angle);
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'element' => $updated_element,
            'message' => __('Element erfolgreich rotiert.', 'yprint-designtool')
        ));
    }
    
    /**
     * AJAX-Handler für das Spiegeln eines Elements
     */
    public function ajax_flip() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Parameter überprüfen
        if (empty($_POST['element']) || empty($_POST['direction'])) {
            wp_send_json_error(__('Fehlende Parameter.', 'yprint-designtool'));
            return;
        }
        
        $element = json_decode(wp_unslash($_POST['element']), true);
        $direction = sanitize_text_field($_POST['direction']);
        
        if (empty($element) || !isset($element['id'])) {
            wp_send_json_error(__('Ungültiges Element.', 'yprint-designtool'));
            return;
        }
        
        if ($direction !== 'horizontal' && $direction !== 'vertical') {
            wp_send_json_error(__('Ungültige Richtung.', 'yprint-designtool'));
            return;
        }
        
        // Transform-Klasse abrufen
        $transform = YPrint_Transform::get_instance();
        
        // Element spiegeln
        $updated_element = $transform->flip($element, $direction);
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'element' => $updated_element,
            'message' => __('Element erfolgreich gespiegelt.', 'yprint-designtool')
        ));
    }
    
    /**
     * AJAX-Handler für das Ändern der Ebene eines Elements
     */
    public function ajax_change_layer() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Parameter überprüfen
        if (empty($_POST['elements']) || empty($_POST['element_id']) || empty($_POST['direction'])) {
            wp_send_json_error(__('Fehlende Parameter.', 'yprint-designtool'));
            return;
        }
        
        $elements = json_decode(wp_unslash($_POST['elements']), true);
        $element_id = sanitize_text_field($_POST['element_id']);
        $direction = sanitize_text_field($_POST['direction']);
        
        if (empty($elements) || !is_array($elements)) {
            wp_send_json_error(__('Ungültige Elementliste.', 'yprint-designtool'));
            return;
        }
        
        if (!in_array($direction, array('front', 'back', 'forward', 'backward'))) {
            wp_send_json_error(__('Ungültige Richtung.', 'yprint-designtool'));
            return;
        }
        
        // Transform-Klasse abrufen
        $transform = YPrint_Transform::get_instance();
        
        // Ebene ändern
        $updated_elements = $transform->change_layer($elements, $element_id, $direction);
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'elements' => $updated_elements,
            'message' => __('Ebene erfolgreich geändert.', 'yprint-designtool')
        ));
    }
    
    /**
     * AJAX-Handler für das Gruppieren von Elementen
     */
    public function ajax_group() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Parameter überprüfen
        if (empty($_POST['elements'])) {
            wp_send_json_error(__('Fehlende Parameter.', 'yprint-designtool'));
            return;
        }
        
        $elements = json_decode(wp_unslash($_POST['elements']), true);
        
        if (empty($elements) || !is_array($elements) || count($elements) < 2) {
            wp_send_json_error(__('Ungültige Elementliste. Mindestens 2 Elemente sind erforderlich.', 'yprint-designtool'));
            return;
        }
        
        // Transform-Klasse abrufen
        $transform = YPrint_Transform::get_instance();
        
        // Elemente gruppieren
        $group = $transform->group($elements);
        
        if ($group === null) {
            wp_send_json_error(__('Gruppierung fehlgeschlagen.', 'yprint-designtool'));
            return;
        }
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'group' => $group,
            'message' => __('Elemente erfolgreich gruppiert.', 'yprint-designtool')
        ));
    }
    
    /**
     * AJAX-Handler für das Auflösen einer Gruppe
     */
    public function ajax_ungroup() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Parameter überprüfen
        if (empty($_POST['group'])) {
            wp_send_json_error(__('Fehlende Parameter.', 'yprint-designtool'));
            return;
        }
        
        $group = json_decode(wp_unslash($_POST['group']), true);
        
        if (empty($group) || !isset($group['type']) || $group['type'] !== 'group') {
            wp_send_json_error(__('Ungültige Gruppe.', 'yprint-designtool'));
            return;
        }
        
        // Transform-Klasse abrufen
        $transform = YPrint_Transform::get_instance();
        
        // Gruppe auflösen
        $elements = $transform->ungroup($group);
        
        if ($elements === null) {
            wp_send_json_error(__('Auflösen der Gruppe fehlgeschlagen.', 'yprint-designtool'));
            return;
        }
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'elements' => $elements,
            'message' => __('Gruppe erfolgreich aufgelöst.', 'yprint-designtool')
        ));
    }
    
    /**
     * AJAX-Handler für das Ausrichten von Elementen
     */
    public function ajax_align() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Parameter überprüfen
        if (empty($_POST['elements']) || empty($_POST['alignment'])) {
            wp_send_json_error(__('Fehlende Parameter.', 'yprint-designtool'));
            return;
        }
        
        $elements = json_decode(wp_unslash($_POST['elements']), true);
        $alignment = sanitize_text_field($_POST['alignment']);
        
        if (empty($elements) || !is_array($elements) || count($elements) < 2) {
            wp_send_json_error(__('Ungültige Elementliste. Mindestens 2 Elemente sind erforderlich.', 'yprint-designtool'));
            return;
        }
        
        if (!in_array($alignment, array('left', 'center', 'right', 'top', 'middle', 'bottom'))) {
            wp_send_json_error(__('Ungültige Ausrichtung.', 'yprint-designtool'));
            return;
        }
        
        // Transform-Klasse abrufen
        $transform = YPrint_Transform::get_instance();
        
        // Elemente ausrichten
        $updated_elements = $transform->align($elements, $alignment);
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'elements' => $updated_elements,
            'message' => __('Elemente erfolgreich ausgerichtet.', 'yprint-designtool')
        ));
    }
    
    /**
     * AJAX-Handler für das Verteilen von Elementen
     */
    public function ajax_distribute() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Parameter überprüfen
        if (empty($_POST['elements']) || empty($_POST['direction'])) {
            wp_send_json_error(__('Fehlende Parameter.', 'yprint-designtool'));
            return;
        }
        
        $elements = json_decode(wp_unslash($_POST['elements']), true);
        $direction = sanitize_text_field($_POST['direction']);
        
        if (empty($elements) || !is_array($elements) || count($elements) < 3) {
            wp_send_json_error(__('Ungültige Elementliste. Mindestens 3 Elemente sind erforderlich.', 'yprint-designtool'));
            return;
        }
        
        if (!in_array($direction, array('horizontal', 'vertical'))) {
            wp_send_json_error(__('Ungültige Richtung.', 'yprint-designtool'));
            return;
        }
        
        // Transform-Klasse abrufen
        $transform = YPrint_Transform::get_instance();
        
        // Elemente verteilen
        $updated_elements = $transform->distribute($elements, $direction);
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'elements' => $updated_elements,
            'message' => __('Elemente erfolgreich verteilt.', 'yprint-designtool')
        ));
    }
    
    /**
     * AJAX-Handler für das Duplizieren eines Elements
     */
    public function ajax_duplicate() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Parameter überprüfen
        if (empty($_POST['element'])) {
            wp_send_json_error(__('Fehlende Parameter.', 'yprint-designtool'));
            return;
        }
        
        $element = json_decode(wp_unslash($_POST['element']), true);
        
        if (empty($element) || !isset($element['id'])) {
            wp_send_json_error(__('Ungültiges Element.', 'yprint-designtool'));
            return;
        }
        
        // Dupliziertes Element erstellen
        $duplicate = $element;
        $duplicate['id'] = $element['id'] . '_copy_' . uniqid();
        
        // Position leicht versetzen, um Überlagerung zu vermeiden
        $duplicate['left'] = $element['left'] + 20;
        $duplicate['top'] = $element['top'] + 20;
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'element' => $duplicate,
            'message' => __('Element erfolgreich dupliziert.', 'yprint-designtool')
        ));
    }
    
    /**
     * AJAX-Handler für das Löschen von Elementen
     */
    public function ajax_delete() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Parameter überprüfen
        if (empty($_POST['elements']) || empty($_POST['element_ids'])) {
            wp_send_json_error(__('Fehlende Parameter.', 'yprint-designtool'));
            return;
        }
        
        $elements = json_decode(wp_unslash($_POST['elements']), true);
        $element_ids = json_decode(wp_unslash($_POST['element_ids']), true);
        
        if (empty($elements) || !is_array($elements) || empty($element_ids) || !is_array($element_ids)) {
            wp_send_json_error(__('Ungültige Parameter.', 'yprint-designtool'));
            return;
        }
        
        // Elemente filtern, um die zu löschenden Elemente zu entfernen
        $updated_elements = array_filter($elements, function($element) use ($element_ids) {
            return !in_array($element['id'], $element_ids);
        });
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'elements' => array_values($updated_elements), // Array neu indizieren
            'message' => _n(
                'Element erfolgreich gelöscht.',
                'Elemente erfolgreich gelöscht.',
                count($element_ids),
                'yprint-designtool'
            )
        ));
    }
    
    /**
     * AJAX-Handler für das Sperren von Elementen
     */
    public function ajax_lock() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Parameter überprüfen
        if (empty($_POST['element'])) {
            wp_send_json_error(__('Fehlende Parameter.', 'yprint-designtool'));
            return;
        }
        
        $element = json_decode(wp_unslash($_POST['element']), true);
        
        if (empty($element) || !isset($element['id'])) {
            wp_send_json_error(__('Ungültiges Element.', 'yprint-designtool'));
            return;
        }
        
        // Element sperren
        $element['locked'] = true;
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'element' => $element,
            'message' => __('Element erfolgreich gesperrt.', 'yprint-designtool')
        ));
    }
    
    /**
     * AJAX-Handler für das Entsperren von Elementen
     */
    public function ajax_unlock() {
        // Nonce-Überprüfung
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // Parameter überprüfen
        if (empty($_POST['element'])) {
            wp_send_json_error(__('Fehlende Parameter.', 'yprint-designtool'));
            return;
        }
        
        $element = json_decode(wp_unslash($_POST['element']), true);
        
        if (empty($element) || !isset($element['id'])) {
            wp_send_json_error(__('Ungültiges Element.', 'yprint-designtool'));
            return;
        }
        
        // Element entsperren
        $element['locked'] = false;
        
        // Erfolgreiche Antwort senden
        wp_send_json_success(array(
            'element' => $element,
            'message' => __('Element erfolgreich entsperrt.', 'yprint-designtool')
        ));
    }
}
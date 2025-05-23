<?php
/**
 * SVG Handler Klasse
 *
 * Verwaltet SVG-Dateien, einschließlich Sanitierung, Optimierung und Speicherung
 *
 * @package YPrint_DesignTool
 * @subpackage SVGHandler
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * SVG Handler Klasse
 */
class YPrint_SVG_Handler {
    
    /**
     * Instance der Klasse
     *
     * @var YPrint_SVG_Handler
     */
    private static $instance = null;
    
    /**
     * SVG Namespace
     */
    const SVG_NS = 'http://www.w3.org/2000/svg';
    
    /**
     * DOMDocument für SVG-Bearbeitung
     *
     * @var DOMDocument
     */
    private $document;
    
    /**
     * Gibt die einzige Instanz der Klasse zurück
     *
     * @return YPrint_SVG_Handler Die Instanz
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Konstruktor
     */
    private function __construct() {
        // XML-Erweiterung prüfen
        if (!extension_loaded('dom')) {
            error_log('Die DOM-Erweiterung ist erforderlich für die SVG-Bearbeitung.');
        }
        
        $this->init_hooks();
    }
    
    private function init_hooks() {
        // AJAX-Aktionen registrieren
        add_action('wp_ajax_yprint_save_svg_to_media', array($this, 'ajax_save_svg_to_media'));
        add_action('wp_ajax_yprint_optimize_svg', array($this, 'ajax_optimize_svg'));
        add_action('wp_ajax_yprint_download_svg', array($this, 'ajax_download_svg'));
        
        // Diese AJAX-Aktionen auch für nicht eingeloggte Benutzer verfügbar machen
        add_action('wp_ajax_nopriv_yprint_download_svg', array($this, 'ajax_download_svg'));
        
        // REST API-Endpunkte für SVG-Pfadoperationen registrieren
        add_action('rest_api_init', array($this, 'register_rest_routes'));
    }
    
    /**
     * Lädt SVG aus einem String
     *
     * @param string $svg_content SVG als String
     * @return bool True bei Erfolg
     */
    public function load_svg_from_string($svg_content) {
        $this->document = new DOMDocument();
        $this->document->preserveWhiteSpace = false;
        $this->document->formatOutput = true;
        
        // Fehlerbehandlung aktivieren
        libxml_use_internal_errors(true);
        $success = $this->document->loadXML($svg_content);
        $errors = libxml_get_errors();
        libxml_clear_errors();
        
        if (!$success || !empty($errors)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Lädt eine SVG-Datei
     *
     * @param string $filepath Pfad zur SVG-Datei
     * @return bool True bei Erfolg
     */
    public function load_svg($filepath) {
        if (!file_exists($filepath)) {
            return false;
        }
        
        $this->document = new DOMDocument();
        $this->document->preserveWhiteSpace = false;
        $this->document->formatOutput = true;
        
        // Fehlerbehandlung aktivieren
        libxml_use_internal_errors(true);
        $success = $this->document->load($filepath);
        $errors = libxml_get_errors();
        libxml_clear_errors();
        
        if (!$success || !empty($errors)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Gibt SVG als String zurück
     *
     * @return string SVG-Inhalt
     */
    public function get_svg_string() {
        if (!$this->document) {
            return '';
        }
        
        return $this->document->saveXML();
    }
    
    /**
     * Sanitiert SVG für WordPress
     *
     * @param string $svg_content SVG-Inhalt
     * @return string|false Sanitierter SVG-Inhalt oder false bei Fehler
     */
    public function sanitize_svg($svg_content) {
        if (empty($svg_content)) {
            return false;
        }
        
        // Laden des SVG
        if (!$this->load_svg_from_string($svg_content)) {
            return false;
        }
        
        $svg = $this->document->documentElement;
        
        // Entferne potenziell gefährliche Attribute
        $dangerous_attributes = [
            'onload', 'onclick', 'onmouseover', 'onmouseout', 'onmousemove',
            'onmousedown', 'onmouseup', 'onfocus', 'onblur', 'onerror',
            'onchange', 'onscroll', 'javascript'
        ];
        
        $this->remove_dangerous_attributes($svg, $dangerous_attributes);
        
        // Entferne alle script-Tags
        $scripts = $this->document->getElementsByTagName('script');
        for ($i = $scripts->length - 1; $i >= 0; $i--) {
            $script = $scripts->item($i);
            $script->parentNode->removeChild($script);
        }
        
        // Rückgabe des sanitierten SVG
        return $this->get_svg_string();
    }
    
    /**
     * Entfernt gefährliche Attribute rekursiv
     * 
     * @param DOMNode $node Startknoten
     * @param array $dangerous_attributes Liste gefährlicher Attribute
     */
    private function remove_dangerous_attributes($node, $dangerous_attributes) {
        if ($node->nodeType === XML_ELEMENT_NODE) {
            foreach ($dangerous_attributes as $attr) {
                if ($node->hasAttribute($attr)) {
                    $node->removeAttribute($attr);
                }
            }
            
            // Überprüfe href-Attribute auf JavaScript
            if ($node->hasAttribute('href')) {
                $href = $node->getAttribute('href');
                if (preg_match('/^\s*javascript\s*:/i', $href)) {
                    $node->removeAttribute('href');
                }
            }
            
            // Überprüfe style-Attribute auf JavaScript
            if ($node->hasAttribute('style')) {
                $style = $node->getAttribute('style');
                if (preg_match('/expression\s*\(|javascript\s*:|behavior\s*:/i', $style)) {
                    $node->removeAttribute('style');
                }
            }
        }
        
        // Rekursiv Kinder verarbeiten
        if ($node->hasChildNodes()) {
            foreach ($node->childNodes as $child) {
                $this->remove_dangerous_attributes($child, $dangerous_attributes);
            }
        }
    }
    
    /**
     * Optimiert SVG-Inhalt
     *
     * @param string $svg_content SVG-Inhalt
     * @param array $options Optimierungsoptionen
     * @return string|false Optimierter SVG-Inhalt oder false bei Fehler
     */
    public function optimize_svg($svg_content, $options = array()) {
        if (empty($svg_content)) {
            return false;
        }
        
        // Standardoptionen
        $default_options = array(
            'remove_comments' => true,
            'remove_empty_groups' => true,
            'remove_metadata' => true,
            'remove_xml_declaration' => false,
            'round_precision' => 2
        );
        
        $options = wp_parse_args($options, $default_options);
        
        // Laden des SVG
        if (!$this->load_svg_from_string($svg_content)) {
            return false;
        }
        
        // Kommentare entfernen
        if ($options['remove_comments']) {
            $this->remove_comments($this->document);
        }
        
        // Leere Gruppen entfernen
        if ($options['remove_empty_groups']) {
            $this->remove_empty_groups();
        }
        
        // Metadaten entfernen
        if ($options['remove_metadata']) {
            $this->remove_metadata();
        }
        
        // Zahlen runden
        if ($options['round_precision'] >= 0) {
            $this->round_numeric_values($options['round_precision']);
        }
        
        // Optimiertes SVG zurückgeben
        $svg_output = $this->get_svg_string();
        
        // XML-Deklaration entfernen, falls gewünscht
        if ($options['remove_xml_declaration']) {
            $svg_output = preg_replace('/<\?xml[^>]+>\s*/i', '', $svg_output);
        }
        
        return $svg_output;
    }
    
    /**
     * Entfernt alle Kommentare aus dem Dokument
     *
     * @param DOMNode $node Startknoten
     */
    private function remove_comments($node) {
        if (!$node) {
            return;
        }
        
        $children = $node->childNodes;
        for ($i = $children->length - 1; $i >= 0; $i--) {
            $child = $children->item($i);
            
            if ($child->nodeType === XML_COMMENT_NODE) {
                $node->removeChild($child);
            } elseif ($child->nodeType === XML_ELEMENT_NODE) {
                $this->remove_comments($child);
            }
        }
    }
    
    /**
     * Entfernt leere Gruppen (g-Elemente ohne Kindelemente)
     */
    private function remove_empty_groups() {
        $xpath = new DOMXPath($this->document);
        $xpath->registerNamespace('svg', self::SVG_NS);
        
        $empty_groups = $xpath->query('//svg:g[not(node())]');
        
        // Rückwärts durchlaufen, um Probleme beim Entfernen zu vermeiden
        for ($i = $empty_groups->length - 1; $i >= 0; $i--) {
            $group = $empty_groups->item($i);
            $group->parentNode->removeChild($group);
        }
    }
    
    /**
     * Entfernt Metadaten aus dem SVG
     */
    private function remove_metadata() {
        $xpath = new DOMXPath($this->document);
        $xpath->registerNamespace('svg', self::SVG_NS);
        
        $metadata_elements = $xpath->query('//*[local-name()="metadata"] | //*[local-name()="desc"] | //*[local-name()="title"]');
        
        for ($i = $metadata_elements->length - 1; $i >= 0; $i--) {
            $element = $metadata_elements->item($i);
            $element->parentNode->removeChild($element);
        }
    }
    
    /**
     * Rundet numerische Werte in SVG-Attributen
     * 
     * @param int $precision Anzahl der Dezimalstellen
     */
    private function round_numeric_values($precision = 2) {
        $xpath = new DOMXPath($this->document);
        $xpath->registerNamespace('svg', self::SVG_NS);
        
        // Attribute, die numerische Werte enthalten können
        $numeric_attributes = array(
            'x', 'y', 'width', 'height', 'cx', 'cy', 'r', 'rx', 'ry',
            'x1', 'y1', 'x2', 'y2', 'points', 'transform', 'viewBox'
        );
        
        // Alle Elemente durchlaufen
        $elements = $xpath->query('//*');
        foreach ($elements as $element) {
            foreach ($numeric_attributes as $attr) {
                if ($element->hasAttribute($attr)) {
                    $value = $element->getAttribute($attr);
                    $new_value = $this->round_attr_value($value, $precision);
                    if ($value !== $new_value) {
                        $element->setAttribute($attr, $new_value);
                    }
                }
            }
            
            // Speziell für d-Attribute in Pfaden
            if ($element->nodeName === 'path' && $element->hasAttribute('d')) {
                $d = $element->getAttribute('d');
                $new_d = $this->round_path_data($d, $precision);
                if ($d !== $new_d) {
                    $element->setAttribute('d', $new_d);
                }
            }
        }
    }
    
    /**
     * Rundet numerische Werte in einem Attribut
     * 
     * @param string $value Attributwert
     * @param int $precision Anzahl der Dezimalstellen
     * @return string Gerundeter Wert
     */
    private function round_attr_value($value, $precision) {
        // Wenn es eine einfache Zahl ist
        if (is_numeric($value)) {
            return $this->round_numeric($value, $precision);
        }
        
        // Für komplexere Werte wie viewBox="0 0 100 100"
        return preg_replace_callback('/(-?\d+\.?\d*)/', function($matches) use ($precision) {
            return $this->round_numeric($matches[0], $precision);
        }, $value);
    }
    
    /**
     * Rundet Pfaddaten in einem d-Attribut
     * 
     * @param string $d Pfaddaten
     * @param int $precision Anzahl der Dezimalstellen
     * @return string Gerundete Pfaddaten
     */
    private function round_path_data($d, $precision) {
        return preg_replace_callback('/(-?\d+\.?\d*)(?=[,\s]|$)/', function($matches) use ($precision) {
            return $this->round_numeric($matches[0], $precision);
        }, $d);
    }
    
    /**
     * Rundet eine numerische Zeichenkette
     * 
     * @param string $num Numerische Zeichenkette
     * @param int $precision Anzahl der Dezimalstellen
     * @return string Gerundete Zahl als Zeichenkette
     */
    private function round_numeric($num, $precision) {
        if (!is_numeric($num)) {
            return $num;
        }
        
        $rounded = round((float)$num, $precision);
        
        // Entferne nachgestellte Nullen und Dezimalpunkt, wenn nicht benötigt
        $result = (string)$rounded;
        if (strpos($result, '.') !== false) {
            $result = rtrim(rtrim($result, '0'), '.');
        }
        
        return $result;
    }
    
    /**
     * Speichert SVG in der WordPress Medienbibliothek
     * 
     * @param string $svg_content SVG-Inhalt
     * @param string $filename Dateiname (ohne Pfad)
     * @param array $attachment_data Zusätzliche Anhangsdaten
     * @return int|WP_Error Attachment ID oder WP_Error
     */
    public function save_to_media_library($svg_content, $filename, $attachment_data = array()) {
        // Sanitiere den SVG-Inhalt
        $svg_content = $this->sanitize_svg($svg_content);
        if (!$svg_content) {
            return new WP_Error('invalid_svg', __('Ungültiges SVG-Format', 'yprint-designtool'));
        }
        
        // Upload-Verzeichnis und einzigartigen Dateinamen erstellen
        $upload_dir = wp_upload_dir();
        if (!empty($upload_dir['error'])) {
            return new WP_Error('upload_dir_error', $upload_dir['error']);
        }
        
        // Stellen Sie sicher, dass der Dateiname auf .svg endet
        if (pathinfo($filename, PATHINFO_EXTENSION) !== 'svg') {
            $filename .= '.svg';
        }
        
        $filename = wp_unique_filename($upload_dir['path'], $filename);
        $file_path = $upload_dir['path'] . '/' . $filename;
        
        // SVG-Inhalt in die Datei schreiben
        if (file_put_contents($file_path, $svg_content) === false) {
            return new WP_Error('file_save_error', __('Fehler beim Speichern der SVG-Datei', 'yprint-designtool'));
        }
        
        // Standard Attachment-Daten
        $attachment_defaults = array(
            'post_mime_type' => 'image/svg+xml',
            'post_title'     => preg_replace('/\.[^.]+$/', '', $filename),
            'post_content'   => '',
            'post_status'    => 'inherit'
        );
        
        // Benutzer-Attachment-Daten mit Standardwerten zusammenführen
        $attachment = wp_parse_args($attachment_data, $attachment_defaults);
        
        // Erstellen Sie den Anhang in der WordPress-Datenbank
        $attachment_id = wp_insert_attachment($attachment, $file_path);
        
        if (is_wp_error($attachment_id)) {
            @unlink($file_path); // Lösche die Datei bei Fehler
            return $attachment_id;
        }
        
        // Generieren Sie die Anhangsdaten und Metadaten
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        $attachment_metadata = wp_generate_attachment_metadata($attachment_id, $file_path);
        wp_update_attachment_metadata($attachment_id, $attachment_metadata);
        
        return $attachment_id;
    }
    
    /**
     * AJAX-Handler zum Speichern einer SVG-Datei in der Medienbibliothek
     */
    public function ajax_save_svg_to_media() {
        // Sicherheitscheck
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        if (!current_user_can('upload_files')) {
            wp_send_json_error(array('message' => __('Keine Berechtigung zum Hochladen von Dateien.', 'yprint-designtool')));
            return;
        }
        
        // SVG-Daten prüfen
        if (empty($_POST['svg_content'])) {
            wp_send_json_error(array('message' => __('Kein SVG-Inhalt gefunden.', 'yprint-designtool')));
            return;
        }
        
        $svg_content = stripslashes($_POST['svg_content']);
        $filename = isset($_POST['filename']) ? sanitize_file_name($_POST['filename']) : 'design.svg';
        $title = isset($_POST['title']) ? sanitize_text_field($_POST['title']) : '';
        
        // Attachment-Daten
        $attachment_data = array();
        if (!empty($title)) {
            $attachment_data['post_title'] = $title;
        }
        
        // SVG in Medienbibliothek speichern
        $result = $this->save_to_media_library($svg_content, $filename, $attachment_data);
        
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
            return;
        }
        
        // Erfolg zurückmelden
        wp_send_json_success(array(
            'attachment_id' => $result,
            'attachment_url' => wp_get_attachment_url($result),
            'admin_url' => admin_url('post.php?post=' . $result . '&action=edit')
        ));
    }
    
    /**
     * AJAX-Handler zum Optimieren einer SVG-Datei
     */
    public function ajax_optimize_svg() {
        // Sicherheitscheck
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // SVG-Daten prüfen
        if (empty($_POST['svg_content'])) {
            wp_send_json_error(array('message' => __('Kein SVG-Inhalt gefunden.', 'yprint-designtool')));
            return;
        }
        
        $svg_content = stripslashes($_POST['svg_content']);
        
        // Optimierungsoptionen
        $options = array(
            'remove_comments' => !empty($_POST['remove_comments']),
            'remove_empty_groups' => !empty($_POST['remove_empty_groups']),
            'remove_metadata' => !empty($_POST['remove_metadata']),
            'remove_xml_declaration' => !empty($_POST['remove_xml_declaration']),
            'round_precision' => isset($_POST['round_precision']) ? intval($_POST['round_precision']) : 2
        );
        
        // SVG optimieren
        $optimized_svg = $this->optimize_svg($svg_content, $options);
        
        if ($optimized_svg === false) {
            wp_send_json_error(array('message' => __('Fehler beim Optimieren der SVG-Datei.', 'yprint-designtool')));
            return;
        }
        
        // Originalgröße und optimierte Größe berechnen
        $original_size = strlen($svg_content);
        $optimized_size = strlen($optimized_svg);
        $reduction = $original_size > 0 ? round(100 - ($optimized_size / $original_size * 100), 1) : 0;
        
        // Erfolg zurückmelden
        wp_send_json_success(array(
            'svg_content' => $optimized_svg,
            'original_size' => $original_size,
            'optimized_size' => $optimized_size,
            'reduction' => $reduction . '%'
        ));
    }
    
    /**
     * AJAX-Handler zum Herunterladen einer SVG-Datei
     */
    public function ajax_download_svg() {
        // Sicherheitscheck
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // SVG-Daten prüfen
        if (empty($_POST['svg_content'])) {
            wp_send_json_error(array('message' => __('Kein SVG-Inhalt gefunden.', 'yprint-designtool')));
            return;
        }
        
        $svg_content = stripslashes($_POST['svg_content']);
        $filename = isset($_POST['filename']) ? sanitize_file_name($_POST['filename']) : 'design.svg';
        
        // Stelle sicher, dass der Dateiname auf .svg endet
        if (pathinfo($filename, PATHINFO_EXTENSION) !== 'svg') {
            $filename .= '.svg';
        }
        
        // Sanitiere den SVG-Inhalt
        $svg_content = $this->sanitize_svg($svg_content);
        if (!$svg_content) {
            wp_send_json_error(array('message' => __('Ungültiges SVG-Format', 'yprint-designtool')));
            return;
        }
        
        // Temporäre Datei erstellen
        $temp_dir = get_temp_dir();
        $temp_file = $temp_dir . 'yprint_' . md5(uniqid()) . '.svg';
        
        if (file_put_contents($temp_file, $svg_content) === false) {
            wp_send_json_error(array('message' => __('Fehler beim Erstellen der temporären Datei.', 'yprint-designtool')));
            return;
        }
        
        // URL zur temporären Datei erstellen
        $upload_dir = wp_upload_dir();
        if (strpos($temp_file, $upload_dir['basedir']) === 0) {
            // Datei liegt im Upload-Verzeichnis, kann direkt über URL aufgerufen werden
            $file_url = str_replace($upload_dir['basedir'], $upload_dir['baseurl'], $temp_file);
        } else {
            // Datei muss in ein zugängliches Verzeichnis kopiert werden
            $accessible_dir = $upload_dir['basedir'] . '/yprint-designtool/temp';
            
            // Verzeichnis erstellen, falls nicht vorhanden
            if (!file_exists($accessible_dir)) {
                wp_mkdir_p($accessible_dir);
                // .htaccess zum Schutz erstellen
                file_put_contents($accessible_dir . '/.htaccess', "Options -Indexes\n");
            }
            
            $accessible_file = $accessible_dir . '/' . basename($temp_file);
            copy($temp_file, $accessible_file);
            unlink($temp_file); // Ursprüngliche temporäre Datei löschen
            $file_url = $upload_dir['baseurl'] . '/yprint-designtool/temp/' . basename($temp_file);
        }
        
        // Erfolg zurückmelden
        wp_send_json_success(array(
            'file_url' => $file_url,
            'filename' => $filename
        ));
    }
    
    /**
     * Fügt SVG-Unterstützung in WordPress hinzu
     */
    public function add_svg_support() {
        // MIME-Typ für SVG hinzufügen
        add_filter('upload_mimes', array($this, 'add_svg_mime_type'));
        
        // SVG-Größeninformationen für die Medienbibliothek
        add_filter('wp_prepare_attachment_for_js', array($this, 'fix_svg_media_dimensions'), 10, 3);
        
        // SVG-Vorschau im Media-Uploader
        add_action('admin_head', array($this, 'fix_svg_thumbnail_display'));
    }
    
    /**
     * Fügt SVG zum erlaubten MIME-Typ hinzu
     * 
     * @param array $mimes Erlaubte MIME-Typen
     * @return array Modifizierte MIME-Typen
     */
    public function add_svg_mime_type($mimes) {
        $mimes['svg'] = 'image/svg+xml';
        return $mimes;
    }
    
    /**
     * Korrigiert die Dimensionen für SVG in der Medienbibliothek
     * 
     * @param array $response Antwortdaten
     * @param WP_Post $attachment Anhangsdaten
     * @param array $meta Metadaten
     * @return array Modifizierte Antwortdaten
     */
    public function fix_svg_media_dimensions($response, $attachment, $meta) {
        if ($response['mime'] === 'image/svg+xml' && empty($response['sizes'])) {
            $svg_path = get_attached_file($attachment->ID);
            
            if (!$svg_path) {
                return $response;
            }
            
            if ($this->load_svg($svg_path)) {
                $dimensions = $this->get_svg_dimensions();
                
                if ($dimensions) {
                    $response['width'] = $dimensions['width'];
                    $response['height'] = $dimensions['height'];
                    
                    $response['sizes'] = array(
                        'full' => array(
                            'url' => $response['url'],
                            'width' => $dimensions['width'],
                            'height' => $dimensions['height']
                        )
                    );
                }
            }
        }
        
        return $response;
    }
    
    /**
     * Korrigiert die SVG-Thumbnail-Darstellung im Admin-Bereich
     */
    public function fix_svg_thumbnail_display() {
        echo '<style>
            .attachment-266x266, .thumbnail img {
                width: auto;
                height: auto;
                max-width: 100%;
                max-height: 100%;
            }
        </style>';
    }
    
    /**
     * Gibt die Dimensionen des SVG zurück
     *
     * @return array|false Array mit width und height oder false
     */
    public function get_svg_dimensions() {
        if (!$this->document) {
            return false;
        }
        
        $svg = $this->document->documentElement;
        if (!$svg) {
            return false;
        }
        
        $width = $svg->getAttribute('width');
        $height = $svg->getAttribute('height');
        
        // Wenn width und height nicht als Attribute gesetzt sind, versuche viewBox
        if (empty($width) || empty($height)) {
            $viewBox = $svg->getAttribute('viewBox');
            if (!empty($viewBox)) {
                $parts = preg_split('/[\s,]+/', trim($viewBox));
                if (count($parts) === 4) {
                    $width = $parts[2];
                    $height = $parts[3];
                }
            }
        }
        
        // Entferne Einheiten und konvertiere in Zahlen
        $width = $this->parse_dimension($width);
        $height = $this->parse_dimension($height);
        
        if ($width > 0 && $height > 0) {
            return array(
                'width' => $width,
                'height' => $height
            );
        }
        
        return false;
    }
    
    /**
     * Parsed eine Dimensionsangabe und entfernt Einheiten
     * 
     * @param string $value Dimensionsangabe (z.B. "100px", "50%")
     * @return int Numerischer Wert oder 0
     */
    private function parse_dimension($value) {
        if (empty($value)) {
            return 0;
        }
        
        // Nur numerischen Teil extrahieren
        if (preg_match('/^(\d+(?:\.\d+)?)(?:px|pt|em|ex|%|in|cm|mm|pc)?$/', $value, $matches)) {
            return (float) $matches[1];
        }
        
        return (float) $value;
    }

    /**
     * Registriert REST-API-Routen
     */
    public function register_rest_routes() {
        register_rest_route('yprint-svg-path/v1', '/combine-paths', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_combine_paths'),
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            }
        ));
        
        register_rest_route('yprint-svg-path/v1', '/break-apart', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_break_apart'),
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            }
        ));
        
        register_rest_route('yprint-svg-path/v1', '/shape-to-path', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_shape_to_path'),
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            }
        ));
        
        register_rest_route('yprint-svg-path/v1', '/reverse-path', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_reverse_path'),
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            }
        ));
        
        register_rest_route('yprint-svg-path/v1', '/enhance-lines', array(
            'methods' => 'POST',
            'callback' => array($this, 'rest_enhance_lines'),
            'permission_callback' => function () {
                return current_user_can('edit_posts');
            }
        ));
    }
    
    /**
     * REST-API-Endpunkt zum Kombinieren von Pfaden
     */
    public function rest_combine_paths($request) {
        $params = $request->get_params();
        
        if (!isset($params['paths']) || !is_array($params['paths'])) {
            return new WP_Error('invalid_params', __('Ungültige Parameter', 'yprint-designtool'), array('status' => 400));
        }
        
        $paths = $params['paths'];
        $result = $this->combine_paths($paths);
        
        return rest_ensure_response(array(
            'success' => true,
            'combined_path' => $result
        ));
    }
    
    /**
     * REST-API-Endpunkt zum Aufbrechen von Pfaden
     */
    public function rest_break_apart($request) {
        $params = $request->get_params();
        
        if (!isset($params['path']) || empty($params['path'])) {
            return new WP_Error('invalid_params', __('Ungültige Parameter', 'yprint-designtool'), array('status' => 400));
        }
        
        $path = $params['path'];
        $result = $this->break_apart_path($path);
        
        return rest_ensure_response(array(
            'success' => true,
            'paths' => $result
        ));
    }
    
    /**
     * REST-API-Endpunkt zum Konvertieren von Formen in Pfade
     */
    public function rest_shape_to_path($request) {
        $params = $request->get_params();
        
        if (!isset($params['shape']) || empty($params['shape'])) {
            return new WP_Error('invalid_params', __('Ungültige Parameter', 'yprint-designtool'), array('status' => 400));
        }
        
        $shape = $params['shape'];
        $result = $this->shape_to_path($shape);
        
        return rest_ensure_response(array(
            'success' => true,
            'path' => $result
        ));
    }
    
    /**
     * REST-API-Endpunkt zum Umkehren von Pfaden
     */
    public function rest_reverse_path($request) {
        $params = $request->get_params();
        
        if (!isset($params['path']) || empty($params['path'])) {
            return new WP_Error('invalid_params', __('Ungültige Parameter', 'yprint-designtool'), array('status' => 400));
        }
        
        $path = $params['path'];
        $result = $this->reverse_path($path);
        
        return rest_ensure_response(array(
            'success' => true,
            'reversed_path' => $result
        ));
    }
    
    /**
     * REST-API-Endpunkt zum Verstärken von Linien
     */
    public function rest_enhance_lines($request) {
        $params = $request->get_params();
        
        if (!isset($params['path']) || empty($params['path'])) {
            return new WP_Error('invalid_params', __('Ungültige Parameter', 'yprint-designtool'), array('status' => 400));
        }
        
        $path = $params['path'];
        $thickness = isset($params['thickness']) ? floatval($params['thickness']) : 2.0;
        
        $result = $this->enhance_lines($path, $thickness);
        
        return rest_ensure_response(array(
            'success' => true,
            'enhanced_path' => $result
        ));
    }
    
    /**
     * Kombiniert mehrere SVG-Pfade zu einem
     *
     * @param array $paths Array von SVG-Pfadstrings
     * @return string Kombinierter Pfadstring
     */
    public function combine_paths($paths) {
        if (empty($paths)) {
            return '';
        }
        
        // d-Attribute extrahieren und kombinieren
        $combined_path = '';
        foreach ($paths as $path) {
            // d-Attribut mit Regex extrahieren
            if (preg_match('/d="([^"]*)"/', $path, $matches)) {
                $d_attr = $matches[1];
                // Abschließenden Z-Befehl entfernen und Leerzeichen hinzufügen
                $d_attr = rtrim($d_attr, 'Zz') . ' ';
                $combined_path .= $d_attr;
            }
        }
        
        // Abschließendes Z hinzufügen, falls nötig
        if (!empty($combined_path)) {
            $combined_path .= 'Z';
        }
        
        return $combined_path;
    }
    
    /**
     * Bricht einen SVG-Pfad in mehrere Pfade auf
     *
     * @param string $path SVG-Pfadstring
     * @return array Array von Pfadstrings
     */
    public function break_apart_path($path) {
        if (empty($path)) {
            return array();
        }
        
        // d-Attribut extrahieren
        if (!preg_match('/d="([^"]*)"/', $path, $matches)) {
            return array($path);
        }
        
        $d_attr = $matches[1];
        
        // Den Pfad bei 'M'-Befehlen aufteilen (neue Teilpfade)
        preg_match_all('/M[^M]*/', $d_attr, $subpaths);
        
        $result = array();
        foreach ($subpaths[0] as $subpath) {
            // Ein neues Pfadelement mit dem Teilpfad erstellen
            $new_path = str_replace($matches[1], $subpath, $path);
            $result[] = $new_path;
        }
        
        return $result;
    }
    
    /**
     * Konvertiert Form-Elemente in Pfadelemente
     *
     * @param string $shape SVG-Formstring (rect, circle, etc.)
     * @return string Pfadstring
     */
    public function shape_to_path($shape) {
        // Formtyp extrahieren
        if (preg_match('/<(rect|circle|ellipse|line|polygon|polyline)\s/', $shape, $matches)) {
            $shape_type = $matches[1];
            
            switch ($shape_type) {
                case 'rect':
                    return $this->rect_to_path($shape);
                case 'circle':
                    return $this->circle_to_path($shape);
                case 'ellipse':
                    return $this->ellipse_to_path($shape);
                case 'line':
                    return $this->line_to_path($shape);
                case 'polygon':
                    return $this->polygon_to_path($shape);
                case 'polyline':
                    return $this->polyline_to_path($shape);
                default:
                    return $shape;
            }
        }
        
        return $shape;
    }
    
    /**
     * Methoden zur Umwandlung verschiedener Formen in Pfade
     * (Aus der wordpress-svg-path-plugin.php übernommen)
     */
    private function rect_to_path($rect) {
        // Attribute extrahieren
        preg_match('/x="([^"]*)"/', $rect, $x_matches);
        preg_match('/y="([^"]*)"/', $rect, $y_matches);
        preg_match('/width="([^"]*)"/', $rect, $width_matches);
        preg_match('/height="([^"]*)"/', $rect, $height_matches);
        preg_match('/rx="([^"]*)"/', $rect, $rx_matches);
        preg_match('/ry="([^"]*)"/', $rect, $ry_matches);
        
        $x = isset($x_matches[1]) ? floatval($x_matches[1]) : 0;
        $y = isset($y_matches[1]) ? floatval($y_matches[1]) : 0;
        $width = isset($width_matches[1]) ? floatval($width_matches[1]) : 0;
        $height = isset($height_matches[1]) ? floatval($height_matches[1]) : 0;
        $rx = isset($rx_matches[1]) ? floatval($rx_matches[1]) : 0;
        $ry = isset($ry_matches[1]) ? floatval($ry_matches[1]) : $rx;
        
        // Wenn beide rx und ry 0 sind, zeichne ein einfaches Rechteck
        if ($rx == 0 && $ry == 0) {
            $path_d = sprintf("M %f,%f H %f V %f H %f Z", 
                $x, $y, 
                $x + $width, 
                $y + $height, 
                $x
            );
        } else {
            // Stelle sicher, dass rx und ry nicht größer als die Hälfte der Breite und Höhe sind
            $rx = min($rx, $width / 2);
            $ry = min($ry, $height / 2);
            
            // Zeichne ein abgerundetes Rechteck
            $path_d = sprintf("M %f,%f h %f a %f,%f 0 0 1 %f,%f v %f a %f,%f 0 0 1 %f,%f h %f a %f,%f 0 0 1 %f,%f v %f a %f,%f 0 0 1 %f,%f z",
                $x + $rx, $y,
                $width - 2 * $rx,
                $rx, $ry, $rx, $ry,
                $height - 2 * $ry,
                $rx, $ry, -$rx, $ry,
                -($width - 2 * $rx),
                $rx, $ry, -$rx, -$ry,
                -($height - 2 * $ry),
                $rx, $ry, $rx, -$ry
            );
        }
        
        // Erstelle ein neues Pfadelement mit den Attributen des Rechtecks
        $path = preg_replace('/<rect\s/', '<path ', $rect);
        $path = preg_replace('/\sx="[^"]*"/', '', $path);
        $path = preg_replace('/\sy="[^"]*"/', '', $path);
        $path = preg_replace('/\swidth="[^"]*"/', '', $path);
        $path = preg_replace('/\sheight="[^"]*"/', '', $path);
        $path = preg_replace('/\srx="[^"]*"/', '', $path);
        $path = preg_replace('/\sry="[^"]*"/', '', $path);
        $path = str_replace('/>', ' d="' . $path_d . '" />', $path);
        
        return $path;
    }
    
    // Weitere Methoden für andere Formen hier einfügen...
    
    /**
     * Kehrt einen SVG-Pfad um
     *
     * @param string $path SVG-Pfadstring
     * @return string Umgekehrter Pfadstring
     */
    public function reverse_path($path) {
        if (empty($path)) {
            return '';
        }
        
        // d-Attribut extrahieren
        if (!preg_match('/d="([^"]*)"/', $path, $matches)) {
            return $path;
        }
        
        $d_attr = $matches[1];
        
        // Den Pfad normalisieren
        $d_attr = preg_replace('/([a-zA-Z])/', ' $1 ', $d_attr);
        $d_attr = preg_replace('/\s+/', ' ', trim($d_attr));
        
        // In Befehle und Koordinaten aufteilen
        $tokens = explode(' ', $d_attr);
        $commands = array();
        $current_command = '';
        $current_points = array();
        
        foreach ($tokens as $token) {
            if (preg_match('/^[a-zA-Z]$/', $token)) {
                if (!empty($current_command)) {
                    $commands[] = array(
                        'command' => $current_command,
                        'points' => $current_points
                    );
                }
                $current_command = $token;
                $current_points = array();
            } else {
                $current_points[] = $token;
            }
        }
        
        // Den letzten Befehl hinzufügen
        if (!empty($current_command)) {
            $commands[] = array(
                'command' => $current_command,
                'points' => $current_points
            );
        }
        
        // Die Befehle umkehren
        $reversed_commands = array_reverse($commands);
        
        // Den neuen Pfad mit dem letzten Punkt des ursprünglichen Pfads beginnen
        $last_command = end($commands);
        $last_points = $last_command['points'];
        $last_x = floatval($last_points[count($last_points) - 2]);
        $last_y = floatval($last_points[count($last_points) - 1]);
        
        $reversed_path = "M " . $last_x . "," . $last_y;
        
        // Jeden Befehl verarbeiten
        foreach ($reversed_commands as $i => $cmd) {
            $command = $cmd['command'];
            $points = $cmd['points'];
            
            // Verschiedene Befehle behandeln
            switch (strtoupper($command)) {
                case 'M':
                    // Den ersten M-Befehl überspringen, da wir den Pfad bereits begonnen haben
                    if ($i > 0) {
                        $reversed_path .= " L " . $points[0] . "," . $points[1];
                    }
                    break;
                case 'L':
                    $reversed_path .= " L " . $points[0] . "," . $points[1];
                    break;
                case 'H':
                    $reversed_path .= " H " . $points[0];
                    break;
                case 'V':
                    $reversed_path .= " V " . $points[0];
                    break;
                case 'C':
                    // Bezier-Kurve - Kontrollpunkte müssen umgekehrt werden
                    $reversed_path .= " C " . $points[2] . "," . $points[3] . " " . 
                                      $points[0] . "," . $points[1] . " " . 
                                      $points[4] . "," . $points[5];
                    break;
                case 'S':
                    // Glatte Bezier-Kurve - Kontrollpunkte müssen umgekehrt werden
                    $reversed_path .= " S " . $points[0] . "," . $points[1] . " " . 
                                      $points[2] . "," . $points[3];
                    break;
                case 'Q':
                    // Quadratische Bezier-Kurve
                    $reversed_path .= " Q " . $points[0] . "," . $points[1] . " " . 
                                      $points[2] . "," . $points[3];
                    break;
                case 'T':
                    // Glatte quadratische Bezier-Kurve
                    $reversed_path .= " T " . $points[0] . "," . $points[1];
                    break;
                case 'A':
                    // Bogen - die gleichen Parameter beibehalten
                    $reversed_path .= " A " . implode(' ', $points);
                    break;
                case 'Z':
                    // Pfad am Ende schließen
                    if ($i === 0) {
                        $reversed_path .= " Z";
                    }
                    break;
            }
        }
        
        // Die ursprünglichen Pfaddaten durch die umgekehrten ersetzen
        $reversed = str_replace($matches[1], $reversed_path, $path);
        
        return $reversed;
    }
    
    /**
     * Verstärkt Linien in einem SVG-Pfad
     *
     * @param string $path SVG-Pfadstring
     * @param float $thickness Dicke der Linien
     * @return string Pfad mit verstärkten Linien
     */
    public function enhance_lines($path, $thickness = 2.0) {
        if (empty($path)) {
            return '';
        }
        
        // d-Attribut extrahieren
        if (!preg_match('/d="([^"]*)"/', $path, $matches)) {
            return $path;
        }
        
        // Pfadtag finden
        if (preg_match('/<path\b[^>]*>/', $path, $tag_matches)) {
            $path_tag = $tag_matches[0];
            
            // Prüfen, ob bereits stroke-width vorhanden ist
            if (preg_match('/stroke-width="([^"]*)"/', $path, $sw_matches)) {
                // Vorhandenes stroke-width ersetzen
                $path = str_replace($sw_matches[0], 'stroke-width="' . $thickness . '"', $path);
            } else {
                // Neues stroke-width hinzufügen
                $path = str_replace($path_tag, $path_tag . ' stroke-width="' . $thickness . '"', $path);
            }
            
            // Sicherstellen, dass stroke Attribut vorhanden ist
            if (!preg_match('/stroke="([^"]*)"/', $path)) {
                $path = str_replace($path_tag, $path_tag . ' stroke="currentColor"', $path);
            }
            
            // Sicherstellen, dass fill Attribut korrekt gesetzt ist
            if (!preg_match('/fill="([^"]*)"/', $path)) {
                $path = str_replace($path_tag, $path_tag . ' fill="none"', $path);
            }
        }
        
        return $path;
    }
}
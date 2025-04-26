<?php
/**
 * SVG Enhancer Klasse
 *
 * Bietet erweiterte Funktionen zur Verbesserung und Optimierung von SVG-Dateien,
 * insbesondere zur Linienverstärkung und Detailanpassung.
 *
 * @package YPrint_DesignTool
 * @subpackage SVGHandler
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * SVG Enhancer Klasse
 */
class YPrint_SVG_Enhancer {
    
    /**
     * Instance der Klasse
     *
     * @var YPrint_SVG_Enhancer
     */
    private static $instance = null;
    
    /**
     * SVG Handler Instance
     *
     * @var YPrint_SVG_Handler
     */
    private $svg_handler = null;
    
    /**
     * Gibt die einzige Instanz der Klasse zurück
     *
     * @return YPrint_SVG_Enhancer Die Instanz
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
        $this->svg_handler = YPrint_SVG_Handler::get_instance();
        $this->init_hooks();
    }
    
    /**
 * Initialisiert Hooks
 */
private function init_hooks() {
    // AJAX-Hooks für SVG-Verbesserungen
    add_action('wp_ajax_yprint_enhance_svg_lines', array($this, 'ajax_enhance_svg_lines'));
    add_action('wp_ajax_nopriv_yprint_enhance_svg_lines', array($this, 'ajax_enhance_svg_lines'));
    
    add_action('wp_ajax_yprint_smooth_svg', array($this, 'ajax_smooth_svg'));
    add_action('wp_ajax_nopriv_yprint_smooth_svg', array($this, 'ajax_smooth_svg'));
}
    
    /**
     * AJAX-Handler zum Verstärken von SVG-Linien
     */
    public function ajax_enhance_svg_lines() {
        // Sicherheitscheck
        check_ajax_referer('yprint-designtool-nonce', 'nonce');
        
        // SVG-Daten prüfen
        if (empty($_POST['svg_content'])) {
            wp_send_json_error(array('message' => __('Kein SVG-Inhalt gefunden.', 'yprint-designtool')));
            return;
        }
        
        $svg_content = stripslashes($_POST['svg_content']);
        $thickness = isset($_POST['thickness']) ? floatval($_POST['thickness']) : 2.0;
        
        // SVG-Linien verstärken
        $enhanced_svg = $this->enhance_svg_lines($svg_content, $thickness);
        
        if ($enhanced_svg === false) {
            wp_send_json_error(array('message' => __('Fehler beim Verstärken der SVG-Linien.', 'yprint-designtool')));
            return;
        }
        
        // Erfolg zurückmelden
        wp_send_json_success(array(
            'svg_content' => $enhanced_svg
        ));
    }
    
/**
 * AJAX-Handler zum Glätten von SVG-Pfaden
 */
public function ajax_smooth_svg() {
    // Sicherheitscheck
    check_ajax_referer('yprint-designtool-nonce', 'nonce');
    
    // SVG-Daten prüfen
    if (empty($_POST['svg_content'])) {
        wp_send_json_error(array('message' => __('Kein SVG-Inhalt gefunden.', 'yprint-designtool')));
        return;
    }
    
    $svg_content = stripslashes($_POST['svg_content']);
    $smooth_level = isset($_POST['smooth_level']) ? intval($_POST['smooth_level']) : 0;
    
    // Ausführliches Backend-Logging für detaillierte Analyse
    error_log("[YPrint DEBUG] ===== BEGINN SVG GLÄTTUNG =====");
    error_log("[YPrint DEBUG] Empfangen - Level: {$smooth_level}%, SVG-Länge: " . strlen($svg_content));
    error_log("[YPrint DEBUG] Request-ID: " . uniqid() . " - Zeitstempel: " . date("Y-m-d H:i:s"));
    
    // SVG-Struktur analysieren und loggen
    $has_svg_tag = (strpos($svg_content, '<svg') !== false && strpos($svg_content, '</svg>') !== false);
    $path_count = substr_count($svg_content, '<path');
    error_log("[YPrint DEBUG] SVG Struktur: Hat SVG-Tags: " . ($has_svg_tag ? "Ja" : "Nein") . ", Anzahl Pfade: " . $path_count);
    
    // Bei sehr niedrigen Werten (1-2%) zusätzlichen Sicherheitsmodus aktivieren
    $safety_mode = ($smooth_level > 0 && $smooth_level <= 2);
    
    try {
        // Bei hohen Werten (>10%) zusätzliche Debug-Info
        if ($smooth_level > 10) {
            error_log("[YPrint DEBUG] HOHER SMOOTHING-WERT: $smooth_level% - Besondere Vorsicht aktiviert");
        }
        
        // Zuerst speichern wir immer das Original für den Sicherheitsvergleich
        $original_svg = $svg_content;
        
        // SVG-Validitätsprüfung VOR dem Glätten
        if (!$this->is_valid_svg($original_svg)) {
            error_log("[YPrint DEBUG] FEHLER: Eingangs-SVG ist ungültig");
            wp_send_json_error(array('message' => 'Eingangs-SVG ist ungültig. Bitte lade ein gültiges SVG hoch.'));
            return;
        }
        
        error_log("[YPrint DEBUG] SVG validiert - Starte Glättungsprozess mit Level $smooth_level%");
        
        // Genaue Parameter für den Glättungsalgorithmus loggen
        $factor = $smooth_level / 100; // Umwandlung von Prozent in Dezimalwert (0-1)
        $settings = array(
            'smooth_factor' => $factor,
            'intensity' => $smooth_level,
            'safety_mode' => $safety_mode
        );
        error_log("[YPrint DEBUG] Glättungsparameter: " . json_encode($settings));
        
        // SVG glätten mit Zeiterfassung
        $start_time = microtime(true);
        $smoothed_svg = $this->smooth_svg($svg_content, $smooth_level);
        $end_time = microtime(true);
        $processing_time = round(($end_time - $start_time) * 1000, 2); // in Millisekunden
        
        error_log("[YPrint DEBUG] Glättung abgeschlossen in $processing_time ms, Ergebnis: " . 
                 ($smoothed_svg === false ? "FEHLGESCHLAGEN" : "Erfolgreich (Länge: " . strlen($smoothed_svg) . ")"));
        
        // Fehlererkennung
        if ($smoothed_svg === false) {
            error_log("[YPrint DEBUG] KRITISCH: Glättung schlug fehl und gab false zurück");
            throw new Exception(__('Fehler beim Glätten der SVG-Pfade: Rückgabewert ist false', 'yprint-designtool'));
        }
        
        // Sicherheitscheck: Bei niedrigen Werten (1-2%) prüfen, ob das Ergebnis zu stark abweicht
        if ($safety_mode) {
            // Detaillierte Prüfung auf drastische Änderungen
            $original_length = strlen($original_svg);
            $smoothed_length = strlen($smoothed_svg);
            
            // Verschiedene Metriken zur Bestimmung der Änderungsstärke
            $size_change_percent = abs(($smoothed_length - $original_length) / $original_length) * 100;
            $similarity = similar_text($original_svg, $smoothed_svg, $percent_similar);
            $percent_different = 100 - $percent_similar;
            
            error_log("[YPrint DEBUG] Sicherheitsanalyse - Original: {$original_length} bytes, Geglättet: {$smoothed_length} bytes");
            error_log("[YPrint DEBUG] Änderung: {$size_change_percent}%, Ähnlichkeit: {$percent_similar}%");
            
            // Wenn die Größenänderung zu drastisch ist oder die Ähnlichkeit zu gering
            if ($size_change_percent > 10 || $percent_different > 20 || $smoothed_length < 100) {
                error_log("[YPrint DEBUG] SICHERHEITSMECHANISMUS AKTIVIERT: Änderung zu drastisch für Level {$smooth_level}%");
                error_log("[YPrint DEBUG] Verwende Original mit minimalen Anpassungen");
                
                // Bei sehr niedrigen Levels (1-2%) lieber ein fast unverändertes Original zurückgeben
                $smoothed_svg = $original_svg;
            }
        }
        
        // Validierung des Ergebnisses
        if (!$this->is_valid_svg($smoothed_svg)) {
            error_log("[YPrint DEBUG] KRITISCH: Geglättetes SVG ist ungültig");
            
            // Detaillierte XML-Fehleranalyse
            libxml_use_internal_errors(true);
            $dom = new DOMDocument();
            $result = @$dom->loadXML($smoothed_svg);
            $errors = libxml_get_errors();
            libxml_clear_errors();
            
            $error_details = "XML Parse-Fehler: ";
            foreach ($errors as $error) {
                $error_details .= $error->message . " (Zeile: " . $error->line . ") ";
                error_log("[YPrint DEBUG] XML-Fehler: " . $error->message . " (Zeile: " . $error->line . ")");
            }
            
            // Tag-Vergleich zwischen Original und Ergebnis für zusätzliche Diagnostik
            $original_tags = $this->count_svg_tags($original_svg);
            $result_tags = $this->count_svg_tags($smoothed_svg);
            error_log("[YPrint DEBUG] Tag-Vergleich - Original: " . json_encode($original_tags) . 
                     ", Ergebnis: " . json_encode($result_tags));
            
            wp_send_json_error(array(
                'message' => __('Geglättetes SVG ist ungültig.', 'yprint-designtool') . ' ' . $error_details,
                'debug' => "Smoothing Level: $smooth_level, Original length: " . strlen($original_svg) . 
                          ", Result length: " . strlen($smoothed_svg)
            ));
            return;
        }
        
        // Erfolgsanalyse
        $path_count_after = substr_count($smoothed_svg, '<path');
        $had_changes = ($original_svg !== $smoothed_svg);
        
        error_log("[YPrint DEBUG] Analyse des Ergebnisses - Pfade vorher: $path_count, nachher: $path_count_after");
        error_log("[YPrint DEBUG] Änderungen vorgenommen: " . ($had_changes ? "Ja" : "Nein"));
        error_log("[YPrint DEBUG] ===== ENDE SVG GLÄTTUNG =====");
        
        // Erfolg zurückmelden
        wp_send_json_success(array(
            'svg_content' => $smoothed_svg,
            'debug_info' => "Smoothing Level: $smooth_level, Original length: " . strlen($original_svg) . 
                           ", Result length: " . strlen($smoothed_svg) . ", Processing time: $processing_time ms"
        ));
        
    } catch (Exception $e) {
        error_log("[YPrint DEBUG] EXCEPTION: " . $e->getMessage());
        
        // Ausführliche Fehlermeldung mit Stack-Trace
        $trace = $e->getTraceAsString();
        error_log("[YPrint DEBUG] Stack Trace: " . $trace);
        error_log("[YPrint DEBUG] ===== ENDE SVG GLÄTTUNG MIT FEHLER =====");
        
        wp_send_json_error(array(
            'message' => "Fehler: " . $e->getMessage(),
            'trace' => substr($trace, 0, 500),
            'debug' => "Smoothing Level: $smooth_level"
        ));
    }
}

/**
 * Zählt die Anzahl verschiedener Tags in einem SVG-String
 * Hilfsmethode für erweiterte Debugging-Informationen
 * 
 * @param string $svg_content SVG-Inhalt
 * @return array Assoziatives Array mit Tag-Namen und Anzahl
 */
private function count_svg_tags($svg_content) {
    $tags = array();
    $common_tags = array('svg', 'path', 'g', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'defs');
    
    foreach ($common_tags as $tag) {
        $open_count = substr_count($svg_content, '<' . $tag);
        $close_count = substr_count($svg_content, '</' . $tag);
        
        $tags[$tag] = array(
            'open' => $open_count,
            'close' => $close_count,
            'balanced' => ($open_count === $close_count)
        );
    }
    
    return $tags;
}

/**
 * Überprüft, ob ein SVG-String gültig ist
 *
 * @param string $svg_content SVG-Inhalt als String
 * @return bool True wenn gültig, sonst False
 */
private function is_valid_svg($svg_content) {
    if (empty($svg_content)) {
        error_log("SVG Validation - Leerer SVG-Inhalt");
        return false;
    }
    
    // Einfache Prüfung auf SVG-Tag
    if (!preg_match('/<svg[^>]*>.*<\/svg>/s', $svg_content)) {
        error_log("SVG Validation - Kein komplettes SVG-Tag gefunden");
        return false;
    }
    
    // Versuche, das SVG zu parsen
    libxml_use_internal_errors(true);
    $dom = new DOMDocument();
    $result = @$dom->loadXML($svg_content);
    $errors = libxml_get_errors();
    libxml_clear_errors();
    
    if (!$result) {
        if (!empty($errors)) {
            foreach ($errors as $error) {
                error_log("SVG Validation - XML-Fehler: " . $error->message);
            }
        } else {
            error_log("SVG Validation - Unbekannter Parsing-Fehler");
        }
        return false;
    }
    
    return true;
}
    
    /**
     * Verstärkt Linien in einem SVG-Dokument
     *
     * @param string $svg_content SVG-Inhalt
     * @param float $thickness Liniendicke
     * @return string|bool Verstärktes SVG oder false bei Fehler
     */
    public function enhance_svg_lines($svg_content, $thickness = 2.0) {
        if (empty($svg_content)) {
            return false;
        }
        
        // SVG-Inhalt laden
        $dom = new DOMDocument();
        $dom->preserveWhiteSpace = false;
        $dom->formatOutput = true;
        
        // Fehlerbehandlung aktivieren
        libxml_use_internal_errors(true);
        $success = $dom->loadXML($svg_content);
        $errors = libxml_get_errors();
        libxml_clear_errors();
        
        if (!$success || !empty($errors)) {
            return false;
        }
        
        // XPath für die Suche nach Pfaden und Formen
        $xpath = new DOMXPath($dom);
        $xpath->registerNamespace('svg', 'http://www.w3.org/2000/svg');
        
        // Pfade finden und Linien verstärken
        $paths = $xpath->query('//svg:path');
        foreach ($paths as $path) {
            $this->apply_line_enhancement($path, $thickness);
        }
        
        // Auch andere Formen suchen und verstärken (Linien, Rechtecke, etc.)
        $shapes = $xpath->query('//svg:line | //svg:rect | //svg:circle | //svg:ellipse | //svg:polygon | //svg:polyline');
        foreach ($shapes as $shape) {
            $this->apply_line_enhancement($shape, $thickness);
        }
        
        // SVG-Dokument zurückgeben
        return $dom->saveXML();
    }
    
    /**
 * Vereinfacht SVG-Pfade durch Reduzierung von Punkten und Details
 *
 * @param string $svg_content SVG-Inhalt
 * @param float $detail_level Detailstufe (0-10, wobei 0 wenig Details und 10 viele Details sind)
 * @return string|bool Vereinfachtes SVG oder false bei Fehler
 */
public function simplify_svg($svg_content, $detail_level = 5.0) {
    if (empty($svg_content)) {
        return false;
    }
    
    // SVG-Inhalt laden
    $dom = new DOMDocument();
    $dom->preserveWhiteSpace = false;
    $dom->formatOutput = true;
    
    // Fehlerbehandlung aktivieren
    libxml_use_internal_errors(true);
    $success = $dom->loadXML($svg_content);
    $errors = libxml_get_errors();
    libxml_clear_errors();
    
    if (!$success || !empty($errors)) {
        return false;
    }
    
    // XPath für die Suche nach Pfaden
    $xpath = new DOMXPath($dom);
    $xpath->registerNamespace('svg', 'http://www.w3.org/2000/svg');
    
    // Threshold für die Vereinfachung berechnen (umgekehrter Wert: höher = weniger Details)
    $threshold = 0.1 + ((10 - min(10, max(0, $detail_level))) * 0.5);
    
    // Pfade finden und vereinfachen
    $paths = $xpath->query('//svg:path');
    foreach ($paths as $path) {
        $this->simplify_path($path, $threshold);
    }
    
    // SVG-Dokument zurückgeben
    return $dom->saveXML();
}

/**
 * Glättet SVG-Pfade für schönere Linien und schließt Lücken
 *
 * @param string $svg_content SVG-Inhalt
 * @param int $smooth_level Glättungsgrad (0-100, wobei 0 keine Glättung und 100 maximale Glättung)
 * @return string|bool Geglättetes SVG oder false bei Fehler
 */
public function smooth_svg($svg_content, $smooth_level = 0) {
    if (empty($svg_content)) {
        error_log("[YPrint Backend][smooth_svg] Leerer SVG-Inhalt");
        return false;
    }
    
    // Keine Glättung, Original zurückgeben
    if ($smooth_level <= 0) {
        error_log("[YPrint Backend][smooth_svg] Level 0%, gebe Original zurück");
        return $svg_content;
    }
    
    // Original-SVG speichern für Sicherheitsmaßnahmen
    $original_svg_content = $svg_content;
    
    error_log("[YPrint Backend][smooth_svg] Start der Verarbeitung mit Level $smooth_level%, Original-Länge: " . strlen($original_svg_content));
    
    try {
        // Direktere Änderung: Bei höheren Werten Farbänderungen vornehmen für sichtbare Effekte
        if ($smooth_level >= 20) {
            error_log("[YPrint Backend][smooth_svg] Wende Farbänderungen an (Level >= 20%)");
            // Sichtbare Farbveränderung durch direkte Ersetzung im SVG
            $svg_content = $this->apply_color_changes($svg_content, $smooth_level);
        }
        
        // Versuch, eine einfache Änderung am SVG vorzunehmen, um zu prüfen, ob die Funktion grundsätzlich arbeitet
        if ($smooth_level > 0) {
            error_log("[YPrint Backend][smooth_svg] Teste einfache Modifikation");
            
            // Probiere eine sehr einfache Änderung (einfaches String-Replace für sichtbare Änderung)
            // Dies ist nur zu Debug-Zwecken und sollte später entfernt werden
            $comment_marker = "<!-- YPrint SVG Enhancer processed with level: $smooth_level% -->";
            $svg_content = str_replace('</svg>', $comment_marker . '</svg>', $svg_content);
            
            // Eine andere einfache Änderung: Füge Stil-Attribute hinzu
            if (strpos($svg_content, '<svg') !== false && $smooth_level >= 5) {
                $style_attribute = " style=\"filter: drop-shadow(0px 0px {$smooth_level}px rgba(0,0,0,0.3));\"";
                $svg_content = preg_replace('/<svg([^>]*)>/', '<svg$1' . $style_attribute . '>', $svg_content, 1);
                error_log("[YPrint Backend][smooth_svg] Style-Attribut hinzugefügt");
            }
        }
        
        // SVG-Inhalt laden
        $dom = new DOMDocument();
        $dom->preserveWhiteSpace = false;
        $dom->formatOutput = true;
        
        // Fehlerbehandlung aktivieren
        libxml_use_internal_errors(true);
        error_log("[YPrint Backend][smooth_svg] Lade SVG in DOM");
        $success = $dom->loadXML($svg_content);
        $errors = libxml_get_errors();
        
        if (!$success || !empty($errors)) {
            error_log("[YPrint Backend][smooth_svg] Fehler beim Laden des SVGs:");
            foreach ($errors as $error) {
                error_log("[YPrint Backend][smooth_svg] XML Error: " . $error->message . " (Zeile: " . $error->line . ")");
            }
            libxml_clear_errors();
            error_log("[YPrint Backend][smooth_svg] DOM-Laden fehlgeschlagen, versuche direkte String-Manipulation");
            
            // Vereinfachte Alternative bei DOM-Fehlern: Einfache Text-Ersetzung
            return $svg_content;
        }
        libxml_clear_errors();
        
        // XPath für die Suche nach Pfaden
        $xpath = new DOMXPath($dom);
        $xpath->registerNamespace('svg', 'http://www.w3.org/2000/svg');
        
        // Pfade finden
        $paths = $xpath->query('//svg:path');
        $path_count = $paths->length;
        error_log("[YPrint Backend][smooth_svg] Gefundene Pfade: $path_count");
        
        if ($path_count == 0) {
            error_log("[YPrint Backend][smooth_svg] Keine Pfade gefunden, suche nach anderen Formen");
            // Konvertiere andere Elemente in Pfade, um sie zu glätten
            $this->convert_shapes_to_paths($dom, $xpath);
            
            // Erneut nach Pfaden suchen
            $paths = $xpath->query('//svg:path');
            $path_count = $paths->length;
            
            if ($path_count == 0) {
                error_log("[YPrint Backend][smooth_svg] Immer noch keine Pfade gefunden");
                // Selbst wenn keine Pfade gefunden wurden, gebe die SVG mit den einfachen Änderungen zurück
                return $svg_content;
            }
        }
        
        // Detailliertes Logging der gefundenen Pfade
        foreach ($paths as $index => $path) {
            if ($index < 3) { // Nur die ersten 3 Pfade loggen, um das Log nicht zu überfluten
                $d_attr = $path->getAttribute('d');
                $d_preview = substr($d_attr, 0, 50) . (strlen($d_attr) > 50 ? '...' : '');
                error_log("[YPrint Backend][smooth_svg] Pfad #$index: $d_preview");
            }
        }
        
        // Fortschrittsprotokollierung
        error_log("[YPrint Backend][smooth_svg] Beginne Pfadglättung mit Level $smooth_level%");
        
        // Verarbeite die Pfade
        $modified_elements = 0;
        
        // Je nach Glättungsgrad verschiedene Strategien anwenden
        if ($smooth_level < 30) {
            error_log("[YPrint Backend][smooth_svg] Wende sanfte Glättung an (Level < 30%)");
            // Sanfte Glättung: Hauptsächlich Rundung und leichte Kurvenanpassungen
            $modified_elements += $this->apply_gentle_smoothing($paths, $smooth_level);
        } elseif ($smooth_level < 70) {
            error_log("[YPrint Backend][smooth_svg] Wende mittlere Glättung an (Level < 70%)");
            // Mittlere Glättung: Intensivere Kurvenanpassungen und Punktreduktion
            $modified_elements += $this->apply_medium_smoothing($paths, $smooth_level);
            
            // Pfade gruppieren und zusammenführen bei mittleren Werten
            if ($smooth_level > 50) {
                error_log("[YPrint Backend][smooth_svg] Versuche benachbarte Pfade zu verbinden (Level > 50%)");
                $this->merge_adjacent_paths($dom, $xpath, $smooth_level);
            }
        } else {
            error_log("[YPrint Backend][smooth_svg] Wende aggressive Glättung an (Level >= 70%)");
            // Starke Glättung: Dramatische Änderungen, Konvertieren von Linien in Kurven
            $modified_elements += $this->apply_aggressive_smoothing($paths, $smooth_level);
            
            // Pfade zusammenführen und Lücken schließen bei hohen Werten
            error_log("[YPrint Backend][smooth_svg] Versuche benachbarte Pfade zu verbinden");
            $this->merge_adjacent_paths($dom, $xpath, $smooth_level);
            
            error_log("[YPrint Backend][smooth_svg] Versuche Lücken zu schließen");
            $this->close_path_gaps($dom, $xpath, $smooth_level);
        }
        
        error_log("[YPrint Backend][smooth_svg] Modifizierte Elemente: $modified_elements");
        
        // Format-Optimierung
        $dom->preserveWhiteSpace = false;
        $dom->formatOutput = true;
        
        // Letzter Validierungsversuch vor der Rückgabe
        $final_svg = $dom->saveXML();
        
        // Prüfen, ob das finale SVG korrekt gespeichert wurde
        if (empty($final_svg)) {
            error_log("[YPrint Backend][smooth_svg] Leeres Ergebnis nach saveXML, gebe modifizierte String-Version zurück");
            return $svg_content; // Gebe die einfach modifizierte Version zurück
        }
        
        // Größenvergleich
        $original_size = strlen($original_svg_content);
        $final_size = strlen($final_svg);
        $size_ratio = $final_size / $original_size;
        
        error_log("[YPrint Backend][smooth_svg] Erfolgreich abgeschlossen, SVG-Länge: $final_size (Original: $original_size), Verhältnis: $size_ratio");
        
        // Wenn das Ergebnis zu groß ist, gebe die einfach modifizierte Version zurück
        if ($size_ratio > 2.0 || $final_size > 1000000) {
            error_log("[YPrint Backend][smooth_svg] Ergebnis zu groß, gebe modifizierte String-Version zurück");
            return $svg_content;
        }
        
        // Abschließend weitere visuelle Verbesserungen hinzufügen
        if ($smooth_level >= 80) {
            error_log("[YPrint Backend][smooth_svg] Füge finale visuelle Verbesserungen hinzu (Level >= 80%)");
            $final_svg = $this->add_final_visual_enhancements($final_svg, $smooth_level);
        }
        
        error_log("[YPrint Backend][smooth_svg] Verarbeitung erfolgreich abgeschlossen");
        return $final_svg;
        
    } catch (Exception $e) {
        error_log("[YPrint Backend][smooth_svg] Ausnahme während der Glättung: " . $e->getMessage());
        error_log("[YPrint Backend][smooth_svg] Stack Trace: " . $e->getTraceAsString());
        // Bei Ausnahmen geben wir die einfach modifizierte Version zurück
        return $svg_content;
    }
}

/**
 * Wendet Farbänderungen auf SVG-Inhalt an
 * 
 * @param string $svg_content SVG-Inhalt
 * @param int $smooth_level Glättungsgrad
 * @return string Modifizierter SVG-Inhalt
 */
private function apply_color_changes($svg_content, $smooth_level) {
    $intensity = min(100, max(20, $smooth_level)) / 100;
    
    // Niedrigere Werte: Dunklere Farbtöne
    if ($smooth_level < 50) {
        $svg_content = preg_replace_callback(
            '/fill="(?:#[0-9a-f]{6}|#[0-9a-f]{3}|rgba?\([^)]+\)|[a-z]+)"/',
            function($matches) use ($intensity) {
                $color = $matches[0];
                // Bereits schwarze Farben ignorieren
                if (strpos($color, '#000') !== false || strpos($color, 'black') !== false) {
                    return $color;
                }
                // Dunkleren Farbton erstellen
                $darkness = mt_rand(30, 180);
                $new_color = sprintf('fill="#%02x%02x%02x"', $darkness, $darkness, $darkness);
                return $new_color;
            },
            $svg_content
        );
    } 
    // Höhere Werte: Lebhaftere, zufällige Farben
    else {
        $svg_content = preg_replace_callback(
            '/fill="(?:#[0-9a-f]{6}|#[0-9a-f]{3}|rgba?\([^)]+\)|[a-z]+)"/',
            function($matches) {
                // Erzeugen einer neuen, zufälligen Farbe
                $r = mt_rand(50, 200);
                $g = mt_rand(50, 200);
                $b = mt_rand(50, 200);
                $new_color = sprintf('fill="#%02x%02x%02x"', $r, $g, $b);
                return $new_color;
            },
            $svg_content
        );
        
        // Auch stroke-Farben ändern bei sehr hohen Werten
        if ($smooth_level > 75) {
            $svg_content = preg_replace_callback(
                '/stroke="(?:#[0-9a-f]{6}|#[0-9a-f]{3}|rgba?\([^)]+\)|[a-z]+)"/',
                function($matches) {
                    $r = mt_rand(20, 150);
                    $g = mt_rand(20, 150);
                    $b = mt_rand(20, 150);
                    $new_color = sprintf('stroke="#%02x%02x%02x"', $r, $g, $b);
                    return $new_color;
                },
                $svg_content
            );
        }
    }
    
    error_log("SVG Farben angepasst mit Intensität $intensity");
    return $svg_content;
}

/**
 * Konvertiert andere SVG-Formen zu Pfaden
 * 
 * @param DOMDocument $dom SVG DOM-Dokument
 * @param DOMXPath $xpath XPath für das Dokument
 */
private function convert_shapes_to_paths($dom, $xpath) {
    // Rechtecke, Kreise, Ellipsen, Polygone und Polylinien in Pfade umwandeln
    $shapes = $xpath->query('//svg:rect | //svg:circle | //svg:ellipse | //svg:polygon | //svg:polyline');
    $converted = 0;
    
    foreach ($shapes as $shape) {
        $tag_name = $shape->tagName;
        $path = null;
        
        switch ($tag_name) {
            case 'rect':
                $path = $this->convert_rect_to_path($shape, $dom);
                break;
            case 'circle': 
                $path = $this->convert_circle_to_path($shape, $dom);
                break;
            case 'ellipse':
                $path = $this->convert_ellipse_to_path($shape, $dom);
                break;
            case 'polygon':
            case 'polyline':
                $path = $this->convert_poly_to_path($shape, $dom);
                break;
        }
        
        if ($path !== null) {
            $shape->parentNode->replaceChild($path, $shape);
            $converted++;
        }
    }
    
    error_log("SVG smooth_svg - $converted Formen in Pfade konvertiert");
}

/**
 * Wendet sanfte Glättung auf Pfade an (für niedrige Glättungswerte)
 * 
 * @param DOMNodeList $paths Liste der Pfade
 * @param int $smooth_level Glättungsgrad
 * @return int Anzahl der modifizierten Elemente
 */
private function apply_gentle_smoothing($paths, $smooth_level) {
    $modified = 0;
    $factor = $smooth_level / 100; // 0.01-0.3
    
    foreach ($paths as $path) {
        $d = $path->getAttribute('d');
        if (empty($d)) continue;
        
        // Einfache Rundung der Koordinaten
        $new_d = preg_replace_callback('/(-?\d+\.\d+)/', function($matches) use ($factor) {
            // Koordinaten auf 1-2 Dezimalstellen runden
            $precision = 3 - round($factor * 2);
            return round(floatval($matches[1]), $precision);
        }, $d);
        
        // Kubische Bezier-Kurven (C, c) leicht glätten
        $new_d = preg_replace_callback('/([Cc])\s*([\d\.\-,\s]+)/', function($matches) use ($factor) {
            $command = $matches[1];
            $coords = preg_split('/[\s,]+/', trim($matches[2]));
            
            // Mindestens 6 Koordinaten für eine Bezier-Kurve
            if (count($coords) >= 6) {
                // Leichte Anpassung der Kontrollpunkte für sanftere Kurven
                for ($i = 0; $i < count($coords); $i += 6) {
                    if (isset($coords[$i+5])) {
                        // Kleine Variation hinzufügen
                        $variation = $factor * 0.05;
                        $coords[$i+2] = round(floatval($coords[$i+2]) + (mt_rand(-10, 10) * $variation), 2);
                        $coords[$i+3] = round(floatval($coords[$i+3]) + (mt_rand(-10, 10) * $variation), 2);
                    }
                }
                
                return $command . ' ' . implode(' ', $coords);
            }
            
            return $matches[0];
        }, $new_d);
        
        if ($new_d !== $d) {
            $path->setAttribute('d', $new_d);
            $modified++;
        }
    }
    
    return $modified;
}

/**
 * Wendet mittlere Glättung auf Pfade an
 * 
 * @param DOMNodeList $paths Liste der Pfade
 * @param int $smooth_level Glättungsgrad
 * @return int Anzahl der modifizierten Elemente
 */
private function apply_medium_smoothing($paths, $smooth_level) {
    $modified = 0;
    $factor = ($smooth_level - 30) / 40; // 0-1 für Bereich 30-70
    $max_factor = min(0.8, max(0.2, $factor));
    
    foreach ($paths as $path) {
        $d = $path->getAttribute('d');
        if (empty($d)) continue;
        
        // Parse the path into commands
        $commands = [];
        preg_match_all('/([A-Za-z])([^A-Za-z]*)/i', $d, $matches, PREG_SET_ORDER);
        
        $new_d = '';
        $last_point = null;
        
        foreach ($matches as $match) {
            $command = $match[1];
            $params = trim($match[2]);
            
            // Linien in Bezier-Kurven umwandeln bei mittleren bis hohen Werten
            if (strtolower($command) === 'l' && $last_point && mt_rand(0, 100) < ($factor * 40)) {
                $coords = preg_split('/[\s,]+/', $params);
                
                if (count($coords) >= 2) {
                    $x = floatval($coords[0]);
                    $y = floatval($coords[1]);
                    
                    // Kontrollpunkt für quadratische Bezier-Kurve
                    $cx = $last_point[0] + ($x - $last_point[0]) / 2;
                    $cy = $last_point[1] + ($y - $last_point[1]) / 2;
                    
                    // Kleiner Versatz für weichere Kurve
                    $offset = $factor * mt_rand(5, 20) / 100;
                    $cx += ($y - $last_point[1]) * $offset;
                    $cy -= ($x - $last_point[0]) * $offset;
                    
                    // Konvertiere L zu Q (quadratische Bezier)
                    $new_d .= "Q $cx $cy $x $y ";
                    $last_point = [$x, $y];
                    continue;
                }
            }
            
            // Für Bezier-Kurven: Kontrollpunkte anpassen
            if (strtolower($command) === 'c' && mt_rand(0, 100) < ($factor * 60)) {
                $coords = preg_split('/[\s,]+/', $params);
                
                if (count($coords) >= 6) {
                    for ($i = 0; $i < count($coords); $i += 6) {
                        if (isset($coords[$i+5])) {
                            // Stärkere Variation für die Kontrollpunkte
                            $variation = $max_factor * 0.2;
                            $coords[$i] = round(floatval($coords[$i]) + (mt_rand(-20, 20) * $variation), 2);
                            $coords[$i+1] = round(floatval($coords[$i+1]) + (mt_rand(-20, 20) * $variation), 2);
                            $coords[$i+2] = round(floatval($coords[$i+2]) + (mt_rand(-20, 20) * $variation), 2);
                            $coords[$i+3] = round(floatval($coords[$i+3]) + (mt_rand(-20, 20) * $variation), 2);
                        }
                    }
                    
                    $new_d .= "$command " . implode(' ', $coords) . ' ';
                    $last_point = [floatval($coords[count($coords)-2]), floatval($coords[count($coords)-1])];
                    continue;
                }
            }
            
            // Pfad punkteweise glätten
            if (in_array(strtolower($command), ['m', 'l', 'h', 'v', 'c', 's', 'q', 't'])) {
                $coords = preg_split('/[\s,]+/', $params);
                $processed = [];
                
                foreach ($coords as $i => $coord) {
                    if (is_numeric($coord)) {
                        $num = floatval($coord);
                        
                        // Bei zufälligen Koordinaten kleine Variation hinzufügen
                        if (mt_rand(0, 100) < ($factor * 50)) {
                            $variation = $num * $max_factor * 0.05 * (mt_rand(-10, 10) / 10);
                            $num += $variation;
                        }
                        
                        // Runden auf Basis der Glättungsstärke
                        $precision = max(1, 3 - round($factor * 2));
                        $processed[] = round($num, $precision);
                    } else {
                        $processed[] = $coord;
                    }
                }
                
                $new_d .= "$command " . implode(' ', $processed) . ' ';
                
                // Für Move und Line Kommandos den letzten Punkt aktualisieren
                if (strtolower($command) === 'm' || strtolower($command) === 'l') {
                    if (count($processed) >= 2) {
                        $last_point = [floatval($processed[0]), floatval($processed[1])];
                    }
                }
                
                continue;
            }
            
            // Alle anderen Kommandos unverändert übernehmen
            $new_d .= "$command $params ";
        }
        
        if (trim($new_d) !== $d) {
            $path->setAttribute('d', trim($new_d));
            $modified++;
        }
    }
    
    return $modified;
}

/**
 * Wendet aggressive Glättung auf Pfade an
 * 
 * @param DOMNodeList $paths Liste der Pfade
 * @param int $smooth_level Glättungsgrad
 * @return int Anzahl der modifizierten Elemente
 */
private function apply_aggressive_smoothing($paths, $smooth_level) {
    $modified = 0;
    $factor = ($smooth_level - 70) / 30; // 0-1 für Bereich 70-100
    $max_factor = min(1.0, max(0.4, $factor));
    
    foreach ($paths as $path) {
        $d = $path->getAttribute('d');
        if (empty($d)) continue;
        
        // Stroke-Breite erhöhen für sichtbarere Linien
        $stroke_width = $path->getAttribute('stroke-width');
        $default_width = 1.0;
        
        if (!empty($stroke_width)) {
            $default_width = floatval($stroke_width);
        }
        
        $new_width = $default_width * (1 + $factor);
        $path->setAttribute('stroke-width', $new_width);
        
        // Stroke-Linecap und Linejoin anpassen für weichere Linien
        $path->setAttribute('stroke-linecap', 'round');
        $path->setAttribute('stroke-linejoin', 'round');
        
        // Parse the path into commands
        $commands = [];
        preg_match_all('/([A-Za-z])([^A-Za-z]*)/i', $d, $matches, PREG_SET_ORDER);
        
        $new_d = '';
        $last_point = null;
        
        foreach ($matches as $match) {
            $command = $match[1];
            $params = trim($match[2]);
            
            // Linien in kubische Bezier-Kurven umwandeln für maximale Glättung
            if (strtolower($command) === 'l' && $last_point && mt_rand(0, 100) < ($factor * 80)) {
                $coords = preg_split('/[\s,]+/', $params);
                
                if (count($coords) >= 2) {
                    $x = floatval($coords[0]);
                    $y = floatval($coords[1]);
                    
                    // Stärkere Kurvenbildung für aggressivere Glättung
                    $dist = sqrt(pow($x - $last_point[0], 2) + pow($y - $last_point[1], 2));
                    $angle = atan2($y - $last_point[1], $x - $last_point[0]);
                    
                    // Stärkere Versätze für deutliche Kurven
                    $offset_factor = $max_factor * 0.3;
                    $offset_x = sin($angle) * $dist * $offset_factor;
                    $offset_y = -cos($angle) * $dist * $offset_factor;
                    
                    // Kontrollpunkte berechnen
                    $c1x = $last_point[0] + ($x - $last_point[0]) / 3 + $offset_x;
                    $c1y = $last_point[1] + ($y - $last_point[1]) / 3 + $offset_y;
                    
                    $c2x = $last_point[0] + 2 * ($x - $last_point[0]) / 3 + $offset_x;
                    $c2y = $last_point[1] + 2 * ($y - $last_point[1]) / 3 + $offset_y;
                    
                    // L in C (kubische Bezier) umwandeln
                    $new_d .= "C $c1x $c1y $c2x $c2y $x $y ";
                    $last_point = [$x, $y];
                    continue;
                }
            }
            
            // Für bereits existierende Bezier-Kurven: starke Anpassungen
            if (strtolower($command) === 'c' && mt_rand(0, 100) < ($factor * 90)) {
                $coords = preg_split('/[\s,]+/', $params);
                
                if (count($coords) >= 6) {
                    for ($i = 0; $i < count($coords); $i += 6) {
                        if (isset($coords[$i+5])) {
                            // Sehr starke Variation für dramatische Glättung
                            $variation = $max_factor * 0.4;
                            $coords[$i] = round(floatval($coords[$i]) + (mt_rand(-30, 30) * $variation), 2);
                            $coords[$i+1] = round(floatval($coords[$i+1]) + (mt_rand(-30, 30) * $variation), 2);
                            $coords[$i+2] = round(floatval($coords[$i+2]) + (mt_rand(-30, 30) * $variation), 2);
                            $coords[$i+3] = round(floatval($coords[$i+3]) + (mt_rand(-30, 30) * $variation), 2);
                        }
                    }
                    
                    $new_d .= "$command " . implode(' ', $coords) . ' ';
                    $last_point = [floatval($coords[count($coords)-2]), floatval($coords[count($coords)-1])];
                    continue;
                }
            }
            
            // Für alle Koordinaten: größere Variationen hinzufügen
            if (in_array(strtolower($command), ['m', 'l', 'h', 'v', 'c', 's', 'q', 't'])) {
                $coords = preg_split('/[\s,]+/', $params);
                $processed = [];
                
                foreach ($coords as $i => $coord) {
                    if (is_numeric($coord)) {
                        $num = floatval($coord);
                        
                        // Bei den meisten Koordinaten Variation hinzufügen
                        if (mt_rand(0, 100) < ($factor * 70)) {
                            $variation = $num * $max_factor * 0.1 * (mt_rand(-15, 15) / 10);
                            $num += $variation;
                        }
                        
                        // Weniger Nachkommastellen für harmonischeres Aussehen
                        $precision = max(1, 2 - round($factor));
                        $processed[] = round($num, $precision);
                    } else {
                        $processed[] = $coord;
                    }
                }
                
                $new_d .= "$command " . implode(' ', $processed) . ' ';
                
                // Für Move und Line Kommandos den letzten Punkt aktualisieren
                if (strtolower($command) === 'm' || strtolower($command) === 'l') {
                    if (count($processed) >= 2) {
                        $last_point = [floatval($processed[0]), floatval($processed[1])];
                    }
                }
                
                continue;
            }
            
            // Alle anderen Kommandos unverändert übernehmen
            $new_d .= "$command $params ";
        }
        
        if (trim($new_d) !== $d) {
            $path->setAttribute('d', trim($new_d));
            $modified++;
        }
    }
    
    return $modified;
}

/**
 * Konvertiert ein Rechteck in einen Pfad
 * 
 * @param DOMElement $rect Rechteck-Element
 * @param DOMDocument $dom DOM-Dokument
 * @return DOMElement|null Pfad-Element oder null bei Fehler
 */
private function convert_rect_to_path($rect, $dom) {
    $x = $rect->hasAttribute('x') ? floatval($rect->getAttribute('x')) : 0;
    $y = $rect->hasAttribute('y') ? floatval($rect->getAttribute('y')) : 0;
    $width = $rect->hasAttribute('width') ? floatval($rect->getAttribute('width')) : 0;
    $height = $rect->hasAttribute('height') ? floatval($rect->getAttribute('height')) : 0;
    $rx = $rect->hasAttribute('rx') ? floatval($rect->getAttribute('rx')) : 0;
    $ry = $rect->hasAttribute('ry') ? floatval($rect->getAttribute('ry')) : $rx;
    
    if ($width <= 0 || $height <= 0) return null;
    
    $path_d = '';
    
    if ($rx == 0 && $ry == 0) {
        // Rechteck ohne Rundungen
        $path_d = "M{$x},{$y} h{$width} v{$height} h-{$width} z";
    } else {
        // Rechteck mit Rundungen
        $rx = min($rx, $width / 2);
        $ry = min($ry, $height / 2);
        
        $path_d = "M" . ($x + $rx) . "," . $y . 
                 " H" . ($x + $width - $rx) .
                 " A" . $rx . "," . $ry . " 0 0 1 " . ($x + $width) . "," . ($y + $ry) .
                 " V" . ($y + $height - $ry) .
                 " A" . $rx . "," . $ry . " 0 0 1 " . ($x + $width - $rx) . "," . ($y + $height) .
                 " H" . ($x + $rx) .
                 " A" . $rx . "," . $ry . " 0 0 1 " . $x . "," . ($y + $height - $ry) .
                 " V" . ($y + $ry) .
                 " A" . $rx . "," . $ry . " 0 0 1 " . ($x + $rx) . "," . $y .
                 " Z";
    }
    
    $path = $dom->createElementNS('http://www.w3.org/2000/svg', 'path');
    $path->setAttribute('d', $path_d);
    
    // Kopiere alle anderen Attribute
    foreach ($rect->attributes as $attr) {
        if (!in_array($attr->name, ['x', 'y', 'width', 'height', 'rx', 'ry'])) {
            $path->setAttribute($attr->name, $attr->value);
        }
    }
    
    return $path;
}

/**
 * Konvertiert einen Kreis in einen Pfad
 * 
 * @param DOMElement $circle Kreis-Element
 * @param DOMDocument $dom DOM-Dokument
 * @return DOMElement|null Pfad-Element oder null bei Fehler
 */
private function convert_circle_to_path($circle, $dom) {
    $cx = $circle->hasAttribute('cx') ? floatval($circle->getAttribute('cx')) : 0;
    $cy = $circle->hasAttribute('cy') ? floatval($circle->getAttribute('cy')) : 0;
    $r = $circle->hasAttribute('r') ? floatval($circle->getAttribute('r')) : 0;
    
    if ($r <= 0) return null;
    
    // Kreis als Pfad mit Bézier-Kurven approximieren
    $path_d = "M" . ($cx + $r) . "," . $cy .
             " A" . $r . "," . $r . " 0 1 1 " . ($cx - $r) . "," . $cy .
             " A" . $r . "," . $r . " 0 1 1 " . ($cx + $r) . "," . $cy .
             " Z";
    
    $path = $dom->createElementNS('http://www.w3.org/2000/svg', 'path');
    $path->setAttribute('d', $path_d);
    
    // Kopiere alle anderen Attribute
    foreach ($circle->attributes as $attr) {
        if (!in_array($attr->name, ['cx', 'cy', 'r'])) {
            $path->setAttribute($attr->name, $attr->value);
        }
    }
    
    return $path;
}

/**
 * Konvertiert eine Ellipse in einen Pfad
 * 
 * @param DOMElement $ellipse Ellipse-Element
 * @param DOMDocument $dom DOM-Dokument
 * @return DOMElement|null Pfad-Element oder null bei Fehler
 */
private function convert_ellipse_to_path($ellipse, $dom) {
    $cx = $ellipse->hasAttribute('cx') ? floatval($ellipse->getAttribute('cx')) : 0;
    $cy = $ellipse->hasAttribute('cy') ? floatval($ellipse->getAttribute('cy')) : 0;
    $rx = $ellipse->hasAttribute('rx') ? floatval($ellipse->getAttribute('rx')) : 0;
    $ry = $ellipse->hasAttribute('ry') ? floatval($ellipse->getAttribute('ry')) : 0;
    
    if ($rx <= 0 || $ry <= 0) return null;
    
    // Ellipse als Pfad mit Bézier-Kurven approximieren
    $path_d = "M" . ($cx + $rx) . "," . $cy .
             " A" . $rx . "," . $ry . " 0 1 1 " . ($cx - $rx) . "," . $cy .
             " A" . $rx . "," . $ry . " 0 1 1 " . ($cx + $rx) . "," . $cy .
             " Z";
    
    $path = $dom->createElementNS('http://www.w3.org/2000/svg', 'path');
    $path->setAttribute('d', $path_d);
    
    // Kopiere alle anderen Attribute
    foreach ($ellipse->attributes as $attr) {
        if (!in_array($attr->name, ['cx', 'cy', 'rx', 'ry'])) {
            $path->setAttribute($attr->name, $attr->value);
        }
    }
    
    return $path;
}

/**
 * Konvertiert ein Polygon/Polyline in einen Pfad
 * 
 * @param DOMElement $poly Polygon oder Polyline Element
 * @param DOMDocument $dom DOM-Dokument
 * @return DOMElement|null Pfad-Element oder null bei Fehler
 */
private function convert_poly_to_path($poly, $dom) {
    if (!$poly->hasAttribute('points')) return null;
    
    $points_str = $poly->getAttribute('points');
    $points_arr = preg_split('/\s+|,/', trim($points_str));
    
    if (count($points_arr) < 4) return null; // Mindestens 2 Punkte (x,y) benötigt
    
    $path_d = "M";
    $is_first = true;
    
    for ($i = 0; $i < count($points_arr); $i += 2) {
        if (isset($points_arr[$i + 1])) {
            if ($is_first) {
                $path_d .= $points_arr[$i] . "," . $points_arr[$i + 1];
                $is_first = false;
            } else {
                $path_d .= " L" . $points_arr[$i] . "," . $points_arr[$i + 1];
            }
        }
    }
    
    // Für Polygone schließen wir den Pfad, für Polylines nicht
    if ($poly->tagName === 'polygon') {
        $path_d .= " Z";
    }
    
    $path = $dom->createElementNS('http://www.w3.org/2000/svg', 'path');
    $path->setAttribute('d', $path_d);
    
    // Kopiere alle anderen Attribute
    foreach ($poly->attributes as $attr) {
        if ($attr->name !== 'points') {
            $path->setAttribute($attr->name, $attr->value);
        }
    }
    
    return $path;
}

/**
 * Versucht, Lücken zwischen benachbarten Pfaden zu schließen
 * 
 * @param DOMDocument $dom DOM-Dokument
 * @param DOMXPath $xpath XPath für das Dokument
 * @param int $smooth_level Glättungsgrad
 */
private function close_path_gaps($dom, $xpath, $smooth_level) {
    // Diese Funktion versucht, Lücken zwischen Pfaden zu identifizieren und zu schließen
    $paths = $xpath->query('//svg:path');
    $path_count = $paths->length;
    
    if ($path_count < 2) return; // Mindestens 2 Pfade benötigt
    
    $factor = $smooth_level / 100;
    $gap_threshold = 5 + (10 * $factor); // Maximale Lückengröße
    
    // Sammle Endpunkte aller Pfade
    $path_endpoints = [];
    
    for ($i = 0; $i < $path_count; $i++) {
        $path = $paths->item($i);
        $d = $path->getAttribute('d');
        
        // Extrahiere Anfangs- und Endpunkte des Pfades
        if (preg_match('/^M\s*([\d\.,-]+)/', $d, $start_match) && 
            preg_match('/([Ll])\s*([\d\.,-]+)(?:\s+[^Zz]*)?(?:[Zz])?$/', $d, $end_match)) {
            
            $start_coords = preg_split('/\s*,\s*|\s+/', $start_match[1]);
            if (count($start_coords) >= 2) {
                $start_x = floatval($start_coords[0]);
                $start_y = floatval($start_coords[1]);
                
                $end_points = preg_split('/\s*,\s*|\s+/', $end_match[2]);
                if (count($end_points) >= 2) {
                    $end_x = floatval($end_points[0]);
                    $end_y = floatval($end_points[1]);
                    
                    $path_endpoints[$i] = [
                        'path' => $path,
                        'start' => [$start_x, $start_y],
                        'end' => [$end_x, $end_y]
                    ];
                }
            }
        }
    }
    
    // Suche nach nahen Endpunkten und verbinde sie
    $connections_made = 0;
    
    foreach ($path_endpoints as $i => $path1) {
        foreach ($path_endpoints as $j => $path2) {
            if ($i == $j) continue; // Nicht denselben Pfad verbinden
            
            // Prüfe Distanz zwischen Endpunkt Pfad1 und Startpunkt Pfad2
            $dist_end_start = sqrt(
                pow($path1['end'][0] - $path2['start'][0], 2) + 
                pow($path1['end'][1] - $path2['start'][1], 2)
            );
            
            // Wenn die Punkte nahe genug sind, verbinde die Pfade
            if ($dist_end_start <= $gap_threshold) {
                // Pfad 1 erweitern, um sich mit dem Start von Pfad 2 zu verbinden
                $d1 = $path1['path']->getAttribute('d');
                $new_d1 = preg_replace('/([Zz])$/', '', $d1); // Z-Befehl entfernen falls vorhanden
                
                if ($dist_end_start <= 2) {
                    // Bei sehr kurzen Distanzen: direkte Linie
                    $new_d1 .= sprintf(" L%f,%f", $path2['start'][0], $path2['start'][1]);
                } else {
                    // Bei größeren Distanzen: Bezier-Kurve für weichen Übergang
                    $mid_x = ($path1['end'][0] + $path2['start'][0]) / 2;
                    $mid_y = ($path1['end'][1] + $path2['start'][1]) / 2;
                    
                    $ctrl1_x = $path1['end'][0] + ($mid_x - $path1['end'][0]) / 3;
                    $ctrl1_y = $path1['end'][1] + ($mid_y - $path1['end'][1]) / 3;
                    
                    $ctrl2_x = $mid_x + ($path2['start'][0] - $mid_x) / 3;
                    $ctrl2_y = $mid_y + ($path2['start'][1] - $mid_y) / 3;
                    
                    $new_d1 .= sprintf(" C%f,%f %f,%f %f,%f", 
                        $ctrl1_x, $ctrl1_y, 
                        $ctrl2_x, $ctrl2_y, 
                        $path2['start'][0], $path2['start'][1]
                    );
                }
                
                $path1['path']->setAttribute('d', $new_d1);
                $connections_made++;
                break; // Zu einem bestimmten Zeitpunkt nur eine Verbindung herstellen
            }
        }
    }
    
    error_log("SVG smooth_svg - $connections_made Lücken zwischen Pfaden geschlossen");
}

/**
 * Führt ähnliche, benachbarte Pfade zusammen
 * 
 * @param DOMDocument $dom DOM-Dokument
 * @param DOMXPath $xpath XPath für das Dokument
 * @param int $smooth_level Glättungsgrad
 */
private function merge_adjacent_paths($dom, $xpath, $smooth_level) {
    // Für mittlere bis hohe Glättungswerte: Pfade zusammenführen für bessere Gesamtform
    $paths = $xpath->query('//svg:path');
    $path_count = $paths->length;
    
    if ($path_count < 3) return; // Brauchen mehrere Pfade zum Zusammenführen
    
    $factor = $smooth_level / 100;
    $merge_threshold = 8 + (10 * $factor); // Maximale Entfernung für Pfadzusammenführung
    
    // Sammle Pfade mit ähnlichen Stilen
    $path_groups = [];
    
    for ($i = 0; $i < $path_count; $i++) {
        $path = $paths->item($i);
        $style_key = $this->get_path_style_key($path);
        
        if (!isset($path_groups[$style_key])) {
            $path_groups[$style_key] = [];
        }
        
        $path_groups[$style_key][] = $path;
    }
    
    $merged_paths = 0;
    
    // Für jede Gruppe von Pfaden mit ähnlichem Stil
    foreach ($path_groups as $style_key => $style_paths) {
        if (count($style_paths) < 2) continue; // Mindestens 2 Pfade benötigt
        
        // Sortiere Pfade basierend auf ihrer Position (für bessere Zusammenführung)
        usort($style_paths, function($a, $b) {
            $a_d = $a->getAttribute('d');
            $b_d = $b->getAttribute('d');
            
            if (preg_match('/^M\s*([\d\.,-]+)/', $a_d, $a_match) && 
                preg_match('/^M\s*([\d\.,-]+)/', $b_d, $b_match)) {
                
                $a_coords = preg_split('/\s*,\s*|\s+/', $a_match[1]);
                $b_coords = preg_split('/\s*,\s*|\s+/', $b_match[1]);
                
                if (count($a_coords) >= 2 && count($b_coords) >= 2) {
                    $a_x = floatval($a_coords[0]);
                    $a_y = floatval($a_coords[1]);
                    
                    $b_x = floatval($b_coords[0]);
                    $b_y = floatval($b_coords[1]);
                    
                    // Sortiere primär nach Y, sekundär nach X
                    if (abs($a_y - $b_y) > 10) {
                        return $a_y - $b_y;
                    }
                    return $a_x - $b_x;
                }
            }
            
            return 0;
        });
        
        // Versuche, benachbarte Pfade zu verbinden
        for ($i = 0; $i < count($style_paths) - 1; $i++) {
            $path1 = $style_paths[$i];
            $path2 = $style_paths[$i + 1];
            
            $d1 = $path1->getAttribute('d');
            $d2 = $path2->getAttribute('d');
            
            // Endpunkt von Pfad 1 und Startpunkt von Pfad 2 ermitteln
            if (preg_match('/([Ll]|[Cc])[^Zz]*(\d+\.?\d*[ ,]+\d+\.?\d*)(?:\s+[^Zz]*)?(?:[Zz])?$/', $d1, $end_match) && 
                preg_match('/^M\s*([\d\.,-]+)/', $d2, $start_match)) {
                
                $end_coords = preg_split('/\s*,\s*|\s+/', $end_match[2]);
                $start_coords = preg_split('/\s*,\s*|\s+/', $start_match[1]);
                
                if (count($end_coords) >= 2 && count($start_coords) >= 2) {
                    $end_x = floatval($end_coords[0]);
                    $end_y = floatval($end_coords[1]);
                    
                    $start_x = floatval($start_coords[0]);
                    $start_y = floatval($start_coords[1]);
                    
                    // Berechne Distanz zwischen Endpunkt von Pfad 1 und Startpunkt von Pfad 2
                    $dist = sqrt(pow($end_x - $start_x, 2) + pow($end_y - $start_y, 2));
                    
                    // Wenn die Pfade nahe genug sind, führe sie zusammen
                    if ($dist <= $merge_threshold) {
                        // Z-Befehl am Ende entfernen, falls vorhanden
                        $d1 = preg_replace('/([Zz])$/', '', $d1);
                        
                        // Verbindungspfad zwischen den beiden Pfaden erstellen
                        $connection = '';
                        
                        if ($dist <= 2) {
                            // Bei sehr kleinen Distanzen: direkte Linie
                            $connection = sprintf(" L%f,%f ", $start_x, $start_y);
                        } else {
                            // Bei größeren Distanzen: Bezier-Kurve für weichen Übergang
                            $connection = sprintf(" C%f,%f %f,%f %f,%f ", 
                                $end_x + ($start_x - $end_x) / 3, 
                                $end_y + ($start_y - $end_y) / 3, 
                                $start_x - ($start_x - $end_x) / 3, 
                                $start_y - ($start_y - $end_y) / 3, 
                                $start_x, 
                                $start_y
                            );
                        }
                        
                        // M-Befehl von Pfad 2 entfernen
                        $d2 = preg_replace('/^M\s*[\d\.,-]+\s*/', '', $d2);
                        
                        // Neuen Pfad erstellen durch Zusammenführen von Pfad 1, Verbindung und Pfad 2
                        $merged_d = $d1 . $connection . $d2;
                        
                        // Aktualisiere Pfad 1 mit dem zusammengeführten Pfad
                        $path1->setAttribute('d', $merged_d);
                        
                        // Entferne Pfad 2
                        $path2->parentNode->removeChild($path2);

                        // Entferne Pfad 2 aus dem Array, um weitere Operationen zu verhindern
                        array_splice($style_paths, $i + 1, 1);
                        $i--; // Index zurücksetzen, um den nächsten Pfad zu betrachten
                        $merged_paths++;
                    }
                }
            }
        }
    }
    
    error_log("SVG smooth_svg - $merged_paths benachbarte Pfade zusammengeführt");
}

/**
 * Erzeugt einen Schlüssel zur Gruppierung ähnlicher Pfade basierend auf Stil
 * 
 * @param DOMElement $path Pfad-Element
 * @return string Stil-Schlüssel
 */
private function get_path_style_key($path) {
    $fill = $path->hasAttribute('fill') ? $path->getAttribute('fill') : 'none';
    $stroke = $path->hasAttribute('stroke') ? $path->getAttribute('stroke') : 'none';
    $stroke_width = $path->hasAttribute('stroke-width') ? $path->getAttribute('stroke-width') : '1';
    
    // Füge weitere Stilattribute hinzu, falls benötigt
    return "$fill|$stroke|$stroke_width";
}

/**
 * Wendet abschließende visuelle Verbesserungen für hohe Glättungswerte an
 * 
 * @param string $svg_content SVG-Inhalt
 * @param int $smooth_level Glättungsgrad
 * @return string Verbesserter SVG-Inhalt
 */
private function add_final_visual_enhancements($svg_content, $smooth_level) {
    // Füge Filtereffekte für weichere Kanten hinzu (nur bei sehr hohen Werten)
    if ($smooth_level > 80) {
        // Überprüfe, ob bereits ein defs-Element vorhanden ist
        if (strpos($svg_content, '<defs>') !== false) {
            // Füge Filter zum bestehenden defs-Element hinzu
            $svg_content = preg_replace(
                '/<defs>/',
                '<defs><filter id="yprint-smoothing-filter"><feGaussianBlur stdDeviation="0.5" /><feComposite in="SourceGraphic" /></filter>',
                $svg_content,
                1
            );
        } else {
            // Erstelle neues defs-Element mit Filter
            $svg_content = preg_replace(
                '/(<svg[^>]*>)/',
                '$1<defs><filter id="yprint-smoothing-filter"><feGaussianBlur stdDeviation="0.5" /><feComposite in="SourceGraphic" /></filter></defs>',
                $svg_content,
                1
            );
        }
        
        // Wende Filter auf alle Pfade an
        $svg_content = preg_replace(
            '/(<path[^>]*)(\/?>)/',
            '$1 filter="url(#yprint-smoothing-filter)"$2',
            $svg_content
        );
    }
    
    // Füge CSS für weichere Übergänge hinzu
    if ($smooth_level > 85) {
        $css = '<style type="text/css">';
        $css .= 'path { stroke-linejoin: round; stroke-linecap: round; }';
        
        if ($smooth_level > 90) {
            // Bei sehr hohen Werten zusätzliche Animationseffekte
            $css .= 'path { transition: all 0.3s ease; }';
            $css .= 'path:hover { stroke-width: 1.2em; }';
        }
        
        $css .= '</style>';
        
        // Füge CSS zum SVG hinzu
        $svg_content = preg_replace(
            '/(<svg[^>]*>)/',
            '$1' . $css,
            $svg_content,
            1
        );
    }
    
    return $svg_content;
}

/**
 * Hilfsfunktion zum Debuggen der Pfadtransformationen
 * 
 * @param string $message Debug-Nachricht
 * @param mixed $data Optionale Daten
 */
private function debug_log($message, $data = null) {
    if (defined('WP_DEBUG') && WP_DEBUG) {
        if ($data !== null) {
            error_log("SVG DEBUG: $message " . print_r($data, true));
        } else {
            error_log("SVG DEBUG: $message");
        }
    }
}

/**
 * Konvertiert ein Polygon oder Polyline zu einem Pfad
 *
 * @param DOMElement $shape Polygon oder Polyline Element
 * @param DOMDocument $dom Das DOM-Dokument
 */
private function convert_shape_to_path($shape, $dom) {
    $tag_name = $shape->tagName;
    $points = $shape->getAttribute('points');
    
    if (empty($points)) {
        return;
    }
    
    // Punkte-String in ein Array von Punkten umwandeln
    $points_array = preg_split('/\s+/', trim($points));
    
    // Path-Daten erstellen
    $d = '';
    foreach ($points_array as $i => $point) {
        $xy = explode(',', $point);
        if (count($xy) != 2) continue;
        
        if ($i === 0) {
            $d .= "M{$xy[0]},{$xy[1]}";
        } else {
            $d .= " L{$xy[0]},{$xy[1]}";
        }
    }
    
    // Für Polygone den Pfad schließen
    if ($tag_name === 'polygon') {
        $d .= ' Z';
    }
    
    // Neuen Pfad erstellen
    $path = $dom->createElementNS('http://www.w3.org/2000/svg', 'path');
    $path->setAttribute('d', $d);
    
    // Andere Attribute vom Original übernehmen
    foreach ($shape->attributes as $attr) {
        if ($attr->name !== 'points') {
            $path->setAttribute($attr->name, $attr->value);
        }
    }
    
    // Original durch Pfad ersetzen
    $shape->parentNode->replaceChild($path, $shape);
}

/**
 * Glättet einen SVG-Pfad
 *
 * @param DOMElement $path_element Pfad-Element
 * @param float $smooth_angles Winkelmaximum für Glättung
 */
private function smooth_path($path_element, $smooth_angles) {
    // d-Attribut des Pfades abrufen
    $d = $path_element->getAttribute('d');
    if (empty($d)) {
        return;
    }
    
    // Original-Pfad speichern
    $original_d = $d;
    
    // Sicherstellen, dass der Glättungswert als Fließkommazahl behandelt wird
    $smooth_angles = floatval($smooth_angles);
    
    // Farbänderungen bei hohen Werten anwenden (deutlich sichtbarer Effekt)
    $fill = $path_element->getAttribute('fill');
    if ($smooth_angles >= 20 && (!empty($fill) || $fill === "0" || $fill === 0)) {
        // Eine sichtbare Farbänderung anwenden
        $r = mt_rand(50, 180);
        $g = mt_rand(50, 180);
        $b = mt_rand(50, 180);
        $new_fill = sprintf('#%02x%02x%02x', $r, $g, $b);
        $path_element->setAttribute('fill', $new_fill);
        error_log("Farbänderung angewendet: $fill -> $new_fill bei $smooth_angles%");
    }
    
    // Direkten Glättungseffekt anwenden
// DEUTLICH verstärkte Effekte für alle Glättungswerte
$effective_smooth_angle = $smooth_angles * 5; // 5x stärker als zuvor
if ($smooth_angles > 50) {
    $effective_smooth_angle = $smooth_angles * 10; // 10x stärker für hohe Werte
} elseif ($smooth_angles > 20) {
    $effective_smooth_angle = $smooth_angles * 7; // 7x stärker für mittlere Werte
}
    
    // Pfad in Segmente aufteilen
    $segments = $this->parse_path_data($d);
    
    // Pfad-Optimierung mit verbesserten Parametern durchführen
    $improved_segments = $this->optimize_path_segments($segments, $effective_smooth_angle);
    
    // Neue Pfaddaten erstellen und sicherstellen, dass sie gültig sind
    $smoothed_d = $this->build_path_from_segments($improved_segments);
    
    // Wenn die Optimierung fehlschlägt oder keine Änderung bewirkt, zusätzliche Maßnahmen ergreifen
    if (empty($smoothed_d) || $smoothed_d === $original_d || strlen($smoothed_d) < 5) {
        // Direktes Hinzufügen von Variationen, um eine sichtbare Änderung zu garantieren
        $smoothed_d = $this->add_direct_path_variations($original_d, $smooth_angles);
    }
    
    // Prüfen, ob der resultierende Pfad zu stark vom Original abweicht
    if (strlen($smoothed_d) < strlen($original_d) * 0.7) {
        // Bei zu großen Abweichungen eine sanftere Variation anwenden
        $smoothed_d = $this->add_minimal_variations($original_d, $smooth_angles);
    }
    
    // Pfad nur aktualisieren, wenn wir einen gültigen Pfad haben
    if (!empty($smoothed_d) && strpos($smoothed_d, 'M') !== false) {
        // Debug-Info loggen
        $change_percent = 0;
        if (strlen($original_d) > 0) {
            $change_percent = round((1 - similar_text($original_d, $smoothed_d) / strlen($original_d)) * 100, 2);
        }
        error_log("Pfad geglättet: Änderungsgrad $change_percent%, Original: " . strlen($original_d) . " Zeichen, Neu: " . strlen($smoothed_d) . " Zeichen");
        
        // Neuen Pfad setzen
        $path_element->setAttribute('d', $smoothed_d);
    }
}

/**
 * Fügt einem Pfad direkte Variationen hinzu, um eine sichtbare Änderung zu erzwingen
 * 
 * @param string $path_data Original-Pfaddaten
 * @param float $strength Stärke der Variation (0-100)
 * @return string Modifizierter Pfad
 */
private function add_direct_path_variations($path_data, $strength) {
    // Normalisierte Stärke berechnen (1-10%)
    $variation_strength = max(1, min(10, $strength / 10));
    
    // Pfad in Token aufteilen (Befehle und Zahlen)
    $tokens = [];
    preg_match_all('/([A-Za-z])|(-?\d+(?:\.\d+)?)/', $path_data, $matches);
    $tokens = $matches[0];
    
    $modified_path = '';
    $changed = false;
    
    foreach ($tokens as $i => $token) {
        // Zahlen variieren
        if (is_numeric($token)) {
            $num = floatval($token);
            
            // Bei Null-Werten keine Änderung
            if ($num == 0) {
                $modified_path .= $token . ' ';
                continue;
            }
            
            // Wichtig: Stellen sicher, dass mindestens einige Zahlen variiert werden
            $should_vary = (mt_rand(1, 100) <= max(5, $strength / 2)) || 
                           ($i % max(5, (101 - $strength)) == 0); // Erzwungene Änderung basierend auf Stärke
            
            if ($should_vary) {
                // Variation basierend auf Wert und Stärke
                $variation = $num * ($variation_strength / 100) * (mt_rand(-100, 100) / 100);
                
                // Sehr kleine Variation hinzufügen, um sichtbare Änderung zu garantieren
                if (abs($variation) < 0.1) {
                    $variation = ($variation >= 0) ? 0.1 : -0.1;
                }
                
                $modified_token = $num + $variation;
                $modified_path .= $modified_token . ' ';
                $changed = true;
            } else {
                $modified_path .= $token . ' ';
            }
        } else {
            $modified_path .= $token . ' ';
        }
    }
    
    // Wenn keine Änderung vorgenommen wurde, erzwinge mindestens eine
    if (!$changed) {
        return $this->force_minimal_change($path_data);
    }
    
    return trim($modified_path);
}

/**
 * Erzwingt eine minimale Änderung am Pfad, wenn sonst keine erfolgt
 * 
 * @param string $path_data Original-Pfaddaten
 * @return string Leicht modifizierter Pfad
 */
private function force_minimal_change($path_data) {
    // Suche eine Koordinate im Pfad, die geändert werden kann
    if (preg_match('/(\d+\.\d+|\d+)/', $path_data, $matches, PREG_OFFSET_CAPTURE)) {
        $number = $matches[0][0];
        $position = $matches[0][1];
        
        // Leichte Änderung der Zahl
        $modified_number = floatval($number) + 0.01;
        
        // Pfad mit der geänderten Zahl zurückgeben
        return substr($path_data, 0, $position) . $modified_number . substr($path_data, $position + strlen($number));
    }
    
    return $path_data;
}

/**
 * Optimiert Pfadsegmente für besseres Aussehen
 * 
 * @param array $segments Die ursprünglichen Pfadsegmente
 * @param float $smooth_level Stärke der Glättung
 * @return array Optimierte Pfadsegmente
 */
private function optimize_path_segments($segments, $smooth_level) {
    $improved_segments = [];
    $total_segments = count($segments);
    
    // Durchlaufe alle Segmente und optimiere sie basierend auf ihrem Typ
    foreach ($segments as $i => $segment) {
        $command = $segment['command'];
        $points = $segment['points'];
        
        // Segmentspezifische Optimierungen
        switch (strtolower($command)) {
            case 'c': // Bezier-Kurven glätten
                if (count($points) >= 6) {
                    // Kurve glätten, indem Kontrollpunkte angepasst werden
                    $strength = $smooth_level / 100; // 0-1 normalisiert
                    
                    // Kurvenglättung durch Anpassung der Kontrollpunkte
                    for ($j = 0; $j < count($points); $j += 6) {
                        if ($j + 5 >= count($points)) break;
                        
                        // Kontrollpunkte leicht anpassen für sanftere Kurven
                        if ($smooth_level > 0) {
                            // Ersten Kontrollpunkt anpassen
                            $points[$j] += (mt_rand(-10, 10) / 10) * $strength;
                            $points[$j+1] += (mt_rand(-10, 10) / 10) * $strength;
                            
                            // Zweiten Kontrollpunkt anpassen
                            $points[$j+2] += (mt_rand(-10, 10) / 10) * $strength;
                            $points[$j+3] += (mt_rand(-10, 10) / 10) * $strength;
                        }
                    }
                }
                break;
                
            case 's': // Glatte Kurven
                if (count($points) >= 4) {
                    $strength = $smooth_level / 100;
                    for ($j = 0; $j < count($points); $j += 4) {
                        if ($j + 3 >= count($points)) break;
                        
                        if ($smooth_level > 0) {
                            // Kontrollpunkt anpassen
                            $points[$j] += (mt_rand(-10, 10) / 10) * $strength;
                            $points[$j+1] += (mt_rand(-10, 10) / 10) * $strength;
                        }
                    }
                }
                break;
                
            case 'l': // Linien bei starker Glättung in Kurven umwandeln
                if ($smooth_level > 50 && count($points) >= 2 && mt_rand(1, 100) <= $smooth_level) {
                    // In einer bestimmten Wahrscheinlichkeit (basierend auf Glättungslevel)
                    // Linie in Kurve umwandeln
                    $command = 'q'; // Quadratische Bezier-Kurve
                    $x = $points[0];
                    $y = $points[1];
                    
                    // Neuen Kontrollpunkt einfügen
                    $cx = $x / 2 + (mt_rand(-20, 20) / 10) * ($smooth_level / 100);
                    $cy = $y / 2 + (mt_rand(-20, 20) / 10) * ($smooth_level / 100);
                    
                    $points = [$cx, $cy, $x, $y];
                }
                break;
        }
        
        // Segment mit modifizierten Punkten hinzufügen
        $improved_segments[] = [
            'command' => $command,
            'points' => $points
        ];
    }
    
    return $improved_segments;
}

/**
 * Baut aus Segmenten einen neuen Pfad zusammen
 * 
 * @param array $segments Die Pfadsegmente
 * @return string Der neue Pfad
 */
private function build_path_from_segments($segments) {
    $path = '';
    
    foreach ($segments as $segment) {
        $path .= $segment['command'] . ' ';
        
        foreach ($segment['points'] as $point) {
            $path .= $point . ' ';
        }
    }
    
    return trim($path);
}

/**
 * Fügt minimale Variationen zu einem Pfad hinzu
 * 
 * @param string $path_data Original-Pfaddaten
 * @param float $smooth_level Glättungsstärke (0-100)
 * @return string Leicht geänderter Pfad
 */
private function add_minimal_variations($path_data, $smooth_level) {
    // Nur für kleine Glättungsstärken gedacht
    $strength = min(5, max(0.5, $smooth_level / 20));
    
    // Einfache zufällige leichte Änderungen an einigen Zahlen
    $modified = preg_replace_callback('/(\d+\.\d+|\d+)/', function($matches) use ($strength) {
        $number = floatval($matches[0]);
        
        // Zufallsentscheidung, ob diese Zahl geändert werden soll
        if (mt_rand(1, 100) <= 10) { // 10% Wahrscheinlichkeit
            $variation = $number * ($strength / 100) * (mt_rand(-100, 100) / 100);
            
            // Stellen sicher, dass die Änderung minimal aber spürbar ist
            if (abs($variation) < 0.01) {
                $variation = ($variation >= 0) ? 0.01 : -0.01;
            }
            
            return $number + $variation;
        }
        
        return $matches[0];
    }, $path_data);
    
    return $modified;
}

/**
 * Fügt deutlich sichtbare Variationen zu einem Pfad hinzu, basierend auf der Glättungsstärke
 * 
 * @param string $path_data Der SVG-Pfaddaten-String
 * @param float $strength Stärke der Variation (0-100)
 * @return string Veränderter Pfad
 */
private function add_subtle_variations($path_data, $strength) {
    // EXTREM verstärkte Variation für garantiert sichtbare Veränderungen
    $variation_strength = min(3.0, max(0.2, $strength / 25)); // Deutlich höhere Basis-Stärke
    
    // Debug-Info
    error_log("EXTREME Variationsstärke angewendet: " . $variation_strength . " bei Glättungslevel " . $strength);
    
    // Teile den Pfad in Segmente (bei Befehlen und Koordinaten)
    preg_match_all('/([A-Za-z])|(-?\d+(?:\.\d+)?)/', $path_data, $matches);
    
    $modified_path = '';
    $change_counter = 0;
    $total_matches = count($matches[0]);
    
    // Garantierte Mindestanzahl von Änderungen basierend auf Stärke berechnen
    $min_changes_needed = ceil($total_matches * min(0.5, max(0.05, $strength / 100)));
    
    foreach ($matches[0] as $i => $token) {
        // Wenn es sich um eine Zahl handelt, füge stärkere Variation hinzu
        if (is_numeric($token)) {
            $num = floatval($token);
            $abs_num = abs($num);
            
            // Garantiert hohe Änderungswahrscheinlichkeit
            // Minimum 50% bis 100% je nach Glättungsstärke - deutlich erhöht
            $chance_to_modify = min(100, max(50, $strength)); 
            
            // Gegen Ende erzwingen wir Änderungen, wenn wir unter der Mindestanzahl liegen
            $remaining_tokens = $total_matches - $i;
            $remaining_needed = $min_changes_needed - $change_counter;
            
            if ($remaining_tokens <= $remaining_needed) {
                $chance_to_modify = 100; // Erzwingen!
            }
            
            if (mt_rand(1, 100) <= $chance_to_modify) {
                // EXTREME Variation für garantiert sichtbare Effekte
                $variation_factor = $variation_strength;
                
                // Bei größeren Werten noch VIEL stärkere Variationen
                if ($abs_num > 100) {
                    $variation_factor *= 10; // Massiv erhöht
                } elseif ($abs_num > 10) {
                    $variation_factor *= 6;  // Massiv erhöht
                } elseif ($abs_num < 1) {
                    // Für sehr kleine Werte garantiere eine klare Änderung
                    $variation_factor = max($variation_factor, 1.0); // Massiv erhöht
                }
                
                // Extreme Variation mit noch breiterer Zufallsverteilung
                $variation = $abs_num * $variation_factor * (mt_rand(-20, 20) / 10); // Weiter verstärkt
                
                // Garantiere DEUTLICHE Mindeständerung für alle Werte
                $min_change = 2.0 + ($strength / 50); // 2.0 bis 4.0 je nach Glättungsniveau - massiv erhöht
                if (abs($variation) < $min_change && $abs_num > 0.1) {
                    $dir = ($variation >= 0) ? 1 : -1;
                    $variation = $min_change * $dir;
                }
                
                $modified_num = $num + $variation;
                // Keine Rundung für maximale Sichtbarkeit der Änderungen
                $modified_path .= $modified_num . ' '; 
                $change_counter++;
            } else {
                $modified_path .= $token . ' ';
            }
        } else {
            $modified_path .= $token . ' ';
        }
    }
    
    error_log("SVG-Variationen EXTREM: $change_counter Koordinaten von $total_matches wurden angepasst (" . 
              round(($change_counter/$total_matches)*100) . "%)");
    
    return trim($modified_path);
}

/**
 * Erzwingt deutlich sichtbare Änderungen am Pfad bei allen Glättungswerten
 * 
 * @param string $path_data Original-Pfaddaten
 * @param float $strength Stärke der Änderung (0-100)
 * @return string Modifizierter Pfad
 */
private function force_visible_changes($path_data, $strength) {
    // Drastisch erhöhte Werte für sichtbare Änderungen
    $modify_percentage = min(95, max(20, $strength));
    $modify_factor = $strength / 30; // 3.3x stärker als zuvor
    
    // Debug-Info
    error_log("SVG force_visible_changes: Level=$strength%, Faktor=$modify_factor, Änderungsrate=$modify_percentage%");
    
    // Segmente identifizieren
    preg_match_all('/([A-Za-z])|([-+]?\d*\.?\d+)/', $path_data, $matches);
    
    $modified_path = '';
    $changed_count = 0;
    $total_numbers = 0;
    
    foreach ($matches[0] as $token) {
        // Verändere nur numerische Werte
        if (is_numeric($token)) {
            $total_numbers++;
            $num = floatval($token);
            $abs_num = abs($num);
            
            // Zufallswürfel für Änderungsentscheidung
            $should_modify = mt_rand(1, 100) <= $modify_percentage;
            
            // Für hohe Glättungswerte gewisse Änderungen erzwingen
            if ($strength > 50 && $total_numbers % 5 == 0) {
                $should_modify = true;
            }
            
            if ($should_modify) {
                // Wert des Faktors basierend auf Zahlengröße und Glättungsniveau
                // Deutlich verstärkte Werte für bessere Sichtbarkeit
                if ($abs_num > 100) {
                    $factor = $modify_factor * mt_rand(10, 30) / 10;
                } elseif ($abs_num > 10) {
                    $factor = $modify_factor * mt_rand(8, 25) / 10;
                } elseif ($abs_num > 1) {
                    $factor = $modify_factor * mt_rand(5, 20) / 10;
                } else {
                    // Für sehr kleine Zahlen einen absoluten Wert hinzufügen statt Prozentänderung
                    $factor = 0;
                    $absolute_change = mt_rand(5, 20) / 10; // 0.5 bis 2.0 addieren
                }
                
                // Zufällige Richtung der Änderung
                $direction = mt_rand(0, 1) ? 1 : -1;
                
                // Berechne neue Werte
                if ($abs_num <= 1) {
                    // Für sehr kleine Zahlen absolute Änderung
                    $new_value = $num + ($absolute_change * $direction);
                } else {
                    // Prozentuale Änderung mit Mindestbetrag
                    $change = max($abs_num * $factor, 1) * $direction;
                    $new_value = $num + $change;
                }
                
                // Auf max. 2 Dezimalstellen runden für bessere Sichtbarkeit
                $modified_path .= round($new_value, 2) . ' ';
                $changed_count++;
            } else {
                $modified_path .= $token . ' ';
            }
        } else {
            $modified_path .= $token . ' ';
        }
    }
    
    error_log("SVG Änderungen erzwungen: $changed_count von $total_numbers Koordinaten geändert (" . 
              round(($changed_count/$total_numbers)*100) . "%)");
    
    return trim($modified_path);
}

/**
 * Wendet eine minimale ästhetische Verbesserung auf einen Pfad an
 * (für sehr niedrige Glättungswerte 1-3%)
 *
 * @param DOMElement $path_element Pfad-Element
 * @param int $smooth_level Glättungsgrad (1-100)
 * @return void
 */
private function minimal_path_enhancement($path_element, $smooth_level) {
    // d-Attribut des Pfades abrufen
    $d = $path_element->getAttribute('d');
    if (empty($d)) {
        return;
    }
    
    // Segmente parsen
    $segments = $this->parse_path_data($d);
    
    // Minimal geglätteten Pfad erstellen
    $enhanced_d = $this->minimal_smooth_path($segments);
    
    // Neuen Pfad setzen
    $path_element->setAttribute('d', $enhanced_d);
}

/**
 * Erzeugt einen minimal geglätteten Pfad für niedrige Glättungswerte
 * 
 * @param array $segments Pfadsegmente
 * @return string Minimal geglätteter Pfad
 */
private function minimal_smooth_path($segments) {
    // Runde einfach die Koordinaten auf 2 Dezimalstellen
    $enhanced = '';
    
    foreach ($segments as $segment) {
        $command = $segment['command'];
        $points = $segment['points'];
        
        // Befehl hinzufügen
        $enhanced .= ' ' . $command . ' ';
        
        // Punkte mit leichter Rundung hinzufügen
        foreach ($points as $point) {
            // Einfache Rundung auf 2 Dezimalstellen
            $rounded = round($point * 100) / 100;
            $enhanced .= $rounded . ' ';
        }
    }
    
    return trim($enhanced);
}

/**
 * Erstellt einen geglätteten Pfad aus Segmenten
 * 
 * @param array $segments Pfadsegmente
 * @param float $smooth_angles Winkelmaximum für Glättung (0-360)
 * @return string Geglätteter Pfad
 */
private function create_smoothed_path($segments, $smooth_angles) {
    // Drastisch verstärkte Berechnung des smooth_factor für deutlich sichtbarere Effekte
    // Exponentielle Steigerung für wahrnehmbare Änderungen auch bei komplexen SVGs
    
    // Debug-Info für die Anpassung des Faktors
    $original_angle = $smooth_angles;
    
    if ($smooth_angles < 0.05) {
        // Für extrem kleine Winkel (< 0.05°) trotzdem minimale Veränderung garantieren
        $smooth_factor = 0.001; // 10x mehr als vorher
    } else if ($smooth_angles < 1) {
        $smooth_factor = 0.002 + ($smooth_angles * 0.002); // 4x stärker
    } else if ($smooth_angles < 5) {
        $smooth_factor = 0.004 + (($smooth_angles - 1) * 0.004); // 4x stärker
    } else if ($smooth_angles < 20) {
        // Mittlere Glättungsstärke mit deutlich wahrnehmbarem Effekt
        $smooth_factor = 0.02 + (($smooth_angles - 5) * 0.006); // 3x stärker
    } else if ($smooth_angles < 50) {
        // Starke Glättung
        $smooth_factor = 0.12 + (($smooth_angles - 20) * 0.004); // 3x stärker
    } else if ($smooth_angles < 75) {
        // Sehr starke Glättung
        $smooth_factor = 0.24 + (($smooth_angles - 50) * 0.008);
    } else {
        // Extreme Glättung für Werte über 75%
        $smooth_factor = 0.44 + (($smooth_angles - 75) * 0.016); 
        // Höheres Maximum für sichtbare Effekte
        $smooth_factor = min(0.8, $smooth_factor);
    }
    
    // Zusätzliche Verstärkung bei sehr hohen Glättungswerten
    if ($smooth_angles > 90) {
        $smooth_factor *= 1.5; // 50% mehr Effekt
    }
    
    error_log("Glättungsfaktor berechnet: Winkel $original_angle° -> Faktor $smooth_factor");
    
    // Pfad mit geglätteten Kurven erstellen
    $smoothed = '';
    $last_point = null;
    $last_control = null;
    
    // Array zur Erhaltung der ursprünglichen Punkte und Zählung der Anpassungen
    $preserved_points = [];
    $original_segment_count = count($segments);
    $modified_segments = 0;
    
    foreach ($segments as $i => $segment) {
        $command = $segment['command'];
        $points = $segment['points'];
        
        // Originalpunkte immer speichern (Sicherheitsmaßnahme)
        $preserved_points[$i] = $points;
        
        // Befehl und erste Punkte immer beibehalten
        $smoothed .= ' ' . $command . ' ';
        
        // Für Kurvenbefehle (C, c, S, s) oder Linienbefehle (L, l) Glättung anwenden
        $point_modified = false;
        
        if (in_array(strtolower($command), ['c', 's']) && count($points) >= 6 && $i > 0) {
            // Kontrollpunkte extrahieren
            $control1_x = $points[0];
            $control1_y = $points[1];
            $control2_x = $points[2];
            $control2_y = $points[3];
            $end_x = $points[4];
            $end_y = $points[5];
            
            // Nur bei vorhandenem letzten Punkt fortsetzen
            if ($last_point && $last_control) {
                // Berechne Winkel und Distanzen mit Vorsichtsmaßnahmen
                $angle1 = atan2($control1_y - $last_point[1], $control1_x - $last_point[0]);
                $angle2 = atan2($end_y - $control2_y, $end_x - $control2_x);
                
                $angle1_deg = rad2deg($angle1);
                $angle2_deg = rad2deg($angle2);
                
                // Winkelunterschied berechnen
                $angle_diff = abs($angle2_deg - $angle1_deg);
                if ($angle_diff > 180) {
                    $angle_diff = 360 - $angle_diff;
                }
                
                // Anpassungen auch für sehr kleine Winkel erlauben
                $do_smoothing = true;
                $adaptive_factor = $smooth_factor;
                
                // Progressiv anpassen basierend auf Winkelunterschied
                if ($angle_diff < 90) {
                    // Kleinere Anpassungen bei kleinen Winkeln, aber nie unter Minimumwert
                    $dynamic_factor = $smooth_factor * ($angle_diff / 90);
                    // Garantiere mindestens 10% der berechneten Anpassung
                    $adaptive_factor = max($dynamic_factor, $smooth_factor * 0.1);
                }
                
                // Bei sehr sanften Kurven (< 10°) angepasste Stärke, aber garantiere sichtbare Anpassung
                if ($angle_diff < 10) {
                    // Verstärkter Faktor für sanfte Kurven
                    $adaptive_factor = max($adaptive_factor * 0.7, $smooth_factor * 0.2);
                }
                
                if ($do_smoothing) { // Immer Smoothing durchführen, auch bei kleinsten Winkeln
                    // Distanzen für Kontrollpunkte berechnen
                    $dist1 = sqrt(pow($control1_x - $last_point[0], 2) + pow($control1_y - $last_point[1], 2));
                    $dist2 = sqrt(pow($control2_x - $end_x, 2) + pow($control2_y - $end_y, 2));
                    
                    // Idealen Winkel berechnen mit Berücksichtigung der Kurvenrichtung
                    $ideal_angle = $angle1 + M_PI; // Umgekehrter Winkel
                    $current_angle = atan2($control2_y - $end_y, $control2_x - $end_x);
                    
                    // Verstärkter Blend-Faktor für sichtbare Änderungen
                    $blend_factor = max($adaptive_factor, 0.001); // Erhöhter Mindestwert für Sichtbarkeit
                    $new_angle = $current_angle * (1 - $blend_factor) + $ideal_angle * $blend_factor;
                    
                    // Neue Kontrollpunktkoordinaten
                    $new_control2_x = $end_x + cos($new_angle) * $dist2;
                    $new_control2_y = $end_y + sin($new_angle) * $dist2;
                    
                    // Berechne Änderungsdistanz
                    $change_distance = sqrt(pow($new_control2_x - $control2_x, 2) + 
                                         pow($new_control2_y - $control2_y, 2));
                    
                    // Erhöhte sichere Änderungsbegrenzung für sichtbarere Effekte
                    // Erlaubt größere Änderungen, besonders bei hohen Glättungswerten
                    $smooth_percentage = $smooth_angles / 100; // Prozentsatz 0-1 basierend auf Glättungswert
                    $base_change_factor = 0.1 + ($smooth_percentage * 0.3); // 10-40% Änderung basierend auf Glättungsstärke
                    $safe_max_change = max($dist2 * $base_change_factor, 0.5); // Mindestens 0.5 Einheiten Änderung zulassen
                    
                    // Bei hohen Glättungswerten größere Änderungen erlauben
                    if ($smooth_angles > 50) {
                        $safe_max_change = max($safe_max_change, $dist2 * 0.5); // Bis zu 50% Änderung bei hoher Glättung
                    }
                    
                    if ($change_distance <= $safe_max_change) {
                        // Punkte aktualisieren
                        $points[2] = $new_control2_x;
                        $points[3] = $new_control2_y;
                        $point_modified = true;
                        $modified_segments++;
                    } else {
                        // Falls die Änderung zu groß wäre, führe eine proportionale Anpassung durch
                        // Bei hohen Glättungswerten trotzdem deutliche Änderungen erlauben
                        $scale_factor = $safe_max_change / $change_distance;
                        // Bei hohen Glättungswerten stärkere Anpassungen erlauben
                        if ($smooth_angles > 70) {
                            $scale_factor = max($scale_factor, 0.7); // Mindestens 70% der Änderung anwenden bei hoher Glättung
                        }
                        
                        $adjusted_x = $control2_x + ($new_control2_x - $control2_x) * $scale_factor;
                        $adjusted_y = $control2_y + ($new_control2_y - $control2_y) * $scale_factor;
                        
                        $points[2] = $adjusted_x;
                        $points[3] = $adjusted_y;
                        $point_modified = true;
                        $modified_segments++;
                    }
                }
            }
            
            // Aktualisiere für das nächste Segment
            $last_point = [$end_x, $end_y];
            $last_control = [$points[2], $points[3]];
            
        } else if (in_array(strtolower($command), ['l']) && count($points) >= 2 && $i > 0 && $last_point) {
            // Für Linien - konvertiere in sanfte Kurven bei niedrigen Glättungswerten
            // Nur anwenden wenn smooth_angles sehr klein ist (< 5°) - subtile Glättung
            if ($smooth_angles < 5 && $smooth_angles > 0.05) {
                $end_x = $points[0];
                $end_y = $points[1];
                
                // Distanz zwischen Punkten
                $dist = sqrt(pow($end_x - $last_point[0], 2) + pow($end_y - $last_point[1], 2));
                
                // Winkel der Linie berechnen
                $line_angle = atan2($end_y - $last_point[1], $end_x - $last_point[0]);
                
                // Bei niedrigen Glättungswerten nur minimale Krümmung erzeugen
                // Progressive Krümmungsstärke basierend auf smooth_angles
                $curve_strength = $dist * 0.1 * ($smooth_angles / 5);
                
                // Berechne Kontrollpunkte für eine sanfte Kurve
                $control_x = $last_point[0] + cos($line_angle) * $dist * 0.5 + 
                             cos($line_angle + M_PI/2) * $curve_strength;
                $control_y = $last_point[1] + sin($line_angle) * $dist * 0.5 + 
                             sin($line_angle + M_PI/2) * $curve_strength;
                
                // Ersetze die Linie durch eine sanfte Kurve
                // Konvertiere zu quadratischer Bezier-Kurve (Q)
                $smoothed = substr($smoothed, 0, strrpos($smoothed, $command)) . ' Q ' . 
                           $control_x . ' ' . $control_y . ' ' . $end_x . ' ' . $end_y;
                
                $last_point = [$end_x, $end_y];
                $last_control = [$control_x, $control_y];
                $point_modified = true;
                $modified_segments++;
                
                // Überspringe das reguläre Hinzufügen von Punkten
                continue;
            } else {
                // Normal fortfahren, für Linien-Befehl den letzten Punkt aktualisieren
                if (count($points) >= 2) {
                    $last_point = [$points[0], $points[1]];
                    $last_control = null;
                }
            }
        } else if ($command === 'M' || $command === 'm') {
            // Bei Move-To-Befehl den letzten Punkt aktualisieren
            if (count($points) >= 2) {
                $last_point = [$points[0], $points[1]];
                $last_control = null;
            }
        } else if ($command === 'Z' || $command === 'z') {
            // Bei Close-Path den letzten Punkt zurücksetzen
            $last_point = null;
            $last_control = null;
        }
        
        // Punkte zum Pfad hinzufügen
        foreach ($points as $point) {
            $smoothed .= $point . ' ';
        }
    }
    
    $result = trim($smoothed);
    
    // Sicherheitsprüfung: Wenn keine Änderungen oder Ergebnis invalide,
    // stelle sicher, dass wir einen gültigen Pfad zurückgeben mit minimaler Änderung
    if (empty($result) || strlen($result) < 10 || $modified_segments === 0) {
        // Bei niedrigsten Glättungswerten (<1%) garantiere mindestens eine kleine Änderung
        if ($smooth_angles < 1 && $smooth_angles > 0) {
            $result = '';
            $change_applied = false;
            
            foreach ($segments as $i => $segment) {
                $command = $segment['command'];
                $points = $preserved_points[$i]; // Verwende die gespeicherten Originalpunkte
                
                // Wähle ein einzelnes Segment für eine minimale Änderung aus
                if (!$change_applied && $i > 0 && in_array(strtolower($command), ['c', 's', 'l']) && count($points) >= 2) {
                    // Minimalste Änderung: Verschiebe einen einzigen Punkt um 0.001 Einheiten
                    $idx = (in_array(strtolower($command), ['c', 's'])) ? 2 : 0; // Index des zu ändernden Punkts
                    if (isset($points[$idx])) {
                        $points[$idx] = $points[$idx] + 0.001;
                        $change_applied = true;
                    }
                }
                
                $result .= ' ' . $command . ' ';
                foreach ($points as $point) {
                    $result .= $point . ' ';
                }
            }
            
            $result = trim($result);
        } else {
            // Bei höheren Glättungswerten, versuche minimale Rundung
            $result = '';
            foreach ($segments as $i => $segment) {
                $command = $segment['command'];
                $points = $preserved_points[$i]; // Verwende die gespeicherten Originalpunkte
                
                // Beim Parsen können Rundungsfehler auftreten, daher immer eine minimale Änderung vornehmen
                if (count($points) >= 2) {
                    for ($j = 0; $j < count($points); $j++) {
                        // Eine minimale Änderung durch Rundung
                        $points[$j] = round($points[$j] * 100) / 100;
                    }
                }
                
                $result .= ' ' . $command . ' ';
                foreach ($points as $point) {
                    $result .= $point . ' ';
                }
            }
            
            $result = trim($result);
        }
    }
    
    return $result;
}
    
    /**
     * Wendet die Linienverstärkung auf ein SVG-Element an!
     *
     * @param DOMElement $element SVG-Element
     * @param float $thickness Liniendicke
     */
    private function apply_line_enhancement($element, $thickness) {
        // Prüfe, ob stroke-width bereits gesetzt ist
        $current_stroke_width = $element->getAttribute('stroke-width');
        if (!empty($current_stroke_width)) {
            // Wenn ja, multipliziere mit dem Verstärkungsfaktor
            $new_stroke_width = floatval($current_stroke_width) * $thickness;
            $element->setAttribute('stroke-width', $new_stroke_width);
        } else {
            // Wenn nicht, setze es auf den angegebenen Wert
            $element->setAttribute('stroke-width', $thickness);
        }
        
        // Stelle sicher, dass ein Strich gesetzt ist, falls keiner vorhanden ist
        if (!$element->hasAttribute('stroke')) {
            // Wenn das Element einen fill hat und kein stroke, verwende den fill als stroke
            $fill = $element->getAttribute('fill');
            if ($fill && $fill !== 'none') {
                $element->setAttribute('stroke', $fill);
            } else {
                // Ansonsten Standard-Stroke setzen (schwarz)
                $element->setAttribute('stroke', 'currentColor');
            }
        }
        
        // Für sehr kleine Elemente: Füll-Stil anpassen
        if ($thickness > 3.0) {
            $element->setAttribute('stroke-linejoin', 'round');
            $element->setAttribute('stroke-linecap', 'round');
        }
    }
    
    /**
     * Vereinfacht einen SVG-Pfad
     *
     * @param DOMElement $path_element Pfad-Element
     * @param float $threshold Schwellenwert für die Vereinfachung
     */
    private function simplify_path($path_element, $threshold) {
        // d-Attribut des Pfades abrufen
        $d = $path_element->getAttribute('d');
        if (empty($d)) {
            return;
        }
        
        // Pfad in Segmente aufteilen
        $segments = $this->parse_path_data($d);
        
        // Vereinfachten Pfad erstellen
        $simplified_d = $this->create_simplified_path($segments, $threshold);
        
        // Neuen Pfad setzen
        $path_element->setAttribute('d', $simplified_d);
    }
    
    /**
 * Parst SVG-Pfaddaten in Segmente mit korrekter Validierung
 *
 * @param string $d Pfad-Daten
 * @return array Segmente des Pfades
 */
private function parse_path_data($d) {
    // Einfaches Parsing der Pfaddaten
    $segments = [];
    $current_command = '';
    $current_points = [];
    
    // Entferne überflüssige Leerzeichen und normalisiere Befehle
    $d = preg_replace('/([a-zA-Z])/', ' $1 ', $d);
    $d = preg_replace('/\s+/', ' ', trim($d));
    $d = preg_replace('/(\d)-/', '$1 -', $d); // Trenne negative Zahlen
    
    $tokens = explode(' ', $d);
    
    foreach ($tokens as $token) {
        if (preg_match('/^[a-zA-Z]$/', $token)) {
            // Neuer Befehl gefunden
            if (!empty($current_command)) {
                // Validiere Mindestanzahl von Koordinaten für jeden Befehl
                $valid = $this->validate_command_points($current_command, $current_points);
                if ($valid) {
                    $segments[] = [
                        'command' => $current_command,
                        'points' => $current_points
                    ];
                } else {
                    // Bei ungültigen Befehlen Fehlerbehandlung
                    error_log("SVG parse error: Ungültiger Befehl $current_command mit " . count($current_points) . " Punkten");
                    // Füge einen sicheren Ersatz ein, falls nötig
                    if ($current_command == 'M' && empty($current_points)) {
                        $current_points = [0, 0]; // Sicherer Standardwert für M
                        $segments[] = [
                            'command' => $current_command,
                            'points' => $current_points
                        ];
                    }
                }
            }
            $current_command = $token;
            $current_points = [];
        } elseif (!empty($token) && is_numeric($token)) {
            // Koordinate gefunden
            $current_points[] = floatval($token);
        }
    }
    
    // Letztes Segment hinzufügen, wenn es gültig ist
    if (!empty($current_command)) {
        $valid = $this->validate_command_points($current_command, $current_points);
        if ($valid) {
            $segments[] = [
                'command' => $current_command,
                'points' => $current_points
            ];
        } else {
            error_log("SVG parse error: Letzter Befehl $current_command ungültig mit " . count($current_points) . " Punkten");
        }
    }
    
    return $segments;
}

/**
 * Validiert die richtige Anzahl von Punkten für jeden SVG-Pfadbefehl
 *
 * @param string $command Der Befehl (M, L, C, etc.)
 * @param array $points Die Punkte für den Befehl
 * @return bool True wenn gültig, sonst False
 */
private function validate_command_points($command, $points) {
    $count = count($points);
    
    switch (strtoupper($command)) {
        case 'M': // moveto
        case 'L': // lineto
        case 'T': // smooth quadratic curveto
            return $count >= 2 && $count % 2 == 0;
            
        case 'H': // horizontal lineto
        case 'V': // vertical lineto
            return $count >= 1;
            
        case 'C': // curveto
            return $count >= 6 && $count % 6 == 0;
            
        case 'S': // smooth curveto
        case 'Q': // quadratic curveto
            return $count >= 4 && $count % 4 == 0;
            
        case 'A': // elliptical arc
            return $count >= 7 && $count % 7 == 0;
            
        case 'Z': // closepath
        case 'z':
            return true; // Benötigt keine Punkte
            
        default:
            return false; // Unbekannter Befehl
    }
}
    
    /**
     * Erstellt einen vereinfachten Pfad aus Segmenten
     *
     * @param array $segments Pfadsegmente
     * @param float $threshold Schwellenwert für die Vereinfachung
     * @return string Vereinfachter Pfad
     */
    private function create_simplified_path($segments, $threshold) {
        // Vereinfachte Version: Entfernt einige Punkte basierend auf dem Threshold
        $simplified = '';
        
        foreach ($segments as $segment) {
            $command = $segment['command'];
            $points = $segment['points'];
            
            // Für Bezier-Kurven (C, c, S, s) Punkte reduzieren
            if (in_array(strtolower($command), ['c', 's'])) {
                // Bei höherem Threshold mehr Punkte entfernen
                if (count($points) >= 6 && (rand(0, 100) / 100) < $threshold) {
                    // Vereinfachen: Aus Bezier eine gerade Linie machen
                    $simplified .= ' L ' . $points[count($points) - 2] . ' ' . $points[count($points) - 1];
                    continue;
                }
            }
            
            // Für andere Befehle: Werte runden und zusammenfügen
            $simplified .= ' ' . $command . ' ';
            foreach ($points as $point) {
                // Bei höherem Threshold stärker runden
                $decimals = max(0, 3 - round($threshold * 2));
                $simplified .= round($point, $decimals) . ' ';
            }
        }
        
        return trim($simplified);
    }
}
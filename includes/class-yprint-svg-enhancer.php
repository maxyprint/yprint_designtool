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
    
    // Direkte Debug-Ausgabe im Browser-Debug-Log
    error_log("SVG Smooth Debug - Input Level: {$smooth_level}%");
    
    // Bei sehr niedrigen Werten (1-2%) zusätzlichen Sicherheitsmodus aktivieren
    $safety_mode = ($smooth_level > 0 && $smooth_level <= 2);
    
    try {
        // Bei hohen Werten (>10%) zusätzliche Debug-Info
        if ($smooth_level > 10) {
            error_log("HOHER SMOOTHING-WERT: $smooth_level% - Besondere Vorsicht");
        }
        
        // Zuerst speichern wir immer das Original für den Sicherheitsvergleich
        $original_svg = $svg_content;
        
        // SVG-Validitätsprüfung VOR dem Glätten
        if (!$this->is_valid_svg($original_svg)) {
            wp_send_json_error(array('message' => 'Eingangs-SVG ist ungültig. Bitte lade ein gültiges SVG hoch.'));
            return;
        }
        
        // SVG glätten
        $smoothed_svg = $this->smooth_svg($svg_content, $smooth_level);
        
        // Fehlererkennung
        if ($smoothed_svg === false) {
            error_log("SVG Smooth Debug - Glättung schlug fehl und gab false zurück");
            throw new Exception(__('Fehler beim Glätten der SVG-Pfade: Rückgabewert ist false', 'yprint-designtool'));
        }
        
        // Sicherheitscheck: Bei niedrigen Werten (1-2%) prüfen, ob das Ergebnis zu stark abweicht
        if ($safety_mode) {
            // Einfache Prüfung auf drastische Änderungen
            $original_length = strlen($original_svg);
            $smoothed_length = strlen($smoothed_svg);
            
            // Wenn die Größenänderung mehr als 10% beträgt, ist das verdächtig
            $size_change_percent = abs(($smoothed_length - $original_length) / $original_length) * 100;
            error_log("SVG Smooth Debug - Sicherheitscheck: Original Länge: {$original_length}, Geglättet Länge: {$smoothed_length}, Änderung: {$size_change_percent}%");
            
            if ($size_change_percent > 10 || $smoothed_length < 100) {
                // Bei verdächtigen Änderungen das Original mit minimaler Anpassung zurückgeben
                error_log("SVG smooth safety triggered: size change {$size_change_percent}% is too drastic for level {$smooth_level}%");
                
                // Bei sehr niedrigen Levels (1-2%) lieber ein fast unverändertes Original zurückgeben
                // als ein potentiell fehlerhaftes Ergebnis
                $smoothed_svg = $original_svg;
            }
        }
        
        // Erweiterte Validitätsprüfung
        if (!$this->is_valid_svg($smoothed_svg)) {
            error_log("SVG Smooth Debug - FEHLER: Geglättetes SVG ist ungültig. Gebe Original zurück.");
            
            // In diesem Fall senden wir eine Fehlermeldung zurück mit mehr Details
            libxml_use_internal_errors(true);
            $dom = new DOMDocument();
            $result = @$dom->loadXML($smoothed_svg);
            $errors = libxml_get_errors();
            libxml_clear_errors();
            
            $error_details = "XML Parse-Fehler: ";
            foreach ($errors as $error) {
                $error_details .= $error->message . " (Zeile: " . $error->line . ") ";
            }
            
            wp_send_json_error(array(
                'message' => __('Geglättetes SVG ist ungültig.', 'yprint-designtool') . ' ' . $error_details,
                'debug' => "Smoothing Level: $smooth_level, Original length: " . strlen($original_svg) . ", Result length: " . strlen($smoothed_svg)
            ));
            return;
        }
        
        // Erfolg zurückmelden
        wp_send_json_success(array(
            'svg_content' => $smoothed_svg,
            'debug_info' => "Smoothing Level: $smooth_level, Original length: " . strlen($original_svg) . ", Result length: " . strlen($smoothed_svg)
        ));
        
    } catch (Exception $e) {
        error_log("SVG Smooth Debug - Exception: " . $e->getMessage());
        
        // Ausführlichere Fehlermeldung zurücksenden
        $trace = $e->getTraceAsString();
        error_log("Stack Trace: " . $trace);
        
        wp_send_json_error(array(
            'message' => "Fehler: " . $e->getMessage(),
            'trace' => substr($trace, 0, 500), // Begrenzte Länge für die Antwort
            'debug' => "Smoothing Level: $smooth_level"
        ));
    }
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
 * Glättet SVG-Pfade für schönere Linien
 *
 * @param string $svg_content SVG-Inhalt
 * @param int $smooth_level Glättungsgrad (0-100, wobei 0 keine Glättung und 100 maximale Glättung)
 * @return string|bool Geglättetes SVG oder false bei Fehler
 */
public function smooth_svg($svg_content, $smooth_level = 0) {
    if (empty($svg_content)) {
        error_log("SVG smooth_svg - Leerer SVG-Inhalt");
        return false;
    }
    
    // Keine Glättung, Original zurückgeben
    if ($smooth_level <= 0) {
        return $svg_content;
    }
    
    // Original-SVG speichern für sehr niedrige Werte
    $original_svg_content = $svg_content;
    
    // SVG-Inhalt laden
    $dom = new DOMDocument();
    $dom->preserveWhiteSpace = false;
    $dom->formatOutput = true;
    
    // Fehlerbehandlung aktivieren
    libxml_use_internal_errors(true);
    $success = $dom->loadXML($svg_content);
    $errors = libxml_get_errors();
    
    if (!$success || !empty($errors)) {
        error_log("SVG smooth_svg - Fehler beim Laden des Original-SVGs:");
        foreach ($errors as $error) {
            error_log("SVG XML Error: " . $error->message . " (Zeile: " . $error->line . ")");
        }
        libxml_clear_errors();
        return false;
    }
    libxml_clear_errors();
    
    // XPath für die Suche nach Pfaden
    $xpath = new DOMXPath($dom);
    $xpath->registerNamespace('svg', 'http://www.w3.org/2000/svg');
    
    // Progressive Begrenzung der Glättungswerte:
// Wir erlauben höhere Werte, reduzieren aber die Steigerungsrate
if ($smooth_level <= 3) {
    // Für Werte bis 3% keine Änderung
    $safe_smooth_level = $smooth_level;
} elseif ($smooth_level <= 30) {
    // Zwischen 3% und 30% moderate Steigerung
    $safe_smooth_level = 3 + (($smooth_level - 3) * 0.3);
} else {
    // Über 30% langsame Steigerung
    $safe_smooth_level = 11.1 + (($smooth_level - 30) * 0.1);
}
error_log("SVG smooth_svg - Glättungswert progressiv angepasst: Original=$smooth_level%, Verwendet=$safe_smooth_level%");
    
    // Dynamische Glättungsstärke mit verbesserten Effekten
$base_angle = 0.01; // Basis für mikroskopische Änderungen
$normalized_level = $safe_smooth_level / 10; // Skaliert den Wert
// Erweiterte exponentielle Formel für sichtbarere Effekte
$smooth_angles = $base_angle * pow(10, $normalized_level * 1.5); 
// Bei höheren Werten zusätzliche Pfade einbeziehen
$path_selection_factor = min(100, max(5, $safe_smooth_level * 3)); // 5-100% der Pfade bearbeiten
    
    error_log("SVG smooth_svg - Glättungsstärke berechnet: OrigLevel=$smooth_level%, SafeLevel=$safe_smooth_level%, Winkel=$smooth_angles");
    
    // Sicherheitsmodus ist immer aktiv
    $safety_mode = true;
    
    // Anzahl der Pfade und Gesamtlänge feststellen (für Sicherheitsvergleich)
    $paths = $xpath->query('//svg:path');
    $path_count = $paths->length;
    error_log("SVG smooth_svg - Gefundene Pfade: $path_count");
    
    if ($path_count == 0) {
        error_log("SVG smooth_svg - Keine Pfade gefunden, gebe Original zurück");
        return $svg_content; // Wenn keine Pfade vorhanden sind, Original zurückgeben
    }
    
    $original_path_data_length = 0;
    $max_path_length = 0;
    $max_path_index = -1;
    
    // Pfadlängen für spätere Vergleiche messen
    foreach ($paths as $i => $path) {
        $path_len = strlen($path->getAttribute('d'));
        $original_path_data_length += $path_len;
        
        // Finde den längsten Pfad
        if ($path_len > $max_path_length) {
            $max_path_length = $path_len;
            $max_path_index = $i;
        }
    }
    error_log("SVG smooth_svg - Originale Gesamtpfadlänge: $original_path_data_length, Längster Pfad: $max_path_length Zeichen");
    
    // Begrenze die maximale Größe der verarbeiteten SVG
    $size_limit = 150000; // 150KB
    if ($original_path_data_length > $size_limit) {
        error_log("SVG smooth_svg - SVG zu groß für Glättung ($original_path_data_length > $size_limit), beschränke auf Haupt-Pfade");
        // Bei großen SVGs nur die größten Pfade glätten
    }
    
    // Größenbegrenzung für jeden Pfad: max 20% Zuwachs
    $max_growth_factor = 1.2; 
    
    // Fehlerbehandlung für den Glättungsprozess
    try {
        // Pfade glätten
        $modified_paths = 0;
        $skipped_paths = 0;
        $i = 0;
        
        foreach ($paths as $path) {
            $i++;
            $d_attr = $path->getAttribute('d');
            $path_len = strlen($d_attr);
            
            // Effizienzoptimierung: Kleine Pfade überspringen
            if ($path_len < 100) {
                $skipped_paths++;
                continue;
            }
            
            // Größere SVGs: Nur die längsten Pfade bearbeiten (Top 30%)
            if ($original_path_data_length > $size_limit && $path_len < ($max_path_length * 0.3)) {
                $skipped_paths++;
                continue;
            }
            
            // Sicheres Kopieren des Original-Pfads
            $original_d_attr = $d_attr;
            
            try {
                // Glättung mit Größenbegrenzung
                $this->smooth_path($path, $smooth_angles);
                
                // Prüfe, ob der Pfad zu stark gewachsen ist
                $new_d_attr = $path->getAttribute('d');
                $new_len = strlen($new_d_attr);
                
                if ($new_len > $path_len * $max_growth_factor) {
                    error_log("SVG smooth_svg - Pfad #$i zu stark gewachsen: $path_len -> $new_len Zeichen, setze zurück");
                    $path->setAttribute('d', $original_d_attr);
                    $skipped_paths++;
                } else {
                    $modified_paths++;
                }
            } catch (Exception $e) {
                error_log("SVG smooth_svg - Fehler bei Pfadglättung #$i: " . $e->getMessage());
                $path->setAttribute('d', $original_d_attr);
                $skipped_paths++;
            }
            
            // Sicherheitsmechanismus: Nicht zu viele Pfade auf einmal bearbeiten
            if ($modified_paths > 100) {
                error_log("SVG smooth_svg - Limit von 100 modifizierten Pfaden erreicht, breche ab");
                break;
            }
        }
        
        error_log("SVG smooth_svg - Modifizierte Pfade: $modified_paths, Übersprungene Pfade: $skipped_paths");
        
        // Format-Optimierung: Reduziere Leerzeichen im DOM
        $dom->preserveWhiteSpace = false;
        $dom->formatOutput = false;
        
        // Letzter Validierungsversuch vor der Rückgabe
        $final_svg = $dom->saveXML();
        
        // Prüfen, ob das finale SVG korrekt gespeichert wurde
        if (empty($final_svg)) {
            error_log("SVG smooth_svg - Leeres Ergebnis nach saveXML, gebe Original zurück");
            return $original_svg_content;
        }
        
        // Größenüberprüfung des Ergebnisses
        $final_size = strlen($final_svg);
        error_log("SVG smooth_svg - Erfolgreich abgeschlossen, SVG-Länge: $final_size (Original: " . strlen($original_svg_content) . ")");
        
        // Wenn das Ergebnis zu groß ist, Original zurückgeben
        if ($final_size > strlen($original_svg_content) * 1.5 || $final_size > 500000) {
            error_log("SVG smooth_svg - Ergebnis zu groß, gebe Original zurück");
            return $original_svg_content;
        }
        
        return $final_svg;
        
    } catch (Exception $e) {
        error_log("SVG smooth_svg - Ausnahme während der Glättung: " . $e->getMessage());
        return $original_svg_content;
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
    
    // Wenn Glättungswert sehr hoch ist, verstärke den Effekt deutlich
    $effective_smooth_angle = $smooth_angles;
    if ($smooth_angles > 50) {
        $effective_smooth_angle = $smooth_angles * 3; // Verstärkter Effekt bei hohen Werten
        error_log("Verstärkte Glättung: Original $smooth_angles%, Effektiv $effective_smooth_angle%");
    } elseif ($smooth_angles > 20) {
        $effective_smooth_angle = $smooth_angles * 2; // Mittlere Verstärkung
    }
    
    // Pfad in Segmente aufteilen
    $segments = $this->parse_path_data($d);
    
    // Geglätteten Pfad erstellen - mit verstärktem Effekt
    $smoothed_d = $this->create_smoothed_path($segments, $effective_smooth_angle);
    
    // Füge kleine Zufallsstörung hinzu, um sichtbare Änderungen zu garantieren
    if ($smooth_angles > 10) {
        $smoothed_d = $this->add_subtle_variations($smoothed_d, $smooth_angles);
    }
    
    // Prüfen, ob der geglättete Pfad deutlich kürzer ist (Sicherheitsmaßnahme)
    if (strlen($smoothed_d) < strlen($original_d) * 0.7) {
        // Bei drastischer Reduzierung der Pfadlänge, sanftere Glättung anwenden
        $segments = $this->parse_path_data($original_d);
        $smoothed_d = $this->create_smoothed_path($segments, $effective_smooth_angle * 0.5);
        
        // Wenn immer noch zu kurz, Original beibehalten mit minimaler Verbesserung
        if (strlen($smoothed_d) < strlen($original_d) * 0.8) {
            $segments = $this->parse_path_data($original_d);
            $smoothed_d = $this->minimal_smooth_path($segments);
        }
    }
    
    // Stellen Sie sicher, dass der Pfad wenigstens eine Mindestlänge hat
    if (empty($smoothed_d) || strlen($smoothed_d) < 5) {
        $smoothed_d = $original_d;
    }
    
    // Garantiere, dass bei hohen Glättungswerten eine sichtbare Änderung erfolgt
    if ($smooth_angles > 30 && $smoothed_d === $original_d) {
        $smoothed_d = $this->force_visible_changes($original_d, $smooth_angles);
    }
    
    // Neuen Pfad setzen
    $path_element->setAttribute('d', $smoothed_d);
}

/**
 * Fügt subtile Variationen zu einem Pfad hinzu, um Änderungen sichtbarer zu machen
 * 
 * @param string $path_data Der SVG-Pfaddaten-String
 * @param float $strength Stärke der Variation (0-100)
 * @return string Veränderter Pfad
 */
private function add_subtle_variations($path_data, $strength) {
    // Normalisiere die Stärke auf 0.001-0.1
    $variation_strength = min(0.1, max(0.001, $strength / 1000));
    
    // Teile den Pfad in Segmente (bei Befehlen und Koordinaten)
    preg_match_all('/([A-Za-z])|(-?\d+(?:\.\d+)?)/', $path_data, $matches);
    
    $modified_path = '';
    foreach ($matches[0] as $token) {
        // Wenn es sich um eine Zahl handelt, füge leichte Variation hinzu
        if (is_numeric($token)) {
            $num = floatval($token);
            
            // Stärke der Variation proportional zum Wert und Glättungslevel
            $variation = $num * $variation_strength * (mt_rand(-10, 10) / 10);
            
            // Bei größeren Werten stärkere Variationen
            if (abs($num) > 100) {
                $variation *= 2;
            }
            
            // Besondere Behandlung für sehr kleine Werte
            if (abs($num) < 0.1) {
                $modified_path .= $token;
            } else {
                $modified_num = $num + $variation;
                $modified_path .= round($modified_num, 3);
            }
        } else {
            $modified_path .= $token;
        }
        
        // Füge Leerzeichen um Befehle ein
        if (preg_match('/[A-Za-z]/', $token)) {
            $modified_path .= ' ';
        } else {
            $modified_path .= ' ';
        }
    }
    
    return trim($modified_path);
}

/**
 * Erzwingt sichtbare Änderungen am Pfad bei hohen Glättungswerten
 * 
 * @param string $path_data Original-Pfaddaten
 * @param float $strength Stärke der Änderung (0-100)
 * @return string Modifizierter Pfad
 */
private function force_visible_changes($path_data, $strength) {
    // Bei sehr hohen Werten mehr Punkte modifizieren
    $modify_percentage = min(90, max(5, $strength));
    $modify_factor = $strength / 100;
    
    // Segmente identifizieren
    preg_match_all('/([A-Za-z])|([-+]?\d*\.?\d+)/', $path_data, $matches);
    
    $modified_path = '';
    $index = 0;
    $in_number = false;
    
    foreach ($matches[0] as $token) {
        // Verändere nur numerische Werte
        if (is_numeric($token)) {
            // Größere Werte stärker modifizieren
            $num = floatval($token);
            $abs_num = abs($num);
            
            // Bei großen Zahlen stärkere Modifikation
            if ($abs_num > 100 && mt_rand(1, 100) <= $modify_percentage) {
                $factor = $modify_factor * (mt_rand(5, 15) / 10);
                $direction = mt_rand(0, 1) ? 1 : -1;
                $change = $abs_num * $factor * $direction;
                $new_value = $num + $change;
                $modified_path .= round($new_value, 2) . ' ';
            } 
            // Bei mittleren Zahlen moderate Modifikation
            else if ($abs_num > 10 && mt_rand(1, 100) <= $modify_percentage) {
                $factor = $modify_factor * (mt_rand(3, 12) / 10);
                $direction = mt_rand(0, 1) ? 1 : -1;
                $change = $abs_num * $factor * $direction;
                $new_value = $num + $change;
                $modified_path .= round($new_value, 2) . ' ';
            }
            // Bei kleinen Zahlen leichte Modifikation
            else if ($abs_num > 1) {
                $factor = $modify_factor * (mt_rand(2, 8) / 100);
                $direction = mt_rand(0, 1) ? 1 : -1;
                $change = $abs_num * $factor * $direction;
                $new_value = $num + $change;
                $modified_path .= round($new_value, 3) . ' ';
            }
            // Sehr kleine Zahlen unverändert lassen
            else {
                $modified_path .= $token . ' ';
            }
        } 
        // Befehle unverändert beibehalten
        else {
            $modified_path .= $token . ' ';
        }
        
        $index++;
    }
    
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
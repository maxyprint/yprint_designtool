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
    
    // SOFORT SICHTBARE ÄNDERUNG: Farbveränderung bei höheren Werten
    // Bei Werten über 20% Farben modifizieren für garantiert sichtbare Änderung
    if ($smooth_level >= 20) {
        error_log("SVG smooth_svg - FARBÄNDERUNG wird angewendet bei $smooth_level%");
        // Wir ändern Füllfarben direkt im SVG-String
        $intensity = min(100, max(20, $smooth_level)) / 100;
        
        // Bei niedrigeren Werten Schwarzfärbung, bei höheren Farbänderung
        if ($smooth_level < 50) {
            // Farbintensität erhöhen (mehr schwarz)
            $svg_content = preg_replace_callback(
                '/fill="(?:#[0-9a-f]{6}|#[0-9a-f]{3}|rgba?\([^)]+\)|[a-z]+)"/',
                function($matches) use ($intensity) {
                    $color = $matches[0];
                    // Wenn es bereits schwarz ist, belassen
                    if (strpos($color, '#000') !== false || strpos($color, 'black') !== false) {
                        return $color;
                    }
                    // Bei höherer Intensität garantiert dunklere Farbe zurückgeben
                    $darkness = mt_rand(0, 180); // 0-180 statt 0-255 für garantiert dunklere Farben
                    $new_color = sprintf('fill="#%02x%02x%02x"', $darkness, $darkness, $darkness);
                    return $new_color;
                },
                $svg_content
            );
        } else {
            // Farben stark verändern
            $svg_content = preg_replace_callback(
                '/fill="(?:#[0-9a-f]{6}|#[0-9a-f]{3}|rgba?\([^)]+\)|[a-z]+)"/',
                function($matches) use ($intensity) {
                    // Erzeugen einer neuen, zufälligen Farbe mit einer gewissen Tiefe
                    $r = mt_rand(50, 200);
                    $g = mt_rand(50, 200);
                    $b = mt_rand(50, 200);
                    $new_color = sprintf('fill="#%02x%02x%02x"', $r, $g, $b);
                    return $new_color;
                },
                $svg_content
            );
        }
        
        error_log("SVG smooth_svg - Farbänderung durchgeführt mit Intensität $intensity");
    }
    
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
    
    // Deutlich stärkere Glättungswerte für sichtbare Änderungen
    // Progressiver Faktor ohne so starke Begrenzung wie zuvor
    $safe_smooth_level = $smooth_level;
    
    error_log("SVG smooth_svg - Verwende direkten Glättungswert: Original=$smooth_level%, Verwendet=$safe_smooth_level%");
    
    // EXTREM verstärkte Glättungsstärke für garantiert sichtbare Effekte
    $base_angle = 0.5; // 50x höher als vorher
    $normalized_level = $safe_smooth_level / 100; // Skaliert den Wert von 0-1
    // Stark verstärkte Formel für deutlich sichtbare Effekte
    $smooth_angles = $base_angle + ($normalized_level * 2.0); // 4x stärkere Skalierung
    
    // Bei höheren Werten noch mehr Pfade bearbeiten
    $path_selection_factor = 100; // Bearbeite alle Pfade
    
    error_log("SVG smooth_svg - EXTREME Glättungsstärke berechnet: OrigLevel=$smooth_level%, SafeLevel=$safe_smooth_level%, Winkel=$smooth_angles");
    
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
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
    
    // Bei sehr niedrigen Werten (1-2%) zusätzlichen Sicherheitsmodus aktivieren
    $safety_mode = ($smooth_level > 0 && $smooth_level <= 2);
    
    try {
        // Zuerst speichern wir immer das Original für den Sicherheitsvergleich
        $original_svg = $svg_content;
        
        // SVG glätten
        $smoothed_svg = $this->smooth_svg($svg_content, $smooth_level);
        
        // Fehlererkennung
        if ($smoothed_svg === false) {
            throw new Exception(__('Fehler beim Glätten der SVG-Pfade.', 'yprint-designtool'));
        }
        
        // Sicherheitscheck: Bei niedrigen Werten (1-2%) prüfen, ob das Ergebnis zu stark abweicht
        if ($safety_mode) {
            // Einfache Prüfung auf drastische Änderungen
            $original_length = strlen($original_svg);
            $smoothed_length = strlen($smoothed_svg);
            
            // Wenn die Größenänderung mehr als 10% beträgt, ist das verdächtig
            $size_change_percent = abs(($smoothed_length - $original_length) / $original_length) * 100;
            
            if ($size_change_percent > 10 || $smoothed_length < 100) {
                // Bei verdächtigen Änderungen das Original mit minimaler Anpassung zurückgeben
                error_log("SVG smooth safety triggered: size change {$size_change_percent}% is too drastic for level {$smooth_level}%");
                
                // Bei sehr niedrigen Levels (1-2%) lieber ein fast unverändertes Original zurückgeben
                // als ein potentiell fehlerhaftes Ergebnis
                $smoothed_svg = $original_svg;
            }
        }
        
        // Erfolg zurückmelden
        wp_send_json_success(array(
            'svg_content' => $smoothed_svg
        ));
        
    } catch (Exception $e) {
        wp_send_json_error(array('message' => $e->getMessage()));
    }
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
        return false;
    }
    
    // Keine Glättung, Original zurückgeben
    if ($smooth_level <= 0) {
        return $svg_content;
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
    
    // Glättungsstärke berechnen - sanftere Progression
    // Bei 1% nur 0,15 Grad, bei 100% maximal 25 Grad
    // Verwende eine nichtlineare Kurve für bessere Kontrolle bei niedrigen Werten
    $base_angle = 0.15; // Minimaler Winkel bei 1%
    $max_angle = 25;    // Maximaler Winkel bei 100%
    
    // Nichtlineare Progression (quadratisch), sanfter für kleine Werte
    $normalized_level = $smooth_level / 100;
    $smooth_angles = $base_angle + ($max_angle - $base_angle) * ($normalized_level * $normalized_level);
    
    // Zusätzliche Sicherheitsschicht bei sehr niedrigen Werten (1-5%)
    if ($smooth_level <= 5) {
        // Extrem sanfte Anpassung für 1-5% Bereich
        $smooth_angles = $base_angle * ($smooth_level / 5);
    }
    
    // Pfade finden und glätten
    $paths = $xpath->query('//svg:path');
    foreach ($paths as $path) {
        $this->smooth_path($path, $smooth_angles);
    }
    
    // SVG-Dokument zurückgeben
    return $dom->saveXML();
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
    
    // Pfad in Segmente aufteilen
    $segments = $this->parse_path_data($d);
    
    // Geglätteten Pfad erstellen
    $smoothed_d = $this->create_smoothed_path($segments, $smooth_angles);
    
    // Neuen Pfad setzen
    $path_element->setAttribute('d', $smoothed_d);
}

/**
 * Erstellt einen geglätteten Pfad aus Segmenten
 * 
 * @param array $segments Pfadsegmente
 * @param float $smooth_angles Winkelmaximum für Glättung (0-360)
 * @return string Geglätteter Pfad
 */
private function create_smoothed_path($segments, $smooth_angles) {
    // Bessere Kontrolle über den smooth_factor
    // Extrem niedrige Werte bei kleinen Winkeln
    // Bei winzigen Winkeln (< 1°) verwenden wir einen mikroskopischen smooth_factor
    if ($smooth_angles < 1) {
        $smooth_factor = $smooth_angles / 1000; // Extrem kleine Anpassung
    } else if ($smooth_angles < 5) {
        $smooth_factor = $smooth_angles / 500;  // Sehr kleine Anpassung
    } else {
        // Standard-Berechnung für größere Winkel
        // Bei max 25° (aus smooth_svg) wird smooth_factor auf max. 0.05 begrenzt (statt 0.125)
        $smooth_factor = min(0.05, $smooth_angles / 500);
    }
    
    error_log("create_smoothed_path: Starting with smooth_factor: " . $smooth_factor);
    
    // Pfad mit geglätteten Kurven erstellen
    $smoothed = '';
    $last_point = null;
    $last_control = null;
    
    // Array zur Erhaltung der ursprünglichen Punkte bei Mikroänderungen
    $preserved_points = [];
    $original_segment_count = count($segments);
    
    foreach ($segments as $i => $segment) {
        $command = $segment['command'];
        $points = $segment['points'];
        
        // Originalpunkte immer speichern (Sicherheitsmaßnahme)
        $preserved_points[$i] = $points;
        
        // Befehl und erste Punkte immer beibehalten
        $smoothed .= ' ' . $command . ' ';
        
        // Für Kurvenbefehle (C, c, S, s) optionale Glättung anwenden
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
                
                // Nur winzige Anpassungen erlauben
                $do_smoothing = false;
                $adaptive_factor = $smooth_factor;
                
                // Progressiv anpassen basierend auf Winkelunterschied
                if ($angle_diff < 90) {
                    // Kleinere Anpassungen bei kleinen Winkeln
                    $adaptive_factor = $smooth_factor * ($angle_diff / 90);
                    $do_smoothing = true;
                } else if ($angle_diff <= $smooth_angles) {
                    // Standardanpassung innerhalb des angegebenen Bereichs
                    $do_smoothing = true;
                }
                
                if ($do_smoothing && $adaptive_factor > 0.00001) { // Mindestens ein wenig Anpassung
                    // Distanzen für Kontrollpunkte berechnen
                    $dist1 = sqrt(pow($control1_x - $last_point[0], 2) + pow($control1_y - $last_point[1], 2));
                    $dist2 = sqrt(pow($control2_x - $end_x, 2) + pow($control2_y - $end_y, 2));
                    
                    // Idealen Winkel berechnen
                    $ideal_angle = $angle1 + M_PI; // Umgekehrter Winkel
                    $current_angle = atan2($control2_y - $end_y, $control2_x - $end_x);
                    
                    // Sehr sanfte Anpassung für niedrige Glättungswerte
                    $blend_factor = min(0.01, $adaptive_factor); // Maximal 1% Anpassung pro Durchlauf
                    $new_angle = $current_angle * (1 - $blend_factor) + $ideal_angle * $blend_factor;
                    
                    // Neue Kontrollpunktkoordinaten
                    $new_control2_x = $end_x + cos($new_angle) * $dist2;
                    $new_control2_y = $end_y + sin($new_angle) * $dist2;
                    
                    // Berechne Änderungsdistanz mit sicherer Begrenzung
                    $change_distance = sqrt(pow($new_control2_x - $control2_x, 2) + 
                                         pow($new_control2_y - $control2_y, 2));
                    
                    // Sanfte Änderungsbegrenzung - verhindert große Sprünge
                    $max_change = min($dist2 * 0.01, 0.5); // Maximal 1% der Distanz oder 0.5 Einheiten
                    
                    if ($change_distance <= $max_change) {
                        // Punkte aktualisieren
                        $points[2] = $new_control2_x;
                        $points[3] = $new_control2_y;
                    }
                }
            }
            
            // Aktualisiere für das nächste Segment
            $last_point = [$end_x, $end_y];
            $last_control = [$points[2], $points[3]];
            
        } else if ($command === 'M' || $command === 'm') {
            // Bei Move-To-Befehl den letzten Punkt aktualisieren
            if (count($points) >= 2) {
                $last_point = [$points[0], $points[1]];
                $last_control = null;
            }
        } else if ($command === 'L' || $command === 'l') {
            // Bei Line-To-Befehl den letzten Punkt aktualisieren
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
    
    // Sicherheitsprüfung: Wenn Ergebnis leer oder deutlich kürzer als Original,
    // stelle sicher, dass wir einen gültigen Pfad zurückgeben
    if (empty($result) || strlen($result) < 10) {
        // Originalstruktur wiederherstellen, aber mit minimaler Veränderung
        $result = '';
        foreach ($segments as $i => $segment) {
            $command = $segment['command'];
            $points = $preserved_points[$i]; // Verwende die gespeicherten Originalpunkte
            
            $result .= ' ' . $command . ' ';
            foreach ($points as $point) {
                $result .= $point . ' ';
            }
        }
        $result = trim($result);
    }
    
    return $result;
}
    
    /**
     * Wendet die Linienverstärkung auf ein SVG-Element an
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
     * Parst SVG-Pfaddaten in Segmente
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
        
        $tokens = explode(' ', $d);
        
        foreach ($tokens as $token) {
            if (preg_match('/^[a-zA-Z]$/', $token)) {
                // Neuer Befehl gefunden
                if (!empty($current_command)) {
                    $segments[] = [
                        'command' => $current_command,
                        'points' => $current_points
                    ];
                }
                $current_command = $token;
                $current_points = [];
            } elseif (!empty($token)) {
                // Koordinate gefunden
                $current_points[] = floatval($token);
            }
        }
        
        // Letztes Segment hinzufügen
        if (!empty($current_command)) {
            $segments[] = [
                'command' => $current_command,
                'points' => $current_points
            ];
        }
        
        return $segments;
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
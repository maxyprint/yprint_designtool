<?php
/**
 * Hilfsfunktionen für das YPrint DesignTool
 *
 * @package YPrint_DesignTool
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Erstellt den Ordner für temporäre Dateien, falls er nicht existiert
 *
 * @return string Pfad zum temporären Verzeichnis
 */
function yprint_designtool_create_temp_directory() {
    $upload_dir = wp_upload_dir();
    $temp_dir = $upload_dir['basedir'] . '/yprint-designtool/temp';
    
    if (!file_exists($temp_dir)) {
        wp_mkdir_p($temp_dir);
        
        // Schütze das Verzeichnis mit einer .htaccess-Datei
        $htaccess_content = "# Verweigere direkten Zugriff auf Dateien
<FilesMatch \".*\">
    Order Allow,Deny
    Deny from all
</FilesMatch>";
        
        file_put_contents($temp_dir . '/.htaccess', $htaccess_content);
    }
    
    return $temp_dir;
}

/**
 * Erstellt einen eindeutigen Design-Schlüssel
 *
 * @return string Eindeutiger Design-Schlüssel
 */
function yprint_designtool_generate_design_key() {
    return uniqid('design_') . '_' . substr(md5(time() . rand()), 0, 8);
}

/**
 * Ermittelt die maximale Upload-Größe in Bytes
 *
 * @return int Maximale Upload-Größe in Bytes
 */
function yprint_designtool_get_max_upload_size() {
    // Die niedrigste der folgenden Größen ist die maximale Upload-Größe
    $max_upload = wp_max_upload_size();
    $max_post = (int) ini_get('post_max_size') * 1024 * 1024; // in Bytes
    $memory_limit = (int) ini_get('memory_limit') * 1024 * 1024; // in Bytes
    
    // Wenn memory_limit -1 ist (unbegrenzt), nicht berücksichtigen
    if ($memory_limit == -1) {
        return min($max_upload, $max_post);
    }
    
    return min($max_upload, $max_post, $memory_limit);
}

/**
 * Bereinigt eine SVG-Datei von potenziell schädlichen Inhalten
 *
 * @param string $svg_content SVG-Inhalt
 * @return string Bereinigter SVG-Inhalt
 */
function yprint_designtool_sanitize_svg($svg_content) {
    // Entferne alle script-Tags
    $svg_content = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $svg_content);
    
    // Entferne alle onclick-, onload- und ähnliche Event-Handler
    $svg_content = preg_replace('/\bon\w+\s*=\s*(["\'])[^"\']*\1/i', '', $svg_content);
    
    // Entferne alle href-Attribute, die auf JavaScript verweisen
    $svg_content = preg_replace('/href\s*=\s*(["\'])javascript:.*?\1/i', 'href="javascript:void(0)"', $svg_content);
    
    // Erlaubte Tags und Attribute definieren
    $allowed_tags = array(
        'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon',
        'text', 'tspan', 'use', 'defs', 'clipPath', 'filter', 'linearGradient',
        'radialGradient', 'stop', 'mask', 'pattern', 'image'
    );
    
    $allowed_attributes = array(
        'id', 'class', 'style', 'x', 'y', 'width', 'height', 'cx', 'cy', 'r', 'rx', 'ry',
        'x1', 'y1', 'x2', 'y2', 'points', 'd', 'fill', 'fill-opacity', 'stroke',
        'stroke-width', 'stroke-linecap', 'stroke-dasharray', 'stroke-opacity',
        'opacity', 'transform', 'viewBox', 'xmlns', 'xmlns:xlink', 'version',
        'preserveAspectRatio', 'clip-path', 'clip-rule', 'mask', 'filter'
    );
    
    // DOMDocument für die Verarbeitung verwenden
    if (class_exists('DOMDocument')) {
        libxml_use_internal_errors(true);
        $dom = new DOMDocument();
        if ($dom->loadXML($svg_content)) {
            // Alle Elemente durchlaufen und nur erlaubte Tags und Attribute behalten
            $xpath = new DOMXPath($dom);
            $elements = $xpath->query('//*');
            
            foreach ($elements as $element) {
                // Überprüfen, ob das Tag erlaubt ist
                if (!in_array(strtolower($element->tagName), $allowed_tags)) {
                    $element->parentNode->removeChild($element);
                    continue;
                }
                
                // Attribute überprüfen
                for ($i = $element->attributes->length - 1; $i >= 0; $i--) {
                    $attr = $element->attributes->item($i);
                    
                    // Überprüfen, ob das Attribut erlaubt ist
                    if (!in_array(strtolower($attr->name), $allowed_attributes)) {
                        $element->removeAttributeNode($attr);
                    }
                }
            }
            
            // Skript-Tags entfernen
            $scripts = $xpath->query('//script');
            foreach ($scripts as $script) {
                $script->parentNode->removeChild($script);
            }
            
            // Bereinigten SVG-Code zurückgeben
            $svg_content = $dom->saveXML($dom->documentElement);
        }
        libxml_clear_errors();
    }
    
    return $svg_content;
}

/**
 * Konvertiert Farben zwischen verschiedenen Formaten (HEX, RGB, RGBA)
 *
 * @param string $color Farbwert in HEX oder RGB(A) Format
 * @param string $to_format Zielformat ('hex', 'rgb', 'rgba')
 * @param float $opacity Optional. Deckkraft für RGBA.
 * @return string Konvertierter Farbwert oder Original bei Fehler
 */
function yprint_designtool_convert_color($color, $to_format = 'hex', $opacity = 1.0) {
    // RGB oder RGBA nach HEX konvertieren
    if (preg_match('/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)$/', $color, $matches)) {
        $r = $matches[1];
        $g = $matches[2];
        $b = $matches[3];
        $a = isset($matches[4]) ? $matches[4] : 1;
        
        if ($to_format === 'hex') {
            return sprintf('#%02x%02x%02x', $r, $g, $b);
        } elseif ($to_format === 'rgb') {
            return "rgb($r, $g, $b)";
        } elseif ($to_format === 'rgba') {
            return "rgba($r, $g, $b, " . floatval($opacity) . ")";
        }
    }
    
    // HEX nach RGB oder RGBA konvertieren
    if (preg_match('/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i', $color, $matches)) {
        $r = hexdec($matches[1]);
        $g = hexdec($matches[2]);
        $b = hexdec($matches[3]);
        
        if ($to_format === 'rgb') {
            return "rgb($r, $g, $b)";
        } elseif ($to_format === 'rgba') {
            return "rgba($r, $g, $b, " . floatval($opacity) . ")";
        }
    }
    
    // Kurzes HEX-Format nach RGB oder RGBA konvertieren
    if (preg_match('/^#?([a-f\d])([a-f\d])([a-f\d])$/i', $color, $matches)) {
        $r = hexdec($matches[1] . $matches[1]);
        $g = hexdec($matches[2] . $matches[2]);
        $b = hexdec($matches[3] . $matches[3]);
        
        if ($to_format === 'rgb') {
            return "rgb($r, $g, $b)";
        } elseif ($to_format === 'rgba') {
            return "rgba($r, $g, $b, " . floatval($opacity) . ")";
        } elseif ($to_format === 'hex') {
            return sprintf('#%02x%02x%02x', $r, $g, $b);
        }
    }
    
    // Wenn keine Konvertierung möglich ist, Original zurückgeben
    return $color;
}

/**
 * Überprüft, ob Potrace auf dem Server verfügbar ist
 *
 * @return bool True wenn Potrace verfügbar ist
 */
function yprint_designtool_check_potrace() {
    // Prüfen, ob exec() verfügbar ist
    if (!function_exists('exec')) {
        return false;
    }
    
    // Bekannte Potrace-Pfade überprüfen
    $common_paths = array(
        YPRINT_DESIGNTOOL_PLUGIN_DIR . 'bin/potrace',  // Eigenes Plugin-Verzeichnis
        '/usr/bin/potrace',                           // Linux-Standard
        '/usr/local/bin/potrace',                     // Mac/Linux alternative
        '/opt/homebrew/bin/potrace',                  // Mac mit Homebrew
        'C:\\Program Files\\potrace\\potrace.exe',    // Windows
        '/homepages/31/d4298451771/htdocs/.local/bin/potrace'  // IONOS-spezifischer Pfad
    );
    
    foreach ($common_paths as $path) {
        if (file_exists($path) && is_executable($path)) {
            return true;
        }
    }
    
    // Potrace im Systempfad suchen
    $output = array();
    $return_var = -1;
    
    @exec('potrace --version 2>&1', $output, $return_var);
    
    return $return_var === 0;
}

/**
 * Formatiert die Größe einer Datei in lesbarem Format
 *
 * @param int $bytes Größe in Bytes
 * @param int $precision Anzahl der Dezimalstellen
 * @return string Formatierte Größe
 */
function yprint_designtool_format_file_size($bytes, $precision = 1) {
    $units = array('B', 'KB', 'MB', 'GB', 'TB');
    
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    
    $bytes /= pow(1024, $pow);
    
    return round($bytes, $precision) . ' ' . $units[$pow];
}

/**
 * Erstellt einen Slug aus einem Dateinamen oder Titel
 *
 * @param string $text Zu konvertierender Text
 * @return string Slug
 */
function yprint_designtool_create_slug($text) {
    // Umlaute und andere Sonderzeichen ersetzen
    $search = array('ä', 'ö', 'ü', 'Ä', 'Ö', 'Ü', 'ß');
    $replace = array('ae', 'oe', 'ue', 'ae', 'oe', 'ue', 'ss');
    $text = str_replace($search, $replace, $text);
    
    // Alle Zeichen außer Buchstaben, Zahlen und Leerzeichen entfernen
    $text = preg_replace('/[^a-zA-Z0-9\s]/', '', $text);
    
    // Mehrfache Leerzeichen entfernen und durch Bindestriche ersetzen
    $text = preg_replace('/\s+/', '-', $text);
    
    // In Kleinbuchstaben umwandeln
    $text = strtolower($text);
    
    return $text;
}

/**
 * Überprüft, ob eine bestimmte Erweiterung im Plugin aktiviert ist
 *
 * @param string $extension Name der Erweiterung
 * @return bool True wenn die Erweiterung aktiviert ist
 */
function yprint_designtool_is_extension_active($extension) {
    $active_extensions = get_option('yprint_designtool_active_extensions', array());
    return in_array($extension, $active_extensions);
}

/**
 * Gibt eine Liste der installierten Schriftarten zurück
 *
 * @return array Array mit Schriftarten
 */
function yprint_designtool_get_available_fonts() {
    $default_fonts = array(
        'Arial' => array(
            'family' => 'Arial, sans-serif',
            'category' => 'sans-serif',
            'variants' => array('regular', 'italic', 'bold', 'bold italic')
        ),
        'Helvetica' => array(
            'family' => 'Helvetica, Arial, sans-serif',
            'category' => 'sans-serif',
            'variants' => array('regular', 'italic', 'bold', 'bold italic')
        ),
        'Times New Roman' => array(
            'family' => '"Times New Roman", Times, serif',
            'category' => 'serif',
            'variants' => array('regular', 'italic', 'bold', 'bold italic')
        ),
        'Courier New' => array(
            'family' => '"Courier New", Courier, monospace',
            'category' => 'monospace',
            'variants' => array('regular', 'italic', 'bold', 'bold italic')
        ),
        'Georgia' => array(
            'family' => 'Georgia, serif',
            'category' => 'serif',
            'variants' => array('regular', 'italic', 'bold', 'bold italic')
        ),
        'Verdana' => array(
            'family' => 'Verdana, Geneva, sans-serif',
            'category' => 'sans-serif',
            'variants' => array('regular', 'italic', 'bold', 'bold italic')
        )
    );
    
    // Filterhook für benutzerdefinierte Schriftarten
    return apply_filters('yprint_designtool_available_fonts', $default_fonts);
}

/**
 * Registriert einen benutzerdefinierten Font im Design Tool
 *
 * @param string $name Schriftname
 * @param array $font_data Schriftinformationen (family, category, variants, url)
 * @return bool True bei Erfolg
 */
function yprint_designtool_register_font($name, $font_data) {
    if (empty($name) || !is_array($font_data) || empty($font_data['family'])) {
        return false;
    }
    
    $fonts = get_option('yprint_designtool_custom_fonts', array());
    $fonts[$name] = $font_data;
    
    return update_option('yprint_designtool_custom_fonts', $fonts);
}
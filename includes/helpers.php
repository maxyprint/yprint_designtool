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
 * Erstellt eine Vorschau-URL für ein Design
 *
 * @param int|string $design_id Design-ID oder eindeutiger Schlüssel
 * @param string $size Größe der Vorschau ('thumbnail', 'medium', 'large', 'full')
 * @return string URL zur Vorschau-Datei
 */
function yprint_designtool_get_preview_url($design_id, $size = 'medium') {
    $upload_dir = wp_upload_dir();
    $design_dir = $upload_dir['baseurl'] . '/yprint-designtool/designs';
    
    // Standardwerte für Größen
    $sizes = array(
        'thumbnail' => '150x150',
        'medium' => '300x300',
        'large' => '600x600',
        'full' => 'original'
    );
    
    $size_suffix = isset($sizes[$size]) ? '-' . $sizes[$size] : '';
    
    // Generiere die URL basierend auf der Design-ID
    $preview_url = $design_dir . '/' . $design_id . $size_suffix . '.png';
    
    return $preview_url;
}

/**
 * Generiert einen eindeutigen Design-Schlüssel
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
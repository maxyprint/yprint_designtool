<?php
/**
 * Vectorizer-Klasse für YPrint DesignTool
 * 
 * Stellt Funktionen zur Vektorisierung von Bildern bereit
 * Basiert auf der bestehenden YPrint_Vectorizer-Klasse
 */

// Sicherheitscheck: Direkten Zugriff auf diese Datei verhindern
if (!defined('ABSPATH')) {
    exit;
}

class YPrint_Vectorizer {
    /**
     * Singleton-Instanz
     */
    private static $instance = null;
    
    /**
     * Trace engine type: potrace oder autotrace
     */
    protected $engine_type = 'potrace';
    
    /**
     * Standard-Vektorisierungsoptionen
     */
    private $default_options = array(
        // Allgemeine Optionen
        'detail_level' => 'medium',      // low, medium, high, ultra
        'invert' => false,               // Farben invertieren
        'remove_background' => true,     // Hintergrund entfernen
        
        // Potrace-spezifische Optionen
        'brightness_threshold' => 0.45,  // Helligkeitsschwelle für die Schwarzweiß-Umwandlung
        'optitolerance' => 0.2,          // Optimierungstoleranz
        'alphamax' => 1.0,               // Maximaler Winkel für Kurvenoptimierung
        'turdsize' => 2,                 // Größe des Rauschentfernungsfilters
        'opticurve' => 1,                // Kurvenoptimierung aktivieren
        
        // Farboptionen
        'color_type' => 'mono',          // mono, color, gray
        'colors' => 8,                   // Anzahl der Farben bei Farb-Vektorisierung
        'stack_colors' => true,          // Farben stapeln (Ebenen)
        'smooth_colors' => false,        // Farbübergänge glätten
    );
    
    /**
     * Konstruktor
     */
    private function __construct() {
        // Hooks und Filter registrieren
    }
    
    /**
     * Singleton-Instanz abrufen
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Überprüft, ob Potrace verfügbar ist
     *
     * @return boolean True wenn verfügbar, sonst false
     */
    public function check_potrace_exists() {
        // Erst prüfen, ob wir das Binary in unserem Plugin-Verzeichnis haben
        $plugin_potrace = YPRINT_DESIGNTOOL_PATH . 'core/vectorizer/bin/potrace';
        
        if (file_exists($plugin_potrace) && is_executable($plugin_potrace)) {
            return true;
        }
        
        // Spezifischen IONOS-Pfad prüfen
        $ionos_potrace = '/homepages/31/d4298451771/htdocs/.local/bin/potrace';
        if (file_exists($ionos_potrace) && is_executable($ionos_potrace)) {
            // Optional: Symlink oder Skript im bin-Verzeichnis für einfacheren Zugriff erstellen
            if (!file_exists(dirname($plugin_potrace))) {
                @mkdir(dirname($plugin_potrace), 0755, true);
            }
            
            if (!file_exists($plugin_potrace)) {
                // Wrapper-Skript erstellen, das auf das IONOS Potrace zeigt
                $script_content = "#!/bin/sh\n$ionos_potrace \"\$@\"\n";
                @file_put_contents($plugin_potrace, $script_content);
                @chmod($plugin_potrace, 0755);
            }
            
            return true;
        }
        
        // Standard-Systemprüfung
        $output = array();
        $return_val = 0;
        @exec('which potrace 2>&1', $output, $return_val);
        
        return $return_val === 0;
    }
    
    /**
     * Bild vektorisieren
     *
     * @param string $image_path Pfad zur Bilddatei
     * @param array $options Vektorisierungsoptionen
     * @return string|WP_Error SVG-Inhalt oder Fehlerobjekt
     */
    public function vectorize_image($image_path, $options = array()) {
        // Mit Standard-Optionen zusammenführen
        $options = wp_parse_args($options, $this->default_options);
        
        // Debug-Protokoll initialisieren
        $debug_log = "=== Vectorize Image Debug Log ===\n";
        $debug_log .= "Time: " . date('Y-m-d H:i:s') . "\n";
        $debug_log .= "Image Path: " . $image_path . "\n";
        $debug_log .= "Options: " . print_r($options, true) . "\n\n";
        
        // Prüfen, ob die Datei existiert
        if (!file_exists($image_path)) {
            $debug_log .= "Error: Das angegebene Bild existiert nicht.\n";
            error_log($debug_log);
            return new WP_Error('image_not_found', __('Das angegebene Bild existiert nicht.', 'yprint-designtool'));
        }
        
        // Temporäres Verzeichnis für die Verarbeitung erstellen
        $upload_dir = wp_upload_dir();
        $temp_dir = $upload_dir['basedir'] . '/yprint-designtool/temp';
        
        if (!file_exists($temp_dir)) {
            wp_mkdir_p($temp_dir);
            // .htaccess erstellen, um temporäre Dateien zu schützen
            file_put_contents($temp_dir . '/.htaccess', 'deny from all');
        }
        
        $temp_base = $temp_dir . '/' . uniqid('vector_');
        $temp_bmp = $temp_base . '.bmp';
        $temp_svg = $temp_base . '.svg';
        
        // Prüfen, welche Vektorisierungs-Engine verwendet werden soll
        if ($this->engine_type === 'potrace') {
            // Für Farb-Tracing benötigen wir mehrere Dateien
            if ($options['color_type'] === 'color' || $options['color_type'] === 'gray') {
                $debug_log .= "Using color tracing mode\n";
                $result = $this->vectorize_color_image($image_path, $temp_dir, $options);
            } else {
                // Bild für Potrace vorbereiten - in 1-Bit-BMP für Potrace umwandeln
                $debug_log .= "Using mono tracing mode\n";
                $result = $this->vectorize_mono_image($image_path, $temp_bmp, $temp_svg, $options);
            }
            
            if (is_wp_error($result)) {
                $debug_log .= "Error: " . $result->get_error_message() . "\n";
                error_log($debug_log);
                return $result;
            }
            
            $debug_log .= "Vectorization successful!\n";
            
            // Debug-Log in die WordPress-Debug-Datei schreiben
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log($debug_log);
            }
            
            return $result;
        }
        
        // Fallback zu anderen Methoden oder externer API, falls nötig
        $debug_log .= "Error: Keine unterstützte Vektorisierungs-Engine gefunden.\n";
        error_log($debug_log);
        return new WP_Error('no_engine', __('Keine unterstützte Vektorisierungs-Engine gefunden.', 'yprint-designtool'));
    }
    
    /**
     * Vektorisiert ein einfarbiges (mono) Bild mit Potrace
     *
     * @param string $image_path Pfad zum Bild
     * @param string $temp_bmp Pfad zur temporären BMP-Datei
     * @param string $temp_svg Pfad zur temporären SVG-Datei
     * @param array $options Vektorisierungsoptionen
     * @return string|WP_Error SVG-Inhalt oder Fehler
     */
    private function vectorize_mono_image($image_path, $temp_bmp, $temp_svg, $options) {
        // Bild für Potrace vorbereiten
        $this->prepare_image_for_potrace($image_path, $temp_bmp, $options);
        
        // Potrace-Binary abrufen
        $potrace_bin = $this->get_potrace_binary();
        
        // Potrace-Befehl erstellen
        $cmd = sprintf(
            '%s %s -s -o %s',
            escapeshellcmd($potrace_bin),
            $this->build_potrace_options($options),
            escapeshellarg($temp_svg)
        );
        
        // Eingabedatei hinzufügen
        $cmd .= ' ' . escapeshellarg($temp_bmp);
        
        // Befehl ausführen
        exec($cmd, $output, $return_var);
        
        // Temporäre Dateien aufräumen
        $temp_files = array($temp_bmp);
        
        if ($return_var !== 0) {
            $this->cleanup_temp_files($temp_files);
            return new WP_Error('potrace_failed', __('Potrace-Befehl fehlgeschlagen.', 'yprint-designtool'));
        }
        
        // SVG-Ausgabe lesen
        $svg_content = file_get_contents($temp_svg);
        
        // Temporäre Dateien aufräumen
        $temp_files[] = $temp_svg;
        $this->cleanup_temp_files($temp_files);
        
        return $svg_content;
    }
    
    /**
     * Vektorisiert ein Farbbild durch Verarbeitung von Farbebenen
     *
     * @param string $image_path Pfad zum Bild
     * @param string $temp_dir Temporäres Verzeichnis für die Verarbeitung
     * @param array $options Vektorisierungsoptionen
     * @return string|WP_Error SVG-Inhalt oder Fehler
     */
    private function vectorize_color_image($image_path, $temp_dir, $options) {
        // Bild laden
        $image = imagecreatefromstring(file_get_contents($image_path));
        if (!$image) {
            return new WP_Error('image_load_failed', __('Fehler beim Laden des Bildes.', 'yprint-designtool'));
        }
        
        $width = imagesx($image);
        $height = imagesy($image);
        
        // Farbpalette erstellen
        $num_colors = $options['colors'];
        $is_grayscale = ($options['color_type'] === 'gray');
        
        // Potrace-Binary abrufen
        $potrace_bin = $this->get_potrace_binary();
        
        // SVG-Header erstellen
        $svg = '<?xml version="1.0" standalone="no"?>' . "\n";
        $svg .= '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' . "\n";
        $svg .= sprintf('<svg width="%d" height="%d" viewBox="0 0 %d %d" version="1.1" xmlns="http://www.w3.org/2000/svg">', 
            $width, $height, $width, $height) . "\n";
        
        // Farbebenen verarbeiten
        $color_map = $this->quantize_image_colors($image, $num_colors, $is_grayscale);
        
        // Farben von dunkel nach hell sortieren (für die Stapelung)
        $colors = array_keys($color_map);
        usort($colors, function($a, $b) {
            // Helligkeit berechnen
            $luma_a = (0.299 * (($a >> 16) & 0xFF)) + (0.587 * (($a >> 8) & 0xFF)) + (0.114 * ($a & 0xFF));
            $luma_b = (0.299 * (($b >> 16) & 0xFF)) + (0.587 * (($b >> 8) & 0xFF)) + (0.114 * ($b & 0xFF));
            return $luma_a - $luma_b; // Dunkel nach hell
        });
        
        // Hintergrundfarbe überspringen, wenn angefordert
        if ($options['remove_background'] && count($colors) > 1) {
            array_pop($colors); // Letzte Farbe entfernen (hellste, vermutlich Hintergrund)
        }
        
        // Temporäre Bitmap für jede Farbe erstellen
        $temp_files = array();
        foreach ($colors as $color_index => $color) {
            $temp_bmp = $temp_dir . '/color_' . $color_index . '.bmp';
            $temp_svg = $temp_dir . '/color_' . $color_index . '.svg';
            $temp_files[] = $temp_bmp;
            $temp_files[] = $temp_svg;
            
            // Bitmap nur mit dieser Farbe erstellen
            $this->create_color_bitmap($image, $color_map[$color], $temp_bmp);
            
            // Potrace-Befehl für diese Farbe erstellen
            $cmd = sprintf(
                '%s %s -s -o %s %s',
                escapeshellcmd($potrace_bin),
                $this->build_potrace_options($options),
                escapeshellarg($temp_svg),
                escapeshellcmd($potrace_bin),
                $this->build_potrace_options($options),
                escapeshellarg($temp_svg),
                escapeshellarg($temp_bmp)
            );
            
            // Befehl ausführen
            exec($cmd, $output, $return_var);
            
            if ($return_var === 0) {
                // Pfaddaten aus SVG extrahieren
                $color_svg = file_get_contents($temp_svg);
                preg_match('/<path[^>]*d="([^"]*)"[^>]*>/i', $color_svg, $matches);
                
                if (isset($matches[1])) {
                    $hex_color = sprintf('#%06x', $color);
                    $svg .= sprintf('<path d="%s" fill="%s" />' . "\n", $matches[1], $hex_color);
                }
            }
        }
        
        // SVG abschließen
        $svg .= '</svg>';
        
        // Temporäre Dateien aufräumen
        $this->cleanup_temp_files($temp_files);
        imagedestroy($image);
        
        return $svg;
    }
    
    /**
     * Quantisiert die Bildfarben für die Farb-Vektorisierung
     *
     * @param resource $image GD-Bild-Ressource
     * @param int $num_colors Anzahl der zu quantisierenden Farben
     * @param bool $grayscale Ob in Graustufen konvertiert werden soll
     * @return array Map von Farbintegern zu Arrays von Pixelpositionen
     */
    protected function quantize_image_colors($image, $num_colors, $grayscale = false) {
        $width = imagesx($image);
        $height = imagesy($image);
        
        // Ein Palette-Bild erstellen
        $palette = imagecreatetruecolor($width, $height);
        
        // In Graustufen konvertieren, falls angefordert
        if ($grayscale) {
            imagefilter($image, IMG_FILTER_GRAYSCALE);
        }
        
        // Farben quantisieren
        imagetruecolortopalette($image, false, $num_colors);
        
        // Farbzuordnung erstellen (Farbe => [Pixel])
        $color_map = array();
        
        for ($y = 0; $y < $height; $y++) {
            for ($x = 0; $x < $width; $x++) {
                $color = imagecolorat($image, $x, $y);
                
                if (!isset($color_map[$color])) {
                    $color_map[$color] = array();
                }
                
                $color_map[$color][] = array($x, $y);
            }
        }
        
        return $color_map;
    }
    
    /**
     * Erstellt eine Bitmap-Datei mit nur Pixeln einer bestimmten Farbe
     *
     * @param resource $image GD-Bild-Ressource
     * @param array $pixels Array von Pixelpositionen für die Farbe
     * @param string $output_file Pfad zur Ausgabe-BMP-Datei
     */
    protected function create_color_bitmap($image, $pixels, $output_file) {
        $width = imagesx($image);
        $height = imagesy($image);
        
        // Eine schwarze Bitmap erstellen
        $bmp = imagecreate($width, $height);
        $black = imagecolorallocate($bmp, 0, 0, 0);
        $white = imagecolorallocate($bmp, 255, 255, 255);
        
        // Mit Weiß füllen (Hintergrund)
        imagefill($bmp, 0, 0, $white);
        
        // Angegebene Pixel auf Schwarz setzen (Vordergrund)
        foreach ($pixels as $pixel) {
            imagesetpixel($bmp, $pixel[0], $pixel[1], $black);
        }
        
        // Als BMP speichern
        imagebmp($bmp, $output_file);
        imagedestroy($bmp);
    }
    
    /**
     * Gibt den Pfad zum Potrace-Binary zurück
     *
     * @return string Pfad zum Potrace-Binary
     */
    protected function get_potrace_binary() {
        // Erst prüfen, ob wir das Binary in unserem Plugin-Verzeichnis haben
        $plugin_potrace = YPRINT_DESIGNTOOL_PATH . 'core/vectorizer/bin/potrace';
        
        if (file_exists($plugin_potrace) && is_executable($plugin_potrace)) {
            return $plugin_potrace;
        }
        
        // Spezifischen IONOS-Pfad prüfen
        $ionos_potrace = '/homepages/31/d4298451771/htdocs/.local/bin/potrace';
        if (file_exists($ionos_potrace) && is_executable($ionos_potrace)) {
            return $ionos_potrace;
        }
        
        // Auf System-Potrace zurückfallen (könnte funktionieren, wenn es im PATH ist)
        return 'potrace';
    }
    
    /**
     * Erstellt Potrace-Befehlszeilenoptionen
     *
     * @param array $options Vektorisierungsoptionen
     * @return string Befehlszeilenoptionen für Potrace
     */
    protected function build_potrace_options($options) {
        $cmd_options = array();
        
        // Optimierungsstufe
        if ($options['opticurve']) {
            $cmd_options[] = '-O ' . $options['optitolerance'];
        } else {
            $cmd_options[] = '-n';
        }
        
        // Alphamax (Kurvenoptimierung)
        $cmd_options[] = '-a ' . $options['alphamax'];
        
        // Turdsize (Rauschentfernung)
        $cmd_options[] = '-t ' . $options['turdsize'];
        
        return implode(' ', $cmd_options);
    }
    
    /**
     * Bereitet ein Bild für Potrace vor, indem es in 1-Bit-BMP umgewandelt wird
     *
     * @param string $input_file Eingabe-Bilddatei
     * @param string $output_file Ausgabe-BMP-Datei
     * @param array $options Umwandlungsoptionen
     * @return bool Erfolgsstatus
     */
    protected function prepare_image_for_potrace($input_file, $output_file, $options) {
        // Bild laden
        $image = imagecreatefromstring(file_get_contents($input_file));
        
        if (!$image) {
            return false;
        }
        
        // In Graustufen umwandeln
        imagefilter($image, IMG_FILTER_GRAYSCALE);
        
        // Schwellenwert anwenden
        $threshold = (int)(255 * $options['brightness_threshold']);
        
        // Bild mit Schwellenwert verarbeiten
        $width = imagesx($image);
        $height = imagesy($image);
        
        // 1-Bit Schwarz-Weiß-Bild erstellen
        $bmp = imagecreate($width, $height);
        $white = imagecolorallocate($bmp, 255, 255, 255);
        $black = imagecolorallocate($bmp, 0, 0, 0);
        
        // Mit Weiß füllen
        imagefill($bmp, 0, 0, $white);
        
        // Schwellenwert anwenden, um ein Schwarz-Weiß-Bild zu erstellen
        for ($y = 0; $y < $height; $y++) {
            for ($x = 0; $x < $width; $x++) {
                $rgb = imagecolorat($image, $x, $y);
                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;
                
                // Einfache Graustufen-Umwandlung und Schwellenwert
                $gray = (int)(($r + $g + $b) / 3);
                
                if ($gray < $threshold) {
                    // Schwarzer Pixel
                    $color = $options['invert'] ? $white : $black;
                } else {
                    // Weißer Pixel
                    $color = $options['invert'] ? $black : $white;
                }
                
                imagesetpixel($bmp, $x, $y, $color);
            }
        }
        
        // Als BMP speichern (Potrace benötigt BMP-Eingabe)
        imagebmp($bmp, $output_file);
        
        // Aufräumen
        imagedestroy($image);
        imagedestroy($bmp);
        
        return true;
    }
    
    /**
     * Temporäre Dateien aufräumen
     *
     * @param array $files Array von Dateipfaden zum Entfernen
     */
    protected function cleanup_temp_files($files) {
        foreach ($files as $file) {
            if (file_exists($file)) {
                @unlink($file);
            }
        }
    }
    
    /**
     * Konvertiert einen HEX-Farbwert in RGB
     *
     * @param string $hex HEX-Farbwert
     * @return array|false RGB-Array oder false bei ungültiger Eingabe
     */
    private function hex_to_rgb($hex) {
        // # entfernen, falls vorhanden
        $hex = ltrim($hex, '#');
        
        // Hex-Farbwert validieren
        if (!preg_match('/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/', $hex)) {
            return false;
        }
        
        // 3-stelligen Hex zu 6-stellig konvertieren
        if (strlen($hex) === 3) {
            $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
        }
        
        // RGB-Werte extrahieren
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));
        
        return array($r, $g, $b);
    }
    
    /**
     * Berechnet die Distanz zwischen zwei Farben
     *
     * @param array $color1 RGB-Array für Farbe 1
     * @param array $color2 RGB-Array für Farbe 2
     * @return float Distanz zwischen 0.0 und 1.0
     */
    private function calculate_color_distance($color1, $color2) {
        // Euklidische Distanz im RGB-Raum
        $r_diff = ($color1[0] - $color2[0]) / 255;
        $g_diff = ($color1[1] - $color2[1]) / 255;
        $b_diff = ($color1[2] - $color2[2]) / 255;
        
        // Normalisierte Distanz zwischen 0 und 1
        $distance = sqrt($r_diff * $r_diff + $g_diff * $g_diff + $b_diff * $b_diff) / sqrt(3);
        
        return $distance;
    }
}
<?php
/**
 * Exporter-Klasse für YPrint DesignTool
 * 
 * Stellt Funktionen zum Exportieren von Designs in verschiedenen Formaten bereit
 */

// Sicherheitscheck: Direkten Zugriff auf diese Datei verhindern
if (!defined('ABSPATH')) {
    exit;
}

class YPrint_Exporter {
    /**
     * Singleton-Instanz
     */
    private static $instance = null;
    
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
     * Als SVG exportieren
     * 
     * @param array $design_data Design-Daten
     * @return string SVG-Inhalt
     */
    public function export_as_svg($design_data) {
        // SVG-Header erstellen
        $svg = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' . "\n";
        $svg .= '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' . "\n";
        $svg .= sprintf('<svg width="%d" height="%d" viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg">',
            $design_data['width'],
            $design_data['height'],
            $design_data['width'],
            $design_data['height']
        ) . "\n";
        
        // Elemente hinzufügen
        if (!empty($design_data['elements'])) {
            foreach ($design_data['elements'] as $element) {
                $svg .= $this->element_to_svg($element) . "\n";
            }
        }
        
        // SVG abschließen
        $svg .= '</svg>';
        
        return $svg;
    }
    
    /**
     * Als PNG exportieren
     * 
     * @param array $design_data Design-Daten
     * @param int $dpi DPI für den Export
     * @return string|WP_Error Pfad zur PNG-Datei oder Fehler
     */
    public function export_as_png($design_data, $dpi = 300) {
        // SVG generieren
        $svg_content = $this->export_as_svg($design_data);
        
        // Temporäre Dateien erstellen
        $temp_dir = $this->get_temp_directory();
        $temp_svg = $temp_dir . '/export_' . uniqid() . '.svg';
        $temp_png = $temp_dir . '/export_' . uniqid() . '.png';
        
        // SVG-Datei speichern
        file_put_contents($temp_svg, $svg_content);
        
        // Option 1: Inkscape CLI verwenden, wenn verfügbar
        if ($this->is_inkscape_available()) {
            $result = $this->convert_with_inkscape($temp_svg, $temp_png, $dpi);
        }
        // Option 2: ImageMagick verwenden, wenn verfügbar
        else if ($this->is_imagemagick_available()) {
            $result = $this->convert_with_imagemagick($temp_svg, $temp_png, $dpi);
        }
        // Option 3: PHP GD verwenden (eingeschränkte SVG-Unterstützung)
        else {
            $result = $this->convert_with_gd($temp_svg, $temp_png);
        }
        
        // Temporäre SVG-Datei löschen
        @unlink($temp_svg);
        
        // Wenn die Konvertierung erfolgreich war, Pfad zur PNG-Datei zurückgeben
        if ($result && file_exists($temp_png)) {
            return $temp_png;
        }
        
        // Fehler zurückgeben, wenn die Konvertierung fehlgeschlagen ist
        return new WP_Error('png_conversion_failed', __('Konvertierung zu PNG fehlgeschlagen.', 'yprint-designtool'));
    }
    
    /**
     * Als PDF exportieren
     * 
     * @param array $design_data Design-Daten
     * @return string|WP_Error Pfad zur PDF-Datei oder Fehler
     */
    public function export_as_pdf($design_data) {
        // SVG generieren
        $svg_content = $this->export_as_svg($design_data);
        
        // Temporäre Dateien erstellen
        $temp_dir = $this->get_temp_directory();
        $temp_svg = $temp_dir . '/export_' . uniqid() . '.svg';
        $temp_pdf = $temp_dir . '/export_' . uniqid() . '.pdf';
        
        // SVG-Datei speichern
        file_put_contents($temp_svg, $svg_content);
        
        // Inkscape CLI verwenden, wenn verfügbar
        if ($this->is_inkscape_available()) {
            $result = $this->convert_with_inkscape($temp_svg, $temp_pdf, 300, 'pdf');
        } else {
            // Alternativ können wir hier andere Bibliotheken verwenden
            // oder einen Fehler zurückgeben
            @unlink($temp_svg);
            return new WP_Error('pdf_conversion_failed', __('PDF-Konvertierung nicht möglich: Inkscape nicht verfügbar.', 'yprint-designtool'));
        }
        
        // Temporäre SVG-Datei löschen
        @unlink($temp_svg);
        
        // Wenn die Konvertierung erfolgreich war, Pfad zur PDF-Datei zurückgeben
        if ($result && file_exists($temp_pdf)) {
            return $temp_pdf;
        }
        
        // Fehler zurückgeben, wenn die Konvertierung fehlgeschlagen ist
        return new WP_Error('pdf_conversion_failed', __('Konvertierung zu PDF fehlgeschlagen.', 'yprint-designtool'));
    }
    
    /**
     * Element in SVG-Code umwandeln
     * 
     * @param array $element Element-Daten
     * @return string SVG-Code für das Element
     */
    private function element_to_svg($element) {
        switch ($element['type']) {
            case 'path':
                return sprintf('<path d="%s" fill="%s" stroke="%s" stroke-width="%s" %s />',
                    esc_attr($element['d']),
                    esc_attr($element['fill']),
                    esc_attr($element['stroke']),
                    esc_attr($element['stroke-width']),
                    isset($element['transform']) ? 'transform="' . esc_attr($element['transform']) . '"' : ''
                );
                
            case 'rect':
                return sprintf('<rect x="%s" y="%s" width="%s" height="%s" fill="%s" %s />',
                    esc_attr($element['x']),
                    esc_attr($element['y']),
                    esc_attr($element['width']),
                    esc_attr($element['height']),
                    esc_attr($element['fill']),
                    isset($element['transform']) ? 'transform="' . esc_attr($element['transform']) . '"' : ''
                );
                
            case 'circle':
                return sprintf('<circle cx="%s" cy="%s" r="%s" fill="%s" %s />',
                    esc_attr($element['cx']),
                    esc_attr($element['cy']),
                    esc_attr($element['r']),
                    esc_attr($element['fill']),
                    isset($element['transform']) ? 'transform="' . esc_attr($element['transform']) . '"' : ''
                );
                
            case 'ellipse':
                return sprintf('<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="%s" %s />',
                    esc_attr($element['cx']),
                    esc_attr($element['cy']),
                    esc_attr($element['rx']),
                    esc_attr($element['ry']),
                    esc_attr($element['fill']),
                    isset($element['transform']) ? 'transform="' . esc_attr($element['transform']) . '"' : ''
                );
                
            case 'text':
                return sprintf('<text x="%s" y="%s" font-family="%s" font-size="%s" fill="%s" %s>%s</text>',
                    esc_attr($element['x']),
                    esc_attr($element['y']),
                    esc_attr($element['font-family']),
                    esc_attr($element['font-size']),
                    esc_attr($element['fill']),
                    isset($element['transform']) ? 'transform="' . esc_attr($element['transform']) . '"' : '',
                    esc_html($element['text'])
                );
                
            case 'image':
                // Für eingebettete Bilder (Data-URLs)
                if (isset($element['href']) && strpos($element['href'], 'data:') === 0) {
                    return sprintf('<image x="%s" y="%s" width="%s" height="%s" href="%s" %s />',
                        esc_attr($element['x']),
                        esc_attr($element['y']),
                        esc_attr($element['width']),
                        esc_attr($element['height']),
                        esc_attr($element['href']),
                        isset($element['transform']) ? 'transform="' . esc_attr($element['transform']) . '"' : ''
                    );
                }
                // Fallback für Bilder ohne Data-URL - sollte nicht passieren
                return '';
                
            default:
                return '';
        }
    }
    
    /**
     * Prüft, ob Inkscape verfügbar ist
     * 
     * @return bool Verfügbarkeit von Inkscape
     */
    private function is_inkscape_available() {
        // Potentiellen Pfad zu Inkscape ermitteln
        $inkscape_path = $this->get_inkscape_path();
        
        if (!empty($inkscape_path)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Ermittelt den Pfad zur Inkscape-Executable
     * 
     * @return string|false Pfad zu Inkscape oder false, wenn nicht gefunden
     */
    private function get_inkscape_path() {
        // Mögliche Inkscape-Pfade
        if (stripos(PHP_OS, 'WIN') === 0) {
            // Windows
            $possible_paths = array(
                'C:\\Program Files\\Inkscape\\bin\\inkscape.exe',
                'C:\\Program Files (x86)\\Inkscape\\bin\\inkscape.exe'
            );
        } else {
            // Linux/Mac
            $possible_paths = array(
                '/usr/bin/inkscape',
                '/usr/local/bin/inkscape',
                '/opt/homebrew/bin/inkscape',
                '/Applications/Inkscape.app/Contents/MacOS/inkscape'
            );
        }
        
        // Prüfen, ob einer der Pfade existiert
        foreach ($possible_paths as $path) {
            if (file_exists($path) && is_executable($path)) {
                return $path;
            }
        }
        
        // Prüfen, ob Inkscape im Systempfad verfügbar ist
        exec('which inkscape 2>&1', $output, $return_var);
        if ($return_var === 0 && !empty($output)) {
            return $output[0];
        }
        
        return false;
    }
    
    /**
     * Konvertiert SVG zu einem anderen Format mit Inkscape
     * 
     * @param string $input_file Eingabedatei (SVG)
     * @param string $output_file Ausgabedatei
     * @param int $dpi DPI für Rasterformate
     * @param string $format Zielformat (png, pdf)
     * @return bool Erfolg der Konvertierung
     */
    private function convert_with_inkscape($input_file, $output_file, $dpi = 300, $format = 'png') {
        $inkscape_path = $this->get_inkscape_path();
        
        if (!$inkscape_path) {
            return false;
        }
        
        // Befehlszeile erstellen
        $cmd = sprintf(
            '"%s" --export-dpi=%d --export-filename="%s" "%s"',
            $inkscape_path,
            $dpi,
            $output_file,
            $input_file
        );
        
        // Befehl ausführen
        exec($cmd, $output, $return_var);
        
        return $return_var === 0;
    }
    
    /**
     * Prüft, ob ImageMagick verfügbar ist
     * 
     * @return bool Verfügbarkeit von ImageMagick
     */
    private function is_imagemagick_available() {
        exec('which convert 2>&1', $output, $return_var);
        return $return_var === 0 && !empty($output);
    }
    
    /**
     * Konvertiert SVG zu PNG mit ImageMagick
     * 
     * @param string $input_file Eingabedatei (SVG)
     * @param string $output_file Ausgabedatei (PNG)
     * @param int $dpi DPI für die Ausgabe
     * @return bool Erfolg der Konvertierung
     */
    private function convert_with_imagemagick($input_file, $output_file, $dpi = 300) {
        // Befehlszeile erstellen
        $cmd = sprintf(
            'convert -density %d "%s" "%s"',
            $dpi,
            $input_file,
            $output_file
        );
        
        // Befehl ausführen
        exec($cmd, $output, $return_var);
        
        return $return_var === 0;
    }
    
    /**
     * Konvertiert SVG zu PNG mit der PHP GD-Bibliothek
     * 
     * @param string $input_file Eingabedatei (SVG)
     * @param string $output_file Ausgabedatei (PNG)
     * @return bool Erfolg der Konvertierung
     */
    private function convert_with_gd($input_file, $output_file) {
        // Hinweis: GD hat keine direkte SVG-Unterstützung, daher ist dies nur ein eingeschränkter Fallback
        // Wir könnten z.B. einen einfachen Placeholder erstellen
        
        // Einfaches Platzhalterbild erstellen
        $width = 800;
        $height = 600;
        
        $image = imagecreatetruecolor($width, $height);
        $bg_color = imagecolorallocate($image, 255, 255, 255);
        $text_color = imagecolorallocate($image, 0, 0, 0);
        
        imagefill($image, 0, 0, $bg_color);
        
        // Text "SVG Export" in die Mitte des Bildes zeichnen
        $font = 5; // Eingebauter Font
        $text = "SVG Export";
        $text_width = imagefontwidth($font) * strlen($text);
        $text_height = imagefontheight($font);
        
        imagestring(
            $image,
            $font,
            ($width - $text_width) / 2,
            ($height - $text_height) / 2,
            $text,
            $text_color
        );
        
        // Als PNG speichern
        $result = imagepng($image, $output_file);
        
        // Ressourcen freigeben
        imagedestroy($image);
        
        return $result;
    }
    
    /**
     * Temporäres Verzeichnis abrufen oder erstellen
     * 
     * @return string Pfad zum temporären Verzeichnis
     */
    private function get_temp_directory() {
        $upload_dir = wp_upload_dir();
        $temp_dir = $upload_dir['basedir'] . '/yprint-designtool/temp';
        
        if (!file_exists($temp_dir)) {
            wp_mkdir_p($temp_dir);
        }
        
        return $temp_dir;
    }
    
    /**
     * Erstellt eine URL für den Download einer exportierten Datei
     * 
     * @param string $file_path Pfad zur Datei
     * @param string $filename Dateiname für den Download
     * @return string Download-URL
     */
    public function create_download_url($file_path, $filename) {
        // Sicherstellen, dass die Datei existiert
        if (!file_exists($file_path)) {
            return '';
        }
        
        // Ziel-Verzeichnis für öffentliche Downloads
        $upload_dir = wp_upload_dir();
        $download_dir = $upload_dir['basedir'] . '/yprint-designtool/downloads';
        
        if (!file_exists($download_dir)) {
            wp_mkdir_p($download_dir);
            
            // .htaccess erstellen, um direktes Browsen zu verhindern
            $htaccess = "Options -Indexes\n";
            $htaccess .= "<Files *.php>\n";
            $htaccess .= "Order Deny,Allow\n";
            $htaccess .= "Deny from all\n";
            $htaccess .= "</Files>\n";
            
            file_put_contents($download_dir . '/.htaccess', $htaccess);
        }
        
        // Eindeutigen Dateinamen erstellen
        $timestamp = time();
        $filename = sanitize_file_name($filename);
        $download_file = $download_dir . '/' . $timestamp . '-' . $filename;
        
        // Datei kopieren
        copy($file_path, $download_file);
        
        // URL erstellen
        $download_url = $upload_dir['baseurl'] . '/yprint-designtool/downloads/' . $timestamp . '-' . $filename;
        
        // Cron-Job zum Aufräumen der temporären Dateien einrichten
        if (!wp_next_scheduled('yprint_designtool_cleanup_downloads')) {
            wp_schedule_single_event(time() + 24 * HOUR_IN_SECONDS, 'yprint_designtool_cleanup_downloads');
        }
        
        return $download_url;
    }
    
    /**
     * Löscht alte Download-Dateien
     */
    public function cleanup_downloads() {
        $upload_dir = wp_upload_dir();
        $download_dir = $upload_dir['basedir'] . '/yprint-designtool/downloads';
        
        if (!file_exists($download_dir)) {
            return;
        }
        
        $files = glob($download_dir . '/*');
        $now = time();
        
        foreach ($files as $file) {
            if (is_file($file) && $file !== $download_dir . '/.htaccess') {
                // Dateien löschen, die älter als 24 Stunden sind
                if ($now - filemtime($file) >= 24 * HOUR_IN_SECONDS) {
                    @unlink($file);
                }
            }
        }
    }
}
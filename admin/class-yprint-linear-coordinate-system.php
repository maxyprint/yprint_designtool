<?php
/**
 * YPrint Linear Coordinate System
 * 
 * ✅ NEUES SYSTEM: Linearer, fehlerfreier Datenfluss
 * - Ein Faktor = Referenzgröße (Größe M als Basis)
 * - Keine doppelte Normalisierung
 * - Keine Rückkonvertierung
 * - Klare, nachvollziehbare Mathematik
 * 
 * @package YPrint
 * @version 1.0.0
 */

class YPrint_Linear_Coordinate_System {
    
    /**
     * ✅ REFERENZ-KONSTANTEN
     * Größe M als feste Basis (scale_factor = 1.0)
     */
    const REFERENCE_SIZE = 'M';
    const REFERENCE_SCALE_FACTOR = 1.0;
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 600;
    
    /**
     * ✅ SCHRITT 1: Einfache Normalisierung
     * Berechnet relative Faktoren bezogen auf Canvas-Dimensionen
     * 
     * @param array $element_data Element-Position und -Größe
     * @param array $canvas_context Canvas-Kontext
     * @return array Normalisierte Faktoren
     */
    public function normalize_to_relative_factors($element_data, $canvas_context) {
        error_log("YPrint Linear: 🎯 SCHRITT 1 - Einfache Normalisierung");
        
        // Canvas-Dimensionen (immer 800x600 nach unserem Fix)
        $canvas_width = self::CANVAS_WIDTH;
        $canvas_height = self::CANVAS_HEIGHT;
        
        // Element-Position
        $element_x = $element_data['position']['x'];
        $element_y = $element_data['position']['y'];
        $element_width = $element_data['size']['width'];
        $element_height = $element_data['size']['height'];
        
        // ✅ EINFACHE NORMALISIERUNG: Relative Faktoren berechnen
        $position_x_factor = $element_x / $canvas_width;
        $position_y_factor = $element_y / $canvas_height;
        $size_width_factor = $element_width / $canvas_width;
        $size_height_factor = $element_height / $canvas_height;
        
        // Validierung: Faktoren müssen zwischen 0 und 1 liegen
        $position_x_factor = max(0, min(1, $position_x_factor));
        $position_y_factor = max(0, min(1, $position_y_factor));
        $size_width_factor = max(0, min(1, $size_width_factor));
        $size_height_factor = max(0, min(1, $size_height_factor));
        
        $result = array(
            'position_factors' => array(
                'x' => $position_x_factor,
                'y' => $position_y_factor
            ),
            'size_factors' => array(
                'width' => $size_width_factor,
                'height' => $size_height_factor
            ),
            'canvas_dimensions' => array(
                'width' => $canvas_width,
                'height' => $canvas_height
            ),
            'element_data' => $element_data,
            'success' => true
        );
        
        error_log("YPrint Linear: ✅ Faktoren berechnet:");
        error_log("  Position: x=" . round($position_x_factor, 4) . ", y=" . round($position_y_factor, 4));
        error_log("  Größe: w=" . round($size_width_factor, 4) . ", h=" . round($size_height_factor, 4));
        
        return $result;
    }
    
    /**
     * ✅ SCHRITT 2: Physische Koordinaten berechnen
     * Verwendet Referenzmessung zur Umrechnung in physische Werte
     * 
     * @param array $normalized_factors Aus Schritt 1
     * @param array $reference_measurement Referenzmessung (z.B. Brustweite)
     * @return array Physische Koordinaten in cm
     */
    public function calculate_physical_coordinates($normalized_factors, $reference_measurement) {
        error_log("YPrint Linear: 🎯 SCHRITT 2 - Physische Koordinaten");
        
        // Referenzmessung validieren
        if (!isset($reference_measurement['pixel_distance']) || 
            !isset($reference_measurement['physical_distance_cm']) ||
            $reference_measurement['pixel_distance'] <= 0 ||
            $reference_measurement['physical_distance_cm'] <= 0) {
            
            error_log("YPrint Linear: ❌ Ungültige Referenzmessung");
            return array('success' => false, 'error' => 'Invalid reference measurement');
        }
        
        $reference_pixel_distance = $reference_measurement['pixel_distance'];
        $reference_physical_cm = $reference_measurement['physical_distance_cm'];
        
        // ✅ KLARE BERECHNUNG: Pixel-zu-cm-Ratio aus Referenzmessung
        $pixel_to_cm_ratio = $reference_physical_cm / $reference_pixel_distance;
        
        // Physische Koordinaten berechnen
        $position_factors = $normalized_factors['position_factors'];
        $size_factors = $normalized_factors['size_factors'];
        
        // Position in cm (bezogen auf Referenzgröße M)
        $physical_position_x_cm = $position_factors['x'] * self::CANVAS_WIDTH * $pixel_to_cm_ratio;
        $physical_position_y_cm = $position_factors['y'] * self::CANVAS_HEIGHT * $pixel_to_cm_ratio;
        
        // Größe in cm (bezogen auf Referenzgröße M)
        $physical_size_width_cm = $size_factors['width'] * self::CANVAS_WIDTH * $pixel_to_cm_ratio;
        $physical_size_height_cm = $size_factors['height'] * self::CANVAS_HEIGHT * $pixel_to_cm_ratio;
        
        $result = array(
            'physical_coordinates' => array(
                'position' => array(
                    'x_cm' => $physical_position_x_cm,
                    'y_cm' => $physical_position_y_cm
                ),
                'size' => array(
                    'width_cm' => $physical_size_width_cm,
                    'height_cm' => $physical_size_height_cm
                )
            ),
            'reference_data' => array(
                'pixel_distance' => $reference_pixel_distance,
                'physical_distance_cm' => $reference_physical_cm,
                'pixel_to_cm_ratio' => $pixel_to_cm_ratio,
                'reference_size' => self::REFERENCE_SIZE
            ),
            'success' => true
        );
        
        error_log("YPrint Linear: ✅ Physische Koordinaten (Referenzgröße M):");
        error_log("  Position: x=" . round($physical_position_x_cm, 2) . "cm, y=" . round($physical_position_y_cm, 2) . "cm");
        error_log("  Größe: w=" . round($physical_size_width_cm, 2) . "cm, h=" . round($physical_size_height_cm, 2) . "cm");
        error_log("  Pixel-zu-cm-Ratio: " . round($pixel_to_cm_ratio, 6) . "cm/px");
        
        return $result;
    }
    
    /**
     * ✅ SCHRITT 3: Größenspezifische Skalierung
     * Skaliert von Referenzgröße M auf gewünschte Größe
     * 
     * @param array $physical_coordinates Aus Schritt 2
     * @param string $target_size Gewünschte Größe (S, M, L, XL, etc.)
     * @param array $product_dimensions Produktdimensionen für alle Größen
     * @return array Finale Koordinaten für gewünschte Größe
     */
    public function scale_to_target_size($physical_coordinates, $target_size, $product_dimensions) {
        error_log("YPrint Linear: 🎯 SCHRITT 3 - Größenspezifische Skalierung");
        
        // Referenzgröße M als Basis
        $reference_size = self::REFERENCE_SIZE;
        
        // Skalierungsfaktor berechnen
        $scale_factor = $this->calculate_size_scale_factor($target_size, $reference_size, $product_dimensions);
        
        if ($scale_factor === false) {
            error_log("YPrint Linear: ❌ Fehler beim Berechnen des Skalierungsfaktors");
            return array('success' => false, 'error' => 'Failed to calculate scale factor');
        }
        
        // Physische Koordinaten skalieren
        $physical_pos = $physical_coordinates['physical_coordinates']['position'];
        $physical_size = $physical_coordinates['physical_coordinates']['size'];
        
        $final_position_x_cm = $physical_pos['x_cm'] * $scale_factor;
        $final_position_y_cm = $physical_pos['y_cm'] * $scale_factor;
        $final_size_width_cm = $physical_size['width_cm'] * $scale_factor;
        $final_size_height_cm = $physical_size['height_cm'] * $scale_factor;
        
        $result = array(
            'final_coordinates' => array(
                'position' => array(
                    'x_cm' => $final_position_x_cm,
                    'y_cm' => $final_position_y_cm
                ),
                'size' => array(
                    'width_cm' => $final_size_width_cm,
                    'height_cm' => $final_size_height_cm
                )
            ),
            'scaling_data' => array(
                'target_size' => $target_size,
                'reference_size' => $reference_size,
                'scale_factor' => $scale_factor
            ),
            'success' => true
        );
        
        error_log("YPrint Linear: ✅ Finale Koordinaten für Größe {$target_size}:");
        error_log("  Position: x=" . round($final_position_x_cm, 2) . "cm, y=" . round($final_position_y_cm, 2) . "cm");
        error_log("  Größe: w=" . round($final_size_width_cm, 2) . "cm, h=" . round($final_size_height_cm, 2) . "cm");
        error_log("  Skalierungsfaktor: " . round($scale_factor, 4));
        
        return $result;
    }
    
    /**
     * ✅ SCHRITT 4: Millimeter-Konvertierung
     * Konvertiert finale cm-Werte in Millimeter (für Druck)
     * 
     * @param array $final_coordinates Aus Schritt 3
     * @return array Finale Koordinaten in Millimeter
     */
    public function convert_to_millimeters($final_coordinates) {
        error_log("YPrint Linear: 🎯 SCHRITT 4 - Millimeter-Konvertierung");
        
        $final_pos = $final_coordinates['final_coordinates']['position'];
        $final_size = $final_coordinates['final_coordinates']['size'];
        
        // ✅ EINFACHE KONVERTIERUNG: cm * 10 = mm
        $mm_position_x = $final_pos['x_cm'] * 10;
        $mm_position_y = $final_pos['y_cm'] * 10;
        $mm_size_width = $final_size['width_cm'] * 10;
        $mm_size_height = $final_size['height_cm'] * 10;
        
        $result = array(
            'millimeter_coordinates' => array(
                'position' => array(
                    'x_mm' => $mm_position_x,
                    'y_mm' => $mm_position_y
                ),
                'size' => array(
                    'width_mm' => $mm_size_width,
                    'height_mm' => $mm_size_height
                )
            ),
            'conversion_data' => array(
                'cm_to_mm_factor' => 10,
                'target_size' => $final_coordinates['scaling_data']['target_size']
            ),
            'success' => true
        );
        
        error_log("YPrint Linear: ✅ Finale Millimeter-Koordinaten:");
        error_log("  Position: x=" . round($mm_position_x, 2) . "mm, y=" . round($mm_position_y, 2) . "mm");
        error_log("  Größe: w=" . round($mm_size_width, 2) . "mm, h=" . round($mm_size_height, 2) . "mm");
        
        return $result;
    }
    
    /**
     * ✅ HILFSFUNKTION: Skalierungsfaktor berechnen
     * Berechnet Faktor zwischen Referenzgröße M und Zielgröße
     * 
     * @param string $target_size Zielgröße
     * @param string $reference_size Referenzgröße (M)
     * @param array $product_dimensions Produktdimensionen
     * @return float|false Skalierungsfaktor oder false bei Fehler
     */
    private function calculate_size_scale_factor($target_size, $reference_size, $product_dimensions) {
        // Verwende Brustweite als Referenzmessung
        $measurement_type = 'chest';
        
        // Referenzwert (Größe M)
        if (!isset($product_dimensions[$reference_size][$measurement_type])) {
            error_log("YPrint Linear: ❌ Referenzgröße {$reference_size} nicht gefunden");
            return false;
        }
        $reference_value = $product_dimensions[$reference_size][$measurement_type];
        
        // Zielwert
        if (!isset($product_dimensions[$target_size][$measurement_type])) {
            error_log("YPrint Linear: ❌ Zielgröße {$target_size} nicht gefunden");
            return false;
        }
        $target_value = $product_dimensions[$target_size][$measurement_type];
        
        // Division-by-zero Schutz
        if ($reference_value <= 0) {
            error_log("YPrint Linear: ❌ Referenzwert ist 0 oder negativ");
            return false;
        }
        
        $scale_factor = $target_value / $reference_value;
        
        error_log("YPrint Linear: 📏 Skalierungsfaktor berechnet:");
        error_log("  Referenz (M): {$reference_value}cm");
        error_log("  Ziel ({$target_size}): {$target_value}cm");
        error_log("  Faktor: " . round($scale_factor, 4));
        
        return $scale_factor;
    }
    
    /**
     * ✅ VOLLSTÄNDIGER WORKFLOW
     * Führt alle 4 Schritte in der richtigen Reihenfolge aus
     * 
     * @param array $element_data Element-Daten
     * @param array $canvas_context Canvas-Kontext
     * @param array $reference_measurement Referenzmessung
     * @param string $target_size Zielgröße
     * @param array $product_dimensions Produktdimensionen
     * @return array Vollständiges Ergebnis
     */
    public function execute_complete_workflow($element_data, $canvas_context, $reference_measurement, $target_size, $product_dimensions) {
        error_log("YPrint Linear: 🚀 VOLLSTÄNDIGER WORKFLOW gestartet");
        
        try {
            // SCHRITT 1: Normalisierung
            $step1 = $this->normalize_to_relative_factors($element_data, $canvas_context);
            if (!$step1['success']) {
                return $step1;
            }
            
            // SCHRITT 2: Physische Koordinaten
            $step2 = $this->calculate_physical_coordinates($step1, $reference_measurement);
            if (!$step2['success']) {
                return $step2;
            }
            
            // SCHRITT 3: Größenskalierung
            $step3 = $this->scale_to_target_size($step2, $target_size, $product_dimensions);
            if (!$step3['success']) {
                return $step3;
            }
            
            // SCHRITT 4: Millimeter-Konvertierung
            $step4 = $this->convert_to_millimeters($step3);
            if (!$step4['success']) {
                return $step4;
            }
            
            // Vollständiges Ergebnis zusammenstellen
            $result = array(
                'success' => true,
                'workflow_steps' => array(
                    'step1_normalization' => $step1,
                    'step2_physical_coordinates' => $step2,
                    'step3_size_scaling' => $step3,
                    'step4_millimeter_conversion' => $step4
                ),
                'final_result' => $step4['millimeter_coordinates'],
                'metadata' => array(
                    'target_size' => $target_size,
                    'reference_size' => self::REFERENCE_SIZE,
                    'canvas_dimensions' => array(
                        'width' => self::CANVAS_WIDTH,
                        'height' => self::CANVAS_HEIGHT
                    ),
                    'timestamp' => current_time('mysql')
                )
            );
            
            error_log("YPrint Linear: ✅ VOLLSTÄNDIGER WORKFLOW erfolgreich abgeschlossen");
            return $result;
            
        } catch (Exception $e) {
            error_log("YPrint Linear: ❌ Workflow-Fehler: " . $e->getMessage());
            return array(
                'success' => false,
                'error' => $e->getMessage()
            );
        }
    }
}

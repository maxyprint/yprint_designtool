<?php
/**
 * Transform-Klasse für YPrint DesignTool
 * 
 * Stellt Funktionen für die Transformation von Elementen im Design-Tool bereit
 */

// Sicherheitscheck: Direkten Zugriff auf diese Datei verhindern
if (!defined('ABSPATH')) {
    exit;
}

class YPrint_Transform {
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
     * Verschiebt ein Element
     * 
     * @param array $element Element-Daten
     * @param float $x X-Position
     * @param float $y Y-Position
     * @return array Aktualisierte Element-Daten
     */
    public function move($element, $x, $y) {
        // Kopie des Elements erstellen, um das Original nicht zu verändern
        $updated_element = $element;
        
        // Neue Position setzen
        $updated_element['left'] = floatval($x);
        $updated_element['top'] = floatval($y);
        
        return $updated_element;
    }
    
    /**
     * Skaliert ein Element
     * 
     * @param array $element Element-Daten
     * @param float $width Neue Breite
     * @param float $height Neue Höhe
     * @param bool $maintain_aspect_ratio Seitenverhältnis beibehalten
     * @return array Aktualisierte Element-Daten
     */
    public function scale($element, $width, $height, $maintain_aspect_ratio = false) {
        // Kopie des Elements erstellen, um das Original nicht zu verändern
        $updated_element = $element;
        
        $width = max(1, floatval($width)); // Mindestgröße: 1px
        $height = max(1, floatval($height)); // Mindestgröße: 1px
        
        if ($maintain_aspect_ratio && isset($element['originalWidth']) && isset($element['originalHeight']) && 
            $element['originalWidth'] > 0 && $element['originalHeight'] > 0) {
            
            // Ursprüngliches Seitenverhältnis berechnen
            $aspect_ratio = $element['originalWidth'] / $element['originalHeight'];
            
            // Je nachdem, welcher Wert sich geändert hat, den anderen anpassen
            if ($width !== $element['width'] && $height === $element['height']) {
                // Breite wurde geändert, Höhe anpassen
                $height = $width / $aspect_ratio;
            } else if ($width === $element['width'] && $height !== $element['height']) {
                // Höhe wurde geändert, Breite anpassen
                $width = $height * $aspect_ratio;
            }
        }
        
        // Neue Größe setzen
        $updated_element['width'] = $width;
        $updated_element['height'] = $height;
        
        return $updated_element;
    }
    
    /**
     * Rotiert ein Element
     * 
     * @param array $element Element-Daten
     * @param float $angle Rotationswinkel in Grad
     * @return array Aktualisierte Element-Daten
     */
    public function rotate($element, $angle) {
        // Kopie des Elements erstellen, um das Original nicht zu verändern
        $updated_element = $element;
        
        // Winkel normalisieren (0-360 Grad)
        $angle = fmod(floatval($angle), 360);
        if ($angle < 0) {
            $angle += 360;
        }
        
        // Neue Rotation setzen
        $updated_element['rotation'] = $angle;
        
        return $updated_element;
    }
    
    /**
     * Spiegelt ein Element horizontal oder vertikal
     * 
     * @param array $element Element-Daten
     * @param string $direction Richtung ('horizontal' oder 'vertical')
     * @return array Aktualisierte Element-Daten
     */
    public function flip($element, $direction) {
        // Kopie des Elements erstellen, um das Original nicht zu verändern
        $updated_element = $element;
        
        // Aktuellen Transformationswert abrufen oder initialisieren
        $transform = isset($element['transform']) ? $element['transform'] : array();
        
        if (!is_array($transform)) {
            $transform = array();
        }
        
        // Spiegelung hinzufügen oder entfernen
        if ($direction === 'horizontal') {
            $transform['scaleX'] = isset($transform['scaleX']) && $transform['scaleX'] === -1 ? 1 : -1;
        } else if ($direction === 'vertical') {
            $transform['scaleY'] = isset($transform['scaleY']) && $transform['scaleY'] === -1 ? 1 : -1;
        }
        
        // Aktualisierte Transformation setzen
        $updated_element['transform'] = $transform;
        
        return $updated_element;
    }
    
    /**
     * Ändert die Ebene eines Elements (nach vorne/hinten)
     * 
     * @param array $elements Liste aller Elemente
     * @param string $element_id ID des zu bewegenden Elements
     * @param string $direction Richtung ('front', 'back', 'forward', 'backward')
     * @return array Aktualisierte Elementliste
     */
    public function change_layer($elements, $element_id, $direction) {
        // Element-Index finden
        $element_index = -1;
        
        foreach ($elements as $index => $element) {
            if ($element['id'] === $element_id) {
                $element_index = $index;
                break;
            }
        }
        
        if ($element_index === -1) {
            // Element nicht gefunden
            return $elements;
        }
        
        // Element aus der Liste entfernen
        $element = $elements[$element_index];
        array_splice($elements, $element_index, 1);
        
        // Element an neuer Position einfügen
        switch ($direction) {
            case 'front': // Ganz nach vorne (Ende der Liste)
                $elements[] = $element;
                break;
                
            case 'back': // Ganz nach hinten (Anfang der Liste)
                array_unshift($elements, $element);
                break;
                
            case 'forward': // Eine Ebene nach vorne
                if ($element_index < count($elements)) {
                    array_splice($elements, $element_index + 1, 0, array($element));
                } else {
                    $elements[] = $element;
                }
                break;
                
            case 'backward': // Eine Ebene nach hinten
                if ($element_index > 0) {
                    array_splice($elements, $element_index - 1, 0, array($element));
                } else {
                    array_unshift($elements, $element);
                }
                break;
                
            default:
                // Unbekannte Richtung, Element am ursprünglichen Index wieder einfügen
                array_splice($elements, $element_index, 0, array($element));
                break;
        }
        
        return $elements;
    }
    
    /**
     * Gruppiert mehrere Elemente zu einem
     * 
     * @param array $elements Liste der zu gruppierenden Elemente
     * @return array|null Gruppenelement oder null bei Fehler
     */
    public function group($elements) {
        if (count($elements) < 2) {
            return null; // Mindestens 2 Elemente benötigt
        }
        
        // Begrenzungsrechteck berechnen
        $min_x = PHP_INT_MAX;
        $min_y = PHP_INT_MAX;
        $max_x = PHP_INT_MIN;
        $max_y = PHP_INT_MIN;
        
        foreach ($elements as $element) {
            $left = $element['left'];
            $top = $element['top'];
            $right = $left + $element['width'];
            $bottom = $top + $element['height'];
            
            $min_x = min($min_x, $left);
            $min_y = min($min_y, $top);
            $max_x = max($max_x, $right);
            $max_y = max($max_y, $bottom);
        }
        
        $width = $max_x - $min_x;
        $height = $max_y - $min_y;
        
        // Gruppeninformationen erstellen
        $group = array(
            'id' => 'group_' . uniqid(),
            'type' => 'group',
            'left' => $min_x,
            'top' => $min_y,
            'width' => $width,
            'height' => $height,
            'rotation' => 0,
            'children' => array()
        );
        
        // Elemente zur Gruppe hinzufügen und Positionen relativ zur Gruppe anpassen
        foreach ($elements as $element) {
            $child = $element;
            $child['left'] = $element['left'] - $min_x;
            $child['top'] = $element['top'] - $min_y;
            $group['children'][] = $child;
        }
        
        return $group;
    }
    
    /**
     * Löst eine Gruppe auf
     * 
     * @param array $group Gruppenelement
     * @return array|null Liste der enthaltenen Elemente oder null bei Fehler
     */
    public function ungroup($group) {
        if (!isset($group['type']) || $group['type'] !== 'group' || !isset($group['children'])) {
            return null;
        }
        
        $elements = array();
        
        // Absolute Positionen für die Kindelemente berechnen
        foreach ($group['children'] as $child) {
            $element = $child;
            $element['left'] = $group['left'] + $child['left'];
            $element['top'] = $group['top'] + $child['top'];
            $elements[] = $element;
        }
        
        return $elements;
    }
    
    /**
     * Richtet Elemente aus
     * 
     * @param array $elements Liste der auszurichtenden Elemente
     * @param string $alignment Ausrichtung ('left', 'center', 'right', 'top', 'middle', 'bottom')
     * @return array Aktualisierte Elementliste
     */
    public function align($elements, $alignment) {
        if (count($elements) < 2) {
            return $elements; // Mindestens 2 Elemente benötigt
        }
        
        // Referenzwerte berechnen (Durchschnitt oder Extremwerte je nach Ausrichtung)
        $reference_value = 0;
        
        switch ($alignment) {
            case 'left':
                // Am linken Rand ausrichten (Minimum von 'left')
                $reference_value = min(array_column($elements, 'left'));
                break;
                
            case 'center':
                // An Zentrum ausrichten (Durchschnitt von 'left' + 'width'/2)
                $centers = array();
                foreach ($elements as $element) {
                    $centers[] = $element['left'] + $element['width'] / 2;
                }
                $reference_value = array_sum($centers) / count($centers);
                break;
                
            case 'right':
                // Am rechten Rand ausrichten (Maximum von 'left' + 'width')
                $rights = array();
                foreach ($elements as $element) {
                    $rights[] = $element['left'] + $element['width'];
                }
                $reference_value = max($rights);
                break;
                
            case 'top':
                // Am oberen Rand ausrichten (Minimum von 'top')
                $reference_value = min(array_column($elements, 'top'));
                break;
                
            case 'middle':
                // An Mitte ausrichten (Durchschnitt von 'top' + 'height'/2)
                $middles = array();
                foreach ($elements as $element) {
                    $middles[] = $element['top'] + $element['height'] / 2;
                }
                $reference_value = array_sum($middles) / count($middles);
                break;
                
            case 'bottom':
                // Am unteren Rand ausrichten (Maximum von 'top' + 'height')
                $bottoms = array();
                foreach ($elements as $element) {
                    $bottoms[] = $element['top'] + $element['height'];
                }
                $reference_value = max($bottoms);
                break;
        }
        
        // Elemente ausrichten
        $updated_elements = array();
        
        foreach ($elements as $element) {
            $updated_element = $element;
            
            switch ($alignment) {
                case 'left':
                    $updated_element['left'] = $reference_value;
                    break;
                    
                case 'center':
                    $updated_element['left'] = $reference_value - $element['width'] / 2;
                    break;
                    
                case 'right':
                    $updated_element['left'] = $reference_value - $element['width'];
                    break;
                    
                case 'top':
                    $updated_element['top'] = $reference_value;
                    break;
                    
                case 'middle':
                    $updated_element['top'] = $reference_value - $element['height'] / 2;
                    break;
                    
                case 'bottom':
                    $updated_element['top'] = $reference_value - $element['height'];
                    break;
            }
            
            $updated_elements[] = $updated_element;
        }
        
        return $updated_elements;
    }
    
    /**
     * Verteilt Elemente gleichmäßig
     * 
     * @param array $elements Liste der zu verteilenden Elemente
     * @param string $direction Richtung ('horizontal' oder 'vertical')
     * @return array Aktualisierte Elementliste
     */
    public function distribute($elements, $direction) {
        if (count($elements) < 3) {
            return $elements; // Mindestens 3 Elemente benötigt
        }
        
        // Elemente nach Position sortieren
        if ($direction === 'horizontal') {
            usort($elements, function($a, $b) {
                return $a['left'] - $b['left'];
            });
        } else if ($direction === 'vertical') {
            usort($elements, function($a, $b) {
                return $a['top'] - $b['top'];
            });
        } else {
            return $elements; // Ungültige Richtung
        }
        
        // Start- und Endposition bestimmen
        $first_element = $elements[0];
        $last_element = $elements[count($elements) - 1];
        
        if ($direction === 'horizontal') {
            $start_pos = $first_element['left'] + $first_element['width'] / 2;
            $end_pos = $last_element['left'] + $last_element['width'] / 2;
        } else {
            $start_pos = $first_element['top'] + $first_element['height'] / 2;
            $end_pos = $last_element['top'] + $last_element['height'] / 2;
        }
        
        $total_distance = $end_pos - $start_pos;
        $step = $total_distance / (count($elements) - 1);
        
        // Elemente verteilen
        $updated_elements = array();
        
        for ($i = 0; $i < count($elements); $i++) {
            $element = $elements[$i];
            $updated_element = $element;
            
            if ($i > 0 && $i < count($elements) - 1) {
                $position = $start_pos + $step * $i;
                
                if ($direction === 'horizontal') {
                    $updated_element['left'] = $position - $element['width'] / 2;
                } else {
                    $updated_element['top'] = $position - $element['height'] / 2;
                }
            }
            
            $updated_elements[] = $updated_element;
        }
        
        return $updated_elements;
    }
}
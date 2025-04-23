<?php
/**
 * Admin-Seite für das YPrint DesignTool
 * 
 * Zeigt die Hauptadministrationsseite des Plugins an
 */

// Sicherheitscheck: Direkten Zugriff auf diese Datei verhindern
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap yprint-designtool-admin">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <?php 
    // Prüfen, ob API-Schlüssel konfiguriert ist (für API-basierte Vektorisierung)
    $options = get_option('yprint_designtool_options', array());
    $vectorization_engine = isset($options['vectorization_engine']) ? $options['vectorization_engine'] : 'potrace';
    
    if ($vectorization_engine === 'api' && empty($options['api_key'])) {
        echo '<div class="notice notice-warning is-dismissible"><p>';
        echo sprintf(
            __('Bitte konfiguriere deinen API-Schlüssel in den <a href="%s">Einstellungen</a> für die API-basierte Vektorisierung.', 'yprint-designtool'),
            admin_url('admin.php?page=yprint-designtool-settings')
        );
        echo '</p></div>';
    }
    
    // Prüfen, ob Potrace verfügbar ist, wenn es als Engine ausgewählt ist
    if ($vectorization_engine === 'potrace') {
        $vectorizer = YPrint_Vectorizer::get_instance();
        if (!$vectorizer->check_potrace_exists()) {
            echo '<div class="notice notice-warning is-dismissible"><p>';
            echo __('Potrace ist nicht verfügbar. Bitte installiere Potrace oder wähle eine andere Vektorisierungs-Engine in den Einstellungen.', 'yprint-designtool');
            echo '</p></div>';
        }
    }
    ?>
    
    <div class="yprint-designtool-container">
        <div class="yprint-designtool-upload-section">
            <h2><?php _e('Bild in SVG konvertieren', 'yprint-designtool'); ?></h2>
            
            <div class="yprint-designtool-upload-box">
                <!-- Vereinfachtes Upload-Formular -->
                <form id="yprint-designtool-upload-form" method="post" enctype="multipart/form-data">
                    <?php wp_nonce_field('yprint_designtool_upload', 'yprint_designtool_upload_nonce'); ?>
                    
                    <p><?php _e('Wähle ein Bild aus, um es zu vektorisieren:', 'yprint-designtool'); ?></p>
                    
                    <!-- Einfaches File-Input -->
                    <input type="file" id="yprint-designtool-file-input" name="vectorize_image" accept="image/*" style="margin-bottom: 15px; display: block;" />
                    
                    <!-- Bild-Vorschau (wird per JavaScript angezeigt) -->
                    <div id="yprint-designtool-image-preview" style="display: none; margin: 15px 0;">
                        <h3><?php _e('Bildvorschau', 'yprint-designtool'); ?></h3>
                        <div style="max-width: 100%; text-align: center; border: 1px solid #ddd; padding: 10px; background-color: #f9f9f9;">
                            <img id="yprint-designtool-preview-image" src="" alt="Vorschau" style="max-width: 100%; max-height: 300px; display: block; margin: 0 auto;" />
                        </div>
                    </div>
                    
                    <!-- Konvertierungsoptionen -->
                    <div id="yprint-designtool-options" style="margin-top: 15px;">
                        <h3><?php _e('Vektorisierungsoptionen', 'yprint-designtool'); ?></h3>
                        
                        <table class="form-table">
                            <tr>
                                <th scope="row"><?php _e('Detailgrad', 'yprint-designtool'); ?></th>
                                <td>
                                    <select id="yprint-designtool-detail-level" name="detail_level">
                                        <option value="low"><?php _e('Niedrig (weniger Details, schneller)', 'yprint-designtool'); ?></option>
                                        <option value="medium" selected><?php _e('Mittel', 'yprint-designtool'); ?></option>
                                        <option value="high"><?php _e('Hoch (mehr Details, langsamer)', 'yprint-designtool'); ?></option>
                                        <option value="ultra"><?php _e('Ultra (maximale Details, sehr langsam)', 'yprint-designtool'); ?></option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php _e('Farbmodus', 'yprint-designtool'); ?></th>
                                <td>
                                    <select id="yprint-designtool-color-mode" name="color_type">
                                        <option value="mono" selected><?php _e('Schwarz/Weiß', 'yprint-designtool'); ?></option>
                                        <option value="gray"><?php _e('Graustufen', 'yprint-designtool'); ?></option>
                                        <option value="color"><?php _e('Farbe', 'yprint-designtool'); ?></option>
                                    </select>
                                </td>
                            </tr>
                            <tr class="yprint-designtool-color-options" style="display: none;">
                                <th scope="row"><?php _e('Anzahl Farben', 'yprint-designtool'); ?></th>
                                <td>
                                    <input type="range" id="yprint-designtool-colors" name="colors" min="2" max="16" value="8">
                                    <span id="yprint-designtool-colors-value">8</span>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php _e('Optionen', 'yprint-designtool'); ?></th>
                                <td>
                                    <label>
                                        <input type="checkbox" id="yprint-designtool-invert" name="invert" value="1">
                                        <?php _e('Farben invertieren', 'yprint-designtool'); ?>
                                    </label>
                                    <br>
                                    <label>
                                        <input type="checkbox" id="yprint-designtool-remove-bg" name="remove_background" value="1" checked>
                                        <?php _e('Hintergrund entfernen', 'yprint-designtool'); ?>
                                    </label>
                                </td>
                            </tr>
                        </table>
                        
                        <div style="margin-top: 15px;">
                            <button type="button" id="yprint-designtool-start-vectorization" class="button button-primary">
                                <?php _e('Vektorisieren', 'yprint-designtool'); ?>
                            </button>
                        </div>
                    </div>
                </form>
                
                <!-- Fortschrittsanzeige (wird per JavaScript angezeigt) -->
                <div id="yprint-designtool-progress" style="display: none; margin-top: 20px;">
                    <h3><?php _e('Fortschritt', 'yprint-designtool'); ?></h3>
                    <div style="height: 20px; background-color: #f1f1f1; border-radius: 10px; overflow: hidden; margin-bottom: 10px;">
                        <div class="yprint-designtool-progress-bar-inner" style="height: 100%; width: 0; background-color: #007cba; transition: width 0.3s ease;"></div>
                    </div>
                    <p class="yprint-designtool-progress-message" style="text-align: center; font-style: italic; color: #555;">
                        <?php _e('Vorbereitung...', 'yprint-designtool'); ?>
                    </p>
                </div>
            </div>
        </div>
        
        <!-- Ergebnisbereich (wird per JavaScript angezeigt) -->
        <div class="yprint-designtool-result-section" id="yprint-designtool-result-section" style="display: none; flex: 1; min-width: 300px; background: #fff; border-radius: 4px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); padding: 20px; margin-top: 20px;">
            <h2><?php _e('Vektorisierungsergebnis', 'yprint-designtool'); ?></h2>
            
            <div style="margin-top: 15px; border: 1px solid #ddd; min-height: 400px; background-color: #f9f9f9;">
                <div id="yprint-designtool-svg-container" style="width: 100%; height: 400px; display: flex; align-items: center; justify-content: center;"></div>
            </div>
            
            <div style="margin-top: 15px; text-align: right;">
                <button type="button" id="yprint-designtool-save-to-media" class="button button-primary">
                    <?php _e('In Mediathek speichern', 'yprint-designtool'); ?>
                </button>
                <button type="button" id="yprint-designtool-download" class="button button-secondary">
                    <?php _e('SVG herunterladen', 'yprint-designtool'); ?>
                </button>
                <button type="button" id="yprint-designtool-open-editor" class="button button-secondary">
                    <?php _e('Im Design-Tool öffnen', 'yprint-designtool'); ?>
                </button>
            </div>
        </div>
    </div>
    
    <div class="yprint-designtool-info-section" style="margin-top: 30px;">
        <h2><?php _e('Design-Tool', 'yprint-designtool'); ?></h2>
        
        <p><?php _e('Mit dem YPrint Design-Tool kannst du SVG-Dateien erstellen, bearbeiten und exportieren.', 'yprint-designtool'); ?></p>
        
        <div class="yprint-designtool-tool-buttons" style="margin-top: 20px;">
            <a href="<?php echo esc_url(home_url('/designtool/')); ?>" class="button button-primary" target="_blank">
                <?php _e('Design-Tool öffnen', 'yprint-designtool'); ?>
            </a>
            
            <div style="margin-top: 15px;">
                <p><?php _e('Du kannst das Design-Tool auch in deine Seiten einbetten mit dem Shortcode:', 'yprint-designtool'); ?></p>
                <code>[yprint_designtool]</code>
            </div>
            
            <div style="margin-top: 15px;">
                <p><?php _e('Erweiterte Shortcode-Optionen:', 'yprint-designtool'); ?></p>
                <code>[yprint_designtool width="800px" height="600px" mode="embedded"]</code>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">
// JavaScript für die Admin-Seite wird in admin.js implementiert
jQuery(document).ready(function($) {
    // Farbmodus-Änderungen überwachen
    $('#yprint-designtool-color-mode').on('change', function() {
        if ($(this).val() === 'color' || $(this).val() === 'gray') {
            $('.yprint-designtool-color-options').show();
        } else {
            $('.yprint-designtool-color-options').hide();
        }
    });
    
    // Farb-Slider-Änderungen anzeigen
    $('#yprint-designtool-colors').on('input', function() {
        $('#yprint-designtool-colors-value').text($(this).val());
    });
    
    // Weitere Funktionen werden in der admin.js-Datei implementiert
});
</script>
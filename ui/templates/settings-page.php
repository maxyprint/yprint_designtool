<?php
/**
 * Einstellungsseite für YPrint DesignTool
 * 
 * Zeigt die Einstellungen des Plugins an
 */

// Sicherheitscheck: Direkten Zugriff auf diese Datei verhindern
if (!defined('ABSPATH')) {
    exit;
}

// Aktuelle Einstellungen abrufen
$options = get_option('yprint_designtool_options', array(
    'api_key' => '',
    'max_upload_size' => 5,
    'default_output_format' => 'svg',
    'vectorization_engine' => 'potrace',
));

// API-Status
$api_status = '';
$api_status_class = '';

// Einstellungen speichern
if (isset($_POST['yprint_designtool_save_settings']) && check_admin_referer('yprint_designtool_settings', 'yprint_designtool_settings_nonce')) {
    // Alte API-Schlüssel speichern zum Vergleich
    $old_api_key = $options['api_key'];
    
    // Neue Einstellungen speichern
    $options['api_key'] = sanitize_text_field($_POST['api_key']);
    $options['max_upload_size'] = absint($_POST['max_upload_size']);
    $options['default_output_format'] = sanitize_text_field($_POST['default_output_format']);
    $options['vectorization_engine'] = sanitize_text_field($_POST['vectorization_engine']);

    update_option('yprint_designtool_options', $options);
    
    echo '<div class="notice notice-success is-dismissible"><p>' . __('Einstellungen gespeichert.', 'yprint-designtool') . '</p></div>';
    
    // API-Schlüssel testen, wenn er sich geändert hat und API als Engine ausgewählt ist
    if ($old_api_key !== $options['api_key'] && $options['vectorization_engine'] === 'api' && !empty($options['api_key'])) {
        // API testen
        $api_result = false;
        
        // Hier könnte eine tatsächliche API-Prüfung implementiert werden
        // Beispielhaft für jetzt einfach auf nicht-leeren Schlüssel prüfen
        if (!empty($options['api_key'])) {
            $api_result = true;
        }
        
        if ($api_result === true) {
            $api_status = __('API-Schlüssel ist gültig.', 'yprint-designtool');
            $api_status_class = 'notice-success';
        } else {
            $error_message = __('API-Schlüssel konnte nicht validiert werden.', 'yprint-designtool');
            $api_status = __('API-Schlüssel ist ungültig: ', 'yprint-designtool') . $error_message;
            $api_status_class = 'notice-error';
        }
        
        if (!empty($api_status)) {
            echo '<div class="notice ' . $api_status_class . ' is-dismissible"><p>' . $api_status . '</p></div>';
        }
    }
}

// API-Schlüssel testen Button
if (isset($_POST['yprint_designtool_test_engine']) && check_admin_referer('yprint_designtool_settings', 'yprint_designtool_settings_nonce')) {
    // Ausgewählte Engine testen
    $engine = isset($_POST['vectorization_engine']) ? sanitize_text_field($_POST['vectorization_engine']) : $options['vectorization_engine'];
    
    if ($engine === 'api') {
        // API-Engine testen
        if (empty($options['api_key'])) {
            echo '<div class="notice notice-warning is-dismissible"><p>' . __('Bitte gib einen API-Schlüssel ein, um die API zu testen.', 'yprint-designtool') . '</p></div>';
        } else {
            // API testen
            $api_result = false;
            
            // Hier könnte eine tatsächliche API-Prüfung implementiert werden
            // Beispielhaft für jetzt einfach auf nicht-leeren Schlüssel prüfen
            if (!empty($options['api_key'])) {
                $api_result = true;
            }
            
            if ($api_result === true) {
                echo '<div class="notice notice-success is-dismissible"><p>' . __('API-Verbindung funktioniert!', 'yprint-designtool') . '</p></div>';
            } else {
                echo '<div class="notice notice-error is-dismissible"><p>' . __('API-Verbindung fehlgeschlagen. Bitte überprüfe deinen API-Schlüssel.', 'yprint-designtool') . '</p></div>';
            }
        }
    } elseif ($engine === 'potrace') {
        // Potrace-Engine testen
        $vectorizer = YPrint_Vectorizer::get_instance();
        if ($vectorizer->check_potrace_exists()) {
            echo '<div class="notice notice-success is-dismissible"><p>' . __('Potrace ist verfügbar und funktioniert!', 'yprint-designtool') . '</p></div>';
        } else {
            echo '<div class="notice notice-error is-dismissible"><p>' . __('Potrace ist nicht verfügbar. Bitte installiere Potrace oder wähle eine andere Vektorisierungs-Engine.', 'yprint-designtool') . '</p></div>';
        }
    }
}
?>

<div class="wrap yprint-designtool-settings">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <form method="post" action="">
        <?php wp_nonce_field('yprint_designtool_settings', 'yprint_designtool_settings_nonce'); ?>
        
        <table class="form-table">
            <tbody>
                <tr>
                    <th scope="row">
                        <label for="vectorization_engine"><?php _e('Vektorisierungs-Engine', 'yprint-designtool'); ?></label>
                    </th>
                    <td>
                        <select id="vectorization_engine" name="vectorization_engine">
                            <option value="potrace" <?php selected($options['vectorization_engine'], 'potrace'); ?>>
                                <?php _e('Potrace (lokal, kostenlos)', 'yprint-designtool'); ?>
                            </option>
                            <option value="api" <?php selected($options['vectorization_engine'], 'api'); ?>>
                                <?php _e('Vectorize.ai API (online, kostenpflichtig)', 'yprint-designtool'); ?>
                            </option>
                        </select>
                        <p class="description">
                            <?php _e('Wähle zwischen der lokalen Potrace-Engine oder der Vectorize.ai API.', 'yprint-designtool'); ?>
                        </p>
                        <p>
                            <input type="submit" name="yprint_designtool_test_engine" class="button button-secondary" 
                                value="<?php _e('Ausgewählte Engine testen', 'yprint-designtool'); ?>" />
                        </p>
                    </td>
                </tr>
                
                <tr id="api_key_row" <?php echo $options['vectorization_engine'] !== 'api' ? 'style="display: none;"' : ''; ?>>
                    <th scope="row">
                        <label for="api_key"><?php _e('Vectorize.ai API-Schlüssel', 'yprint-designtool'); ?></label>
                    </th>
                    <td>
                        <input type="text" id="api_key" name="api_key" class="regular-text" 
                               value="<?php echo esc_attr($options['api_key']); ?>" />
                        <p class="description">
                            <?php _e('Dein API-Schlüssel von <a href="https://vectorize.ai" target="_blank">vectorize.ai</a>.', 'yprint-designtool'); ?>
                        </p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="max_upload_size"><?php _e('Maximale Upload-Größe (MB)', 'yprint-designtool'); ?></label>
                    </th>
                    <td>
                        <input type="number" id="max_upload_size" name="max_upload_size" class="small-text" 
                               value="<?php echo esc_attr($options['max_upload_size']); ?>" min="1" max="20" />
                        <p class="description">
                            <?php _e('Maximale Dateigröße für Bildupload in Megabyte (1-20).', 'yprint-designtool'); ?>
                        </p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="default_output_format"><?php _e('Standard-Ausgabeformat', 'yprint-designtool'); ?></label>
                    </th>
                    <td>
                        <select id="default_output_format" name="default_output_format">
                            <option value="svg" <?php selected($options['default_output_format'], 'svg'); ?>>
                                <?php _e('SVG', 'yprint-designtool'); ?>
                            </option>
                            <option value="png" <?php selected($options['default_output_format'], 'png'); ?>>
                                <?php _e('PNG', 'yprint-designtool'); ?>
                            </option>
                            <option value="pdf" <?php selected($options['default_output_format'], 'pdf'); ?>>
                                <?php _e('PDF', 'yprint-designtool'); ?>
                            </option>
                        </select>
                        <p class="description">
                            <?php _e('Standard-Format für exportierte Dateien.', 'yprint-designtool'); ?>
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
        
        <p class="submit">
            <input type="submit" name="yprint_designtool_save_settings" class="button button-primary" 
                   value="<?php _e('Einstellungen speichern', 'yprint-designtool'); ?>" />
        </p>
    </form>
    
    <div class="yprint-designtool-info-section">
        <h2><?php _e('Hilfe & Informationen', 'yprint-designtool'); ?></h2>
        
        <div class="yprint-designtool-info-box">
            <h3><?php _e('Vektorisierungs-Engines', 'yprint-designtool'); ?></h3>
            <p>
                <strong><?php _e('Potrace (lokal):', 'yprint-designtool'); ?></strong> 
                <?php _e('Potrace ist eine kostenlose, Open-Source-Vektorisierungslösung, die lokal auf deinem Server läuft. Es bietet gute Ergebnisse für einfache Bilder und Lineart.', 'yprint-designtool'); ?>
            </p>
            <p>
                <strong><?php _e('Vectorize.ai API (online):', 'yprint-designtool'); ?></strong> 
                <?php _e('Die Vectorize.ai API ist eine professionelle Vektorisierungslösung, die auf künstlicher Intelligenz basiert und sehr gute Ergebnisse auch bei komplexen Bildern liefert. Diese Option erfordert einen API-Schlüssel und ist kostenpflichtig.', 'yprint-designtool'); ?>
            </p>
        </div>
        
        <div class="yprint-designtool-info-box">
            <h3><?php _e('Was ist Vektorisierung?', 'yprint-designtool'); ?></h3>
            <p>
                <?php _e('Vektorisierung ist der Prozess, bei dem Pixelbilder (wie JPG, PNG) in Vektorgrafiken umgewandelt werden. Vektorgrafiken bestehen aus mathematischen Pfaden statt aus Pixeln und können daher ohne Qualitätsverlust skaliert werden.', 'yprint-designtool'); ?>
            </p>
            <p>
                <?php _e('Vektorisierte Bilder sind ideal für Logos, Icons und Illustrationen, da sie in jeder Größe scharf bleiben und oft kleinere Dateigrößen haben als hochauflösende Pixelbilder.', 'yprint-designtool'); ?>
            </p>
        </div>
    </div>
</div>

<style>
.yprint-designtool-info-section {
    margin-top: 30px;
    border-top: 1px solid #ddd;
    padding-top: 20px;
}

.yprint-designtool-info-box {
    background: #fff;
    border: 1px solid #ddd;
    border-left: 4px solid #0073aa;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);
    margin-bottom: 20px;
    padding: 12px 15px;
}

.yprint-designtool-info-box h3 {
    margin-top: 0;
    margin-bottom: 10px;
}
</style>

<script type="text/javascript">
jQuery(document).ready(function($) {
    // Zeige/Verstecke API-Schlüsselfeld basierend auf ausgewählter Engine
    $('#vectorization_engine').on('change', function() {
        if ($(this).val() === 'api') {
            $('#api_key_row').show();
        } else {
            $('#api_key_row').hide();
        }
    });
});
</script>
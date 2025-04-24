<?php
/**
 * Template für Vektorisierungstest
 *
 * @package YPrint_DesignTool
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="yprint-vectorizer-test-container">
    <h2><?php _e('Bild Vektorisierung testen', 'yprint-designtool'); ?></h2>
    
    <div class="yprint-vectorizer-upload">
        <h3><?php _e('Bild hochladen', 'yprint-designtool'); ?></h3>
        <p><?php _e('Wähle ein Bild aus, um es zu vektorisieren.', 'yprint-designtool'); ?></p>
        <input type="file" id="yprint-vectorize-file" accept="image/*" />
    </div>
    
    <div class="yprint-vectorizer-options">
        <h3><?php _e('Vektorisierungsoptionen', 'yprint-designtool'); ?></h3>
        
        <div class="option-group">
        <label for="yprint-detail-level"><?php _e('Detailgrad:', 'yprint-designtool'); ?></label>
            <select id="yprint-detail-level">
                <option value="low"><?php _e('Niedrig (schneller, weniger Details)', 'yprint-designtool'); ?></option>
                <option value="medium" selected><?php _e('Mittel', 'yprint-designtool'); ?></option>
                <option value="high"><?php _e('Hoch (langsamer, mehr Details)', 'yprint-designtool'); ?></option>
            </select>
        </div>
        
        <div class="option-group">
            <label for="yprint-color-type"><?php _e('Farbmodus:', 'yprint-designtool'); ?></label>
            <select id="yprint-color-type">
                <option value="mono" selected><?php _e('Schwarz/Weiß', 'yprint-designtool'); ?></option>
                <option value="gray"><?php _e('Graustufen', 'yprint-designtool'); ?></option>
                <option value="color"><?php _e('Farbe', 'yprint-designtool'); ?></option>
            </select>
        </div>
        
        <div class="option-group color-options" style="display: none;">
            <label for="yprint-colors"><?php _e('Anzahl der Farben:', 'yprint-designtool'); ?></label>
            <input type="range" id="yprint-colors" min="2" max="16" value="8" />
            <span id="yprint-colors-value">8</span>
        </div>
        
        <div class="option-group">
            <label>
                <input type="checkbox" id="yprint-invert" />
                <?php _e('Farben invertieren', 'yprint-designtool'); ?>
            </label>
        </div>
        
        <div class="option-group">
            <label>
                <input type="checkbox" id="yprint-remove-background" checked />
                <?php _e('Hintergrund entfernen', 'yprint-designtool'); ?>
            </label>
        </div>
        
        <div class="yprint-vectorize-actions">
            <button id="yprint-vectorize-btn" class="button button-primary" disabled>
                <?php _e('Vektorisieren', 'yprint-designtool'); ?>
            </button>
        </div>
    </div>
    
    <div class="yprint-vectorizer-progress" style="display: none;">
        <h3><?php _e('Fortschritt', 'yprint-designtool'); ?></h3>
        <div class="progress-bar-container">
            <div class="progress-bar"></div>
        </div>
        <p class="progress-text"><?php _e('Vektorisierung läuft...', 'yprint-designtool'); ?></p>
    </div>
    
    <div class="yprint-vectorizer-result" style="display: none;">
        <h3><?php _e('Ergebnis', 'yprint-designtool'); ?></h3>
        
        <div class="result-preview-container">
            <div class="original-preview">
                <h4><?php _e('Original', 'yprint-designtool'); ?></h4>
                <div id="yprint-original-preview"></div>
            </div>
            <div class="svg-preview">
                <h4><?php _e('Vektorisiert (SVG)', 'yprint-designtool'); ?></h4>
                <div id="yprint-svg-preview"></div>
            </div>
        </div>
        
        <div class="result-actions">
            <button id="yprint-download-svg" class="button">
                <?php _e('SVG herunterladen', 'yprint-designtool'); ?>
            </button>
            <button id="yprint-add-to-design" class="button button-primary">
                <?php _e('Zum Design hinzufügen', 'yprint-designtool'); ?>
            </button>
        </div>
    </div>
</div>

<script type="text/javascript">
jQuery(document).ready(function($) {
    // Zeige/Verstecke Farboptionen basierend auf dem Farbtyp
    $('#yprint-color-type').on('change', function() {
        if ($(this).val() === 'color') {
            $('.color-options').show();
        } else {
            $('.color-options').hide();
        }
    });
    
    // Aktualisiere Farb-Slider-Wert
    $('#yprint-colors').on('input', function() {
        $('#yprint-colors-value').text($(this).val());
    });
    
    // Aktiviere den Vektorisieren-Button, wenn eine Datei ausgewählt wurde
    $('#yprint-vectorize-file').on('change', function() {
        if (this.files && this.files[0]) {
            $('#yprint-vectorize-btn').prop('disabled', false);
            
            // Zeige Vorschau des Originalbildes
            var reader = new FileReader();
            reader.onload = function(e) {
                $('#yprint-original-preview').html('<img src="' + e.target.result + '" alt="Original" />');
            };
            reader.readAsDataURL(this.files[0]);
        } else {
            $('#yprint-vectorize-btn').prop('disabled', true);
        }
    });
    
    // Vektorisieren-Button-Handler
    $('#yprint-vectorize-btn').on('click', function() {
        var fileInput = $('#yprint-vectorize-file')[0];
        if (!fileInput.files || !fileInput.files[0]) {
            alert('<?php echo esc_js(__('Bitte wähle zuerst ein Bild aus.', 'yprint-designtool')); ?>');
            return;
        }
        
        // Optionen sammeln
        var options = {
            detail_level: $('#yprint-detail-level').val(),
            color_type: $('#yprint-color-type').val(),
            colors: $('#yprint-colors').val(),
            invert: $('#yprint-invert').prop('checked') ? 1 : 0,
            remove_background: $('#yprint-remove-background').prop('checked') ? 1 : 0
        };
        
        // Fortschrittsanzeige zeigen
        $('.yprint-vectorizer-progress').show();
        $('.progress-bar').css('width', '10%');
        
        // FormData für AJAX erstellen
        var formData = new FormData();
        formData.append('action', 'yprint_vectorize_image');
        formData.append('nonce', yprintDesignTool.nonce);
        formData.append('image', fileInput.files[0]);
        
        // Optionen hinzufügen
        for (var key in options) {
            formData.append(key, options[key]);
        }
        
        // AJAX-Anfrage senden
        $.ajax({
            url: yprintDesignTool.ajaxUrl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener('progress', function(e) {
                    if (e.lengthComputable) {
                        var percent = Math.round((e.loaded / e.total) * 50); // Upload ist 50% des Fortschritts
                        $('.progress-bar').css('width', percent + '%');
                    }
                }, false);
                return xhr;
            },
            success: function(response) {
                // Fortschritt simulieren
                $('.progress-bar').css('width', '75%');
                
                setTimeout(function() {
                    $('.progress-bar').css('width', '100%');
                    
                    if (response.success) {
                        // SVG-Vorschau anzeigen
                        $('#yprint-svg-preview').html(response.data.svg);
                        
                        // Download-Button einrichten
                        $('#yprint-download-svg').off('click').on('click', function() {
                            // SVG herunterladen
                            var blob = new Blob([response.data.svg], {type: 'image/svg+xml'});
                            var url = window.URL.createObjectURL(blob);
                            var a = document.createElement('a');
                            var filename = fileInput.files[0].name.replace(/\.[^/.]+$/, '.svg');
                            
                            a.href = url;
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                        });
                        
                        // Ergebnisbereich anzeigen
                        $('.yprint-vectorizer-result').show();
                    } else {
                        alert('<?php echo esc_js(__('Fehler bei der Vektorisierung:', 'yprint-designtool')); ?> ' + 
                              response.data.message);
                    }
                    
                    // Fortschrittsanzeige ausblenden
                    setTimeout(function() {
                        $('.yprint-vectorizer-progress').hide();
                        $('.progress-bar').css('width', '0%');
                    }, 500);
                }, 500);
            },
            error: function(xhr, status, error) {
                $('.progress-bar').css('width', '0%');
                alert('<?php echo esc_js(__('Ein Fehler ist aufgetreten:', 'yprint-designtool')); ?> ' + error);
                $('.yprint-vectorizer-progress').hide();
            }
        });
    });
    
    // "Zum Design hinzufügen"-Button
    $('#yprint-add-to-design').on('click', function() {
        // Diese Funktion wird später implementiert, wenn das Design-Tool bereit ist
        alert('<?php echo esc_js(__('Diese Funktion wird in einer zukünftigen Version verfügbar sein.', 'yprint-designtool')); ?>');
    });
});
</script>

<style type="text/css">
.yprint-vectorizer-test-container {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.yprint-vectorizer-upload,
.yprint-vectorizer-options,
.yprint-vectorizer-result {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    background: #f9f9f9;
}

.option-group {
    margin-bottom: 15px;
}

.option-group label {
    display: block;
    margin-bottom: 5px;
}

.yprint-vectorize-actions {
    margin-top: 20px;
}

.progress-bar-container {
    height: 20px;
    background-color: #f1f1f1;
    border-radius: 4px;
    margin-bottom: 10px;
    overflow: hidden;
}

.progress-bar {
    width: 0;
    height: 100%;
    background-color: #4CAF50;
    transition: width 0.3s;
}

.result-preview-container {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

.original-preview,
.svg-preview {
    flex: 1;
    min-width: 0;
}

.original-preview img,
.svg-preview svg {
    max-width: 100%;
    max-height: 300px;
    display: block;
    margin: 0 auto;
    border: 1px solid #ddd;
    background: #fff;
}

.result-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}
</style>
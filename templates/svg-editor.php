<?php
/**
 * SVG Editor Template
 *
 * @package YPrint_DesignTool
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap yprint-designtool">
    <h1><?php _e('SVG-Editor', 'yprint-designtool'); ?></h1>
    
    <div class="yprint-info-box">
        <p><?php _e('Dieser Editor ermöglicht dir das Bearbeiten und Optimieren von SVG-Dateien für deine Print-on-Demand Designs. Lade eine SVG-Datei hoch und nutze die verschiedenen Werkzeuge in der Toolbar, um dein Design zu verbessern.', 'yprint-designtool'); ?></p>
    </div>
    
    <div class="yprint-svg-editor-container">
        <!-- Linke Seite: Tools & Optionen -->
        <div class="yprint-svg-editor-sidebar">
            <div class="yprint-svg-editor-section">
                <h2><?php _e('SVG hochladen', 'yprint-designtool'); ?></h2>
                
                <div class="yprint-upload-area">
                    <p><?php _e('Wähle eine SVG-Datei aus oder ziehe sie hierher.', 'yprint-designtool'); ?></p>
                    <input type="file" id="yprint-svg-upload" accept=".svg" />
                    <button type="button" id="yprint-svg-upload-btn" class="button button-primary"><?php _e('SVG-Datei auswählen', 'yprint-designtool'); ?></button>
                </div>
            </div>
            
            <div class="yprint-svg-editor-section">
                <h2><?php _e('SVG-Optimierung', 'yprint-designtool'); ?></h2>
                
                <div class="yprint-svg-enhancer-controls">
                    <div class="yprint-enhancer-control">
                        <label for="yprint-line-thickness"><?php _e('Linienstärke', 'yprint-designtool'); ?>: <span class="thickness-value">1</span></label>
                        <input type="range" id="yprint-line-thickness" min="0.5" max="5" step="0.1" value="1">
                    </div>
                    
                    <div class="yprint-enhancer-control" id="smoothing-control" style="display: none;">
                        <label for="yprint-smooth-level"><?php _e('Glättungsstärke', 'yprint-designtool'); ?>: <span class="smooth-value">0</span>%</label>
                        <input type="range" id="yprint-smooth-level" min="0" max="100" step="1" value="0">
                    </div>
                    
                    <div class="yprint-enhancer-actions">
                        <button type="button" id="yprint-enhance-svg-btn" class="yprint-enhancer-btn" disabled>
                            <?php _e('Linien verstärken', 'yprint-designtool'); ?>
                        </button>
                        
                        <button type="button" id="yprint-smooth-svg-btn" class="yprint-enhancer-btn" disabled>
                            <?php _e('SVG verschönern', 'yprint-designtool'); ?>
                        </button>
                        
                        <button type="button" id="yprint-reset-svg-btn" class="yprint-enhancer-btn" disabled>
                            <?php _e('Zurücksetzen', 'yprint-designtool'); ?>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="yprint-svg-editor-section">
                <h2><?php _e('SVG speichern', 'yprint-designtool'); ?></h2>
                
                <div class="yprint-svg-save-options">
                    <button type="button" id="yprint-svg-download-btn" class="button button-primary" disabled><?php _e('SVG herunterladen', 'yprint-designtool'); ?></button>
                    
                    <?php if (current_user_can('upload_files')) : ?>
                    <button type="button" id="yprint-svg-save-media-btn" class="button button-primary" disabled><?php _e('In Medienbibliothek speichern', 'yprint-designtool'); ?></button>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        
        <!-- Rechte Seite: Canvas & Vorschau -->
        <div class="yprint-svg-editor-canvas-area">
            <div class="yprint-svg-editor-toolbar">
                <div class="yprint-svg-toolbar-group">
                    <button type="button" class="yprint-svg-toolbar-btn" data-action="zoom-in" title="<?php esc_attr_e('Vergrößern', 'yprint-designtool'); ?>">
                        <span class="dashicons dashicons-plus"></span>
                    </button>
                    <button type="button" class="yprint-svg-toolbar-btn" data-action="zoom-out" title="<?php esc_attr_e('Verkleinern', 'yprint-designtool'); ?>">
                        <span class="dashicons dashicons-minus"></span>
                    </button>
                    <button type="button" class="yprint-svg-toolbar-btn" data-action="rotate" title="<?php esc_attr_e('Drehen', 'yprint-designtool'); ?>">
                        <span class="dashicons dashicons-image-rotate"></span>
                    </button>
                    <button type="button" class="yprint-svg-toolbar-btn" data-action="reset" title="<?php esc_attr_e('Zurücksetzen', 'yprint-designtool'); ?>">
                        <span class="dashicons dashicons-image-rotate-left"></span>
                    </button>
                </div>
                
                <div class="yprint-svg-toolbar-group">
                    <button type="button" class="yprint-svg-toolbar-btn" data-action="select" title="<?php esc_attr_e('Auswählen', 'yprint-designtool'); ?>">
                        <span class="dashicons dashicons-arrow-up-alt"></span>
                    </button>
                    <button type="button" class="yprint-svg-toolbar-btn" data-action="move" title="<?php esc_attr_e('Verschieben', 'yprint-designtool'); ?>">
                        <span class="dashicons dashicons-move"></span>
                    </button>
                </div>
                
                <div class="yprint-svg-toolbar-group">
                    <button type="button" class="yprint-svg-toolbar-btn" data-action="smooth" title="<?php esc_attr_e('Glätten', 'yprint-designtool'); ?>">
                        <span class="dashicons dashicons-admin-customizer"></span>
                    </button>
                    <button type="button" class="yprint-svg-toolbar-btn" data-action="simplify" title="<?php esc_attr_e('Vereinfachen', 'yprint-designtool'); ?>">
                        <span class="dashicons dashicons-editor-removeformatting"></span>
                    </button>
                </div>
            </div>
            
            <div id="yprint-svg-canvas-container" class="yprint-svg-canvas-container">
                <div class="yprint-svg-upload-placeholder">
                    <p><?php _e('Lade eine SVG-Datei hoch, um sie zu bearbeiten', 'yprint-designtool'); ?></p>
                </div>
            </div>
        </div>
    </div>
    
    <div class="yprint-svg-editor-message"></div>
</div>

<style>
.yprint-svg-editor-container {
    display: flex;
    gap: 20px;
    margin: 20px 0;
}

.yprint-svg-editor-sidebar {
    width: 300px;
    flex-shrink: 0;
}

.yprint-svg-editor-canvas-area {
    flex: 1;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 4px;
    min-height: 600px;
    display: flex;
    flex-direction: column;
}

.yprint-svg-editor-section {
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 20px;
}

.yprint-svg-editor-section h2 {
    font-size: 16px;
    margin-top: 0;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}

.yprint-upload-area {
    text-align: center;
    padding: 20px 15px;
    border: 2px dashed #ddd;
    border-radius: 4px;
    background-color: #f9f9f9;
    transition: all 0.3s;
}

.yprint-upload-area:hover,
.yprint-upload-area.drag-over {
    background-color: #eaf7ff;
    border-color: #2196F3;
}

.yprint-upload-area input[type="file"] {
    display: none;
}

.yprint-upload-area p {
    margin-bottom: 15px;
}

.yprint-svg-editor-toolbar {
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #fff;
    border-bottom: 1px solid #ddd;
}

.yprint-svg-toolbar-group {
    display: flex;
    align-items: center;
    margin-right: 15px;
    padding-right: 15px;
    border-right: 1px solid #eee;
}

.yprint-svg-toolbar-group:last-child {
    border-right: none;
}

.yprint-svg-toolbar-btn {
    width: 32px;
    height: 32px;
    margin-right: 5px;
    border: 1px solid transparent;
    border-radius: 4px;
    background-color: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.yprint-svg-toolbar-btn:hover {
    background-color: #f5f5f5;
    border-color: #ddd;
}

.yprint-svg-toolbar-btn.active {
    background-color: #e9f7fe;
    border-color: #b3e5fc;
    color: #0288d1;
}

.yprint-svg-canvas-container {
    flex: 1;
    position: relative;
    background-color: #fff;
    overflow: hidden;
}

.yprint-svg-upload-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    color: #666;
    text-align: center;
    padding: 20px;
}

.yprint-svg-editor-message {
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 4px;
    bottom: 20px;
    color: white;
    display: none;
    font-size: 14px;
    left: 20px;
    padding: 10px 15px;
    position: fixed;
    text-align: center;
    z-index: 100;
    max-width: 80%;
}

.yprint-path-operations-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 15px;
}

.yprint-svg-path-operation {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 120px;
}

/* Responsives Design */
@media (max-width: 992px) {
    .yprint-svg-editor-container {
        flex-direction: column;
    }
    
    .yprint-svg-editor-sidebar {
        width: 100%;
    }
    
    .yprint-svg-editor-canvas-area {
        min-height: 400px;
    }
}
</style>

<script type="text/javascript">
jQuery(document).ready(function($) {
    var originalSVG = '';
    var currentSVG = '';
    var svgHistory = [];
    var historyIndex = -1;
    var svgEditor = {
        $canvasContainer: $('#yprint-svg-canvas-container'),
        $uploadBtn: $('#yprint-svg-upload-btn'),
        $fileInput: $('#yprint-svg-upload'),
        
        init: function() {
            this.bindEvents();
            this.initToolbar();
        },
        
        bindEvents: function() {
            var self = this;
            
            // SVG Upload Button
            this.$uploadBtn.on('click', function() {
                self.$fileInput.click();
            });
            
            // File Upload Handler
this.$fileInput.on('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'image/svg+xml' && !file.name.endsWith('.svg')) {
        self.showMessage('<?php echo esc_js(__('Bitte wähle eine SVG-Datei aus.', 'yprint-designtool')); ?>');
        return;
    }
    
    self.loadSVGFile(file);
});
            
            // Drag & Drop Support
            var $uploadArea = $('.yprint-upload-area');
            
            $uploadArea.on('dragover', function(e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).addClass('drag-over');
            });
            
            $uploadArea.on('dragleave', function(e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).removeClass('drag-over');
            });
            
            $uploadArea.on('drop', function(e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).removeClass('drag-over');
                
                var files = e.originalEvent.dataTransfer.files;
                if (files && files[0]) {
                    self.$fileInput[0].files = files;
                    self.$fileInput.trigger('change');
                }
            });
            
            // Enhance SVG lines button
            $('#yprint-enhance-svg-btn').on('click', function() {
                if (!currentSVG) {
                    self.showMessage('<?php echo esc_js(__('Keine SVG zum Verbessern gefunden.', 'yprint-designtool')); ?>');
                    return;
                }
                
                var thickness = parseFloat($('#yprint-line-thickness').val());
                
                $.ajax({
                    url: yprintSVGEnhancer.ajaxUrl,
                    type: 'POST',
                    data: {
                        action: 'yprint_enhance_svg_lines',
                        nonce: yprintSVGEnhancer.nonce,
                        svg_content: currentSVG,
                        thickness: thickness
                    },
                    beforeSend: function() {
                        self.showMessage('<?php echo esc_js(__('Verstärke SVG-Linien...', 'yprint-designtool')); ?>');
                        $('#yprint-enhance-svg-btn').prop('disabled', true);
                    },
                    success: function(response) {
                        $('#yprint-enhance-svg-btn').prop('disabled', false);
                        
                        if (response.success && response.data.svg_content) {
                            self.addToHistory(currentSVG);
                            currentSVG = response.data.svg_content;
                            self.updateSVGDisplay(currentSVG);
                            self.showMessage('<?php echo esc_js(__('SVG-Linien erfolgreich verstärkt!', 'yprint-designtool')); ?>');
                        } else {
                            self.showMessage(response.data.message || '<?php echo esc_js(__('Fehler beim Verstärken der SVG-Linien.', 'yprint-designtool')); ?>');
                        }
                    },
                    error: function() {
                        $('#yprint-enhance-svg-btn').prop('disabled', false);
                        self.showMessage('<?php echo esc_js(__('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.', 'yprint-designtool')); ?>');
                    }
                });
            });
            
            // SVG verschönern button
$('#yprint-smooth-svg-btn').on('click', function() {
    if (!currentSVG) {
        self.showMessage('<?php echo esc_js(__('Keine SVG zum Verschönern gefunden.', 'yprint-designtool')); ?>');
        return;
    }
    
    // Kopie des ursprünglichen SVGs für Sicherheitsmaßnahmen
    var safeOriginalSVG = originalSVG;
    var displayedSVG = currentSVG;
    
    // Zeige den Regler an und deaktiviere andere Buttons
    $('#smoothing-control').fadeIn();
    
    // Wenn der Slider aktualisiert wird, aktualisieren wir das SVG in Echtzeit
    $('#yprint-smooth-level').off('input').on('input', function() {
        var smoothLevel = parseInt($(this).val());
        $('.smooth-value').text(smoothLevel);
        
        // Debug-Info in Konsole
        console.log("Slider-Wert geändert: " + smoothLevel + "%");
        
        if (smoothLevel === 0) {
            // Bei 0% zeigen wir das Original an
            self.updateSVGDisplay(safeOriginalSVG);
            return;
        }
        
        // Für höhere Werte (über 3%) eine Warnung anzeigen
        if (smoothLevel > 3) {
            console.warn("Hoher Glättungswert: " + smoothLevel + "% - Könnte zu Problemen führen");
        }
        
        // Kopie des SVG für Debug-Zwecke (nur Anfang)
        console.log("SVG Anfang (Debug): " + safeOriginalSVG.substring(0, 200) + "...");
        console.log("SVG Länge: " + safeOriginalSVG.length);
        
        // Bei Werten über 10% den Vorgang sicherer machen
        var actualSmoothLevel = smoothLevel;
        if (smoothLevel > 10) {
            console.warn("Hoher Wert reduziert zu Testzwecken auf 10%");
            actualSmoothLevel = 10; // Begrenze auf 10% für mehr Stabilität
        }
        
        $.ajax({
            url: yprintSVGEnhancer.ajaxUrl,
            type: 'POST',
            data: {
                action: 'yprint_smooth_svg',
                nonce: yprintSVGEnhancer.nonce,
                svg_content: safeOriginalSVG,
                smooth_level: actualSmoothLevel
            },
            success: function(response) {
                console.log("AJAX Antwort erhalten - Erfolg: " + (response.success ? "Ja" : "Nein"));
                
                if (response.success && response.data.svg_content) {
                    var resultSVG = response.data.svg_content;
                    
                    // Prüfe ob das resultierende SVG valide ist (Basis-Check)
                    var isValidSVG = resultSVG.indexOf('<svg') >= 0 && resultSVG.indexOf('</svg>') > 0;
                    console.log("SVG Validität: " + (isValidSVG ? "OK" : "UNGÜLTIG!"));
                    console.log("SVG Ergebnis-Länge: " + resultSVG.length);
                    console.log("SVG Ergebnis (Anfang): " + resultSVG.substring(0, 200) + "...");
                    console.log("SVG Ergebnis (Ende): " + resultSVG.substring(resultSVG.length - 100) + "...");
                    
                    if (isValidSVG) {
                        try {
                            // Teste, ob das SVG geparst werden kann
                            var parser = new DOMParser();
                            var svgDoc = parser.parseFromString(resultSVG, "image/svg+xml");
                            var parserError = svgDoc.querySelector("parsererror");
                            
                            if (parserError) {
                                console.error("SVG Parser-Fehler:", parserError.textContent);
                                // Bei Fehler Original anzeigen
                                self.updateSVGDisplay(displayedSVG);
                                return;
                            }
                            
                            // Nur Vorschau, noch nicht speichern
                            displayedSVG = resultSVG; // Aktualisiere die zuletzt angezeigte Version
                            self.updateSVGDisplay(resultSVG);
                            console.log("SVG Display aktualisiert");
                        } catch (e) {
                            console.error("Fehler beim SVG-Parsen:", e);
                            self.updateSVGDisplay(displayedSVG);
                        }
                    } else {
                        console.error("SVG ist ungültig!");
                        self.updateSVGDisplay(displayedSVG);
                    }
                } else {
                    console.error("Fehler in AJAX-Antwort", response);
                    if (response.data && response.data.message) {
                        console.error("Fehlermeldung: " + response.data.message);
                    }
                    self.updateSVGDisplay(displayedSVG);
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX Fehler: " + error);
                console.error("Status: " + status);
                console.error("Response Text: " + xhr.responseText);
                
                try {
                    var jsonResponse = JSON.parse(xhr.responseText);
                    console.error("Parsed error response:", jsonResponse);
                } catch(e) {
                    console.error("Konnte Antwort nicht als JSON parsen");
                }
                // Bei Fehler Original anzeigen
                self.updateSVGDisplay(displayedSVG);
            }
        });
    });
    
    // Wenn der Benutzer die Maus loslässt, speichern wir die Änderung
    $('#yprint-smooth-level').off('change').on('change', function() {
        var smoothLevel = parseInt($(this).val());
        console.log("Slider Änderung bestätigt: " + smoothLevel + "%");
        
        if (smoothLevel === 0) {
            // Bei 0% setzen wir auf das Original zurück
            currentSVG = safeOriginalSVG;
            self.updateSVGDisplay(currentSVG);
            return;
        }
        
        // Bei Werten über 10% den Vorgang sicherer machen
        var actualSmoothLevel = smoothLevel;
        if (smoothLevel > 10) {
            console.warn("Hoher Wert reduziert zu Testzwecken auf 10%");
            actualSmoothLevel = 10; // Begrenze auf 10% für mehr Stabilität
        }
        
        $.ajax({
            url: yprintSVGEnhancer.ajaxUrl,
            type: 'POST',
            data: {
                action: 'yprint_smooth_svg',
                nonce: yprintSVGEnhancer.nonce,
                svg_content: safeOriginalSVG,
                smooth_level: actualSmoothLevel
            },
            beforeSend: function() {
                self.showMessage('<?php echo esc_js(__('Verschönere SVG...', 'yprint-designtool')); ?>');
                console.log("Starte SVG-Glättung mit Level " + actualSmoothLevel + "%");
            },
            success: function(response) {
                console.log("Glättung abgeschlossen - Erfolg: " + (response.success ? "Ja" : "Nein"));
                
                if (response.success && response.data.svg_content) {
                    var resultSVG = response.data.svg_content;
                    
                    // Prüfe ob das resultierende SVG valide ist (Basis-Check)
                    var isValidSVG = resultSVG.indexOf('<svg') >= 0 && resultSVG.indexOf('</svg>') > 0;
                    console.log("SVG Validität: " + (isValidSVG ? "OK" : "UNGÜLTIG!"));
                    console.log("SVG Ergebnis-Länge: " + resultSVG.length);
                    
                    if (isValidSVG) {
                        try {
                            // Teste, ob das SVG geparst werden kann
                            var parser = new DOMParser();
                            var svgDoc = parser.parseFromString(resultSVG, "image/svg+xml");
                            var parserError = svgDoc.querySelector("parsererror");
                            
                            if (parserError) {
                                console.error("SVG Parser-Fehler:", parserError.textContent);
                                self.showMessage('<?php echo esc_js(__('Fehler beim Parsen des SVG. Versuche einen niedrigeren Wert.', 'yprint-designtool')); ?>');
                                self.updateSVGDisplay(currentSVG);
                                return;
                            }
                            
                            self.addToHistory(currentSVG);
                            currentSVG = resultSVG;
                            self.updateSVGDisplay(currentSVG);
                            self.showMessage('<?php echo esc_js(__('SVG erfolgreich verschönert!', 'yprint-designtool')); ?>');
                        } catch (e) {
                            console.error("Fehler beim SVG-Parsen:", e);
                            self.showMessage('<?php echo esc_js(__('Fehler beim Parsen des SVG. Versuche einen niedrigeren Wert.', 'yprint-designtool')); ?>');
                            self.updateSVGDisplay(currentSVG);
                        }
                    } else {
                        console.error("SVG ist ungültig!");
                        self.showMessage('<?php echo esc_js(__('Das erzeugte SVG ist ungültig. Versuche einen niedrigeren Wert.', 'yprint-designtool')); ?>');
                        self.updateSVGDisplay(currentSVG);
                    }
                } else {
                    console.error("Fehler im Erfolgsfall", response);
                    var errorMsg = response.data && response.data.message ? response.data.message : '<?php echo esc_js(__('Fehler beim Verschönern der SVG.', 'yprint-designtool')); ?>';
                    self.showMessage(errorMsg);
                    self.updateSVGDisplay(currentSVG);
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX Fehler bei Glättung: " + error);
                console.error("Status: " + status);
                console.error("Response Text: " + xhr.responseText);
                
                try {
                    var errorDetails = JSON.parse(xhr.responseText);
                    console.error("Detaillierter Fehler:", errorDetails);
                    
                    if (errorDetails && errorDetails.data && errorDetails.data.message) {
                        self.showMessage(errorDetails.data.message);
                    } else {
                        self.showMessage('<?php echo esc_js(__('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.', 'yprint-designtool')); ?>');
                    }
                } catch(e) {
                    console.error("Konnte Fehlerantwort nicht parsen:", e);
                    self.showMessage('<?php echo esc_js(__('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.', 'yprint-designtool')); ?>');
                }
                
                self.updateSVGDisplay(currentSVG);
            }
        });
    });
});
            
            // Reset SVG button
            $('#yprint-reset-svg-btn').on('click', function() {
                if (!originalSVG) {
                    self.showMessage('<?php echo esc_js(__('Keine Original-SVG zum Zurücksetzen gefunden.', 'yprint-designtool')); ?>');
                    return;
                }
                
                self.addToHistory(currentSVG);
                currentSVG = originalSVG;
                self.updateSVGDisplay(currentSVG);
                self.showMessage('<?php echo esc_js(__('SVG auf Originalzustand zurückgesetzt.', 'yprint-designtool')); ?>');
            });
            
            // Download SVG button
            $('#yprint-svg-download-btn').on('click', function() {
                if (!currentSVG) {
                    self.showMessage('<?php echo esc_js(__('Keine SVG zum Herunterladen gefunden.', 'yprint-designtool')); ?>');
                    return;
                }
                
                $.ajax({
                    url: yprintSVGPreview.ajaxUrl,
                    type: 'POST',
                    data: {
                        action: 'yprint_download_svg',
                        nonce: yprintSVGPreview.nonce,
                        svg_content: currentSVG,
                        filename: 'yprint-design.svg'
                    },
                    beforeSend: function() {
                        self.showMessage('<?php echo esc_js(__('SVG wird zum Download vorbereitet...', 'yprint-designtool')); ?>');
                        $('#yprint-svg-download-btn').prop('disabled', true);
                    },
                    success: function(response) {
                        $('#yprint-svg-download-btn').prop('disabled', false);
                        
                        if (response.success && response.data.file_url) {
                            // Download initiieren
                            var a = document.createElement('a');
                            a.href = response.data.file_url;
                            a.download = response.data.filename || 'yprint-design.svg';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            
                            self.showMessage('<?php echo esc_js(__('SVG wurde erfolgreich zum Download bereitgestellt.', 'yprint-designtool')); ?>');
                        } else {
                            self.showMessage(response.data.message || '<?php echo esc_js(__('Fehler beim Vorbereiten des Downloads.', 'yprint-designtool')); ?>');
                        }
                    },
                    error: function() {
                        $('#yprint-svg-download-btn').prop('disabled', false);
                        self.showMessage('<?php echo esc_js(__('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.', 'yprint-designtool')); ?>');
                    }
                });
            });
            
            // Save to Media Library button
            $('#yprint-svg-save-media-btn').on('click', function() {
                if (!currentSVG) {
                    self.showMessage('<?php echo esc_js(__('Keine SVG zum Speichern gefunden.', 'yprint-designtool')); ?>');
                    return;
                }
                
                var filename = prompt('<?php echo esc_js(__('Dateiname für die SVG:', 'yprint-designtool')); ?>', 'yprint-design-' + Date.now() + '.svg');
                
                if (!filename) return;
                
                $.ajax({
                    url: yprintSVGPreview.ajaxUrl,
                    type: 'POST',
                    data: {
                        action: 'yprint_save_svg_to_media',
                        nonce: yprintSVGPreview.nonce,
                        svg_content: currentSVG,
                        filename: filename
                    },
                    beforeSend: function() {
                        self.showMessage('<?php echo esc_js(__('SVG wird in Medienbibliothek gespeichert...', 'yprint-designtool')); ?>');
                        $('#yprint-svg-save-media-btn').prop('disabled', true);
                    },
                    success: function(response) {
                        $('#yprint-svg-save-media-btn').prop('disabled', false);
                        
                        if (response.success && response.data.attachment_url) {
                            self.showMessage('<?php echo esc_js(__('SVG wurde erfolgreich in der Medienbibliothek gespeichert.', 'yprint-designtool')); ?>');
                        } else {
                            self.showMessage(response.data.message || '<?php echo esc_js(__('Fehler beim Speichern in der Medienbibliothek.', 'yprint-designtool')); ?>');
                        }
                    },
                    error: function() {
                        $('#yprint-svg-save-media-btn').prop('disabled', false);
                        self.showMessage('<?php echo esc_js(__('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.', 'yprint-designtool')); ?>');
                    }
                });
            });
            
            // Toolbar buttons
            $('.yprint-svg-toolbar-btn').on('click', function() {
                var action = $(this).data('action');
                self.handleToolbarAction(action);
            });
            
            // Reset SVG bei Klick auf Zurücksetzen
$('#yprint-reset-svg-btn').on('click', function() {
    // Den Glättungsregler zurücksetzen und ausblenden
    $('#yprint-smooth-level').val(0);
    $('.smooth-value').text('0');
    $('#smoothing-control').fadeOut();
});
            
            // Range input changes
            $('#yprint-line-thickness').on('input', function() {
                $('.thickness-value').text($(this).val());
            });
            
            $('#yprint-detail-level').on('input', function() {
                $('.detail-value').text($(this).val());
            });
        },
        
        initToolbar: function() {
            // Set initial button states
            $('.yprint-svg-toolbar-btn').prop('disabled', true);
        },
        
        loadSVGFile: function(file) {
    var self = this;
    var reader = new FileReader();
    
    reader.onload = function(e) {
        originalSVG = e.target.result;
        currentSVG = originalSVG;
        
        // Reset history
        svgHistory = [];
        historyIndex = -1;
        
        // Update display
        self.updateSVGDisplay(currentSVG);
        
        // Enable buttons
        $('.yprint-svg-toolbar-btn').prop('disabled', false);
        $('.yprint-svg-path-operation').prop('disabled', false);
        $('#yprint-enhance-svg-btn').prop('disabled', false);
        $('#yprint-smooth-svg-btn').prop('disabled', false);
        $('#yprint-simplify-svg-btn').prop('disabled', false);
        $('#yprint-reset-svg-btn').prop('disabled', false);
        $('#yprint-svg-download-btn').prop('disabled', false);
        $('#yprint-svg-save-media-btn').prop('disabled', false);
        
        self.showMessage('<?php echo esc_js(__('SVG erfolgreich geladen!', 'yprint-designtool')); ?>');
    };
    
    reader.readAsText(file);
},
        
updateSVGDisplay: function(svgContent) {
    // Validiere das SVG-Inhaltsformat
    var validSVG = true;
    
    console.log("updateSVGDisplay aufgerufen mit Inhalt der Länge: " + (svgContent ? svgContent.length : 0));
    
    // Basische Überprüfung des SVG-Inhalts
    if (!svgContent || typeof svgContent !== 'string' || svgContent.trim() === '') {
        console.error("SVG-Inhalt ist leer oder kein String");
        validSVG = false;
    } else if (svgContent.indexOf('<svg') === -1 || svgContent.indexOf('</svg>') === -1) {
        console.error("SVG-Inhalt hat keine SVG-Tags");
        validSVG = false;
    }
    
    // Remove placeholder
    this.$canvasContainer.find('.yprint-svg-upload-placeholder').hide();
    
    // Remove previous SVG and error messages if they exist
    this.$canvasContainer.find('svg, .svg-error-message').remove();
    
    // Prüfe ob wir ein gültiges SVG haben
    if (!validSVG) {
        console.error("Ungültiges SVG!");
        // Füge Fehlermeldung hinzu
        this.$canvasContainer.append('<div class="svg-error-message">Fehler: Ungültiges SVG-Format.</div>');
        return;
    }
    
    try {
        // Create a container for the SVG to ensure proper handling
        var $svgContainer = $('<div class="svg-wrapper"></div>');
        this.$canvasContainer.append($svgContainer);
        
        // Add new SVG with error handling
        $svgContainer.html(svgContent);
        
        // Adjust SVG size to fit canvas
        var $svg = this.$canvasContainer.find('svg');
        
        if ($svg.length === 0) {
            console.error("SVG konnte nicht in DOM eingefügt werden!");
            this.$canvasContainer.append('<div class="svg-error-message">Fehler: SVG konnte nicht angezeigt werden.</div>');
            return;
        }
        
        console.log("SVG erfolgreich in DOM eingefügt. Abmessungen:", $svg.width(), "x", $svg.height());
        console.log("SVG viewBox:", $svg.attr('viewBox'));
        
        // Ensure the SVG has dimensions
        var svgWidth = $svg.attr('width') || '100%';
        var svgHeight = $svg.attr('height') || '100%';
        
        // Ensure necessary attributes for proper rendering
        $svg.attr({
            'width': svgWidth,
            'height': svgHeight,
            'preserveAspectRatio': 'xMidYMid meet'
        });
        
        $svg.css({
            'max-width': '100%',
            'max-height': '100%',
            'width': 'auto',
            'height': 'auto',
            'display': 'block', // Ensure it's a block element
            'position': 'absolute',
            'top': '50%',
            'left': '50%',
            'transform': 'translate(-50%, -50%)',
            'visibility': 'visible', // Explicitly make it visible
            'opacity': '1'
        });
        
        // Add debug info in canvas for visibility issues
        var debugInfo = "SVG Sichtbarkeitsinfo - Breite: " + $svg.width() + "px, Höhe: " + $svg.height() + "px";
        this.$canvasContainer.append('<div class="debug-info" style="position:absolute; bottom:5px; left:5px; font-size:10px; color:#999;">' + debugInfo + '</div>');
        
    } catch (e) {
        console.error("Fehler beim Anzeigen des SVGs:", e);
        console.error("SVG Inhalt (gekürzt):", svgContent.substring(0, 100) + "...");
        this.$canvasContainer.append('<div class="svg-error-message">Fehler: ' + e.message + '</div>');
    }
},
        
        handleToolbarAction: function(action) {
            var $svg = this.$canvasContainer.find('svg');
            if (!$svg.length) return;
            
            switch (action) {
                case 'zoom-in':
                    this.zoomSVG(1.2);
                    break;
                case 'zoom-out':
                    this.zoomSVG(0.8);
                    break;
                case 'rotate':
                    this.rotateSVG(90);
                    break;
                case 'reset':
                    this.resetSVGView();
                    break;
                case 'select':
                    this.activateSelectTool();
                    break;
                case 'move':
                    this.activateMoveTool();
                    break;
                case 'smooth':
                    this.smoothSVG();
                    break;
                case 'simplify':
                    this.simplifySVG();
                    break;
            }
        },
        
        zoomSVG: function(factor) {
            var $svg = this.$canvasContainer.find('svg');
            if (!$svg.length) return;
            
            var currentScale = parseFloat($svg.data('scale') || 1);
            var newScale = currentScale * factor;
            
            // Limit scale
            newScale = Math.max(0.1, Math.min(5, newScale));
            
            $svg.css('transform', 'translate(-50%, -50%) scale(' + newScale + ')');
            $svg.data('scale', newScale);
        },
        
        rotateSVG: function(degrees) {
            var $svg = this.$canvasContainer.find('svg');
            if (!$svg.length) return;
            
            var currentRotation = parseInt($svg.data('rotation') || 0);
            var newRotation = currentRotation + degrees;
            
            $svg.css('transform', 'translate(-50%, -50%) scale(' + ($svg.data('scale') || 1) + ') rotate(' + newRotation + 'deg)');
            $svg.data('rotation', newRotation);
        },
        
        resetSVGView: function() {
            var $svg = this.$canvasContainer.find('svg');
            if (!$svg.length) return;
            
            $svg.css('transform', 'translate(-50%, -50%)');
            $svg.data('scale', 1);
            $svg.data('rotation', 0);
        },
        
        activateSelectTool: function() {
            $('.yprint-svg-toolbar-btn').removeClass('active');
            $('.yprint-svg-toolbar-btn[data-action="select"]').addClass('active');
            
            // Implement selection logic here
        },
        
        activateMoveTool: function() {
            $('.yprint-svg-toolbar-btn').removeClass('active');
            $('.yprint-svg-toolbar-btn[data-action="move"]').addClass('active');
            
            // Implement move logic here
        },
        
        smoothSVG: function() {
            // Similar to simplify but with different parameters
            this.showMessage('<?php echo esc_js(__('SVG-Glättung noch nicht implementiert.', 'yprint-designtool')); ?>');
        },
        
        simplifySVG: function() {
            // Already implemented with the simplify button
            $('#yprint-simplify-svg-btn').click();
        },
        
        handlePathOperation: function(operation) {
            var self = this;
            
            if (!currentSVG) {
                self.showMessage('<?php echo esc_js(__('Keine SVG für die Operation gefunden.', 'yprint-designtool')); ?>');
                return;
            }
            
            switch (operation) {
                case 'enhance-lines':
                    $('#yprint-enhance-svg-btn').click();
                    break;
                case 'combine':
                    // Implement combine paths logic using YPrintSVGPath
                    if (typeof YPrintSVGPath !== 'undefined') {
                        YPrintSVGPath.combinePaths();
                    } else {
                        self.showMessage('<?php echo esc_js(__('SVG-Pfad-Module nicht verfügbar.', 'yprint-designtool')); ?>');
                    }
                    break;
                case 'break-apart':
                    // Implement break apart logic using YPrintSVGPath
                    if (typeof YPrintSVGPath !== 'undefined') {
                        YPrintSVGPath.breakApart();
                    } else {
                        self.showMessage('<?php echo esc_js(__('SVG-Pfad-Module nicht verfügbar.', 'yprint-designtool')); ?>');
                    }
                    break;
                case 'to-path':
                    // Implement convert to path logic using YPrintSVGPath
                    if (typeof YPrintSVGPath !== 'undefined') {
                        YPrintSVGPath.convertShapeToPath();
                    } else {
                        self.showMessage('<?php echo esc_js(__('SVG-Pfad-Module nicht verfügbar.', 'yprint-designtool')); ?>');
                    }
                    break;
                case 'reverse':
                    // Implement reverse path logic using YPrintSVGPath
                    if (typeof YPrintSVGPath !== 'undefined') {
                        YPrintSVGPath.reversePath();
                    } else {
                        self.showMessage('<?php echo esc_js(__('SVG-Pfad-Module nicht verfügbar.', 'yprint-designtool')); ?>');
                    }
                    break;
            }
        },
        
        addToHistory: function(svg) {
            // Add current state to history
            svgHistory.push(svg);
            historyIndex = svgHistory.length - 1;
            
            // Limit history size
            if (svgHistory.length > 20) {
                svgHistory.shift();
                historyIndex--;
            }
        },
        
        showMessage: function(message, duration) {
            duration = duration || 3000;
            var $message = $('.yprint-svg-editor-message');
            
            $message.text(message).fadeIn(200);
            
            clearTimeout(this.messageTimeout);
            this.messageTimeout = setTimeout(function() {
                $message.fadeOut(200);
            }, duration);
        }
    };
    
    // Initialize the SVG Editor
    svgEditor.init();
});
</script>
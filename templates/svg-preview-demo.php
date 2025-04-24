<?php
/**
 * Template für SVG-Vorschau und -Bearbeitung Demo
 *
 * @package YPrint_DesignTool
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap yprint-designtool">
    <h1><?php _e('SVG-Vorschau und -Bearbeitung', 'yprint-designtool'); ?></h1>
    
    <div class="yprint-info-box">
        <p><?php _e('Dieses Tool ermöglicht die Vorschau und einfache Bearbeitung von SVG-Dateien. Du kannst SVG-Dateien hochladen, anzeigen, bearbeiten und in der Medienbibliothek speichern.', 'yprint-designtool'); ?></p>
    </div>
    
    <div class="yprint-demo-section">
        <h2><?php _e('SVG hochladen', 'yprint-designtool'); ?></h2>
        
        <div class="yprint-upload-area">
            <p><?php _e('Wähle eine SVG-Datei aus oder ziehe sie hierher.', 'yprint-designtool'); ?></p>
            <input type="file" id="yprint-svg-upload" accept=".svg" />
            <button type="button" id="yprint-svg-upload-btn" class="button button-primary"><?php _e('SVG-Datei auswählen', 'yprint-designtool'); ?></button>
        </div>
        
        <div class="yprint-upload-result" style="display: none;">
            <h3><?php _e('Hochgeladene SVG', 'yprint-designtool'); ?></h3>
            <div id="yprint-svg-preview-container"></div>
        </div>
    </div>
    
    <div class="yprint-demo-section">
        <h2><?php _e('SVG optimieren', 'yprint-designtool'); ?></h2>
        
        <div class="yprint-svg-optimize-options">
            <label>
                <input type="checkbox" id="yprint-svg-optimize-comments" checked />
                <?php _e('Kommentare entfernen', 'yprint-designtool'); ?>
            </label>
            <br>
            <label>
                <input type="checkbox" id="yprint-svg-optimize-empty-groups" checked />
                <?php _e('Leere Gruppen entfernen', 'yprint-designtool'); ?>
            </label>
            <br>
            <label>
                <input type="checkbox" id="yprint-svg-optimize-metadata" checked />
                <?php _e('Metadaten entfernen', 'yprint-designtool'); ?>
            </label>
            <br>
            <label>
                <input type="checkbox" id="yprint-svg-optimize-xml-declaration" />
                <?php _e('XML-Deklaration entfernen', 'yprint-designtool'); ?>
            </label>
            <br>
            <label>
                <?php _e('Nachkommastellen runden:', 'yprint-designtool'); ?>
                <select id="yprint-svg-optimize-precision">
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2" selected>2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                </select>
            </label>
            <br>
            <button type="button" id="yprint-svg-optimize-btn" class="button button-secondary" disabled><?php _e('SVG optimieren', 'yprint-designtool'); ?></button>
        </div>
        
        <div class="yprint-optimize-result" style="display: none;">
            <h3><?php _e('Optimierungsergebnis', 'yprint-designtool'); ?></h3>
            <div class="yprint-optimize-stats"></div>
            <div id="yprint-svg-optimized-preview-container"></div>
        </div>
    </div>
    
    <div class="yprint-demo-section">
        <h2><?php _e('SVG speichern', 'yprint-designtool'); ?></h2>
        
        <div class="yprint-svg-save-options">
            <button type="button" id="yprint-svg-download-btn" class="button button-primary" disabled><?php _e('SVG herunterladen', 'yprint-designtool'); ?></button>
            
            <?php if (current_user_can('upload_files')) : ?>
            <button type="button" id="yprint-svg-save-media-btn" class="button button-primary" disabled><?php _e('In Medienbibliothek speichern', 'yprint-designtool'); ?></button>
            <?php endif; ?>
        </div>
        
        <div class="yprint-save-result" style="display: none;">
        <h3><?php _e('Speichervorgang abgeschlossen', 'yprint-designtool'); ?></h3>
        <div class="yprint-save-message"></div>
    </div>
    
    <div class="yprint-demo-section">
        <h2><?php _e('SVG-Pfadoperationen', 'yprint-designtool'); ?></h2>
        
        <div class="yprint-svg-path-operations">
            <p><?php _e('Führe Operationen an SVG-Pfaden aus:', 'yprint-designtool'); ?></p>
            
            <div class="yprint-path-operations-buttons">
                <button type="button" class="button yprint-svg-path-operation" data-operation="enhance-lines">
                    <?php _e('Linien verstärken', 'yprint-designtool'); ?>
                </button>
                
                <button type="button" class="button yprint-svg-path-operation" data-operation="combine">
                    <?php _e('Pfade kombinieren', 'yprint-designtool'); ?>
                </button>
                
                <button type="button" class="button yprint-svg-path-operation" data-operation="break-apart">
                    <?php _e('Pfad aufbrechen', 'yprint-designtool'); ?>
                </button>
                
                <button type="button" class="button yprint-svg-path-operation" data-operation="to-path">
                    <?php _e('Form zu Pfad', 'yprint-designtool'); ?>
                </button>
                
                <button type="button" class="button yprint-svg-path-operation" data-operation="reverse">
                    <?php _e('Pfad umkehren', 'yprint-designtool'); ?>
                </button>
            </div>
            
            <div class="yprint-svg-path-result" style="display: none;">
                <h3><?php _e('Operationsergebnis', 'yprint-designtool'); ?></h3>
                <div class="yprint-svg-path-message"></div>
            </div>
        </div>
    </div>
</div>

<style>
.yprint-path-operations-buttons {
    margin: 15px 0;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.yprint-svg-path-operation {
    min-width: 120px;
}
</style>

<script type="text/javascript">
// Globale Variable für die SVG-Pfad-Operationen
var YPrintSVGPathData = {
    restUrl: '<?php echo esc_js(rest_url('yprint-svg-path/v1/')); ?>',
    nonce: '<?php echo esc_js(wp_create_nonce('wp_rest')); ?>'
};
</script>
</div>

<style>
.yprint-demo-section {
    margin-bottom: 30px;
    background: #fff;
    border: 1px solid #ddd;
    padding: 20px;
    border-radius: 4px;
}

.yprint-upload-area {
    text-align: center;
    padding: 30px;
    border: 2px dashed #ddd;
    border-radius: 4px;
    background-color: #f9f9f9;
    margin-bottom: 20px;
}

.yprint-upload-area.drag-over {
    border-color: #2196F3;
    background-color: #e3f2fd;
}

.yprint-upload-area input[type="file"] {
    display: none;
}

.yprint-svg-optimize-options,
.yprint-svg-save-options {
    margin-bottom: 20px;
}

.yprint-svg-optimize-options label {
    display: inline-block;
    margin-bottom: 10px;
}

.yprint-svg-save-options button {
    margin-right: 10px;
}

.yprint-optimize-stats {
    margin-bottom: 10px;
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 4px;
}

#yprint-svg-preview-container,
#yprint-svg-optimized-preview-container {
    width: 100%;
    height: 400px;
    border: 1px solid #ddd;
    margin-top: 10px;
    border-radius: 4px;
    background-color: #f5f5f5;
}
</style>

<script>
jQuery(document).ready(function($) {
    var originalSVG = '';
    var optimizedSVG = '';
    var svgPreview = null;
    var optimizedPreview = null;
    
    // SVG-Uploader initialisieren
    $('#yprint-svg-upload-btn').on('click', function() {
        $('#yprint-svg-upload').click();
    });
    
    // Datei-Upload-Handler
    $('#yprint-svg-upload').on('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        
        if (file.type !== 'image/svg+xml' && !file.name.endsWith('.svg')) {
            alert('<?php echo esc_js(__('Bitte wähle eine SVG-Datei aus.', 'yprint-designtool')); ?>');
            return;
        }
        
        var reader = new FileReader();
        reader.onload = function(e) {
            originalSVG = e.target.result;
            
            // SVG anzeigen
            $('.yprint-upload-result').show();
            
            // SVG-Vorschau initialisieren
            if (!svgPreview) {
                $('#yprint-svg-preview-container').html('').addClass('yprint-svg-preview');
                svgPreview = $('#yprint-svg-preview-container').yprintSVGPreview({
                    width: '100%',
                    height: '400px',
                    controls: true,
                    ajaxUrl: '<?php echo esc_js(admin_url('admin-ajax.php')); ?>',
                    nonce: '<?php echo esc_js(wp_create_nonce('yprint-designtool-nonce')); ?>',
                    isLoggedIn: <?php echo current_user_can('upload_files') ? 'true' : 'false'; ?>
                }).data('yprintSVGPreview');
            }
            
            svgPreview.loadSVG(originalSVG);
            
            // Buttons aktivieren
            $('#yprint-svg-optimize-btn').prop('disabled', false);
            $('#yprint-svg-download-btn').prop('disabled', false);
            $('#yprint-svg-save-media-btn').prop('disabled', false);
        };
        
        reader.readAsText(file);
    });
    
    // Drag & Drop Unterstützung
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
            $('#yprint-svg-upload')[0].files = files;
            $('#yprint-svg-upload').trigger('change');
        }
    });
    
    // SVG optimieren
    $('#yprint-svg-optimize-btn').on('click', function() {
        if (!originalSVG) {
            alert('<?php echo esc_js(__('Bitte lade zuerst eine SVG-Datei hoch.', 'yprint-designtool')); ?>');
            return;
        }
        
        var options = {
            action: 'yprint_optimize_svg',
            nonce: '<?php echo esc_js(wp_create_nonce('yprint-designtool-nonce')); ?>',
            svg_content: originalSVG,
            remove_comments: $('#yprint-svg-optimize-comments').is(':checked') ? 1 : 0,
            remove_empty_groups: $('#yprint-svg-optimize-empty-groups').is(':checked') ? 1 : 0,
            remove_metadata: $('#yprint-svg-optimize-metadata').is(':checked') ? 1 : 0,
            remove_xml_declaration: $('#yprint-svg-optimize-xml-declaration').is(':checked') ? 1 : 0,
            round_precision: $('#yprint-svg-optimize-precision').val()
        };
        
        $.ajax({
            url: '<?php echo esc_js(admin_url('admin-ajax.php')); ?>',
            type: 'POST',
            data: options,
            beforeSend: function() {
                $('#yprint-svg-optimize-btn').prop('disabled', true).text('<?php echo esc_js(__('Optimiere...', 'yprint-designtool')); ?>');
            },
            success: function(response) {
                $('#yprint-svg-optimize-btn').prop('disabled', false).text('<?php echo esc_js(__('SVG optimieren', 'yprint-designtool')); ?>');
                
                if (response.success) {
                    optimizedSVG = response.data.svg_content;
                    
                    // Statistiken anzeigen
                    $('.yprint-optimize-stats').html(
                        '<?php echo esc_js(__('Original:', 'yprint-designtool')); ?> ' + formatSize(response.data.original_size) + 
                        ' | <?php echo esc_js(__('Optimiert:', 'yprint-designtool')); ?> ' + formatSize(response.data.optimized_size) + 
                        ' | <?php echo esc_js(__('Reduktion:', 'yprint-designtool')); ?> ' + response.data.reduction
                    );
                    
                    // Optimierte SVG anzeigen
                    $('.yprint-optimize-result').show();
                    
                    // Optimierte SVG-Vorschau initialisieren
                    if (!optimizedPreview) {
                        $('#yprint-svg-optimized-preview-container').html('').addClass('yprint-svg-preview');
                        optimizedPreview = $('#yprint-svg-optimized-preview-container').yprintSVGPreview({
                            width: '100%',
                            height: '400px',
                            controls: true,
                            ajaxUrl: '<?php echo esc_js(admin_url('admin-ajax.php')); ?>',
                            nonce: '<?php echo esc_js(wp_create_nonce('yprint-designtool-nonce')); ?>',
                            isLoggedIn: <?php echo current_user_can('upload_files') ? 'true' : 'false'; ?>
                        }).data('yprintSVGPreview');
                    }
                    
                    optimizedPreview.loadSVG(optimizedSVG);
                } else {
                    alert(response.data.message || '<?php echo esc_js(__('Fehler beim Optimieren der SVG-Datei.', 'yprint-designtool')); ?>');
                }
            },
            error: function() {
                $('#yprint-svg-optimize-btn').prop('disabled', false).text('<?php echo esc_js(__('SVG optimieren', 'yprint-designtool')); ?>');
                alert('<?php echo esc_js(__('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.', 'yprint-designtool')); ?>');
            }
        });
    });
    
    // SVG herunterladen
    $('#yprint-svg-download-btn').on('click', function() {
        if (!originalSVG) {
            alert('<?php echo esc_js(__('Bitte lade zuerst eine SVG-Datei hoch.', 'yprint-designtool')); ?>');
            return;
        }
        
        var svgToDownload = optimizedSVG || originalSVG;
        
        $.ajax({
            url: '<?php echo esc_js(admin_url('admin-ajax.php')); ?>',
            type: 'POST',
            data: {
                action: 'yprint_download_svg',
                nonce: '<?php echo esc_js(wp_create_nonce('yprint-designtool-nonce')); ?>',
                svg_content: svgToDownload,
                filename: 'download.svg'
            },
            beforeSend: function() {
                $('#yprint-svg-download-btn').prop('disabled', true).text('<?php echo esc_js(__('Wird vorbereitet...', 'yprint-designtool')); ?>');
            },
            success: function(response) {
                $('#yprint-svg-download-btn').prop('disabled', false).text('<?php echo esc_js(__('SVG herunterladen', 'yprint-designtool')); ?>');
                
                if (response.success && response.data.file_url) {
                    // Download initiieren
                    var a = document.createElement('a');
                    a.href = response.data.file_url;
                    a.download = response.data.filename || 'download.svg';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    
                    // Erfolgsmeldung anzeigen
                    $('.yprint-save-result').show();
                    $('.yprint-save-message').html('<?php echo esc_js(__('SVG wurde erfolgreich zum Download bereitgestellt.', 'yprint-designtool')); ?>');
                } else {
                    alert(response.data.message || '<?php echo esc_js(__('Fehler beim Vorbereiten des Downloads.', 'yprint-designtool')); ?>');
                }
            },
            error: function() {
                $('#yprint-svg-download-btn').prop('disabled', false).text('<?php echo esc_js(__('SVG herunterladen', 'yprint-designtool')); ?>');
                alert('<?php echo esc_js(__('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.', 'yprint-designtool')); ?>');
            }
        });
    });
    
    // SVG in Medienbibliothek speichern
    $('#yprint-svg-save-media-btn').on('click', function() {
        if (!originalSVG) {
            alert('<?php echo esc_js(__('Bitte lade zuerst eine SVG-Datei hoch.', 'yprint-designtool')); ?>');
            return;
        }
        
        var svgToSave = optimizedSVG || originalSVG;
        var filename = prompt('<?php echo esc_js(__('Dateiname für die SVG:', 'yprint-designtool')); ?>', 'svg-' + Date.now() + '.svg');
        
        if (!filename) return;
        
        $.ajax({
            url: '<?php echo esc_js(admin_url('admin-ajax.php')); ?>',
            type: 'POST',
            data: {
                action: 'yprint_save_svg_to_media',
                nonce: '<?php echo esc_js(wp_create_nonce('yprint-designtool-nonce')); ?>',
                svg_content: svgToSave,
                filename: filename
            },
            beforeSend: function() {
                $('#yprint-svg-save-media-btn').prop('disabled', true).text('<?php echo esc_js(__('Wird gespeichert...', 'yprint-designtool')); ?>');
            },
            success: function(response) {
                $('#yprint-svg-save-media-btn').prop('disabled', false).text('<?php echo esc_js(__('In Medienbibliothek speichern', 'yprint-designtool')); ?>');
                
                if (response.success && response.data.attachment_url) {
                    // Erfolgsmeldung anzeigen
                    $('.yprint-save-result').show();
                    $('.yprint-save-message').html(
                        '<?php echo esc_js(__('SVG wurde erfolgreich in der Medienbibliothek gespeichert.', 'yprint-designtool')); ?>' +
                        '<br><a href="' + response.data.admin_url + '" target="_blank"><?php echo esc_js(__('Zur Medienbibliothek', 'yprint-designtool')); ?></a>'
                    );
                } else {
                    alert(response.data.message || '<?php echo esc_js(__('Fehler beim Speichern in der Medienbibliothek.', 'yprint-designtool')); ?>');
                }
            },
            error: function() {
                $('#yprint-svg-save-media-btn').prop('disabled', false).text('<?php echo esc_js(__('In Medienbibliothek speichern', 'yprint-designtool')); ?>');
                alert('<?php echo esc_js(__('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.', 'yprint-designtool')); ?>');
            }
        });
    });
    
    // Hilfsfunktion für Formatierung der Dateigröße
    function formatSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' B';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + ' KB';
        } else {
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        }
    }
});
</script>
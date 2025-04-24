/**
 * YPrint SVG Preview Script
 * 
 * Stellt SVG-Dateien im Frontend dar und erlaubt einfache Manipulationen
 */

(function($) {
    'use strict';
    
    // SVG Preview Klasse
    var YPrintSVGPreview = function(element, options) {
        this.element = element;
        this.$element = $(element);
        this.options = $.extend({}, YPrintSVGPreview.DEFAULTS, options);
        this.svgContent = '';
        this.transformParams = {
            scale: 1,
            rotate: 0,
            translateX: 0,
            translateY: 0
        };
        this.init();
    };
    
    // Default Optionen
    YPrintSVGPreview.DEFAULTS = {
        width: '100%',
        height: '400px',
        background: '#f5f5f5',
        controls: true,
        onReady: null,
        onSave: null,
        ajaxUrl: '',
        nonce: ''
    };
    
    // Initialisierung
    YPrintSVGPreview.prototype.init = function() {
        this.createElements();
        this.bindEvents();
        
        if (typeof this.options.onReady === 'function') {
            this.options.onReady(this);
        }
    };
    
    // UI-Elemente erstellen
    YPrintSVGPreview.prototype.createElements = function() {
        var self = this;
        
        // Styles für den Container
        this.$element.css({
            width: this.options.width,
            height: this.options.height,
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: this.options.background,
            border: '1px solid #ddd',
            borderRadius: '4px'
        });
        
        // SVG Container
        this.$svgContainer = $('<div class="yprint-svg-container"></div>').css({
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }).appendTo(this.$element);
        
        // Steuerelemente hinzufügen, wenn aktiviert
        if (this.options.controls) {
            this.createControls();
        }
        
        // Meldungsbereich
        this.$messageArea = $('<div class="yprint-svg-message"></div>').css({
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            padding: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            borderRadius: '4px',
            fontSize: '14px',
            textAlign: 'center',
            display: 'none',
            zIndex: 10
        }).appendTo(this.$element);
    };
    
    // Steuerelemente erstellen
    YPrintSVGPreview.prototype.createControls = function() {
        var self = this;
        
        // Container für Steuerelemente
        this.$controls = $('<div class="yprint-svg-controls"></div>').css({
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            zIndex: 10
        }).appendTo(this.$element);
        
        // Zoom In Button
        $('<button type="button" class="yprint-svg-control-btn" title="Vergrößern"><i class="dashicons dashicons-plus"></i></button>')
            .appendTo(this.$controls)
            .on('click', function() {
                self.zoomIn();
            });
        
        // Zoom Out Button
        $('<button type="button" class="yprint-svg-control-btn" title="Verkleinern"><i class="dashicons dashicons-minus"></i></button>')
            .appendTo(this.$controls)
            .on('click', function() {
                self.zoomOut();
            });
        
        // Rotate Button
        $('<button type="button" class="yprint-svg-control-btn" title="Drehen"><i class="dashicons dashicons-image-rotate"></i></button>')
            .appendTo(this.$controls)
            .on('click', function() {
                self.rotate(90);
            });
        
        // Reset Button
        $('<button type="button" class="yprint-svg-control-btn" title="Zurücksetzen"><i class="dashicons dashicons-image-rotate-left"></i></button>')
            .appendTo(this.$controls)
            .on('click', function() {
                self.resetTransform();
            });
        
        // Download Button
        $('<button type="button" class="yprint-svg-control-btn" title="Herunterladen"><i class="dashicons dashicons-download"></i></button>')
            .appendTo(this.$controls)
            .on('click', function() {
                self.downloadSVG();
            });
        
        // Save to Media Library Button (nur wenn eingeloggt)
        if (this.options.isLoggedIn) {
            $('<button type="button" class="yprint-svg-control-btn" title="In Medienbibliothek speichern"><i class="dashicons dashicons-admin-media"></i></button>')
                .appendTo(this.$controls)
                .on('click', function() {
                    self.saveToMediaLibrary();
                });
        }
        
        // Styles für Buttons
        this.$element.find('.yprint-svg-control-btn').css({
            width: '36px',
            height: '36px',
            padding: '0',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
        }).hover(function() {
            $(this).css({
                backgroundColor: '#f7f7f7',
                borderColor: '#ccc'
            });
        }, function() {
            $(this).css({
                backgroundColor: '#fff',
                borderColor: '#ddd'
            });
        });
    };
    
    // Event-Listener binden
    YPrintSVGPreview.prototype.bindEvents = function() {
        var self = this;
        
        // Drag-Funktionalität
        var isDragging = false;
        var startX, startY;
        var startTranslateX, startTranslateY;
        
        this.$svgContainer.on('mousedown', function(e) {
            if (e.which !== 1) return; // Nur linke Maustaste
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startTranslateX = self.transformParams.translateX;
            startTranslateY = self.transformParams.translateY;
            
            e.preventDefault();
        });
        
        $(document).on('mousemove', function(e) {
            if (!isDragging) return;
            
            var dx = e.clientX - startX;
            var dy = e.clientY - startY;
            
            self.transformParams.translateX = startTranslateX + dx;
            self.transformParams.translateY = startTranslateY + dy;
            
            self.applyTransform();
        });
        
        $(document).on('mouseup', function() {
            isDragging = false;
        });
        
        // Mausrad für Zoom
        this.$element.on('wheel', function(e) {
            e.preventDefault();
            
            if (e.originalEvent.deltaY < 0) {
                self.zoomIn(0.1);
            } else {
                self.zoomOut(0.1);
            }
        });
        
        // Berührungsgestener für Mobile
        var touchStartX, touchStartY;
        var touchStartDistance = 0;
        var touchStartScale;
        
        this.$element.on('touchstart', function(e) {
            var touches = e.originalEvent.touches;
            
            if (touches.length === 1) {
                // Einzelberührung für Verschieben
                touchStartX = touches[0].clientX;
                touchStartY = touches[0].clientY;
                startTranslateX = self.transformParams.translateX;
                startTranslateY = self.transformParams.translateY;
            } else if (touches.length === 2) {
                // Zwei Berührungen für Zoom
                touchStartX = (touches[0].clientX + touches[1].clientX) / 2;
                touchStartY = (touches[0].clientY + touches[1].clientY) / 2;
                
                var dx = touches[0].clientX - touches[1].clientX;
                var dy = touches[0].clientY - touches[1].clientY;
                touchStartDistance = Math.sqrt(dx * dx + dy * dy);
                touchStartScale = self.transformParams.scale;
            }
            
            e.preventDefault();
        });
        
        this.$element.on('touchmove', function(e) {
            var touches = e.originalEvent.touches;
            
            if (touches.length === 1) {
                // Einzelberührung für Verschieben
                var dx = touches[0].clientX - touchStartX;
                var dy = touches[0].clientY - touchStartY;
                
                self.transformParams.translateX = startTranslateX + dx;
                self.transformParams.translateY = startTranslateY + dy;
                
                self.applyTransform();
            } else if (touches.length === 2) {
                // Zwei Berührungen für Zoom
                var dx = touches[0].clientX - touches[1].clientX;
                var dy = touches[0].clientY - touches[1].clientY;
                var distance = Math.sqrt(dx * dx + dy * dy);
                
                var scale = touchStartScale * (distance / touchStartDistance);
                scale = Math.max(0.1, Math.min(5, scale));
                
                self.transformParams.scale = scale;
                
                self.applyTransform();
            }
            
            e.preventDefault();
        });
    };
    
    // SVG laden
    YPrintSVGPreview.prototype.loadSVG = function(svg) {
        if (!svg) return;
        
        this.svgContent = svg;
        this.$svgContainer.html(svg);
        
        // Transformationen zurücksetzen
        this.resetTransform();
        
        // SVG-Element Styles anpassen
        var $svg = this.$svgContainer.find('svg');
        $svg.css({
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'block'
        });
        
        // SVG ID setzen, falls noch nicht vorhanden
        if (!$svg.attr('id')) {
            $svg.attr('id', 'svg-' + Math.random().toString(36).substring(2, 15));
        }
    };
    
    // Transformationen anwenden
    YPrintSVGPreview.prototype.applyTransform = function() {
        var $svg = this.$svgContainer.find('svg');
        if ($svg.length === 0) return;
        
        var transform = 'translate(' + this.transformParams.translateX + 'px, ' + this.transformParams.translateY + 'px) ' +
                        'scale(' + this.transformParams.scale + ') ' +
                        'rotate(' + this.transformParams.rotate + 'deg)';
        
        $svg.css({
            transform: transform
        });
    };
    
    // Zoom In
    YPrintSVGPreview.prototype.zoomIn = function(amount) {
        amount = amount || 0.2;
        this.transformParams.scale = Math.min(5, this.transformParams.scale + amount);
        this.applyTransform();
    };
    
    // Zoom Out
    YPrintSVGPreview.prototype.zoomOut = function(amount) {
        amount = amount || 0.2;
        this.transformParams.scale = Math.max(0.1, this.transformParams.scale - amount);
        this.applyTransform();
    };
    
    // Drehen
    YPrintSVGPreview.prototype.rotate = function(degrees) {
        this.transformParams.rotate = (this.transformParams.rotate + degrees) % 360;
        this.applyTransform();
    };
    
    // Transformationen zurücksetzen
    YPrintSVGPreview.prototype.resetTransform = function() {
        this.transformParams = {
            scale: 1,
            rotate: 0,
            translateX: 0,
            translateY: 0
        };
        
        this.applyTransform();
    };
    
    // SVG herunterladen
    YPrintSVGPreview.prototype.downloadSVG = function() {
        var self = this;
        
        if (!this.svgContent) {
            this.showMessage('Kein SVG zum Herunterladen vorhanden.');
            return;
        }
        
        if (!this.options.ajaxUrl || !this.options.nonce) {
            // Fallback: Direkter Download über Data URL
            var blob = new Blob([this.svgContent], {type: 'image/svg+xml'});
            var url = URL.createObjectURL(blob);
            
            var a = document.createElement('a');
            a.href = url;
            a.download = 'download.svg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return;
        }
        
        $.ajax({
            url: this.options.ajaxUrl,
            type: 'POST',
            data: {
                action: 'yprint_download_svg',
                nonce: this.options.nonce,
                svg_content: this.svgContent,
                filename: 'download.svg'
            },
            beforeSend: function() {
                self.showMessage('SVG wird zum Download vorbereitet...');
            },
            success: function(response) {
                if (response.success && response.data.file_url) {
                    self.showMessage('SVG steht zum Download bereit!');
                    
                    var a = document.createElement('a');
                    a.href = response.data.file_url;
                    a.download = response.data.filename || 'download.svg';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                } else {
                    self.showMessage('Fehler beim Vorbereiten des Downloads.');
                }
            },
            error: function() {
                self.showMessage('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
            }
        });
    };
    
    // In Medienbibliothek speichern
    YPrintSVGPreview.prototype.saveToMediaLibrary = function() {
        var self = this;
        
        if (!this.svgContent) {
            this.showMessage('Kein SVG zum Speichern vorhanden.');
            return;
        }
        
        if (!this.options.ajaxUrl || !this.options.nonce) {
            this.showMessage('Speichern in Medienbibliothek nicht möglich.');
            return;
        }
        
        // Dateinamen abfragen
        var filename = prompt('Dateiname für die SVG-Datei:', 'svg-' + Date.now() + '.svg');
        if (!filename) return;
        
        $.ajax({
            url: this.options.ajaxUrl,
            type: 'POST',
            data: {
                action: 'yprint_save_svg_to_media',
                nonce: this.options.nonce,
                svg_content: this.svgContent,
                filename: filename
            },
            beforeSend: function() {
                self.showMessage('SVG wird in Medienbibliothek gespeichert...');
            },
            success: function(response) {
                if (response.success && response.data.attachment_url) {
                    self.showMessage('SVG erfolgreich in Medienbibliothek gespeichert!');
                    
                    if (typeof self.options.onSave === 'function') {
                        self.options.onSave(response.data);
                    }
                } else {
                    self.showMessage('Fehler beim Speichern in der Medienbibliothek.');
                }
            },
            error: function() {
                self.showMessage('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
            }
        });
    };
    
    // Meldung anzeigen
    YPrintSVGPreview.prototype.showMessage = function(message, duration) {
        var self = this;
        duration = duration || 3000;
        
        this.$messageArea.text(message).fadeIn(200);
        
        clearTimeout(this.messageTimeout);
        this.messageTimeout = setTimeout(function() {
            self.$messageArea.fadeOut(200);
        }, duration);
    };
    
    // SVG aus URL laden
    YPrintSVGPreview.prototype.loadSVGFromURL = function(url) {
        var self = this;
        
        $.ajax({
            url: url,
            dataType: 'text',
            success: function(data) {
                self.loadSVG(data);
            },
            error: function() {
                self.showMessage('Fehler beim Laden der SVG-Datei.');
            }
        });
    };
    
    // jQuery Plugin
    $.fn.yprintSVGPreview = function(options) {
        return this.each(function() {
            if (!$.data(this, 'yprintSVGPreview')) {
                $.data(this, 'yprintSVGPreview', new YPrintSVGPreview(this, options));
            }
        });
    };
    
    // Auto-Initialisierung
    $(document).ready(function() {
        $('.yprint-svg-preview').each(function() {
            var $this = $(this);
            var options = $this.data();
            
            $this.yprintSVGPreview(options);
            
            // SVG aus Datenattribut laden, falls vorhanden
            if (options.svg) {
                var instance = $this.data('yprintSVGPreview');
                instance.loadSVG(options.svg);
            } else if (options.svgUrl) {
                var instance = $this.data('yprintSVGPreview');
                instance.loadSVGFromURL(options.svgUrl);
            }
        });
    });
    
})(jQuery);
/**
 * YPrint SVG Enhancer
 * 
 * Frontend-Funktionen für die SVG-Verbesserung, einschließlich Linienverstärkung
 * und Detailanpassung mit Echtzeit-Vorschau.
 */

(function($) {
    'use strict';
    
    // SVG Enhancer Klasse
    var YPrintSVGEnhancer = function(element, options) {
        this.element = element;
        this.$element = $(element);
        this.options = $.extend({}, YPrintSVGEnhancer.DEFAULTS, options);
        this.svgContent = '';
        this.originalSVG = '';
        this.svgPreview = null;
        this.init();
    };
    
    // Default Optionen
    YPrintSVGEnhancer.DEFAULTS = {
        previewSelector: '.yprint-svg-container',
        lineThicknessSelector: '#yprint-line-thickness',
        detailLevelSelector: '#yprint-detail-level',
        enhanceButtonSelector: '#yprint-enhance-svg-btn',
        simplifyButtonSelector: '#yprint-simplify-svg-btn',
        resetButtonSelector: '#yprint-reset-svg-btn',
        ajaxUrl: '',
        nonce: ''
    };
    
    // Initialisierung
    YPrintSVGEnhancer.prototype.init = function() {
        this.initControlPanel();
        this.bindEvents();
        this.setupPreview();
    };
    
    // Erstellt das Kontrollpanel für die SVG-Verbesserung
    YPrintSVGEnhancer.prototype.initControlPanel = function() {
        // Erstelle das Control Panel, wenn es noch nicht existiert
        if (this.$element.find('.yprint-svg-enhancer-controls').length === 0) {
            var controlPanel = '<div class="yprint-svg-enhancer-controls">' +
                '<div class="yprint-enhancer-control">' +
                    '<label for="yprint-line-thickness">' + this.translate('Linienstärke') + ': <span class="thickness-value">1</span></label>' +
                    '<input type="range" id="yprint-line-thickness" min="0.5" max="5" step="0.1" value="1">' +
                '</div>' +
                '<div class="yprint-enhancer-control">' +
                    '<label for="yprint-detail-level">' + this.translate('Detailgrad') + ': <span class="detail-value">5</span></label>' +
                    '<input type="range" id="yprint-detail-level" min="0" max="10" step="0.5" value="5">' +
                '</div>' +
                '<div class="yprint-enhancer-actions">' +
                    '<button type="button" id="yprint-enhance-svg-btn" class="yprint-enhancer-btn">' +
                        this.translate('Linien verstärken') +
                    '</button>' +
                    '<button type="button" id="yprint-simplify-svg-btn" class="yprint-enhancer-btn">' +
                        this.translate('SVG vereinfachen') +
                    '</button>' +
                    '<button type="button" id="yprint-reset-svg-btn" class="yprint-enhancer-btn">' +
                        this.translate('Zurücksetzen') +
                    '</button>' +
                '</div>' +
            '</div>';
            
            this.$element.prepend(controlPanel);
        }
        
        // Initialisiere die Werte im Control Panel
        this.$lineThickness = this.$element.find(this.options.lineThicknessSelector);
        this.$detailLevel = this.$element.find(this.options.detailLevelSelector);
        this.$thicknessValue = this.$element.find('.thickness-value');
        this.$detailValue = this.$element.find('.detail-value');
        
        // Setze Standardwerte, falls vorhanden
        if (this.options.initialThickness) {
            this.$lineThickness.val(this.options.initialThickness);
            this.$thicknessValue.text(this.options.initialThickness);
        }
        
        if (this.options.initialDetailLevel) {
            this.$detailLevel.val(this.options.initialDetailLevel);
            this.$detailValue.text(this.options.initialDetailLevel);
        }
    };
    
    // Bind event listeners
    YPrintSVGEnhancer.prototype.bindEvents = function() {
        var self = this;
        
        // Line thickness slider
        this.$element.on('input', this.options.lineThicknessSelector, function() {
            var value = $(this).val();
            self.$thicknessValue.text(value);
        });
        
        // Detail level slider
        this.$element.on('input', this.options.detailLevelSelector, function() {
            var value = $(this).val();
            self.$detailValue.text(value);
        });
        
        // Enhance SVG button
        this.$element.on('click', this.options.enhanceButtonSelector, function() {
            self.enhanceSVGLines();
        });
        
        // Simplify SVG button
        this.$element.on('click', this.options.simplifyButtonSelector, function() {
            self.simplifySVG();
        });
        
        // Reset SVG button
        this.$element.on('click', this.options.resetButtonSelector, function() {
            self.resetSVG();
        });
    };
    
    // Setup SVG preview
    YPrintSVGEnhancer.prototype.setupPreview = function() {
        var $previewContainer = this.$element.find(this.options.previewSelector);
        
        if ($previewContainer.length > 0) {
            this.svgPreview = $previewContainer.data('yprintSVGPreview');
            
            // If svgPreview exists, get current SVG content
            if (this.svgPreview) {
                this.svgContent = this.svgPreview.getSVGContent();
                this.originalSVG = this.svgContent;
            }
        }
    };
    
    // Enhance SVG lines
    YPrintSVGEnhancer.prototype.enhanceSVGLines = function() {
        var self = this;
        
        if (!this.svgContent && this.svgPreview) {
            this.svgContent = this.svgPreview.getSVGContent();
        }
        
        if (!this.svgContent) {
            this.showMessage(this.translate('Kein SVG zum Verbessern gefunden.'));
            return;
        }
        
        var thickness = parseFloat(this.$lineThickness.val());
        
        $.ajax({
            url: this.options.ajaxUrl,
            type: 'POST',
            data: {
                action: 'yprint_enhance_svg_lines',
                nonce: this.options.nonce,
                svg_content: this.svgContent,
                thickness: thickness
            },
            beforeSend: function() {
                self.showMessage(self.translate('Verstärke SVG-Linien...'));
                self.$element.find(self.options.enhanceButtonSelector).prop('disabled', true);
            },
            success: function(response) {
                self.$element.find(self.options.enhanceButtonSelector).prop('disabled', false);
                
                if (response.success && response.data.svg_content) {
                    self.svgContent = response.data.svg_content;
                    
                    // Update preview
                    if (self.svgPreview) {
                        self.svgPreview.loadSVG(self.svgContent);
                    }
                    
                    self.showMessage(self.translate('SVG-Linien erfolgreich verstärkt!'));
                } else {
                    self.showMessage(response.data.message || self.translate('Fehler beim Verstärken der SVG-Linien.'));
                }
            },
            error: function() {
                self.$element.find(self.options.enhanceButtonSelector).prop('disabled', false);
                self.showMessage(self.translate('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.'));
            }
        });
    };
    
    // Simplify SVG
    YPrintSVGEnhancer.prototype.simplifySVG = function() {
        var self = this;
        
        if (!this.svgContent && this.svgPreview) {
            this.svgContent = this.svgPreview.getSVGContent();
        }
        
        if (!this.svgContent) {
            this.showMessage(this.translate('Kein SVG zum Vereinfachen gefunden.'));
            return;
        }
        
        var detailLevel = parseFloat(this.$detailLevel.val());
        
        $.ajax({
            url: this.options.ajaxUrl,
            type: 'POST',
            data: {
                action: 'yprint_simplify_svg',
                nonce: this.options.nonce,
                svg_content: this.svgContent,
                detail_level: detailLevel
            },
            beforeSend: function() {
                self.showMessage(self.translate('Vereinfache SVG...'));
                self.$element.find(self.options.simplifyButtonSelector).prop('disabled', true);
            },
            success: function(response) {
                self.$element.find(self.options.simplifyButtonSelector).prop('disabled', false);
                
                if (response.success && response.data.svg_content) {
                    self.svgContent = response.data.svg_content;
                    
                    // Update preview
                    if (self.svgPreview) {
                        self.svgPreview.loadSVG(self.svgContent);
                    }
                    
                    self.showMessage(self.translate('SVG erfolgreich vereinfacht!'));
                } else {
                    self.showMessage(response.data.message || self.translate('Fehler beim Vereinfachen der SVG.'));
                }
            },
            error: function() {
                self.$element.find(self.options.simplifyButtonSelector).prop('disabled', false);
                self.showMessage(self.translate('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.'));
            }
        });
    };
    
    // Reset SVG to original state
    YPrintSVGEnhancer.prototype.resetSVG = function() {
        if (!this.originalSVG) {
            this.showMessage(this.translate('Keine Original-SVG zum Zurücksetzen gefunden.'));
            return;
        }
        
        this.svgContent = this.originalSVG;
        
        // Update preview
        if (this.svgPreview) {
            this.svgPreview.loadSVG(this.svgContent);
        }
        
        this.showMessage(this.translate('SVG auf Originalzustand zurückgesetzt.'));
    };
    
    // Show message
    YPrintSVGEnhancer.prototype.showMessage = function(message, duration) {
        var self = this;
        duration = duration || 3000;
        
        // Create message container if it doesn't exist
        if (this.$element.find('.yprint-enhancer-message').length === 0) {
            this.$element.append('<div class="yprint-enhancer-message"></div>');
        }
        
        var $messageContainer = this.$element.find('.yprint-enhancer-message');
        
        $messageContainer.text(message).fadeIn(200);
        
        clearTimeout(this.messageTimeout);
        this.messageTimeout = setTimeout(function() {
            $messageContainer.fadeOut(200);
        }, duration);
    };
    
    // Simple translation function
    YPrintSVGEnhancer.prototype.translate = function(text) {
        // In a real implementation, this would use a translation system
        return text;
    };
    
    // jQuery plugin definition
    $.fn.yprintSVGEnhancer = function(options) {
        return this.each(function() {
            if (!$.data(this, 'yprintSVGEnhancer')) {
                $.data(this, 'yprintSVGEnhancer', new YPrintSVGEnhancer(this, options));
            }
        });
    };
    
    // Auto-initialize from data attributes
    $(document).ready(function() {
        $('[data-yprint-svg-enhancer]').each(function() {
            var $this = $(this);
            var options = $this.data();
            
            $this.yprintSVGEnhancer(options);
        });
    });
    
})(jQuery);

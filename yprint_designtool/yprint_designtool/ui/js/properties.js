/**
 * YPrint DesignTool - Properties-Modul
 * 
 * Verwaltet die Eigenschaften-Anzeige für Elemente im DesignTool
 */

(function($) {
    'use strict';
    
    // Properties-Modul
    window.YPrintDesignTool = window.YPrintDesignTool || {};
    window.YPrintDesignTool.Properties = {
        // Konfiguration
        config: {
            debounceTimeout: 300
        },
        
        // Zustand
        state: {
            initialized: false,
            currentElement: null,
            updateTimer: null
        },
        
        // DOM-Elemente
        elements: {
            propertiesPanel: null,
            noSelection: null,
            imageProperties: null,
            svgProperties: null,
            textProperties: null,
            shapeProperties: null,
            
            // Input-Felder
            posX: null,
            posY: null,
            width: null,
            height: null,
            rotation: null,
            opacity: null,
            lockAspectRatio: null,
            
            // Farb-Picker
            fillColor: null,
            strokeColor: null,
            strokeWidth: null,
            
            // Text-Eigenschaften
            fontFamily: null,
            fontSize: null,
            textAlign: null,
            textColor: null,
            textContent: null,
            
            // SVG-Eigenschaften
            svgColor: null
        },
        
        /**
         * Properties initialisieren
         */
        init: function(propertiesPanel) {
            if (this.state.initialized) {
                return;
            }
            
            this.elements.propertiesPanel = propertiesPanel;
            
            // DOM-Elemente referenzieren
            this.cacheElements();
            
            // Event-Listener binden
            this.bindEvents();
            
            this.state.initialized = true;
            console.log('Properties initialisiert');
        },
        
        /**
         * DOM-Elemente referenzieren
         */
        cacheElements: function() {
            // Bereiche
            this.elements.noSelection = $('#designtool-no-selection');
            this.elements.imageProperties = $('#designtool-image-properties');
            this.elements.svgProperties = $('#designtool-svg-properties');
            this.elements.textProperties = $('#designtool-text-properties');
            this.elements.shapeProperties = $('#designtool-shape-properties');
            
            // Allgemeine Eigenschaften
            this.elements.posX = $('#designtool-pos-x');
            this.elements.posY = $('#designtool-pos-y');
            this.elements.width = $('#designtool-width');
            this.elements.height = $('#designtool-height');
            this.elements.rotation = $('#designtool-rotation');
            this.elements.opacity = $('#designtool-opacity');
            this.elements.lockAspectRatio = $('#designtool-lock-aspect-ratio');
            
            // Farb-Picker
            this.elements.fillColor = $('#designtool-fill-color');
            this.elements.strokeColor = $('#designtool-stroke-color');
            this.elements.strokeWidth = $('#designtool-stroke-width');
            
            // Text-Eigenschaften
            this.elements.fontFamily = $('#designtool-font-family');
            this.elements.fontSize = $('#designtool-font-size');
            this.elements.textAlign = $('#designtool-text-align');
            this.elements.textColor = $('#designtool-text-color');
            this.elements.textContent = $('#designtool-text-content');
            
            // SVG-Eigenschaften
            this.elements.svgColor = $('#designtool-svg-color');
        },
        
        /**
         * Event-Listener binden
         */
        bindEvents: function() {
            var self = this;
            
            // Position und Größe
            this.elements.posX.on('change', function() {
                self.updateElementPosition('x', parseFloat($(this).val()));
            });
            
            this.elements.posY.on('change', function() {
                self.updateElementPosition('y', parseFloat($(this).val()));
            });
            
            this.elements.width.on('change', function() {
                self.updateElementSize('width', parseFloat($(this).val()));
            });
            
            this.elements.height.on('change', function() {
                self.updateElementSize('height', parseFloat($(this).val()));
            });
            
            // Rotation
            this.elements.rotation.on('change', function() {
                self.updateElementRotation(parseFloat($(this).val()));
            });
            
            // Transparenz
            this.elements.opacity.on('input', function() {
                var value = parseFloat($(this).val());
                self.updateElementOpacity(value);
                
                // Prozentwert anzeigen
                if (self.elements.opacityValue) {
                    self.elements.opacityValue.text(Math.round(value * 100) + '%');
                }
            });
            
            // Seitenverhältnis sperren
            this.elements.lockAspectRatio.on('change', function() {
                self.state.lockAspectRatio = $(this).prop('checked');
            });
            
            // Füllung und Rahmen
            this.elements.fillColor.on('change', function() {
                self.updateElementFillColor($(this).val());
            });
            
            this.elements.strokeColor.on('change', function() {
                self.updateElementStrokeColor($(this).val());
            });
            
            this.elements.strokeWidth.on('change', function() {
                self.updateElementStrokeWidth(parseFloat($(this).val()));
            });
            
            // Text-Eigenschaften
            this.elements.fontFamily.on('change', function() {
                self.updateElementFontFamily($(this).val());
            });
            
            this.elements.fontSize.on('change', function() {
                self.updateElementFontSize(parseFloat($(this).val()));
            });
            
            this.elements.textAlign.on('change', function() {
                self.updateElementTextAlign($(this).val());
            });
            
            this.elements.textColor.on('change', function() {
                self.updateElementTextColor($(this).val());
            });
            
            this.elements.textContent.on('input', function() {
                self.updateTextContent($(this).val());
            });
            
            // SVG-Farbe
            this.elements.svgColor.on('change', function() {
                self.updateSVGColor($(this).val());
            });
        },
        
        /**
         * Eigenschaften für ein Element anzeigen
         */
        showElementProperties: function(element) {
            if (!element) return;
            
            // Aktuelles Element speichern
            this.state.currentElement = element;
            
            // Alle Eigenschaftsbereiche ausblenden
            this.elements.noSelection.hide();
            this.elements.imageProperties.hide();
            this.elements.svgProperties.hide();
            this.elements.textProperties.hide();
            this.elements.shapeProperties.hide();
            
            // Allgemeine Eigenschaften aktualisieren
            this.updatePositionValues(element);
            this.updateSizeValues(element);
            this.updateRotationValue(element);
            this.updateOpacityValue(element);
            
            // Je nach Elementtyp entsprechende Eigenschaften anzeigen
            switch (element.type) {
                case 'image':
                    this.elements.imageProperties.show();
                    break;
                    
                case 'svg':
                    this.elements.svgProperties.show();
                    
                    // SVG-Farbe setzen
                    if (this.elements.svgColor && element.color) {
                        this.elements.svgColor.val(element.color);
                    }
                    break;
                    
                case 'text':
                    this.elements.textProperties.show();
                    
                    // Text-Eigenschaften setzen
                    if (this.elements.fontFamily && element.fontFamily) {
                        this.elements.fontFamily.val(element.fontFamily);
                    }
                    
                    if (this.elements.fontSize && element.fontSize) {
                        this.elements.fontSize.val(element.fontSize);
                    }
                    
                    if (this.elements.textAlign && element.textAlign) {
                        this.elements.textAlign.val(element.textAlign);
                    }
                    
                    if (this.elements.textColor && element.color) {
                        this.elements.textColor.val(element.color);
                    }
                    
                    if (this.elements.textContent && element.text) {
                        this.elements.textContent.val(element.text);
                    }
                    break;
                    
                case 'rect':
                case 'ellipse':
                    this.elements.shapeProperties.show();
                    
                    // Form-Eigenschaften setzen
                    if (this.elements.fillColor && element.fillColor) {
                        this.elements.fillColor.val(element.fillColor);
                    }
                    
                    if (this.elements.strokeColor && element.strokeColor) {
                        this.elements.strokeColor.val(element.strokeColor);
                    }
                    
                    if (this.elements.strokeWidth && element.strokeWidth) {
                        this.elements.strokeWidth.val(element.strokeWidth);
                    }
                    break;
            }
        },
        
        /**
         * Elementeigenschaften ausblenden
         */
        hideElementProperties: function() {
            this.state.currentElement = null;
            
            // Alle spezifischen Eigenschaftsbereiche ausblenden
            this.elements.imageProperties.hide();
            this.elements.svgProperties.hide();
            this.elements.textProperties.hide();
            this.elements.shapeProperties.hide();
            
            // "Keine Auswahl"-Bereich anzeigen
            this.elements.noSelection.show();
        },
        
        /**
         * Positionswerte aktualisieren
         */
        updatePositionValues: function(element) {
            if (!element) return;
            
            if (this.elements.posX) {
                this.elements.posX.val(Math.round(element.left));
            }
            
            if (this.elements.posY) {
                this.elements.posY.val(Math.round(element.top));
            }
        },
        
        /**
         * Größenwerte aktualisieren
         */
        updateSizeValues: function(element) {
            if (!element) return;
            
            if (this.elements.width) {
                this.elements.width.val(Math.round(element.width));
            }
            
            if (this.elements.height) {
                this.elements.height.val(Math.round(element.height));
            }
        },
        
        /**
         * Rotationswert aktualisieren
         */
        updateRotationValue: function(element) {
            if (!element || !this.elements.rotation) return;
            
            var rotation = element.rotation || 0;
            this.elements.rotation.val(rotation);
        },
        
        /**
         * Transparenzwert aktualisieren
         */
        updateOpacityValue: function(element) {
            if (!element || !this.elements.opacity) return;
            
            var opacity = element.opacity !== undefined ? element.opacity : 1;
            this.elements.opacity.val(opacity);
            
            // Prozentwert aktualisieren
            if (this.elements.opacityValue) {
                this.elements.opacityValue.text(Math.round(opacity * 100) + '%');
            }
        },
        
        /**
         * Elementposition aktualisieren
         */
        updateElementPosition: function(axis, value) {
            if (!this.state.currentElement) return;
            
            var element = this.state.currentElement;
            
            if (axis === 'x') {
                element.left = value;
            } else if (axis === 'y') {
                element.top = value;
            }
            
            // Canvas aktualisieren
            if (typeof YPrintDesignTool.Canvas !== 'undefined') {
                YPrintDesignTool.Canvas.redraw();
            }
            
            // Im Verlauf speichern
            this.debouncedHistoryStep();
        },
        
        /**
         * Elementgröße aktualisieren
         */
        updateElementSize: function(dimension, value) {
            if (!this.state.currentElement) return;
            
            var element = this.state.currentElement;
            var originalWidth = element.width;
            var originalHeight = element.height;
            
            if (dimension === 'width') {
                element.width = value;
                
                // Seitenverhältnis beibehalten?
                if (this.state.lockAspectRatio && element.originalWidth && element.originalHeight) {
                    var aspectRatio = element.originalWidth / element.originalHeight;
                    element.height = value / aspectRatio;
                    
                    // Height-Input aktualisieren
                    if (this.elements.height) {
                        this.elements.height.val(Math.round(element.height));
                    }
                }
            } else if (dimension === 'height') {
                element.height = value;
                
                // Seitenverhältnis beibehalten?
                if (this.state.lockAspectRatio && element.originalWidth && element.originalHeight) {
                    var aspectRatio = element.originalWidth / element.originalHeight;
                    element.width = value * aspectRatio;
                    
                    // Width-Input aktualisieren
                    if (this.elements.width) {
                        this.elements.width.val(Math.round(element.width));
                    }
                }
            }
            
            // Canvas aktualisieren
            if (typeof YPrintDesignTool.Canvas !== 'undefined') {
                YPrintDesignTool.Canvas.redraw();
            }
            
            // Im Verlauf speichern
            this.debouncedHistoryStep();
        },
        
        /**
         * Elementrotation aktualisieren
         */
        updateElementRotation: function(value) {
            if (!this.state.currentElement) return;
            
            this.state.currentElement.rotation = value;
            
            // Canvas aktualisieren
            if (typeof YPrintDesignTool.Canvas !== 'undefined') {
                YPrintDesignTool.Canvas.redraw();
            }
            
            // Im Verlauf speichern
            this.debouncedHistoryStep();
        },
        
        /**
         * Elementtransparenz aktualisieren
         */
        updateElementOpacity: function(value) {
            if (!this.state.currentElement) return;
            
            this.state.currentElement.opacity = value;
            
            // Canvas aktualisieren
            if (typeof YPrintDesignTool.Canvas !== 'undefined') {
                YPrintDesignTool.Canvas.redraw();
            }
            
            // Im Verlauf speichern
            this.debouncedHistoryStep();
        },
        
        /**
         * Element-Füllfarbe aktualisieren
         */
        updateElementFillColor: function(color) {
            if (!this.state.currentElement) return;
            
            this.state.currentElement.fillColor = color;
            
            // Canvas aktualisieren
            if (typeof YPrintDesignTool.Canvas !== 'undefined') {
                YPrintDesignTool.Canvas.redraw();
            }
            
            // Im Verlauf speichern
            this.debouncedHistoryStep();
        },
        
        /**
         * Element-Strichfarbe aktualisieren
         */
        updateElementStrokeColor: function(color) {
            if (!this.state.currentElement) return;
            
            this.state.currentElement.strokeColor = color;
            
            // Canvas aktualisieren
            if (typeof YPrintDesignTool.Canvas !== 'undefined') {
                YPrintDesignTool.Canvas.redraw();
            }
            
            // Im Verlauf speichern
            this.debouncedHistoryStep();
        },
        
        /**
         * Element-Strichbreite aktualisieren
         */
        updateElementStrokeWidth: function(width) {
            if (!this.state.currentElement) return;
            
            this.state.currentElement.strokeWidth = width;
            
            // Canvas aktualisieren
            if (typeof YPrintDesignTool.Canvas !== 'undefined') {
                YPrintDesignTool.Canvas.redraw();
            }
            
            // Im Verlauf speichern
            this.debouncedHistoryStep();
        },
        
        /**
         * Element-Schriftart aktualisieren
         */
        updateElementFontFamily: function(fontFamily) {
            if (!this.state.currentElement || this.state.currentElement.type !== 'text') return;
            
            this.state.currentElement.fontFamily = fontFamily;
            
            // Canvas aktualisieren
            if (typeof YPrintDesignTool.Canvas !== 'undefined') {
                YPrintDesignTool.Canvas.redraw();
            }
            
            // Im Verlauf speichern
            this.debouncedHistoryStep();
        },
        
        /**
         * Element-Schriftgröße aktualisieren
         */
        updateElementFontSize: function(fontSize) {
            if (!this.state.currentElement || this.state.currentElement.type !== 'text') return;
            
            this.state.currentElement.fontSize = fontSize;
            
            // Canvas aktualisieren
            if (typeof YPrintDesignTool.Canvas !== 'undefined') {
                YPrintDesignTool.Canvas.redraw();
            }
            
            // Im Verlauf speichern
            this.debouncedHistoryStep();
        },
        
        /**
         * Element-Textausrichtung aktualisieren
         */
        updateElementTextAlign: function(textAlign) {
            if (!this.state.currentElement || this.state.currentElement.type !== 'text') return;
            
            this.state.currentElement.textAlign = textAlign;
            
            // Canvas aktualisieren
            if (typeof YPrintDesignTool.Canvas !== 'undefined') {
                YPrintDesignTool.Canvas.redraw();
            }
            
            // Im Verlauf speichern
            this.debouncedHistoryStep();
        },
        
        /**
         * Element-Textfarbe aktualisieren
         */
        updateElementTextColor: function(color) {
            if (!this.state.currentElement || this.state.currentElement.type !== 'text') return;
            
            this.state.currentElement.color = color;
            
            // Canvas aktualisieren
            if (typeof YPrintDesignTool.Canvas !== 'undefined') {
                YPrintDesignTool.Canvas.redraw();
            }
            
            // Im Verlauf speichern
            this.debouncedHistoryStep();
        },
        
        /**
         * Element-Textinhalt aktualisieren
         */
        updateTextContent: function(text) {
            if (!this.state.currentElement || this.state.currentElement.type !== 'text') return;
            
            this.state.currentElement.text = text;
            
            // Canvas aktualisieren
            if (typeof YPrintDesignTool.Canvas !== 'undefined') {
                YPrintDesignTool.Canvas.redraw();
            }
            
            // Im Verlauf speichern
            this.debouncedHistoryStep();
        },
        
        /**
         * SVG-Farbe aktualisieren
         */
        updateSVGColor: function(color) {
            if (!this.state.currentElement || this.state.currentElement.type !== 'svg') return;
            
            this.state.currentElement.color = color;
            
            // SVG-Farbe per AJAX ändern
            this.updateSVGColorViaAjax(this.state.currentElement, color);
        },
        
        /**
         * SVG-Farbe per AJAX aktualisieren
         */
        updateSVGColorViaAjax: function(element, color) {
            var self = this;
            
            // AJAX-Anfrage senden
            $.ajax({
                url: YPrintDesignTool.config.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'yprint_change_svg_color',
                    nonce: YPrintDesignTool.config.nonce,
                    svg_content: element.originalSvg || '',
                    path_id: 'all', // Alle Pfade ändern
                    new_color: color
                },
                success: function(response) {
                    if (response.success && response.data.svg_content) {
                        // Bild mit neuer Farbe laden
                        var blob = new Blob([response.data.svg_content], {type: 'image/svg+xml'});
                        var url = URL.createObjectURL(blob);
                        
                        // Altes Bild ersetzen
                        var img = new Image();
                        img.onload = function() {
                            // Bild dem Element zuweisen
                            element.image = this;
                            element.src = url;
                            
                            // Original-SVG speichern für spätere Farbänderungen
                            element.originalSvg = response.data.svg_content;
                            
                            // Canvas aktualisieren
                            if (typeof YPrintDesignTool.Canvas !== 'undefined') {
                                YPrintDesignTool.Canvas.redraw();
                            }
                            
                            // Im Verlauf speichern
                            if (typeof YPrintDesignTool.addHistoryStep === 'function') {
                                YPrintDesignTool.addHistoryStep();
                            }
                        };
                        
                        img.src = url;
                    } else {
                        console.error('Fehler beim Ändern der SVG-Farbe:', response.data ? response.data.message : 'Unbekannter Fehler');
                    }
                },
                error: function() {
                    console.error('AJAX-Fehler beim Ändern der SVG-Farbe');
                }
            });
        },
        
        /**
         * Verzögerter Historienschritt
         */
        debouncedHistoryStep: function() {
            var self = this;
            
            // Bestehenden Timer löschen
            if (this.state.updateTimer) {
                clearTimeout(this.state.updateTimer);
            }
            
            // Neuen Timer starten
            this.state.updateTimer = setTimeout(function() {
                if (typeof YPrintDesignTool.addHistoryStep === 'function') {
                    YPrintDesignTool.addHistoryStep();
                }
            }, this.config.debounceTimeout);
        }
    };
    
})(jQuery);
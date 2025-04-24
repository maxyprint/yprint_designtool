/**
 * YPrint DesignTool Frontend JavaScript
 */

(function($) {
    'use strict';
    
    // DesignTool Hauptklasse
    var YPrintDesignTool = function(container, options) {
        this.container = container;
        this.$container = $(container);
        this.options = options || {};
        
        // Standardwerte
        this.defaults = {
            mode: 'standard',
            tools: 'all',
            products: '',
            template: ''
        };
        
        // Kombiniere Optionen mit Standardwerten
        this.settings = $.extend({}, this.defaults, this.options);
        
        // Interne Statusinformationen
        this.state = {
            loaded: false,
            activeElement: null,
            elements: [],
            canvasWidth: 800,
            canvasHeight: 600,
            zoom: 1
        };
        
        // Initialisiere das Tool
        this.init();
    };
    
    // Prototyp mit Methoden erweitern
    YPrintDesignTool.prototype = {
        /**
         * Initialisiert das DesignTool
         */
        init: function() {
            // Referenz für Callbacks
            var self = this;
            
            // Verzögerung hinzufügen, um Ladeanimation zu zeigen
            setTimeout(function() {
                self.buildInterface();
                self.bindEvents();
                self.loadInitialContent();
                
                // Entferne Ladebildschirm und zeige Interface
                self.$container.find('.yprint-designtool-loading').fadeOut();
                self.$container.find('.yprint-designtool-interface').fadeIn();
                
                // Status aktualisieren
                self.state.loaded = true;
            }, 800);
        },
        
        /**
         * Baut die Benutzeroberfläche auf
         */
        buildInterface: function() {
            var $interface = this.$container.find('.yprint-designtool-interface');
            
            // Grundstruktur erstellen
            var interfaceHtml = '' +
                '<div class="yprint-designtool-toolbar">' +
                    this.buildToolbar() +
                '</div>' +
                '<div class="yprint-designtool-main">' +
                    '<div class="yprint-designtool-canvas-container">' +
                        '<div class="yprint-designtool-canvas" style="width:' + this.state.canvasWidth + 'px;height:' + this.state.canvasHeight + 'px;">' +
                            // Canvas-Inhalte werden dynamisch hinzugefügt
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="yprint-designtool-properties">' +
                    this.buildPropertiesPanel() +
                '</div>';
            
            $interface.html(interfaceHtml);
        },
        
        /**
         * Baut die Werkzeugleiste
         * 
         * @return {string} HTML für die Werkzeugleiste
         */
        buildToolbar: function() {
            // Beispiel-Toolbar, später erweitern
            return '' +
                '<div class="yprint-designtool-tool-group">' +
                    '<div class="yprint-designtool-tool" data-tool="select" title="Auswählen">' +
 '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M11.7 4.3l-4 10c-.2.4-.6.7-1 .7-.1 0-.3 0-.4-.1-.6-.2-.8-.8-.6-1.4l1.8-4.5H3c-.6 0-1-.4-1-1 0-.3.1-.5.3-.7l7-7c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4z" fill="currentColor"/></svg>' +
                    '</div>' +
                    '<div class="yprint-designtool-tool" data-tool="text" title="Text hinzufügen">' +
                        '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 2h12v3h-1V3H3v10h4v1H2V2zm4 7h1v3h1v-3h1V8H6v1zm3-1v1h1v3h1v-3h1V8H9z" fill="currentColor"/></svg>' +
                    '</div>' +
                '</div>' +
                '<div class="yprint-designtool-tool-group">' +
                    '<div class="yprint-designtool-tool" data-tool="image" title="Bild einfügen">' +
                        '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M14 2H2v12h12V2zm-1 1v6l-2-2-3 3-2-1-3 3V3h10zm-9 8l3-3 2 1 3-3 1 1v4H4z" fill="currentColor"/></svg>' +
                    '</div>' +
                    '<div class="yprint-designtool-tool" data-tool="shape" title="Form einfügen">' +
                        '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 4L4 8l4 4 4-4-4-4zm0 1.4L10.6 8 8 10.6 5.4 8 8 5.4z" fill="currentColor"/></svg>' +
                    '</div>' +
                '</div>' +
                '<div class="yprint-designtool-tool-group">' +
                    '<div class="yprint-designtool-tool" data-tool="undo" title="Rückgängig">' +
                        '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 3L3 8l5 5V9h1c2.2 0 4 1.8 4 4h2c0-3.3-2.7-6-6-6H8V3z" fill="currentColor"/></svg>' +
                    '</div>' +
                    '<div class="yprint-designtool-tool" data-tool="redo" title="Wiederholen">' +
                        '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 3v4H7c-3.3 0-6 2.7-6 6h2c0-2.2 1.8-4 4-4h1v4l5-5-5-5z" fill="currentColor"/></svg>' +
                    '</div>' +
                '</div>';
        },
        
        /**
         * Baut das Eigenschaften-Panel
         * 
         * @return {string} HTML für das Eigenschaften-Panel
         */
        buildPropertiesPanel: function() {
            // Beispiel-Eigenschaften-Panel, später erweitern
            return '' +
                '<div class="yprint-designtool-properties-section">' +
                    '<h3>Eigenschaften</h3>' +
                    '<div class="yprint-designtool-property">' +
                        '<label>Position X</label>' +
                        '<input type="number" id="prop-position-x" value="0">' +
                    '</div>' +
                    '<div class="yprint-designtool-property">' +
                        '<label>Position Y</label>' +
                        '<input type="number" id="prop-position-y" value="0">' +
                    '</div>' +
                    '<div class="yprint-designtool-property">' +
                        '<label>Breite</label>' +
                        '<input type="number" id="prop-width" value="100">' +
                    '</div>' +
                    '<div class="yprint-designtool-property">' +
                        '<label>Höhe</label>' +
                        '<input type="number" id="prop-height" value="100">' +
                    '</div>' +
                '</div>' +
                '<div class="yprint-designtool-properties-section">' +
                    '<h3>Farbe</h3>' +
                    '<div class="yprint-designtool-property">' +
                        '<label>Füllfarbe</label>' +
                        '<div class="color-picker">' +
                            '<div class="color-preview" style="background-color: #000000;"></div>' +
                            '<input type="text" id="prop-fill-color" value="#000000">' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="yprint-designtool-properties-section">' +
                    '<h3>Aktionen</h3>' +
                    '<button class="yprint-designtool-action-button" data-action="export-svg">Als SVG exportieren</button>' +
                    '<button class="yprint-designtool-action-button" data-action="export-png">Als PNG exportieren</button>' +
                '</div>';
        },
        
        /**
         * Bindet Event-Listener
         */
        bindEvents: function() {
            var self = this;
            
            // Werkzeug-Buttons
            this.$container.on('click', '.yprint-designtool-tool', function() {
                var tool = $(this).data('tool');
                self.activateTool(tool);
            });
            
            // Eigenschafts-Änderungen
            this.$container.on('change', '.yprint-designtool-property input, .yprint-designtool-property select', function() {
                self.updateSelectedElementProperties();
            });
            
            // Aktions-Buttons
            this.$container.on('click', '.yprint-designtool-action-button', function() {
                var action = $(this).data('action');
                self.executeAction(action);
            });
        },
        
        /**
         * Lädt initiale Inhalte (Template, gespeicherte Designs, etc.)
         */
        loadInitialContent: function() {
            // Daten von Serverseite abrufen, falls vorhanden
            var self = this;
            
            // Testweise ein Beispiel-Design einfügen
            this.addExampleContent();
        },
        
        /**
         * Fügt Beispiel-Inhalte zum Canvas hinzu (für Testzwecke)
         */
        addExampleContent: function() {
            var $canvas = this.$container.find('.yprint-designtool-canvas');
            
            // Beispiel-Text
            var $textElement = $('<div class="yprint-designtool-element" data-type="text" style="left: 100px; top: 100px; color: #333;">' +
                '<div style="font-family: Arial; font-size: 36px; font-weight: bold;">YPrint</div>' +
            '</div>');
            
            $canvas.append($textElement);
            
            // Beispiel-Form
            var $shapeElement = $('<div class="yprint-designtool-element" data-type="shape" style="left: 200px; top: 200px; width: 150px; height: 150px;">' +
                '<svg viewBox="0 0 100 100" width="100%" height="100%">' +
                    '<rect x="10" y="10" width="80" height="80" fill="#3498db" />' +
                '</svg>' +
            '</div>');
            
            $canvas.append($shapeElement);
        },
        
        /**
         * Aktiviert ein Werkzeug
         * 
         * @param {string} tool Werkzeug-ID
         */
        activateTool: function(tool) {
            // Aktives Werkzeug markieren
            this.$container.find('.yprint-designtool-tool').removeClass('active');
            this.$container.find('.yprint-designtool-tool[data-tool="' + tool + '"]').addClass('active');
            
            // Je nach Werkzeug unterschiedliche Aktionen ausführen
            switch (tool) {
                case 'select':
                    this.activateSelectTool();
                    break;
                case 'text':
                    this.activateTextTool();
                    break;
                case 'image':
                    this.activateImageTool();
                    break;
                case 'shape':
                    this.activateShapeTool();
                    break;
                case 'undo':
                    this.undoAction();
                    break;
                case 'redo':
                    this.redoAction();
                    break;
            }
        },
        
        /**
         * Aktiviert das Auswahl-Werkzeug
         */
        activateSelectTool: function() {
            console.log('Auswahl-Werkzeug aktiviert');
            // Implementierung folgt
        },
        
        /**
         * Aktiviert das Text-Werkzeug
         */
        activateTextTool: function() {
            console.log('Text-Werkzeug aktiviert');
            // Implementierung folgt
        },
        
        /**
         * Aktiviert das Bild-Werkzeug
         */
        activateImageTool: function() {
            console.log('Bild-Werkzeug aktiviert');
            // Implementierung folgt
        },
        
        /**
         * Aktiviert das Form-Werkzeug
         */
        activateShapeTool: function() {
            console.log('Form-Werkzeug aktiviert');
            // Implementierung folgt
        },
        
        /**
         * Führt eine Undo-Aktion aus
         */
        undoAction: function() {
            console.log('Undo');
            // Implementierung folgt
        },
        
        /**
         * Führt eine Redo-Aktion aus
         */
        redoAction: function() {
            console.log('Redo');
            // Implementierung folgt
        },
        
        /**
         * Aktualisiert die Eigenschaften des ausgewählten Elements
         */
        updateSelectedElementProperties: function() {
            // Implementierung folgt
        },
        
        /**
         * Führt eine Aktion aus (z.B. Export)
         * 
         * @param {string} action Aktions-ID
         */
        executeAction: function(action) {
            switch (action) {
                case 'export-svg':
                    this.exportAsSVG();
                    break;
                case 'export-png':
                    this.exportAsPNG();
                    break;
            }
        },
        
        /**
         * Exportiert das Design als SVG
         */
        exportAsSVG: function() {
            console.log('Export als SVG');
            // Implementierung folgt
        },
        
        /**
         * Exportiert das Design als PNG
         */
        exportAsPNG: function() {
            console.log('Export als PNG');
            // Implementierung folgt
        }
    };
    
    // jQuery-Plugin-Definition
    $.fn.yprintDesignTool = function(options) {
        return this.each(function() {
            if (!$.data(this, 'yprintDesignTool')) {
                $.data(this, 'yprintDesignTool', new YPrintDesignTool(this, options));
            }
        });
    };
    
    // Automatisch DesignTool initialisieren, wenn Instanzen definiert sind
    $(document).ready(function() {
        // Für jede definierte Instanz
        if (typeof yprintDesignToolInstances !== 'undefined') {
            $.each(yprintDesignToolInstances, function(id, options) {
                $('#' + id).yprintDesignTool(options);
            });
        }
    });
    
})(jQuery);
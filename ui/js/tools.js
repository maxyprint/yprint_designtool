/**
 * YPrint DesignTool - Tools-Modul
 * 
 * Verwaltet die Werkzeuge für das DesignTool
 */

(function($) {
    'use strict';
    
    // Tools-Modul
    window.YPrintDesignTool = window.YPrintDesignTool || {};
    window.YPrintDesignTool.Tools = {
        // Konfiguration
        config: {
            activeToolClass: 'active'
        },
        
        // Zustand
        state: {
            initialized: false,
            activeTool: 'selection'
        },
        
        // Verfügbare Werkzeuge
        tools: {
            // Auswahl-Werkzeug
            selection: {
                name: 'selection',
                title: 'Auswahlwerkzeug',
                icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M7 21l4-4h8V7l-4 4l-8-8v18z" fill="currentColor"/></svg>',
                cursor: 'default',
                activate: function() {
                    YPrintDesignTool.Canvas.elements.canvas.css('cursor', this.cursor);
                },
                deactivate: function() {
                    // Nichts zu tun
                }
            },
            
            // Text-Werkzeug
            text: {
                name: 'text',
                title: 'Text hinzufügen',
                icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" fill="currentColor"/></svg>',
                cursor: 'text',
                activate: function() {
                    YPrintDesignTool.Canvas.elements.canvas.css('cursor', this.cursor);
                },
                deactivate: function() {
                    // Nichts zu tun
                },
                action: function(x, y) {
                    // Text-Dialog öffnen
                    var text = prompt('Text eingeben:', 'Dein Text hier');
                    if (text === null) return; // Abgebrochen
                    
                    // Text-Element erstellen
                    var elementId = 'element-' + (++YPrintDesignTool.state.elementCounter);
                    YPrintDesignTool.Canvas.addElement({
                        id: elementId,
                        type: 'text',
                        text: text,
                        left: x,
                        top: y,
                        width: 200,
                        height: 50,
                        fontSize: 16,
                        fontFamily: 'Arial',
                        color: '#000000',
                        rotation: 0,
                        opacity: 1
                    });
                    
                    // Element auswählen
                    YPrintDesignTool.Canvas.selectElement(elementId);
                    
                    // Im Verlauf speichern
                    if (typeof YPrintDesignTool.addHistoryStep === 'function') {
                        YPrintDesignTool.addHistoryStep();
                    }
                    
                    // Zurück zum Auswahlwerkzeug
                    YPrintDesignTool.Tools.setActiveTool('selection');
                }
            },
            
            // Rechteck-Werkzeug
            rectangle: {
                name: 'rectangle',
                title: 'Rechteck hinzufügen',
                icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M2 2v20h20V2H2zm18 18H4V4h16v16z" fill="currentColor"/></svg>',
                cursor: 'crosshair',
                activate: function() {
                    YPrintDesignTool.Canvas.elements.canvas.css('cursor', this.cursor);
                },
                deactivate: function() {
                    // Nichts zu tun
                },
                action: function(x, y) {
                    // Rechteck-Element erstellen
                    var elementId = 'element-' + (++YPrintDesignTool.state.elementCounter);
                    YPrintDesignTool.Canvas.addElement({
                        id: elementId,
                        type: 'rect',
                        left: x,
                        top: y,
                        width: 100,
                        height: 100,
                        fillColor: '#f5f5f5',
                        strokeColor: '#000000',
                        strokeWidth: 1,
                        rotation: 0,
                        opacity: 1
                    });
                    
                    // Element auswählen
                    YPrintDesignTool.Canvas.selectElement(elementId);
                    
                    // Im Verlauf speichern
                    if (typeof YPrintDesignTool.addHistoryStep === 'function') {
                        YPrintDesignTool.addHistoryStep();
                    }
                    
                    // Zurück zum Auswahlwerkzeug
                    YPrintDesignTool.Tools.setActiveTool('selection');
                }
            },
            
            // Ellipse-Werkzeug
            ellipse: {
                name: 'ellipse',
                title: 'Ellipse hinzufügen',
                icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="currentColor"/></svg>',
                cursor: 'crosshair',
                activate: function() {
                    YPrintDesignTool.Canvas.elements.canvas.css('cursor', this.cursor);
                },
                deactivate: function() {
                    // Nichts zu tun
                },
                action: function(x, y) {
                    // Ellipse-Element erstellen
                    var elementId = 'element-' + (++YPrintDesignTool.state.elementCounter);
                    YPrintDesignTool.Canvas.addElement({
                        id: elementId,
                        type: 'ellipse',
                        left: x,
                        top: y,
                        width: 100,
                        height: 100,
                        fillColor: '#f5f5f5',
                        strokeColor: '#000000',
                        strokeWidth: 1,
                        rotation: 0,
                        opacity: 1
                    });
                    
                    // Element auswählen
                    YPrintDesignTool.Canvas.selectElement(elementId);
                    
                    // Im Verlauf speichern
                    if (typeof YPrintDesignTool.addHistoryStep === 'function') {
                        YPrintDesignTool.addHistoryStep();
                    }
                    
                    // Zurück zum Auswahlwerkzeug
                    YPrintDesignTool.Tools.setActiveTool('selection');
                }
            },
            
            // Zoom-Werkzeug
            zoom: {
                name: 'zoom',
                title: 'Zoom',
                icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm.5-7H9v2H7v1h2v2h1v-2h2V9h-2z" fill="currentColor"/></svg>',
                cursor: 'zoom-in',
                activate: function() {
                    YPrintDesignTool.Canvas.elements.canvas.css('cursor', this.cursor);
                },
                deactivate: function() {
                    // Nichts zu tun
                },
                action: function(x, y) {
                    // Zoom an der angegebenen Position
                    YPrintDesignTool.Canvas.zoomIn();
                }
            },
            
            // Zoom-Out-Werkzeug
            zoomOut: {
                name: 'zoomOut',
                title: 'Zoom Out',
                icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z" fill="currentColor"/></svg>',
                cursor: 'zoom-out',
                activate: function() {
                    YPrintDesignTool.Canvas.elements.canvas.css('cursor', this.cursor);
                },
                deactivate: function() {
                    // Nichts zu tun
                },
                action: function(x, y) {
                    // Zoom Out an der angegebenen Position
                    YPrintDesignTool.Canvas.zoomOut();
                }
            },
            
            // Hand-Werkzeug (Panning)
            hand: {
                name: 'hand',
                title: 'Hand-Werkzeug (Verschieben)',
                icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M17.66 8L12 2.35 6.34 8C4.78 9.56 4 11.64 4 13.64s.78 4.11 2.34 5.67 3.61 2.35 5.66 2.35 4.1-.79 5.66-2.35S20 15.64 20 13.64s-.78-4.08-2.34-5.64zM12 19c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/></svg>',
                cursor: 'grab',
                activate: function() {
                    YPrintDesignTool.Canvas.elements.canvas.css('cursor', this.cursor);
                },
                deactivate: function() {
                    // Nichts zu tun
                }
            }
        },
        
        // DOM-Elemente
        elements: {
            toolbarContainer: null,
            toolButtons: {}
        },
        
        /**
         * Tools initialisieren
         */
        init: function(toolbarContainer) {
            if (this.state.initialized) {
                return;
            }
            
            this.elements.toolbarContainer = toolbarContainer;
            
            // Werkzeug-Buttons erstellen
            this.createToolButtons();
            
            // Standardwerkzeug aktivieren
            this.setActiveTool('selection');
            
            this.state.initialized = true;
            console.log('Tools initialisiert');
        },
        
        /**
         * Werkzeug-Buttons erstellen
         */
        createToolButtons: function() {
            var self = this;
            
            // Toolbar-Gruppe für Werkzeuge erstellen
            var toolGroup = $('<div class="designtool-toolbar-group"></div>');
            this.elements.toolbarContainer.append(toolGroup);
            
            // Für jedes Werkzeug einen Button erstellen
            for (var toolName in this.tools) {
                if (!this.tools.hasOwnProperty(toolName)) continue;
                
                var tool = this.tools[toolName];
                
                var button = $('<button id="designtool-tool-' + toolName + '" class="designtool-btn designtool-tool-btn" title="' + tool.title + '">' +
                    tool.icon +
                '</button>');
                
                // Click-Handler hinzufügen
                button.on('click', function(tool) {
                    return function() {
                        self.setActiveTool(tool);
                    };
                }(toolName));
                
                // Button in der Toolbar platzieren
                toolGroup.append(button);
                
                // Button für späteren Zugriff speichern
                this.elements.toolButtons[toolName] = button;
            }
            
            // Canvas-Click-Event verarbeiten
            if (typeof YPrintDesignTool.Canvas !== 'undefined') {
                YPrintDesignTool.Canvas.elements.canvas.on('click', function(e) {
                    var activeTool = self.tools[self.state.activeTool];
                    if (activeTool && typeof activeTool.action === 'function') {
                        var pos = YPrintDesignTool.Canvas.getMousePosition(e);
                        activeTool.action(pos.x, pos.y);
                    }
                });
            }
        },
        
        /**
         * Aktives Werkzeug setzen
         */
        setActiveTool: function(toolName) {
            // Altes Werkzeug deaktivieren
            if (this.state.activeTool && this.tools[this.state.activeTool]) {
                var oldTool = this.tools[this.state.activeTool];
                if (typeof oldTool.deactivate === 'function') {
                    oldTool.deactivate();
                }
                
                // Button-Stil aktualisieren
                if (this.elements.toolButtons[this.state.activeTool]) {
                    this.elements.toolButtons[this.state.activeTool].removeClass(this.config.activeToolClass);
                }
            }
            
            // Neues Werkzeug aktivieren
            this.state.activeTool = toolName;
            
            if (this.tools[toolName]) {
                var newTool = this.tools[toolName];
                if (typeof newTool.activate === 'function') {
                    newTool.activate();
                }
                
                // Button-Stil aktualisieren
                if (this.elements.toolButtons[toolName]) {
                    this.elements.toolButtons[toolName].addClass(this.config.activeToolClass);
                }
            }
        },
        
        /**
         * Aktives Werkzeug abrufen
         */
        getActiveTool: function() {
            return this.tools[this.state.activeTool];
        }
    };
    
})(jQuery);
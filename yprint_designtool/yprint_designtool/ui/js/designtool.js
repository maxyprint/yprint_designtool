/**
 * YPrint DesignTool - Hauptmodul
 * 
 * Hauptskript für das DesignTool UI, das alle anderen Module koordiniert
 */

(function($) {
    'use strict';
    
    // Prüfen, ob jQuery verfügbar ist
    if (typeof $ === 'undefined') {
        console.error('jQuery ist nicht verfügbar. DesignTool kann nicht initialisiert werden.');
        return;
    }
    
    // Globales DesignTool-Objekt
    window.YPrintDesignTool = {
        config: {
            // Standard-Konfiguration
            canvasWidth: 800,
            canvasHeight: 600,
            maxZoom: 3,
            minZoom: 0.5,
            zoomStep: 0.1,
            ajaxUrl: typeof yprintDesigntool !== 'undefined' ? yprintDesigntool.ajaxUrl : '',
            nonce: typeof yprintDesigntool !== 'undefined' ? yprintDesigntool.nonce : '',
            maxUploadSize: typeof yprintDesigntool !== 'undefined' ? yprintDesigntool.maxUploadSize : 5242880,
            pluginUrl: typeof yprintDesigntool !== 'undefined' ? yprintDesigntool.pluginUrl : ''
        },
        
        // Module
        canvas: null,
        tools: null,
        properties: null,
        
        // State Management
        state: {
            initialized: false,
            elements: [],
            elementCounter: 0,
            history: [],
            historyIndex: -1,
            maxHistorySteps: 30
        },
        
        // DOM-Elemente
        elements: {},
        
        /**
         * Initialisierung
         */
        init: function() {
            console.log('YPrint DesignTool wird initialisiert...');
            
            if (this.state.initialized) {
                console.warn('DesignTool wurde bereits initialisiert');
                return;
            }
            
            // DOM-Elemente cachen
            this.cacheElements();
            
            // Module initialisieren
            this.initModules();
            
            // Events binden
            this.bindEvents();
            
            // Existierende SVG-Datei laden, falls verfügbar
            this.loadExistingSvgIfAvailable();
            
            this.state.initialized = true;
            console.log('YPrint DesignTool wurde erfolgreich initialisiert');
        },
        
        /**
         * DOM-Elemente cachen
         */
        cacheElements: function() {
            // Hauptcontainer
            this.elements.container = $('.yprint-designtool-container');
            
            // Sidebar
            this.elements.sidebar = $('.designtool-sidebar');
            this.elements.filesList = $('#designtool-files');
            this.elements.uploadButton = $('#designtool-upload-btn');
            this.elements.fileInput = $('#designtool-file-input');
            
            // Canvas-Bereich
            this.elements.canvasContainer = $('.designtool-canvas-container');
            this.elements.canvas = $('#designtool-canvas');
            
            // Toolbar
            this.elements.toolbar = $('.designtool-toolbar');
            this.elements.zoomInButton = $('#designtool-zoom-in-btn');
            this.elements.zoomOutButton = $('#designtool-zoom-out-btn');
            this.elements.zoomResetButton = $('#designtool-zoom-reset-btn');
            this.elements.undoButton = $('#designtool-undo-btn');
            this.elements.redoButton = $('#designtool-redo-btn');
            this.elements.vectorizeButton = $('#designtool-vectorize-btn');
            
            // Eigenschaften-Panel
            this.elements.properties = $('.designtool-properties');
            this.elements.noSelection = $('#designtool-no-selection');
            this.elements.imageProperties = $('#designtool-image-properties');
            this.elements.svgProperties = $('#designtool-svg-properties');
            
            // Export
            this.elements.exportFormat = $('#designtool-export-format');
            this.elements.exportButton = $('#designtool-export-btn');
            this.elements.downloadLink = $('#designtool-download-link');
            
            // Vektorisierungsmodal
            this.elements.vectorizeModal = $('#designtool-vectorize-modal');
            this.elements.vectorizeClose = $('.designtool-modal-close');
            this.elements.vectorizeCancel = $('#designtool-vectorize-cancel');
            this.elements.vectorizeStart = $('#designtool-vectorize-start');
            this.elements.vectorizeDetail = $('#designtool-vectorize-detail');
            this.elements.vectorizeProgress = $('#designtool-vectorize-progress');
            this.elements.previewOriginal = $('#designtool-preview-original-img');
            this.elements.previewResult = $('#designtool-preview-result-img');
        },
        
        /**
         * Module initialisieren
         */
        initModules: function() {
            // Canvas-Modul initialisieren
            this.canvas = YPrintDesignTool.Canvas;
            this.canvas.init(this.elements.canvas, this.elements.canvasContainer);
            
            // Tools-Modul initialisieren
            this.tools = YPrintDesignTool.Tools;
            this.tools.init(this.elements.toolbar);
            
            // Properties-Modul initialisieren
            this.properties = YPrintDesignTool.Properties;
            this.properties.init(this.elements.properties);
        },
        
        /**
         * Globale Events binden
         */
        bindEvents: function() {
            var self = this;
            
            // Datei-Upload
            this.elements.uploadButton.on('click', function(e) {
                e.preventDefault();
                self.elements.fileInput.trigger('click');
            });
            
            this.elements.fileInput.on('change', function() {
                self.handleFileSelection(this.files);
            });
            
            // Export
            this.elements.exportButton.on('click', function() {
                self.exportDesign();
            });
            
            // Vektorisierungsmodal
            this.elements.vectorizeButton.on('click', function() {
                self.openVectorizeModal();
            });
            
            this.elements.vectorizeClose.on('click', function() {
                self.closeVectorizeModal();
            });
            
            this.elements.vectorizeCancel.on('click', function() {
                self.closeVectorizeModal();
            });
            
            this.elements.vectorizeStart.on('click', function() {
                self.startVectorization();
            });
            
            // Tastatur-Shortcuts
            $(document).on('keydown', function(e) {
                self.handleKeyDown(e);
            });
            
            // History-Events
            this.elements.undoButton.on('click', function() {
                self.undo();
            });
            
            this.elements.redoButton.on('click', function() {
                self.redo();
            });
            
            // Zoom-Events
            this.elements.zoomInButton.on('click', function() {
                self.canvas.zoomIn();
            });
            
            this.elements.zoomOutButton.on('click', function() {
                self.canvas.zoomOut();
            });
            
            this.elements.zoomResetButton.on('click', function() {
                self.canvas.zoomReset();
            });
        },
        
        /**
         * Tastaturkürzel verarbeiten
         */
        handleKeyDown: function(e) {
            // Strg/Cmd gedrückt?
            var ctrlKey = e.ctrlKey || e.metaKey;
            
            // Strg/Cmd + Z: Rückgängig
            if (ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
            
            // Strg/Cmd + Shift + Z: Wiederherstellen
            if (ctrlKey && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                this.redo();
            }
            
            // Strg/Cmd + Y: Wiederherstellen
            if (ctrlKey && e.key === 'y') {
                e.preventDefault();
                this.redo();
            }
            
            // Entf/Delete: Element löschen
            if (e.key === 'Delete') {
                var selectedElement = this.canvas.getSelectedElement();
                if (selectedElement) {
                    this.canvas.deleteElement(selectedElement.id);
                    this.addHistoryStep();
                }
            }
            
            // Strg/Cmd + C: Kopieren
            if (ctrlKey && e.key === 'c') {
                var selectedElement = this.canvas.getSelectedElement();
                if (selectedElement) {
                    this.clipboard = JSON.parse(JSON.stringify(selectedElement));
                }
            }
            
            // Strg/Cmd + V: Einfügen
            if (ctrlKey && e.key === 'v' && this.clipboard) {
                var newElement = JSON.parse(JSON.stringify(this.clipboard));
                newElement.id = 'element-' + (++this.state.elementCounter);
                newElement.left += 20;
                newElement.top += 20;
                this.canvas.addElement(newElement);
                this.canvas.selectElement(newElement.id);
                this.addHistoryStep();
            }
        },
        
        /**
         * Dateien verarbeiten
         */
        handleFileSelection: function(files) {
            var self = this;
            
            if (!files || files.length === 0) {
                return;
            }
            
            // Jeden File verarbeiten
            Array.from(files).forEach(function(file) {
                // Prüfen, ob es ein Bild ist
                if (!file.type.match('image.*')) {
                    alert('Nur Bilddateien werden unterstützt.');
                    return;
                }
                
                // Dateigröße prüfen
                if (file.size > self.config.maxUploadSize) {
                    alert('Die Datei ist zu groß. Die maximale Dateigröße beträgt ' + 
                        (self.config.maxUploadSize / (1024 * 1024)) + ' MB.');
                    return;
                }
                
                // Datei hochladen oder direkt verarbeiten
                self.processFile(file);
            });
            
            // Datei-Input zurücksetzen
            self.elements.fileInput.val('');
        },
        
        /**
         * Datei verarbeiten und in das Tool integrieren
         */
        processFile: function(file) {
            var self = this;
            var reader = new FileReader();
            
            reader.onload = function(e) {
                var imageUrl = e.target.result;
                var isSVG = file.type === 'image/svg+xml';
                
                // Datei zur Liste hinzufügen
                var fileId = 'file-' + (++self.state.elementCounter);
                self.addFileToList({
                    id: fileId,
                    name: file.name,
                    type: file.type,
                    size: self.formatFileSize(file.size),
                    url: imageUrl,
                    isSVG: isSVG
                });
                
                // Bild zur Canvas hinzufügen
                var elementId = 'element-' + self.state.elementCounter;
                self.canvas.addElement({
                    id: elementId,
                    type: isSVG ? 'svg' : 'image',
                    src: imageUrl,
                    left: 100,
                    top: 100,
                    width: 300,
                    height: 300,
                    originalWidth: 300,
                    originalHeight: 300,
                    opacity: 1,
                    rotation: 0,
                    fileReference: fileId
                });
                
                // Element auswählen
                self.canvas.selectElement(elementId);
                
                // Im Verlauf speichern
                self.addHistoryStep();
                
                // Wenn SVG, aktiviere den Vektorisierungsbutton nicht
                if (!isSVG) {
                    self.elements.vectorizeButton.prop('disabled', false);
                }
            };
            
            // Datei als DataURL lesen
            reader.readAsDataURL(file);
        },
        
        /**
         * Datei zur Liste hinzufügen
         */
        addFileToList: function(fileData) {
            var fileItem = $('<div class="designtool-file-item" data-id="' + fileData.id + '">' +
                '<div class="designtool-file-icon">' +
                    (fileData.isSVG ? '<i class="svg-icon"></i>' : '<i class="image-icon"></i>') +
                '</div>' +
                '<div class="designtool-file-info">' +
                    '<div class="designtool-file-name">' + fileData.name + '</div>' +
                    '<div class="designtool-file-meta">' + fileData.type + ' • ' + fileData.size + '</div>' +
                '</div>' +
                '<div class="designtool-file-actions">' +
                    '<button class="designtool-file-add" title="Zum Canvas hinzufügen"><i class="add-icon"></i></button>' +
                    '<button class="designtool-file-delete" title="Datei entfernen"><i class="delete-icon"></i></button>' +
                '</div>' +
            '</div>');
            
            // Event-Listener hinzufügen
            var self = this;
            fileItem.find('.designtool-file-add').on('click', function() {
                var elementId = 'element-' + (++self.state.elementCounter);
                self.canvas.addElement({
                    id: elementId,
                    type: fileData.isSVG ? 'svg' : 'image',
                    src: fileData.url,
                    left: 100,
                    top: 100,
                    width: 300,
                    height: 300,
                    originalWidth: 300,
                    originalHeight: 300,
                    opacity: 1,
                    rotation: 0,
                    fileReference: fileData.id
                });
                self.canvas.selectElement(elementId);
                self.addHistoryStep();
            });
            
            fileItem.find('.designtool-file-delete').on('click', function() {
                if (confirm('Möchtest du diese Datei wirklich entfernen?')) {
                    // Alle Elemente entfernen, die auf diese Datei verweisen
                    self.canvas.removeElementsByFileReference(fileData.id);
                    
                    // Datei aus der Liste entfernen
                    fileItem.remove();
                    
                    // Im Verlauf speichern
                    self.addHistoryStep();
                }
            });
            
            // Zum leeren Hinweis prüfen und ggf. entfernen
            if (this.elements.filesList.find('.designtool-empty-notice').length > 0) {
                this.elements.filesList.empty();
            }
            
            // Zur Liste hinzufügen
            this.elements.filesList.append(fileItem);
        },
        
        /**
         * Dateigröße formatieren
         */
        formatFileSize: function(bytes) {
            if (bytes < 1024) {
                return bytes + ' B';
            } else if (bytes < 1048576) {
                return (bytes / 1024).toFixed(1) + ' KB';
            } else {
                return (bytes / 1048576).toFixed(1) + ' MB';
            }
        },
        
        /**
         * Design exportieren
         */
        exportDesign: function() {
            var self = this;
            var format = this.elements.exportFormat.val();
            
            // Design-Daten sammeln
            var designData = {
                width: this.config.canvasWidth,
                height: this.config.canvasHeight,
                elements: this.canvas.getAllElements()
            };
            
            // Auswahl entfernen
            this.canvas.clearSelection();
            
            // AJAX-Anfrage senden
            $.ajax({
                url: this.config.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'yprint_export_as_' + format,
                    nonce: this.config.nonce,
                    design_data: JSON.stringify(designData),
                    filename: 'design-export.' + format
                },
                beforeSend: function() {
                    self.elements.exportButton.prop('disabled', true);
                    self.elements.exportButton.text('Exportiere...');
                },
                success: function(response) {
                    if (response.success && response.data.download_url) {
                        // Download-Link einrichten
                        self.elements.downloadLink.attr('href', response.data.download_url);
                        self.elements.downloadLink.attr('download', 'design-export.' + format);
                        self.elements.downloadLink[0].click();
                    } else {
                        alert('Fehler beim Exportieren: ' + (response.data.message || 'Unbekannter Fehler'));
                    }
                },
                error: function() {
                    alert('Fehler bei der Verbindung zum Server.');
                },
                complete: function() {
                    self.elements.exportButton.prop('disabled', false);
                    self.elements.exportButton.text('Exportieren');
                }
            });
        },
        
        /**
         * Vektorisierungsmodal öffnen
         */
        openVectorizeModal: function() {
            var selectedElement = this.canvas.getSelectedElement();
            
            if (!selectedElement || selectedElement.type !== 'image') {
                alert('Bitte wähle ein Bild aus, das vektorisiert werden soll.');
                return;
            }
            
            // Original-Bild im Modal anzeigen
            this.elements.previewOriginal.empty().append(
                $('<img>').attr('src', selectedElement.src).css({
                    'max-width': '100%',
                    'max-height': '200px'
                })
            );
            
            // Vorschau zurücksetzen
            this.elements.previewResult.html('<div class="designtool-placeholder">Vorschau wird generiert, sobald die Vektorisierung startet</div>');
            
            // Fortschrittsanzeige zurücksetzen
            this.elements.vectorizeProgress.hide();
            
            // Modal öffnen
            this.elements.vectorizeModal.show();
        },
        
        /**
         * Vektorisierungsmodal schließen
         */
        closeVectorizeModal: function() {
            this.elements.vectorizeModal.hide();
        },
        
        /**
         * Vektorisierung starten
         */
        startVectorization: function() {
            var self = this;
            var selectedElement = this.canvas.getSelectedElement();
            
            if (!selectedElement || selectedElement.type !== 'image') {
                alert('Kein Bild ausgewählt.');
                return;
            }
            
            // Bild-URL in Blob umwandeln
            fetch(selectedElement.src)
                .then(function(response) {
                    return response.blob();
                })
                .then(function(blob) {
                    var file = new File([blob], 'image.png', { type: blob.type });
                    var formData = new FormData();
                    
                    // FormData vorbereiten
                    formData.append('action', 'yprint_vectorize_image');
                    formData.append('nonce', self.config.nonce);
                    formData.append('vectorize_image', file);
                    formData.append('detail_level', self.elements.vectorizeDetail.val());
                    formData.append('color_type', 'mono');
                    formData.append('remove_background', '1');
                    
                    // Fortschrittsanzeige anzeigen
                    self.elements.vectorizeProgress.show();
                    
                    // Buttons deaktivieren
                    self.elements.vectorizeStart.prop('disabled', true);
                    self.elements.vectorizeCancel.prop('disabled', true);
                    
                    // AJAX-Anfrage senden
                    $.ajax({
                        url: self.config.ajaxUrl,
                        type: 'POST',
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function(response) {
                            if (response.success && response.data.svg) {
                                // SVG-Vorschau anzeigen
                                self.elements.previewResult.empty().append(
                                    $(response.data.svg).css({
                                        'width': '100%',
                                        'height': '200px'
                                    })
                                );
                                
                                // SVG als Blob vorbereiten
                                var blob = new Blob([response.data.svg], { type: 'image/svg+xml' });
                                var url = URL.createObjectURL(blob);
                                
                                // Datei zur Liste hinzufügen
                                var fileId = 'file-' + (++self.state.elementCounter);
                                self.addFileToList({
                                    id: fileId,
                                    name: 'Vektorisiert.svg',
                                    type: 'image/svg+xml',
                                    size: self.formatFileSize(blob.size),
                                    url: url,
                                    isSVG: true
                                });
                                
                                // Element zur Canvas hinzufügen
                                var elementId = 'element-' + self.state.elementCounter;
                                self.canvas.addElement({
                                    id: elementId,
                                    type: 'svg',
                                    src: url,
                                    left: selectedElement.left + 20,
                                    top: selectedElement.top + 20,
                                    width: selectedElement.width,
                                    height: selectedElement.height,
                                    originalWidth: selectedElement.width,
                                    originalHeight: selectedElement.height,
                                    opacity: 1,
                                    rotation: 0,
                                    fileReference: fileId
                                });
                                
                                // Element auswählen
                                self.canvas.selectElement(elementId);
                                
                                // Im Verlauf speichern
                                self.addHistoryStep();
                                
                                // Modal schließen
                                setTimeout(function() {
                                    self.closeVectorizeModal();
                                }, 1000);
                            } else {
                                alert('Fehler bei der Vektorisierung: ' + (response.data.message || 'Unbekannter Fehler'));
                            }
                        },
                        error: function() {
                            alert('Fehler bei der Verbindung zum Server.');
                        },
                        complete: function() {
                            // Buttons wieder aktivieren
                            self.elements.vectorizeStart.prop('disabled', false);
                            self.elements.vectorizeCancel.prop('disabled', false);
                            
                            // Fortschrittsanzeige ausblenden
                            self.elements.vectorizeProgress.hide();
                        }
                    });
                });
        },
        
        /**
         * Historienschritt hinzufügen
         */
        addHistoryStep: function() {
            // Aktuellen Status speichern
            var currentState = {
                elements: JSON.parse(JSON.stringify(this.canvas.getAllElements()))
            };
            
            // Wenn wir nicht am Ende der Historie sind, alles nach dem aktuellen Index abschneiden
            if (this.state.historyIndex < this.state.history.length - 1) {
                this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);
            }
            
            // Neuen Schritt hinzufügen
            this.state.history.push(currentState);
            
            // Index aktualisieren
            this.state.historyIndex = this.state.history.length - 1;
            
            // Maximale Anzahl an Schritten einhalten
            if (this.state.history.length > this.state.maxHistorySteps) {
                this.state.history.shift();
                this.state.historyIndex--;
            }
            
            // UI-Status aktualisieren
            this.updateUndoRedoButtons();
        },
        
        /**
         * Schritt rückgängig machen
         */
        undo: function() {
            if (this.state.historyIndex <= 0) {
                return; // Nichts zu tun
            }
            
            // Index reduzieren
            this.state.historyIndex--;
            
            // Status wiederherstellen
            this.restoreState(this.state.history[this.state.historyIndex]);
            
            // UI-Status aktualisieren
            this.updateUndoRedoButtons();
        },
        
        /**
         * Schritt wiederherstellen
         */
        redo: function() {
            if (this.state.historyIndex >= this.state.history.length - 1) {
                return; // Nichts zu tun
            }
            
            // Index erhöhen
            this.state.historyIndex++;
            
            // Status wiederherstellen
            this.restoreState(this.state.history[this.state.historyIndex]);
            
            // UI-Status aktualisieren
            this.updateUndoRedoButtons();
        },
        
        /**
         * Status wiederherstellen
         */
        restoreState: function(state) {
            // Alle Elemente löschen
            this.canvas.removeAllElements();
            
            // Elemente wiederherstellen
            var self = this;
            state.elements.forEach(function(element) {
                self.canvas.addElement(element, false); // false = keine Selektion
            });
            
            // Canvas aktualisieren
            this.canvas.redraw();
        },
        
        /**
         * Undo/Redo-Buttons aktualisieren
         */
        updateUndoRedoButtons: function() {
            this.elements.undoButton.prop('disabled', this.state.historyIndex <= 0);
            this.elements.redoButton.prop('disabled', this.state.historyIndex >= this.state.history.length - 1);
        },
        
        /**
         * Existierendes SVG laden, falls verfügbar
         */
        loadExistingSvgIfAvailable: function() {
            // Prüfen, ob vectorizeWpSvgData definiert ist (wird vom PHP-Code bereitgestellt)
            if (typeof window.yprintDesigntoolSvgData !== 'undefined' && window.yprintDesigntoolSvgData.svgContent) {
                console.log('Vorhandenes SVG gefunden, wird geladen...');
                
                // SVG als Blob vorbereiten
                var blob = new Blob([window.yprintDesigntoolSvgData.svgContent], {type: 'image/svg+xml'});
                var url = URL.createObjectURL(blob);
                
                // Datei zur Liste hinzufügen
                var fileId = 'file-' + (++this.state.elementCounter);
                this.addFileToList({
                    id: fileId,
                    name: 'Geladenes SVG',
                    type: 'image/svg+xml',
                    size: this.formatFileSize(blob.size),
                    url: url,
                    isSVG: true
                });
                
                // Element zur Canvas hinzufügen
                var elementId = 'element-' + this.state.elementCounter;
                this.canvas.addElement({
                    id: elementId,
                    type: 'svg',
                    src: url,
                    left: 100,
                    top: 100,
                    width: 300,
                    height: 300,
                    originalWidth: 300,
                    originalHeight: 300,
                    opacity: 1,
                    rotation: 0,
                    fileReference: fileId
                });
                
                // Element auswählen
                this.canvas.selectElement(elementId);
                
                // Im Verlauf speichern
                this.addHistoryStep();
            }
        }
    };
    
    // DesignTool initialisieren, wenn das Dokument bereit ist
    $(document).ready(function() {
        YPrintDesignTool.init();
    });
    
})(jQuery);
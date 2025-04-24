/**
 * YPrint DesignTool - Canvas Modul
 * 
 * Behandelt die Darstellung und Interaktion mit dem Canvas-Element
 */

(function($) {
    'use strict';

    // Canvas-Modul
    window.YPrintDesignTool = window.YPrintDesignTool || {};
    window.YPrintDesignTool.Canvas = {
        // Konfiguration
        config: {
            width: 800,
            height: 600,
            gridSize: 20,
            showGrid: true,
            snapToGrid: false,
            resizeHandleSize: 10,
            minZoom: 0.5,
            maxZoom: 3,
            zoomStep: 0.1
        },
        
// Zustand
state: {
    initialized: false,
    elements: [],
    selectedElementId: null,
    zoom: 1,
    panOffset: { x: 0, y: 0 },
    isDragging: false,
    isResizing: false,
    isPanning: false,
    dragStart: { x: 0, y: 0 },
    originalPos: { x: 0, y: 0 },
    originalSize: { width: 0, height: 0 },
    currentResizeHandle: null
},

// DOM-Elemente
elements: {
    canvas: null,
    container: null,
    ctx: null
},

/**
 * Canvas initialisieren
 */
init: function(canvasElement, containerElement) {
    var self = this;
    
    // DOM-Elemente speichern
    this.elements.canvas = canvasElement;
    this.elements.container = containerElement;
    
    // Canvas-Größe setzen
    canvasElement.attr({
        'width': this.config.width,
        'height': this.config.height
    });
    
    // Kontext speichern
    this.elements.ctx = canvasElement[0].getContext('2d');
    
    // Events binden
    this.bindEvents();
    
    // Initialisiert
    this.state.initialized = true;
    
    // Canvas erstmalig zeichnen
    this.redraw();
    
    console.log('Canvas initialisiert');
},

/**
 * Event-Listener binden
 */
bindEvents: function() {
    var self = this;
    
    // Maus-Events
    this.elements.canvas.on('mousedown', function(e) {
        self.handleMouseDown(e);
    });
    
    $(document).on('mousemove', function(e) {
        self.handleMouseMove(e);
    });
    
    $(document).on('mouseup', function(e) {
        self.handleMouseUp(e);
    });
    
    // Rad-Events für Zoom
    this.elements.container.on('wheel', function(e) {
        self.handleWheel(e);
    });
    
    // Tastatur-Events
    $(document).on('keydown', function(e) {
        if (self.state.selectedElementId !== null) {
            self.handleKeyDown(e);
        }
    });
},

/**
 * Mausklick behandeln
 */
handleMouseDown: function(e) {
    e.preventDefault();
    
    // Mausposition relativ zum Canvas
    var mousePos = this.getMousePosition(e);
    
    // Prüfen, ob wir auf einem Resize-Handle sind
    var resizeHandle = this.getResizeHandleAtPosition(mousePos);
    if (resizeHandle) {
        this.state.isResizing = true;
        this.state.currentResizeHandle = resizeHandle;
        this.state.dragStart = mousePos;
        
        var element = this.getElementById(this.state.selectedElementId);
        if (element) {
            this.state.originalSize = {
                width: element.width,
                height: element.height
            };
            this.state.originalPos = {
                x: element.left,
                y: element.top
            };
        }
        return;
    }
    
    // Prüfen, ob wir auf einem Element sind
    var clickedElement = this.getElementAtPosition(mousePos);
    if (clickedElement) {
        // Element auswählen
        this.selectElement(clickedElement.id);
        
        // Drag starten
        this.state.isDragging = true;
        this.state.dragStart = mousePos;
        this.state.originalPos = {
            x: clickedElement.left,
            y: clickedElement.top
        };
    } else {
        // Mittlere Maustaste oder Alt+Klick für Panning
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            this.state.isPanning = true;
            this.state.dragStart = mousePos;
            return;
        }
        
        // Kein Element getroffen, Auswahl aufheben
        this.clearSelection();
    }
},

/**
 * Mausbewegung behandeln
 */
handleMouseMove: function(e) {
    if (!this.state.initialized) return;
    
    // Mausposition relativ zum Canvas
    var mousePos = this.getMousePosition(e);
    
    // Element ziehen
    if (this.state.isDragging && this.state.selectedElementId !== null) {
        var element = this.getElementById(this.state.selectedElementId);
        if (element) {
            // Neue Position berechnen
            var dx = mousePos.x - this.state.dragStart.x;
            var dy = mousePos.y - this.state.dragStart.y;
            
            element.left = this.state.originalPos.x + dx;
            element.top = this.state.originalPos.y + dy;
            
            // Zum Raster einrasten, wenn aktiviert
            if (this.config.snapToGrid) {
                element.left = Math.round(element.left / this.config.gridSize) * this.config.gridSize;
                element.top = Math.round(element.top / this.config.gridSize) * this.config.gridSize;
            }
            
            // Canvas neu zeichnen
            this.redraw();
            
            // UI aktualisieren
            if (typeof YPrintDesignTool.Properties !== 'undefined') {
                YPrintDesignTool.Properties.updatePositionValues(element);
            }
        }
    }
    // Element größenändern
    else if (this.state.isResizing && this.state.selectedElementId !== null) {
        var element = this.getElementById(this.state.selectedElementId);
        if (element && this.state.currentResizeHandle) {
            var dx = mousePos.x - this.state.dragStart.x;
            var dy = mousePos.y - this.state.dragStart.y;
            
            // Je nach Resize-Handle unterschiedlich behandeln
            switch (this.state.currentResizeHandle) {
                case 'nw': // Links oben
                    element.left = this.state.originalPos.x + dx;
                    element.top = this.state.originalPos.y + dy;
                    element.width = this.state.originalSize.width - dx;
                    element.height = this.state.originalSize.height - dy;
                    break;
                case 'ne': // Rechts oben
                    element.top = this.state.originalPos.y + dy;
                    element.width = this.state.originalSize.width + dx;
                    element.height = this.state.originalSize.height - dy;
                    break;
                case 'sw': // Links unten
                    element.left = this.state.originalPos.x + dx;
                    element.width = this.state.originalSize.width - dx;
                    element.height = this.state.originalSize.height + dy;
                    break;
                case 'se': // Rechts unten
                    element.width = this.state.originalSize.width + dx;
                    element.height = this.state.originalSize.height + dy;
                    break;
                case 'n': // Oben Mitte
                    element.top = this.state.originalPos.y + dy;
                    element.height = this.state.originalSize.height - dy;
                    break;
                case 's': // Unten Mitte
                    element.height = this.state.originalSize.height + dy;
                    break;
                case 'w': // Links Mitte
                    element.left = this.state.originalPos.x + dx;
                    element.width = this.state.originalSize.width - dx;
                    break;
                case 'e': // Rechts Mitte
                    element.width = this.state.originalSize.width + dx;
                    break;
            }
            
            // Mindestgröße einhalten
            element.width = Math.max(10, element.width);
            element.height = Math.max(10, element.height);
            
            // Canvas neu zeichnen
            this.redraw();
            
            // UI aktualisieren
            if (typeof YPrintDesignTool.Properties !== 'undefined') {
                YPrintDesignTool.Properties.updateSizeValues(element);
            }
        }
    }
    // Canvas verschieben (Panning)
    else if (this.state.isPanning) {
        var dx = mousePos.x - this.state.dragStart.x;
        var dy = mousePos.y - this.state.dragStart.y;
        
        this.state.panOffset.x += dx;
        this.state.panOffset.y += dy;
        
        this.state.dragStart = mousePos;
        
        this.redraw();
    }
    // Cursor-Stil anpassen (wenn kein Drag/Resize)
    else {
        this.updateCursor(mousePos);
    }
},

/**
 * Maus loslassen behandeln
 */
handleMouseUp: function(e) {
    // Wenn wir ein Element gezogen oder die Größe geändert haben, im Verlauf speichern
    if ((this.state.isDragging || this.state.isResizing) && 
        typeof YPrintDesignTool.addHistoryStep === 'function') {
        YPrintDesignTool.addHistoryStep();
    }
    
    // Zustand zurücksetzen
    this.state.isDragging = false;
    this.state.isResizing = false;
    this.state.isPanning = false;
    this.state.currentResizeHandle = null;
},

/**
 * Mausrad behandeln (für Zoom)
 */
handleWheel: function(e) {
    e.preventDefault();
    
    // Zoom-Faktor berechnen
    var delta = e.originalEvent.deltaY;
    var zoom = this.state.zoom;
    
    if (delta < 0) {
        // Zoom In
        zoom = Math.min(this.config.maxZoom, zoom + this.config.zoomStep);
    } else {
        // Zoom Out
        zoom = Math.max(this.config.minZoom, zoom - this.config.zoomStep);
    }
    
    // Zoom anwenden
    this.setZoom(zoom);
},

/**
 * Tastatureingaben behandeln
 */
handleKeyDown: function(e) {
    var element = this.getElementById(this.state.selectedElementId);
    if (!element) return;
    
    // Pfeiltasten für Verschieben
    switch (e.key) {
        case 'ArrowUp':
            element.top -= e.shiftKey ? 10 : 1;
            break;
        case 'ArrowDown':
            element.top += e.shiftKey ? 10 : 1;
            break;
        case 'ArrowLeft':
            element.left -= e.shiftKey ? 10 : 1;
            break;
        case 'ArrowRight':
            element.left += e.shiftKey ? 10 : 1;
            break;
        default:
            return; // Keine relevante Taste
    }
    
    // Canvas neu zeichnen
    this.redraw();
    
    // UI aktualisieren
    if (typeof YPrintDesignTool.Properties !== 'undefined') {
        YPrintDesignTool.Properties.updatePositionValues(element);
    }
    
    // Im Verlauf speichern
    if (typeof YPrintDesignTool.addHistoryStep === 'function') {
        YPrintDesignTool.addHistoryStep();
    }
    
    // Verhindern, dass die Seite scrollt
    e.preventDefault();
},

/**
 * Cursor-Stil aktualisieren
 */
updateCursor: function(mousePos) {
    // Standard-Cursor
    var cursor = 'default';
    
    // Prüfen, ob wir auf einem Resize-Handle sind
    if (this.state.selectedElementId !== null) {
        var resizeHandle = this.getResizeHandleAtPosition(mousePos);
        if (resizeHandle) {
            switch (resizeHandle) {
                case 'nw':
                case 'se':
                    cursor = 'nwse-resize';
                    break;
                case 'ne':
                case 'sw':
                    cursor = 'nesw-resize';
                    break;
                case 'n':
                case 's':
                    cursor = 'ns-resize';
                    break;
                case 'e':
                case 'w':
                    cursor = 'ew-resize';
                    break;
            }
            this.elements.canvas.css('cursor', cursor);
            return;
        }
    }
    
    // Prüfen, ob wir auf einem Element sind
    var element = this.getElementAtPosition(mousePos);
    if (element) {
        cursor = 'move';
    }
    
    this.elements.canvas.css('cursor', cursor);
},

/**
 * Mausposition relativ zum Canvas ermitteln
 */
getMousePosition: function(e) {
    var canvasRect = this.elements.canvas[0].getBoundingClientRect();
    var x = (e.clientX - canvasRect.left) / this.state.zoom - this.state.panOffset.x;
    var y = (e.clientY - canvasRect.top) / this.state.zoom - this.state.panOffset.y;
    return { x: x, y: y };
},

/**
 * Element an Position ermitteln
 */
getElementAtPosition: function(pos) {
    // Von oben nach unten durch die Elemente gehen (zuletzt gezeichnete zuerst)
    for (var i = this.state.elements.length - 1; i >= 0; i--) {
        var element = this.state.elements[i];
        
        // Gesperrt oder unsichtbar überspringen
        if (element.locked || element.opacity === 0) {
            continue;
        }
        
        // Prüfen, ob der Punkt innerhalb des Elements liegt
        if (this.isPointInElement(pos, element)) {
            return element;
        }
    }
    
    return null;
},

/**
 * Prüft, ob ein Punkt innerhalb eines Elements liegt
 */
isPointInElement: function(point, element) {
    // Element-Grenzen
    var left = element.left;
    var top = element.top;
    var right = element.left + element.width;
    var bottom = element.top + element.height;
    
    // Einfache Bounding-Box-Prüfung
    return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
},

/**
 * Resize-Handle an Position ermitteln
 */
getResizeHandleAtPosition: function(pos) {
    if (this.state.selectedElementId === null) {
        return null;
    }
    
    var element = this.getElementById(this.state.selectedElementId);
    if (!element) {
        return null;
    }
    
    // Handle-Größe
    var handleSize = this.config.resizeHandleSize;
    
    // Element-Grenzen
    var left = element.left;
    var top = element.top;
    var right = element.left + element.width;
    var bottom = element.top + element.height;
    var centerX = left + element.width / 2;
    var centerY = top + element.height / 2;
    
    // Position prüfen
    var distance = handleSize / this.state.zoom;
    
    // Ecken prüfen
    if (Math.abs(pos.x - left) <= distance && Math.abs(pos.y - top) <= distance) {
        return 'nw'; // Links oben
    }
    if (Math.abs(pos.x - right) <= distance && Math.abs(pos.y - top) <= distance) {
        return 'ne'; // Rechts oben
    }
    if (Math.abs(pos.x - left) <= distance && Math.abs(pos.y - bottom) <= distance) {
        return 'sw'; // Links unten
    }
    if (Math.abs(pos.x - right) <= distance && Math.abs(pos.y - bottom) <= distance) {
        return 'se'; // Rechts unten
    }
    
    // Seiten prüfen
    if (Math.abs(pos.x - centerX) <= distance && Math.abs(pos.y - top) <= distance) {
        return 'n'; // Oben
    }
    if (Math.abs(pos.x - centerX) <= distance && Math.abs(pos.y - bottom) <= distance) {
        return 's'; // Unten
    }
    if (Math.abs(pos.x - left) <= distance && Math.abs(pos.y - centerY) <= distance) {
        return 'w'; // Links
    }
    if (Math.abs(pos.x - right) <= distance && Math.abs(pos.y - centerY) <= distance) {
        return 'e'; // Rechts
    }
    
    return null;
},

/**
 * Element per ID finden
 */
getElementById: function(id) {
    for (var i = 0; i < this.state.elements.length; i++) {
        if (this.state.elements[i].id === id) {
            return this.state.elements[i];
        }
    }
    return null;
},

/**
 * Element zur Canvas hinzufügen
 */
addElement: function(element, select) {
    // Standardwert für select
    select = select !== undefined ? select : true;
    
    // Element hinzufügen
    this.state.elements.push(element);
    
    // Bild vorausladen, damit es im Canvas angezeigt werden kann
    if (element.type === 'image' || element.type === 'svg') {
        this.preloadImage(element);
    }
    
    // Element auswählen, wenn gewünscht
    if (select) {
        this.selectElement(element.id);
    }
    
    // Canvas neu zeichnen
    this.redraw();
    
    return element;
},

/**
 * Bild vorladen
 */
preloadImage: function(element) {
    var self = this;
    var img = new Image();
    
    img.onload = function() {
        // Originalgröße speichern, falls noch nicht gesetzt
        if (!element.originalWidth || !element.originalHeight) {
            element.originalWidth = this.width;
            element.originalHeight = this.height;
        }
        
        // Wenn keine Größe gesetzt ist, Standardgröße verwenden
        if (!element.width || !element.height) {
            element.width = element.originalWidth;
            element.height = element.originalHeight;
        }
        
        // Bild dem Element zuweisen
        element.image = this;
        
        // Canvas neu zeichnen
        self.redraw();
    };
    
    img.src = element.src;
},

/**
 * Element löschen
 */
removeElement: function(id) {
    for (var i = 0; i < this.state.elements.length; i++) {
        if (this.state.elements[i].id === id) {
            this.state.elements.splice(i, 1);
            
            // Wenn das gelöschte Element ausgewählt war, Auswahl aufheben
            if (this.state.selectedElementId === id) {
                this.clearSelection();
            }
            
            // Canvas neu zeichnen
            this.redraw();
            return true;
        }
    }
    return false;
},

/**
 * Alle Elemente mit bestimmter Dateireferenz löschen
 */
removeElementsByFileReference: function(fileId) {
    var removed = false;
    for (var i = this.state.elements.length - 1; i >= 0; i--) {
        if (this.state.elements[i].fileReference === fileId) {
            
            // Wenn das gelöschte Element ausgewählt war, Auswahl aufheben
            if (this.state.selectedElementId === this.state.elements[i].id) {
                this.clearSelection();
            }
            
            this.state.elements.splice(i, 1);
            removed = true;
        }
    }
    
    if (removed) {
        // Canvas neu zeichnen
        this.redraw();
    }
    
    return removed;
},

/**
 * Alle Elemente löschen
 */
removeAllElements: function() {
    this.state.elements = [];
    this.clearSelection();
    this.redraw();
},

/**
 * Element auswählen
 */
selectElement: function(id) {
    // Gleiche ID bereits ausgewählt?
    if (this.state.selectedElementId === id) {
        return;
    }
    
    this.state.selectedElementId = id;
    
    // Element an das Ende der Liste verschieben (damit es im Vordergrund ist)
    var selectedIndex = -1;
    for (var i = 0; i < this.state.elements.length; i++) {
        if (this.state.elements[i].id === id) {
            selectedIndex = i;
            break;
        }
    }
    
    if (selectedIndex >= 0) {
        var element = this.state.elements[selectedIndex];
        this.state.elements.splice(selectedIndex, 1);
        this.state.elements.push(element);
        
        // Eigenschaften im UI aktualisieren
        if (typeof YPrintDesignTool.Properties !== 'undefined') {
            YPrintDesignTool.Properties.showElementProperties(element);
        }
    }
    
    // Canvas neu zeichnen
    this.redraw();
},

/**
 * Auswahl aufheben
 */
clearSelection: function() {
    this.state.selectedElementId = null;
    
    // Eigenschaften im UI aktualisieren
    if (typeof YPrintDesignTool.Properties !== 'undefined') {
        YPrintDesignTool.Properties.hideElementProperties();
    }
    
    // Canvas neu zeichnen
    this.redraw();
},

/**
 * Ausgewähltes Element abrufen
 */
getSelectedElement: function() {
    if (this.state.selectedElementId === null) {
        return null;
    }
    
    return this.getElementById(this.state.selectedElementId);
},

/**
 * Alle Elemente abrufen
 */
getAllElements: function() {
    return JSON.parse(JSON.stringify(this.state.elements));
},

/**
 * Canvas neu zeichnen
 */
redraw: function() {
    var ctx = this.elements.ctx;
    if (!ctx) return;
    
    // Canvas löschen
    ctx.clearRect(0, 0, this.config.width, this.config.height);
    
    // Transformation anwenden (Zoom und Pan)
    ctx.save();
    ctx.translate(this.state.panOffset.x, this.state.panOffset.y);
    ctx.scale(this.state.zoom, this.state.zoom);
    
    // Hintergrund zeichnen
    this.drawBackground(ctx);
    
    // Raster zeichnen, wenn aktiviert
    if (this.config.showGrid) {
        this.drawGrid(ctx);
    }
    
    // Elemente zeichnen
    this.drawElements(ctx);
    
    // Transformation zurücksetzen
    ctx.restore();
},

/**
 * Hintergrund zeichnen
 */
drawBackground: function(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, this.config.width, this.config.height);
},

/**
 * Raster zeichnen
 */
drawGrid: function(ctx) {
    var gridSize = this.config.gridSize;
    var width = this.config.width;
    var height = this.config.height;
    
    ctx.beginPath();
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    // Vertikale Linien
    for (var x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }
    
    // Horizontale Linien
    for (var y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    
    ctx.stroke();
},

/**
 * Elemente zeichnen
 */
drawElements: function(ctx) {
    var self = this;
    
    // Alle Elemente zeichnen
    this.state.elements.forEach(function(element) {
        self.drawElement(ctx, element);
    });
    
    // Auswahlrahmen für das ausgewählte Element zeichnen
    if (this.state.selectedElementId !== null) {
        var selectedElement = this.getElementById(this.state.selectedElementId);
        if (selectedElement) {
            this.drawSelectionFrame(ctx, selectedElement);
        }
    }
},

/**
 * Ein Element zeichnen
 */
drawElement: function(ctx, element) {
    // Element unsichtbar? Dann überspringen
    if (element.opacity === 0) {
        return;
    }
    
    ctx.save();
    
    // Transformation anwenden
    ctx.globalAlpha = element.opacity !== undefined ? element.opacity : 1;
    
    // Position und Rotation
    ctx.translate(element.left + element.width / 2, element.top + element.height / 2);
    if (element.rotation) {
        ctx.rotate(element.rotation * Math.PI / 180);
    }
    ctx.translate(-element.width / 2, -element.height / 2);
    
    // Je nach Elementtyp zeichnen
    switch (element.type) {
        case 'image':
        case 'svg':
            this.drawImageElement(ctx, element);
            break;
        case 'text':
            this.drawTextElement(ctx, element);
            break;
        case 'rect':
            this.drawRectElement(ctx, element);
            break;
        case 'ellipse':
            this.drawEllipseElement(ctx, element);
            break;
    }
    
    ctx.restore();
},

/**
 * Ein Bild zeichnen
 */
drawImageElement: function(ctx, element) {
    // Bild noch nicht geladen?
    if (!element.image) {
        return;
    }
    
    // Bild zeichnen
    try {
        ctx.drawImage(element.image, 0, 0, element.width, element.height);
    } catch (e) {
        console.error('Fehler beim Zeichnen des Bildes:', e);
    }
},

/**
 * Ein Textelement zeichnen
 */
drawTextElement: function(ctx, element) {
    ctx.fillStyle = element.color || '#000000';
    ctx.font = (element.fontSize || 16) + 'px ' + (element.fontFamily || 'Arial');
    ctx.textBaseline = 'top';
    
    // Text mit Zeilenumbrüchen
    var lines = element.text.split('\n');
    var lineHeight = element.fontSize * 1.2;
    
    lines.forEach(function(line, index) {
        ctx.fillText(line, 0, index * lineHeight);
    });
},

/**
 * Ein Rechteck zeichnen
 */
drawRectElement: function(ctx, element) {
    if (element.fillColor) {
        ctx.fillStyle = element.fillColor;
        ctx.fillRect(0, 0, element.width, element.height);
    }
    
    if (element.strokeColor) {
        ctx.strokeStyle = element.strokeColor;
        ctx.lineWidth = element.strokeWidth || 1;
        ctx.strokeRect(0, 0, element.width, element.height);
    }
},

/**
 * Eine Ellipse zeichnen
 */
drawEllipseElement: function(ctx, element) {
    var centerX = element.width / 2;
    var centerY = element.height / 2;
    var radiusX = element.width / 2;
    var radiusY = element.height / 2;
    
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    
    if (element.fillColor) {
        ctx.fillStyle = element.fillColor;
        ctx.fill();
    }
    
    if (element.strokeColor) {
        ctx.strokeStyle = element.strokeColor;
        ctx.lineWidth = element.strokeWidth || 1;
        ctx.stroke();
    }
},

/**
 * Auswahlrahmen zeichnen
 */
drawSelectionFrame: function(ctx, element) {
    // Rahmen zeichnen
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 2 / this.state.zoom;
    ctx.strokeRect(element.left, element.top, element.width, element.height);
    
    // Resize-Handles zeichnen
    this.drawResizeHandles(ctx, element);
},

/**
 * Resize-Handles zeichnen
 */
drawResizeHandles: function(ctx, element) {
    var handleSize = this.config.resizeHandleSize / this.state.zoom;
    var halfSize = handleSize / 2;
    
// Element-
var handleSize = this.config.resizeHandleSize / this.state.zoom;
var halfSize = handleSize / 2;

// Element-Grenzen
var left = element.left;
var top = element.top;
var right = element.left + element.width;
var bottom = element.top + element.height;
var centerX = left + element.width / 2;
var centerY = top + element.height / 2;

ctx.fillStyle = '#ffffff';
ctx.strokeStyle = '#2196F3';
ctx.lineWidth = 1 / this.state.zoom;

// Ecken
this.drawHandle(ctx, left, top, handleSize); // Links oben
this.drawHandle(ctx, right, top, handleSize); // Rechts oben
this.drawHandle(ctx, left, bottom, handleSize); // Links unten
this.drawHandle(ctx, right, bottom, handleSize); // Rechts unten

// Seiten
this.drawHandle(ctx, centerX, top, handleSize); // Oben Mitte
this.drawHandle(ctx, centerX, bottom, handleSize); // Unten Mitte
this.drawHandle(ctx, left, centerY, handleSize); // Links Mitte
this.drawHandle(ctx, right, centerY, handleSize); // Rechts Mitte
},

/**
* Einen Resize-Handle zeichnen
*/
drawHandle: function(ctx, x, y, size) {
var halfSize = size / 2;
ctx.fillRect(x - halfSize, y - halfSize, size, size);
ctx.strokeRect(x - halfSize, y - halfSize, size, size);
},

/**
* Zoom setzen
*/
setZoom: function(zoom) {
this.state.zoom = zoom;
this.redraw();

// Zoom-UI aktualisieren
if (typeof YPrintDesignTool.elements !== 'undefined' && 
    YPrintDesignTool.elements.zoomResetButton) {
    YPrintDesignTool.elements.zoomResetButton.text(Math.round(zoom * 100) + '%');
}
},

/**
* Zoom zurücksetzen
*/
zoomReset: function() {
this.setZoom(1);
this.state.panOffset = { x: 0, y: 0 };
this.redraw();
},

/**
* Zoom hinein
*/
zoomIn: function() {
var newZoom = Math.min(this.config.maxZoom, this.state.zoom + this.config.zoomStep);
this.setZoom(newZoom);
},

/**
* Zoom heraus
*/
zoomOut: function() {
var newZoom = Math.max(this.config.minZoom, this.state.zoom - this.config.zoomStep);
this.setZoom(newZoom);
},

/**
* Element löschen
*/
deleteElement: function(id) {
return this.removeElement(id);
},

/**
* Element duplizieren
*/
duplicateElement: function(id) {
var element = this.getElementById(id);
if (!element) return null;

// Tiefe Kopie erstellen
var newElement = JSON.parse(JSON.stringify(element));

// Neue ID setzen
newElement.id = 'element-' + (new Date().getTime());

// Position leicht versetzen
newElement.left += 20;
newElement.top += 20;

// Wenn es sich um ein Bild handelt, Bild vorausladen
if (newElement.type === 'image' || newElement.type === 'svg') {
    this.preloadImage(newElement);
}

// Zum Canvas hinzufügen
this.state.elements.push(newElement);

// Neues Element auswählen
this.selectElement(newElement.id);

// Canvas neu zeichnen
this.redraw();

return newElement;
}
};

})(jQuery);
/**
 * YPrint SVG Path Utilities
 * 
 * Frontend-Funktionen für SVG-Pfadmanipulationen
 */

(function($) {
    'use strict';
    
    var YPrintSVGPath = {
        /**
         * Initialisiert die SVG-Pfad-Funktionen
         */
        init: function() {
            this.bindEvents();
        },
        
        /**
         * Bindet Event-Listener
         */
        bindEvents: function() {
            // Event-Listener für Pfadoperationen
            $(document).on('click', '.yprint-svg-path-operation', this.handlePathOperation);
        },
        
        /**
         * Behandelt Pfadoperationen
         */
        handlePathOperation: function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var operation = $button.data('operation');
            
            switch (operation) {
                case 'combine':
                    YPrintSVGPath.combinePaths();
                    break;
                case 'break-apart':
                    YPrintSVGPath.breakApart();
                    break;
                case 'to-path':
                    YPrintSVGPath.convertShapeToPath();
                    break;
                case 'reverse':
                    YPrintSVGPath.reversePath();
                    break;
                case 'enhance-lines':
                    YPrintSVGPath.enhanceLines();
                    break;
            }
        },
        
        /**
         * Kombiniert ausgewählte Pfade
         */
        combinePaths: function() {
            // Ausgewählte SVG-Pfade abrufen
            var selectedPaths = this.getSelectedSVGPaths();
            
            if (selectedPaths.length < 2) {
                alert('Bitte wähle mindestens zwei Pfade aus.');
                return;
            }
            
            // REST-API-Aufruf für die Pfadkombination
            $.ajax({
                url: YPrintSVGPathData.restUrl + 'combine-paths',
                method: 'POST',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', YPrintSVGPathData.nonce);
                },
                data: {
                    paths: selectedPaths
                },
                success: function(response) {
                    if (response.success) {
                        // Aktualisieren der SVG-Anzeige mit dem kombinierten Pfad
                        YPrintSVGPath.updateSVGDisplay(response.combined_path);
                    } else {
                        alert('Fehler beim Kombinieren der Pfade: ' + response.message);
                    }
                },
                error: function() {
                    alert('Fehler bei der Serveranfrage');
                }
            });
        },
        
        /**
         * Bricht einen ausgewählten Pfad in Teilpfade auf
         */
        breakApart: function() {
            // Aktuellen SVG-Pfad abrufen
            var svgPath = this.getSelectedSVGPath();
            
            if (!svgPath) {
                alert('Bitte wähle einen Pfad aus.');
                return;
            }
            
            // REST-API-Aufruf für das Aufbrechen des Pfads
            $.ajax({
                url: YPrintSVGPathData.restUrl + 'break-apart',
                method: 'POST',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', YPrintSVGPathData.nonce);
                },
                data: {
                    path: svgPath
                },
                success: function(response) {
                    if (response.success) {
                        // Aktualisieren der SVG-Anzeige mit den aufgebrochenen Pfaden
                        YPrintSVGPath.updateSVGDisplayWithMultiplePaths(response.paths);
                    } else {
                        alert('Fehler beim Aufbrechen des Pfads: ' + response.message);
                    }
                },
                error: function() {
                    alert('Fehler bei der Serveranfrage');
                }
            });
        },
        
        /**
         * Konvertiert eine ausgewählte Form in einen Pfad
         */
        convertShapeToPath: function() {
            // Aktuelle SVG-Form abrufen
            var svgShape = this.getSelectedSVGShape();
            
            if (!svgShape) {
                alert('Bitte wähle eine Form aus (Rechteck, Kreis, Ellipse, Linie, Polygon, Polyline).');
                return;
            }
            
            // REST-API-Aufruf für die Konvertierung der Form in einen Pfad
            $.ajax({
                url: YPrintSVGPathData.restUrl + 'shape-to-path',
                method: 'POST',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', YPrintSVGPathData.nonce);
                },
                data: {
                    shape: svgShape
                },
                success: function(response) {
                    if (response.success) {
                        // Aktualisieren der SVG-Anzeige mit dem Pfad
                        YPrintSVGPath.updateSVGDisplay(response.path);
                    } else {
                        alert('Fehler bei der Konvertierung der Form: ' + response.message);
                    }
                },
                error: function() {
                    alert('Fehler bei der Serveranfrage');
                }
            });
        },
        
        /**
         * Kehrt einen ausgewählten Pfad um
         */
        reversePath: function() {
            // Aktuellen SVG-Pfad abrufen
            var svgPath = this.getSelectedSVGPath();
            
            if (!svgPath) {
                alert('Bitte wähle einen Pfad aus.');
                return;
            }
            
            // REST-API-Aufruf für das Umkehren des Pfads
            $.ajax({
                url: YPrintSVGPathData.restUrl + 'reverse-path',
                method: 'POST',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', YPrintSVGPathData.nonce);
                },
                data: {
                    path: svgPath
                },
                success: function(response) {
                    if (response.success) {
                        // Aktualisieren der SVG-Anzeige mit dem umgekehrten Pfad
                        YPrintSVGPath.updateSVGDisplay(response.reversed_path);
                    } else {
                        alert('Fehler beim Umkehren des Pfads: ' + response.message);
                    }
                },
                error: function() {
                    alert('Fehler bei der Serveranfrage');
                }
            });
        },
        
        /**
         * Verstärkt Linien im ausgewählten Pfad
         */
        enhanceLines: function() {
            // Aktuellen SVG-Pfad abrufen
            var svgPath = this.getSelectedSVGPath();
            
            if (!svgPath) {
                alert('Bitte wähle einen Pfad aus.');
                return;
            }
            
            // Stärke abfragen
            var thickness = prompt('Liniendicke eingeben (Pixel):', '2');
            
            if (!thickness) return;
            
            // REST-API-Aufruf für die Linienverstärkung
            $.ajax({
                url: YPrintSVGPathData.restUrl + 'enhance-lines',
                method: 'POST',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', YPrintSVGPathData.nonce);
                },
                data: {
                    path: svgPath,
                    thickness: parseFloat(thickness)
                },
                success: function(response) {
                    if (response.success) {
                        // Aktualisieren der SVG-Anzeige mit verstärkten Linien
                        YPrintSVGPath.updateSVGDisplay(response.enhanced_path);
                    } else {
                        alert('Fehler beim Verstärken der Linien: ' + response.message);
                    }
                },
                error: function() {
                    alert('Fehler bei der Serveranfrage');
                }
            });
        },
        
        /**
         * Hilfsfunktionen für SVG-Manipulation
         */
        
        /**
         * Gibt den aktuell ausgewählten SVG-Pfad zurück
         */
        getSelectedSVGPath: function() {
            // In der Praxis müsste hier die Logik implementiert werden,
            // um den aktuell ausgewählten Pfad aus der SVG-Vorschau zu ermitteln
            
            // Für Demo-Zwecke verwenden wir hier die SVG-Vorschau
            var $svgPreview = $('.yprint-svg-preview');
            var $svgElement = $svgPreview.find('svg path').first();
            
            if ($svgElement.length === 0) {
                return null;
            }
            
            // Den kompletten SVG-Pfad zurückgeben
            return '<path ' + this.getAllAttributes($svgElement[0]) + ' />';
        },
        
        /**
         * Gibt mehrere ausgewählte SVG-Pfade zurück
         */
        getSelectedSVGPaths: function() {
            // In der Praxis müsste hier die Logik implementiert werden,
            // um die aktuell ausgewählten Pfade aus der SVG-Vorschau zu ermitteln
            
            // Für Demo-Zwecke verwenden wir hier alle Pfade aus der SVG-Vorschau
            var $svgPreview = $('.yprint-svg-preview');
            var $paths = $svgPreview.find('svg path');
            var paths = [];
            
            $paths.each(function() {
                paths.push('<path ' + YPrintSVGPath.getAllAttributes(this) + ' />');
            });
            
            return paths;
        },
        
        /**
         * Gibt die aktuell ausgewählte SVG-Form zurück
         */
        getSelectedSVGShape: function() {
            // In der Praxis müsste hier die Logik implementiert werden,
            // um die aktuell ausgewählte Form aus der SVG-Vorschau zu ermitteln
            
            // Für Demo-Zwecke verwenden wir hier die erste Form aus der SVG-Vorschau
            var $svgPreview = $('.yprint-svg-preview');
            var $shape = $svgPreview.find('svg rect, svg circle, svg ellipse, svg line, svg polygon, svg polyline').first();
            
            if ($shape.length === 0) {
                return null;
            }
            
            // Die komplette SVG-Form zurückgeben
            var tagName = $shape[0].tagName.toLowerCase();
            return '<' + tagName + ' ' + this.getAllAttributes($shape[0]) + ' />';
        },
        
        /**
         * Gibt alle Attribute eines Elements als String zurück
         */
        getAllAttributes: function(element) {
            var attributes = '';
            
            for (var i = 0; i < element.attributes.length; i++) {
                var attr = element.attributes[i];
                attributes += attr.name + '="' + attr.value + '" ';
            }
            
            return attributes.trim();
        },
        
        /**
         * Aktualisiert die SVG-Anzeige mit einem neuen Pfad
         */
        updateSVGDisplay: function(svgContent) {
            // In der Praxis müsste hier die Logik implementiert werden,
            // um die SVG-Vorschau mit dem neuen Pfad zu aktualisieren
            
            // Für Demo-Zwecke nur eine Meldung ausgeben
            console.log('SVG-Anzeige aktualisiert mit:', svgContent);
            alert('SVG-Pfad wurde erfolgreich aktualisiert.');
            
            // Hier könnte die SVG-Anzeige aktualisiert werden, z.B.:
            // $('.yprint-svg-preview').html(svgContent);
        },
        
        /**
         * Aktualisiert die SVG-Anzeige mit mehreren Pfaden
         */
        updateSVGDisplayWithMultiplePaths: function(paths) {
            // In der Praxis müsste hier die Logik implementiert werden,
            // um die SVG-Vorschau mit den neuen Pfaden zu aktualisieren
            
            // Für Demo-Zwecke nur eine Meldung ausgeben
            console.log('SVG-Anzeige aktualisiert mit mehreren Pfaden:', paths);
            alert('SVG-Pfad wurde erfolgreich in ' + paths.length + ' Teilpfade aufgebrochen.');
            
            // Hier könnte die SVG-Anzeige aktualisiert werden, z.B.:
            // var svgContent = '<svg>...' + paths.join('') + '</svg>';
            // $('.yprint-svg-preview').html(svgContent);
        }
    };
    
    // Initialisierung beim Dokument-Ready
    $(document).ready(function() {
        // Nur initialisieren, wenn die SVG-Pfad-Operationen verfügbar sind
        if (typeof YPrintSVGPathData !== 'undefined') {
            YPrintSVGPath.init();
        }
    });
    
    // Globalen Namespace für YPrintSVGPath bereitstellen
    window.YPrintSVGPath = YPrintSVGPath;

})(jQuery);
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
        
        // Hilfsfunktionen für SVG-Manipulation
        
/**
 * Gibt den aktuell ausgewählten SVG-Pfad zurück
 */
getSelectedSVGPath: function() {
    // SVG-Vorschau finden, entweder original oder optimiert
    var $svgContainer = $('#yprint-svg-preview-container, #yprint-svg-optimized-preview-container').filter(':visible');
    
    if (!$svgContainer.length) {
        console.log('Keine sichtbare SVG-Vorschau gefunden');
        return null;
    }
    
    var $svgElement = $svgContainer.find('svg path').first();
    
    if ($svgElement.length === 0) {
        console.log('Kein SVG-Pfad in der Vorschau gefunden');
        return null;
    }
    
    // Den kompletten SVG-Pfad zurückgeben
    return '<path ' + this.getAllAttributes($svgElement[0]) + ' />';
},
        
        /**
 * Gibt mehrere ausgewählte SVG-Pfade zurück
 */
getSelectedSVGPaths: function() {
    // SVG-Vorschau finden, entweder original oder optimiert
    var $svgContainer = $('#yprint-svg-preview-container, #yprint-svg-optimized-preview-container').filter(':visible');
    
    if (!$svgContainer.length) {
        console.log('Keine sichtbare SVG-Vorschau gefunden');
        return [];
    }
    
    var $paths = $svgContainer.find('svg path');
    var paths = [];
    
    if ($paths.length === 0) {
        console.log('Keine SVG-Pfade in der Vorschau gefunden');
        return [];
    }
    
    $paths.each(function() {
        paths.push('<path ' + YPrintSVGPath.getAllAttributes(this) + ' />');
    });
    
    return paths;
},
        
        /**
 * Gibt die aktuell ausgewählte SVG-Form zurück
 */
getSelectedSVGShape: function() {
    // SVG-Vorschau finden, entweder original oder optimiert
    var $svgContainer = $('#yprint-svg-preview-container, #yprint-svg-optimized-preview-container').filter(':visible');
    
    if (!$svgContainer.length) {
        console.log('Keine sichtbare SVG-Vorschau gefunden');
        return null;
    }
    
    var $shape = $svgContainer.find('svg rect, svg circle, svg ellipse, svg line, svg polygon, svg polyline').first();
    
    if ($shape.length === 0) {
        console.log('Keine SVG-Form in der Vorschau gefunden');
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
    // SVG-Vorschau finden, entweder original oder optimiert
    var $svgContainer = $('#yprint-svg-preview-container, #yprint-svg-optimized-preview-container').filter(':visible');
    
    if (!$svgContainer.length) {
        console.log('Keine sichtbare SVG-Vorschau gefunden');
        alert('Keine SVG-Vorschau gefunden, in der der aktualisierte Pfad angezeigt werden könnte.');
        return;
    }
    
    // Aktuelle SVG-Instanz holen
    var svgPreviewInstance = $svgContainer.data('yprintSVGPreview');
    
    if (!svgPreviewInstance) {
        console.log('Keine SVG-Vorschau-Instanz gefunden');
        alert('Fehler: SVG-Vorschau-Instanz nicht gefunden.');
        return;
    }
    
    // Aktualisiere die SVG in der Vorschau
    svgPreviewInstance.loadSVG(svgContent);
    
    // Meldung anzeigen
    console.log('SVG-Anzeige aktualisiert mit:', svgContent);
    alert('SVG-Pfad wurde erfolgreich aktualisiert.');
    
    // Die SVG-Pfad-Nachricht anzeigen
    $('.yprint-svg-path-result').show();
    $('.yprint-svg-path-message').html('SVG-Pfad erfolgreich aktualisiert.');
},
        
        /**
 * Aktualisiert die SVG-Anzeige mit mehreren Pfaden
 */
updateSVGDisplayWithMultiplePaths: function(paths) {
    // SVG-Vorschau finden, entweder original oder optimiert
    var $svgContainer = $('#yprint-svg-preview-container, #yprint-svg-optimized-preview-container').filter(':visible');
    
    if (!$svgContainer.length) {
        console.log('Keine sichtbare SVG-Vorschau gefunden');
        alert('Keine SVG-Vorschau gefunden, in der die aktualisierten Pfade angezeigt werden könnten.');
        return;
    }
    
    // Aktuelle SVG-Instanz holen
    var svgPreviewInstance = $svgContainer.data('yprintSVGPreview');
    
    if (!svgPreviewInstance) {
        console.log('Keine SVG-Vorschau-Instanz gefunden');
        alert('Fehler: SVG-Vorschau-Instanz nicht gefunden.');
        return;
    }
    
    // Bestehende SVG finden und die Pfade hinzufügen
    var $svg = $svgContainer.find('svg').first();
    
    if ($svg.length === 0) {
        console.log('Kein SVG-Element in der Vorschau gefunden');
        alert('Fehler: Kein SVG-Element gefunden, in das die Pfade eingefügt werden könnten.');
        return;
    }
    
    // SVG-Attribute erhalten
    var svgAttributes = '';
    $.each($svg[0].attributes, function() {
        if (this.specified && this.name !== 'xmlns') {
            svgAttributes += ' ' + this.name + '="' + this.value + '"';
        }
    });
    
    // Neuen SVG-Inhalt erstellen
    var svgContent = '<svg xmlns="http://www.w3.org/2000/svg"' + svgAttributes + '>';
    
    // Alle Pfade hinzufügen
    svgContent += paths.join('');
    
    // SVG schließen
    svgContent += '</svg>';
    
    // Aktualisiere die SVG in der Vorschau
    svgPreviewInstance.loadSVG(svgContent);
    
    // Meldung anzeigen
    console.log('SVG-Anzeige aktualisiert mit mehreren Pfaden:', paths);
    alert('SVG-Pfad wurde erfolgreich in ' + paths.length + ' Teilpfade aufgebrochen.');
    
    // Die SVG-Pfad-Nachricht anzeigen
    $('.yprint-svg-path-result').show();
    $('.yprint-svg-path-message').html('SVG-Pfad erfolgreich in ' + paths.length + ' Teilpfade aufgebrochen.');
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
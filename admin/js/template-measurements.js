/**
 * YPrint Template Measurements - Eindeutige Version ohne Konflikte
 */

console.log('🎯 YPrint Template Measurements JavaScript wird geladen...');

// Prüfe ob bereits geladen
if (typeof window.YPrintTemplateMeasurements !== 'undefined') {
    console.log('⚠️ YPrintTemplateMeasurements bereits geladen, überspringe');
} else {

class YPrintTemplateMeasurements {
    constructor() {
        console.log('🎯 YPrintTemplateMeasurements Constructor aufgerufen');
        this.currentViewId = null;
        this.measurementMode = false;
        this.tempPoints = [];
        this.colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];
        this.colorIndex = 0;
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) {
            console.log('⚠️ Already initialized, skipping');
            return;
        }
        
        console.log('🎯 YPrintTemplateMeasurements init() aufgerufen');
        this.isInitialized = true;
        
        // Sofortiger DOM-Check
        this.checkDOM();
        
        // Event-Listeners mit Namespace
        document.addEventListener('click', (e) => {
            this.handleClick(e);
        }, { passive: false });
        
        console.log('🎯 Event listeners attached');
    }
    
    handleClick(e) {
        console.log('🎯 Click Event detected:', e.target.tagName, e.target.className);
        
        // Check für Add Measurement Button - multiple Methoden
        const isAddButton = this.isAddMeasurementButton(e.target);
        
        if (isAddButton) {
            console.log('🎯 Add Measurement Button clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            // Finde viewId
            const viewId = this.findViewId(e.target);
            
            if (viewId) {
                console.log('🎯 Found viewId:', viewId);
                this.startMeasurement(viewId);
            } else {
                console.log('🎯 No viewId found, starting generic measurement');
                this.startMeasurement('generic');
            }
            return;
        }
        
        // Bild-Klick für Punkt-Platzierung
        if (e.target.tagName === 'IMG' && this.measurementMode) {
            console.log('🎯 Image clicked in measurement mode!', e.target.src);
            e.preventDefault();
            e.stopPropagation();
            this.addMeasurementPoint(e);
        }
    }
    
    isAddMeasurementButton(element) {
        // Mehrere Erkennungsmethoden
        if (!element) return false;
        
        // 1. Direkte Text-Prüfung
        if (element.textContent && element.textContent.includes('Add Measurement')) {
            return true;
        }
        
        // 2. HTML-Inhalt prüfen
        if (element.innerHTML && element.innerHTML.includes('Add Measurement')) {
            return true;
        }
        
        // 3. Klassen prüfen
        if (element.className && element.className.includes('add-measurement')) {
            return true;
        }
        
        // 4. Parent-Element prüfen
        const parent = element.closest('button');
        if (parent && (parent.textContent.includes('Add Measurement') || 
                      parent.innerHTML.includes('Add Measurement'))) {
            return true;
        }
        
        // 5. Plus-Symbol mit Measurement-Kontext
        if (element.innerHTML && element.innerHTML.includes('plus') && 
            element.closest('*').textContent.includes('Measurement')) {
            return true;
        }
        
        return false;
    }
    
    findViewId(element) {
        // Suche viewId in verschiedenen Attributen
        let current = element;
        let attempts = 0;
        
        while (current && current !== document && attempts < 10) {
            // data-view-id direkt
            if (current.dataset && current.dataset.viewId) {
                return current.dataset.viewId;
            }
            
            // data-view-id als Attribut
            if (current.getAttribute && current.getAttribute('data-view-id')) {
                return current.getAttribute('data-view-id');
            }
            
            // In Geschwister-Elementen suchen
            if (current.parentElement) {
                const siblings = current.parentElement.querySelectorAll('[data-view-id]');
                if (siblings.length > 0) {
                    return siblings[0].dataset.viewId || siblings[0].getAttribute('data-view-id');
                }
            }
            
            current = current.parentElement;
            attempts++;
        }
        
        // Fallback: Suche nach img mit data-view-id in der Nähe
        const nearbyImages = document.querySelectorAll('img[data-view-id]');
        if (nearbyImages.length > 0) {
            console.log('🎯 Using fallback viewId from nearby image');
            return nearbyImages[0].dataset.viewId || nearbyImages[0].getAttribute('data-view-id');
        }
        
        return null;
    }
    
    checkDOM() {
        console.log('🎯 Checking DOM structure...');
        
        // Suche nach Add Measurement Buttons
        const allButtons = document.querySelectorAll('button, .button, [role="button"]');
        let measurementButtons = [];
        
        allButtons.forEach(btn => {
            if (this.isAddMeasurementButton(btn)) {
                measurementButtons.push(btn);
            }
        });
        
        console.log('🎯 Found potential measurement buttons:', measurementButtons.length);
        measurementButtons.forEach((btn, index) => {
            console.log(`  Button ${index}:`, {
                text: btn.textContent.substring(0, 50),
                html: btn.innerHTML.substring(0, 100),
                className: btn.className
            });
        });
        
        // Suche nach Bildern
        const images = document.querySelectorAll('img');
        console.log('🎯 Found images:', images.length);
        
        let measurementImages = [];
        images.forEach((img, index) => {
            const hasViewId = img.dataset.viewId || img.getAttribute('data-view-id');
            const isInMeasurementContext = img.closest('*').textContent.includes('Measurement');
            
            if (hasViewId || isInMeasurementContext) {
                measurementImages.push(img);
                console.log(`  Measurement Image ${measurementImages.length}:`, {
                    src: img.src.substring(img.src.lastIndexOf('/') + 1),
                    viewId: hasViewId,
                    context: isInMeasurementContext
                });
            }
        });
        
        console.log('🎯 Total measurement-relevant images:', measurementImages.length);
    }
    
    startMeasurement(viewId) {
        console.log('🎯 Starting measurement for view:', viewId);
        this.currentViewId = viewId;
        this.measurementMode = true;
        this.tempPoints = [];
        
        // Visuelles Feedback
        this.showMeasurementMode(true);
        
        // User-Feedback
        this.showNotification('Messungs-Modus aktiviert!\n\nKlicken Sie nun 2 Punkte auf ein Bild um eine Messung zu erstellen.', 'info');
    }
    
    showMeasurementMode(active) {
        // Cursor für alle Bilder ändern
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (active) {
                img.style.cursor = 'crosshair';
                img.style.border = '2px dashed #007cba';
                img.title = 'Klicken Sie 2 Punkte für Messung';
            } else {
                img.style.cursor = '';
                img.style.border = '';
                img.title = '';
            }
        });
        
        // Button-Text ändern
        const buttons = document.querySelectorAll('button, .button');
        buttons.forEach(btn => {
            if (this.isAddMeasurementButton(btn)) {
                if (active) {
                    btn.style.background = '#ffc107';
                    btn.textContent = 'Klicken Sie 2 Punkte auf Bild...';
                } else {
                    btn.style.background = '';
                    btn.innerHTML = btn.innerHTML.replace('Klicken Sie 2 Punkte auf Bild...', '+ Add Measurement');
                }
            }
        });
    }
    
    addMeasurementPoint(event) {
        console.log('🎯 Adding measurement point:', this.tempPoints.length + 1);
        
        if (!this.measurementMode || this.tempPoints.length >= 2) return;
        
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Skaliere auf tatsächliche Bildgröße
        const scaleX = event.target.naturalWidth / rect.width;
        const scaleY = event.target.naturalHeight / rect.height;
        
        const point = {
            x: Math.round(x * scaleX),
            y: Math.round(y * scaleY),
            displayX: x,
            displayY: y
        };
        
        this.tempPoints.push(point);
        console.log('🎯 Point added:', point, 'Total points:', this.tempPoints.length);
        
        // Visueller Punkt
        this.drawPoint(event.target, point, this.tempPoints.length);
        
        if (this.tempPoints.length === 2) {
            setTimeout(() => {
                this.completeMeasurement();
            }, 100);
        }
    }
    
    drawPoint(imageElement, point, index) {
        // Erstelle visuellen Punkt
        const pointElement = document.createElement('div');
        pointElement.style.cssText = `
            position: absolute;
            left: ${point.displayX - 6}px;
            top: ${point.displayY - 6}px;
            width: 12px;
            height: 12px;
            background: #ff4444;
            border: 2px solid white;
            border-radius: 50%;
            z-index: 1000;
            pointer-events: none;
        `;
        pointElement.className = 'measurement-point';
        pointElement.textContent = index;
        pointElement.style.color = 'white';
        pointElement.style.fontSize = '10px';
        pointElement.style.textAlign = 'center';
        pointElement.style.lineHeight = '8px';
        
        // Positioniere relativ zum Bild
        const container = imageElement.parentElement;
        container.style.position = 'relative';
        container.appendChild(pointElement);
    }
    
    completeMeasurement() {
        console.log('🎯 completeMeasurement() aufgerufen');
        console.log('🎯 this.tempPoints:', this.tempPoints);
        console.log('🎯 this.drawMeasurementLine verfügbar:', typeof this.drawMeasurementLine);
        
        if (this.tempPoints.length !== 2) {
            console.log('❌ Nicht genug Punkte:', this.tempPoints.length);
            return;
        }
        
        const distance = this.calculateDistance(this.tempPoints[0], this.tempPoints[1]);
        const color = this.colors[this.colorIndex % this.colors.length];
        this.colorIndex++;
        
        console.log('🎯 Distanz berechnet:', distance);
        console.log('🎯 Farbe gewählt:', color);
        console.log('🎯 Versuche drawMeasurementLine aufzurufen...');
        
        // Zeichne finale Linie
        try {
            this.drawMeasurementLine(this.currentViewId, this.tempPoints, color);
            console.log('✅ drawMeasurementLine erfolgreich aufgerufen');
        } catch (error) {
            console.error('❌ Fehler in drawMeasurementLine:', error);
        }
        
        // Hole verfügbare Messungstypen aus Template-Tabelle
        this.getAvailableMeasurementTypes((availableTypes) => {
            if (availableTypes.length === 0) {
                this.showNotification('❌ Keine Messungstypen in der Produktdimensionen-Tabelle gefunden', 'error');
                this.resetMeasurement();
                return;
            }
            
            // Erstelle Messungstyp-Auswahl Dialog
            this.showMeasurementTypeDialog(availableTypes, distance, color);
        });
    }

    getAvailableMeasurementTypes(callback) {
        // Prüfe erst, ob AJAX-Variablen verfügbar sind
        if (typeof templateMeasurementsAjax === 'undefined') {
            console.error('templateMeasurementsAjax not defined, using fallback');
            this.showLegacyCMDialog();
            return;
        }
        
        const formData = new FormData();
        formData.append('action', 'get_available_measurement_types');
        formData.append('nonce', templateMeasurementsAjax.nonce);
        formData.append('template_id', this.getTemplateId());
        
        fetch(templateMeasurementsAjax.ajax_url, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                callback(data.data.measurement_types || []);
            } else {
                console.error('Error loading measurement types:', data.data);
                // Fallback zu CM-Eingabe
                this.showLegacyCMDialog();
            }
        })
        .catch(error => {
            console.error('AJAX error:', error);
            // Fallback zu CM-Eingabe
            this.showLegacyCMDialog();
        });
    }

    // **NEU**: Fallback-Funktion für CM-Eingabe
    showLegacyCMDialog() {
        const realDistance = prompt('FALLBACK: Geben Sie die reale Distanz in cm ein:');
        
        if (isFinite(realDistance) && parseFloat(realDistance) > 0) {
            // Simuliere "custom" Messungstyp
            const pixelDistance = this.calculateDistance(this.tempPoints[0], this.tempPoints[1]);
            const scaleFactor = parseFloat(realDistance) / (pixelDistance / 10);
            
            this.createVisibleMeasurementElement(this.currentViewId, {
                type: 'custom',
                pixel_distance: pixelDistance,
                real_distance_cm: parseFloat(realDistance),
                scale_factor: scaleFactor,
                color: this.colors[this.colorIndex % this.colors.length],
                points: this.tempPoints
            });
            
            this.showNotification(`✅ Messung gespeichert (Fallback-Modus)!\n📏 ${pixelDistance.toFixed(1)} px = ${realDistance} cm`, 'success');
            this.resetMeasurement();
        } else {
            this.showNotification('❌ Messung abgebrochen - ungültige Eingabe', 'error');
            this.resetMeasurement();
        }
    }

    showMeasurementTypeDialog(availableTypes, pixelDistance, color) {
        // Prüfe bestehende Messungen dieses Views
        const existingTypes = this.getExistingMeasurementTypes(this.currentViewId);
        const availableForSelection = availableTypes.filter(type => !existingTypes.includes(type.key));
        
        if (availableForSelection.length === 0) {
            this.showNotification('❌ Alle verfügbaren Messungstypen wurden bereits für diese Ansicht verwendet', 'error');
            this.resetMeasurement();
            return;
        }
        
        // Erstelle Dialog HTML
        const dialogHtml = `
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); max-width: 400px;">
                <h3 style="margin-top: 0; color: #2271b1;">Messungstyp auswählen</h3>
                <p style="margin-bottom: 15px; color: #666;">
                    Gemessene Distanz: <strong>${pixelDistance.toFixed(1)} Pixel</strong><br>
                    Was haben Sie gemessen?
                </p>
                <select id="measurement-type-select" style="width: 100%; padding: 8px; margin-bottom: 15px;">
                    <option value="">-- Messungstyp wählen --</option>
                    ${availableForSelection.map(type => 
                        `<option value="${type.key}">${type.label}</option>`
                    ).join('')}
                </select>
                <div style="text-align: right;">
                    <button type="button" onclick="window.YPrintTemplateMeasurements.cancelMeasurementTypeDialog()" 
                            style="margin-right: 10px; padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Abbrechen
                    </button>
                    <button type="button" onclick="window.YPrintTemplateMeasurements.confirmMeasurementType(${pixelDistance}, '${color}')" 
                            style="padding: 8px 16px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Speichern
                    </button>
                </div>
            </div>
        `;
        
        // Zeige Dialog
        this.showModal(dialogHtml);
    }

    confirmMeasurementType(pixelDistance, color) {
        const select = document.getElementById('measurement-type-select');
        const selectedType = select.value;
        
        if (!selectedType) {
            alert('Bitte wählen Sie einen Messungstyp aus.');
            return;
        }
        
        // Speichere Messung mit Typ statt CM-Wert
        this.saveMeasurementWithType(selectedType, pixelDistance, color);
        this.hideModal();
    }

    cancelMeasurementTypeDialog() {
        this.hideModal();
        this.resetMeasurement();
    }

    saveMeasurementWithType(measurementType, pixelDistance, color) {
        // Erstelle Mess-Element mit Typ-Information
        this.createVisibleMeasurementElement(this.currentViewId, {
            type: measurementType,
            pixel_distance: pixelDistance,
            measurement_type: measurementType, // Neu: Typ statt CM-Wert
            color: color,
            points: this.tempPoints
        });
        
        this.showNotification(`✅ ${measurementType.toUpperCase()}-Messung erfolgreich gespeichert!\n📏 Pixel: ${pixelDistance.toFixed(1)} px`, 'success');
        this.resetMeasurement();
    }

    getExistingMeasurementTypes(viewId) {
        const container = document.querySelector(`[data-view-id="${viewId}"] .measurements-list`);
        if (!container) return [];
        
        const measurements = container.querySelectorAll('.measurement-item');
        return Array.from(measurements).map(item => item.dataset.measurementType).filter(Boolean);
    }

    getTemplateId() {
        // Hole Template ID aus der URL oder einem versteckten Feld
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('post') || document.querySelector('input[name="post_ID"]')?.value || 0;
    }

    showModal(content) {
        // Entferne bestehende Modal
        const existingModal = document.getElementById('measurement-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Erstelle neues Modal
        const modal = document.createElement('div');
        modal.id = 'measurement-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        modal.innerHTML = content;
        document.body.appendChild(modal);
    }

    hideModal() {
        const modal = document.getElementById('measurement-modal');
        if (modal) {
            modal.remove();
        }
    }
    
    resetMeasurement() {
        this.measurementMode = false;
        this.tempPoints = [];
        this.currentViewId = null;
        
        // Visuellen Modus zurücksetzen
        this.showMeasurementMode(false);
        
        // Punkte entfernen
        document.querySelectorAll('.measurement-point').forEach(point => {
            point.remove();
        });
        
        console.log('🎯 Measurement reset complete');
    }
    
    calculateDistance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    createVisibleMeasurementElement(viewId, measurement) {
        console.log('🎯 Creating visible measurement element:', measurement);
        
        // Hole verfügbare Größen aus dem DOM
        const availableSizes = this.getAvailableSizes();
        
        // Berechne nächsten Index für diese View
        const nextIndex = this.getNextMeasurementIndex(viewId);
        
        // Erstelle vollständiges Mess-Element mit WordPress-Formularfeldern
        const measurementElement = document.createElement('div');
        measurementElement.className = 'yprint-measurement-result measurement-item';
        measurementElement.dataset.index = nextIndex;
        measurementElement.dataset.viewId = viewId;
        measurementElement.dataset.measurementType = measurement.type; // Neu: Typ speichern
        measurementElement.style.cssText = `
            background: linear-gradient(135deg, #e8f4f8 0%, #d4edda 100%);
            padding: 20px;
            margin: 15px 0;
            border-left: 5px solid ${measurement.color};
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
        `;
        
        measurementElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                <h4 style="margin: 0; color: #155724; font-size: 16px;">
                    ✅ ${measurement.type.toUpperCase()}-Messung ${nextIndex + 1} (${this.getViewNameFromId(viewId)})
                </h4>
                <button type="button" onclick="this.closest('.measurement-item').remove()" 
                        style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                    🗑️ Löschen
                </button>
            </div>
            
            <!-- Automatisch berechnete Größen-Skalierungen -->
            <div style="background: rgba(255,255,255,0.9); padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                <h5 style="margin: 0 0 12px 0; color: #0066cc; display: flex; align-items: center;">
                    <span class="dashicons dashicons-calculator" style="margin-right: 8px;"></span>
                    Automatische Größen-Berechnung
                </h5>
                <div class="size-scale-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px;">
                    ${availableSizes.map(size => {
                        const sizeScaleFactor = this.calculateSizeSpecificScale(measurement, size.id);
                        return `
                            <div style="text-align: center; padding: 12px; background: linear-gradient(135deg, #f0f8ff 0%, #e8f4f8 100%); border-radius: 6px; border: 1px solid #007cba;">
                                <div style="font-weight: 600; color: #007cba; margin-bottom: 6px; font-size: 14px;">
                                    ${size.name}
                                </div>
                                <div style="font-size: 11px; color: #666; margin-bottom: 4px;">
                                    ${sizeScaleFactor ? (sizeScaleFactor * (measurement.pixel_distance / 10)).toFixed(1) + ' cm' : 'Nicht verfügbar'}
                                </div>
                                <div style="font-size: 12px; font-weight: 600; color: #28a745;">
                                    ${sizeScaleFactor ? sizeScaleFactor.toFixed(3) + ' mm/px' : 'Nicht verfügbar'}
                                </div>
                                <div style="font-size: 9px; color: #999; margin-top: 2px;">
                                    Auto-berechnet
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="calculation-info" style="margin-top: 10px; padding: 8px; background: #d4edda; border-radius: 4px; font-size: 12px; color: #155724;">
                    <strong>✅ Automatische Berechnung erfolgreich!</strong> 
                    Skalierungsfaktoren wurden basierend auf den "${measurement.type}" Werten 
                    aus der Product Dimensions Tabelle berechnet (${measurement.pixel_distance.toFixed(1)}px gemessen).
                </div>
            </div>
            
            <!-- Basis-Messungsinfo -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; font-size: 13px; margin-bottom: 10px;">
                <div><strong>📏 Pixel-Distanz:</strong> ${measurement.pixel_distance.toFixed(1)} px</div>
                <div><strong>🎨 Farbe:</strong> <span style="display: inline-block; width: 16px; height: 16px; background: ${measurement.color}; border-radius: 3px; vertical-align: middle; margin-left: 5px;"></span></div>
                <div><strong>📍 Punkte:</strong> (${measurement.points[0].x}, ${measurement.points[0].y}) → (${measurement.points[1].x}, ${measurement.points[1].y})</div>
            </div>
            
            <!-- Hidden WordPress-Formularfelder -->
            <input type="hidden" name="view_print_areas[${viewId}][measurements][${nextIndex}][type]" 
                   value="${measurement.type}" class="measurement-type-input" />
            <input type="hidden" name="view_print_areas[${viewId}][measurements][${nextIndex}][measurement_type]" 
                   value="${measurement.type}" class="measurement-type-input" />
            <input type="hidden" name="view_print_areas[${viewId}][measurements][${nextIndex}][pixel_distance]" 
                   value="${measurement.pixel_distance}" class="pixel-distance-input" />
            <input type="hidden" name="view_print_areas[${viewId}][measurements][${nextIndex}][color]" 
                   value="${measurement.color}" class="measurement-color-input" />
            <input type="hidden" name="view_print_areas[${viewId}][measurements][${nextIndex}][points]" 
                   value='${JSON.stringify(measurement.points)}' class="measurement-points-input" />
        `;
        
        // Event-Listener für Live-Updates
        this.attachMeasurementEvents(measurementElement, viewId, nextIndex);
        
        // View-spezifisches Einfügen mit viewId
        this.insertMeasurementElement(measurementElement, this.currentViewId);
    }
    
    insertMeasurementElement(element, viewId) {
        console.log('🎯 Inserting measurement element for viewId:', viewId);
        
        // 1. View-spezifische Suche nach dem korrekten Visual Measurements Container
        const viewContainers = document.querySelectorAll('[data-view-id], .visual-measurement-container');
        
        for (let container of viewContainers) {
            // Prüfe ob dieser Container zur richtigen View gehört
            const containerViewId = container.dataset.viewId || 
                                   container.querySelector('[data-view-id]')?.dataset.viewId ||
                                   container.querySelector('img[data-view-id]')?.dataset.viewId;
            
            if (containerViewId === viewId) {
                // Suche nach dem passenden Einfügepunkt in diesem Container
                const measurementSection = container.querySelector('.existing-measurements') ||
                                          container.querySelector('.measurements-list') ||
                                          container;
                
                measurementSection.appendChild(element);
                console.log('🎯 Inserted in view-specific container for viewId:', viewId);
                return;
            }
        }
        
        // 2. Fallback: Suche nach Header mit View-Namen
        const images = document.querySelectorAll('img[data-view-id]');
        for (let img of images) {
            if (img.dataset.viewId === viewId) {
                // Finde den View-Container über das Bild
                let viewContainer = img.closest('.visual-measurement-container') ||
                                   img.closest('[data-view-id]') ||
                                   img.parentElement;
                
                // Suche nach dem Header in diesem Container
                const headers = viewContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
                for (let header of headers) {
                    if (header.textContent.includes('Visual Measurements') ||
                        header.textContent.includes(img.alt) ||
                        header.textContent.includes('Front') ||
                        header.textContent.includes('Back')) {
                        
                        // Füge nach dem Header ein
                        header.parentElement.insertBefore(element, header.nextSibling);
                        console.log('🎯 Inserted after view-specific header for viewId:', viewId);
                        return;
                    }
                }
                
                // Kein spezifischer Header - füge am Ende des View-Containers ein
                viewContainer.appendChild(element);
                console.log('🎯 Inserted at end of view container for viewId:', viewId);
                return;
            }
        }
        
        // 3. Erweiterte Fallback-Suche nach View-Namen
        const allHeaders = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        for (let header of allHeaders) {
            // Suche nach Front/Back/Left/Right in Kombination mit viewId
            if (header.textContent.includes('Visual Measurements')) {
                const headerContainer = header.closest('div');
                const nearbyImage = headerContainer?.querySelector('img[data-view-id]');
                
                if (nearbyImage && nearbyImage.dataset.viewId === viewId) {
                    header.parentElement.insertBefore(element, header.nextSibling);
                    console.log('🎯 Inserted via extended fallback for viewId:', viewId);
                    return;
                }
            }
        }
        
        // 4. Letzter Fallback: Erstelle view-spezifischen Container
        console.log('🎯 Creating new container for viewId:', viewId);
        const viewName = this.getViewNameFromId(viewId);
        const newContainer = document.createElement('div');
        newContainer.className = 'view-measurements-container';
        newContainer.style.cssText = `
            margin: 20px 0;
            padding: 15px;
            border: 2px solid #007cba;
            border-radius: 8px;
            background: #f0f8ff;
        `;
        newContainer.innerHTML = `
            <h4 style="margin: 0 0 15px 0; color: #007cba;">
                📐 Messungen für ${viewName} (View ID: ${viewId})
            </h4>
        `;
        newContainer.appendChild(element);
        
        // Füge nach dem ersten Visual Measurements Container ein
        const firstMeasurementContainer = document.querySelector('.visual-measurement-container');
        if (firstMeasurementContainer) {
            firstMeasurementContainer.parentElement.insertBefore(newContainer, firstMeasurementContainer.nextSibling);
        } else {
            document.body.appendChild(newContainer);
        }
    }

    getViewNameFromId(viewId) {
        // Versuche View-Namen aus dem DOM zu ermitteln
        const img = document.querySelector(`img[data-view-id="${viewId}"]`);
        if (img) {
            return img.alt || img.title || `View ${viewId}`;
        }
        
        // Standard-Namen basierend auf bekannten IDs
        const knownViews = {
            '189542': 'Front',
            '679311': 'Back'
        };
        
        return knownViews[viewId] || `View ${viewId}`;
    }
    
    showNotification(message, type = 'info') {
        console.log(`🔔 ${type.toUpperCase()}: ${message}`);
        
        // Erstelle Toast-Notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007cba'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 300px;
            white-space: pre-line;
            font-size: 14px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Automatisch nach 5 Sekunden entfernen
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    getAvailableSizes() {
        // Versuche Größen aus dem DOM zu lesen
        const sizeInputs = document.querySelectorAll('input[name*="sizes["]');
        const sizes = [];
        
        sizeInputs.forEach(input => {
            const match = input.name.match(/sizes\[(\d+)\]\[id\]/);
            if (match) {
                const index = match[1];
                const idInput = document.querySelector(`input[name="sizes[${index}][id]"]`);
                const nameInput = document.querySelector(`input[name="sizes[${index}][name]"]`);
                
                if (idInput && nameInput) {
                    sizes.push({
                        id: idInput.value,
                        name: nameInput.value
                    });
                }
            }
        });
        
        // Fallback zu Standard-Größen
        if (sizes.length === 0) {
            return [
                { id: 's', name: 'S' },
                { id: 'm', name: 'M' },
                { id: 'l', name: 'L' },
                { id: 'xl', name: 'XL' }
            ];
        }
        
        return sizes;
    }

    getNextMeasurementIndex(viewId) {
        // Zähle existierende Messungen für diese View
        const existingMeasurements = document.querySelectorAll(`[data-view-id="${viewId}"].measurement-item`);
        return existingMeasurements.length;
    }

    calculateSizeSpecificScale(measurement, sizeId) {
        // Versuche Produktdimensionen für diese Größe zu finden
        const dimensionInput = document.querySelector(
            `input[name="product_dimensions[${sizeId}][${measurement.type}]"]`
        );
        
        if (dimensionInput && dimensionInput.value && parseFloat(dimensionInput.value) > 0) {
            const realSizeCm = parseFloat(dimensionInput.value);
            return realSizeCm / (measurement.pixel_distance / 10); // cm zu mm/px
        }
        
        return null;
    }

    attachMeasurementEvents(element, viewId, index) {
        // Type-Select Event
        const typeSelect = element.querySelector('.measurement-type-select');
        if (typeSelect) {
            typeSelect.addEventListener('change', () => {
                this.updateSizeSpecificScales(element, viewId, index);
            });
        }
        
        // Real Distance Input Event
        const realDistanceInput = element.querySelector('.real-distance-input');
        if (realDistanceInput) {
            realDistanceInput.addEventListener('input', () => {
                this.updateSizeSpecificScales(element, viewId, index);
            });
        }
    }

    updateSizeSpecificScales(element, viewId, index) {
        const typeSelect = element.querySelector('.measurement-type-select');
        const pixelDistanceInput = element.querySelector('.pixel-distance-input');
        
        if (!typeSelect || !pixelDistanceInput) return;
        
        const measurementType = typeSelect.value;
        const pixelDistance = parseFloat(pixelDistanceInput.value);
        
        const availableSizes = this.getAvailableSizes();
        
        // Update Größen-Display
        const scaleContainer = element.querySelector('[style*="grid-template-columns: repeat(auto-fit, minmax(120px, 1fr))"]');
        if (scaleContainer) {
            scaleContainer.innerHTML = availableSizes.map(size => {
                const sizeScaleFactor = this.calculateSizeSpecificScale({
                    type: measurementType,
                    pixel_distance: pixelDistance
                }, size.id);
                
                return `
                    <div style="text-align: center; padding: 8px; background: #f8f9fa; border-radius: 4px;">
                        <div style="font-weight: 600; color: #007cba; margin-bottom: 3px;">Größe ${size.name}</div>
                        <div style="font-size: 11px; color: #666;">
                            ${sizeScaleFactor ? sizeScaleFactor.toFixed(3) + ' mm/px' : 'Nicht verfügbar'}
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // ✅ NEUE FUNKTION HINZUFÜGEN:
    drawMeasurementLine(viewId, points, color) {
        if (!points || points.length !== 2) return;
        
        console.log('🎯 Drawing measurement line:', viewId, points, color);
        
        // Finde das Bild-Element
        const images = document.querySelectorAll('img.measurement-image');
        let targetImage = null;
        
        for (let img of images) {
            const imgViewId = img.getAttribute('data-view-id') || 
                             img.closest('[data-view-id]')?.getAttribute('data-view-id');
            if (imgViewId === viewId) {
                targetImage = img;
                break;
            }
        }
        
        if (!targetImage) {
            console.error('Could not find target image for line drawing');
            return;
        }
        
        // Erstelle SVG-Overlay für die Linie
        const container = targetImage.parentElement;
        const rect = targetImage.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Berechne relative Positionen
        const relativeX = rect.left - containerRect.left;
        const relativeY = rect.top - containerRect.top;
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.cssText = `
            position: absolute;
            left: ${relativeX}px;
            top: ${relativeY}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
            pointer-events: none;
            z-index: 999;
        `;
        svg.className = 'measurement-line-svg';
        
        // Berechne Skalierung von natürlicher Bildgröße zu angezeigter Größe
        const scaleX = rect.width / targetImage.naturalWidth;
        const scaleY = rect.height / targetImage.naturalHeight;
        
        // Skaliere Punkte auf angezeigte Bildgröße
        const displayPoint1 = {
            x: points[0].x * scaleX,
            y: points[0].y * scaleY
        };
        const displayPoint2 = {
            x: points[1].x * scaleX,
            y: points[1].y * scaleY
        };
        
        // Erstelle Linie
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', displayPoint1.x);
        line.setAttribute('y1', displayPoint1.y);
        line.setAttribute('x2', displayPoint2.x);
        line.setAttribute('y2', displayPoint2.y);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '5,5');
        
        svg.appendChild(line);
        
        // Stelle sicher, dass Container relative Position hat
        if (getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }
        
        container.appendChild(svg);
        
        console.log('✅ Measurement line drawn successfully');
    }
}

// Globale Instanz erstellen
window.YPrintTemplateMeasurements = YPrintTemplateMeasurements;

// Globale Initialisierung
window.templateMeasurements = null;

// DOM-Ready-Handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Template Measurements DOM Ready');
    
    // Warte kurz, bis alle Skripte geladen sind
    setTimeout(function() {
        if (typeof YPrintTemplateMeasurements !== 'undefined') {
            window.templateMeasurements = new YPrintTemplateMeasurements();
            console.log('✅ Template Measurements initialized:', window.templateMeasurements);
        } else {
            console.error('❌ YPrintTemplateMeasurements class not found');
        }
    }, 100);
});

// Fallback für spätere Initialisierung
window.initTemplateMinitsIfNeeded = function() {
    if (!window.templateMeasurements && typeof YPrintTemplateMeasurements !== 'undefined') {
        window.templateMeasurements = new YPrintTemplateMeasurements();
        console.log('✅ Template Measurements initialized (fallback)');
    }
};

// Initialisierung mit verbessertem DOM-Ready-Handling
if (typeof window.YPrintTemplateMeasurements !== 'undefined') {
    // Klasse bereits definiert, initialisiere sofort
    window.templateMeasurements = new YPrintTemplateMeasurements();
    console.log('✅ Template Measurements initialized immediately');
} else {
    console.log('🎯 YPrint Template Measurements Script Ende erreicht'); 
}

} // Ende der if-Überprüfung für bereits geladene Klasse 
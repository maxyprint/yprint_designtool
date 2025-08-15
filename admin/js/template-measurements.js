/**
 * Template Measurements - Enhanced JavaScript for Visual Measurements
 * Provides interactive point placement, live calculations, and improved UX
 */

class TemplateMeasurements {
    constructor() {
        this.currentViewId = null;
        this.measurementMode = false;
        this.tempPoints = [];
        this.colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];
        this.colorIndex = 0;
        
        this.init();
    }
    
    init() {
        // Event-Listeners für Mess-Buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-measurement-btn')) {
                const btn = e.target.closest('.add-measurement-btn');
                const viewId = btn.dataset.viewId;
                if (viewId) {
                    this.startMeasurement(viewId);
                }
            }
            
            if (e.target.closest('.delete-measurement-btn')) {
                this.deleteMeasurement(e.target.closest('.delete-measurement-btn'));
            }
        });
        
        // Bild-Klick für Punkt-Platzierung
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('measurement-image') && this.measurementMode) {
                this.addMeasurementPoint(e);
            }
        });
        
        // Live-Updates bei Eingabe-Änderungen
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('real-distance-input')) {
                this.updateCalculations(e.target);
            }
        });
        
        // Initiale Berechnungen für alle Views
        this.updateAllCalculations();
    }
    
    startMeasurement(viewId) {
        this.currentViewId = viewId;
        this.measurementMode = true;
        this.tempPoints = [];
        
        // UI-Feedback
        const measurementImage = document.querySelector(`.measurement-image[data-view-id="${viewId}"]`);
        if (!measurementImage) return;
        
        const measurementContainer = measurementImage.closest('.visual-measurement-container');
        if (!measurementContainer) return;
        
        const btn = measurementContainer.querySelector('.add-measurement-btn');
        if (btn) {
            btn.textContent = 'Click 2 points on image...';
            btn.style.background = '#ffc107';
        }
        
        // Cursor ändern
        if (measurementImage) {
            measurementImage.style.cursor = 'crosshair';
        }
    }
    
    addMeasurementPoint(event) {
        if (!this.measurementMode || this.tempPoints.length >= 2) return;
        
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Skaliere auf tatsächliche Bildgröße
        const scaleX = event.target.naturalWidth / rect.width;
        const scaleY = event.target.naturalHeight / rect.height;
        
        const point = {
            x: Math.round(x * scaleX),
            y: Math.round(y * scaleY)
        };
        
        this.tempPoints.push(point);
        
        // Zeichne Punkt auf Canvas
        this.drawPoint(this.currentViewId, point, this.tempPoints.length);
        
        if (this.tempPoints.length === 2) {
            this.completeMeasurement();
        }
    }
    
    completeMeasurement() {
        console.log('Completing measurement with points:', this.tempPoints);
        
        if (this.tempPoints.length !== 2) {
            console.error('Invalid number of points:', this.tempPoints.length);
            return;
        }
        
        const distance = this.calculateDistance(this.tempPoints[0], this.tempPoints[1]);
        const color = this.colors[this.colorIndex % this.colors.length];
        this.colorIndex++;
        
        console.log('Calculated distance:', distance, 'Color:', color);
        
        // Zeichne finale Linie
        this.drawMeasurementLine(this.currentViewId, this.tempPoints, color);
        
        // Erstelle neue Messung
        const measurementData = {
            type: 'chest',
            pixel_distance: distance,
            color: color,
            points: [...this.tempPoints], // Kopiere Array
            real_distance_cm: ''
        };
        
        console.log('Creating measurement with data:', measurementData);
        
        // Erstelle Mess-Element
        try {
            this.createMeasurementElement(this.currentViewId, measurementData);
            console.log('Measurement element created successfully');
        } catch (error) {
            console.error('Error creating measurement element:', error);
            alert('Fehler beim Erstellen der Messung. Bitte Konsole prüfen.');
        }
        
        // Reset
        this.measurementMode = false;
        this.tempPoints = [];
        this.resetMeasurementUI(this.currentViewId);
        
        console.log('Measurement completed and UI reset');
    }
    
    calculateDistance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    drawPoint(viewId, point, index) {
        const measurementImage = document.querySelector(`.measurement-image[data-view-id="${viewId}"]`);
        if (!measurementImage) return;
        
        const measurementContainer = measurementImage.closest('.visual-measurement-container');
        const canvas = measurementContainer ? measurementContainer.querySelector('.measurement-overlay') : null;
        
        if (!canvas || !measurementImage) return;
        
        // Canvas-Größe anpassen
        canvas.width = measurementImage.offsetWidth;
        canvas.height = measurementImage.offsetHeight;
        
        const ctx = canvas.getContext('2d');
        
        // Skaliere Punkt für Canvas
        const scaleX = canvas.width / measurementImage.naturalWidth;
        const scaleY = canvas.height / measurementImage.naturalHeight;
        
        const canvasX = point.x * scaleX;
        const canvasY = point.y * scaleY;
        
        // Zeichne Punkt
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Nummer
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(index.toString(), canvasX, canvasY + 4);
    }
    
    drawMeasurementLine(viewId, points, color) {
        const measurementImage = document.querySelector(`.measurement-image[data-view-id="${viewId}"]`);
        if (!measurementImage) return;
        
        const measurementContainer = measurementImage.closest('.visual-measurement-container');
        const canvas = measurementContainer ? measurementContainer.querySelector('.measurement-overlay') : null;
        
        if (!canvas || !measurementImage) return;
        
        // Canvas-Größe anpassen wenn nötig
        if (canvas.width !== measurementImage.offsetWidth || canvas.height !== measurementImage.offsetHeight) {
            canvas.width = measurementImage.offsetWidth;
            canvas.height = measurementImage.offsetHeight;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Skaliere Punkte für Canvas
        const scaleX = canvas.width / measurementImage.naturalWidth;
        const scaleY = canvas.height / measurementImage.naturalHeight;
        
        const startX = points[0].x * scaleX;
        const startY = points[0].y * scaleY;
        const endX = points[1].x * scaleX;
        const endY = points[1].y * scaleY;
        
        // Zeichne Linie
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Zeichne Endpunkte
        ctx.setLineDash([]);
        ctx.fillStyle = color;
        
        // Startpunkt
        ctx.beginPath();
        ctx.arc(startX, startY, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Endpunkt
        ctx.beginPath();
        ctx.arc(endX, endY, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Beschriftung mit Distanz
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const distance = this.calculateDistance(points[0], points[1]);
        
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.strokeText(`${distance.toFixed(0)}px`, midX, midY - 10);
        ctx.fillText(`${distance.toFixed(0)}px`, midX, midY - 10);
    }
    
    drawArrow(ctx, x1, y1, x2, y2, color) {
        const headLength = 10;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    }
    
    createMeasurementElement(viewId, measurement) {
        console.log('Creating measurement element for view:', viewId, measurement);
        
        // Finde das Bild-Element
        const measurementImage = document.querySelector(`img[data-view-id="${viewId}"]`);
        if (!measurementImage) {
            console.error('Measurement image not found for view:', viewId);
            console.log('Available images:', document.querySelectorAll('img[data-view-id]'));
            return;
        }
        
        // Finde den Container - probiere verschiedene Möglichkeiten
        let measurementContainer = measurementImage.closest('.visual-measurement-container');
        
        if (!measurementContainer) {
            // Alternative: Finde Container über Parent-Traversal
            let parent = measurementImage.parentElement;
            while (parent && !parent.classList.contains('visual-measurement-container')) {
                parent = parent.parentElement;
            }
            measurementContainer = parent;
        }
        
        if (!measurementContainer) {
            console.error('Measurement container not found for view:', viewId);
            console.log('Image element:', measurementImage);
            console.log('Image parent:', measurementImage.parentElement);
            return;
        }
        
        console.log('Found measurement container:', measurementContainer);
        
        // Finde oder erstelle den Container für die Messungen
        let measurementsList = measurementContainer.querySelector('.measurements-list');
        let measurementsContainer = measurementContainer.querySelector('.existing-measurements');
        
        // Falls .existing-measurements nicht existiert, suche nach anderen möglichen Containern
        if (!measurementsContainer) {
            // Suche nach "No measurements" Text um den richtigen Container zu finden
            const noMeasurementsText = measurementContainer.querySelector(':contains("No measurements")');
            if (noMeasurementsText) {
                measurementsContainer = noMeasurementsText.closest('div');
            }
            
            // Falls immer noch nicht gefunden, erstelle den Container
            if (!measurementsContainer) {
                measurementsContainer = document.createElement('div');
                measurementsContainer.className = 'existing-measurements';
                measurementContainer.appendChild(measurementsContainer);
                console.log('Created new existing-measurements container');
            }
        }
        
        // Erstelle measurements-list falls nicht vorhanden
        if (!measurementsList) {
            measurementsList = document.createElement('div');
            measurementsList.className = 'measurements-list';
            measurementsContainer.appendChild(measurementsList);
            console.log('Created new measurements-list');
        }
        
        // Verstecke "No measurements" Nachricht
        const noMeasurementsMsg = measurementContainer.querySelector('[style*="No measurements"], .no-measurements');
        if (noMeasurementsMsg) {
            noMeasurementsMsg.style.display = 'none';
            console.log('Hid no-measurements message');
        }
        
        // Alternativ: Suche nach Text-Content
        const textNodes = Array.from(measurementContainer.querySelectorAll('*')).filter(el => 
            el.textContent.includes('No measurements configured yet')
        );
        textNodes.forEach(node => {
            node.style.display = 'none';
            console.log('Hid text node with no-measurements message');
        });
        
        // Berechne nächsten Index
        const existingMeasurements = measurementsList.querySelectorAll('.measurement-item');
        const nextIndex = existingMeasurements.length;
        
        console.log('Creating measurement with index:', nextIndex);
        
        // HTML für neue Messung - vereinfacht für bessere Kompatibilität
        const measurementHtml = `
            <div class="measurement-item" data-index="${nextIndex}" 
                 style="background: #fff; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid ${measurement.color}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <div style="margin-bottom: 12px;">
                    <label style="display: block; font-weight: 600; color: #333; margin-bottom: 8px;">
                        📏 Messungstyp auswählen:
                    </label>
                    <select name="view_print_areas[${viewId}][measurements][${nextIndex}][type]" 
                            class="measurement-type-select" 
                            style="width: 100%; max-width: 200px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                        <option value="chest" ${measurement.type === 'chest' ? 'selected' : ''}>Brustweite</option>
                        <option value="shoulder_to_shoulder" ${measurement.type === 'shoulder_to_shoulder' ? 'selected' : ''}>Schulter zu Schulter</option>
                        <option value="height_from_shoulder" ${measurement.type === 'height_from_shoulder' ? 'selected' : ''}>Höhe ab Schulter</option>
                        <option value="sleeve_length" ${measurement.type === 'sleeve_length' ? 'selected' : ''}>Ärmellänge</option>
                        <option value="biceps" ${measurement.type === 'biceps' ? 'selected' : ''}>Bizeps</option>
                        <option value="hem_width" ${measurement.type === 'hem_width' ? 'selected' : ''}>Saumweite</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="display: block; font-weight: 600; color: #333; margin-bottom: 8px;">
                        📐 Echte Größe dieser Messung in cm:
                    </label>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <input type="number" 
                               name="view_print_areas[${viewId}][measurements][${nextIndex}][real_distance_cm]"
                               placeholder="z.B. 50.0"
                               value="${measurement.real_distance_cm || ''}"
                               step="0.1" min="0.1" max="200"
                               class="real-distance-input"
                               style="width: 120px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;" />
                        <span style="font-weight: 500; color: #666;">cm</span>
                        <button type="button" class="delete-measurement-btn button button-small" 
                                data-index="${nextIndex}"
                                style="margin-left: auto; color: #dc3545; border-color: #dc3545;"
                                title="Messung löschen">
                            🗑️ Löschen
                        </button>
                    </div>
                </div>
                
                <div style="font-size: 12px; color: #666; background: #f8f9fa; padding: 8px; border-radius: 4px;">
                    <div>📏 Pixel-Distanz: <strong>${measurement.pixel_distance.toFixed(1)} px</strong></div>
                    <div class="scale-factor">📐 Skalierung: <em>Echte Größe eingeben für Berechnung</em></div>
                </div>
                
                <!-- Hidden Fields für Form-Submission -->
                <input type="hidden" name="view_print_areas[${viewId}][measurements][${nextIndex}][pixel_distance]" 
                       value="${measurement.pixel_distance}" class="pixel-distance-input" />
                <input type="hidden" name="view_print_areas[${viewId}][measurements][${nextIndex}][color]" 
                       value="${measurement.color}" class="measurement-color-input" />
                <input type="hidden" name="view_print_areas[${viewId}][measurements][${nextIndex}][points]" 
                       value='${JSON.stringify(measurement.points)}' class="measurement-points-input" />
            </div>
        `;
        
        // Füge neues Element hinzu
        measurementsList.insertAdjacentHTML('beforeend', measurementHtml);
        console.log('Added measurement HTML to list');
        
        // Event-Listener für neue Elemente hinzufügen
        const newElement = measurementsList.lastElementChild;
        
        // Delete-Button Event
        const deleteBtn = newElement.querySelector('.delete-measurement-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Messung wirklich löschen?')) {
                    newElement.remove();
                    this.updateViewCalculations(viewId);
                    console.log('Measurement deleted');
                }
            });
        }
        
        // Real Distance Input Event für Live-Updates
        const realDistanceInput = newElement.querySelector('.real-distance-input');
        if (realDistanceInput) {
            realDistanceInput.addEventListener('input', () => {
                this.updateMeasurementStats(newElement, measurement.pixel_distance, parseFloat(realDistanceInput.value) || 0);
                this.updateViewCalculations(viewId);
            });
            
            // Focus auf Input setzen für sofortige Eingabe
            setTimeout(() => {
                realDistanceInput.focus();
                realDistanceInput.select();
            }, 200);
        }
        
        // Type-Select Event
        const typeSelect = newElement.querySelector('.measurement-type-select');
        if (typeSelect) {
            typeSelect.addEventListener('change', () => {
                this.updateViewCalculations(viewId);
            });
        }
        
        console.log('Measurement element created successfully with all events attached');
        
        // Scroll zum neuen Element
        setTimeout(() => {
            newElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
        
        // Update Live-Berechnungen
        this.updateViewCalculations(viewId);
    }
    
    deleteMeasurement(button) {
        const measurementItem = button.closest('.measurement-item');
        if (!measurementItem) return;
        
        const measurementContainer = measurementItem.closest('.visual-measurement-container');
        const measurementImage = measurementContainer ? measurementContainer.querySelector('.measurement-image') : null;
        const viewId = measurementImage ? measurementImage.dataset.viewId : null;
        
        if (measurementItem && viewId) {
            measurementItem.remove();
            this.updateViewCalculations(viewId);
        }
    }
    
    resetMeasurementUI(viewId) {
        const measurementImage = document.querySelector(`.measurement-image[data-view-id="${viewId}"]`);
        if (!measurementImage) return;
        
        const measurementContainer = measurementImage.closest('.visual-measurement-container');
        if (!measurementContainer) return;
        
        // Button zurücksetzen
        const btn = measurementContainer.querySelector('.add-measurement-btn');
        if (btn) {
            btn.innerHTML = '<span class="dashicons dashicons-plus-alt2"></span> Messung hinzufügen';
            btn.style.background = '';
        }
        
        // Cursor zurücksetzen
        measurementImage.style.cursor = 'default';
    }
    
    updateCalculations(input) {
        const measurementItem = input.closest('.measurement-item');
        if (!measurementItem) return;
        
        const measurementContainer = measurementItem.closest('.visual-measurement-container');
        const measurementImage = measurementContainer ? measurementContainer.querySelector('.measurement-image') : null;
        const viewId = measurementImage ? measurementImage.dataset.viewId : null;
        
        if (!viewId) return;
        
        // Update Skalierungsfaktor
        const pixelDistance = parseFloat(measurementItem.querySelector('.pixel-distance-input').value);
        const realDistance = parseFloat(input.value);
        
        if (pixelDistance > 0 && realDistance > 0) {
            const scaleFactor = realDistance / (pixelDistance / 10); // cm pro mm
            const scaleFactorSpan = measurementItem.querySelector('.scale-factor');
            if (scaleFactorSpan) {
                scaleFactorSpan.textContent = `Scale: ${scaleFactor.toFixed(3)} mm/px`;
            }
        }
        
        this.updateViewCalculations(viewId);
    }
    
    updateViewCalculations(viewId) {
        const measurements = this.getViewMeasurements(viewId);
        
        if (measurements.length === 0) {
            this.updateCalculationDisplay(viewId, {
                printArea: 'Configure measurements',
                scaleFactor: '--',
                accuracy: 'Needs measurements'
            });
            return;
        }
        
        // Finde primäre Messung mit realer Distanz
        const primaryMeasurement = measurements.find(m => 
            m.real_distance_cm > 0 && ['chest', 'shoulder_to_shoulder'].includes(m.type)
        );
        
        if (!primaryMeasurement) {
            this.updateCalculationDisplay(viewId, {
                printArea: 'Enter real measurements',
                scaleFactor: '--',
                accuracy: 'Missing real dimensions'
            });
            return;
        }
        
        // Berechne Skalierungsfaktor
        const scaleFactor = primaryMeasurement.real_distance_cm / (primaryMeasurement.pixel_distance / 10);
        
        // Simuliere Canvas-Dimensionen (sollten aus Backend kommen)
        const canvasWidth = 800; // Aus Backend laden
        const canvasHeight = 600;
        
        const printWidthMm = Math.round(canvasWidth * scaleFactor);
        const printHeightMm = Math.round(canvasHeight * scaleFactor);
        
        this.updateCalculationDisplay(viewId, {
            printArea: `${printWidthMm} × ${printHeightMm} mm`,
            scaleFactor: `${scaleFactor.toFixed(3)} mm/px`,
            accuracy: measurements.length >= 2 ? 'High accuracy' : 'Good accuracy'
        });
    }
    
    getViewMeasurements(viewId) {
        const measurementImage = document.querySelector(`.measurement-image[data-view-id="${viewId}"]`);
        if (!measurementImage) return [];
        
        const measurementContainer = measurementImage.closest('.visual-measurement-container');
        const measurementsList = measurementContainer ? measurementContainer.querySelector('.measurements-list') : null;
        
        if (!measurementsList) return [];
        
        const measurements = [];
        measurementsList.querySelectorAll('.measurement-item').forEach((item, index) => {
            const pixelDistance = parseFloat(item.querySelector('.pixel-distance-input').value);
            const realDistance = parseFloat(item.querySelector('.real-distance-input').value);
            const type = item.querySelector('.measurement-type-select').value;
            
            measurements.push({
                type: type,
                pixel_distance: pixelDistance,
                real_distance_cm: realDistance
            });
        });
        
        return measurements;
    }
    
    updateCalculationDisplay(viewId, calculations) {
        const measurementImage = document.querySelector(`.measurement-image[data-view-id="${viewId}"]`);
        if (!measurementImage) return;
        
        const measurementContainer = measurementImage.closest('.visual-measurement-container');
        if (!measurementContainer) return;
        
        const printAreaDisplay = measurementContainer.querySelector('.print-area-display');
        const scaleFactorDisplay = measurementContainer.querySelector('.scale-factor-display');
        const accuracyDisplay = measurementContainer.querySelector('.accuracy-display');
        
        if (printAreaDisplay) printAreaDisplay.textContent = calculations.printArea;
        if (scaleFactorDisplay) scaleFactorDisplay.textContent = calculations.scaleFactor;
        if (accuracyDisplay) {
            accuracyDisplay.innerHTML = calculations.accuracy;
            
            // Farb-Coding für Genauigkeit
            if (calculations.accuracy.includes('High')) {
                accuracyDisplay.style.color = '#28a745';
                accuracyDisplay.innerHTML = '<span class="dashicons dashicons-yes-alt"></span> ' + calculations.accuracy;
            } else if (calculations.accuracy.includes('Good')) {
                accuracyDisplay.style.color = '#ffc107';
                accuracyDisplay.innerHTML = '<span class="dashicons dashicons-warning"></span> ' + calculations.accuracy;
            } else {
                accuracyDisplay.style.color = '#dc3545';
                accuracyDisplay.innerHTML = '<span class="dashicons dashicons-dismiss"></span> ' + calculations.accuracy;
            }
        }
    }
    
    updateAllCalculations() {
        const measurementImages = document.querySelectorAll('.measurement-image');
        measurementImages.forEach(img => {
            const viewId = img.dataset.viewId;
            if (viewId) {
                this.updateViewCalculations(viewId);
            }
        });
    }

    updateMeasurementStats(measurementElement, pixelDistance, realDistanceCm) {
        const scaleFactorDiv = measurementElement.querySelector('.scale-factor');
        if (!scaleFactorDiv) return;
        
        if (realDistanceCm > 0 && pixelDistance > 0) {
            const scaleFactor = realDistanceCm / (pixelDistance / 10); // cm zu mm/px
            scaleFactorDiv.innerHTML = `📐 Skalierung: <strong>${scaleFactor.toFixed(3)} mm/px</strong>`;
            scaleFactorDiv.style.color = '#28a745'; // Grün für gültige Berechnung
        } else {
            scaleFactorDiv.innerHTML = '📐 Skalierung: <em>Echte Größe eingeben für Berechnung</em>';
            scaleFactorDiv.style.color = '#6c757d'; // Grau für fehlende Daten
        }
    }
}

// Initialisiere wenn DOM geladen
document.addEventListener('DOMContentLoaded', () => {
    new TemplateMeasurements();
}); 
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
        if (this.tempPoints.length !== 2) return;
        
        const distance = this.calculateDistance(this.tempPoints[0], this.tempPoints[1]);
        const color = this.colors[this.colorIndex % this.colors.length];
        this.colorIndex++;
        
        // Zeichne finale Linie
        this.drawMeasurementLine(this.currentViewId, this.tempPoints, color);
        
        // Erstelle neue Messung mit automatischer Index-Berechnung
        const measurementData = {
            type: 'chest', // Standard
            pixel_distance: distance,
            color: color,
            points: this.tempPoints,
            real_distance_cm: ''
        };
        
        this.createMeasurementElement(this.currentViewId, measurementData);
        
        // Reset
        this.measurementMode = false;
        this.tempPoints = [];
        this.resetMeasurementUI(this.currentViewId);
        
        // Update Live-Berechnungen
        this.updateViewCalculations(this.currentViewId);
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
        const measurementImage = document.querySelector(`.measurement-image[data-view-id="${viewId}"]`);
        if (!measurementImage) {
            console.error('Measurement image not found for view:', viewId);
            return;
        }
        
        const measurementContainer = measurementImage.closest('.visual-measurement-container');
        if (!measurementContainer) {
            console.error('Measurement container not found for view:', viewId);
            return;
        }
        
        // Finde oder erstelle measurements-list
        let measurementsList = measurementContainer.querySelector('.measurements-list');
        if (!measurementsList) {
            // Erstelle measurements-list falls sie nicht existiert
            const existingMeasurements = measurementContainer.querySelector('.existing-measurements');
            if (existingMeasurements) {
                measurementsList = document.createElement('div');
                measurementsList.className = 'measurements-list';
                existingMeasurements.appendChild(measurementsList);
            } else {
                console.error('Existing measurements container not found');
                return;
            }
        }
        
        // Berechne nächsten Index
        const existingMeasurements = measurementsList.querySelectorAll('.measurement-item');
        const nextIndex = existingMeasurements.length;
        
        // HTML für neue Messung
        const measurementHtml = `
            <div class="measurement-item" data-index="${nextIndex}" 
                 style="background: #fff; padding: 12px; border-radius: 4px; border-left: 4px solid ${measurement.color}; margin-bottom: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                
                <div class="measurement-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div class="measurement-info" style="flex: 1;">
                        <div style="display: flex; align-items: center; margin-bottom: 8px; gap: 10px;">
                            <label style="font-weight: 500; color: #495057; margin-right: 5px;">Maß-Typ:</label>
                            <select name="view_print_areas[${viewId}][measurements][${nextIndex}][type]" 
                                    class="measurement-type-select" 
                                    style="padding: 4px 8px; border: 1px solid #ddd; border-radius: 3px; font-size: 13px;">
                                <option value="chest" ${measurement.type === 'chest' ? 'selected' : ''}>Brustweite</option>
                                <option value="shoulder_to_shoulder" ${measurement.type === 'shoulder_to_shoulder' ? 'selected' : ''}>Schulter zu Schulter</option>
                                <option value="height_from_shoulder" ${measurement.type === 'height_from_shoulder' ? 'selected' : ''}>Höhe ab Schulter</option>
                                <option value="sleeve_length" ${measurement.type === 'sleeve_length' ? 'selected' : ''}>Ärmellänge</option>
                                <option value="biceps" ${measurement.type === 'biceps' ? 'selected' : ''}>Bizeps</option>
                                <option value="hem_width" ${measurement.type === 'hem_width' ? 'selected' : ''}>Saumweite</option>
                                <option value="waist" ${measurement.type === 'waist' ? 'selected' : ''}>Taille</option>
                                <option value="length" ${measurement.type === 'length' ? 'selected' : ''}>Länge</option>
                            </select>
                            
                            <label style="font-weight: 500; color: #495057; margin-left: 15px; margin-right: 5px;">Echte Größe:</label>
                            <input type="number" 
                                   name="view_print_areas[${viewId}][measurements][${nextIndex}][real_distance_cm]"
                                   placeholder="z.B. 50.0"
                                   value="${measurement.real_distance_cm}"
                                   step="0.1" min="0.1" max="100"
                                   class="real-distance-input"
                                   style="width: 80px; padding: 4px 8px; border: 1px solid #ddd; border-radius: 3px; font-size: 13px;" />
                            <span style="font-size: 12px; color: #666;">cm</span>
                        </div>
                        
                        <div class="measurement-stats" style="font-size: 11px; color: #666; background: #f8f9fa; padding: 6px 8px; border-radius: 3px;">
                            <span class="pixel-distance">
                                📏 Pixel-Distanz: ${measurement.pixel_distance.toFixed(1)} px
                            </span>
                            <span class="separator" style="margin: 0 8px;">•</span>
                            <span class="scale-factor">
                                📐 Skalierung: Noch nicht berechnet
                            </span>
                            <span class="separator" style="margin: 0 8px;">•</span>
                            <span class="measurement-color">
                                🎨 Farbe: <span style="display: inline-block; width: 12px; height: 12px; background: ${measurement.color}; border-radius: 2px; margin-left: 3px; vertical-align: middle;"></span>
                            </span>
                        </div>
                    </div>
                    
                    <div class="measurement-actions" style="margin-left: 15px;">
                        <button type="button" class="button button-small delete-measurement-btn" 
                                data-index="${nextIndex}"
                                style="color: #d63384; padding: 4px 8px; font-size: 12px;"
                                title="Messung löschen">
                            <span class="dashicons dashicons-trash" style="font-size: 14px;"></span>
                        </button>
                    </div>
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
        
        // Entferne "No measurements" Nachricht falls vorhanden
        const noMeasurements = measurementContainer.querySelector('.no-measurements');
        if (noMeasurements) {
            noMeasurements.style.display = 'none';
        }
        
        // Event-Listener für neue Elemente hinzufügen
        const newElement = measurementsList.lastElementChild;
        
        // Delete-Button Event
        const deleteBtn = newElement.querySelector('.delete-measurement-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.deleteMeasurement(deleteBtn);
            });
        }
        
        // Real Distance Input Event für Live-Updates
        const realDistanceInput = newElement.querySelector('.real-distance-input');
        if (realDistanceInput) {
            realDistanceInput.addEventListener('input', () => {
                this.updateCalculations(realDistanceInput);
                this.updateMeasurementStats(newElement, measurement.pixel_distance, parseFloat(realDistanceInput.value) || 0);
            });
            
            // Focus auf Input setzen für sofortige Eingabe
            setTimeout(() => {
                realDistanceInput.focus();
                realDistanceInput.select();
            }, 100);
        }
        
        // Type-Select Event
        const typeSelect = newElement.querySelector('.measurement-type-select');
        if (typeSelect) {
            typeSelect.addEventListener('change', () => {
                this.updateViewCalculations(viewId);
            });
        }
        
        console.log('Measurement element created successfully for view:', viewId, 'with index:', nextIndex);
        
        // Scroll zum neuen Element
        newElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
        const scaleFactorSpan = measurementElement.querySelector('.scale-factor');
        if (!scaleFactorSpan) return;
        
        if (realDistanceCm > 0 && pixelDistance > 0) {
            const scaleFactor = realDistanceCm / (pixelDistance / 10); // cm/mm * 10
            scaleFactorSpan.textContent = `📐 Skalierung: ${scaleFactor.toFixed(3)} mm/px`;
            scaleFactorSpan.style.color = '#28a745'; // Grün für gültige Berechnung
        } else {
            scaleFactorSpan.textContent = '📐 Skalierung: Echte Größe eingeben';
            scaleFactorSpan.style.color = '#6c757d'; // Grau für fehlende Daten
        }
    }
}

// Initialisiere wenn DOM geladen
document.addEventListener('DOMContentLoaded', () => {
    new TemplateMeasurements();
}); 
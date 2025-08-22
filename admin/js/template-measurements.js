/**
 * YPrint Template Measurements - REPARIERTE VERSION
 * VERSION: 2024-12-19-STRUCTURE-FIX
 */

console.log('🎯 YPrint Template Measurements JavaScript wird geladen... VERSION: 2024-12-19-STRUCTURE-FIX');

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
        
        // ✅ NEU: Lade gespeicherte Messungen aus der Datenbank
        this.loadSavedMeasurementsFromDatabase();
        
        // Event-Listeners mit Namespace
        document.addEventListener('click', (e) => {
            this.handleClick(e);
        }, { passive: false });
        
        console.log('🎯 Event listeners attached');
    }
    
    // ✅ NEU: Lade gespeicherte Messungen aus der Datenbank
    loadSavedMeasurementsFromDatabase() {
        console.log('🎯 Loading saved measurements from database...');
        
        const templateId = this.getTemplateId();
        const nonce = window.templateMeasurementsAjax?.nonce || '813d90d822';
        const ajaxUrl = window.templateMeasurementsAjax?.ajax_url || '/wp-admin/admin-ajax.php';
        
        const formData = new FormData();
        formData.append('action', 'load_saved_measurements');
        formData.append('nonce', nonce);
        formData.append('template_id', templateId);
        
        fetch(ajaxUrl, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log('🎯 Load measurements response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('🎯 Load measurements response data:', data);
            if (data.success && data.data && data.data.measurements) {
                console.log('✅ Successfully loaded measurements from database');
                this.displaySavedMeasurements(data.data.measurements);
            } else {
                console.log('ℹ️ No saved measurements found or error loading');
            }
        })
        .catch(error => {
            console.error('❌ Error loading measurements from database:', error);
        });
    }
    
    // ✅ NEU: Zeige gespeicherte Messungen im Frontend an
    displaySavedMeasurements(measurementsData) {
        console.log('🎯 Displaying saved measurements:', measurementsData);
        
        if (!measurementsData || typeof measurementsData !== 'object') {
            console.log('ℹ️ No measurements data to display');
            return;
        }
        
        // Iteriere durch alle Views und ihre Messungen
        Object.keys(measurementsData).forEach(viewId => {
            const viewMeasurements = measurementsData[viewId];
            
            if (viewMeasurements && viewMeasurements.measurements) {
                console.log(`🎯 Processing measurements for view ${viewId}:`, viewMeasurements.measurements);
                
                // Zeige jede Messung an
                Object.keys(viewMeasurements.measurements).forEach(index => {
                    const measurement = viewMeasurements.measurements[index];
                    console.log(`🎯 Displaying measurement ${index}:`, measurement);
                    
                    // Erstelle das Messungs-Element im Frontend
                    this.createVisibleMeasurementElement(viewId, measurement);
                    
                    // Zeichne die visuellen Elemente (Linien, Punkte)
                    if (measurement.points && measurement.points.length === 2) {
                        this.drawMeasurementLine(viewId, measurement.points, measurement.color || '#ff4444');
                    }
                });
            }
        });
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
        
        // Check für Delete Measurement Button
        const isDeleteButton = this.isDeleteMeasurementButton(e.target);
        
        if (isDeleteButton) {
            console.log('🎯 Delete Measurement Button clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            const index = this.findMeasurementIndex(e.target);
            if (index !== null) {
                this.deleteMeasurement(index);
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
        
        // 3. CSS-Klasse prüfen
        if (element.classList && element.classList.contains('add-measurement-btn')) {
            return true;
        }
        
        // 4. Parent-Element prüfen
        if (element.parentElement && element.parentElement.classList && 
            element.parentElement.classList.contains('add-measurement-btn')) {
            return true;
        }
        
        return false;
    }
    
    findViewId(element) {
        // Mehrere Methoden zur viewId-Ermittlung
        let current = element;
        let attempts = 0;
        
        while (current && attempts < 10) {
            // 1. Direkte data-view-id Attribute
            if (current.dataset && current.dataset.viewId) {
                return current.dataset.viewId;
            }
            
            // 2. Standard data-view-id Attribute
            const viewId = current.getAttribute('data-view-id');
            if (viewId) {
                return viewId;
            }
            
            // 3. Suche in Siblings
            if (current.parentElement) {
                const siblings = current.parentElement.children;
                for (let sibling of siblings) {
                    const siblingViewId = sibling.getAttribute('data-view-id') || sibling.dataset?.viewId;
                    if (siblingViewId) {
                        return siblingViewId;
                    }
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
        console.log('📏 Distanz berechnet:', distance);
        
        const color = this.colors[this.colorIndex % this.colors.length];
        console.log('🎨 Farbe gewählt:', color);
        this.colorIndex++;
        
        // Zeichne finale Linie
        console.log('🎯 Versuche drawMeasurementLine aufzurufen...');
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

    // ✅ REPARIERT: drawMeasurementLine mit div-Fallback statt SVG
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
        
        try {
            // ✅ EINFACHE LÖSUNG: Verwende div-Elemente statt SVG
            const container = targetImage.parentElement;
            const rect = targetImage.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            // Berechne relative Positionen
            const relativeX = rect.left - containerRect.left;
            const relativeY = rect.top - containerRect.top;
            
            // Berechne Skalierung
            const scaleX = rect.width / (targetImage.naturalWidth || rect.width);
            const scaleY = rect.height / (targetImage.naturalHeight || rect.height);
            
            // Skaliere Punkte
            const displayPoint1 = {
                x: points[0].x * scaleX,
                y: points[0].y * scaleY
            };
            const displayPoint2 = {
                x: points[1].x * scaleX,
                y: points[1].y * scaleY
            };
            
            // Erstelle Linie als div-Element
            const lineElement = document.createElement('div');
            lineElement.className = 'measurement-line-div';
            
            // Berechne Linien-Position und -Größe
            const dx = displayPoint2.x - displayPoint1.x;
            const dy = displayPoint2.y - displayPoint1.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            
            // Setze div-Styles für Linie
            lineElement.style.position = 'absolute';
            lineElement.style.left = (relativeX + displayPoint1.x) + 'px';
            lineElement.style.top = (relativeY + displayPoint1.y) + 'px';
            lineElement.style.width = length + 'px';
            lineElement.style.height = '2px';
            lineElement.style.background = color;
            lineElement.style.transform = `rotate(${angle}deg)`;
            lineElement.style.transformOrigin = '0 0';
            lineElement.style.pointerEvents = 'none';
            lineElement.style.zIndex = '999';
            
            // Stelle sicher, dass Container relative Position hat
            if (getComputedStyle(container).position === 'static') {
                container.style.position = 'relative';
            }
            
            container.appendChild(lineElement);
            
            console.log('✅ Measurement line drawn successfully with div');
            
        } catch (error) {
            console.error('❌ Error in drawMeasurementLine:', error);
            
            // Fallback: Nur Punkte anzeigen
            console.log('🔄 Using simple point display only');
            this.showSimplePointsDisplay(targetImage, points, color);
        }
    }
    
    // ✅ NEU: Fallback für einfache Punkte-Anzeige
    showSimplePointsDisplay(targetImage, points, color) {
        const container = targetImage.parentElement;
        const rect = targetImage.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        const relativeX = rect.left - containerRect.left;
        const relativeY = rect.top - containerRect.top;
        
        points.forEach((point, index) => {
            const scaleX = rect.width / (targetImage.naturalWidth || rect.width);
            const scaleY = rect.height / (targetImage.naturalHeight || rect.height);
            
            const displayX = point.x * scaleX;
            const displayY = point.y * scaleY;
            
            const pointElement = document.createElement('div');
            pointElement.style.position = 'absolute';
            pointElement.style.left = (relativeX + displayX - 8) + 'px';
            pointElement.style.top = (relativeY + displayY - 8) + 'px';
            pointElement.style.width = '16px';
            pointElement.style.height = '16px';
            pointElement.style.background = color;
            pointElement.style.border = '2px solid white';
            pointElement.style.borderRadius = '50%';
            pointElement.style.zIndex = '1000';
            pointElement.style.pointerEvents = 'none';
            pointElement.className = 'measurement-point-fallback';
            pointElement.textContent = index + 1;
            pointElement.style.color = 'white';
            pointElement.style.fontSize = '10px';
            pointElement.style.textAlign = 'center';
            pointElement.style.lineHeight = '12px';
            
            container.appendChild(pointElement);
        });
        
        console.log('✅ Fallback points displayed');
    }

    calculateDistance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
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
        
        console.log('🎯 Sending AJAX request for measurement types...');
        console.log('🎯 Template ID:', this.getTemplateId());
        console.log('🎯 Nonce:', templateMeasurementsAjax.nonce);
        console.log('🎯 AJAX URL:', templateMeasurementsAjax.ajax_url);
        
        fetch(templateMeasurementsAjax.ajax_url, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log('🎯 AJAX response status:', response.status);
            console.log('🎯 Response headers:', response.headers);
            
            if (!response.ok) {
                // Try to get response text for debugging
                return response.text().then(text => {
                    console.error('🎯 Response text:', text);
                    throw new Error(`HTTP ${response.status}: ${response.statusText} - ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('🎯 AJAX response data:', data);
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
            console.log('🔄 Using fallback due to AJAX error');
            // Fallback zu CM-Eingabe
            this.showLegacyCMDialog();
        });
    }

    // ✅ NEU: Sofortiger Fallback für AJAX-Probleme
    showLegacyCMDialog() {
        console.log('🔄 Showing legacy CM dialog as fallback');
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
        // Prüfe bestehende Messungen dieses Views - JEDER TYP NUR EINMAL
        const existingTypes = this.getExistingMeasurementTypes(this.currentViewId);
        const availableForSelection = availableTypes.filter(type => !existingTypes.includes(type.key));
        
        if (availableForSelection.length === 0) {
            this.showNotification('❌ Alle verfügbaren Messungstypen wurden bereits für diese Ansicht verwendet. Jeder Messungstyp kann nur einmal verwendet werden.', 'error');
            this.resetMeasurement();
            return;
        }
        
        // ✅ NEU: Intelligente Messungstyp-Auswahl
        const dialogHtml = `
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); max-width: 450px;">
                <h3 style="margin-top: 0; color: #2271b1;">🎯 Was haben Sie gemessen?</h3>
                <p style="margin-bottom: 15px; color: #666;">
                    <strong>Gemessene Distanz:</strong> ${pixelDistance.toFixed(1)} Pixel<br>
                    <small style="color: #999;">Wählen Sie den Messungstyp aus, der am besten zu Ihrer Messung passt.</small>
                </p>
                
                <div style="margin-bottom: 15px;">
                    <label for="measurement-type-select" style="display: block; margin-bottom: 5px; font-weight: 600;">Messungstyp:</label>
                    <select id="measurement-type-select" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                        <option value="">-- Bitte wählen Sie einen Messungstyp --</option>
                        ${availableForSelection.map(type => 
                            `<option value="${type.key}">${type.label}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div id="measurement-preview" style="display: none; background: #f8f9fa; padding: 10px; border-radius: 4px; margin-bottom: 15px; font-size: 12px;">
                    <strong>Vorschau:</strong> <span id="preview-text"></span>
                </div>
                
                <div style="text-align: right;">
                    <button type="button" onclick="window.templateMeasurements.cancelMeasurementTypeDialog()" 
                            style="margin-right: 10px; padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Abbrechen
                    </button>
                    <button type="button" id="confirm-measurement-btn" onclick="window.templateMeasurements.confirmMeasurementType(${pixelDistance}, '${color}')" 
                            style="padding: 8px 16px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer; opacity: 0.5;" disabled>
                        Speichern
                    </button>
                </div>
            </div>
        `;
        
        // Zeige Dialog
        this.showModal(dialogHtml);
        
        // Event Listener für Select-Change hinzufügen
        setTimeout(() => {
            const select = document.getElementById('measurement-type-select');
            const confirmBtn = document.getElementById('confirm-measurement-btn');
            const preview = document.getElementById('measurement-preview');
            const previewText = document.getElementById('preview-text');
            
            if (select && confirmBtn) {
                select.addEventListener('change', (e) => {
                    const selectedType = e.target.value;
                    
                    if (selectedType) {
                        // Button aktivieren
                        confirmBtn.disabled = false;
                        confirmBtn.style.opacity = '1';
                        
                        // Preview anzeigen
                        const selectedOption = e.target.options[e.target.selectedIndex];
                        preview.style.display = 'block';
                        previewText.textContent = `Sie haben "${selectedOption.text}" ausgewählt. Das System wird automatisch die entsprechenden Größenwerte aus der Produktdimensionen-Tabelle verwenden.`;
                    } else {
                        // Button deaktivieren
                        confirmBtn.disabled = true;
                        confirmBtn.style.opacity = '0.5';
                        preview.style.display = 'none';
                    }
                });
            }
        }, 100);
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
        console.log('🎯 saveMeasurementWithType called:', { measurementType, pixelDistance, color });
        
        // ✅ NEU: Intelligente Messung mit Größen-spezifischen Faktoren
        const measurementData = {
            type: measurementType,
            measurement_type: measurementType,
            pixel_distance: pixelDistance,
            color: color,
            points: this.tempPoints,
            created_at: new Date().toISOString(),
            is_validated: true,
            // NEU: Größen-spezifische Faktoren werden vom Backend berechnet
            size_scale_factors: {}, // Wird vom Backend gefüllt
            reference_sizes: [] // Wird vom Backend gefüllt
        };
        
        // ✅ NEU: Speichere Messung in der Datenbank über AJAX
        this.saveMeasurementToDatabase(this.currentViewId, measurementData, (success) => {
            if (success) {
                // Erstelle Mess-Element mit Typ-Information
                this.createVisibleMeasurementElement(this.currentViewId, measurementData);
                
                // ✅ NEU: Erfolgsmeldung mit Details
                const successMessage = `✅ ${measurementType.toUpperCase()}-Messung erfolgreich gespeichert!
📏 Pixel: ${pixelDistance.toFixed(1)} px
🎯 Typ: ${measurementType}
💡 Das System verwendet automatisch die Größenwerte aus der Produktdimensionen-Tabelle`;
                
                this.showNotification(successMessage, 'success');
            } else {
                this.showNotification('❌ Fehler beim Speichern der Messung in der Datenbank', 'error');
            }
            this.resetMeasurement();
        });
    }
    
    // ✅ NEU: AJAX-Funktion zum Speichern in der Datenbank
    saveMeasurementToDatabase(viewId, measurementData, callback) {
        console.log('🎯 saveMeasurementToDatabase called:', { viewId, measurementData });
        
        const templateId = this.getTemplateId();
        const nonce = window.templateMeasurementsAjax?.nonce || '813d90d822';
        const ajaxUrl = window.templateMeasurementsAjax?.ajax_url || '/wp-admin/admin-ajax.php';
        
        const formData = new FormData();
        formData.append('action', 'save_measurement_to_database');
        formData.append('nonce', nonce);
        formData.append('template_id', templateId);
        formData.append('view_id', viewId);
        formData.append('measurement_data', JSON.stringify(measurementData));
        
        fetch(ajaxUrl, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log('🎯 Save measurement response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('🎯 Save measurement response data:', data);
            if (data.success) {
                console.log('✅ Measurement saved to database successfully');
                callback(true);
            } else {
                console.error('❌ Failed to save measurement to database:', data.data?.message || 'Unknown error');
                callback(false);
            }
        })
        .catch(error => {
            console.error('❌ Error saving measurement to database:', error);
            callback(false);
        });
    }

    createVisibleMeasurementElement(viewId, measurement) {
        console.log('🎯 Creating visible measurement element:', measurement);
        
        try {
            // 1. Finde den Container für bestehende Messungen
            const container = this.findMeasurementContainer(viewId);
            if (!container) {
                console.error('❌ Measurement container not found for viewId:', viewId);
                return;
            }
            
            // 2. Berechne nächsten Index
            const nextIndex = this.getNextMeasurementIndex(viewId);
            
            // 3. Erstelle das neue Messungs-Element
            const measurementElement = this.createMeasurementHTML(viewId, measurement, nextIndex);
            
            // 4. Füge es zum Container hinzu
            container.appendChild(measurementElement);
            
            // 5. Aktualisiere die "No measurements" Nachricht falls vorhanden
            this.updateNoMeasurementsMessage(container);
            
            console.log('✅ Measurement element successfully added to DOM');
            
        } catch (error) {
            console.error('❌ Error creating visible measurement element:', error);
        }
    }
    
    findMeasurementContainer(viewId) {
        // Suche nach dem Container für bestehende Messungen
        const selectors = [
            `.existing-measurements`,
            `.measurements-list`,
            `[data-view-id="${viewId}"] .existing-measurements`,
            `[data-view-id="${viewId}"] .measurements-list`
        ];
        
        for (let selector of selectors) {
            const container = document.querySelector(selector);
            if (container) {
                return container;
            }
        }
        
        // Fallback: Suche nach dem View-Container
        const viewContainer = document.querySelector(`[data-view-id="${viewId}"]`);
        if (viewContainer) {
            // Erstelle einen neuen Container falls keiner existiert
            let measurementsList = viewContainer.querySelector('.measurements-list');
            if (!measurementsList) {
                measurementsList = document.createElement('div');
                measurementsList.className = 'measurements-list';
                viewContainer.appendChild(measurementsList);
            }
            return measurementsList;
        }
        
        return null;
    }
    
    createMeasurementHTML(viewId, measurement, index) {
        const measurementType = measurement.measurement_type || measurement.type;
        const pixelDistance = measurement.pixel_distance;
        const color = measurement.color || '#ff4444';
        
        // Erstelle das HTML-Element
        const element = document.createElement('div');
        element.className = 'measurement-item';
        element.setAttribute('data-index', index);
        element.setAttribute('data-measurement-type', measurementType);
        element.style.cssText = `
            background: #fff; 
            padding: 12px; 
            border-radius: 4px; 
            border-left: 4px solid ${color}; 
            margin-bottom: 8px;
        `;
        
        // Hole Messungs-Labels
        const measurementLabels = this.getMeasurementLabels();
        const label = measurementLabels[measurementType] || measurementType;
        
        element.innerHTML = `
            <div class="measurement-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div class="measurement-info" style="flex: 1;">
                    <div style="display: flex; align-items: center; margin-bottom: 5px;">
                        <span style="font-weight: 600; color: #495057; margin-right: 10px;">
                            ${label}
                        </span>
                        <span style="font-size: 11px; color: #666; background: #f8f9fa; padding: 2px 6px; border-radius: 3px;">
                            ${measurementType}
                        </span>
                    </div>
                    <div class="measurement-stats" style="font-size: 11px; color: #666;">
                        <span class="pixel-distance">
                            Pixel: ${pixelDistance.toFixed(1)} px
                        </span>
                        <span class="separator" style="margin: 0 8px;">•</span>
                        <span class="created-at">
                            ${new Date().toLocaleString('de-DE')}
                        </span>
                    </div>
                </div>
                <div class="measurement-actions">
                    <button type="button" class="button button-small delete-measurement-btn" 
                            data-index="${index}"
                            style="color: #d63384;">
                        <span class="dashicons dashicons-trash" style="font-size: 14px;"></span>
                    </button>
                </div>
            </div>
            
            <!-- Hidden Fields für Form-Submission -->
            <input type="hidden" name="view_print_areas[${viewId}][measurements][${index}][type]" 
                   value="${measurementType}" />
            <input type="hidden" name="view_print_areas[${viewId}][measurements][${index}][pixel_distance]" 
                   value="${pixelDistance}" />
            <input type="hidden" name="view_print_areas[${viewId}][measurements][${index}][color]" 
                   value="${color}" />
            <input type="hidden" name="view_print_areas[${viewId}][measurements][${index}][points]" 
                   value='${JSON.stringify(measurement.points || [])}' />
        `;
        
        return element;
    }
    
    getMeasurementLabels() {
        return {
            'chest': 'Chest / Brustumfang',
            'height_from_shoulder': 'Height from Shoulder',
            'sleeve_length': 'Sleeve Length',
            'biceps': 'Biceps',
            'shoulder_to_shoulder': 'Shoulder to Shoulder',
            'hem_width': 'Hem Width',
            'waist': 'Waist',
            'hip': 'Hip',
            'length': 'Total Length'
        };
    }
    
    updateNoMeasurementsMessage(container) {
        // Entferne "No measurements" Nachricht falls vorhanden
        const noMeasurements = container.querySelector('.no-measurements');
        if (noMeasurements) {
            noMeasurements.remove();
        }
    }

    getAvailableSizes() {
        // Vereinfachte Implementierung
        return ['S', 'M', 'L', 'XL'];
    }

    getNextMeasurementIndex(viewId) {
        // Finde alle bestehenden Messungen für diese View
        const existingMeasurements = document.querySelectorAll(`[data-view-id="${viewId}"] .measurement-item`);
        
        if (existingMeasurements.length === 0) {
            return 0;
        }
        
        // Finde den höchsten Index
        let maxIndex = -1;
        existingMeasurements.forEach(item => {
            const index = parseInt(item.getAttribute('data-index') || '0');
            if (index > maxIndex) {
                maxIndex = index;
            }
        });
        
        return maxIndex + 1;
    }

    getExistingMeasurementTypes(viewId) {
        const container = document.querySelector(`[data-view-id="${viewId}"] .measurements-list`);
        if (!container) return [];
        
        const measurements = container.querySelectorAll('.measurement-item');
        return Array.from(measurements).map(item => item.dataset.measurementType).filter(Boolean);
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

    getTemplateId() {
        // Hole Template ID aus der URL oder einem versteckten Feld
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('post') || document.querySelector('input[name="post_ID"]')?.value || 0;
        
        console.log('🎯 getTemplateId() called, returning:', postId);
        
        // Fallback: Versuche aus der Seite zu extrahieren
        if (!postId || postId === '0') {
            // Suche nach Template ID in der Seite
            const templateIdElement = document.querySelector('[data-template-id]');
            if (templateIdElement) {
                const fallbackId = templateIdElement.getAttribute('data-template-id');
                console.log('🎯 Using fallback template ID:', fallbackId);
                return fallbackId;
            }
            
            // Letzter Fallback: Verwende 1 für Tests
            console.log('🎯 Using test template ID: 1');
            return 1;
        }
        
        return postId;
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

    // ✅ NEUE FUNKTIONEN FÜR DAS LÖSCHEN VON MESSUNGEN
    
    isDeleteMeasurementButton(element) {
        if (!element) return false;
        
        // 1. Direkte CSS-Klasse prüfen
        if (element.classList && element.classList.contains('delete-measurement-btn')) {
            return true;
        }
        
        // 2. Parent-Element prüfen
        if (element.parentElement && element.parentElement.classList && 
            element.parentElement.classList.contains('delete-measurement-btn')) {
            return true;
        }
        
        // 3. Icon-Prüfung (dashicons-trash)
        if (element.classList && element.classList.contains('dashicons-trash')) {
            return true;
        }
        
        // 4. Text-Inhalt prüfen
        if (element.textContent && element.textContent.includes('trash')) {
            return true;
        }
        
        return false;
    }
    
    findMeasurementIndex(element) {
        let current = element;
        let attempts = 0;
        
        while (current && attempts < 10) {
            // 1. Direkte data-index Attribute
            if (current.dataset && current.dataset.index) {
                return current.dataset.index;
            }
            
            // 2. Standard data-index Attribute
            const index = current.getAttribute('data-index');
            if (index) {
                return index;
            }
            
            // 3. Suche in Parent-Elementen
            current = current.parentElement;
            attempts++;
        }
        
        return null;
    }
    
    deleteMeasurement(index) {
        console.log('🎯 deleteMeasurement called with index:', index);
        
        try {
            // 1. Finde das Measurement-Item
            const measurementItem = document.querySelector(`[data-index="${index}"]`);
            if (!measurementItem) {
                console.error('❌ Measurement item not found for index:', index);
                return;
            }
            
            // 2. Finde den Container (measurement-image-wrapper oder ähnlich)
            const container = measurementItem.closest('.measurement-image-wrapper') || 
                             measurementItem.closest('.visual-measurement-container') ||
                             measurementItem.closest('.existing-measurements') ||
                             measurementItem.parentElement;
            
            if (!container) {
                console.error('❌ Container not found for measurement item');
                return;
            }
            
            // 3. Entferne das Measurement-Item
            measurementItem.remove();
            
            // 4. Entferne zugehörige visuelle Elemente (Linien, Punkte)
            this.removeVisualElements(index);
            
            // 5. Zeige Bestätigung
            this.showNotification('✅ Messung erfolgreich gelöscht', 'success');
            
            console.log('✅ Measurement deleted successfully');
            
        } catch (error) {
            console.error('❌ Error deleting measurement:', error);
            this.showNotification('❌ Fehler beim Löschen der Messung', 'error');
        }
    }
    
    removeVisualElements(index) {
        // Entferne Linien und Punkte für diese Messung
        const lines = document.querySelectorAll(`[data-measurement-index="${index}"]`);
        lines.forEach(line => line.remove());
        
        // Entferne Punkte (falls vorhanden)
        const points = document.querySelectorAll(`[data-measurement-index="${index}"]`);
        points.forEach(point => point.remove());
    }

} // ✅ KLASSE RICHTIG GESCHLOSSEN

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

// Initialisierung
console.log('🎯 Initializing YPrint Template Measurements');
if (typeof window.YPrintTemplateMeasurements !== 'undefined') {
    window.templateMeasurements = new YPrintTemplateMeasurements();
    console.log('✅ Template Measurements initialized immediately');
} else {
    console.log('🎯 YPrint Template Measurements Script Ende erreicht'); 
}

} // Ende der if-Überprüfung für bereits geladene Klasse 
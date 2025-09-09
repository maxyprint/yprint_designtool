/**
 * YPrint Template Measurements - REPARIERTE VERSION
 * VERSION: 2024-12-19-FUNCTION-FIX
 */

console.log('🎯 YPrint Template Measurements JavaScript wird geladen... VERSION: 2024-12-19-FUNCTION-FIX');

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
        this.instanceId = 'instance_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        console.log('🎯 Instance ID created:', this.instanceId);
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) {
            console.log('⚠️ Already initialized, skipping');
            return;
        }
        
        // Prüfe ob bereits eine andere Instanz existiert
        if (window.templateMeasurements && window.templateMeasurements !== this) {
            console.log('⚠️ Another instance already exists, destroying this one');
            console.log('⚠️ Existing instance ID:', window.templateMeasurements.instanceId);
            console.log('⚠️ This instance ID:', this.instanceId);
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
    
    // ✅ BROWSER-CACHE-FIX: Alias für die alte Funktion
    loadMeasurementsFromDatabase() {
        console.log('🔧 loadMeasurementsFromDatabase aufgerufen - verwende loadSavedMeasurementsPromise');
        return this.loadSavedMeasurementsPromise();
    }
    
    // ✅ NEU: Promise-basierte Version für loadSavedMeasurements
    loadSavedMeasurementsPromise() {
        return new Promise((resolve, reject) => {
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
            .then(response => response.json())
            .then(data => {
                if (data.success && data.data && data.data.measurements) {
                    resolve(data.data.measurements);
                } else {
                    resolve({});
                }
            })
            .catch(error => {
                console.error('❌ Error loading measurements from database:', error);
                reject(error);
            });
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
            console.log('🎯 Found measurement index:', index);
            
            if (index !== null) {
                this.deleteMeasurement(index);
            } else {
                console.error('❌ Could not find measurement index for delete button');
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
        
        // Setze aktuellen Messungs-Index für visuelle Elemente
        this.currentMeasurementIndex = Date.now(); // Temporärer Index
        
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
            lineElement.setAttribute('data-measurement-index', this.currentMeasurementIndex || 'temp');
            lineElement.setAttribute('data-measurement-overlay', 'true');
            
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
        // ✅ VERBESSERTE PRÜFUNG: Warte auf AJAX-Objekt und DOM
        const checkAjaxAvailability = () => {
            if (typeof templateMeasurementsAjax === 'undefined' && typeof window.templateMeasurementsAjax === 'undefined') {
                console.error('templateMeasurementsAjax not defined, using fallback');
                this.showLegacyCMDialog();
                return false;
            }
            
            // DOM-Sicherheitsprüfung hinzugefügt
            if (!document.body) {
                console.warn('DOM not ready, retrying in 100ms...');
                setTimeout(() => this.getAvailableMeasurementTypes(callback), 100);
                return false;
            }
            
            return true;
        };
        
        if (!checkAjaxAvailability()) return;
        
        // Verwende window-Objekt als Fallback
        const ajaxVars = window.templateMeasurementsAjax || templateMeasurementsAjax;
        
        const formData = new FormData();
        formData.append('action', 'get_available_measurement_types');
        formData.append('nonce', ajaxVars.nonce);
        formData.append('template_id', this.getTemplateId());
        
        console.log('🎯 Sending AJAX request for measurement types...');
        console.log('🎯 Template ID:', this.getTemplateId());
        console.log('🎯 Nonce:', ajaxVars.nonce);
        console.log('🎯 AJAX URL:', ajaxVars.ajax_url);
        
        fetch(ajaxVars.ajax_url, {
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
                
                // Aktualisiere visuelle Elemente mit dem richtigen Index
                this.updateVisualElementsIndex(this.currentMeasurementIndex, measurementData.index || this.currentMeasurementIndex);
                
                // ✅ NEU: Erfolgsmeldung mit Details
                const successMessage = `✅ ${measurementType.toUpperCase()}-Messung erfolgreich gespeichert!
📏 Pixel: ${pixelDistance.toFixed(1)} px
🎯 Typ: ${measurementType}
💡 Das System verwendet automatisch die Größenwerte aus der Produktdimensionen-Tabelle
🔄 Seite wird in 2 Sekunden neu geladen...`;
                
                this.showNotification(successMessage, 'success');
                
                // ✅ FIX: Page-Reload komplett entfernt - DOM-Duplikate werden anders verhindert
                console.log('💡 DOM element added - no page reload needed');
                // Page reload komplett entfernt
                
            } else {
                this.showNotification('❌ Fehler beim Speichern der Messung in der Datenbank', 'error');
            }
            this.resetMeasurement();
        });
    }
    
    // ✅ REPARIERT: AJAX-Funktion zum Speichern in der Datenbank
    saveMeasurementToDatabase(viewId, measurementData, callback) {
        console.log('🔍 KOORDINATEN-DEBUG: saveMeasurementToDatabase aufgerufen');
        console.log('View ID:', viewId);
        console.log('Original measurementData:', measurementData);
        
        // ✅ Verhindere doppelte Speicherung durch Race Condition Check
        if (this.isSaving) {
            console.warn('⚠️ Speicher-Prozess bereits aktiv - überspringe Duplikat');
            return;
        }
        this.isSaving = true;
        
        // Canvas-Dimensionen erfassen
        const canvas = this.getCanvasForView(viewId);
        const canvasRect = canvas ? canvas.getBoundingClientRect() : null;
        
        console.log('🎯 Canvas-Info für View ' + viewId + ':', {
            element: canvas,
            currentRect: canvasRect,
            computedStyle: canvas ? window.getComputedStyle(canvas) : null
        });
        
        // ✅ REPARATUR: Warte auf Template-Basis-Dimensionen BEVOR Speicherung
        console.log('🎯 Template-Basis-Dimensionen aus _template_view_print_areas:');
        this.loadTemplateBaseDimensions(viewId).then(baseDimensions => {
            console.log('Basis-Dimensionen:', baseDimensions);
            
            // ✅ REPARATUR: Koordinaten-Normalisierung mit tatsächlicher Anwendung
            if (measurementData.points && canvasRect && baseDimensions) {
                console.log('🔄 KOORDINATEN-NORMALISIERUNG:');
                
                // Normalisiere alle Punkte und überschreibe measurementData
                measurementData.points = measurementData.points.map((point, index) => {
                    console.log(`Punkt ${index + 1}:`);
                    console.log('  Original (Canvas):', point);
                    console.log('  Canvas-Größe:', canvasRect.width + 'x' + canvasRect.height);
                    console.log('  Template-Basis:', baseDimensions.width + 'x' + baseDimensions.height);
                    
                    // ✅ KORRIGIERTE Koordinaten-Normalisierung
                    // Problem: Klick-Koordinaten sind relativ zum Canvas (300x150), nicht zum Bild (304x304)
                    // Lösung: Verwende Canvas-Dimensionen für Normalisierung
                    
                    console.log('🔧 KORRIGIERTE Koordinaten-Normalisierung:');
                    console.log('  Canvas-Größe:', canvasRect.width + 'x' + canvasRect.height);
                    console.log('  Template-Basis:', baseDimensions.width + 'x' + baseDimensions.height);
                    
                    // Direkte Canvas-zu-Template Normalisierung (KEIN Bild-Element)
                    const normalizedX = (point.x / canvasRect.width) * baseDimensions.width;
                    const normalizedY = (point.y / canvasRect.height) * baseDimensions.height;
                    
                    console.log('  Direkte Normalisierung: (' + point.x + '/' + canvasRect.width + ') * ' + baseDimensions.width);
                    console.log('  X: ' + point.x + ' → ' + normalizedX);
                    console.log('  Y: ' + point.y + ' → ' + normalizedY);
                    
                    // Berechne auch displayX/displayY normalisiert
                    const normalizedDisplayX = (point.displayX / canvasRect.width) * baseDimensions.width;
                    const normalizedDisplayY = (point.displayY / canvasRect.height) * baseDimensions.height;
                    
                    console.log('  Normalisierungs-Basis: Canvas ' + canvasRect.width + 'x' + canvasRect.height);
                    console.log('  Y-Berechnung: ' + point.y + ' / ' + canvasRect.height + ' * ' + baseDimensions.height);
                    
                    // Gültigkeitsprüfung für normalisierte Koordinaten
                    if (normalizedX < 0 || normalizedX > baseDimensions.width) {
                        console.warn('⚠️ Normalisierte X-Koordinate außerhalb Bereich:', normalizedX);
                    }
                    if (normalizedY < 0 || normalizedY > baseDimensions.height) {
                        console.warn('⚠️ Normalisierte Y-Koordinate außerhalb Bereich:', normalizedY);
                    }
                    
                    // Clamp Koordinaten auf gültigen Bereich
                    const clampedX = Math.max(0, Math.min(baseDimensions.width, normalizedX));
                    const clampedY = Math.max(0, Math.min(baseDimensions.height, normalizedY));
                    
                    const normalizedPoint = {
                        x: Math.round(clampedX),
                        y: Math.round(clampedY),
                        displayX: normalizedDisplayX,
                        displayY: normalizedDisplayY
                    };
                    
                    console.log('  Original normalisiert:', {x: normalizedX, y: normalizedY});
                    console.log('  Nach Clamping:', normalizedPoint);
                    
                    console.log('  Normalisiert (Template):', normalizedPoint);
                    console.log('  Normalisierungs-Faktoren:', {
                        x: baseDimensions.width / canvasRect.width,
                        y: baseDimensions.height / canvasRect.height
                    });
                    
                    return normalizedPoint;
                });
                
                // ✅ KORRIGIERTE Pixel-Distance-Normalisierung
                // Verwende die tatsächlich berechnete Distanz zwischen normalisierten Punkten
                const originalPixelDistance = measurementData.pixel_distance;
                const normalizedDistance = Math.sqrt(
                    Math.pow(measurementData.points[1].x - measurementData.points[0].x, 2) + 
                    Math.pow(measurementData.points[1].y - measurementData.points[0].y, 2)
                );
                measurementData.pixel_distance = normalizedDistance;
                
                console.log('🔧 Pixel-Distance korrigiert:');
                console.log('  Original Distance:', originalPixelDistance);
                console.log('  Berechnet aus normalisierten Punkten:', normalizedDistance);
                
                console.log('✅ Koordinaten erfolgreich normalisiert auf Template-Basis');
                console.log('Neue pixel_distance:', measurementData.pixel_distance);
                
                // WICHTIG: Übernehme die normalisierten Daten zurück in measurementData
                console.log('📝 Übernehme normalisierte Koordinaten in measurementData');
                console.log('Vor Normalisierung:', JSON.stringify(measurementData.points, null, 2));
                
                // Die normalisierten Punkte sind bereits in measurementData.points gespeichert
                // durch die .map() Operation oben
                console.log('Nach Normalisierung:', JSON.stringify(measurementData.points, null, 2));
            }
            
            // ✅ REPARATUR: Jetzt erst die Canvas-Kontextualisierung
        const enrichedMeasurementData = this.enrichMeasurementWithCanvasContext(measurementData);
        console.log('🎯 Canvas-kontextualisierte Messungs-Daten:', enrichedMeasurementData);
        
        const templateId = this.getTemplateId();
        const nonce = window.templateMeasurementsAjax?.nonce || '813d90d822';
        const ajaxUrl = window.templateMeasurementsAjax?.ajax_url || '/wp-admin/admin-ajax.php';
        
        const formData = new FormData();
        formData.append('action', 'save_measurement_to_database');
        formData.append('nonce', nonce);
        formData.append('template_id', templateId);
        formData.append('view_id', viewId);
        formData.append('measurement_data', JSON.stringify(enrichedMeasurementData));
        
        // ✅ NEU: Füge Canvas-Kontext als separate Parameter hinzu
        formData.append('canvas_width', enrichedMeasurementData.canvas_width);
        formData.append('canvas_height', enrichedMeasurementData.canvas_height);
        formData.append('device_type', enrichedMeasurementData.device_type);
        
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
                
                // ✅ NEU: Verarbeite Canvas-System Debug-Info aus der Response
                if (data.data && data.data.debug_info) {
                    console.log('YPrint Canvas: 📊 Canvas-System Response-Info:', data.data.debug_info);
                }
                
                callback(true);
            } else {
                console.error('❌ Failed to save measurement to database:', data.data?.message || 'Unknown error');
                callback(false);
            }
        })
        .catch(error => {
            console.error('❌ Error saving measurement to database:', error);
            callback(false);
        })
        .finally(() => {
            this.isSaving = false;
            console.log('🔄 Speicher-Lock freigegeben');
        });
            
        }).catch(error => {
            console.error('❌ Error loading template base dimensions:', error);
            // Fallback: Speichere ohne Normalisierung
            console.log('🔄 Fallback: Speichere ohne Koordinaten-Normalisierung');
            this.isSaving = false;
            console.log('🔄 Speicher-Lock freigegeben (Fallback)');
            
            const enrichedMeasurementData = this.enrichMeasurementWithCanvasContext(measurementData);
            console.log('🎯 Canvas-kontextualisierte Messungs-Daten (Fallback):', enrichedMeasurementData);
            
            const templateId = this.getTemplateId();
            const nonce = window.templateMeasurementsAjax?.nonce || '813d90d822';
            const ajaxUrl = window.templateMeasurementsAjax?.ajax_url || '/wp-admin/admin-ajax.php';
            
            const formData = new FormData();
            formData.append('action', 'save_measurement_to_database');
            formData.append('nonce', nonce);
            formData.append('template_id', templateId);
            formData.append('view_id', viewId);
            formData.append('measurement_data', JSON.stringify(enrichedMeasurementData));
            
            formData.append('canvas_width', enrichedMeasurementData.canvas_width);
            formData.append('canvas_height', enrichedMeasurementData.canvas_height);
            formData.append('device_type', enrichedMeasurementData.device_type);
            
            fetch(ajaxUrl, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('✅ Measurement saved to database successfully (Fallback)');
                    callback(true);
                } else {
                    console.error('❌ Failed to save measurement to database (Fallback):', data.data?.message || 'Unknown error');
                    callback(false);
                }
            })
            .catch(error => {
                console.error('❌ Error saving measurement to database (Fallback):', error);
                callback(false);
            });
        });
    }

    // Neue Hilfsfunktion hinzufügen
    loadTemplateBaseDimensions(viewId) {
        return new Promise((resolve, reject) => {
            const templateId = this.getTemplateId();
            const nonce = window.templateMeasurementsAjax?.nonce || '813d90d822';
            const ajaxUrl = window.templateMeasurementsAjax?.ajax_url || '/wp-admin/admin-ajax.php';
            
            fetch(ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'load_template_base_dimensions',
                    template_id: templateId,
                    view_id: viewId,
                    nonce: nonce
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    resolve(data.data);
                } else {
                    reject(new Error('Failed to load base dimensions'));
                }
            })
            .catch(reject);
        });
    }

    getCanvasForView(viewId) {
        // Suche nach Canvas-Element für spezifische View
        const selectors = [
            `[data-view-id="${viewId}"] canvas`,
            `[data-view-id="${viewId}"] .fabric-canvas-wrapper canvas`,
            `[data-view-id="${viewId}"] .design-canvas`,
            `canvas[data-view-id="${viewId}"]`
        ];
        
        for (let selector of selectors) {
            const canvas = document.querySelector(selector);
            if (canvas) {
                return canvas;
            }
        }
        
        // Fallback: Ersten verfügbaren Canvas verwenden
        return document.querySelector('canvas') || document.querySelector('.fabric-canvas-wrapper canvas');
    }

    createVisibleMeasurementElement(viewId, measurement) {
        console.log('🔍 DOM-DEBUG: createVisibleMeasurementElement aufgerufen');
        console.log('View ID:', viewId);
        console.log('Measurement Data:', measurement);
        
        // Prüfe existierende Messungen im DOM
        const existingElements = document.querySelectorAll(`[data-view-id="${viewId}"][data-measurement-type="${measurement.measurement_type || measurement.type}"]`);
        console.log('🔍 Existierende DOM-Elemente für diesen Messungstyp:', existingElements.length);
        existingElements.forEach((el, index) => {
            console.log(`  Element ${index + 1}:`, el);
            console.log('  Data attributes:', el.dataset);
        });
        
        // Prüfe Database-State vs DOM-State
        // ✅ ROBUSTE LÖSUNG: Direkte Implementierung falls Funktion nicht existiert
        const loadMeasurements = this.loadMeasurementsFromDatabase || this.loadSavedMeasurementsPromise || (() => Promise.resolve({}));
        loadMeasurements.call(this).then(dbMeasurements => {
            const viewMeasurements = dbMeasurements[viewId] || {measurements: []};
            console.log('🔍 Database-Messungen für View ' + viewId + ':', viewMeasurements.measurements.length);
            console.log('🔍 DOM-Messungen für View ' + viewId + ':', existingElements.length);
            
            if (viewMeasurements.measurements.length !== existingElements.length) {
                console.warn('⚠️ INCONSISTENCY: Database vs DOM mismatch!');
                console.warn('Database:', viewMeasurements.measurements);
                console.warn('DOM Elements:', existingElements);
            }
        }).catch(error => {
            console.log('ℹ️ Database check skipped due to error:', error.message);
        });
        
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
            
            // ✅ FIX: Page-Refresh entfernt - DOM-Synchronisation erfolgt direkt
            console.log('💡 DOM element added - no page reload needed');
            
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
        element.setAttribute('data-view-id', viewId);
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
        
        // 5. Suche nach Button mit data-index Attribut in der Nähe
        let current = element;
        let attempts = 0;
        while (current && attempts < 5) {
            if (current.tagName === 'BUTTON' && current.getAttribute('data-index')) {
                return true;
            }
            current = current.parentElement;
            attempts++;
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
        
        // 4. Fallback: Suche nach dem nächsten Button mit data-index
        const nearbyButtons = document.querySelectorAll('button[data-index]');
        for (let button of nearbyButtons) {
            if (button.contains(element) || element.contains(button)) {
                return button.getAttribute('data-index');
            }
        }
        
        return null;
    }
    
    deleteMeasurement(index) {
        console.log('🎯 deleteMeasurement called with index:', index);
        console.log('🎯 Current instance:', this);
        console.log('🎯 Instance ID:', this.instanceId || 'no-id');
        
        try {
            // **ROBUSTE MESSUNG-SUCHE - MEHRERE METHODEN**
            let measurementItem = null;
            let viewId = null;
            
            // Methode 1: Direkte Suche nach data-index
            measurementItem = document.querySelector(`[data-index="${index}"]`);
            console.log('🎯 Method 1 - Direct data-index search:', measurementItem);
            
            // Methode 2: Suche nach measurement-item mit data-index
            if (!measurementItem) {
                measurementItem = document.querySelector(`.measurement-item[data-index="${index}"]`);
                console.log('🎯 Method 2 - measurement-item with data-index:', measurementItem);
            }
            
            // Methode 3: Suche nach Delete-Button und finde Parent
            if (!measurementItem) {
                const deleteButton = document.querySelector(`button[data-index="${index}"]`);
                console.log('🎯 Method 3 - Delete button search:', deleteButton);
                if (deleteButton) {
                    measurementItem = deleteButton.closest('.measurement-item') || deleteButton.closest('[data-index]');
                    console.log('🎯 Method 3 - Found parent from delete button:', measurementItem);
                }
            }
            
            // Methode 4: Suche nach beliebigem Element mit data-index
            if (!measurementItem) {
                measurementItem = document.querySelector(`*[data-index="${index}"]`);
                console.log('🎯 Method 4 - Any element with data-index:', measurementItem);
            }
            
            if (!measurementItem) {
                console.error('❌ Measurement item not found for index:', index);
                this.showNotification('❌ Messung nicht gefunden', 'error');
                return;
            }
            
            console.log('🎯 Final measurement item found:', measurementItem);
            console.log('🎯 Measurement item classes:', measurementItem.className);
            console.log('🎯 Measurement item attributes:', measurementItem.attributes);
            
            // **ROBUSTE VIEW-ID-SUCHE**
            // Methode 1: Direkt vom measurement item
            viewId = measurementItem.getAttribute('data-view-id');
            console.log('🎯 Method 1 - View ID from measurement item:', viewId);
            
            // Methode 2: Von Parent-Elementen
            if (!viewId) {
                let parent = measurementItem.parentElement;
                let depth = 0;
                while (parent && !viewId && depth < 5) {
                    viewId = parent.getAttribute('data-view-id');
                    console.log(`🎯 Method 2 - View ID from parent level ${depth}:`, viewId);
                    parent = parent.parentElement;
                    depth++;
                }
            }
            
            // Methode 3: Von Delete-Button
            if (!viewId) {
                const deleteButton = document.querySelector(`button[data-index="${index}"][data-view-id]`);
                if (deleteButton) {
                    viewId = deleteButton.getAttribute('data-view-id');
                    console.log('🎯 Method 3 - View ID from delete button:', viewId);
                }
            }
            
            // Methode 4: Von beliebigem Element mit data-view-id
            if (!viewId) {
                const anyElementWithViewId = document.querySelector(`[data-view-id]`);
                if (anyElementWithViewId) {
                    viewId = anyElementWithViewId.getAttribute('data-view-id');
                    console.log('🎯 Method 4 - View ID from any element:', viewId);
                }
            }
            
            if (!viewId) {
                console.error('❌ View ID not found for measurement');
                this.showNotification('❌ View-ID nicht gefunden', 'error');
                return;
            }
            
            console.log('🎯 Final view ID:', viewId);
            console.log('🎯 Final index:', index);
            
            // **DATENBANK-LÖSCHUNG**
            this.deleteMeasurementFromDatabase(viewId, index, (success) => {
                console.log('🎯 Database deletion callback:', success);
                if (success) {
                    // **VISUELLE ELEMENTE ENTFERNEN**
                    this.removeVisualElements(index);
                    
                    // **DOM-ELEMENT ENTFERNEN**
                    if (measurementItem && measurementItem.parentNode) {
                        measurementItem.remove();
                        console.log('✅ Measurement item removed from DOM');
                    }
                    
                    // **BENACHRICHTIGUNG**
                    this.showNotification('✅ Messung erfolgreich gelöscht', 'success');
                    
                    // **BEREICHNUNGEN AKTUALISIEREN**
                    if (typeof this.updateCalculations === 'function') {
                        this.updateCalculations();
                    }
                    
                    console.log('✅ Measurement deleted successfully');
                } else {
                    this.showNotification('❌ Fehler beim Löschen der Messung aus der Datenbank', 'error');
                }
            });
            
        } catch (error) {
            console.error('❌ Error deleting measurement:', error);
            console.error('❌ Error stack:', error.stack);
            this.showNotification('❌ Fehler beim Löschen der Messung', 'error');
        }
    }
    
    removeVisualElements(index) {
        try {
            console.log('🎯 Removing visual elements for measurement index:', index);
            
            // **ROBUSTE ENTFERNUNG ALLER VISUELLEN ELEMENTE**
            
            // 1. Entferne Linien für diese Messung
            const lines = document.querySelectorAll(`[data-measurement-index="${index}"]`);
            console.log('🎯 Found lines to remove:', lines.length);
            lines.forEach((line, i) => {
                if (line && line.parentNode) {
                    line.remove();
                    console.log(`✅ Removed line ${i + 1}`);
                }
            });
            
            // 2. Entferne Punkte für diese Messung
            const points = document.querySelectorAll(`[data-measurement-point="${index}"]`);
            console.log('🎯 Found points to remove:', points.length);
            points.forEach((point, i) => {
                if (point && point.parentNode) {
                    point.remove();
                    console.log(`✅ Removed point ${i + 1}`);
                }
            });
            
            // 3. Entferne Overlay-Linien für diese Messung
            const overlayLines = document.querySelectorAll(`[data-measurement-overlay="${index}"]`);
            console.log('🎯 Found overlay lines to remove:', overlayLines.length);
            overlayLines.forEach((line, i) => {
                if (line && line.parentNode) {
                    line.remove();
                    console.log(`✅ Removed overlay line ${i + 1}`);
                }
            });
            
            // 4. Entferne beliebige Elemente mit diesem Index
            const anyElements = document.querySelectorAll(`[data-index="${index}"]`);
            console.log('🎯 Found any elements with data-index to remove:', anyElements.length);
            anyElements.forEach((element, i) => {
                if (element && element.parentNode && element.classList.contains('measurement-visual')) {
                    element.remove();
                    console.log(`✅ Removed visual element ${i + 1}`);
                }
            });
            
            // 5. Entferne Linien mit class-basierten Selektoren
            const classLines = document.querySelectorAll(`.measurement-line[data-index="${index}"]`);
            console.log('🎯 Found class-based lines to remove:', classLines.length);
            classLines.forEach((line, i) => {
                if (line && line.parentNode) {
                    line.remove();
                    console.log(`✅ Removed class-based line ${i + 1}`);
                }
            });
            
            // 6. Entferne Punkte mit class-basierten Selektoren
            const classPoints = document.querySelectorAll(`.measurement-point[data-index="${index}"]`);
            console.log('🎯 Found class-based points to remove:', classPoints.length);
            classPoints.forEach((point, i) => {
                if (point && point.parentNode) {
                    point.remove();
                    console.log(`✅ Removed class-based point ${i + 1}`);
                }
            });
            
            console.log('✅ All visual elements removed for measurement index:', index);
            
        } catch (error) {
            console.warn('⚠️ Error removing visual elements for measurement', index, ':', error);
            console.warn('⚠️ Error stack:', error.stack);
        }
    }
    
    updateVisualElementsIndex(oldIndex, newIndex) {
        try {
            // Aktualisiere alle visuellen Elemente mit dem neuen Index
            const elements = document.querySelectorAll(`[data-measurement-index="${oldIndex}"]`);
            elements.forEach(element => {
                element.setAttribute('data-measurement-index', newIndex);
            });
            
            const pointElements = document.querySelectorAll(`[data-measurement-point="${oldIndex}"]`);
            pointElements.forEach(element => {
                element.setAttribute('data-measurement-point', newIndex);
            });
            
            const overlayElements = document.querySelectorAll(`[data-measurement-overlay="${oldIndex}"]`);
            overlayElements.forEach(element => {
                element.setAttribute('data-measurement-overlay', newIndex);
            });
            
        } catch (error) {
            console.warn('⚠️ Error updating visual elements index:', error);
        }
    }
    
    deleteMeasurementFromDatabase(viewId, index, callback) {
        console.log('🎯 deleteMeasurementFromDatabase called:', { viewId, index });
        
        const templateId = this.getTemplateId();
        const nonce = window.templateMeasurementsAjax?.nonce || '813d90d822';
        const ajaxUrl = window.templateMeasurementsAjax?.ajax_url || '/wp-admin/admin-ajax.php';
        
        console.log('🎯 Using AJAX URL:', ajaxUrl);
        console.log('🎯 Using nonce:', nonce);
        console.log('🎯 Using template ID:', templateId);
        
        const formData = new FormData();
        formData.append('action', 'delete_measurement_from_database');
        formData.append('nonce', nonce);
        formData.append('template_id', templateId);
        formData.append('view_id', viewId);
        formData.append('measurement_index', index);
        
        fetch(ajaxUrl, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log('🎯 Delete measurement response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('🎯 Delete measurement response data:', data);
            if (data.success) {
                console.log('✅ Measurement deleted from database successfully');
                callback(true);
            } else {
                console.error('❌ Failed to delete measurement from database:', data.data?.message || 'Unknown error');
                callback(false);
            }
        })
        .catch(error => {
            console.error('❌ Error deleting measurement from database:', error);
            callback(false);
        });
    }

    /**
     * ===========================
     * NEUE CANVAS-NORMALISIERUNG FRONTEND
     * Implementiert relative Koordinaten und Canvas-Kontextualisierung
     * ===========================
     */

    /**
     * 1. Canvas-Dimensionen erfassen
     */
    getCurrentCanvasDimensions() {
        const canvas = document.querySelector('.fabric-canvas-wrapper canvas') || 
                      document.querySelector('canvas') ||
                      document.querySelector('.design-canvas');
        
        if (canvas) {
            const width = canvas.offsetWidth || canvas.width || 800;
            const height = canvas.offsetHeight || canvas.height || 600;
            
            console.log(`YPrint Canvas: 🎯 Canvas-Dimensionen erfasst: ${width}x${height}`);
            
            return { width, height, element: canvas };
        }
        
        console.warn('YPrint Canvas: ⚠️ Canvas-Element nicht gefunden, verwende Fallback-Dimensionen');
        return { width: 800, height: 600, element: null };
    }

    /**
     * 2. Pixel-Koordinaten zu relativen Koordinaten
     */
    pixelToRelativeCoordinates(pixelX, pixelY, canvasWidth, canvasHeight) {
        if (canvasWidth <= 0 || canvasHeight <= 0) {
            console.error('YPrint Canvas: ❌ Ungültige Canvas-Dimensionen für Normalisierung');
            return { x: 0.0, y: 0.0 };
        }
        
        const relativeX = Math.round((pixelX / canvasWidth) * 1000000) / 1000000; // 6 Dezimalstellen
        const relativeY = Math.round((pixelY / canvasHeight) * 1000000) / 1000000;
        
        // Clipping auf 0.0-1.0
        const clippedX = Math.max(0.0, Math.min(1.0, relativeX));
        const clippedY = Math.max(0.0, Math.min(1.0, relativeY));
        
        console.log(`YPrint Canvas: 🎯 Pixel→Relativ: (${pixelX},${pixelY}) → (${clippedX},${clippedY})`);
        
        return { x: clippedX, y: clippedY };
    }

    /**
     * 3. Relative Koordinaten zu Pixel-Koordinaten
     */
    relativeToPixelCoordinates(relativeX, relativeY, canvasWidth, canvasHeight) {
        const pixelX = Math.round(relativeX * canvasWidth * 100) / 100; // 2 Dezimalstellen
        const pixelY = Math.round(relativeY * canvasHeight * 100) / 100;
        
        console.log(`YPrint Canvas: 🎯 Relativ→Pixel: (${relativeX},${relativeY}) → (${pixelX},${pixelY})`);
        
        return { x: pixelX, y: pixelY };
    }

    /**
     * 4. Messungs-Daten mit Canvas-Kontext erweitern
     */
    enrichMeasurementWithCanvasContext(measurementData) {
        const canvasInfo = this.getCurrentCanvasDimensions();
        
        // Füge Canvas-Kontext hinzu
        measurementData.canvas_width = canvasInfo.width;
        measurementData.canvas_height = canvasInfo.height;
        measurementData.device_type = this.detectDeviceType(canvasInfo.width);
        measurementData.timestamp = new Date().toISOString();
        
        // Normalisiere Koordinaten zu relativen Werten
        if (measurementData.start_point && measurementData.end_point) {
            measurementData.relative_start_point = this.pixelToRelativeCoordinates(
                measurementData.start_point.x,
                measurementData.start_point.y,
                canvasInfo.width,
                canvasInfo.height
            );
            
            measurementData.relative_end_point = this.pixelToRelativeCoordinates(
                measurementData.end_point.x,
                measurementData.end_point.y,
                canvasInfo.width,
                canvasInfo.height
            );
            
            // Berechne relative Distanz
            const dx = measurementData.relative_end_point.x - measurementData.relative_start_point.x;
            const dy = measurementData.relative_end_point.y - measurementData.relative_start_point.y;
            measurementData.relative_distance = Math.sqrt(dx * dx + dy * dy);
            
            console.log(`YPrint Canvas: ✅ Messung mit Canvas-Kontext angereichert - Relative Distanz: ${measurementData.relative_distance}`);
        }
        
        return measurementData;
    }

    /**
     * 5. Device-Type Detection (Frontend)
     */
    detectDeviceType(canvasWidth) {
        if (canvasWidth >= 1200) return 'desktop';
        if (canvasWidth >= 768) return 'tablet';
        return 'mobile';
    }

    /**
     * 6. Canvas-Skalierung für Display berechnen
     */
    calculateDisplayScaling(originalCanvasWidth, originalCanvasHeight) {
        const currentCanvas = this.getCurrentCanvasDimensions();
        
        const widthRatio = currentCanvas.width / originalCanvasWidth;
        const heightRatio = currentCanvas.height / originalCanvasHeight;
        
        console.log(`YPrint Canvas: 🎯 Display-Skalierung - Original: ${originalCanvasWidth}x${originalCanvasHeight}, Aktuell: ${currentCanvas.width}x${currentCanvas.height}, Ratio: ${widthRatio}x${heightRatio}`);
        
        return {
            widthRatio,
            heightRatio,
            originalCanvas: { width: originalCanvasWidth, height: originalCanvasHeight },
            currentCanvas: { width: currentCanvas.width, height: currentCanvas.height }
        };
    }

    /**
     * 7. Gespeicherte Messungen für aktuellen Canvas laden
     */
    loadMeasurementsForCurrentCanvas(savedMeasurements) {
        console.log('YPrint Canvas: 🎯 Lade Messungen für aktuellen Canvas');
        
        const currentCanvas = this.getCurrentCanvasDimensions();
        const displayMeasurements = {};
        
        if (!savedMeasurements || typeof savedMeasurements !== 'object') {
            return displayMeasurements;
        }
        
        Object.keys(savedMeasurements).forEach(viewId => {
            const viewData = savedMeasurements[viewId];
            if (!viewData.measurements || !Array.isArray(viewData.measurements)) {
                return;
            }
            
            displayMeasurements[viewId] = { measurements: [] };
            
            viewData.measurements.forEach(measurement => {
                const displayMeasurement = { ...measurement };
                
                // Konvertiere relative Koordinaten zu aktuellen Pixel-Koordinaten
                if (measurement.relative_start_point && measurement.relative_end_point) {
                    displayMeasurement.display_start_point = this.relativeToPixelCoordinates(
                        measurement.relative_start_point.x,
                        measurement.relative_start_point.y,
                        currentCanvas.width,
                        currentCanvas.height
                    );
                    
                    displayMeasurement.display_end_point = this.relativeToPixelCoordinates(
                        measurement.relative_end_point.x,
                        measurement.relative_end_point.y,
                        currentCanvas.width,
                        currentCanvas.height
                    );
                    
                    displayMeasurement.current_canvas_context = {
                        width: currentCanvas.width,
                        height: currentCanvas.height,
                        device_type: this.detectDeviceType(currentCanvas.width)
                    };
                    
                    console.log(`YPrint Canvas: ✅ Messung für Display konvertiert - View: ${viewId}`);
                }
                
                displayMeasurements[viewId].measurements.push(displayMeasurement);
            });
        });
        
        return displayMeasurements;
    }

    /**
     * 8. Master-Measurement setzen (Frontend-Interface)
     */
    setMasterMeasurement(measurementData) {
        console.log('YPrint Canvas: 🎯 Setze Master-Measurement im Frontend');
        
        const templateId = this.getTemplateId();
        const ajaxVars = window.templateMeasurementsAjax || templateMeasurementsAjax;
        
        const formData = new FormData();
        formData.append('action', 'set_master_measurement');
        formData.append('nonce', ajaxVars.nonce);
        formData.append('template_id', templateId);
        formData.append('measurement_type', measurementData.measurement_type);
        formData.append('relative_distance', measurementData.relative_distance);
        formData.append('physical_distance_cm', measurementData.real_distance_cm);
        
        fetch(ajaxVars.ajax_url, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('YPrint Canvas: ✅ Master-Measurement erfolgreich gesetzt');
                this.showToast('Master-Measurement gesetzt: ' + measurementData.measurement_type, 'success');
            } else {
                console.error('YPrint Canvas: ❌ Fehler beim Setzen der Master-Measurement');
                this.showToast('Fehler beim Setzen der Master-Measurement', 'error');
            }
        })
        .catch(error => {
            console.error('YPrint Canvas: ❌ AJAX-Fehler beim Setzen der Master-Measurement:', error);
        });
    }

    /**
     * 9. Canvas-System Debug (Frontend)
     */
    debugCanvasSystem() {
        console.log('YPrint Canvas: 🔍 Debug Canvas-System (Frontend)');
        
        const templateId = this.getTemplateId();
        const currentCanvas = this.getCurrentCanvasDimensions();
        const ajaxVars = window.templateMeasurementsAjax || templateMeasurementsAjax;
        
        const formData = new FormData();
        formData.append('action', 'debug_canvas_system');
        formData.append('nonce', ajaxVars.nonce);
        formData.append('template_id', templateId);
        formData.append('current_canvas_width', currentCanvas.width);
        formData.append('current_canvas_height', currentCanvas.height);
        
        fetch(ajaxVars.ajax_url, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('YPrint Canvas: 📊 Canvas-System Debug-Info:', data.data);
                
                // Debug-Info in Console ausgeben
                const debugInfo = data.data;
                console.table({
                    'Template ID': debugInfo.template_id,
                    'Canvas Context Valid': debugInfo.canvas_context?.is_valid ? 'Ja' : 'Nein',
                    'Master Measurement': debugInfo.master_measurement?.exists ? 'Ja' : 'Nein',
                    'Total Views': debugInfo.measurements?.total_views || 0,
                    'Canvas Scaling': debugInfo.canvas_scaling ? `${debugInfo.canvas_scaling.width_ratio}x${debugInfo.canvas_scaling.height_ratio}` : 'Nicht verfügbar'
                });
                
                this.showToast('Canvas-System Debug-Info in Console ausgegeben', 'info');
            } else {
                console.error('YPrint Canvas: ❌ Debug-Fehler:', data.data?.message);
            }
        })
        .catch(error => {
            console.error('YPrint Canvas: ❌ AJAX-Fehler beim Debug:', error);
        });
    }

} // ✅ KLASSE RICHTIG GESCHLOSSEN

// Globale Instanz erstellen
window.YPrintTemplateMeasurements = YPrintTemplateMeasurements;

// Globale Initialisierung - Nur EINE Instanz erlauben
window.templateMeasurements = null;

// DOM-Ready-Handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Template Measurements DOM Ready');
    
    // Nur initialisieren wenn noch keine Instanz existiert
    if (!window.templateMeasurements && typeof YPrintTemplateMeasurements !== 'undefined') {
        window.templateMeasurements = new YPrintTemplateMeasurements();
        console.log('✅ Template Measurements initialized (DOM Ready):', window.templateMeasurements);
    } else if (window.templateMeasurements) {
        console.log('⚠️ Template Measurements already exists, skipping duplicate initialization');
    } else {
        console.error('❌ YPrintTemplateMeasurements class not found');
    }
});

// Fallback für spätere Initialisierung
window.initTemplateMinitsIfNeeded = function() {
    if (!window.templateMeasurements && typeof YPrintTemplateMeasurements !== 'undefined') {
        window.templateMeasurements = new YPrintTemplateMeasurements();
        console.log('✅ Template Measurements initialized (fallback)');
    }
};

// ✅ VERBESSERTE INITIALISIERUNG mit DOM und AJAX-Checks
console.log('🎯 Initializing YPrint Template Measurements');

function safeInitialization() {
    // Prüfe DOM-Bereitschaft
    if (!document.body) {
        console.warn('DOM not ready, retrying initialization in 100ms...');
        setTimeout(safeInitialization, 100);
        return;
    }
    
    // Prüfe AJAX-Verfügbarkeit
    if (typeof templateMeasurementsAjax === 'undefined' && typeof window.templateMeasurementsAjax === 'undefined') {
        console.warn('AJAX object not ready, retrying in 100ms...');
        setTimeout(safeInitialization, 100);
        return;
    }
    
    // Sichere Initialisierung
    if (!window.templateMeasurements && typeof YPrintTemplateMeasurements !== 'undefined') {
        try {
            window.templateMeasurements = new YPrintTemplateMeasurements();
            console.log('✅ Template Measurements initialized successfully');
        } catch(error) {
            console.error('❌ Error during initialization:', error);
        }
    } else if (window.templateMeasurements) {
        console.log('⚠️ Template Measurements already exists');
    } else {
        console.error('❌ YPrintTemplateMeasurements class not available');
    }
}

// Starte sichere Initialisierung
safeInitialization();

} // Ende der if-Überprüfung für bereits geladene Klasse 
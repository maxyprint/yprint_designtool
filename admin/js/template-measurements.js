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
        console.log('🎯 Completing measurement with points:', this.tempPoints);
        
        const distance = this.calculateDistance(this.tempPoints[0], this.tempPoints[1]);
        const color = this.colors[this.colorIndex % this.colors.length];
        this.colorIndex++;
        
        console.log('🎯 Calculated distance:', distance, 'px');
        
        // Zeige Ergebnis-Dialog
        const realDistance = prompt(`✅ Messung erfolgreich erstellt!\n\n📏 Pixel-Distanz: ${distance.toFixed(1)} px\n\n📐 Geben Sie die echte Distanz dieser Messung in Zentimetern ein:`, '50.0');
        
        if (realDistance && !isNaN(realDistance) && parseFloat(realDistance) > 0) {
            const scaleFactor = parseFloat(realDistance) / (distance / 10);
            
            this.showNotification(`✅ Messung erfolgreich gespeichert!\n\n📏 Pixel: ${distance.toFixed(1)} px\n📐 Echt: ${realDistance} cm\n⚖️ Skalierung: ${scaleFactor.toFixed(3)} mm/px`, 'success');
            
            // Erstelle sichtbares Mess-Element
            this.createVisibleMeasurementElement(this.currentViewId, {
                type: 'chest',
                pixel_distance: distance,
                real_distance_cm: parseFloat(realDistance),
                scale_factor: scaleFactor,
                color: color,
                points: this.tempPoints
            });
        } else {
            this.showNotification('❌ Messung abgebrochen - ungültige Eingabe', 'error');
        }
        
        // Cleanup
        this.resetMeasurement();
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
        
        // Erstelle sichtbares Mess-Element
        const measurementElement = document.createElement('div');
        measurementElement.className = 'yprint-measurement-result';
        measurementElement.style.cssText = `
            background: linear-gradient(135deg, #e8f4f8 0%, #d4edda 100%);
            padding: 15px;
            margin: 15px 0;
            border-left: 5px solid ${measurement.color};
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
        `;
        
        measurementElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 8px 0; color: #155724; font-size: 16px;">
                        ✅ Neue Messung erstellt
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; font-size: 13px;">
                        <div><strong>📏 Pixel-Distanz:</strong> ${measurement.pixel_distance.toFixed(1)} px</div>
                        <div><strong>📐 Echte Größe:</strong> ${measurement.real_distance_cm} cm</div>
                        <div><strong>⚖️ Skalierungsfaktor:</strong> ${measurement.scale_factor.toFixed(3)} mm/px</div>
                        <div><strong>🎨 Farbe:</strong> <span style="display: inline-block; width: 16px; height: 16px; background: ${measurement.color}; border-radius: 3px; vertical-align: middle; margin-left: 5px;"></span></div>
                    </div>
                    <div style="margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.7); border-radius: 4px; font-size: 12px; color: #666;">
                        <strong>Punkte:</strong> (${measurement.points[0].x}, ${measurement.points[0].y}) → (${measurement.points[1].x}, ${measurement.points[1].y})
                    </div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-left: 15px;">
                    🗑️
                </button>
            </div>
        `;
        
        // Füge Animation CSS hinzu
        if (!document.querySelector('#yprint-measurement-styles')) {
            const styles = document.createElement('style');
            styles.id = 'yprint-measurement-styles';
            styles.textContent = `
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Finde besten Ort zum Einfügen
        this.insertMeasurementElement(measurementElement);
    }
    
    insertMeasurementElement(element) {
        // Verschiedene Einfügestrategien
        
        // 1. Nach Visual Measurements Header
        const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        for (let header of headers) {
            if (header.textContent.includes('Visual Measurements')) {
                header.parentElement.insertBefore(element, header.nextSibling);
                console.log('🎯 Inserted after Visual Measurements header');
                return;
            }
        }
        
        // 2. Nach dem ersten Bild in einem Visual-Container
        const images = document.querySelectorAll('img');
        for (let img of images) {
            const container = img.closest('*');
            if (container && container.textContent.includes('Visual')) {
                container.appendChild(element);
                console.log('🎯 Inserted in visual container');
                return;
            }
        }
        
        // 3. In den ersten gefundenen Container mit measurement-Kontext
        const allContainers = document.querySelectorAll('div');
        for (let container of allContainers) {
            if (container.textContent.includes('measurement') || 
                container.textContent.includes('Measurement')) {
                container.appendChild(element);
                console.log('🎯 Inserted in measurement context container');
                return;
            }
        }
        
        // 4. Fallback: An Body anhängen
        document.body.appendChild(element);
        console.log('🎯 Inserted as fallback to body');
    }
    
    showNotification(message, type = 'info') {
        // Einfache Notification
        const colors = {
            info: '#007cba',
            success: '#00a32a', 
            error: '#d63638'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 400px;
            white-space: pre-line;
            font-size: 14px;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-Remove nach 5 Sekunden
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
        
        // Notification-Animationen
        if (!document.querySelector('#yprint-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'yprint-notification-styles';
            styles.textContent = `
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(100%); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideOutRight {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(100%); }
                }
            `;
            document.head.appendChild(styles);
        }
    }
}

// Globale Instanz erstellen
window.YPrintTemplateMeasurements = YPrintTemplateMeasurements;

// Initialisierung mit verbessertem DOM-Ready-Handling
function initializeYPrintMeasurements() {
    if (window.yprintMeasurementsInstance) {
        console.log('⚠️ YPrint Measurements bereits initialisiert');
        return;
    }
    
    console.log('🎯 Initializing YPrint Template Measurements');
    window.yprintMeasurementsInstance = new YPrintTemplateMeasurements();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeYPrintMeasurements);
} else {
    initializeYPrintMeasurements();
}

} // Ende der if-Überprüfung für bereits geladene Klasse

console.log('🎯 YPrint Template Measurements Script Ende erreicht'); 
/**
 * Template Measurements - Vereinfachte Version für Debug
 */

console.log('🎯 Template Measurements JavaScript wird geladen...');

class TemplateMeasurements {
    constructor() {
        console.log('🎯 TemplateMeasurements Constructor aufgerufen');
        this.currentViewId = null;
        this.measurementMode = false;
        this.tempPoints = [];
        this.colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];
        this.colorIndex = 0;
        
        this.init();
    }
    
    init() {
        console.log('🎯 TemplateMeasurements init() aufgerufen');
        
        // Sofortiger DOM-Check
        this.checkDOM();
        
        // Event-Listeners für Mess-Buttons
        document.addEventListener('click', (e) => {
            console.log('🎯 Click Event detected:', e.target);
            
            // Check für Add Measurement Button
            if (e.target.closest('.add-measurement-btn') || 
                e.target.textContent.includes('Add Measurement') ||
                e.target.innerHTML.includes('Add Measurement')) {
                console.log('🎯 Add Measurement Button clicked!');
                
                // Finde viewId
                let viewId = null;
                if (e.target.dataset.viewId) {
                    viewId = e.target.dataset.viewId;
                } else {
                    // Suche in Parent-Elementen
                    let parent = e.target.closest('[data-view-id]');
                    if (parent) {
                        viewId = parent.dataset.viewId;
                    }
                }
                
                if (viewId) {
                    console.log('🎯 Found viewId:', viewId);
                    this.startMeasurement(viewId);
                } else {
                    console.log('🎯 No viewId found, starting debug mode');
                    this.debugDOM();
                }
            }
        });
        
        // Bild-Klick für Punkt-Platzierung
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG' && this.measurementMode) {
                console.log('🎯 Image clicked in measurement mode!', e.target);
                this.addMeasurementPoint(e);
            }
        });
    }
    
    checkDOM() {
        console.log('🎯 Checking DOM structure...');
        
        // Suche nach Add Measurement Buttons
        const addButtons = document.querySelectorAll('button');
        let measurementButtons = [];
        addButtons.forEach(btn => {
            if (btn.textContent.includes('Add Measurement') || 
                btn.innerHTML.includes('Add Measurement')) {
                measurementButtons.push(btn);
            }
        });
        console.log('🎯 Found potential measurement buttons:', measurementButtons.length);
        measurementButtons.forEach((btn, index) => {
            console.log(`  Button ${index}:`, btn.outerHTML.substring(0, 100) + '...');
        });
        
        // Suche nach measurement images
        const images = document.querySelectorAll('img');
        console.log('🎯 Found images:', images.length);
        images.forEach((img, index) => {
            console.log(`  Image ${index}:`, {
                src: img.src.substring(img.src.lastIndexOf('/') + 1),
                classes: img.className,
                dataAttributes: Object.keys(img.dataset)
            });
        });
        
        // Suche nach visual measurement containers
        const containers = document.querySelectorAll('*');
        let visualContainers = [];
        containers.forEach(el => {
            if (el.textContent && el.textContent.includes('Visual Measurements')) {
                visualContainers.push(el);
            }
        });
        console.log('🎯 Found visual measurement containers:', visualContainers.length);
    }
    
    debugDOM() {
        console.log('🎯 Starting DOM debug...');
        this.checkDOM();
        
        // Erweiterte Suche
        console.log('🎯 All elements with "measurement" in class or text:');
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
            if (el.className && el.className.includes('measurement') || 
                el.textContent && el.textContent.toLowerCase().includes('measurement')) {
                console.log('  Element:', el.tagName, el.className, el.textContent.substring(0, 50));
            }
        });
    }
    
    startMeasurement(viewId) {
        console.log('🎯 Starting measurement for view:', viewId);
        this.currentViewId = viewId;
        this.measurementMode = true;
        this.tempPoints = [];
        
        alert('Messungs-Modus aktiviert für View: ' + viewId + '\n\nKlicken Sie nun 2 Punkte auf das Bild!');
    }
    
    addMeasurementPoint(event) {
        console.log('🎯 Adding measurement point:', event);
        
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
        console.log('🎯 Point added:', point, 'Total points:', this.tempPoints.length);
        
        if (this.tempPoints.length === 2) {
            this.completeMeasurement();
        }
    }
    
    completeMeasurement() {
        console.log('🎯 Completing measurement with points:', this.tempPoints);
        
        const distance = this.calculateDistance(this.tempPoints[0], this.tempPoints[1]);
        const color = this.colors[this.colorIndex % this.colors.length];
        this.colorIndex++;
        
        console.log('🎯 Calculated distance:', distance, 'px');
        
        // Zeige Ergebnis
        const realDistance = prompt(`Messung erfolgreich!\n\nPixel-Distanz: ${distance.toFixed(1)} px\n\nGeben Sie die echte Distanz in cm ein:`);
        
        if (realDistance && !isNaN(realDistance)) {
            const scaleFactor = parseFloat(realDistance) / (distance / 10);
            alert(`Messung gespeichert!\n\nPixel: ${distance.toFixed(1)} px\nEcht: ${realDistance} cm\nSkalierung: ${scaleFactor.toFixed(3)} mm/px`);
            
            // Hier würde normalerweise das Dropdown erstellt werden
            this.createSimpleMeasurementElement(this.currentViewId, {
                type: 'chest',
                pixel_distance: distance,
                real_distance_cm: parseFloat(realDistance),
                scale_factor: scaleFactor,
                color: color,
                points: this.tempPoints
            });
        }
        
        // Reset
        this.measurementMode = false;
        this.tempPoints = [];
        this.currentViewId = null;
    }
    
    calculateDistance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    createSimpleMeasurementElement(viewId, measurement) {
        console.log('🎯 Creating measurement element:', measurement);
        
        // Einfache Anzeige für Test
        const measurementInfo = document.createElement('div');
        measurementInfo.style.cssText = `
            background: #e8f4f8; 
            padding: 10px; 
            margin: 10px 0; 
            border-left: 4px solid ${measurement.color}; 
            border-radius: 4px;
        `;
        measurementInfo.innerHTML = `
            <strong>✅ Messung erfolgreich erstellt!</strong><br>
            <small>
                Pixel: ${measurement.pixel_distance.toFixed(1)}px | 
                Real: ${measurement.real_distance_cm}cm | 
                Skalierung: ${measurement.scale_factor.toFixed(3)} mm/px
            </small>
        `;
        
        // Füge nach dem ersten gefundenen Visual Measurement Container hinzu
        const containers = document.querySelectorAll('*');
        for (let el of containers) {
            if (el.textContent && el.textContent.includes('Visual Measurements')) {
                el.appendChild(measurementInfo);
                console.log('🎯 Measurement element added to container');
                break;
            }
        }
    }
}

// Initialisierung mit Debug-Info
console.log('🎯 Document ready state:', document.readyState);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🎯 DOM Content Loaded - Creating TemplateMeasurements');
        window.templateMeasurements = new TemplateMeasurements();
    });
} else {
    console.log('🎯 DOM already ready - Creating TemplateMeasurements immediately');
    window.templateMeasurements = new TemplateMeasurements();
}

console.log('🎯 Template Measurements Script Ende erreicht'); 
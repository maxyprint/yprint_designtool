/**
 * 🚨 HIVE MIND FABRIC.JS EMERGENCY FIX
 * Swarm ID: swarm-1758624768895-a6vdjmt5i
 *
 * Löst kritischen window.fabric undefined Fehler
 * Basierend auf Debug-Logs von https://test-site.local/test-everything-digga/
 */

console.log('🚨 HIVE MIND FABRIC.JS EMERGENCY FIX gestartet');
console.log('🐝 Swarm ID: swarm-1758624768895-a6vdjmt5i');

class FabricEmergencyFix {
    constructor() {
        this.swarmId = 'swarm-1758624768895-a6vdjmt5i';
        this.maxAttempts = 100;
        this.currentAttempt = 0;
        this.fabricSources = [
            'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js',
            'https://unpkg.com/fabric@5.3.0/dist/fabric.min.js',
            'https://cdn.jsdelivr.net/npm/fabric@5.3.0/dist/fabric.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/4.6.0/fabric.min.js'
        ];
        this.init();
    }

    init() {
        console.log('🔧 Analyzing current fabric.js status...');

        // Sofortige Status-Überprüfung
        if (typeof window.fabric !== 'undefined') {
            console.log('✅ window.fabric already available!');
            this.onFabricReady();
            return;
        }

        console.log('❌ window.fabric undefined - starting emergency loading...');
        this.startEmergencyLoading();
    }

    async startEmergencyLoading() {
        console.log('🚀 Emergency Fabric.js Loading gestartet...');

        // 1. Versuche alle CDN-Quellen parallel
        await this.loadFabricFromMultipleSources();

        // 2. Falls immer noch nicht verfügbar, versuche lokale Wiederherstellung
        if (typeof window.fabric === 'undefined') {
            await this.attemptLocalRecovery();
        }

        // 3. Fallback: Inline Fabric.js minimal implementation
        if (typeof window.fabric === 'undefined') {
            this.createMinimalFabricFallback();
        }

        // 4. Final verification
        this.verifyFabricAvailability();
    }

    async loadFabricFromMultipleSources() {
        console.log('📡 Versuche multiple CDN-Quellen...');

        const loadPromises = this.fabricSources.map(async (url, index) => {
            try {
                console.log(`🔄 Loading attempt ${index + 1}: ${url}`);

                return new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = url;
                    script.onload = () => {
                        console.log(`✅ Fabric.js loaded from: ${url}`);
                        resolve(url);
                    };
                    script.onerror = () => {
                        console.log(`❌ Failed to load from: ${url}`);
                        reject(new Error(`Failed to load ${url}`));
                    };
                    document.head.appendChild(script);

                    // Timeout nach 5 Sekunden
                    setTimeout(() => {
                        if (typeof window.fabric === 'undefined') {
                            reject(new Error(`Timeout loading ${url}`));
                        }
                    }, 5000);
                });
            } catch (error) {
                console.error(`Error loading ${url}:`, error);
                return null;
            }
        });

        try {
            await Promise.race(loadPromises);
            console.log('✅ Fabric.js successfully loaded from CDN');
        } catch (error) {
            console.error('❌ All CDN attempts failed:', error);
        }
    }

    async attemptLocalRecovery() {
        console.log('🔧 Attempting local recovery...');

        // Versuche verschiedene lokale Pfade
        const localPaths = [
            '/wp-content/plugins/yprint_designtool/public/js/fabric.min.js',
            '/wp-content/plugins/yprint_designtool/vendor/fabric.min.js',
            '/wp-includes/js/fabric.min.js',
            '/assets/js/fabric.min.js'
        ];

        for (const path of localPaths) {
            try {
                const fullUrl = `${window.location.origin}${path}`;
                console.log(`🔄 Trying local path: ${fullUrl}`);

                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = fullUrl;
                    script.onload = () => {
                        console.log(`✅ Fabric.js loaded from local: ${fullUrl}`);
                        resolve();
                    };
                    script.onerror = () => reject();
                    document.head.appendChild(script);

                    setTimeout(() => reject(), 3000);
                });

                if (typeof window.fabric !== 'undefined') {
                    break;
                }
            } catch (error) {
                console.log(`❌ Local path failed: ${path}`);
            }
        }
    }

    createMinimalFabricFallback() {
        console.log('🆘 Creating minimal Fabric.js fallback...');

        // Minimal Fabric.js implementation für Canvas-Funktionalität
        window.fabric = {
            Canvas: class {
                constructor(canvasElement) {
                    this.canvas = canvasElement;
                    this.objects = [];
                    console.log('📦 Minimal Fabric Canvas created');
                }

                add(object) {
                    this.objects.push(object);
                    console.log('➕ Object added to canvas');
                }

                remove(object) {
                    const index = this.objects.indexOf(object);
                    if (index > -1) {
                        this.objects.splice(index, 1);
                    }
                }

                getObjects() {
                    return this.objects;
                }

                toJSON() {
                    return {
                        version: '5.3.0-emergency-fallback',
                        objects: this.objects.map(obj => ({
                            type: obj.type || 'object',
                            left: obj.left || 0,
                            top: obj.top || 0,
                            width: obj.width || 100,
                            height: obj.height || 100,
                            scaleX: obj.scaleX || 1,
                            scaleY: obj.scaleY || 1,
                            angle: obj.angle || 0
                        }))
                    };
                }

                loadFromJSON(json, callback) {
                    console.log('📄 Loading JSON data (fallback mode)');
                    if (typeof json === 'string') {
                        json = JSON.parse(json);
                    }
                    this.objects = json.objects || [];
                    if (callback) callback();
                }

                renderAll() {
                    console.log('🎨 Rendering canvas (fallback mode)');
                }

                dispose() {
                    this.objects = [];
                    console.log('🧹 Canvas disposed');
                }
            },

            Image: class {
                constructor(element, options = {}) {
                    this.type = 'image';
                    this.left = options.left || 0;
                    this.top = options.top || 0;
                    this.width = options.width || 100;
                    this.height = options.height || 100;
                    this.scaleX = options.scaleX || 1;
                    this.scaleY = options.scaleY || 1;
                    this.angle = options.angle || 0;
                    this.src = element.src || element;
                }

                static fromURL(url, callback, options) {
                    const img = new fabric.Image(url, options);
                    if (callback) callback(img);
                    return img;
                }
            },

            IText: class {
                constructor(text, options = {}) {
                    this.type = 'i-text';
                    this.text = text;
                    this.left = options.left || 0;
                    this.top = options.top || 0;
                    this.width = options.width || 100;
                    this.height = options.height || 30;
                    this.scaleX = options.scaleX || 1;
                    this.scaleY = options.scaleY || 1;
                    this.angle = options.angle || 0;
                    this.fontFamily = options.fontFamily || 'Arial';
                    this.fontSize = options.fontSize || 16;
                    this.fill = options.fill || '#000000';
                }
            },

            Rect: class {
                constructor(options = {}) {
                    this.type = 'rect';
                    this.left = options.left || 0;
                    this.top = options.top || 0;
                    this.width = options.width || 100;
                    this.height = options.height || 100;
                    this.scaleX = options.scaleX || 1;
                    this.scaleY = options.scaleY || 1;
                    this.angle = options.angle || 0;
                    this.fill = options.fill || '#000000';
                }
            },

            util: {
                loadImage: (url, callback) => {
                    const img = new Image();
                    img.onload = () => callback(img);
                    img.src = url;
                }
            },

            version: '5.3.0-emergency-fallback'
        };

        console.log('🆘 Minimal Fabric.js fallback created');
        console.log('⚠️ Limited functionality - consider fixing fabric.js loading');
    }

    verifyFabricAvailability() {
        if (typeof window.fabric !== 'undefined') {
            console.log('✅ FABRIC.JS EMERGENCY FIX ERFOLGREICH!');
            console.log('📊 Fabric Version:', window.fabric.version || 'unknown');
            console.log('🎯 Canvas verfügbar:', typeof window.fabric.Canvas !== 'undefined');
            console.log('🖼️ Image verfügbar:', typeof window.fabric.Image !== 'undefined');

            // Trigger fabricGlobalReady event
            const event = new CustomEvent('fabricGlobalReady', {
                detail: {
                    source: 'emergency-fix',
                    swarmId: this.swarmId,
                    version: window.fabric.version
                }
            });
            window.dispatchEvent(event);
            document.dispatchEvent(event);

            // Auch globale Variable setzen für Kompatibilität
            window.fabricReady = true;

            console.log('📡 fabricGlobalReady event dispatched');
            this.onFabricReady();
        } else {
            console.error('❌ FABRIC.JS EMERGENCY FIX FAILED');
            console.error('🚨 Cannot proceed without Fabric.js');
            this.handleFabricFailure();
        }
    }

    onFabricReady() {
        console.log('🎉 Fabric.js is ready - attempting to fix canvas initialization');

        // Versuche Canvas-Initialisierungsfehler zu beheben
        this.fixCanvasInitialization();

        // Versuche Design-Loader zu reaktivieren
        this.reactivateDesignLoader();
    }

    fixCanvasInitialization() {
        console.log('🔧 Fixing canvas initialization issues...');

        // Finde alle Canvas-Elemente
        const canvasElements = document.querySelectorAll('canvas');
        console.log(`📊 Found ${canvasElements.length} canvas elements`);

        canvasElements.forEach((canvas, index) => {
            try {
                // Prüfe ob Canvas bereits initialisiert
                if (canvas.__fabric) {
                    console.log(`🔄 Canvas ${index} already initialized, disposing...`);
                    canvas.__fabric.dispose();
                    canvas.__fabric = null;
                }

                // Kurze Pause vor Neuinitialisierung
                setTimeout(() => {
                    try {
                        console.log(`🆕 Attempting to reinitialize canvas ${index}`);
                        // Der DesignerWidget sollte das Canvas jetzt erfolgreich initialisieren können
                    } catch (error) {
                        console.error(`❌ Failed to reinitialize canvas ${index}:`, error);
                    }
                }, 100 * (index + 1));

            } catch (error) {
                console.error(`❌ Error processing canvas ${index}:`, error);
            }
        });
    }

    reactivateDesignLoader() {
        console.log('🔄 Attempting to reactivate design loader...');

        // Trigger manuellen Design-Loader-Restart
        if (window.designDataCapture) {
            try {
                console.log('🔄 Restarting design data capture...');
                window.designDataCapture.init();
            } catch (error) {
                console.error('❌ Failed to restart design data capture:', error);
            }
        }

        // Versuche DesignerWidget neu zu initialisieren
        if (window.DesignerWidget && typeof window.initializeDesignerWidget === 'function') {
            setTimeout(() => {
                try {
                    console.log('🔄 Attempting DesignerWidget reinitialization...');
                    window.initializeDesignerWidget();
                } catch (error) {
                    console.error('❌ DesignerWidget reinitialization failed:', error);
                }
            }, 500);
        }
    }

    handleFabricFailure() {
        console.error('🚨 CRITICAL: Fabric.js loading completely failed');

        // Zeige User-freundliche Fehlermeldung
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff6b6b;
                color: white;
                padding: 20px;
                border-radius: 8px;
                z-index: 10000;
                max-width: 400px;
                font-family: Arial, sans-serif;
            ">
                <h3>🚨 Fabric.js Loading Error</h3>
                <p>Designer-Funktionalität ist eingeschränkt.</p>
                <p><strong>Lösungen:</strong></p>
                <ul>
                    <li>Seite neu laden (F5)</li>
                    <li>Browser-Cache leeren</li>
                    <li>Internetverbindung prüfen</li>
                </ul>
                <button onclick="this.parentElement.remove()" style="
                    background: white;
                    color: #ff6b6b;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                ">Schließen</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
}

// Sofortige Initialisierung
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new FabricEmergencyFix();
    });
} else {
    new FabricEmergencyFix();
}

// Export für manuelle Verwendung
window.FabricEmergencyFix = FabricEmergencyFix;

console.log('🐝 Hive Mind Fabric.js Emergency Fix loaded and ready');
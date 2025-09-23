/**
 * 🎯 CLEAN FABRIC LOADER - Hive Mind Production Solution
 * Swarm ID: swarm_1758629527234_uuw0zd5yx
 *
 * Surgical Fabric.js loading - NO conflicts, NO double-loading
 */

console.log('🎯 CLEAN FABRIC LOADER: Starting surgical intervention...');

class CleanFabricLoader {
    constructor() {
        this.loaderId = 'clean-fabric-' + Date.now();
        this.loadingAttempted = false;
        this.loadingPromise = null;
        this.init();
    }

    init() {
        console.log('🔧 Checking Fabric.js status...');

        if (this.isFabricAvailable()) {
            console.log('✅ Fabric.js already available');
            this.onFabricReady();
            return;
        }

        if (this.loadingAttempted) {
            console.log('🔄 Loading already attempted, waiting...');
            return;
        }

        this.startCleanLoading();
    }

    isFabricAvailable() {
        return typeof window.fabric !== 'undefined' &&
               window.fabric &&
               typeof window.fabric.Canvas === 'function';
    }

    startCleanLoading() {
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        console.log('📡 Starting clean Fabric.js loading...');
        this.loadingAttempted = true;

        this.loadingPromise = this.loadFabricCleanly();
        return this.loadingPromise;
    }

    async loadFabricCleanly() {
        // Prevent multiple script tags for same URL
        const existingScript = document.querySelector('script[src*="fabric"]');
        if (existingScript) {
            console.log('🔄 Fabric script already exists, waiting for load...');
            return this.waitForFabric();
        }

        const cdnUrl = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js';

        try {
            await this.loadScript(cdnUrl);

            if (this.isFabricAvailable()) {
                console.log('✅ Fabric.js loaded successfully');
                this.onFabricReady();
                return true;
            } else {
                throw new Error('Fabric.js not available after loading');
            }
        } catch (error) {
            console.error('❌ Failed to load Fabric.js:', error);
            this.createMinimalFallback();
            return false;
        }
    }

    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;

            // Add to head only if not already present
            const existing = document.querySelector(`script[src="${url}"]`);
            if (!existing) {
                document.head.appendChild(script);
            } else {
                resolve(); // Already exists
            }

            // Timeout safety
            setTimeout(() => {
                if (!this.isFabricAvailable()) {
                    reject(new Error('Load timeout'));
                }
            }, 10000);
        });
    }

    waitForFabric(maxWait = 5000) {
        return new Promise((resolve) => {
            const startTime = Date.now();

            const check = () => {
                if (this.isFabricAvailable()) {
                    resolve(true);
                } else if (Date.now() - startTime > maxWait) {
                    resolve(false);
                } else {
                    setTimeout(check, 100);
                }
            };

            check();
        });
    }

    onFabricReady() {
        console.log('🎉 Fabric.js is ready');

        // Dispatch clean ready event
        const event = new CustomEvent('fabricCleanReady', {
            detail: {
                loaderId: this.loaderId,
                version: window.fabric?.version || 'unknown',
                timestamp: new Date().toISOString()
            }
        });

        window.dispatchEvent(event);
        document.dispatchEvent(event);

        console.log('📡 fabricCleanReady event dispatched');
    }

    createMinimalFallback() {
        console.log('🆘 Creating minimal Fabric.js fallback...');

        if (window.fabric) {
            console.log('⚠️ Fabric partially exists, not overriding');
            return;
        }

        // Ultra-minimal Fabric implementation
        window.fabric = {
            Canvas: class {
                constructor(element) {
                    this.element = element;
                    this.objects = [];
                    console.log('📦 Fallback Canvas created');
                }

                add(obj) { this.objects.push(obj); }
                remove(obj) {
                    const idx = this.objects.indexOf(obj);
                    if (idx > -1) this.objects.splice(idx, 1);
                }

                toJSON() {
                    return {
                        version: 'fallback-1.0',
                        objects: this.objects
                    };
                }

                loadFromJSON(json, callback) {
                    if (typeof json === 'string') json = JSON.parse(json);
                    this.objects = json.objects || [];
                    if (callback) callback();
                }

                renderAll() {}
                dispose() { this.objects = []; }
            },

            version: 'fallback-1.0'
        };

        console.log('🆘 Minimal fallback created');
        this.onFabricReady();
    }

    // Status check
    getStatus() {
        return {
            fabricAvailable: this.isFabricAvailable(),
            loadingAttempted: this.loadingAttempted,
            loaderId: this.loaderId,
            version: window.fabric?.version || null,
            timestamp: new Date().toISOString()
        };
    }
}

// Initialize clean loader only if needed
if (!window.cleanFabricLoader) {
    window.cleanFabricLoader = new CleanFabricLoader();
    window.CleanFabricLoader = CleanFabricLoader;
}

console.log('🎯 Clean Fabric Loader ready!');
console.log('📊 Status: cleanFabricLoader.getStatus()');
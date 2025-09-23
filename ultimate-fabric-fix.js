/**
 * 🎯 ULTIMATE FABRIC FIX - Final Solution
 * Forces Fabric.js loading when clean loader detects existing script but no window.fabric
 */

console.log('🎯 ULTIMATE FABRIC FIX: Starting final intervention...');

class UltimateFabricFix {
    constructor() {
        this.attempts = 0;
        this.maxAttempts = 3;
        this.init();
    }

    init() {
        console.log('🔧 Ultimate Fabric Check...');

        if (typeof window.fabric !== 'undefined') {
            console.log('✅ Fabric.js already available');
            this.onSuccess();
            return;
        }

        this.forceLoad();
    }

    async forceLoad() {
        this.attempts++;
        console.log(`🚀 Force loading Fabric.js (attempt ${this.attempts}/${this.maxAttempts})`);

        // Remove ALL existing fabric scripts first
        const existingScripts = document.querySelectorAll('script[src*="fabric"]');
        existingScripts.forEach(script => {
            console.log('🗑️ Removing existing fabric script:', script.src);
            script.remove();
        });

        // Force clean CDN load
        const cdnUrl = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js';

        try {
            await this.loadScriptForce(cdnUrl);

            if (typeof window.fabric !== 'undefined') {
                console.log('✅ ULTIMATE SUCCESS: Fabric.js force loaded!');
                this.onSuccess();
            } else {
                throw new Error('Fabric still not available after force load');
            }
        } catch (error) {
            console.error(`❌ Force load attempt ${this.attempts} failed:`, error);

            if (this.attempts < this.maxAttempts) {
                setTimeout(() => this.forceLoad(), 1000);
            } else {
                console.error('❌ All force load attempts failed');
            }
        }
    }

    loadScriptForce(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = false; // Force synchronous loading

            script.onload = () => {
                console.log('📦 Script loaded, checking fabric...');
                // Give a moment for execution
                setTimeout(() => {
                    if (typeof window.fabric !== 'undefined') {
                        resolve();
                    } else {
                        reject(new Error('Script loaded but fabric not available'));
                    }
                }, 500);
            };

            script.onerror = () => reject(new Error('Script failed to load'));

            document.head.appendChild(script);

            // Timeout
            setTimeout(() => reject(new Error('Load timeout')), 10000);
        });
    }

    onSuccess() {
        console.log('🎉 ULTIMATE FABRIC SUCCESS!');
        console.log('📊 Fabric Version:', window.fabric?.version || 'unknown');

        // Dispatch ultimate ready event
        const event = new CustomEvent('fabricUltimateReady', {
            detail: {
                version: window.fabric?.version,
                timestamp: new Date().toISOString()
            }
        });

        window.dispatchEvent(event);
        document.dispatchEvent(event);

        console.log('📡 fabricUltimateReady event dispatched');
    }
}

// Initialize immediately
new UltimateFabricFix();

console.log('🎯 Ultimate Fabric Fix loaded!');
/**
 * 🚨 PNG FALLBACK LOADER: Emergency PNG Script Loading System
 *
 * PURPOSE: Dynamically loads PNG scripts when WordPress staging fails
 * TRIGGERS: When save-only PNG system detects missing PNG integration
 *
 * CRITICAL: This solves the WordPress enqueueing dependency issue
 */

(function() {
    'use strict';

    console.log('🚨 PNG FALLBACK LOADER: Initializing emergency PNG script loading...');

    class PNGFallbackLoader {
        constructor() {
            this.loadAttempts = 0;
            this.maxAttempts = 3;
            this.loadedScripts = new Set();
            this.pluginUrl = this.detectPluginUrl();

            console.log('🔍 PNG FALLBACK: Plugin URL detected:', this.pluginUrl);

            // Start monitoring for missing PNG scripts
            this.startMonitoring();
        }

        detectPluginUrl() {
            // Try to get plugin URL from WordPress config
            if (typeof octo_print_designer_config !== 'undefined' && octo_print_designer_config.plugin_url) {
                return octo_print_designer_config.plugin_url;
            }

            // Fallback: detect from current script URL
            const scripts = document.querySelectorAll('script[src*="yprint"]');
            if (scripts.length > 0) {
                const scriptSrc = scripts[0].src;
                const match = scriptSrc.match(/(.+?)\/public\/js\//);
                if (match) {
                    return match[1] + '/';
                }
            }

            // Last resort: try to detect from any plugin script
            const pluginScripts = document.querySelectorAll('script[src*="octo-print-designer"]');
            if (pluginScripts.length > 0) {
                const scriptSrc = pluginScripts[0].src;
                const match = scriptSrc.match(/(.+?)\/public\/js\//);
                if (match) {
                    return match[1] + '/';
                }
            }

            console.warn('⚠️ PNG FALLBACK: Could not detect plugin URL');
            return '';
        }

        startMonitoring() {
            console.log('👀 PNG FALLBACK: Starting script monitoring...');

            // Check immediately
            this.checkAndLoadMissingScripts();

            // Check every 2 seconds for missing scripts
            const monitorInterval = setInterval(() => {
                this.checkAndLoadMissingScripts();

                // Stop monitoring after max attempts or when all scripts are loaded
                if (this.loadAttempts >= this.maxAttempts || this.allPNGScriptsLoaded()) {
                    clearInterval(monitorInterval);
                    console.log('🏁 PNG FALLBACK: Monitoring stopped');
                }
            }, 2000);
        }

        checkAndLoadMissingScripts() {
            console.log('🔍 PNG FALLBACK: Checking for missing PNG scripts...');

            const requiredScripts = [
                {
                    check: () => typeof window.EnhancedJSONCoordinateSystem !== 'undefined',
                    url: 'public/js/enhanced-json-coordinate-system.js',
                    name: 'enhanced-json-coordinate-system'
                },
                {
                    check: () => typeof window.HighDPIPNGExportEngine !== 'undefined',
                    url: 'public/js/high-dpi-png-export-engine.js',
                    name: 'high-dpi-png-export-engine'
                },
                {
                    check: () => typeof window.PNGOnlySystemIntegration !== 'undefined' ||
                                 typeof window.yprintPNGIntegration !== 'undefined',
                    url: 'public/js/png-only-system-integration.js',
                    name: 'png-only-system-integration'
                }
            ];

            let missingScripts = 0;

            for (const script of requiredScripts) {
                if (!script.check()) {
                    missingScripts++;
                    console.log(`❌ PNG FALLBACK: Missing ${script.name}`);

                    if (!this.loadedScripts.has(script.name)) {
                        this.loadScript(script.url, script.name);
                    }
                } else {
                    console.log(`✅ PNG FALLBACK: ${script.name} available`);
                }
            }

            if (missingScripts === 0) {
                console.log('🎯 PNG FALLBACK: All PNG scripts are loaded!');

                // Trigger save-only PNG system check
                if (typeof window.saveOnlyPNGSystem !== 'undefined' &&
                    typeof window.saveOnlyPNGSystem.checkSystemReady === 'function') {
                    console.log('🔄 PNG FALLBACK: Triggering save-only PNG system recheck...');
                    window.saveOnlyPNGSystem.checkSystemReady();
                }
            }

            this.loadAttempts++;
        }

        loadScript(scriptUrl, scriptName) {
            if (this.loadedScripts.has(scriptName) || !this.pluginUrl) {
                return;
            }

            console.log(`📥 PNG FALLBACK: Loading ${scriptName}...`);

            const script = document.createElement('script');
            script.src = this.pluginUrl + scriptUrl;
            script.type = 'text/javascript';

            script.onload = () => {
                console.log(`✅ PNG FALLBACK: Successfully loaded ${scriptName}`);
                this.loadedScripts.add(scriptName);
            };

            script.onerror = () => {
                console.error(`❌ PNG FALLBACK: Failed to load ${scriptName} from ${script.src}`);
            };

            // Add to head for immediate execution
            document.head.appendChild(script);
            this.loadedScripts.add(scriptName);
        }

        allPNGScriptsLoaded() {
            return (
                typeof window.EnhancedJSONCoordinateSystem !== 'undefined' &&
                typeof window.HighDPIPNGExportEngine !== 'undefined' &&
                (typeof window.PNGOnlySystemIntegration !== 'undefined' ||
                 typeof window.yprintPNGIntegration !== 'undefined')
            );
        }
    }

    // Create global fallback loader
    window.pngFallbackLoader = new PNGFallbackLoader();

    console.log('🚨 PNG FALLBACK LOADER: Ready and monitoring for missing PNG scripts');

})();
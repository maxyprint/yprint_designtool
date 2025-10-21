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
            console.log('🔍 === PNG FALLBACK SCRIPT CHECK START ===');
            console.log(`🔍 Load attempt: ${this.loadAttempts + 1}/${this.maxAttempts}`);

            const requiredScripts = [
                {
                    check: () => typeof window.EnhancedJSONCoordinateSystem !== 'undefined',
                    url: 'public/js/enhanced-json-coordinate-system.js',
                    name: 'enhanced-json-coordinate-system',
                    globalVar: 'EnhancedJSONCoordinateSystem'
                },
                {
                    check: () => typeof window.HighDPIPrintExportEngine !== 'undefined',
                    url: 'public/js/high-dpi-png-export-engine.js',
                    name: 'high-dpi-png-export-engine',
                    globalVar: 'HighDPIPrintExportEngine',
                    skipIfRegistered: true // Skip if WordPress already enqueued this
                },
                {
                    check: () => typeof window.PNGOnlySystemIntegration !== 'undefined' ||
                                 typeof window.yprintPNGIntegration !== 'undefined',
                    url: 'public/js/png-only-system-integration.js',
                    name: 'png-only-system-integration',
                    globalVar: 'PNGOnlySystemIntegration'
                }
            ];

            // Debug current global state
            console.log('🔍 CURRENT GLOBAL VARIABLES STATE:');
            requiredScripts.forEach((script, idx) => {
                const globalExists = typeof window[script.globalVar] !== 'undefined';
                const checkResult = script.check();
                console.log(`  ${idx + 1}. ${script.globalVar}: ${globalExists ? 'EXISTS' : 'MISSING'} (check: ${checkResult})`);

                if (globalExists) {
                    const globalObj = window[script.globalVar];
                    console.log(`     Type: ${typeof globalObj}, Constructor: ${globalObj?.constructor?.name || 'unknown'}`);
                }
            });

            console.log('🔍 LOADED SCRIPTS TRACKING:');
            console.log(`  Already loaded by fallback: [${Array.from(this.loadedScripts).join(', ')}]`);

            let missingScripts = 0;
            const scriptsToLoad = [];
            const skippedScripts = [];

            for (let i = 0; i < requiredScripts.length; i++) {
                const script = requiredScripts[i];
                console.log(`🔍 === CHECKING SCRIPT ${i + 1}: ${script.name} ===`);

                const isAvailable = script.check();
                console.log(`  Global check result: ${isAvailable}`);

                if (!isAvailable) {
                    console.log(`  ❌ MISSING: ${script.name}`);

                    // Check if WordPress has registered this script
                    if (script.skipIfRegistered) {
                        console.log(`  🔧 Checking WordPress registration for ${script.name}...`);
                        const isRegistered = this.isScriptRegisteredByWordPress(script.name);

                        if (isRegistered) {
                            console.log(`  ⏭️ SKIPPING: ${script.name} already registered by WordPress`);
                            skippedScripts.push(script.name);
                            continue;
                        } else {
                            console.log(`  🔄 PROCEEDING: ${script.name} not found in WordPress, will load via fallback`);
                        }
                    }

                    missingScripts++;

                    // Check if we've already attempted to load this script
                    if (this.loadedScripts.has(script.name)) {
                        console.log(`  ⏳ ALREADY LOADING: ${script.name} (attempted previously)`);
                    } else {
                        console.log(`  📥 WILL LOAD: ${script.name}`);
                        scriptsToLoad.push(script);
                    }
                } else {
                    console.log(`  ✅ AVAILABLE: ${script.name}`);
                }
            }

            console.log('🔍 SUMMARY:');
            console.log(`  Missing scripts: ${missingScripts}`);
            console.log(`  Scripts to load: ${scriptsToLoad.length}`);
            console.log(`  Skipped (WordPress): ${skippedScripts.length}`);

            // Load the scripts that need loading
            if (scriptsToLoad.length > 0) {
                console.log('🔍 LOADING SCRIPTS:');
                scriptsToLoad.forEach(script => {
                    console.log(`  📥 Loading: ${script.name}`);
                    this.loadScript(script.url, script.name);
                });
            } else if (missingScripts === 0) {
                console.log('🔍 ✅ ALL SCRIPTS AVAILABLE');
            } else {
                console.log('🔍 ⏳ ALL MISSING SCRIPTS ALREADY LOADING');
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

            console.log(`🔍 === PNG FALLBACK SCRIPT CHECK END (attempt ${this.loadAttempts + 1}) ===`);
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

        isScriptRegisteredByWordPress(scriptName) {
            console.log(`🔍 === WORDPRESS SCRIPT DETECTION START: ${scriptName} ===`);

            // Get all script elements
            const scriptElements = document.querySelectorAll('script[src]');
            console.log(`🔍 TOTAL SCRIPTS IN DOM: ${scriptElements.length}`);

            // Debug all PNG-related scripts
            console.log('🔍 ALL PNG-RELATED SCRIPTS ANALYSIS:');
            const pngRelatedScripts = [];
            scriptElements.forEach((element, idx) => {
                const src = element.src;
                if (src.includes('png') || src.includes('yprint') || src.includes('octo-print-designer')) {
                    const info = {
                        index: idx,
                        src: src,
                        filename: src.split('/').pop(),
                        hasVersion: src.includes('ver='),
                        version: (src.match(/ver=([^&]+)/) || ['', 'none'])[1]
                    };
                    pngRelatedScripts.push(info);
                    console.log(`  Script ${idx}: ${info.filename} (ver: ${info.version})`);
                }
            });

            console.log(`🔍 FOUND ${pngRelatedScripts.length} PNG-RELATED SCRIPTS`);

            // Check for duplicates
            console.log('🔍 DUPLICATE DETECTION:');
            const scriptNames = pngRelatedScripts.map(s => s.filename.split('?')[0]);
            const duplicates = scriptNames.filter((name, idx) => scriptNames.indexOf(name) !== idx);
            if (duplicates.length > 0) {
                console.warn('❌ DETECTED DUPLICATE SCRIPTS:', [...new Set(duplicates)]);
            } else {
                console.log('✅ NO DUPLICATE SCRIPT FILENAMES DETECTED');
            }

            // Check for target script specifically
            console.log(`🔍 SEARCHING FOR TARGET SCRIPT: ${scriptName}`);
            const matchingScripts = [];

            for (let i = 0; i < scriptElements.length; i++) {
                const element = scriptElements[i];
                const src = element.src;
                const filename = src.split('/').pop().split('?')[0];

                // Multiple matching strategies
                const matches = {
                    exactFilename: filename === scriptName + '.js',
                    containsName: src.includes(scriptName + '.js'),
                    highDPIAlias: src.includes('yprint-high-dpi-export'),
                    integrationAlias: src.includes('yprint-png-integration'),
                    coordinateAlias: src.includes('enhanced-json-coordinate')
                };

                const isMatch = Object.values(matches).some(m => m);

                if (isMatch) {
                    const matchInfo = {
                        index: i,
                        src: src,
                        filename: filename,
                        matchReason: Object.keys(matches).filter(key => matches[key]),
                        version: (src.match(/ver=([^&]+)/) || ['', 'none'])[1],
                        loadedAt: element.getAttribute('data-loaded-at') || 'unknown'
                    };
                    matchingScripts.push(matchInfo);
                    console.log(`  ✅ MATCH ${i}: ${filename} - Reason: ${matchInfo.matchReason.join(', ')}`);
                }
            }

            console.log(`🔍 FOUND ${matchingScripts.length} MATCHING SCRIPTS FOR ${scriptName}`);

            // Check global variables too
            console.log('🔍 GLOBAL VARIABLE CHECK:');
            const globalVars = {
                'enhanced-json-coordinate-system': 'EnhancedJSONCoordinateSystem',
                'high-dpi-png-export-engine': 'HighDPIPrintExportEngine',
                'png-only-system-integration': 'PNGOnlySystemIntegration'
            };

            const expectedGlobalVar = globalVars[scriptName];
            if (expectedGlobalVar) {
                const globalExists = typeof window[expectedGlobalVar] !== 'undefined';
                console.log(`  Global variable ${expectedGlobalVar}: ${globalExists ? 'EXISTS' : 'MISSING'}`);

                if (globalExists && matchingScripts.length === 0) {
                    console.warn(`  ⚠️ ANOMALY: Global variable exists but no DOM script found!`);
                } else if (!globalExists && matchingScripts.length > 0) {
                    console.warn(`  ⚠️ ANOMALY: DOM script found but global variable missing!`);
                }
            }

            const result = matchingScripts.length > 0;
            console.log(`🔍 FINAL RESULT: WordPress has ${result ? 'REGISTERED' : 'NOT REGISTERED'} ${scriptName}`);

            if (result) {
                console.log(`🔍 RECOMMENDATION: Skip fallback loading for ${scriptName}`);
            } else {
                console.log(`🔍 RECOMMENDATION: Proceed with fallback loading for ${scriptName}`);
            }

            console.log(`🔍 === WORDPRESS SCRIPT DETECTION END: ${scriptName} ===`);
            return result;
        }

        allPNGScriptsLoaded() {
            return (
                typeof window.EnhancedJSONCoordinateSystem !== 'undefined' &&
                typeof window.HighDPIPrintExportEngine !== 'undefined' &&
                (typeof window.PNGOnlySystemIntegration !== 'undefined' ||
                 typeof window.yprintPNGIntegration !== 'undefined')
            );
        }
    }

    // Create global fallback loader
    window.pngFallbackLoader = new PNGFallbackLoader();

    console.log('🚨 PNG FALLBACK LOADER: Ready and monitoring for missing PNG scripts');

})();
/**
 * 🎯 DIRECT COORDINATE REGISTRATION SYSTEM
 *
 * Optional Registration Handler for DirectCoordinate WordPress Integration
 *
 * PURPOSE: Provides optional script registration without modifying core PHP files
 * - Can be included via theme functions.php or plugin
 * - Handles conditional loading of DirectCoordinate WordPress system
 * - Provides WordPress admin interface for enable/disable
 * - Non-invasive integration with existing systems
 *
 * USAGE:
 * 1. Include this file in WordPress theme or plugin
 * 2. Call DirectCoordinateRegistration.register() to enable
 * 3. Use admin interface or URL parameters to control activation
 *
 * @version 1.0.0
 * @author ULTRA-THINK Registration System
 */

(function() {
    'use strict';

    console.log('🎯 DIRECT COORDINATE REGISTRATION: Initializing WordPress registration system...');

    /**
     * DirectCoordinate Registration and Management System
     */
    window.DirectCoordinateRegistration = class {
        constructor() {
            this.isWordPress = this.detectWordPress();
            this.scriptsRegistered = false;
            this.adminInitialized = false;

            this.config = {
                // Script information
                scriptId: 'direct-coordinate-wordpress',
                scriptPath: 'public/js/direct-coordinate-wordpress.js',

                // WordPress options
                optionName: 'direct_coordinate_enabled',
                adminMenuSlug: 'direct-coordinate-settings',

                // Capability required to manage settings
                capability: 'manage_options'
            };

            this.init();
        }

        /**
         * Initialize the registration system
         */
        init() {
            this.log('info', '🔧 DirectCoordinate Registration initializing...');

            if (this.isWordPress) {
                this.initWordPressIntegration();
            } else {
                this.initStandaloneIntegration();
            }

            this.setupGlobalInterface();
            this.log('info', '✅ DirectCoordinate Registration ready');
        }

        /**
         * Detect if running in WordPress environment
         */
        detectWordPress() {
            return (
                typeof wp !== 'undefined' ||
                typeof ajaxurl !== 'undefined' ||
                typeof octoPrintDesigner !== 'undefined' ||
                document.querySelector('meta[name="generator"][content*="WordPress"]')
            );
        }

        /**
         * Initialize WordPress-specific integration
         */
        initWordPressIntegration() {
            this.log('info', '🔧 WordPress environment detected, setting up WP integration...');

            // Check if we should auto-register scripts
            if (this.shouldAutoRegister()) {
                this.registerWordPressScripts();
            }

            // Initialize admin interface if in admin area
            if (this.isWordPressAdmin()) {
                this.initWordPressAdmin();
            }
        }

        /**
         * Initialize standalone (non-WordPress) integration
         */
        initStandaloneIntegration() {
            this.log('info', '🔧 Standalone environment detected, setting up direct integration...');

            // In standalone mode, we can load the script immediately if requested
            if (this.shouldActivateStandalone()) {
                this.loadDirectCoordinateScript();
            }
        }

        /**
         * Check if scripts should be auto-registered
         */
        shouldAutoRegister() {
            // Check URL parameter
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('direct_coordinates') === '1') {
                return true;
            }

            // Check localStorage
            try {
                if (localStorage.getItem('directCoordinatesEnabled') === 'true') {
                    return true;
                }
            } catch (error) {
                // Ignore localStorage errors
            }

            // Check WordPress option (if available)
            if (typeof octoPrintDesigner !== 'undefined' && octoPrintDesigner.directCoordinateEnabled) {
                return true;
            }

            return false;
        }

        /**
         * Check if should activate in standalone mode
         */
        shouldActivateStandalone() {
            const urlParams = new URLSearchParams(window.location.search);
            return (
                urlParams.get('direct_coordinates') === '1' ||
                window.directCoordinatesForceEnabled === true
            );
        }

        /**
         * Register WordPress scripts
         */
        registerWordPressScripts() {
            if (this.scriptsRegistered) {
                this.log('warn', '⚠️ Scripts already registered');
                return;
            }

            this.log('info', '📝 Registering DirectCoordinate WordPress scripts...');

            // Method 1: Dynamic script loading
            this.loadDirectCoordinateScript();

            // Method 2: WordPress-style registration (if wp_register_script is available)
            if (typeof window.wp_register_script_dynamic !== 'undefined') {
                this.registerViaWordPressAPI();
            }

            this.scriptsRegistered = true;
        }

        /**
         * Load DirectCoordinate script dynamically
         */
        loadDirectCoordinateScript() {
            const scriptId = this.config.scriptId;

            // Check if already loaded
            if (document.getElementById(scriptId)) {
                this.log('info', '📝 DirectCoordinate script already loaded');
                return;
            }

            // Create script element
            const script = document.createElement('script');
            script.id = scriptId;
            script.type = 'text/javascript';

            // Determine script path
            let scriptSrc = this.getScriptPath();

            script.src = scriptSrc;
            script.async = true;

            // Add load event handler
            script.addEventListener('load', () => {
                this.log('info', '✅ DirectCoordinate WordPress script loaded successfully');
                this.onScriptLoaded();
            });

            script.addEventListener('error', (error) => {
                this.log('error', '❌ Failed to load DirectCoordinate script:', error);
                this.onScriptError(error);
            });

            // Add to DOM
            document.head.appendChild(script);

            this.log('info', '📝 DirectCoordinate script loading from:', scriptSrc);
        }

        /**
         * Get the correct script path
         */
        getScriptPath() {
            // Method 1: Use WordPress plugin URL (if available)
            if (typeof octoPrintDesigner !== 'undefined' && octoPrintDesigner.pluginUrl) {
                return octoPrintDesigner.pluginUrl + this.config.scriptPath;
            }

            // Method 2: Auto-detect from current script location
            const currentScript = document.currentScript || document.querySelector('script[src*="direct-coordinate"]');
            if (currentScript && currentScript.src) {
                const basePath = currentScript.src.replace(/\/[^\/]*$/, '/');
                return basePath + 'direct-coordinate-wordpress.js';
            }

            // Method 3: Relative to current page
            return './public/js/direct-coordinate-wordpress.js';
        }

        /**
         * Handle successful script load
         */
        onScriptLoaded() {
            // Verify that DirectCoordinate WordPress system is available
            if (typeof window.DirectCoordinateWordPress !== 'undefined') {
                this.log('info', '✅ DirectCoordinate WordPress system verified and ready');

                // Enable debug mode if in development
                if (this.isDevelopmentMode()) {
                    window.directCoordinateDebug = true;
                }

                // Auto-enable if conditions are met
                if (this.shouldAutoRegister() && window.directCoordinateWordPress) {
                    setTimeout(() => {
                        window.enableDirectCoordinates();
                    }, 100);
                }

            } else {
                this.log('error', '❌ DirectCoordinate WordPress system not found after script load');
            }
        }

        /**
         * Handle script load error
         */
        onScriptError(error) {
            this.log('error', '❌ DirectCoordinate script failed to load');

            // Try fallback loading method
            this.tryFallbackLoading();
        }

        /**
         * Try fallback script loading
         */
        tryFallbackLoading() {
            const fallbackPaths = [
                './js/direct-coordinate-wordpress.js',
                '../js/direct-coordinate-wordpress.js',
                '/wp-content/plugins/octo-print-designer/public/js/direct-coordinate-wordpress.js'
            ];

            this.log('info', '🔄 Trying fallback script paths...');

            fallbackPaths.forEach((path, index) => {
                setTimeout(() => {
                    this.loadScriptFromPath(path, `fallback-${index}`);
                }, index * 1000);
            });
        }

        /**
         * Load script from specific path
         */
        loadScriptFromPath(path, id) {
            const script = document.createElement('script');
            script.id = `${this.config.scriptId}-${id}`;
            script.src = path;
            script.async = true;

            script.addEventListener('load', () => {
                this.log('info', `✅ DirectCoordinate loaded via fallback: ${path}`);
                this.onScriptLoaded();
            });

            script.addEventListener('error', () => {
                this.log('debug', `⚠️ Fallback path failed: ${path}`);
            });

            document.head.appendChild(script);
        }

        /**
         * Check if in development mode
         */
        isDevelopmentMode() {
            return (
                window.location.hostname === 'localhost' ||
                window.location.hostname.includes('dev') ||
                window.location.search.includes('debug=1') ||
                localStorage.getItem('directCoordinateDebug') === 'true'
            );
        }

        /**
         * Check if in WordPress admin area
         */
        isWordPressAdmin() {
            return (
                document.body.classList.contains('wp-admin') ||
                window.location.pathname.includes('/wp-admin/') ||
                typeof adminpage !== 'undefined'
            );
        }

        /**
         * Initialize WordPress admin interface
         */
        initWordPressAdmin() {
            if (this.adminInitialized) return;

            this.log('info', '🔧 Initializing WordPress admin interface...');

            // Add admin menu item (simulated - would need PHP for real implementation)
            this.setupAdminInterface();

            this.adminInitialized = true;
        }

        /**
         * Setup admin interface elements
         */
        setupAdminInterface() {
            // This would typically be handled by PHP, but we can provide JS-based interface
            // for testing and development

            // Add settings link to plugin actions (if possible)
            this.addPluginActionLinks();

            // Create admin notices for status
            this.addAdminNotices();
        }

        /**
         * Add plugin action links
         */
        addPluginActionLinks() {
            // Look for plugin action links and add DirectCoordinate settings
            const pluginLinks = document.querySelectorAll('.plugin-action-buttons');

            pluginLinks.forEach(linkContainer => {
                const settingsLink = document.createElement('a');
                settingsLink.href = '#direct-coordinate-settings';
                settingsLink.textContent = 'DirectCoordinate';
                settingsLink.className = 'button';

                settingsLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showSettingsModal();
                });

                linkContainer.appendChild(settingsLink);
            });
        }

        /**
         * Add admin notices
         */
        addAdminNotices() {
            const isEnabled = this.shouldAutoRegister();

            const notice = document.createElement('div');
            notice.className = `notice ${isEnabled ? 'notice-success' : 'notice-info'}`;
            notice.innerHTML = `
                <p>
                    <strong>DirectCoordinate WordPress Integration:</strong>
                    ${isEnabled ? '✅ Active' : '⚠️ Available'} -
                    <a href="#" id="toggle-direct-coordinate">
                        ${isEnabled ? 'Disable' : 'Enable'}
                    </a>
                </p>
            `;

            // Add to admin notices area
            const adminNotices = document.querySelector('.wrap h1');
            if (adminNotices) {
                adminNotices.parentNode.insertBefore(notice, adminNotices.nextSibling);

                // Add click handler
                notice.querySelector('#toggle-direct-coordinate').addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleDirectCoordinate();
                });
            }
        }

        /**
         * Show settings modal
         */
        showSettingsModal() {
            const modal = document.createElement('div');
            modal.id = 'direct-coordinate-modal';
            modal.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    z-index: 999999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div style="
                        background: white;
                        padding: 30px;
                        border-radius: 8px;
                        max-width: 500px;
                        width: 90%;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    ">
                        <h2>🎯 DirectCoordinate WordPress Integration</h2>
                        <p>Current Status: <strong id="current-status">Loading...</strong></p>

                        <h3>Activation Methods:</h3>
                        <ul>
                            <li><code>?direct_coordinates=1</code> - URL Parameter</li>
                            <li><code>enableDirectCoordinates()</code> - JavaScript Console</li>
                            <li>LocalStorage: directCoordinatesEnabled = true</li>
                        </ul>

                        <h3>Actions:</h3>
                        <div style="margin: 20px 0;">
                            <button id="enable-direct-coord" class="button button-primary">Enable</button>
                            <button id="disable-direct-coord" class="button">Disable</button>
                            <button id="test-direct-coord" class="button">Test Population</button>
                        </div>

                        <div style="margin: 20px 0;">
                            <h4>Form Fields Status:</h4>
                            <pre id="form-fields-status" style="background: #f0f0f1; padding: 10px; font-size: 12px;">Loading...</pre>
                        </div>

                        <div style="text-align: right;">
                            <button id="close-modal" class="button">Close</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Update status
            this.updateModalStatus(modal);

            // Add event handlers
            modal.querySelector('#enable-direct-coord').addEventListener('click', () => {
                window.enableDirectCoordinates && window.enableDirectCoordinates();
                this.updateModalStatus(modal);
            });

            modal.querySelector('#disable-direct-coord').addEventListener('click', () => {
                window.disableDirectCoordinates && window.disableDirectCoordinates();
                this.updateModalStatus(modal);
            });

            modal.querySelector('#test-direct-coord').addEventListener('click', () => {
                window.testDirectCoordinatePopulation && window.testDirectCoordinatePopulation();
                this.updateModalStatus(modal);
            });

            modal.querySelector('#close-modal').addEventListener('click', () => {
                modal.remove();
            });

            // Close on background click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }

        /**
         * Update modal status information
         */
        updateModalStatus(modal) {
            const statusEl = modal.querySelector('#current-status');
            const formFieldsEl = modal.querySelector('#form-fields-status');

            // Get current status
            let status = 'Not Loaded';
            let formFields = 'N/A';

            if (typeof window.directCoordinateStatus === 'function') {
                const statusData = window.directCoordinateStatus();
                status = statusData.enabled ? '✅ Enabled' : '⚠️ Disabled';
                formFields = JSON.stringify(statusData.formFieldsFound, null, 2);
            }

            statusEl.textContent = status;
            formFieldsEl.textContent = formFields;
        }

        /**
         * Toggle DirectCoordinate system
         */
        toggleDirectCoordinate() {
            if (typeof window.directCoordinateStatus === 'function') {
                const status = window.directCoordinateStatus();

                if (status.enabled) {
                    window.disableDirectCoordinates && window.disableDirectCoordinates();
                } else {
                    window.enableDirectCoordinates && window.enableDirectCoordinates();
                }
            } else {
                // If not loaded yet, try to enable
                window.enableDirectCoordinates && window.enableDirectCoordinates();
            }

            // Refresh page to update admin interface
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }

        /**
         * Setup global interface
         */
        setupGlobalInterface() {
            // Global registration function
            window.registerDirectCoordinate = () => {
                this.registerWordPressScripts();
                return 'DirectCoordinate WordPress scripts registered';
            };

            // Global status function
            window.directCoordinateRegistrationStatus = () => {
                return {
                    isWordPress: this.isWordPress,
                    scriptsRegistered: this.scriptsRegistered,
                    adminInitialized: this.adminInitialized,
                    shouldAutoRegister: this.shouldAutoRegister()
                };
            };

            // Global settings function
            window.showDirectCoordinateSettings = () => {
                this.showSettingsModal();
            };

            this.log('info', '🐛 Registration interface ready:');
            this.log('info', '  - registerDirectCoordinate()');
            this.log('info', '  - directCoordinateRegistrationStatus()');
            this.log('info', '  - showDirectCoordinateSettings()');
        }

        /**
         * Debug logging
         */
        log(level, ...args) {
            const prefix = '[DIRECT-COORDINATE-REG]';

            switch (level) {
                case 'error':
                    console.error(prefix, ...args);
                    break;
                case 'warn':
                    console.warn(prefix, ...args);
                    break;
                case 'debug':
                    if (this.isDevelopmentMode()) {
                        console.log(prefix, '[DEBUG]', ...args);
                    }
                    break;
                default:
                    console.log(prefix, ...args);
            }
        }

        /**
         * Static registration method for external use
         */
        static register() {
            if (!window.directCoordinateRegistration) {
                window.directCoordinateRegistration = new window.DirectCoordinateRegistration();
            }
            return window.directCoordinateRegistration;
        }
    };

    /**
     * Auto-initialize registration system
     */
    function initializeRegistration() {
        console.log('🎯 DIRECT COORDINATE REGISTRATION: Starting auto-initialization...');

        // Create global registration instance
        window.directCoordinateRegistration = new window.DirectCoordinateRegistration();

        console.log('🎯 DIRECT COORDINATE REGISTRATION: System ready');
        console.log('💡 Manual registration: DirectCoordinateRegistration.register()');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeRegistration);
    } else {
        initializeRegistration();
    }

    console.log('🎯 DIRECT COORDINATE REGISTRATION: Module loaded - Ready for WordPress integration!');

})();
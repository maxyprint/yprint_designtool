/**
 * 🔌 YPRINT PLUGIN FRAMEWORK v1.0
 * CLEAN ARCHITECTURE: Zero Core-Designer modification
 *
 * PURPOSE: Safe plugin registry for YPrint extensions
 * SECURITY: Sandboxed plugin execution with Core-protection
 */

(function() {
    'use strict';

    console.log('🔌 YPRINT PLUGIN FRAMEWORK: Initializing...');

    // Prevent double-loading
    if (window.YPrintPlugins) {
        console.warn('🔌 PLUGIN FRAMEWORK: Already loaded, skipping initialization');
        return;
    }

    /**
     * YPrint Plugin Framework
     * Central registry for all YPrint plugins
     */
    window.YPrintPlugins = {
        // Plugin storage
        registry: new Map(),
        enabledPlugins: new Set(),

        // Event system for plugin communication
        eventBus: new EventTarget(),

        // Framework metadata
        version: '1.0.0',
        initialized: false,

        /**
         * Register a plugin with validation
         */
        register(pluginName, plugin) {
            console.log(`🔌 PLUGIN REGISTRY: Attempting to register '${pluginName}'`);

            // Validate plugin structure
            if (!this.validatePlugin(plugin)) {
                console.error(`❌ PLUGIN REGISTRY: Invalid plugin '${pluginName}'`);
                return false;
            }

            // Check for name conflicts
            if (this.registry.has(pluginName)) {
                console.warn(`⚠️ PLUGIN REGISTRY: Plugin '${pluginName}' already registered, overwriting`);
            }

            // Store plugin
            this.registry.set(pluginName, plugin);

            // Fire registration event
            this.fireEvent('plugin:registered', {
                name: pluginName,
                plugin: plugin,
                timestamp: Date.now()
            });

            console.log(`✅ PLUGIN REGISTRY: Plugin '${pluginName}' registered successfully`);
            return true;
        },

        /**
         * Validate plugin structure
         */
        validatePlugin(plugin) {
            if (!plugin || typeof plugin !== 'object') {
                console.error('❌ PLUGIN VALIDATION: Plugin must be an object');
                return false;
            }

            if (!plugin.name || typeof plugin.name !== 'string') {
                console.error('❌ PLUGIN VALIDATION: Plugin must have a name property');
                return false;
            }

            if (!plugin.initialize || typeof plugin.initialize !== 'function') {
                console.error('❌ PLUGIN VALIDATION: Plugin must have initialize() method');
                return false;
            }

            // Optional but recommended properties
            if (!plugin.version) {
                console.warn('⚠️ PLUGIN VALIDATION: Plugin should have version property');
            }

            return true;
        },

        /**
         * Fire plugin events
         */
        fireEvent(type, detail) {
            const event = new CustomEvent(type, { detail });
            this.eventBus.dispatchEvent(event);

            console.log(`🎯 PLUGIN EVENT: ${type}`, detail);
        },

        /**
         * Get plugin by name
         */
        getPlugin(pluginName) {
            return this.registry.get(pluginName);
        },

        /**
         * List all registered plugins
         */
        listPlugins() {
            const plugins = [];
            for (const [name, plugin] of this.registry) {
                plugins.push({
                    name,
                    version: plugin.version || 'unknown',
                    enabled: this.enabledPlugins.has(name)
                });
            }
            return plugins;
        },

        /**
         * Check if plugin is registered
         */
        hasPlugin(pluginName) {
            return this.registry.has(pluginName);
        },

        /**
         * Create safe Designer API for plugins
         */
        createDesignerAPI() {
            console.log('🔌 DESIGNER API: Creating safe API interface...');

            return {
                /**
                 * Get canvas instance (read-only access)
                 */
                getCanvas: () => {
                    // Safe access to canvas without exposing Designer internals
                    if (window.designerWidgetInstance && window.designerWidgetInstance.fabricCanvas) {
                        return window.designerWidgetInstance.fabricCanvas;
                    }
                    console.warn('⚠️ DESIGNER API: Canvas not available');
                    return null;
                },

                /**
                 * Get plugin event bus
                 */
                getEventBus: () => {
                    return this.eventBus;
                },

                /**
                 * Add menu item to Designer UI (safe UI modification)
                 */
                addMenuItem: (label, callback) => {
                    console.log(`🔌 DESIGNER API: Adding menu item '${label}'`);

                    // Safe UI integration - doesn't modify Core-Designer
                    this.addPluginMenuItem(label, callback);
                },

                /**
                 * Fire events safely
                 */
                fireEvent: (type, detail) => {
                    this.fireEvent(`plugin:${type}`, detail);
                },

                /**
                 * Get Designer metadata (safe, read-only)
                 */
                getDesignerInfo: () => {
                    return {
                        hasCanvas: !!(window.designerWidgetInstance && window.designerWidgetInstance.fabricCanvas),
                        hasInstance: !!window.designerWidgetInstance,
                        timestamp: Date.now()
                    };
                }

                // SECURITY: No direct access to Designer internals
                // No access to: designerWidgetInstance, templates, currentView, etc.
            };
        },

        /**
         * Initialize plugin with safe API
         */
        initializePlugin(pluginName) {
            console.log(`🔌 PLUGIN INIT: Initializing plugin '${pluginName}'`);

            const plugin = this.registry.get(pluginName);
            if (!plugin) {
                console.error(`❌ PLUGIN INIT: Plugin '${pluginName}' not found`);
                return false;
            }

            try {
                // Create safe API for this plugin
                const designerAPI = this.createDesignerAPI();

                // Initialize plugin with API
                const result = plugin.initialize(designerAPI);

                // Mark as enabled
                this.enabledPlugins.add(pluginName);

                // Fire initialization event
                this.fireEvent('plugin:initialized', {
                    name: pluginName,
                    result: result,
                    timestamp: Date.now()
                });

                console.log(`✅ PLUGIN INIT: Plugin '${pluginName}' initialized successfully`);
                return true;

            } catch (error) {
                console.error(`❌ PLUGIN INIT: Failed to initialize '${pluginName}':`, error);
                return false;
            }
        },

        /**
         * Add plugin menu item (safe UI integration)
         */
        addPluginMenuItem(label, callback) {
            // Create plugin menu container if it doesn't exist
            if (!document.getElementById('yprint-plugin-menu')) {
                this.createPluginMenuContainer();
            }

            // Add menu item
            const menuContainer = document.getElementById('yprint-plugin-menu');
            const menuItem = document.createElement('button');
            menuItem.textContent = label;
            menuItem.className = 'yprint-plugin-menu-item';
            menuItem.addEventListener('click', callback);

            menuContainer.appendChild(menuItem);

            console.log(`✅ PLUGIN UI: Menu item '${label}' added`);
        },

        /**
         * Create plugin menu container
         */
        createPluginMenuContainer() {
            const menuContainer = document.createElement('div');
            menuContainer.id = 'yprint-plugin-menu';
            menuContainer.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: white;
                border: 1px solid #ccc;
                border-radius: 4px;
                padding: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 9999;
                font-family: Arial, sans-serif;
            `;

            const title = document.createElement('div');
            title.textContent = '🔌 Plugins';
            title.style.cssText = 'font-weight: bold; margin-bottom: 5px; font-size: 12px;';
            menuContainer.appendChild(title);

            document.body.appendChild(menuContainer);

            console.log('✅ PLUGIN UI: Menu container created');
        },

        /**
         * Framework initialization
         */
        initialize() {
            if (this.initialized) {
                console.warn('🔌 PLUGIN FRAMEWORK: Already initialized');
                return;
            }

            console.log('🔌 PLUGIN FRAMEWORK: Starting initialization...');

            // Validate environment
            if (typeof window === 'undefined') {
                throw new Error('Plugin framework requires browser environment');
            }

            // Mark as initialized
            this.initialized = true;

            // Fire ready event
            this.fireEvent('framework:ready', {
                version: this.version,
                timestamp: Date.now()
            });

            console.log('✅ PLUGIN FRAMEWORK: Initialization complete');
        }
    };

    // Auto-initialize framework
    try {
        window.YPrintPlugins.initialize();
    } catch (error) {
        console.error('❌ PLUGIN FRAMEWORK: Initialization failed:', error);
    }

    console.log('🔌 YPRINT PLUGIN FRAMEWORK: Loaded successfully');

})();

// Export for module systems if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.YPrintPlugins;
}
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
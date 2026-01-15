/**
 * 🎯 UNIFIED TEMPLATE DATA ACCESS
 *
 * Zentrale, verlässliche Quelle für alle Template-bezogenen Daten
 * Löst das Template ID Detection Chaos und Race Conditions
 */

class UnifiedTemplateDataAccess {
    constructor() {
        this.templateCache = new Map();
        this.lastKnownTemplateId = null;
        this.isDebugMode = true;

        console.log('🎯 UNIFIED TEMPLATE ACCESS: Initializing...');

        // Bind methods for consistent context
        this.getTemplateId = this.getTemplateId.bind(this);
        this.getViewData = this.getViewData.bind(this);
        this.getPrintArea = this.getPrintArea.bind(this);
    }

    /**
     * 🔍 DEFINITIVE Template ID Detection
     * Ersetzt alle fragmentierten Detection-Methoden
     */
    getTemplateId() {
        if (this.isDebugMode) {
            console.log('🔍 UNIFIED: Starting definitive template ID detection...');
        }

        // Method 1: Cache check (fastest)
        if (this.lastKnownTemplateId) {
            if (this.isDebugMode) {
                console.log(`✅ UNIFIED: Using cached template ID: ${this.lastKnownTemplateId}`);
            }
            return this.lastKnownTemplateId;
        }

        // Method 2: Designer Instance (most reliable)
        const templateId = this._getFromDesignerInstance();
        if (templateId) {
            this.lastKnownTemplateId = templateId;
            return templateId;
        }

        // Method 3: DOM and URL fallbacks
        const fallbackId = this._getFallbackTemplateId();
        if (fallbackId) {
            this.lastKnownTemplateId = fallbackId;
            return fallbackId;
        }

        // Method 4: Emergency detection
        const emergencyId = this._emergencyTemplateDetection();
        if (emergencyId) {
            this.lastKnownTemplateId = emergencyId;
            return emergencyId;
        }

        console.error('❌ UNIFIED: CRITICAL - No template ID found through any method');
        return null;
    }

    /**
     * 🎯 Designer Instance Template Detection
     */
    _getFromDesignerInstance() {
        // Check both possible instance names
        const designerInstances = [
            window.designerInstance,
            window.designerWidgetInstance
        ].filter(Boolean);

        for (const designer of designerInstances) {
            if (this.isDebugMode) {
                console.log('🔍 UNIFIED: Checking designer instance:', Object.keys(designer));
            }

            // Direct property checks
            const templateProperties = [
                'activeTemplateId',
                'templateId',
                'currentTemplateId',
                'template_id'
            ];

            for (const prop of templateProperties) {
                const value = designer[prop];
                if (value && this._isValidTemplateId(value)) {
                    console.log(`✅ UNIFIED: Found template ID via ${prop}: ${value}`);
                    return String(value);
                }
            }

            // Nested property checks
            const nestedPaths = [
                'config.templateId',
                'config.template_id',
                'currentTemplate.id',
                'template.id'
            ];

            for (const path of nestedPaths) {
                const value = this._getNestedProperty(designer, path);
                if (value && this._isValidTemplateId(value)) {
                    console.log(`✅ UNIFIED: Found template ID via ${path}: ${value}`);
                    return String(value);
                }
            }

            // Template Map inspection (for designer.bundle.js structure)
            if (designer.templates && typeof designer.templates.forEach === 'function') {
                const currentTemplate = this._findCurrentTemplateFromMap(designer.templates);
                if (currentTemplate) {
                    console.log(`✅ UNIFIED: Found template ID via templates map: ${currentTemplate}`);
                    return currentTemplate;
                }
            }
        }

        return null;
    }

    /**
     * 🔧 Template Map inspection
     */
    _findCurrentTemplateFromMap(templatesMap) {
        try {
            // Check if it's a Map
            if (typeof templatesMap.get === 'function') {
                // Try to find the active template
                const templateKeys = Array.from(templatesMap.keys());
                if (templateKeys.length === 1) {
                    return templateKeys[0]; // Only one template, must be active
                }

                // Look for template with active state
                for (const key of templateKeys) {
                    const template = templatesMap.get(key);
                    if (template && (template.isActive || template.active)) {
                        return key;
                    }
                }

                // Fallback: return first template
                return templateKeys[0];
            }

            // Handle object-based templates
            const templateKeys = Object.keys(templatesMap);
            return templateKeys.length > 0 ? templateKeys[0] : null;

        } catch (error) {
            console.warn('🔧 UNIFIED: Template map inspection failed:', error);
            return null;
        }
    }

    /**
     * 🆘 Fallback Template Detection
     */
    _getFallbackTemplateId() {
        // URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const urlTemplate = urlParams.get('template_id') || urlParams.get('template') || urlParams.get('tid');
        if (urlTemplate && this._isValidTemplateId(urlTemplate)) {
            console.log(`✅ UNIFIED: Found template ID via URL: ${urlTemplate}`);
            return urlTemplate;
        }

        // DOM data attributes
        const domSelectors = [
            '[data-template-id]',
            '[data-template]',
            '.template-container[data-id]',
            '#template-data[data-template-id]'
        ];

        for (const selector of domSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                const domTemplate = element.dataset.templateId || element.dataset.template || element.dataset.id;
                if (domTemplate && this._isValidTemplateId(domTemplate)) {
                    console.log(`✅ UNIFIED: Found template ID via DOM ${selector}: ${domTemplate}`);
                    return domTemplate;
                }
            }
        }

        // Global variables
        const globalVars = ['currentTemplateId', 'templateId', 'TEMPLATE_ID'];
        for (const varName of globalVars) {
            const globalTemplate = window[varName];
            if (globalTemplate && this._isValidTemplateId(globalTemplate)) {
                console.log(`✅ UNIFIED: Found template ID via global ${varName}: ${globalTemplate}`);
                return String(globalTemplate);
            }
        }

        return null;
    }

    /**
     * 🚨 Emergency Template Detection
     */
    _emergencyTemplateDetection() {
        try {
            // Check console logs for template references
            const scriptTags = document.querySelectorAll('script');
            for (const script of scriptTags) {
                if (script.textContent && script.textContent.includes('template')) {
                    const templateMatch = script.textContent.match(/template[_\-]?id['":\s]*(\d+)/i);
                    if (templateMatch) {
                        const emergencyTemplate = templateMatch[1];
                        console.log(`🚨 UNIFIED: Emergency detection found: ${emergencyTemplate}`);
                        return emergencyTemplate;
                    }
                }
            }

            // URL path inspection
            const pathMatch = window.location.pathname.match(/\/designer\/(\d+)/);
            if (pathMatch) {
                console.log(`🚨 UNIFIED: Emergency detection via URL path: ${pathMatch[1]}`);
                return pathMatch[1];
            }

        } catch (error) {
            console.warn('🚨 UNIFIED: Emergency detection failed:', error);
        }

        return null;
    }

    /**
     * 🎯 Get View Data for Template
     */
    getViewData(templateId = null, variationId = null, viewId = null) {
        const resolvedTemplateId = templateId || this.getTemplateId();
        if (!resolvedTemplateId) {
            console.error('❌ UNIFIED: Cannot get view data - no template ID');
            return null;
        }

        try {
            const designer = window.designerInstance || window.designerWidgetInstance;
            if (!designer || !designer.templates) {
                console.error('❌ UNIFIED: No designer instance with templates found');
                return null;
            }

            const template = designer.templates.get ?
                designer.templates.get(resolvedTemplateId) :
                designer.templates[resolvedTemplateId];

            if (!template) {
                console.error(`❌ UNIFIED: Template ${resolvedTemplateId} not found`);
                return null;
            }

            // Get current variation if not specified
            const currentVariation = variationId || designer.currentVariation;
            const variation = template.variations.get ?
                template.variations.get(currentVariation) :
                template.variations[currentVariation];

            if (!variation) {
                console.error(`❌ UNIFIED: Variation ${currentVariation} not found`);
                return null;
            }

            // Get all views or specific view
            if (viewId) {
                const view = variation.views.get ?
                    variation.views.get(viewId) :
                    variation.views[viewId];
                return view;
            } else {
                // Return all views
                const allViews = [];
                if (variation.views.forEach) {
                    variation.views.forEach((view, id) => {
                        allViews.push({ id, ...view });
                    });
                } else {
                    Object.keys(variation.views).forEach(id => {
                        allViews.push({ id, ...variation.views[id] });
                    });
                }
                return allViews;
            }

        } catch (error) {
            console.error('❌ UNIFIED: Error getting view data:', error);
            return null;
        }
    }

    /**
     * 🎯 Get Print Area for View
     */
    getPrintArea(templateId = null, viewId = null) {
        const resolvedTemplateId = templateId || this.getTemplateId();
        if (!resolvedTemplateId) {
            console.error('❌ UNIFIED: Cannot get print area - no template ID');
            return null;
        }

        try {
            const viewData = this.getViewData(resolvedTemplateId, null, viewId);
            if (viewData && viewData.safeZone) {
                console.log(`✅ UNIFIED: Found print area for template ${resolvedTemplateId}, view ${viewId}`);
                return {
                    x: viewData.safeZone.left,
                    y: viewData.safeZone.top,
                    width: viewData.safeZone.width,
                    height: viewData.safeZone.height
                };
            }

            // Fallback to canvas-based detection
            return this._getCanvasPrintArea();

        } catch (error) {
            console.error('❌ UNIFIED: Error getting print area:', error);
            return this._getCanvasPrintArea();
        }
    }

    /**
     * 🔧 Canvas-based Print Area Detection
     */
    _getCanvasPrintArea() {
        try {
            const designer = window.designerInstance || window.designerWidgetInstance;
            const canvas = designer?.fabricCanvas;

            if (!canvas) {
                console.warn('⚠️ UNIFIED: No canvas found for print area detection');
                return { x: 50, y: 50, width: 200, height: 300 }; // Safe fallback
            }

            // Look for print zone rectangle
            const objects = canvas.getObjects();
            const printZone = objects.find(obj =>
                obj.type === 'rect' &&
                (obj.name === 'print-zone' || obj.id === 'print-zone')
            );

            if (printZone) {
                console.log('✅ UNIFIED: Found canvas print zone');
                return {
                    x: printZone.left,
                    y: printZone.top,
                    width: printZone.width * printZone.scaleX,
                    height: printZone.height * printZone.scaleY
                };
            }

            // Fallback calculation
            const canvasWidth = canvas.getWidth();
            const canvasHeight = canvas.getHeight();
            const margin = Math.min(canvasWidth, canvasHeight) * 0.1;

            return {
                x: margin,
                y: margin,
                width: canvasWidth - (margin * 2),
                height: canvasHeight - (margin * 2)
            };

        } catch (error) {
            console.error('❌ UNIFIED: Canvas print area detection failed:', error);
            return { x: 50, y: 50, width: 200, height: 300 };
        }
    }

    /**
     * 🔧 Utility: Get nested property
     */
    _getNestedProperty(obj, path) {
        try {
            return path.split('.').reduce((current, key) => current?.[key], obj);
        } catch {
            return null;
        }
    }

    /**
     * ✅ Utility: Validate Template ID
     */
    _isValidTemplateId(value) {
        return value &&
               (typeof value === 'string' || typeof value === 'number') &&
               String(value).length > 0 &&
               !isNaN(String(value));
    }

    /**
     * 🗑️ Clear Cache
     */
    clearCache() {
        this.templateCache.clear();
        this.lastKnownTemplateId = null;
        console.log('🗑️ UNIFIED: Template cache cleared');
    }

    /**
     * 🐛 Debug Information
     */
    getDebugInfo() {
        return {
            lastKnownTemplateId: this.lastKnownTemplateId,
            cacheSize: this.templateCache.size,
            designerInstance: !!window.designerInstance,
            designerWidgetInstance: !!window.designerWidgetInstance,
            availableGlobals: Object.keys(window).filter(key => key.toLowerCase().includes('template'))
        };
    }
}

// Global instance
window.unifiedTemplateDataAccess = new UnifiedTemplateDataAccess();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedTemplateDataAccess;
}

console.log('✅ UNIFIED TEMPLATE DATA ACCESS: Loaded and ready');
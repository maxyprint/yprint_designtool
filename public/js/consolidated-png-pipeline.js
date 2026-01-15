/**
 * 🎯 CONSOLIDATED PNG PIPELINE
 *
 * Vereint alle PNG Generation Systeme in einer sauberen Pipeline
 * Ersetzt: save-only-png-generator, multi-view-system, high-dpi-engine Fragmente
 */

class ConsolidatedPNGPipeline {
    constructor() {
        this.isInitialized = false;
        this.generationQueue = [];
        this.isGenerating = false;
        this.templateDataAccess = window.unifiedTemplateDataAccess;

        console.log('🎯 CONSOLIDATED PNG PIPELINE: Initializing...');

        // Bind methods
        this.generateSingleView = this.generateSingleView.bind(this);
        this.generateMultiView = this.generateMultiView.bind(this);
        this.init = this.init.bind(this);
    }

    /**
     * 🚀 Initialize Pipeline
     */
    async init() {
        if (this.isInitialized) {
            console.log('✅ CONSOLIDATED PNG: Already initialized');
            return true;
        }

        try {
            // Wait for dependencies
            await this._waitForDependencies();

            // Validate required components
            if (!this._validateComponents()) {
                throw new Error('Required components not available');
            }

            this.isInitialized = true;
            console.log('✅ CONSOLIDATED PNG PIPELINE: Initialized successfully');
            return true;

        } catch (error) {
            console.error('❌ CONSOLIDATED PNG: Initialization failed:', error);
            return false;
        }
    }

    /**
     * 🎨 Generate PNG for Single View
     */
    async generateSingleView(options = {}) {
        const {
            viewId = null,
            viewName = null,
            templateId = null,
            saveType = 'single_view',
            dpi = 300,
            quality = 1
        } = options;

        console.log(`🎨 CONSOLIDATED PNG: Generating single view PNG`, { viewId, viewName, templateId });

        if (!this.isInitialized) {
            console.error('❌ CONSOLIDATED PNG: Pipeline not initialized');
            return { success: false, error: 'Pipeline not initialized' };
        }

        try {
            // Get template ID
            const resolvedTemplateId = templateId || this.templateDataAccess.getTemplateId();
            if (!resolvedTemplateId) {
                throw new Error('No template ID available');
            }

            // Get view-specific data
            const viewData = viewId ? this.templateDataAccess.getViewData(resolvedTemplateId, null, viewId) : null;
            const printArea = this.templateDataAccess.getPrintArea(resolvedTemplateId, viewId);

            // Prepare generation context
            const context = {
                templateId: resolvedTemplateId,
                viewId,
                viewName: viewName || (viewData?.name) || `View_${viewId}`,
                printArea,
                dpi,
                quality,
                saveType
            };

            // Generate PNG
            const result = await this._executePNGGeneration(context);

            if (result.success) {
                // Store in database with view metadata
                await this._storePNGWithMetadata(result.dataUrl, context);
            }

            return result;

        } catch (error) {
            console.error('❌ CONSOLIDATED PNG: Single view generation failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🎨🎨 Generate PNGs for Multiple Views
     */
    async generateMultiView(options = {}) {
        const {
            templateId = null,
            variationId = null,
            saveType = 'multi_view',
            dpi = 300,
            quality = 1,
            sequential = false
        } = options;

        console.log(`🎨🎨 CONSOLIDATED PNG: Generating multi-view PNGs`, { templateId, sequential });

        if (!this.isInitialized) {
            console.error('❌ CONSOLIDATED PNG: Pipeline not initialized');
            return { success: false, error: 'Pipeline not initialized' };
        }

        try {
            // Get template ID and views
            const resolvedTemplateId = templateId || this.templateDataAccess.getTemplateId();
            if (!resolvedTemplateId) {
                throw new Error('No template ID available');
            }

            const allViews = this.templateDataAccess.getViewData(resolvedTemplateId, variationId);
            if (!allViews || allViews.length === 0) {
                throw new Error('No views found for template');
            }

            console.log(`🔍 CONSOLIDATED PNG: Found ${allViews.length} views to generate`);

            const results = {};
            const errors = {};

            if (sequential) {
                // Sequential generation (safer, slower)
                for (const view of allViews) {
                    try {
                        const result = await this.generateSingleView({
                            viewId: view.id,
                            viewName: view.name,
                            templateId: resolvedTemplateId,
                            saveType,
                            dpi,
                            quality
                        });

                        if (result.success) {
                            results[view.id] = result;
                        } else {
                            errors[view.id] = result.error;
                        }
                    } catch (error) {
                        errors[view.id] = error.message;
                    }
                }
            } else {
                // Parallel generation (faster, more complex)
                const promises = allViews.map(async (view) => {
                    try {
                        const result = await this.generateSingleView({
                            viewId: view.id,
                            viewName: view.name,
                            templateId: resolvedTemplateId,
                            saveType,
                            dpi,
                            quality
                        });
                        return { viewId: view.id, result };
                    } catch (error) {
                        return { viewId: view.id, error: error.message };
                    }
                });

                const promiseResults = await Promise.allSettled(promises);

                promiseResults.forEach(({ status, value }) => {
                    if (status === 'fulfilled' && value.result && value.result.success) {
                        results[value.viewId] = value.result;
                    } else {
                        errors[value.viewId] = value.error || 'Unknown error';
                    }
                });
            }

            const successCount = Object.keys(results).length;
            const errorCount = Object.keys(errors).length;

            console.log(`✅ CONSOLIDATED PNG: Multi-view completed - ${successCount} success, ${errorCount} errors`);

            return {
                success: successCount > 0,
                results,
                errors,
                summary: {
                    totalViews: allViews.length,
                    successful: successCount,
                    failed: errorCount
                }
            };

        } catch (error) {
            console.error('❌ CONSOLIDATED PNG: Multi-view generation failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🎯 Execute PNG Generation Core Logic
     */
    async _executePNGGeneration(context) {
        try {
            console.log('🎯 CONSOLIDATED PNG: Executing core generation for:', context.viewId || 'current');

            // Get fabric canvas
            const designer = window.designerInstance || window.designerWidgetInstance;
            const canvas = designer?.fabricCanvas;

            if (!canvas) {
                throw new Error('No fabric canvas available');
            }

            // Switch to target view if specified
            if (context.viewId && designer.loadTemplateView) {
                console.log(`🔄 CONSOLIDATED PNG: Switching to view ${context.viewId}`);
                await designer.loadTemplateView(context.viewId);
                // Wait for view switch to complete
                await this._waitForViewSwitch(context.viewId);
            }

            // Get design elements (filter out background/non-design objects)
            const objects = canvas.getObjects();
            const designElements = this._filterDesignElements(objects);

            if (designElements.length === 0) {
                console.warn('⚠️ CONSOLIDATED PNG: No design elements found');
            }

            // Calculate print area and multiplier
            const multiplier = context.dpi / 72; // 72 DPI = default
            const printArea = context.printArea || { x: 0, y: 0, width: canvas.getWidth(), height: canvas.getHeight() };

            console.log('🎯 CONSOLIDATED PNG: Generation params:', {
                printArea,
                multiplier,
                designElements: designElements.length,
                dpi: context.dpi
            });

            // Hide non-design elements temporarily
            const hiddenObjects = [];
            objects.forEach(obj => {
                if (!designElements.includes(obj) && obj.visible) {
                    obj.visible = false;
                    hiddenObjects.push(obj);
                }
            });

            // Generate high-DPI canvas
            const originalMultiplier = canvas.getRetinaScaling();
            canvas.setRetinaScaling(multiplier);

            // Export to data URL
            const dataUrl = canvas.toDataURL({
                format: 'png',
                quality: context.quality,
                multiplier: multiplier,
                left: printArea.x,
                top: printArea.y,
                width: printArea.width,
                height: printArea.height
            });

            // Restore original settings
            canvas.setRetinaScaling(originalMultiplier);
            hiddenObjects.forEach(obj => { obj.visible = true; });

            console.log(`✅ CONSOLIDATED PNG: Generation successful - ${dataUrl.length} chars`);

            return {
                success: true,
                dataUrl,
                context,
                metadata: {
                    width: Math.round(printArea.width * multiplier),
                    height: Math.round(printArea.height * multiplier),
                    dpi: context.dpi,
                    elementsCount: designElements.length
                }
            };

        } catch (error) {
            console.error('❌ CONSOLIDATED PNG: Core generation failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🗂️ Store PNG with View Metadata
     */
    async _storePNGWithMetadata(dataUrl, context) {
        try {
            console.log('🗂️ CONSOLIDATED PNG: Storing with metadata:', context.viewId);

            const formData = new FormData();
            formData.append('action', 'yprint_store_design_png');
            formData.append('design_id', `temp_${Date.now()}`); // Will be replaced by backend
            formData.append('template_id', context.templateId);
            formData.append('view_id', context.viewId || '');
            formData.append('view_name', context.viewName || '');
            formData.append('png_data', dataUrl);
            formData.append('save_type', context.saveType);
            formData.append('metadata', JSON.stringify({
                dpi: context.dpi,
                printArea: context.printArea,
                generatedAt: new Date().toISOString()
            }));
            formData.append('nonce', window.octo_print_designer_config?.nonce || '');

            const response = await fetch(window.yprint_ajax?.ajax_url || '/wp-admin/admin-ajax.php', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ CONSOLIDATED PNG: Stored successfully in database');
                return result.data;
            } else {
                console.error('❌ CONSOLIDATED PNG: Storage failed:', result.data);
                return null;
            }

        } catch (error) {
            console.error('❌ CONSOLIDATED PNG: Storage error:', error);
            return null;
        }
    }

    /**
     * 🔧 Filter Design Elements
     */
    _filterDesignElements(objects) {
        return objects.filter(obj => {
            // Exclude backgrounds (oversized images)
            if (obj.type === 'image' && (obj.width > 1000 || obj.height > 1000)) {
                return false;
            }

            // Exclude print zones
            if (obj.type === 'rect' && (obj.name === 'print-zone' || obj.id === 'print-zone')) {
                return false;
            }

            // Include visible design elements
            return obj.visible && obj.type !== 'background';
        });
    }

    /**
     * ⏳ Wait for Dependencies
     */
    async _waitForDependencies() {
        const maxAttempts = 20;
        let attempts = 0;

        while (attempts < maxAttempts) {
            if (window.fabric &&
                (window.designerInstance || window.designerWidgetInstance) &&
                window.unifiedTemplateDataAccess) {
                return true;
            }

            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        throw new Error('Required dependencies not available after timeout');
    }

    /**
     * ✅ Validate Components
     */
    _validateComponents() {
        const required = [
            { name: 'fabric', value: window.fabric },
            { name: 'designerInstance', value: window.designerInstance || window.designerWidgetInstance },
            { name: 'templateDataAccess', value: this.templateDataAccess },
            { name: 'ajax', value: window.yprint_ajax || window.ajaxurl }
        ];

        for (const component of required) {
            if (!component.value) {
                console.error(`❌ CONSOLIDATED PNG: Missing required component: ${component.name}`);
                return false;
            }
        }

        return true;
    }

    /**
     * ⏳ Wait for View Switch
     */
    async _waitForViewSwitch(targetViewId) {
        const maxWait = 2000; // 2 seconds max
        const checkInterval = 100;
        let elapsed = 0;

        while (elapsed < maxWait) {
            const designer = window.designerInstance || window.designerWidgetInstance;
            if (designer.currentView === targetViewId) {
                console.log(`✅ CONSOLIDATED PNG: View switch to ${targetViewId} completed`);
                return true;
            }

            await new Promise(resolve => setTimeout(resolve, checkInterval));
            elapsed += checkInterval;
        }

        console.warn(`⚠️ CONSOLIDATED PNG: View switch timeout - proceeding anyway`);
        return false;
    }

    /**
     * 🐛 Get Debug Information
     */
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            queueLength: this.generationQueue.length,
            isGenerating: this.isGenerating,
            templateDataAccess: !!this.templateDataAccess,
            dependencies: {
                fabric: !!window.fabric,
                designer: !!(window.designerInstance || window.designerWidgetInstance),
                ajax: !!(window.yprint_ajax || window.ajaxurl)
            }
        };
    }
}

// Global instance
window.consolidatedPNGPipeline = new ConsolidatedPNGPipeline();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConsolidatedPNGPipeline;
}

console.log('✅ CONSOLIDATED PNG PIPELINE: Loaded and ready for initialization');
/**
 * 🎯 MULTI-VIEW PNG SYSTEM
 * Intelligent view-specific PNG generation and storage
 *
 * FEATURES:
 * - Detects views with actual design content
 * - Generates PNG only for designed views
 * - Stores view-specific PNGs with view identification
 * - Maintains backward compatibility with single-view designs
 */

console.log('🎯 MULTI-VIEW PNG: Loading intelligent multi-view PNG system...');

class MultiViewPNGSystem {
    constructor() {
        this.initialized = false;
        this.designerWidget = null;
        this.saveOnlyPNGGenerator = null;
        this.viewContentMap = new Map(); // Tracks which views have content

        console.log('🎯 MULTI-VIEW PNG: Initializing system...');
        this.init();
    }

    async init() {
        // Wait for required systems
        await this.waitForDependencies();

        // Setup view content tracking
        this.setupViewContentTracking();

        // Hook into existing save system
        this.hookIntoSaveSystem();

        // Expose global instance
        window.multiViewPNGSystem = this;

        this.initialized = true;
        console.log('✅ MULTI-VIEW PNG: System initialized successfully');
    }

    async waitForDependencies() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 20;

            const checkDependencies = () => {
                this.designerWidget = window.designerWidgetInstance;
                this.saveOnlyPNGGenerator = window.saveOnlyPNGGenerator;

                if (this.designerWidget && this.saveOnlyPNGGenerator) {
                    console.log('✅ MULTI-VIEW PNG: All dependencies found');
                    resolve();
                    return;
                }

                attempts++;
                if (attempts >= maxAttempts) {
                    console.warn('⚠️ MULTI-VIEW PNG: Dependencies not found, using fallback mode');
                    resolve();
                    return;
                }

                setTimeout(checkDependencies, 250);
            };

            checkDependencies();
        });
    }

    /**
     * 🎯 CONTENT DETECTION: Track which views have actual design content
     */
    setupViewContentTracking() {
        if (!this.designerWidget) {
            console.warn('⚠️ MULTI-VIEW PNG: Designer widget not available for content tracking');
            return;
        }

        console.log('🎯 MULTI-VIEW PNG: Setting up view content tracking...');

        // Track canvas modifications
        if (this.designerWidget.fabricCanvas) {
            this.designerWidget.fabricCanvas.on('object:added', () => {
                this.updateViewContentStatus();
            });

            this.designerWidget.fabricCanvas.on('object:removed', () => {
                this.updateViewContentStatus();
            });

            this.designerWidget.fabricCanvas.on('object:modified', () => {
                this.updateViewContentStatus();
            });
        }

        // Initial content check
        this.scanAllViewsForContent();
    }

    /**
     * 🔍 CONTENT SCANNING: Check all views for existing content
     */
    scanAllViewsForContent() {
        if (!this.designerWidget || !this.designerWidget.templates) {
            return;
        }

        console.log('🔍 MULTI-VIEW PNG: Scanning all views for existing content...');

        // Get current template and its views
        const activeTemplate = this.designerWidget.templates.get(this.designerWidget.activeTemplateId);
        if (!activeTemplate || !activeTemplate.variations) {
            console.warn('⚠️ MULTI-VIEW PNG: No active template found for content scanning');
            return;
        }

        // Scan each variation and view
        activeTemplate.variations.forEach(variation => {
            if (variation.views) {
                variation.views.forEach((viewData, viewId) => {
                    const hasContent = this.checkViewHasContent(variation.id, viewId);
                    const viewKey = `${variation.id}_${viewId}`;

                    this.viewContentMap.set(viewKey, {
                        variationId: variation.id,
                        viewId: viewId,
                        viewName: viewData.name || `View ${viewId}`,
                        hasContent: hasContent,
                        lastUpdated: Date.now()
                    });

                    console.log(`🔍 MULTI-VIEW PNG: View ${viewData.name} (${viewId}) has content: ${hasContent}`);
                });
            }
        });

        console.log('✅ MULTI-VIEW PNG: Content scan completed. Found views:', this.viewContentMap.size);
    }

    /**
     * 🎯 CONTENT CHECK: Determine if a view has actual design content
     */
    checkViewHasContent(variationId, viewId) {
        if (!this.designerWidget) return false;

        const viewKey = `${variationId}_${viewId}`;

        // Check variationImages Map for custom images
        const viewImages = this.designerWidget.variationImages?.get(viewKey);
        if (viewImages && viewImages.length > 0) {
            console.log(`🎯 MULTI-VIEW PNG: View ${viewId} has ${viewImages.length} custom image(s)`);
            return true;
        }

        // Check if currently active view and has canvas objects
        if (this.designerWidget.currentView == viewId && this.designerWidget.currentVariation == variationId) {
            const canvasObjects = this.designerWidget.fabricCanvas?.getObjects() || [];
            const hasDesignObjects = canvasObjects.length > 0;

            if (hasDesignObjects) {
                console.log(`🎯 MULTI-VIEW PNG: Active view ${viewId} has ${canvasObjects.length} canvas object(s)`);
                return true;
            }
        }

        return false;
    }

    /**
     * 🔄 UPDATE: Update content status for current view
     */
    updateViewContentStatus() {
        if (!this.designerWidget || !this.designerWidget.currentView || !this.designerWidget.currentVariation) {
            return;
        }

        const viewKey = `${this.designerWidget.currentVariation}_${this.designerWidget.currentView}`;
        const hasContent = this.checkViewHasContent(this.designerWidget.currentVariation, this.designerWidget.currentView);

        // Get view name from template
        const activeTemplate = this.designerWidget.templates.get(this.designerWidget.activeTemplateId);
        const variation = activeTemplate?.variations.find(v => v.id == this.designerWidget.currentVariation);
        const viewData = variation?.views.get(this.designerWidget.currentView);
        const viewName = viewData?.name || `View ${this.designerWidget.currentView}`;

        this.viewContentMap.set(viewKey, {
            variationId: this.designerWidget.currentVariation,
            viewId: this.designerWidget.currentView,
            viewName: viewName,
            hasContent: hasContent,
            lastUpdated: Date.now()
        });

        console.log(`🔄 MULTI-VIEW PNG: Updated content status for ${viewName}: ${hasContent}`);
    }

    /**
     * 🚀 MULTI-VIEW SAVE: Generate PNGs for all views with content
     */
    async saveAllViewsWithContent(designData = {}) {
        console.log('🚀 MULTI-VIEW PNG: Starting multi-view PNG generation...');

        if (!this.designerWidget) {
            throw new Error('Designer widget not available');
        }

        // Update content status first
        this.scanAllViewsForContent();

        // Filter views that have content
        const viewsWithContent = Array.from(this.viewContentMap.values()).filter(view => view.hasContent);

        console.log(`🎯 MULTI-VIEW PNG: Found ${viewsWithContent.length} view(s) with content:`,
            viewsWithContent.map(v => `${v.viewName}(${v.viewId})`).join(', '));

        if (viewsWithContent.length === 0) {
            console.warn('⚠️ MULTI-VIEW PNG: No views with content found - nothing to save');
            return { success: false, message: 'No views with content to save' };
        }

        const savedPNGs = [];
        const errors = [];

        // Store current view state
        const originalView = this.designerWidget.currentView;
        const originalVariation = this.designerWidget.currentVariation;

        try {
            // Generate PNG for each view with content
            for (const viewInfo of viewsWithContent) {
                try {
                    console.log(`🔄 MULTI-VIEW PNG: Processing view: ${viewInfo.viewName} (${viewInfo.viewId})`);

                    // Switch to the view
                    await this.switchToView(viewInfo.variationId, viewInfo.viewId);

                    // Generate PNG for this view
                    const pngData = await this.generatePNGForCurrentView(viewInfo, designData);

                    if (pngData) {
                        savedPNGs.push({
                            viewId: viewInfo.viewId,
                            viewName: viewInfo.viewName,
                            variationId: viewInfo.variationId,
                            pngData: pngData
                        });
                        console.log(`✅ MULTI-VIEW PNG: Successfully saved PNG for ${viewInfo.viewName}`);
                    } else {
                        errors.push(`Failed to generate PNG for ${viewInfo.viewName}`);
                    }

                } catch (viewError) {
                    console.error(`❌ MULTI-VIEW PNG: Error processing view ${viewInfo.viewName}:`, viewError);
                    errors.push(`Error processing ${viewInfo.viewName}: ${viewError.message}`);
                }
            }

        } finally {
            // Restore original view state
            if (originalView && originalVariation) {
                await this.switchToView(originalVariation, originalView);
                console.log(`🔄 MULTI-VIEW PNG: Restored original view: ${originalView}`);
            }
        }

        const result = {
            success: savedPNGs.length > 0,
            savedPNGs: savedPNGs,
            errors: errors,
            totalProcessed: viewsWithContent.length,
            message: `Processed ${viewsWithContent.length} view(s), saved ${savedPNGs.length} PNG(s)`
        };

        console.log('🎯 MULTI-VIEW PNG: Multi-view save completed:', result);
        return result;
    }

    /**
     * 🔄 VIEW SWITCHING: Switch to specific view for PNG generation
     */
    async switchToView(variationId, viewId) {
        if (!this.designerWidget) {
            throw new Error('Designer widget not available for view switching');
        }

        console.log(`🔄 MULTI-VIEW PNG: Switching to variation ${variationId}, view ${viewId}`);

        // Update current view state
        this.designerWidget.currentVariation = variationId;
        this.designerWidget.currentView = viewId;

        // Load the view if method exists
        if (typeof this.designerWidget.loadTemplateView === 'function') {
            await this.designerWidget.loadTemplateView(viewId);
        }

        // Give time for view to load
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    /**
     * 🖼️ PNG GENERATION: Generate PNG for currently active view
     */
    async generatePNGForCurrentView(viewInfo, designData) {
        console.log(`🖼️ MULTI-VIEW PNG: Generating PNG for view: ${viewInfo.viewName}`);

        if (!this.saveOnlyPNGGenerator || typeof this.saveOnlyPNGGenerator.generateDesignPNG !== 'function') {
            console.error('❌ MULTI-VIEW PNG: SaveOnlyPNGGenerator not available');
            return null;
        }

        try {
            // Prepare design data with view information
            const viewDesignData = {
                ...designData,
                view_id: viewInfo.viewId,
                view_name: viewInfo.viewName,
                variation_id: viewInfo.variationId,
                save_type: 'multi_view'
            };

            // Generate PNG using existing system
            const pngResult = await this.saveOnlyPNGGenerator.generateDesignPNG(viewDesignData, 'multi_view_save');

            console.log(`✅ MULTI-VIEW PNG: PNG generated for ${viewInfo.viewName}:`, {
                result_exists: !!pngResult,
                result_keys: pngResult ? Object.keys(pngResult) : []
            });

            return pngResult;

        } catch (error) {
            console.error(`❌ MULTI-VIEW PNG: Error generating PNG for ${viewInfo.viewName}:`, error);
            throw error;
        }
    }

    /**
     * 🔗 INTEGRATION: Hook into existing save system
     */
    hookIntoSaveSystem() {
        console.log('🔗 MULTI-VIEW PNG: Hooking into existing save system...');

        // Override saveOnlyPNGGenerator's generateDesignPNG method if it exists
        if (this.saveOnlyPNGGenerator && this.saveOnlyPNGGenerator.generateDesignPNG) {
            const originalGenerateDesignPNG = this.saveOnlyPNGGenerator.generateDesignPNG.bind(this.saveOnlyPNGGenerator);

            this.saveOnlyPNGGenerator.generateDesignPNG = async (designData, saveType = 'standard') => {
                // Check if this is a multi-view save request
                if (saveType === 'multi_view_trigger') {
                    console.log('🎯 MULTI-VIEW PNG: Multi-view save triggered');
                    return await this.saveAllViewsWithContent(designData);
                }

                // For single view saves (legacy), call original method
                return await originalGenerateDesignPNG(designData, saveType);
            };

            console.log('✅ MULTI-VIEW PNG: Successfully hooked into save system');
        }

        // Expose global trigger function
        window.triggerMultiViewPNGSave = (designData) => {
            return this.saveAllViewsWithContent(designData);
        };
    }

    /**
     * 📊 STATUS: Get current view content status
     */
    getViewContentStatus() {
        const status = {
            totalViews: this.viewContentMap.size,
            viewsWithContent: Array.from(this.viewContentMap.values()).filter(v => v.hasContent).length,
            viewDetails: Array.from(this.viewContentMap.values())
        };

        console.log('📊 MULTI-VIEW PNG: Current status:', status);
        return status;
    }

    /**
     * 🧹 CLEANUP: Clear view content tracking
     */
    clearViewTracking() {
        this.viewContentMap.clear();
        console.log('🧹 MULTI-VIEW PNG: View tracking cleared');
    }
}

// Auto-initialize when dependencies are ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 MULTI-VIEW PNG: DOM ready, starting initialization...');

    // Small delay to ensure other systems are loaded
    setTimeout(() => {
        if (!window.multiViewPNGSystem) {
            new MultiViewPNGSystem();
        }
    }, 1000);
});

// Expose class globally
window.MultiViewPNGSystem = MultiViewPNGSystem;
/**
 * 🚫 SYSTEM DISABLED: Multi-View PNG System
 * This system is redundant - designer.bundle.js handles PNG generation
 */

// Early exit to prevent initialization
console.log('🚫 MULTI-VIEW: System disabled - using designer.bundle.js for PNG generation');
return;

class MultiViewPNGSystem {
    constructor() {
        this.designerWidget = null;
        this.saveOnlyPNGGenerator = null;
        this.initialized = false;
        this.currentViewKey = "N/A";
        this.viewTemplates = {};
        this.contentStatus = {};

        console.log('🎯 MULTI-VIEW: Initializing system...');
        this.init();
    }

    async init() {
        try {
            await this.waitForDependencies();
            this.hookIntoDesigner();
            this.detectTemplateSystem();
            this.setupViewSwitchingHooks();
            this.initialized = true;
            console.log('✅ MULTI-VIEW: System fully initialized');

            // Initial content check
            this.updateViewContentStatus();

        } catch (error) {
            console.error('❌ MULTI-VIEW: Initialization failed:', error);
            this.fallbackToLegacyMode();
        }
    }

    async waitForDependencies() {
        return new Promise((resolve) => {
            const checkDeps = () => {
                // DIREKT auf window.designerInstance zugreifen, keine Fallbacks
                this.designerWidget = window.designerInstance;
                this.saveOnlyPNGGenerator = window.saveOnlyPNGGenerator;

                if (this.designerWidget && this.saveOnlyPNGGenerator) {
                    console.log('✅ MULTI-VIEW: Dependencies found');
                    console.log('   - designerWidget:', typeof this.designerWidget);
                    console.log('   - saveOnlyPNGGenerator:', typeof this.saveOnlyPNGGenerator);
                    resolve();
                    return true;
                }
                return false;
            };

            // Sofort prüfen
            if (checkDeps()) return;

            // Auf designerReady Event hören (gefeuert um Zeile 2754 in designer.bundle.js)
            const designerReadyHandler = () => {
                console.log('🎯 MULTI-VIEW: designerReady event received');
                checkDeps();
            };

            window.addEventListener('designerReady', designerReadyHandler, {once: true});

            // Polling als zusätzliche Sicherheit
            const pollInterval = setInterval(() => {
                if (checkDeps()) {
                    clearInterval(pollInterval);
                    window.removeEventListener('designerReady', designerReadyHandler);
                }
            }, 100);

            // Fallback Timer nach 5 Sekunden
            setTimeout(() => {
                clearInterval(pollInterval);
                window.removeEventListener('designerReady', designerReadyHandler);
                if (!this.designerWidget || !this.saveOnlyPNGGenerator) {
                    console.warn('⚠️ MULTI-VIEW: Dependencies timeout - proceeding anyway');
                }
                resolve();
            }, 5000);
        });
    }

    hookIntoDesigner() {
        if (!this.designerWidget) {
            console.warn('⚠️ MULTI-VIEW: No designer widget to hook into');
            return;
        }

        // Hook in view switching wenn verfügbar
        if (typeof this.designerWidget.switchView === 'function') {
            const originalSwitchView = this.designerWidget.switchView.bind(this.designerWidget);
            this.designerWidget.switchView = (viewId) => {
                console.log('🔄 MULTI-VIEW: View switching to:', viewId);
                const result = originalSwitchView(viewId);

                // Content status nach view switch aktualisieren
                setTimeout(() => {
                    this.updateViewContentStatus();
                }, 100);

                return result;
            };
            console.log('✅ MULTI-VIEW: Hooked into view switching');
        }

        // Hook in canvas change events wenn verfügbar
        if (this.designerWidget.canvas && this.designerWidget.canvas.on) {
            this.designerWidget.canvas.on('object:added', () => {
                this.updateViewContentStatus();
            });

            this.designerWidget.canvas.on('object:removed', () => {
                this.updateViewContentStatus();
            });

            console.log('✅ MULTI-VIEW: Hooked into canvas events');
        }

        // Hook into save events to trigger multi-view PNG generation
        document.addEventListener('designerShortcodeSave', async (event) => {
            console.log('🎯 MULTI-VIEW: Save event detected, checking for multi-view PNG generation...');

            if (this.initialized) {
                try {
                    // Get available views
                    const availableViews = this.getAvailableViews();
                    console.log('🔍 MULTI-VIEW: Available views for PNG generation:', availableViews);

                    if (availableViews.length > 1) {
                        console.log('🎯 MULTI-VIEW: Multiple views detected - generating multi-view PNGs...');

                        // Prevent default single PNG generation
                        event.preventDefault();
                        event.stopPropagation();

                        // Generate PNGs for all views with content
                        const pngResults = await this.generateMultiViewPNGs();
                        console.log('✅ MULTI-VIEW: Multi-view PNG generation completed:', pngResults);

                        // Fire a custom event with the results
                        document.dispatchEvent(new CustomEvent('multiViewPNGsGenerated', {
                            detail: {
                                originalSaveEvent: event,
                                pngResults: pngResults,
                                viewCount: Object.keys(pngResults).length
                            }
                        }));
                    } else {
                        console.log('ℹ️ MULTI-VIEW: Single view or no views - allowing default PNG generation...');
                    }
                } catch (error) {
                    console.error('❌ MULTI-VIEW: Error in save event handler:', error);
                    // Allow default save to proceed on error
                }
            } else {
                console.log('ℹ️ MULTI-VIEW: System not initialized - allowing default PNG generation...');
            }
        });

        console.log('✅ MULTI-VIEW: Save event handler registered');
    }

    detectTemplateSystem() {
        // Template System erkennen
        try {
            // Verschiedene Wege zur Template-Erkennung
            if (this.designerWidget && this.designerWidget.templates) {
                this.viewTemplates = this.designerWidget.templates;
                console.log('✅ MULTI-VIEW: Templates found via designerWidget.templates');

                // Convert Map to object for easier handling
                if (this.viewTemplates instanceof Map) {
                    const templateMap = {};
                    this.viewTemplates.forEach((template, templateId) => {
                        templateMap[templateId] = template;
                        // Extract views from template variations
                        if (template.variations && template.variations instanceof Map) {
                            template.variations.forEach((variation, variationId) => {
                                if (variation.views && variation.views instanceof Map) {
                                    console.log(`🎯 MULTI-VIEW: Found views in template ${templateId}, variation ${variationId}:`, Array.from(variation.views.keys()));
                                }
                            });
                        }
                    });
                    this.viewTemplates = templateMap;
                }
            } else if (window.templateData) {
                this.viewTemplates = window.templateData;
                console.log('✅ MULTI-VIEW: Templates found via window.templateData');
            } else if (this.designerWidget && this.designerWidget.productTemplates) {
                this.viewTemplates = this.designerWidget.productTemplates;
                console.log('✅ MULTI-VIEW: Templates found via designerWidget.productTemplates');
            }

            const templateCount = this.viewTemplates instanceof Map ? this.viewTemplates.size : Object.keys(this.viewTemplates || {}).length;
            console.log('🎯 MULTI-VIEW: Detected templates:', templateCount);

        } catch (error) {
            console.warn('⚠️ MULTI-VIEW: Template detection failed:', error);
        }
    }

    setupViewSwitchingHooks() {
        // Events für View-Switching überwachen
        document.addEventListener('click', (event) => {
            // View-Buttons erkennen (häufige Selektoren)
            const viewButton = event.target.closest('[data-view-id], .view-selector, .template-view');
            if (viewButton) {
                setTimeout(() => {
                    this.updateViewContentStatus();
                }, 200);
            }
        });
    }

    updateViewContentStatus() {
        if (!this.designerWidget) return;

        try {
            // Aktuelle View ermitteln
            this.currentViewKey = this.getCurrentViewKey();

            // Canvas-Objekte zählen
            const canvasObjects = this.getCanvasObjectCount();

            // Content Status aktualisieren
            const hasContent = canvasObjects > 0;
            this.contentStatus[this.currentViewKey] = hasContent;

            console.log('🔍 MULTI-VIEW: Content Status Update');
            console.log('   - Current View:', this.currentViewKey);
            console.log('   - Canvas Objects:', canvasObjects);
            console.log('   - Has Content:', hasContent ? '✅ JA' : '❌ NEIN');

        } catch (error) {
            console.warn('⚠️ MULTI-VIEW: Content status update failed:', error);
        }
    }

    getCurrentViewKey() {
        // Verschiedene Wege zur View-Erkennung
        if (this.designerWidget.currentView) {
            return this.designerWidget.currentView;
        }

        if (this.designerWidget.activeView) {
            return this.designerWidget.activeView;
        }

        if (this.designerWidget.selectedView) {
            return this.designerWidget.selectedView;
        }

        // DOM-basierte Erkennung
        const activeViewElement = document.querySelector('.view-selector.active, .template-view.active');
        if (activeViewElement) {
            return activeViewElement.getAttribute('data-view-id') ||
                   activeViewElement.textContent.trim();
        }

        return "Unknown";
    }

    getCanvasObjectCount() {
        try {
            if (this.designerWidget.canvas && this.designerWidget.canvas.getObjects) {
                const objects = this.designerWidget.canvas.getObjects();
                // Background-Objekte ausfiltern
                return objects.filter(obj => obj.type !== 'rect' || !obj.isBackground).length;
            }

            if (this.designerWidget.fabricCanvas) {
                const objects = this.designerWidget.fabricCanvas.getObjects();
                return objects.filter(obj => obj.type !== 'rect' || !obj.isBackground).length;
            }

            return 0;
        } catch (error) {
            console.warn('⚠️ MULTI-VIEW: Canvas object count failed:', error);
            return 0;
        }
    }

    getAvailableViews() {
        try {
            const views = [];

            // Get current template and variation
            const currentTemplateId = this.designerWidget.currentTemplateId || '3657';
            const currentVariation = this.designerWidget.currentVariation || '167359';

            console.log('🔍 MULTI-VIEW: Looking for views in template:', currentTemplateId, 'variation:', currentVariation);

            // Access designer widget templates (Map structure)
            if (this.designerWidget && this.designerWidget.templates) {
                const template = this.designerWidget.templates.get(currentTemplateId);
                if (template && template.variations) {
                    const variation = template.variations.get(currentVariation);
                    if (variation && variation.views) {
                        variation.views.forEach((view, viewId) => {
                            views.push({
                                id: viewId,
                                name: view.name || `View ${viewId}`,
                                printArea: view.printArea
                            });
                        });
                    }
                }
            }

            console.log('🎯 MULTI-VIEW: Found views:', views);
            return views;
        } catch (error) {
            console.warn('⚠️ MULTI-VIEW: Error getting available views:', error);
            return [];
        }
    }

    async generateMultiViewPNGs() {
        if (!this.initialized) {
            console.warn('⚠️ MULTI-VIEW: System not initialized - falling back to single PNG');
            return this.generateSinglePNG();
        }

        console.log('🎯 MULTI-VIEW: Starting intelligent multi-view PNG generation...');

        // Get available views from current template
        const availableViews = this.getAvailableViews();
        console.log('🎯 MULTI-VIEW: Available views:', availableViews);

        if (availableViews.length === 0) {
            console.log('ℹ️ MULTI-VIEW: No views detected - generating current view');
            return this.generateSinglePNG();
        }

        const pngResults = {};
        const currentView = this.designerWidget.currentView;

        for (const viewInfo of availableViews) {
            try {
                console.log(`🔄 MULTI-VIEW: Switching to view ${viewInfo.id} (${viewInfo.name})...`);

                // Switch to view using designer widget
                await this.switchToView(viewInfo.id);

                // Wait for view to load
                await new Promise(resolve => setTimeout(resolve, 300));

                // Check if this view has content
                const hasContent = this.getCanvasObjectCount() > 0;
                console.log(`🔍 MULTI-VIEW: View ${viewInfo.name} has content:`, hasContent ? '✅ YES' : '❌ NO');

                if (hasContent) {
                    // Generate PNG for this view
                    const pngData = await this.generateViewPNG(viewInfo.id, viewInfo.name);
                    if (pngData && pngData.success) {
                        pngResults[viewInfo.id] = {
                            viewId: viewInfo.id,
                            viewName: viewInfo.name,
                            dataUrl: pngData.dataUrl,
                            metadata: pngData.metadata
                        };
                        console.log(`✅ MULTI-VIEW: PNG generated for view: ${viewInfo.name}`);
                    }
                }

            } catch (error) {
                console.error(`❌ MULTI-VIEW: PNG generation failed for view ${viewInfo.name}:`, error);
            }
        }

        // Switch back to original view
        if (currentView) {
            await this.switchToView(currentView);
        }

        const resultCount = Object.keys(pngResults).length;
        console.log(`🎉 MULTI-VIEW: Generated ${resultCount} PNGs from ${availableViews.length} available views`);

        return pngResults;
    }

    async switchToView(viewKey) {
        try {
            console.log(`🔄 MULTI-VIEW: Attempting to switch to view: ${viewKey}`);

            // Method 1: Use designer widget switchView method
            if (this.designerWidget && typeof this.designerWidget.switchView === 'function') {
                console.log('🎯 MULTI-VIEW: Using designerWidget.switchView()');
                await this.designerWidget.switchView(viewKey);
                return;
            }

            // Method 2: Direct property assignment (if switchView method doesn't exist)
            if (this.designerWidget && this.designerWidget.currentView !== undefined) {
                console.log('🎯 MULTI-VIEW: Setting currentView directly');
                this.designerWidget.currentView = viewKey;

                // Trigger any necessary updates
                if (typeof this.designerWidget.updateView === 'function') {
                    this.designerWidget.updateView();
                }
                return;
            }

            // Method 3: DOM-based view switching fallback
            console.log('🎯 MULTI-VIEW: Using DOM-based view switching fallback');
            const viewButton = document.querySelector(`[data-view-id="${viewKey}"]`);
            if (viewButton) {
                viewButton.click();
                await new Promise(resolve => setTimeout(resolve, 300));
                return;
            }

            console.warn('⚠️ MULTI-VIEW: No view switching method available');
        } catch (error) {
            console.error('❌ MULTI-VIEW: View switching failed:', error);
        }
    }

    async generateViewPNG(viewId, viewName = 'Unknown View') {
        if (this.saveOnlyPNGGenerator) {
            try {
                console.log(`🎨 MULTI-VIEW: Generating PNG for view ${viewName} (ID: ${viewId})`);
                const result = await this.saveOnlyPNGGenerator.generatePNG({
                    viewId: viewId,
                    viewName: viewName,
                    saveType: 'multi_view_generation'
                });

                if (result && result.success) {
                    console.log(`✅ MULTI-VIEW: PNG generation successful for ${viewName}`);
                } else {
                    console.warn(`⚠️ MULTI-VIEW: PNG generation returned unsuccessful result for ${viewName}:`, result);
                }

                return result;
            } catch (error) {
                console.error(`❌ MULTI-VIEW: PNG generation error for ${viewName}:`, error);
                return { success: false, error: error.message };
            }
        }
        console.warn('⚠️ MULTI-VIEW: No PNG generator available');
        return { success: false, error: 'No PNG generator available' };
    }

    async generateSinglePNG() {
        if (this.saveOnlyPNGGenerator) {
            return await this.saveOnlyPNGGenerator.generatePNG();
        }
        return null;
    }

    fallbackToLegacyMode() {
        console.log('🔄 MULTI-VIEW: Falling back to legacy single-PNG mode');
        this.initialized = false;
    }

    // Debug Interface
    getDebugInfo() {
        return {
            initialized: this.initialized,
            designerWidget: !!this.designerWidget,
            saveOnlyPNGGenerator: !!this.saveOnlyPNGGenerator,
            currentView: this.currentViewKey,
            templates: Object.keys(this.viewTemplates).length,
            contentStatus: this.contentStatus,
            hasContent: Object.values(this.contentStatus).some(Boolean) ? '✅ JA' : '❌ NEIN'
        };
    }

    checkDependencies() {
        return this.getDebugInfo();
    }
}

// Global instantiation
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 MULTI-VIEW: DOM ready, initializing...');
    window.multiViewPNGSystem = new MultiViewPNGSystem();

    // Debug interface
    window.multiViewPNGDebug = {
        checkDependencies: () => window.multiViewPNGSystem.checkDependencies(),
        getInfo: () => window.multiViewPNGSystem.getDebugInfo(),
        forceInit: () => window.multiViewPNGSystem.init(),
        updateContent: () => window.multiViewPNGSystem.updateViewContentStatus(),
        testMultiViewGeneration: () => window.multiViewPNGSystem.generateMultiViewPNGs(),
        simulateSaveEvent: () => {
            console.log('🧪 DEBUG: Simulating save event...');
            document.dispatchEvent(new CustomEvent('designerShortcodeSave', {
                detail: {
                    button: { textContent: 'Test Save' },
                    designData: { test: true }
                }
            }));
        }
    };
});

// Falls DOM bereits geladen
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('🎯 MULTI-VIEW: DOM already ready, initializing immediately...');
    window.multiViewPNGSystem = new MultiViewPNGSystem();

    window.multiViewPNGDebug = {
        checkDependencies: () => window.multiViewPNGSystem.checkDependencies(),
        getInfo: () => window.multiViewPNGSystem.getDebugInfo(),
        forceInit: () => window.multiViewPNGSystem.init(),
        updateContent: () => window.multiViewPNGSystem.updateViewContentStatus()
    };
}
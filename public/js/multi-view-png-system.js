/**
 * Multi-View PNG System - Robuste Implementierung
 * Erkennt automatisch Front/Back Views und generiert PNGs nur für Views mit Inhalt
 */
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
    }

    detectTemplateSystem() {
        // Template System erkennen
        try {
            // Verschiedene Wege zur Template-Erkennung
            if (this.designerWidget.templates) {
                this.viewTemplates = this.designerWidget.templates;
                console.log('✅ MULTI-VIEW: Templates found via designerWidget.templates');
            } else if (window.templateData) {
                this.viewTemplates = window.templateData;
                console.log('✅ MULTI-VIEW: Templates found via window.templateData');
            } else if (this.designerWidget.productTemplates) {
                this.viewTemplates = this.designerWidget.productTemplates;
                console.log('✅ MULTI-VIEW: Templates found via designerWidget.productTemplates');
            }

            console.log('🎯 MULTI-VIEW: Detected templates:', Object.keys(this.viewTemplates).length);

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

    async generateMultiViewPNGs() {
        if (!this.initialized) {
            console.warn('⚠️ MULTI-VIEW: System not initialized - falling back to single PNG');
            return this.generateSinglePNG();
        }

        const pngResults = {};
        const viewsWithContent = Object.keys(this.contentStatus).filter(
            view => this.contentStatus[view]
        );

        console.log('🎯 MULTI-VIEW: Generating PNGs for views with content:', viewsWithContent);

        if (viewsWithContent.length === 0) {
            console.log('ℹ️ MULTI-VIEW: No content found - generating current view');
            return this.generateSinglePNG();
        }

        for (const viewKey of viewsWithContent) {
            try {
                // Zu View wechseln
                await this.switchToView(viewKey);

                // PNG generieren
                const pngData = await this.generateViewPNG(viewKey);
                if (pngData) {
                    pngResults[viewKey] = pngData;
                    console.log(`✅ MULTI-VIEW: PNG generated for view: ${viewKey}`);
                }

            } catch (error) {
                console.error(`❌ MULTI-VIEW: PNG generation failed for view ${viewKey}:`, error);
            }
        }

        return pngResults;
    }

    async switchToView(viewKey) {
        if (this.designerWidget.switchView) {
            return this.designerWidget.switchView(viewKey);
        }

        // DOM-basiertes View-Switching
        const viewButton = document.querySelector(`[data-view-id="${viewKey}"]`);
        if (viewButton) {
            viewButton.click();
            return new Promise(resolve => setTimeout(resolve, 300));
        }
    }

    async generateViewPNG(viewKey) {
        if (this.saveOnlyPNGGenerator) {
            return await this.saveOnlyPNGGenerator.generatePNG({
                viewId: viewKey,
                viewName: viewKey
            });
        }
        return null;
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
        updateContent: () => window.multiViewPNGSystem.updateViewContentStatus()
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
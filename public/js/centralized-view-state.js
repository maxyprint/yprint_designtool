/**
 * 🎯 CENTRALIZED VIEW STATE
 *
 * Verwaltet View-Zustand und verhindert Race Conditions
 * Atomic Operations für View-Switches und PNG-Requests
 */

class CentralizedViewState {
    constructor() {
        this.currentView = null;
        this.currentVariation = null;
        this.currentTemplate = null;
        this.isViewSwitching = false;
        this.operationQueue = [];
        this.isProcessingQueue = false;
        this.listeners = new Map();

        console.log('🎯 CENTRALIZED VIEW STATE: Initializing...');

        // Bind methods
        this.switchView = this.switchView.bind(this);
        this.queueOperation = this.queueOperation.bind(this);
        this.getCurrentState = this.getCurrentState.bind(this);
        this.addStateListener = this.addStateListener.bind(this);
    }

    /**
     * 🚀 Initialize State Management
     */
    async init() {
        try {
            // Detect initial state
            await this._detectInitialState();

            // Set up event listeners
            this._setupEventListeners();

            console.log('✅ CENTRALIZED VIEW STATE: Initialized with state:', this.getCurrentState());
            return true;

        } catch (error) {
            console.error('❌ CENTRALIZED VIEW STATE: Initialization failed:', error);
            return false;
        }
    }

    /**
     * 🔄 Atomic View Switch
     */
    async switchView(viewId, options = {}) {
        const {
            waitForCompletion = true,
            timeout = 3000,
            silent = false
        } = options;

        if (!silent) {
            console.log(`🔄 CENTRALIZED VIEW STATE: Switching to view ${viewId}`);
        }

        // Queue the operation to prevent race conditions
        return this.queueOperation(async () => {
            try {
                if (this.currentView === viewId) {
                    if (!silent) {
                        console.log(`✅ CENTRALIZED VIEW STATE: Already on view ${viewId}`);
                    }
                    return { success: true, alreadyActive: true };
                }

                this.isViewSwitching = true;
                this._notifyListeners('viewSwitchStart', { fromView: this.currentView, toView: viewId });

                // Get designer instance
                const designer = window.designerInstance || window.designerWidgetInstance;
                if (!designer || !designer.loadTemplateView) {
                    throw new Error('Designer instance or loadTemplateView method not available');
                }

                // Perform the switch
                await designer.loadTemplateView(viewId);

                if (waitForCompletion) {
                    // Wait for switch to complete
                    const switchComplete = await this._waitForViewSwitch(viewId, timeout);
                    if (!switchComplete) {
                        console.warn(`⚠️ CENTRALIZED VIEW STATE: View switch timeout for ${viewId}`);
                    }
                }

                // Update state
                const previousView = this.currentView;
                this.currentView = viewId;

                this._notifyListeners('viewSwitchComplete', {
                    fromView: previousView,
                    toView: viewId,
                    success: true
                });

                if (!silent) {
                    console.log(`✅ CENTRALIZED VIEW STATE: Successfully switched to view ${viewId}`);
                }

                return { success: true, previousView, currentView: viewId };

            } catch (error) {
                console.error(`❌ CENTRALIZED VIEW STATE: View switch to ${viewId} failed:`, error);

                this._notifyListeners('viewSwitchError', {
                    viewId,
                    error: error.message
                });

                return { success: false, error: error.message };
            } finally {
                this.isViewSwitching = false;
            }
        });
    }

    /**
     * 🚦 Queue Operation for Atomic Execution
     */
    async queueOperation(operation) {
        return new Promise((resolve, reject) => {
            this.operationQueue.push({
                operation,
                resolve,
                reject,
                timestamp: Date.now()
            });

            this._processQueue();
        });
    }

    /**
     * 📊 Get Current State
     */
    getCurrentState() {
        const designer = window.designerInstance || window.designerWidgetInstance;

        // Sync with designer state if available
        if (designer) {
            this.currentTemplate = designer.activeTemplateId || this.currentTemplate;
            this.currentVariation = designer.currentVariation || this.currentVariation;
            this.currentView = designer.currentView || this.currentView;
        }

        return {
            template: this.currentTemplate,
            variation: this.currentVariation,
            view: this.currentView,
            isViewSwitching: this.isViewSwitching,
            queueLength: this.operationQueue.length
        };
    }

    /**
     * 👂 Add State Change Listener
     */
    addStateListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        this.listeners.get(event).push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(event);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    /**
     * 🏗️ Get Available Views for Current Template
     */
    getAvailableViews() {
        try {
            const templateDataAccess = window.unifiedTemplateDataAccess;
            if (templateDataAccess && this.currentTemplate) {
                const views = templateDataAccess.getViewData(this.currentTemplate, this.currentVariation);
                return views || [];
            }

            // Fallback: get from designer
            const designer = window.designerInstance || window.designerWidgetInstance;
            if (designer && designer.templates && this.currentTemplate) {
                const template = designer.templates.get ?
                    designer.templates.get(this.currentTemplate) :
                    designer.templates[this.currentTemplate];

                if (template && template.variations) {
                    const variation = template.variations.get ?
                        template.variations.get(this.currentVariation) :
                        template.variations[this.currentVariation];

                    if (variation && variation.views) {
                        const views = [];
                        if (variation.views.forEach) {
                            variation.views.forEach((view, id) => {
                                views.push({ id, ...view });
                            });
                        } else {
                            Object.keys(variation.views).forEach(id => {
                                views.push({ id, ...variation.views[id] });
                            });
                        }
                        return views;
                    }
                }
            }

            return [];

        } catch (error) {
            console.error('❌ CENTRALIZED VIEW STATE: Error getting available views:', error);
            return [];
        }
    }

    /**
     * 🔒 Lock State for Critical Operations
     */
    async withStateLock(operation) {
        return this.queueOperation(operation);
    }

    /**
     * 🧪 Validate View Exists
     */
    validateView(viewId) {
        const availableViews = this.getAvailableViews();
        return availableViews.some(view => view.id === viewId);
    }

    /**
     * 🔍 Detect Initial State
     */
    async _detectInitialState() {
        try {
            const designer = window.designerInstance || window.designerWidgetInstance;
            if (designer) {
                this.currentTemplate = designer.activeTemplateId;
                this.currentVariation = designer.currentVariation;
                this.currentView = designer.currentView;

                console.log('🔍 CENTRALIZED VIEW STATE: Initial state detected:', {
                    template: this.currentTemplate,
                    variation: this.currentVariation,
                    view: this.currentView
                });
            } else {
                console.warn('⚠️ CENTRALIZED VIEW STATE: No designer instance found for state detection');
            }

            // Validate state consistency
            await this._validateState();

        } catch (error) {
            console.error('❌ CENTRALIZED VIEW STATE: Initial state detection failed:', error);
        }
    }

    /**
     * 🎧 Setup Event Listeners
     */
    _setupEventListeners() {
        // Listen for designer events if available
        document.addEventListener('designerViewChanged', (event) => {
            console.log('🎧 CENTRALIZED VIEW STATE: External view change detected:', event.detail);
            this.currentView = event.detail.viewId;
            this._notifyListeners('externalViewChange', event.detail);
        });

        // Listen for template changes
        document.addEventListener('designerTemplateChanged', (event) => {
            console.log('🎧 CENTRALIZED VIEW STATE: Template change detected:', event.detail);
            this.currentTemplate = event.detail.templateId;
            this.currentVariation = event.detail.variationId;
            this._notifyListeners('templateChange', event.detail);
        });
    }

    /**
     * ⏳ Wait for View Switch Completion
     */
    async _waitForViewSwitch(targetViewId, timeout = 3000) {
        const checkInterval = 100;
        let elapsed = 0;

        while (elapsed < timeout) {
            const designer = window.designerInstance || window.designerWidgetInstance;
            if (designer && designer.currentView === targetViewId) {
                // Additional verification: check if canvas is ready
                if (await this._verifyViewReady()) {
                    return true;
                }
            }

            await new Promise(resolve => setTimeout(resolve, checkInterval));
            elapsed += checkInterval;
        }

        return false;
    }

    /**
     * ✅ Verify View is Ready
     */
    async _verifyViewReady() {
        try {
            const designer = window.designerInstance || window.designerWidgetInstance;
            const canvas = designer?.fabricCanvas;

            if (!canvas) return false;

            // Check if canvas has objects (view loaded)
            const objects = canvas.getObjects();

            // Check if fabric is responsive
            const canvasWidth = canvas.getWidth();

            return canvasWidth > 0 && objects !== null;

        } catch (error) {
            console.warn('⚠️ CENTRALIZED VIEW STATE: View ready verification failed:', error);
            return true; // Assume ready to not block
        }
    }

    /**
     * 🔄 Process Operation Queue
     */
    async _processQueue() {
        if (this.isProcessingQueue || this.operationQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.operationQueue.length > 0) {
            const { operation, resolve, reject } = this.operationQueue.shift();

            try {
                const result = await operation();
                resolve(result);
            } catch (error) {
                reject(error);
            }
        }

        this.isProcessingQueue = false;
    }

    /**
     * 📢 Notify Listeners
     */
    _notifyListeners(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ CENTRALIZED VIEW STATE: Listener callback failed for ${event}:`, error);
                }
            });
        }
    }

    /**
     * ✅ Validate Current State
     */
    async _validateState() {
        if (this.currentTemplate && this.currentView) {
            const isValid = this.validateView(this.currentView);
            if (!isValid) {
                console.warn(`⚠️ CENTRALIZED VIEW STATE: Current view ${this.currentView} not found in available views`);
                // Reset to first available view
                const availableViews = this.getAvailableViews();
                if (availableViews.length > 0) {
                    this.currentView = availableViews[0].id;
                    console.log(`🔄 CENTRALIZED VIEW STATE: Reset to view ${this.currentView}`);
                }
            }
        }
    }

    /**
     * 🐛 Get Debug Information
     */
    getDebugInfo() {
        return {
            state: this.getCurrentState(),
            availableViews: this.getAvailableViews(),
            listeners: Array.from(this.listeners.keys()),
            isProcessingQueue: this.isProcessingQueue,
            designer: !!(window.designerInstance || window.designerWidgetInstance)
        };
    }

    /**
     * 🧹 Clear Queue (Emergency)
     */
    clearQueue() {
        console.warn('🧹 CENTRALIZED VIEW STATE: Clearing operation queue');
        this.operationQueue.forEach(({ reject }) => {
            reject(new Error('Queue cleared'));
        });
        this.operationQueue = [];
        this.isProcessingQueue = false;
    }
}

// Global instance
window.centralizedViewState = new CentralizedViewState();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CentralizedViewState;
}

console.log('✅ CENTRALIZED VIEW STATE: Loaded and ready for initialization');
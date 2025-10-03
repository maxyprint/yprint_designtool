/**
 * SAVE-DURING-LOAD PROTECTION
 *
 * Problem: User can trigger save while design is still loading, resulting in
 * incomplete/corrupted coordinates being stored.
 *
 * Solution: Track loading state, disable save buttons during load, validate
 * load completion before allowing save operations.
 */

(function() {
    'use strict';

    console.log('🛡️ SAVE-DURING-LOAD PROTECTION: Initializing...');

    class SaveDuringLoadProtection {
        constructor() {
            this.isLoading = false;
            this.loadStartTime = null;
            this.saveButtons = [];
            this.initialized = false;
        }

        /**
         * Initialize protection system
         */
        init() {
            if (this.initialized) return;

            // Find save buttons
            this.findSaveButtons();

            // Wait for designer widget
            this.waitForDesigner((widget) => {
                this.widget = widget;
                this.hookLoadOperations();
                this.initialized = true;
                console.log('✅ Save-during-load protection initialized');
            });
        }

        /**
         * Find all save/cart buttons
         */
        findSaveButtons() {
            const selectors = [
                '.designer-action-button',
                '.save-design-button',
                '.add-to-cart-button',
                '.designer-cart-button',
                '.designer-save-button',
                '.designer-modal-save',
                'button[data-action="save"]',
                'button[data-action="add-to-cart"]'
            ];

            this.saveButtons = [];

            selectors.forEach(selector => {
                const buttons = document.querySelectorAll(selector);
                buttons.forEach(button => {
                    if (!this.saveButtons.includes(button)) {
                        this.saveButtons.push(button);
                    }
                });
            });

            console.log(`🛡️ Found ${this.saveButtons.length} save buttons to protect`);
        }

        /**
         * Wait for designer widget
         */
        waitForDesigner(callback, maxAttempts = 20) {
            let attempts = 0;

            const check = setInterval(() => {
                attempts++;

                const widget = window.designerWidgetInstance ||
                              window.designerWidget ||
                              window.DesignerWidget?.instance;

                if (widget) {
                    clearInterval(check);
                    callback(widget);
                } else if (attempts >= maxAttempts) {
                    clearInterval(check);
                    console.warn('⚠️ Designer widget not found for load protection');
                }
            }, 200);
        }

        /**
         * Hook into load operations
         */
        hookLoadOperations() {
            if (!this.widget) return;

            // Hook loadViewImage
            if (this.widget.loadViewImage) {
                const originalLoadViewImage = this.widget.loadViewImage;
                const _this = this;

                this.widget.loadViewImage = function(...args) {
                    _this.startLoading('loadViewImage');
                    const result = originalLoadViewImage.apply(this, args);

                    // Mark as loaded after async operation completes
                    setTimeout(() => {
                        _this.endLoading('loadViewImage');
                    }, 1000); // Wait for image to load

                    return result;
                };
            }

            // Hook loadDesign (if exists)
            if (this.widget.loadDesign) {
                const originalLoadDesign = this.widget.loadDesign;
                const _this = this;

                this.widget.loadDesign = function(...args) {
                    _this.startLoading('loadDesign');
                    const result = originalLoadDesign.apply(this, args);

                    // Mark as loaded after completion
                    setTimeout(() => {
                        _this.endLoading('loadDesign');
                    }, 1500);

                    return result;
                };
            }

            // Hook fabric.Image.fromURL globally
            if (typeof fabric !== 'undefined' && fabric.Image && fabric.Image.fromURL) {
                const originalFromURL = fabric.Image.fromURL;
                const _this = this;

                fabric.Image.fromURL = function(url, callback, ...args) {
                    _this.startLoading('fabricImageLoad');

                    const wrappedCallback = function(img) {
                        _this.endLoading('fabricImageLoad');
                        if (callback) {
                            callback(img);
                        }
                    };

                    return originalFromURL.call(this, url, wrappedCallback, ...args);
                };
            }

            console.log('🛡️ Load operations hooked for protection');
        }

        /**
         * Start loading state
         */
        startLoading(operation) {
            this.isLoading = true;
            this.loadStartTime = Date.now();

            console.log(`🛡️ Loading started: ${operation}`);

            // Disable save buttons
            this.disableSaveButtons();

            // Dispatch event
            window.dispatchEvent(new CustomEvent('designLoadingStarted', {
                detail: {
                    operation,
                    timestamp: new Date().toISOString()
                }
            }));
        }

        /**
         * End loading state
         */
        endLoading(operation) {
            const loadDuration = this.loadStartTime ? Date.now() - this.loadStartTime : 0;

            this.isLoading = false;
            this.loadStartTime = null;

            console.log(`🛡️ Loading ended: ${operation} (${loadDuration}ms)`);

            // Re-enable save buttons
            this.enableSaveButtons();

            // Dispatch event
            window.dispatchEvent(new CustomEvent('designLoadingEnded', {
                detail: {
                    operation,
                    duration: loadDuration,
                    timestamp: new Date().toISOString()
                }
            }));
        }

        /**
         * Disable save buttons
         */
        disableSaveButtons() {
            this.saveButtons.forEach(button => {
                button.disabled = true;
                button.classList.add('loading-disabled');

                // Store original text
                if (!button.dataset.originalText) {
                    button.dataset.originalText = button.textContent;
                }

                // Update button text
                button.textContent = 'Laden...';
            });

            console.log(`🛡️ ${this.saveButtons.length} save buttons disabled`);
        }

        /**
         * Enable save buttons
         */
        enableSaveButtons() {
            this.saveButtons.forEach(button => {
                button.disabled = false;
                button.classList.remove('loading-disabled');

                // Restore original text
                if (button.dataset.originalText) {
                    button.textContent = button.dataset.originalText;
                }
            });

            console.log(`🛡️ ${this.saveButtons.length} save buttons enabled`);
        }

        /**
         * Check if safe to save
         */
        isSafeToSave() {
            if (this.isLoading) {
                console.warn('🛡️ Save blocked - design is still loading');
                return false;
            }

            return true;
        }

        /**
         * Validate and protect save operation
         */
        validateSave(callback) {
            if (!this.isSafeToSave()) {
                // Show warning to user
                this.showLoadingWarning();
                return false;
            }

            // Safe to proceed
            if (callback) {
                callback();
            }
            return true;
        }

        /**
         * Show warning when user tries to save during load
         */
        showLoadingWarning() {
            // Check if warning already exists
            if (document.getElementById('save-loading-warning')) {
                return;
            }

            const warning = document.createElement('div');
            warning.id = 'save-loading-warning';
            warning.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff9800;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 14px;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: slideIn 0.3s ease-out;
            `;
            warning.innerHTML = `
                <strong>⚠️ Bitte warten</strong><br>
                Das Design wird noch geladen.<br>
                Bitte versuchen Sie es gleich erneut.
            `;

            document.body.appendChild(warning);

            // Auto-remove after 3 seconds
            setTimeout(() => {
                if (warning.parentNode) {
                    warning.style.animation = 'slideOut 0.3s ease-out';
                    setTimeout(() => {
                        warning.parentNode.removeChild(warning);
                    }, 300);
                }
            }, 3000);
        }
    }

    // Initialize when DOM is ready
    function init() {
        const protection = new SaveDuringLoadProtection();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => protection.init(), 500);
            });
        } else {
            setTimeout(() => protection.init(), 500);
        }

        // Make globally available
        window.saveDuringLoadProtection = protection;
    }

    init();

})();

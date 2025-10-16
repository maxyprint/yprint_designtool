/**
 * 🔐 PERMANENT SAVE FIX - Emergency Save Button Stabilization
 *
 * This critical script prevents save button failures and ensures
 * permanent save functionality across all YPrint components.
 */

(function() {
    'use strict';

    console.log('🔐 PERMANENT SAVE FIX: Initializing save button stabilization...');

    class PermanentSaveFix {
        constructor() {
            this.saveButtonSelectors = [
                '.save-design',
                '.designer-save',
                '[data-action="save"]',
                '.btn-save',
                '.save-btn',
                '#save-design',
                '.add-to-cart-button',
                '.designer-action-button',
                '.save-design-button',
                '.button[type="submit"]',
                'input[type="submit"][value*="save"]',
                'button[data-save]'
            ];

            this.isActive = false;
            this.monitoringInterval = null;
            this.activationCount = 0;
            this.maxMonitoringCycles = 30; // Stop after 30 cycles (60 seconds)
            this.initialize();
        }

        initialize() {
            // Wait for DOM and designer ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.startMonitoring());
            } else {
                this.startMonitoring();
            }

            // Listen for designer ready events
            document.addEventListener('designerReady', () => this.activateAllSaveButtons());
            document.addEventListener('fabricReady', () => this.activateAllSaveButtons());

            // Emergency activation on any user interaction
            document.addEventListener('click', (e) => this.emergencyActivation(e));

            console.log('✅ PERMANENT SAVE FIX: Initialization complete');
        }

        startMonitoring() {
            if (this.isActive) return;

            this.isActive = true;
            console.log('🔐 PERMANENT SAVE FIX: Starting save button monitoring...');

            // Immediate activation
            this.activateAllSaveButtons();

            // Continuous monitoring every 2 seconds with circuit breaker
            this.monitoringInterval = setInterval(() => {
                this.activationCount++;

                // 🚨 CIRCUIT BREAKER: Stop monitoring after max cycles to prevent spam
                if (this.activationCount >= this.maxMonitoringCycles) {
                    console.log('🔐 SAVE FIX: Monitoring complete - circuit breaker activated');
                    clearInterval(this.monitoringInterval);
                    this.monitoringInterval = null;
                    return;
                }

                // 🔇 SPAM REDUCTION: Only log every 5th activation
                const shouldLog = this.activationCount % 5 === 0;
                this.activateAllSaveButtons(shouldLog);
            }, 2000);

            // DOM mutation observer for dynamic buttons
            this.setupMutationObserver();
        }

        activateAllSaveButtons(shouldLog = true) {
            let activatedCount = 0;
            let foundButtons = 0;

            this.saveButtonSelectors.forEach(selector => {
                const buttons = document.querySelectorAll(selector);
                foundButtons += buttons.length;

                buttons.forEach(button => {
                    if (this.activateButton(button)) {
                        activatedCount++;
                    }
                });
            });

            if (foundButtons > 0 && shouldLog) {
                console.log(`🔐 SAVE FIX: Found ${foundButtons} buttons, activated ${activatedCount}`);
            }

            // Special handling for WooCommerce buttons
            this.activateWooCommerceButtons();

            return activatedCount;
        }

        activateButton(button) {
            if (!button) return false;

            let wasActivated = false;

            // Remove disabled state
            if (button.disabled) {
                button.disabled = false;
                wasActivated = true;
            }

            // Remove visual disabled styles
            if (button.style.opacity !== '1') {
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
                button.style.pointerEvents = 'auto';
                wasActivated = true;
            }

            // Remove disabled classes
            const disabledClasses = ['disabled', 'btn-disabled', 'button-disabled'];
            disabledClasses.forEach(cls => {
                if (button.classList.contains(cls)) {
                    button.classList.remove(cls);
                    wasActivated = true;
                }
            });

            // Add active/enabled classes
            if (!button.classList.contains('enabled')) {
                button.classList.add('enabled');
            }

            // Ensure event handlers are attached
            this.ensureEventHandlers(button);

            return wasActivated;
        }

        activateWooCommerceButtons() {
            // Special handling for WooCommerce add to cart buttons
            const wooButtons = document.querySelectorAll(
                '.single_add_to_cart_button, .add_to_cart_button, .wc-forward'
            );

            wooButtons.forEach(button => {
                this.activateButton(button);

                // Remove WooCommerce disabled attributes
                button.removeAttribute('aria-disabled');
                button.setAttribute('aria-label', 'Add to cart');
            });
        }

        ensureEventHandlers(button) {
            // Ensure button has click handlers
            if (!button.hasAttribute('data-save-handler-attached')) {
                button.addEventListener('click', (e) => {
                    console.log('🔐 SAVE FIX: Save button clicked:', button);

                    // Emergency data generation if needed
                    if (!window.generateDesignData) {
                        this.setupEmergencyDataGeneration();
                    }
                });

                button.setAttribute('data-save-handler-attached', 'true');
            }
        }

        setupEmergencyDataGeneration() {
            console.log('🚨 SAVE FIX: Setting up emergency design data generation...');

            window.generateDesignData = () => {
                console.log('🚨 EMERGENCY: generateDesignData called from permanent save fix');

                // Try to find any available design data capture system
                if (window.optimizedCaptureInstance) {
                    return window.optimizedCaptureInstance.generateDesignData();
                }

                if (window.enhancedJSONSystem) {
                    return window.enhancedJSONSystem.generateDesignData();
                }

                // Emergency fallback - basic design data
                return {
                    design_data: {
                        version: '1.0.0',
                        timestamp: Date.now(),
                        elements: [],
                        canvas: {
                            width: 800,
                            height: 600
                        },
                        emergency: true,
                        source: 'permanent-save-fix'
                    }
                };
            };
        }

        setupMutationObserver() {
            const observer = new MutationObserver((mutations) => {
                let shouldCheck = false;

                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // Check if added node contains save buttons
                                const isButton = node.tagName === 'BUTTON' || node.tagName === 'INPUT';
                                const hasButtonChild = node.querySelector && node.querySelector('button, input[type="submit"]');

                                if (isButton || hasButtonChild) {
                                    shouldCheck = true;
                                }
                            }
                        });
                    }
                });

                if (shouldCheck) {
                    setTimeout(() => this.activateAllSaveButtons(), 100);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            console.log('🔐 SAVE FIX: Mutation observer active for dynamic buttons');
        }

        emergencyActivation(event) {
            // If user clicks a potentially disabled button, force activation
            const target = event.target;

            if (target && (target.tagName === 'BUTTON' || target.type === 'submit')) {
                const isLikelyDisabled = target.disabled ||
                                       target.style.opacity !== '1' ||
                                       target.classList.contains('disabled');

                if (isLikelyDisabled) {
                    console.log('🚨 EMERGENCY: Forcing activation of clicked button:', target);
                    this.activateButton(target);
                }
            }
        }

        destroy() {
            this.isActive = false;

            if (this.monitoringInterval) {
                clearInterval(this.monitoringInterval);
                this.monitoringInterval = null;
            }

            console.log('🔐 PERMANENT SAVE FIX: Deactivated');
        }

        getStatus() {
            return {
                isActive: this.isActive,
                hasMonitoring: !!this.monitoringInterval,
                buttonSelectors: this.saveButtonSelectors.length,
                foundButtons: document.querySelectorAll(this.saveButtonSelectors.join(', ')).length
            };
        }
    }

    // Make available globally
    window.PermanentSaveFix = PermanentSaveFix;

    // Auto-initialize if coordinator is not available
    if (!window.stageCoordinator) {
        console.log('🔐 PERMANENT SAVE FIX: Auto-initializing (no coordinator detected)');
        window.permanentSaveFixInstance = new PermanentSaveFix();
    }

    console.log('🔐 PERMANENT SAVE FIX: Class definition complete');

})();
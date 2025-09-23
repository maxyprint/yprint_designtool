/**
 * OPS Designer Debug Script
 * Für besseres Debugging der Change Product Funktionalität
 */

(function() {
    'use strict';

    console.log('🔧 OPS Designer Debug Script loaded');

    // Wait for DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDebug);
    } else {
        initDebug();
    }

    function initDebug() {
        console.log('🔍 Starting OPS Designer Debug...');

        // Debug Library Tab Click
        debugLibraryTab();

        // Debug AJAX Calls
        debugAjaxCalls();

        // Debug Product Selection
        debugProductSelection();

        // Debug Console Commands
        addDebugCommands();
    }

    function debugLibraryTab() {
        const libraryTab = document.querySelector('[data-type="library"]');
        if (libraryTab) {
            console.log('✅ Library Tab found:', libraryTab);

            // Override click handler for debugging
            libraryTab.addEventListener('click', function(e) {
                console.log('🖱️ Library Tab clicked');
                console.log('Event target:', e.target);

                // Check if library loader exists
                if (window.libraryLoader) {
                    console.log('✅ LibraryLoader instance found');
                    console.log('Library loaded state:', window.libraryLoader.isLoaded);
                } else {
                    console.error('❌ LibraryLoader instance not found');
                }
            });
        } else {
            console.error('❌ Library Tab not found');
        }
    }

    function debugAjaxCalls() {
        // Intercept fetch calls
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            if (typeof url === 'string' && url.includes('admin-ajax.php')) {
                console.log('🌐 AJAX Call detected:', url);

                // Check FormData content
                if (args[1] && args[1].body instanceof FormData) {
                    console.log('📤 FormData contents:');
                    for (let [key, value] of args[1].body.entries()) {
                        console.log(`  ${key}: ${value}`);
                    }
                }
            }

            return originalFetch.apply(this, args).then(response => {
                if (typeof url === 'string' && url.includes('admin-ajax.php')) {
                    console.log('📥 AJAX Response:', response.status, response.statusText);

                    // Clone response to read it without consuming
                    const responseClone = response.clone();
                    responseClone.json().then(data => {
                        console.log('📋 Response Data:', data);
                    }).catch(err => {
                        console.log('⚠️ Could not parse response as JSON');
                    });
                }
                return response;
            });
        };
    }

    function debugProductSelection() {
        // Listen for product-changed events
        document.addEventListener('product-changed', function(e) {
            console.log('🎯 Product Changed Event:', e.detail);
        });

        // Monitor library grid changes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target.classList && mutation.target.classList.contains('images-grid')) {
                    console.log('📊 Library Grid Content Changed');
                    console.log('New content:', mutation.target.innerHTML.substring(0, 200) + '...');
                }
            });
        });

        const libraryGrid = document.querySelector('[data-section="library"] .images-grid');
        if (libraryGrid) {
            observer.observe(libraryGrid, { childList: true, subtree: true });
            console.log('👀 Observing library grid changes');
        }
    }

    function addDebugCommands() {
        // Add debug commands to window
        window.designerDebug = {
            testAjax: function() {
                console.log('🧪 Testing AJAX call...');

                if (!window.octoPrintDesigner) {
                    console.error('❌ octoPrintDesigner not found');
                    return;
                }

                const formData = new FormData();
                formData.append('action', 'get_designer_products');
                formData.append('nonce', window.octoPrintDesigner.nonce);

                fetch(window.octoPrintDesigner.ajaxUrl, {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    console.log('✅ Test AJAX Success:', data);
                })
                .catch(error => {
                    console.error('❌ Test AJAX Error:', error);
                });
            },

            simulateClick: function() {
                console.log('🖱️ Simulating library tab click...');
                const libraryTab = document.querySelector('[data-type="library"]');
                if (libraryTab) {
                    libraryTab.click();
                } else {
                    console.error('❌ Library tab not found');
                }
            },

            checkVariables: function() {
                console.log('🔍 Checking global variables:');
                console.log('octoPrintDesigner:', window.octoPrintDesigner);
                console.log('libraryLoader:', window.libraryLoader);
                console.log('fabric:', typeof window.fabric);
            },

            getCurrentProducts: function() {
                if (window.libraryLoader && window.libraryLoader.products) {
                    console.log('📦 Current Products:', window.libraryLoader.products);
                } else {
                    console.log('📦 No products loaded yet');
                }
            }
        };

        console.log('🎮 Debug commands added to window.designerDebug:');
        console.log('  - designerDebug.testAjax()');
        console.log('  - designerDebug.simulateClick()');
        console.log('  - designerDebug.checkVariables()');
        console.log('  - designerDebug.getCurrentProducts()');
    }

})();
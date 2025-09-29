/**
 * DOM SCRIPT INJECTION SYSTEM - USAGE EXAMPLES
 * Real-world examples and integration patterns for AJAX responses
 *
 * This file demonstrates how to use the DOM Script Injection System
 * to handle dynamic JavaScript execution from AJAX responses.
 */

// Wait for DOM and script injection system to be ready
$(document).ready(function() {

    console.log('🚀 Loading DOM Script Injection Examples...');

    // ========================================
    // EXAMPLE 1: Basic AJAX Response Handling
    // ========================================

    function handleAjaxResponseExample() {
        $.ajax({
            url: '/wp-admin/admin-ajax.php',
            type: 'POST',
            data: {
                action: 'get_template_preview',
                template_id: 123
            },
            success: function(response) {
                console.log('📦 Received AJAX response');

                // Instead of using .html() which strips scripts:
                // $('#preview-container').html(response.data.html);

                // Use the script injection system:
                $('#preview-container').htmlWithScripts(response.data.html, {
                    enableLogging: true,
                    preferredMethod: 'function'
                }).then(function(result) {
                    console.log('✅ Scripts executed successfully:', result);
                }).catch(function(error) {
                    console.error('❌ Script execution failed:', error);
                });
            }
        });
    }

    // ========================================
    // EXAMPLE 2: WordPress Admin Integration
    // ========================================

    function wordpressAdminIntegration() {
        // Example for WordPress admin AJAX calls
        $('#load-template-button').on('click', function() {
            const templateId = $(this).data('template-id');

            $.ajax({
                url: ajaxurl, // WordPress global
                type: 'POST',
                data: {
                    action: 'load_design_template',
                    template_id: templateId,
                    nonce: $('#design_nonce').val()
                },
                success: async function(response) {
                    if (response.success) {
                        // Process HTML with embedded scripts
                        const container = $('#template-editor-container');

                        try {
                            const result = await container.htmlWithScripts(response.data.template_html, {
                                enableLogging: true,
                                enableMetrics: true,
                                sandboxMode: false, // Allow full access for admin
                                scriptTimeout: 15000 // 15 second timeout
                            });

                            console.log(`✅ Template loaded with ${result.scriptsExecuted} scripts executed`);

                            // Trigger custom event for other components
                            $(document).trigger('templateLoaded', [templateId, result]);

                        } catch (error) {
                            console.error('❌ Template loading failed:', error);

                            // Fallback: load without scripts
                            container.html(response.data.template_html);

                            // Show user notification
                            showAdminNotice('Template loaded but some interactive features may not work.', 'warning');
                        }
                    }
                }
            });
        });
    }

    // ========================================
    // EXAMPLE 3: Dynamic Widget Loading
    // ========================================

    function dynamicWidgetLoading() {
        // Example for loading dynamic widgets with embedded JavaScript

        window.loadWidget = async function(widgetType, containerId, config = {}) {
            console.log(`🔧 Loading widget: ${widgetType}`);

            try {
                // Fetch widget HTML with embedded scripts
                const response = await fetch('/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'get_widget_html',
                        widget_type: widgetType,
                        config: JSON.stringify(config)
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // Use script injection system to handle widget scripts
                    const container = $(`#${containerId}`);

                    const result = await container.htmlWithScripts(data.data.widget_html, {
                        enableLogging: true,
                        preferredMethod: 'createElement', // Safest for widgets
                        context: {
                            widgetConfig: config,
                            widgetType: widgetType
                        }
                    });

                    console.log(`✅ Widget ${widgetType} loaded successfully`);

                    // Return widget instance if created
                    return result.executionResults.find(r => r.result && typeof r.result === 'object');

                } else {
                    throw new Error(data.data.message || 'Widget loading failed');
                }

            } catch (error) {
                console.error(`❌ Failed to load widget ${widgetType}:`, error);
                throw error;
            }
        };
    }

    // ========================================
    // EXAMPLE 4: Form Submission with Script Response
    // ========================================

    function formSubmissionWithScriptResponse() {
        $('#design-save-form').on('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            formData.append('action', 'save_design_template');

            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: async function(response) {
                    if (response.success) {
                        console.log('💾 Design saved successfully');

                        // Response might contain updated UI with scripts
                        if (response.data.updated_ui_html) {
                            try {
                                const result = await $('#design-ui-container').htmlWithScripts(
                                    response.data.updated_ui_html,
                                    {
                                        enableLogging: true,
                                        enableMetrics: true,
                                        batchExecution: true
                                    }
                                );

                                console.log('✅ UI updated with embedded scripts');

                                // Show success message
                                showSuccessMessage('Design saved and UI updated!');

                            } catch (error) {
                                console.error('❌ UI update failed:', error);

                                // Fallback: show basic success message
                                showSuccessMessage('Design saved successfully!');
                            }
                        }
                    } else {
                        showErrorMessage(response.data.message || 'Save failed');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('❌ AJAX error:', error);
                    showErrorMessage('Network error occurred while saving');
                }
            });
        });
    }

    // ========================================
    // EXAMPLE 5: Progressive Enhancement Pattern
    // ========================================

    function progressiveEnhancementPattern() {
        // Example of progressively enhancing existing content

        $('.enhance-with-scripts').each(function() {
            const $element = $(this);
            const enhancementScript = $element.data('enhancement-script');

            if (enhancementScript) {
                // Execute enhancement script for this element
                window.domScriptInjector.executeScript({
                    content: enhancementScript,
                    attributes: {}
                }, {
                    context: {
                        element: this,
                        $element: $element
                    }
                }).then(function(result) {
                    if (result.success) {
                        $element.addClass('enhanced');
                        console.log('✅ Element enhanced with script');
                    }
                }).catch(function(error) {
                    console.warn('⚠️ Enhancement failed:', error);
                });
            }
        });
    }

    // ========================================
    // EXAMPLE 6: Modal/Popup Content Loading
    // ========================================

    function modalContentLoading() {
        $('.open-modal').on('click', function() {
            const modalUrl = $(this).data('modal-url');
            const modalId = $(this).data('modal-id') || 'dynamic-modal';

            // Create modal if it doesn't exist
            if ($(`#${modalId}`).length === 0) {
                $('body').append(`
                    <div id="${modalId}" class="modal fade" tabindex="-1">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <div class="loading">Loading...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `);
            }

            const $modal = $(`#${modalId}`);
            const $modalBody = $modal.find('.modal-body');

            // Show modal with loading
            $modal.modal('show');

            // Load content with scripts
            $.ajax({
                url: modalUrl,
                type: 'GET',
                success: async function(response) {
                    try {
                        // Handle both direct HTML and JSON responses
                        const htmlContent = typeof response === 'object' ? response.data.html : response;

                        const result = await $modalBody.htmlWithScripts(htmlContent, {
                            enableLogging: true,
                            preferredMethod: 'function',
                            scriptTimeout: 10000
                        });

                        console.log('✅ Modal content loaded with scripts');

                        // Trigger modal loaded event
                        $modal.trigger('modalContentLoaded', [result]);

                    } catch (error) {
                        console.error('❌ Modal content loading failed:', error);

                        // Fallback: show error message
                        $modalBody.html('<div class="alert alert-danger">Failed to load content</div>');
                    }
                },
                error: function() {
                    $modalBody.html('<div class="alert alert-danger">Failed to load content</div>');
                }
            });
        });
    }

    // ========================================
    // EXAMPLE 7: Real-time Content Updates
    // ========================================

    function realtimeContentUpdates() {
        // Example for real-time content updates (WebSocket, polling, etc.)

        let updateInterval;

        function startRealtimeUpdates() {
            updateInterval = setInterval(async function() {
                try {
                    const response = await fetch('/wp-admin/admin-ajax.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({
                            action: 'get_realtime_updates',
                            last_update: localStorage.getItem('last_update') || '0'
                        })
                    });

                    const data = await response.json();

                    if (data.success && data.data.has_updates) {
                        console.log('🔄 Processing real-time updates');

                        // Process each update
                        for (const update of data.data.updates) {
                            const container = $(update.target_selector);

                            if (container.length > 0) {
                                await container.htmlWithScripts(update.html_content, {
                                    enableLogging: false, // Reduce noise for frequent updates
                                    preferredMethod: 'function',
                                    batchExecution: true
                                });
                            }
                        }

                        // Update timestamp
                        localStorage.setItem('last_update', data.data.timestamp);
                    }

                } catch (error) {
                    console.error('❌ Real-time update failed:', error);
                }
            }, 5000); // Check every 5 seconds
        }

        function stopRealtimeUpdates() {
            if (updateInterval) {
                clearInterval(updateInterval);
                updateInterval = null;
            }
        }

        // Auto-start on page load
        startRealtimeUpdates();

        // Stop on page unload
        $(window).on('beforeunload', stopRealtimeUpdates);
    }

    // ========================================
    // EXAMPLE 8: Error Handling and Recovery
    // ========================================

    function setupErrorHandlingExamples() {
        // Global error handler for script injection failures
        $(document).on('scriptExecutionError', function(event, error) {
            console.error('🚨 Script execution error detected:', error);

            // Log to error tracking service
            if (window.errorTracker) {
                window.errorTracker.log('script_injection_error', {
                    error: error.message,
                    element: event.target.id || event.target.className,
                    timestamp: new Date().toISOString()
                });
            }

            // Show user-friendly message for critical failures
            if (error.critical) {
                showErrorMessage('Some interactive features may not work properly. Please refresh the page.');
            }
        });

        // Success handler
        $(document).on('scriptsExecuted', function(event, result) {
            if (result.scriptsExecuted > 0) {
                console.log(`✅ Successfully executed ${result.scriptsExecuted} scripts in ${result.executionTime.toFixed(2)}ms`);
            }
        });
    }

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    function showSuccessMessage(message) {
        console.log('✅', message);
        // Implementation depends on your notification system
    }

    function showErrorMessage(message) {
        console.error('❌', message);
        // Implementation depends on your notification system
    }

    function showAdminNotice(message, type = 'info') {
        console.log(`[${type.toUpperCase()}]`, message);
        // Implementation depends on your admin notice system
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    // Initialize all examples
    function initializeExamples() {
        console.log('🔧 Initializing DOM Script Injection Examples...');

        // Check if script injection system is available
        if (!window.domScriptInjector) {
            console.warn('⚠️ DOM Script Injection System not found. Loading...');

            // Fallback: create instance
            window.domScriptInjector = new DOMScriptInjectionSystem({
                enableLogging: true,
                logLevel: 'info'
            });
        }

        // Setup examples based on page context
        if ($('#template-editor-container').length > 0) {
            wordpressAdminIntegration();
        }

        if ($('#design-save-form').length > 0) {
            formSubmissionWithScriptResponse();
        }

        if ($('.enhance-with-scripts').length > 0) {
            progressiveEnhancementPattern();
        }

        if ($('.open-modal').length > 0) {
            modalContentLoading();
        }

        // Always setup error handling
        setupErrorHandlingExamples();

        // Setup dynamic widget loading globally
        dynamicWidgetLoading();

        console.log('✅ DOM Script Injection Examples initialized');

        // Expose examples globally for manual testing
        window.scriptInjectionExamples = {
            handleAjaxResponseExample,
            loadWidget: window.loadWidget,
            startRealtimeUpdates: realtimeContentUpdates
        };
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        $(document).ready(initializeExamples);
    } else {
        initializeExamples();
    }
});

// ========================================
// TESTING AND DEBUGGING HELPERS
// ========================================

// Development helper: Test script injection with sample HTML
window.testScriptInjection = function(sampleHtml) {
    if (!sampleHtml) {
        sampleHtml = `
            <div>
                <h3>Test Content</h3>
                <p>This is test content with embedded scripts.</p>
                <script>
                    console.log('🧪 Test script 1 executed!');
                    window.testScript1Executed = true;
                </script>
                <script>
                    console.log('🧪 Test script 2 executed!');
                    window.testScript2Executed = true;
                </script>
            </div>
        `;
    }

    // Create test container if it doesn't exist
    if ($('#script-injection-test').length === 0) {
        $('body').append('<div id="script-injection-test" style="margin: 20px; padding: 20px; border: 2px dashed #ccc;"></div>');
    }

    const $testContainer = $('#script-injection-test');

    console.log('🧪 Testing script injection...');

    $testContainer.htmlWithScripts(sampleHtml, {
        enableLogging: true,
        preferredMethod: 'function'
    }).then(function(result) {
        console.log('✅ Test completed:', result);

        // Verify scripts ran
        const script1Ran = window.testScript1Executed === true;
        const script2Ran = window.testScript2Executed === true;

        console.log('🔍 Verification:', {
            script1Ran,
            script2Ran,
            allScriptsRan: script1Ran && script2Ran
        });

    }).catch(function(error) {
        console.error('❌ Test failed:', error);
    });
};

console.log('🤖 DOM Script Injection Examples loaded. Use window.testScriptInjection() to test.');
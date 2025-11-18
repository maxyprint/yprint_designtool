/**
 * WordPress Admin Integration for WebSocket AI Testing
 * Integrates with Octo Print Designer admin interface
 */

(function($) {
    'use strict';

    let aiTestClient = null;
    let currentPostId = null;

    // Initialize when document is ready
    $(document).ready(function() {
        currentPostId = getCurrentPostId();

        if (currentPostId && typeof AITestClient !== 'undefined') {
            initializeWebSocketIntegration();
            createAdminTestPanel();
        }
    });

    function getCurrentPostId() {
        // Extract post ID from URL or global variables
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('post') || $('#post_ID').val() || (window.typenow === 'design_template' ? $('.post-type-design_template').find('#post_ID').val() : null);
        return postId ? parseInt(postId) : null;
    }

    function initializeWebSocketIntegration() {
        console.log('🤖 Initializing WebSocket AI Testing Integration...');

        try {
            aiTestClient = new AITestClient(octo_websocket_ajax.websocket_server_url);
            setupEventListeners();

            // Auto-start server if configured
            if (octo_websocket_ajax.auto_start_server) {
                checkServerStatusAndStart();
            }

        } catch (error) {
            console.error('Failed to initialize WebSocket client:', error);
            showAdminNotice('WebSocket integration failed to initialize: ' + error.message, 'error');
        }
    }

    function setupEventListeners() {
        aiTestClient.on('connected', function() {
            console.log('✅ Connected to AI Test Server');
            updateConnectionStatus('connected');
            showAdminNotice('🤖 AI Testing Server verbunden - Echtzeit-Tests verfügbar!', 'success');
        });

        aiTestClient.on('disconnected', function() {
            console.log('❌ Disconnected from AI Test Server');
            updateConnectionStatus('disconnected');
            showAdminNotice('⚠️ AI Testing Server getrennt', 'warning');
        });

        aiTestClient.on('session_established', function(data) {
            console.log('🆔 Session established:', data.sessionId);
            $('#ai-test-session-id').text(data.sessionId);
        });

        aiTestClient.on('test_started', function(data) {
            console.log('🧪 Test started:', data.taskId);
            showTestProgress('Test wird initialisiert...', 0);
            disableTestButtons(true);
        });

        aiTestClient.on('progress', function(data) {
            console.log('📊 Progress:', data.progress + '% -', data.step);
            showTestProgress(data.step, data.progress);
        });

        aiTestClient.on('test_completed', function(data) {
            console.log('✅ Test completed:', data.taskId);
            hideTestProgress();
            showTestResults(data.result);
            disableTestButtons(false);

            // Save results to WordPress
            saveTestResultsToWordPress(data.taskId, 'design_test', data.result);
        });

        aiTestClient.on('validation_result', function(data) {
            console.log('✔️ Validation completed:', data.taskId);
            showValidationResults(data.result);
            disableTestButtons(false);

            // Save results to WordPress
            saveTestResultsToWordPress(data.taskId, 'design_validation', data.result);
        });

        aiTestClient.on('code_result', function(data) {
            console.log('⚡ Code execution completed:', data.taskId);
            showCodeResults(data.result);
            disableTestButtons(false);
        });

        aiTestClient.on('server_error', function(data) {
            console.error('❌ Server error:', data.message);
            showAdminNotice('Server Fehler: ' + data.message, 'error');
            disableTestButtons(false);
        });

        aiTestClient.on('connection_failed', function() {
            console.error('❌ Connection failed');
            updateConnectionStatus('failed');
            showAdminNotice('🔌 Verbindung zum AI Test Server fehlgeschlagen. <a href=\"#\" onclick=\"startWebSocketServer()\">Server starten</a>', 'error');
        });
    }

    function createAdminTestPanel() {
        const $designTemplateMetaBox = $('#design-template-data');

        if ($designTemplateMetaBox.length === 0) {
            // Fallback: Create panel at the end of the form
            $('#post').append(createTestPanelHTML());
        } else {
            // Insert after the design template meta box
            $designTemplateMetaBox.after(createTestPanelHTML());
        }

        // Bind events
        bindTestPanelEvents();
    }

    function createTestPanelHTML() {
        return `
            <div class="postbox ai-test-integration-panel" style="margin-top: 20px;">
                <div class="postbox-header">
                    <h2 class="hndle ui-sortable-handle">
                        🤖 AI Testing Integration
                        <span id="ai-connection-indicator" class="connection-indicator disconnected">●</span>
                    </h2>
                </div>
                <div class="inside">
                    <div class="ai-test-connection-info">
                        <p>
                            <strong>Status:</strong>
                            <span id="ai-connection-status">Verbinde...</span>
                        </p>
                        <p style="font-size: 12px; color: #666;">
                            Session: <span id="ai-test-session-id">-</span>
                        </p>
                    </div>

                    <div class="ai-test-controls">
                        <button type="button" class="button button-primary" id="run-design-test">
                            🧪 Design Test
                        </button>
                        <button type="button" class="button" id="validate-design">
                            ✅ Design Validieren
                        </button>
                        <button type="button" class="button" id="test-print-specs">
                            📐 Druckspezifikationen
                        </button>
                        <button type="button" class="button button-secondary" id="start-server">
                            🚀 Server Starten
                        </button>
                    </div>

                    <div id="ai-test-progress" class="ai-test-progress" style="display: none;">
                        <div class="progress-text">Initialisiere Test...</div>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: 0%;"></div>
                        </div>
                    </div>

                    <div id="ai-test-results" class="ai-test-results" style="display: none;">
                        <!-- Results will be populated here -->
                    </div>

                    <div class="ai-test-help" style="margin-top: 15px; padding: 10px; background: #f0f6fc; border-left: 4px solid #0073aa;">
                        <p style="margin: 0; font-size: 12px;">
                            <strong>Tipp:</strong> Diese KI-Tests helfen bei der Qualitätssicherung deiner Designs.
                            Echtzeit-Feedback ermöglicht schnelle Iterationen und bessere Ergebnisse.
                        </p>
                    </div>
                </div>
            </div>

            <style>
            .ai-test-integration-panel .connection-indicator {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                margin-left: 10px;
            }
            .ai-test-integration-panel .connection-indicator.connected { background: #46b450; }
            .ai-test-integration-panel .connection-indicator.disconnected { background: #dc3232; }
            .ai-test-integration-panel .connection-indicator.connecting {
                background: #ffb900;
                animation: pulse 1s infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            .ai-test-controls button {
                margin-right: 10px;
                margin-bottom: 5px;
            }
            .ai-test-progress {
                margin: 15px 0;
            }
            .progress-text {
                font-size: 12px;
                margin-bottom: 5px;
                color: #666;
            }
            .progress-bar-container {
                background: #f0f0f0;
                border-radius: 10px;
                overflow: hidden;
                height: 20px;
            }
            .progress-bar {
                background: linear-gradient(90deg, #0073aa, #005177);
                height: 100%;
                transition: width 0.3s ease;
            }
            .ai-test-results {
                margin-top: 15px;
                padding: 10px;
                background: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            .test-result-card {
                display: inline-block;
                margin: 5px 10px 5px 0;
                padding: 10px;
                background: white;
                border: 1px solid #ddd;
                border-radius: 4px;
                text-align: center;
                min-width: 80px;
            }
            .test-result-value {
                font-size: 20px;
                font-weight: bold;
                color: #0073aa;
            }
            .test-result-label {
                font-size: 11px;
                color: #666;
                margin-top: 3px;
            }
            .validation-issues {
                margin-top: 10px;
                padding: 8px;
                background: #fff8e5;
                border-left: 4px solid #ffb900;
            }
            .validation-issues.error {
                background: #fef7f7;
                border-left-color: #dc3232;
            }
            .validation-issues.success {
                background: #f7fff7;
                border-left-color: #46b450;
            }
            </style>
        `;
    }

    function bindTestPanelEvents() {
        $('#run-design-test').on('click', function() {
            runDesignTest();
        });

        $('#validate-design').on('click', function() {
            validateCurrentDesign();
        });

        $('#test-print-specs').on('click', function() {
            testPrintSpecifications();
        });

        $('#start-server').on('click', function() {
            startWebSocketServer();
        });
    }

    function runDesignTest() {
        if (!aiTestClient || !aiTestClient.isConnected) {
            showAdminNotice('Nicht mit AI Test Server verbunden!', 'error');
            return;
        }

        // Get current design data from WordPress
        getDesignDataFromWordPress(function(designData) {
            if (designData) {
                aiTestClient.runDesignTest(designData);
                console.log('🧪 Running design test with data:', designData);
            } else {
                showAdminNotice('Fehler beim Laden der Design-Daten', 'error');
            }
        });
    }

    function validateCurrentDesign() {
        if (!aiTestClient || !aiTestClient.isConnected) {
            showAdminNotice('Nicht mit AI Test Server verbunden!', 'error');
            return;
        }

        getDesignDataFromWordPress(function(designData) {
            if (designData) {
                aiTestClient.validateDesign(designData);
                console.log('✅ Validating design with data:', designData);
            } else {
                showAdminNotice('Fehler beim Laden der Design-Daten', 'error');
            }
        });
    }

    function testPrintSpecifications() {
        if (!aiTestClient || !aiTestClient.isConnected) {
            showAdminNotice('Nicht mit AI Test Server verbunden!', 'error');
            return;
        }

        // Custom print spec test
        const printSpecCode = `
            // Print Specification Test
            function validatePrintSpecs(designData) {
                const results = {
                    dpi_check: designData.dpi >= 300,
                    color_profile: designData.color_profile === 'CMYK',
                    bleed_area: designData.print_specifications.bleed >= 3,
                    safe_area: designData.print_specifications.safe_area >= 5,
                    dimensions_valid: designData.dimensions.width > 0 && designData.dimensions.height > 0
                };

                const score = Object.values(results).filter(Boolean).length / Object.keys(results).length * 100;

                return {
                    results: results,
                    score: score,
                    passed: score >= 80
                };
            }

            return validatePrintSpecs(arguments[0]);
        `;

        getDesignDataFromWordPress(function(designData) {
            if (designData) {
                aiTestClient.executeCode(`(${printSpecCode})(${JSON.stringify(designData)});`, 'javascript');
                console.log('📐 Testing print specifications...');
            }
        });
    }

    function getDesignDataFromWordPress(callback) {
        if (!currentPostId) {
            callback(null);
            return;
        }

        $.ajax({
            url: octo_websocket_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'get_design_data_for_testing',
                post_id: currentPostId,
                nonce: octo_websocket_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    callback(response.data);
                } else {
                    console.error('Failed to get design data:', response.data);
                    callback(null);
                }
            },
            error: function(xhr, status, error) {
                console.error('AJAX error getting design data:', error);
                callback(null);
            }
        });
    }

    function saveTestResultsToWordPress(taskId, testType, results) {
        if (!currentPostId) return;

        $.ajax({
            url: octo_websocket_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'save_test_results',
                post_id: currentPostId,
                task_id: taskId,
                test_type: testType,
                test_results: results,
                session_id: aiTestClient.sessionId,
                nonce: octo_websocket_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    console.log('✅ Test results saved to WordPress');
                } else {
                    console.error('Failed to save test results:', response.data);
                }
            }
        });
    }

    function updateConnectionStatus(status) {
        const $indicator = $('#ai-connection-indicator');
        const $statusText = $('#ai-connection-status');

        $indicator.removeClass('connected disconnected connecting');

        switch (status) {
            case 'connected':
                $indicator.addClass('connected');
                $statusText.text('✅ Verbunden');
                break;
            case 'connecting':
                $indicator.addClass('connecting');
                $statusText.text('🔄 Verbinde...');
                break;
            case 'disconnected':
            case 'failed':
                $indicator.addClass('disconnected');
                $statusText.text('❌ Getrennt');
                break;
        }
    }

    function showTestProgress(text, progress) {
        const $progressDiv = $('#ai-test-progress');
        const $resultsDiv = $('#ai-test-results');

        $progressDiv.show();
        $resultsDiv.hide();

        $progressDiv.find('.progress-text').text(text);
        $progressDiv.find('.progress-bar').css('width', progress + '%');
    }

    function hideTestProgress() {
        $('#ai-test-progress').hide();
    }

    function showTestResults(results) {
        const $resultsDiv = $('#ai-test-results');

        let html = '<h4>🧪 Test Ergebnisse</h4>';
        html += '<div class="test-results-grid">';
        html += `<div class="test-result-card">
                    <div class="test-result-value">${results.testsRun}</div>
                    <div class="test-result-label">Tests</div>
                 </div>`;
        html += `<div class="test-result-card">
                    <div class="test-result-value" style="color: #46b450;">${results.testsPassed}</div>
                    <div class="test-result-label">Erfolgreich</div>
                 </div>`;
        html += `<div class="test-result-card">
                    <div class="test-result-value" style="color: #dc3232;">${results.testsFailed}</div>
                    <div class="test-result-label">Fehlgeschlagen</div>
                 </div>`;
        html += `<div class="test-result-card">
                    <div class="test-result-value">${results.executionTime}ms</div>
                    <div class="test-result-label">Dauer</div>
                 </div>`;
        html += '</div>';

        if (results.details) {
            html += '<h5>Details:</h5><ul>';
            Object.entries(results.details).forEach(([key, value]) => {
                const status = value === 'PASS' ? '✅' : '❌';
                html += `<li>${key}: ${status} ${value}</li>`;
            });
            html += '</ul>';
        }

        $resultsDiv.html(html).show();
    }

    function showValidationResults(results) {
        const $resultsDiv = $('#ai-test-results');

        let html = '<h4>✅ Validierungs-Ergebnisse</h4>';

        const statusClass = results.isValid ? 'success' : 'error';
        const statusIcon = results.isValid ? '✅' : '❌';

        html += `<div class="validation-issues ${statusClass}">
                    <strong>${statusIcon} ${results.isValid ? 'Design Gültig' : 'Design hat Probleme'}</strong><br>
                    Score: ${results.score}/100
                 </div>`;

        if (results.issues && results.issues.length > 0) {
            html += '<h5>🔍 Gefundene Probleme:</h5><ul>';
            results.issues.forEach(issue => {
                html += `<li style="color: #dc3232;">❌ ${issue}</li>`;
            });
            html += '</ul>';
        }

        if (results.suggestions && results.suggestions.length > 0) {
            html += '<h5>💡 Verbesserungsvorschläge:</h5><ul>';
            results.suggestions.forEach(suggestion => {
                html += `<li style="color: #0073aa;">💡 ${suggestion}</li>`;
            });
            html += '</ul>';
        }

        $resultsDiv.html(html).show();
    }

    function showCodeResults(results) {
        const $resultsDiv = $('#ai-test-results');

        let html = '<h4>⚡ Code Ausführung</h4>';

        const statusIcon = results.success ? '✅' : '❌';
        html += `<p><strong>${statusIcon} ${results.success ? 'Erfolgreich' : 'Fehlgeschlagen'}</strong></p>`;
        html += `<p>Ausführungszeit: ${results.executionTime}ms</p>`;

        if (results.output) {
            html += `<h5>Ausgabe:</h5><pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px;">${results.output}</pre>`;
        }

        if (results.errors && results.errors.length > 0) {
            html += '<h5 style="color: #dc3232;">Fehler:</h5><ul>';
            results.errors.forEach(error => {
                html += `<li style="color: #dc3232;">${error}</li>`;
            });
            html += '</ul>';
        }

        $resultsDiv.html(html).show();
    }

    function disableTestButtons(disabled) {
        $('#run-design-test, #validate-design, #test-print-specs').prop('disabled', disabled);
    }

    function showAdminNotice(message, type = 'info') {
        const $notice = $(`<div class="notice notice-${type} is-dismissible"><p>${message}</p></div>`);
        $('.ai-test-integration-panel').before($notice);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            $notice.fadeOut(() => $notice.remove());
        }, 5000);
    }

    function checkServerStatusAndStart() {
        $.ajax({
            url: octo_websocket_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'check_websocket_server_status',
                nonce: octo_websocket_ajax.nonce
            },
            success: function(response) {
                if (response.success && !response.data.running) {
                    // Auto-start server
                    startWebSocketServer();
                }
            }
        });
    }

    // Global function for starting server (accessible from PHP admin notices)
    window.startWebSocketServer = function() {
        updateConnectionStatus('connecting');

        $.ajax({
            url: octo_websocket_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'start_websocket_server',
                nonce: octo_websocket_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    showAdminNotice('🚀 WebSocket Server gestartet!', 'success');

                    // Try to connect after a short delay
                    setTimeout(() => {
                        if (aiTestClient) {
                            aiTestClient.connect();
                        } else {
                            initializeWebSocketIntegration();
                        }
                    }, 2000);
                } else {
                    showAdminNotice('Fehler beim Starten des Servers: ' + (response.data || 'Unbekannter Fehler'), 'error');
                    updateConnectionStatus('disconnected');
                }
            },
            error: function() {
                showAdminNotice('AJAX Fehler beim Starten des Servers', 'error');
                updateConnectionStatus('disconnected');
            }
        });
    };

})(jQuery);
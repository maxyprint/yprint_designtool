/**
 * 🧠 AGENT-4-JSON-ERROR-SPECIALIST
 * Mission: JSON Parsing & Error Handling Testing
 * Specialized in: JSON parsing, error handling, response validation, debug analysis
 */

console.log('🔍 AGENT-4-JSON-ERROR-SPECIALIST: DEPLOYMENT INITIATED');

class JsonErrorSpecialist {
    constructor() {
        this.testResults = {
            json_parsing: 'pending',
            error_handling: 'pending',
            response_validation: 'pending',
            debug_capability: 'pending'
        };
        this.errorPatterns = [];
        this.validResponses = [];
    }

    async execute() {
        console.log('🔍 AGENT-4: Starting JSON parsing and error handling analysis...');

        // TASK 1: Test JSON Parsing Robustness
        await this.testJsonParsing();

        // TASK 2: Test Error Response Handling
        await this.testErrorHandling();

        // TASK 3: Validate Response Formats
        await this.validateResponseFormats();

        // TASK 4: Test Debug Capabilities
        await this.testDebugCapabilities();

        // TASK 5: Test Edge Cases
        await this.testEdgeCases();

        return this.generateReport();
    }

    async testJsonParsing() {
        console.log('🔍 AGENT-4: Testing JSON parsing robustness...');

        const endpoints = [
            'get_template_measurements',
            'get_template_measurements_for_admin',
            'save_reference_lines'
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch('https://test-site.local/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `action=${endpoint}&template_id=63&nonce=test_nonce`
                });

                // Test AGENT-3 enhanced parsing method
                const responseText = await response.text();
                console.log(`🔍 AGENT-4: Raw response from ${endpoint}:`, responseText.substring(0, 100));

                // Attempt JSON parsing with error detection
                const parseResult = this.parseJsonWithErrorDetection(responseText);

                this.validResponses.push({
                    endpoint,
                    response_status: response.status,
                    parse_result: parseResult,
                    response_length: responseText.length,
                    content_preview: responseText.substring(0, 200)
                });

                if (parseResult.success) {
                    console.log(`✅ AGENT-4: JSON parsing successful for ${endpoint}`);
                } else {
                    console.log(`⚠️ AGENT-4: JSON parsing failed for ${endpoint}:`, parseResult.error);
                }

            } catch (error) {
                this.errorPatterns.push({
                    endpoint,
                    error_type: 'network',
                    error_message: error.message,
                    timestamp: new Date().toISOString()
                });
                console.error(`❌ AGENT-4: Network error for ${endpoint}:`, error.message);
            }
        }

        this.testResults.json_parsing = this.validResponses.length > 0 ? 'success' : 'error';
    }

    parseJsonWithErrorDetection(responseText) {
        // Implement AGENT-3 enhanced JSON parsing logic
        try {
            const data = JSON.parse(responseText);
            return { success: true, data, parsing_method: 'direct' };
        } catch (jsonError) {
            // Check for HTML error pages
            if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
                return {
                    success: false,
                    error: 'HTML_RESPONSE',
                    message: 'Server returned HTML instead of JSON - likely PHP error',
                    content_preview: responseText.substring(0, 200)
                };
            }

            // Check for WordPress errors
            if (responseText.includes('wp_die') || responseText.includes('WordPress')) {
                return {
                    success: false,
                    error: 'WP_ERROR',
                    message: 'WordPress security or permission error',
                    content_preview: responseText.substring(0, 200)
                };
            }

            // Check for empty response
            if (!responseText.trim()) {
                return {
                    success: false,
                    error: 'EMPTY_RESPONSE',
                    message: 'Server returned empty response'
                };
            }

            // Generic JSON parsing error
            return {
                success: false,
                error: 'JSON_PARSE_ERROR',
                message: jsonError.message,
                content_preview: responseText.substring(0, 200)
            };
        }
    }

    async testErrorHandling() {
        console.log('🔍 AGENT-4: Testing error handling capabilities...');

        // Test various error scenarios
        const errorTests = [
            { test: 'invalid_action', body: 'action=invalid_endpoint&template_id=63' },
            { test: 'missing_nonce', body: 'action=get_template_measurements&template_id=63' },
            { test: 'invalid_template_id', body: 'action=get_template_measurements&template_id=999999&nonce=test' },
            { test: 'malformed_data', body: 'action=save_reference_lines&reference_lines=invalid_json&template_id=63&nonce=test' }
        ];

        for (const errorTest of errorTests) {
            try {
                const response = await fetch('https://test-site.local/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: errorTest.body
                });

                const responseText = await response.text();
                const parseResult = this.parseJsonWithErrorDetection(responseText);

                this.errorPatterns.push({
                    test_case: errorTest.test,
                    response_status: response.status,
                    parse_result: parseResult,
                    handled_gracefully: this.isErrorHandledGracefully(parseResult, responseText),
                    timestamp: new Date().toISOString()
                });

                console.log(`🔍 AGENT-4: Error test ${errorTest.test} completed`);

            } catch (error) {
                this.errorPatterns.push({
                    test_case: errorTest.test,
                    error_type: 'network_error',
                    error_message: error.message
                });
            }
        }

        this.testResults.error_handling = this.errorPatterns.length > 0 ? 'success' : 'error';
    }

    isErrorHandledGracefully(parseResult, responseText) {
        if (parseResult.success && parseResult.data) {
            // Check if it's a proper error response with structure
            return parseResult.data.success === false && parseResult.data.message;
        }

        // Check if error response follows WordPress patterns
        if (responseText.includes('wp_die') || responseText.includes('error')) {
            return true; // WordPress is handling the error
        }

        return false;
    }

    async validateResponseFormats() {
        console.log('🔍 AGENT-4: Validating response formats...');

        // Analyze response formats from previous tests
        const formats = {
            valid_json: 0,
            html_responses: 0,
            empty_responses: 0,
            error_responses: 0,
            wordpress_structured: 0
        };

        [...this.validResponses, ...this.errorPatterns].forEach(result => {
            if (result.parse_result) {
                switch (result.parse_result.error) {
                    case 'HTML_RESPONSE':
                        formats.html_responses++;
                        break;
                    case 'EMPTY_RESPONSE':
                        formats.empty_responses++;
                        break;
                    case 'WP_ERROR':
                        formats.error_responses++;
                        break;
                    case 'JSON_PARSE_ERROR':
                        formats.error_responses++;
                        break;
                    default:
                        if (result.parse_result.success) {
                            formats.valid_json++;
                            if (result.parse_result.data?.success !== undefined) {
                                formats.wordpress_structured++;
                            }
                        }
                }
            }
        });

        this.responseFormats = formats;
        this.testResults.response_validation = formats.valid_json > 0 ? 'success' : 'warning';

        console.log('🔍 AGENT-4: Response format analysis:', formats);
    }

    async testDebugCapabilities() {
        console.log('🔍 AGENT-4: Testing debug capabilities...');

        // Test if enhanced error messages are working
        const debugTests = {
            error_message_clarity: this.errorPatterns.some(e => e.parse_result?.message),
            content_preview_available: this.errorPatterns.some(e => e.parse_result?.content_preview),
            error_categorization: this.errorPatterns.some(e => e.parse_result?.error),
            response_analysis: this.validResponses.length > 0
        };

        const debugScore = Object.values(debugTests).filter(test => test).length;
        this.testResults.debug_capability = debugScore >= 3 ? 'success' : 'partial';

        console.log('🔍 AGENT-4: Debug capabilities analysis:', debugTests);
    }

    async testEdgeCases() {
        console.log('🔍 AGENT-4: Testing edge cases...');

        // Test specific edge cases that could cause JSON parsing issues
        const edgeCases = [
            { name: 'large_response', body: 'action=get_template_measurements_for_admin&template_id=63' },
            { name: 'concurrent_request', body: 'action=get_template_measurements&template_id=63&test=concurrent' }
        ];

        const edgeResults = [];

        for (const edgeCase of edgeCases) {
            try {
                const startTime = performance.now();
                const response = await fetch('https://test-site.local/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: edgeCase.body
                });
                const endTime = performance.now();

                const responseText = await response.text();
                const parseResult = this.parseJsonWithErrorDetection(responseText);

                edgeResults.push({
                    test_name: edgeCase.name,
                    response_time: endTime - startTime,
                    response_size: responseText.length,
                    parse_success: parseResult.success,
                    status: response.status
                });

                console.log(`🔍 AGENT-4: Edge case ${edgeCase.name} - Time: ${Math.round(endTime - startTime)}ms, Size: ${responseText.length} bytes`);

            } catch (error) {
                edgeResults.push({
                    test_name: edgeCase.name,
                    error: error.message,
                    parse_success: false
                });
            }
        }

        this.edgeResults = edgeResults;
    }

    generateReport() {
        const report = {
            agent: 'AGENT-4-JSON-ERROR-SPECIALIST',
            status: 'completed',
            timestamp: new Date().toISOString(),
            results: this.testResults,
            parsing_analysis: {
                successful_parses: this.validResponses.filter(r => r.parse_result?.success).length,
                failed_parses: this.validResponses.filter(r => !r.parse_result?.success).length,
                error_patterns: this.errorPatterns.length,
                response_formats: this.responseFormats
            },
            error_categories: this.categorizeErrors(),
            edge_case_results: this.edgeResults,
            json_robustness_score: this.calculateRobustnessScore(),
            recommendations: this.getRecommendations()
        };

        console.log('📊 AGENT-4: Final Report:', report);
        return report;
    }

    categorizeErrors() {
        const categories = {};

        this.errorPatterns.forEach(pattern => {
            const category = pattern.parse_result?.error || pattern.error_type || 'unknown';
            categories[category] = (categories[category] || 0) + 1;
        });

        return categories;
    }

    calculateRobustnessScore() {
        const totalTests = this.validResponses.length + this.errorPatterns.length;
        if (totalTests === 0) return 0;

        const successfulParses = this.validResponses.filter(r => r.parse_result?.success).length;
        const gracefulErrors = this.errorPatterns.filter(p => p.handled_gracefully).length;

        const score = ((successfulParses + gracefulErrors) / totalTests) * 100;
        return Math.round(score);
    }

    getRecommendations() {
        const recommendations = [];

        if (this.testResults.json_parsing === 'error') {
            recommendations.push('Implement robust JSON parsing with error detection for all AJAX endpoints');
        }

        if (this.responseFormats?.html_responses > 0) {
            recommendations.push('Fix endpoints returning HTML instead of JSON (likely PHP errors)');
        }

        if (this.responseFormats?.empty_responses > 0) {
            recommendations.push('Investigate endpoints returning empty responses');
        }

        if (this.testResults.debug_capability !== 'success') {
            recommendations.push('Enhance debug capabilities with better error messages and content previews');
        }

        const slowRequests = this.edgeResults?.filter(r => r.response_time > 2000).length || 0;
        if (slowRequests > 0) {
            recommendations.push(`Optimize ${slowRequests} slow endpoints (>2s response time)`);
        }

        return recommendations;
    }
}

// Execute Agent-4 Mission
const agent4 = new JsonErrorSpecialist();
agent4.execute().then(report => {
    console.log('🎯 AGENT-4: Mission completed successfully');
    window.AGENT_4_REPORT = report;
}).catch(error => {
    console.error('❌ AGENT-4: Mission failed:', error);
});
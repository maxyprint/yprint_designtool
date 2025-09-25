/**
 * 🧠 AGENT-2-CORS-AJAX-VALIDATOR
 * Mission: CORS Headers & AJAX Endpoint Testing
 * Specialized in: CORS testing, AJAX validation, endpoint monitoring, HTTP header analysis
 */

console.log('🔄 AGENT-2-CORS-AJAX-VALIDATOR: DEPLOYMENT INITIATED');

class CorsAjaxValidator {
    constructor() {
        this.endpoints = [
            'get_template_measurements',
            'save_reference_lines',
            'save_multi_view_reference_lines',
            'get_template_measurements_for_admin'
        ];
        this.testResults = {};
    }

    async execute() {
        console.log('🔄 AGENT-2: Starting CORS and AJAX validation...');

        // TASK 1: Test CORS Headers on all critical endpoints
        for (const endpoint of this.endpoints) {
            await this.testCorsHeaders(endpoint);
        }

        // TASK 2: Test AJAX Request Compatibility
        await this.testAjaxCompatibility();

        // TASK 3: Test XMLHttpRequest vs Fetch API
        await this.testRequestMethods();

        // TASK 4: Validate Response Headers
        await this.validateResponseHeaders();

        return this.generateReport();
    }

    async testCorsHeaders(endpoint) {
        console.log(`🔄 AGENT-2: Testing CORS headers for ${endpoint}...`);

        try {
            const response = await fetch('https://test-site.local/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: `action=${endpoint}&template_id=63&nonce=test_nonce`
            });

            const headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
                'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials')
            };

            const corsStatus = headers['Access-Control-Allow-Origin'] ? 'success' : 'missing';

            this.testResults[endpoint] = {
                cors_status: corsStatus,
                headers: headers,
                response_status: response.status,
                response_ok: response.ok
            };

            if (corsStatus === 'success') {
                console.log(`✅ AGENT-2: CORS headers present for ${endpoint}`);
            } else {
                console.log(`⚠️ AGENT-2: CORS headers missing for ${endpoint}`);
            }

        } catch (error) {
            this.testResults[endpoint] = {
                cors_status: 'error',
                error: error.message
            };
            console.error(`❌ AGENT-2: CORS test failed for ${endpoint}:`, error.message);
        }
    }

    async testAjaxCompatibility() {
        console.log('🔄 AGENT-2: Testing AJAX compatibility...');

        // Test jQuery AJAX if available
        if (typeof $ !== 'undefined' && $.ajax) {
            try {
                const jqueryResult = await new Promise((resolve, reject) => {
                    $.ajax({
                        url: 'https://test-site.local/wp-admin/admin-ajax.php',
                        method: 'POST',
                        data: {
                            action: 'get_template_measurements',
                            template_id: 63,
                            nonce: 'test_nonce'
                        },
                        success: (data) => resolve({ status: 'success', data }),
                        error: (xhr, status, error) => reject({ status: 'error', error })
                    });
                });

                this.testResults.jquery_ajax = { status: 'success', compatible: true };
                console.log('✅ AGENT-2: jQuery AJAX compatible');

            } catch (error) {
                this.testResults.jquery_ajax = { status: 'error', compatible: false, error: error.error };
                console.log('⚠️ AGENT-2: jQuery AJAX compatibility issue');
            }
        } else {
            this.testResults.jquery_ajax = { status: 'not_available' };
            console.log('ℹ️ AGENT-2: jQuery not available');
        }
    }

    async testRequestMethods() {
        console.log('🔄 AGENT-2: Testing different request methods...');

        // Test Fetch API
        try {
            const fetchResponse = await fetch('https://test-site.local/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=get_template_measurements&template_id=63'
            });

            this.testResults.fetch_api = {
                status: 'success',
                response_status: fetchResponse.status,
                compatible: fetchResponse.ok
            };
            console.log('✅ AGENT-2: Fetch API working');

        } catch (error) {
            this.testResults.fetch_api = { status: 'error', error: error.message };
            console.error('❌ AGENT-2: Fetch API error:', error.message);
        }

        // Test XMLHttpRequest
        try {
            const xhrResult = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', 'https://test-site.local/wp-admin/admin-ajax.php', true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve({ status: 'success', response: xhr.responseText });
                    } else {
                        reject({ status: 'error', statusCode: xhr.status });
                    }
                };

                xhr.onerror = () => reject({ status: 'error', error: 'Network error' });
                xhr.send('action=get_template_measurements&template_id=63');
            });

            this.testResults.xmlhttprequest = { status: 'success', compatible: true };
            console.log('✅ AGENT-2: XMLHttpRequest working');

        } catch (error) {
            this.testResults.xmlhttprequest = { status: 'error', compatible: false, error };
            console.error('❌ AGENT-2: XMLHttpRequest error:', error);
        }
    }

    async validateResponseHeaders() {
        console.log('🔄 AGENT-2: Validating response headers...');

        try {
            const response = await fetch('https://test-site.local/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=get_template_measurements&template_id=63'
            });

            const allHeaders = {};
            for (const [key, value] of response.headers.entries()) {
                allHeaders[key] = value;
            }

            this.testResults.response_headers = {
                all_headers: allHeaders,
                content_type: response.headers.get('content-type'),
                cache_control: response.headers.get('cache-control'),
                server: response.headers.get('server')
            };

            console.log('✅ AGENT-2: Response headers captured');

        } catch (error) {
            this.testResults.response_headers = { status: 'error', error: error.message };
            console.error('❌ AGENT-2: Response headers validation failed:', error.message);
        }
    }

    generateReport() {
        const corsSuccessCount = Object.values(this.testResults)
            .filter(result => result.cors_status === 'success').length;

        const report = {
            agent: 'AGENT-2-CORS-AJAX-VALIDATOR',
            status: 'completed',
            timestamp: new Date().toISOString(),
            results: this.testResults,
            summary: `CORS Headers: ${corsSuccessCount}/${this.endpoints.length} endpoints`,
            corsCompliance: corsSuccessCount === this.endpoints.length ? 'FULL' : 'PARTIAL',
            ajaxCompatibility: this.getAjaxCompatibilityStatus(),
            recommendations: this.getRecommendations()
        };

        console.log('📊 AGENT-2: Final Report:', report);
        return report;
    }

    getAjaxCompatibilityStatus() {
        const methods = ['fetch_api', 'xmlhttprequest', 'jquery_ajax'];
        const workingMethods = methods.filter(method =>
            this.testResults[method] && this.testResults[method].status === 'success'
        );

        return {
            working_methods: workingMethods,
            compatibility_score: `${workingMethods.length}/${methods.length}`
        };
    }

    getRecommendations() {
        const recommendations = [];

        const failedEndpoints = Object.entries(this.testResults)
            .filter(([endpoint, result]) => result.cors_status !== 'success')
            .map(([endpoint]) => endpoint);

        if (failedEndpoints.length > 0) {
            recommendations.push(`Add CORS headers to: ${failedEndpoints.join(', ')}`);
        }

        if (this.testResults.fetch_api?.status === 'error') {
            recommendations.push('Check Fetch API compatibility and HTTPS configuration');
        }

        if (this.testResults.xmlhttprequest?.status === 'error') {
            recommendations.push('Resolve XMLHttpRequest CORS issues');
        }

        return recommendations;
    }
}

// Execute Agent-2 Mission
const agent2 = new CorsAjaxValidator();
agent2.execute().then(report => {
    console.log('🎯 AGENT-2: Mission completed successfully');
    window.AGENT_2_REPORT = report;
}).catch(error => {
    console.error('❌ AGENT-2: Mission failed:', error);
});
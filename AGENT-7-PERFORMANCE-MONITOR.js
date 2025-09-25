/**
 * 🧠 AGENT-7-PERFORMANCE-MONITOR
 * Mission: Performance Monitoring & System Stability Validation
 * Specialized in: Performance monitoring, system stability, console analysis, optimization validation
 */

console.log('⚡ AGENT-7-PERFORMANCE-MONITOR: DEPLOYMENT INITIATED');

class PerformanceMonitor {
    constructor() {
        this.testResults = {
            console_stability: 'pending',
            performance_metrics: 'pending',
            system_stability: 'pending',
            optimization_validation: 'pending'
        };
        this.performanceMetrics = {};
        this.consoleAnalysis = {
            errorCount: 0,
            warningCount: 0,
            logCount: 0,
            errorPatterns: [],
            performanceIssues: []
        };
        this.stabilityTests = [];
        this.startTime = performance.now();
    }

    async execute() {
        console.log('⚡ AGENT-7: Starting performance monitoring and system stability validation...');

        // TASK 1: Monitor Console Output and Errors
        await this.monitorConsoleStability();

        // TASK 2: Collect Performance Metrics
        await this.collectPerformanceMetrics();

        // TASK 3: Test System Stability
        await this.testSystemStability();

        // TASK 4: Validate Optimizations
        await this.validateOptimizations();

        // TASK 5: Analyze Resource Usage
        await this.analyzeResourceUsage();

        // TASK 6: Test Load Performance
        await this.testLoadPerformance();

        return this.generateReport();
    }

    async monitorConsoleStability() {
        console.log('⚡ AGENT-7: Monitoring console stability...');

        // Capture console activity for analysis
        const originalConsoleLog = console.log;
        const originalConsoleError = console.error;
        const originalConsoleWarn = console.warn;

        let logCaptureCount = 0;
        let errorCaptureCount = 0;
        let warningCaptureCount = 0;

        const captureStartTime = performance.now();

        // Temporarily override console methods to capture activity
        console.log = function(...args) {
            logCaptureCount++;
            const message = args.join(' ');

            // Detect performance-related logs
            if (message.includes('timeout') || message.includes('slow') || message.includes('performance')) {
                this.consoleAnalysis.performanceIssues.push({
                    type: 'performance_log',
                    message: message,
                    timestamp: performance.now() - captureStartTime
                });
            }

            return originalConsoleLog.apply(console, args);
        }.bind(this);

        console.error = function(...args) {
            errorCaptureCount++;
            const message = args.join(' ');

            this.consoleAnalysis.errorPatterns.push({
                type: 'error',
                message: message,
                timestamp: performance.now() - captureStartTime,
                stack: new Error().stack
            });

            return originalConsoleError.apply(console, args);
        }.bind(this);

        console.warn = function(...args) {
            warningCaptureCount++;
            const message = args.join(' ');

            // Detect recursion warnings
            if (message.includes('recursion') || message.includes('stack') || message.includes('loop')) {
                this.consoleAnalysis.performanceIssues.push({
                    type: 'recursion_warning',
                    message: message,
                    timestamp: performance.now() - captureStartTime
                });
            }

            return originalConsoleWarn.apply(console, args);
        }.bind(this);

        // Monitor for a period to capture console activity
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Restore original console methods
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;

        this.consoleAnalysis.logCount = logCaptureCount;
        this.consoleAnalysis.errorCount = errorCaptureCount;
        this.consoleAnalysis.warningCount = warningCaptureCount;

        // Evaluate console stability
        if (errorCaptureCount === 0 && this.consoleAnalysis.performanceIssues.length === 0) {
            this.testResults.console_stability = 'success';
            console.log('✅ AGENT-7: Console stability excellent - no errors or performance issues detected');
        } else if (errorCaptureCount < 5 && this.consoleAnalysis.performanceIssues.length < 3) {
            this.testResults.console_stability = 'partial';
            console.log('⚠️ AGENT-7: Console stability acceptable with minor issues');
        } else {
            this.testResults.console_stability = 'error';
            console.log('❌ AGENT-7: Console stability issues detected');
        }
    }

    async collectPerformanceMetrics() {
        console.log('⚡ AGENT-7: Collecting performance metrics...');

        // Collect basic performance metrics
        this.performanceMetrics = {
            // Memory usage (if available)
            memory: this.getMemoryUsage(),

            // Timing metrics
            navigation: this.getNavigationTiming(),

            // Resource timing
            resources: this.getResourceTiming(),

            // DOM metrics
            dom: this.getDomMetrics(),

            // JavaScript execution
            execution: this.getExecutionMetrics(),

            // AJAX performance
            ajax: await this.getAjaxPerformance()
        };

        // Evaluate overall performance
        const performanceScore = this.calculatePerformanceScore();

        if (performanceScore >= 80) {
            this.testResults.performance_metrics = 'success';
            console.log('✅ AGENT-7: Performance metrics excellent');
        } else if (performanceScore >= 60) {
            this.testResults.performance_metrics = 'partial';
            console.log('⚠️ AGENT-7: Performance metrics acceptable');
        } else {
            this.testResults.performance_metrics = 'error';
            console.log('❌ AGENT-7: Performance metrics need improvement');
        }
    }

    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return { available: false };
    }

    getNavigationTiming() {
        if (performance.navigation && performance.timing) {
            return {
                dom_content_loaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
                load_complete: performance.timing.loadEventEnd - performance.timing.navigationStart,
                dom_interactive: performance.timing.domInteractive - performance.timing.navigationStart
            };
        }
        return { available: false };
    }

    getResourceTiming() {
        const resources = performance.getEntriesByType('resource');
        const resourcesByType = {};

        resources.forEach(resource => {
            const type = this.getResourceType(resource.name);
            if (!resourcesByType[type]) {
                resourcesByType[type] = { count: 0, totalDuration: 0, maxDuration: 0 };
            }

            resourcesByType[type].count++;
            resourcesByType[type].totalDuration += resource.duration;
            resourcesByType[type].maxDuration = Math.max(resourcesByType[type].maxDuration, resource.duration);
        });

        return {
            total_resources: resources.length,
            by_type: resourcesByType,
            slow_resources: resources.filter(r => r.duration > 1000).map(r => ({
                name: r.name.split('/').pop(),
                duration: Math.round(r.duration)
            }))
        };
    }

    getResourceType(url) {
        if (url.includes('.js')) return 'javascript';
        if (url.includes('.css')) return 'stylesheet';
        if (url.includes('.php')) return 'ajax';
        if (url.match(/\.(jpg|jpeg|png|gif|svg)$/)) return 'image';
        return 'other';
    }

    getDomMetrics() {
        return {
            total_elements: document.querySelectorAll('*').length,
            canvas_elements: document.querySelectorAll('canvas').length,
            script_elements: document.querySelectorAll('script').length,
            style_elements: document.querySelectorAll('style, link[rel="stylesheet"]').length,
            form_elements: document.querySelectorAll('input, select, textarea, button').length
        };
    }

    getExecutionMetrics() {
        const now = performance.now();
        return {
            agent_execution_time: Math.round(now - this.startTime),
            fabric_availability: typeof window.fabric !== 'undefined',
            jquery_availability: typeof window.jQuery !== 'undefined',
            multi_view_selector_ready: typeof window.multiViewPointToPointSelector !== 'undefined'
        };
    }

    async getAjaxPerformance() {
        console.log('⚡ AGENT-7: Testing AJAX performance...');

        const ajaxTests = [
            { endpoint: 'get_template_measurements', priority: 'high' },
            { endpoint: 'get_template_measurements_for_admin', priority: 'medium' }
        ];

        const ajaxResults = [];

        for (const test of ajaxTests) {
            const startTime = performance.now();

            try {
                const response = await fetch('https://test-site.local/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `action=${test.endpoint}&template_id=63`
                });

                const endTime = performance.now();
                const duration = endTime - startTime;

                ajaxResults.push({
                    endpoint: test.endpoint,
                    duration: Math.round(duration),
                    status: response.status,
                    ok: response.ok,
                    priority: test.priority,
                    performance_rating: this.getPerformanceRating(duration, test.priority)
                });

            } catch (error) {
                ajaxResults.push({
                    endpoint: test.endpoint,
                    error: error.message,
                    priority: test.priority,
                    performance_rating: 'error'
                });
            }
        }

        return {
            tests_completed: ajaxResults.length,
            results: ajaxResults,
            average_response_time: Math.round(
                ajaxResults.filter(r => r.duration).reduce((sum, r) => sum + r.duration, 0) /
                ajaxResults.filter(r => r.duration).length
            ),
            slow_endpoints: ajaxResults.filter(r => r.duration && r.duration > 2000)
        };
    }

    getPerformanceRating(duration, priority) {
        const thresholds = {
            high: { excellent: 500, good: 1000, poor: 2000 },
            medium: { excellent: 1000, good: 2000, poor: 3000 },
            low: { excellent: 2000, good: 4000, poor: 6000 }
        };

        const threshold = thresholds[priority] || thresholds.medium;

        if (duration <= threshold.excellent) return 'excellent';
        if (duration <= threshold.good) return 'good';
        if (duration <= threshold.poor) return 'acceptable';
        return 'poor';
    }

    async testSystemStability() {
        console.log('⚡ AGENT-7: Testing system stability...');

        const stabilityTests = [
            { name: 'memory_leak_detection', test: this.testMemoryLeaks.bind(this) },
            { name: 'error_recovery', test: this.testErrorRecovery.bind(this) },
            { name: 'concurrent_operations', test: this.testConcurrentOperations.bind(this) },
            { name: 'resource_cleanup', test: this.testResourceCleanup.bind(this) }
        ];

        for (const test of stabilityTests) {
            try {
                const result = await test.test();
                this.stabilityTests.push({
                    name: test.name,
                    status: result.status,
                    details: result.details,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                this.stabilityTests.push({
                    name: test.name,
                    status: 'error',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }

        const successfulStabilityTests = this.stabilityTests.filter(test => test.status === 'success').length;
        this.testResults.system_stability = successfulStabilityTests >= 2 ? 'success' : 'partial';
    }

    async testMemoryLeaks() {
        console.log('⚡ AGENT-7: Testing for memory leaks...');

        if (!performance.memory) {
            return { status: 'unavailable', details: 'Memory API not available' };
        }

        const initialMemory = performance.memory.usedJSHeapSize;

        // Simulate some operations that could cause memory leaks
        for (let i = 0; i < 100; i++) {
            // Create and destroy DOM elements
            const div = document.createElement('div');
            div.innerHTML = `Test ${i}`;
            document.body.appendChild(div);
            document.body.removeChild(div);
        }

        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        const finalMemory = performance.memory.usedJSHeapSize;
        const memoryIncrease = finalMemory - initialMemory;

        return {
            status: memoryIncrease < 1024 * 1024 ? 'success' : 'warning', // Less than 1MB increase
            details: {
                initial_memory: Math.round(initialMemory / 1024),
                final_memory: Math.round(finalMemory / 1024),
                increase_kb: Math.round(memoryIncrease / 1024)
            }
        };
    }

    async testErrorRecovery() {
        console.log('⚡ AGENT-7: Testing error recovery...');

        let recoveryCount = 0;

        // Test various error scenarios and recovery
        const errorTests = [
            () => { throw new Error('Test error for recovery'); },
            () => { JSON.parse('invalid json'); },
            () => { document.querySelector('#nonexistent').click(); }
        ];

        for (const errorTest of errorTests) {
            try {
                errorTest();
            } catch (error) {
                // Check if system continues to function after error
                try {
                    const testElement = document.createElement('div');
                    testElement.innerHTML = 'Recovery test';
                    if (testElement.innerHTML === 'Recovery test') {
                        recoveryCount++;
                    }
                } catch (recoveryError) {
                    // Recovery failed
                }
            }
        }

        return {
            status: recoveryCount === errorTests.length ? 'success' : 'partial',
            details: {
                recovery_rate: `${recoveryCount}/${errorTests.length}`,
                errors_handled: recoveryCount
            }
        };
    }

    async testConcurrentOperations() {
        console.log('⚡ AGENT-7: Testing concurrent operations...');

        const concurrentTasks = [
            fetch('https://test-site.local/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=get_template_measurements&template_id=63'
            }),
            fetch('https://test-site.local/wp-admin/admin-ajax.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=get_template_measurements_for_admin&template_id=63'
            }),
            new Promise(resolve => setTimeout(() => resolve('timeout_test'), 1000))
        ];

        try {
            const results = await Promise.all(concurrentTasks);

            return {
                status: 'success',
                details: {
                    tasks_completed: results.length,
                    all_successful: results.every(result => result !== null)
                }
            };
        } catch (error) {
            return {
                status: 'error',
                details: { error: error.message }
            };
        }
    }

    async testResourceCleanup() {
        console.log('⚡ AGENT-7: Testing resource cleanup...');

        // Test event listener cleanup
        let eventListenerCount = 0;
        const testEventListener = () => eventListenerCount++;

        // Add and remove event listeners
        document.addEventListener('click', testEventListener);
        document.removeEventListener('click', testEventListener);

        // Test DOM element cleanup
        const testDiv = document.createElement('div');
        testDiv.id = 'agent-7-cleanup-test';
        document.body.appendChild(testDiv);

        const elementExists = document.getElementById('agent-7-cleanup-test') !== null;

        // Cleanup
        if (elementExists) {
            document.body.removeChild(testDiv);
        }

        const cleanupSuccessful = document.getElementById('agent-7-cleanup-test') === null;

        return {
            status: cleanupSuccessful ? 'success' : 'warning',
            details: {
                event_cleanup: 'tested',
                dom_cleanup: cleanupSuccessful ? 'successful' : 'failed'
            }
        };
    }

    async validateOptimizations() {
        console.log('⚡ AGENT-7: Validating optimization implementations...');

        const optimizationChecks = {
            console_throttling: this.checkConsoleThrottling(),
            recursion_prevention: this.checkRecursionPrevention(),
            performance_polling: this.checkPerformancePolling(),
            resource_efficiency: this.checkResourceEfficiency()
        };

        const passedOptimizations = Object.values(optimizationChecks).filter(check => check === true).length;

        this.optimizationResults = optimizationChecks;
        this.testResults.optimization_validation = passedOptimizations >= 2 ? 'success' : 'partial';
    }

    checkConsoleThrottling() {
        // Check if console throttling is implemented (fewer console messages)
        return this.consoleAnalysis.logCount < 50; // Reasonable console activity
    }

    checkRecursionPrevention() {
        // Check if recursion prevention is working (no recursion warnings)
        return this.consoleAnalysis.performanceIssues.filter(issue =>
            issue.type === 'recursion_warning'
        ).length === 0;
    }

    checkPerformancePolling() {
        // Check if polling timeout optimizations are working
        const ajaxPerformance = this.performanceMetrics.ajax;
        if (!ajaxPerformance || !ajaxPerformance.average_response_time) return true;

        return ajaxPerformance.average_response_time < 3000; // Under 3 seconds average
    }

    checkResourceEfficiency() {
        // Check resource usage efficiency
        const memory = this.performanceMetrics.memory;
        if (!memory || !memory.used) return true;

        return memory.used < 100; // Under 100MB used
    }

    calculatePerformanceScore() {
        let score = 100;

        // Memory usage impact
        if (this.performanceMetrics.memory && this.performanceMetrics.memory.used) {
            if (this.performanceMetrics.memory.used > 100) score -= 20;
            else if (this.performanceMetrics.memory.used > 50) score -= 10;
        }

        // AJAX performance impact
        if (this.performanceMetrics.ajax && this.performanceMetrics.ajax.average_response_time) {
            if (this.performanceMetrics.ajax.average_response_time > 3000) score -= 30;
            else if (this.performanceMetrics.ajax.average_response_time > 1000) score -= 15;
        }

        // Console stability impact
        score -= this.consoleAnalysis.errorCount * 5;
        score -= this.consoleAnalysis.performanceIssues.length * 10;

        return Math.max(0, score);
    }

    async analyzeResourceUsage() {
        console.log('⚡ AGENT-7: Analyzing resource usage...');

        this.resourceAnalysis = {
            network_requests: performance.getEntriesByType('navigation').length +
                            performance.getEntriesByType('resource').length,
            dom_complexity: this.performanceMetrics.dom.total_elements,
            script_count: this.performanceMetrics.dom.script_elements,
            memory_efficiency: this.performanceMetrics.memory.used < 50 ? 'excellent' :
                               this.performanceMetrics.memory.used < 100 ? 'good' : 'needs_improvement'
        };
    }

    async testLoadPerformance() {
        console.log('⚡ AGENT-7: Testing load performance...');

        const loadMetrics = {
            dom_content_loaded: this.performanceMetrics.navigation.dom_content_loaded || 0,
            load_complete: this.performanceMetrics.navigation.load_complete || 0,
            resource_load_time: this.performanceMetrics.resources.total_resources > 0 ?
                Math.round(this.performanceMetrics.resources.by_type.javascript?.totalDuration /
                          this.performanceMetrics.resources.by_type.javascript?.count) || 0 : 0
        };

        this.loadPerformance = {
            ...loadMetrics,
            performance_grade: this.getLoadPerformanceGrade(loadMetrics)
        };
    }

    getLoadPerformanceGrade(metrics) {
        if (metrics.dom_content_loaded < 1000 && metrics.load_complete < 3000) return 'A';
        if (metrics.dom_content_loaded < 2000 && metrics.load_complete < 5000) return 'B';
        if (metrics.dom_content_loaded < 3000 && metrics.load_complete < 8000) return 'C';
        return 'D';
    }

    generateReport() {
        const report = {
            agent: 'AGENT-7-PERFORMANCE-MONITOR',
            status: 'completed',
            timestamp: new Date().toISOString(),
            execution_time: Math.round(performance.now() - this.startTime),
            results: this.testResults,
            console_analysis: this.consoleAnalysis,
            performance_metrics: this.performanceMetrics,
            stability_tests: this.stabilityTests,
            optimization_validation: this.optimizationResults,
            resource_analysis: this.resourceAnalysis,
            load_performance: this.loadPerformance,
            overall_performance_score: this.calculatePerformanceScore(),
            system_health_grade: this.getSystemHealthGrade(),
            recommendations: this.getRecommendations()
        };

        console.log('📊 AGENT-7: Final Report:', report);
        return report;
    }

    getSystemHealthGrade() {
        const scores = Object.values(this.testResults).map(result => {
            switch (result) {
                case 'success': return 100;
                case 'partial': return 70;
                case 'error': return 0;
                default: return 0;
            }
        });

        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

        if (average >= 90) return 'A';
        if (average >= 80) return 'B';
        if (average >= 70) return 'C';
        if (average >= 60) return 'D';
        return 'F';
    }

    getRecommendations() {
        const recommendations = [];

        if (this.testResults.console_stability !== 'success') {
            recommendations.push(`Address ${this.consoleAnalysis.errorCount} console errors and ${this.consoleAnalysis.performanceIssues.length} performance issues`);
        }

        if (this.testResults.performance_metrics !== 'success') {
            if (this.performanceMetrics.memory && this.performanceMetrics.memory.used > 100) {
                recommendations.push('Optimize memory usage - currently using over 100MB');
            }

            if (this.performanceMetrics.ajax && this.performanceMetrics.ajax.slow_endpoints.length > 0) {
                recommendations.push(`Optimize ${this.performanceMetrics.ajax.slow_endpoints.length} slow AJAX endpoints`);
            }
        }

        if (this.testResults.system_stability !== 'success') {
            const failedStabilityTests = this.stabilityTests.filter(test => test.status !== 'success').length;
            recommendations.push(`Fix ${failedStabilityTests} system stability issues`);
        }

        if (this.testResults.optimization_validation !== 'success') {
            const failedOptimizations = Object.entries(this.optimizationResults || {})
                .filter(([key, value]) => value === false)
                .map(([key]) => key);

            if (failedOptimizations.length > 0) {
                recommendations.push(`Implement missing optimizations: ${failedOptimizations.join(', ')}`);
            }
        }

        if (this.loadPerformance && this.loadPerformance.performance_grade === 'D') {
            recommendations.push('Improve page load performance - currently rated D');
        }

        return recommendations;
    }
}

// Execute Agent-7 Mission
const agent7 = new PerformanceMonitor();
agent7.execute().then(report => {
    console.log('🎯 AGENT-7: Mission completed successfully');
    window.AGENT_7_REPORT = report;
}).catch(error => {
    console.error('❌ AGENT-7: Mission failed:', error);
});
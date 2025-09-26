/**
 * 🚀 DEPENDENCY OPTIMIZER - Performance Enhancement
 *
 * MISSION: Optimize script loading order and eliminate unnecessary dependencies
 * Reduces overall page load time by streamlining dependency chains
 */

(function() {
    'use strict';

    console.log('🚀 DEPENDENCY OPTIMIZER: Analyzing script loading sequence');

    // Performance tracking
    const performanceTracker = {
        startTime: performance.now(),
        scriptTimes: new Map(),
        dependencies: new Map()
    };

    /**
     * Script loading performance monitor
     */
    function monitorScriptLoading() {
        const scripts = document.querySelectorAll('script[src]');

        scripts.forEach(script => {
            const src = script.src;

            // Skip non-plugin scripts
            if (!src.includes('octo-print-designer') && !src.includes('octo-')) {
                return;
            }

            const startTime = performance.now();

            script.addEventListener('load', () => {
                const endTime = performance.now();
                const loadTime = endTime - startTime;

                const scriptName = src.split('/').pop().replace('.js', '');
                performanceTracker.scriptTimes.set(scriptName, loadTime);

                console.log(`📊 DEPENDENCY OPTIMIZER: ${scriptName} loaded in ${loadTime.toFixed(1)}ms`);
            });

            script.addEventListener('error', () => {
                const scriptName = src.split('/').pop().replace('.js', '');
                console.error(`❌ DEPENDENCY OPTIMIZER: ${scriptName} failed to load`);
            });
        });
    }

    /**
     * Dependency chain analyzer
     */
    function analyzeDependencyChain() {
        const scriptElements = Array.from(document.querySelectorAll('script[src]'));
        const pluginScripts = scriptElements.filter(s =>
            s.src.includes('octo-print-designer') || s.src.includes('octo-')
        );

        const analysis = {
            totalScripts: pluginScripts.length,
            criticalPath: [],
            parallelizable: [],
            redundant: []
        };

        // Identify critical path (scripts that block others)
        const criticalScripts = [
            'vendor.bundle.js',
            'webpack-fabric-loader-optimized.js',
            'optimized-canvas-detection.js',
            'optimized-ajax-manager.js'
        ];

        criticalScripts.forEach(script => {
            const element = pluginScripts.find(s => s.src.includes(script));
            if (element) {
                analysis.criticalPath.push(script);
            }
        });

        // Identify parallelizable scripts (independent functionality)
        const parallelizableScripts = [
            'fabric-debug-console.js',
            'race-condition-analyzer.js',
            'webpack-bundle-inspector.js',
            'canvas-detection-test.js'
        ];

        parallelizableScripts.forEach(script => {
            const element = pluginScripts.find(s => s.src.includes(script));
            if (element) {
                analysis.parallelizable.push(script);
            }
        });

        console.log('📊 DEPENDENCY ANALYSIS:', analysis);
        return analysis;
    }

    /**
     * Optimization recommendations
     */
    function generateOptimizationRecommendations() {
        const recommendations = [];

        // Check for jQuery dependencies that could be eliminated
        const jqueryDependentScripts = Array.from(document.querySelectorAll('script[src]'))
            .filter(s => s.src.includes('octo-') &&
                    (s.getAttribute('data-deps') || '').includes('jquery'));

        if (jqueryDependentScripts.length > 5) {
            recommendations.push({
                type: 'jQuery Reduction',
                priority: 'High',
                description: `${jqueryDependentScripts.length} scripts depend on jQuery - consider vanilla JS alternatives`,
                impact: 'Reduce bundle size and improve loading performance'
            });
        }

        // Check for debug scripts in production
        const debugScripts = Array.from(document.querySelectorAll('script[src]'))
            .filter(s => s.src.includes('debug') || s.src.includes('test'));

        if (debugScripts.length > 0 && !window.octoDebugMode) {
            recommendations.push({
                type: 'Debug Script Cleanup',
                priority: 'Medium',
                description: `${debugScripts.length} debug scripts loaded in production`,
                impact: 'Reduce HTTP requests and improve load times'
            });
        }

        // Check for redundant functionality
        const canvasScripts = Array.from(document.querySelectorAll('script[src]'))
            .filter(s => s.src.includes('canvas') && s.src.includes('octo-'));

        if (canvasScripts.length > 3) {
            recommendations.push({
                type: 'Canvas Script Consolidation',
                priority: 'Medium',
                description: `${canvasScripts.length} canvas-related scripts - consider consolidation`,
                impact: 'Reduce complexity and improve maintainability'
            });
        }

        console.log('💡 OPTIMIZATION RECOMMENDATIONS:', recommendations);
        return recommendations;
    }

    /**
     * Performance report generator
     */
    function generatePerformanceReport() {
        setTimeout(() => {
            const totalLoadTime = performance.now() - performanceTracker.startTime;
            const scriptCount = performanceTracker.scriptTimes.size;
            const averageScriptTime = Array.from(performanceTracker.scriptTimes.values())
                .reduce((sum, time) => sum + time, 0) / scriptCount;

            const report = {
                timestamp: new Date().toISOString(),
                totalLoadTime: totalLoadTime.toFixed(1) + 'ms',
                scriptsLoaded: scriptCount,
                averageScriptTime: averageScriptTime.toFixed(1) + 'ms',
                slowestScripts: Array.from(performanceTracker.scriptTimes.entries())
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5),
                recommendations: generateOptimizationRecommendations()
            };

            console.log('📊 PERFORMANCE REPORT:', report);

            // Store report for analysis
            if (window.localStorage) {
                const reports = JSON.parse(localStorage.getItem('octo-performance-reports') || '[]');
                reports.push(report);
                if (reports.length > 10) reports.shift(); // Keep only last 10 reports
                localStorage.setItem('octo-performance-reports', JSON.stringify(reports));
            }

            return report;
        }, 2000); // Wait 2 seconds for all scripts to load
    }

    /**
     * Dependency loading optimizer
     */
    function optimizeDependencyLoading() {
        // Preload critical resources
        const criticalResources = [
            'vendor.bundle.js',
            'admin.bundle.js',
            'webpack-fabric-loader-optimized.js'
        ];

        criticalResources.forEach(resource => {
            const existing = document.querySelector(`link[href*="${resource}"]`);
            if (!existing) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'script';
                link.href = window.octoDesignerAdmin?.pluginUrl + 'admin/js/' + resource;
                document.head.appendChild(link);
            }
        });

        // Remove loading="lazy" from critical scripts if present
        const criticalScripts = document.querySelectorAll('script[src*="vendor.bundle"], script[src*="admin.bundle"]');
        criticalScripts.forEach(script => {
            script.removeAttribute('loading');
        });
    }

    /**
     * Initialize optimization system
     */
    function initialize() {
        // Start performance monitoring
        monitorScriptLoading();

        // Optimize dependency loading
        optimizeDependencyLoading();

        // Analyze dependencies
        analyzeDependencyChain();

        // Generate performance report
        generatePerformanceReport();

        console.log('🚀 DEPENDENCY OPTIMIZER: Optimization complete');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Expose utilities for debugging
    window.dependencyOptimizer = {
        getPerformanceData: () => ({
            scriptTimes: Object.fromEntries(performanceTracker.scriptTimes),
            totalTime: performance.now() - performanceTracker.startTime
        }),
        generateReport: generatePerformanceReport,
        analyzeDependencies: analyzeDependencyChain
    };

    console.log('🚀 DEPENDENCY OPTIMIZER: System ready');

})();
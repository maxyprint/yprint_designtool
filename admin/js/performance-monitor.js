/**
 * HIVE MIND PERFORMANCE MONITOR
 * Tracks rendering performance after fixes
 */

class HiveMindPerformanceMonitor {
    constructor() {
        this.metrics = {
            renderStart: null,
            renderEnd: null,
            offsetDetectionTime: null,
            canvasScalingTime: null,
            totalRenderTime: null,
            fidelityScore: null
        };

        console.log('📊 HIVE MIND PERFORMANCE MONITOR: Initialized');
    }

    startRender() {
        this.metrics.renderStart = performance.now();
    }

    endRender() {
        this.metrics.renderEnd = performance.now();
        this.metrics.totalRenderTime = this.metrics.renderEnd - this.metrics.renderStart;
    }

    recordOffsetDetection(duration) {
        this.metrics.offsetDetectionTime = duration;
    }

    recordCanvasScaling(duration) {
        this.metrics.canvasScalingTime = duration;
    }

    recordFidelityScore(score) {
        this.metrics.fidelityScore = score;
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            performance: {
                totalRenderTime: `${this.metrics.totalRenderTime?.toFixed(2)}ms`,
                offsetDetectionTime: `${this.metrics.offsetDetectionTime?.toFixed(2)}ms`,
                canvasScalingTime: `${this.metrics.canvasScalingTime?.toFixed(2)}ms`
            },
            quality: {
                fidelityScore: this.metrics.fidelityScore,
                status: this.metrics.fidelityScore >= 95 ? 'EXCELLENT' :
                        this.metrics.fidelityScore >= 80 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
            },
            thresholds: {
                targetRenderTime: '< 200ms',
                targetFidelityScore: '>= 95',
                actualVsTarget: {
                    renderTime: this.metrics.totalRenderTime < 200 ? '✅ PASS' : '❌ FAIL',
                    fidelityScore: this.metrics.fidelityScore >= 95 ? '✅ PASS' : '❌ FAIL'
                }
            }
        };

        console.log('📊 HIVE MIND PERFORMANCE REPORT:', report);
        return report;
    }
}

// Make globally available
window.HiveMindPerformanceMonitor = HiveMindPerformanceMonitor;
window.hiveMindMonitor = new HiveMindPerformanceMonitor();

console.log('✅ HIVE MIND PERFORMANCE MONITOR: Ready');

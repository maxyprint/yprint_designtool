/**
 * 🎯 AGENT 5: COORDINATE AUDIT TRAIL CLASS
 * Comprehensive logging system that tracks EVERY coordinate transformation
 * in the rendering pipeline to identify where coordinates are lost/modified
 *
 * Usage:
 * const audit = new CoordinateAuditTrail(elementId, elementType);
 * audit.record('Input Data', { coordinates: {x: 100, y: 200} });
 * audit.recordTransformation('Legacy Correction', {x: 100, y: 200}, {x: 100, y: 280}, 'legacy_visual_correction');
 * console.log(audit.formatConsoleOutput(config));
 */
class CoordinateAuditTrail {
    constructor(elementId, elementType) {
        this.elementId = elementId;
        this.elementType = elementType;
        this.entries = [];
        this.startTime = performance.now();
        this.warnings = [];
        this.activeTransformations = 0;
    }

    /**
     * Record a transformation stage
     * @param {string} stage - Stage name (e.g., "Input Data", "Legacy Correction")
     * @param {Object} data - Transformation data
     * @param {Object} data.coordinates - Current coordinates {x, y}
     * @param {Object} data.transformation - Optional transformation metadata
     * @param {Object} data.metadata - Optional additional metadata
     */
    record(stage, data) {
        const entry = {
            stage: stage,
            timestamp: performance.now() - this.startTime,
            coordinates: { ...data.coordinates },
            transformation: data.transformation || null,
            metadata: data.metadata || {}
        };

        this.entries.push(entry);

        // Track active transformations (non-zero deltas)
        if (data.transformation && data.transformation.delta) {
            const magnitude = data.transformation.magnitude || 0;
            if (magnitude > 0.1) {
                this.activeTransformations++;
            }
        }

        return entry;
    }

    /**
     * Record transformation with before/after comparison
     * @param {string} stage - Stage name
     * @param {Object} before - Coordinates before transformation {x, y}
     * @param {Object} after - Coordinates after transformation {x, y}
     * @param {string} transformType - Type of transformation
     */
    recordTransformation(stage, before, after, transformType) {
        const deltaX = after.x - before.x;
        const deltaY = after.y - before.y;
        const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        this.record(stage, {
            coordinates: after,
            transformation: {
                type: transformType,
                delta: { x: deltaX, y: deltaY },
                magnitude: magnitude
            },
            metadata: { before, after }
        });

        return { deltaX, deltaY, magnitude };
    }

    /**
     * Detect anomalies based on configuration thresholds
     * @param {Object} config - Configuration with thresholds
     * @param {number} config.maxDeltaWarning - Alert if delta >X px in single step
     * @param {number} config.maxTotalMagnitude - Alert if total magnitude >X px
     * @param {number} config.maxTransformStages - Alert if >X active transformations
     */
    detectAnomalies(config) {
        const anomalies = [];

        // Check each transformation step for large deltas
        for (let i = 0; i < this.entries.length; i++) {
            const entry = this.entries[i];
            if (entry.transformation && entry.transformation.magnitude > config.maxDeltaWarning) {
                anomalies.push({
                    type: 'LARGE_DELTA',
                    stage: entry.stage,
                    magnitude: entry.transformation.magnitude.toFixed(2),
                    threshold: config.maxDeltaWarning,
                    message: `Single step delta exceeds ${config.maxDeltaWarning}px threshold`
                });
            }
        }

        // Check total magnitude from input to output
        if (this.entries.length >= 2) {
            const first = this.entries[0].coordinates;
            const last = this.entries[this.entries.length - 1].coordinates;
            const totalDeltaX = last.x - first.x;
            const totalDeltaY = last.y - first.y;
            const totalMagnitude = Math.sqrt(totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY);

            if (totalMagnitude > config.maxTotalMagnitude) {
                anomalies.push({
                    type: 'LARGE_TOTAL_MAGNITUDE',
                    totalMagnitude: totalMagnitude.toFixed(2),
                    threshold: config.maxTotalMagnitude,
                    message: `Total transformation magnitude exceeds ${config.maxTotalMagnitude}px threshold`
                });
            }
        }

        // Check for multiple correction layer syndrome
        if (this.activeTransformations > config.maxTransformStages) {
            anomalies.push({
                type: 'MULTIPLE_CORRECTION_SYNDROME',
                activeTransformations: this.activeTransformations,
                threshold: config.maxTransformStages,
                message: `Too many active transformations (${this.activeTransformations} > ${config.maxTransformStages}) - potential multiple correction layers`
            });
        }

        this.warnings = anomalies;
        return anomalies;
    }

    /**
     * Generate comprehensive audit report
     * @param {Object} config - Configuration for anomaly detection
     * @returns {Object} Complete audit report
     */
    getReport(config = null) {
        const totalTime = performance.now() - this.startTime;
        const finalCoordinates = this.entries.length > 0
            ? this.entries[this.entries.length - 1].coordinates
            : null;

        // Detect anomalies if config provided
        let anomalies = this.warnings;
        if (config && config.detectAnomalies) {
            anomalies = this.detectAnomalies(config);
        }

        return {
            elementId: this.elementId,
            elementType: this.elementType,
            totalStages: this.entries.length,
            totalTime: totalTime.toFixed(2) + 'ms',
            activeTransformations: this.activeTransformations,
            stages: this.entries,
            finalCoordinates: finalCoordinates,
            anomalies: anomalies,
            hasWarnings: anomalies.length > 0
        };
    }

    /**
     * Format report as console-friendly table
     * @param {Object} config - Configuration for anomaly detection
     * @returns {string} Formatted console output
     */
    formatConsoleOutput(config = null) {
        const report = this.getReport(config);
        const lines = [];

        lines.push('═══════════════════════════════════════════════════════');
        lines.push(`COORDINATE AUDIT TRAIL - ${this.elementType} #${this.elementId}`);
        lines.push('═══════════════════════════════════════════════════════');

        // Stage-by-stage breakdown
        for (let i = 0; i < report.stages.length; i++) {
            const stage = report.stages[i];
            const stageNum = i + 1;
            const coords = stage.coordinates;

            let line = `Stage ${stageNum} [${stage.timestamp.toFixed(1)}ms]: ${stage.stage.padEnd(25)} → (${coords.x.toFixed(1)}, ${coords.y.toFixed(1)})`;

            if (stage.transformation && stage.transformation.magnitude > 0.1) {
                const delta = stage.transformation.delta;
                const mag = stage.transformation.magnitude;
                const sign = delta.y >= 0 ? '+' : '';
                line += ` [Δ ${sign}${delta.y.toFixed(1)}px, mag: ${mag.toFixed(1)}px]`;

                // Add warning indicator for large deltas
                if (config && mag > config.maxDeltaWarning) {
                    line += ' ⚠️ LARGE DELTA!';
                }
            } else {
                line += ' [Δ 0px]';
            }

            lines.push(line);
        }

        lines.push('───────────────────────────────────────────────────────');

        // Summary
        if (report.stages.length >= 2) {
            const first = report.stages[0].coordinates;
            const last = report.stages[report.stages.length - 1].coordinates;
            const totalDeltaX = last.x - first.x;
            const totalDeltaY = last.y - first.y;
            const totalMag = Math.sqrt(totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY);

            const status = (config && totalMag > config.maxTotalMagnitude) ? '⚠️' : '✅';
            lines.push(`Total Magnitude: ${totalMag.toFixed(2)}px ${status}`);
            lines.push(`Active Transformations: ${report.activeTransformations}`);
        }

        // Anomalies
        if (report.hasWarnings) {
            lines.push('───────────────────────────────────────────────────────');
            lines.push('⚠️ ANOMALIES DETECTED:');
            for (const anomaly of report.anomalies) {
                lines.push(`   - [${anomaly.type}] ${anomaly.message}`);
            }
        }

        lines.push('═══════════════════════════════════════════════════════');

        return lines.join('\n');
    }
}

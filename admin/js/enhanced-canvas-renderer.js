/**
 * Enhanced Canvas Renderer for Measurement Visualization
 * Issue #22 Implementation: Visual feedback system with validation states
 *
 * Integrates with enhanced-measurement-interface.js to provide:
 * - Real-time measurement visualization
 * - Color-coded accuracy feedback
 * - Measurement labels and values
 * - Interactive visual guidance
 */

class EnhancedCanvasRenderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.measurementLines = [];
        this.previewLine = null;
        this.activePoints = [];
        this.colors = {
            excellent: '#28a745',
            good: '#17a2b8',
            acceptable: '#ffc107',
            needs_attention: '#dc3545',
            preview: '#6c757d'
        };

        // Visual settings
        this.lineWidth = 3;
        this.pointRadius = 6;
        this.labelFont = '12px Arial';
        this.valueFont = '14px Arial Bold';

        this.init();
    }

    /**
     * Initialize the enhanced renderer
     */
    init() {
        console.log('🎨 Enhanced Canvas Renderer: Initializing...');

        // Listen for measurement events
        document.addEventListener('measurementValidated', (e) => {
            this.onMeasurementValidated(e.detail);
        });

        document.addEventListener('measurementPreview', (e) => {
            this.showMeasurementPreview(e.detail);
        });

        document.addEventListener('measurementCleared', () => {
            this.clearMeasurements();
        });

        console.log('✅ Enhanced Canvas Renderer: Ready');
    }

    /**
     * Handle measurement validation and update visualization
     */
    onMeasurementValidated(data) {
        const { points, validation, measurementKey, measuredValue, expectedValue } = data;

        const measurementLine = {
            id: `measurement_${measurementKey}_${Date.now()}`,
            measurementKey: measurementKey,
            points: points,
            validation: validation,
            measuredValue: measuredValue,
            expectedValue: expectedValue,
            status: validation.status,
            accuracy: validation.accuracy,
            created: new Date()
        };

        // Add to measurement lines
        this.measurementLines.push(measurementLine);

        // Redraw canvas with new measurement
        this.redrawCanvas();

        console.log(`📏 Measurement visualization added: ${measurementKey} (${validation.status})`);
    }

    /**
     * Show measurement preview while user is selecting points
     */
    showMeasurementPreview(data) {
        const { points, measurementKey, currentDistance } = data;

        this.previewLine = {
            points: points,
            measurementKey: measurementKey,
            currentDistance: currentDistance,
            isPreview: true
        };

        this.activePoints = points;
        this.redrawCanvas();
    }

    /**
     * Clear all measurements from visualization
     */
    clearMeasurements() {
        this.measurementLines = [];
        this.previewLine = null;
        this.activePoints = [];
        this.redrawCanvas();

        console.log('🧹 Canvas measurements cleared');
    }

    /**
     * Redraw the entire canvas with all visualizations
     */
    redrawCanvas() {
        // Don't interfere with base canvas drawing - just add overlays
        this.drawMeasurementOverlays();
    }

    /**
     * Draw measurement overlays on top of existing canvas content
     */
    drawMeasurementOverlays() {
        this.ctx.save();

        // Draw completed measurements
        this.measurementLines.forEach(line => {
            this.drawMeasurementLine(line);
        });

        // Draw preview line if active
        if (this.previewLine) {
            this.drawPreviewLine(this.previewLine);
        }

        // Draw active points
        this.activePoints.forEach(point => {
            this.drawActivePoint(point);
        });

        this.ctx.restore();
    }

    /**
     * Draw a completed measurement line with validation feedback
     */
    drawMeasurementLine(line) {
        const { points, status, measurementKey, measuredValue, accuracy } = line;

        if (points.length < 2) return;

        const [start, end] = points;
        const color = this.colors[status] || this.colors.needs_attention;

        // Draw the line
        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.setLineDash(status === 'needs_attention' ? [8, 4] : []);

        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.stroke();

        // Draw endpoints
        this.drawPoint(start, color);
        this.drawPoint(end, color);

        // Draw measurement label
        this.drawMeasurementLabel(start, end, measurementKey, measuredValue, accuracy, color);

        this.ctx.restore();
    }

    /**
     * Draw preview line while user is selecting points
     */
    drawPreviewLine(previewLine) {
        const { points, measurementKey, currentDistance } = previewLine;

        if (points.length < 2) return;

        const [start, end] = points;
        const color = this.colors.preview;

        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);

        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.stroke();

        // Draw preview label
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;

        this.ctx.fillStyle = color;
        this.ctx.font = this.labelFont;
        this.ctx.fillText(`${measurementKey} (${currentDistance.toFixed(1)}px)`, midX + 10, midY - 10);

        this.ctx.restore();
    }

    /**
     * Draw a point (endpoint of measurement line)
     */
    drawPoint(point, color) {
        this.ctx.save();

        // Outer circle (white background)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, this.pointRadius + 2, 0, 2 * Math.PI);
        this.ctx.fill();

        // Inner circle (colored)
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, this.pointRadius, 0, 2 * Math.PI);
        this.ctx.fill();

        // Border
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, this.pointRadius + 2, 0, 2 * Math.PI);
        this.ctx.stroke();

        this.ctx.restore();
    }

    /**
     * Draw an active point during selection
     */
    drawActivePoint(point) {
        this.ctx.save();

        // Pulsing effect for active points
        const pulseRadius = this.pointRadius + Math.sin(Date.now() / 300) * 2;

        // Outer glow
        this.ctx.fillStyle = 'rgba(0, 123, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, pulseRadius + 4, 0, 2 * Math.PI);
        this.ctx.fill();

        // Main point
        this.ctx.fillStyle = '#007cba';
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, this.pointRadius, 0, 2 * Math.PI);
        this.ctx.fill();

        // White center
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        this.ctx.fill();

        this.ctx.restore();
    }

    /**
     * Draw measurement label with value and accuracy
     */
    drawMeasurementLabel(start, end, measurementKey, measuredValue, accuracy, color) {
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;

        // Calculate label position to avoid line overlap
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const normalX = -dy / length;
        const normalY = dx / length;

        const labelX = midX + normalX * 25;
        const labelY = midY + normalY * 25;

        this.ctx.save();

        // Draw label background
        const labelText = `${measurementKey}: ${measuredValue}cm`;
        const accuracyText = `${accuracy.toFixed(1)}%`;

        this.ctx.font = this.labelFont;
        const labelMetrics = this.ctx.measureText(labelText);
        const accuracyMetrics = this.ctx.measureText(accuracyText);
        const maxWidth = Math.max(labelMetrics.width, accuracyMetrics.width);

        // Background rectangle
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(labelX - 5, labelY - 20, maxWidth + 10, 35);

        // Border
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(labelX - 5, labelY - 20, maxWidth + 10, 35);

        // Measurement text
        this.ctx.fillStyle = '#333333';
        this.ctx.font = this.valueFont;
        this.ctx.fillText(labelText, labelX, labelY - 5);

        // Accuracy text
        this.ctx.fillStyle = color;
        this.ctx.font = this.labelFont;
        this.ctx.fillText(accuracyText, labelX, labelY + 10);

        this.ctx.restore();
    }

    /**
     * Add measurement line to visualization
     */
    addMeasurementLine(measurementData) {
        this.onMeasurementValidated(measurementData);
    }

    /**
     * Remove measurement line from visualization
     */
    removeMeasurementLine(measurementId) {
        this.measurementLines = this.measurementLines.filter(line => line.id !== measurementId);
        this.redrawCanvas();

        console.log(`🗑️ Measurement line removed: ${measurementId}`);
    }

    /**
     * Update measurement line status (for re-validation)
     */
    updateMeasurementStatus(measurementId, newValidation) {
        const line = this.measurementLines.find(line => line.id === measurementId);
        if (line) {
            line.validation = newValidation;
            line.status = newValidation.status;
            line.accuracy = newValidation.accuracy;
            this.redrawCanvas();

            console.log(`🔄 Measurement status updated: ${measurementId} -> ${newValidation.status}`);
        }
    }

    /**
     * Highlight specific measurement line
     */
    highlightMeasurement(measurementKey) {
        // Add pulsing effect or different styling to specific measurement
        const lines = this.measurementLines.filter(line => line.measurementKey === measurementKey);

        lines.forEach(line => {
            line.highlighted = true;
        });

        this.redrawCanvas();

        // Remove highlight after 2 seconds
        setTimeout(() => {
            lines.forEach(line => {
                line.highlighted = false;
            });
            this.redrawCanvas();
        }, 2000);
    }

    /**
     * Get measurements data for export/analysis
     */
    getMeasurementsData() {
        return this.measurementLines.map(line => ({
            id: line.id,
            measurementKey: line.measurementKey,
            points: line.points,
            measuredValue: line.measuredValue,
            expectedValue: line.expectedValue,
            accuracy: line.accuracy,
            status: line.status,
            created: line.created
        }));
    }

    /**
     * Import measurements data (for loading existing measurements)
     */
    importMeasurementsData(measurementsData) {
        this.measurementLines = measurementsData.map(data => ({
            ...data,
            validation: {
                status: data.status,
                accuracy: data.accuracy
            }
        }));

        this.redrawCanvas();

        console.log(`📥 Imported ${measurementsData.length} measurements`);
    }

    /**
     * Clear specific measurement type
     */
    clearMeasurementType(measurementKey) {
        const beforeCount = this.measurementLines.length;
        this.measurementLines = this.measurementLines.filter(line => line.measurementKey !== measurementKey);
        const afterCount = this.measurementLines.length;

        this.redrawCanvas();

        console.log(`🧹 Cleared ${beforeCount - afterCount} measurements of type ${measurementKey}`);
    }

    /**
     * Get canvas as image (for export/documentation)
     */
    exportCanvasImage() {
        return this.canvas.toDataURL('image/png');
    }
}

// Integration with existing canvas system
function initializeEnhancedCanvasRenderer() {
    const canvas = document.getElementById('template-canvas');
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const renderer = new EnhancedCanvasRenderer(canvas, ctx);

    // Make available globally for integration
    window.enhancedCanvasRenderer = renderer;

    console.log('✅ Enhanced Canvas Renderer initialized and ready');
    return renderer;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancedCanvasRenderer);
} else {
    initializeEnhancedCanvasRenderer();
}
/**
 * 🎯 AGENT 4: MEASUREMENT VALIDATION ENGINE
 * Issue #22 Enhancement: Real-time accuracy validation system
 *
 * Provides comprehensive validation for measurement accuracy, point selection quality,
 * and measurement definition workflow with intelligent feedback and guidance.
 */

class MeasurementValidationEngine {
    constructor() {
        this.validationRules = {};
        this.accuracyThresholds = {
            excellent: 95,
            good: 90,
            acceptable: 80,
            poor: 60
        };
        this.validationHistory = [];

        console.log('🎯 AGENT 4: MeasurementValidationEngine initialized');
        this.initializeValidationRules();
    }

    /**
     * 🔧 Initialize Validation Rules
     */
    initializeValidationRules() {
        console.log('🔧 AGENT 4: Initializing validation rules...');

        // Measurement-specific validation rules
        this.validationRules = {
            'A': { // Chest
                category: 'horizontal',
                minLength: 30,
                maxLength: 80,
                optimalTolerance: 0.05, // 5% tolerance
                pointGuidance: 'Select points at the widest part of the chest area'
            },
            'B': { // Hem Width
                category: 'horizontal',
                minLength: 25,
                maxLength: 70,
                optimalTolerance: 0.05,
                pointGuidance: 'Select points at the bottom edge of the garment'
            },
            'C': { // Height from Shoulder
                category: 'vertical',
                minLength: 40,
                maxLength: 90,
                optimalTolerance: 0.03,
                pointGuidance: 'Select from shoulder seam to bottom edge'
            },
            'D': { // Sleeve Length
                category: 'vertical',
                minLength: 15,
                maxLength: 35,
                optimalTolerance: 0.05,
                pointGuidance: 'Select from shoulder to sleeve end'
            },
            'E': { // Sleeve Opening
                category: 'horizontal',
                minLength: 8,
                maxLength: 20,
                optimalTolerance: 0.08,
                pointGuidance: 'Select across sleeve opening width'
            },
            'F': { // Shoulder to Shoulder
                category: 'horizontal',
                minLength: 30,
                maxLength: 60,
                optimalTolerance: 0.04,
                pointGuidance: 'Select between shoulder seam points'
            },
            'G': { // Neck Opening
                category: 'circular',
                minLength: 12,
                maxLength: 25,
                optimalTolerance: 0.1,
                pointGuidance: 'Measure across neck opening diameter'
            },
            'H': { // Biceps
                category: 'circular',
                minLength: 20,
                maxLength: 45,
                optimalTolerance: 0.06,
                pointGuidance: 'Measure across bicep area width'
            },
            'J': { // Rib Height
                category: 'vertical',
                minLength: 10,
                maxLength: 25,
                optimalTolerance: 0.08,
                pointGuidance: 'Select from bottom to rib area'
            }
        };

        console.log(`✅ AGENT 4: Loaded ${Object.keys(this.validationRules).length} validation rules`);
    }

    /**
     * 📐 Validate Measurement Accuracy
     */
    validateMeasurementAccuracy(measurementData) {
        console.log(`📐 AGENT 4: Validating measurement accuracy for ${measurementData.measurement_key}...`);

        const validation = {
            measurement_key: measurementData.measurement_key,
            timestamp: Date.now(),
            checks: {},
            overall_score: 0,
            status: 'unknown',
            recommendations: [],
            warnings: [],
            errors: []
        };

        // Get validation rule for this measurement
        const rule = this.validationRules[measurementData.measurement_key];
        if (!rule) {
            validation.warnings.push('No specific validation rule found for this measurement type');
            console.warn(`⚠️ AGENT 4: No validation rule for ${measurementData.measurement_key}`);
        }

        // 1. Target Value Accuracy Check
        const accuracyCheck = this.validateTargetAccuracy(measurementData, rule);
        validation.checks.target_accuracy = accuracyCheck;

        // 2. Measurement Range Check
        const rangeCheck = this.validateMeasurementRange(measurementData, rule);
        validation.checks.range_validation = rangeCheck;

        // 3. Point Selection Quality Check
        const pointCheck = this.validatePointSelection(measurementData, rule);
        validation.checks.point_quality = pointCheck;

        // 4. Geometric Validation
        const geometryCheck = this.validateGeometry(measurementData, rule);
        validation.checks.geometry = geometryCheck;

        // Calculate overall score
        validation.overall_score = this.calculateOverallScore(validation.checks);
        validation.status = this.getValidationStatus(validation.overall_score);

        // Generate recommendations
        validation.recommendations = this.generateRecommendations(validation.checks, rule);

        // Store in history
        this.validationHistory.push(validation);

        console.log(`📊 AGENT 4: Validation completed - Score: ${validation.overall_score}% (${validation.status})`);
        return validation;
    }

    /**
     * 🎯 Validate Target Accuracy
     */
    validateTargetAccuracy(measurementData, rule) {
        const check = {
            name: 'Target Value Accuracy',
            passed: false,
            score: 0,
            details: {}
        };

        if (measurementData.target_value && measurementData.measured_length) {
            const difference = Math.abs(measurementData.measured_length - measurementData.target_value);
            const percentageDifference = (difference / measurementData.target_value) * 100;
            const accuracy = Math.max(0, 100 - percentageDifference);

            check.score = Math.round(accuracy);
            check.passed = accuracy >= this.accuracyThresholds.acceptable;
            check.details = {
                target_value: measurementData.target_value,
                measured_value: measurementData.measured_length,
                difference: Math.round(difference * 10) / 10,
                percentage_difference: Math.round(percentageDifference * 10) / 10,
                accuracy_percentage: Math.round(accuracy * 10) / 10
            };

        } else {
            check.details.error = 'Missing target value or measured length';
        }

        return check;
    }

    /**
     * 📏 Validate Measurement Range
     */
    validateMeasurementRange(measurementData, rule) {
        const check = {
            name: 'Measurement Range',
            passed: false,
            score: 0,
            details: {}
        };

        if (rule && measurementData.measured_length) {
            const value = measurementData.measured_length;
            const inRange = value >= rule.minLength && value <= rule.maxLength;

            check.passed = inRange;
            check.score = inRange ? 100 : 50;
            check.details = {
                measured_value: value,
                min_expected: rule.minLength,
                max_expected: rule.maxLength,
                in_range: inRange
            };

            if (!inRange) {
                if (value < rule.minLength) {
                    check.details.issue = 'Measurement too small - check point selection';
                } else {
                    check.details.issue = 'Measurement too large - check point selection';
                }
            }

        } else {
            check.details.error = 'Missing measurement rule or value';
            check.score = 50;
        }

        return check;
    }

    /**
     * 📍 Validate Point Selection Quality
     */
    validatePointSelection(measurementData, rule) {
        const check = {
            name: 'Point Selection Quality',
            passed: false,
            score: 0,
            details: {}
        };

        if (measurementData.start && measurementData.end) {
            const point1 = measurementData.start;
            const point2 = measurementData.end;

            // Calculate distance between points
            const distance = Math.sqrt(
                Math.pow(point2.x - point1.x, 2) +
                Math.pow(point2.y - point1.y, 2)
            );

            // Validate minimum distance (prevents accidental double-clicks)
            const minDistance = 20; // pixels
            const hasMinDistance = distance >= minDistance;

            // Check alignment based on measurement category
            let alignmentScore = 100;
            if (rule) {
                alignmentScore = this.validatePointAlignment(point1, point2, rule.category);
            }

            // Calculate point quality score
            const distanceScore = hasMinDistance ? 100 : (distance / minDistance) * 100;
            const overallScore = Math.min(distanceScore, alignmentScore);

            check.score = Math.round(overallScore);
            check.passed = overallScore >= 70;
            check.details = {
                point1: point1,
                point2: point2,
                distance_px: Math.round(distance),
                min_distance_met: hasMinDistance,
                alignment_score: Math.round(alignmentScore),
                category: rule?.category || 'unknown'
            };

            if (!hasMinDistance) {
                check.details.issue = 'Points too close together';
            } else if (alignmentScore < 70) {
                check.details.issue = 'Points not well aligned for this measurement type';
            }

        } else {
            check.details.error = 'Missing point coordinates';
        }

        return check;
    }

    /**
     * 🔄 Validate Point Alignment
     */
    validatePointAlignment(point1, point2, category) {
        const dx = Math.abs(point2.x - point1.x);
        const dy = Math.abs(point2.y - point1.y);

        switch (category) {
            case 'horizontal':
                // For horizontal measurements, dy should be small relative to dx
                const horizontalRatio = dx / (dy + 1); // +1 to avoid division by zero
                return Math.min(100, horizontalRatio * 10);

            case 'vertical':
                // For vertical measurements, dx should be small relative to dy
                const verticalRatio = dy / (dx + 1);
                return Math.min(100, verticalRatio * 10);

            case 'circular':
                // For circular measurements, allow any alignment
                return 100;

            default:
                return 80; // Neutral score for unknown categories
        }
    }

    /**
     * 📐 Validate Geometry
     */
    validateGeometry(measurementData, rule) {
        const check = {
            name: 'Geometric Validation',
            passed: false,
            score: 80, // Default neutral score
            details: {}
        };

        // For now, basic geometric validation
        // Could be enhanced with canvas boundary checks, template-specific validations, etc.

        if (measurementData.start && measurementData.end) {
            const point1 = measurementData.start;
            const point2 = measurementData.end;

            // Check if points are within reasonable canvas bounds (assuming 0-800x600 canvas)
            const withinBounds =
                point1.x >= 0 && point1.x <= 800 &&
                point1.y >= 0 && point1.y <= 600 &&
                point2.x >= 0 && point2.x <= 800 &&
                point2.y >= 0 && point2.y <= 600;

            check.passed = withinBounds;
            check.score = withinBounds ? 100 : 50;
            check.details = {
                point1_in_bounds: point1.x >= 0 && point1.x <= 800 && point1.y >= 0 && point1.y <= 600,
                point2_in_bounds: point2.x >= 0 && point2.x <= 800 && point2.y >= 0 && point2.y <= 600,
                canvas_bounds: '800x600'
            };

            if (!withinBounds) {
                check.details.issue = 'One or both points are outside canvas bounds';
            }
        }

        return check;
    }

    /**
     * 📊 Calculate Overall Score
     */
    calculateOverallScore(checks) {
        const weights = {
            target_accuracy: 0.4,    // 40% - most important
            range_validation: 0.25,  // 25% - important for sanity
            point_quality: 0.25,     // 25% - important for user experience
            geometry: 0.1            // 10% - basic validation
        };

        let weightedSum = 0;
        let totalWeight = 0;

        Object.keys(checks).forEach(checkName => {
            const check = checks[checkName];
            const weight = weights[checkName] || 0.1;

            if (check && typeof check.score === 'number') {
                weightedSum += check.score * weight;
                totalWeight += weight;
            }
        });

        return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    }

    /**
     * 📋 Get Validation Status
     */
    getValidationStatus(score) {
        if (score >= this.accuracyThresholds.excellent) {
            return 'excellent';
        } else if (score >= this.accuracyThresholds.good) {
            return 'good';
        } else if (score >= this.accuracyThresholds.acceptable) {
            return 'acceptable';
        } else if (score >= this.accuracyThresholds.poor) {
            return 'poor';
        } else {
            return 'critical';
        }
    }

    /**
     * 💡 Generate Recommendations
     */
    generateRecommendations(checks, rule) {
        const recommendations = [];

        // Target accuracy recommendations
        if (checks.target_accuracy && checks.target_accuracy.score < 90) {
            if (checks.target_accuracy.details.percentage_difference > 10) {
                recommendations.push({
                    type: 'accuracy',
                    priority: 'high',
                    message: 'Large difference from target value - double-check point placement',
                    suggestion: rule?.pointGuidance || 'Ensure points are placed at the correct measurement locations'
                });
            } else {
                recommendations.push({
                    type: 'accuracy',
                    priority: 'medium',
                    message: 'Minor accuracy improvement possible',
                    suggestion: 'Fine-tune point placement for better precision'
                });
            }
        }

        // Range validation recommendations
        if (checks.range_validation && !checks.range_validation.passed) {
            recommendations.push({
                type: 'range',
                priority: 'high',
                message: checks.range_validation.details.issue || 'Measurement outside expected range',
                suggestion: 'Verify point selection matches the intended measurement area'
            });
        }

        // Point quality recommendations
        if (checks.point_quality && checks.point_quality.score < 80) {
            recommendations.push({
                type: 'points',
                priority: 'medium',
                message: checks.point_quality.details.issue || 'Point selection could be improved',
                suggestion: rule?.pointGuidance || 'Ensure points are clearly defined and appropriate for the measurement'
            });
        }

        return recommendations;
    }

    /**
     * 🎨 Get Visual Feedback for UI
     */
    getVisualFeedback(validationResult) {
        const feedback = {
            color: '#666666',
            icon: '?',
            class: 'neutral',
            message: 'Unknown validation status'
        };

        switch (validationResult.status) {
            case 'excellent':
                feedback.color = '#00a32a';
                feedback.icon = '✓';
                feedback.class = 'excellent';
                feedback.message = 'Excellent measurement accuracy!';
                break;

            case 'good':
                feedback.color = '#007cba';
                feedback.icon = '✓';
                feedback.class = 'good';
                feedback.message = 'Good measurement - ready to save';
                break;

            case 'acceptable':
                feedback.color = '#dba617';
                feedback.icon = '⚠';
                feedback.class = 'acceptable';
                feedback.message = 'Acceptable accuracy - consider refinement';
                break;

            case 'poor':
                feedback.color = '#d63638';
                feedback.icon = '⚠';
                feedback.class = 'poor';
                feedback.message = 'Poor accuracy - adjustment recommended';
                break;

            case 'critical':
                feedback.color = '#d63638';
                feedback.icon = '✗';
                feedback.class = 'critical';
                feedback.message = 'Critical issues - please adjust points';
                break;
        }

        return feedback;
    }

    /**
     * 📊 Get Validation Statistics
     */
    getValidationStats() {
        if (this.validationHistory.length === 0) {
            return { message: 'No validation data available' };
        }

        const stats = {
            total_validations: this.validationHistory.length,
            average_score: 0,
            status_distribution: {},
            recent_validations: this.validationHistory.slice(-5)
        };

        // Calculate averages
        let totalScore = 0;
        this.validationHistory.forEach(validation => {
            totalScore += validation.overall_score;

            const status = validation.status;
            stats.status_distribution[status] = (stats.status_distribution[status] || 0) + 1;
        });

        stats.average_score = Math.round(totalScore / this.validationHistory.length);

        return stats;
    }

    /**
     * 🧪 Test Validation Engine
     */
    testValidationEngine() {
        console.log('🧪 AGENT 4: Testing validation engine...');

        // Test measurement data
        const testMeasurement = {
            measurement_key: 'A',
            measured_length: 52.3,
            target_value: 52.5,
            start: { x: 100, y: 200 },
            end: { x: 300, y: 205 }
        };

        const validation = this.validateMeasurementAccuracy(testMeasurement);
        console.log('📊 AGENT 4: Test validation result:', validation);

        return validation;
    }
}

// Initialize validation engine when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 AGENT 4: DOM ready - initializing validation engine...');

    // Create global instance
    window.measurementValidationEngine = new MeasurementValidationEngine();

    // Wait for measurement definition system and integrate
    const checkIntegration = setInterval(() => {
        if (window.measurementDefinitionSystem) {
            console.log('✅ AGENT 4: Integrating with measurement definition system...');

            // Enhance measurement calculation with validation
            const originalCalculate = window.measurementDefinitionSystem.calculateMeasurement;

            window.measurementDefinitionSystem.calculateMeasurement = function() {
                // Run original calculation
                originalCalculate.call(this);

                // Run validation
                const measurementData = {
                    measurement_key: this.selectedMeasurementType,
                    measured_length: this.measuredLength,
                    target_value: this.targetValue,
                    start: this.selectedPoints[0],
                    end: this.selectedPoints[1],
                    lengthPx: Math.sqrt(
                        Math.pow(this.selectedPoints[1].x - this.selectedPoints[0].x, 2) +
                        Math.pow(this.selectedPoints[1].y - this.selectedPoints[0].y, 2)
                    )
                };

                const validation = window.measurementValidationEngine.validateMeasurementAccuracy(measurementData);

                // Store validation result
                this.validationResult = validation;

                // Update UI with enhanced validation feedback
                this.updateValidationDisplayWithEnhancedFeedback(validation);

                console.log(`📊 AGENT 4: Enhanced validation - Score: ${validation.overall_score}% (${validation.status})`);
            };

            // Add enhanced validation display method
            window.measurementDefinitionSystem.updateValidationDisplayWithEnhancedFeedback = function(validation) {
                // Call original display update
                if (this.updateValidationDisplay) {
                    this.updateValidationDisplay();
                }

                // Add enhanced feedback
                const feedback = window.measurementValidationEngine.getVisualFeedback(validation);

                const accuracyStatusElement = document.querySelector('.accuracy-status');
                const validationMessageElement = document.querySelector('.validation-message');

                if (accuracyStatusElement) {
                    accuracyStatusElement.style.color = feedback.color;
                    accuracyStatusElement.className = `accuracy-status ${feedback.class}`;
                }

                if (validationMessageElement) {
                    validationMessageElement.textContent = feedback.message;

                    // Add recommendations
                    if (validation.recommendations.length > 0) {
                        const highPriorityRecs = validation.recommendations.filter(r => r.priority === 'high');
                        if (highPriorityRecs.length > 0) {
                            validationMessageElement.textContent += ` ${highPriorityRecs[0].suggestion}`;
                        }
                    }
                }
            };

            console.log('🔗 AGENT 4: Validation integration complete');
            clearInterval(checkIntegration);
        }
    }, 1000);

    // Timeout after 30 seconds
    setTimeout(() => {
        clearInterval(checkIntegration);
    }, 30000);
});

console.log('🎯 AGENT 4: MeasurementValidationEngine class loaded');
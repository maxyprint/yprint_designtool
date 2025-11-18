/**
 * 🎯 AGENT 6: MEASUREMENT FUTURE-PROOFING SYSTEM
 * Issue #22 Enhancement: Dynamic template support for "zukünftig neue Produkte"
 *
 * Provides intelligent template analysis, measurement area detection, and
 * standardized workflows that work across different product types automatically.
 */

class MeasurementFutureProofingSystem {
    constructor() {
        this.templateAnalyzer = null;
        this.measurementPatterns = {};
        this.templateProfiles = {};
        this.adaptationRules = {};

        console.log('🎯 AGENT 6: MeasurementFutureProofingSystem initialized');
        this.initializeFutureProofing();
    }

    /**
     * 🚀 Initialize Future-Proofing System
     */
    initializeFutureProofing() {
        console.log('🚀 AGENT 6: Initializing future-proofing capabilities...');

        // Initialize template analysis patterns
        this.initializeMeasurementPatterns();

        // Setup template adaptation rules
        this.initializeAdaptationRules();

        // Initialize template profile detection
        this.initializeTemplateProfiles();

        console.log('✅ AGENT 6: Future-proofing system initialized');
    }

    /**
     * 🎨 Initialize Measurement Patterns
     */
    initializeMeasurementPatterns() {
        console.log('🎨 AGENT 6: Initializing measurement patterns...');

        // Universal measurement patterns that work across product types
        this.measurementPatterns = {
            'chest_area': {
                description: 'Horizontal measurement across chest/bust area',
                detectionHints: ['widest horizontal area in upper portion', 'chest level', 'bust line'],
                categories: ['shirt', 'dress', 'jacket', 'top'],
                measurements: ['A', 'chest', 'bust'],
                yRange: [0.2, 0.6], // 20% to 60% from top
                xExpected: 'full_width'
            },
            'hem_area': {
                description: 'Horizontal measurement at bottom edge',
                detectionHints: ['bottom edge', 'hem line', 'lower boundary'],
                categories: ['shirt', 'dress', 'pants', 'skirt'],
                measurements: ['B', 'hem', 'bottom_width'],
                yRange: [0.8, 1.0], // 80% to 100% from top
                xExpected: 'full_width'
            },
            'height_area': {
                description: 'Vertical measurement from top to bottom',
                detectionHints: ['shoulder line', 'neckline', 'top edge', 'total length'],
                categories: ['shirt', 'dress', 'jacket', 'pants'],
                measurements: ['C', 'height', 'length', 'total_length'],
                xRange: [0.3, 0.7], // 30% to 70% from left
                yExpected: 'full_height'
            },
            'sleeve_area': {
                description: 'Sleeve-related measurements',
                detectionHints: ['arm area', 'sleeve', 'shoulder extension'],
                categories: ['shirt', 'jacket', 'sweater'],
                measurements: ['D', 'E', 'sleeve_length', 'sleeve_width'],
                xRange: [0.7, 1.0], // 70% to 100% from left (or 0.0 to 0.3 for left sleeve)
                yRange: [0.1, 0.7]
            },
            'shoulder_area': {
                description: 'Shoulder-to-shoulder measurement',
                detectionHints: ['shoulder line', 'shoulder seam', 'shoulder point'],
                categories: ['shirt', 'jacket', 'dress', 'top'],
                measurements: ['F', 'shoulder', 'shoulder_width'],
                yRange: [0.0, 0.3], // 0% to 30% from top
                xExpected: 'shoulder_points'
            },
            'neckline_area': {
                description: 'Neck opening measurement',
                detectionHints: ['neckline', 'collar area', 'neck opening'],
                categories: ['shirt', 'dress', 'top'],
                measurements: ['G', 'neck', 'collar'],
                yRange: [0.0, 0.2], // 0% to 20% from top
                xRange: [0.3, 0.7]
            }
        };

        console.log(`✅ AGENT 6: Loaded ${Object.keys(this.measurementPatterns).length} measurement patterns`);
    }

    /**
     * 🔧 Initialize Adaptation Rules
     */
    initializeAdaptationRules() {
        console.log('🔧 AGENT 6: Initializing adaptation rules...');

        this.adaptationRules = {
            'auto_detect_product_type': {
                enabled: true,
                confidence_threshold: 0.7,
                fallback_to_generic: true
            },
            'suggest_measurement_areas': {
                enabled: true,
                max_suggestions: 6,
                confidence_threshold: 0.6
            },
            'adapt_measurement_labels': {
                enabled: true,
                use_generic_fallback: true,
                localization_support: true
            },
            'scale_aware_positioning': {
                enabled: true,
                auto_calculate_scale: true,
                template_size_detection: true
            },
            'cross_template_compatibility': {
                enabled: true,
                measurement_mapping: true,
                legacy_support: true
            }
        };

        console.log('✅ AGENT 6: Adaptation rules configured');
    }

    /**
     * 📋 Initialize Template Profiles
     */
    initializeTemplateProfiles() {
        console.log('📋 AGENT 6: Initializing template profiles...');

        // Predefined profiles for common product types
        this.templateProfiles = {
            'shirt': {
                name: 'Shirt/T-Shirt',
                measurements: ['A', 'B', 'C', 'D', 'E', 'F'],
                priority_measurements: ['A', 'C'],
                typical_ratios: {
                    'chest_to_height': 0.75,
                    'shoulder_to_chest': 0.85
                }
            },
            'dress': {
                name: 'Dress',
                measurements: ['A', 'B', 'C', 'F', 'G'],
                priority_measurements: ['A', 'C', 'B'],
                typical_ratios: {
                    'chest_to_height': 0.4,
                    'hem_to_chest': 1.1
                }
            },
            'jacket': {
                name: 'Jacket/Blazer',
                measurements: ['A', 'C', 'D', 'F', 'H'],
                priority_measurements: ['A', 'F', 'C'],
                typical_ratios: {
                    'chest_to_shoulder': 1.15,
                    'chest_to_height': 0.65
                }
            },
            'pants': {
                name: 'Pants/Trousers',
                measurements: ['B', 'C', 'J'],
                priority_measurements: ['C', 'B'],
                typical_ratios: {
                    'waist_to_length': 0.35
                }
            },
            'generic': {
                name: 'Generic Garment',
                measurements: ['A', 'B', 'C'],
                priority_measurements: ['A', 'C'],
                typical_ratios: {}
            }
        };

        console.log(`✅ AGENT 6: Loaded ${Object.keys(this.templateProfiles).length} template profiles`);
    }

    /**
     * 🔍 Analyze Template for Product Type
     */
    async analyzeTemplate(templateData) {
        console.log('🔍 AGENT 6: Analyzing template for product type...');

        const analysis = {
            template_id: templateData.id || 'unknown',
            detected_type: 'generic',
            confidence: 0.5,
            suggested_measurements: [],
            measurement_areas: {},
            scaling_info: {},
            analysis_timestamp: Date.now()
        };

        try {
            // Analyze template dimensions and content
            if (templateData.views && templateData.views.length > 0) {
                analysis.scaling_info = this.analyzeTemplateScaling(templateData.views[0]);
            }

            // Detect product type from various sources
            analysis.detected_type = this.detectProductType(templateData);
            analysis.confidence = this.calculateDetectionConfidence(templateData, analysis.detected_type);

            // Generate measurement suggestions
            analysis.suggested_measurements = this.generateMeasurementSuggestions(analysis.detected_type);

            // Analyze potential measurement areas
            analysis.measurement_areas = this.analyzeMeasurementAreas(templateData, analysis.detected_type);

            console.log(`🔍 AGENT 6: Analysis complete - Type: ${analysis.detected_type} (${(analysis.confidence * 100).toFixed(1)}% confidence)`);

        } catch (error) {
            console.error('❌ AGENT 6: Template analysis failed:', error);
            analysis.error = error.message;
        }

        return analysis;
    }

    /**
     * 🎯 Detect Product Type
     */
    detectProductType(templateData) {
        console.log('🎯 AGENT 6: Detecting product type...');

        const indicators = {
            shirt: 0,
            dress: 0,
            jacket: 0,
            pants: 0,
            generic: 0.3 // Base score for generic
        };

        // Analyze template name/title
        const name = (templateData.name || templateData.title || '').toLowerCase();
        const nameKeywords = {
            shirt: ['shirt', 't-shirt', 'tshirt', 'top', 'tee'],
            dress: ['dress', 'kleid', 'robe'],
            jacket: ['jacket', 'blazer', 'coat', 'jacke'],
            pants: ['pants', 'trousers', 'jeans', 'hose']
        };

        Object.keys(nameKeywords).forEach(type => {
            nameKeywords[type].forEach(keyword => {
                if (name.includes(keyword)) {
                    indicators[type] += 0.4;
                }
            });
        });

        // Analyze template categories/tags
        if (templateData.categories) {
            templateData.categories.forEach(category => {
                const catLower = category.toLowerCase();
                Object.keys(nameKeywords).forEach(type => {
                    if (nameKeywords[type].some(keyword => catLower.includes(keyword))) {
                        indicators[type] += 0.3;
                    }
                });
            });
        }

        // Analyze template dimensions (aspect ratio clues)
        if (templateData.views && templateData.views.length > 0) {
            const view = templateData.views[0];
            if (view.width && view.height) {
                const aspectRatio = view.width / view.height;

                if (aspectRatio > 0.8 && aspectRatio < 1.2) {
                    indicators.shirt += 0.2;
                    indicators.jacket += 0.1;
                } else if (aspectRatio < 0.6) {
                    indicators.dress += 0.3;
                    indicators.pants += 0.2;
                } else if (aspectRatio > 1.5) {
                    indicators.pants += 0.1;
                }
            }
        }

        // Find highest scoring type
        const detectedType = Object.keys(indicators).reduce((a, b) =>
            indicators[a] > indicators[b] ? a : b
        );

        console.log(`🎯 AGENT 6: Product type detected: ${detectedType} (scores:`, indicators, ')');
        return detectedType;
    }

    /**
     * 📊 Calculate Detection Confidence
     */
    calculateDetectionConfidence(templateData, detectedType) {
        let confidence = 0.5; // Base confidence

        // Increase confidence based on available data
        if (templateData.name) confidence += 0.2;
        if (templateData.categories && templateData.categories.length > 0) confidence += 0.2;
        if (templateData.views && templateData.views.length > 0) confidence += 0.1;

        // Adjust based on detection clarity
        if (detectedType !== 'generic') confidence += 0.1;

        return Math.min(1.0, confidence);
    }

    /**
     * 💡 Generate Measurement Suggestions
     */
    generateMeasurementSuggestions(productType) {
        console.log(`💡 AGENT 6: Generating measurement suggestions for ${productType}...`);

        const profile = this.templateProfiles[productType] || this.templateProfiles.generic;

        const suggestions = profile.measurements.map(measurementKey => {
            const pattern = this.findPatternForMeasurement(measurementKey);

            return {
                measurement_key: measurementKey,
                priority: profile.priority_measurements.includes(measurementKey) ? 'high' : 'medium',
                pattern: pattern?.description || 'Standard measurement',
                guidance: pattern?.detectionHints?.[0] || 'Select appropriate measurement points'
            };
        });

        console.log(`💡 AGENT 6: Generated ${suggestions.length} measurement suggestions`);
        return suggestions;
    }

    /**
     * 🎨 Analyze Measurement Areas
     */
    analyzeMeasurementAreas(templateData, productType) {
        console.log('🎨 AGENT 6: Analyzing potential measurement areas...');

        const areas = {};

        // Get template dimensions for calculations
        let templateWidth = 600; // Default
        let templateHeight = 400; // Default

        if (templateData.views && templateData.views.length > 0) {
            const view = templateData.views[0];
            templateWidth = view.width || templateWidth;
            templateHeight = view.height || templateHeight;
        }

        // Generate areas based on measurement patterns
        Object.keys(this.measurementPatterns).forEach(patternKey => {
            const pattern = this.measurementPatterns[patternKey];

            // Check if pattern applies to detected product type
            if (pattern.categories.includes(productType) || productType === 'generic') {
                areas[patternKey] = this.calculateMeasurementArea(pattern, templateWidth, templateHeight);
            }
        });

        console.log(`🎨 AGENT 6: Analyzed ${Object.keys(areas).length} measurement areas`);
        return areas;
    }

    /**
     * 📐 Calculate Measurement Area
     */
    calculateMeasurementArea(pattern, templateWidth, templateHeight) {
        const area = {
            pattern: pattern.description,
            suggested_points: [],
            area_bounds: {},
            guidance: pattern.detectionHints[0]
        };

        // Calculate area bounds based on pattern ranges
        if (pattern.yRange) {
            area.area_bounds.top = Math.round(templateHeight * pattern.yRange[0]);
            area.area_bounds.bottom = Math.round(templateHeight * pattern.yRange[1]);
        }

        if (pattern.xRange) {
            area.area_bounds.left = Math.round(templateWidth * pattern.xRange[0]);
            area.area_bounds.right = Math.round(templateWidth * pattern.xRange[1]);
        }

        // Generate suggested points
        if (pattern.xExpected === 'full_width') {
            const y = area.area_bounds.top + (area.area_bounds.bottom - area.area_bounds.top) / 2;
            area.suggested_points = [
                { x: templateWidth * 0.1, y: y, label: 'Left edge' },
                { x: templateWidth * 0.9, y: y, label: 'Right edge' }
            ];
        } else if (pattern.yExpected === 'full_height') {
            const x = area.area_bounds.left + (area.area_bounds.right - area.area_bounds.left) / 2;
            area.suggested_points = [
                { x: x, y: templateHeight * 0.05, label: 'Top point' },
                { x: x, y: templateHeight * 0.95, label: 'Bottom point' }
            ];
        } else if (pattern.xExpected === 'shoulder_points') {
            const y = templateHeight * 0.15; // Typical shoulder line
            area.suggested_points = [
                { x: templateWidth * 0.25, y: y, label: 'Left shoulder' },
                { x: templateWidth * 0.75, y: y, label: 'Right shoulder' }
            ];
        }

        return area;
    }

    /**
     * 📏 Analyze Template Scaling
     */
    analyzeTemplateScaling(viewData) {
        console.log('📏 AGENT 6: Analyzing template scaling...');

        const scaling = {
            template_width: viewData.width || 600,
            template_height: viewData.height || 400,
            estimated_scale: 1.0,
            dpi_estimate: 72,
            real_world_estimate: {
                width_cm: 30,
                height_cm: 40
            }
        };

        // Estimate scale based on typical garment proportions
        const aspectRatio = scaling.template_width / scaling.template_height;

        if (aspectRatio > 0.6 && aspectRatio < 1.4) {
            // Likely shirt/jacket proportions
            scaling.real_world_estimate.width_cm = 50;
            scaling.real_world_estimate.height_cm = 70;
            scaling.estimated_scale = scaling.template_width / 500; // Assume 50cm = 500px at scale 1
        } else if (aspectRatio < 0.6) {
            // Likely dress/long item
            scaling.real_world_estimate.width_cm = 40;
            scaling.real_world_estimate.height_cm = 100;
            scaling.estimated_scale = scaling.template_width / 400;
        }

        console.log('📏 AGENT 6: Scaling analysis complete:', scaling);
        return scaling;
    }

    /**
     * 🔍 Find Pattern for Measurement
     */
    findPatternForMeasurement(measurementKey) {
        for (const patternKey in this.measurementPatterns) {
            const pattern = this.measurementPatterns[patternKey];
            if (pattern.measurements.includes(measurementKey)) {
                return pattern;
            }
        }
        return null;
    }

    /**
     * 🎯 Get Smart Suggestions for Template
     */
    async getSmartSuggestions(templateId) {
        console.log(`🎯 AGENT 6: Getting smart suggestions for template ${templateId}...`);

        try {
            // Get template data (this would integrate with existing template system)
            const templateData = await this.fetchTemplateData(templateId);

            // Analyze template
            const analysis = await this.analyzeTemplate(templateData);

            // Generate actionable suggestions
            const suggestions = {
                product_type: {
                    detected: analysis.detected_type,
                    confidence: analysis.confidence,
                    alternatives: this.getAlternativeTypes(analysis)
                },
                recommended_measurements: analysis.suggested_measurements.slice(0, 4), // Top 4
                measurement_workflow: this.generateWorkflowSuggestions(analysis.detected_type),
                quick_setup: this.generateQuickSetupSteps(analysis)
            };

            console.log('✅ AGENT 6: Smart suggestions generated');
            return suggestions;

        } catch (error) {
            console.error('❌ AGENT 6: Failed to generate suggestions:', error);
            return this.getFallbackSuggestions();
        }
    }

    /**
     * 📋 Fetch Template Data
     */
    async fetchTemplateData(templateId) {
        // This would integrate with existing template data sources
        // For now, return mock data structure
        return {
            id: templateId,
            name: 'Template ' + templateId,
            categories: [],
            views: [
                {
                    id: '1',
                    name: 'Front',
                    width: 600,
                    height: 400,
                    imageUrl: '/path/to/image.jpg'
                }
            ]
        };
    }

    /**
     * 🔄 Get Alternative Types
     */
    getAlternativeTypes(analysis) {
        const alternatives = Object.keys(this.templateProfiles)
            .filter(type => type !== analysis.detected_type && type !== 'generic')
            .slice(0, 2);

        return alternatives.map(type => ({
            type: type,
            name: this.templateProfiles[type].name,
            confidence: Math.max(0.1, analysis.confidence - 0.3)
        }));
    }

    /**
     * 🔄 Generate Workflow Suggestions
     */
    generateWorkflowSuggestions(productType) {
        const profile = this.templateProfiles[productType] || this.templateProfiles.generic;

        return {
            suggested_order: profile.priority_measurements,
            workflow_tips: [
                'Start with primary measurements for accurate scaling',
                'Measure horizontal dimensions before vertical ones',
                'Use template guides and alignment tools',
                'Validate measurements against typical size ranges'
            ]
        };
    }

    /**
     * ⚡ Generate Quick Setup Steps
     */
    generateQuickSetupSteps(analysis) {
        const steps = [
            {
                step: 1,
                title: `Set up ${analysis.detected_type} measurements`,
                description: `Configure measurement types for ${analysis.detected_type}`,
                measurements: analysis.suggested_measurements.slice(0, 2)
            },
            {
                step: 2,
                title: 'Define primary measurements',
                description: 'Set up the most important measurements first',
                measurements: analysis.suggested_measurements.filter(m => m.priority === 'high')
            },
            {
                step: 3,
                title: 'Add secondary measurements',
                description: 'Complete the measurement set',
                measurements: analysis.suggested_measurements.filter(m => m.priority === 'medium')
            }
        ];

        return steps;
    }

    /**
     * 🔄 Get Fallback Suggestions
     */
    getFallbackSuggestions() {
        return {
            product_type: {
                detected: 'generic',
                confidence: 0.5,
                alternatives: []
            },
            recommended_measurements: [
                { measurement_key: 'A', priority: 'high', pattern: 'Chest/width measurement' },
                { measurement_key: 'C', priority: 'high', pattern: 'Height/length measurement' },
                { measurement_key: 'B', priority: 'medium', pattern: 'Bottom width measurement' }
            ],
            measurement_workflow: {
                suggested_order: ['A', 'C', 'B'],
                workflow_tips: ['Start with basic width and height measurements']
            },
            quick_setup: []
        };
    }

    /**
     * 🧪 Test Future-Proofing System
     */
    async testFutureProofing() {
        console.log('🧪 AGENT 6: Testing future-proofing system...');

        const testTemplate = {
            id: 'test_123',
            name: 'Test Shirt Template',
            categories: ['apparel', 'shirt'],
            views: [
                {
                    id: '1',
                    name: 'Front',
                    width: 600,
                    height: 700,
                    imageUrl: '/test/image.jpg'
                }
            ]
        };

        const suggestions = await this.getSmartSuggestions('test_123');
        console.log('📊 AGENT 6: Test suggestions:', suggestions);

        return suggestions;
    }
}

// Initialize future-proofing system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 AGENT 6: DOM ready - initializing future-proofing system...');

    // Create global instance
    window.measurementFutureProofingSystem = new MeasurementFutureProofingSystem();

    // Wait for measurement definition system and integrate
    const checkIntegration = setInterval(() => {
        if (window.measurementDefinitionSystem) {
            console.log('✅ AGENT 6: Integrating with measurement definition system...');

            // Enhance dropdown population with smart suggestions
            const originalPopulate = window.measurementDefinitionSystem.populateMeasurementDropdown;

            window.measurementDefinitionSystem.populateMeasurementDropdown = async function() {
                // Run original population
                await originalPopulate.call(this);

                // Add future-proofing enhancements
                if (window.measurementFutureProofingSystem && this.selector.templateId) {
                    try {
                        const suggestions = await window.measurementFutureProofingSystem.getSmartSuggestions(this.selector.templateId);

                        // Highlight recommended measurements
                        suggestions.recommended_measurements.forEach(suggestion => {
                            const option = this.dropdown.querySelector(`option[value="${suggestion.measurement_key}"]`);
                            if (option) {
                                option.style.fontWeight = suggestion.priority === 'high' ? 'bold' : 'normal';
                                option.style.backgroundColor = suggestion.priority === 'high' ? '#f0f8ff' : '';
                                option.title = suggestion.pattern;
                            }
                        });

                        // Add product type detection to UI
                        if (suggestions.product_type.detected !== 'generic') {
                            const infoPanel = document.querySelector('.measurement-info');
                            if (infoPanel) {
                                const productTypeInfo = document.createElement('div');
                                productTypeInfo.className = 'product-type-detection';
                                productTypeInfo.innerHTML = `
                                    <small style="color: #2271b1; font-style: italic;">
                                        🤖 Detected: ${suggestions.product_type.detected}
                                        (${(suggestions.product_type.confidence * 100).toFixed(0)}% confidence)
                                    </small>
                                `;
                                infoPanel.insertBefore(productTypeInfo, infoPanel.firstChild);
                            }
                        }

                        console.log('🤖 AGENT 6: Smart suggestions applied to dropdown');

                    } catch (error) {
                        console.warn('⚠️ AGENT 6: Smart suggestions failed, continuing with standard dropdown:', error);
                    }
                }
            };

            console.log('🔗 AGENT 6: Future-proofing integration complete');
            clearInterval(checkIntegration);
        }
    }, 1000);

    // Timeout after 30 seconds
    setTimeout(() => {
        clearInterval(checkIntegration);
    }, 30000);
});

console.log('🎯 AGENT 6: MeasurementFutureProofingSystem class loaded');
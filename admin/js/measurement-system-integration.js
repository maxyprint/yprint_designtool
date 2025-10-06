/**
 * 🚀 AGENT 7: INTEGRATION COORDINATOR - Master System Integration
 * Issue #22 Implementation: Two-Point Measurement Interface Orchestration
 *
 * This is the master orchestration system that coordinates all measurement components:
 * - Agent 1: Enhanced UI/UX Interface
 * - Agent 2: Smart JavaScript Selection Logic
 * - Agent 3: Database Integration System
 * - Agent 4: Real-time Validation Engine
 * - Agent 5: Workflow Optimization
 * - Agent 6: Future-Proofing Dynamic Support
 */

class MeasurementSystemIntegration {
    constructor() {
        this.components = {
            definitionSystem: null,
            databaseIntegration: null,
            validationEngine: null,
            futureProofing: null
        };

        this.state = {
            isInitialized: false,
            activeMode: false,
            currentWorkflow: null,
            systemHealth: 'unknown'
        };

        this.config = {
            debug: false,
            performance: {
                trackTiming: true,
                logOperations: false
            },
            fallbacks: {
                enableGracefulDegradation: true,
                retryAttempts: 3
            }
        };

        this.metrics = {
            initialization: { startTime: null, endTime: null },
            workflows: [],
            errors: [],
            performance: {}
        };
    }

    /**
     * 🎯 System Initialization - Orchestrates all 7 agent components
     */
    async initializeSystem() {
        this.metrics.initialization.startTime = performance.now();

        try {
            console.log('🚀 [Integration Coordinator] Starting Issue #22 system integration...');

            // Phase 1: Initialize core components with error handling
            await this.initializeCoreComponents();

            // Phase 2: Establish component interconnections
            await this.establishComponentConnections();

            // Phase 3: Run system health checks
            await this.performSystemHealthCheck();

            // Phase 4: Setup event orchestration
            this.setupEventOrchestration();

            // Phase 5: Enable measurement mode integration
            this.integrateMeasurementMode();

            this.state.isInitialized = true;
            this.metrics.initialization.endTime = performance.now();

            const initTime = this.metrics.initialization.endTime - this.metrics.initialization.startTime;
            console.log(`✅ [Integration Coordinator] System initialized successfully in ${initTime.toFixed(2)}ms`);

            return { success: true, initializationTime: initTime, components: Object.keys(this.components) };

        } catch (error) {
            console.error('❌ [Integration Coordinator] System initialization failed:', error);
            this.metrics.errors.push({ type: 'initialization', error: error.message, timestamp: Date.now() });
            return { success: false, error: error.message };
        }
    }

    /**
     * 🔧 Core Components Initialization
     */
    async initializeCoreComponents() {
        const selector = window.yprint_template_selector;
        if (!selector) {
            throw new Error('Template selector not available - ensure yprint-template-designer.js is loaded');
        }

        // Agent 2: Smart JavaScript Selection Logic
        if (typeof MeasurementDefinitionSystem !== 'undefined') {
            this.components.definitionSystem = new MeasurementDefinitionSystem(selector);
            console.log('✅ Agent 2: Definition System initialized');
        }

        // Agent 3: Database Integration
        if (typeof MeasurementDatabaseIntegration !== 'undefined') {
            this.components.databaseIntegration = new MeasurementDatabaseIntegration({
                endpoint: yprint_ajax.ajax_url,
                nonce: yprint_ajax.nonce,
                templateId: selector?.getCurrentTemplate()?.id || 'unknown'
            });
            await this.components.databaseIntegration.loadMeasurementDatabase();
            console.log('✅ Agent 3: Database Integration initialized');
        }

        // Agent 4: Validation Engine
        if (typeof MeasurementValidationEngine !== 'undefined') {
            this.components.validationEngine = new MeasurementValidationEngine({
                tolerances: { excellent: 0.02, good: 0.05, acceptable: 0.10 }
            });
            console.log('✅ Agent 4: Validation Engine initialized');
        }

        // Agent 6: Future-Proofing System
        if (typeof MeasurementFutureProofingSystem !== 'undefined') {
            this.components.futureProofing = new MeasurementFutureProofingSystem({
                enableDynamicDetection: true,
                learningMode: true
            });
            console.log('✅ Agent 6: Future-Proofing System initialized');
        }
    }

    /**
     * 🔗 Component Interconnections - Establish communication channels
     */
    async establishComponentConnections() {
        if (this.components.definitionSystem && this.components.databaseIntegration) {
            // Connect definition system to database for automatic target values
            this.components.definitionSystem.setDatabaseIntegration(this.components.databaseIntegration);
            console.log('🔗 Connected Definition System ↔ Database Integration');
        }

        if (this.components.definitionSystem && this.components.validationEngine) {
            // Connect definition system to validation for real-time feedback
            this.components.definitionSystem.setValidationEngine(this.components.validationEngine);
            console.log('🔗 Connected Definition System ↔ Validation Engine');
        }

        if (this.components.futureProofing && this.components.databaseIntegration) {
            // Connect future-proofing to database for dynamic template analysis
            this.components.futureProofing.setDatabaseIntegration(this.components.databaseIntegration);
            console.log('🔗 Connected Future-Proofing ↔ Database Integration');
        }
    }

    /**
     * 🏥 System Health Check - Validate all components are working
     */
    async performSystemHealthCheck() {
        const healthResults = {
            overall: 'healthy',
            components: {},
            issues: []
        };

        // Check each component
        for (const [name, component] of Object.entries(this.components)) {
            if (!component) {
                healthResults.components[name] = 'missing';
                healthResults.issues.push(`Component ${name} not initialized`);
                continue;
            }

            try {
                // Basic health check - ensure component has required methods
                const hasRequiredMethods = this.validateComponentInterface(component, name);
                healthResults.components[name] = hasRequiredMethods ? 'healthy' : 'degraded';

                if (!hasRequiredMethods) {
                    healthResults.issues.push(`Component ${name} missing required interface methods`);
                }
            } catch (error) {
                healthResults.components[name] = 'error';
                healthResults.issues.push(`Component ${name} health check failed: ${error.message}`);
            }
        }

        // Determine overall health
        const healthyCount = Object.values(healthResults.components).filter(status => status === 'healthy').length;
        const totalCount = Object.keys(this.components).length;

        if (healthyCount === totalCount) {
            healthResults.overall = 'healthy';
        } else if (healthyCount >= totalCount * 0.75) {
            healthResults.overall = 'degraded';
        } else {
            healthResults.overall = 'critical';
        }

        this.state.systemHealth = healthResults.overall;

        console.log('🏥 System Health Check Results:', healthResults);
        return healthResults;
    }

    /**
     * 🔍 Component Interface Validation
     */
    validateComponentInterface(component, name) {
        const requiredMethods = {
            definitionSystem: ['activate', 'deactivate', 'setCurrentMeasurementType'],
            databaseIntegration: ['getMeasurementTypes', 'getTargetValue'],
            validationEngine: ['validateMeasurementAccuracy'],
            futureProofing: ['analyzeTemplate', 'adaptToNewTemplate']
        };

        const required = requiredMethods[name] || [];
        return required.every(method => typeof component[method] === 'function');
    }

    /**
     * 🎭 Event Orchestration Setup - Coordinate inter-component communication
     */
    setupEventOrchestration() {
        // Create global event dispatcher for measurement system
        if (!window.measurementSystemEvents) {
            window.measurementSystemEvents = new EventTarget();
        }

        const eventDispatcher = window.measurementSystemEvents;

        // Orchestrate measurement workflow events
        eventDispatcher.addEventListener('measurementTypeSelected', (event) => {
            this.handleMeasurementTypeSelection(event.detail);
        });

        eventDispatcher.addEventListener('pointsSelected', (event) => {
            this.handlePointsSelection(event.detail);
        });

        eventDispatcher.addEventListener('validationCompleted', (event) => {
            this.handleValidationCompletion(event.detail);
        });

        eventDispatcher.addEventListener('measurementSaved', (event) => {
            this.handleMeasurementSave(event.detail);
        });

        console.log('🎭 Event orchestration system established');
    }

    /**
     * 🎯 Measurement Mode Integration - Connect with existing toolbar
     */
    integrateMeasurementMode() {
        // Find and enhance measurement definition button from Agent 1 (UI/UX)
        const measurementButton = document.querySelector('.measurement-definition-mode');
        if (measurementButton) {
            measurementButton.addEventListener('click', () => this.activateMeasurementMode());
            console.log('🎯 Integrated with measurement mode button');
        }

        // Setup mode switching coordination
        document.addEventListener('modeChange', (event) => {
            if (event.detail.mode === 'measurement') {
                this.activateMeasurementMode();
            } else {
                this.deactivateMeasurementMode();
            }
        });
    }

    /**
     * 🚀 Activate Measurement Mode - Orchestrated workflow activation
     */
    async activateMeasurementMode() {
        if (!this.state.isInitialized) {
            console.warn('⚠️ System not initialized, attempting initialization...');
            const initResult = await this.initializeSystem();
            if (!initResult.success) {
                console.error('❌ Cannot activate measurement mode: initialization failed');
                return false;
            }
        }

        try {
            // Start workflow tracking
            const workflowId = `workflow_${Date.now()}`;
            this.state.currentWorkflow = {
                id: workflowId,
                startTime: performance.now(),
                phase: 'activation',
                steps: []
            };

            console.log('🚀 Activating comprehensive measurement workflow...');

            // Agent 6: Analyze current template for future-proofing
            if (this.components.futureProofing) {
                const templateAnalysis = await this.components.futureProofing.analyzeCurrentTemplate();
                this.state.currentWorkflow.templateAnalysis = templateAnalysis;
                console.log('🔍 Template analysis completed:', templateAnalysis);
            }

            // Agent 2: Activate definition system
            if (this.components.definitionSystem) {
                this.components.definitionSystem.activate();
                this.state.currentWorkflow.steps.push({ step: 'definition_activated', timestamp: performance.now() });
            }

            // Agent 3: Prepare database integration
            if (this.components.databaseIntegration) {
                await this.components.databaseIntegration.refreshMeasurementTypes();
                this.state.currentWorkflow.steps.push({ step: 'database_prepared', timestamp: performance.now() });
            }

            this.state.activeMode = true;
            this.state.currentWorkflow.phase = 'active';

            // Dispatch system-wide activation event
            window.measurementSystemEvents?.dispatchEvent(new CustomEvent('systemActivated', {
                detail: { workflowId, timestamp: Date.now() }
            }));

            console.log('✅ Measurement mode activated successfully');
            return true;

        } catch (error) {
            console.error('❌ Failed to activate measurement mode:', error);
            this.metrics.errors.push({ type: 'activation', error: error.message, timestamp: Date.now() });
            return false;
        }
    }

    /**
     * ⏹️ Deactivate Measurement Mode
     */
    deactivateMeasurementMode() {
        if (this.components.definitionSystem) {
            this.components.definitionSystem.deactivate();
        }

        if (this.state.currentWorkflow) {
            this.state.currentWorkflow.endTime = performance.now();
            this.state.currentWorkflow.duration = this.state.currentWorkflow.endTime - this.state.currentWorkflow.startTime;
            this.metrics.workflows.push(this.state.currentWorkflow);
        }

        this.state.activeMode = false;
        this.state.currentWorkflow = null;

        console.log('⏹️ Measurement mode deactivated');
    }

    /**
     * 📊 Workflow Event Handlers - Orchestrated responses
     */
    async handleMeasurementTypeSelection(details) {
        console.log('📊 Processing measurement type selection:', details);

        if (this.state.currentWorkflow) {
            this.state.currentWorkflow.steps.push({
                step: 'type_selected',
                measurementType: details.type,
                timestamp: performance.now()
            });
        }

        // Agent 3: Get target value from database
        if (this.components.databaseIntegration && details.type) {
            const targetValue = await this.components.databaseIntegration.getTargetValue(details.type);

            // Update definition system with target value
            if (this.components.definitionSystem && targetValue) {
                this.components.definitionSystem.setTargetValue(targetValue);
            }
        }
    }

    async handlePointsSelection(details) {
        console.log('📊 Processing points selection:', details);

        if (this.state.currentWorkflow) {
            this.state.currentWorkflow.steps.push({
                step: 'points_selected',
                points: details.points,
                timestamp: performance.now()
            });
        }

        // Agent 4: Perform real-time validation
        if (this.components.validationEngine && details.measurementData) {
            const validation = this.components.validationEngine.validateMeasurementAccuracy(details.measurementData);

            // Dispatch validation results
            window.measurementSystemEvents?.dispatchEvent(new CustomEvent('validationCompleted', {
                detail: { validation, originalData: details }
            }));
        }
    }

    handleValidationCompletion(details) {
        console.log('📊 Processing validation completion:', details);

        if (this.state.currentWorkflow) {
            this.state.currentWorkflow.steps.push({
                step: 'validation_completed',
                accuracy: details.validation?.overall_score,
                timestamp: performance.now()
            });
        }
    }

    async handleMeasurementSave(details) {
        console.log('📊 Processing measurement save:', details);

        if (this.state.currentWorkflow) {
            this.state.currentWorkflow.steps.push({
                step: 'measurement_saved',
                success: details.success,
                timestamp: performance.now()
            });
        }

        // Agent 6: Learn from this measurement for future-proofing
        if (this.components.futureProofing && details.measurementData) {
            await this.components.futureProofing.learnFromMeasurement(details.measurementData);
        }
    }

    /**
     * 📈 System Metrics & Health Monitoring
     */
    getSystemMetrics() {
        return {
            initialization: this.metrics.initialization,
            workflows: this.metrics.workflows,
            errors: this.metrics.errors,
            systemHealth: this.state.systemHealth,
            components: Object.keys(this.components).reduce((acc, key) => {
                acc[key] = this.components[key] ? 'loaded' : 'missing';
                return acc;
            }, {}),
            performance: {
                averageWorkflowDuration: this.calculateAverageWorkflowDuration(),
                errorRate: this.calculateErrorRate(),
                uptime: this.calculateUptime()
            }
        };
    }

    calculateAverageWorkflowDuration() {
        const completedWorkflows = this.metrics.workflows.filter(w => w.duration);
        if (completedWorkflows.length === 0) return 0;

        const totalDuration = completedWorkflows.reduce((sum, w) => sum + w.duration, 0);
        return totalDuration / completedWorkflows.length;
    }

    calculateErrorRate() {
        const totalOperations = this.metrics.workflows.length;
        const errors = this.metrics.errors.length;
        return totalOperations > 0 ? (errors / totalOperations) * 100 : 0;
    }

    calculateUptime() {
        if (!this.metrics.initialization.startTime) return 0;
        return performance.now() - this.metrics.initialization.startTime;
    }

    /**
     * 🐛 Debug & Diagnostics
     */
    enableDebugMode() {
        this.config.debug = true;
        this.config.performance.logOperations = true;
        console.log('🐛 Debug mode enabled for measurement system');
    }

    generateDiagnosticReport() {
        return {
            timestamp: new Date().toISOString(),
            systemState: this.state,
            metrics: this.getSystemMetrics(),
            componentStatus: this.validateAllComponents(),
            configuration: this.config
        };
    }

    validateAllComponents() {
        const results = {};
        for (const [name, component] of Object.entries(this.components)) {
            results[name] = {
                loaded: !!component,
                hasRequiredInterface: component ? this.validateComponentInterface(component, name) : false,
                type: component ? component.constructor.name : 'null'
            };
        }
        return results;
    }
}

/**
 * 🚀 Global Integration System Instance
 */
window.MeasurementSystemIntegration = MeasurementSystemIntegration;

/**
 * 🎯 Auto-Initialize when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Only initialize if we're on a template designer page
    if (document.querySelector('.yprint-template-designer')) {
        console.log('🎯 Initializing Issue #22 Two-Point Measurement Interface System...');

        window.measurementSystemIntegrator = new MeasurementSystemIntegration();

        // Initialize system with slight delay to ensure all components are loaded
        setTimeout(async () => {
            const result = await window.measurementSystemIntegrator.initializeSystem();
            if (result.success) {
                console.log('🎉 Issue #22 Implementation Complete - Two-Point Measurement Interface Ready!');
            } else {
                console.error('❌ Issue #22 Implementation Failed:', result.error);
            }
        }, 1000);
    }
});

/**
 * 📋 Development Helper - Global access for testing
 */
if (typeof window !== 'undefined') {
    window.debugMeasurementSystem = () => {
        if (window.measurementSystemIntegrator) {
            console.log('📊 System Metrics:', window.measurementSystemIntegrator.getSystemMetrics());
            console.log('🐛 Diagnostic Report:', window.measurementSystemIntegrator.generateDiagnosticReport());
        } else {
            console.log('❌ Integration system not initialized');
        }
    };
}
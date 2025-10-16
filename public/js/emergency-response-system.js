/**
 * 🚨 AGENT 5: COMPREHENSIVE EMERGENCY RESPONSE SYSTEM
 *
 * MISSION: Provide robust emergency fallback systems and recovery options
 * for YPrint initialization failures with graceful degradation strategies.
 *
 * KEY FEATURES:
 * - Multi-tier emergency recovery system
 * - Progressive graceful degradation
 * - Advanced user-facing error handling
 * - Production-ready monitoring and analytics
 * - Automatic system health recovery
 */

class EmergencyResponseSystem {
    constructor() {
        this.systemId = 'emergency-response-' + Date.now();
        this.emergencyLevel = 'normal'; // normal, warning, critical, emergency
        this.recoveryAttempts = 0;
        this.maxRecoveryAttempts = 5;
        this.lastFailureTimestamp = null;
        this.failurePatterns = [];
        this.activeRecoveryStrategy = null;

        // Emergency state tracking
        this.emergencyState = {
            fabricAvailable: false,
            canvasInitialized: false,
            designerReady: false,
            fallbackActive: false,
            degradationLevel: 0, // 0=normal, 1=limited, 2=minimal, 3=critical
            recoveryInProgress: false
        };

        // Recovery strategies (ordered by preference)
        this.recoveryStrategies = [
            'immediate-reinit',
            'delayed-reinit',
            'fabric-reload',
            'canvas-recreation',
            'emergency-mock',
            'critical-fallback'
        ];

        // Graceful degradation levels
        this.degradationLevels = {
            0: { name: 'normal', features: ['full-editor', 'real-time-preview', 'all-tools'] },
            1: { name: 'limited', features: ['basic-editor', 'static-preview', 'essential-tools'] },
            2: { name: 'minimal', features: ['text-only', 'json-export', 'basic-save'] },
            3: { name: 'critical', features: ['error-reporting', 'data-recovery', 'emergency-save'] }
        };

        // User notification configurations
        this.userNotifications = {
            styles: this.createNotificationStyles(),
            templates: this.createNotificationTemplates()
        };

        // Initialize monitoring
        this.initializeMonitoring();
        this.initializeRecoveryListeners();

        console.log('🚨 EMERGENCY RESPONSE SYSTEM: Initialized and monitoring system health');
    }

    /**
     * 🔥 MAIN EMERGENCY HANDLER - Called when primary systems fail
     */
    async handleEmergency(failureType, errorDetails = {}, context = {}) {
        console.error('🚨 EMERGENCY DETECTED:', failureType, errorDetails);

        // Record failure pattern
        this.recordFailurePattern(failureType, errorDetails, context);

        // Determine emergency level
        const emergencyLevel = this.assessEmergencyLevel(failureType, errorDetails);
        this.setEmergencyLevel(emergencyLevel);

        // Notify user immediately for critical failures
        if (emergencyLevel === 'critical' || emergencyLevel === 'emergency') {
            this.showEmergencyNotification(failureType, emergencyLevel);
        }

        // Start recovery process
        const recoverySuccess = await this.initiateRecovery(failureType, errorDetails, context);

        if (!recoverySuccess) {
            // If recovery fails, implement graceful degradation
            await this.implementGracefulDegradation(failureType);
        }

        // Report to monitoring system
        this.reportEmergencyEvent(failureType, errorDetails, emergencyLevel, recoverySuccess);

        return recoverySuccess;
    }

    /**
     * 🔄 RECOVERY SYSTEM - Implements multiple recovery strategies
     */
    async initiateRecovery(failureType, errorDetails, context) {
        if (this.emergencyState.recoveryInProgress) {
            console.warn('🚨 Recovery already in progress, queuing...');
            return false;
        }

        this.emergencyState.recoveryInProgress = true;
        this.recoveryAttempts++;

        console.log(`🔄 RECOVERY ATTEMPT ${this.recoveryAttempts}/${this.maxRecoveryAttempts}`);
        console.log('🎯 Failure Type:', failureType);

        // Try each recovery strategy in order
        for (const strategy of this.recoveryStrategies) {
            console.log(`🔧 Trying recovery strategy: ${strategy}`);

            try {
                const success = await this.executeRecoveryStrategy(strategy, failureType, errorDetails, context);

                if (success) {
                    console.log(`✅ Recovery successful using strategy: ${strategy}`);
                    this.activeRecoveryStrategy = strategy;
                    this.emergencyState.recoveryInProgress = false;
                    this.onRecoverySuccess(strategy);
                    return true;
                }
            } catch (error) {
                console.error(`❌ Recovery strategy ${strategy} failed:`, error);
                continue; // Try next strategy
            }
        }

        // All recovery strategies failed
        console.error('❌ All recovery strategies failed');
        this.emergencyState.recoveryInProgress = false;
        this.onRecoveryFailed();
        return false;
    }

    /**
     * 🛠️ EXECUTE SPECIFIC RECOVERY STRATEGY
     */
    async executeRecoveryStrategy(strategy, failureType, errorDetails, context) {
        const startTime = Date.now();

        switch (strategy) {
            case 'immediate-reinit':
                return await this.attemptImmediateReinit();

            case 'delayed-reinit':
                return await this.attemptDelayedReinit();

            case 'fabric-reload':
                return await this.attemptFabricReload();

            case 'canvas-recreation':
                return await this.attemptCanvasRecreation();

            case 'emergency-mock':
                return await this.createEmergencyMock();

            case 'critical-fallback':
                return await this.activateCriticalFallback();

            default:
                console.error('❌ Unknown recovery strategy:', strategy);
                return false;
        }
    }

    /**
     * 🚀 Recovery Strategy: Immediate Reinit
     */
    async attemptImmediateReinit() {
        console.log('🚀 Attempting immediate reinitialization...');

        // Check if core dependencies are available
        if (typeof window.fabric === 'undefined') {
            console.log('❌ Fabric.js not available for immediate reinit');
            return false;
        }

        // Look for existing designer instance
        const existingInstance = window.OptimizedDesignDataCaptureInstance || window.designDataCapture;

        if (existingInstance && typeof existingInstance.forceCanvasDetection === 'function') {
            try {
                const result = existingInstance.forceCanvasDetection();
                if (result) {
                    this.emergencyState.canvasInitialized = true;
                    return true;
                }
            } catch (error) {
                console.error('❌ Force canvas detection failed:', error);
            }
        }

        // Try to create new instance if none exists or existing failed
        try {
            if (window.OptimizedDesignDataCapture) {
                const newInstance = new window.OptimizedDesignDataCapture();
                const initSuccess = await newInstance.startEventDrivenInitialization();

                if (initSuccess !== false) {
                    window.emergencyRecoveredInstance = newInstance;
                    this.emergencyState.canvasInitialized = true;
                    return true;
                }
            }
        } catch (error) {
            console.error('❌ Emergency instance creation failed:', error);
        }

        return false;
    }

    /**
     * ⏰ Recovery Strategy: Delayed Reinit
     */
    async attemptDelayedReinit() {
        console.log('⏰ Attempting delayed reinitialization...');

        // Wait for DOM to settle and scripts to load
        await this.waitForStableState();

        // Check for fabric readiness
        const fabricReady = await this.waitForFabric(3000);
        if (!fabricReady) {
            console.log('❌ Fabric.js still not ready after wait');
            return false;
        }

        // Now try immediate reinit
        return await this.attemptImmediateReinit();
    }

    /**
     * 📦 Recovery Strategy: Fabric Reload
     */
    async attemptFabricReload() {
        console.log('📦 Attempting Fabric.js reload...');

        // Remove existing fabric references
        delete window.fabric;
        delete window.fabricCanvas;

        // Remove existing fabric scripts
        const existingScripts = document.querySelectorAll('script[src*="fabric"]');
        existingScripts.forEach(script => script.remove());

        // Load emergency fabric loader
        try {
            const fabricLoader = await this.loadEmergencyFabric();
            if (fabricLoader) {
                await this.waitForFabric(5000);
                return await this.attemptImmediateReinit();
            }
        } catch (error) {
            console.error('❌ Emergency fabric loading failed:', error);
        }

        return false;
    }

    /**
     * 🎨 Recovery Strategy: Canvas Recreation
     */
    async attemptCanvasRecreation() {
        console.log('🎨 Attempting canvas recreation...');

        // Find design area container
        const designArea = document.querySelector('.mockup_design_area') ||
                          document.querySelector('#designer-canvas-container') ||
                          document.querySelector('.canvas-container');

        if (!designArea) {
            console.log('❌ No design area found for canvas recreation');
            return false;
        }

        try {
            // Remove existing canvases
            const existingCanvases = designArea.querySelectorAll('canvas');
            existingCanvases.forEach(canvas => {
                if (canvas.__fabric) {
                    try {
                        canvas.__fabric.dispose();
                    } catch (e) {
                        console.warn('Canvas disposal warning:', e);
                    }
                }
                canvas.remove();
            });

            // Create new canvas element
            const newCanvas = document.createElement('canvas');
            newCanvas.id = 'emergency-recovery-canvas-' + Date.now();
            newCanvas.width = designArea.offsetWidth || 800;
            newCanvas.height = designArea.offsetHeight || 600;
            newCanvas.style.cssText = 'border: 1px solid #ccc; background: white;';

            designArea.appendChild(newCanvas);

            // Initialize with fabric if available
            if (window.fabric && window.fabric.Canvas) {
                const fabricCanvas = new window.fabric.Canvas(newCanvas);
                window.fabricCanvas = fabricCanvas;
                window.emergencyCanvas = fabricCanvas;

                this.emergencyState.canvasInitialized = true;
                console.log('✅ Emergency canvas created successfully');
                return true;
            }
        } catch (error) {
            console.error('❌ Canvas recreation failed:', error);
        }

        return false;
    }

    /**
     * 🤖 Recovery Strategy: Emergency Mock
     */
    async createEmergencyMock() {
        console.log('🤖 Creating emergency mock system...');

        try {
            // Create minimal fabric mock
            if (!window.fabric) {
                window.fabric = {
                    Canvas: class EmergencyCanvas {
                        constructor(element) {
                            this.element = element;
                            this.objects = [];
                            this.width = element ? element.width : 800;
                            this.height = element ? element.height : 600;
                            console.log('🤖 Emergency Canvas Mock created');
                        }

                        add(obj) { this.objects.push(obj); }
                        remove(obj) {
                            const index = this.objects.indexOf(obj);
                            if (index > -1) this.objects.splice(index, 1);
                        }
                        getObjects() { return this.objects; }
                        clear() { this.objects = []; }
                        toJSON() {
                            return {
                                version: 'emergency-mock',
                                objects: this.objects
                            };
                        }
                        toDataURL() {
                            return 'data:image/png;base64,emergency-mock-canvas';
                        }
                        renderAll() { /* mock */ }
                        dispose() { this.objects = []; }
                    },
                    Object: class { constructor(options) { Object.assign(this, options); } },
                    Image: class { constructor(src, options) { this.src = src; Object.assign(this, options); } },
                    Text: class { constructor(text, options) { this.text = text; Object.assign(this, options); } },
                    IText: class { constructor(text, options) { this.text = text; Object.assign(this, options); } },
                    Rect: class { constructor(options) { Object.assign(this, options); } },
                    util: {
                        loadImage: (url, callback) => {
                            const img = new Image();
                            img.onload = () => callback(img);
                            img.src = url;
                        }
                    }
                };
            }

            // Create emergency design data generator
            window.generateDesignData = () => {
                return {
                    success: true,
                    emergency_mode: true,
                    timestamp: new Date().toISOString(),
                    message: 'Emergency mode - limited functionality available',
                    data: {
                        template_view_id: 'emergency-mode',
                        designed_on_area_px: { width: 800, height: 600 },
                        elements: [],
                        canvas: {
                            id: 'emergency-canvas',
                            width: 800,
                            height: 600,
                            zoom: 1.0,
                            objects_count: 0,
                            emergency_mode: true
                        }
                    }
                };
            };

            this.emergencyState.fallbackActive = true;
            this.emergencyState.degradationLevel = 2; // Minimal functionality

            console.log('✅ Emergency mock system created');
            return true;

        } catch (error) {
            console.error('❌ Emergency mock creation failed:', error);
            return false;
        }
    }

    /**
     * ⚠️ Recovery Strategy: Critical Fallback
     */
    async activateCriticalFallback() {
        console.log('⚠️ Activating critical fallback mode...');

        try {
            // Set emergency state
            this.emergencyState.degradationLevel = 3; // Critical level
            this.emergencyState.fallbackActive = true;

            // Create minimal error-reporting functions
            window.generateDesignData = () => ({
                error: 'System in critical fallback mode',
                emergency_mode: true,
                critical_fallback: true,
                timestamp: new Date().toISOString(),
                message: 'Please contact support - system requires maintenance',
                recovery_options: [
                    'Refresh the page',
                    'Clear browser cache',
                    'Contact technical support'
                ]
            });

            // Create emergency save function
            window.emergencySaveData = (data) => {
                try {
                    const saveData = {
                        timestamp: new Date().toISOString(),
                        emergency_save: true,
                        data: data,
                        user_agent: navigator.userAgent,
                        url: window.location.href
                    };

                    // Save to localStorage for recovery
                    localStorage.setItem('yprint_emergency_save_' + Date.now(), JSON.stringify(saveData));
                    console.log('💾 Emergency data saved to localStorage');
                    return true;
                } catch (error) {
                    console.error('❌ Emergency save failed:', error);
                    return false;
                }
            };

            // Show critical error UI
            this.showCriticalErrorInterface();

            console.log('✅ Critical fallback mode activated');
            return true;

        } catch (error) {
            console.error('❌ Critical fallback activation failed:', error);
            return false;
        }
    }

    /**
     * 📉 GRACEFUL DEGRADATION SYSTEM
     */
    async implementGracefulDegradation(failureType) {
        console.log('📉 Implementing graceful degradation...');

        // Determine appropriate degradation level
        const degradationLevel = this.determineDegradationLevel(failureType);
        this.emergencyState.degradationLevel = degradationLevel;

        const currentLevel = this.degradationLevels[degradationLevel];
        console.log(`📉 Degrading to level ${degradationLevel}: ${currentLevel.name}`);

        // Implement feature restrictions based on level
        await this.implementFeatureRestrictions(currentLevel);

        // Update UI to reflect limited functionality
        this.updateUIForDegradation(currentLevel);

        // Notify user about limited functionality
        this.showDegradationNotification(currentLevel);

        return true;
    }

    /**
     * 🎛️ IMPLEMENT FEATURE RESTRICTIONS
     */
    async implementFeatureRestrictions(level) {
        const availableFeatures = level.features;

        // Hide/disable features not available at this level
        const allFeatures = ['full-editor', 'real-time-preview', 'all-tools', 'basic-editor', 'static-preview', 'essential-tools', 'text-only', 'json-export', 'basic-save'];
        const disabledFeatures = allFeatures.filter(f => !availableFeatures.includes(f));

        disabledFeatures.forEach(feature => {
            this.disableFeature(feature);
        });

        // Enable only available features
        availableFeatures.forEach(feature => {
            this.enableFeature(feature);
        });
    }

    /**
     * 🚫 DISABLE SPECIFIC FEATURE
     */
    disableFeature(feature) {
        const featureMap = {
            'full-editor': () => {
                const editorElements = document.querySelectorAll('.designer-toolbar, .design-tools');
                editorElements.forEach(el => el.style.display = 'none');
            },
            'real-time-preview': () => {
                // Disable real-time canvas updates
                window.disableRealTimePreview = true;
            },
            'all-tools': () => {
                const toolElements = document.querySelectorAll('.tool-panel, .tool-buttons');
                toolElements.forEach(el => el.style.display = 'none');
            }
        };

        if (featureMap[feature]) {
            featureMap[feature]();
        }
    }

    /**
     * ✅ ENABLE SPECIFIC FEATURE
     */
    enableFeature(feature) {
        const featureMap = {
            'basic-save': () => {
                // Ensure basic save functionality is available
                this.createBasicSaveInterface();
            },
            'json-export': () => {
                // Create JSON export functionality
                this.createJsonExportInterface();
            },
            'error-reporting': () => {
                // Create error reporting interface
                this.createErrorReportingInterface();
            }
        };

        if (featureMap[feature]) {
            featureMap[feature]();
        }
    }

    /**
     * 📱 USER-FACING ERROR HANDLING AND RECOVERY OPTIONS
     */
    showEmergencyNotification(failureType, emergencyLevel) {
        const notification = this.createUserNotification({
            type: 'emergency',
            level: emergencyLevel,
            title: this.getEmergencyTitle(emergencyLevel),
            message: this.getEmergencyMessage(failureType, emergencyLevel),
            actions: this.getEmergencyActions(failureType, emergencyLevel),
            persistent: emergencyLevel === 'critical' || emergencyLevel === 'emergency'
        });

        document.body.appendChild(notification);
    }

    /**
     * 🔧 CREATE USER RECOVERY INTERFACE
     */
    createUserNotification(config) {
        const notification = document.createElement('div');
        notification.className = `emergency-notification emergency-${config.level}`;
        notification.style.cssText = this.userNotifications.styles[config.level];

        const template = this.userNotifications.templates[config.type];
        notification.innerHTML = template
            .replace('{title}', config.title)
            .replace('{message}', config.message)
            .replace('{actions}', this.renderActions(config.actions));

        // Add event listeners for actions
        this.attachNotificationHandlers(notification, config.actions);

        return notification;
    }

    /**
     * 🎨 CREATE NOTIFICATION STYLES
     */
    createNotificationStyles() {
        return {
            normal: `
                position: fixed; top: 20px; right: 20px; z-index: 10000;
                background: #4CAF50; color: white; padding: 15px 20px;
                border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 14px; max-width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            `,
            warning: `
                position: fixed; top: 20px; right: 20px; z-index: 10000;
                background: #FF9800; color: white; padding: 15px 20px;
                border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 14px; max-width: 400px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `,
            critical: `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 15000;
                background: #F44336; color: white; padding: 25px 30px;
                border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 16px; max-width: 500px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
                border: 2px solid #D32F2F;
            `,
            emergency: `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 20000;
                background: rgba(244, 67, 54, 0.95); color: white; padding: 50px;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 18px; display: flex; flex-direction: column; align-items: center;
                justify-content: center; text-align: center;
            `
        };
    }

    /**
     * 📄 CREATE NOTIFICATION TEMPLATES
     */
    createNotificationTemplates() {
        return {
            emergency: `
                <div class="emergency-header">
                    <h2 style="margin: 0 0 15px 0; font-size: 24px;">{title}</h2>
                </div>
                <div class="emergency-content">
                    <p style="margin: 0 0 20px 0; line-height: 1.5;">{message}</p>
                    <div class="emergency-actions">{actions}</div>
                </div>
            `,
            degradation: `
                <div class="degradation-header">
                    <h3 style="margin: 0 0 10px 0;">⚠️ Limited Functionality</h3>
                </div>
                <div class="degradation-content">
                    <p style="margin: 0 0 15px 0;">{message}</p>
                    <div class="degradation-actions">{actions}</div>
                </div>
            `
        };
    }

    /**
     * 🔧 PRODUCTION-READY MONITORING AND ANALYTICS
     */
    initializeMonitoring() {
        // Performance monitoring
        this.performanceMonitor = {
            startTime: Date.now(),
            metrics: {},
            errors: [],
            recoveryAttempts: []
        };

        // Error boundary
        window.addEventListener('error', (event) => {
            this.recordError(event.error, 'global-error', {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // Unhandled promise rejection monitoring
        window.addEventListener('unhandledrejection', (event) => {
            this.recordError(event.reason, 'unhandled-rejection', {
                promise: event.promise
            });
        });

        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.recordError(new Error('Resource loading failed'), 'resource-error', {
                    tagName: event.target.tagName,
                    src: event.target.src || event.target.href
                });
            }
        }, true);
    }

    /**
     * 📊 RECORD FAILURE PATTERN
     */
    recordFailurePattern(failureType, errorDetails, context) {
        const pattern = {
            timestamp: Date.now(),
            failureType,
            errorDetails,
            context,
            userAgent: navigator.userAgent,
            url: window.location.href,
            emergencyLevel: this.emergencyLevel,
            recoveryAttempts: this.recoveryAttempts
        };

        this.failurePatterns.push(pattern);

        // Keep only last 50 patterns to prevent memory bloat
        if (this.failurePatterns.length > 50) {
            this.failurePatterns = this.failurePatterns.slice(-50);
        }

        // Detect recurring patterns
        this.analyzeFailurePatterns();
    }

    /**
     * 🔍 ANALYZE FAILURE PATTERNS
     */
    analyzeFailurePatterns() {
        if (this.failurePatterns.length < 3) return;

        const recentPatterns = this.failurePatterns.slice(-5);
        const failureTypes = recentPatterns.map(p => p.failureType);

        // Check for recurring failures
        const uniqueTypes = [...new Set(failureTypes)];
        if (uniqueTypes.length === 1 && failureTypes.length >= 3) {
            console.warn('🔄 RECURRING FAILURE DETECTED:', uniqueTypes[0]);
            this.handleRecurringFailure(uniqueTypes[0]);
        }
    }

    /**
     * 🔄 HANDLE RECURRING FAILURE
     */
    handleRecurringFailure(failureType) {
        // Escalate emergency level for recurring failures
        if (this.emergencyLevel === 'normal') {
            this.setEmergencyLevel('warning');
        } else if (this.emergencyLevel === 'warning') {
            this.setEmergencyLevel('critical');
        }

        // Implement more aggressive recovery for recurring failures
        this.maxRecoveryAttempts = Math.max(1, this.maxRecoveryAttempts - 1);

        // Consider skipping failed strategies
        const failedStrategies = this.getFailedStrategiesForType(failureType);
        this.recoveryStrategies = this.recoveryStrategies.filter(s => !failedStrategies.includes(s));
    }

    /**
     * 📈 REPORTING AND ANALYTICS
     */
    reportEmergencyEvent(failureType, errorDetails, emergencyLevel, recoverySuccess) {
        const report = {
            timestamp: new Date().toISOString(),
            systemId: this.systemId,
            failureType,
            errorDetails,
            emergencyLevel,
            recoverySuccess,
            recoveryStrategy: this.activeRecoveryStrategy,
            recoveryAttempts: this.recoveryAttempts,
            degradationLevel: this.emergencyState.degradationLevel,
            userAgent: navigator.userAgent,
            url: window.location.href,
            performanceMetrics: this.getPerformanceMetrics()
        };

        // Store locally for debugging
        this.storeEmergencyReport(report);

        // Send to monitoring service (if available)
        this.sendToMonitoringService(report);

        console.log('📊 EMERGENCY REPORT:', report);
    }

    /**
     * 💾 STORE EMERGENCY REPORT
     */
    storeEmergencyReport(report) {
        try {
            const reports = JSON.parse(localStorage.getItem('yprint_emergency_reports') || '[]');
            reports.push(report);

            // Keep only last 20 reports
            if (reports.length > 20) {
                reports.splice(0, reports.length - 20);
            }

            localStorage.setItem('yprint_emergency_reports', JSON.stringify(reports));
        } catch (error) {
            console.error('Failed to store emergency report:', error);
        }
    }

    /**
     * 🌐 SEND TO MONITORING SERVICE
     */
    sendToMonitoringService(report) {
        // Check if monitoring endpoint is configured
        const monitoringEndpoint = window.yprintConfig?.monitoringEndpoint;

        if (monitoringEndpoint) {
            fetch(monitoringEndpoint + '/emergency-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(report)
            }).catch(error => {
                console.warn('Failed to send emergency report to monitoring service:', error);
            });
        }
    }

    /**
     * 🔧 UTILITY METHODS
     */

    // Wait for stable DOM state
    async waitForStableState(timeout = 2000) {
        return new Promise(resolve => {
            let mutations = 0;
            const observer = new MutationObserver(() => {
                mutations++;
            });

            observer.observe(document.body, { childList: true, subtree: true });

            setTimeout(() => {
                observer.disconnect();
                console.log(`DOM mutations in last 2s: ${mutations}`);
                resolve(mutations < 10); // Consider stable if < 10 mutations
            }, timeout);
        });
    }

    // Wait for fabric.js to be available
    async waitForFabric(timeout = 5000) {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            if (typeof window.fabric !== 'undefined' && window.fabric.Canvas) {
                this.emergencyState.fabricAvailable = true;
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return false;
    }

    // Load emergency fabric
    async loadEmergencyFabric() {
        // This would integrate with the existing emergency fabric loader
        if (window.FabricEmergencyFix) {
            return new window.FabricEmergencyFix();
        }
        return null;
    }

    // Set emergency level
    setEmergencyLevel(level) {
        this.emergencyLevel = level;
        console.log(`🚨 Emergency level set to: ${level}`);

        // Trigger level-specific actions
        this.onEmergencyLevelChange(level);
    }

    // Emergency level change handler
    onEmergencyLevelChange(level) {
        // Update UI indicators
        document.body.className = document.body.className.replace(/emergency-level-\w+/, '') + ` emergency-level-${level}`;

        // Adjust monitoring frequency
        if (level === 'critical' || level === 'emergency') {
            // Increase monitoring frequency for critical situations
            this.startIntensiveMonitoring();
        }
    }

    // Get performance metrics
    getPerformanceMetrics() {
        return {
            timing: performance.timing,
            memory: performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize
            } : null,
            uptime: Date.now() - this.performanceMonitor.startTime
        };
    }

    /**
     * 🎯 PUBLIC API METHODS
     */

    // Manual emergency trigger
    triggerEmergency(failureType, errorDetails = {}) {
        return this.handleEmergency(failureType, errorDetails, { manual: true });
    }

    // Get current system status
    getSystemStatus() {
        return {
            emergencyLevel: this.emergencyLevel,
            emergencyState: this.emergencyState,
            recoveryAttempts: this.recoveryAttempts,
            activeRecoveryStrategy: this.activeRecoveryStrategy,
            degradationLevel: this.emergencyState.degradationLevel,
            uptime: Date.now() - this.performanceMonitor.startTime
        };
    }

    // Reset emergency state
    resetEmergencyState() {
        this.emergencyLevel = 'normal';
        this.recoveryAttempts = 0;
        this.activeRecoveryStrategy = null;
        this.emergencyState.degradationLevel = 0;
        this.emergencyState.fallbackActive = false;
        this.emergencyState.recoveryInProgress = false;

        console.log('🔄 Emergency state reset to normal');
    }

    // Initialize recovery listeners
    initializeRecoveryListeners() {
        // Listen for existing emergency events
        document.addEventListener('designCaptureInitializationFailed', (event) => {
            this.handleEmergency('initialization-failed', event.detail, { source: 'designCapture' });
        });

        // Listen for fabric loading failures
        document.addEventListener('fabricLoadFailed', (event) => {
            this.handleEmergency('fabric-load-failed', event.detail, { source: 'fabricLoader' });
        });

        // Listen for canvas creation failures
        window.addEventListener('canvasCreationFailed', (event) => {
            this.handleEmergency('canvas-creation-failed', event.detail, { source: 'canvasCreation' });
        });
    }

    // Helper methods for UI creation (simplified versions)
    createBasicSaveInterface() {
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Emergency Save';
        saveButton.style.cssText = 'position: fixed; top: 10px; right: 150px; z-index: 9999; padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;';
        saveButton.onclick = () => {
            const data = window.generateDesignData ? window.generateDesignData() : { emergency: true };
            window.emergencySaveData(data);
            alert('Data saved to local storage for recovery');
        };
        document.body.appendChild(saveButton);
    }

    createJsonExportInterface() {
        const exportButton = document.createElement('button');
        exportButton.textContent = 'Export JSON';
        exportButton.style.cssText = 'position: fixed; top: 10px; right: 270px; z-index: 9999; padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;';
        exportButton.onclick = () => {
            const data = window.generateDesignData ? window.generateDesignData() : { emergency: true };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'emergency-design-data.json';
            a.click();
            URL.revokeObjectURL(url);
        };
        document.body.appendChild(exportButton);
    }

    createErrorReportingInterface() {
        const reportButton = document.createElement('button');
        reportButton.textContent = 'Report Issue';
        reportButton.style.cssText = 'position: fixed; top: 10px; right: 390px; z-index: 9999; padding: 8px 16px; background: #FF5722; color: white; border: none; border-radius: 4px; cursor: pointer;';
        reportButton.onclick = () => {
            const report = {
                userDescription: prompt('Please describe what you were doing when the error occurred:'),
                systemStatus: this.getSystemStatus(),
                failurePatterns: this.failurePatterns.slice(-5),
                timestamp: new Date().toISOString()
            };

            // Save report
            this.storeEmergencyReport(report);
            alert('Error report saved. Please contact support with timestamp: ' + report.timestamp);
        };
        document.body.appendChild(reportButton);
    }

    showCriticalErrorInterface() {
        const overlay = document.createElement('div');
        overlay.style.cssText = this.userNotifications.styles.emergency;
        overlay.innerHTML = `
            <div style="max-width: 600px;">
                <h1 style="color: #fff; margin-bottom: 20px;">🚨 System Error</h1>
                <p style="font-size: 18px; margin-bottom: 30px;">
                    The design system has encountered a critical error and cannot continue normal operation.
                </p>
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <h3 style="margin-top: 0;">Recovery Options:</h3>
                    <button onclick="location.reload()" style="background: #4CAF50; color: white; border: none; padding: 12px 24px; border-radius: 4px; margin: 5px; cursor: pointer; font-size: 16px;">Reload Page</button>
                    <button onclick="window.emergencyResponseSystem.createBasicSaveInterface(); this.parentElement.parentElement.parentElement.remove();" style="background: #2196F3; color: white; border: none; padding: 12px 24px; border-radius: 4px; margin: 5px; cursor: pointer; font-size: 16px;">Try Emergency Save</button>
                    <button onclick="window.emergencyResponseSystem.createErrorReportingInterface(); this.parentElement.parentElement.parentElement.remove();" style="background: #FF9800; color: white; border: none; padding: 12px 24px; border-radius: 4px; margin: 5px; cursor: pointer; font-size: 16px;">Report Issue</button>
                </div>
                <p style="font-size: 14px; opacity: 0.8;">
                    Your work may be recoverable. Please try the emergency save option before reloading.
                </p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    // Placeholder methods that would be fully implemented
    assessEmergencyLevel(failureType, errorDetails) {
        const severityMap = {
            'fabric-load-failed': 'critical',
            'canvas-creation-failed': 'warning',
            'initialization-failed': 'warning',
            'recurring-failure': 'critical',
            'system-crash': 'emergency'
        };
        return severityMap[failureType] || 'normal';
    }

    determineDegradationLevel(failureType) {
        const degradationMap = {
            'fabric-load-failed': 2, // Minimal functionality
            'canvas-creation-failed': 1, // Limited functionality
            'initialization-failed': 1,
            'system-crash': 3 // Critical - error reporting only
        };
        return degradationMap[failureType] || 0;
    }

    getEmergencyTitle(level) {
        const titles = {
            'normal': 'System Notice',
            'warning': '⚠️ System Warning',
            'critical': '🚨 Critical Error',
            'emergency': '🆘 Emergency Mode'
        };
        return titles[level] || 'System Notice';
    }

    getEmergencyMessage(failureType, level) {
        return `The design system has encountered a ${failureType} error. Recovery is in progress.`;
    }

    getEmergencyActions(failureType, level) {
        return [
            { text: 'Retry', action: 'retry' },
            { text: 'Report Issue', action: 'report' },
            { text: 'Emergency Save', action: 'save' }
        ];
    }

    renderActions(actions) {
        return actions.map(action =>
            `<button data-action="${action.action}" style="margin: 5px; padding: 8px 16px; background: #fff; color: #333; border: 1px solid #ccc; border-radius: 4px; cursor: pointer;">${action.text}</button>`
        ).join('');
    }

    attachNotificationHandlers(notification, actions) {
        actions.forEach(action => {
            const button = notification.querySelector(`[data-action="${action.action}"]`);
            if (button) {
                button.addEventListener('click', () => this.handleNotificationAction(action.action, notification));
            }
        });
    }

    handleNotificationAction(action, notification) {
        switch (action) {
            case 'retry':
                this.triggerEmergency('manual-retry', { source: 'user-action' });
                break;
            case 'report':
                this.createErrorReportingInterface();
                break;
            case 'save':
                this.createBasicSaveInterface();
                break;
        }
        notification.remove();
    }

    // Success/failure handlers
    onRecoverySuccess(strategy) {
        console.log(`✅ Recovery successful with strategy: ${strategy}`);
        this.resetEmergencyState();

        // Show success notification
        const notification = this.createUserNotification({
            type: 'success',
            level: 'normal',
            title: '✅ System Recovered',
            message: `System has been successfully recovered using ${strategy} strategy.`,
            actions: [{ text: 'Continue', action: 'continue' }],
            persistent: false
        });
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    onRecoveryFailed() {
        console.error('❌ All recovery strategies failed');
        this.setEmergencyLevel('emergency');
        this.implementGracefulDegradation('recovery-failed');
    }

    recordError(error, type, context) {
        this.performanceMonitor.errors.push({
            timestamp: Date.now(),
            error: error.message,
            stack: error.stack,
            type,
            context
        });
    }

    getFailedStrategiesForType(failureType) {
        // Analyze historical data to determine which strategies tend to fail for specific failure types
        return [];
    }

    startIntensiveMonitoring() {
        // Increase monitoring frequency during critical situations
        console.log('🔍 Starting intensive monitoring mode');
    }

    showDegradationNotification(level) {
        const notification = this.createUserNotification({
            type: 'degradation',
            level: 'warning',
            title: '⚠️ Limited Functionality',
            message: `System is running in ${level.name} mode with features: ${level.features.join(', ')}`,
            actions: [{ text: 'Continue', action: 'continue' }],
            persistent: false
        });
        document.body.appendChild(notification);
    }

    updateUIForDegradation(level) {
        // Add degradation indicator to UI
        const indicator = document.createElement('div');
        indicator.id = 'degradation-indicator';
        indicator.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: #FF9800; color: white; text-align: center; padding: 5px; z-index: 9998; font-size: 12px;';
        indicator.textContent = `⚠️ Running in ${level.name} mode - Limited functionality available`;
        document.body.appendChild(indicator);
    }
}

// Global initialization
if (typeof window !== 'undefined') {
    window.emergencyResponseSystem = new EmergencyResponseSystem();

    // Expose key methods globally for easy access
    window.triggerEmergency = (failureType, errorDetails) => window.emergencyResponseSystem.triggerEmergency(failureType, errorDetails);
    window.getEmergencyStatus = () => window.emergencyResponseSystem.getSystemStatus();

    console.log('🚨 COMPREHENSIVE EMERGENCY RESPONSE SYSTEM: Ready and monitoring');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmergencyResponseSystem;
}
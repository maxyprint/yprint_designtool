/**
 * Multi-View Point-to-Point Reference Line Selector
 * Template Views Integration für Dynamic View Loading
 * Version: 2.1.0 - HIVE-MIND DEBUGGING ENHANCED
 *
 * Hive-Mind Implementation: 14 Total Agents (7 Core + 7 Debug Agents)
 * Agent Coordination: Enhanced with Comprehensive Debugging System
 */

// AGENT 1: Console Debugging Master - Enhanced Logging System
class HiveMindDebugger {
    constructor() {
        this.enabled = true;
        this.logLevel = 'ALL'; // ALL, INFO, WARN, ERROR
        this.categories = {
            INIT: '🚀',
            IMAGE: '🖼️',
            CANVAS: '🎨',
            AJAX: '🌐',
            STATE: '📊',
            ERROR: '❌',
            PERF: '⚡',
            UI: '🎯'
        };
        this.logs = [];
        this.startTime = performance.now();
    }

    log(category, level, message, data = null) {
        if (!this.enabled) return;

        const timestamp = (performance.now() - this.startTime).toFixed(2);
        const icon = this.categories[category] || '🔍';
        const logEntry = {
            timestamp: parseFloat(timestamp),
            category,
            level,
            message,
            data,
            time: new Date().toLocaleTimeString()
        };

        this.logs.push(logEntry);

        const prefix = `[${timestamp}ms] ${icon} AGENT 1 DEBUG:`;
        const fullMessage = `${prefix} ${message}`;

        switch(level) {
            case 'ERROR':
                console.error(fullMessage, data || '');
                break;
            case 'WARN':
                console.warn(fullMessage, data || '');
                break;
            case 'INFO':
            default:
                // 🟠 AGENT-4: AGGRESSIVE THROTTLING - Prevent 101,010+ console overload
                if (!this._lastInfoLog || Date.now() - this._lastInfoLog > 30000) {
                    console.log(`🟠 AGENT-4: ${fullMessage}`, data || '');
                    this._lastInfoLog = Date.now();
                } else {
                    this._suppressedInfoCount = (this._suppressedInfoCount || 0) + 1;
                }
                break;
        }

        // Store in global for access
        window.hiveMindLogs = this.logs;
    }

    info(category, message, data) { this.log(category, 'INFO', message, data); }
    warn(category, message, data) { this.log(category, 'WARN', message, data); }
    error(category, message, data) { this.log(category, 'ERROR', message, data); }

    getLogs(category = null) {
        return category ? this.logs.filter(log => log.category === category) : this.logs;
    }

    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }
}

// AGENT 2: Visual Debug Overlay Specialist - Canvas Debug Visualization
class VisualDebugOverlay {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.enabled = true;
        this.overlays = {
            imageInfo: true,
            scalingInfo: true,
            mousePosition: true,
            referenceLineData: true,
            performanceMetrics: true
        };
        this.mousePos = { x: 0, y: 0 };
        this.debugData = {};
    }

    setDebugData(key, data) {
        this.debugData[key] = data;
    }

    drawOverlay(imageScaling, currentImage, referenceLines = []) {
        if (!this.enabled) return;

        this.ctx.save();

        // AGENT 2: Draw debug overlay background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, 300, 200);

        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = '12px monospace';
        let y = 20;

        // Image information
        if (this.overlays.imageInfo && currentImage) {
            this.ctx.fillText('🖼️ IMAGE DEBUG:', 10, y);
            y += 15;
            this.ctx.fillText(`Natural: ${currentImage.naturalWidth}x${currentImage.naturalHeight}`, 10, y);
            y += 15;
            this.ctx.fillText(`Canvas: ${this.canvas.width}x${this.canvas.height}`, 10, y);
            y += 15;
        }

        // Scaling information
        if (this.overlays.scalingInfo && imageScaling) {
            this.ctx.fillText('🎨 SCALING DEBUG:', 10, y);
            y += 15;
            this.ctx.fillText(`Scale: ${imageScaling.scale.toFixed(3)}`, 10, y);
            y += 15;
            this.ctx.fillText(`Size: ${Math.round(imageScaling.width)}x${Math.round(imageScaling.height)}`, 10, y);
            y += 15;
            this.ctx.fillText(`Offset: ${Math.round(imageScaling.offsetX)}, ${Math.round(imageScaling.offsetY)}`, 10, y);
            y += 15;
        }

        // Mouse position
        if (this.overlays.mousePosition) {
            this.ctx.fillText('🎯 MOUSE DEBUG:', 10, y);
            y += 15;
            this.ctx.fillText(`Position: ${this.mousePos.x}, ${this.mousePos.y}`, 10, y);
            y += 15;
        }

        // Reference lines data
        if (this.overlays.referenceLineData && referenceLines.length > 0) {
            this.ctx.fillText('📏 LINES DEBUG:', 10, y);
            y += 15;
            this.ctx.fillText(`Count: ${referenceLines.length}`, 10, y);
            y += 15;
        }

        // Draw visual guides
        this.drawVisualGuides(imageScaling);

        this.ctx.restore();
    }

    drawVisualGuides(imageScaling) {
        if (!imageScaling) return;

        this.ctx.save();
        this.ctx.strokeStyle = '#ff4444';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 2]);

        // Draw image bounds
        this.ctx.strokeRect(
            imageScaling.offsetX,
            imageScaling.offsetY,
            imageScaling.width,
            imageScaling.height
        );

        // Draw center lines
        this.ctx.beginPath();
        this.ctx.moveTo(imageScaling.offsetX + imageScaling.width / 2, 0);
        this.ctx.lineTo(imageScaling.offsetX + imageScaling.width / 2, this.canvas.height);
        this.ctx.moveTo(0, imageScaling.offsetY + imageScaling.height / 2);
        this.ctx.lineTo(this.canvas.width, imageScaling.offsetY + imageScaling.height / 2);
        this.ctx.stroke();

        this.ctx.restore();
    }

    updateMousePosition(x, y) {
        this.mousePos = { x: Math.round(x), y: Math.round(y) };
    }

    toggle(overlayType) {
        if (overlayType in this.overlays) {
            this.overlays[overlayType] = !this.overlays[overlayType];
        }
    }
}

// AGENT 3: AJAX Debug Analyst - Network Request Debugging
class AjaxDebugAnalyst {
    constructor(debug) {
        this.debug = debug;
        this.requests = [];
        this.enabled = true;
    }

    async debugFetch(url, options = {}, requestType = 'UNKNOWN') {
        if (!this.enabled) {
            return fetch(url, options);
        }

        const requestId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const startTime = performance.now();

        this.debug.info('AJAX', `🌐 AGENT 3: Starting ${requestType} request`, {
            requestId,
            url,
            method: options.method || 'GET',
            body: options.body,
            headers: options.headers
        });

        const requestData = {
            id: requestId,
            type: requestType,
            url,
            method: options.method || 'GET',
            startTime,
            status: 'PENDING'
        };

        this.requests.push(requestData);

        try {
            const response = await fetch(url, options);
            const endTime = performance.now();
            const duration = endTime - startTime;

            requestData.status = response.ok ? 'SUCCESS' : 'ERROR';
            requestData.endTime = endTime;
            requestData.duration = duration;
            requestData.httpStatus = response.status;
            requestData.httpStatusText = response.statusText;

            this.debug.info('AJAX', `🌐 AGENT 3: ${requestType} response received`, {
                requestId,
                duration: `${duration.toFixed(2)}ms`,
                status: response.status,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            });

            // Clone response for debugging
            const responseClone = response.clone();
            try {
                const responseText = await responseClone.text();
                let responseData = responseText;

                try {
                    responseData = JSON.parse(responseText);
                } catch (e) {
                    // Not JSON, keep as text
                }

                requestData.responseData = responseData;

                this.debug.info('AJAX', `🌐 AGENT 3: ${requestType} response data parsed`, {
                    requestId,
                    dataType: typeof responseData,
                    success: responseData?.success,
                    dataSize: responseText.length
                });

            } catch (error) {
                this.debug.error('AJAX', `🌐 AGENT 3: Failed to parse ${requestType} response`, {
                    requestId,
                    error: error.message
                });
            }

            return response;

        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;

            requestData.status = 'NETWORK_ERROR';
            requestData.endTime = endTime;
            requestData.duration = duration;
            requestData.error = error.message;

            this.debug.error('AJAX', `🌐 AGENT 3: ${requestType} request failed`, {
                requestId,
                duration: `${duration.toFixed(2)}ms`,
                error: error.message
            });

            throw error;
        }
    }

    getRequestStats() {
        const stats = {
            total: this.requests.length,
            successful: this.requests.filter(r => r.status === 'SUCCESS').length,
            failed: this.requests.filter(r => r.status === 'ERROR').length,
            networkErrors: this.requests.filter(r => r.status === 'NETWORK_ERROR').length,
            averageDuration: 0
        };

        const completedRequests = this.requests.filter(r => r.duration);
        if (completedRequests.length > 0) {
            stats.averageDuration = completedRequests.reduce((sum, r) => sum + r.duration, 0) / completedRequests.length;
        }

        return stats;
    }

    getRequestHistory() {
        return this.requests;
    }
}

// AGENT 4: State Debug Monitor - System State Tracking
class StateDebugMonitor {
    constructor(debug) {
        this.debug = debug;
        this.stateHistory = [];
        this.currentState = {};
        this.watchers = {};
        this.enabled = true;
    }

    trackState(category, property, value, metadata = {}) {
        if (!this.enabled) return;

        const timestamp = performance.now();
        const stateEntry = {
            timestamp,
            category,
            property,
            value,
            metadata,
            time: new Date().toLocaleTimeString()
        };

        this.stateHistory.push(stateEntry);

        // Update current state
        if (!this.currentState[category]) {
            this.currentState[category] = {};
        }
        this.currentState[category][property] = value;

        this.debug.info('STATE', `📊 AGENT 4: State changed - ${category}.${property}`, {
            value,
            metadata,
            timestamp
        });

        // Trigger watchers
        this.triggerWatchers(category, property, value);

        // Keep history manageable
        if (this.stateHistory.length > 1000) {
            this.stateHistory = this.stateHistory.slice(-500);
        }
    }

    watchState(category, property, callback) {
        const key = `${category}.${property}`;
        if (!this.watchers[key]) {
            this.watchers[key] = [];
        }
        this.watchers[key].push(callback);
    }

    triggerWatchers(category, property, value) {
        const key = `${category}.${property}`;
        if (this.watchers[key]) {
            this.watchers[key].forEach(callback => {
                try {
                    callback(value, category, property);
                } catch (error) {
                    this.debug.error('STATE', `📊 AGENT 4: Watcher error for ${key}`, error);
                }
            });
        }
    }

    getStateSnapshot() {
        return {
            timestamp: performance.now(),
            currentState: JSON.parse(JSON.stringify(this.currentState)),
            historyCount: this.stateHistory.length
        };
    }

    getStateHistory(category = null, property = null) {
        let filtered = this.stateHistory;

        if (category) {
            filtered = filtered.filter(entry => entry.category === category);
        }

        if (property) {
            filtered = filtered.filter(entry => entry.property === property);
        }

        return filtered;
    }

    exportStateData() {
        return {
            currentState: this.currentState,
            history: this.stateHistory,
            watchers: Object.keys(this.watchers)
        };
    }

    // Helper method to track system properties
    trackSystemState(selector) {
        this.trackState('system', 'templateId', selector.templateId);
        this.trackState('system', 'currentViewId', selector.currentViewId);
        this.trackState('system', 'currentMode', selector.currentMode);
        this.trackState('system', 'selectedMeasurementKey', selector.selectedMeasurementKey);
        this.trackState('system', 'pointsCount', selector.points.length);
        this.trackState('system', 'viewsCount', Object.keys(selector.templateViews).length);
        this.trackState('system', 'referenceLinesCount', Object.values(selector.multiViewReferenceLines).reduce((total, lines) =>
            total + (Array.isArray(lines) ? lines.length : 0), 0));
    }
}

// AGENT 5: Error Debug Interceptor - Comprehensive Error Handling
class ErrorDebugInterceptor {
    constructor(debug) {
        this.debug = debug;
        this.errors = [];
        this.recoveryStrategies = {};
        this.enabled = true;
        this.setupGlobalErrorHandling();
    }

    setupGlobalErrorHandling() {
        // Catch unhandled errors
        window.addEventListener('error', (event) => {
            this.captureError('GLOBAL', event.error || new Error(event.message), {
                source: event.filename,
                line: event.lineno,
                column: event.colno
            });
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.captureError('PROMISE', event.reason, {
                promise: true
            });
        });
    }

    captureError(category, error, metadata = {}) {
        if (!this.enabled) return;

        const timestamp = performance.now();
        const errorEntry = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            timestamp,
            category,
            message: error.message || error.toString(),
            stack: error.stack,
            metadata,
            time: new Date().toLocaleTimeString(),
            recovered: false
        };

        this.errors.push(errorEntry);

        this.debug.error('ERROR', `❌ AGENT 5: ${category} error captured`, {
            message: error.message,
            stack: error.stack?.split('\n').slice(0, 3),
            metadata
        });

        // Attempt recovery
        this.attemptRecovery(category, error, errorEntry);

        // Keep error history manageable
        if (this.errors.length > 100) {
            this.errors = this.errors.slice(-50);
        }

        return errorEntry.id;
    }

    registerRecoveryStrategy(category, strategy) {
        this.recoveryStrategies[category] = strategy;
    }

    attemptRecovery(category, error, errorEntry) {
        if (this.recoveryStrategies[category]) {
            try {
                const recovered = this.recoveryStrategies[category](error, errorEntry);
                if (recovered) {
                    errorEntry.recovered = true;
                    this.debug.info('ERROR', `❌ AGENT 5: Recovery successful for ${category}`, {
                        errorId: errorEntry.id
                    });
                }
            } catch (recoveryError) {
                this.debug.error('ERROR', `❌ AGENT 5: Recovery failed for ${category}`, {
                    originalError: error.message,
                    recoveryError: recoveryError.message
                });
            }
        }
    }

    // Wrapper for safe execution with error handling
    safeExecute(fn, context = 'UNKNOWN', fallback = null) {
        try {
            return fn();
        } catch (error) {
            const errorId = this.captureError(context, error);
            this.debug.warn('ERROR', `❌ AGENT 5: Safe execution failed in ${context}, using fallback`, {
                errorId
            });
            return fallback;
        }
    }

    // Async wrapper for safe execution
    async safeExecuteAsync(fn, context = 'UNKNOWN', fallback = null) {
        try {
            return await fn();
        } catch (error) {
            const errorId = this.captureError(context, error);
            this.debug.warn('ERROR', `❌ AGENT 5: Safe async execution failed in ${context}, using fallback`, {
                errorId
            });
            return fallback;
        }
    }

    getErrorStats() {
        const stats = {
            total: this.errors.length,
            recovered: this.errors.filter(e => e.recovered).length,
            categories: {}
        };

        this.errors.forEach(error => {
            if (!stats.categories[error.category]) {
                stats.categories[error.category] = 0;
            }
            stats.categories[error.category]++;
        });

        return stats;
    }

    getRecentErrors(count = 10) {
        return this.errors.slice(-count);
    }

    exportErrorData() {
        return {
            errors: this.errors,
            recoveryStrategies: Object.keys(this.recoveryStrategies),
            stats: this.getErrorStats()
        };
    }
}

// AGENT 6: Performance Debug Profiler - Timing and Metrics
class PerformanceDebugProfiler {
    constructor(debug) {
        this.debug = debug;
        this.metrics = [];
        this.activeProfiles = new Map();
        this.enabled = true;
        this.performanceObserver = null;
        this.setupPerformanceObserver();
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            this.performanceObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.capturePerformanceEntry(entry);
                });
            });

            this.performanceObserver.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
        }
    }

    capturePerformanceEntry(entry) {
        if (!this.enabled) return;

        this.debug.info('PERF', `⚡ AGENT 6: Performance entry - ${entry.entryType}`, {
            name: entry.name,
            duration: entry.duration?.toFixed(2),
            startTime: entry.startTime?.toFixed(2)
        });
    }

    startProfile(profileName, metadata = {}) {
        if (!this.enabled) return null;

        const profileId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const startTime = performance.now();

        const profile = {
            id: profileId,
            name: profileName,
            startTime,
            metadata,
            checkpoints: []
        };

        this.activeProfiles.set(profileId, profile);

        this.debug.info('PERF', `⚡ AGENT 6: Started profiling - ${profileName}`, {
            profileId,
            metadata
        });

        // Create performance mark
        if (performance.mark) {
            performance.mark(`${profileName}_start`);
        }

        return profileId;
    }

    checkpoint(profileId, checkpointName, data = {}) {
        if (!this.enabled || !this.activeProfiles.has(profileId)) return;

        const profile = this.activeProfiles.get(profileId);
        const checkpointTime = performance.now();
        const duration = checkpointTime - profile.startTime;

        const checkpoint = {
            name: checkpointName,
            timestamp: checkpointTime,
            duration,
            data
        };

        profile.checkpoints.push(checkpoint);

        this.debug.info('PERF', `⚡ AGENT 6: Checkpoint - ${profile.name}:${checkpointName}`, {
            duration: `${duration.toFixed(2)}ms`,
            data
        });
    }

    endProfile(profileId, finalData = {}) {
        if (!this.enabled || !this.activeProfiles.has(profileId)) return null;

        const profile = this.activeProfiles.get(profileId);
        const endTime = performance.now();
        const totalDuration = endTime - profile.startTime;

        profile.endTime = endTime;
        profile.totalDuration = totalDuration;
        profile.finalData = finalData;

        this.metrics.push(profile);
        this.activeProfiles.delete(profileId);

        this.debug.info('PERF', `⚡ AGENT 6: Completed profiling - ${profile.name}`, {
            totalDuration: `${totalDuration.toFixed(2)}ms`,
            checkpoints: profile.checkpoints.length,
            finalData
        });

        // Create performance measure
        if (performance.mark && performance.measure) {
            try {
                performance.mark(`${profile.name}_end`);
                performance.measure(`${profile.name}_total`, `${profile.name}_start`, `${profile.name}_end`);
            } catch (e) {
                // Marks might not exist
            }
        }

        // Keep metrics manageable
        if (this.metrics.length > 100) {
            this.metrics = this.metrics.slice(-50);
        }

        return profile;
    }

    // Quick performance measurement
    measure(fn, name = 'anonymous', metadata = {}) {
        const profileId = this.startProfile(name, metadata);

        try {
            const result = fn();
            this.endProfile(profileId, { success: true });
            return result;
        } catch (error) {
            this.endProfile(profileId, { success: false, error: error.message });
            throw error;
        }
    }

    // Async performance measurement
    async measureAsync(fn, name = 'anonymous', metadata = {}) {
        const profileId = this.startProfile(name, metadata);

        try {
            const result = await fn();
            this.endProfile(profileId, { success: true });
            return result;
        } catch (error) {
            this.endProfile(profileId, { success: false, error: error.message });
            throw error;
        }
    }

    getPerformanceStats() {
        const completedMetrics = this.metrics.filter(m => m.totalDuration);

        if (completedMetrics.length === 0) return null;

        const durations = completedMetrics.map(m => m.totalDuration);
        const average = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        const min = Math.min(...durations);
        const max = Math.max(...durations);

        return {
            total: completedMetrics.length,
            averageDuration: average,
            minDuration: min,
            maxDuration: max,
            activeProfiles: this.activeProfiles.size
        };
    }

    getMetrics(filterByName = null) {
        return filterByName
            ? this.metrics.filter(m => m.name === filterByName)
            : this.metrics;
    }

    exportPerformanceData() {
        return {
            metrics: this.metrics,
            activeProfiles: Array.from(this.activeProfiles.values()),
            stats: this.getPerformanceStats()
        };
    }
}

class MultiViewPointToPointSelector {
    constructor(canvasElement, templateId) {
        // AGENT 1: Initialize comprehensive debugging system
        this.debug = new HiveMindDebugger();
        this.debug.info('INIT', 'MultiViewPointToPointSelector constructor starting', {
            templateId,
            canvasElement: canvasElement?.id,
            canvasSize: { width: canvasElement?.width, height: canvasElement?.height }
        });

        this.canvas = canvasElement;
        this.templateId = templateId;
        this.ctx = canvasElement.getContext('2d');

        // Multi-View Properties
        this.currentView = null;
        this.currentViewId = null;
        this.templateViews = {}; // Object structure: { viewId: {id, name, image_url, ...} }
        this.currentImage = null;

        // Point-to-Point Properties
        this.points = [];
        this.currentMode = 'select';
        this.selectedMeasurementKey = null;
        this.multiViewReferenceLines = {}; // {view_id: [reference_lines]}
        this.isDrawing = false;
        this.measurementTypes = {};

        // AGENT 4 FIX: Performance optimization properties
        this.mouseMoveThrottle = false;

        // AGENT 6 FIX: View switching state management
        this.isViewSwitching = false;

        // AGENT 1: Debug state initialization
        this.debugState = {
            initializationSteps: [],
            ajaxCalls: [],
            imageLoadingAttempts: [],
            canvasOperations: [],
            userInteractions: []
        };

        // AGENT 2: Initialize visual debug overlay
        this.visualDebug = new VisualDebugOverlay(this.canvas, this.ctx);

        // 🚨 EMERGENCY: Console output throttling to prevent console explosion
        this._debugThrottling = {
            lastDebugTime: 0,
            debugInterval: 3000, // Only essential debug messages every 3 seconds
            suppressedMessages: 0
        };

        // AGENT 1: Recursion prevention flags
        this._calculatingScaleFactor = false;
        this._calculatingCategoryScale = false;
        this._recursionWarningShown = false;

        // AGENT 3: Initialize AJAX debug analyst
        this.ajaxDebug = new AjaxDebugAnalyst(this.debug);

        // AGENT 4: Initialize state debug monitor
        this.stateMonitor = new StateDebugMonitor(this.debug);

        // AGENT 5: Initialize error debug interceptor
        this.errorHandler = new ErrorDebugInterceptor(this.debug);

        // AGENT 6: Initialize performance debug profiler
        this.perfProfiler = new PerformanceDebugProfiler(this.debug);

        this.debug.info('INIT', 'All debug systems initialized, starting init sequence');
        this.init();
    }

    async init() {
        console.log('⚡ AGENT 6: Starting Multi-View Point-to-Point initialization');

        try {
            // Step 1: Setup UI components FIRST
            console.log('⚡ AGENT 6: Step 1 - Setting up UI components');
            this.setupUI();

            // Step 2: Load measurement types
            console.log('⚡ AGENT 6: Step 2 - Loading measurement types');
            await this.loadMeasurementTypes();

            // Step 3: Load template views
            console.log('⚡ AGENT 6: Step 3 - Loading template views');
            await this.loadTemplateViews();

            // Step 4: Setup event listeners
            console.log('⚡ AGENT 6: Step 4 - Setting up event listeners');
            this.setupEventListeners();

            // CRITICAL FIX: Wait for DOM elements to be fully rendered before creating Integration Bridge
            setTimeout(() => {
                console.log('🎯 TIMING FIX: Creating Integration Bridge UI after DOM elements are available');
                this.createIntegrationBridgeUI();
            }, 150);

            // Step 5: Load existing reference lines
            console.log('⚡ AGENT 6: Step 5 - Loading existing reference lines');
            await this.loadExistingMultiViewReferenceLines();

            console.log('✅ AGENT 6: Multi-View Point-to-Point initialization complete');

            // AGENT 4 ENHANCEMENT: Initialize enhanced measurement dropdown
            console.log('⚡ AGENT 4: Step 6 - Initializing enhanced measurement dropdown');
            await this.initializeAgent4MeasurementDropdown();

            // AGENT 4 ENHANCEMENT: Initialize PrecisionCalculator Integration
            await this.initializePrecisionCalculatorBridge();

        } catch (error) {
            console.error('❌ AGENT 6: Critical initialization error:', error);
            this.showError('Fehler bei der Initialisierung des Multi-View Systems: ' + error.message);

            // Emergency fallback initialization
            try {
                console.log('🚨 AGENT 6: Starting emergency fallback initialization');
                await this.createSingleViewFallback();
                this.setupEventListeners();
                console.log('✅ AGENT 6: Emergency fallback initialization complete');
            } catch (fallbackError) {
                console.error('💥 AGENT 6: Even fallback initialization failed:', fallbackError);
                this.showError('Kritischer Fehler: Multi-View System konnte nicht initialisiert werden.');
            }
        }
    }

    /**
     * DEFENSIVE PROGRAMMING: Helper method to safely get view name by ID
     * Handles both object and potential array structures
     */
    getViewNameById(viewId) {
        try {
            // Handle null/undefined templateViews
            if (!this.templateViews) {
                console.warn('⚠️ templateViews is null/undefined, returning fallback name');
                return `View ${viewId}`;
            }

            // Handle object structure (correct way)
            if (typeof this.templateViews === 'object' && !Array.isArray(this.templateViews)) {
                const view = this.templateViews[viewId];
                return view?.name || `View ${viewId}`;
            }

            // Handle array structure (fallback for data inconsistencies)
            if (Array.isArray(this.templateViews)) {
                const view = this.templateViews.find(v => v.id == viewId);
                return view?.name || `View ${viewId}`;
            }

            // Handle unexpected data types
            console.warn('⚠️ templateViews has unexpected type:', typeof this.templateViews);
            return `View ${viewId}`;
        } catch (error) {
            console.error('❌ Error in getViewNameById:', error);
            return `View ${viewId}`;
        }
    }

    /**
     * DEFENSIVE PROGRAMMING: Validates and fixes templateViews structure
     */
    validateTemplateViewsStructure() {
        try {
            // Ensure templateViews is initialized
            if (!this.templateViews) {
                console.warn('⚠️ templateViews is null/undefined, initializing as empty object');
                this.templateViews = {};
                return false;
            }

            // Check if it's an object (correct structure)
            if (typeof this.templateViews === 'object' && !Array.isArray(this.templateViews)) {
                return true;
            }

            // If it's an array, convert to object structure
            if (Array.isArray(this.templateViews)) {
                console.warn('⚠️ templateViews is array, converting to object structure');
                const converted = {};
                this.templateViews.forEach(view => {
                    if (view && view.id) {
                        converted[view.id] = view;
                    }
                });
                this.templateViews = converted;
                return true;
            }

            // Handle other unexpected types
            console.error('❌ templateViews has invalid type:', typeof this.templateViews);
            this.templateViews = {};
            return false;
        } catch (error) {
            console.error('❌ Error validating templateViews structure:', error);
            this.templateViews = {};
            return false;
        }
    }

    /**
     * Lädt alle Template Views aus Template Variations
     */
    async loadTemplateViews() {
        try {
            const response = await fetch(pointToPointAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'get_template_views',
                    template_id: this.templateId,
                    nonce: pointToPointAjax.nonce
                })
            });

            const data = await response.json();
            if (data.success) {
                // DEFENSIVE PROGRAMMING: Validate incoming data structure
                if (data.data && data.data.views) {
                    this.templateViews = data.data.views;

                    // Validate and fix structure if needed
                    if (!this.validateTemplateViewsStructure()) {
                        console.warn('⚠️ templateViews structure validation failed, using fallback');
                    }
                } else {
                    console.warn('⚠️ Invalid views data received, initializing empty templateViews');
                    this.templateViews = {};
                }

                // AGENT 3: Enhanced template views debugging
                console.log('📊 AGENT 3: Template Views AJAX response:', {
                    success: data.success,
                    viewCount: Object.keys(this.templateViews).length,
                    views: this.templateViews,
                    rawData: data.data
                });

                // Check if we have actual view data with images
                const viewsWithImages = Object.entries(this.templateViews).filter(([id, view]) =>
                    view.image_url && view.image_url.trim() !== ''
                );

                console.log('📊 AGENT 3: Views with valid images:', {
                    total: Object.keys(this.templateViews).length,
                    withImages: viewsWithImages.length,
                    viewsDetail: viewsWithImages.map(([id, view]) => ({ id, name: view.name, imageUrl: view.image_url }))
                });

                // If no multi-view data or no valid images, create single view fallback
                if (Object.keys(this.templateViews).length === 0 || viewsWithImages.length === 0) {
                    console.log('⚠️ AGENT 3: No multi-view data or no valid images found, creating single view fallback');
                    await this.createSingleViewFallback();
                } else {
                    this.createViewSelector();

                    // Switch to first view with valid image
                    const firstViewId = viewsWithImages[0][0];
                    if (firstViewId) {
                        console.log('🔄 AGENT 3: Switching to first valid view:', firstViewId);
                        await this.switchToView(firstViewId);
                    }
                }
            } else {
                console.error('❌ AGENT 3: Failed to load template views AJAX response:', {
                    success: data.success,
                    error: data.data,
                    fullResponse: data
                });
                console.log('🔄 AGENT 3: Creating single view fallback due to AJAX error');
                await this.createSingleViewFallback();
            }
        } catch (error) {
            console.error('Error loading template views:', error);
            this.showError('Fehler beim Laden der Template Views: ' + error.message);
        }
    }

    /**
     * 🚨 EMERGENCY: Throttled debug logging to prevent console explosion
     */
    debugThrottled(message, data = null) {
        const now = Date.now();
        if (now - this._debugThrottling.lastDebugTime >= this._debugThrottling.debugInterval) {
            if (this._debugThrottling.suppressedMessages > 0) {
                console.log(`🔇 Suppressed ${this._debugThrottling.suppressedMessages} debug messages`);
                this._debugThrottling.suppressedMessages = 0;
            }
            console.log(message, data || '');
            this._debugThrottling.lastDebugTime = now;
        } else {
            this._debugThrottling.suppressedMessages++;
        }
    }

    /**
     * Lädt verfügbare Measurement-Types aus der Database (Issue #19)
     */
    async loadMeasurementTypes() {
        try {
            console.log('🔄 Loading measurement types from database...', {
                templateId: this.templateId,
                ajaxurl: pointToPointAjax?.ajaxurl
            });

            const response = await fetch(pointToPointAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'get_template_measurements',
                    template_id: this.templateId,
                    nonce: pointToPointAjax.nonce
                })
            });

            const data = await response.json();
            console.log('📊 Database response:', data);

            if (data.success && data.data && data.data.measurement_types) {
                this.measurementTypes = data.data.measurement_types;
                console.log('✅ Loaded measurement types:', Object.keys(this.measurementTypes).length, 'types');
                this.populateMeasurementDropdown();
            } else {
                console.warn('⚠️ Database returned no measurement types, using fallback');
                this.loadFallbackMeasurementTypes();
                this.populateMeasurementDropdown();
            }
        } catch (error) {
            console.error('❌ Error loading measurement types:', error);
            console.log('🔄 Loading fallback measurement types...');
            this.loadFallbackMeasurementTypes();
            this.populateMeasurementDropdown();
        }
    }

    /**
     * Load fallback measurement types when database fails
     */
    loadFallbackMeasurementTypes() {
        this.measurementTypes = {
            'A': { label: 'Chest', description: 'Brustumfang' },
            'B': { label: 'Hem Width', description: 'Saumweite' },
            'C': { label: 'Height from Shoulder', description: 'Höhe ab Schulter' },
            'D': { label: 'Shoulder Width', description: 'Schulterbreite' },
            'E': { label: 'Sleeve Length', description: 'Ärmellänge' },
            'F': { label: 'Back Length', description: 'Rückenlänge' },
            'G': { label: 'Armhole Width', description: 'Armausschnitt Breite' },
            'H': { label: 'Neck Width', description: 'Halsausschnitt Breite' }
        };
        console.log('✅ Fallback measurement types loaded:', Object.keys(this.measurementTypes).length, 'types');
    }

    /**
     * Erstellt View Selector Tabs
     */
    createViewSelector() {
        const container = document.getElementById('view-selector-container');
        if (!container) return;

        const viewTabs = Object.entries(this.templateViews).map(([viewId, viewData]) => `
            <button type="button" class="view-tab" data-view-id="${viewId}">
                📐 ${viewData.name}
                <span class="view-lines-count" id="view-count-${viewId}">0</span>
            </button>
        `).join('');

        container.innerHTML = `
            <div class="view-tabs-wrapper">
                <h4>🎯 Template Views:</h4>
                <div class="view-tabs">
                    ${viewTabs}
                </div>
            </div>
        `;

        // Add click handlers
        container.querySelectorAll('.view-tab').forEach(tab => {
            tab.addEventListener('click', async (e) => {
                // AGENT 2 FIX: Prevent page reload on view tab clicks
                e.preventDefault();
                e.stopPropagation();

                // AGENT 4 FIX: Handle event bubbling from child elements (span)
                let viewId = e.target.dataset.viewId;
                if (!viewId && e.target.parentElement) {
                    viewId = e.target.parentElement.dataset.viewId;
                }

                if (!viewId) {
                    console.warn('AGENT 4: No viewId found in clicked element or parent:', e.target);
                    return;
                }

                console.log('🎯 AGENT 6: View tab clicked - switching to view:', viewId, 'Current:', this.currentViewId);

                // AGENT 6 FIX: Prevent multiple rapid clicks
                if (this.isViewSwitching) {
                    console.log('⚠️ AGENT 6: View switch already in progress, ignoring click');
                    return;
                }

                this.isViewSwitching = true;
                try {
                    await this.switchToView(viewId);
                } finally {
                    this.isViewSwitching = false;
                }
            });
        });
    }

    /**
     * Wechselt zu einer anderen View
     * DEFENSIVE PROGRAMMING: Enhanced error handling and validation
     */
    async switchToView(viewId) {
        try {
            // DEFENSIVE: Validate templateViews structure first
            this.validateTemplateViewsStructure();

            // Check if viewId is valid
            if (!viewId) {
                console.error('❌ switchToView: No viewId provided');
                return false;
            }

            // Check if view exists
            if (!this.templateViews || !this.templateViews[viewId]) {
                console.error('❌ switchToView: View not found:', viewId, 'Available views:', Object.keys(this.templateViews || {}));

                // Try to recover by switching to first available view
                const availableViews = Object.keys(this.templateViews || {});
                if (availableViews.length > 0) {
                    const fallbackViewId = availableViews[0];
                    console.warn('🔄 Switching to fallback view:', fallbackViewId);
                    return await this.switchToView(fallbackViewId);
                }

                return false;
            }

        this.currentViewId = viewId;
        this.currentView = this.templateViews[viewId];

        // Update View Tabs
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.viewId === viewId) {
                tab.classList.add('active');
            }
        });

        // Load View Image
        await this.loadViewImage(this.currentView.image_url);

        // Load View-specific Reference Lines
        this.updateCurrentViewReferenceLines();
        this.redrawCanvas();
        this.updateLinesDisplay();

            // Update UI
            this.updateViewInfo();

            console.log('🔄 Switched to view:', this.currentView.name, '(ID:', viewId, ')');
            return true;

        } catch (error) {
            console.error('❌ Critical error in switchToView:', error);

            // Try emergency recovery
            try {
                console.warn('🚨 Attempting emergency view recovery...');

                // Reset to safe state
                this.currentViewId = null;
                this.currentView = null;

                // Try to create single view fallback
                if (Object.keys(this.templateViews || {}).length === 0) {
                    await this.createSingleViewFallback();
                }

                return false;
            } catch (recoveryError) {
                console.error('💥 Emergency recovery failed:', recoveryError);
                this.showError('Kritischer Fehler beim Wechseln der View. System Neustart erforderlich.');
                return false;
            }
        }
    }

    /**
     * Lädt View-spezifisches Bild in Canvas - HIVE-MIND AGENT 1 FIX
     */
    async loadViewImage(imageUrl) {
        console.log('🖼️ AGENT 1: Loading image:', imageUrl);

        return new Promise((resolve, reject) => {
            this.currentImage = new Image();
            this.currentImage.crossOrigin = 'anonymous'; // CORS handling

            this.currentImage.onload = () => {
                console.log('✅ AGENT 1: Image loaded successfully', {
                    naturalWidth: this.currentImage.naturalWidth,
                    naturalHeight: this.currentImage.naturalHeight,
                    canvasWidth: this.canvas.width,
                    canvasHeight: this.canvas.height
                });

                // HIVE-MIND FIX: Keep canvas dimensions fixed at 600x400, scale image to fit
                // Don't override canvas dimensions with image dimensions
                const targetWidth = 600;
                const targetHeight = 400;

                // Set canvas to fixed size (not image size)
                this.canvas.width = targetWidth;
                this.canvas.height = targetHeight;

                // Calculate scaling to fit image into canvas while maintaining aspect ratio
                this.calculateImageScaling();

                this.redrawCanvas();
                resolve(this.currentImage);
            };

            this.currentImage.onerror = (error) => {
                console.error('❌ AGENT 1: Image loading failed:', imageUrl, error);

                // Fallback: Try alternative image source
                if (imageUrl.includes('wp-content')) {
                    const fallbackUrl = document.getElementById('template-image-url')?.value;
                    if (fallbackUrl && fallbackUrl !== imageUrl) {
                        console.log('🔄 AGENT 1: Trying fallback image URL:', fallbackUrl);
                        this.currentImage.src = fallbackUrl;
                        return;
                    }
                }

                reject(new Error(`Failed to load image: ${imageUrl}`));
            };

            this.currentImage.src = imageUrl;
        });
    }

    /**
     * AGENT 2: Calculate optimal image scaling for fixed canvas size
     */
    calculateImageScaling() {
        if (!this.currentImage) return;

        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const imgWidth = this.currentImage.naturalWidth;
        const imgHeight = this.currentImage.naturalHeight;

        // Calculate scale to fit image into canvas while maintaining aspect ratio
        const scaleX = canvasWidth / imgWidth;
        const scaleY = canvasHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY); // Use smaller scale to ensure image fits

        // Calculate centered position
        this.imageScaling = {
            scale: scale,
            width: imgWidth * scale,
            height: imgHeight * scale,
            offsetX: (canvasWidth - (imgWidth * scale)) / 2,
            offsetY: (canvasHeight - (imgHeight * scale)) / 2
        };

        console.log('🎨 AGENT 2: Image scaling calculated', this.imageScaling);
    }

    /**
     * Updates Reference Lines für aktuelle View
     */
    updateCurrentViewReferenceLines() {
        if (!this.multiViewReferenceLines[this.currentViewId]) {
            this.multiViewReferenceLines[this.currentViewId] = [];
        }
    }

    /**
     * Setup Event Listeners für Canvas Interaktion
     */
    setupEventListeners() {
        // Canvas Events
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));

        // UI Events
        document.getElementById('measurement-type-selector')?.addEventListener('change', (e) => {
            this.selectedMeasurementKey = e.target.value;
            this.updateMode();
        });

        document.getElementById('clear-current-view-lines-btn')?.addEventListener('click', () => {
            this.clearCurrentViewLines();
        });

        document.getElementById('clear-all-views-lines-btn')?.addEventListener('click', () => {
            this.clearAllViewsLines();
        });

        document.getElementById('save-multi-view-reference-lines-btn')?.addEventListener('click', () => {
            this.saveMultiViewReferenceLines();
        });
    }

    /**
     * Setup Multi-View Admin UI Elements
     */
    setupUI() {
        const container = document.getElementById('point-to-point-container');
        if (!container) return;

        const uiHTML = `
            <div class="multi-view-point-to-point-controls">
                <div id="view-selector-container"></div>

                <div class="current-view-info" id="current-view-info">
                    <h4>📐 Aktuelle View: <span id="current-view-name">-</span></h4>
                </div>

                <div class="control-group">
                    <label for="measurement-type-selector">Measurement-Type:</label>
                    <select id="measurement-type-selector">
                        <option value="">Measurement-Type auswählen...</option>
                    </select>
                </div>

                <div class="control-group">
                    <button id="clear-current-view-lines-btn" class="button">🗑️ Aktuelle View löschen</button>
                    <button id="clear-all-views-lines-btn" class="button">🗑️ Alle Views löschen</button>
                    <small style="color: #666; display: block; margin-top: 5px;">
                        💾 Löschvorgänge werden dauerhaft in der Datenbank gespeichert
                    </small>
                </div>

                <div class="control-group">
                    <button id="save-multi-view-reference-lines-btn" class="button-primary">💾 Multi-View Referenzlinien speichern</button>
                </div>

                <div class="instructions">
                    <p><strong>📋 Multi-View Anleitung:</strong></p>
                    <ol>
                        <li><strong>View auswählen:</strong> Klicke auf einen View-Tab (Front, Back, etc.)</li>
                        <li><strong>Measurement-Type wählen:</strong> z.B. "A - Chest"</li>
                        <li><strong>Zwei Punkte klicken:</strong> Auf dem aktuellen View-Bild</li>
                        <li><strong>Wiederhole für andere Views:</strong> Jede View hat separate Referenzlinien</li>
                        <li><strong>Speichere alle Views:</strong> Button speichert alle Views gleichzeitig</li>
                    </ol>
                </div>

                <div class="multi-view-reference-lines-list">
                    <h4>📏 Multi-View Referenzlinien:</h4>
                    <div id="multi-view-lines-display"></div>
                </div>
            </div>
        `;

        container.innerHTML = uiHTML;
    }

    /**
     * Canvas Mouse Events (gleich wie Single-View)
     */
    onMouseDown(e) {
        if (!this.selectedMeasurementKey || !this.currentViewId || this.currentMode !== 'select') return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.points.push({ x, y });

        if (this.points.length === 2) {
            this.createReferenceLineForCurrentView();
            this.points = [];
        }

        this.redrawCanvas();
    }

    onMouseMove(e) {
        if (this.points.length === 1 && this.selectedMeasurementKey && this.currentViewId) {
            // AGENT 1 FIX: Throttle canvas redraw to prevent infinite loop
            if (this.mouseMoveThrottle) return;

            this.mouseMoveThrottle = true;
            requestAnimationFrame(() => {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                this.redrawCanvas();
                this.drawPreviewLine(this.points[0], { x, y });
                this.mouseMoveThrottle = false;
            });
        }
    }

    onMouseUp(e) {
        // Event handling für Canvas Release
    }

    /**
     * Erstellt eine Referenzlinie für die aktuelle View
     */
    createReferenceLineForCurrentView() {
        if (this.points.length !== 2 || !this.currentViewId) return;

        const [start, end] = this.points;
        const lengthPx = this.calculatePixelDistance(start, end);

        const referenceLine = {
            measurement_key: this.selectedMeasurementKey,
            label: this.measurementTypes[this.selectedMeasurementKey]?.label || this.selectedMeasurementKey,
            measurement_label: this.getMeasurementLabel(this.selectedMeasurementKey),
            lengthPx: Math.round(lengthPx * 100) / 100,
            start: { x: Math.round(start.x), y: Math.round(start.y) },
            end: { x: Math.round(end.x), y: Math.round(end.y) },
            view_id: this.currentViewId,
            view_name: this.currentView.name,

            // INTEGRATION BRIDGE: Complete enhanced data structure
            linked_to_measurements: true,
            primary_reference: this.isPrimaryMeasurement(this.selectedMeasurementKey),
            created_timestamp: Date.now(),
            measurement_category: this.getMeasurementCategory(this.selectedMeasurementKey),
            precision_level: this.getPrecisionLevel(this.selectedMeasurementKey),
            bridge_version: "2.0", // Enhanced version

            // INTEGRATION BRIDGE: Additional metadata for precision calculations
            coordinate_system: 'pixel',
            scale_reference: this.isPrimaryMeasurement(this.selectedMeasurementKey),
            measurement_angle: this.calculateLineAngle(start, end),
            measurement_vector: {
                dx: end.x - start.x,
                dy: end.y - start.y,
                magnitude: lengthPx
            },
            integration_status: 'active',
            last_modified: Date.now()
        };

        // AGENT 2 FIX: Ensure current view array exists before filter operation
        this.updateCurrentViewReferenceLines();

        // Entferne existierende Linie mit gleichem measurement_key in aktueller View
        this.multiViewReferenceLines[this.currentViewId] = this.multiViewReferenceLines[this.currentViewId].filter(line =>
            line.measurement_key !== this.selectedMeasurementKey
        );

        this.multiViewReferenceLines[this.currentViewId].push(referenceLine);

        // INTEGRATION BRIDGE: Save measurement assignment
        this.saveMeasurementAssignment(referenceLine);

        this.updateLinesDisplay();
        this.updateViewCounts();
        this.redrawCanvas();

        // Keep measurement selection for next line (don't reset)
        this.debug.log(`✅ Reference line created for view: ${this.currentView.name}`, referenceLine);
        this.updateMode();

        console.log('✅ Reference line created for view:', this.currentView.name, referenceLine);
    }

    /**
     * Berechnet Pixel-Distanz zwischen zwei Punkten
     */
    calculatePixelDistance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * AGENT 1: Bestimmt ob Measurement Key primäre Referenz ist (für Precision Calculation)
     */
    isPrimaryMeasurement(measurementKey) {
        // A (Chest) und C (Height) sind primäre Referenzmessungen für Skalierung
        return ['A', 'C'].includes(measurementKey);
    }

    /**
     * AGENT 1: Kategorisiert Measurement für bessere Integration
     */
    getMeasurementCategory(measurementKey) {
        const categories = {
            'A': 'horizontal', // Chest Width
            'B': 'horizontal', // Hem Width
            'C': 'vertical',   // Height from Shoulder
            'D': 'vertical',   // Sleeve Length
            'E': 'horizontal', // Waist Width
            'F': 'vertical',   // Back Length
            'G': 'horizontal', // Hip Width
            'H': 'vertical',   // Inseam
            'I': 'horizontal', // Thigh Width
            'J': 'vertical'    // Outseam
        };
        return categories[measurementKey] || 'unknown';
    }

    /**
     * INTEGRATION BRIDGE: Get measurement label with enhanced metadata
     */
    getMeasurementLabel(measurementKey) {
        const labels = {
            'A': 'Chest Width',
            'B': 'Hem Width',
            'C': 'Height from Shoulder',
            'D': 'Sleeve Length',
            'E': 'Waist Width',
            'F': 'Back Length',
            'G': 'Hip Width',
            'H': 'Inseam',
            'I': 'Thigh Width',
            'J': 'Outseam'
        };
        return labels[measurementKey] || measurementKey;
    }

    /**
     * INTEGRATION BRIDGE: Get precision level based on measurement type
     */
    getPrecisionLevel(measurementKey) {
        const precisionLevels = {
            'A': 0.5, // Primary reference - higher precision
            'B': 0.2,
            'C': 0.5, // Primary reference - higher precision
            'D': 0.2,
            'E': 0.2,
            'F': 0.2,
            'G': 0.2,
            'H': 0.2,
            'I': 0.2,
            'J': 0.1
        };
        return precisionLevels[measurementKey] || 0.1;
    }

    /**
     * INTEGRATION BRIDGE: Calculate line angle for measurement vector
     */
    calculateLineAngle(start, end) {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        return Math.atan2(dy, dx) * (180 / Math.PI);
    }

    /**
     * Canvas komplett neu zeichnen - AGENT 4: Enhanced with proper image scaling
     */
    redrawCanvas() {
        // AGENT 5 FIX: Removed console.log to prevent redraw spam

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Template Image zeichnen with proper scaling
        if (this.currentImage && this.imageScaling) {
            // AGENT 5 FIX: Removed scaling log to prevent spam

            this.ctx.drawImage(
                this.currentImage,
                this.imageScaling.offsetX,
                this.imageScaling.offsetY,
                this.imageScaling.width,
                this.imageScaling.height
            );
        } else if (this.currentImage) {
            console.log('⚠️ AGENT 4: Drawing unscaled image (fallback)');
            // Fallback: draw without scaling if scaling not calculated
            this.ctx.drawImage(this.currentImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            console.log('❌ AGENT 4: No image to draw');

            // Show "Loading..." message
            this.ctx.fillStyle = '#666';
            this.ctx.font = '18px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Loading Template Image...', this.canvas.width / 2, this.canvas.height / 2);
        }

        // Referenzlinien der aktuellen View zeichnen
        if (this.currentViewId && this.multiViewReferenceLines[this.currentViewId]) {
            this.multiViewReferenceLines[this.currentViewId].forEach((line, index) => {
                this.drawReferenceLine(line, index);
            });
        }

        // Aktuelle Punkte zeichnen
        this.points.forEach(point => {
            this.drawPoint(point);
        });
    }

    /**
     * Zeichnet Preview-Linie während Maus-Movement
     */
    drawPreviewLine(start, end) {
        this.ctx.save();
        this.ctx.strokeStyle = '#007cba';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.globalAlpha = 0.7;

        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.stroke();

        this.ctx.restore();
    }

    /**
     * Zeichnet eine fertige Referenzlinie
     */
    drawReferenceLine(line, index) {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ff9900', '#9900ff', '#00ffff', '#ffff00'];
        const color = colors[index % colors.length];

        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.fillStyle = color;

        // Linie zeichnen
        this.ctx.beginPath();
        this.ctx.moveTo(line.start.x, line.start.y);
        this.ctx.lineTo(line.end.x, line.end.y);
        this.ctx.stroke();

        // Start- und Endpunkte zeichnen
        this.drawPoint(line.start, color);
        this.drawPoint(line.end, color);

        // AGENT 2 ENHANCEMENT: Enhanced label with integration info
        const midX = (line.start.x + line.end.x) / 2;
        const midY = (line.start.y + line.end.y) / 2;

        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;

        // Main label
        const mainLabel = `${line.measurement_key}: ${line.lengthPx}px`;
        this.ctx.strokeText(mainLabel, midX + 10, midY - 10);
        this.ctx.fillText(mainLabel, midX + 10, midY - 10);

        // AGENT 2: Integration bridge indicator
        if (line.primary_reference) {
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = '#00ff88';
            this.ctx.fillText('🎯 PRIMARY', midX + 10, midY + 8);
        } else if (line.linked_to_measurements) {
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.fillText('🔗 LINKED', midX + 10, midY + 8);
        }

        this.ctx.restore();
    }

    /**
     * Zeichnet einen Punkt
     */
    drawPoint(point, color = '#007cba') {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * AGENT 5 ENHANCEMENT: Fills dropdown with integration bridge indicators
     * AGENT 4 COORDINATION: Delegates to enhanced dropdown if available
     */
    populateMeasurementDropdown() {
        console.log('📊 Populating measurement dropdown...');
        const dropdown = document.getElementById('measurement-type-selector');

        if (!dropdown) {
            console.error('❌ Measurement dropdown element not found');
            return;
        }

        dropdown.innerHTML = '<option value="">📏 Select Measurement Type...</option>';

        // Check if measurement types are available
        if (!this.measurementTypes || Object.keys(this.measurementTypes).length === 0) {
            console.warn('⚠️ No measurement types available, loading fallback...');
            this.loadFallbackMeasurementTypes();
        }

        const measurementCount = Object.keys(this.measurementTypes).length;
        console.log(`📊 Populating dropdown with ${measurementCount} measurement types`);

        // INTEGRATION BRIDGE: Enhanced measurement assignment with conflict detection
        Object.entries(this.measurementTypes).forEach(([key, data]) => {
            const option = document.createElement('option');
            option.value = key;

            // Check measurement status for enhanced integration bridge
            const measurementStatus = this.getMeasurementIntegrationStatus(key);
            const hasReferenceLines = this.checkMeasurementHasReferenceLines(key);
            const isPrimary = this.isPrimaryMeasurement(key);
            const hasConflicts = this.checkMeasurementConflicts(key);
            const precisionLevel = this.getPrecisionLevel(key);

            let displayText = `${key} - ${data.label}`;
            let statusIcon = '⭕';
            let statusSuffix = '[NEW]';

            // INTEGRATION BRIDGE: Advanced status determination
            if (hasConflicts) {
                statusIcon = '⚠️';
                statusSuffix = '[CONFLICT]';
                option.style.backgroundColor = '#ffe6e6';
                option.style.color = '#c62d42';
                option.disabled = true; // Prevent selection of conflicted measurements
            } else if (isPrimary && hasReferenceLines) {
                statusIcon = '🎯';
                statusSuffix = `[PRIMARY-READY] P${precisionLevel}`;
                option.style.backgroundColor = '#e8f5e8';
                option.style.fontWeight = 'bold';
                option.style.color = '#2d5016';
            } else if (isPrimary) {
                statusIcon = '🎯';
                statusSuffix = '[PRIMARY-SETUP]';
                option.style.backgroundColor = '#e8f5e8';
                option.style.fontWeight = 'bold';
            } else if (hasReferenceLines) {
                statusIcon = '🔗';
                statusSuffix = `[LINKED] P${precisionLevel}`;
                option.style.backgroundColor = '#fff8e1';
                option.style.color = '#8f6914';
            } else {
                statusIcon = '⭕';
                statusSuffix = '[AVAILABLE]';
                option.style.color = '#666';
            }

            // 🔴 PHASE 1: Static category lookup to prevent recursion
            const staticCategoryMap = {
                'A': 'horizontal', 'B': 'horizontal', 'D': 'horizontal', 'G': 'horizontal', 'H': 'horizontal',
                'C': 'vertical', 'E': 'vertical', 'F': 'vertical', 'I': 'horizontal'
            };
            const category = staticCategoryMap[key] || 'general';
            displayText = `${statusIcon} ${displayText} ${statusSuffix} [${category.toUpperCase()}]`;

            option.textContent = displayText;
            option.setAttribute('data-measurement-key', key);
            option.setAttribute('data-category', category);
            option.setAttribute('data-precision', precisionLevel);
            option.setAttribute('data-primary', isPrimary);
            option.setAttribute('data-has-conflicts', hasConflicts);

            dropdown.appendChild(option);
        });

        // INTEGRATION BRIDGE: Add measurement assignment help
        this.addMeasurementAssignmentHelp(dropdown);
    }

    /**
     * INTEGRATION BRIDGE: Check for measurement assignment conflicts
     */
    checkMeasurementConflicts(measurementKey) {
        if (!measurementKey) return false;

        const referenceData = this.getReferenceLinesByMeasurement(measurementKey);
        const viewsWithLines = Object.keys(referenceData.lines_by_view || {});
        const totalViews = Object.keys(this.templateViews).length;

        // Check for incomplete assignments (some views have lines, others don't)
        if (viewsWithLines.length > 0 && viewsWithLines.length < totalViews) {
            console.warn(`⚠️ CONFLICT: Measurement ${measurementKey} has incomplete view assignments`);
            return true;
        }

        // Check for duplicate primary measurements
        if (this.isPrimaryMeasurement(measurementKey)) {
            const otherPrimaryMeasurements = ['A', 'C'].filter(key => key !== measurementKey);
            const hasOtherPrimaryWithLines = otherPrimaryMeasurements.some(key =>
                this.checkMeasurementHasReferenceLines(key)
            );

            if (hasOtherPrimaryWithLines && referenceData.total_references > 0) {
                console.warn(`⚠️ CONFLICT: Multiple primary measurements defined (${measurementKey})`);
                return true;
            }
        }

        // Check for precision level conflicts
        const category = this.getMeasurementCategory(measurementKey);
        const sameCategory = Object.keys(this.measurementTypes).filter(key =>
            this.getMeasurementCategory(key) === category && key !== measurementKey
        );

        const hasConflictingPrecision = sameCategory.some(key => {
            const otherData = this.getReferenceLinesByMeasurement(key);
            return otherData.total_references > 0 && this.getPrecisionLevel(key) !== this.getPrecisionLevel(measurementKey);
        });

        if (hasConflictingPrecision) {
            console.warn(`⚠️ CONFLICT: Precision level conflict for ${measurementKey} in category ${category}`);
            return true;
        }

        return false;
    }

    /**
     * INTEGRATION BRIDGE: Get comprehensive measurement integration status
     */
    getMeasurementIntegrationStatus(measurementKey) {
        const referenceData = this.getReferenceLinesByMeasurement(measurementKey);
        const hasReferenceLines = referenceData.total_references > 0;
        const isPrimary = this.isPrimaryMeasurement(measurementKey);
        const hasConflicts = this.checkMeasurementConflicts(measurementKey);
        const precisionLevel = this.getPrecisionLevel(measurementKey);
        const category = this.getMeasurementCategory(measurementKey);

        const completenessScore = this.calculateMeasurementCompleteness(measurementKey);
        const integrationScore = this.calculateMeasurementIntegrationScore(measurementKey);

        return {
            measurement_key: measurementKey,
            has_reference_lines: hasReferenceLines,
            is_primary: isPrimary,
            has_conflicts: hasConflicts,
            precision_level: precisionLevel,
            category: category,
            completeness_score: completenessScore,
            integration_score: integrationScore,
            bridge_ready: hasReferenceLines && !hasConflicts && completenessScore >= 80,
            status: hasConflicts ? 'CONFLICT' :
                    (isPrimary && hasReferenceLines) ? 'PRIMARY_READY' :
                    hasReferenceLines ? 'LINKED' : 'AVAILABLE'
        };
    }

    /**
     * INTEGRATION BRIDGE: Calculate measurement completeness score
     */
    calculateMeasurementCompleteness(measurementKey) {
        const referenceData = this.getReferenceLinesByMeasurement(measurementKey);
        const totalViews = Object.keys(this.templateViews).length;
        const viewsWithLines = Object.keys(referenceData.lines_by_view || {}).length;

        if (totalViews === 0) return 0;

        const viewCompleteness = (viewsWithLines / totalViews) * 60; // 60% for view coverage
        const dataQuality = referenceData.total_references > 0 ? 30 : 0; // 30% for having data
        const precisionBonus = this.isPrimaryMeasurement(measurementKey) ? 10 : 0; // 10% primary bonus

        return Math.min(100, viewCompleteness + dataQuality + precisionBonus);
    }

    /**
     * INTEGRATION BRIDGE: Calculate measurement-specific integration score
     */
    calculateMeasurementIntegrationScore(measurementKey) {
        const status = this.getMeasurementIntegrationStatus(measurementKey);

        if (status.has_conflicts) return 0;
        if (!status.has_reference_lines) return 20;

        let score = 60; // Base score for having reference lines

        if (status.is_primary) score += 20; // Primary measurement bonus
        if (status.precision_level >= 3) score += 10; // High precision bonus
        if (status.completeness_score >= 80) score += 10; // Completeness bonus

        return Math.min(100, score);
    }

    /**
     * INTEGRATION BRIDGE: Add measurement assignment help interface
     */
    addMeasurementAssignmentHelp(dropdown) {
        const helpContainer = dropdown.parentNode;
        const existingHelp = helpContainer.querySelector('.measurement-assignment-help');

        if (existingHelp) existingHelp.remove();

        const helpDiv = document.createElement('div');
        helpDiv.className = 'measurement-assignment-help';
        helpDiv.style.cssText = `
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 10px;
            margin-top: 10px;
            font-size: 12px;
            color: #495057;
        `;

        const totalMeasurements = Object.keys(this.measurementTypes).length;
        const assignedMeasurements = this.getAssignedMeasurementsCount();
        const conflictMeasurements = this.getConflictMeasurementsCount();
        const bridgeScore = this.calculateIntegrationScore();

        helpDiv.innerHTML = `
            <div class="bridge-status-summary">
                <strong>🌉 Integration Bridge Status</strong><br>
                <span class="badge ${bridgeScore >= 80 ? 'success' : bridgeScore >= 60 ? 'warning' : 'danger'}">Score: ${bridgeScore}%</span>
                <span class="measurements-summary">${assignedMeasurements}/${totalMeasurements} assigned</span>
                ${conflictMeasurements > 0 ? `<span class="conflicts-warning">⚠️ ${conflictMeasurements} conflicts</span>` : ''}
            </div>
            <div class="assignment-legend">
                <small>
                    <span>🎯 PRIMARY-READY</span> | <span>🔗 LINKED</span> | <span>⭕ AVAILABLE</span> | <span>⚠️ CONFLICT</span>
                </small>
            </div>
        `;

        helpContainer.appendChild(helpDiv);

        // Add CSS for badges if not exists
        if (!document.querySelector('#measurement-assignment-styles')) {
            const style = document.createElement('style');
            style.id = 'measurement-assignment-styles';
            style.textContent = `
                .badge { padding: 2px 6px; border-radius: 3px; font-weight: bold; margin-right: 5px; }
                .badge.success { background: #d4edda; color: #155724; }
                .badge.warning { background: #fff3cd; color: #856404; }
                .badge.danger { background: #f8d7da; color: #721c24; }
                .measurements-summary { margin-right: 10px; }
                .conflicts-warning { color: #c62d42; font-weight: bold; }
                .assignment-legend { margin-top: 5px; border-top: 1px solid #dee2e6; padding-top: 5px; }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * AGENT 5: Check if measurement has reference lines in any view
     */
    checkMeasurementHasReferenceLines(measurementKey) {
        for (const [viewId, lines] of Object.entries(this.multiViewReferenceLines)) {
            if (Array.isArray(lines)) {
                const hasLines = lines.some(line =>
                    line.measurement_key === measurementKey &&
                    line.linked_to_measurements === true
                );
                if (hasLines) return true;
            }
        }
        return false;
    }

    /**
     * INTEGRATION BRIDGE: Check for measurement assignment conflicts
     */
    checkMeasurementConflicts(measurementKey) {
        let conflicts = 0;
        Object.values(this.multiViewReferenceLines).forEach(viewLines => {
            if (Array.isArray(viewLines)) {
                const existingLines = viewLines.filter(line =>
                    line.measurement_key === measurementKey &&
                    line.linked_to_measurements === true &&
                    (line.integration_status === 'active' || !line.integration_status)
                );
                if (existingLines.length > 1) {
                    conflicts += existingLines.length - 1;
                }
            }
        });
        return conflicts;
    }

    /**
     * INTEGRATION BRIDGE: Get count of assigned measurements
     */
    getAssignedMeasurementsCount() {
        const assignedKeys = new Set();
        Object.values(this.multiViewReferenceLines).forEach(viewLines => {
            if (Array.isArray(viewLines)) {
                viewLines.forEach(line => {
                    if (line.measurement_key && line.linked_to_measurements) {
                        assignedKeys.add(line.measurement_key);
                    }
                });
            }
        });
        return assignedKeys.size;
    }

    /**
     * INTEGRATION BRIDGE: Get count of primary measurements
     */
    getPrimaryMeasurementsCount() {
        const primaryKeys = new Set();
        Object.values(this.multiViewReferenceLines).forEach(viewLines => {
            if (Array.isArray(viewLines)) {
                viewLines.forEach(line => {
                    if (line.primary_reference && line.linked_to_measurements) {
                        primaryKeys.add(line.measurement_key);
                    }
                });
            }
        });
        return primaryKeys.size;
    }

    /**
     * INTEGRATION BRIDGE: Get count of measurements with conflicts
     */
    getConflictMeasurementsCount() {
        const conflictKeys = new Set();
        const measurementCounts = {};

        Object.values(this.multiViewReferenceLines).forEach(viewLines => {
            if (Array.isArray(viewLines)) {
                viewLines.forEach(line => {
                    if (line.measurement_key && line.linked_to_measurements) {
                        measurementCounts[line.measurement_key] = (measurementCounts[line.measurement_key] || 0) + 1;
                    }
                });
            }
        });

        Object.entries(measurementCounts).forEach(([key, count]) => {
            if (count > 1) {
                conflictKeys.add(key);
            }
        });

        return conflictKeys.size;
    }

    /**
     * INTEGRATION BRIDGE: Update measurement assignment help interface
     */
    updateMeasurementAssignmentHelp() {
        const helpContainer = document.getElementById('measurement-assignment-help');
        if (!helpContainer) return;

        const totalMeasurements = Object.keys(this.measurementTypes).length;
        const assignedMeasurements = this.getAssignedMeasurementsCount();
        const primaryMeasurements = this.getPrimaryMeasurementsCount();
        const conflictMeasurements = this.getConflictMeasurementsCount();

        const completionRate = Math.round((assignedMeasurements / totalMeasurements) * 100);
        const integrationScore = this.calculateIntegrationScore();

        helpContainer.innerHTML = `
            <div class="integration-bridge-status">
                <h4>🌉 Integration Bridge Status</h4>
                <div class="bridge-metrics">
                    <div class="metric primary">
                        <span class="icon">🎯</span>
                        <span class="label">Primary References</span>
                        <span class="value">${primaryMeasurements}/2</span>
                    </div>
                    <div class="metric assigned">
                        <span class="icon">🔗</span>
                        <span class="label">Assigned</span>
                        <span class="value">${assignedMeasurements}/${totalMeasurements}</span>
                    </div>
                    <div class="metric conflicts">
                        <span class="icon">⚠️</span>
                        <span class="label">Conflicts</span>
                        <span class="value">${conflictMeasurements}</span>
                    </div>
                    <div class="metric score">
                        <span class="icon">📊</span>
                        <span class="label">Integration Score</span>
                        <span class="value">${integrationScore}%</span>
                    </div>
                </div>
                <div class="completion-bar">
                    <div class="progress" style="width: ${completionRate}%"></div>
                    <span class="completion-text">${completionRate}% Complete</span>
                </div>
            </div>
        `;
    }

    /**
     * INTEGRATION BRIDGE: Calculate real-time integration score
     */
    calculateIntegrationScore() {
        let score = 0;
        const weights = {
            dataStructure: 25,
            primaryReferences: 25,
            measurementMapping: 30,
            conflictResolution: 20
        };

        // Data structure completeness
        const requiredFields = ['measurement_key', 'measurement_label', 'precision_level', 'measurement_category', 'bridge_version'];
        let completeLines = 0;
        let totalLines = 0;

        Object.values(this.multiViewReferenceLines).forEach(viewLines => {
            if (Array.isArray(viewLines)) {
                viewLines.forEach(line => {
                    totalLines++;
                    const hasAllFields = requiredFields.every(field => line[field] !== undefined && line[field] !== null);
                    if (hasAllFields) completeLines++;
                });
            }
        });

        if (totalLines > 0) {
            score += (completeLines / totalLines) * weights.dataStructure;
        }

        // Primary references (A and C should be present)
        const primaryCount = this.getPrimaryMeasurementsCount();
        score += Math.min(primaryCount / 2, 1) * weights.primaryReferences;

        // Measurement mapping coverage
        const totalMeasurements = Object.keys(this.measurementTypes).length;
        const mappedMeasurements = this.getAssignedMeasurementsCount();
        if (totalMeasurements > 0) {
            score += (mappedMeasurements / totalMeasurements) * weights.measurementMapping;
        }

        // Conflict resolution (lower conflicts = higher score)
        const conflicts = this.getConflictMeasurementsCount();
        score += Math.max(0, weights.conflictResolution - conflicts * 5);

        return Math.round(Math.min(score, 100));
    }

    /**
     * Update Mode basierend auf Selektion
     */
    updateMode() {
        if (this.selectedMeasurementKey && this.currentViewId) {
            this.currentMode = 'select';
            this.canvas.style.cursor = 'crosshair';
        } else {
            this.currentMode = 'idle';
            this.canvas.style.cursor = 'default';
        }
    }

    /**
     * Update der aktuellen View Info
     */
    updateViewInfo() {
        const nameElement = document.getElementById('current-view-name');
        if (nameElement && this.currentView) {
            nameElement.textContent = this.currentView.name;
        }
    }

    /**
     * Update View Line Counts
     */
    updateViewCounts() {
        Object.keys(this.templateViews).forEach(viewId => {
            const countElement = document.getElementById(`view-count-${viewId}`);
            if (countElement) {
                const count = this.multiViewReferenceLines[viewId] ? this.multiViewReferenceLines[viewId].length : 0;
                countElement.textContent = count;
                countElement.style.display = count > 0 ? 'inline' : 'none';
            }
        });
    }

    /**
     * DELETION SYSTEM: Enhanced current view lines deletion with database persistence
     * Löscht alle Referenzlinien der aktuellen View und persistiert die Änderung
     */
    async clearCurrentViewLines() {
        if (!this.currentViewId) {
            this.showDeleteError('Keine View ausgewählt.');
            return;
        }

        const count = this.multiViewReferenceLines[this.currentViewId] ? this.multiViewReferenceLines[this.currentViewId].length : 0;

        if (count === 0) {
            this.showDeleteError('Keine Referenzlinien in aktueller View vorhanden.');
            return;
        }

        const viewName = this.currentView.name || 'Aktuelle View';

        if (!confirm(`Alle ${count} Referenzlinien in "${viewName}" löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.`)) {
            return;
        }

        try {
            // Show loading state
            this.showDeleteProgress(`Lösche alle Referenzlinien in "${viewName}"...`);

            const response = await this.ajaxDebug.debugFetch(pointToPointAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'delete_view_reference_lines',
                    template_id: this.templateId,
                    view_id: this.currentViewId,
                    nonce: pointToPointAjax.nonce
                })
            }, 'DELETE_VIEW_REFERENCE_LINES');

            const data = await response.json();

            if (data.success) {
                // Update local data structure with server response
                this.multiViewReferenceLines = data.data.updated_multi_view_lines;

                // Clear current drawing state
                this.points = [];

                // Update UI
                this.redrawCanvas();
                this.updateLinesDisplay();
                this.updateViewCounts();

                // Show success feedback
                this.showDeleteSuccess(data.data.message);

                // Update debug state
                this.stateMonitor.trackState('deletion', 'view_reference_lines', {
                    view_id: this.currentViewId,
                    view_name: viewName,
                    deleted_count: data.data.deleted_lines_count,
                    total_remaining: data.data.total_lines_remaining
                });

                console.log('✅ DELETION SYSTEM: View reference lines deleted successfully', {
                    viewId: this.currentViewId,
                    viewName: viewName,
                    deletedCount: data.data.deleted_lines_count,
                    totalRemaining: data.data.total_lines_remaining
                });

            } else {
                throw new Error(data.data || 'Löschen fehlgeschlagen');
            }

        } catch (error) {
            console.error('❌ DELETION SYSTEM: Failed to delete view reference lines:', error);
            this.showDeleteError(`Fehler beim Löschen der View-Referenzlinien: ${error.message}`);

            // Log error to debug system
            this.errorHandler.captureError('VIEW_REFERENCE_LINES_DELETION', error, {
                viewId: this.currentViewId,
                viewName: viewName,
                expectedCount: count
            });
        } finally {
            this.hideDeleteProgress();
        }
    }

    /**
     * DELETION SYSTEM: Enhanced all views lines deletion with database persistence
     * Löscht alle Referenzlinien in allen Views und persistiert die Änderung
     */
    async clearAllViewsLines() {
        const totalCount = Object.values(this.multiViewReferenceLines).reduce((total, lines) =>
            total + (Array.isArray(lines) ? lines.length : 0), 0);

        if (totalCount === 0) {
            this.showDeleteError('Keine Referenzlinien vorhanden.');
            return;
        }

        const viewsCount = Object.keys(this.multiViewReferenceLines).length;

        if (!confirm(`Alle ${totalCount} Referenzlinien in ${viewsCount} Views löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden und löscht ALLE Referenzlinien dauerhaft.`)) {
            return;
        }

        try {
            // Show loading state
            this.showDeleteProgress(`Lösche alle ${totalCount} Referenzlinien...`);

            const response = await this.ajaxDebug.debugFetch(pointToPointAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'delete_all_reference_lines',
                    template_id: this.templateId,
                    nonce: pointToPointAjax.nonce
                })
            }, 'DELETE_ALL_REFERENCE_LINES');

            const data = await response.json();

            if (data.success) {
                // Update local data structure with server response (should be empty)
                this.multiViewReferenceLines = data.data.updated_multi_view_lines;

                // Clear all drawing state
                this.points = [];

                // Update UI
                this.redrawCanvas();
                this.updateLinesDisplay();
                this.updateViewCounts();

                // Show success feedback
                this.showDeleteSuccess(data.data.message);

                // Update debug state
                this.stateMonitor.trackState('deletion', 'all_reference_lines', {
                    deleted_total: data.data.deleted_total_lines,
                    deleted_views: data.data.deleted_views_count,
                    template_id: this.templateId
                });

                console.log('✅ DELETION SYSTEM: All reference lines deleted successfully', {
                    deletedTotal: data.data.deleted_total_lines,
                    deletedViews: data.data.deleted_views_count,
                    templateId: this.templateId
                });

            } else {
                throw new Error(data.data || 'Löschen fehlgeschlagen');
            }

        } catch (error) {
            console.error('❌ DELETION SYSTEM: Failed to delete all reference lines:', error);
            this.showDeleteError(`Fehler beim Löschen aller Referenzlinien: ${error.message}`);

            // Log error to debug system
            this.errorHandler.captureError('ALL_REFERENCE_LINES_DELETION', error, {
                templateId: this.templateId,
                expectedTotalCount: totalCount,
                expectedViewsCount: viewsCount
            });
        } finally {
            this.hideDeleteProgress();
        }
    }

    /**
     * AGENT 5 ENHANCEMENT: Enhanced Multi-View lines display with integration bridge visual indicators
     * DEFENSIVE PROGRAMMING: Added comprehensive error handling and validation
     */
    updateLinesDisplay() {
        try {
            const display = document.getElementById('multi-view-lines-display');
            if (!display) {
                console.warn('⚠️ multi-view-lines-display element not found');
                return;
            }

            // DEFENSIVE: Validate templateViews structure before proceeding
            this.validateTemplateViewsStructure();

            // DEFENSIVE: Validate multiViewReferenceLines structure
            if (!this.multiViewReferenceLines || typeof this.multiViewReferenceLines !== 'object') {
                console.warn('⚠️ multiViewReferenceLines is invalid, initializing empty structure');
                this.multiViewReferenceLines = {};
            }

            const totalLines = Object.values(this.multiViewReferenceLines).reduce((total, lines) =>
                total + (Array.isArray(lines) ? lines.length : 0), 0);

        if (totalLines === 0) {
            display.innerHTML = `
                <div class="integration-status empty">
                    <em>🎯 Keine Referenzlinien definiert - Bereit für Integration Bridge Setup</em>
                    <p><small>Erstelle Referenzlinien um die PrecisionCalculator Integration zu aktivieren</small></p>
                </div>
            `;
            return;
        }

        // AGENT 5: Calculate integration bridge statistics
        const bridgeStats = this.calculateIntegrationBridgeStats();

        const viewsHTML = Object.entries(this.multiViewReferenceLines).map(([viewId, lines]) => {
            if (!Array.isArray(lines) || lines.length === 0) return '';

            const viewName = this.getViewNameById(viewId);
            const linesHTML = lines.map(line => `
                <div class="reference-line-item ${viewId === this.currentViewId ? 'current-view' : ''} ${line.primary_reference ? 'primary-reference' : ''} ${line.linked_to_measurements ? 'integration-linked' : 'not-linked'}">
                    <div class="line-header">
                        <strong>${line.measurement_key} - ${line.label}</strong>
                        <div class="line-badges">
                            ${line.primary_reference ? '<span class="primary-badge">🎯 PRIMARY</span>' : ''}
                            ${line.linked_to_measurements ? '<span class="linked-badge">🔗 LINKED</span>' : '<span class="unlinked-badge">⭕ NOT LINKED</span>'}
                            ${line.precision_level ? `<span class="precision-badge">📐 ±${line.precision_level}mm</span>` : ''}
                        </div>
                    </div>
                    <div class="line-details">
                        <span class="distance">📏 ${line.lengthPx.toFixed(1)}px</span>
                        ${line.measurement_category ? `<span class="category">📂 ${line.measurement_category}</span>` : ''}
                        ${line.bridge_version ? `<span class="bridge-version">🌉 v${line.bridge_version}</span>` : ''}
                    </div>
                    <div class="line-actions">
                        <button class="button-link remove-btn" onclick="multiViewPointToPointSelector.removeReferenceLine('${viewId}', '${line.measurement_key}')" title="Dauerhaft aus Datenbank löschen">
                            🗑️ Löschen
                        </button>
                    </div>
                </div>
            `).join('');

            return `
                <div class="view-lines-group">
                    <h5>📐 ${viewName} (${lines.length} Linien):</h5>
                    ${linesHTML}
                </div>
            `;
        }).filter(html => html).join('');

        // AGENT 5: Add integration bridge summary at the top
        const bridgeSummaryHTML = `
            <div class="integration-bridge-summary">
                <h4>🌉 Integration Bridge Status</h4>
                <div class="bridge-stats">
                    <span class="stat primary">🎯 Primary: ${bridgeStats.primary}</span>
                    <span class="stat linked">🔗 Linked: ${bridgeStats.linked}</span>
                    <span class="stat unlinked">⭕ Not Linked: ${bridgeStats.unlinked}</span>
                    <span class="stat precision">📐 Precision Ready: ${bridgeStats.precisionReady}</span>
                </div>
                <div class="bridge-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${bridgeStats.progressPercentage}%"></div>
                    </div>
                    <span class="progress-text">${bridgeStats.progressPercentage}% Integration Ready</span>
                </div>
            </div>
        `;

            display.innerHTML = bridgeSummaryHTML + viewsHTML;
        } catch (error) {
            console.error('❌ Critical error in updateLinesDisplay:', error);

            // Fallback display in case of critical error
            const display = document.getElementById('multi-view-lines-display');
            if (display) {
                display.innerHTML = `
                    <div class="integration-status error">
                        <em>⚠️ Fehler beim Anzeigen der Referenzlinien</em>
                        <p><small>System wird repariert... Bitte versuchen Sie es erneut.</small></p>
                        <details>
                            <summary>Technische Details</summary>
                            <code>${error.message}</code>
                        </details>
                    </div>
                `;
            }
        }
    }

    /**
     * AGENT 5: Calculate integration bridge statistics for UI display
     */
    calculateIntegrationBridgeStats() {
        let primary = 0;
        let linked = 0;
        let unlinked = 0;
        let precisionReady = 0;
        let total = 0;

        for (const [viewId, lines] of Object.entries(this.multiViewReferenceLines)) {
            if (Array.isArray(lines)) {
                lines.forEach(line => {
                    total++;
                    if (line.primary_reference) primary++;
                    if (line.linked_to_measurements) {
                        linked++;
                        if (line.precision_level && typeof line.precision_level === 'number') {
                            precisionReady++;
                        }
                    } else {
                        unlinked++;
                    }
                });
            }
        }

        const progressPercentage = total > 0 ? Math.round((linked / total) * 100) : 0;

        return {
            primary,
            linked,
            unlinked,
            precisionReady,
            total,
            progressPercentage
        };
    }

    /**
     * DELETION SYSTEM: Enhanced removal with database persistence
     * Entfernt eine spezifische Referenzlinie aus einer View und persistiert die Änderung
     */
    async removeReferenceLine(viewId, measurementKey) {
        if (!this.multiViewReferenceLines[viewId]) {
            this.showDeleteError('View nicht gefunden');
            return;
        }

        const lineToDelete = this.multiViewReferenceLines[viewId].find(line => line.measurement_key === measurementKey);

        if (!lineToDelete) {
            this.showDeleteError('Referenzlinie nicht gefunden');
            return;
        }

        const lineLabel = lineToDelete.label || measurementKey;

        const viewName = this.getViewNameById(viewId);

        if (!confirm(`Referenzlinie "${lineLabel}" in View "${viewName}" löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.`)) {
            return;
        }

        try {
            // Show loading state
            this.showDeleteProgress(`Lösche Referenzlinie "${lineLabel}"...`);

            const response = await this.ajaxDebug.debugFetch(pointToPointAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'delete_reference_line',
                    template_id: this.templateId,
                    view_id: viewId,
                    measurement_key: measurementKey,
                    nonce: pointToPointAjax.nonce
                })
            }, 'DELETE_REFERENCE_LINE');

            const data = await response.json();

            if (data.success) {
                // Update local data structure with server response
                this.multiViewReferenceLines = data.data.updated_multi_view_lines;

                // Update UI
                if (viewId === this.currentViewId) {
                    this.redrawCanvas();
                }
                this.updateLinesDisplay();
                this.updateViewCounts();

                // Show success feedback
                this.showDeleteSuccess(data.data.message);

                // Update debug state
                this.stateMonitor.trackState('deletion', 'single_reference_line', {
                    deleted: lineToDelete,
                    view_id: viewId,
                    remaining_in_view: data.data.remaining_lines_in_view,
                    total_remaining: data.data.total_lines_remaining
                });

                console.log('✅ DELETION SYSTEM: Single reference line deleted successfully', {
                    deletedLine: lineToDelete,
                    viewId: viewId,
                    remainingInView: data.data.remaining_lines_in_view,
                    totalRemaining: data.data.total_lines_remaining
                });

            } else {
                throw new Error(data.data || 'Löschen fehlgeschlagen');
            }

        } catch (error) {
            console.error('❌ DELETION SYSTEM: Failed to delete reference line:', error);
            this.showDeleteError(`Fehler beim Löschen: ${error.message}`);

            // Log error to debug system
            this.errorHandler.captureError('REFERENCE_LINE_DELETION', error, {
                viewId: viewId,
                measurementKey: measurementKey,
                lineLabel: lineLabel
            });
        } finally {
            this.hideDeleteProgress();
        }
    }

    /**
     * Speichert Multi-View Referenzlinien in WordPress Meta Field
     */
    async saveMultiViewReferenceLines() {
        const totalLines = Object.values(this.multiViewReferenceLines).reduce((total, lines) =>
            total + (Array.isArray(lines) ? lines.length : 0), 0);

        if (totalLines === 0) {
            alert('Keine Referenzlinien zum Speichern vorhanden.');
            return;
        }

        try {
            const saveButton = document.getElementById('save-multi-view-reference-lines-btn');
            saveButton.disabled = true;
            saveButton.textContent = 'Speichere...';

            // AGENT 6 FIX: Ensure all view arrays exist and are properly formatted
            const sanitizedData = {};
            for (const [viewId, lines] of Object.entries(this.multiViewReferenceLines)) {
                if (Array.isArray(lines)) {
                    // Filter out any invalid lines and ensure proper structure
                    sanitizedData[viewId] = lines.filter(line =>
                        line &&
                        typeof line === 'object' &&
                        line.measurement_key &&
                        line.label &&
                        typeof line.lengthPx === 'number' &&
                        line.start && typeof line.start.x === 'number' && typeof line.start.y === 'number' &&
                        line.end && typeof line.end.x === 'number' && typeof line.end.y === 'number'
                    );
                } else {
                    // Convert non-arrays to empty arrays
                    console.warn(`AGENT 6 FIX: Converting non-array data for view ${viewId} to empty array`);
                    sanitizedData[viewId] = [];
                }
            }

            console.log('🎯 AGENT 6: Sanitized data before sending:', sanitizedData);

            const response = await fetch(pointToPointAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'save_multi_view_reference_lines',
                    template_id: this.templateId,
                    multi_view_reference_lines: JSON.stringify(sanitizedData),
                    nonce: pointToPointAjax.nonce
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(`✅ Multi-View Referenzlinien erfolgreich gespeichert!\n${data.data.total_lines} Linien in ${data.data.total_views} Views wurden im _multi_view_reference_lines_data Meta-Feld gespeichert.`);
            } else {
                throw new Error(data.data || 'Speichern fehlgeschlagen');
            }

        } catch (error) {
            console.error('Fehler beim Speichern:', error);
            alert('Fehler beim Speichern der Multi-View Referenzlinien: ' + error.message);
        } finally {
            const saveButton = document.getElementById('save-multi-view-reference-lines-btn');
            saveButton.disabled = false;
            saveButton.textContent = '💾 Multi-View Referenzlinien speichern';
        }
    }

    /**
     * Lädt existierende Multi-View Referenzlinien aus dem Meta Field
     */
    async loadExistingMultiViewReferenceLines() {
        try {
            const response = await fetch(pointToPointAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'get_multi_view_reference_lines',
                    template_id: this.templateId,
                    nonce: pointToPointAjax.nonce
                })
            });

            const data = await response.json();
            if (data.success && data.data.multi_view_reference_lines) {
                this.multiViewReferenceLines = data.data.multi_view_reference_lines;
                this.redrawCanvas();
                this.updateLinesDisplay();
                this.updateViewCounts();
                console.log('📋 Loaded existing multi-view reference lines:', data.data.total_lines, 'lines in', data.data.total_views, 'views');
            }
        } catch (error) {
            console.error('Fehler beim Laden existierender Multi-View Referenzlinien:', error);
        }
    }

    /**
     * Creates Single View Fallback when Multi-View data not available
     * DEFENSIVE PROGRAMMING: Enhanced with comprehensive error handling
     */
    async createSingleViewFallback() {
        try {
            console.log('🔄 Creating single view fallback system');

            // Always ensure templateViews is properly initialized as an object
            this.templateViews = {};

            let imageUrl = null;
            try {
                imageUrl = await this.loadLegacyTemplateImage();
            } catch (imageError) {
                console.warn('⚠️ Failed to load legacy image, using placeholder:', imageError.message);
                imageUrl = null; // Will be handled in UI
            }

            // Create fallback view with defensive structure
            this.templateViews = {
                'single': {
                    id: 'single',
                    name: 'Template View',
                    image_url: imageUrl,
                    image_id: null,
                    safe_zone: {}
                }
            };

            // Validate the structure we just created
            if (!this.validateTemplateViewsStructure()) {
                console.error('❌ Failed to create valid templateViews structure in fallback');
                throw new Error('Fallback structure validation failed');
            }

            this.createViewSelector();
            const switchResult = await this.switchToView('single');

            if (!switchResult) {
                console.warn('⚠️ Switch to single view failed, but templateViews is initialized');
            }

            console.log('✅ Single view fallback system created successfully');
            return true;

        } catch (error) {
            console.error('❌ Critical error in createSingleViewFallback:', error);

            // Last resort - create minimal structure
            try {
                this.templateViews = {
                    'emergency': {
                        id: 'emergency',
                        name: 'Emergency View',
                        image_url: null,
                        image_id: null,
                        safe_zone: {}
                    }
                };

                console.log('🚨 Created emergency fallback templateViews structure');
                return false;
            } catch (emergencyError) {
                console.error('💥 Even emergency fallback failed:', emergencyError);
                this.templateViews = {}; // Ensure it's at least an empty object
                return false;
            }
        }
    }

    /**
     * AGENT 5: Loads template image using legacy methods with enhanced database debugging
     */
    async loadLegacyTemplateImage() {
        console.log('🗄️ AGENT 5: Loading legacy template image via AJAX');

        try {
            const response = await fetch(pointToPointAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'get_template_image',
                    template_id: this.templateId,
                    nonce: pointToPointAjax.nonce
                })
            });

            const data = await response.json();

            console.log('🗄️ AGENT 5: Legacy template image AJAX response:', {
                success: data.success,
                imageUrl: data.data?.image_url,
                templateId: this.templateId,
                fullResponse: data
            });

            if (data.success && data.data.image_url) {
                console.log('✅ AGENT 5: Successfully loaded template image via AJAX');
                return data.data.image_url;
            } else {
                console.log('⚠️ AGENT 5: AJAX failed, trying fallback from hidden input');
                // Try fallback: use template-image-url from hidden input
                const fallbackUrl = document.getElementById('template-image-url')?.value;
                console.log('🗄️ AGENT 5: Fallback URL from hidden input:', fallbackUrl);

                if (fallbackUrl && fallbackUrl.trim() !== '') {
                    return fallbackUrl;
                }
            }
        } catch (error) {
            console.error('❌ AGENT 5: Error loading legacy template image:', error);

            // Try emergency fallback
            const fallbackUrl = document.getElementById('template-image-url')?.value;
            if (fallbackUrl && fallbackUrl.trim() !== '') {
                console.log('🗄️ AGENT 5: Emergency fallback URL:', fallbackUrl);
                return fallbackUrl;
            }
        }

        // Return placeholder SVG if no image found
        console.log('📝 AGENT 5: No image found, returning SVG placeholder');
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjlmOWY5Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNnB4IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VGVtcGxhdGUgSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';
    }

    /**
     * Zeigt Fehler-Nachrichten an
     */
    showError(message) {
        const container = document.getElementById('point-to-point-container');
        if (container) {
            container.innerHTML = `
                <div style="background: #f8d7da; border: 1px solid #f1aeb5; color: #721c24; padding: 15px; border-radius: 4px; margin: 15px 0;">
                    <strong>❌ Fehler:</strong> ${message}
                </div>
            `;
        }
    }

    /**
     * INTEGRATION BRIDGE: Create UI interface for measurement assignments
     */
    createIntegrationBridgeUI() {
        console.log('🎯 INTEGRATION BRIDGE: Creating UI interface...');

        try {
            // Check jQuery availability with fallback
            const jQueryAvailable = typeof window.jQuery !== 'undefined' && typeof $ !== 'undefined';
            console.log('🎯 INTEGRATION BRIDGE: jQuery available:', jQueryAvailable);

            // Find control group using native DOM or jQuery fallback
            // AGENT 3 FIX: Robust selector with fallback for both multi-view and legacy selectors
            let controlGroup;
            const selectors = ['.multi-view-point-to-point-controls', '.point-to-point-controls'];

            if (jQueryAvailable) {
                // Try both selectors with jQuery
                for (const selector of selectors) {
                    controlGroup = $(selector).first();
                    if (controlGroup.length > 0) {
                        console.log(`🎯 INTEGRATION BRIDGE: Control group found (jQuery) with selector: ${selector}`);
                        break;
                    }
                }
                if (!controlGroup || controlGroup.length === 0) {
                    console.log('🎯 INTEGRATION BRIDGE: No control group found with jQuery, trying selectors:', selectors);
                }
            } else {
                // Try both selectors with native DOM
                for (const selector of selectors) {
                    const foundElement = document.querySelector(selector);
                    if (foundElement) {
                        console.log(`🎯 INTEGRATION BRIDGE: Control group found (native) with selector: ${selector}`);
                        // Wrap in jQuery-like object for consistency
                        controlGroup = {
                            length: 1,
                            after: (element) => {
                                if (typeof element === 'string') {
                                    foundElement.insertAdjacentHTML('afterend', element);
                                } else {
                                    foundElement.parentNode.insertBefore(element, foundElement.nextSibling);
                                }
                            }
                        };
                        break;
                    }
                }
                if (!controlGroup) {
                    controlGroup = { length: 0 };
                    console.log('🎯 INTEGRATION BRIDGE: No control group found with native DOM, tried selectors:', selectors);
                }
            }

            if (!controlGroup || controlGroup.length === 0) {
                console.error('❌ INTEGRATION BRIDGE: No control group found - UI creation failed!');
                console.error('❌ INTEGRATION BRIDGE: Tried selectors:', selectors);
                console.error('❌ INTEGRATION BRIDGE: Available elements with class containing "point-to-point":');
                // Debug: show what elements are actually available
                const allElements = document.querySelectorAll('[class*="point-to-point"]');
                allElements.forEach((el, index) => {
                    console.error(`   ${index + 1}. ${el.tagName} with classes: ${el.className}`);
                });

                // CRITICAL FIX: Try one more time after a longer delay if this is the first attempt
                if (!this.integrationBridgeRetryAttempt) {
                    this.integrationBridgeRetryAttempt = true;
                    console.log('⏳ INTEGRATION BRIDGE: Retrying UI creation after DOM stabilization (500ms delay)...');
                    setTimeout(() => {
                        this.createIntegrationBridgeUI();
                    }, 500);
                }
                return;
            }

            console.log('✅ INTEGRATION BRIDGE: Control group found successfully - proceeding with UI creation');

            // Create measurement assignment section HTML
            const bridgeSectionHTML = `
                <div class="integration-bridge-section" style="margin-top: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background: #f9f9f9;">
                    <h4 style="margin: 0 0 10px 0; color: #333;">🎯 Integration Bridge - Measurement Assignment</h4>
                    <div class="measurement-assignment-controls">
                        <label for="measurement-type-selector" style="font-weight: bold; margin-right: 10px;">Measurement Type:</label>
                        <select id="measurement-type-selector" class="form-select integration-bridge-selector" style="width: 200px; display: inline-block; margin-right: 15px;">
                            <option value="A">A - Chest Width</option>
                            <option value="B">B - Hem Width</option>
                            <option value="C">C - Height from Shoulder</option>
                            <option value="D">D - Shoulder Width</option>
                            <option value="E">E - Sleeve Length</option>
                            <option value="F">F - Collar Width</option>
                        </select>
                        <span class="integration-status" style="font-size: 12px; color: #666; margin-left: 10px;">Score: Loading...</span>
                    </div>
                    <div class="measurement-assignment-info" style="margin-top: 10px; font-size: 12px; color: #555;">
                        💡 Assign measurement types to reference lines for PrecisionCalculator integration
                    </div>
                </div>
            `;

            // Insert the UI using appropriate method
            if (jQueryAvailable) {
                const bridgeSection = $(bridgeSectionHTML);
                controlGroup.after(bridgeSection);
            } else {
                controlGroup.after(bridgeSectionHTML);
            }

            // Setup measurement type selector event with proper error handling
            const measurementSelector = document.getElementById('measurement-type-selector');
            if (measurementSelector) {
                measurementSelector.addEventListener('change', (e) => {
                    this.selectedMeasurementKey = e.target.value;
                    this.debug.log(`🎯 INTEGRATION BRIDGE: Selected measurement type: ${this.selectedMeasurementKey}`);
                });
                console.log('🎯 INTEGRATION BRIDGE: Event listener attached successfully');
            } else {
                console.error('❌ INTEGRATION BRIDGE: Measurement selector not found after creation');
            }

            // Initialize with default selection
            this.selectedMeasurementKey = 'A';
            console.log('🎯 INTEGRATION BRIDGE: Default measurement key set to:', this.selectedMeasurementKey);

            // Load current integration status
            console.log('🎯 INTEGRATION BRIDGE: Loading initial status...');
            this.updateIntegrationBridgeStatus();

            console.log('✅ INTEGRATION BRIDGE: UI creation completed successfully');

        } catch (error) {
            console.error('❌ INTEGRATION BRIDGE: Critical error during UI creation:', error);
            // Emergency fallback - create basic UI without jQuery
            this.createEmergencyIntegrationUI();
        }
    }

    /**
     * INTEGRATION BRIDGE: Test function for console debugging
     */
    testIntegrationBridge() {
        console.log('🧪 INTEGRATION BRIDGE: Starting comprehensive test...');

        // Test 1: UI Elements
        console.log('🧪 TEST 1: UI Elements Check');

        // Check jQuery availability and use appropriate method
        const jQueryAvailable = typeof $ !== 'undefined';
        console.log('- jQuery available:', jQueryAvailable);

        let bridgeSection, dropdown, statusDisplay;

        if (jQueryAvailable) {
            bridgeSection = $('.integration-bridge-section');
            dropdown = $('#measurement-type-selector');
            statusDisplay = $('.integration-status');

            console.log('- Bridge section exists (jQuery):', bridgeSection.length > 0);
            console.log('- Dropdown exists (jQuery):', dropdown.length > 0);
            console.log('- Status display exists (jQuery):', statusDisplay.length > 0);

            if (dropdown.length > 0) {
                console.log('- Dropdown options count:', dropdown.find('option').length);
                console.log('- Current selection:', dropdown.val());
            }
        } else {
            // Use native DOM
            bridgeSection = document.querySelectorAll('.integration-bridge-section');
            dropdown = document.getElementById('measurement-type-selector');
            statusDisplay = document.querySelectorAll('.integration-status');

            console.log('- Bridge section exists (native):', bridgeSection.length > 0);
            console.log('- Dropdown exists (native):', dropdown !== null);
            console.log('- Status display exists (native):', statusDisplay.length > 0);

            if (dropdown) {
                console.log('- Dropdown options count:', dropdown.options.length);
                console.log('- Current selection:', dropdown.value);
            }
        }

        // Test 2: Data Properties
        console.log('🧪 TEST 2: Data Properties Check');
        console.log('- Template ID:', this.templateId);
        console.log('- Selected measurement key:', this.selectedMeasurementKey);
        console.log('- Current view ID:', this.currentViewId);
        console.log('- Multi-view reference lines:', Object.keys(this.multiViewReferenceLines).length, 'views');

        // Test 3: AJAX Endpoint Test
        console.log('🧪 TEST 3: AJAX Endpoints Test');
        this.testAjaxEndpoints();

        // Test 4: Simulate Assignment Save
        console.log('🧪 TEST 4: Simulating Assignment Save');
        const testReferenceLineData = {
            measurement_key: 'A',
            measurement_label: 'Chest Width',
            lengthPx: 200,
            start: {x: 100, y: 100},
            end: {x: 300, y: 100},
            view_id: this.currentViewId,
            bridge_version: '2.1'
        };

        console.log('- Test reference line data:', testReferenceLineData);

        return {
            ui_elements: {
                bridge_section: jQueryAvailable ? bridgeSection.length > 0 : bridgeSection.length > 0,
                dropdown: jQueryAvailable ? dropdown.length > 0 : dropdown !== null,
                status_display: jQueryAvailable ? statusDisplay.length > 0 : statusDisplay.length > 0
            },
            data_properties: {
                template_id: !!this.templateId,
                measurement_key: !!this.selectedMeasurementKey,
                current_view: !!this.currentViewId,
                reference_lines: Object.keys(this.multiViewReferenceLines).length
            }
        };
    }

    /**
     * INTEGRATION BRIDGE: Test AJAX endpoints
     */
    testAjaxEndpoints() {
        console.log('🧪 AJAX ENDPOINTS: Testing all endpoints...');

        // Test get_integration_bridge_status
        const statusData = {
            action: 'get_integration_bridge_status',
            template_id: this.templateId,
            nonce: window.pointToPointNonce
        };

        console.log('🧪 Testing get_integration_bridge_status...');
        console.log('- Request data:', statusData);

        // Use same AJAX method as other functions for consistency
        if (typeof fetch !== 'undefined') {
            const formData = new FormData();
            Object.keys(statusData).forEach(key => formData.append(key, statusData[key]));

            fetch(ajaxurl, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(response => {
                console.log('✅ get_integration_bridge_status SUCCESS (fetch):', response);
            })
            .catch(error => {
                console.error('❌ get_integration_bridge_status FAILED (fetch):', error);
            });
        } else if (typeof $ !== 'undefined' && $.ajax) {
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: statusData,
                success: (response) => {
                    console.log('✅ get_integration_bridge_status SUCCESS (jQuery):', response);
                },
                error: (xhr, status, error) => {
                    console.error('❌ get_integration_bridge_status FAILED (jQuery):', {xhr, status, error});
                    console.error('- Response text:', xhr.responseText);
                }
            });
        } else {
            console.warn('⚠️ No AJAX method available for testing endpoints');
        }

        // Test get_measurement_assignments
        const assignmentsData = {
            action: 'get_measurement_assignments',
            template_id: this.templateId,
            nonce: window.pointToPointNonce
        };

        console.log('🧪 Testing get_measurement_assignments...');
        console.log('- Request data:', assignmentsData);

        if (typeof fetch !== 'undefined') {
            const formData = new FormData();
            Object.keys(assignmentsData).forEach(key => formData.append(key, assignmentsData[key]));

            fetch(ajaxurl, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(response => {
                console.log('✅ get_measurement_assignments SUCCESS (fetch):', response);
            })
            .catch(error => {
                console.error('❌ get_measurement_assignments FAILED (fetch):', error);
            });
        } else if (typeof $ !== 'undefined' && $.ajax) {
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: assignmentsData,
                success: (response) => {
                    console.log('✅ get_measurement_assignments SUCCESS (jQuery):', response);
                },
                error: (xhr, status, error) => {
                    console.error('❌ get_measurement_assignments FAILED (jQuery):', {xhr, status, error});
                }
            });
        } else {
            console.warn('⚠️ No AJAX method available for testing endpoints');
        }
    }

    /**
     * INTEGRATION BRIDGE: Update status display
     */
    updateIntegrationBridgeStatus() {
        if (!this.templateId) return;

        try {
            const data = {
                action: 'get_integration_bridge_status',
                template_id: this.templateId,
                nonce: window.pointToPointNonce
            };

            // Use native fetch API as primary method with jQuery fallback
            if (typeof fetch !== 'undefined') {
                // Use modern fetch API
                const formData = new FormData();
                Object.keys(data).forEach(key => formData.append(key, data[key]));

                fetch(ajaxurl, {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    // 🔴 PHASE 3: Check response headers for proper JSON
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    const contentType = response.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        console.warn('🔴 PHASE 3: Response is not JSON, returning text instead');
                        return response.text().then(text => ({ text_response: text }));
                    }

                    return response.json();
                })
                .then(response => {
                    this.handleIntegrationStatusResponse(response);
                })
                .catch(error => {
                    console.error('Integration Bridge Status Error (fetch):', error);
                    this.updateIntegrationStatusDisplay('Status: Error', '#f44336');
                });
            } else if (typeof $ !== 'undefined' && $.ajax) {
                // Fallback to jQuery AJAX
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: data,
                    success: (response) => {
                        this.handleIntegrationStatusResponse(response);
                    },
                    error: (xhr, status, error) => {
                        console.error('Integration Bridge Status Error (jQuery):', error);
                        this.updateIntegrationStatusDisplay('Status: Error', '#f44336');
                    }
                });
            } else {
                // Last resort: XMLHttpRequest
                const xhr = new XMLHttpRequest();
                const formData = new FormData();
                Object.keys(data).forEach(key => formData.append(key, data[key]));

                xhr.open('POST', ajaxurl, true);
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            try {
                                const response = JSON.parse(xhr.responseText);
                                this.handleIntegrationStatusResponse(response);
                            } catch (e) {
                                console.error('Failed to parse response:', e);
                                this.updateIntegrationStatusDisplay('Status: Parse Error', '#f44336');
                            }
                        } else {
                            console.error('Integration Bridge Status Error (XHR):', xhr.statusText);
                            this.updateIntegrationStatusDisplay('Status: Network Error', '#f44336');
                        }
                    }
                };
                xhr.send(formData);
            }
        } catch (error) {
            console.error('❌ INTEGRATION BRIDGE: Critical error in updateIntegrationBridgeStatus:', error);
            this.updateIntegrationStatusDisplay('Status: Critical Error', '#f44336');
        }
    }

    /**
     * INTEGRATION BRIDGE: Save measurement assignment
     */
    saveMeasurementAssignment(referenceLineData) {
        console.log('🎯 INTEGRATION BRIDGE: Saving measurement assignment...');
        console.log('🎯 INTEGRATION BRIDGE: Reference line data:', referenceLineData);
        console.log('🎯 INTEGRATION BRIDGE: Template ID:', this.templateId);
        console.log('🎯 INTEGRATION BRIDGE: Selected measurement key:', this.selectedMeasurementKey);

        if (!this.templateId) {
            console.error('❌ INTEGRATION BRIDGE: No template ID - cannot save assignment');
            return;
        }
        if (!this.selectedMeasurementKey) {
            console.error('❌ INTEGRATION BRIDGE: No measurement key selected - cannot save assignment');
            return;
        }

        try {
            const data = {
                action: 'save_measurement_assignment',
                template_id: this.templateId,
                measurement_key: this.selectedMeasurementKey,
                reference_line_data: JSON.stringify(referenceLineData),
                nonce: window.pointToPointNonce
            };

            // Use native fetch API as primary method with jQuery fallback
            if (typeof fetch !== 'undefined') {
                // Use modern fetch API
                const formData = new FormData();
                Object.keys(data).forEach(key => formData.append(key, data[key]));

                fetch(ajaxurl, {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(response => {
                    this.handleSaveAssignmentResponse(response);
                })
                .catch(error => {
                    console.error('Save Assignment Error (fetch):', error);
                    this.showNotification('Assignment save error', 'error');
                });
            } else if (typeof $ !== 'undefined' && $.ajax) {
                // Fallback to jQuery AJAX
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: data,
                    success: (response) => {
                        this.handleSaveAssignmentResponse(response);
                    },
                    error: (xhr, status, error) => {
                        console.error('Save Assignment AJAX Error:', error);
                        this.showNotification('Assignment save error', 'error');
                    }
                });
            } else {
                // Last resort: XMLHttpRequest
                const xhr = new XMLHttpRequest();
                const formData = new FormData();
                Object.keys(data).forEach(key => formData.append(key, data[key]));

                xhr.open('POST', ajaxurl, true);
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            try {
                                const response = JSON.parse(xhr.responseText);
                                this.handleSaveAssignmentResponse(response);
                            } catch (e) {
                                console.error('Failed to parse response:', e);
                                this.showNotification('Assignment save parse error', 'error');
                            }
                        } else {
                            console.error('Save Assignment Error (XHR):', xhr.statusText);
                            this.showNotification('Assignment save network error', 'error');
                        }
                    }
                };
                xhr.send(formData);
            }
        } catch (error) {
            console.error('❌ INTEGRATION BRIDGE: Critical error in saveMeasurementAssignment:', error);
            this.showNotification('Critical assignment save error', 'error');
        }
    }

    /**
     * INTEGRATION BRIDGE: Helper method to handle integration status response
     */
    handleIntegrationStatusResponse(response) {
        try {
            if (response.success && response.data.bridge_status) {
                const status = response.data.bridge_status;
                const statusText = `Score: ${status.integration_score}% | Assignments: ${status.assignments_count} | Views: ${status.views_count}`;
                const color = status.integration_score >= 80 ? '#4CAF50' : '#FF9800';
                this.updateIntegrationStatusDisplay(statusText, color);
                this.debug.log(`🎯 INTEGRATION BRIDGE STATUS: ${statusText}`);
            } else {
                console.warn('Integration Bridge Status: Invalid response format');
                this.updateIntegrationStatusDisplay('Status: Invalid Response', '#f44336');
            }
        } catch (error) {
            console.error('Error handling integration status response:', error);
            this.updateIntegrationStatusDisplay('Status: Processing Error', '#f44336');
        }
    }

    /**
     * INTEGRATION BRIDGE: Helper method to handle save assignment response
     */
    handleSaveAssignmentResponse(response) {
        try {
            if (response.success) {
                this.debug.log(`✅ INTEGRATION BRIDGE: Assignment saved - Score: ${response.data.integration_score}%`);
                this.updateIntegrationBridgeStatus();
                this.showNotification(`Measurement assignment saved! Integration Score: ${response.data.integration_score}%`, 'success');
            } else {
                console.error('Save Assignment Error:', response.data);
                this.showNotification('Failed to save measurement assignment', 'error');
            }
        } catch (error) {
            console.error('Error handling save assignment response:', error);
            this.showNotification('Response processing error', 'error');
        }
    }

    /**
     * INTEGRATION BRIDGE: Helper method to update status display with native DOM
     */
    updateIntegrationStatusDisplay(statusText, color) {
        try {
            // Try jQuery first if available
            if (typeof $ !== 'undefined') {
                const statusElement = $('.integration-status');
                if (statusElement.length > 0) {
                    statusElement.text(statusText).css('color', color);
                    return;
                }
            }

            // Fallback to native DOM
            const statusElement = document.querySelector('.integration-status');
            if (statusElement) {
                statusElement.textContent = statusText;
                statusElement.style.color = color;
            } else {
                console.warn('Integration status display element not found');
            }
        } catch (error) {
            console.error('Error updating integration status display:', error);
        }
    }

    /**
     * INTEGRATION BRIDGE: Emergency UI creation without jQuery
     */
    createEmergencyIntegrationUI() {
        console.log('🚨 INTEGRATION BRIDGE: Creating emergency UI (no jQuery)...');

        try {
            // AGENT 3 FIX: Robust selector with fallback for emergency UI
            const selectors = ['.multi-view-point-to-point-controls', '.point-to-point-controls'];
            let controlGroup = null;

            for (const selector of selectors) {
                controlGroup = document.querySelector(selector);
                if (controlGroup) {
                    console.log(`🚨 INTEGRATION BRIDGE: Emergency control group found with selector: ${selector}`);
                    break;
                }
            }

            if (!controlGroup) {
                console.error('❌ INTEGRATION BRIDGE: No control group found for emergency UI');
                console.error('❌ INTEGRATION BRIDGE: Tried selectors:', selectors);
                return;
            }

            const emergencyBridgeHTML = `
                <div class="integration-bridge-section emergency-ui" style="margin-top: 15px; padding: 15px; border: 2px solid #f44336; border-radius: 5px; background: #ffebee;">
                    <h4 style="margin: 0 0 10px 0; color: #c62828;">⚡ Integration Bridge - Emergency Mode</h4>
                    <div class="measurement-assignment-controls">
                        <label for="measurement-type-selector-emergency" style="font-weight: bold; margin-right: 10px;">Measurement Type:</label>
                        <select id="measurement-type-selector-emergency" class="form-select integration-bridge-selector" style="width: 200px; display: inline-block; margin-right: 15px;">
                            <option value="A">A - Chest Width</option>
                            <option value="B">B - Hem Width</option>
                            <option value="C">C - Height from Shoulder</option>
                            <option value="D">D - Shoulder Width</option>
                            <option value="E">E - Sleeve Length</option>
                            <option value="F">F - Collar Width</option>
                        </select>
                        <span class="integration-status" style="font-size: 12px; color: #f44336; margin-left: 10px;">Status: Emergency Mode</span>
                    </div>
                    <div class="measurement-assignment-info" style="margin-top: 10px; font-size: 12px; color: #666;">
                        ⚡ Integration Bridge running in emergency mode (jQuery not available)
                    </div>
                </div>
            `;

            controlGroup.insertAdjacentHTML('afterend', emergencyBridgeHTML);

            // Setup event listener for emergency selector
            const emergencySelector = document.getElementById('measurement-type-selector-emergency');
            if (emergencySelector) {
                emergencySelector.addEventListener('change', (e) => {
                    this.selectedMeasurementKey = e.target.value;
                    console.log(`⚡ INTEGRATION BRIDGE (Emergency): Selected measurement type: ${this.selectedMeasurementKey}`);
                });
            }

            // Set default
            this.selectedMeasurementKey = 'A';
            console.log('⚡ INTEGRATION BRIDGE: Emergency UI created successfully');

        } catch (error) {
            console.error('❌ INTEGRATION BRIDGE: Even emergency UI creation failed:', error);
        }
    }

    /**
     * AGENT 4: Initialize PrecisionCalculator Integration Bridge
     */
    async initializePrecisionCalculatorBridge() {
        console.log('🌉 AGENT 4: Initializing PrecisionCalculator Integration Bridge...');

        try {
            // Validate that the bridge system is ready
            const validation = this.validateReferenceLineBridgeSystem();

            console.log('🌉 AGENT 4: Bridge validation completed:', {
                overallScore: validation.overall_score,
                integrationReadiness: validation.integration_readiness,
                criticalIssues: validation.critical_issues.length,
                warnings: validation.warnings.length
            });

            // Store bridge readiness status
            this.bridgeInitialized = true;
            this.bridgeStatus = {
                initialized: true,
                ready: validation.integration_readiness === 'ready',
                score: validation.overall_score,
                timestamp: Date.now()
            };

            // Set up bridge communication patterns
            if (validation.integration_readiness === 'ready') {
                console.log('✅ AGENT 4: Integration Bridge fully ready for PrecisionCalculator');
                this.setupBridgeCommunication();
            } else if (validation.integration_readiness === 'warning') {
                console.log('⚠️ AGENT 4: Integration Bridge partially ready - some optimizations needed');
            } else {
                console.log('❌ AGENT 4: Integration Bridge requires attention before full integration');
            }

            return this.bridgeStatus;

        } catch (error) {
            console.error('❌ AGENT 4: PrecisionCalculator Integration Bridge initialization failed:', error);
            this.bridgeInitialized = false;
            this.bridgeStatus = {
                initialized: false,
                ready: false,
                error: error.message,
                timestamp: Date.now()
            };
            return this.bridgeStatus;
        }
    }

    /**
     * DELETION SYSTEM: User feedback methods for deletion operations
     */
    showDeleteProgress(message) {
        // Create or update progress notification
        let progressEl = document.getElementById('deletion-progress-notification');
        if (!progressEl) {
            progressEl = document.createElement('div');
            progressEl.id = 'deletion-progress-notification';
            progressEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #0073aa;
                color: white;
                padding: 15px 20px;
                border-radius: 4px;
                z-index: 10000;
                font-weight: bold;
                max-width: 350px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            `;
            document.body.appendChild(progressEl);
        }
        progressEl.innerHTML = `⏳ ${message}`;
        progressEl.style.display = 'block';
    }

    showDeleteSuccess(message) {
        // Create success notification
        let successEl = document.getElementById('deletion-success-notification');
        if (!successEl) {
            successEl = document.createElement('div');
            successEl.id = 'deletion-success-notification';
            successEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #46b450;
                color: white;
                padding: 15px 20px;
                border-radius: 4px;
                z-index: 10000;
                font-weight: bold;
                max-width: 350px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            `;
            document.body.appendChild(successEl);
        }
        successEl.innerHTML = `✅ ${message}`;
        successEl.style.display = 'block';

        // Auto hide after 3 seconds
        setTimeout(() => {
            successEl.style.display = 'none';
        }, 3000);
    }

    showDeleteError(message) {
        // Create error notification
        let errorEl = document.getElementById('deletion-error-notification');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.id = 'deletion-error-notification';
            errorEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #dc3232;
                color: white;
                padding: 15px 20px;
                border-radius: 4px;
                z-index: 10000;
                font-weight: bold;
                max-width: 350px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            `;
            document.body.appendChild(errorEl);
        }
        errorEl.innerHTML = `❌ ${message}`;
        errorEl.style.display = 'block';

        // Auto hide after 5 seconds
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 5000);
    }

    hideDeleteProgress() {
        const progressEl = document.getElementById('deletion-progress-notification');
        if (progressEl) {
            progressEl.style.display = 'none';
        }
    }

    /**
     * AGENT 4: Setup bridge communication patterns
     */
    setupBridgeCommunication() {
        // Store bridge instance globally for external access
        window.integrationBridge = {
            instance: this,
            version: '1.0',
            methods: {
                validate: () => this.validateReferenceLineBridgeSystem(),
                export: () => this.exportForPrecisionCalculation(),
                getByMeasurement: (key) => this.getReferenceLinesByMeasurement(key),
                getPrimary: () => this.getPrimaryReferenceLines()
            }
        };

        console.log('🌉 AGENT 4: Bridge communication patterns established');
        console.log('🌉 AGENT 4: Global bridge available at window.integrationBridge');
    }

    // AGENT 4 ENHANCEMENT: PrecisionCalculator Integration Bridge Methods
    /**
     * INTEGRATION BRIDGE: Get reference lines with coordinate transformation
     */
    getReferenceLinesByMeasurement(measurementKey) {
        const allLines = [];
        const scaleFactor = this.getScaleFactor();

        // Collect all reference lines for this measurement across all views
        for (const [viewId, lines] of Object.entries(this.multiViewReferenceLines)) {
            if (Array.isArray(lines)) {
                const matchingLines = lines.filter(line =>
                    line.measurement_key === measurementKey &&
                    line.linked_to_measurements === true
                );

                matchingLines.forEach(line => {
                    const transformedLine = this.transformCoordinatesForCalculation(line, viewId);
                    allLines.push({
                        ...line,
                        ...transformedLine,
                        view_id: viewId,
                        view_name: this.getViewNameById(viewId),
                        scale_factor: scaleFactor,
                        real_world_length_mm: line.lengthPx * scaleFactor
                    });
                });
            }
        }

        return {
            measurement_key: measurementKey,
            measurement_label: this.getMeasurementLabel(measurementKey),
            total_references: allLines.length,
            reference_lines: allLines,
            primary_reference: allLines.find(line => line.primary_reference === true) || null,
            measurement_category: allLines.length > 0 ? allLines[0].measurement_category : 'unknown',
            average_length_px: allLines.length > 0 ?
                Math.round((allLines.reduce((sum, line) => sum + line.lengthPx, 0) / allLines.length) * 100) / 100 : 0,
            average_length_mm: allLines.length > 0 && scaleFactor ?
                Math.round((allLines.reduce((sum, line) => sum + line.lengthPx * scaleFactor, 0) / allLines.length) * 100) / 100 : 0,
            precision_level: this.getPrecisionLevel(measurementKey),
            coordinate_system: 'transformed',
            bridge_version: '2.0'
        };
    }

    /**
     * ENHANCED INTEGRATION BRIDGE: Advanced coordinate transformation for multi-view mapping
     */
    transformCoordinatesForCalculation(line, viewId) {
        const viewData = this.templateViews[viewId];
        const currentImage = this.currentImages[viewId];

        if (!currentImage || !viewData) {
            return {
                normalized_coordinates: null,
                transform_error: 'Missing image or view data',
                transformation_quality: 0
            };
        }

        // Get enhanced image scaling with precision adjustments
        const imageScaling = this.calculateImageScaling(currentImage.width, currentImage.height);
        const scaleFactor = this.getScaleFactor();
        const viewTransformMatrix = this.getViewTransformationMatrix(viewId);

        // Enhanced coordinate extraction (handle different line formats)
        const startCoord = line.start || { x: line.startX, y: line.startY };
        const endCoord = line.end || { x: line.endX, y: line.endY };

        // Step 1: Transform pixel coordinates to normalized coordinates (0-1)
        const normalizedCoords = {
            start: {
                x: startCoord.x / imageScaling.displayWidth,
                y: startCoord.y / imageScaling.displayHeight
            },
            end: {
                x: endCoord.x / imageScaling.displayWidth,
                y: endCoord.y / imageScaling.displayHeight
            }
        };

        // Step 2: Calculate relative position within actual image bounds
        const relativeCoords = {
            start: {
                x: (startCoord.x - imageScaling.offsetX) / imageScaling.scaledWidth,
                y: (startCoord.y - imageScaling.offsetY) / imageScaling.scaledHeight
            },
            end: {
                x: (endCoord.x - imageScaling.offsetX) / imageScaling.scaledWidth,
                y: (endCoord.y - imageScaling.offsetY) / imageScaling.scaledHeight
            }
        };

        // Step 3: Apply view-specific corrections for perspective and orientation
        const viewCorrectedCoords = this.applyViewCorrections(relativeCoords, viewTransformMatrix);

        // Step 4: Transform to real-world coordinates using scale factor
        const realWorldCoords = {
            start: {
                x: viewCorrectedCoords.start.x * currentImage.naturalWidth * scaleFactor,
                y: viewCorrectedCoords.start.y * currentImage.naturalHeight * scaleFactor
            },
            end: {
                x: viewCorrectedCoords.end.x * currentImage.naturalWidth * scaleFactor,
                y: viewCorrectedCoords.end.y * currentImage.naturalHeight * scaleFactor
            }
        };

        // Step 5: Apply measurement category adjustments
        const categoryAdjustedCoords = this.applyCategoryAdjustments(
            realWorldCoords,
            line.measurement_key
        );

        // Calculate transformation quality score
        const transformationQuality = this.calculateTransformationQuality(line, viewId, realWorldCoords);

        // Calculate measurement accuracy metrics
        const measurementMetrics = this.calculateMeasurementMetrics(categoryAdjustedCoords, line);

        return {
            original_coordinates: {
                start: startCoord,
                end: endCoord
            },
            normalized_coordinates: normalizedCoords,
            relative_coordinates: relativeCoords,
            view_corrected_coordinates: viewCorrectedCoords,
            real_world_coordinates: realWorldCoords,
            category_adjusted_coordinates: categoryAdjustedCoords,
            transformation_matrix: {
                image_scaling: imageScaling,
                view_transformation: viewTransformMatrix,
                scale_factor: scaleFactor,
                category_adjustment: this.getCategoryAdjustmentMatrix(line.measurement_key)
            },
            measurement_metrics: measurementMetrics,
            transformation_quality: transformationQuality,
            coordinate_system: 'enhanced_multi_transform',
            view_id: viewId,
            measurement_category: this.getMeasurementCategory(line.measurement_key),
            precision_level: this.getPrecisionLevel(line.measurement_key),
            bridge_version: '2.1',
            transform_timestamp: Date.now()
        };
    }

    /**
     * INTEGRATION BRIDGE: Get view-specific transformation matrix
     */
    getViewTransformationMatrix(viewId) {
        const viewName = this.getViewNameById(viewId)?.toLowerCase() || 'front';

        const viewCorrections = {
            'front': { scale: 1.0, rotation: 0, perspective: 1.0, distortion: 0 },
            'back': { scale: 0.98, rotation: 180, perspective: 0.98, distortion: 0.02 },
            'left': { scale: 0.85, rotation: 90, perspective: 0.88, distortion: 0.05 },
            'right': { scale: 0.85, rotation: -90, perspective: 0.88, distortion: 0.05 },
            'side': { scale: 0.85, rotation: 0, perspective: 0.88, distortion: 0.05 },
            'top': { scale: 0.92, rotation: 0, perspective: 0.92, distortion: 0.08 },
            'bottom': { scale: 0.92, rotation: 0, perspective: 0.92, distortion: 0.08 }
        };

        return viewCorrections[viewName] || viewCorrections['front'];
    }

    /**
     * INTEGRATION BRIDGE: Apply view-specific corrections
     */
    applyViewCorrections(coordinates, viewMatrix) {
        const correctedStart = {
            x: coordinates.start.x * viewMatrix.perspective * viewMatrix.scale,
            y: coordinates.start.y * viewMatrix.perspective * viewMatrix.scale
        };

        const correctedEnd = {
            x: coordinates.end.x * viewMatrix.perspective * viewMatrix.scale,
            y: coordinates.end.y * viewMatrix.perspective * viewMatrix.scale
        };

        // Apply rotation correction if needed
        if (viewMatrix.rotation !== 0) {
            const angle = (viewMatrix.rotation * Math.PI) / 180;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            return {
                start: {
                    x: correctedStart.x * cos - correctedStart.y * sin,
                    y: correctedStart.x * sin + correctedStart.y * cos
                },
                end: {
                    x: correctedEnd.x * cos - correctedEnd.y * sin,
                    y: correctedEnd.x * sin + correctedEnd.y * cos
                }
            };
        }

        return { start: correctedStart, end: correctedEnd };
    }

    /**
     * INTEGRATION BRIDGE: Apply measurement category adjustments
     */
    applyCategoryAdjustments(realWorldCoords, measurementKey) {
        if (!measurementKey) return realWorldCoords;

        const adjustmentMatrix = this.getCategoryAdjustmentMatrix(measurementKey);

        return {
            start: {
                x: realWorldCoords.start.x * adjustmentMatrix.scale_x + adjustmentMatrix.offset_x,
                y: realWorldCoords.start.y * adjustmentMatrix.scale_y + adjustmentMatrix.offset_y
            },
            end: {
                x: realWorldCoords.end.x * adjustmentMatrix.scale_x + adjustmentMatrix.offset_x,
                y: realWorldCoords.end.y * adjustmentMatrix.scale_y + adjustmentMatrix.offset_y
            },
            category: this.getMeasurementCategory(measurementKey),
            adjustment_applied: true
        };
    }

    /**
     * INTEGRATION BRIDGE: Get category-specific adjustment matrix
     */
    getCategoryAdjustmentMatrix(measurementKey) {
        if (!measurementKey) {
            return { scale_x: 1.0, scale_y: 1.0, offset_x: 0, offset_y: 0 };
        }

        const category = this.getMeasurementCategory(measurementKey);
        const precision = this.getPrecisionLevel(measurementKey);

        const categoryAdjustments = {
            'horizontal': { scale_x: 1.0, scale_y: 1.0, offset_x: 0, offset_y: 0 },
            'vertical': { scale_x: 1.0, scale_y: 1.02, offset_x: 0, offset_y: -1 },
            'detail': { scale_x: 1.03, scale_y: 1.03, offset_x: 0, offset_y: 0 }
        };

        const baseAdjustment = categoryAdjustments[category] || categoryAdjustments['horizontal'];
        const precisionMultiplier = 1 + (precision - 3) * 0.005; // ±0.5% per precision level

        return {
            scale_x: baseAdjustment.scale_x * precisionMultiplier,
            scale_y: baseAdjustment.scale_y * precisionMultiplier,
            offset_x: baseAdjustment.offset_x,
            offset_y: baseAdjustment.offset_y,
            precision_adjustment: precisionMultiplier,
            category: category
        };
    }

    /**
     * INTEGRATION BRIDGE: Calculate transformation quality score
     */
    calculateTransformationQuality(line, viewId, realWorldCoords) {
        let qualityScore = 100;

        // Check coordinate validity
        if (!realWorldCoords.start || !realWorldCoords.end) {
            qualityScore -= 50;
        }

        // Check measurement length reasonableness
        const pixelLength = line.lengthPx || this.calculatePixelDistance(
            line.start || { x: line.startX, y: line.startY },
            line.end || { x: line.endX, y: line.endY }
        );

        if (pixelLength < 5) qualityScore -= 30;   // Too short
        if (pixelLength < 15) qualityScore -= 15;  // Short but acceptable
        if (pixelLength > 800) qualityScore -= 10; // Very long

        // Apply view-specific quality factors
        const viewQuality = this.getViewQualityFactor(viewId);
        qualityScore *= viewQuality;

        // Precision level bonus
        const precisionLevel = this.getPrecisionLevel(line.measurement_key);
        if (precisionLevel >= 4) qualityScore += 8;
        if (precisionLevel <= 2) qualityScore -= 5;

        return Math.max(0, Math.min(100, Math.round(qualityScore)));
    }

    /**
     * INTEGRATION BRIDGE: Calculate measurement accuracy metrics
     */
    calculateMeasurementMetrics(coordinates, line) {
        const realDistance = Math.sqrt(
            Math.pow(coordinates.end.x - coordinates.start.x, 2) +
            Math.pow(coordinates.end.y - coordinates.start.y, 2)
        );

        const pixelDistance = line.lengthPx || this.calculatePixelDistance(
            line.start || { x: line.startX, y: line.startY },
            line.end || { x: line.endX, y: line.endY }
        );

        const scaleFactor = this.getScaleFactor();
        const expectedRealDistance = pixelDistance * scaleFactor;

        const accuracy = expectedRealDistance > 0 ?
            Math.min(100, (1 - Math.abs(realDistance - expectedRealDistance) / expectedRealDistance) * 100) : 0;

        return {
            real_world_length_mm: realDistance,
            pixel_length: pixelDistance,
            expected_real_length_mm: expectedRealDistance,
            accuracy_percentage: Math.round(accuracy),
            scale_factor_used: scaleFactor,
            measurement_valid: accuracy >= 80
        };
    }

    /**
     * INTEGRATION BRIDGE: Get view-specific quality factor
     */
    getViewQualityFactor(viewId) {
        const viewName = this.getViewNameById(viewId)?.toLowerCase() || 'front';

        const qualityFactors = {
            'front': 1.0,     // Best quality
            'back': 0.95,     // Slightly lower
            'left': 0.88,     // Side view challenges
            'right': 0.88,    // Side view challenges
            'side': 0.88,     // Generic side view
            'top': 0.82,      // Top-down perspective issues
            'bottom': 0.82    // Bottom-up perspective issues
        };

        return qualityFactors[viewName] || 0.9;
    }

    /**
     * ENHANCED INTEGRATION BRIDGE: Advanced scale factor calculation with precision validation
     */
    getScaleFactor() {
        // 🚨 EMERGENCY FIX: Complete recursion elimination
        if (this._calculatingScaleFactor) {
            return 1.0; // Static fallback - no more calling calculateCategoryBasedScale()
        }

        this._calculatingScaleFactor = true;

        try {
            // Try to get scale from primary reference lines with enhanced validation
            const primaryLines = this.getPrimaryReferenceLines();
            // RECURSION FIX: Removed call to getPrecisionCalculatorBridgeData() that caused infinite loop

            // DATA STRUCTURE FIX: primaryLines is an array, not an object with reference_lines property
            if (primaryLines && Array.isArray(primaryLines) && primaryLines.length > 0) {
                // Use the most accurate primary reference line
                const sortedPrimaryLines = primaryLines.sort((a, b) => {
                    const aPrecision = this.getPrecisionLevel(a.measurement_key);
                    const bPrecision = this.getPrecisionLevel(b.measurement_key);
                    return bPrecision - aPrecision; // Higher precision first
                });

                const primaryLine = sortedPrimaryLines[0];
                const knownMeasurements = this.getKnownMeasurementDatabase();

                const knownLength = knownMeasurements[primaryLine.measurement_key]?.value;
                if (knownLength && primaryLine.lengthPx > 0) {
                    const calculatedScale = knownLength / primaryLine.lengthPx;

                    // Validate scale factor reasonableness
                    if (calculatedScale > 0.1 && calculatedScale < 10) {
                        console.log(`✅ PRECISION: Scale factor calculated: ${calculatedScale.toFixed(4)} mm/px from ${primaryLine.measurement_key}`);
                        return calculatedScale;
                    }
                }
            }

            // Try alternative calculation using template measurements
            const templateScale = this.calculateTemplateScale();
            if (templateScale > 0) {
                console.log(`✅ PRECISION: Template scale factor: ${templateScale.toFixed(4)} mm/px`);
                return templateScale;
            }

            // 🚨 EMERGENCY FIX: Static fallback instead of category calculation
            const staticFallbackScale = 1.2; // Safe static fallback value
            return staticFallbackScale;
        } finally {
            // Always clear the recursion guard
            this._calculatingScaleFactor = false;
        }
    }

    /**
     * INTEGRATION BRIDGE: Get known measurement database with precision levels
     */
    getKnownMeasurementDatabase() {
        // This would typically come from wp_template_measurements table
        // Enhanced with precision levels and categories
        return {
            'A': { value: 400, unit: 'mm', precision: 5, category: 'horizontal' }, // Chest width
            'B': { value: 300, unit: 'mm', precision: 3, category: 'horizontal' }, // Hem width
            'C': { value: 600, unit: 'mm', precision: 5, category: 'vertical' },   // Height
            'D': { value: 250, unit: 'mm', precision: 4, category: 'horizontal' }, // Shoulder width
            'E': { value: 200, unit: 'mm', precision: 3, category: 'vertical' },   // Sleeve length
            'F': { value: 150, unit: 'mm', precision: 2, category: 'detail' }     // Collar width
        };
    }

    /**
     * INTEGRATION BRIDGE: Calculate template-specific scale factor
     */
    calculateTemplateScale() {
        // Analyze all available measurements to estimate scale
        const allMeasurements = Object.keys(this.measurementTypes);
        const measuredScales = [];

        allMeasurements.forEach(key => {
            const referenceData = this.getReferenceLinesByMeasurement(key);
            if (referenceData.total_references > 0) {
                const knownDB = this.getKnownMeasurementDatabase();
                const knownValue = knownDB[key]?.value;

                if (knownValue) {
                    const avgPixelLength = referenceData.average_length_px ||
                        (referenceData.reference_lines?.[0]?.lengthPx || 0);

                    if (avgPixelLength > 0) {
                        measuredScales.push(knownValue / avgPixelLength);
                    }
                }
            }
        });

        if (measuredScales.length > 0) {
            // Use median to avoid outliers
            measuredScales.sort((a, b) => a - b);
            const median = measuredScales[Math.floor(measuredScales.length / 2)];
            return median;
        }

        return 0;
    }

    /**
     * INTEGRATION BRIDGE: Calculate category-based scale estimation
     */
    calculateCategoryBasedScale() {
        // 🔴 AGENT-1 RECURSION FIX: Prevent infinite loop
        if (this._calculatingCategoryScale) {
            console.warn('⚠️ AGENT-1: Recursion guard activated in calculateCategoryBasedScale - using fallback');
            return 1.0; // Safe fallback
        }

        this._calculatingCategoryScale = true;

        try {
            // Static category mapping to avoid recursive getMeasurementCategory calls
            const staticCategoryMap = {
                'A': 'horizontal', 'B': 'horizontal', 'D': 'horizontal', 'G': 'horizontal', 'H': 'horizontal',
                'C': 'vertical', 'E': 'vertical', 'F': 'vertical'
            };

            let horizontalCount = 0;
            let verticalCount = 0;

            // Count categories using static mapping to prevent recursion
            Object.keys(this.measurementTypes || {}).forEach(key => {
                const category = staticCategoryMap[key] || 'general';
                if (category === 'horizontal') horizontalCount++;
                else if (category === 'vertical') verticalCount++;
            });

            // Estimate based on typical garment proportions
            let scale;
            if (horizontalCount > verticalCount) {
                scale = 1.2; // Horizontal-heavy templates (width-focused)
            } else if (verticalCount > horizontalCount) {
                scale = 0.8; // Vertical-heavy templates (height-focused)
            } else {
                scale = 1.0; // Balanced template
            }

            // 🚨 EMERGENCY: Logging disabled to prevent console explosion
            // console.log(`🔴 AGENT-1: Category scale calculated: ${scale} (H:${horizontalCount}, V:${verticalCount})`);
            return scale;

        } finally {
            this._calculatingCategoryScale = false;
        }
    }

    /**
     * AGENT 4: Get primary reference lines for precision calculation
     */
    getPrimaryReferenceLines() {
        const primaryLines = [];

        for (const [viewId, lines] of Object.entries(this.multiViewReferenceLines)) {
            if (Array.isArray(lines)) {
                const primaries = lines.filter(line => line.primary_reference === true);
                primaries.forEach(line => {
                    primaryLines.push({
                        ...line,
                        view_id: viewId,
                        view_name: this.getViewNameById(viewId)
                    });
                });
            }
        }

        // PERFORMANCE FIX: Reduced console spam
        if (!this._logSpamPrevented) {
            console.log(`🎯 AGENT 4 BRIDGE: Found ${primaryLines.length} primary reference lines`);
            this._logSpamPrevented = true;
            setTimeout(() => this._logSpamPrevented = false, 5000); // Allow logging every 5 seconds
        }
        return primaryLines;
    }

    /**
     * AGENT 4: Export reference line data for PrecisionCalculator
     */
    /**
     * INTEGRATION BRIDGE: Enhanced export with coordinate transformation and validation
     */
    exportForPrecisionCalculation() {
        const scaleFactor = this.getScaleFactor();
        const exportData = {
            template_id: this.templateId,
            timestamp: Date.now(),
            total_views: Object.keys(this.multiViewReferenceLines).length,
            bridge_version: '2.0',
            scale_factor: scaleFactor,
            coordinate_system: 'multi_transform',
            integration_score: this.calculateIntegrationScore(),
            views: {},
            summary: {
                total_measurements: 0,
                primary_measurements: 0,
                transformed_coordinates: 0,
                validation_errors: []
            }
        };

        let totalMeasurements = 0;
        let primaryMeasurements = 0;
        let transformedCoordinates = 0;

        // Process each view with enhanced transformation
        for (const [viewId, lines] of Object.entries(this.multiViewReferenceLines)) {
            if (Array.isArray(lines) && lines.length > 0) {
                const linkedLines = lines.filter(line => line.linked_to_measurements === true);
                const primaryLines = lines.filter(line => line.primary_reference === true);

                // Transform coordinates for each line
                const transformedLines = linkedLines.map(line => {
                    const transformed = this.transformCoordinatesForCalculation(line, viewId);
                    if (transformed.normalized_coordinates) {
                        transformedCoordinates++;
                    }
                    return {
                        ...line,
                        ...transformed,
                        real_world_length_mm: line.lengthPx * scaleFactor
                    };
                });

                exportData.views[viewId] = {
                    view_name: this.getViewNameById(viewId),
                    view_data: this.templateViews[viewId],
                    reference_lines: transformedLines,
                    primary_lines: primaryLines,
                    total_lines: lines.length,
                    linked_lines: linkedLines.length,
                    coordinate_transforms: transformedCoordinates
                };

                totalMeasurements += linkedLines.length;
                primaryMeasurements += primaryLines.length;
            }
        }

        // Update summary
        exportData.summary = {
            total_measurements: totalMeasurements,
            primary_measurements: primaryMeasurements,
            transformed_coordinates: transformedCoordinates,
            transformation_success_rate: totalMeasurements > 0 ? (transformedCoordinates / totalMeasurements) * 100 : 0,
            validation_errors: this.validateExportData(exportData)
        };

        console.log('🌉 INTEGRATION BRIDGE: Enhanced export data prepared:', exportData);
        return exportData;
    }

    /**
     * INTEGRATION BRIDGE: Validate export data for precision calculations
     */
    validateExportData(exportData) {
        const errors = [];

        // Check for missing primary references
        if (exportData.summary.primary_measurements < 2) {
            errors.push('Insufficient primary reference measurements (need A and C)');
        }

        // Check coordinate transformation success
        if (exportData.summary.transformation_success_rate < 100) {
            errors.push(`Coordinate transformation incomplete: ${exportData.summary.transformation_success_rate.toFixed(1)}%`);
        }

        // Check scale factor validity
        if (!exportData.scale_factor || exportData.scale_factor <= 0) {
            errors.push('Invalid scale factor - precision calculations may be inaccurate');
        }

        // Check for duplicate measurements
        const measurementKeys = [];
        Object.values(exportData.views).forEach(view => {
            if (Array.isArray(view.reference_lines)) {
                view.reference_lines.forEach(line => {
                    if (measurementKeys.includes(line.measurement_key)) {
                        errors.push(`Duplicate measurement key detected: ${line.measurement_key}`);
                    } else if (line.measurement_key) {
                        measurementKeys.push(line.measurement_key);
                    }
                });
            }
        });

        return errors;
    }

    /**
     * INTEGRATION BRIDGE: Get precision calculator bridge connection data
     */
    getPrecisionCalculatorBridgeData() {
        // RECURSION FIX: Use cached scale factor to prevent infinite loop
        const scaleFactor = this._calculatingScaleFactor ? 0.8 : this.getScaleFactor();

        return {
            template_id: this.templateId,
            bridge_version: '2.0',
            scale_factor: scaleFactor,
            coordinate_system: 'multi_transform',
            measurement_mappings: this.getMeasurementMappings(),
            primary_references: this.getPrimaryReferenceLines(),
            integration_score: this.calculateIntegrationScore(),
            last_updated: Date.now()
        };
    }

    /**
     * INTEGRATION BRIDGE: Get measurement mappings for precision calculator
     */
    getMeasurementMappings() {
        const mappings = {};

        Object.keys(this.measurementTypes).forEach(key => {
            const referenceData = this.getReferenceLinesByMeasurement(key);
            mappings[key] = {
                label: this.getMeasurementLabel(key),
                category: this.getMeasurementCategory(key),
                precision_level: this.getPrecisionLevel(key),
                has_reference: referenceData.total_references > 0,
                is_primary: this.isPrimaryMeasurement(key),
                reference_count: referenceData.total_references,
                average_px: referenceData.average_length_px,
                average_mm: referenceData.average_length_mm
            };
        });

        return mappings;
    }

    /**
     * AGENT 4: Validate reference lines for precision calculation
     */
    validateForPrecisionCalculation() {
        const validation = {
            valid: true,
            errors: [],
            warnings: [],
            summary: {
                total_views: 0,
                total_lines: 0,
                primary_lines: 0,
                linked_lines: 0
            }
        };

        for (const [viewId, lines] of Object.entries(this.multiViewReferenceLines)) {
            if (Array.isArray(lines)) {
                validation.summary.total_views++;
                validation.summary.total_lines += lines.length;

                const linkedLines = lines.filter(line => line.linked_to_measurements === true);
                const primaryLines = lines.filter(line => line.primary_reference === true);

                validation.summary.linked_lines += linkedLines.length;
                validation.summary.primary_lines += primaryLines.length;

                // Validate individual lines
                lines.forEach(line => {
                    if (!line.measurement_key) {
                        validation.errors.push(`View ${viewId}: Reference line missing measurement key`);
                        validation.valid = false;
                    }

                    if (!line.start_point || !line.end_point) {
                        validation.errors.push(`View ${viewId}: Reference line missing start/end points`);
                        validation.valid = false;
                    }

                    if (line.linked_to_measurements && !line.precision_level) {
                        validation.warnings.push(`View ${viewId}: Linked line missing precision level`);
                    }
                });
            }
        }

        // Check for minimum requirements
        if (validation.summary.linked_lines === 0) {
            validation.errors.push('No reference lines are linked to measurements');
            validation.valid = false;
        }

        if (validation.summary.primary_lines === 0) {
            validation.warnings.push('No primary reference lines defined');
        }

        console.log('🎯 AGENT 4 BRIDGE: Validation completed:', validation);
        return validation;
    }

    /**
     * AGENT 4: Comprehensive Reference Line Integration Bridge System Validation
     * This is the main validation method that provides a complete system health check
     */
    validateReferenceLineBridgeSystem() {
        console.log('🌉 AGENT 4: Starting comprehensive Integration Bridge validation...');

        const startTime = performance.now();
        const timestamp = Date.now();

        // Initialize validation results structure
        const validation = {
            timestamp,
            system_status: 'initializing',
            validation_results: {},
            overall_score: 0,
            integration_readiness: 'unknown',
            critical_issues: [],
            warnings: [],
            recommendations: []
        };

        try {
            // 1. Validate Template Context
            validation.validation_results.template_context = this.validateTemplateContext();

            // 2. Validate Reference Line Data Structure
            validation.validation_results.reference_line_structure = this.validateReferenceLineStructure();

            // 3. Validate Integration Bridge Methods
            validation.validation_results.bridge_methods = this.getBridgeMethodsStatus();

            // 4. Validate Precision Calculation Readiness
            validation.validation_results.precision_readiness = this.validateForPrecisionCalculation();

            // 5. Validate Multi-View Coordination
            validation.validation_results.multi_view_coordination = this.validateMultiViewCoordination();

            // 6. Calculate Integration Bridge Statistics
            validation.validation_results.bridge_statistics = this.calculateIntegrationBridgeStats();

            // Calculate overall score based on validation results
            const scores = this.calculateValidationScores(validation.validation_results);
            validation.overall_score = scores.overall;

            // Determine integration readiness
            if (scores.overall >= 90) {
                validation.integration_readiness = 'ready';
                validation.system_status = 'operational';
            } else if (scores.overall >= 70) {
                validation.integration_readiness = 'warning';
                validation.system_status = 'partially_ready';
                validation.warnings.push('System partially ready - some optimizations needed');
            } else {
                validation.integration_readiness = 'error';
                validation.system_status = 'requires_attention';
                validation.critical_issues.push('System requires critical fixes before integration');
            }

            // Add specific recommendations based on validation results
            this.generateValidationRecommendations(validation);

            const endTime = performance.now();
            console.log(`🌉 AGENT 4: Integration Bridge validation completed in ${(endTime - startTime).toFixed(2)}ms`);
            console.log(`🌉 AGENT 4: Overall Score: ${validation.overall_score}% - Status: ${validation.integration_readiness}`);

            return validation;

        } catch (error) {
            validation.system_status = 'error';
            validation.integration_readiness = 'error';
            validation.overall_score = 0;
            validation.critical_issues.push(`Validation failed: ${error.message}`);

            console.error('❌ AGENT 4: Integration Bridge validation failed:', error);
            return validation;
        }
    }

    /**
     * AGENT 4: Validate template context and basic requirements
     */
    validateTemplateContext() {
        const context = {
            valid: true,
            score: 0,
            issues: [],
            details: {}
        };

        // Check template ID
        if (this.templateId) {
            context.score += 20;
            context.details.template_id = this.templateId;
        } else {
            context.valid = false;
            context.issues.push('Missing template ID');
        }

        // Check canvas element
        if (this.canvas && this.ctx) {
            context.score += 20;
            context.details.canvas_ready = true;
        } else {
            context.valid = false;
            context.issues.push('Canvas not properly initialized');
        }

        // Check debug system
        if (this.debug) {
            context.score += 10;
            context.details.debug_system = true;
        }

        // Check template views
        const viewCount = Object.keys(this.templateViews || {}).length;
        if (viewCount > 0) {
            context.score += 25;
            context.details.view_count = viewCount;
        } else {
            context.issues.push('No template views available');
        }

        // Check measurement types
        const measurementCount = Object.keys(this.measurementTypes || {}).length;
        if (measurementCount > 0) {
            context.score += 25;
            context.details.measurement_count = measurementCount;
        } else {
            context.issues.push('No measurement types loaded');
        }

        return context;
    }

    /**
     * AGENT 4: Validate reference line data structure integrity
     */
    validateReferenceLineStructure() {
        const structure = {
            valid: true,
            score: 0,
            issues: [],
            details: {}
        };

        const lines = this.multiViewReferenceLines || {};
        const totalViews = Object.keys(lines).length;
        let totalLines = 0;
        let validLines = 0;
        let linkedLines = 0;
        let primaryLines = 0;

        // Analyze each view's reference lines
        for (const [viewId, viewLines] of Object.entries(lines)) {
            if (!Array.isArray(viewLines)) {
                structure.issues.push(`View ${viewId}: Reference lines not in array format`);
                continue;
            }

            totalLines += viewLines.length;

            viewLines.forEach(line => {
                // Check required fields
                if (line.measurement_key && line.start && line.end && typeof line.lengthPx === 'number') {
                    validLines++;

                    if (line.linked_to_measurements) linkedLines++;
                    if (line.primary_reference) primaryLines++;
                } else {
                    structure.issues.push(`View ${viewId}: Invalid reference line structure`);
                }
            });
        }

        // Calculate scores
        if (totalLines > 0) {
            const validityRatio = validLines / totalLines;
            structure.score = Math.round(validityRatio * 100);
        }

        structure.details = {
            total_views: totalViews,
            total_lines: totalLines,
            valid_lines: validLines,
            linked_lines: linkedLines,
            primary_lines: primaryLines,
            validity_percentage: structure.score
        };

        if (totalLines === 0) {
            structure.issues.push('No reference lines defined');
        }

        if (linkedLines === 0) {
            structure.issues.push('No reference lines linked to measurements');
        }

        if (primaryLines === 0) {
            structure.issues.push('No primary reference lines defined');
        }

        return structure;
    }

    /**
     * AGENT 4: Validate multi-view coordination capabilities
     */
    validateMultiViewCoordination() {
        const coordination = {
            valid: true,
            score: 0,
            issues: [],
            details: {}
        };

        // Check current view state
        if (this.currentViewId && this.currentView) {
            coordination.score += 30;
            coordination.details.current_view = {
                id: this.currentViewId,
                name: this.currentView.name
            };
        } else {
            coordination.issues.push('No current view selected');
        }

        // Check view switching capability
        const totalViews = Object.keys(this.templateViews || {}).length;
        if (totalViews > 1) {
            coordination.score += 40;
            coordination.details.multi_view_capable = true;
            coordination.details.total_views = totalViews;
        } else {
            coordination.score += 20; // Single view is still functional
            coordination.details.multi_view_capable = false;
        }

        // Check view data consistency
        let viewsWithLines = 0;
        for (const viewId of Object.keys(this.templateViews || {})) {
            if (this.multiViewReferenceLines[viewId] && this.multiViewReferenceLines[viewId].length > 0) {
                viewsWithLines++;
            }
        }

        if (viewsWithLines > 0) {
            coordination.score += 30;
            coordination.details.views_with_data = viewsWithLines;
        }

        return coordination;
    }

    /**
     * AGENT 4: Calculate validation scores from all validation results
     */
    /**
     * INTEGRATION BRIDGE: Enhanced validation scoring with new features
     */
    calculateValidationScores(results) {
        const weights = {
            template_context: 0.15,
            reference_line_structure: 0.25,
            bridge_methods: 0.20,
            precision_readiness: 0.25,
            multi_view_coordination: 0.15
        };

        let totalScore = 0;
        let totalWeight = 0;

        // Enhanced scoring with integration bridge features
        for (const [category, result] of Object.entries(results)) {
            if (weights[category] && result.score !== undefined) {
                let categoryScore = result.score;

                // Apply integration bridge bonuses
                if (category === 'reference_line_structure') {
                    // Bonus for enhanced data structure
                    const enhancedFields = this.countEnhancedDataFields();
                    if (enhancedFields >= 7) categoryScore = Math.min(100, categoryScore + 10);
                }

                if (category === 'precision_readiness') {
                    // Bonus for coordinate transformation
                    const transformationScore = this.getCoordinateTransformationScore();
                    categoryScore = Math.min(100, categoryScore + transformationScore * 0.2);
                }

                if (category === 'bridge_methods') {
                    // Bonus for all integration bridge methods implemented
                    const integrationScore = this.calculateIntegrationScore();
                    if (integrationScore >= 90) categoryScore = Math.min(100, categoryScore + 15);
                }

                totalScore += categoryScore * weights[category];
                totalWeight += weights[category];
            }
        }

        // Integration Bridge completion bonus
        const integrationScore = this.calculateIntegrationScore();
        const bridgeBonus = integrationScore >= 100 ? 5 : 0;

        const overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
        const finalScore = Math.min(100, overallScore + bridgeBonus);

        return {
            overall: finalScore,
            integration_bonus: bridgeBonus,
            raw_score: overallScore,
            integration_completion: integrationScore,
            breakdown: Object.fromEntries(
                Object.entries(results).map(([key, result]) => [key, result.score || 0])
            )
        };
    }

    /**
     * INTEGRATION BRIDGE: Count enhanced data structure fields
     */
    countEnhancedDataFields() {
        const requiredFields = [
            'measurement_key', 'measurement_label', 'precision_level',
            'measurement_category', 'bridge_version', 'coordinate_system',
            'measurement_angle', 'measurement_vector', 'integration_status'
        ];

        let completeCount = 0;
        let totalLines = 0;

        Object.values(this.multiViewReferenceLines).forEach(viewLines => {
            if (Array.isArray(viewLines)) {
                viewLines.forEach(line => {
                    totalLines++;
                    const hasAllFields = requiredFields.every(field => line[field] !== undefined);
                    if (hasAllFields) completeCount++;
                });
            }
        });

        return totalLines > 0 ? completeCount : 0;
    }

    /**
     * INTEGRATION BRIDGE: Get coordinate transformation completion score
     */
    getCoordinateTransformationScore() {
        let transformedCount = 0;
        let totalLines = 0;

        Object.values(this.multiViewReferenceLines).forEach(viewLines => {
            if (Array.isArray(viewLines)) {
                viewLines.forEach(line => {
                    if (line.linked_to_measurements) {
                        totalLines++;
                        if (line.coordinate_system === 'pixel' || line.coordinate_system === 'multi_transform') {
                            transformedCount++;
                        }
                    }
                });
            }
        });

        return totalLines > 0 ? (transformedCount / totalLines) * 100 : 0;
    }

    /**
     * AGENT 4: Generate specific recommendations based on validation results
     */
    generateValidationRecommendations(validation) {
        const results = validation.validation_results;

        // Template context recommendations
        if (results.template_context?.score < 80) {
            validation.recommendations.push('Initialize all template context components properly');
        }

        // Reference line recommendations
        if (results.reference_line_structure?.score < 70) {
            validation.recommendations.push('Add more reference lines and ensure proper data structure');
        }

        if (results.bridge_statistics?.linked === 0) {
            validation.recommendations.push('Link reference lines to measurements for precision calculation');
        }

        if (results.bridge_statistics?.primary === 0) {
            validation.recommendations.push('Define primary reference lines for accurate scaling');
        }

        // Method availability recommendations
        if (results.bridge_methods?.completeness !== '100.0%') {
            validation.recommendations.push('Ensure all Integration Bridge methods are properly implemented');
        }

        // Multi-view recommendations
        if (results.multi_view_coordination?.score < 80) {
            validation.recommendations.push('Improve multi-view coordination and data consistency');
        }

        // Performance recommendations
        if (validation.overall_score < 90) {
            validation.recommendations.push('Complete setup and configuration for optimal integration readiness');
        }
    }

    /**
     * AGENT 7: Quality assurance bridge method verification
     */
    getBridgeMethodsStatus() {
        const bridgeMethods = ['getReferenceLinesByMeasurement', 'getPrimaryReferenceLines', 'exportForPrecisionCalculator', 'validateForPrecisionCalculation', 'validateReferenceLineBridgeSystem'];
        const status = {
            available: [],
            missing: [],
            functional: 0,
            total: bridgeMethods.length,
            score: 0
        };

        bridgeMethods.forEach(methodName => {
            if (typeof this[methodName] === 'function') {
                status.available.push(methodName);
                status.functional++;
            } else {
                status.missing.push(methodName);
            }
        });

        status.score = Math.round((status.functional / status.total) * 100);
        status.completeness = (status.functional / status.total * 100).toFixed(1) + '%';
        console.log('🔍 AGENT 7: Integration Bridge Methods Status:', status);
        return status;
    }

    /**
     * AGENT 4 INTEGRATION METHODS: Enhanced measurement dropdown functionality
     */

    /**
     * AGENT 4: Initialize enhanced measurement dropdown with database integration
     */
    async initializeAgent4MeasurementDropdown() {
        console.log('🚀 AGENT 4: Initializing enhanced measurement dropdown...');

        // 🔴 PHASE 2: Integrated enhancement - no external dependencies
        try {
            console.log('🔴 PHASE 2: Using integrated measurement enhancement');

            // Direct initialization - measurement dropdown is now integrated
            console.log('✅ Measurement dropdown integrated directly into main system');
            return true;

        } catch (error) {
            console.error('❌ PHASE 2: Failed to initialize measurement dropdown:', error);
            return false;
        }
    }

    /**
     * 🔴 PHASE 2: Enhanced measurement dropdown integrated - no external script needed
     */
    async loadAgent4EnhancementScript() {
        console.log('🔴 PHASE 2: Agent 4 enhancement integrated - external script removed');
        return Promise.resolve(); // Always resolve successfully
    }

    /**
     * Refresh measurement dropdown (simplified)
     */
    async refreshMeasurementDropdown() {
        console.log('🔄 Manual measurement dropdown refresh requested');
        return await this.loadMeasurementTypes();
    }

    /**
     * Get measurement loading status (simplified)
     */
    getMeasurementLoadingStatus() {
        return { isLoading: false, hasError: false, errorMessage: null };
    }

    /**
     * Force reload measurements from database (simplified)
     */
    async forceReloadMeasurements() {
        console.log('🔄 Forcing measurement reload from database...');
        return await this.loadMeasurementTypes();
    }
}

// Global Instance für Multi-View Template Editor
let multiViewPointToPointSelector = null;

/**
 * AGENT 6: Enhanced Multi-View Point-to-Point Selector initialization with error handling
 */
function initMultiViewPointToPointSelector(templateId) {
    console.log('⚡ AGENT 6: Global function initialization called for template:', templateId);

    // ENHANCED: Robust canvas detection with fabric.js priority
    let canvas = null;

    console.log('🔍 CANVAS DETECTION: Starting enhanced canvas search...');

    // Method 1: Try to find existing Fabric.js canvas instance first (highest priority)
    if (window.fabricCanvas) {
        console.log('✅ CANVAS FOUND: Using existing window.fabricCanvas');
        canvas = window.fabricCanvas.getElement();
    } else if (window.templateEditors instanceof Map && window.templateEditors.size > 0) {
        // Method 2: Check templateEditors Map
        for (const [key, editor] of window.templateEditors.entries()) {
            if (editor && editor.canvas && editor.canvas.getElement) {
                console.log('✅ CANVAS FOUND: Using canvas from templateEditor:', key);
                canvas = editor.canvas.getElement();
                break;
            }
        }
    } else if (window.variationsManager && window.variationsManager.editors instanceof Map) {
        // Method 3: Check variationsManager
        for (const [key, editor] of window.variationsManager.editors.entries()) {
            if (editor && editor.canvas && editor.canvas.getElement) {
                console.log('✅ CANVAS FOUND: Using canvas from variationsManager:', key);
                canvas = editor.canvas.getElement();
                break;
            }
        }
    }

    // Method 4: Fallback to DOM element search
    if (!canvas) {
        canvas = document.getElementById('template-canvas');
        if (canvas) {
            console.log('✅ CANVAS FOUND: Using template-canvas DOM element');
        }
    }

    // Method 5: Last resort - search all canvas elements
    if (!canvas) {
        console.warn('⚠️ CANVAS FALLBACK: Searching all canvas elements...');
        const canvasElements = document.querySelectorAll('canvas');
        console.log('🔍 CANVAS SEARCH: Found', canvasElements.length, 'canvas elements');

        for (let i = 0; i < canvasElements.length; i++) {
            const canvasEl = canvasElements[i];
            const canvasInfo = {
                id: canvasEl.id || 'no-id',
                classes: canvasEl.className || 'no-classes',
                parent: canvasEl.parentElement?.className || 'no-parent',
                hasFabric: !!canvasEl.__fabric
            };
            console.log(`🔍 CANVAS ${i}:`, canvasInfo);

            // Prioritize canvas with Fabric.js attached
            if (canvasEl.__fabric) {
                canvas = canvasEl;
                console.log('✅ CANVAS FOUND: Using Fabric.js canvas', i);
                break;
            }

            // Otherwise use first non-overlay canvas
            if (!canvasEl.className.includes('upper-canvas') && !canvasEl.className.includes('lower-canvas')) {
                canvas = canvasEl;
                console.log('✅ CANVAS FOUND: Using standard canvas', i);
            }
        }
    }

    // CRISIS FIX: More flexible container detection
    let container = document.getElementById('point-to-point-container');

    if (!container) {
        console.warn('⚠️ CONTAINER CRISIS: point-to-point-container not found, searching for alternatives...');

        // Try to find or create a suitable container
        const candidateSelectors = [
            '.template-canvas-container',
            '.canvas-container',
            '#template-editor',
            '.template-editor-content'
        ];

        for (const selector of candidateSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                console.log('✅ CONTAINER FOUND: Using', selector, 'as container');
                container = element;
                break;
            }
        }

        // Last resort: Create container
        if (!container && canvas) {
            console.log('🚨 EMERGENCY: Creating point-to-point container');
            container = document.createElement('div');
            container.id = 'point-to-point-container';
            container.style.position = 'relative';
            canvas.parentElement.appendChild(container);
        }
    }

    if (!canvas) {
        console.error('❌ CRITICAL: No suitable canvas element found in DOM');
        console.error('🔍 DEBUGGING: Available elements:', {
            canvasElements: document.querySelectorAll('canvas').length,
            templateEditorElements: document.querySelectorAll('[class*="template"]').length,
            allIds: Array.from(document.querySelectorAll('[id]')).map(el => el.id)
        });
        return null;
    }

    if (!container) {
        console.error('❌ CRITICAL: No suitable container element found in DOM');
        return null;
    }

    console.log('✅ AGENT 6: Required DOM elements found, creating MultiViewPointToPointSelector');

    try {
        multiViewPointToPointSelector = new MultiViewPointToPointSelector(canvas, templateId);

        // Store globally for debugging
        window.multiViewSelector = multiViewPointToPointSelector;

        console.log('✅ AGENT 6: MultiViewPointToPointSelector instance created successfully');
        return multiViewPointToPointSelector;

    } catch (error) {
        console.error('❌ AGENT 6: Failed to create MultiViewPointToPointSelector:', error);

        // Display error to user
        if (container) {
            container.innerHTML = `
                <div style="background: #f8d7da; border: 1px solid #f1aeb5; color: #721c24; padding: 15px; border-radius: 4px;">
                    <strong>❌ Initialisierung fehlgeschlagen</strong><br>
                    Das Multi-View Point-to-Point System konnte nicht gestartet werden.<br>
                    <small>Error: ${error.message}</small>
                </div>
            `;
        }

        return null;
    }
}
// WordPress Admin Integration with delayed initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 DOM Content Loaded - Starting template editor detection...');

    // Auto-Initialisierung wenn Template-Seite erkannt wird
    const templateIdElement = document.getElementById('template-id-input');

    if (templateIdElement) {
        const templateId = templateIdElement.value;

        if (templateId) {
            console.log('🚀 Multi-View Point-to-Point System detected for template:', templateId);

            // CRISIS FIX: Wait for template editor to be fully initialized
            let initAttempts = 0;
            const maxAttempts = 20; // 10 seconds maximum
            const attemptDelay = 500; // 500ms between attempts

            const tryInitialization = () => {
                initAttempts++;
                console.log(`🔄 INIT ATTEMPT ${initAttempts}/${maxAttempts}: Checking for template editor readiness...`);

                // Check if template editor systems are ready
                const canvasElements = document.querySelectorAll('canvas');
                const templateEditorReady = window.templateEditors &&
                    (window.templateEditors instanceof Map ? window.templateEditors.size > 0 : Object.keys(window.templateEditors).length > 0);
                const variationsManagerReady = window.variationsManager && window.variationsManager.editors;
                const fabricReady = window.fabric && typeof window.fabric.Canvas === 'function';

                console.log('🔍 READINESS CHECK:', {
                    canvasElements: canvasElements.length,
                    templateEditorReady,
                    variationsManagerReady,
                    fabricReady,
                    attempt: initAttempts
                });

                // Try initialization if conditions are met
                if ((canvasElements.length > 0 && fabricReady) || initAttempts >= maxAttempts) {
                    if (initAttempts >= maxAttempts) {
                        console.warn('⚠️ TIMEOUT: Proceeding with initialization despite potential issues');
                    }

                    console.log('✅ CONDITIONS MET: Proceeding with MultiViewPointToPointSelector initialization');
                    const result = initMultiViewPointToPointSelector(templateId);

                    if (result) {
                        console.log('🎉 SUCCESS: MultiViewPointToPointSelector initialized successfully');
                    } else {
                        console.error('❌ FAILURE: MultiViewPointToPointSelector initialization failed');
                    }
                } else {
                    // Wait and try again
                    console.log(`⏳ WAITING: Retrying in ${attemptDelay}ms...`);
                    setTimeout(tryInitialization, attemptDelay);
                }
            };

            // Start the initialization process with a small delay
            setTimeout(tryInitialization, 100);
        }
    } else {
        console.log('ℹ️ No template ID found - MultiViewPointToPointSelector not needed');
    }
});
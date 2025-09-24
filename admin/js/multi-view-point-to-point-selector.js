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
                console.log(fullMessage, data || '');
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
        this.templateViews = {};
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

            // Step 5: Load existing reference lines
            console.log('⚡ AGENT 6: Step 5 - Loading existing reference lines');
            await this.loadExistingMultiViewReferenceLines();

            console.log('✅ AGENT 6: Multi-View Point-to-Point initialization complete');

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
                this.templateViews = data.data.views;

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
     * Lädt verfügbare Measurement-Types aus der Database (Issue #19)
     */
    async loadMeasurementTypes() {
        try {
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
            if (data.success) {
                this.measurementTypes = data.data.measurement_types;
                this.populateMeasurementDropdown();
            }
        } catch (error) {
            console.error('Fehler beim Laden der Measurement Types:', error);
        }
    }

    /**
     * Erstellt View Selector Tabs
     */
    createViewSelector() {
        const container = document.getElementById('view-selector-container');
        if (!container) return;

        const viewTabs = Object.entries(this.templateViews).map(([viewId, viewData]) => `
            <button class="view-tab" data-view-id="${viewId}">
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
                const viewId = e.target.dataset.viewId;
                await this.switchToView(viewId);
            });
        });
    }

    /**
     * Wechselt zu einer anderen View
     */
    async switchToView(viewId) {
        if (!this.templateViews[viewId]) {
            console.error('View not found:', viewId);
            return;
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
            lengthPx: Math.round(lengthPx * 100) / 100,
            start: { x: Math.round(start.x), y: Math.round(start.y) },
            end: { x: Math.round(end.x), y: Math.round(end.y) },
            view_id: this.currentViewId,
            view_name: this.currentView.name
        };

        // AGENT 2 FIX: Ensure current view array exists before filter operation
        this.updateCurrentViewReferenceLines();

        // Entferne existierende Linie mit gleichem measurement_key in aktueller View
        this.multiViewReferenceLines[this.currentViewId] = this.multiViewReferenceLines[this.currentViewId].filter(line =>
            line.measurement_key !== this.selectedMeasurementKey
        );

        this.multiViewReferenceLines[this.currentViewId].push(referenceLine);
        this.updateLinesDisplay();
        this.updateViewCounts();
        this.redrawCanvas();

        // Reset für nächste Linie
        this.selectedMeasurementKey = null;
        document.getElementById('measurement-type-selector').value = '';
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

        // Label zeichnen
        const midX = (line.start.x + line.end.x) / 2;
        const midY = (line.start.y + line.end.y) / 2;

        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(`${line.measurement_key}: ${line.lengthPx}px`, midX + 10, midY - 10);
        this.ctx.fillText(`${line.measurement_key}: ${line.lengthPx}px`, midX + 10, midY - 10);

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
     * Füllt das Dropdown mit verfügbaren Measurement-Types
     */
    populateMeasurementDropdown() {
        const dropdown = document.getElementById('measurement-type-selector');
        dropdown.innerHTML = '<option value="">Measurement-Type auswählen...</option>';

        Object.entries(this.measurementTypes).forEach(([key, data]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${key} - ${data.label}`;
            dropdown.appendChild(option);
        });
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
     * Löscht alle Referenzlinien der aktuellen View
     */
    clearCurrentViewLines() {
        if (!this.currentViewId) {
            alert('Keine View ausgewählt.');
            return;
        }

        const count = this.multiViewReferenceLines[this.currentViewId] ? this.multiViewReferenceLines[this.currentViewId].length : 0;

        if (count === 0) {
            alert('Keine Referenzlinien in aktueller View vorhanden.');
            return;
        }

        if (confirm(`Alle ${count} Referenzlinien in "${this.currentView.name}" löschen?`)) {
            this.multiViewReferenceLines[this.currentViewId] = [];
            this.points = [];
            this.redrawCanvas();
            this.updateLinesDisplay();
            this.updateViewCounts();
        }
    }

    /**
     * Löscht alle Referenzlinien in allen Views
     */
    clearAllViewsLines() {
        const totalCount = Object.values(this.multiViewReferenceLines).reduce((total, lines) =>
            total + (Array.isArray(lines) ? lines.length : 0), 0);

        if (totalCount === 0) {
            alert('Keine Referenzlinien vorhanden.');
            return;
        }

        if (confirm(`Alle ${totalCount} Referenzlinien in allen Views löschen?`)) {
            this.multiViewReferenceLines = {};
            this.points = [];
            this.redrawCanvas();
            this.updateLinesDisplay();
            this.updateViewCounts();
        }
    }

    /**
     * Update der Multi-View Linien-Anzeige
     */
    updateLinesDisplay() {
        const display = document.getElementById('multi-view-lines-display');
        if (!display) return;

        const totalLines = Object.values(this.multiViewReferenceLines).reduce((total, lines) =>
            total + (Array.isArray(lines) ? lines.length : 0), 0);

        if (totalLines === 0) {
            display.innerHTML = '<em>Keine Referenzlinien in keiner View definiert</em>';
            return;
        }

        const viewsHTML = Object.entries(this.multiViewReferenceLines).map(([viewId, lines]) => {
            if (!Array.isArray(lines) || lines.length === 0) return '';

            const viewName = this.templateViews[viewId]?.name || `View ${viewId}`;
            const linesHTML = lines.map(line => `
                <div class="reference-line-item ${viewId === this.currentViewId ? 'current-view' : ''}">
                    <strong>${line.measurement_key} - ${line.label}</strong><br>
                    Länge: ${line.lengthPx}px<br>
                    Von: (${line.start.x}, ${line.start.y}) nach (${line.end.x}, ${line.end.y})
                    <button class="button-link" onclick="multiViewPointToPointSelector.removeReferenceLine('${viewId}', '${line.measurement_key}')">
                        Entfernen
                    </button>
                </div>
            `).join('');

            return `
                <div class="view-lines-group">
                    <h5>📐 ${viewName} (${lines.length} Linien):</h5>
                    ${linesHTML}
                </div>
            `;
        }).filter(html => html).join('');

        display.innerHTML = viewsHTML;
    }

    /**
     * Entfernt eine spezifische Referenzlinie aus einer View
     */
    removeReferenceLine(viewId, measurementKey) {
        if (this.multiViewReferenceLines[viewId]) {
            this.multiViewReferenceLines[viewId] = this.multiViewReferenceLines[viewId].filter(line =>
                line.measurement_key !== measurementKey
            );

            if (viewId === this.currentViewId) {
                this.redrawCanvas();
            }
            this.updateLinesDisplay();
            this.updateViewCounts();
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

            const response = await fetch(pointToPointAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'save_multi_view_reference_lines',
                    template_id: this.templateId,
                    multi_view_reference_lines: JSON.stringify(this.multiViewReferenceLines),
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
     */
    async createSingleViewFallback() {
        console.log('🔄 Creating single view fallback system');

        // Create fallback view using legacy image loading
        this.templateViews = {
            'single': {
                id: 'single',
                name: 'Template View',
                image_url: await this.loadLegacyTemplateImage(),
                image_id: null,
                safe_zone: {}
            }
        };

        this.createViewSelector();
        await this.switchToView('single');
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
}

// Global Instance für Multi-View Template Editor
let multiViewPointToPointSelector = null;

/**
 * AGENT 6: Enhanced Multi-View Point-to-Point Selector initialization with error handling
 */
function initMultiViewPointToPointSelector(templateId) {
    console.log('⚡ AGENT 6: Global function initialization called for template:', templateId);

    const canvas = document.getElementById('template-canvas');
    const container = document.getElementById('point-to-point-container');

    if (!canvas) {
        console.error('❌ AGENT 6: Template canvas element not found in DOM');
        return null;
    }

    if (!container) {
        console.error('❌ AGENT 6: Point-to-point container element not found in DOM');
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

// WordPress Admin Integration
document.addEventListener('DOMContentLoaded', function() {
    // Auto-Initialisierung wenn Template-Seite erkannt wird
    const templateIdElement = document.getElementById('template-id-input');

    if (templateIdElement) {
        const templateId = templateIdElement.value;

        if (templateId) {
            console.log('🚀 Multi-View Point-to-Point System initializing for template:', templateId);
            initMultiViewPointToPointSelector(templateId);
        }
    }
});
/**
 * 📈 FABRIC.JS LOADING SEQUENCE TIMELINE TRACKER - Visual Loading Flow Analysis
 *
 * MISSION: Create detailed visual timeline of fabric.js loading sequence
 * This system tracks every step of the loading process with visual representation
 */

(function() {
    'use strict';

    // 📈 Global timeline tracker state
    window.FabricLoadingTimelineTracker = {
        startTime: performance.now(),
        timeline: [],
        phases: {
            initialization: { start: null, end: null, events: [] },
            vendor_loading: { start: null, end: null, events: [] },
            webpack_extraction: { start: null, end: null, events: [] },
            fabric_exposure: { start: null, end: null, events: [] },
            dependency_loading: { start: null, end: null, events: [] },
            completion: { start: null, end: null, events: [] }
        },
        milestones: [],
        visualization: {
            events: [],
            phases: [],
            ganttChart: []
        }
    };

    console.log('📈 FABRIC LOADING TIMELINE TRACKER: Starting visual timeline analysis');

    /**
     * Add event to timeline with phase categorization
     */
    function addTimelineEvent(eventName, eventType, details = {}, phase = null) {
        const timestamp = performance.now();
        const elapsed = timestamp - window.FabricLoadingTimelineTracker.startTime;

        const event = {
            id: generateEventId(),
            timestamp: timestamp,
            elapsed: elapsed,
            name: eventName,
            type: eventType, // 'start', 'progress', 'complete', 'error', 'milestone'
            phase: phase,
            details: details,
            fabricState: getCurrentFabricState(),
            stackTrace: eventType === 'error' ? new Error().stack : null
        };

        // Add to main timeline
        window.FabricLoadingTimelineTracker.timeline.push(event);

        // Add to phase-specific timeline
        if (phase && window.FabricLoadingTimelineTracker.phases[phase]) {
            window.FabricLoadingTimelineTracker.phases[phase].events.push(event);

            // Update phase timing
            if (!window.FabricLoadingTimelineTracker.phases[phase].start) {
                window.FabricLoadingTimelineTracker.phases[phase].start = timestamp;
            }
            window.FabricLoadingTimelineTracker.phases[phase].end = timestamp;
        }

        // Add milestone if significant
        if (eventType === 'milestone' || eventType === 'complete') {
            window.FabricLoadingTimelineTracker.milestones.push(event);
        }

        // Visual logging
        const phaseTag = phase ? `[${phase.toUpperCase()}]` : '';
        const typeIcon = getTypeIcon(eventType);
        console.log(`📈 ${typeIcon} [${elapsed.toFixed(2)}ms] ${phaseTag} ${eventName}:`, {
            type: eventType,
            details: details,
            fabricState: event.fabricState
        });

        return event;
    }

    /**
     * Get current fabric.js state for timeline context
     */
    function getCurrentFabricState() {
        return {
            exists: typeof window.fabric !== 'undefined',
            hasCanvas: window.fabric && typeof window.fabric.Canvas === 'function',
            hasObject: window.fabric && typeof window.fabric.Object === 'function',
            globallyExposed: window.fabricGloballyExposed || false,
            extractorActive: window.webpackFabricExtractorActive || false,
            emergencyActive: window.emergencyFabricLoaderActive || false,
            debugActive: window.FabricDebugConsole !== undefined,
            bundleInspectorActive: window.WebpackBundleInspector !== undefined
        };
    }

    /**
     * Generate unique event ID
     */
    function generateEventId() {
        return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get icon for event type
     */
    function getTypeIcon(type) {
        const icons = {
            start: '🚀',
            progress: '⏳',
            complete: '✅',
            error: '❌',
            milestone: '🎯',
            warning: '⚠️'
        };
        return icons[type] || '📍';
    }

    /**
     * Track script loading events
     */
    function trackScriptLoading() {
        addTimelineEvent('Script Loading Tracker Initialized', 'start', {}, 'initialization');

        // Monitor script additions
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === 'SCRIPT') {
                        const scriptInfo = {
                            src: node.src || 'inline',
                            async: node.async,
                            defer: node.defer,
                            type: node.type
                        };

                        const phase = determineScriptPhase(node.src);
                        addTimelineEvent(
                            `Script Added: ${scriptInfo.src.split('/').pop()}`,
                            'progress',
                            scriptInfo,
                            phase
                        );

                        // Monitor script load completion
                        if (node.src) {
                            node.addEventListener('load', () => {
                                addTimelineEvent(
                                    `Script Loaded: ${scriptInfo.src.split('/').pop()}`,
                                    'complete',
                                    scriptInfo,
                                    phase
                                );
                            });

                            node.addEventListener('error', () => {
                                addTimelineEvent(
                                    `Script Failed: ${scriptInfo.src.split('/').pop()}`,
                                    'error',
                                    { ...scriptInfo, error: 'load_failed' },
                                    phase
                                );
                            });
                        }
                    }
                });
            });
        });

        observer.observe(document.head, { childList: true, subtree: true });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Determine which phase a script belongs to
     */
    function determineScriptPhase(src) {
        if (!src) return 'initialization';

        if (src.includes('vendor.bundle.js')) return 'vendor_loading';
        if (src.includes('webpack-fabric-extractor') || src.includes('fabric-extractor')) return 'webpack_extraction';
        if (src.includes('fabric-debug') || src.includes('race-condition') || src.includes('bundle-inspector')) return 'initialization';
        if (src.includes('designer') || src.includes('canvas') || src.includes('fabric')) return 'fabric_exposure';
        if (src.includes('data-capture') || src.includes('singleton') || src.includes('controller')) return 'dependency_loading';

        return 'completion';
    }

    /**
     * Track webpack state changes
     */
    function trackWebpackStates() {
        addTimelineEvent('Webpack State Tracking Started', 'start', {}, 'webpack_extraction');

        let lastWebpackState = {
            chunksAvailable: false,
            requireAvailable: false,
            fabricInCache: false
        };

        const checkWebpackState = () => {
            const currentState = {
                chunksAvailable: typeof window.webpackChunkocto_print_designer !== 'undefined',
                requireAvailable: typeof window.__webpack_require__ === 'function',
                fabricInCache: false
            };

            // Check if webpack cache has fabric
            if (currentState.requireAvailable && window.__webpack_require__.cache) {
                const cacheKeys = Object.keys(window.__webpack_require__.cache);
                currentState.fabricInCache = cacheKeys.some(key => key.includes('fabric'));
            }

            // Detect state changes
            Object.keys(currentState).forEach(key => {
                if (currentState[key] !== lastWebpackState[key]) {
                    addTimelineEvent(
                        `Webpack State Change: ${key}`,
                        currentState[key] ? 'progress' : 'warning',
                        {
                            property: key,
                            oldValue: lastWebpackState[key],
                            newValue: currentState[key],
                            webpackState: currentState
                        },
                        'webpack_extraction'
                    );
                }
            });

            lastWebpackState = { ...currentState };

            // Check for webpack readiness milestone
            if (currentState.chunksAvailable && currentState.requireAvailable) {
                addTimelineEvent(
                    'Webpack Environment Ready',
                    'milestone',
                    currentState,
                    'webpack_extraction'
                );
            }
        };

        // Initial check
        checkWebpackState();

        // Periodic checks
        const webpackInterval = setInterval(() => {
            checkWebpackState();

            // Stop checking after 10 seconds or when fabric is loaded
            if ((window.fabric && typeof window.fabric.Canvas === 'function') ||
                (performance.now() - window.FabricLoadingTimelineTracker.startTime > 10000)) {
                clearInterval(webpackInterval);
            }
        }, 100);
    }

    /**
     * Track fabric.js state progression
     */
    function trackFabricProgression() {
        addTimelineEvent('Fabric State Tracking Started', 'start', {}, 'fabric_exposure');

        let lastFabricState = getCurrentFabricState();

        const checkFabricState = () => {
            const currentFabricState = getCurrentFabricState();

            // Detect fabric state changes
            Object.keys(currentFabricState).forEach(key => {
                if (currentFabricState[key] !== lastFabricState[key]) {
                    const eventType = currentFabricState[key] ? 'progress' : 'warning';
                    addTimelineEvent(
                        `Fabric State Change: ${key}`,
                        eventType,
                        {
                            property: key,
                            oldValue: lastFabricState[key],
                            newValue: currentFabricState[key],
                            fullState: currentFabricState
                        },
                        'fabric_exposure'
                    );
                }
            });

            // Check for fabric readiness milestone
            if (currentFabricState.exists && currentFabricState.hasCanvas && currentFabricState.globallyExposed) {
                addTimelineEvent(
                    'Fabric.js Fully Available',
                    'milestone',
                    currentFabricState,
                    'fabric_exposure'
                );
            }

            lastFabricState = { ...currentFabricState };
        };

        // Initial check
        checkFabricState();

        // Periodic checks
        const fabricInterval = setInterval(() => {
            checkFabricState();

            // Stop checking after fabric is loaded or timeout
            if ((window.fabric && typeof window.fabric.Canvas === 'function' && window.fabricGloballyExposed) ||
                (performance.now() - window.FabricLoadingTimelineTracker.startTime > 15000)) {
                clearInterval(fabricInterval);
                addTimelineEvent('Fabric State Tracking Completed', 'complete', {}, 'fabric_exposure');
            }
        }, 200);
    }

    /**
     * Track DOM readiness events
     */
    function trackDOMEvents() {
        addTimelineEvent('DOM Event Tracking Started', 'start', {}, 'initialization');

        // Track DOM ready states
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                addTimelineEvent('DOM Content Loaded', 'milestone', { readyState: document.readyState }, 'initialization');
            });
        } else {
            addTimelineEvent('DOM Already Loaded', 'milestone', { readyState: document.readyState }, 'initialization');
        }

        window.addEventListener('load', () => {
            addTimelineEvent('Window Load Complete', 'milestone', { readyState: document.readyState }, 'completion');
        });

        // Track beforeunload for session summary
        window.addEventListener('beforeunload', () => {
            generateTimelineVisualization();
        });
    }

    /**
     * Generate visual timeline representation
     */
    function generateTimelineVisualization() {
        console.log('📈 GENERATING TIMELINE VISUALIZATION...');

        const visualization = {
            sessionSummary: {
                startTime: window.FabricLoadingTimelineTracker.startTime,
                endTime: performance.now(),
                totalDuration: performance.now() - window.FabricLoadingTimelineTracker.startTime,
                totalEvents: window.FabricLoadingTimelineTracker.timeline.length,
                milestones: window.FabricLoadingTimelineTracker.milestones.length
            },
            phases: generatePhaseSummary(),
            ganttChart: generateGanttChart(),
            criticalPath: identifyCriticalPath(),
            performance: analyzePerformance()
        };

        console.log('📊 TIMELINE VISUALIZATION:', visualization);
        console.log('📈 Full Timeline Events:', window.FabricLoadingTimelineTracker.timeline);
        console.log('🎯 Key Milestones:', window.FabricLoadingTimelineTracker.milestones);

        return visualization;
    }

    /**
     * Generate phase summary
     */
    function generatePhaseSummary() {
        const phases = {};

        Object.keys(window.FabricLoadingTimelineTracker.phases).forEach(phaseName => {
            const phase = window.FabricLoadingTimelineTracker.phases[phaseName];
            phases[phaseName] = {
                duration: phase.start && phase.end ? phase.end - phase.start : null,
                events: phase.events.length,
                started: !!phase.start,
                completed: !!phase.end,
                eventTypes: phase.events.reduce((acc, event) => {
                    acc[event.type] = (acc[event.type] || 0) + 1;
                    return acc;
                }, {})
            };
        });

        return phases;
    }

    /**
     * Generate Gantt chart representation
     */
    function generateGanttChart() {
        const startTime = window.FabricLoadingTimelineTracker.startTime;
        const gantt = [];

        Object.keys(window.FabricLoadingTimelineTracker.phases).forEach(phaseName => {
            const phase = window.FabricLoadingTimelineTracker.phases[phaseName];
            if (phase.start) {
                gantt.push({
                    phase: phaseName,
                    start: phase.start - startTime,
                    end: (phase.end || performance.now()) - startTime,
                    duration: (phase.end || performance.now()) - phase.start,
                    events: phase.events.length
                });
            }
        });

        return gantt.sort((a, b) => a.start - b.start);
    }

    /**
     * Identify critical path in loading sequence
     */
    function identifyCriticalPath() {
        const criticalEvents = window.FabricLoadingTimelineTracker.timeline.filter(event =>
            event.type === 'milestone' ||
            event.type === 'error' ||
            (event.name.includes('fabric') && event.type === 'complete')
        );

        return criticalEvents.map(event => ({
            elapsed: event.elapsed,
            name: event.name,
            type: event.type,
            phase: event.phase
        }));
    }

    /**
     * Analyze performance metrics
     */
    function analyzePerformance() {
        const timeline = window.FabricLoadingTimelineTracker.timeline;
        const phases = window.FabricLoadingTimelineTracker.phases;

        return {
            totalEvents: timeline.length,
            eventsPerSecond: timeline.length / ((performance.now() - window.FabricLoadingTimelineTracker.startTime) / 1000),
            slowestPhase: Object.keys(phases).reduce((slowest, phaseName) => {
                const phase = phases[phaseName];
                const duration = phase.start && phase.end ? phase.end - phase.start : 0;
                return duration > (slowest.duration || 0) ? { name: phaseName, duration } : slowest;
            }, {}),
            errorCount: timeline.filter(e => e.type === 'error').length,
            milestoneCount: timeline.filter(e => e.type === 'milestone').length,
            fabricReadyTime: timeline.find(e => e.name === 'Fabric.js Fully Available')?.elapsed || null
        };
    }

    /**
     * Track emergency scenarios
     */
    function trackEmergencyScenarios() {
        // Monitor for emergency loader activation
        const emergencyCheck = setInterval(() => {
            if (window.emergencyFabricLoaderActive && !window.emergencyTracked) {
                addTimelineEvent(
                    'Emergency Fabric Loader Activated',
                    'warning',
                    {
                        reason: 'webpack_extraction_failed',
                        emergencyActive: true
                    },
                    'fabric_exposure'
                );
                window.emergencyTracked = true;
            }

            if (window.emergencyFabricLoaded) {
                addTimelineEvent(
                    'Emergency Fabric CDN Load Complete',
                    'milestone',
                    { source: 'cdn_fallback' },
                    'fabric_exposure'
                );
                clearInterval(emergencyCheck);
            }
        }, 100);

        // Clear check after timeout
        setTimeout(() => {
            clearInterval(emergencyCheck);
        }, 10000);
    }

    // 📈 Initialize timeline tracking
    addTimelineEvent('Timeline Tracker Initialized', 'start', {}, 'initialization');

    // Start all tracking systems
    trackScriptLoading();
    trackWebpackStates();
    trackFabricProgression();
    trackDOMEvents();
    trackEmergencyScenarios();

    // Generate final visualization after 12 seconds or when fabric loads
    setTimeout(() => {
        generateTimelineVisualization();
    }, 12000);

    // Also generate visualization when fabric becomes available
    const fabricReadyCheck = setInterval(() => {
        if (window.fabric && typeof window.fabric.Canvas === 'function' && window.fabricGloballyExposed) {
            addTimelineEvent('Fabric Loading Sequence Complete', 'complete', {}, 'completion');
            generateTimelineVisualization();
            clearInterval(fabricReadyCheck);
        }
    }, 500);

    // 📈 Global access for manual timeline analysis
    window.FabricLoadingTimelineTracker.addEvent = addTimelineEvent;
    window.FabricLoadingTimelineTracker.generateVisualization = generateTimelineVisualization;
    window.FabricLoadingTimelineTracker.getCurrentState = getCurrentFabricState;

    console.log('📈 FABRIC LOADING TIMELINE TRACKER: Visual timeline analysis active');
    console.log('🔧 Manual functions: window.FabricLoadingTimelineTracker.*');

})();
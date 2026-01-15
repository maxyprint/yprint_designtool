/**
 * 🚨 UNIFIED ERROR HANDLER
 *
 * Zentrale Fehlerbehandlung für die gesamte PNG-Architektur
 * Konsistentes Error Logging, Recovery und User Feedback
 */

class UnifiedErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogEntries = 100;
        this.errorListeners = new Map();
        this.isDebugMode = true;

        console.log('🚨 UNIFIED ERROR HANDLER: Initializing...');

        // Bind methods
        this.handleError = this.handleError.bind(this);
        this.addErrorListener = this.addErrorListener.bind(this);
        this.getErrorSummary = this.getErrorSummary.bind(this);

        // Set up global error handling
        this._setupGlobalErrorHandling();
    }

    /**
     * 🎯 Main Error Handling Method
     */
    handleError(error, context = {}) {
        const errorEntry = this._createErrorEntry(error, context);

        // Log to console
        this._logToConsole(errorEntry);

        // Store in error log
        this._storeError(errorEntry);

        // Notify listeners
        this._notifyListeners(errorEntry);

        // Attempt recovery if strategy is available
        this._attemptRecovery(errorEntry);

        // Show user notification if needed
        this._showUserNotification(errorEntry);

        return errorEntry;
    }

    /**
     * 📝 Create Standardized Error Entry
     */
    _createErrorEntry(error, context) {
        const timestamp = Date.now();
        const errorEntry = {
            id: `error_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp,
            datetime: new Date(timestamp).toISOString(),
            message: error.message || String(error),
            stack: error.stack,
            name: error.name || 'UnknownError',
            context: {
                component: context.component || 'unknown',
                operation: context.operation || 'unknown',
                templateId: context.templateId,
                viewId: context.viewId,
                userId: context.userId,
                url: window.location.href,
                userAgent: navigator.userAgent,
                ...context
            },
            severity: this._determineSeverity(error, context),
            category: this._categorizeError(error, context),
            recoveryAttempted: false,
            recovered: false
        };

        return errorEntry;
    }

    /**
     * 🚨 Determine Error Severity
     */
    _determineSeverity(error, context) {
        // Critical: System failures, template ID issues
        if (error.message.includes('CRITICAL') ||
            error.message.includes('template ID') ||
            context.component === 'systemBootstrapper' ||
            context.operation === 'initialization') {
            return 'critical';
        }

        // High: PNG generation failures, view switching issues
        if (error.message.includes('PNG') ||
            error.message.includes('generation') ||
            error.message.includes('view switch') ||
            context.component === 'consolidatedPNGPipeline') {
            return 'high';
        }

        // Medium: Canvas issues, data access problems
        if (error.message.includes('canvas') ||
            error.message.includes('fabric') ||
            context.component === 'unifiedTemplateDataAccess') {
            return 'medium';
        }

        // Low: UI updates, non-critical operations
        return 'low';
    }

    /**
     * 📂 Categorize Error
     */
    _categorizeError(error, context) {
        if (error.name === 'TypeError') return 'type_error';
        if (error.name === 'ReferenceError') return 'reference_error';
        if (error.message.includes('network') || error.message.includes('fetch')) return 'network_error';
        if (error.message.includes('timeout')) return 'timeout_error';
        if (context.component === 'consolidatedPNGPipeline') return 'png_error';
        if (context.component === 'centralizedViewState') return 'view_error';
        if (context.component === 'unifiedTemplateDataAccess') return 'data_error';
        if (context.component === 'systemBootstrapper') return 'system_error';

        return 'general_error';
    }

    /**
     * 📺 Log to Console with Formatting
     */
    _logToConsole(errorEntry) {
        const { severity, component, operation, message, id } = errorEntry.context;
        const prefix = this._getConsolePrefix(errorEntry.severity);

        if (this.isDebugMode) {
            console.group(`${prefix} ERROR: ${errorEntry.context.component || 'Unknown'}`);
            console.error('Message:', errorEntry.message);
            console.error('Operation:', errorEntry.context.operation);
            console.error('Severity:', errorEntry.severity);
            console.error('Category:', errorEntry.category);
            console.error('Context:', errorEntry.context);
            if (errorEntry.stack) console.error('Stack:', errorEntry.stack);
            console.error('Error ID:', errorEntry.id);
            console.groupEnd();
        } else {
            console.error(`${prefix} ${errorEntry.context.component}: ${errorEntry.message} [${errorEntry.id}]`);
        }
    }

    /**
     * 🎨 Get Console Prefix for Severity
     */
    _getConsolePrefix(severity) {
        switch (severity) {
            case 'critical': return '🔥';
            case 'high': return '❌';
            case 'medium': return '⚠️';
            case 'low': return '⚡';
            default: return '🚨';
        }
    }

    /**
     * 💾 Store Error in Log
     */
    _storeError(errorEntry) {
        this.errorLog.unshift(errorEntry);

        // Keep only recent errors
        if (this.errorLog.length > this.maxLogEntries) {
            this.errorLog = this.errorLog.slice(0, this.maxLogEntries);
        }
    }

    /**
     * 📢 Notify Error Listeners
     */
    _notifyListeners(errorEntry) {
        const listeners = this.errorListeners.get(errorEntry.category) || [];
        const globalListeners = this.errorListeners.get('*') || [];

        [...listeners, ...globalListeners].forEach(listener => {
            try {
                listener(errorEntry);
            } catch (listenerError) {
                console.error('🚨 ERROR HANDLER: Listener failed:', listenerError);
            }
        });
    }

    /**
     * 🔧 Attempt Error Recovery
     */
    _attemptRecovery(errorEntry) {
        const recoveryStrategy = this._getRecoveryStrategy(errorEntry);
        if (!recoveryStrategy) return;

        try {
            console.log(`🔧 UNIFIED ERROR: Attempting recovery for ${errorEntry.category}...`);
            errorEntry.recoveryAttempted = true;

            const result = recoveryStrategy(errorEntry);

            if (result === true || (result && result.success)) {
                errorEntry.recovered = true;
                console.log(`✅ UNIFIED ERROR: Recovery successful for ${errorEntry.id}`);
            } else {
                console.warn(`⚠️ UNIFIED ERROR: Recovery failed for ${errorEntry.id}`);
            }

        } catch (recoveryError) {
            console.error(`❌ UNIFIED ERROR: Recovery threw error for ${errorEntry.id}:`, recoveryError);
        }
    }

    /**
     * 🛠️ Get Recovery Strategy
     */
    _getRecoveryStrategy(errorEntry) {
        const strategies = {
            'system_error': () => this._recoverSystemError(errorEntry),
            'png_error': () => this._recoverPNGError(errorEntry),
            'view_error': () => this._recoverViewError(errorEntry),
            'data_error': () => this._recoverDataError(errorEntry),
            'timeout_error': () => this._recoverTimeoutError(errorEntry),
            'network_error': () => this._recoverNetworkError(errorEntry)
        };

        return strategies[errorEntry.category];
    }

    /**
     * 🔧 Recovery Strategies
     */
    _recoverSystemError(errorEntry) {
        if (window.systemBootstrapper) {
            console.log('🔧 RECOVERY: Attempting system reinitialization...');
            return window.systemBootstrapper.emergencyReset();
        }
        return false;
    }

    _recoverPNGError(errorEntry) {
        if (window.consolidatedPNGPipeline) {
            console.log('🔧 RECOVERY: Attempting PNG pipeline reinitialization...');
            return window.consolidatedPNGPipeline.init();
        }
        return false;
    }

    _recoverViewError(errorEntry) {
        if (window.centralizedViewState) {
            console.log('🔧 RECOVERY: Clearing view state queue...');
            window.centralizedViewState.clearQueue();
            return true;
        }
        return false;
    }

    _recoverDataError(errorEntry) {
        if (window.unifiedTemplateDataAccess) {
            console.log('🔧 RECOVERY: Clearing template data cache...');
            window.unifiedTemplateDataAccess.clearCache();
            return true;
        }
        return false;
    }

    _recoverTimeoutError(errorEntry) {
        console.log('🔧 RECOVERY: Timeout error - will retry operation');
        return true; // Just mark as recovered, let operation retry
    }

    _recoverNetworkError(errorEntry) {
        console.log('🔧 RECOVERY: Network error - checking connection...');
        return navigator.onLine; // Return true if online
    }

    /**
     * 💬 Show User Notification
     */
    _showUserNotification(errorEntry) {
        // Only show notifications for high and critical errors
        if (errorEntry.severity !== 'high' && errorEntry.severity !== 'critical') {
            return;
        }

        const userMessage = this._getUserFriendlyMessage(errorEntry);

        // Try WordPress admin notices first
        if (this._showWordPressNotice) {
            this._showWordPressNotice(userMessage, errorEntry.severity);
            return;
        }

        // Fallback to console user message
        const style = errorEntry.severity === 'critical' ?
            'color: red; font-weight: bold; font-size: 14px;' :
            'color: orange; font-weight: bold; font-size: 12px;';

        console.log(`%c🚨 USER NOTICE: ${userMessage}`, style);
    }

    /**
     * 💭 Get User-Friendly Error Message
     */
    _getUserFriendlyMessage(errorEntry) {
        const messageMap = {
            'system_error': 'Systeminitialisierung fehlgeschlagen. Bitte Seite neu laden.',
            'png_error': 'PNG-Generierung fehlgeschlagen. Bitte erneut versuchen.',
            'view_error': 'Ansichtswechsel nicht möglich. Bitte Design neu laden.',
            'data_error': 'Template-Daten konnten nicht geladen werden.',
            'timeout_error': 'Operation zeitüberschreitung. Bitte erneut versuchen.',
            'network_error': 'Netzwerkfehler. Prüfen Sie Ihre Internetverbindung.'
        };

        return messageMap[errorEntry.category] || 'Ein unerwarteter Fehler ist aufgetreten.';
    }

    /**
     * 👂 Add Error Listener
     */
    addErrorListener(category, callback) {
        if (!this.errorListeners.has(category)) {
            this.errorListeners.set(category, []);
        }

        this.errorListeners.get(category).push(callback);

        // Return unsubscribe function
        return () => {
            const listeners = this.errorListeners.get(category);
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        };
    }

    /**
     * 📊 Get Error Summary
     */
    getErrorSummary() {
        const summary = {
            total: this.errorLog.length,
            bySeverity: {},
            byCategory: {},
            recent: this.errorLog.slice(0, 10),
            lastError: this.errorLog[0] || null
        };

        // Count by severity
        this.errorLog.forEach(error => {
            summary.bySeverity[error.severity] = (summary.bySeverity[error.severity] || 0) + 1;
            summary.byCategory[error.category] = (summary.byCategory[error.category] || 0) + 1;
        });

        return summary;
    }

    /**
     * 🔍 Search Errors
     */
    searchErrors(criteria = {}) {
        return this.errorLog.filter(error => {
            if (criteria.severity && error.severity !== criteria.severity) return false;
            if (criteria.category && error.category !== criteria.category) return false;
            if (criteria.component && error.context.component !== criteria.component) return false;
            if (criteria.since && error.timestamp < criteria.since) return false;
            if (criteria.message && !error.message.toLowerCase().includes(criteria.message.toLowerCase())) return false;

            return true;
        });
    }

    /**
     * 🧹 Clear Error Log
     */
    clearErrorLog() {
        console.log('🧹 UNIFIED ERROR: Clearing error log');
        this.errorLog = [];
    }

    /**
     * 🔧 Setup Global Error Handling
     */
    _setupGlobalErrorHandling() {
        // Catch uncaught errors
        window.addEventListener('error', (event) => {
            this.handleError(event.error || new Error(event.message), {
                component: 'global',
                operation: 'uncaught_error',
                filename: event.filename,
                line: event.lineno,
                column: event.colno
            });
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason || new Error('Unhandled Promise Rejection'), {
                component: 'global',
                operation: 'unhandled_promise',
                promise: event.promise
            });
        });

        console.log('✅ UNIFIED ERROR: Global error handling enabled');
    }

    /**
     * 🐛 Get Debug Information
     */
    getDebugInfo() {
        return {
            errorCount: this.errorLog.length,
            listenerCount: Array.from(this.errorListeners.values()).reduce((sum, listeners) => sum + listeners.length, 0),
            summary: this.getErrorSummary(),
            isDebugMode: this.isDebugMode,
            maxLogEntries: this.maxLogEntries
        };
    }
}

// Global instance
window.unifiedErrorHandler = new UnifiedErrorHandler();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedErrorHandler;
}

console.log('✅ UNIFIED ERROR HANDLER: Loaded and ready');

// Helper function for easy error reporting
window.reportError = function(error, context = {}) {
    return window.unifiedErrorHandler.handleError(error, context);
};
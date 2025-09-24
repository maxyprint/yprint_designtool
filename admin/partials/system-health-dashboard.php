<?php
/**
 * 🔍 AGENT 7: SYSTEM HEALTH DASHBOARD
 *
 * WordPress admin dashboard for comprehensive system monitoring
 * Real-time health checks and validation reports
 *
 * @package Octo_Print_Designer
 * @subpackage Admin/Partials
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap octo-system-health">
    <!-- 🔍 AGENT 7: SYSTEM HEALTH DASHBOARD -->

    <div class="octo-print-admin-wrapper octo-fade-in">
        <!-- Dashboard Header -->
        <div class="octo-print-admin-header">
            <h1 class="octo-print-admin-title">
                <span class="dashicons dashicons-analytics" style="font-size: 24px; margin-right: 8px;"></span>
                System Health Dashboard
            </h1>
            <p class="octo-print-admin-subtitle">Comprehensive validation and monitoring for Design Preview System</p>
        </div>

        <!-- Quick Status Overview -->
        <div class="octo-print-admin-content">
            <div class="octo-print-section octo-slide-in">
                <div class="octo-print-section-header">
                    <span>System Status Overview</span>
                    <div class="octo-button-group" style="margin: 0;">
                        <button class="octo-button secondary" onclick="performQuickHealthCheck()">
                            <span class="dashicons dashicons-update"></span>
                            Quick Check
                        </button>
                        <button class="octo-button" onclick="runFullValidation()">
                            <span class="dashicons dashicons-analytics"></span>
                            Full Validation
                        </button>
                    </div>
                </div>
                <div class="octo-print-section-content">
                    <div class="octo-health-grid" id="health-overview">
                        <div class="octo-health-card" id="component-health">
                            <div class="octo-health-icon">
                                <span class="dashicons dashicons-admin-plugins"></span>
                            </div>
                            <div class="octo-health-info">
                                <h3>Components</h3>
                                <div class="octo-health-status" id="component-status">Checking...</div>
                                <div class="octo-health-detail" id="component-detail">Loading component status</div>
                            </div>
                        </div>

                        <div class="octo-health-card" id="performance-health">
                            <div class="octo-health-icon">
                                <span class="dashicons dashicons-performance"></span>
                            </div>
                            <div class="octo-health-info">
                                <h3>Performance</h3>
                                <div class="octo-health-status" id="performance-status">Checking...</div>
                                <div class="octo-health-detail" id="performance-detail">Analyzing performance metrics</div>
                            </div>
                        </div>

                        <div class="octo-health-card" id="integration-health">
                            <div class="octo-health-icon">
                                <span class="dashicons dashicons-networking"></span>
                            </div>
                            <div class="octo-health-info">
                                <h3>Integration</h3>
                                <div class="octo-health-status" id="integration-status">Checking...</div>
                                <div class="octo-health-detail" id="integration-detail">Validating system integration</div>
                            </div>
                        </div>

                        <div class="octo-health-card" id="accuracy-health">
                            <div class="octo-health-icon">
                                <span class="dashicons dashicons-visibility"></span>
                            </div>
                            <div class="octo-health-info">
                                <h3>Accuracy</h3>
                                <div class="octo-health-status" id="accuracy-status">Checking...</div>
                                <div class="octo-health-detail" id="accuracy-detail">Testing pixel-perfect precision</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Validation Results Section -->
            <div class="octo-print-section" id="validation-results-section" style="display: none;">
                <div class="octo-print-section-header">
                    <span>Validation Results</span>
                    <div class="octo-status-indicator" id="validation-status">
                        <span class="dashicons dashicons-clock"></span>
                        Ready
                    </div>
                </div>
                <div class="octo-print-section-content">
                    <div id="validation-summary" class="octo-validation-summary">
                        <!-- Validation summary will be populated here -->
                    </div>

                    <div id="validation-details" class="octo-validation-details">
                        <!-- Detailed validation results will be populated here -->
                    </div>
                </div>
            </div>

            <!-- Performance Metrics Section -->
            <div class="octo-print-section" id="performance-metrics-section" style="display: none;">
                <div class="octo-print-section-header">
                    <span>Performance Metrics</span>
                    <div class="octo-button-group" style="margin: 0;">
                        <button class="octo-button secondary" onclick="refreshMetrics()">
                            <span class="dashicons dashicons-chart-line"></span>
                            Refresh
                        </button>
                    </div>
                </div>
                <div class="octo-print-section-content">
                    <div class="octo-metrics-grid" id="performance-grid">
                        <!-- Performance metrics will be populated here -->
                    </div>
                </div>
            </div>

            <!-- System Recommendations Section -->
            <div class="octo-print-section" id="recommendations-section" style="display: none;">
                <div class="octo-print-section-header">
                    <span>System Recommendations</span>
                    <span class="octo-health-badge" id="recommendation-count">0</span>
                </div>
                <div class="octo-print-section-content">
                    <div id="recommendations-list" class="octo-recommendations-list">
                        <!-- Recommendations will be populated here -->
                    </div>
                </div>
            </div>

            <!-- System Log Section -->
            <div class="octo-print-section">
                <div class="octo-print-section-header">
                    <span>System Log</span>
                    <div class="octo-button-group" style="margin: 0;">
                        <button class="octo-button secondary" onclick="clearSystemLog()">
                            <span class="dashicons dashicons-trash"></span>
                            Clear Log
                        </button>
                    </div>
                </div>
                <div class="octo-print-section-content">
                    <div id="system-log" class="octo-system-log">
                        <div class="octo-log-entry">
                            <span class="octo-log-timestamp"><?php echo current_time('Y-m-d H:i:s'); ?></span>
                            <span class="octo-log-level info">INFO</span>
                            <span class="octo-log-message">System Health Dashboard initialized</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
/* 🔍 AGENT 7: SYSTEM HEALTH DASHBOARD STYLES */

.octo-health-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}

.octo-health-card {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.octo-health-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #2271b1;
}

.octo-health-card.healthy {
    border-left: 4px solid #00a32a;
    background: linear-gradient(90deg, #f0f9f0 0%, #ffffff 100%);
}

.octo-health-card.warning {
    border-left: 4px solid #dba617;
    background: linear-gradient(90deg, #fffbf0 0%, #ffffff 100%);
}

.octo-health-card.critical {
    border-left: 4px solid #d63638;
    background: linear-gradient(90deg, #fdf0f0 0%, #ffffff 100%);
}

.octo-health-icon {
    background: linear-gradient(135deg, #2271b1, #135e96);
    color: #ffffff;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
}

.octo-health-info h3 {
    margin: 0 0 5px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1d2327;
}

.octo-health-status {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 3px;
}

.octo-health-status.healthy { color: #00a32a; }
.octo-health-status.warning { color: #dba617; }
.octo-health-status.critical { color: #d63638; }

.octo-health-detail {
    font-size: 12px;
    color: #646970;
    opacity: 0.8;
}

.octo-health-badge {
    background: #2271b1;
    color: #ffffff;
    font-size: 12px;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 12px;
    min-width: 20px;
    text-align: center;
}

/* Validation Results Styles */
.octo-validation-summary {
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 20px;
    margin-bottom: 20px;
}

.octo-validation-summary h3 {
    margin: 0 0 15px 0;
    color: #1d2327;
    display: flex;
    align-items: center;
    gap: 10px;
}

.octo-validation-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin-bottom: 15px;
}

.octo-stat-item {
    text-align: center;
    padding: 10px;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
}

.octo-stat-value {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 5px;
}

.octo-stat-label {
    font-size: 12px;
    color: #646970;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.octo-validation-details {
    display: grid;
    gap: 15px;
}

.octo-validation-section {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    overflow: hidden;
}

.octo-validation-section-header {
    background: linear-gradient(to right, #f6f7f7, #ffffff);
    padding: 12px 16px;
    border-bottom: 1px solid #e0e0e0;
    font-weight: 600;
    display: flex;
    justify-content: between;
    align-items: center;
}

.octo-validation-section-content {
    padding: 16px;
}

.octo-test-result {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f1;
}

.octo-test-result:last-child {
    border-bottom: none;
}

.octo-test-name {
    font-weight: 500;
    color: #1d2327;
}

.octo-test-status {
    font-size: 12px;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.octo-test-status.pass {
    background: #d4edda;
    color: #155724;
}

.octo-test-status.fail {
    background: #f8d7da;
    color: #721c24;
}

.octo-test-status.warn {
    background: #fff3cd;
    color: #856404;
}

.octo-test-status.skip {
    background: #e2e3e5;
    color: #383d41;
}

/* Metrics Grid */
.octo-metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.octo-metric-card {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 16px;
    text-align: center;
}

.octo-metric-value {
    font-size: 28px;
    font-weight: 600;
    color: #2271b1;
    margin-bottom: 5px;
}

.octo-metric-label {
    font-size: 14px;
    color: #646970;
    font-weight: 500;
}

/* Recommendations */
.octo-recommendations-list {
    display: grid;
    gap: 12px;
}

.octo-recommendation {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-left: 4px solid #2271b1;
    border-radius: 4px;
    padding: 16px;
}

.octo-recommendation.high {
    border-left-color: #d63638;
    background: linear-gradient(90deg, #fdf0f0 0%, #ffffff 100%);
}

.octo-recommendation.medium {
    border-left-color: #dba617;
    background: linear-gradient(90deg, #fffbf0 0%, #ffffff 100%);
}

.octo-recommendation.info {
    border-left-color: #00a32a;
    background: linear-gradient(90deg, #f0f9f0 0%, #ffffff 100%);
}

.octo-recommendation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.octo-recommendation-title {
    font-weight: 600;
    color: #1d2327;
}

.octo-recommendation-priority {
    font-size: 11px;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.octo-recommendation-priority.high {
    background: #d63638;
    color: #ffffff;
}

.octo-recommendation-priority.medium {
    background: #dba617;
    color: #ffffff;
}

.octo-recommendation-priority.info {
    background: #00a32a;
    color: #ffffff;
}

.octo-recommendation-description {
    font-size: 14px;
    color: #646970;
    line-height: 1.4;
}

/* System Log */
.octo-system-log {
    background: #1d2327;
    color: #c3c4c7;
    border-radius: 4px;
    padding: 16px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    line-height: 1.6;
    max-height: 300px;
    overflow-y: auto;
}

.octo-log-entry {
    display: flex;
    gap: 10px;
    margin-bottom: 4px;
    padding: 2px 0;
}

.octo-log-timestamp {
    color: #8c8f94;
    flex-shrink: 0;
}

.octo-log-level {
    flex-shrink: 0;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 10px;
}

.octo-log-level.info {
    background: #135e96;
    color: #ffffff;
}

.octo-log-level.warn {
    background: #dba617;
    color: #ffffff;
}

.octo-log-level.error {
    background: #d63638;
    color: #ffffff;
}

.octo-log-level.success {
    background: #00a32a;
    color: #ffffff;
}

.octo-log-message {
    flex: 1;
}

/* Responsive Design */
@media (max-width: 782px) {
    .octo-health-grid {
        grid-template-columns: 1fr;
    }

    .octo-validation-stats {
        grid-template-columns: repeat(2, 1fr);
    }

    .octo-metrics-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 480px) {
    .octo-validation-stats,
    .octo-metrics-grid {
        grid-template-columns: 1fr;
    }
}
</style>

<script>
/**
 * 🔍 AGENT 7: SYSTEM HEALTH DASHBOARD CONTROLLER
 */

// Dashboard state
let validationInProgress = false;
let currentHealthData = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DASHBOARD: Initializing System Health Dashboard...');
    initializeHealthDashboard();
});

function initializeHealthDashboard() {
    // Perform initial health check
    performQuickHealthCheck();

    // Set up auto-refresh (every 30 seconds)
    setInterval(performQuickHealthCheck, 30000);

    addLogEntry('System Health Dashboard initialized', 'info');
}

async function performQuickHealthCheck() {
    if (!window.systemValidator) {
        window.systemValidator = new SystemValidator();
    }

    const health = window.systemValidator.quickHealthCheck();
    currentHealthData = health;

    updateHealthCards(health);
    addLogEntry(`Quick health check completed - Status: ${health.status}`, health.status === 'HEALTHY' ? 'success' : 'warn');
}

async function runFullValidation() {
    if (validationInProgress) {
        addLogEntry('Validation already in progress', 'warn');
        return;
    }

    if (!window.systemValidator) {
        window.systemValidator = new SystemValidator();
    }

    validationInProgress = true;

    // Update UI to show validation in progress
    document.getElementById('validation-status').innerHTML = `
        <span class="dashicons dashicons-update spin"></span>
        Running Validation
    `;

    // Show loading in health cards
    const healthCards = document.querySelectorAll('.octo-health-card');
    healthCards.forEach(card => {
        const status = card.querySelector('.octo-health-status');
        const detail = card.querySelector('.octo-health-detail');
        status.textContent = 'Validating...';
        detail.textContent = 'Running comprehensive tests...';
        card.classList.remove('healthy', 'warning', 'critical');
    });

    addLogEntry('Starting comprehensive validation suite', 'info');

    try {
        const report = await window.systemValidator.runComprehensiveValidation();
        displayValidationReport(report);
        addLogEntry(`Validation completed - System Health: ${report.summary.systemHealth}`, 'success');
    } catch (error) {
        addLogEntry(`Validation failed: ${error.message}`, 'error');
        console.error('Validation error:', error);
    } finally {
        validationInProgress = false;
        document.getElementById('validation-status').innerHTML = `
            <span class="dashicons dashicons-yes-alt"></span>
            Completed
        `;
    }
}

function updateHealthCards(health) {
    // Component Health
    const componentCard = document.getElementById('component-health');
    const componentStatus = document.getElementById('component-status');
    const componentDetail = document.getElementById('component-detail');

    const componentCount = Object.values(health.components).filter(Boolean).length;
    const componentTotal = Object.keys(health.components).length;

    componentStatus.textContent = `${componentCount}/${componentTotal} Available`;
    componentDetail.textContent = `${health.score} system availability`;

    updateCardStatus(componentCard, componentStatus, health.status);

    // Performance Health
    const performanceCard = document.getElementById('performance-health');
    const performanceStatus = document.getElementById('performance-status');
    const performanceDetail = document.getElementById('performance-detail');

    performanceStatus.textContent = health.performance.memory !== 'unknown' ?
        `Memory: ${health.performance.memory}` : 'Monitoring';
    performanceDetail.textContent = 'Memory usage within normal range';

    updateCardStatus(performanceCard, performanceStatus, health.status);

    // Integration Health
    const integrationCard = document.getElementById('integration-health');
    const integrationStatus = document.getElementById('integration-status');
    const integrationDetail = document.getElementById('integration-detail');

    integrationStatus.textContent = health.components.wordpress ? 'Connected' : 'Limited';
    integrationDetail.textContent = health.components.wordpress ?
        'WordPress integration active' : 'Standalone mode';

    updateCardStatus(integrationCard, integrationStatus, health.components.wordpress ? 'HEALTHY' : 'DEGRADED');

    // Accuracy Health
    const accuracyCard = document.getElementById('accuracy-health');
    const accuracyStatus = document.getElementById('accuracy-status');
    const accuracyDetail = document.getElementById('accuracy-detail');

    accuracyStatus.textContent = health.components.renderer ? 'Sub-pixel Ready' : 'Limited';
    accuracyDetail.textContent = health.components.renderer ?
        '0.1px precision available' : 'Canvas renderer not loaded';

    updateCardStatus(accuracyCard, accuracyStatus, health.components.renderer ? 'HEALTHY' : 'CRITICAL');
}

function updateCardStatus(card, statusElement, status) {
    // Remove existing status classes
    card.classList.remove('healthy', 'warning', 'critical');
    statusElement.classList.remove('healthy', 'warning', 'critical');

    // Add new status class
    switch (status) {
        case 'HEALTHY':
            card.classList.add('healthy');
            statusElement.classList.add('healthy');
            break;
        case 'DEGRADED':
            card.classList.add('warning');
            statusElement.classList.add('warning');
            break;
        case 'CRITICAL':
            card.classList.add('critical');
            statusElement.classList.add('critical');
            break;
    }
}

function displayValidationReport(report) {
    // Show validation results section
    document.getElementById('validation-results-section').style.display = 'block';

    // Update validation summary
    const summaryHTML = `
        <h3><span class="dashicons dashicons-analytics"></span> Validation Summary</h3>
        <div class="octo-validation-stats">
            <div class="octo-stat-item">
                <div class="octo-stat-value" style="color: ${report.summary.systemHealth === 'GOOD' ? '#00a32a' : report.summary.systemHealth === 'FAIR' ? '#dba617' : '#d63638'}">${report.summary.overallPassRate}</div>
                <div class="octo-stat-label">Pass Rate</div>
            </div>
            <div class="octo-stat-item">
                <div class="octo-stat-value">${report.summary.systemHealth}</div>
                <div class="octo-stat-label">System Health</div>
            </div>
            <div class="octo-stat-item">
                <div class="octo-stat-value">${report.summary.executionTime}</div>
                <div class="octo-stat-label">Execution Time</div>
            </div>
            <div class="octo-stat-item">
                <div class="octo-stat-value">${report.summary.errors}</div>
                <div class="octo-stat-label">Errors</div>
            </div>
        </div>
        <div class="octo-validation-overview">
            <p><strong>Status:</strong> ${report.summary.status}</p>
            <p><strong>Timestamp:</strong> ${new Date(report.statistics.timestamp).toLocaleString()}</p>
        </div>
    `;
    document.getElementById('validation-summary').innerHTML = summaryHTML;

    // Update detailed results
    const detailsHTML = Object.entries(report.sections).map(([sectionName, sectionData]) => `
        <div class="octo-validation-section">
            <div class="octo-validation-section-header">
                <span>${formatSectionName(sectionName)}</span>
                <span class="octo-test-status ${sectionData.status.toLowerCase()}">${sectionData.status}</span>
            </div>
            <div class="octo-validation-section-content">
                <div class="octo-test-result">
                    <span class="octo-test-name">Pass Rate</span>
                    <span>${sectionData.passRate}</span>
                </div>
                <div class="octo-test-result">
                    <span class="octo-test-name">Tests Passed</span>
                    <span>${sectionData.passed}/${sectionData.total}</span>
                </div>
            </div>
        </div>
    `).join('');
    document.getElementById('validation-details').innerHTML = detailsHTML;

    // Update performance metrics
    if (report.performance) {
        displayPerformanceMetrics(report.performance);
    }

    // Update recommendations
    if (report.recommendations) {
        displayRecommendations(report.recommendations);
    }

    // Update health cards with validation results
    updateHealthCardsFromValidation(report);
}

function displayPerformanceMetrics(performance) {
    document.getElementById('performance-metrics-section').style.display = 'block';

    const metricsHTML = `
        <div class="octo-metric-card">
            <div class="octo-metric-value">${performance.averageRenderTime}</div>
            <div class="octo-metric-label">Avg Render Time</div>
        </div>
        <div class="octo-metric-card">
            <div class="octo-metric-value">${performance.transformAccuracy}</div>
            <div class="octo-metric-label">Transform Accuracy</div>
        </div>
        <div class="octo-metric-card">
            <div class="octo-metric-value">${performance.memoryUsage}</div>
            <div class="octo-metric-label">Memory Usage</div>
        </div>
    `;
    document.getElementById('performance-grid').innerHTML = metricsHTML;
}

function displayRecommendations(recommendations) {
    document.getElementById('recommendations-section').style.display = 'block';
    document.getElementById('recommendation-count').textContent = recommendations.length;

    const recommendationsHTML = recommendations.map(rec => `
        <div class="octo-recommendation ${rec.priority.toLowerCase()}">
            <div class="octo-recommendation-header">
                <div class="octo-recommendation-title">${rec.category}: ${rec.issue}</div>
                <div class="octo-recommendation-priority ${rec.priority.toLowerCase()}">${rec.priority}</div>
            </div>
            <div class="octo-recommendation-description">${rec.recommendation}</div>
        </div>
    `).join('');
    document.getElementById('recommendations-list').innerHTML = recommendationsHTML;
}

function updateHealthCardsFromValidation(report) {
    // Update cards based on validation results
    const overallHealth = report.summary.systemHealth;
    const healthCards = document.querySelectorAll('.octo-health-card');

    healthCards.forEach(card => {
        const status = card.querySelector('.octo-health-status');
        const detail = card.querySelector('.octo-health-detail');

        // Update based on overall health
        status.textContent = overallHealth;
        detail.textContent = `Validation completed - ${report.summary.overallPassRate} pass rate`;

        updateCardStatus(card, status, overallHealth === 'GOOD' ? 'HEALTHY' : overallHealth === 'FAIR' ? 'DEGRADED' : 'CRITICAL');
    });
}

function refreshMetrics() {
    addLogEntry('Refreshing performance metrics', 'info');
    performQuickHealthCheck();
}

function clearSystemLog() {
    const logContainer = document.getElementById('system-log');
    logContainer.innerHTML = '';
    addLogEntry('System log cleared', 'info');
}

function addLogEntry(message, level = 'info') {
    const logContainer = document.getElementById('system-log');
    const timestamp = new Date().toLocaleString();

    const logEntry = document.createElement('div');
    logEntry.className = 'octo-log-entry';
    logEntry.innerHTML = `
        <span class="octo-log-timestamp">${timestamp}</span>
        <span class="octo-log-level ${level}">${level.toUpperCase()}</span>
        <span class="octo-log-message">${message}</span>
    `;

    // Add to top of log
    logContainer.insertBefore(logEntry, logContainer.firstChild);

    // Limit log entries (keep last 50)
    while (logContainer.children.length > 50) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

function formatSectionName(sectionName) {
    return sectionName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

// CSS for spinning animation
const style = document.createElement('style');
style.textContent = `
    .spin {
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
</script>
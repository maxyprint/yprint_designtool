/**
 * 🛠️ ADMIN PLUGIN CONTROLS v1.0
 * WordPress Admin interface for YPrint Plugin Management
 *
 * PURPOSE: Admin dashboard controls for plugin lifecycle management
 * ARCHITECTURE: WordPress admin integration with real-time status
 */

(function($) {
    'use strict';

    console.log('🛠️ ADMIN PLUGIN CONTROLS: Loading admin interface...');

    /**
     * Admin Plugin Controller
     * Manages plugins from WordPress admin dashboard
     */
    window.YPrintAdminPluginControls = {
        version: '1.0.0',

        // Admin configuration
        config: {
            ajaxAction: 'yprint_admin_plugin_action',
            nonce: window.yprint_admin_nonce || '',
            refreshInterval: 30000 // 30 seconds
        },

        // UI state
        state: {
            plugins: [],
            lastUpdate: null,
            autoRefresh: true
        },

        /**
         * Initialize admin controls
         */
        initialize() {
            console.log('🛠️ ADMIN CONTROLS: Initializing...');

            // Validate WordPress admin environment
            if (typeof ajaxurl === 'undefined') {
                console.error('❌ ADMIN CONTROLS: WordPress admin environment not detected');
                return false;
            }

            // Initialize UI components
            this.initializeUI();

            // Load plugin data
            this.loadPluginData();

            // Setup auto-refresh
            this.setupAutoRefresh();

            console.log('✅ ADMIN CONTROLS: Initialization complete');
            return true;
        },

        /**
         * Initialize UI components
         */
        initializeUI() {
            // Create admin interface if container exists
            const container = document.getElementById('yprint-plugin-admin');
            if (container) {
                this.createAdminInterface(container);
            }

            // Bind event handlers
            this.bindEventHandlers();
        },

        /**
         * Create admin interface
         */
        createAdminInterface(container) {
            container.innerHTML = `
                <div class="yprint-admin-header">
                    <h2>🔌 YPrint Plugin Management</h2>
                    <div class="admin-controls">
                        <button class="button" id="refresh-plugins">Refresh</button>
                        <button class="button" id="restart-all-plugins">Restart All</button>
                        <button class="button button-secondary" id="emergency-shutdown">Emergency Shutdown</button>
                    </div>
                </div>

                <div class="plugin-status-overview">
                    <div class="status-card">
                        <h4>Active Plugins</h4>
                        <span id="active-count">-</span>
                    </div>
                    <div class="status-card">
                        <h4>Total Plugins</h4>
                        <span id="total-count">-</span>
                    </div>
                    <div class="status-card">
                        <h4>Last Update</h4>
                        <span id="last-update">-</span>
                    </div>
                </div>

                <div class="plugin-list-container">
                    <h3>Plugin Status</h3>
                    <div id="admin-plugin-list">Loading plugins...</div>
                </div>

                <div class="plugin-logs-container">
                    <h3>Plugin Logs</h3>
                    <div id="plugin-logs">
                        <p>No recent activity</p>
                    </div>
                </div>
            `;

            console.log('✅ ADMIN CONTROLS: Admin interface created');
        },

        /**
         * Bind event handlers
         */
        bindEventHandlers() {
            // Refresh button
            $(document).on('click', '#refresh-plugins', () => {
                this.loadPluginData();
            });

            // Restart all button
            $(document).on('click', '#restart-all-plugins', () => {
                if (confirm('Restart all plugins? This may briefly interrupt functionality.')) {
                    this.restartAllPlugins();
                }
            });

            // Emergency shutdown button
            $(document).on('click', '#emergency-shutdown', () => {
                if (confirm('⚠️ EMERGENCY SHUTDOWN: This will immediately disable ALL plugins. Continue?')) {
                    this.emergencyShutdown();
                }
            });

            // Individual plugin controls
            $(document).on('click', '.plugin-enable', (e) => {
                const pluginName = $(e.target).data('plugin');
                this.enablePlugin(pluginName);
            });

            $(document).on('click', '.plugin-disable', (e) => {
                const pluginName = $(e.target).data('plugin');
                this.disablePlugin(pluginName);
            });

            $(document).on('click', '.plugin-restart', (e) => {
                const pluginName = $(e.target).data('plugin');
                this.restartPlugin(pluginName);
            });
        },

        /**
         * Load plugin data from frontend
         */
        loadPluginData() {
            console.log('🛠️ ADMIN CONTROLS: Loading plugin data...');

            // Check if plugin framework is available in admin
            if (typeof window.YPrintPlugins !== 'undefined') {
                // Direct access to plugin framework
                this.state.plugins = window.YPrintPlugins.listPlugins();
                this.updateUI();
            } else {
                // Load via AJAX from frontend
                this.loadPluginDataViaAjax();
            }
        },

        /**
         * Load plugin data via AJAX
         */
        loadPluginDataViaAjax() {
            $.post(ajaxurl, {
                action: 'yprint_get_plugin_status',
                nonce: this.config.nonce
            })
            .done((response) => {
                if (response.success) {
                    this.state.plugins = response.data.plugins || [];
                    this.state.lastUpdate = new Date();
                    this.updateUI();
                } else {
                    this.logError('Failed to load plugin data: ' + (response.data || 'Unknown error'));
                }
            })
            .fail(() => {
                this.logError('AJAX request failed while loading plugin data');
            });
        },

        /**
         * Update admin UI
         */
        updateUI() {
            this.updateStatusOverview();
            this.updatePluginList();
            this.updateLastUpdateTime();
        },

        /**
         * Update status overview
         */
        updateStatusOverview() {
            const activeCount = this.state.plugins.filter(p => p.enabled).length;
            const totalCount = this.state.plugins.length;

            $('#active-count').text(activeCount);
            $('#total-count').text(totalCount);
        },

        /**
         * Update plugin list
         */
        updatePluginList() {
            const container = $('#admin-plugin-list');

            if (this.state.plugins.length === 0) {
                container.html('<p>No plugins registered</p>');
                return;
            }

            let html = '<table class="wp-list-table widefat fixed striped">';
            html += '<thead><tr><th>Plugin</th><th>Version</th><th>Status</th><th>Actions</th></tr></thead>';
            html += '<tbody>';

            this.state.plugins.forEach(plugin => {
                const statusClass = plugin.enabled ? 'status-enabled' : 'status-disabled';
                const statusText = plugin.enabled ? 'Enabled' : 'Disabled';

                html += `
                    <tr>
                        <td><strong>${plugin.name}</strong></td>
                        <td>${plugin.version}</td>
                        <td><span class="${statusClass}">${statusText}</span></td>
                        <td>
                            <button class="button plugin-enable" data-plugin="${plugin.name}"
                                    ${plugin.enabled ? 'disabled' : ''}>Enable</button>
                            <button class="button plugin-disable" data-plugin="${plugin.name}"
                                    ${!plugin.enabled ? 'disabled' : ''}>Disable</button>
                            <button class="button plugin-restart" data-plugin="${plugin.name}">Restart</button>
                        </td>
                    </tr>
                `;
            });

            html += '</tbody></table>';
            container.html(html);
        },

        /**
         * Update last update time
         */
        updateLastUpdateTime() {
            if (this.state.lastUpdate) {
                $('#last-update').text(this.state.lastUpdate.toLocaleTimeString());
            }
        },

        /**
         * Enable plugin
         */
        enablePlugin(pluginName) {
            console.log(`🛠️ ADMIN CONTROLS: Enabling plugin '${pluginName}'`);

            this.performPluginAction('enable', pluginName)
                .then(() => {
                    this.logSuccess(`Plugin '${pluginName}' enabled successfully`);
                    this.loadPluginData();
                })
                .catch((error) => {
                    this.logError(`Failed to enable plugin '${pluginName}': ${error}`);
                });
        },

        /**
         * Disable plugin
         */
        disablePlugin(pluginName) {
            console.log(`🛠️ ADMIN CONTROLS: Disabling plugin '${pluginName}'`);

            this.performPluginAction('disable', pluginName)
                .then(() => {
                    this.logSuccess(`Plugin '${pluginName}' disabled successfully`);
                    this.loadPluginData();
                })
                .catch((error) => {
                    this.logError(`Failed to disable plugin '${pluginName}': ${error}`);
                });
        },

        /**
         * Restart plugin
         */
        restartPlugin(pluginName) {
            console.log(`🛠️ ADMIN CONTROLS: Restarting plugin '${pluginName}'`);

            this.performPluginAction('restart', pluginName)
                .then(() => {
                    this.logSuccess(`Plugin '${pluginName}' restarted successfully`);
                    setTimeout(() => this.loadPluginData(), 500);
                })
                .catch((error) => {
                    this.logError(`Failed to restart plugin '${pluginName}': ${error}`);
                });
        },

        /**
         * Restart all plugins
         */
        restartAllPlugins() {
            console.log('🛠️ ADMIN CONTROLS: Restarting all plugins');

            this.performPluginAction('restart_all')
                .then(() => {
                    this.logSuccess('All plugins restarted successfully');
                    setTimeout(() => this.loadPluginData(), 1000);
                })
                .catch((error) => {
                    this.logError(`Failed to restart all plugins: ${error}`);
                });
        },

        /**
         * Emergency shutdown
         */
        emergencyShutdown() {
            console.log('🚨 ADMIN CONTROLS: EMERGENCY SHUTDOWN');

            this.performPluginAction('emergency_shutdown')
                .then(() => {
                    this.logSuccess('Emergency shutdown completed - all plugins disabled');
                    this.loadPluginData();
                })
                .catch((error) => {
                    this.logError(`Emergency shutdown failed: ${error}`);
                });
        },

        /**
         * Perform plugin action via AJAX
         */
        performPluginAction(action, pluginName = null) {
            return new Promise((resolve, reject) => {
                const data = {
                    action: this.config.ajaxAction,
                    plugin_action: action,
                    nonce: this.config.nonce
                };

                if (pluginName) {
                    data.plugin_name = pluginName;
                }

                $.post(ajaxurl, data)
                    .done((response) => {
                        if (response.success) {
                            resolve(response.data);
                        } else {
                            reject(response.data || 'Action failed');
                        }
                    })
                    .fail(() => {
                        reject('AJAX request failed');
                    });
            });
        },

        /**
         * Setup auto-refresh
         */
        setupAutoRefresh() {
            if (this.state.autoRefresh) {
                setInterval(() => {
                    this.loadPluginData();
                }, this.config.refreshInterval);

                console.log(`✅ ADMIN CONTROLS: Auto-refresh enabled (${this.config.refreshInterval / 1000}s interval)`);
            }
        },

        /**
         * Log success message
         */
        logSuccess(message) {
            this.addLogEntry('success', message);
            console.log('✅ ADMIN CONTROLS: ' + message);
        },

        /**
         * Log error message
         */
        logError(message) {
            this.addLogEntry('error', message);
            console.error('❌ ADMIN CONTROLS: ' + message);
        },

        /**
         * Add log entry to UI
         */
        addLogEntry(type, message) {
            const logsContainer = $('#plugin-logs');
            const timestamp = new Date().toLocaleTimeString();
            const icon = type === 'success' ? '✅' : '❌';
            const cssClass = type === 'success' ? 'log-success' : 'log-error';

            const logEntry = `
                <div class="log-entry ${cssClass}">
                    <span class="log-time">${timestamp}</span>
                    <span class="log-icon">${icon}</span>
                    <span class="log-message">${message}</span>
                </div>
            `;

            logsContainer.prepend(logEntry);

            // Keep only last 10 log entries
            const logEntries = logsContainer.find('.log-entry');
            if (logEntries.length > 10) {
                logEntries.slice(10).remove();
            }
        }
    };

    // Auto-initialize when DOM is ready
    $(document).ready(() => {
        if ($('#yprint-plugin-admin').length > 0) {
            window.YPrintAdminPluginControls.initialize();
        }
    });

    console.log('✅ ADMIN PLUGIN CONTROLS: Module loaded successfully');

})(jQuery);
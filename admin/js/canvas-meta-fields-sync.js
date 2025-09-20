/**
 * 🚀 Canvas-Meta-Fields Synchronization Bridge
 *
 * Automatic bidirectional sync between Fabric.js Canvas and WordPress Meta-Fields
 * Eliminates manual JSON copy-paste workflow completely
 *
 * 👑 24-AGENT HIERARCHICAL SOLUTION
 */

(function($) {
    'use strict';

    console.log('🔄 CANVAS-META-FIELDS SYNC: Initializing synchronization bridge...');

    // Sync state management
    let syncInProgress = false;
    let lastSyncData = null;
    let autoSyncEnabled = true;
    let debounceTimeout = null;

    const CanvasMetaSync = {

        /**
         * Initialize the synchronization system
         */
        init() {
            console.log('🔄 SYNC INIT: Setting up Canvas-Meta-Fields bridge...');

            this.setupEventListeners();
            this.setupAutoSync();
            this.setupUI();

            // Wait for Canvas to be ready
            if (window.fabricCanvas) {
                this.attachCanvasListeners();
            } else {
                $(window).on('fabricCanvasReady', () => {
                    console.log('🔄 SYNC: Canvas ready, attaching listeners...');
                    this.attachCanvasListeners();
                });
            }
        },

        /**
         * Setup UI event listeners for manual sync buttons
         */
        setupEventListeners() {
            // Manual sync from Canvas to Meta-Fields
            $(document).on('click', '#sync-canvas-to-meta', (e) => {
                e.preventDefault();
                this.syncCanvasToMetaFields(true); // manual = true
            });

            // Manual sync from Meta-Fields to Canvas
            $(document).on('click', '#sync-meta-to-canvas', (e) => {
                e.preventDefault();
                this.syncMetaFieldsToCanvas();
            });

            // Toggle auto-sync
            $(document).on('change', '#auto-sync-toggle', (e) => {
                autoSyncEnabled = e.target.checked;
                this.updateSyncStatus(autoSyncEnabled ? 'Auto-sync enabled' : 'Auto-sync disabled');
            });
        },

        /**
         * Setup automatic synchronization
         */
        setupAutoSync() {
            // Auto-sync configuration
            const config = window.octoPrintDesignerSync || {};
            autoSyncEnabled = config.autoSyncEnabled !== false;
            const debounceDelay = config.debounceDelay || 1000;

            console.log('🔄 SYNC CONFIG:', { autoSyncEnabled, debounceDelay });
        },

        /**
         * Setup sync UI elements
         */
        setupUI() {
            // Inject sync controls if not present
            if ($('#canvas-meta-sync-container').length === 0) {
                this.injectSyncUI();
            }

            // Update initial status
            this.updateSyncStatus('Sync bridge ready');
        },

        /**
         * Inject sync UI into meta-box
         */
        injectSyncUI() {
            const syncHTML = `
                <div id="canvas-meta-sync-container" class="sync-container">
                    <div class="sync-controls">
                        <h4>🔄 Canvas-Meta-Fields Synchronization</h4>
                        <div class="sync-buttons">
                            <button id="sync-canvas-to-meta" class="button button-primary" type="button">
                                <span class="dashicons dashicons-download"></span>
                                Sync from Canvas
                            </button>
                            <button id="sync-meta-to-canvas" class="button button-secondary" type="button">
                                <span class="dashicons dashicons-upload"></span>
                                Load to Canvas
                            </button>
                        </div>
                        <div class="sync-options">
                            <label>
                                <input type="checkbox" id="auto-sync-toggle" ${autoSyncEnabled ? 'checked' : ''}>
                                Auto-sync when Canvas changes
                            </label>
                        </div>
                        <div id="sync-status" class="sync-status"></div>
                    </div>
                </div>
            `;

            // Try to inject into data foundation meta-box
            const targetContainer = $('.data-foundation-meta-box, #template_data_foundation, .postbox h3:contains("Data Foundation")').first().closest('.postbox');

            if (targetContainer.length > 0) {
                targetContainer.find('.inside').prepend(syncHTML);
            } else {
                // Fallback: inject after first meta-box
                $('.postbox').first().after(`<div class="postbox">${syncHTML}</div>`);
            }

            // Add CSS styles
            this.addSyncStyles();
        },

        /**
         * Add CSS styles for sync UI
         */
        addSyncStyles() {
            const css = `
                <style id="canvas-meta-sync-styles">
                .sync-container {
                    margin: 15px 0;
                    padding: 15px;
                    background: #f9f9f9;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                .sync-controls h4 {
                    margin: 0 0 15px 0;
                    color: #23282d;
                }
                .sync-buttons {
                    margin-bottom: 10px;
                }
                .sync-buttons button {
                    margin-right: 10px;
                }
                .sync-options {
                    margin: 10px 0;
                    font-size: 13px;
                }
                .sync-status {
                    margin-top: 10px;
                    padding: 5px 10px;
                    border-radius: 3px;
                    font-size: 12px;
                    min-height: 20px;
                }
                .sync-status.success {
                    background: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }
                .sync-status.error {
                    background: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }
                .sync-status.info {
                    background: #d1ecf1;
                    color: #0c5460;
                    border: 1px solid #bee5eb;
                }
                .sync-status.warning {
                    background: #fff3cd;
                    color: #856404;
                    border: 1px solid #ffeaa7;
                }
                .readonly-meta-field {
                    background-color: #f0f0f0 !important;
                    border: 1px solid #ccc !important;
                    cursor: not-allowed;
                }
                </style>
            `;

            if ($('#canvas-meta-sync-styles').length === 0) {
                $('head').append(css);
            }
        },

        /**
         * Attach Canvas event listeners for auto-sync
         */
        attachCanvasListeners() {
            if (!window.fabricCanvas) {
                console.warn('🔄 SYNC: No fabricCanvas available for auto-sync');
                return;
            }

            const canvas = window.fabricCanvas;

            // Debounced auto-sync on Canvas changes
            const debouncedSync = this.debounce(() => {
                if (autoSyncEnabled && !syncInProgress) {
                    console.log('🔄 AUTO-SYNC: Canvas changed, triggering sync...');
                    this.syncCanvasToMetaFields(false); // automatic = false
                }
            }, 1000);

            // Attach Canvas events
            canvas.on('path:created', debouncedSync);
            canvas.on('object:added', debouncedSync);
            canvas.on('object:modified', debouncedSync);
            canvas.on('object:removed', debouncedSync);

            console.log('✅ SYNC: Canvas listeners attached for auto-sync');
        },

        /**
         * Extract Canvas data in standardized format
         */
        extractCanvasData() {
            if (!window.fabricCanvas) {
                console.error('🔄 SYNC ERROR: No fabricCanvas available');
                return null;
            }

            const canvas = window.fabricCanvas;
            const canvasData = {
                timestamp: new Date().toISOString(),
                source: 'canvas_sync'
            };

            // Extract reference lines
            const referenceLines = [];
            const objects = canvas.getObjects();

            objects.forEach((obj, index) => {
                if (obj.type === 'line' && obj.referenceLineType) {
                    referenceLines.push({
                        type: obj.referenceLineType,
                        coordinates: {
                            x1: obj.x1,
                            y1: obj.y1,
                            x2: obj.x2,
                            y2: obj.y2
                        },
                        length_px: Math.sqrt(Math.pow(obj.x2 - obj.x1, 2) + Math.pow(obj.y2 - obj.y1, 2)),
                        index: index
                    });
                }
            });

            if (referenceLines.length > 0) {
                canvasData.referenceLines = referenceLines;
            }

            // Extract scalable area (rectangles marked as scalable)
            const scalableRects = objects.filter(obj =>
                obj.type === 'rect' && obj.scalableArea === true
            );

            if (scalableRects.length > 0) {
                const rect = scalableRects[0];
                canvasData.scalableArea = {
                    x: rect.left,
                    y: rect.top,
                    width: rect.width * rect.scaleX,
                    height: rect.height * rect.scaleY
                };
            }

            // Extract base coordinates (first object or canvas center)
            if (objects.length > 0) {
                const firstObj = objects[0];
                canvasData.baseCoordinates = {
                    x: firstObj.left || 0,
                    y: firstObj.top || 0
                };
            } else {
                canvasData.baseCoordinates = {
                    x: canvas.width / 2,
                    y: canvas.height / 2
                };
            }

            // Extract base dimensions (canvas size)
            canvasData.baseDimensions = {
                width: canvas.width,
                height: canvas.height
            };

            // Determine calculation method
            canvasData.calculationMethod = referenceLines.length > 0 ? 'reference_lines' : 'scalable_area';

            console.log('🔄 EXTRACTED CANVAS DATA:', canvasData);
            return canvasData;
        },

        /**
         * Transform Canvas data to Meta-Fields format
         */
        transformToMetaFieldsFormat(canvasData) {
            if (!canvasData) return {};

            const metaFields = {};

            // Base coordinates
            if (canvasData.baseCoordinates) {
                metaFields.base_coordinate_x = String(canvasData.baseCoordinates.x || 0);
                metaFields.base_coordinate_y = String(canvasData.baseCoordinates.y || 0);
            }

            // Base dimensions
            if (canvasData.baseDimensions) {
                metaFields.base_width = String(canvasData.baseDimensions.width || 0);
                metaFields.base_height = String(canvasData.baseDimensions.height || 0);
            }

            // Scalable area coordinates
            if (canvasData.scalableArea) {
                metaFields.scalable_area_coordinates = JSON.stringify(canvasData.scalableArea);
            }

            // Reference lines data
            if (canvasData.referenceLines) {
                metaFields.reference_lines_data = JSON.stringify(canvasData.referenceLines);
            }

            // Size calculation method
            metaFields.size_calculation_method = canvasData.calculationMethod || 'reference_lines';

            return metaFields;
        },

        /**
         * Sync Canvas data to Meta-Fields
         */
        async syncCanvasToMetaFields(manual = false) {
            if (syncInProgress) {
                console.log('🔄 SYNC: Already in progress, skipping...');
                return;
            }

            syncInProgress = true;
            this.updateSyncStatus('Syncing to Meta-Fields...', 'info');

            try {
                // Extract Canvas data
                const canvasData = this.extractCanvasData();
                if (!canvasData) {
                    throw new Error('No Canvas data available');
                }

                // Check if data has changed (avoid unnecessary syncs)
                const currentDataHash = this.generateDataHash(canvasData);
                if (!manual && lastSyncData === currentDataHash) {
                    console.log('🔄 SYNC: No changes detected, skipping sync');
                    syncInProgress = false;
                    return;
                }

                // Transform to Meta-Fields format
                const metaFieldsData = this.transformToMetaFieldsFormat(canvasData);

                // AJAX call to sync
                const response = await $.post(window.octoPrintDesignerSync?.ajaxUrl || octoPrintDesigner.ajaxUrl, {
                    action: 'sync_canvas_to_meta_fields',
                    nonce: window.octoPrintDesignerSync?.syncNonce || octoPrintDesigner.nonce,
                    post_id: window.octoPrintDesignerSync?.postId || octoPrintDesigner.postId,
                    canvas_data: JSON.stringify(canvasData),
                    meta_fields_data: JSON.stringify(metaFieldsData)
                });

                if (response.success) {
                    // Update Meta-Fields UI
                    this.updateMetaFieldsUI(response.data.meta_fields);

                    // Update sync status
                    this.updateSyncStatus(
                        `✅ ${manual ? 'Manual' : 'Auto'} sync successful - ${Object.keys(metaFieldsData).length} fields updated`,
                        'success'
                    );

                    // Store sync hash
                    lastSyncData = currentDataHash;

                    console.log('✅ SYNC SUCCESS:', response.data);
                } else {
                    throw new Error(response.data?.message || 'Sync failed');
                }

            } catch (error) {
                console.error('❌ SYNC ERROR:', error);
                this.updateSyncStatus(`❌ Sync failed: ${error.message}`, 'error');
            } finally {
                syncInProgress = false;
            }
        },

        /**
         * Sync Meta-Fields to Canvas (reverse direction)
         */
        async syncMetaFieldsToCanvas() {
            if (syncInProgress) {
                console.log('🔄 SYNC: Already in progress, skipping...');
                return;
            }

            syncInProgress = true;
            this.updateSyncStatus('Loading to Canvas...', 'info');

            try {
                // AJAX call to load Meta-Fields data
                const response = await $.post(window.octoPrintDesignerSync?.ajaxUrl || octoPrintDesigner.ajaxUrl, {
                    action: 'load_meta_fields_to_canvas',
                    nonce: window.octoPrintDesignerSync?.syncNonce || octoPrintDesigner.nonce,
                    post_id: window.octoPrintDesignerSync?.postId || octoPrintDesigner.postId
                });

                if (response.success && response.data.canvas_data) {
                    // Recreate Canvas from Meta-Fields data
                    this.recreateCanvasFromMetaFields(response.data.canvas_data);

                    this.updateSyncStatus('✅ Meta-Fields loaded to Canvas successfully', 'success');
                    console.log('✅ REVERSE SYNC SUCCESS:', response.data);
                } else {
                    throw new Error(response.data?.message || 'Failed to load Canvas data');
                }

            } catch (error) {
                console.error('❌ REVERSE SYNC ERROR:', error);
                this.updateSyncStatus(`❌ Load failed: ${error.message}`, 'error');
            } finally {
                syncInProgress = false;
            }
        },

        /**
         * Update Meta-Fields UI with synced data
         */
        updateMetaFieldsUI(metaFields) {
            Object.entries(metaFields).forEach(([fieldName, fieldValue]) => {
                const fieldSelector = `[name="${fieldName}"], [name="_${fieldName}"]`;
                const $field = $(fieldSelector);

                if ($field.length > 0) {
                    $field.val(fieldValue).addClass('readonly-meta-field');

                    // Visual feedback
                    $field.addClass('field-updated');
                    setTimeout(() => $field.removeClass('field-updated'), 2000);
                }
            });

            // Add CSS for visual feedback
            if ($('#field-update-styles').length === 0) {
                $('head').append(`
                    <style id="field-update-styles">
                    .field-updated {
                        background-color: #d4edda !important;
                        border-color: #c3e6cb !important;
                        transition: all 0.3s ease;
                    }
                    </style>
                `);
            }
        },

        /**
         * Recreate Canvas objects from Meta-Fields data
         */
        recreateCanvasFromMetaFields(canvasData) {
            if (!window.fabricCanvas) {
                console.error('🔄 RECREATE ERROR: No fabricCanvas available');
                return;
            }

            const canvas = window.fabricCanvas;

            // Clear existing canvas (optional - ask user first in production)
            if (confirm('This will replace current Canvas content. Continue?')) {
                canvas.clear();
            }

            // Recreate reference lines
            if (canvasData.referenceLines && Array.isArray(canvasData.referenceLines)) {
                canvasData.referenceLines.forEach((lineData, index) => {
                    const line = new fabric.Line([
                        lineData.coordinates.x1,
                        lineData.coordinates.y1,
                        lineData.coordinates.x2,
                        lineData.coordinates.y2
                    ], {
                        stroke: 'red',
                        strokeWidth: 2,
                        selectable: true,
                        referenceLineType: lineData.type,
                        id: `reference_line_${index}`
                    });

                    canvas.add(line);
                });
            }

            // Recreate scalable area
            if (canvasData.scalableArea) {
                const area = canvasData.scalableArea;
                const rect = new fabric.Rect({
                    left: area.x,
                    top: area.y,
                    width: area.width,
                    height: area.height,
                    fill: 'rgba(0,255,0,0.1)',
                    stroke: 'green',
                    strokeWidth: 1,
                    selectable: true,
                    scalableArea: true,
                    id: 'scalable_area'
                });

                canvas.add(rect);
            }

            // Render all changes
            canvas.renderAll();
            console.log('✅ CANVAS RECREATED from Meta-Fields data');
        },

        /**
         * Update sync status UI
         */
        updateSyncStatus(message, type = 'info') {
            const $status = $('#sync-status');
            $status.removeClass('success error info warning')
                   .addClass(type)
                   .html(message);

            console.log(`🔄 SYNC STATUS [${type.toUpperCase()}]:`, message);
        },

        /**
         * Generate hash for data comparison
         */
        generateDataHash(data) {
            return btoa(JSON.stringify(data)).substring(0, 16);
        },

        /**
         * Debounce utility function
         */
        debounce(func, wait) {
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(debounceTimeout);
                    func(...args);
                };
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(later, wait);
            };
        }
    };

    // Initialize when DOM is ready
    $(document).ready(function() {
        console.log('🔄 CANVAS-META-FIELDS SYNC: DOM ready, initializing...');
        CanvasMetaSync.init();
    });

    // Expose to window for testing/debugging
    window.CanvasMetaSync = CanvasMetaSync;

    console.log('✅ Canvas-Meta-Fields Synchronization Bridge loaded successfully');

})(jQuery);
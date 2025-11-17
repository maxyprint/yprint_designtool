<div class="template-editor-toolbar">
    <div class="toolbar-group">
        <button type="button" class="button mode-select" data-mode="image">
            <span class="dashicons dashicons-format-image"></span>
            <?php esc_html_e('Edit Image', 'octo-print-designer'); ?>
        </button>
        <button type="button" class="button mode-select" data-mode="safezone">
            <span class="dashicons dashicons-marker"></span>
            <?php esc_html_e('Edit Safe Zone', 'octo-print-designer'); ?>
        </button>
        <button type="button" class="button mode-select" data-mode="printzone">
            <span class="dashicons dashicons-admin-print"></span>
            <?php esc_html_e('Edit Print Zone', 'octo-print-designer'); ?>
        </button>
        <button type="button" class="button mode-select measurement-definition-mode" data-mode="measurement">
            <span class="dashicons dashicons-admin-tools"></span>
            <?php esc_html_e('Define Measurement', 'octo-print-designer'); ?>
        </button>
    </div>
    <div class="toolbar-group">
        <button type="button" class="button zoomIn">
            <span class="dashicons dashicons-plus"></span>
        </button>
        <button type="button" class="button zoomOut">
            <span class="dashicons dashicons-minus"></span>
        </button>
        <button type="button" class="button resetZoom">
            <span class="dashicons dashicons-image-rotate"></span>
        </button>
    </div>
    
    <div class="toolbar-group resets">
        <button type="button" class="button resetImage">
            <?php esc_html_e('Reset View to Default', 'octo-print-designer'); ?>
        </button>
        <button type="button" class="button resetSafeZone">
            <?php esc_html_e('Reset Safe Zone', 'octo-print-designer'); ?>
        </button>
        <button type="button" class="button resetPrintZone">
            <?php esc_html_e('Reset Print Zone', 'octo-print-designer'); ?>
        </button>
    </div>

</div>

<!-- 🎯 AGENT 1: Enhanced Measurement Definition Interface -->
<div id="measurement-definition-panel" class="measurement-panel" style="display: none;">
    <div class="measurement-panel-header">
        <h3>
            <span class="dashicons dashicons-admin-tools"></span>
            <?php esc_html_e('Define Measurement', 'octo-print-designer'); ?>
        </h3>
        <button type="button" class="measurement-panel-close">
            <span class="dashicons dashicons-no"></span>
        </button>
    </div>

    <div class="measurement-panel-body">
        <!-- Step 1: Measurement Type Selection -->
        <div class="measurement-step active" data-step="1">
            <h4><?php esc_html_e('Step 1: Select Measurement Type', 'octo-print-designer'); ?></h4>
            <div class="measurement-type-selector">
                <select id="measurement-type-dropdown" class="measurement-dropdown">
                    <option value=""><?php esc_html_e('Select measurement type...', 'octo-print-designer'); ?></option>
                    <!-- Dynamically populated from database -->
                </select>
            </div>

            <!-- Real-time measurement info display -->
            <div class="measurement-info" style="display: none;">
                <div class="measurement-details">
                    <div class="measurement-label"></div>
                    <div class="measurement-description"></div>
                    <div class="measurement-target-value">
                        <strong><?php esc_html_e('Target Value:', 'octo-print-designer'); ?></strong>
                        <span class="target-value"></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Step 2: Point Selection -->
        <div class="measurement-step" data-step="2">
            <h4><?php esc_html_e('Step 2: Select Two Points', 'octo-print-designer'); ?></h4>
            <div class="point-selection-guide">
                <p class="selection-instruction"><?php esc_html_e('Click two points on the template image to define your measurement', 'octo-print-designer'); ?></p>
                <div class="selection-status">
                    <div class="point-status">
                        <span class="point-indicator point-1">1</span>
                        <span class="point-label"><?php esc_html_e('First Point', 'octo-print-designer'); ?></span>
                        <span class="point-coords"></span>
                    </div>
                    <div class="point-status">
                        <span class="point-indicator point-2">2</span>
                        <span class="point-label"><?php esc_html_e('Second Point', 'octo-print-designer'); ?></span>
                        <span class="point-coords"></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Step 3: Validation & Save -->
        <div class="measurement-step" data-step="3">
            <h4><?php esc_html_e('Step 3: Validation', 'octo-print-designer'); ?></h4>
            <div class="measurement-validation">
                <div class="validation-results">
                    <div class="measured-length">
                        <strong><?php esc_html_e('Measured Length:', 'octo-print-designer'); ?></strong>
                        <span class="measured-value"></span>
                    </div>
                    <div class="accuracy-feedback">
                        <strong><?php esc_html_e('Accuracy:', 'octo-print-designer'); ?></strong>
                        <span class="accuracy-percentage"></span>
                        <span class="accuracy-status"></span>
                    </div>
                    <div class="validation-message"></div>
                </div>

                <div class="measurement-actions">
                    <button type="button" class="button button-secondary measurement-cancel">
                        <?php esc_html_e('Cancel', 'octo-print-designer'); ?>
                    </button>
                    <button type="button" class="button button-primary measurement-save">
                        <?php esc_html_e('Save Measurement', 'octo-print-designer'); ?>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Progress Indicator -->
    <div class="measurement-progress">
        <div class="progress-step active" data-step="1"><?php esc_html_e('Select Type', 'octo-print-designer'); ?></div>
        <div class="progress-step" data-step="2"><?php esc_html_e('Select Points', 'octo-print-designer'); ?></div>
        <div class="progress-step" data-step="3"><?php esc_html_e('Validate', 'octo-print-designer'); ?></div>
    </div>
</div>

<!-- 🔄 Legacy Reference Line Modal (Backward Compatibility) -->
<div id="reference-line-modal" class="octo-modal" style="display: none;">
    <div class="octo-modal-content">
        <div class="octo-modal-header">
            <h3><?php esc_html_e('Select Reference Line Type', 'octo-print-designer'); ?></h3>
            <span class="octo-modal-close">&times;</span>
        </div>
        <div class="octo-modal-body">
            <p><?php esc_html_e('Choose the type of reference line to create for size calculations:', 'octo-print-designer'); ?></p>
            <div class="reference-line-options">
                <button type="button" class="button button-primary select-reference-type" data-type="chest_width">
                    <span class="dashicons dashicons-leftright"></span>
                    <?php esc_html_e('Chest Width', 'octo-print-designer'); ?>
                    <small class="description"><?php esc_html_e('Horizontal measurement across the chest area', 'octo-print-designer'); ?></small>
                </button>
                <button type="button" class="button button-primary select-reference-type" data-type="shoulder_height">
                    <span class="dashicons dashicons-arrow-up-alt"></span>
                    <?php esc_html_e('Height from Shoulder', 'octo-print-designer'); ?>
                    <small class="description"><?php esc_html_e('Vertical measurement from shoulder to bottom', 'octo-print-designer'); ?></small>
                </button>
            </div>
        </div>
    </div>
</div>
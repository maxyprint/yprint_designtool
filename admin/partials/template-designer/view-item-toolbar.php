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
        <button type="button" class="button mode-select" data-mode="measurement" id="measurement-mode-btn">
            <span class="dashicons dashicons-chart-line"></span>
            <?php esc_html_e('Define Measurement', 'octo-print-designer'); ?>
        </button>
    </div>

    <!-- Enhanced Measurement Type Selector - Issue #22 Implementation -->
    <div class="toolbar-group measurement-selector-group" id="measurement-selector-group" style="display: none;">
        <label for="measurement-type-select" class="measurement-label">
            <span class="dashicons dashicons-analytics"></span>
            <?php esc_html_e('Measurement Type:', 'octo-print-designer'); ?>
        </label>
        <select id="measurement-type-select" class="measurement-type-dropdown">
            <option value=""><?php esc_html_e('Select measurement...', 'octo-print-designer'); ?></option>
            <option value="A"><?php esc_html_e('A - Chest Width', 'octo-print-designer'); ?></option>
            <option value="B"><?php esc_html_e('B - Hem Width', 'octo-print-designer'); ?></option>
            <option value="C"><?php esc_html_e('C - Height from Shoulder', 'octo-print-designer'); ?></option>
            <option value="D"><?php esc_html_e('D - Sleeve Length', 'octo-print-designer'); ?></option>
            <option value="E"><?php esc_html_e('E - Sleeve Opening', 'octo-print-designer'); ?></option>
            <option value="F"><?php esc_html_e('F - Shoulder to Shoulder', 'octo-print-designer'); ?></option>
            <option value="G"><?php esc_html_e('G - Neck Opening', 'octo-print-designer'); ?></option>
            <option value="H"><?php esc_html_e('H - Biceps', 'octo-print-designer'); ?></option>
            <option value="J"><?php esc_html_e('J - Rib Height', 'octo-print-designer'); ?></option>
        </select>
        <div class="measurement-preview" id="measurement-preview">
            <span class="preview-label"><?php esc_html_e('Click two points on template', 'octo-print-designer'); ?></span>
        </div>
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
    </div>

</div>

<!-- Enhanced Measurement Interface - Issue #22 Status Display -->
<div id="measurement-status-panel" class="measurement-status-panel" style="display: none;">
    <div class="status-content">
        <div class="status-header">
            <h4><?php esc_html_e('Measurement Status', 'octo-print-designer'); ?></h4>
            <button type="button" class="status-close" aria-label="<?php esc_attr_e('Close', 'octo-print-designer'); ?>">&times;</button>
        </div>
        <div class="status-body">
            <div class="current-measurement">
                <span class="measurement-type-label"></span>
                <span class="measurement-value"></span>
            </div>
            <div class="measurement-guidance">
                <div class="guidance-text"><?php esc_html_e('Click two points on the template to define this measurement', 'octo-print-designer'); ?></div>
                <div class="expected-value" style="display: none;">
                    <span><?php esc_html_e('Expected:', 'octo-print-designer'); ?></span>
                    <span class="expected-value-text"></span>
                </div>
            </div>
            <div class="measurement-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%;"></div>
                </div>
                <span class="progress-text"><?php esc_html_e('Select first point', 'octo-print-designer'); ?></span>
            </div>
        </div>
    </div>
</div>
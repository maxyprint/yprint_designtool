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
        <button type="button" class="button mode-select" data-mode="referenceline">
            <span class="dashicons dashicons-grid-view"></span>
            <?php esc_html_e('Edit Reference Line', 'octo-print-designer'); ?>
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
    </div>

</div>

<!-- Reference Line Selection Modal -->
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
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
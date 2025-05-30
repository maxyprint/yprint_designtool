<template id="designer-view-item-template">
    <div class="view-item">

        <h4>View Name</h4>
        <input type="text" 
                placeholder="<?php esc_attr_e('View Name', 'octo-print-designer'); ?>"
                required>   

        <label class="use-default-toggle">
            <input type="checkbox" 
                    value="1"
                    <?php checked(!empty($current_view['use_default'])); ?>>
            <?php esc_html_e('Use default view image', 'octo-print-designer'); ?>
        </label>

        <div class="data-container" style="display: none;"></div>

        <button type="button" class="button upload-image">
            <?php esc_html_e('Upload Image', 'octo-print-designer'); ?>
        </button>

        <div class="color-overlay-tools hidden">
            <label>
                <input type="checkbox" 
                        value="1"
                        class="overlay-settings-enabled-checkbox"
                        <?php checked(!empty($current_view['overlay_settings']['enabled'])); ?>>
                <?php esc_html_e('Enable color overlay', 'octo-print-designer'); ?>
            </label>

            <div class="overlay-settings">
                <label>
                    <?php esc_html_e('Opacity:', 'octo-print-designer'); ?>
                    <input type="range" 
                            min="0"
                            max="1"
                            step="0.05">
                </label>
            </div>
        </div>

        <div class="safe-zone-editor">
            <?php require_once OCTO_PRINT_DESIGNER_PATH . 'admin/partials/template-designer/view-item-toolbar.php'; ?>
            <div class="template-canvas-container"></div>
        </div>

        <button type="button" class="button remove-view">
            <?php esc_html_e('Remove View', 'octo-print-designer'); ?>
        </button>

    </div>
</template>

<template id="designer-image-toolbar-template">
    <div class="designer-image-toolbar">
        <button class="toolbar-btn center-image" title="Center Image">
            <img src="<?php echo OCTO_PRINT_DESIGNER_URL . 'public/img/center.svg'; ?>" alt="Center" />
        </button>
        <div class="toolbar-dimension">
            <input type="number" class="width-input" title="Width in pixels" placeholder="W">
            <span>×</span>
            <input type="number" class="height-input" title="Height in pixels" placeholder="H">
            <span class="pixel-to-cm"></span>
        </div>
    </div>
</template>
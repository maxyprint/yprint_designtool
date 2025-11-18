<template id="designer-variation-item-template">
    <div class="tab-content">
        <div class="variation-header">
            <div class="variation-name">
                <label><?php esc_html_e('Variation Name:', 'octo-print-designer'); ?></label>
                <input type="text" required>
            </div>
            
            <div class="variation-color">
                <label><?php esc_html_e('Color:', 'octo-print-designer'); ?></label>
                <input type="color">
            </div>

            <div class="variation-dark-shirt">
                <label>
                    <input type="checkbox">
                    <?php esc_html_e('Dark Shirt', 'octo-print-designer'); ?>
                </label>
            </div>

            <button type="button" class="button remove-variation">
                <?php esc_html_e('Remove Variation', 'octo-print-designer'); ?>
            </button>
        </div>

        <div class="variation-sizes">
            <label><?php esc_html_e('Available Sizes:', 'octo-print-designer'); ?></label>
        </div>

        <div class="variation-views">
            <div class="views-list"></div>
            <button type="button" class="button add-view">
                <?php esc_html_e('Add View', 'octo-print-designer'); ?>
            </button>
        </div>
    </div>
</template>
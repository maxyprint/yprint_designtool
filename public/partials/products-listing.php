<div class="octo-print-designer-products-listing">

    <div class="opd-context-header">
        <button class="opd-back-button hidden">
            <img class="opd-icon" src="<?php echo OCTO_PRINT_DESIGNER_URL ?>public/img/arrow-left.svg" alt="back">
        </button>
        <!-- <h2 id="opd-context-title">my products</h2> -->
    </div>

    <div class="opd-section">

        <div class="toast-container"></div>

        <div class="filter-container">
            <div class="search-simulate">
                <img class="opd-icon" src="<?php echo OCTO_PRINT_DESIGNER_URL ?>public/img/search.svg" alt="filters">
                <input type="text" placeholder=""/>
            </div>
            <button class="opd-icon-btn filter-btn">
                <img class="opd-icon" src="<?php echo OCTO_PRINT_DESIGNER_URL ?>public/img/filter.svg" alt="filters">
            </button>
        </div>

        <table class="opd-products-table">

            <thead class="opd-hidden-mobile">
                <tr>
                    <th></th>
                    <th></th>
                    <th>product</th>
                    <th>inventory</th>
                    <!-- <th>shopify sync</th> -->
                    <th></th>
                    <th>
                        <button class="opd-icon-btn bulk-settings-btn">
                            <img class="opd-icon" src="<?php echo OCTO_PRINT_DESIGNER_URL ?>public/img/settings.svg" alt="bulk-settings">
                        </button>
                    </th>
                </tr>
            </thead>

            <tbody>
            </tbody>

        </table>

    </div>

    <?php include OCTO_PRINT_DESIGNER_PATH . 'public/partials/product-details.php'; ?>

    <!-- Bulk Actions Popup -->
    <div class="opd-popup hidden" id="bulk-actions-popup">
        <div class="opd-popup-content">
            <button type="button" class="bulk-action" data-action="delete">
                <img class="opd-icon" src="<?php echo OCTO_PRINT_DESIGNER_URL ?>public/img/delete.svg" alt="delete">
                <?php esc_html_e('Delete Selected', 'octo-print-designer'); ?>
            </button>
            <!-- <button type="button" class="toggle-action bulk-action" data-action="disable">
                <img class="opd-icon" src="<?php //echo OCTO_PRINT_DESIGNER_URL ?>public/img/disable.svg" alt="disable">
                <span><?php //esc_html_e('Disable Selected', 'octo-print-designer'); ?></span>
            </button> -->
        </div>
    </div>

    <div class="opd-popup hidden" id="filters-popup">
        <div class="opd-popup-content">
            <h4><?php esc_html_e('Filters', 'octo-print-designer'); ?></h4>
            
            <div class="filter-group">
                <label><?php esc_html_e('Inventory', 'octo-print-designer'); ?></label>
                <select name="inventory_filter">
                    <option value=""><?php esc_html_e('All', 'octo-print-designer'); ?></option>
                    <option value="in_stock"><?php esc_html_e('In Stock', 'octo-print-designer'); ?></option>
                    <option value="out_of_stock"><?php esc_html_e('Out of Stock', 'octo-print-designer'); ?></option>
                </select>
            </div>

            <div class="filter-group">
                <label><?php esc_html_e('Status', 'octo-print-designer'); ?></label>
                <select name="status_filter">
                    <option value=""><?php esc_html_e('All', 'octo-print-designer'); ?></option>
                    <option value="published"><?php esc_html_e('Published', 'octo-print-designer'); ?></option>
                    <option value="draft"><?php esc_html_e('Draft', 'octo-print-designer'); ?></option>
                </select>
            </div>

            <div class="filter-group">
                <label><?php esc_html_e('State', 'octo-print-designer'); ?></label>
                <select name="state_filter">
                    <option value=""><?php esc_html_e('All', 'octo-print-designer'); ?></option>
                    <option value="1"><?php esc_html_e('Enabled', 'octo-print-designer'); ?></option>
                    <option value="0"><?php esc_html_e('Disabled', 'octo-print-designer'); ?></option>
                </select>
            </div>

            <div class="filter-actions">
                <button type="button" class="designer-action-button filter-apply">
                    <?php esc_html_e('Apply Filters', 'octo-print-designer'); ?>
                </button>
                <button type="button" class="designer-action-button filter-reset">
                    <?php esc_html_e('Reset', 'octo-print-designer'); ?>
                </button>
            </div>
        </div>
    </div>

</div>

<template id="opd-product-listing-item-template">
    <tr>
        <td class="multi-select opd-hidden-mobile"><input type="checkbox"></td>
        <td class="design-preview">
            <img class="image-preview" src="https://picsum.photos/200/300">
            <span class="design-name opd-hidden-desktop">Design Name</span>
            <div class="opd-mobile-options opd-hidden-desktop hidden">
                
                <?php include OCTO_PRINT_DESIGNER_PATH . 'public/partials/toggle.php'; ?>

                <span class="design-status">published</span>

                <div style="margin: 15px 0px;">
                    <img class="opd-icon" src="<?php echo OCTO_PRINT_DESIGNER_URL ?>public/img/stock.svg" alt="stock">
                    <span class="design-inventory">in stock</span>
                </div>

                <button class="opd-icon-btn opd-settings-btn">
                    edit
                </button>

            </div>
        </td>
        <td class="opd-hidden-mobile">
            <span class="design-name">Design Name</span>
            <span class="product-name">Product Name</span>
        </td>
        <td class="design-inventory opd-hidden-mobile">in stock</td>
        <td class="design-status opd-hidden-mobile">published</td>
        <td class="opd-hidden-mobile">
            <button class="buy-product opd-gallery-button">
                <?php esc_html_e('Add to Cart', 'octo-print-designer'); ?>
            </button>
            <!-- <button class="opd-icon-btn opd-settings-btn">
                <img class="opd-icon" src="<?php echo OCTO_PRINT_DESIGNER_URL ?>public/img/more_options.svg" alt="more_options">
            </button> -->
        </td>
        <td class="opd-hidden-mobile">
            <?php //include OCTO_PRINT_DESIGNER_PATH . 'public/partials/toggle.php'; ?>
        </td>
    </tr>
</template>

<!-- Add to Cart Modal -->
<template id="opd-add-to-cart-modal">
    <div class="designer-modal hidden" id="addToCartModal">
        <div class="designer-modal-overlay"></div>
        <div class="designer-modal-content">
            <div class="designer-modal-header">
                <h3><?php esc_html_e('Product Options', 'octo-print-designer'); ?></h3>
                <button type="button" class="designer-modal-close">
                    <img src="<?php echo OCTO_PRINT_DESIGNER_URL . 'public/img/close.svg'; ?>" alt="Close Modal" />
                </button>
            </div>
            <div class="designer-modal-body">
                <!-- Design Preview -->
                <div class="design-preview">
                    <img src="" alt="Design Preview">
                </div>

                <!-- Variation Selection -->
                <div class="form-group">
                    <label><?php esc_html_e('Color', 'octo-print-designer'); ?></label>
                    <div class="variations-list"></div>
                </div>

                <!-- Size Selection -->
                <div class="form-group">
                    <label><?php esc_html_e('Size', 'octo-print-designer'); ?></label>
                    <select class="size-select"></select>
                </div>

                <!-- Price Display -->
                <div class="price-display">
                    <span class="price-label"><?php esc_html_e('Price:', 'octo-print-designer'); ?></span>
                    <span class="price-value"></span>
                </div>
            </div>
            <div class="designer-modal-footer">
                <button type="button" class="designer-action-button designer-modal-cancel">
                    <?php esc_html_e('Cancel', 'octo-print-designer'); ?>
                </button>
                <button type="button" class="designer-action-button designer-modal-save">
                    <?php esc_html_e('Add to Cart', 'octo-print-designer'); ?>
                </button>
            </div>
        </div>
    </div>
</template>
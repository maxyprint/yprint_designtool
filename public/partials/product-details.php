<div class="opd-product-details hidden">

    <div class="opd-section">

        <div class="toast-container"></div>

        <h3>product pictures</h3>
        <p>drag and drop to sort the images of your listing</p>

        <div class="gallery-section">

            <div class="gallery-main-container">
                <img class="product-gallery-image" src="https://picsum.photos/200/300">
            </div>

            <div class="gallery-secondary-section">

                <div class="gallery-secondary-container">
                    <img class="product-gallery-image" src="https://picsum.photos/200/300">
                    <img class="product-gallery-image" src="https://picsum.photos/200/300">
                    <img class="product-gallery-image" src="https://picsum.photos/200/300">
                </div>

                <button class="opd-gallery-button upload-image-btn"> 
                    <img class="opd-icon" src="<?php echo OCTO_PRINT_DESIGNER_URL ?>public/img/image.svg" alt="upload-image">
                    upload images
                </button>

                <button class="opd-gallery-button edit-design-btn">
                    <img class="opd-icon" src="<?php echo OCTO_PRINT_DESIGNER_URL ?>public/img/pen.svg" alt="edit-design">
                    edit design
                </button>

            </div>

        </div>

    </div>

    <div class="opd-section">

        <h3>listing details</h3>

        <label>
            Product Title
            <input type="text">
        </label>

        <label>
            Product Description
        </label>

        <?php 
            wp_editor( 'dynamic product' , 'opd-details', [
                'media_buttons' => false,
                'teeny' => true,
                'textarea_rows' => 8
            ] );
        ?>

    </div>
    
    <div class="opd-section">

        <h3>variations & pricing</h3>

        <div class="filter-container">
            <div class="search-simulate">
                <img class="opd-icon" src="<?php echo OCTO_PRINT_DESIGNER_URL ?>public/img/search.svg" alt="filters">
                <input type="text" placeholder=""/>
            </div>
        </div>

        <table class="opd-product-variation-table">
            <thead>
                <th>size</th>
                <th>color</th>
                <th class="opd-hidden-mobile">price</th>
                <th class="opd-hidden-mobile">currency</th>
                <th class="opd-hidden-mobile">profit margin</th>
                <th>offer?</th>
                <th class="opd-hidden-desktop"></th>
            </thead>
            <tbody>
                <tr>
                    <td class="size">XS</td>
                    <td class="color"> <div class="opd-color-displayer"></div> <span>#ffffff</span> </td>
                    <td class="price opd-hidden-mobile">20,00</td>
                    <td class="currency opd-hidden-mobile">EUR</td>
                    <td class="profit opd-hidden-mobile">30%</td>
                    <td class="offer">
                        <?php require OCTO_PRINT_DESIGNER_PATH . 'public/partials/toggle.php'; ?>
                    </td>
                    <td class="opd-hidden-desktop">
                        <button class="opd-icon-btn opd-variation-settings-btn">
                            <img class="opd-icon" src="<?php echo OCTO_PRINT_DESIGNER_URL ?>public/img/more_options.svg" alt="more_options">
                        </button>
                    </td>
                </tr>   
                <tr>
                    <td class="size">XS</td>
                    <td class="color"> <div class="opd-color-displayer"></div> <span>#ffffff</span> </td>
                    <td class="price opd-hidden-mobile">20,00</td>
                    <td class="currency opd-hidden-mobile">EUR</td>
                    <td class="profit opd-hidden-mobile">30%</td>
                    <td class="offer">
                        <?php require OCTO_PRINT_DESIGNER_PATH . 'public/partials/toggle.php'; ?>
                    </td>
                    <td class="opd-hidden-desktop">
                        <button class="opd-icon-btn opd-variation-settings-btn">
                            <img class="opd-icon" src="<?php echo OCTO_PRINT_DESIGNER_URL ?>public/img/more_options.svg" alt="more_options">
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <button class="save-product opd-gallery-button" style="margin-left: auto">
            <img class="opd-icon" src="<?php echo OCTO_PRINT_DESIGNER_URL ?>public/img/save.svg" alt="more_options">
            Save
        </button>

    </div>

</div>

<template id="opd-product-variation-row">
    <tr>
        <td class="size">XS</td>
        <td class="color"> <div class="opd-color-displayer"></div> <span>#ffffff</span> </td>
        <td class="price opd-hidden-mobile">
            <div class="price-display" title="Click to edit">0.00</div>
            <input type="number" class="price-input hidden" step="0.01" min="0" />
        </td>
        <td class="currency opd-hidden-mobile">EUR</td>
        <td class="profit opd-hidden-mobile">
            <div class="profit-display" title="Click to edit">0</div>
            <input type="number" class="profit-input hidden" step="1" min="0" max="100" />
        </td>
        <td class="offer">
            <label class="octo-toggle-switch">
                <input type="checkbox">
                <span class="slider"></span>
            </label>
        </td>
        <td class="opd-hidden-desktop">
            <button class="opd-icon-btn opd-variation-settings-btn">
                <img class="opd-icon" src="<?php echo OCTO_PRINT_DESIGNER_URL ?>public/img/more_options.svg" alt="more_options">
            </button>
        </td>
    </tr>
</template>

<template id="opd-variation-settings-modal">
    <div class="opd-variation-modal">
        <div class="opd-variation-modal-overlay"></div>
        <div class="opd-variation-modal-content">
            <div class="opd-variation-modal-header">
                <h3>Edit Variation</h3>
                <button type="button" class="opd-icon-btn opd-variation-modal-close">
                    <img class="opd-icon" src="<?php echo OCTO_PRINT_DESIGNER_URL ?>public/img/close.svg" alt="Close Modal" />
                </button>
            </div>
            <div class="opd-variation-modal-body">
                <div class="form-group">
                    <label>Size</label>
                    <div class="size-display"></div>
                </div>
                <div class="form-group">
                    <label>Color</label>
                    <div class="color-group">
                        <div class="opd-color-displayer"></div>
                        <span class="color-code"></span>
                    </div>
                </div>
                <div class="form-group">
                    <label>Price</label>
                    <div class="price-group">
                        <input type="number" class="price-input" step="0.01" min="0" />
                        <span class="currency"></span>
                    </div>
                </div>
                <div class="form-group">
                    <label>Profit Margin</label>
                    <div class="profit-group">
                        <input type="number" class="profit-input" step="1" min="0" max="100" />
                        <span>%</span>
                    </div>
                </div>
                <div class="form-group">
                    <label>Offer</label>
                    <label class="octo-toggle-switch">
                        <input type="checkbox">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
        </div>
    </div>
</template>

<template id="opd-product-image-template">
    <div class="gallery-image-container">
        <img class="product-gallery-image" src="" alt="Product Image"/>
        <button class="gallery-image-remove">×</button>
    </div>
</template>
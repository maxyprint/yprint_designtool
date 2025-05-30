<main class="octo-print-designer" data-default-template-id="<?php echo esc_attr($template_id ?? ''); ?>">

    <aside>
        <nav class="designer-nav">
            <ul>
                <li class="designer-nav-item active" data-type="upload"> <img src="<?php echo OCTO_PRINT_DESIGNER_URL . 'public/img/upload.svg'; ?>" alt="Upload Icon" />Library</li>
                <li class="designer-nav-item" data-type="library"> <img src="<?php echo OCTO_PRINT_DESIGNER_URL . 'public/img/library.svg'; ?>" alt="Library Icon" />Change Product</li>
                <li class="designer-nav-item" data-type="fiverr"> <img src="<?php echo OCTO_PRINT_DESIGNER_URL . 'public/img/fiverr.svg'; ?>" alt="Fiverr Upload Icon" /> Fiverr</li>
            </ul>

            <img class="designer-nav-logo" src="<?php echo OCTO_PRINT_DESIGNER_URL . 'public/img/y-icon.svg'; ?>" alt="YDesign Logo" />
        </nav>
        <div class="designer-item-sections">

            <div class="designer-item-section-content" data-section="upload">
                <div class="upload-zone" id="uploadZone">
                    <div class="upload-zone-content">
                        <img src="<?php echo esc_url(OCTO_PRINT_DESIGNER_URL . 'public/img/upload.svg'); ?>" alt="Upload Icon" />
                        <div class="upload-zone-text">Drop your image here or click to upload</div>
                        <div class="upload-zone-subtext">Supported formats: PNG, JPG - Max size: 5MB</div>
                    </div>
                    <input type="file" 
                           id="uploadInput" 
                           class="upload-input" 
                           accept=".jpg,.jpeg,.png"
                           data-nonce="<?php echo esc_attr(wp_create_nonce('octo_print_designer_upload')); ?>" />
                </div>

                <div class="images-grid-limit">
                    0/<b>25</b>
                </div>

                <div class="images-grid"></div>
            </div>

            <div class="designer-item-section-content hidden" data-section="library">
                <div class="images-grid">
                </div>
            </div>

        </div>
    </aside>

    <section class="designer-editor">

        <div class="designer-canvas-container">
            <canvas id="octo-print-designer-canvas"></canvas>
            <div class="views-toolbar">
            </div>
            <aside class="designer-toolbar">
                <button class="toolbar-btn" id="toggle-print-zone">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M0 0h24v24H0z" fill="none"/><path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h14V5H5zm4 2h3.5a3.5 3.5 0 0 1 0 7H11v3H9V7zm2 2v3h1.5a1.5 1.5 0 0 0 0-3H11z"/></g></svg>
                </button>
            </aside>
        </div>

        <footer>
             <div class="zoom-controls">
                <button data-zoom-type="out">-</button>
                <input type="number" value="100" min="10" max="200" step="10" />
                <button data-zoom-type="in">+</button>
             </div>
            <div class="variations-toolbar">
                <div class="variations-list"></div>
            </div>
            <div class="zoom-level-popup hidden">
                <input type="range" value="100" min="10" max="200" step="10" />
            </div>

            <button class="designer-action-button"> Save product </button>
        </footer>

    </section>

    <!-- Login Required Modal -->
    <div class="designer-modal hidden" id="loginRequiredModal">
        <div class="designer-modal-overlay"></div>
        <div class="designer-modal-content">
            <div class="designer-modal-header">
                <h3><?php esc_html_e('Login Required', 'octo-print-designer'); ?></h3>
            </div>
            <div class="designer-modal-body">
                <p><?php esc_html_e('Please log in to save your product.', 'octo-print-designer'); ?></p>
            </div>
            <div class="designer-modal-footer">
                <a href="<?php echo esc_url(Octo_Print_Designer_Settings::get_login_url()); ?>" 
                   class="designer-action-button designer-modal-save">
                    <?php esc_html_e('Go to Login', 'octo-print-designer'); ?>
                </a>
            </div>
        </div>
    </div>

    <!-- Save Design Modal -->
    <div class="designer-modal hidden" id="saveDesignModal">
        <div class="designer-modal-overlay"></div>
        <div class="designer-modal-content">
            <div class="designer-modal-header">
                <h3><?php esc_html_e('Save Design', 'octo-print-designer'); ?></h3>
                <button type="button" class="designer-modal-close">
                    <img src="<?php echo OCTO_PRINT_DESIGNER_URL . 'public/img/close.svg'; ?>" alt="Close Modal" />
                </button>
            </div>
            <div class="designer-modal-body">
                <div class="form-group">
                    <label for="designName"><?php esc_html_e('Design Name', 'octo-print-designer'); ?></label>
                    <input type="text" 
                        id="designName" 
                        name="design_name" 
                        required 
                        placeholder="<?php esc_attr_e('Enter a name for your design', 'octo-print-designer'); ?>" />
                </div>
                <input type="hidden" id="designId" name="design_id" value="" />
            </div>
            <div class="designer-modal-footer">
                <button type="button" class="designer-action-button designer-modal-cancel">
                    <?php esc_html_e('Cancel', 'octo-print-designer'); ?>
                </button>
                <button type="button" class="designer-action-button designer-modal-save">
                    <?php esc_html_e('Save Design', 'octo-print-designer'); ?>
                </button>
            </div>
        </div>
    </div>

    <div class="toast-container"></div>

</main>

<template id="octo-print-designer-view-button-template">
    <button class="designer-view-button">
        View Name
    </button>
</template>

<template id="octo-print-designer-library-image-template">
    <div class="library-image-item">
        <img class="image-preview" src="https://placecats.com/300/200"/>
        <button>
            <img src="<?php echo OCTO_PRINT_DESIGNER_URL . 'public/img/close.svg'; ?>" alt="Close Icon" />
        </button>
    </div>
</template>

<template id="octo-print-designer-library-item-template">
    <div class="library-item">
        <img class="image-preview" src="https://placecats.com/300/200"/>
        <span>Template Name</span>
    </div>
</template>

<template id="designer-image-toolbar-template">
    <div class="designer-image-toolbar">
        <button type="button" class="toolbar-btn center-image" title="Center Image">
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
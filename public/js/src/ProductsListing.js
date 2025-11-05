import { ProductDetails } from "./ProductDetails";
import { ToastManager } from "./ToastManager";

export class ProductsListing {

    constructor() {
        this.container = document.querySelector('.octo-print-designer-products-listing');
        if (!this.container) return;

        this.productDetails = this.container.querySelector('.opd-product-details');
        this.contextTitle = document.getElementById('opd-context-title');
        this.productsTable = this.container.querySelector('.opd-products-table tbody');
        this.backButton = this.container.querySelector('.opd-back-button');
        this.bulkActionsPopup = document.getElementById('bulk-actions-popup');
        this.toggleActionBtn = this.bulkActionsPopup?.querySelector('.toggle-action');
        this.addToCartModal = null;
        this.currentDesignForCart = null;
        
        // Track selected rows and loaded designs
        this.selectedRows = new Set();
        this.designs = new Map();
        this.filters = {
            search: '',
            inventory: '',
            status: '',
            state: ''
        };

        this.currencySettings = octoPrintDesigner.currency || {
            symbol: '€',
            position: 'right', // can be 'left', 'right', 'left_space', 'right_space'
            decimals: 2,
            separator: ',',
            decimal: '.',
            format: '%v %s' // %v = value, %s = symbol
        };
        
        // Initialize ProductDetails
        this.productDetails = new ProductDetails(this.productDetails, ToastManager);

        // Templates
        this.rowTemplate = document.getElementById('opd-product-listing-item-template');

        window.productsListing = this;
        
        this.toastManager = new ToastManager(this.container.querySelector('.toast-container'));

        this.init();
    }

    async init() {
        
        // Set initial context title
        this.setContextTitle('my products');
        
        // Load initial data
        await this.loadDesigns();
        
        // Check URL parameters for design_id
        const urlParams = new URLSearchParams(window.location.search);
        const designId = urlParams.get('design_id');

        // if (designId && this.designs.has(designId)) {
        //     // Open product details for the specified design
        //     this.handleDesignSettings(this.designs.get(designId));
            
        //     // Update URL without the parameter to prevent reopening on refresh
        //     window.history.replaceState({}, '', window.location.pathname);
        // }

        // Setup event listeners
        this.setupEventListeners();
        this.setupAddToCartModal();
    }

    setupAddToCartModal() {
        // Clone modal template
        const template = document.getElementById('opd-add-to-cart-modal');
        this.addToCartModal = template.content.cloneNode(true).querySelector('.designer-modal');
        document.body.appendChild(this.addToCartModal);

        // Store modal elements
        this.modalPreview = this.addToCartModal.querySelector('.design-preview img');
        this.variationsList = this.addToCartModal.querySelector('.variations-list');
        this.sizeSelect = this.addToCartModal.querySelector('.size-select');
        this.priceDisplay = this.addToCartModal.querySelector('.price-value');
        
        // Setup modal buttons
        const closeBtn = this.addToCartModal.querySelector('.designer-modal-close');
        const cancelBtn = this.addToCartModal.querySelector('.designer-modal-cancel');
        const addToCartBtn = this.addToCartModal.querySelector('.designer-modal-save');
        const overlay = this.addToCartModal.querySelector('.designer-modal-overlay');

        closeBtn.addEventListener('click', () => this.hideAddToCartModal());
        cancelBtn.addEventListener('click', () => this.hideAddToCartModal());
        overlay.addEventListener('click', () => this.hideAddToCartModal());
        addToCartBtn.addEventListener('click', () => this.handleAddToCart());

        // Setup variation and size change handlers
        this.variationsList.addEventListener('click', (e) => {
            const button = e.target.closest('.variation-button');
            if (button) {
                this.handleVariationChange(button.dataset.variationId);
            }
        });

        this.sizeSelect.addEventListener('change', () => this.updatePrice());
    }

    showAddToCartModal(design) {
        this.currentDesignForCart = design;
        
        // Load design preview
        const previewImage = JSON.parse(design.product_images)[0]?.url;
        if (previewImage) {
            this.modalPreview.src = previewImage;
        }

        // Load variations
        this.loadVariations(design.template_variations);

        // Load sizes
        this.loadSizes(design.template_sizes);

        // Add physical dimensions display if not already present
        if (!this.physicalDimensionsDisplay) {
            this.physicalDimensionsDisplay = document.createElement('div');
            this.physicalDimensionsDisplay.className = 'physical-dimensions-display';
            
            // Find the price display - it might have different class names in different templates
            const priceDisplay = this.addToCartModal.querySelector('.price-value');
            if (priceDisplay && priceDisplay.parentNode) {
                // Insert before the price display's parent element
                priceDisplay.parentNode.insertBefore(this.physicalDimensionsDisplay, priceDisplay);
            } else {
                // Fallback: append to the modal content
                const modalContent = this.addToCartModal.querySelector('.designer-modal-content');
                if (modalContent) {
                    // Insert it after the size select but before the buttons
                    const sizeContainer = this.sizeSelect.parentNode;
                    if (sizeContainer && sizeContainer.nextElementSibling) {
                        modalContent.insertBefore(this.physicalDimensionsDisplay, sizeContainer.nextElementSibling);
                    } else {
                        // Last resort: just append to the modal content
                        modalContent.appendChild(this.physicalDimensionsDisplay);
                    }
                }
            }
            
            // Add some style
            this.physicalDimensionsDisplay.style.margin = '15px 0';
            this.physicalDimensionsDisplay.style.fontStyle = 'italic';
            this.physicalDimensionsDisplay.style.color = '#555';
        }

        // Show modal
        this.addToCartModal.classList.remove('hidden');
        
        // Calculate initial price and dimensions
        this.updatePrice();
    }

    displayPhysicalDimensions(widthCm, heightCm) {
        if (!this.physicalDimensionsDisplay) {
            // Create element if it doesn't exist yet (shouldn't happen normally)
            this.physicalDimensionsDisplay = document.createElement('div');
            this.physicalDimensionsDisplay.className = 'physical-dimensions-display';
            this.physicalDimensionsDisplay.style.margin = '15px 0';
            this.physicalDimensionsDisplay.style.fontStyle = 'italic';
            this.physicalDimensionsDisplay.style.color = '#555';
            
            // Try to add it to the modal
            const modalContent = this.addToCartModal.querySelector('.designer-modal-content');
            if (modalContent) {
                modalContent.appendChild(this.physicalDimensionsDisplay);
            }
        }
        
        // Format the dimensions with 1 decimal place
        const formattedWidth = widthCm.toFixed(1);
        const formattedHeight = heightCm.toFixed(1);
        
        // Display the dimensions
        this.physicalDimensionsDisplay.innerHTML = `
            <span style="font-weight: 500;">📏 Physical Size:</span> ${formattedWidth}cm × ${formattedHeight}cm
        `;
    }

    loadVariations(variations) {
        this.variationsList.innerHTML = '';
        
        Object.entries(variations).forEach(([id, variation]) => {
            const button = document.createElement('button');
            button.className = 'variation-button';
            button.dataset.variationId = id;
            
            // Get the correct color from the variation
            // The color could be in different properties depending on the data structure
            let variationColor = '';
            
            // Try different possible color properties
            if (variation.color_code) {
                variationColor = variation.color_code;
            } else if (variation.color) {
                variationColor = variation.color;
            } else if (typeof variation === 'string') {
                // In case variation is just a color string
                variationColor = variation;
            }
            
            // Set the background color and ensure it's applied
            if (variationColor) {
                button.style.backgroundColor = variationColor;
                // Add !important to override any potential CSS issues
                button.style.setProperty('background-color', variationColor, 'important');
            }
            
            // Add a console log to debug
            console.log(`Variation ${id}:`, variation, 'Color applied:', variationColor);
            
            if (variation.is_default) {
                button.classList.add('active');
                this.currentVariation = id;
            }
            
            button.addEventListener('click', () => this.handleVariationChange(id));
            this.variationsList.appendChild(button);
        });
    }

    loadSizes(sizes) {
        this.sizeSelect.innerHTML = '<option value="">Select a size</option>';
        
        sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size.id;
            option.textContent = size.name;
            this.sizeSelect.appendChild(option);
        });
    }

    handleVariationChange(variationId) {
        // Update selected variation
        this.variationsList.querySelectorAll('.variation-button')
            .forEach(btn => btn.classList.toggle('active', btn.dataset.variationId === variationId));
        
        this.currentVariation = variationId;
        
        // Update price and dimensions display
        this.updatePrice();
    }

    updatePrice() {
        const size = this.sizeSelect.value;
        const variation = this.currentVariation;
        
        if (!size || !variation || !this.currentDesignForCart) {
            this.priceDisplay.textContent = '';
            if (this.physicalDimensionsDisplay) {
                this.physicalDimensionsDisplay.innerHTML = '';
            }
            return;
        }
    
        // Get design data
        const designData = JSON.parse(this.currentDesignForCart.design_data);
        if (!designData?.variationImages) {
            this.priceDisplay.textContent = this.formatPrice(0);
            if (this.physicalDimensionsDisplay) {
                this.physicalDimensionsDisplay.innerHTML = '';
            }
            return;
        }
    
        // Track maximum dimensions across all images and views
        let maxWidth = 0;
        let maxHeight = 0;
        
        // Get template data
        const template = this.currentDesignForCart;
        const templateId = template.template_id;
        const variations = template.template_variations || {};
        const variationData = variations[variation] || {};
        const views = variationData.views || {};
        
        // Get physical dimensions from template
        const physicalWidth = template.physical_width_cm || 30; // Default 30cm 
        const physicalHeight = template.physical_height_cm || 40; // Default 40cm
        
        // Loop through all variation images to find maximum dimensions
        Object.entries(designData.variationImages).forEach(([key, value]) => {
            if (key.startsWith(variation + '_')) {
                // Get view ID from key
                const [_, viewId] = key.split('_');
                
                // Get view settings
                const view = views[viewId] || {};
                
                // Get safe zone dimensions for this view
                const safeZoneWidth = view.safeZone?.width || 800;
                const safeZoneHeight = view.safeZone?.height || 500;
                
                // Handle both old (object) and new (array) formats
                const imageArray = Array.isArray(value) ? value : [value];
                
                // Check each image in this view
                imageArray.forEach(imageData => {
                    if (!imageData || !imageData.transform) return;
                    
                    // Calculate dimensions considering scaling
                    const width = (imageData.transform.width || 200) * (imageData.transform.scaleX || 1);
                    const height = (imageData.transform.height || 200) * (imageData.transform.scaleY || 1);
                    
                    // Get constrained dimensions based on safe zone
                    const constrainedWidth = Math.min(width, safeZoneWidth);
                    const constrainedHeight = Math.min(height, safeZoneHeight);
                    
                    // Update maximum dimensions
                    maxWidth = Math.max(maxWidth, constrainedWidth);
                    maxHeight = Math.max(maxHeight, constrainedHeight);
                });
            }
        });
        
        // Calculate physical dimensions using proportions
        // Use the largest safe zone dimensions across all views for calculation
        let maxSafeZoneWidth = 0;
        let maxSafeZoneHeight = 0;
        
        Object.values(views).forEach(view => {
            if (view.safeZone) {
                maxSafeZoneWidth = Math.max(maxSafeZoneWidth, view.safeZone.width || 0);
                maxSafeZoneHeight = Math.max(maxSafeZoneHeight, view.safeZone.height || 0);
            }
        });
        
        // Default if no valid safe zone was found
        if (maxSafeZoneWidth === 0) maxSafeZoneWidth = 800;
        if (maxSafeZoneHeight === 0) maxSafeZoneHeight = 500;
        
        // Calculate physical dimensions
        const widthCm = (maxWidth / maxSafeZoneWidth) * physicalWidth;
        const heightCm = (maxHeight / maxSafeZoneHeight) * physicalHeight;
        
        // Display physical dimensions
        this.displayPhysicalDimensions(widthCm, heightCm);
        
        // Get pricing rules from template
        const pricingRules = this.currentDesignForCart.template_pricing_rules || [];
    
        // Find applicable price rule
        let price = 0;
        
        // Sort rules by size ascending
        const sortedRules = [...pricingRules].sort((a, b) => 
            (a.width * a.height) - (b.width * b.height)
        );
    
        // Find first rule that fits our dimensions
        for (const rule of sortedRules) {
            if (widthCm <= rule.width && heightCm <= rule.height) {
                price = parseFloat(rule.price);
                break;
            }
        }
        
        // If no rule matches, use the largest rule's price
        if (price === 0 && sortedRules.length > 0) {
            const largestRule = sortedRules[sortedRules.length - 1];
            price = parseFloat(largestRule.price);
        }
    
        // Update price display
        this.priceDisplay.textContent = this.formatPrice(price);
    
        // Store the calculated price for use when adding to cart
        this.currentPrice = price;
    }

    formatPrice(price) {
        // Convert to float and fix decimals
        const value = parseFloat(price).toFixed(this.currencySettings.decimals);
        
        // Add thousand separator
        const parts = value.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.currencySettings.separator);
        const formattedValue = parts.join(this.currencySettings.decimal);

        // Position the currency symbol according to settings
        let formatted;
        switch (this.currencySettings.position) {
            case 'left':
                formatted = this.currencySettings.symbol + formattedValue;
                break;
            case 'right':
                formatted = formattedValue + this.currencySettings.symbol;
                break;
            case 'left_space':
                formatted = this.currencySettings.symbol + ' ' + formattedValue;
                break;
            case 'right_space':
                formatted = formattedValue + ' ' + this.currencySettings.symbol;
                break;
            default:
                formatted = formattedValue + ' ' + this.currencySettings.symbol;
        }

        return formatted;
    }

    async handleAddToCart() {
        const size = this.sizeSelect.value;
        const variation = this.currentVariation;

        if (!size) {
            this.toastManager.show('Please select a size', 'error');
            return;
        }

        if (!variation) {
            this.toastManager.show('Please select a color', 'error');
            return;
        }

        try {
            const response = await fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'add_to_cart',
                    nonce: octoPrintDesigner.nonce,
                    design_id: this.currentDesignForCart.id,
                    variation_id: variation,
                    size_id: size
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.toastManager.show('Added to cart!', 'success');
                this.hideAddToCartModal();

                try{
                    elementorProFrontend.modules.popup.showPopup( { id: 3626 } );
                }catch(e){
                }
                
                // if (data.data.redirect_to_cart) {
                //     window.location.href = data.data.cart_url;
                // }
            } else {
                throw new Error(data.data.message || 'Error adding to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.toastManager.show(
                'Failed to add to cart. Please try again.',
                'error',
                { duration: null }
            );
        }
    }

    hideAddToCartModal() {
        this.addToCartModal.classList.add('hidden');
        this.currentDesignForCart = null;
    }

    setupEventListeners() {
        // Setup back button
        this.backButton.addEventListener('click', () => this.handleBack());
        // Handle row selectionF
        this.productsTable.addEventListener('change', (e) => {
            if (e.target.matches('input[type="checkbox"]')) {
                const row = e.target.closest('tr');
                this.handleRowSelection(row, e.target.checked);
            }
        });

        // Handle bulk select in header
        const headerCheckbox = this.container.querySelector('thead input[type="checkbox"]');
        if (headerCheckbox) {
            headerCheckbox.addEventListener('change', (e) => {
                const checkboxes = this.productsTable.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                    this.handleRowSelection(checkbox.closest('tr'), e.target.checked);
                });
            });
        }

        // Setup bulk actions
        const bulkSettingsBtn = this.container.querySelector('.bulk-settings-btn');
        const bulkActionsPopup = document.getElementById('bulk-actions-popup');
        
        bulkSettingsBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.updateToggleAction();
            
            const rect = bulkSettingsBtn.getBoundingClientRect();
            this.bulkActionsPopup.style.top = `210px`;
            this.bulkActionsPopup.style.right = `70px`;
            this.bulkActionsPopup.classList.toggle('hidden');
        });

        // Handle bulk actions
        const bulkActions = this.bulkActionsPopup?.querySelectorAll('.bulk-action');
        bulkActions?.forEach(action => {
            action.addEventListener('click', () => this.handleBulkAction(action.dataset.action));
        });

        // Setup filters
        const filterBtn = this.container.querySelector('.filter-btn');
        const filtersPopup = document.getElementById('filters-popup');
        
        filterBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = filterBtn.getBoundingClientRect();
            filtersPopup.style.top = `150px`;
            filtersPopup.style.right = `40px`;
            filtersPopup.classList.toggle('hidden');
        });

        // Handle filter actions
        const filterApplyBtn = filtersPopup?.querySelector('.filter-apply');
        const filterResetBtn = filtersPopup?.querySelector('.filter-reset');
        
        filterApplyBtn?.addEventListener('click', () => this.applyFilters());
        filterResetBtn?.addEventListener('click', () => this.resetFilters());

        // Handle search input
        const searchInput = this.container.querySelector('.search-simulate input');
        let searchTimeout;
        
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filters.search = e.target.value.toLowerCase();
                this.filterDesigns();
            }, 300);
        });

        // Close popups when clicking outside
        document.addEventListener('click', () => {
            bulkActionsPopup?.classList.add('hidden');
            filtersPopup?.classList.add('hidden');
        });

        // Prevent popup close when clicking inside
        bulkActionsPopup?.addEventListener('click', e => e.stopPropagation());
        filtersPopup?.addEventListener('click', e => e.stopPropagation());
    }

    handleRowSelection(row, isSelected) {
        if (isSelected) {
            row.classList.add('selected');
            this.selectedRows.add(row.dataset.designId);
        } else {
            row.classList.remove('selected');
            this.selectedRows.delete(row.dataset.designId);
        }

        // Update toggle action if bulk actions popup is visible
        if (!this.bulkActionsPopup?.classList.contains('hidden')) {
            this.updateToggleAction();
        }
    }

    updateToggleAction() {
        if (!this.toggleActionBtn || this.selectedRows.size === 0) return;

        // Get the first selected design
        const firstDesignId = Array.from(this.selectedRows)[0];
        const firstDesign = this.designs.get(firstDesignId);

        if (firstDesign) {
            const isEnabled = firstDesign.is_enabled != 0;
            const action = isEnabled ? 'disable' : 'enable';
            const text = isEnabled ? 'Disable Selected' : 'Enable Selected';
            const iconName = isEnabled ? 'disable' : 'enable';

            this.toggleActionBtn.dataset.action = action;
            this.toggleActionBtn.querySelector('span').textContent = text;
            this.toggleActionBtn.querySelector('img').src = 
                `${octoPrintDesigner.pluginUrl}public/img/${iconName}.svg`;
            this.toggleActionBtn.querySelector('img').alt = iconName;
        }
    }

    setContextTitle(title) {
        if (this.contextTitle) {
            this.contextTitle.textContent = title;
        }
    }

    async loadDesigns() {
        try {
            const response = await fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'get_user_designs',
                    nonce: octoPrintDesigner.nonce
                })
            });
    
            if (!response.ok) throw new Error('Network response was not ok');
    
            const data = await response.json();
            
            if (data.success) {
                this.designs.clear();
                data.data.designs.forEach(design => {
                    // Ensure template data is available
                    if (design.template_data && design.template_data.in_stock !== undefined) {
                        design.in_stock = design.template_data.in_stock === '1';
                    }
                    this.designs.set(design.id, design);
                });
                this.filterDesigns();
            } else {
                throw new Error(data.data.message || 'Error loading designs');
            }
        } catch (error) {
            console.error('Error loading designs:', error);
            this.toastManager.show('Error loading designs', 'error', { duration: null });
        }
    }    

    filterDesigns() {
        const filteredDesigns = Array.from(this.designs.values()).filter(design => {
            // Search filter
            if (this.filters.search) {
                const searchString = this.filters.search.toLowerCase();
                const nameMatch = design.name.toLowerCase().includes(searchString);
                const productNameMatch = design.product_name.toLowerCase().includes(searchString);
                if (!nameMatch && !productNameMatch) return false;
            }

            // Inventory filter
            if (this.filters.inventory && design.inventory_status !== this.filters.inventory) {
                return false;
            }

            // Status filter
            if (this.filters.status && design.product_status !== this.filters.status) {
                return false;
            }

            // State filter
            if (this.filters.state !== '' && design.is_enabled !== (this.filters.state === '1')) {
                return false;
            }

            return true;
        });

        this.renderDesigns(filteredDesigns);
    }

    renderDesigns(designs = null) {
        this.productsTable.innerHTML = '';
        
        const designsToRender = designs || Array.from(this.designs.values());
        designsToRender.forEach(design => {
            const row = this.createDesignRow(design);
            this.productsTable.appendChild(row);
        });
    }

    createDesignRow(design) {
        const template = this.rowTemplate.content.cloneNode(true);
        const row = template.querySelector('tr');
        
        // Store design ID in the row
        row.dataset.designId = design.id;
        
        // Fill in design data
        const designData = JSON.parse(design.design_data);
        
        // Set all design names (mobile and desktop)
        const designNames = row.querySelectorAll('.design-name');
        designNames.forEach(element => element.textContent = design.name);

        // Set product name if available
        const productNames = row.querySelectorAll('.product-name');
        productNames.forEach(element => element.textContent = design.template_name || '(No product name)');

        // Set the main preview image and mobile touch handling
        const previewCell = row.querySelector('.design-preview');
        const previewImage = previewCell.querySelector('.image-preview');
        const mobileOptions = previewCell.querySelector('.opd-mobile-options');

        const productImages = JSON.parse(design.product_images);

        if( productImages && productImages.length > 0 ) previewImage.src = productImages[0].url;

        // Handle mobile preview click
        previewImage.addEventListener('click', (e) => {
            // Only handle on mobile
            if (window.innerWidth > 768) return;
            
            e.stopPropagation();
            
            // Hide any other open mobile options
            const allMobileOptions = this.productsTable.querySelectorAll('.opd-mobile-options');
            allMobileOptions.forEach(options => {
                if (options !== mobileOptions) {
                    options.classList.add('hidden');
                }
            });

            // Toggle this mobile options
            mobileOptions.classList.toggle('hidden');
        });

        // Close mobile options when clicking outside
        document.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                mobileOptions?.classList.add('hidden');
            }
        });

        // Prevent options close when clicking inside
        mobileOptions?.addEventListener('click', e => e.stopPropagation());

        // Set status elements
        const statusElements = row.querySelectorAll('.design-status');
        statusElements.forEach(element => {
            if( design.product_status && design.product_status != '' ){
                element.textContent = design.product_status;
                element.classList.add(design.product_status);
            }
            element.classList.add('hidden');
        });

        // Set inventory status
        const inventoryElements = row.querySelectorAll('.design-inventory');
        const inventoryText = design.in_stock ? 'in stock' : 'out of stock';
        inventoryElements.forEach(element => {
            element.textContent = inventoryText;
            element.classList.add(design.inventory_status);
        });

        // Handle settings button clicks
        const settingsButtons = row.querySelectorAll('.opd-settings-btn');
        settingsButtons.forEach(button => {
            button.addEventListener('click', () => this.handleDesignSettings(design));
        });

        // Set design enabled state
        const toggleInputs = row.querySelectorAll('.octo-toggle-switch input');
        toggleInputs.forEach(input => {
            input.checked = design.is_enabled != 0;
            input.addEventListener('change', (e) => {
                this.handleDesignToggle(design.id, e.target.checked);
            });
        });

        const addToCartBtn = row.querySelector('.buy-product');
        addToCartBtn.addEventListener('click', () => this.showAddToCartModal(design));
        
        return row;
    }

    async handleDesignToggle(designId, enabled) {
        try {
            const response = await this.handleBulkAction(enabled ? 'enable' : 'disable', [designId]);
    
            // Update local data
            const design = this.designs.get(designId);
            if (design) {
                design.is_enabled = enabled;
                this.designs.set(designId, design);
            }
        } catch (error) {
            console.error('Error toggling design:', error);
            // this.toastManager.show(
            //     `Failed to ${enabled ? 'enable' : 'disable'} design. Try again`,
            //     'error'
            // );
            // Revert the toggle
            const input = this.productsTable.querySelector(`tr[data-design-id="${designId}"] .octo-toggle-switch input`);
            if (input) input.checked = !enabled;
        }
    }

    async handleBulkAction(action, designIds = null) {
        // If no specific designIds provided, use selected rows
        const ids = designIds || Array.from(this.selectedRows);
        
        if (ids.length === 0) {
            this.toastManager.show('Please select at least one design', 'info');
            return;
        }
    
        // Only confirm for bulk actions or deletions
        if (!designIds || action === 'delete') {
            const confirmed = await this.confirmBulkAction(action, ids.length);
            if (!confirmed) return;
        }
    
        try {
            let endpoint = '';
            let params = {
                nonce: octoPrintDesigner.nonce,
                design_ids: ids.join(',')
            };
    
            switch (action) {
                case 'enable':
                case 'disable':
                    endpoint = 'bulk_toggle_designs';
                    params.enabled = action === 'enable' ? '1' : '0';
                    break;
                case 'delete':
                    endpoint = 'bulk_delete_designs';
                    break;
                default:
                    throw new Error('Invalid action');
            }
    
            const response = await fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: endpoint,
                    ...params
                })
            });
    
            if (!response.ok) throw new Error('Network response was not ok');
    
            const data = await response.json();
            
            if (data.success) {
                // Update local state based on action
                if (action === 'delete') {
                    // Remove deleted designs from the Map
                    ids.forEach(id => this.designs.delete(id));
                    this.toastManager.show('Designs deleted successfully', 'success');
                } else {
                    // Update enabled state
                    const newState = action === 'enable';
                    ids.forEach(id => {
                        const design = this.designs.get(id);
                        if (design) {
                            design.is_enabled = newState;
                            this.designs.set(id, design);
                        }
                    });
                    this.toastManager.show(
                        `Designs ${action}d successfully`,
                        'success'
                    );
                }
    
                // Refresh the view
                this.filterDesigns();
                
                // Hide popup and clear selections for bulk actions
                if (!designIds) {
                    document.getElementById('bulk-actions-popup').classList.add('hidden');
                    this.selectedRows.clear();
                }
            } else {
                this.toastManager.show(
                    `Failed to perform ${action}. Try again`,
                    'error',
                    { duration: null }
                );
                throw new Error(data.data.message || `Error performing ${action}`);
            }
        } catch (error) {
            console.error(`Error performing ${action}:`, error);
            throw error; // Re-throw to handle in the calling function
        }
    }

    handleDesignSettings(design) {
        if (!design) return;
    
        // Hide products list and show product details
        const productsTable = this.container.querySelector('.opd-section');
        productsTable.classList.toggle('hidden', true);
        this.productDetails.container.classList.toggle('hidden', false);
        this.backButton.classList.toggle('hidden', false);
    
        // Update context title with design name
        this.setContextTitle(design.name);
    
        // Pass the design to ProductDetails instance
        this.productDetails.loadDesign(design);
    }

    handleBack() {
        // Show products list and hide product details
        const productsTable = this.container.querySelector('.opd-section');
        productsTable.classList.toggle('hidden', false);
        this.productDetails.container.classList.toggle('hidden', true);
        this.backButton.classList.toggle('hidden', true);

        // Reset context title
        this.setContextTitle('my products');
    }

    confirmBulkAction(action, count) {
        const messages = {
            delete: count === 1 
                ? 'Are you sure you want to delete this design?' 
                : `Are you sure you want to delete ${count} designs?`,
            disable: count === 1
                ? 'Are you sure you want to disable this design?'
                : `Are you sure you want to disable ${count} designs?`,
            enable: count === 1
                ? 'Are you sure you want to enable this design?'
                : `Are you sure you want to enable ${count} designs?`
        };
    
        return confirm(messages[action] || 'Are you sure you want to proceed?');
    }

    applyFilters() {
        // Get values from filter inputs
        const filtersPopup = document.getElementById('filters-popup');
        
        this.filters.inventory = filtersPopup.querySelector('[name="inventory_filter"]').value;
        this.filters.status = filtersPopup.querySelector('[name="status_filter"]').value;
        this.filters.state = filtersPopup.querySelector('[name="state_filter"]').value;

        // Apply filters
        this.filterDesigns();
        
        // Hide popup
        filtersPopup.classList.add('hidden');
    }

    resetFilters() {
        // Reset filter values
        const filtersPopup = document.getElementById('filters-popup');
        
        filtersPopup.querySelectorAll('select').forEach(select => {
            select.value = '';
        });

        // Clear filters object
        this.filters = {
            search: this.filters.search, // Maintain search
            inventory: '',
            status: '',
            state: ''
        };

        // Re-render with cleared filters
        this.filterDesigns();
        
        // Hide popup
        filtersPopup.classList.add('hidden');
    }
}
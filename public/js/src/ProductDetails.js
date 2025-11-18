import { ToastManager } from "./ToastManager";

export class ProductDetails {
    constructor(container) {
        this.container = container;
        this.variationModal = null;
        this.activeVariationRow = null;
        this.hasUnsavedChanges = false;
        this.unsavedChanges = new Set();
        this.originalVariationRows = new Set();
        if (!this.container) return;
        
        this.toastManager = new ToastManager(this.container.querySelector('.toast-container'));

        this.storeElementReferences();
        this.init();
    }

    storeElementReferences() {
        // Store references to main sections
        this.contextTitle = document.getElementById('opd-context-title');
        this.titleInput = this.container.querySelector('input[type="text"]');
        this.descriptionEditor = this.container.querySelector('#opd-details');
        this.galleryContainer = this.container.querySelector('.gallery-section');
        this.mainImageContainer = this.galleryContainer.querySelector('.gallery-main-container');
        this.mainImage = this.galleryContainer.querySelector('.gallery-main-container img');
        this.secondaryImagesContainer = this.galleryContainer.querySelector('.gallery-secondary-container');
        
        // Store buttons
        this.uploadImagesButton = this.galleryContainer.querySelector('.opd-gallery-button.upload-image-btn');
        this.editDesignButton = this.galleryContainer.querySelector('.opd-gallery-button.edit-design-btn');
        this.saveButton = this.container.querySelector('.save-product');

        // Store variations section
        this.variationsContainer = this.container.querySelector('.opd-product-variation-table tbody');
        this.variationSearch = this.container.querySelector('.filter-container input');
    }

    init() {
        this.container.classList.add('hidden');
        this.setupEventListeners();
        this.setupVariationModal();

        this.setupUnsavedChangesIndicator();
        this.setupSaveButton();
    }

    setupSaveButton() {
        this.saveButton?.addEventListener('click', () => this.saveChanges());

        // Track changes
        this.titleInput.addEventListener('input', () => this.markAsUnsaved());
        
        // Track tinymce changes
        if (window.tinymce) {
            const editor = window.tinymce.get('opd-details');
            if (editor) {
                editor.on('change', () => this.markAsUnsaved());
            }
        }
    }

    setupUnsavedChangesIndicator() {
        // Create top bar indicator
        this.indicator = document.createElement('div');
        this.indicator.className = 'unsaved-changes-indicator';
        this.container.prepend(this.indicator);
    }
    
    markAsUnsaved(section = 'general') {
        this.unsavedChanges.add(section);
        this.updateUnsavedState();
    }

    updateUnsavedState() {
        const hasChanges = this.unsavedChanges.size > 0;
        
        // Update title
        this.contextTitle.classList.toggle('has-unsaved-changes', hasChanges);
        
        // Update save button
        this.saveButton.classList.toggle('has-changes', hasChanges);
        
        // Update top indicator
        this.indicator.classList.toggle('visible', hasChanges);

    }

    async saveChanges() {
        if (this.unsavedChanges.size == 0) return;

        try {
            // Collect all changed data
            const formData = {
                name: this.currentDesign.name,
                template_id: this.currentDesign.template_id,
                product_name: this.titleInput.value,
                description: window.tinymce?.get('opd-details')?.getContent() || '',
                variations: JSON.stringify(this.collectVariationsData() )
            };

            const response = await fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'save_design',
                    nonce: octoPrintDesigner.nonce,
                    design_id: this.currentDesign.id,
                    ...formData
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.data.message || 'Error saving design');
            }

            // Update local state
            Object.assign(this.currentDesign, formData);

            if (window.productsListing) {
                const design = window.productsListing.designs.get(this.currentDesign.id);
                if (design) {
                    window.productsListing.designs.set(this.currentDesign.id, this.currentDesign);
                    window.productsListing.filterDesigns();
                }
            }
            
            // Reset unsaved state
            this.unsavedChanges.clear();
            this.updateUnsavedState();

            this.toastManager.show('Design saved successfully', 'success');
        } catch (error) {
            console.error('Error saving design:', error);
            this.toastManager.show(
                `Failed to save design. Try again`,
                'error',
                { duration: null }
            );
        }
    }

    collectVariationsData() {
        // Collect all variation data
        const variations = {};
        
        this.variationsContainer.querySelectorAll('tr').forEach(row => {
            const variationId = row.dataset.variationId;
            const sizeId = row.dataset.size;
            
            if (!variations[variationId]) {
                variations[variationId] = {
                    sizes: {}
                };
            }

            variations[variationId].sizes[sizeId] = {
                price: row.querySelector('.price-input').value,
                profit_margin: row.querySelector('.profit-input').value,
                has_offer: row.querySelector('.octo-toggle-switch input').checked
            };
        });

        return variations;
    }

    setupEventListeners() {
        // Setup edit design button
        this.editDesignButton.addEventListener('click', () => this.handleEditDesign());

        // Setup upload images button
        this.uploadImagesButton.addEventListener('click', () => this.handleUploadImages());

        const searchInput = this.container.querySelector('.filter-container input');
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.filterVariations(e.target.value.toLowerCase());
            }, 300); // Debounce search for better performance
        });

        this.titleInput.addEventListener('input', () => {
            this.markAsUnsaved('title');
        });

        // Description changes
        if (window.tinymce) {
            const editor = window.tinymce.get('opd-details');
            if (editor) {
                editor.on('change', () => {
                    this.markAsUnsaved('description');
                });
            }
        }

        // Variation changes
        this.variationsContainer.addEventListener('change', (e) => {
            if (e.target.matches('.price-input, .profit-input, .octo-toggle-switch input')) {
                const row = e.target.closest('tr');
                if (row) {
                    this.markAsUnsaved('variations');
                }
            }
        });
    }

    filterVariations(searchTerm) {
        const rows = this.variationsContainer.querySelectorAll('tr');
        
        rows.forEach(row => {
            if (!searchTerm) {
                row.classList.remove('hidden');
                return;
            }
    
            const size = row.querySelector('.size').textContent.toLowerCase();
            const color = row.querySelector('.color span').textContent.toLowerCase();
            
            const matches = size.includes(searchTerm) || color.includes(searchTerm);
            row.classList.toggle('hidden', !matches);
        });
    }

    loadDesign(design) {
        // Store the current design data
        this.currentDesign = design;

        // Show the container
        this.container.classList.remove('hidden');

        // Fill basic information
        this.titleInput.value = design.product_name || '';
        
        // Fill description using WordPress editor
        if (window.tinymce) {
            const editor = window.tinymce.get('opd-details');
            if (editor) {
                editor.setContent(design.product_description || '');
            }
        }

        // Load product images
        this.loadProductImages();

        // Load variations
        this.loadVariations();
    }

    loadProductImages() {
        // Clear existing images
        this.mainImageContainer.innerHTML = '';
        this.secondaryImagesContainer.innerHTML = '';
        this.productImages = [];

        try {
            this.productImages = JSON.parse(this.currentDesign.product_images);
        } catch (e) {
            console.error('Error parsing product images:', e);
        }

        if (!this.productImages || this.productImages.length === 0) {
            const placeholder = this.createDraggableImage({
                url: `${octoPrintDesigner.pluginUrl}public/img/placeholder.svg`,
                id: null
            }, 0, true);
            this.mainImageContainer.appendChild(placeholder);
            return;
        }

        // Render all images using the unified system
        this.renderImages();
    }

    renderImages() {
        // Clear containers
        this.mainImageContainer.innerHTML = '';
        this.secondaryImagesContainer.innerHTML = '';

        // Render main image
        if (this.productImages.length > 0) {
            const mainContainer = this.createDraggableImage(this.productImages[0], 0, true);
            this.mainImageContainer.appendChild(mainContainer);
        }

        // Render secondary images
        this.productImages.slice(1).forEach((imageData, index) => {
            const container = this.createDraggableImage(imageData, index + 1, false);
            this.secondaryImagesContainer.appendChild(container);
        });

        // Initialize drag and drop
        this.initializeDragAndDrop();
    }

    createDraggableImage(imageData, index, isMain = false) {
        // Clone the template
        const template = document.getElementById('opd-product-image-template');
        const container = template.content.cloneNode(true).querySelector('.gallery-image-container');
        
        // Set container attributes
        if (isMain) container.classList.add('main-image');
        container.draggable = true;
        container.dataset.index = index;
        container.dataset.imageId = imageData.id || '';
    
        // Set image source
        const img = container.querySelector('.product-gallery-image');
        img.src = imageData.url;
    
        // Setup remove button
        const removeBtn = container.querySelector('.gallery-image-remove');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeImage(index);
        });
    
        // Hide remove button for main image if it's the only image
        if (isMain && this.productImages.length <= 1) {
            removeBtn.remove();
        }

        container.addEventListener('dragstart', (e) => {
            const draggedContainer = e.currentTarget.classList.contains('gallery-main-container') ? 
                e.currentTarget.firstChild : e.currentTarget;
            draggedContainer.classList.add('dragging');
            e.dataTransfer.setData('text/plain', draggedContainer.dataset.index);
        });

        container.addEventListener('dragend', (e) => {
            const draggedContainer = e.currentTarget.classList.contains('gallery-main-container') ? 
                e.currentTarget.firstChild : e.currentTarget;
            draggedContainer.classList.remove('dragging');
        });

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.currentTarget.classList.add('drag-over');
        });

        container.addEventListener('dragleave', (e) => {
            e.currentTarget.classList.remove('drag-over');
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('drag-over');

            const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const targetContainer = e.currentTarget.classList.contains('gallery-main-container') ? 
                e.currentTarget : e.currentTarget.parentNode;
            const targetIndex = parseInt(e.currentTarget.dataset.index);

            this.moveImageToPosition(draggedIndex, targetIndex);
        });
    
        return container;
    }

    initializeDragAndDrop() {
        // const allContainers = [
        //     this.mainImageContainer,
        //     ...Array.from(this.secondaryImagesContainer.children)
        // ];

        // allContainers.forEach(container => {

        //     var clone = container.cloneNode(true); container.replaceWith(clone);

            
        // });
    }

    swapWithMainImage(secondaryIndex) {
        // Get the current main image URL
        const mainImageUrl = this.mainImage.src;
        
        // Get the secondary image URL
        const secondaryImage = this.secondaryImagesContainer.querySelector(`[data-index="${secondaryIndex}"] img`);
        if (!secondaryImage) return;

        // Swap URLs in the productImages array
        const temp = this.productImages[0];
        this.productImages[0] = this.productImages[secondaryIndex];
        this.productImages[secondaryIndex] = temp;

        // Update the display
        this.mainImage.src = secondaryImage.src;
        secondaryImage.src = mainImageUrl;
    }

    moveImageToPosition(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;

        const images = [...this.productImages];
        const [movedImage] = images.splice(fromIndex, 1);
        images.splice(toIndex, 0, movedImage);
        
        this.productImages = images;
        this.renderImages();
        this.saveProductImages();
    }

    async removeImage(index) {
        if (!confirm('Are you sure you want to remove this image?')) return;

        try {
            // Call backend to delete the image
            const response = await fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'delete_product_image',
                    nonce: octoPrintDesigner.nonce,
                    image_id: this.productImages[index].id
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.data.message || 'Error deleting image');
            }

            // Remove from array
            this.productImages.splice(index, 1);

            this.currentDesign.product_images = JSON.stringify(this.productImages);

            // Render images again
            this.renderImages();

            // Save the new order
            await this.saveProductImages();

            this.toastManager.show('Image deleted successfully', 'success');

        } catch (error) {
            console.error('Error deleting image:', error);
            this.toastManager.show(
                `Failed to delete image. Try again`,
                'error',
                { duration: null }
            );
        }
    }

    loadVariations() {

        this.variationsContainer.innerHTML = '';
    
        try {
            // Parse necessary data
            const designData = JSON.parse(this.currentDesign.design_data);
            const templateVariations = this.currentDesign.template_variations;
            const savedVariations = this.currentDesign.variations ? 
                JSON.parse(this.currentDesign.variations) : {};
    
            // Default values for variation data
            const defaultVariationData = {
                price: '0.00',
                currency: 'EUR',
                profit_margin: '0',
                has_offer: false
            };
    
            // Get unique variation IDs from variationImages
            const variationIds = new Set(
                Object.keys(designData.variationImages || {}).map(key => key.split('_')[0])
            );
    
            // For each variation that exists in the design
            variationIds.forEach(variationId => {
                const templateVariation = templateVariations[variationId];
                if (!templateVariation) return;
    
                // Get stored variation data if it exists
                const savedVariationData = savedVariations[variationId]?.sizes || {};
    
                // Get available sizes for this variation
                const availableSizes = templateVariation.available_sizes || [];
    
                // Create a row for each available size
                availableSizes.forEach(sizeId => {
                    // Find size data from template sizes
                    const sizeData = this.currentDesign.template_sizes.find(s => s.id === sizeId);
                    if (!sizeData) return;
    
                    // Get saved data for this variation/size if it exists
                    const savedSizeData = savedVariationData[sizeId] || {};
    
                    const rowData = {
                        variationId,
                        size: sizeId,
                        sizeName: sizeData.name,
                        color: templateVariation.color_code,
                        isEnabled: true,
                        ...defaultVariationData,
                        ...savedSizeData  // Override defaults with saved data
                    };
    
                    const row = this.createVariationRow(rowData);
                    this.variationsContainer.appendChild(row);
                    this.originalVariationRows.add(row);
                });
            });
    
            // Set up editable fields after adding all variations
            this.setupEditableFields();
    
        } catch (e) {
            console.error('Error loading variations:', e);
        }
    }

    resetVariationSearch() {
        const searchInput = this.container.querySelector('.filter-container input');
        searchInput.value = '';
        this.filterVariations('');
    }

    createVariationRow(data) {
        // Clone the template
        const template = document.getElementById('opd-product-variation-row');
        const row = template.content.cloneNode(true).querySelector('tr');
        
        // Set IDs and data attributes
        row.dataset.variationId = data.variationId;
        row.dataset.size = data.size;
        row.dataset.enabled = data.isEnabled;
        
        if (!data.isEnabled) {
            row.classList.add('disabled');
        }
        
        // Fill in the data
        row.querySelector('.size').textContent = data.sizeName;
        row.querySelector('.color span').textContent = data.color || '#ffffff';
    
        // Set up price field
        const priceDisplay = row.querySelector('.price .price-display');
        const priceInput = row.querySelector('.price .price-input');
        priceDisplay.textContent = (data.price || '0.00');
        priceInput.value = (data.price || '0.00');
    
        // Set up profit field
        const profitDisplay = row.querySelector('.profit .profit-display');
        const profitInput = row.querySelector('.profit .profit-input');
        profitDisplay.textContent = `${data.profit_margin || '0'}%`;
        profitInput.value = data.profit_margin || '0';
    
        row.querySelector('.currency').textContent = data.currency || 'EUR';
        row.querySelector('.octo-toggle-switch input').checked = data.has_offer || false;
        
        // Set color displayer background
        const colorDisplayer = row.querySelector('.opd-color-displayer');
        colorDisplayer.style.backgroundColor = data.color || '#ffffff';
        
        const settingsButton = row.querySelector('.opd-variation-settings-btn');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => this.showVariationModal(row));
        }

        return row;
    }

    handleEditDesign() {
        // Construct URL with design ID and redirect
        const designerUrl = new URL(window.location.origin + '/designer');
        designerUrl.searchParams.set('design_id', this.currentDesign.id);
        window.location.href = designerUrl.toString();
    }

    async handleUploadImages() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
    
        input.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            let successCount = 0;
            let errorCount = 0;
            
            for (const file of files) {
                try {
                    // Create FormData for each file
                    const formData = new FormData();
                    formData.append('action', 'upload_product_image');
                    formData.append('nonce', octoPrintDesigner.nonce);
                    formData.append('image', file);
    
                    const response = await fetch(octoPrintDesigner.ajaxUrl, {
                        method: 'POST',
                        body: formData
                    });
    
                    if (!response.ok) throw new Error('Network response was not ok');
    
                    const data = await response.json();
                    
                    if (data.success) {

                        if (this.productImages.length === 0) {
                            this.productImages.push({
                                id: data.data.id,
                                url: data.data.url
                            });
                            this.mainImage.src = data.data.url;
                        } else {
                            // Add to secondary images
                            this.productImages.push({
                                id: data.data.id,
                                url: data.data.url
                            });
                            
                            this.renderImages();
                        }
    
                        this.currentDesign.product_images = JSON.stringify(this.productImages);
                        
                        // Save the updated images array to the design
                        await this.saveProductImages();

                        successCount++;
                        // Handle successful upload...
                    } else {
                        errorCount++;
                        throw new Error(data.data.message || 'Error uploading image');
                    }
                } catch (error) {
                    errorCount++;
                    console.error('Error uploading file:', error);
                }
            }
    
            // Show upload results
            if (successCount > 0) {
                this.toastManager.show(
                    `Successfully uploaded ${successCount} image${successCount !== 1 ? 's' : ''}`,
                    'success'
                );
            }
            if (errorCount > 0) {
                this.toastManager.show(
                    `Failed to upload ${errorCount} image${errorCount !== 1 ? 's' : ''}`,
                    'error',
                    { duration: null }
                );
            }
    
            // Clear the input for future uploads
            input.value = '';
        });
    
        input.click();
    }

    async saveProductImages() {
        try {
            const response = await fetch(octoPrintDesigner.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'update_design_images',
                    nonce: octoPrintDesigner.nonce,
                    design_id: this.currentDesign.id,
                    images: JSON.stringify(this.productImages)
                })
            });
    
            if (!response.ok) throw new Error('Network response was not ok');
    
            const data = await response.json();
            if (!data.success) throw new Error(data.data.message || 'Error saving images');
    
            // Update the parent ProductsListing designs Map
            if (window.productsListing) {
                const design = window.productsListing.designs.get(this.currentDesign.id);
                if (design) {
                    design.product_images = JSON.stringify(this.productImages);
                    window.productsListing.designs.set(this.currentDesign.id, Object.assign({}, design));
                }
            }

            this.toastManager.show('Image order saved successfully', 'success');
        } catch (error) {
            this.toastManager.show(
                `Failed to save image order. Try again`,
                'error',
                { duration: null }
            );
            console.error('Error saving product images:', error);
        }
    }

    setupEditableFields() {
        // Remove any existing listeners first
        if (this._editableFieldsInitialized) return;
        this._editableFieldsInitialized = true;
    
        this.variationsContainer.addEventListener('click', (e) => {
            const priceDisplay = e.target.closest('.price-display');
            const profitDisplay = e.target.closest('.profit-display');
    
            if (priceDisplay) {
                this.startEditing(priceDisplay, 'price');
            } else if (profitDisplay) {
                this.startEditing(profitDisplay, 'profit');
            }
        });
    
        // Handle field editing completion
        document.addEventListener('blur', (e) => {
            if (e.target.matches('.price-input, .profit-input')) {
                this.finishEditing(e.target);
            }
        }, true);
    
        // Handle enter key press
        document.addEventListener('keyup', (e) => {
            if (!e.target.matches('.price-input, .profit-input')) return;
            
            if (e.key === 'Enter') {
                e.target.blur();
            } else if (e.key === 'Escape') {
                this.cancelEditing(e.target);
            }
        }, true);
    }
    
    startEditing(displayElement, type) {
        const row = displayElement.closest('td');
        const input = displayElement.nextElementSibling;
    
        // Hide display, show input
        displayElement.classList.add('hidden');
        input.classList.remove('hidden');
    
        // Set input value from display (removing any currency symbols and % signs)
        const displayValue = displayElement.textContent.trim();
        input.value = type === 'price' ? 
            parseFloat(displayValue.replace(/[^0-9.]/g, '')) :
            parseInt(displayValue);
    
        // Store original value for cancel operation
        input.dataset.originalValue = input.value;
    
        // Focus and select input
        input.focus();
        input.select();
    }
    
    finishEditing(inputElement) {
        const row = inputElement.closest('tr');
        const type = inputElement.classList.contains('price-input') ? 'price' : 'profit';
        const displayElement = row.querySelector(`.${type}-display`);
        const inputContainer = inputElement.closest(`.${type}-input-wrapper`) || inputElement;
    
        // Format and validate the value
        let value = inputElement.value.trim();
        let formattedValue;
    
        if (type === 'price') {
            value = Math.max(0, parseFloat(value) || 0);
            formattedValue = value.toFixed(2);
        } else { // profit
            value = Math.max(0, Math.min(100, parseInt(value) || 0));
            formattedValue = value.toString();
        }
    
        // Update the display
        displayElement.textContent = type === 'price' ? formattedValue : `${formattedValue}%`;
    
        // Show display, hide input
        displayElement.classList.remove('hidden');
        inputContainer.classList.add('hidden');
    
        // Update the data model
        const variationId = row.dataset.variationId;
        const size = row.dataset.size;
        this.updateVariationData(variationId, size, {
            [type]: value
        });

        this.markAsUnsaved('variations');
    }
    
    cancelEditing(inputElement) {
        const row = inputElement.closest('tr');
        const type = inputElement.classList.contains('price-input') ? 'price' : 'profit';
        const displayElement = row.querySelector(`.${type}-display`);
        const inputContainer = inputElement.closest(`.${type}-input-wrapper`) || inputElement;
    
        // Restore original value
        inputElement.value = inputElement.dataset.originalValue;
    
        // Show display, hide input
        displayElement.classList.remove('hidden');
        inputContainer.classList.add('hidden');
    }
    
    updateVariationData(variationId, size, data) {
        // Find the variation in the current design data
        const variation = this.currentDesign.variations?.[variationId];
        if (!variation) return;
    
        // Update the data
        variation.sizes = variation.sizes || {};
        variation.sizes[size] = {
            ...(variation.sizes[size] || {}),
            ...data
        };
    
        // TODO: Call API to update the data in the backend
        console.log('Updated variation data:', {
            variationId,
            size,
            data
        });
    }

    setupVariationModal() {
        const template = document.getElementById('opd-variation-settings-modal');
        this.variationModal = template.content.cloneNode(true).querySelector('.opd-variation-modal');
        document.body.appendChild(this.variationModal);
        this.hideVariationModal();
    
        // Setup close handlers
        const closeBtn = this.variationModal.querySelector('.opd-variation-modal-close');
        const overlay = this.variationModal.querySelector('.opd-variation-modal-overlay');
        
        closeBtn.addEventListener('click', () => this.hideVariationModal());
        overlay.addEventListener('click', () => this.hideVariationModal());
    
        // Setup input sync
        const priceInput = this.variationModal.querySelector('.price-input');
        const profitInput = this.variationModal.querySelector('.profit-input');
        const offerToggle = this.variationModal.querySelector('.octo-toggle-switch input');
    
        priceInput.addEventListener('input', (e) => {
            if (!this.activeVariationRow) return;
            const rowPriceInput = this.activeVariationRow.querySelector('.price-input');
            const rowPriceDisplay = this.activeVariationRow.querySelector('.price-display');
            rowPriceInput.value = e.target.value;
            rowPriceDisplay.textContent = parseFloat(e.target.value).toFixed(2);
        });
    
        profitInput.addEventListener('input', (e) => {
            if (!this.activeVariationRow) return;
            const rowProfitInput = this.activeVariationRow.querySelector('.profit-input');
            const rowProfitDisplay = this.activeVariationRow.querySelector('.profit-display');
            rowProfitInput.value = e.target.value;
            rowProfitDisplay.textContent = `${e.target.value}%`;
        });
    
        offerToggle.addEventListener('change', (e) => {
            if (!this.activeVariationRow) return;
            const rowOfferToggle = this.activeVariationRow.querySelector('.octo-toggle-switch input');
            rowOfferToggle.checked = e.target.checked;
        });
    }
    
    showVariationModal(row) {
        this.activeVariationRow = row;
        
        // Fill modal with row data
        const sizeDisplay = this.variationModal.querySelector('.size-display');
        const colorDisplayer = this.variationModal.querySelector('.opd-color-displayer');
        const colorCode = this.variationModal.querySelector('.color-code');
        const priceInput = this.variationModal.querySelector('.price-input');
        const currencySpan = this.variationModal.querySelector('.currency');
        const profitInput = this.variationModal.querySelector('.profit-input');
        const offerToggle = this.variationModal.querySelector('.octo-toggle-switch input');
    
        sizeDisplay.textContent = row.querySelector('.size').textContent;
        colorDisplayer.style.backgroundColor = row.querySelector('.opd-color-displayer').style.backgroundColor;
        colorCode.textContent = row.querySelector('.color span').textContent;
        priceInput.value = row.querySelector('.price-input').value;
        currencySpan.textContent = row.querySelector('.currency').textContent;
        profitInput.value = row.querySelector('.profit-input').value;
        offerToggle.checked = row.querySelector('.octo-toggle-switch input').checked;
    
        this.variationModal.classList.remove('hidden');
    }
    
    hideVariationModal() {
        this.variationModal.classList.add('hidden');
        this.activeVariationRow = null;
    }
}
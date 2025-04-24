/**
 * YPrint Vectorizer Javascript
 *
 * Handles the frontend functionality for the image vectorization process.
 * 
 * @package YPrint_DesignTool
 */

(function($) {
    'use strict';
    
    // YPrint Vectorizer Class
    var YPrintVectorizer = function(element, options) {
        this.element = element;
        this.$element = $(element);
        this.options = $.extend({}, YPrintVectorizer.DEFAULTS, options);
        this.init();
    };
    
    // Default options
    YPrintVectorizer.DEFAULTS = {
        ajaxUrl: '',
        nonce: '',
        maxUploadSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'],
        onVectorizeSuccess: null,
        onVectorizeError: null
    };
    
    // Initialize the vectorizer
    YPrintVectorizer.prototype.init = function() {
        this.createElements();
        this.setupEventListeners();
    };
    
    // Create UI elements
    YPrintVectorizer.prototype.createElements = function() {
        var self = this;
        
        // Create main container
        this.$container = $('<div class="yprint-vectorizer-container"></div>');
        this.$element.append(this.$container);
        
        // Create upload section
        this.$uploadSection = $('<div class="yprint-vectorizer-section"></div>');
        this.$container.append(this.$uploadSection);
        
        this.$uploadSection.html(
            '<h2>' + this.translate('Upload Image') + '</h2>' +
            '<div class="yprint-upload-area">' +
                '<div class="yprint-upload-icon">📁</div>' +
                '<p>' + this.translate('Drag & drop an image here or click to select') + '</p>' +
                '<input type="file" class="yprint-upload-input" accept="image/*">' +
                '<button type="button" class="yprint-upload-btn">' + 
                    this.translate('Select Image') + 
                '</button>' +
            '</div>'
        );
        
        // Create options section
        this.$optionsSection = $('<div class="yprint-vectorizer-section"></div>');
        this.$container.append(this.$optionsSection);
        
        this.$optionsSection.html(
            '<h2>' + this.translate('Vectorization Options') + '</h2>' +
            '<div class="yprint-options-panel">' +
                '<div class="yprint-option-group">' +
                    '<h3>' + this.translate('Basic Options') + '</h3>' +
                    '<div class="yprint-option">' +
                        '<label for="yprint-detail-level">' + this.translate('Detail Level') + '</label>' +
                        '<select id="yprint-detail-level">' +
                            '<option value="low">' + this.translate('Low (faster, less details)') + '</option>' +
                            '<option value="medium" selected>' + this.translate('Medium') + '</option>' +
                            '<option value="high">' + this.translate('High (slower, more details)') + '</option>' +
                        '</select>' +
                    '</div>' +
                    '<div class="yprint-option">' +
                        '<label for="yprint-color-type">' + this.translate('Color Mode') + '</label>' +
                        '<select id="yprint-color-type">' +
                            '<option value="mono" selected>' + this.translate('Black & White') + '</option>' +
                            '<option value="gray">' + this.translate('Grayscale') + '</option>' +
                            '<option value="color">' + this.translate('Color') + '</option>' +
                        '</select>' +
                    '</div>' +
                '</div>' +
                '<div class="yprint-option-group">' +
                    '<h3>' + this.translate('Advanced Options') + '</h3>' +
                    '<div class="yprint-option">' +
                        '<label>' +
                            '<input type="checkbox" id="yprint-invert">' +
                            this.translate('Invert Colors') +
                        '</label>' +
                    '</div>' +
                    '<div class="yprint-option">' +
                        '<label>' +
                            '<input type="checkbox" id="yprint-remove-background" checked>' +
                            this.translate('Remove Background') +
                        '</label>' +
                    '</div>' +
                    '<div class="yprint-option color-options" style="display:none;">' +
                        '<label for="yprint-colors">' + 
                            this.translate('Number of Colors') + 
                            ' <span id="yprint-colors-value">8</span>' +
                        '</label>' +
                        '<input type="range" id="yprint-colors" min="2" max="16" value="8">' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="yprint-action-buttons">' +
                '<button type="button" id="yprint-vectorize-btn" class="yprint-action-btn yprint-btn-vectorize" disabled>' + 
                    this.translate('Vectorize Image') + 
                '</button>' +
            '</div>'
        );
        
        // Create progress section
        this.$progressSection = $('<div class="yprint-progress"></div>');
        this.$container.append(this.$progressSection);
        
        this.$progressSection.html(
            '<div class="yprint-progress-bar-container">' +
                '<div class="yprint-progress-bar"></div>' +
            '</div>' +
            '<div class="yprint-progress-text">' + this.translate('Processing...') + '</div>'
        );
        
        // Create result section
        this.$resultSection = $('<div class="yprint-result-area yprint-vectorizer-section"></div>');
        this.$container.append(this.$resultSection);
        
        this.$resultSection.html(
            '<h2>' + this.translate('Vectorization Result') + '</h2>' +
            '<div class="yprint-preview-container">' +
                '<div class="yprint-preview-original">' +
                    '<h4 class="yprint-preview-title">' + this.translate('Original Image') + '</h4>' +
                    '<div class="yprint-preview-box" id="yprint-original-preview"></div>' +
                '</div>' +
                '<div class="yprint-preview-vector">' +
                    '<h4 class="yprint-preview-title">' + this.translate('Vectorized (SVG)') + '</h4>' +
                    '<div class="yprint-preview-box" id="yprint-vector-preview"></div>' +
                    '<div class="yprint-vector-stats"></div>' +
                '</div>' +
            '</div>' +
            '<div class="yprint-action-buttons">' +
                '<button type="button" id="yprint-download-btn" class="yprint-action-btn yprint-btn-download">' + 
                    this.translate('Download SVG') + 
                '</button>' +
                '<button type="button" id="yprint-add-btn" class="yprint-action-btn yprint-btn-add">' + 
                    this.translate('Add to Design') + 
                '</button>' +
                '<button type="button" id="yprint-edit-btn" class="yprint-action-btn yprint-btn-edit">' + 
                    this.translate('Edit SVG') + 
                '</button>' +
            '</div>'
        );
        
        // Cache element references
        this.$uploadArea = this.$uploadSection.find('.yprint-upload-area');
        this.$fileInput = this.$uploadSection.find('.yprint-upload-input');
        this.$uploadBtn = this.$uploadSection.find('.yprint-upload-btn');
        this.$detailLevel = this.$optionsSection.find('#yprint-detail-level');
        this.$colorType = this.$optionsSection.find('#yprint-color-type');
        this.$colorOptions = this.$optionsSection.find('.color-options');
        this.$colors = this.$optionsSection.find('#yprint-colors');
        this.$colorsValue = this.$optionsSection.find('#yprint-colors-value');
        this.$invert = this.$optionsSection.find('#yprint-invert');
        this.$removeBackground = this.$optionsSection.find('#yprint-remove-background');
        this.$vectorizeBtn = this.$optionsSection.find('#yprint-vectorize-btn');
        this.$progressBar = this.$progressSection.find('.yprint-progress-bar');
        this.$progressText = this.$progressSection.find('.yprint-progress-text');
        this.$originalPreview = this.$resultSection.find('#yprint-original-preview');
        this.$vectorPreview = this.$resultSection.find('#yprint-vector-preview');
        this.$vectorStats = this.$resultSection.find('.yprint-vector-stats');
        this.$downloadBtn = this.$resultSection.find('#yprint-download-btn');
        this.$addBtn = this.$resultSection.find('#yprint-add-btn');
        this.$editBtn = this.$resultSection.find('#yprint-edit-btn');
    };
    
    // Set up event listeners
    YPrintVectorizer.prototype.setupEventListeners = function() {
        var self = this;
        
        // File input change
        this.$fileInput.on('change', function(e) {
            if (this.files && this.files[0]) {
                self.handleFileSelect(this.files[0]);
            }
        });
        
        // Upload button click
        this.$uploadBtn.on('click', function() {
            self.$fileInput.click();
        });
        
        // Drag and drop
        this.$uploadArea.on('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).addClass('drag-over');
        });
        
        this.$uploadArea.on('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('drag-over');
        });
        
        this.$uploadArea.on('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('drag-over');
            
            var files = e.originalEvent.dataTransfer.files;
            if (files && files[0]) {
                self.handleFileSelect(files[0]);
            }
        });
        
        // Color mode change
        this.$colorType.on('change', function() {
            if ($(this).val() === 'color') {
                self.$colorOptions.show();
            } else {
                self.$colorOptions.hide();
            }
        });
        
        // Color slider change
        this.$colors.on('input', function() {
            self.$colorsValue.text($(this).val());
        });
        
        // Vectorize button click
        this.$vectorizeBtn.on('click', function() {
            self.vectorizeImage();
        });
        
        // Download button click
        this.$downloadBtn.on('click', function() {
            self.downloadSVG();
        });
        
        // Add to design button click
        this.$addBtn.on('click', function() {
            if (typeof self.options.onAddToDesign === 'function') {
                self.options.onAddToDesign(self.svgContent);
            } else {
                alert(self.translate('This feature will be available in a future update.'));
            }
        });
        
        // Edit SVG button click
        this.$editBtn.on('click', function() {
            if (typeof self.options.onEditSVG === 'function') {
                self.options.onEditSVG(self.svgContent);
            } else {
                alert(self.translate('SVG editing will be available in a future update.'));
            }
        });
    };
    
    // Handle file selection
    YPrintVectorizer.prototype.handleFileSelect = function(file) {
        // Reset previous results
        this.$resultSection.hide();
        this.$vectorPreview.empty();
        this.$originalPreview.empty();
        
        // Validate file type
        if (this.options.allowedTypes.indexOf(file.type) === -1) {
            alert(this.translate('Invalid file type. Please upload a valid image.'));
            return;
        }
        
        // Validate file size
        if (file.size > this.options.maxUploadSize) {
            alert(this.translate('File is too large. Maximum size is ') + 
                  Math.round(this.options.maxUploadSize / (1024 * 1024)) + 'MB');
            return;
        }
        
        // Show file preview
        var reader = new FileReader();
        var self = this;
        
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                // Create preview
                self.$originalPreview.html(img);
                
                // Enable vectorize button
                self.$vectorizeBtn.prop('disabled', false);
                
                // Store image info
                self.imageFile = file;
                self.imageWidth = img.naturalWidth;
                self.imageHeight = img.naturalHeight;
            };
            
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    };
    
    // Vectorize the selected image
    YPrintVectorizer.prototype.vectorizeImage = function() {
        if (!this.imageFile) {
            alert(this.translate('Please select an image first.'));
            return;
        }
        
        var self = this;
        
        // Show progress
        this.$progressSection.show();
        this.$progressBar.css('width', '5%');
        this.$progressText.text(this.translate('Preparing...'));
        
        // Get options
        var options = {
            detail_level: this.$detailLevel.val(),
            color_type: this.$colorType.val(),
            colors: this.$colors.val(),
            invert: this.$invert.prop('checked') ? 1 : 0,
            remove_background: this.$removeBackground.prop('checked') ? 1 : 0
        };
        
        // Create form data
        var formData = new FormData();
        formData.append('action', 'yprint_vectorize_image');
        formData.append('nonce', this.options.nonce);
        formData.append('image', this.imageFile);
        
        // Add options to form data
        for (var key in options) {
            formData.append(key, options[key]);
        }
        
        // Send AJAX request
        $.ajax({
            url: this.options.ajaxUrl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function() {
                var xhr = new window.XMLHttpRequest();
                
                // Upload progress
                xhr.upload.addEventListener('progress', function(e) {
                    if (e.lengthComputable) {
                        var percent = Math.round((e.loaded / e.total) * 40);
                        self.$progressBar.css('width', percent + '%');
                        self.$progressText.text(self.translate('Uploading...'));
                    }
                }, false);
                
                return xhr;
            },
            success: function(response) {
                // Processing progress
                self.$progressBar.css('width', '60%');
                self.$progressText.text(self.translate('Processing...'));
                
                setTimeout(function() {
                    self.$progressBar.css('width', '80%');
                    
                    setTimeout(function() {
                        self.$progressBar.css('width', '100%');
                        self.$progressText.text(self.translate('Complete!'));
                        
                        // Hide progress after a delay
                        setTimeout(function() {
                            self.$progressSection.hide();
                            
                            // Process response
                            if (response.success) {
                                self.handleVectorizeSuccess(response.data);
                            } else {
                                self.handleVectorizeError(response.data);
                            }
                        }, 500);
                    }, 400);
                }, 400);
            },
            error: function(xhr, status, error) {
                self.$progressSection.hide();
                self.handleVectorizeError({
                    message: error || self.translate('An error occurred during vectorization.')
                });
            }
        });
    };
    
    // Handle successful vectorization
    YPrintVectorizer.prototype.handleVectorizeSuccess = function(data) {
        // Store SVG content
        this.svgContent = data.svg;
        this.svgUrl = data.file_url;
        
        // Show SVG preview
        this.$vectorPreview.html(data.svg);
        
        // Calculate SVG size and display stats
        var svgSize = this.svgContent.length;
        var svgSizeFormatted = this.formatFileSize(svgSize);
        var compressionRatio = this.imageFile.size > 0 ? 
            Math.round((svgSize / this.imageFile.size) * 100) : 0;
            
        this.$vectorStats.html(
            this.translate('Size') + ': ' + svgSizeFormatted + '<br>' +
            this.translate('Dimensions') + ': ' + this.imageWidth + 'x' + this.imageHeight + 'px<br>' +
            this.translate('Compression') + ': ' + compressionRatio + '%'
        );
        
        // Show result section
        this.$resultSection.show();
        
        // Call success callback if defined
        if (typeof this.options.onVectorizeSuccess === 'function') {
            this.options.onVectorizeSuccess(data);
        }
    };
    
    // Handle vectorization error
    YPrintVectorizer.prototype.handleVectorizeError = function(data) {
        alert(this.translate('Vectorization failed: ') + 
              (data.message || this.translate('Unknown error')));
        
        // Call error callback if defined
        if (typeof this.options.onVectorizeError === 'function') {
            this.options.onVectorizeError(data);
        }
    };
    
    // Download the SVG file
    YPrintVectorizer.prototype.downloadSVG = function() {
        if (!this.svgContent) {
            return;
        }
        
        // Create a blob from the SVG content
        var blob = new Blob([this.svgContent], {type: 'image/svg+xml'});
        var url = window.URL.createObjectURL(blob);
        
        // Create download link
        var a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = this.getFileNameWithoutExtension(this.imageFile.name) + '.svg';
        document.body.appendChild(a);
        
        // Trigger download
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };
    
    // Format file size to human-readable string
    YPrintVectorizer.prototype.formatFileSize = function(bytes) {
        if (bytes < 1024) {
            return bytes + ' B';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + ' KB';
        } else {
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        }
    };
    
    // Get file name without extension
    YPrintVectorizer.prototype.getFileNameWithoutExtension = function(filename) {
        return filename.replace(/\.[^/.]+$/, '');
    };
    
    // Simple translation function
    YPrintVectorizer.prototype.translate = function(text) {
        // In a real implementation, this would use a translation system
        return text;
    };
    
    // jQuery plugin definition
    $.fn.yprintVectorizer = function(options) {
        return this.each(function() {
            if (!$.data(this, 'yprintVectorizer')) {
                $.data(this, 'yprintVectorizer', new YPrintVectorizer(this, options));
            }
        });
    };
    
    // Auto-initialize from data attributes
    $(document).ready(function() {
        $('[data-yprint-vectorizer]').each(function() {
            var $this = $(this);
            var options = $this.data();
            
            $this.yprintVectorizer(options);
        });
    });
    
})(jQuery);
/**
 * 🚀 PNG ENGINE v1.0
 * Advanced PNG processing utilities for YPrint Plugin
 *
 * PURPOSE: High-performance PNG optimization and processing
 * ARCHITECTURE: Standalone engine for plugin use
 */

(function() {
    'use strict';

    console.log('🚀 PNG ENGINE: Loading...');

    /**
     * Advanced PNG Processing Engine
     * Provides optimization and enhancement features
     */
    window.YPrintPNGEngine = {
        version: '1.0.0',

        /**
         * Optimize PNG data for web delivery
         */
        optimizeForWeb(dataURL, options = {}) {
            const defaults = {
                quality: 0.8,
                maxWidth: 1200,
                maxHeight: 1200
            };

            const settings = { ...defaults, ...options };

            return new Promise((resolve, reject) => {
                try {
                    const img = new Image();

                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        // Calculate optimized dimensions
                        const { width, height } = this.calculateOptimalSize(
                            img.width,
                            img.height,
                            settings.maxWidth,
                            settings.maxHeight
                        );

                        canvas.width = width;
                        canvas.height = height;

                        // Draw with optimization
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(img, 0, 0, width, height);

                        const optimizedDataURL = canvas.toDataURL('image/png', settings.quality);

                        console.log(`🚀 PNG ENGINE: Optimized ${img.width}x${img.height} → ${width}x${height}`);

                        resolve({
                            dataURL: optimizedDataURL,
                            originalSize: { width: img.width, height: img.height },
                            optimizedSize: { width, height },
                            compressionRatio: dataURL.length / optimizedDataURL.length
                        });
                    };

                    img.onerror = () => reject(new Error('Failed to load image for optimization'));
                    img.src = dataURL;

                } catch (error) {
                    reject(error);
                }
            });
        },

        /**
         * Calculate optimal size maintaining aspect ratio
         */
        calculateOptimalSize(originalWidth, originalHeight, maxWidth, maxHeight) {
            let width = originalWidth;
            let height = originalHeight;

            // Scale down if necessary
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            return {
                width: Math.round(width),
                height: Math.round(height)
            };
        },

        /**
         * Add watermark to PNG
         */
        addWatermark(dataURL, watermarkText, options = {}) {
            const defaults = {
                position: 'bottom-right',
                opacity: 0.5,
                fontSize: 16,
                color: '#000000'
            };

            const settings = { ...defaults, ...options };

            return new Promise((resolve, reject) => {
                try {
                    const img = new Image();

                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        canvas.width = img.width;
                        canvas.height = img.height;

                        // Draw original image
                        ctx.drawImage(img, 0, 0);

                        // Add watermark
                        ctx.globalAlpha = settings.opacity;
                        ctx.font = `${settings.fontSize}px Arial`;
                        ctx.fillStyle = settings.color;

                        const textMetrics = ctx.measureText(watermarkText);
                        const { x, y } = this.getWatermarkPosition(
                            settings.position,
                            canvas.width,
                            canvas.height,
                            textMetrics.width,
                            settings.fontSize
                        );

                        ctx.fillText(watermarkText, x, y);

                        const watermarkedDataURL = canvas.toDataURL('image/png');

                        console.log('🚀 PNG ENGINE: Watermark added');

                        resolve(watermarkedDataURL);
                    };

                    img.onerror = () => reject(new Error('Failed to load image for watermarking'));
                    img.src = dataURL;

                } catch (error) {
                    reject(error);
                }
            });
        },

        /**
         * Calculate watermark position
         */
        getWatermarkPosition(position, canvasWidth, canvasHeight, textWidth, fontSize) {
            const padding = 20;

            switch (position) {
                case 'top-left':
                    return { x: padding, y: padding + fontSize };
                case 'top-right':
                    return { x: canvasWidth - textWidth - padding, y: padding + fontSize };
                case 'bottom-left':
                    return { x: padding, y: canvasHeight - padding };
                case 'bottom-right':
                    return { x: canvasWidth - textWidth - padding, y: canvasHeight - padding };
                case 'center':
                    return {
                        x: (canvasWidth - textWidth) / 2,
                        y: (canvasHeight + fontSize) / 2
                    };
                default:
                    return { x: canvasWidth - textWidth - padding, y: canvasHeight - padding };
            }
        },

        /**
         * Batch process multiple PNGs
         */
        async batchProcess(dataURLs, processor, options = {}) {
            console.log(`🚀 PNG ENGINE: Batch processing ${dataURLs.length} images...`);

            const results = [];

            for (const [index, dataURL] of dataURLs.entries()) {
                try {
                    console.log(`🚀 PNG ENGINE: Processing image ${index + 1}/${dataURLs.length}`);

                    const result = await processor(dataURL, options);
                    results.push({ success: true, data: result, index });

                } catch (error) {
                    console.error(`❌ PNG ENGINE: Failed to process image ${index + 1}:`, error);
                    results.push({ success: false, error: error.message, index });
                }
            }

            console.log(`✅ PNG ENGINE: Batch processing complete (${results.filter(r => r.success).length}/${dataURLs.length} successful)`);

            return results;
        },

        /**
         * Convert PNG to different formats
         */
        convertFormat(dataURL, format, quality = 0.9) {
            return new Promise((resolve, reject) => {
                try {
                    const img = new Image();

                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        canvas.width = img.width;
                        canvas.height = img.height;

                        // For JPG, add white background
                        if (format === 'jpeg' || format === 'jpg') {
                            ctx.fillStyle = '#FFFFFF';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                        }

                        ctx.drawImage(img, 0, 0);

                        const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
                        const convertedDataURL = canvas.toDataURL(mimeType, quality);

                        console.log(`🚀 PNG ENGINE: Converted to ${format.toUpperCase()}`);

                        resolve(convertedDataURL);
                    };

                    img.onerror = () => reject(new Error('Failed to load image for conversion'));
                    img.src = dataURL;

                } catch (error) {
                    reject(error);
                }
            });
        }
    };

    console.log('✅ PNG ENGINE: Loaded successfully');

})();
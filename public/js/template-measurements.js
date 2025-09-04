/**
 * YPrint Template Measurements - Mobile Responsive Koordinaten-Normalisierung
 */

/**
 * Normalize coordinates for device independence
 * Converts absolute pixel coordinates to relative factors based on reference measurement
 * 
 * @param {number} elementX Element X coordinate in pixels
 * @param {number} elementY Element Y coordinate in pixels
 * @param {number} elementWidth Element width in pixels
 * @param {number} elementHeight Element height in pixels
 * @param {number} referenceDistance Reference measurement distance in pixels
 * @returns {object} Normalized coordinates as factors
 */
function normalizeCoordinatesForDevice(elementX, elementY, elementWidth, elementHeight, referenceDistance) {
    if (!referenceDistance || referenceDistance <= 0) {
        console.warn('YPrint: Referenzdistanz ist ungültig:', referenceDistance);
        return null;
    }
    
    // Konvertiere zu relativen Faktoren
    const normalized = {
        position_x_factor: elementX / referenceDistance,
        position_y_factor: elementY / referenceDistance,
        width_factor: elementWidth / referenceDistance,
        height_factor: elementHeight / referenceDistance
    };
    
    console.log('YPrint: Koordinaten normalisiert:', {
        original: { x: elementX, y: elementY, width: elementWidth, height: elementHeight },
        reference_distance: referenceDistance,
        normalized: normalized
    });
    
    return normalized;
}

/**
 * Denormalize coordinates for specific size
 * Converts relative factors back to absolute coordinates for a specific product size
 * 
 * @param {object} normalizedCoords Normalized coordinates
 * @param {number} referenceDistance Reference measurement distance in pixels
 * @param {number} scaleFactor Scale factor for the target size
 * @returns {object} Denormalized coordinates in pixels
 */
function denormalizeCoordinatesForSize(normalizedCoords, referenceDistance, scaleFactor) {
    if (!normalizedCoords || !referenceDistance || !scaleFactor) {
        console.warn('YPrint: Ungültige Parameter für Denormalisierung');
        return null;
    }
    
    const denormalized = {
        x: normalizedCoords.position_x_factor * referenceDistance * scaleFactor,
        y: normalizedCoords.position_y_factor * referenceDistance * scaleFactor,
        width: normalizedCoords.width_factor * referenceDistance * scaleFactor,
        height: normalizedCoords.height_factor * referenceDistance * scaleFactor
    };
    
    console.log('YPrint: Koordinaten denormalisiert:', {
        normalized: normalizedCoords,
        reference_distance: referenceDistance,
        scale_factor: scaleFactor,
        denormalized: denormalized
    });
    
    return denormalized;
}

/**
 * Get current device canvas dimensions
 * 
 * @returns {object} Canvas dimensions for current device
 */
function getCurrentDeviceCanvasDimensions() {
    const canvas = document.querySelector('#template-canvas');
    if (!canvas) {
        return { width: 800, height: 600 }; // Fallback
    }
    
    return {
        width: canvas.width,
        height: canvas.height
    };
}

/**
 * Calculate reference distance for current device
 * Adjusts reference measurement based on device canvas size
 * 
 * @param {number} originalReferenceDistance Original reference distance
 * @param {object} originalCanvas Original canvas dimensions
 * @param {object} currentCanvas Current device canvas dimensions
 * @returns {number} Adjusted reference distance
 */
function calculateDeviceAdjustedReferenceDistance(originalReferenceDistance, originalCanvas, currentCanvas) {
    if (!originalReferenceDistance || !originalCanvas || !currentCanvas) {
        return originalReferenceDistance;
    }
    
    // Berechne Skalierungsfaktor basierend auf Canvas-Größe
    const scaleX = currentCanvas.width / originalCanvas.width;
    const scaleY = currentCanvas.height / originalCanvas.height;
    const averageScale = (scaleX + scaleY) / 2;
    
    const adjustedDistance = originalReferenceDistance * averageScale;
    
    console.log('YPrint: Referenzdistanz für Device angepasst:', {
        original: originalReferenceDistance,
        original_canvas: originalCanvas,
        current_canvas: currentCanvas,
        scale_factors: { x: scaleX, y: scaleY, average: averageScale },
        adjusted: adjustedDistance
    });
    
    return adjustedDistance;
}

/**
 * 🔍 PNG COMPARISON POPUP MODULE
 * Shows detailed PNG analysis after save instead of redirect
 * VOLLSTÄNDIGE ÄNDERUNGEN - Complete integration module
 */

console.log('🔍 PNG COMPARISON POPUP: Loading module...');

// CSS for the popup modal
const pngComparisonStyles = `
<style id="png-comparison-styles">
.png-comparison-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    display: none;
    overflow-y: auto;
}

.png-comparison-modal.show {
    display: flex;
    align-items: center;
    justify-content: center;
}

.png-comparison-content {
    background: white;
    border-radius: 8px;
    padding: 20px;
    width: 90%;
    max-width: 1200px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
}

.png-comparison-header {
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.png-comparison-close {
    background: #ff4444;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
}

.png-comparison-close:hover {
    background: #cc0000;
}

.png-comparison-section {
    margin-bottom: 25px;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #f9f9f9;
}

.png-comparison-section h3 {
    margin: 0 0 15px 0;
    color: #333;
    border-bottom: 1px solid #ccc;
    padding-bottom: 8px;
}

.png-comparison-views {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
}

.png-view-analysis {
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 15px;
    background: white;
}

.png-view-header {
    background: #007cba;
    color: white;
    padding: 10px;
    margin: -15px -15px 15px -15px;
    border-radius: 6px 6px 0 0;
    font-weight: bold;
}

.png-image-container {
    text-align: center;
    margin: 15px 0;
    border: 1px solid #ddd;
    padding: 10px;
    background: #f5f5f5;
}

.png-image-container img {
    max-width: 100%;
    height: auto;
    border: 1px solid #999;
}

.png-data-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
}

.png-data-table th,
.png-data-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.png-data-table th {
    background: #f0f0f0;
    font-weight: bold;
}

.status-indicator {
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 12px;
}

.status-success { background: #d4edda; color: #155724; }
.status-warning { background: #fff3cd; color: #856404; }
.status-error { background: #f8d7da; color: #721c24; }

.png-comparison-controls {
    text-align: center;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #ddd;
}

.png-comparison-btn {
    background: #007cba;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    margin: 0 10px;
    cursor: pointer;
    font-size: 14px;
}

.png-comparison-btn:hover {
    background: #005a8c;
}

.png-comparison-btn.secondary {
    background: #6c757d;
}

.png-comparison-btn.secondary:hover {
    background: #545b62;
}
</style>
`;

// HTML structure for the popup
const pngComparisonHTML = `
<div id="png-comparison-modal" class="png-comparison-modal">
    <div class="png-comparison-content">
        <div class="png-comparison-header">
            <h2>🔍 PNG Generation Analysis</h2>
            <button id="png-comparison-close" class="png-comparison-close">Close & Continue</button>
        </div>

        <div class="png-comparison-section">
            <h3>📊 Generation Summary</h3>
            <div id="png-summary-content"></div>
        </div>

        <div class="png-comparison-section">
            <h3>📐 Template & Canvas Information</h3>
            <div id="png-template-info"></div>
        </div>

        <div class="png-comparison-section">
            <h3>🎨 View Analysis & PNG Comparison</h3>
            <div id="png-views-content" class="png-comparison-views"></div>
        </div>

        <div class="png-comparison-controls">
            <button id="png-analysis-copy" class="png-comparison-btn">📋 Copy Analysis Data</button>
            <button id="png-regenerate" class="png-comparison-btn secondary">🔄 Regenerate PNGs</button>
            <button id="png-continue" class="png-comparison-btn">✅ Continue to Dashboard</button>
        </div>
    </div>
</div>
`;

// Initialize the PNG comparison system
class PNGComparisonSystem {
    constructor() {
        this.modal = null;
        this.originalRedirectUrl = null;
        this.pngData = null;
        this.analysisData = null;
        this.init();
    }

    init() {
        // Add styles to page
        if (!document.getElementById('png-comparison-styles')) {
            document.head.insertAdjacentHTML('beforeend', pngComparisonStyles);
        }

        // Add modal to page
        if (!document.getElementById('png-comparison-modal')) {
            document.body.insertAdjacentHTML('beforeend', pngComparisonHTML);
            this.modal = document.getElementById('png-comparison-modal');
            this.setupEventListeners();
        }

        console.log('✅ PNG Comparison System initialized');
    }

    setupEventListeners() {
        // Close button
        document.getElementById('png-comparison-close').addEventListener('click', () => {
            this.closeAndContinue();
        });

        // Continue button
        document.getElementById('png-continue').addEventListener('click', () => {
            this.closeAndContinue();
        });

        // Copy analysis data
        document.getElementById('png-analysis-copy').addEventListener('click', () => {
            this.copyAnalysisData();
        });

        // Regenerate PNGs
        document.getElementById('png-regenerate').addEventListener('click', () => {
            this.regeneratePNGs();
        });

        // Close on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeAndContinue();
            }
        });
    }

    async showAnalysis(pngData, redirectUrl) {
        this.pngData = pngData;
        this.originalRedirectUrl = redirectUrl;

        console.log('🔍 PNG COMPARISON: Starting detailed analysis...');

        // Gather comprehensive analysis data
        this.analysisData = await this.gatherAnalysisData();

        // Populate modal content
        this.populateModal();

        // Show modal
        this.modal.classList.add('show');
    }

    async gatherAnalysisData() {
        const designer = window.designerInstance;
        if (!designer) return null;

        const canvas = designer.fabricCanvas;
        const template = designer.templates?.get(designer.activeTemplateId);
        const variation = template?.variations?.get(designer.currentVariation?.toString());

        const analysisData = {
            template: {
                id: designer.activeTemplateId,
                name: template?.name || 'Unknown',
                variation: designer.currentVariation
            },
            canvas: {
                width: canvas.width,
                height: canvas.height,
                zoom: canvas.getZoom(),
                objects: canvas.getObjects().length
            },
            views: {},
            pngGeneration: this.pngData || {},
            timestamp: new Date().toISOString()
        };

        // Analyze each view
        if (variation?.views) {
            for (const [viewId, viewData] of variation.views) {
                const printArea = this.getViewPrintArea(designer, viewId, viewData);
                const designObjects = this.getDesignObjects(canvas);
                const designBounds = this.calculateDesignBounds(designObjects);

                // Calculate expected PNG dimensions based on print area
                const expectedDimensions = {
                    width: Math.round(printArea.width * 4.17), // 300 DPI multiplier
                    height: Math.round(printArea.height * 4.17)
                };

                // Get actual PNG info if available
                const pngInfo = this.getPNGInfoForView(viewId);
                const actualDimensions = await this.getImageDimensions(pngInfo?.url);

                analysisData.views[viewId] = {
                    name: viewData.name,
                    printArea: printArea,
                    expectedDimensions: expectedDimensions,
                    actualDimensions: actualDimensions,
                    designBounds: designBounds,
                    pngInfo: pngInfo,
                    analysis: {
                        printAreaValid: printArea.width > 0 && printArea.height > 0,
                        sizesMatch: actualDimensions ?
                            (Math.abs(actualDimensions.width - expectedDimensions.width) <= 5 &&
                             Math.abs(actualDimensions.height - expectedDimensions.height) <= 5) : false,
                        designInPrintArea: this.checkDesignInPrintArea(designBounds, printArea),
                        pngExists: !!pngInfo?.url,
                        uploadSuccess: pngInfo?.success || false
                    }
                };
            }
        }

        return analysisData;
    }

    getViewPrintArea(designer, viewId, viewData) {
        const template = designer.templates?.get(designer.activeTemplateId);
        const variation = template?.variations?.get(designer.currentVariation?.toString());
        const view = variation?.views?.get(viewId?.toString());

        if (view?.safeZone) {
            return {
                source: 'safeZone',
                left: view.safeZone.left,
                top: view.safeZone.top,
                width: view.safeZone.width,
                height: view.safeZone.height
            };
        }

        // Fallback
        const canvas = designer.fabricCanvas;
        return {
            source: 'fallback',
            left: canvas.width * 0.1,
            top: canvas.height * 0.1,
            width: canvas.width * 0.8,
            height: canvas.height * 0.8
        };
    }

    getDesignObjects(canvas) {
        return canvas.getObjects().filter(obj => {
            const isBackground = obj.isBackground === true || (obj.type === 'image' && obj.selectable === false);
            const isSystemObject = obj.excludeFromExport === true;
            const isUserContent = obj.selectable === true && obj.visible === true;
            return isUserContent && !isBackground && !isSystemObject;
        });
    }

    calculateDesignBounds(designObjects) {
        if (designObjects.length === 0) return null;

        let minLeft = Infinity, minTop = Infinity, maxRight = -Infinity, maxBottom = -Infinity;

        designObjects.forEach(obj => {
            const bounds = obj.getBoundingRect();
            minLeft = Math.min(minLeft, bounds.left);
            minTop = Math.min(minTop, bounds.top);
            maxRight = Math.max(maxRight, bounds.left + bounds.width);
            maxBottom = Math.max(maxBottom, bounds.top + bounds.height);
        });

        return {
            left: minLeft,
            top: minTop,
            width: maxRight - minLeft,
            height: maxBottom - minTop,
            right: maxRight,
            bottom: maxBottom
        };
    }

    getPNGInfoForView(viewId) {
        if (!this.pngData?.uploads) return null;

        const upload = this.pngData.uploads.find(u => u.viewId == viewId);
        return upload || null;
    }

    async getImageDimensions(imageUrl) {
        if (!imageUrl) return null;

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = () => resolve(null);
            img.src = imageUrl;
        });
    }

    checkDesignInPrintArea(designBounds, printArea) {
        if (!designBounds) return false;

        return designBounds.left >= printArea.left &&
               designBounds.top >= printArea.top &&
               designBounds.right <= (printArea.left + printArea.width) &&
               designBounds.bottom <= (printArea.top + printArea.height);
    }

    populateModal() {
        // Summary
        this.populateSummary();

        // Template info
        this.populateTemplateInfo();

        // Views analysis
        this.populateViewsAnalysis();
    }

    populateSummary() {
        const content = document.getElementById('png-summary-content');
        const pngData = this.pngData;

        content.innerHTML = `
            <table class="png-data-table">
                <tr><th>Total PNGs Generated</th><td>${pngData.totalGenerated || 0}</td></tr>
                <tr><th>Successful Uploads</th><td>${pngData.successfulUploads || 0}</td></tr>
                <tr><th>Failed Uploads</th><td>${pngData.failedUploads || 0}</td></tr>
                <tr><th>Generation Time</th><td>${new Date().toLocaleString()}</td></tr>
                <tr><th>Design ID</th><td>${window.designerInstance?.currentDesignId || 'Unknown'}</td></tr>
            </table>
        `;
    }

    populateTemplateInfo() {
        const content = document.getElementById('png-template-info');
        const analysis = this.analysisData;

        content.innerHTML = `
            <table class="png-data-table">
                <tr><th>Template ID</th><td>${analysis.template.id}</td></tr>
                <tr><th>Template Name</th><td>${analysis.template.name}</td></tr>
                <tr><th>Variation</th><td>${analysis.template.variation}</td></tr>
                <tr><th>Canvas Size</th><td>${analysis.canvas.width} × ${analysis.canvas.height} px</td></tr>
                <tr><th>Canvas Zoom</th><td>${analysis.canvas.zoom}</td></tr>
                <tr><th>Total Objects</th><td>${analysis.canvas.objects}</td></tr>
            </table>
        `;
    }

    populateViewsAnalysis() {
        const container = document.getElementById('png-views-content');
        container.innerHTML = '';

        for (const [viewId, viewAnalysis] of Object.entries(this.analysisData.views)) {
            const viewElement = this.createViewAnalysisElement(viewId, viewAnalysis);
            container.appendChild(viewElement);
        }
    }

    createViewAnalysisElement(viewId, analysis) {
        const div = document.createElement('div');
        div.className = 'png-view-analysis';

        const sizeMatchStatus = analysis.analysis.sizesMatch ? 'success' : 'error';
        const pngExistsStatus = analysis.analysis.pngExists ? 'success' : 'error';
        const uploadStatus = analysis.analysis.uploadSuccess ? 'success' : 'error';

        div.innerHTML = `
            <div class="png-view-header">${analysis.name} (ID: ${viewId})</div>

            <div class="png-image-container">
                ${analysis.pngInfo?.url ?
                    `<img src="${analysis.pngInfo.url}" alt="${analysis.name} PNG" style="max-height: 200px;">
                     <div><strong>PNG URL:</strong> <a href="${analysis.pngInfo.url}" target="_blank">${analysis.pngInfo.url}</a></div>` :
                    '<div style="padding: 20px; background: #f0f0f0; color: #666;">No PNG generated</div>'
                }
            </div>

            <table class="png-data-table">
                <tr>
                    <th colspan="3">📐 Size Analysis</th>
                </tr>
                <tr>
                    <th>Print Area</th>
                    <td>${analysis.printArea.width} × ${analysis.printArea.height} px</td>
                    <td>Source: ${analysis.printArea.source}</td>
                </tr>
                <tr>
                    <th>Expected PNG Size (300 DPI)</th>
                    <td>${analysis.expectedDimensions.width} × ${analysis.expectedDimensions.height} px</td>
                    <td>Print area × 4.17</td>
                </tr>
                <tr>
                    <th>Actual PNG Size</th>
                    <td>${analysis.actualDimensions ?
                        `${analysis.actualDimensions.width} × ${analysis.actualDimensions.height} px` :
                        'Not available'}</td>
                    <td><span class="status-indicator status-${sizeMatchStatus}">
                        ${analysis.analysis.sizesMatch ? '✅ Match' : '❌ Mismatch'}
                    </span></td>
                </tr>
            </table>

            <table class="png-data-table">
                <tr>
                    <th colspan="3">🎯 Design Position Analysis</th>
                </tr>
                <tr>
                    <th>Design Bounds</th>
                    <td>${analysis.designBounds ?
                        `${Math.round(analysis.designBounds.width)} × ${Math.round(analysis.designBounds.height)} px` :
                        'No design objects'}</td>
                    <td>Position: ${analysis.designBounds ?
                        `(${Math.round(analysis.designBounds.left)}, ${Math.round(analysis.designBounds.top)})` :
                        'N/A'}</td>
                </tr>
                <tr>
                    <th>Design in Print Area</th>
                    <td>${analysis.analysis.designInPrintArea ? '✅ Yes' : '❌ No'}</td>
                    <td>${analysis.analysis.designInPrintArea ? 'Design fits within print zone' : 'Design exceeds print zone'}</td>
                </tr>
            </table>

            <table class="png-data-table">
                <tr>
                    <th colspan="3">📤 Upload Status</th>
                </tr>
                <tr>
                    <th>PNG Generated</th>
                    <td><span class="status-indicator status-${pngExistsStatus}">
                        ${analysis.analysis.pngExists ? '✅ Yes' : '❌ No'}
                    </span></td>
                    <td>${analysis.pngInfo?.viewName || 'N/A'}</td>
                </tr>
                <tr>
                    <th>Upload Success</th>
                    <td><span class="status-indicator status-${uploadStatus}">
                        ${analysis.analysis.uploadSuccess ? '✅ Success' : '❌ Failed'}
                    </span></td>
                    <td>${analysis.pngInfo?.error || 'No errors'}</td>
                </tr>
            </table>
        `;

        return div;
    }

    copyAnalysisData() {
        const analysisText = JSON.stringify(this.analysisData, null, 2);

        navigator.clipboard.writeText(analysisText).then(() => {
            alert('📋 Analysis data copied to clipboard!');
        }).catch(() => {
            // Fallback - create text area
            const textArea = document.createElement('textarea');
            textArea.value = analysisText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('📋 Analysis data copied to clipboard!');
        });
    }

    async regeneratePNGs() {
        if (!window.generatePNGForSave) {
            alert('❌ PNG generation function not available');
            return;
        }

        try {
            const regenerateBtn = document.getElementById('png-regenerate');
            regenerateBtn.disabled = true;
            regenerateBtn.textContent = '🔄 Regenerating...';

            console.log('🔄 Regenerating PNGs...');
            const pngResult = await window.generatePNGForSave(window.designerInstance?.currentDesignId);

            if (pngResult && pngResult.success) {
                this.pngData = pngResult;
                this.analysisData = await this.gatherAnalysisData();
                this.populateModal();
                alert('✅ PNGs regenerated successfully!');
            } else {
                alert('❌ PNG regeneration failed');
            }
        } catch (error) {
            alert('❌ PNG regeneration error: ' + error.message);
        } finally {
            const regenerateBtn = document.getElementById('png-regenerate');
            regenerateBtn.disabled = false;
            regenerateBtn.textContent = '🔄 Regenerate PNGs';
        }
    }

    closeAndContinue() {
        this.modal.classList.remove('show');

        // Continue with original redirect after 500ms
        if (this.originalRedirectUrl) {
            setTimeout(() => {
                window.location.href = this.originalRedirectUrl;
            }, 500);
        }
    }
}

// Initialize the system
window.pngComparisonSystem = new PNGComparisonSystem();

console.log('✅ PNG COMPARISON POPUP: Module loaded successfully');
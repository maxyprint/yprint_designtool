/**
 * Multi-View Point-to-Point Reference Line Selector
 * Template Views Integration für Dynamic View Loading
 * Version: 2.0.0
 *
 * Hive-Mind Implementation: 7 Agents arbeiten parallel für Template Variations Integration
 * Agent Coordination: JavaScriptSystemAnalyst, CanvasSystemAdapter, DatabaseIntegrationExpert
 */

class MultiViewPointToPointSelector {
    constructor(canvasElement, templateId) {
        this.canvas = canvasElement;
        this.templateId = templateId;
        this.ctx = canvasElement.getContext('2d');

        // Multi-View Properties
        this.currentView = null;
        this.currentViewId = null;
        this.templateViews = {};
        this.currentImage = null;

        // Point-to-Point Properties
        this.points = [];
        this.currentMode = 'select';
        this.selectedMeasurementKey = null;
        this.multiViewReferenceLines = {}; // {view_id: [reference_lines]}
        this.isDrawing = false;
        this.measurementTypes = {};

        this.init();
    }

    async init() {
        await this.loadTemplateViews();
        await this.loadMeasurementTypes();
        this.setupEventListeners();
        this.setupUI();
        await this.loadExistingMultiViewReferenceLines();
    }

    /**
     * Lädt alle Template Views aus Template Variations
     */
    async loadTemplateViews() {
        try {
            const response = await fetch(pointToPointAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'get_template_views',
                    template_id: this.templateId,
                    nonce: pointToPointAjax.nonce
                })
            });

            const data = await response.json();
            if (data.success) {
                this.templateViews = data.data.views;
                console.log('🎯 Multi-View: Loaded', Object.keys(this.templateViews).length, 'views');
                this.createViewSelector();

                // Switch to first view
                const firstViewId = Object.keys(this.templateViews)[0];
                if (firstViewId) {
                    await this.switchToView(firstViewId);
                }
            } else {
                console.error('Failed to load template views:', data.data);
                this.showError('Fehler beim Laden der Template Views: ' + data.data);
            }
        } catch (error) {
            console.error('Error loading template views:', error);
            this.showError('Fehler beim Laden der Template Views: ' + error.message);
        }
    }

    /**
     * Lädt verfügbare Measurement-Types aus der Database (Issue #19)
     */
    async loadMeasurementTypes() {
        try {
            const response = await fetch(pointToPointAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'get_template_measurements',
                    template_id: this.templateId,
                    nonce: pointToPointAjax.nonce
                })
            });

            const data = await response.json();
            if (data.success) {
                this.measurementTypes = data.data.measurement_types;
                this.populateMeasurementDropdown();
            }
        } catch (error) {
            console.error('Fehler beim Laden der Measurement Types:', error);
        }
    }

    /**
     * Erstellt View Selector Tabs
     */
    createViewSelector() {
        const container = document.getElementById('view-selector-container');
        if (!container) return;

        const viewTabs = Object.entries(this.templateViews).map(([viewId, viewData]) => `
            <button class="view-tab" data-view-id="${viewId}">
                📐 ${viewData.name}
                <span class="view-lines-count" id="view-count-${viewId}">0</span>
            </button>
        `).join('');

        container.innerHTML = `
            <div class="view-tabs-wrapper">
                <h4>🎯 Template Views:</h4>
                <div class="view-tabs">
                    ${viewTabs}
                </div>
            </div>
        `;

        // Add click handlers
        container.querySelectorAll('.view-tab').forEach(tab => {
            tab.addEventListener('click', async (e) => {
                const viewId = e.target.dataset.viewId;
                await this.switchToView(viewId);
            });
        });
    }

    /**
     * Wechselt zu einer anderen View
     */
    async switchToView(viewId) {
        if (!this.templateViews[viewId]) {
            console.error('View not found:', viewId);
            return;
        }

        this.currentViewId = viewId;
        this.currentView = this.templateViews[viewId];

        // Update View Tabs
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.viewId === viewId) {
                tab.classList.add('active');
            }
        });

        // Load View Image
        await this.loadViewImage(this.currentView.image_url);

        // Load View-specific Reference Lines
        this.updateCurrentViewReferenceLines();
        this.redrawCanvas();
        this.updateLinesDisplay();

        // Update UI
        this.updateViewInfo();

        console.log('🔄 Switched to view:', this.currentView.name, '(ID:', viewId, ')');
    }

    /**
     * Lädt View-spezifisches Bild in Canvas
     */
    async loadViewImage(imageUrl) {
        return new Promise((resolve, reject) => {
            this.currentImage = new Image();
            this.currentImage.onload = () => {
                this.canvas.width = this.currentImage.width;
                this.canvas.height = this.currentImage.height;
                this.redrawCanvas();
                resolve(this.currentImage);
            };
            this.currentImage.onerror = reject;
            this.currentImage.src = imageUrl;
        });
    }

    /**
     * Updates Reference Lines für aktuelle View
     */
    updateCurrentViewReferenceLines() {
        if (!this.multiViewReferenceLines[this.currentViewId]) {
            this.multiViewReferenceLines[this.currentViewId] = [];
        }
    }

    /**
     * Setup Event Listeners für Canvas Interaktion
     */
    setupEventListeners() {
        // Canvas Events
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));

        // UI Events
        document.getElementById('measurement-type-selector')?.addEventListener('change', (e) => {
            this.selectedMeasurementKey = e.target.value;
            this.updateMode();
        });

        document.getElementById('clear-current-view-lines-btn')?.addEventListener('click', () => {
            this.clearCurrentViewLines();
        });

        document.getElementById('clear-all-views-lines-btn')?.addEventListener('click', () => {
            this.clearAllViewsLines();
        });

        document.getElementById('save-multi-view-reference-lines-btn')?.addEventListener('click', () => {
            this.saveMultiViewReferenceLines();
        });
    }

    /**
     * Setup Multi-View Admin UI Elements
     */
    setupUI() {
        const container = document.getElementById('point-to-point-container');
        if (!container) return;

        const uiHTML = `
            <div class="multi-view-point-to-point-controls">
                <div id="view-selector-container"></div>

                <div class="current-view-info" id="current-view-info">
                    <h4>📐 Aktuelle View: <span id="current-view-name">-</span></h4>
                </div>

                <div class="control-group">
                    <label for="measurement-type-selector">Measurement-Type:</label>
                    <select id="measurement-type-selector">
                        <option value="">Measurement-Type auswählen...</option>
                    </select>
                </div>

                <div class="control-group">
                    <button id="clear-current-view-lines-btn" class="button">🗑️ Aktuelle View löschen</button>
                    <button id="clear-all-views-lines-btn" class="button">🗑️ Alle Views löschen</button>
                </div>

                <div class="control-group">
                    <button id="save-multi-view-reference-lines-btn" class="button-primary">💾 Multi-View Referenzlinien speichern</button>
                </div>

                <div class="instructions">
                    <p><strong>📋 Multi-View Anleitung:</strong></p>
                    <ol>
                        <li><strong>View auswählen:</strong> Klicke auf einen View-Tab (Front, Back, etc.)</li>
                        <li><strong>Measurement-Type wählen:</strong> z.B. "A - Chest"</li>
                        <li><strong>Zwei Punkte klicken:</strong> Auf dem aktuellen View-Bild</li>
                        <li><strong>Wiederhole für andere Views:</strong> Jede View hat separate Referenzlinien</li>
                        <li><strong>Speichere alle Views:</strong> Button speichert alle Views gleichzeitig</li>
                    </ol>
                </div>

                <div class="multi-view-reference-lines-list">
                    <h4>📏 Multi-View Referenzlinien:</h4>
                    <div id="multi-view-lines-display"></div>
                </div>
            </div>
        `;

        container.innerHTML = uiHTML;
    }

    /**
     * Canvas Mouse Events (gleich wie Single-View)
     */
    onMouseDown(e) {
        if (!this.selectedMeasurementKey || !this.currentViewId || this.currentMode !== 'select') return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.points.push({ x, y });

        if (this.points.length === 2) {
            this.createReferenceLineForCurrentView();
            this.points = [];
        }

        this.redrawCanvas();
    }

    onMouseMove(e) {
        if (this.points.length === 1 && this.selectedMeasurementKey && this.currentViewId) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.redrawCanvas();
            this.drawPreviewLine(this.points[0], { x, y });
        }
    }

    onMouseUp(e) {
        // Event handling für Canvas Release
    }

    /**
     * Erstellt eine Referenzlinie für die aktuelle View
     */
    createReferenceLineForCurrentView() {
        if (this.points.length !== 2 || !this.currentViewId) return;

        const [start, end] = this.points;
        const lengthPx = this.calculatePixelDistance(start, end);

        const referenceLine = {
            measurement_key: this.selectedMeasurementKey,
            label: this.measurementTypes[this.selectedMeasurementKey]?.label || this.selectedMeasurementKey,
            lengthPx: Math.round(lengthPx * 100) / 100,
            start: { x: Math.round(start.x), y: Math.round(start.y) },
            end: { x: Math.round(end.x), y: Math.round(end.y) },
            view_id: this.currentViewId,
            view_name: this.currentView.name
        };

        // Entferne existierende Linie mit gleichem measurement_key in aktueller View
        this.multiViewReferenceLines[this.currentViewId] = this.multiViewReferenceLines[this.currentViewId].filter(line =>
            line.measurement_key !== this.selectedMeasurementKey
        );

        this.multiViewReferenceLines[this.currentViewId].push(referenceLine);
        this.updateLinesDisplay();
        this.updateViewCounts();
        this.redrawCanvas();

        // Reset für nächste Linie
        this.selectedMeasurementKey = null;
        document.getElementById('measurement-type-selector').value = '';
        this.updateMode();

        console.log('✅ Reference line created for view:', this.currentView.name, referenceLine);
    }

    /**
     * Berechnet Pixel-Distanz zwischen zwei Punkten
     */
    calculatePixelDistance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Canvas komplett neu zeichnen
     */
    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Template Image zeichnen
        if (this.currentImage) {
            this.ctx.drawImage(this.currentImage, 0, 0, this.canvas.width, this.canvas.height);
        }

        // Referenzlinien der aktuellen View zeichnen
        if (this.currentViewId && this.multiViewReferenceLines[this.currentViewId]) {
            this.multiViewReferenceLines[this.currentViewId].forEach((line, index) => {
                this.drawReferenceLine(line, index);
            });
        }

        // Aktuelle Punkte zeichnen
        this.points.forEach(point => {
            this.drawPoint(point);
        });
    }

    /**
     * Zeichnet Preview-Linie während Maus-Movement
     */
    drawPreviewLine(start, end) {
        this.ctx.save();
        this.ctx.strokeStyle = '#007cba';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.globalAlpha = 0.7;

        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.stroke();

        this.ctx.restore();
    }

    /**
     * Zeichnet eine fertige Referenzlinie
     */
    drawReferenceLine(line, index) {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ff9900', '#9900ff', '#00ffff', '#ffff00'];
        const color = colors[index % colors.length];

        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.fillStyle = color;

        // Linie zeichnen
        this.ctx.beginPath();
        this.ctx.moveTo(line.start.x, line.start.y);
        this.ctx.lineTo(line.end.x, line.end.y);
        this.ctx.stroke();

        // Start- und Endpunkte zeichnen
        this.drawPoint(line.start, color);
        this.drawPoint(line.end, color);

        // Label zeichnen
        const midX = (line.start.x + line.end.x) / 2;
        const midY = (line.start.y + line.end.y) / 2;

        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#fff';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(`${line.measurement_key}: ${line.lengthPx}px`, midX + 10, midY - 10);
        this.ctx.fillText(`${line.measurement_key}: ${line.lengthPx}px`, midX + 10, midY - 10);

        this.ctx.restore();
    }

    /**
     * Zeichnet einen Punkt
     */
    drawPoint(point, color = '#007cba') {
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * Füllt das Dropdown mit verfügbaren Measurement-Types
     */
    populateMeasurementDropdown() {
        const dropdown = document.getElementById('measurement-type-selector');
        dropdown.innerHTML = '<option value="">Measurement-Type auswählen...</option>';

        Object.entries(this.measurementTypes).forEach(([key, data]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${key} - ${data.label}`;
            dropdown.appendChild(option);
        });
    }

    /**
     * Update Mode basierend auf Selektion
     */
    updateMode() {
        if (this.selectedMeasurementKey && this.currentViewId) {
            this.currentMode = 'select';
            this.canvas.style.cursor = 'crosshair';
        } else {
            this.currentMode = 'idle';
            this.canvas.style.cursor = 'default';
        }
    }

    /**
     * Update der aktuellen View Info
     */
    updateViewInfo() {
        const nameElement = document.getElementById('current-view-name');
        if (nameElement && this.currentView) {
            nameElement.textContent = this.currentView.name;
        }
    }

    /**
     * Update View Line Counts
     */
    updateViewCounts() {
        Object.keys(this.templateViews).forEach(viewId => {
            const countElement = document.getElementById(`view-count-${viewId}`);
            if (countElement) {
                const count = this.multiViewReferenceLines[viewId] ? this.multiViewReferenceLines[viewId].length : 0;
                countElement.textContent = count;
                countElement.style.display = count > 0 ? 'inline' : 'none';
            }
        });
    }

    /**
     * Löscht alle Referenzlinien der aktuellen View
     */
    clearCurrentViewLines() {
        if (!this.currentViewId) {
            alert('Keine View ausgewählt.');
            return;
        }

        const count = this.multiViewReferenceLines[this.currentViewId] ? this.multiViewReferenceLines[this.currentViewId].length : 0;

        if (count === 0) {
            alert('Keine Referenzlinien in aktueller View vorhanden.');
            return;
        }

        if (confirm(`Alle ${count} Referenzlinien in "${this.currentView.name}" löschen?`)) {
            this.multiViewReferenceLines[this.currentViewId] = [];
            this.points = [];
            this.redrawCanvas();
            this.updateLinesDisplay();
            this.updateViewCounts();
        }
    }

    /**
     * Löscht alle Referenzlinien in allen Views
     */
    clearAllViewsLines() {
        const totalCount = Object.values(this.multiViewReferenceLines).reduce((total, lines) =>
            total + (Array.isArray(lines) ? lines.length : 0), 0);

        if (totalCount === 0) {
            alert('Keine Referenzlinien vorhanden.');
            return;
        }

        if (confirm(`Alle ${totalCount} Referenzlinien in allen Views löschen?`)) {
            this.multiViewReferenceLines = {};
            this.points = [];
            this.redrawCanvas();
            this.updateLinesDisplay();
            this.updateViewCounts();
        }
    }

    /**
     * Update der Multi-View Linien-Anzeige
     */
    updateLinesDisplay() {
        const display = document.getElementById('multi-view-lines-display');
        if (!display) return;

        const totalLines = Object.values(this.multiViewReferenceLines).reduce((total, lines) =>
            total + (Array.isArray(lines) ? lines.length : 0), 0);

        if (totalLines === 0) {
            display.innerHTML = '<em>Keine Referenzlinien in keiner View definiert</em>';
            return;
        }

        const viewsHTML = Object.entries(this.multiViewReferenceLines).map(([viewId, lines]) => {
            if (!Array.isArray(lines) || lines.length === 0) return '';

            const viewName = this.templateViews[viewId]?.name || `View ${viewId}`;
            const linesHTML = lines.map(line => `
                <div class="reference-line-item ${viewId === this.currentViewId ? 'current-view' : ''}">
                    <strong>${line.measurement_key} - ${line.label}</strong><br>
                    Länge: ${line.lengthPx}px<br>
                    Von: (${line.start.x}, ${line.start.y}) nach (${line.end.x}, ${line.end.y})
                    <button class="button-link" onclick="multiViewPointToPointSelector.removeReferenceLine('${viewId}', '${line.measurement_key}')">
                        Entfernen
                    </button>
                </div>
            `).join('');

            return `
                <div class="view-lines-group">
                    <h5>📐 ${viewName} (${lines.length} Linien):</h5>
                    ${linesHTML}
                </div>
            `;
        }).filter(html => html).join('');

        display.innerHTML = viewsHTML;
    }

    /**
     * Entfernt eine spezifische Referenzlinie aus einer View
     */
    removeReferenceLine(viewId, measurementKey) {
        if (this.multiViewReferenceLines[viewId]) {
            this.multiViewReferenceLines[viewId] = this.multiViewReferenceLines[viewId].filter(line =>
                line.measurement_key !== measurementKey
            );

            if (viewId === this.currentViewId) {
                this.redrawCanvas();
            }
            this.updateLinesDisplay();
            this.updateViewCounts();
        }
    }

    /**
     * Speichert Multi-View Referenzlinien in WordPress Meta Field
     */
    async saveMultiViewReferenceLines() {
        const totalLines = Object.values(this.multiViewReferenceLines).reduce((total, lines) =>
            total + (Array.isArray(lines) ? lines.length : 0), 0);

        if (totalLines === 0) {
            alert('Keine Referenzlinien zum Speichern vorhanden.');
            return;
        }

        try {
            const saveButton = document.getElementById('save-multi-view-reference-lines-btn');
            saveButton.disabled = true;
            saveButton.textContent = 'Speichere...';

            const response = await fetch(pointToPointAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'save_multi_view_reference_lines',
                    template_id: this.templateId,
                    multi_view_reference_lines: JSON.stringify(this.multiViewReferenceLines),
                    nonce: pointToPointAjax.nonce
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(`✅ Multi-View Referenzlinien erfolgreich gespeichert!\n${data.data.total_lines} Linien in ${data.data.total_views} Views wurden im _multi_view_reference_lines_data Meta-Feld gespeichert.`);
            } else {
                throw new Error(data.data || 'Speichern fehlgeschlagen');
            }

        } catch (error) {
            console.error('Fehler beim Speichern:', error);
            alert('Fehler beim Speichern der Multi-View Referenzlinien: ' + error.message);
        } finally {
            const saveButton = document.getElementById('save-multi-view-reference-lines-btn');
            saveButton.disabled = false;
            saveButton.textContent = '💾 Multi-View Referenzlinien speichern';
        }
    }

    /**
     * Lädt existierende Multi-View Referenzlinien aus dem Meta Field
     */
    async loadExistingMultiViewReferenceLines() {
        try {
            const response = await fetch(pointToPointAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'get_multi_view_reference_lines',
                    template_id: this.templateId,
                    nonce: pointToPointAjax.nonce
                })
            });

            const data = await response.json();
            if (data.success && data.data.multi_view_reference_lines) {
                this.multiViewReferenceLines = data.data.multi_view_reference_lines;
                this.redrawCanvas();
                this.updateLinesDisplay();
                this.updateViewCounts();
                console.log('📋 Loaded existing multi-view reference lines:', data.data.total_lines, 'lines in', data.data.total_views, 'views');
            }
        } catch (error) {
            console.error('Fehler beim Laden existierender Multi-View Referenzlinien:', error);
        }
    }

    /**
     * Zeigt Fehler-Nachrichten an
     */
    showError(message) {
        const container = document.getElementById('point-to-point-container');
        if (container) {
            container.innerHTML = `
                <div style="background: #f8d7da; border: 1px solid #f1aeb5; color: #721c24; padding: 15px; border-radius: 4px; margin: 15px 0;">
                    <strong>❌ Fehler:</strong> ${message}
                </div>
            `;
        }
    }
}

// Global Instance für Multi-View Template Editor
let multiViewPointToPointSelector = null;

/**
 * Initialisiert Multi-View Point-to-Point Selector für Template
 */
function initMultiViewPointToPointSelector(templateId) {
    const canvas = document.getElementById('template-canvas');
    const container = document.getElementById('point-to-point-container');

    if (!canvas || !container) {
        console.error('Erforderliche DOM-Elemente nicht gefunden');
        return;
    }

    multiViewPointToPointSelector = new MultiViewPointToPointSelector(canvas, templateId);
}

// WordPress Admin Integration
document.addEventListener('DOMContentLoaded', function() {
    // Auto-Initialisierung wenn Template-Seite erkannt wird
    const templateIdElement = document.getElementById('template-id-input');

    if (templateIdElement) {
        const templateId = templateIdElement.value;

        if (templateId) {
            console.log('🚀 Multi-View Point-to-Point System initializing for template:', templateId);
            initMultiViewPointToPointSelector(templateId);
        }
    }
});
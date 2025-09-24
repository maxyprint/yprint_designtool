/**
 * Point-to-Point Reference Line Selector for Template Editor
 * Interactives Interface für Referenzlinien-Erstellung im WordPress Admin
 * Version: 1.0.0
 *
 * Gap 2 Implementation: Vom manuellen JSON zum interaktiven Interface
 */

class PointToPointSelector {
    constructor(canvasElement, templateId) {
        this.canvas = canvasElement;
        this.templateId = templateId;
        this.ctx = canvasElement.getContext('2d');
        this.image = null;
        this.points = [];
        this.currentMode = 'select'; // 'select', 'drawing'
        this.selectedMeasurementKey = null;
        this.referenceLines = [];
        this.isDrawing = false;
        this.measurementTypes = {};

        this.init();
    }

    async init() {
        await this.loadMeasurementTypes();
        this.setupEventListeners();
        this.setupUI();
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

        document.getElementById('clear-lines-btn')?.addEventListener('click', () => {
            this.clearAllLines();
        });

        document.getElementById('save-reference-lines-btn')?.addEventListener('click', () => {
            this.saveReferenceLines();
        });
    }

    /**
     * Setup Admin UI Elements
     */
    setupUI() {
        const container = document.getElementById('point-to-point-container');
        if (!container) return;

        const uiHTML = `
            <div class="point-to-point-controls">
                <div class="control-group">
                    <label for="measurement-type-selector">Measurement-Type:</label>
                    <select id="measurement-type-selector">
                        <option value="">Measurement-Type auswählen...</option>
                    </select>
                </div>

                <div class="control-group">
                    <button id="clear-lines-btn" class="button">Alle Linien löschen</button>
                    <button id="save-reference-lines-btn" class="button-primary">Referenzlinien speichern</button>
                </div>

                <div class="instructions">
                    <p><strong>Anleitung:</strong></p>
                    <ol>
                        <li>Measurement-Type auswählen (z.B. "A - Chest")</li>
                        <li>Zwei Punkte auf dem Template-Bild klicken</li>
                        <li>Linie wird automatisch gezeichnet und gemessen</li>
                        <li>Wiederhole für weitere Measurement-Types</li>
                        <li>Speichere alle Referenzlinien</li>
                    </ol>
                </div>

                <div class="reference-lines-list">
                    <h4>Definierte Referenzlinien:</h4>
                    <div id="lines-display"></div>
                </div>
            </div>
        `;

        container.innerHTML = uiHTML;
    }

    /**
     * Canvas Mouse Events
     */
    onMouseDown(e) {
        if (!this.selectedMeasurementKey || this.currentMode !== 'select') return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.points.push({ x, y });

        if (this.points.length === 2) {
            this.createReferenceLine();
            this.points = [];
        }

        this.redrawCanvas();
    }

    onMouseMove(e) {
        if (this.points.length === 1 && this.selectedMeasurementKey) {
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
     * Erstellt eine Referenzlinie aus zwei Punkten
     */
    createReferenceLine() {
        if (this.points.length !== 2) return;

        const [start, end] = this.points;
        const lengthPx = this.calculatePixelDistance(start, end);

        const referenceLine = {
            measurement_key: this.selectedMeasurementKey,
            label: this.measurementTypes[this.selectedMeasurementKey]?.label || this.selectedMeasurementKey,
            lengthPx: Math.round(lengthPx * 100) / 100, // 2 Dezimalstellen
            start: { x: Math.round(start.x), y: Math.round(start.y) },
            end: { x: Math.round(end.x), y: Math.round(end.y) }
        };

        // Entferne existierende Linie mit gleichem measurement_key
        this.referenceLines = this.referenceLines.filter(line =>
            line.measurement_key !== this.selectedMeasurementKey
        );

        this.referenceLines.push(referenceLine);
        this.updateLinesDisplay();
        this.redrawCanvas();

        // Reset für nächste Linie
        this.selectedMeasurementKey = null;
        document.getElementById('measurement-type-selector').value = '';
        this.updateMode();
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
     * Canvas komplett neu zeichnen
     */
    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Template Image zeichnen
        if (this.image) {
            this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
        }

        // Alle Referenzlinien zeichnen
        this.referenceLines.forEach((line, index) => {
            this.drawReferenceLine(line, index);
        });

        // Aktuelle Punkte zeichnen
        this.points.forEach(point => {
            this.drawPoint(point);
        });
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
     * Lädt Template-Image in Canvas
     */
    async loadTemplateImage(imageUrl) {
        return new Promise((resolve, reject) => {
            this.image = new Image();
            this.image.onload = () => {
                this.canvas.width = this.image.width;
                this.canvas.height = this.image.height;
                this.redrawCanvas();
                resolve(this.image);
            };
            this.image.onerror = reject;
            this.image.src = imageUrl;
        });
    }

    /**
     * Update Mode basierend auf Selektion
     */
    updateMode() {
        if (this.selectedMeasurementKey) {
            this.currentMode = 'select';
            this.canvas.style.cursor = 'crosshair';
        } else {
            this.currentMode = 'idle';
            this.canvas.style.cursor = 'default';
        }
    }

    /**
     * Löscht alle Referenzlinien
     */
    clearAllLines() {
        if (confirm('Alle Referenzlinien löschen?')) {
            this.referenceLines = [];
            this.points = [];
            this.redrawCanvas();
            this.updateLinesDisplay();
        }
    }

    /**
     * Update der Linien-Anzeige
     */
    updateLinesDisplay() {
        const display = document.getElementById('lines-display');
        if (!display) return;

        if (this.referenceLines.length === 0) {
            display.innerHTML = '<em>Keine Referenzlinien definiert</em>';
            return;
        }

        const listHTML = this.referenceLines.map(line => `
            <div class="reference-line-item">
                <strong>${line.measurement_key} - ${line.label}</strong><br>
                Länge: ${line.lengthPx}px<br>
                Von: (${line.start.x}, ${line.start.y}) nach (${line.end.x}, ${line.end.y})
                <button class="button-link" onclick="pointToPointSelector.removeReferenceLine('${line.measurement_key}')">
                    Entfernen
                </button>
            </div>
        `).join('');

        display.innerHTML = listHTML;
    }

    /**
     * Entfernt eine spezifische Referenzlinie
     */
    removeReferenceLine(measurementKey) {
        this.referenceLines = this.referenceLines.filter(line =>
            line.measurement_key !== measurementKey
        );
        this.redrawCanvas();
        this.updateLinesDisplay();
    }

    /**
     * Speichert Referenzlinien in WordPress Meta Field
     */
    async saveReferenceLines() {
        if (this.referenceLines.length === 0) {
            alert('Keine Referenzlinien zum Speichern vorhanden.');
            return;
        }

        try {
            const saveButton = document.getElementById('save-reference-lines-btn');
            saveButton.disabled = true;
            saveButton.textContent = 'Speichere...';

            const response = await fetch(pointToPointAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'save_reference_lines',
                    template_id: this.templateId,
                    reference_lines: JSON.stringify(this.referenceLines),
                    nonce: pointToPointAjax.nonce
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(`Referenzlinien erfolgreich gespeichert!\n${this.referenceLines.length} Linien wurden im _reference_lines_data Meta-Feld gespeichert.`);
            } else {
                throw new Error(data.data || 'Speichern fehlgeschlagen');
            }

        } catch (error) {
            console.error('Fehler beim Speichern:', error);
            alert('Fehler beim Speichern der Referenzlinien: ' + error.message);
        } finally {
            const saveButton = document.getElementById('save-reference-lines-btn');
            saveButton.disabled = false;
            saveButton.textContent = 'Referenzlinien speichern';
        }
    }

    /**
     * Lädt existierende Referenzlinien aus dem Meta Field
     */
    async loadExistingReferenceLines() {
        try {
            const response = await fetch(pointToPointAjax.ajaxurl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'get_reference_lines',
                    template_id: this.templateId,
                    nonce: pointToPointAjax.nonce
                })
            });

            const data = await response.json();
            if (data.success && data.data.reference_lines) {
                this.referenceLines = data.data.reference_lines;
                this.redrawCanvas();
                this.updateLinesDisplay();
            }
        } catch (error) {
            console.error('Fehler beim Laden existierender Referenzlinien:', error);
        }
    }
}

// Global Instance für Template Editor
let pointToPointSelector = null;

/**
 * Initialisiert Point-to-Point Selector für Template
 */
function initPointToPointSelector(templateId, imageUrl) {
    const canvas = document.getElementById('template-canvas');
    const container = document.getElementById('point-to-point-container');

    if (!canvas || !container) {
        console.error('Erforderliche DOM-Elemente nicht gefunden');
        return;
    }

    pointToPointSelector = new PointToPointSelector(canvas, templateId);

    if (imageUrl) {
        pointToPointSelector.loadTemplateImage(imageUrl).then(() => {
            pointToPointSelector.loadExistingReferenceLines();
        });
    }
}

// WordPress Admin Integration
document.addEventListener('DOMContentLoaded', function() {
    // Auto-Initialisierung wenn Template-Seite erkannt wird
    const templateIdElement = document.getElementById('template-id-input');
    const imageElement = document.getElementById('template-image-url');

    if (templateIdElement && imageElement) {
        const templateId = templateIdElement.value;
        const imageUrl = imageElement.value;

        if (templateId && imageUrl) {
            initPointToPointSelector(templateId, imageUrl);
        }
    }
});
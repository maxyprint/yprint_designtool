/**
 * USER ACTION LOGGING SYSTEM
 * Captures all Canvas user interactions in precise JSON format
 */

class UserActionLogger {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.mockupOffset = { x: 0, y: 0 };
        this.canvasSize = { width: 800, height: 600 };
        this.zoom = 1.0;

        console.log('🎯 User Action Logger initialized with session:', this.sessionId);
        this.setupEventListeners();
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setupEventListeners() {
        // Wait for fabric canvas to be available
        this.waitForFabricCanvas().then(() => {
            this.attachCanvasListeners();
        });
    }

    async waitForFabricCanvas() {
        return new Promise((resolve) => {
            const checkForCanvas = () => {
                if (window.fabric && window.designerWidget && window.designerWidget.fabricCanvas) {
                    resolve();
                } else {
                    setTimeout(checkForCanvas, 500);
                }
            };
            checkForCanvas();
        });
    }

    attachCanvasListeners() {
        const canvas = window.designerWidget.fabricCanvas;

        // Detect mockup design area for coordinate transformation
        this.detectMockupArea();

        // Object added
        canvas.on('object:added', (e) => {
            this.logAction('add_element', e.target);
        });

        // Object moved
        canvas.on('object:moved', (e) => {
            this.logAction('move_element', e.target);
        });

        // Object scaled/resized
        canvas.on('object:scaled', (e) => {
            this.logAction('resize_element', e.target);
        });

        // Object rotated
        canvas.on('object:rotated', (e) => {
            this.logAction('rotate_element', e.target);
        });

        // Object removed
        canvas.on('object:removed', (e) => {
            this.logAction('delete_element', e.target);
        });

        // Text changed
        canvas.on('text:changed', (e) => {
            this.logAction('change_text', e.target);
        });

        // Color/style changes
        canvas.on('path:created', (e) => {
            this.logAction('draw_path', e.path);
        });

        console.log('🎯 Canvas event listeners attached for user action logging');
    }

    detectMockupArea() {
        const mockupContainer = document.querySelector('.mockup-design-area') ||
                               document.querySelector('.designer-canvas-container') ||
                               document.querySelector('#octo-print-designer-canvas').parentNode;

        if (mockupContainer) {
            const rect = mockupContainer.getBoundingClientRect();
            this.mockupOffset = {
                x: rect.left,
                y: rect.top
            };
        }

        // Update canvas size
        if (window.designerWidget && window.designerWidget.fabricCanvas) {
            const canvas = window.designerWidget.fabricCanvas;
            this.canvasSize = {
                width: canvas.width,
                height: canvas.height
            };
            this.zoom = canvas.getZoom();
        }
    }

    logAction(action, fabricObject) {
        if (!fabricObject) return;

        const actionData = {
            timestamp: new Date().toISOString(),
            action: action,
            element: this.extractElementData(fabricObject),
            canvas: {
                width: this.canvasSize.width,
                height: this.canvasSize.height,
                zoom: this.zoom,
                mockup_offset_x: this.mockupOffset.x,
                mockup_offset_y: this.mockupOffset.y
            },
            user_session: this.sessionId
        };

        // Log to console in required JSON format
        console.log('🎯 USER ACTION LOGGED:', JSON.stringify(actionData, null, 2));

        // Optional: Send to server for persistence
        this.sendToServer(actionData);
    }

    extractElementData(fabricObject) {
        const baseProperties = {
            x: Math.round(fabricObject.left - this.mockupOffset.x),
            y: Math.round(fabricObject.top - this.mockupOffset.y),
            width: Math.round(fabricObject.width * fabricObject.scaleX),
            height: Math.round(fabricObject.height * fabricObject.scaleY),
            angle: Math.round(fabricObject.angle || 0)
        };

        const elementData = {
            id: fabricObject.id || 'element_' + Date.now(),
            type: this.getElementType(fabricObject),
            properties: baseProperties
        };

        // Add type-specific properties
        if (fabricObject.type === 'text' || fabricObject.type === 'i-text') {
            elementData.properties.text = fabricObject.text;
            elementData.properties.fontSize = fabricObject.fontSize;
            elementData.properties.fontFamily = fabricObject.fontFamily;
            elementData.properties.fill = fabricObject.fill;
        } else if (fabricObject.type === 'image') {
            elementData.properties.src = fabricObject.src || fabricObject._element?.src;
        } else if (fabricObject.type === 'rect' || fabricObject.type === 'circle') {
            elementData.properties.fill = fabricObject.fill;
            elementData.properties.stroke = fabricObject.stroke;
            elementData.properties.strokeWidth = fabricObject.strokeWidth;
        }

        return elementData;
    }

    getElementType(fabricObject) {
        if (fabricObject.type === 'text' || fabricObject.type === 'i-text') {
            return 'text';
        } else if (fabricObject.type === 'image') {
            return 'image';
        } else if (fabricObject.type === 'rect') {
            return 'shape';
        } else if (fabricObject.type === 'circle') {
            return 'shape';
        } else if (fabricObject.type === 'path') {
            return 'line';
        } else {
            return fabricObject.type || 'unknown';
        }
    }

    sendToServer(actionData) {
        // Optional: Send action data to server for analytics
        // This can be implemented later for server-side logging
        if (window.yprint_ajax_url) {
            fetch(window.yprint_ajax_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'log_user_action',
                    data: actionData
                })
            }).catch(error => {
                console.log('🎯 Server logging failed (optional):', error);
            });
        }
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.userActionLogger = new UserActionLogger();
    });
} else {
    window.userActionLogger = new UserActionLogger();
}
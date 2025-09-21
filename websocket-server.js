#!/usr/bin/env node

/**
 * WebSocket Server for Real-time AI Testing
 * Based on Claude Flow WebSocket Tutorial
 */

const WebSocket = require('ws');
const http = require('http');
const url = require('url');
const crypto = require('crypto');

class AITestServer {
    constructor(port = 8080) {
        this.port = port;
        this.clients = new Map();
        this.tasks = new Map();
        this.sessions = new Map();

        this.setupServer();
        this.setupWebSocket();
    }

    setupServer() {
        this.server = http.createServer();
        this.server.listen(this.port, () => {
            console.log(`🚀 AI Test Server running on port ${this.port}`);
            console.log(`📡 WebSocket endpoint: ws://localhost:${this.port}`);
        });
    }

    setupWebSocket() {
        this.wss = new WebSocket.Server({
            server: this.server,
            path: '/ws'
        });

        this.wss.on('connection', (ws, request) => {
            const sessionId = this.generateSessionId();
            const clientInfo = {
                id: sessionId,
                ws: ws,
                connected: Date.now(),
                lastActivity: Date.now()
            };

            this.clients.set(sessionId, clientInfo);
            console.log(`✅ Client connected: ${sessionId}`);

            // Send welcome message
            this.sendMessage(ws, {
                type: 'connection',
                sessionId: sessionId,
                message: 'Connected to AI Test Server',
                timestamp: new Date().toISOString()
            });

            ws.on('message', (data) => {
                this.handleMessage(sessionId, data);
            });

            ws.on('close', () => {
                this.clients.delete(sessionId);
                console.log(`❌ Client disconnected: ${sessionId}`);
            });

            ws.on('error', (error) => {
                console.error(`WebSocket error for ${sessionId}:`, error);
            });
        });
    }

    handleMessage(sessionId, data) {
        try {
            const message = JSON.parse(data);
            const client = this.clients.get(sessionId);

            if (!client) return;

            client.lastActivity = Date.now();

            console.log(`📨 Message from ${sessionId}:`, message.type);

            switch (message.type) {
                case 'test_request':
                    this.handleTestRequest(sessionId, message);
                    break;
                case 'code_execution':
                    this.handleCodeExecution(sessionId, message);
                    break;
                case 'design_validation':
                    this.handleDesignValidation(sessionId, message);
                    break;
                case 'print_spec_test':
                    this.handlePrintSpecTest(sessionId, message);
                    break;
                case 'canvas_analysis':
                    this.handleCanvasAnalysis(sessionId, message);
                    break;
                case 'reference_line_validation':
                    this.handleReferenceLineValidation(sessionId, message);
                    break;
                case 'size_calculation':
                    this.handleSizeCalculation(sessionId, message);
                    break;
                case 'woocommerce_sync_test':
                    this.handleWooCommerceSyncTest(sessionId, message);
                    break;
                case 'ping':
                    this.sendMessage(client.ws, { type: 'pong', timestamp: new Date().toISOString() });
                    break;
                default:
                    this.sendMessage(client.ws, {
                        type: 'error',
                        message: `Unknown message type: ${message.type}`
                    });
            }
        } catch (error) {
            console.error(`Error handling message from ${sessionId}:`, error);
            const client = this.clients.get(sessionId);
            if (client) {
                this.sendMessage(client.ws, {
                    type: 'error',
                    message: 'Invalid JSON message'
                });
            }
        }
    }

    async handleTestRequest(sessionId, message) {
        const taskId = this.generateTaskId();
        const client = this.clients.get(sessionId);

        if (!client) return;

        // Store task
        this.tasks.set(taskId, {
            id: taskId,
            sessionId: sessionId,
            type: 'test_request',
            data: message.data,
            status: 'running',
            startTime: Date.now(),
            results: []
        });

        // Send task started
        this.sendMessage(client.ws, {
            type: 'task_started',
            taskId: taskId,
            message: 'Test execution started',
            timestamp: new Date().toISOString()
        });

        // Simulate test execution with progress updates
        await this.simulateTestExecution(taskId, message.data);
    }

    async handleCodeExecution(sessionId, message) {
        const taskId = this.generateTaskId();
        const client = this.clients.get(sessionId);

        if (!client) return;

        // Send execution started
        this.sendMessage(client.ws, {
            type: 'execution_started',
            taskId: taskId,
            code: message.code,
            timestamp: new Date().toISOString()
        });

        // Simulate code execution
        try {
            // Here you could integrate with actual PHP/JavaScript execution
            // For now, we'll simulate the execution
            await this.delay(1000);

            const mockResult = {
                success: true,
                output: `Executed: ${message.code.substring(0, 100)}...`,
                executionTime: Math.random() * 1000,
                errors: []
            };

            this.sendMessage(client.ws, {
                type: 'execution_result',
                taskId: taskId,
                result: mockResult,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.sendMessage(client.ws, {
                type: 'execution_error',
                taskId: taskId,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async handleDesignValidation(sessionId, message) {
        const taskId = this.generateTaskId();
        const client = this.clients.get(sessionId);

        if (!client) return;

        this.sendMessage(client.ws, {
            type: 'validation_started',
            taskId: taskId,
            designData: message.designData,
            timestamp: new Date().toISOString()
        });

        // Simulate design validation
        await this.delay(2000);

        const validationResult = {
            isValid: Math.random() > 0.3,
            issues: [],
            suggestions: [
                'Consider adjusting text size for better readability',
                'Check color contrast for accessibility',
                'Verify image resolution for print quality'
            ],
            score: Math.floor(Math.random() * 40) + 60
        };

        if (!validationResult.isValid) {
            validationResult.issues = [
                'Text too small for print resolution',
                'Image resolution below 300 DPI',
                'Design exceeds printable area'
            ];
        }

        this.sendMessage(client.ws, {
            type: 'validation_result',
            taskId: taskId,
            result: validationResult,
            timestamp: new Date().toISOString()
        });
    }

    async handlePrintSpecTest(sessionId, message) {
        const taskId = this.generateTaskId();
        const client = this.clients.get(sessionId);

        if (!client) return;

        this.sendMessage(client.ws, {
            type: 'print_spec_started',
            taskId: taskId,
            designData: message.designData,
            timestamp: new Date().toISOString()
        });

        // Analyze print specifications
        await this.delay(1500);

        const printSpecResult = this.analyzePrintSpecifications(message.designData);

        this.sendMessage(client.ws, {
            type: 'print_spec_result',
            taskId: taskId,
            result: printSpecResult,
            timestamp: new Date().toISOString()
        });
    }

    async handleCanvasAnalysis(sessionId, message) {
        const taskId = this.generateTaskId();
        const client = this.clients.get(sessionId);

        if (!client) return;

        this.sendMessage(client.ws, {
            type: 'canvas_analysis_started',
            taskId: taskId,
            timestamp: new Date().toISOString()
        });

        await this.delay(2000);

        const canvasAnalysis = this.analyzeCanvasElements(message.canvasData);

        this.sendMessage(client.ws, {
            type: 'canvas_analysis_result',
            taskId: taskId,
            result: canvasAnalysis,
            timestamp: new Date().toISOString()
        });
    }

    async handleReferenceLineValidation(sessionId, message) {
        const taskId = this.generateTaskId();
        const client = this.clients.get(sessionId);

        if (!client) return;

        this.sendMessage(client.ws, {
            type: 'reference_line_validation_started',
            taskId: taskId,
            timestamp: new Date().toISOString()
        });

        await this.delay(1000);

        const validationResult = this.validateReferenceLines(message.referenceLines);

        this.sendMessage(client.ws, {
            type: 'reference_line_validation_result',
            taskId: taskId,
            result: validationResult,
            timestamp: new Date().toISOString()
        });
    }

    async handleSizeCalculation(sessionId, message) {
        const taskId = this.generateTaskId();
        const client = this.clients.get(sessionId);

        if (!client) return;

        this.sendMessage(client.ws, {
            type: 'size_calculation_started',
            taskId: taskId,
            timestamp: new Date().toISOString()
        });

        await this.delay(800);

        const sizeCalculation = this.calculateSizeFactors(message.dimensions, message.referenceData);

        this.sendMessage(client.ws, {
            type: 'size_calculation_result',
            taskId: taskId,
            result: sizeCalculation,
            timestamp: new Date().toISOString()
        });
    }

    async handleWooCommerceSyncTest(sessionId, message) {
        const taskId = this.generateTaskId();
        const client = this.clients.get(sessionId);

        if (!client) return;

        this.sendMessage(client.ws, {
            type: 'woocommerce_sync_started',
            taskId: taskId,
            timestamp: new Date().toISOString()
        });

        await this.delay(2500);

        const syncResult = this.simulateWooCommerceSync(message.productData);

        this.sendMessage(client.ws, {
            type: 'woocommerce_sync_result',
            taskId: taskId,
            result: syncResult,
            timestamp: new Date().toISOString()
        });
    }

    analyzePrintSpecifications(designData) {
        const specs = {
            dpi: designData.dpi || 72,
            colorProfile: designData.color_profile || 'RGB',
            dimensions: designData.dimensions || {},
            bleed: designData.print_specifications?.bleed || 0,
            safeArea: designData.print_specifications?.safe_area || 0
        };

        const issues = [];
        const recommendations = [];

        // DPI Check
        if (specs.dpi < 300) {
            issues.push(`DPI zu niedrig: ${specs.dpi} (empfohlen: 300+)`);
            recommendations.push('Erhöhe die Auflösung auf mindestens 300 DPI für optimale Druckqualität');
        }

        // Color Profile Check
        if (specs.colorProfile !== 'CMYK') {
            issues.push(`Farbprofil nicht optimal: ${specs.colorProfile} (empfohlen: CMYK)`);
            recommendations.push('Verwende CMYK-Farbprofil für professionelle Druckergebnisse');
        }

        // Bleed Check
        if (specs.bleed < 3) {
            issues.push(`Anschnitt zu klein: ${specs.bleed}mm (empfohlen: 3mm+)`);
            recommendations.push('Füge mindestens 3mm Anschnitt für saubere Schnittergebnisse hinzu');
        }

        // Safe Area Check
        if (specs.safeArea < 5) {
            issues.push(`Sicherheitsbereich zu klein: ${specs.safeArea}mm (empfohlen: 5mm+)`);
            recommendations.push('Halte mindestens 5mm Abstand zu wichtigen Elementen');
        }

        const score = Math.max(0, 100 - (issues.length * 20));

        return {
            specifications: specs,
            issues: issues,
            recommendations: recommendations,
            score: score,
            passed: score >= 80,
            quality: score >= 90 ? 'Excellent' : score >= 80 ? 'Good' : score >= 60 ? 'Fair' : 'Poor'
        };
    }

    analyzeCanvasElements(canvasData) {
        if (!canvasData || !canvasData.elements) {
            return {
                error: 'No canvas data provided',
                elementCount: 0,
                analysis: {}
            };
        }

        const elements = canvasData.elements;
        const analysis = {
            totalElements: elements.length,
            textElements: elements.filter(e => e.type === 'text' || e.type === 'i-text').length,
            imageElements: elements.filter(e => e.type === 'image').length,
            shapeElements: elements.filter(e => ['rect', 'circle', 'path'].includes(e.type)).length,
            issues: [],
            recommendations: []
        };

        // Analyze text elements
        const textElements = elements.filter(e => e.type === 'text' || e.type === 'i-text');
        textElements.forEach((element, index) => {
            if (element.fontSize && element.fontSize < 8) {
                analysis.issues.push(`Text Element ${index + 1}: Schriftgröße zu klein (${element.fontSize}pt)`);
                analysis.recommendations.push('Verwende mindestens 8pt Schriftgröße für bessere Lesbarkeit');
            }
        });

        // Analyze image elements
        const imageElements = elements.filter(e => e.type === 'image');
        imageElements.forEach((element, index) => {
            if (element.width && element.height) {
                const aspectRatio = element.width / element.height;
                if (aspectRatio > 3 || aspectRatio < 0.33) {
                    analysis.issues.push(`Bild Element ${index + 1}: Ungewöhnliches Seitenverhältnis`);
                    analysis.recommendations.push('Überprüfe das Seitenverhältnis der Bilder');
                }
            }
        });

        // Overall recommendations
        if (analysis.totalElements > 20) {
            analysis.recommendations.push('Viele Elemente gefunden - überprüfe die Performance');
        }

        if (analysis.textElements === 0 && analysis.imageElements === 0) {
            analysis.issues.push('Kein Inhalt gefunden');
            analysis.recommendations.push('Füge Text oder Bilder zu deinem Design hinzu');
        }

        analysis.score = Math.max(0, 100 - (analysis.issues.length * 15));
        analysis.complexity = analysis.totalElements > 15 ? 'High' : analysis.totalElements > 8 ? 'Medium' : 'Low';

        return analysis;
    }

    validateReferenceLines(referenceLines) {
        if (!referenceLines || !Array.isArray(referenceLines)) {
            return {
                valid: false,
                issues: ['Keine Referenzlinien gefunden'],
                recommendations: ['Füge Referenzlinien für bessere Positionierung hinzu']
            };
        }

        const issues = [];
        const recommendations = [];

        referenceLines.forEach((line, index) => {
            if (!line.x1 && !line.y1 && !line.x2 && !line.y2) {
                issues.push(`Referenzlinie ${index + 1}: Ungültige Koordinaten`);
            }

            if (line.name && line.name.length < 3) {
                recommendations.push(`Referenzlinie ${index + 1}: Verwende aussagekräftige Namen`);
            }
        });

        const overlappingLines = this.findOverlappingLines(referenceLines);
        if (overlappingLines.length > 0) {
            issues.push(`${overlappingLines.length} überlappende Referenzlinien gefunden`);
            recommendations.push('Überprüfe überlappende Referenzlinien für bessere Klarheit');
        }

        return {
            valid: issues.length === 0,
            lineCount: referenceLines.length,
            issues: issues,
            recommendations: recommendations,
            overlappingLines: overlappingLines,
            score: Math.max(0, 100 - (issues.length * 25))
        };
    }

    findOverlappingLines(lines) {
        const overlapping = [];
        for (let i = 0; i < lines.length; i++) {
            for (let j = i + 1; j < lines.length; j++) {
                if (this.linesOverlap(lines[i], lines[j])) {
                    overlapping.push({ line1: i, line2: j });
                }
            }
        }
        return overlapping;
    }

    linesOverlap(line1, line2) {
        // Simple overlap detection - you could make this more sophisticated
        const margin = 5;
        return Math.abs(line1.x1 - line2.x1) < margin &&
               Math.abs(line1.y1 - line2.y1) < margin;
    }

    calculateSizeFactors(dimensions, referenceData) {
        if (!dimensions || !dimensions.width || !dimensions.height) {
            return {
                error: 'Invalid dimensions provided',
                factors: {}
            };
        }

        const baseWidth = referenceData?.baseWidth || 100;
        const baseHeight = referenceData?.baseHeight || 100;

        const factors = {
            widthFactor: dimensions.width / baseWidth,
            heightFactor: dimensions.height / baseHeight,
            aspectRatio: dimensions.width / dimensions.height,
            area: dimensions.width * dimensions.height
        };

        const standardSizes = [
            { name: 'A4', width: 210, height: 297 },
            { name: 'A5', width: 148, height: 210 },
            { name: 'Business Card', width: 85, height: 55 },
            { name: 'Flyer', width: 105, height: 148 }
        ];

        let closestSize = null;
        let smallestDiff = Infinity;

        standardSizes.forEach(size => {
            const diff = Math.abs(dimensions.width - size.width) + Math.abs(dimensions.height - size.height);
            if (diff < smallestDiff) {
                smallestDiff = diff;
                closestSize = size;
            }
        });

        return {
            dimensions: dimensions,
            factors: factors,
            closestStandardSize: closestSize,
            difference: smallestDiff,
            recommendations: this.getSizeRecommendations(dimensions, factors)
        };
    }

    getSizeRecommendations(dimensions, factors) {
        const recommendations = [];

        if (factors.aspectRatio < 0.5 || factors.aspectRatio > 2.0) {
            recommendations.push('Ungewöhnliches Seitenverhältnis - überprüfe die Proportionen');
        }

        if (dimensions.width < 50 || dimensions.height < 50) {
            recommendations.push('Sehr kleine Abmessungen - könnte schwer lesbar werden');
        }

        if (dimensions.width > 500 || dimensions.height > 500) {
            recommendations.push('Große Abmessungen - achte auf Dateigröße und Performance');
        }

        return recommendations;
    }

    simulateWooCommerceSync(productData) {
        const syncResults = {
            productsSynced: Math.floor(Math.random() * 10) + 1,
            variationsCreated: Math.floor(Math.random() * 20) + 5,
            pricesUpdated: Math.floor(Math.random() * 15) + 3,
            errors: [],
            warnings: [],
            success: true
        };

        // Simulate some potential issues
        if (Math.random() > 0.7) {
            syncResults.warnings.push('Einige Produktvarianten haben keine Preise');
        }

        if (Math.random() > 0.8) {
            syncResults.errors.push('SKU-Konflikt bei Produkt XYZ');
            syncResults.success = false;
        }

        if (Math.random() > 0.6) {
            syncResults.warnings.push('Bildgrößen entsprechen nicht den WooCommerce Standards');
        }

        const executionTime = Math.floor(Math.random() * 3000) + 1000;

        return {
            ...syncResults,
            executionTime: executionTime,
            timestamp: new Date().toISOString(),
            recommendations: this.getWooCommerceSyncRecommendations(syncResults)
        };
    }

    getWooCommerceSyncRecommendations(syncResults) {
        const recommendations = [];

        if (syncResults.errors.length > 0) {
            recommendations.push('Behebe die Fehler vor dem nächsten Sync');
        }

        if (syncResults.warnings.length > 0) {
            recommendations.push('Überprüfe die Warnungen für optimale Performance');
        }

        if (syncResults.productsSynced === 0) {
            recommendations.push('Keine Produkte synchronisiert - überprüfe die Verbindung');
        }

        recommendations.push('Führe regelmäßige Backups vor größeren Sync-Operationen durch');

        return recommendations;
    }

    async simulateTestExecution(taskId, testData) {
        const task = this.tasks.get(taskId);
        if (!task) return;

        const client = this.clients.get(task.sessionId);
        if (!client) return;

        // Progress updates
        const steps = [
            'Initializing test environment',
            'Loading design data',
            'Validating print specifications',
            'Running quality checks',
            'Generating test results'
        ];

        for (let i = 0; i < steps.length; i++) {
            await this.delay(800);

            this.sendMessage(client.ws, {
                type: 'progress_update',
                taskId: taskId,
                step: steps[i],
                progress: ((i + 1) / steps.length) * 100,
                timestamp: new Date().toISOString()
            });
        }

        // Final results
        const finalResult = {
            success: true,
            testsRun: 12,
            testsPassed: 10,
            testsFailed: 2,
            executionTime: Date.now() - task.startTime,
            details: {
                designValidation: 'PASS',
                printSpecification: 'PASS',
                colorProfile: 'FAIL',
                imageResolution: 'FAIL'
            }
        };

        task.status = 'completed';
        task.results = finalResult;

        this.sendMessage(client.ws, {
            type: 'task_completed',
            taskId: taskId,
            result: finalResult,
            timestamp: new Date().toISOString()
        });
    }

    sendMessage(ws, message) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    generateSessionId() {
        return crypto.randomBytes(16).toString('hex');
    }

    generateTaskId() {
        return `task_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // API endpoints for monitoring
    getStats() {
        return {
            connectedClients: this.clients.size,
            activeTasks: Array.from(this.tasks.values()).filter(t => t.status === 'running').length,
            completedTasks: Array.from(this.tasks.values()).filter(t => t.status === 'completed').length,
            uptime: process.uptime()
        };
    }
}

// Start server
const server = new AITestServer(process.env.PORT || 8080);

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Shutting down server...');
    server.wss.close();
    server.server.close();
    process.exit(0);
});
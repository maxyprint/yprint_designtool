/**
 * VintedBot Genesis v2.0 - Enhanced Backend Server
 * Genesis v2.0 Backend Agent Implementation
 *
 * Features:
 * - 100% Authentic Data Extraction
 * - Advanced Anti-Detection Mechanisms
 * - Self-Healing Error Recovery
 * - Real-time WebSocket Communication
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { VintedScrapingEngine } from './services/VintedScrapingEngine.js';
import { DataValidationService } from './services/DataValidationService.js';
import { AntiDetectionService } from './services/AntiDetectionService.js';
import { HealthMonitoringService } from './services/HealthMonitoringService.js';
import { AgentLogger } from './utils/AgentLogger.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Genesis v2.0 Services Initialization
const scrapingEngine = new VintedScrapingEngine();
const dataValidator = new DataValidationService();
const antiDetection = new AntiDetectionService();
const healthMonitor = new HealthMonitoringService();
const logger = new AgentLogger('BackendAgent');

// Enhanced Middleware Stack
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws://localhost:*"]
    }
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.static('dist'));

// Genesis v2.0 Agent Decision Logging
app.use((req, res, next) => {
  logger.logAgentDecision('HTTP_REQUEST', {
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent')
  });
  next();
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const healthStatus = healthMonitor.getSystemHealth();
  res.json({
    status: 'Genesis v2.0 Backend Agent Online',
    timestamp: new Date().toISOString(),
    health: healthStatus,
    agent: 'BackendAgent',
    version: '2.0.0'
  });
});

// Enhanced Vinted Scraping Endpoint
app.get('/api/vinted/trending', async (req, res) => {
  try {
    logger.logAgentDecision('SCRAPING_INITIATED', {
      endpoint: '/api/vinted/trending',
      timestamp: new Date().toISOString()
    });

    // Apply anti-detection measures
    await antiDetection.applyRandomDelay();
    const headers = antiDetection.generateHeaders();

    // Execute authenticated scraping
    const rawData = await scrapingEngine.scrapeTrendingProducts(headers);

    // Validate data authenticity
    const validatedData = await dataValidator.validateProductData(rawData);

    // Log validation results
    logger.logAgentDecision('DATA_VALIDATION', {
      totalProducts: validatedData.length,
      validProducts: validatedData.filter(p => p.isAuthentic).length,
      timestamp: new Date().toISOString()
    });

    // Broadcast to WebSocket clients
    broadcastToClients({
      type: 'TRENDING_UPDATE',
      data: validatedData,
      timestamp: new Date().toISOString(),
      source: 'Genesis v2.0 Backend Agent'
    });

    res.json({
      success: true,
      data: validatedData,
      metadata: {
        scrapedAt: new Date().toISOString(),
        totalProducts: validatedData.length,
        validProducts: validatedData.filter(p => p.isAuthentic).length,
        agent: 'BackendAgent v2.0'
      }
    });

  } catch (error) {
    logger.logError('SCRAPING_ERROR', error);

    // Genesis v2.0 Self-Healing Error Recovery
    const recoveryStrategy = await healthMonitor.triggerSelfHealing(error);

    res.status(500).json({
      success: false,
      error: 'Scraping failed - Self-healing initiated',
      recoveryStrategy,
      timestamp: new Date().toISOString(),
      agent: 'BackendAgent v2.0'
    });
  }
});

// Individual Product Scraping Endpoint
app.get('/api/vinted/product/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    logger.logAgentDecision('INDIVIDUAL_PRODUCT_SCRAPE', {
      productId,
      timestamp: new Date().toISOString()
    });

    await antiDetection.applyRandomDelay();
    const headers = antiDetection.generateHeaders();

    const productData = await scrapingEngine.scrapeIndividualProduct(productId, headers);
    const validatedProduct = await dataValidator.validateSingleProduct(productData);

    if (!validatedProduct.isAuthentic) {
      logger.logWarning('INVALID_PRODUCT_DATA', { productId, reason: 'Failed authenticity check' });
    }

    res.json({
      success: true,
      data: validatedProduct,
      metadata: {
        scrapedAt: new Date().toISOString(),
        isAuthentic: validatedProduct.isAuthentic,
        agent: 'BackendAgent v2.0'
      }
    });

  } catch (error) {
    logger.logError('INDIVIDUAL_SCRAPE_ERROR', error);
    res.status(500).json({
      success: false,
      error: 'Individual product scraping failed',
      timestamp: new Date().toISOString()
    });
  }
});

// WebSocket Connection Handler
wss.on('connection', (ws) => {
  logger.logAgentDecision('WEBSOCKET_CONNECTION', {
    timestamp: new Date().toISOString(),
    clientCount: wss.clients.size
  });

  ws.send(JSON.stringify({
    type: 'CONNECTION_ESTABLISHED',
    message: 'Connected to Genesis v2.0 Backend Agent',
    timestamp: new Date().toISOString()
  }));

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'REQUEST_TRENDING') {
        // Trigger real-time scraping
        const trendingData = await scrapingEngine.scrapeTrendingProducts();
        ws.send(JSON.stringify({
          type: 'TRENDING_DATA',
          data: trendingData,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      logger.logError('WEBSOCKET_MESSAGE_ERROR', error);
    }
  });

  ws.on('close', () => {
    logger.logAgentDecision('WEBSOCKET_DISCONNECT', {
      timestamp: new Date().toISOString(),
      clientCount: wss.clients.size - 1
    });
  });
});

// Broadcast helper function
function broadcastToClients(data: any) {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
}

// Genesis v2.0 Health Monitoring
setInterval(() => {
  const healthStatus = healthMonitor.performHealthCheck();
  logger.logAgentDecision('HEALTH_CHECK', healthStatus);
}, 60000); // Every minute

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  logger.logError('UNHANDLED_ERROR', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
    agent: 'BackendAgent v2.0'
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  logger.logAgentDecision('SERVER_STARTED', {
    port: PORT,
    timestamp: new Date().toISOString(),
    agent: 'Genesis v2.0 Backend Agent'
  });

  console.log(`🚀 Genesis v2.0 Backend Agent running on http://localhost:${PORT}`);
  console.log(`🤖 WebSocket server ready for real-time communication`);
  console.log(`🛡️ Anti-detection and data validation active`);
});
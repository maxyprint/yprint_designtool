/**
 * VintedStore - Genesis v2.0 State Management with Zustand
 * Enhanced with Real-time Updates and Agent Communication
 */

import { create } from 'zustand';
import { websocketService } from '../services/websocketService';
import { apiService } from '../services/apiService';

export interface VintedProduct {
  id: string;
  title: string;
  price: string;
  likes: number;
  views: number;
  url: string;
  imageUrl: string;
  isAuthentic: boolean;
  scrapedAt: string;
}

export interface SystemHealth {
  status: string;
  systemUptime: number;
  memoryUsage: any;
  errorCount: number;
  successRate: number;
  lastScrapingSuccess: string | null;
}

export interface AgentLog {
  timestamp: string;
  agent: string;
  action: string;
  context: any;
  level?: string;
}

interface VintedState {
  // Product Data
  products: VintedProduct[];
  loading: boolean;
  error: string | null;
  lastUpdate: string | null;

  // WebSocket Connection
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';

  // System Monitoring
  systemHealth: SystemHealth | null;
  agentLogs: AgentLog[];

  // Statistics
  totalProducts: number;
  authenticProducts: number;
  scrappingStats: {
    successRate: number;
    totalAttempts: number;
    lastSuccess: string | null;
  };
}

interface VintedActions {
  // Product Actions
  fetchTrendingProducts: () => Promise<void>;
  setProducts: (products: VintedProduct[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // WebSocket Actions
  initializeWebSocket: () => void;
  setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
  handleWebSocketMessage: (data: any) => void;

  // System Monitoring
  updateSystemHealth: (health: SystemHealth) => void;
  addAgentLog: (log: AgentLog) => void;
  clearAgentLogs: () => void;

  // Statistics
  updateStatistics: () => void;
}

type VintedStore = VintedState & VintedActions;

export const useVintedStore = create<VintedStore>((set, get) => ({
  // Initial State
  products: [],
  loading: false,
  error: null,
  lastUpdate: null,
  isConnected: false,
  connectionStatus: 'disconnected',
  systemHealth: null,
  agentLogs: [],
  totalProducts: 0,
  authenticProducts: 0,
  scrappingStats: {
    successRate: 0,
    totalAttempts: 0,
    lastSuccess: null
  },

  // Product Actions
  fetchTrendingProducts: async () => {
    const state = get();

    // Don't fetch if already loading
    if (state.loading) return;

    set({ loading: true, error: null });

    try {
      console.log('🔄 Fetching trending products via Genesis v2.0 Backend Agent');

      const response = await apiService.getTrendingProducts();

      if (response.success) {
        set({
          products: response.data,
          loading: false,
          lastUpdate: new Date().toISOString(),
          error: null
        });

        // Update statistics
        get().updateStatistics();

        // Log success
        get().addAgentLog({
          timestamp: new Date().toISOString(),
          agent: 'FrontendAgent',
          action: 'FETCH_PRODUCTS_SUCCESS',
          context: {
            productCount: response.data.length,
            authenticCount: response.data.filter((p: VintedProduct) => p.isAuthentic).length
          }
        });
      } else {
        set({
          loading: false,
          error: 'Failed to fetch products'
        });

        get().addAgentLog({
          timestamp: new Date().toISOString(),
          agent: 'FrontendAgent',
          action: 'FETCH_PRODUCTS_ERROR',
          context: { error: 'API request failed' },
          level: 'ERROR'
        });
      }
    } catch (error: any) {
      console.error('❌ Error fetching products:', error);

      set({
        loading: false,
        error: error.message || 'Failed to fetch products'
      });

      get().addAgentLog({
        timestamp: new Date().toISOString(),
        agent: 'FrontendAgent',
        action: 'FETCH_PRODUCTS_EXCEPTION',
        context: {
          error: error.message,
          stack: error.stack?.substring(0, 200)
        },
        level: 'ERROR'
      });
    }
  },

  setProducts: (products) => {
    set({ products });
    get().updateStatistics();
  },

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  // WebSocket Actions
  initializeWebSocket: () => {
    const { handleWebSocketMessage, setConnectionStatus, addAgentLog } = get();

    console.log('🔌 Initializing WebSocket connection to Genesis v2.0 Backend');

    websocketService.connect(
      'ws://localhost:3001',
      {
        onOpen: () => {
          console.log('✅ WebSocket connected to Genesis v2.0 Backend Agent');
          setConnectionStatus('connected');
          set({ isConnected: true });

          addAgentLog({
            timestamp: new Date().toISOString(),
            agent: 'WebSocketService',
            action: 'CONNECTION_ESTABLISHED',
            context: { url: 'ws://localhost:3001' }
          });
        },

        onMessage: handleWebSocketMessage,

        onClose: () => {
          console.log('🔌 WebSocket disconnected');
          setConnectionStatus('disconnected');
          set({ isConnected: false });

          addAgentLog({
            timestamp: new Date().toISOString(),
            agent: 'WebSocketService',
            action: 'CONNECTION_CLOSED',
            context: {},
            level: 'WARNING'
          });
        },

        onError: (error) => {
          console.error('❌ WebSocket error:', error);
          setConnectionStatus('error');
          set({ isConnected: false });

          addAgentLog({
            timestamp: new Date().toISOString(),
            agent: 'WebSocketService',
            action: 'CONNECTION_ERROR',
            context: { error: error.toString() },
            level: 'ERROR'
          });
        }
      }
    );
  },

  setConnectionStatus: (status) => {
    set({ connectionStatus: status });
  },

  handleWebSocketMessage: (data) => {
    const { addAgentLog, setProducts } = get();

    console.log('📨 WebSocket message received:', data.type);

    switch (data.type) {
      case 'TRENDING_UPDATE':
        setProducts(data.data);
        addAgentLog({
          timestamp: new Date().toISOString(),
          agent: 'WebSocketService',
          action: 'TRENDING_UPDATE_RECEIVED',
          context: {
            productCount: data.data.length,
            source: data.source
          }
        });
        break;

      case 'SYSTEM_HEALTH':
        get().updateSystemHealth(data.health);
        break;

      case 'AGENT_LOG':
        addAgentLog(data.log);
        break;

      default:
        console.log('🤷‍♂️ Unknown WebSocket message type:', data.type);
    }
  },

  // System Monitoring
  updateSystemHealth: (health) => {
    set({ systemHealth: health });
  },

  addAgentLog: (log) => {
    const { agentLogs } = get();
    const newLogs = [log, ...agentLogs].slice(0, 100); // Keep last 100 logs
    set({ agentLogs: newLogs });
  },

  clearAgentLogs: () => {
    set({ agentLogs: [] });
  },

  // Statistics
  updateStatistics: () => {
    const { products } = get();
    const authenticProducts = products.filter(p => p.isAuthentic).length;

    set({
      totalProducts: products.length,
      authenticProducts,
      scrappingStats: {
        successRate: products.length > 0 ? (authenticProducts / products.length) * 100 : 0,
        totalAttempts: products.length,
        lastSuccess: products.length > 0 ? new Date().toISOString() : null
      }
    });
  }
}));
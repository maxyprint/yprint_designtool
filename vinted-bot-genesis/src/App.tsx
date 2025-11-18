/**
 * VintedBot Genesis v2.0 - Main Application Component
 * Genesis v2.0 Frontend Agent - Enhanced UI with Real-time Updates
 */

import React, { useEffect } from 'react';
import { VintedDashboard } from './components/VintedDashboard';
import { SystemStatus } from './components/SystemStatus';
import { useVintedStore } from './store/vintedStore';
import { websocketService } from './services/websocketService';
import { Header } from './components/Header';

function App() {
  const {
    isConnected,
    connectionStatus,
    systemHealth,
    agentLogs,
    fetchTrendingProducts,
    initializeWebSocket
  } = useVintedStore();

  useEffect(() => {
    console.log('🚀 Genesis v2.0 App - Initializing Components');

    // Initialize WebSocket connection
    initializeWebSocket();

    // Fetch initial data
    fetchTrendingProducts();

    // Set up periodic updates
    const interval = setInterval(() => {
      if (isConnected) {
        fetchTrendingProducts();
      }
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(interval);
      websocketService.disconnect();
    };
  }, [initializeWebSocket, fetchTrendingProducts, isConnected]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* System Status Bar */}
        <div className="mb-8">
          <SystemStatus
            isConnected={isConnected}
            connectionStatus={connectionStatus}
            systemHealth={systemHealth}
            agentLogs={agentLogs}
          />
        </div>

        {/* Main Dashboard */}
        <VintedDashboard />
      </main>

      {/* Genesis v2.0 Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-4">
            <span className="text-sm opacity-75">
              Powered by Genesis v2.0 Multi-Agent System
            </span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span className="text-xs">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs opacity-50">
            🤖 Autonomous AI • 🛡️ Authentic Data • 🔄 Real-time Updates
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
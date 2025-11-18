/**
 * SystemStatus Component - Genesis v2.0 Real-time Monitoring
 */

import React from 'react';
import type { SystemHealth, AgentLog } from '../store/vintedStore';

interface SystemStatusProps {
  isConnected: boolean;
  connectionStatus: string;
  systemHealth: SystemHealth | null;
  agentLogs: AgentLog[];
}

export const SystemStatus: React.FC<SystemStatusProps> = ({
  isConnected,
  connectionStatus,
  systemHealth,
  agentLogs
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'connecting': return 'text-yellow-600 bg-yellow-100';
      case 'disconnected': return 'text-red-600 bg-red-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const recentLogs = agentLogs.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          🤖 Genesis v2.0 System Status
        </h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(connectionStatus)}`}>
          {connectionStatus.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Connection Status */}
        <div className="text-center">
          <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <div className="text-sm font-medium text-gray-900">WebSocket</div>
          <div className="text-xs text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        {/* System Uptime */}
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600 mb-1">
            {systemHealth ? formatUptime(systemHealth.systemUptime) : '0s'}
          </div>
          <div className="text-sm font-medium text-gray-900">Uptime</div>
          <div className="text-xs text-gray-500">System Runtime</div>
        </div>

        {/* Success Rate */}
        <div className="text-center">
          <div className="text-lg font-bold text-green-600 mb-1">
            {systemHealth ? Math.round(systemHealth.successRate) : 0}%
          </div>
          <div className="text-sm font-medium text-gray-900">Success Rate</div>
          <div className="text-xs text-gray-500">Scraping Accuracy</div>
        </div>

        {/* Memory Usage */}
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600 mb-1">
            {systemHealth ? Math.round(systemHealth.memoryUsage.heapUsed / 1024 / 1024) : 0}MB
          </div>
          <div className="text-sm font-medium text-gray-900">Memory</div>
          <div className="text-xs text-gray-500">Heap Usage</div>
        </div>
      </div>

      {/* Recent Agent Activity */}
      {recentLogs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            🔄 Recent Agent Activity
          </h3>
          <div className="space-y-2">
            {recentLogs.map((log, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${
                    log.level === 'ERROR' ? 'bg-red-400' :
                    log.level === 'WARNING' ? 'bg-yellow-400' :
                    'bg-green-400'
                  }`}></span>
                  <span className="font-medium text-gray-700">{log.agent}</span>
                  <span className="text-gray-500">{log.action}</span>
                </div>
                <span className="text-gray-400">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
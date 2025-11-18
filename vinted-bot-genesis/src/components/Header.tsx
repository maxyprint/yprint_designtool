/**
 * Header Component - Genesis v2.0 Navigation
 */

import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              🤖 VintedBot Genesis v2.0
            </h1>
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              AI-Powered Trend Analysis
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Status:</span>
              <span className="ml-1 text-green-600">🟢 Online</span>
            </div>

            <div className="text-sm text-gray-600">
              <span className="font-medium">Mode:</span>
              <span className="ml-1">100% Authentic Data</span>
            </div>
          </div>
        </div>

        <div className="mt-2 text-sm text-gray-500">
          Vollständig autonomes Multi-Agent System • Real-time Vinted Scraping • Anti-Detection
        </div>
      </div>
    </header>
  );
};
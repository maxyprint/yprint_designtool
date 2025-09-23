/**
 * VintedDashboard Component - Genesis v2.0 Main Dashboard
 */

import React from 'react';
import { useVintedStore } from '../store/vintedStore';

export const VintedDashboard: React.FC = () => {
  const {
    products,
    loading,
    error,
    lastUpdate,
    totalProducts,
    authenticProducts,
    fetchTrendingProducts
  } = useVintedStore();

  const handleRefresh = () => {
    fetchTrendingProducts();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">🤖 Genesis v2.0 Agents scraping Vinted data...</p>
          <p className="text-sm text-gray-500 mt-2">Applying anti-detection measures</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            🔄 Retry Scraping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            📊 Vinted Trend Analysis Dashboard
          </h2>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Refresh Data</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{totalProducts}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{authenticProducts}</div>
            <div className="text-sm text-gray-600">Authentic Data</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {totalProducts > 0 ? Math.round((authenticProducts / totalProducts) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Data Quality</div>
          </div>
        </div>

        {lastUpdate && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Last updated: {new Date(lastUpdate).toLocaleString()}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <div key={product.id || index} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Product Image */}
              {product.imageUrl && (
                <div className="aspect-square bg-gray-100">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"%3E%3C/rect%3E%3Ctext x="50%25" y="50%25" dominant-baseline="central" text-anchor="middle" fill="%236b7280"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}

              {/* Product Details */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {product.title || 'Unknown Product'}
                </h3>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-green-600">
                    {product.price || 'N/A'}
                  </span>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    product.isAuthentic
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {product.isAuthentic ? '✅ Authentic' : '⚠️ Unverified'}
                  </div>
                </div>

                {/* Engagement Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-500">
                      ❤️ {product.likes || 0}
                    </div>
                    <div className="text-xs text-gray-500">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-500">
                      👁️ {product.views || 0}
                    </div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                </div>

                {/* Action Button */}
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded text-center block hover:bg-green-700 transition-colors"
                >
                  View on Vinted 🔗
                </a>

                {/* Metadata */}
                <div className="mt-2 text-xs text-gray-400 text-center">
                  Scraped: {product.scrapedAt ? new Date(product.scrapedAt).toLocaleTimeString() : 'Unknown'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <p className="text-gray-600 mb-4">🔍 No products found</p>
          <p className="text-sm text-gray-500">Click "Refresh Data" to start scraping Vinted</p>
        </div>
      )}
    </div>
  );
};
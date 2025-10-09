#!/bin/bash

echo "🚨 CLEARING WORDPRESS CACHE FOR FABRIC.JS FIX TESTING"

# Clear WordPress cache if WP CLI is available
if command -v wp &> /dev/null; then
    echo "🧹 Clearing WordPress cache..."
    wp cache flush
    wp transient delete --all
    wp rewrite flush
    echo "✅ WordPress cache cleared"
else
    echo "⚠️ WP CLI not available, manual cache clearing needed"
fi

# Clear browser cache instructions
echo ""
echo "🌐 BROWSER CACHE CLEARING INSTRUCTIONS:"
echo "1. Open /designer page"
echo "2. Press F12 to open DevTools"
echo "3. Right-click refresh button → 'Empty Cache and Hard Reload'"
echo "4. OR Press Ctrl+Shift+R (Cmd+Shift+R on Mac)"
echo ""

# Restart Local if available
echo "🔄 RESTARTING LOCAL WORDPRESS (if needed)..."
echo "If using Local by Flywheel:"
echo "- Stop and Start the site in Local app"
echo "- This ensures all caches are cleared"
echo ""

echo "🎯 FABRIC.JS FIX VALIDATION READY"
echo "Open http://test-site.local/designer and check console for:"
echo "- '🎯 FABRIC EXPOSURE: Emergency fix - exposing fabric globally'"
echo "- 'window.fabric available: true'"
echo ""
echo "Run this script in browser console:"
echo "fetch('./manual-fabric-test.js').then(r=>r.text()).then(eval)"
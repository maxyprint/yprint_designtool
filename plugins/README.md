# 🔌 YPrint Plugins Directory

## Overview

This directory contains YPrint plugins that extend the core functionality without modifying the main Designer system.

## Plugin Architecture

### Core Principles
- **Zero Core Modification**: Plugins cannot modify Core-Designer code
- **Clean API**: Plugins access Designer via safe, controlled interface
- **Isolation**: Plugin failures don't affect Core-Designer
- **Hot Swap**: Plugins can be enabled/disabled without restart

### Plugin Structure

```javascript
const myPlugin = {
    name: 'my-plugin',
    version: '1.0.0',
    description: 'Plugin description',

    initialize(designerAPI) {
        // Plugin initialization
        // Access Designer via safe API only
    },

    destroy() {
        // Optional cleanup method
    }
};

// Register plugin
YPrintPlugins.register('my-plugin', myPlugin);
```

## Available Plugins

### PNG Export Plugin
- **Path**: `yprint-png-export/`
- **Purpose**: High-DPI PNG export functionality
- **Status**: In Development

## Plugin Development

### Requirements
1. Plugin must have `name` and `initialize()` method
2. Plugin must not access Core-Designer internals directly
3. Plugin should include version and cleanup methods
4. Plugin must handle errors gracefully

### Testing
Each plugin should include its own test file:
- `plugin-name/test.html` - Browser-based tests
- Validate plugin works in isolation
- Test integration with Designer API

### Security
- Plugins run in controlled environment
- No direct access to `window.designerWidgetInstance`
- API provides only safe, validated methods
- Plugin errors are contained and logged

## Installation

1. Place plugin directory in `/plugins/`
2. Include plugin script in page
3. Register plugin with framework
4. Enable via admin interface

## Support

For plugin development questions, refer to:
- Plugin Framework documentation
- Designer API reference
- Example plugin implementations
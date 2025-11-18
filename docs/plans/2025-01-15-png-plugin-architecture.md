# PNG Plugin Architecture Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Build a clean plugin architecture for PNG export that doesn't modify Core-Designer system

**Architecture:** Plugin Framework Registry with sandboxed PNG plugin that communicates via clean API, zero Core-Designer modifications

**Tech Stack:** Vanilla JavaScript, Plugin Registry Pattern, Event-driven Architecture, WordPress AJAX

---

## Agent Dispatch Strategy

**4 Independent Agents working in parallel:**
- **Agent 1**: Plugin Framework Builder (preserving-productive-tensions skill)
- **Agent 2**: PNG Plugin Developer (test-driven-development skill)
- **Agent 3**: Dependency Isolator (defense-in-depth skill)
- **Agent 4**: Plugin Lifecycle Manager (executing-plans skill)

---

### Task 1: Plugin Framework Foundation (Agent 1)

**Files:**
- Create: `public/js/yprint-plugin-framework.js`
- Create: `plugins/README.md`
- Test: `test-plugin-framework.html`

**Step 1: Write the failing test**
```javascript
// test-plugin-framework.html
describe('YPrint Plugin Framework', () => {
    it('should register plugins without affecting Core-Designer', () => {
        expect(window.YPrintPlugins).toBeDefined();
        expect(window.designerWidgetInstance).toBeDefined(); // Core intact
    });
});
```

**Step 2: Run test to make sure it fails**
```bash
# Open test-plugin-framework.html in browser
# Should fail: YPrintPlugins not defined
```

**Step 3: Implement minimal Plugin Registry**
```javascript
// public/js/yprint-plugin-framework.js
window.YPrintPlugins = {
    registry: new Map(),
    eventBus: new EventTarget(),

    register(pluginName, plugin) {
        if (this.validatePlugin(plugin)) {
            this.registry.set(pluginName, plugin);
            this.fireEvent('plugin:registered', { name: pluginName });
            return true;
        }
        return false;
    },

    validatePlugin(plugin) {
        return plugin.name && plugin.initialize && typeof plugin.initialize === 'function';
    },

    fireEvent(type, detail) {
        this.eventBus.dispatchEvent(new CustomEvent(type, { detail }));
    }
};
```

**Step 4: Run tests and make sure they pass**
**Step 5: Commit with message: "Add: Plugin Framework Registry foundation"**

---

### Task 2: Designer API Interface (Agent 1)

**Files:**
- Modify: `public/js/yprint-plugin-framework.js`
- Test: `test-plugin-framework.html`

**Step 1: Write failing test for Designer API**
```javascript
it('should provide safe Designer API to plugins', () => {
    const mockPlugin = { name: 'test', initialize: jest.fn() };
    YPrintPlugins.register('test', mockPlugin);
    YPrintPlugins.initializePlugin('test');
    expect(mockPlugin.initialize).toHaveBeenCalledWith(expect.objectContaining({
        getCanvas: expect.any(Function),
        getEventBus: expect.any(Function),
        addMenuItem: expect.any(Function)
    }));
});
```

**Step 2: Implement Designer API**
```javascript
// Add to yprint-plugin-framework.js
createDesignerAPI() {
    return {
        getCanvas: () => window.designerWidgetInstance?.fabricCanvas || null,
        getEventBus: () => this.eventBus,
        addMenuItem: (label, callback) => this.addPluginMenuItem(label, callback),

        // SECURITY: No direct access to Designer internals
        // Only safe, read-only methods exposed
    };
},

initializePlugin(pluginName) {
    const plugin = this.registry.get(pluginName);
    if (plugin) {
        plugin.initialize(this.createDesignerAPI());
    }
}
```

**Step 3: Test and commit: "Add: Safe Designer API for plugins"**

---

### Task 3: PNG Plugin Core (Agent 2)

**Files:**
- Create: `plugins/yprint-png-export/plugin.js`
- Create: `plugins/yprint-png-export/png-engine.js`
- Test: `plugins/yprint-png-export/test.html`

**Step 1: Write failing PNG export test**
```javascript
// plugins/yprint-png-export/test.html
describe('PNG Export Plugin', () => {
    it('should export canvas as high-DPI PNG without Core modification', () => {
        const pngPlugin = window.YPrintPNGPlugin;
        const mockCanvas = createMockCanvas();
        const result = pngPlugin.exportMultiResolutionPNG(mockCanvas);
        expect(result.print).toBeDefined();
        expect(result.preview).toBeDefined();
        expect(result.thumbnail).toBeDefined();
    });
});
```

**Step 2: Implement PNG Plugin**
```javascript
// plugins/yprint-png-export/plugin.js
window.YPrintPNGPlugin = {
    name: 'yprint-png-export',
    version: '1.0.0',

    initialize(designerAPI) {
        this.canvas = designerAPI.getCanvas();
        this.events = designerAPI.getEventBus();

        // Add UI control
        designerAPI.addMenuItem('Export PNG', () => this.exportPNG());

        console.log('🔌 PNG Plugin initialized - zero Core modification');
    },

    async exportPNG() {
        if (!this.canvas) return null;

        return {
            print: this.canvas.toDataURL('image/png', { multiplier: 3.125 }),
            preview: this.canvas.toDataURL('image/png', { multiplier: 1.0 }),
            thumbnail: this.canvas.toDataURL('image/png', { multiplier: 0.75 })
        };
    }
};
```

**Step 3: Test and commit: "Add: PNG Export Plugin core functionality"**

---

### Task 4: Plugin Isolation & Security (Agent 3)

**Files:**
- Modify: `public/js/yprint-plugin-framework.js`
- Create: `public/js/plugin-security.js`
- Test: `test-plugin-security.html`

**Step 1: Write security validation tests**
```javascript
describe('Plugin Security', () => {
    it('should prevent plugins from accessing Core-Designer internals', () => {
        const maliciousPlugin = {
            name: 'evil',
            initialize: (api) => {
                // Should NOT be able to access Core
                expect(api.designerWidgetInstance).toBeUndefined();
                expect(api.fabricCanvas).toBeUndefined();
            }
        };
        YPrintPlugins.register('evil', maliciousPlugin);
    });
});
```

**Step 2: Implement security boundaries**
```javascript
// Add to plugin-security.js
const PluginSecurity = {
    createSandbox(plugin) {
        // Proxy to prevent access to globals
        return new Proxy(plugin, {
            get(target, prop) {
                if (prop.startsWith('_') || RESTRICTED_PROPS.includes(prop)) {
                    throw new Error(`Plugin security violation: ${prop} access denied`);
                }
                return target[prop];
            }
        });
    },

    validatePluginAPI(api) {
        // Ensure API only exposes safe methods
        const allowedMethods = ['getCanvas', 'getEventBus', 'addMenuItem'];
        return Object.keys(api).every(key => allowedMethods.includes(key));
    }
};
```

**Step 3: Test and commit: "Add: Plugin security and isolation layer"**

---

### Task 5: WooCommerce Integration (Agent 2)

**Files:**
- Create: `plugins/yprint-png-export/wc-integration.js`
- Modify: `includes/class-octo-print-designer-wc-integration.php`
- Test: `test-wc-png-integration.html`

**Step 1: Write WooCommerce PNG integration test**
```javascript
it('should upload PNG to WooCommerce without Core-Designer involvement', async () => {
    const pngData = 'data:image/png;base64,iVBOR...';
    const result = await YPrintPNGPlugin.uploadToWooCommerce(pngData);
    expect(result.success).toBe(true);
    expect(result.png_path).toBeDefined();
});
```

**Step 2: Add AJAX handler for PNG upload**
```php
// In class-octo-print-designer-wc-integration.php
public function handle_plugin_png_upload() {
    // Separate AJAX action for plugin PNG uploads
    // Does NOT interfere with existing coordinate system

    $png_data = sanitize_text_field($_POST['png_data']);
    $result = $this->store_png_file($png_data);

    wp_send_json_success($result);
}
```

**Step 3: Test and commit: "Add: WooCommerce PNG integration via plugin"**

---

### Task 6: Plugin Lifecycle Management (Agent 4)

**Files:**
- Create: `admin/plugin-manager.php`
- Create: `admin/js/plugin-controls.js`
- Test: `test-plugin-lifecycle.html`

**Step 1: Write plugin lifecycle tests**
```javascript
describe('Plugin Lifecycle', () => {
    it('should enable/disable plugins without system restart', () => {
        YPrintPlugins.register('test', mockPlugin);
        expect(YPrintPlugins.isEnabled('test')).toBe(false);

        YPrintPlugins.enable('test');
        expect(YPrintPlugins.isEnabled('test')).toBe(true);

        YPrintPlugins.disable('test');
        expect(YPrintPlugins.isEnabled('test')).toBe(false);
    });
});
```

**Step 2: Implement plugin controls**
```javascript
// admin/js/plugin-controls.js
const PluginManager = {
    enable(pluginName) {
        YPrintPlugins.enable(pluginName);
        this.updateUI(pluginName, 'enabled');
    },

    disable(pluginName) {
        YPrintPlugins.disable(pluginName);
        this.updateUI(pluginName, 'disabled');
    },

    emergencyDisableAll() {
        // Emergency kill-switch for all plugins
        YPrintPlugins.registry.clear();
        location.reload(); // Clean slate
    }
};
```

**Step 3: Test and commit: "Add: Plugin lifecycle management with admin controls"**

---

### Task 7: Integration Testing & Validation (All Agents)

**Files:**
- Create: `test-complete-plugin-system.html`
- Create: `docs/plugin-architecture-validation.md`

**Step 1: End-to-end integration test**
```javascript
describe('Complete Plugin System', () => {
    it('should work end-to-end without affecting Core-Designer', async () => {
        // 1. Load plugin framework
        expect(window.YPrintPlugins).toBeDefined();

        // 2. Register PNG plugin
        YPrintPlugins.register('png-export', YPrintPNGPlugin);

        // 3. Initialize with Designer
        YPrintPlugins.initializePlugin('png-export');

        // 4. Export PNG
        const result = await YPrintPNGPlugin.exportPNG();
        expect(result.print).toBeDefined();

        // 5. Core-Designer still works
        expect(window.designerWidgetInstance.fabricCanvas).toBeDefined();
    });
});
```

**Step 2: Validate Core-Designer integrity**
```javascript
it('should preserve all Core-Designer functionality', () => {
    // After plugin loading, Core-Designer should be unchanged
    expect(window.designerWidgetInstance.container).toBeDefined();
    expect(window.designerWidgetInstance.templates).toBeDefined();
    expect(window.designerWidgetInstance.currentView).toBeDefined();
});
```

**Step 3: Commit: "Add: Complete plugin system integration tests"**

---

## Deployment Strategy

**Phase 1: Framework Only**
- Deploy plugin framework without PNG plugin
- Validate no Core-Designer impact
- Test in staging environment

**Phase 2: PNG Plugin Beta**
- Enable PNG plugin for admin users only
- A/B test with coordinate system
- Monitor performance and errors

**Phase 3: Full Rollout**
- Enable for all users
- Feature flag for easy rollback
- Monitor metrics and user feedback

**Emergency Rollback:**
```javascript
// One-line disable
YPrintPlugins.disable('png-export');
// Or complete framework disable
delete window.YPrintPlugins;
```

---

## Success Criteria

- ✅ **Zero Core-Designer modifications**
- ✅ **Plugin loads/unloads without restart**
- ✅ **PNG export works independently**
- ✅ **WooCommerce integration functional**
- ✅ **Complete rollback capability**
- ✅ **All existing functionality preserved**

**Total estimated time: 8-12 hours across 4 agents working in parallel**
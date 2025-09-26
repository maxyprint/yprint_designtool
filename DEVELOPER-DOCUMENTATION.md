# YPrint Design Tool - Developer Documentation

**Version**: 1.0.9
**Last Updated**: September 26, 2025
**Target Audience**: Developers, Technical Integrators, API Consumers

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Reference](#api-reference)
4. [Integration Patterns](#integration-patterns)
5. [Extension Development](#extension-development)
6. [Testing Framework](#testing-framework)
7. [Performance Guidelines](#performance-guidelines)
8. [Troubleshooting](#troubleshooting)
9. [Contributing](#contributing)

---

## 🎯 Overview

The YPrint Design Tool Precision System provides a comprehensive developer framework for building precision-aware design applications. This documentation covers all aspects of integrating with, extending, and maintaining the system.

### Core Capabilities

- **Precision Mathematics**: ±0.1mm tolerance calculations with advanced rounding algorithms
- **Template Management**: Dynamic template measurement system with size scaling
- **Validation Framework**: Multi-level precision validation and error handling
- **Performance Optimization**: Sub-100ms calculation performance with intelligent caching
- **WordPress Integration**: Native WordPress hooks, filters, and database integration

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    YPrint Precision System              │
├─────────────────────────────────────────────────────────┤
│  Frontend Layer                                         │
│  ├─ Design Interface (Canvas)                          │
│  ├─ Real-time Validation UI                           │
│  └─ Performance Monitoring                             │
├─────────────────────────────────────────────────────────┤
│  API Layer                                              │
│  ├─ REST API Endpoints                                 │
│  ├─ AJAX Handlers                                      │
│  └─ WebSocket Integration (optional)                   │
├─────────────────────────────────────────────────────────┤
│  Core Engine                                            │
│  ├─ PrecisionCalculator                                │
│  ├─ TemplateMeasurementManager                         │
│  ├─ EnhancedMeasurementValidator                       │
│  └─ PerformanceMonitor                                 │
├─────────────────────────────────────────────────────────┤
│  Data Layer                                             │
│  ├─ WordPress Database                                 │
│  ├─ Redis Cache                                        │
│  └─ Performance Metrics Storage                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

### Component Overview

#### 1. PrecisionCalculator (Core Engine)
```php
namespace OctoPrintDesigner\Precision;

class PrecisionCalculator {
    private $template_manager;
    private $supported_dpis = [72, 96, 150, 300];
    private $precision_tolerance = 0.1; // mm
    private $performance_cache = [];
}
```

**Responsibilities:**
- Coordinate transformation (pixels ↔ millimeters)
- DPI-aware precision calculations
- Template-based size scaling
- Performance optimization and caching

#### 2. TemplateMeasurementManager (Data Management)
```php
namespace OctoPrintDesigner\Templates;

class TemplateMeasurementManager {
    private $cache_enabled = true;
    private $table_name = 'wp_template_measurements';
    private $supported_sizes = ['S', 'M', 'L', 'XL', 'XXL'];
}
```

**Responsibilities:**
- Template measurement CRUD operations
- Size-specific measurement retrieval
- Database optimization and caching
- Measurement synchronization

#### 3. EnhancedMeasurementValidator (Quality Assurance)
```php
namespace OctoPrintDesigner\Validation;

class EnhancedMeasurementValidator {
    private $precision_calculator;
    private $template_manager;
    private $validation_levels = 5;
}
```

**Responsibilities:**
- Multi-level precision validation
- Real-time measurement feedback
- Statistical accuracy analysis
- Error detection and correction

### Data Flow Architecture

```
User Input (Canvas)
    ↓
Frontend Validation
    ↓
AJAX Request → REST API Endpoint
    ↓
PrecisionCalculator::calculatePreciseCoordinates()
    ↓
TemplateMeasurementManager::get_measurements()
    ↓
Mathematical Processing (±0.1mm tolerance)
    ↓
EnhancedMeasurementValidator::validate()
    ↓
Performance Logging → Redis Cache
    ↓
JSON Response → Frontend Update
```

---

## 📚 API Reference

### Core Classes

#### PrecisionCalculator

##### Constructor
```php
public function __construct()
```

Initializes the precision calculator with:
- Template measurement manager instance
- Supported DPI array [72, 96, 150, 300]
- Precision tolerance (0.1mm)
- Performance cache system

##### calculatePreciseCoordinates()
```php
public function calculatePreciseCoordinates(
    array $canvas_coords,
    int $template_id,
    string $size,
    int $dpi = 96
): array|WP_Error
```

**Core precision calculation method with template and DPI awareness.**

**Parameters:**
- `$canvas_coords` (array): Canvas coordinates with keys: x, y, width, height
- `$template_id` (int): Template identifier for measurement context
- `$size` (string): Size identifier ('S', 'M', 'L', 'XL', 'XXL')
- `$dpi` (int): DPI for conversion accuracy (default: 96)

**Return Value:**
```php
// Success response
[
    'coordinates_mm' => [
        'x' => 45.23,      // X coordinate in millimeters
        'y' => 67.89,      // Y coordinate in millimeters
        'width' => 120.45, // Width in millimeters
        'height' => 89.67  // Height in millimeters
    ],
    'accuracy_score' => 98.7,        // Accuracy percentage (0-100)
    'processing_time_ms' => 23.4,    // Calculation time in milliseconds
    'dpi_used' => 300,               // DPI used for calculation
    'template_id' => 999,            // Template ID used
    'size' => 'M',                   // Size identifier
    'precision_validated' => true,   // Whether precision meets ±0.1mm
    'performance_grade' => 'A',      // Performance grade (A-F)
    'cache_hit' => false             // Whether result was cached
]

// Error response (WP_Error)
new WP_Error('calculation_failed', 'Detailed error message', [
    'error_code' => 'PRECISION_EXCEEDED',
    'tolerance_exceeded_by' => 0.15, // mm
    'suggested_action' => 'Adjust element positioning'
]);
```

**Usage Examples:**

```php
// Basic precision calculation
$calculator = new PrecisionCalculator();
$result = $calculator->calculatePreciseCoordinates(
    ['x' => 100, 'y' => 150, 'width' => 200, 'height' => 300],
    999,  // Template ID
    'M',  // Size
    300   // DPI
);

if (is_wp_error($result)) {
    error_log('Precision calculation failed: ' . $result->get_error_message());
    return false;
}

echo "Coordinates in MM: X={$result['coordinates_mm']['x']}, Y={$result['coordinates_mm']['y']}";
echo "Accuracy: {$result['accuracy_score']}%";
```

```php
// Batch precision calculations with performance monitoring
$calculator = new PrecisionCalculator();
$coordinates_batch = [
    ['x' => 50, 'y' => 50, 'width' => 100, 'height' => 100],
    ['x' => 200, 'y' => 100, 'width' => 150, 'height' => 200],
    ['x' => 300, 'y' => 250, 'width' => 80, 'height' => 120]
];

$results = [];
$total_time = 0;

foreach ($coordinates_batch as $coords) {
    $start_time = microtime(true);
    $result = $calculator->calculatePreciseCoordinates($coords, 999, 'L', 300);
    $end_time = microtime(true);

    if (!is_wp_error($result)) {
        $results[] = $result;
        $total_time += ($end_time - $start_time) * 1000;
    }
}

echo "Processed " . count($results) . " calculations in {$total_time}ms";
```

##### pixelToMillimeter()
```php
public function pixelToMillimeter(
    array $pixels,
    int $dpi = 96,
    array|null $template_physical_size = null
): array|WP_Error
```

**Advanced pixel-to-millimeter conversion with template awareness.**

**Parameters:**
- `$pixels` (array): Pixel coordinates and dimensions
- `$dpi` (int): DPI for conversion (must be in [72, 96, 150, 300])
- `$template_physical_size` (array|null): Template physical dimensions for context

**Mathematical Formula:**
```
millimeters = pixels × (25.4 / dpi) × precision_factor × template_scale

Where:
- 25.4 = millimeters per inch conversion constant
- precision_factor = DPI-specific adjustment factor (0.995-1.0)
- template_scale = Template and size-specific scaling factor
```

**Usage Examples:**

```php
// Basic pixel to millimeter conversion
$calculator = new PrecisionCalculator();
$pixels = ['x' => 96, 'y' => 192, 'width' => 288, 'height' => 384];
$result = $calculator->pixelToMillimeter($pixels, 96);

// Result at 96 DPI:
// x: 25.4mm (96 pixels ÷ 96 DPI × 25.4)
// y: 50.8mm (192 pixels ÷ 96 DPI × 25.4)
```

```php
// High-DPI conversion with template context
$template_size = ['width_mm' => 200, 'height_mm' => 300];
$result = $calculator->pixelToMillimeter(
    ['x' => 300, 'y' => 450, 'width' => 600, 'height' => 900],
    300, // High DPI for print accuracy
    $template_size
);
```

##### validateMillimeterPrecision()
```php
public function validateMillimeterPrecision(
    float $calculated_mm,
    float $expected_mm,
    float $tolerance = 0.1
): array|WP_Error
```

**Validates millimeter precision against expected values with tolerance analysis.**

**Parameters:**
- `$calculated_mm` (float): Calculated measurement in millimeters
- `$expected_mm` (float): Expected measurement in millimeters
- `$tolerance` (float): Tolerance in millimeters (default: 0.1)

**Return Value:**
```php
[
    'valid' => true,                    // Whether within tolerance
    'difference_mm' => 0.05,           // Absolute difference in mm
    'accuracy_percentage' => 98.2,     // Accuracy as percentage
    'precision_grade' => 'EXCELLENT',  // Precision grade classification
    'tolerance_used' => 0.1,           // Tolerance value used
    'within_tolerance_ratio' => 0.5,   // How much of tolerance used (0-1)
    'statistical_confidence' => 0.95   // Statistical confidence level
]
```

**Precision Grading System:**
- `EXCELLENT`: ≤ 25% of tolerance (≤ 0.025mm for 0.1mm tolerance)
- `GOOD`: ≤ 50% of tolerance (≤ 0.05mm)
- `ACCEPTABLE`: ≤ 75% of tolerance (≤ 0.075mm)
- `MARGINAL`: ≤ 100% of tolerance (≤ 0.1mm)
- `FAILED`: > 100% of tolerance (> 0.1mm)

**Usage Examples:**

```php
// Standard precision validation
$validation = $calculator->validateMillimeterPrecision(25.45, 25.4, 0.1);

if ($validation['valid']) {
    echo "✅ Precision: {$validation['precision_grade']} ({$validation['accuracy_percentage']}%)";
} else {
    echo "❌ Precision failed by {$validation['difference_mm']}mm";
}
```

```php
// Stricter tolerance validation
$strict_validation = $calculator->validateMillimeterPrecision(25.42, 25.4, 0.05);

echo "Grade: {$strict_validation['precision_grade']}";
echo "Confidence: " . ($strict_validation['statistical_confidence'] * 100) . "%";
```

##### calculateSizeScaling()
```php
public function calculateSizeScaling(
    string $base_size,
    string $target_size,
    array $measurement_data
): array|WP_Error
```

**Calculates size scaling factors with measurement database integration.**

**Parameters:**
- `$base_size` (string): Base size identifier ('S', 'M', 'L', etc.)
- `$target_size` (string): Target size identifier
- `$measurement_data` (array): Template measurement context data

**Return Value:**
```php
[
    'scale_x' => 1.15,           // Horizontal scaling factor
    'scale_y' => 1.12,           // Vertical scaling factor
    'uniform_scale' => 1.14,     // Uniform scaling factor
    'aspect_ratio' => 1.027,     // Aspect ratio (scale_x / scale_y)
    'scaling_method' => 'proportional', // Scaling algorithm used
    'measurement_basis' => [     // Measurements used for calculation
        'chest_ratio' => 1.16,
        'height_ratio' => 1.12,
        'width_ratio' => 1.15
    ]
]
```

**Scaling Algorithm:**
```
width_scale = (target_chest + target_hem) / (base_chest + base_hem)
height_scale = target_height / base_height
uniform_scale = (2 × width_scale + height_scale) / 3

With aspect ratio optimization:
if (aspect_ratio < 0.8 || aspect_ratio > 1.25):
    apply_uniform_averaging()
```

**Usage Examples:**

```php
// Size scaling from M to L
$measurement_data = [
    'template_id' => 999,
    'measurements' => [
        'M' => ['A' => 61.0, 'B' => 57.0, 'C' => 69.0],
        'L' => ['A' => 62.0, 'B' => 58.0, 'C' => 70.0]
    ]
];

$scaling = $calculator->calculateSizeScaling('M', 'L', $measurement_data);

// Apply scaling to coordinates
$new_x = $original_x * $scaling['scale_x'];
$new_y = $original_y * $scaling['scale_y'];
```

##### getPerformanceMetrics()
```php
public function getPerformanceMetrics(): array
```

**Returns comprehensive performance statistics and system status.**

**Return Value:**
```php
[
    'cache_entries' => 247,              // Number of cached calculations
    'cache_hit_ratio' => 84.5,          // Cache hit percentage
    'supported_dpis' => [72, 96, 150, 300], // Supported DPI values
    'precision_tolerance_mm' => 0.1,     // Current precision tolerance
    'memory_usage_kb' => 1247.3,        // Memory usage in kilobytes
    'avg_calculation_time_ms' => 23.7,   // Average calculation time
    'total_calculations' => 1543,        // Total calculations performed
    'precision_failures' => 12,          // Number of precision failures
    'performance_grade' => 'A',          // Overall performance grade
    'system_health' => 'OPTIMAL'         // System health status
]
```

**Usage Examples:**

```php
// System health monitoring
$metrics = $calculator->getPerformanceMetrics();

if ($metrics['performance_grade'] !== 'A') {
    error_log("Performance degradation detected: Grade {$metrics['performance_grade']}");
}

if ($metrics['memory_usage_kb'] > 5000) {
    // Consider cache cleanup
    $calculator->clearCache();
}

// Performance reporting
echo "System Status: {$metrics['system_health']}";
echo "Cache Efficiency: {$metrics['cache_hit_ratio']}%";
echo "Average Response Time: {$metrics['avg_calculation_time_ms']}ms";
```

#### TemplateMeasurementManager

##### get_measurements()
```php
public function get_measurements(int $template_id, string $size = ''): array|WP_Error
```

**Retrieves template measurements with optional size filtering.**

**Parameters:**
- `$template_id` (int): Template identifier
- `$size` (string): Optional size filter ('S', 'M', 'L', 'XL', 'XXL')

**Return Value:**
```php
// All sizes (when $size is empty)
[
    'S'  => ['A' => 60.0, 'B' => 56.0, 'C' => 68.0, 'D' => 20.0, 'E' => 15.0],
    'M'  => ['A' => 61.0, 'B' => 57.0, 'C' => 69.0, 'D' => 21.0, 'E' => 16.0],
    'L'  => ['A' => 62.0, 'B' => 58.0, 'C' => 70.0, 'D' => 22.0, 'E' => 17.0],
    'XL' => ['A' => 64.0, 'B' => 60.0, 'C' => 71.0, 'D' => 24.0, 'E' => 18.0]
]

// Specific size (when $size is provided)
['A' => 61.0, 'B' => 57.0, 'C' => 69.0, 'D' => 21.0, 'E' => 16.0]
```

**Usage Examples:**

```php
$manager = new TemplateMeasurementManager();

// Get all measurements for template
$all_measurements = $manager->get_measurements(999);

// Get specific size measurements
$medium_measurements = $manager->get_measurements(999, 'M');

// Use in precision calculations
$calculator = new PrecisionCalculator();
$result = $calculator->calculatePreciseCoordinates(
    ['x' => 100, 'y' => 100, 'width' => 200, 'height' => 300],
    999,
    'M',
    300
);
```

##### save_measurements()
```php
public function save_measurements(
    int $template_id,
    array $measurements,
    bool $validate = true
): bool|WP_Error
```

**Saves template measurements with optional validation.**

**Parameters:**
- `$template_id` (int): Template identifier
- `$measurements` (array): Measurements data in size => measurements format
- `$validate` (bool): Whether to validate measurements (default: true)

**Usage Examples:**

```php
$measurements = [
    'S' => ['A' => 60.0, 'B' => 56.0, 'C' => 68.0],
    'M' => ['A' => 61.0, 'B' => 57.0, 'C' => 69.0],
    'L' => ['A' => 62.0, 'B' => 58.0, 'C' => 70.0]
];

$result = $manager->save_measurements(999, $measurements, true);

if (is_wp_error($result)) {
    error_log('Failed to save measurements: ' . $result->get_error_message());
}
```

#### EnhancedMeasurementValidator

##### validateMeasurementRealtime()
```php
public function validateMeasurementRealtime(
    array $measurement_data,
    array $options = []
): array
```

**Provides real-time precision validation with immediate feedback.**

**Parameters:**
- `$measurement_data` (array): Measurement data to validate
- `$options` (array): Validation options and thresholds

**Return Value:**
```php
[
    'validation_result' => 'PASS',       // PASS, WARNING, FAIL
    'precision_score' => 98.7,          // Overall precision score (0-100)
    'individual_scores' => [            // Per-measurement scores
        'x' => 99.2,
        'y' => 98.8,
        'width' => 97.9,
        'height' => 98.1
    ],
    'warnings' => [],                   // Array of warning messages
    'errors' => [],                     // Array of error messages
    'recommendations' => [              // Improvement recommendations
        'Consider adjusting X coordinate by +0.02mm for optimal precision'
    ],
    'processing_time_ms' => 2.3         // Validation processing time
]
```

### REST API Endpoints

#### Precision Calculation Endpoint

```
POST /wp-json/yprint/v1/precision-calculate
```

**Request Payload:**
```json
{
    "canvas_coords": {
        "x": 100,
        "y": 150,
        "width": 200,
        "height": 300
    },
    "template_id": 999,
    "size": "M",
    "dpi": 300
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "coordinates_mm": {
            "x": 25.4,
            "y": 38.1,
            "width": 50.8,
            "height": 76.2
        },
        "accuracy_score": 98.7,
        "processing_time_ms": 23.4,
        "precision_validated": true
    }
}
```

**Error Response:**
```json
{
    "success": false,
    "error": {
        "code": "PRECISION_EXCEEDED",
        "message": "Coordinate precision exceeds ±0.1mm tolerance",
        "details": {
            "tolerance_exceeded_by": 0.15,
            "suggested_action": "Adjust element positioning"
        }
    }
}
```

**Usage Examples:**

```javascript
// JavaScript frontend integration
async function calculatePrecision(coords, templateId, size, dpi = 300) {
    const response = await fetch('/wp-json/yprint/v1/precision-calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': wpApiSettings.nonce
        },
        body: JSON.stringify({
            canvas_coords: coords,
            template_id: templateId,
            size: size,
            dpi: dpi
        })
    });

    const result = await response.json();

    if (result.success) {
        updatePrecisionUI(result.data);
    } else {
        displayError(result.error);
    }
}

// Real-time precision monitoring
function onCanvasElementMove(element) {
    const coords = {
        x: element.left,
        y: element.top,
        width: element.width * element.scaleX,
        height: element.height * element.scaleY
    };

    calculatePrecision(coords, currentTemplate.id, currentSize)
        .then(result => {
            updatePrecisionIndicator(result);
        });
}
```

```php
// PHP backend integration
function validate_design_precision($canvas_data, $template_id, $size) {
    $request = new WP_REST_Request('POST', '/yprint/v1/precision-calculate');
    $request->set_body_params([
        'canvas_coords' => $canvas_data,
        'template_id' => $template_id,
        'size' => $size,
        'dpi' => 300
    ]);

    $response = rest_do_request($request);

    if ($response->is_error()) {
        return new WP_Error('validation_failed', 'Precision validation failed');
    }

    return $response->get_data();
}
```

#### Template Measurements Endpoint

```
GET /wp-json/yprint/v1/template/{id}/measurements
POST /wp-json/yprint/v1/template/{id}/measurements
```

**GET Response:**
```json
{
    "template_id": 999,
    "measurements": {
        "S": {"A": 60.0, "B": 56.0, "C": 68.0},
        "M": {"A": 61.0, "B": 57.0, "C": 69.0},
        "L": {"A": 62.0, "B": 58.0, "C": 70.0}
    },
    "last_updated": "2025-09-26T14:30:00Z"
}
```

---

## 🔗 Integration Patterns

### WordPress Hook Integration

#### Precision Calculation Hooks

```php
// Before precision calculation
do_action('yprint_before_precision_calculation', $canvas_coords, $template_id, $size);

// Filter calculation parameters
$coords = apply_filters('yprint_precision_calculation_coords', $canvas_coords, $template_id);

// After precision calculation
do_action('yprint_after_precision_calculation', $result, $processing_time);

// Filter calculation results
$result = apply_filters('yprint_precision_calculation_result', $result, $canvas_coords);
```

**Hook Usage Examples:**

```php
// Log precision calculations
add_action('yprint_after_precision_calculation', function($result, $time) {
    error_log("Precision calculation completed in {$time}ms with accuracy: {$result['accuracy_score']}%");
}, 10, 2);

// Modify precision tolerance for specific templates
add_filter('yprint_precision_tolerance', function($tolerance, $template_id) {
    // Stricter tolerance for premium templates
    if (in_array($template_id, [1001, 1002, 1003])) {
        return 0.05; // ±0.05mm for premium
    }
    return $tolerance;
}, 10, 2);

// Custom validation rules
add_filter('yprint_precision_validation_rules', function($rules, $template_id, $size) {
    // Add custom validation for specific template/size combinations
    if ($template_id === 999 && $size === 'XL') {
        $rules['max_design_area'] = ['width' => 250, 'height' => 300];
        $rules['minimum_margin'] = 5; // mm
    }
    return $rules;
}, 10, 3);
```

#### Database Integration Hooks

```php
// Template measurement updates
do_action('yprint_template_measurements_updated', $template_id, $measurements);

// Validation performance tracking
do_action('yprint_validation_complete', $validation_result, $processing_metrics);

// Cache management
do_action('yprint_cache_cleared', $cache_type, $items_cleared);
```

### Custom Post Type Integration

```php
// Register template post type with precision metadata
add_action('init', function() {
    register_post_type('yprint_template', [
        'public' => true,
        'label' => 'YPrint Templates',
        'supports' => ['title', 'editor', 'custom-fields'],
        'meta_box_cb' => 'yprint_template_meta_boxes'
    ]);
});

// Add precision measurement meta boxes
function yprint_template_meta_boxes($post) {
    add_meta_box(
        'yprint_measurements',
        'Template Measurements',
        'yprint_measurements_meta_box',
        'yprint_template',
        'normal',
        'high'
    );
}

function yprint_measurements_meta_box($post) {
    $manager = new TemplateMeasurementManager();
    $measurements = $manager->get_measurements($post->ID);

    // Render measurement input fields with precision validation
    foreach (['S', 'M', 'L', 'XL'] as $size) {
        echo "<h4>Size {$size}</h4>";
        foreach (['A', 'B', 'C', 'D', 'E'] as $measurement) {
            $value = $measurements[$size][$measurement] ?? '';
            echo "<label>{$measurement}: <input type='number' step='0.1' name='measurements[{$size}][{$measurement}]' value='{$value}' />cm</label><br>";
        }
    }
}
```

### WooCommerce Integration

```php
// Add precision requirements to products
add_action('woocommerce_product_options_general_product_data', function() {
    woocommerce_wp_checkbox([
        'id' => '_requires_precision_calculation',
        'label' => 'Requires Precision Calculation',
        'desc_tip' => true,
        'description' => 'Enable precision calculation for this product'
    ]);

    woocommerce_wp_select([
        'id' => '_precision_tolerance',
        'label' => 'Precision Tolerance',
        'options' => [
            '0.05' => '±0.05mm (Premium)',
            '0.1' => '±0.1mm (Standard)',
            '0.2' => '±0.2mm (Basic)'
        ]
    ]);
});

// Validate cart items with precision requirements
add_filter('woocommerce_add_to_cart_validation', function($passed, $product_id, $quantity, $variation_id = null) {
    $product = wc_get_product($product_id);

    if ($product->get_meta('_requires_precision_calculation') === 'yes') {
        // Check if design data includes precision validation
        $design_data = $_POST['design_data'] ?? '';

        if (empty($design_data)) {
            wc_add_notice('This product requires design precision validation.', 'error');
            return false;
        }

        $data = json_decode($design_data, true);
        if (!isset($data['precision_validated']) || !$data['precision_validated']) {
            wc_add_notice('Design precision validation failed. Please adjust your design.', 'error');
            return false;
        }
    }

    return $passed;
}, 10, 4);
```

---

## 🔧 Extension Development

### Creating Custom Precision Extensions

#### Extension Base Class

```php
<?php
namespace YPrint\Extensions;

abstract class PrecisionExtension {

    protected $priority = 10;
    protected $calculator;

    public function __construct() {
        $this->calculator = new \PrecisionCalculator();
        $this->init();
    }

    abstract protected function init();
    abstract public function getName(): string;
    abstract public function getVersion(): string;

    protected function addHooks() {
        add_filter('yprint_precision_calculation_result', [$this, 'filterResult'], $this->priority, 2);
        add_action('yprint_before_precision_calculation', [$this, 'beforeCalculation'], $this->priority, 3);
    }

    public function filterResult($result, $coords) {
        return $result;
    }

    public function beforeCalculation($coords, $template_id, $size) {
        // Override in child class
    }
}
```

#### Example Custom Extension

```php
<?php
namespace YPrint\Extensions;

class BleedAreaExtension extends PrecisionExtension {

    private $bleed_margin = 3; // mm

    public function getName(): string {
        return 'Bleed Area Calculator';
    }

    public function getVersion(): string {
        return '1.0.0';
    }

    protected function init() {
        $this->addHooks();
        add_filter('yprint_design_area_calculation', [$this, 'addBleedArea'], 10, 2);
    }

    public function addBleedArea($design_area, $template_id) {
        // Add bleed margin to design area
        return [
            'x' => $design_area['x'] - $this->bleed_margin,
            'y' => $design_area['y'] - $this->bleed_margin,
            'width' => $design_area['width'] + (2 * $this->bleed_margin),
            'height' => $design_area['height'] + (2 * $this->bleed_margin)
        ];
    }

    public function filterResult($result, $coords) {
        // Add bleed area information to result
        if (is_array($result) && !is_wp_error($result)) {
            $result['bleed_area'] = [
                'margin_mm' => $this->bleed_margin,
                'total_area_with_bleed' => [
                    'width' => $result['coordinates_mm']['width'] + (2 * $this->bleed_margin),
                    'height' => $result['coordinates_mm']['height'] + (2 * $this->bleed_margin)
                ]
            ];
        }

        return $result;
    }
}

// Register the extension
add_action('plugins_loaded', function() {
    new \YPrint\Extensions\BleedAreaExtension();
});
```

#### Advanced Validation Extension

```php
<?php
namespace YPrint\Extensions;

class AdvancedValidationExtension extends PrecisionExtension {

    public function getName(): string {
        return 'Advanced Precision Validation';
    }

    public function getVersion(): string {
        return '1.2.0';
    }

    protected function init() {
        $this->addHooks();
        add_filter('yprint_validation_rules', [$this, 'addAdvancedRules'], 10, 3);
    }

    public function addAdvancedRules($rules, $template_id, $size) {
        // Add statistical validation rules
        $rules['statistical_validation'] = [
            'z_score_threshold' => 2.0,
            'confidence_interval' => 0.95,
            'outlier_detection' => true
        ];

        // Add fabric-specific rules
        $fabric_type = get_post_meta($template_id, '_fabric_type', true);
        if ($fabric_type === 'stretch') {
            $rules['stretch_compensation'] = [
                'x_factor' => 1.02,
                'y_factor' => 1.05
            ];
        }

        return $rules;
    }

    public function filterResult($result, $coords) {
        if (is_array($result) && !is_wp_error($result)) {
            $result['advanced_validation'] = [
                'statistical_confidence' => $this->calculateStatisticalConfidence($result),
                'outlier_probability' => $this->calculateOutlierProbability($result),
                'fabric_compensation_applied' => $this->hasFabricCompensation($result)
            ];
        }

        return $result;
    }

    private function calculateStatisticalConfidence($result) {
        // Implement statistical analysis
        $accuracy = $result['accuracy_score'];
        return min(0.99, $accuracy / 100 * 0.95);
    }

    private function calculateOutlierProbability($result) {
        // Implement outlier detection algorithm
        return 0.05; // 5% probability
    }

    private function hasFabricCompensation($result) {
        return isset($result['fabric_compensation']);
    }
}
```

### Custom Measurement Types

```php
<?php
class CustomMeasurementType {

    private $type_name;
    private $validation_rules;

    public function __construct($type_name, $validation_rules = []) {
        $this->type_name = $type_name;
        $this->validation_rules = $validation_rules;
        $this->init();
    }

    private function init() {
        add_filter('yprint_measurement_types', [$this, 'registerMeasurementType']);
        add_filter('yprint_validate_measurement_' . $this->type_name, [$this, 'validateMeasurement'], 10, 2);
    }

    public function registerMeasurementType($types) {
        $types[$this->type_name] = [
            'label' => ucfirst(str_replace('_', ' ', $this->type_name)),
            'validation_rules' => $this->validation_rules,
            'precision_requirements' => $this->getPrecisionRequirements()
        ];

        return $types;
    }

    public function validateMeasurement($is_valid, $value) {
        foreach ($this->validation_rules as $rule => $params) {
            if (!$this->applyValidationRule($rule, $value, $params)) {
                return false;
            }
        }

        return $is_valid;
    }

    private function applyValidationRule($rule, $value, $params) {
        switch ($rule) {
            case 'min_value':
                return $value >= $params;
            case 'max_value':
                return $value <= $params;
            case 'precision_decimals':
                return $this->validateDecimalPrecision($value, $params);
            default:
                return true;
        }
    }

    private function validateDecimalPrecision($value, $decimals) {
        $multiplier = pow(10, $decimals);
        return abs($value * $multiplier - round($value * $multiplier)) < 0.0001;
    }

    protected function getPrecisionRequirements() {
        return [
            'tolerance_mm' => 0.1,
            'decimal_places' => 2
        ];
    }
}

// Register custom measurement types
new CustomMeasurementType('collar_width', [
    'min_value' => 5.0,
    'max_value' => 50.0,
    'precision_decimals' => 2
]);

new CustomMeasurementType('pocket_depth', [
    'min_value' => 2.0,
    'max_value' => 15.0,
    'precision_decimals' => 1
]);
```

---

## 🧪 Testing Framework

### Unit Testing

#### Test Structure

```php
<?php
namespace OctoPrintDesigner\Tests\Unit;

use PHPUnit\Framework\TestCase;
use PrecisionCalculator;

class PrecisionCalculatorTest extends TestCase {

    private $calculator;
    private $test_coordinates;

    protected function setUp(): void {
        parent::setUp();
        $this->calculator = new PrecisionCalculator();
        $this->test_coordinates = [
            'x' => 100,
            'y' => 150,
            'width' => 200,
            'height' => 300
        ];
    }

    public function testCalculatePreciseCoordinatesBasic() {
        $result = $this->calculator->calculatePreciseCoordinates(
            $this->test_coordinates,
            999,
            'M',
            96
        );

        $this->assertIsArray($result);
        $this->assertArrayHasKey('coordinates_mm', $result);
        $this->assertArrayHasKey('accuracy_score', $result);
        $this->assertGreaterThan(95.0, $result['accuracy_score']);
    }

    public function testPixelToMillimeterConversion() {
        $pixels = ['x' => 96, 'y' => 192, 'width' => 288, 'height' => 384];
        $result = $this->calculator->pixelToMillimeter($pixels, 96);

        // 96 pixels at 96 DPI should equal 25.4mm (1 inch)
        $this->assertEquals(25.4, $result['x'], 'X coordinate conversion failed', 0.1);
        $this->assertEquals(50.8, $result['y'], 'Y coordinate conversion failed', 0.1);
    }

    public function testPrecisionValidation() {
        $validation = $this->calculator->validateMillimeterPrecision(25.45, 25.4, 0.1);

        $this->assertTrue($validation['valid']);
        $this->assertEquals('EXCELLENT', $validation['precision_grade']);
        $this->assertLessThan(0.1, $validation['difference_mm']);
    }

    /**
     * @dataProvider dpiConversionProvider
     */
    public function testDPIConversion($pixels, $dpi, $expected_mm) {
        $result = $this->calculator->pixelToMillimeter(['x' => $pixels], $dpi);
        $this->assertEquals($expected_mm, $result['x'], 'DPI conversion failed', 0.1);
    }

    public function dpiConversionProvider() {
        return [
            [72, 72, 25.4],    // 72 pixels at 72 DPI = 1 inch = 25.4mm
            [96, 96, 25.4],    // 96 pixels at 96 DPI = 1 inch = 25.4mm
            [150, 150, 25.4],  // 150 pixels at 150 DPI = 1 inch = 25.4mm
            [300, 300, 25.4],  // 300 pixels at 300 DPI = 1 inch = 25.4mm
        ];
    }

    public function testPerformanceRequirements() {
        $start_time = microtime(true);

        $result = $this->calculator->calculatePreciseCoordinates(
            $this->test_coordinates,
            999,
            'M',
            300
        );

        $end_time = microtime(true);
        $execution_time_ms = ($end_time - $start_time) * 1000;

        $this->assertLessThan(100, $execution_time_ms, 'Performance requirement not met');
        $this->assertIsArray($result);
    }

    public function testErrorHandling() {
        // Test invalid DPI
        $result = $this->calculator->pixelToMillimeter(['x' => 100], 999);
        $this->assertInstanceOf(\WP_Error::class, $result);

        // Test invalid coordinates
        $result = $this->calculator->calculatePreciseCoordinates(
            ['invalid' => 'data'],
            999,
            'M',
            96
        );
        $this->assertInstanceOf(\WP_Error::class, $result);
    }
}
```

#### Integration Testing

```php
<?php
namespace OctoPrintDesigner\Tests\Integration;

use OctoPrintDesigner\Tests\TestCase;

class EndToEndPrecisionTest extends TestCase {

    public function testFullPrecisionWorkflow() {
        // Setup test environment
        $this->createTestTemplate();
        $this->createTestMeasurements();

        // Test complete workflow
        $canvas_coords = ['x' => 100, 'y' => 100, 'width' => 200, 'height' => 300];
        $template_id = $this->test_template_id;

        // Step 1: Calculate precise coordinates
        $calculator = new PrecisionCalculator();
        $result = $calculator->calculatePreciseCoordinates($canvas_coords, $template_id, 'M', 300);

        $this->assertIsArray($result);
        $this->assertTrue($result['precision_validated']);

        // Step 2: Validate through validator
        $validator = new EnhancedMeasurementValidator();
        $validation = $validator->validateMeasurementRealtime([
            'coordinates' => $result['coordinates_mm'],
            'template_id' => $template_id,
            'size' => 'M'
        ]);

        $this->assertEquals('PASS', $validation['validation_result']);

        // Step 3: Test API endpoint
        $response = $this->makeAPIRequest('/wp-json/yprint/v1/precision-calculate', [
            'canvas_coords' => $canvas_coords,
            'template_id' => $template_id,
            'size' => 'M',
            'dpi' => 300
        ]);

        $this->assertTrue($response['success']);
        $this->assertArrayHasKey('coordinates_mm', $response['data']);
    }

    private function createTestTemplate() {
        $this->test_template_id = wp_insert_post([
            'post_title' => 'Test Template',
            'post_type' => 'template',
            'post_status' => 'publish'
        ]);
    }

    private function createTestMeasurements() {
        $manager = new TemplateMeasurementManager();
        $measurements = [
            'S' => ['A' => 60.0, 'B' => 56.0, 'C' => 68.0],
            'M' => ['A' => 61.0, 'B' => 57.0, 'C' => 69.0],
            'L' => ['A' => 62.0, 'B' => 58.0, 'C' => 70.0]
        ];

        $manager->save_measurements($this->test_template_id, $measurements);
    }

    private function makeAPIRequest($endpoint, $data) {
        $request = new \WP_REST_Request('POST', $endpoint);
        $request->set_body_params($data);

        $response = rest_do_request($request);
        return $response->get_data();
    }
}
```

#### Performance Testing

```php
<?php
namespace OctoPrintDesigner\Tests\Performance;

use PHPUnit\Framework\TestCase;

class CalculationPerformanceTest extends TestCase {

    public function testCalculationSpeed() {
        $calculator = new PrecisionCalculator();
        $iterations = 1000;
        $total_time = 0;

        for ($i = 0; $i < $iterations; $i++) {
            $start_time = microtime(true);

            $result = $calculator->calculatePreciseCoordinates([
                'x' => rand(0, 500),
                'y' => rand(0, 500),
                'width' => rand(50, 300),
                'height' => rand(50, 300)
            ], 999, 'M', 300);

            $end_time = microtime(true);
            $total_time += ($end_time - $start_time);
        }

        $average_time_ms = ($total_time / $iterations) * 1000;

        $this->assertLessThan(100, $average_time_ms,
            "Average calculation time ({$average_time_ms}ms) exceeds 100ms target");

        echo "\nPerformance Results:";
        echo "\nIterations: {$iterations}";
        echo "\nAverage Time: {$average_time_ms}ms";
        echo "\nTotal Time: " . ($total_time * 1000) . "ms";
    }

    public function testMemoryUsage() {
        $initial_memory = memory_get_usage();
        $calculator = new PrecisionCalculator();

        // Perform many calculations to test memory leaks
        for ($i = 0; $i < 10000; $i++) {
            $calculator->calculatePreciseCoordinates([
                'x' => $i, 'y' => $i, 'width' => 100, 'height' => 100
            ], 999, 'M', 300);
        }

        $final_memory = memory_get_usage();
        $memory_increase_mb = ($final_memory - $initial_memory) / 1024 / 1024;

        $this->assertLessThan(50, $memory_increase_mb,
            "Memory usage increase ({$memory_increase_mb}MB) too high");
    }

    public function testCacheEfficiency() {
        $calculator = new PrecisionCalculator();
        $test_coords = ['x' => 100, 'y' => 100, 'width' => 200, 'height' => 300];

        // First calculation (cache miss)
        $start_time = microtime(true);
        $result1 = $calculator->calculatePreciseCoordinates($test_coords, 999, 'M', 300);
        $first_calculation_time = microtime(true) - $start_time;

        // Second calculation (should be cached)
        $start_time = microtime(true);
        $result2 = $calculator->calculatePreciseCoordinates($test_coords, 999, 'M', 300);
        $second_calculation_time = microtime(true) - $start_time;

        // Cache should make second calculation significantly faster
        $this->assertLessThan($first_calculation_time * 0.1, $second_calculation_time,
            'Cache efficiency not meeting expectations');

        $metrics = $calculator->getPerformanceMetrics();
        $this->assertGreaterThan(80, $metrics['cache_hit_ratio'],
            'Cache hit ratio too low');
    }
}
```

### Test Configuration

#### phpunit.xml Configuration

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="tests/bootstrap.php"
         colors="true"
         verbose="true">

    <testsuites>
        <testsuite name="Unit">
            <directory>tests/Unit</directory>
        </testsuite>
        <testsuite name="Integration">
            <directory>tests/Integration</directory>
        </testsuite>
        <testsuite name="Performance">
            <directory>tests/Performance</directory>
        </testsuite>
    </testsuites>

    <coverage processUncoveredFiles="true">
        <include>
            <directory suffix=".php">includes</directory>
        </include>
        <exclude>
            <directory suffix=".php">tests</directory>
            <directory suffix=".php">vendor</directory>
        </exclude>
    </coverage>

    <logging>
        <log type="coverage-html" target="coverage-html"/>
        <log type="coverage-clover" target="coverage.xml"/>
        <log type="junit" target="junit.xml"/>
    </logging>

    <php>
        <const name="WP_TESTS_DIR" value="/tmp/wordpress-tests-lib"/>
        <const name="WP_CORE_DIR" value="/tmp/wordpress/"/>
        <const name="MEASUREMENT_PRECISION_TOLERANCE" value="0.1"/>
        <const name="TEST_TEMPLATE_ID" value="999"/>
    </php>
</phpunit>
```

---

## ⚡ Performance Guidelines

### Optimization Strategies

#### 1. Calculation Optimization

```php
class OptimizedPrecisionCalculator extends PrecisionCalculator {

    private $calculation_cache = [];
    private $cache_ttl = 3600; // 1 hour

    public function calculatePreciseCoordinates($canvas_coords, $template_id, $size, $dpi = 96) {
        // Create cache key
        $cache_key = $this->generateCacheKey($canvas_coords, $template_id, $size, $dpi);

        // Check cache first
        if ($cached_result = $this->getCachedResult($cache_key)) {
            return $cached_result;
        }

        // Perform calculation
        $start_time = microtime(true);
        $result = parent::calculatePreciseCoordinates($canvas_coords, $template_id, $size, $dpi);
        $calculation_time = microtime(true) - $start_time;

        // Cache successful results
        if (!is_wp_error($result)) {
            $result['cache_miss'] = true;
            $result['calculation_time_actual'] = $calculation_time * 1000;
            $this->setCachedResult($cache_key, $result);
        }

        return $result;
    }

    private function generateCacheKey($coords, $template_id, $size, $dpi) {
        return md5(serialize([$coords, $template_id, $size, $dpi]));
    }

    private function getCachedResult($key) {
        if (isset($this->calculation_cache[$key])) {
            $cached = $this->calculation_cache[$key];

            if (time() - $cached['timestamp'] < $this->cache_ttl) {
                $cached['data']['cache_hit'] = true;
                return $cached['data'];
            }

            unset($this->calculation_cache[$key]);
        }

        return false;
    }

    private function setCachedResult($key, $result) {
        $this->calculation_cache[$key] = [
            'data' => $result,
            'timestamp' => time()
        ];

        // Limit cache size
        if (count($this->calculation_cache) > 1000) {
            $this->pruneCacheOldest();
        }
    }
}
```

#### 2. Database Optimization

```php
class OptimizedTemplateMeasurementManager extends TemplateMeasurementManager {

    public function get_measurements_bulk($template_ids, $sizes = []) {
        global $wpdb;

        $template_ids_sql = implode(',', array_map('intval', $template_ids));
        $sizes_condition = empty($sizes) ? '' :
            "AND size_key IN ('" . implode("','", array_map('esc_sql', $sizes)) . "')";

        $query = "
            SELECT template_id, size_key, measurement_key, value_cm
            FROM {$wpdb->prefix}template_measurements
            WHERE template_id IN ({$template_ids_sql}) {$sizes_condition}
            ORDER BY template_id, size_key, measurement_key
        ";

        $results = $wpdb->get_results($query);

        // Group results by template_id and size
        $grouped = [];
        foreach ($results as $row) {
            $grouped[$row->template_id][$row->size_key][$row->measurement_key] = floatval($row->value_cm);
        }

        return $grouped;
    }

    public function preload_measurements($template_ids) {
        $measurements = $this->get_measurements_bulk($template_ids);

        // Store in object cache
        foreach ($measurements as $template_id => $template_measurements) {
            wp_cache_set("template_measurements_{$template_id}", $template_measurements, 'yprint', 3600);
        }

        return count($measurements);
    }
}
```

#### 3. Frontend Optimization

```javascript
class YPrintPerformanceOptimizer {
    constructor() {
        this.calculationQueue = [];
        this.calculationTimer = null;
        this.batchSize = 10;
        this.debounceDelay = 150;
    }

    // Debounced precision calculation
    queueCalculation(coords, templateId, size, dpi) {
        this.calculationQueue.push({coords, templateId, size, dpi, timestamp: Date.now()});

        if (this.calculationTimer) {
            clearTimeout(this.calculationTimer);
        }

        this.calculationTimer = setTimeout(() => {
            this.processBatch();
        }, this.debounceDelay);
    }

    async processBatch() {
        if (this.calculationQueue.length === 0) return;

        // Take up to batchSize items
        const batch = this.calculationQueue.splice(0, this.batchSize);

        // Process batch in parallel
        const promises = batch.map(item => this.calculatePrecision(item));

        try {
            const results = await Promise.all(promises);
            this.handleBatchResults(results);
        } catch (error) {
            console.error('Batch calculation failed:', error);
        }

        // Process remaining items if any
        if (this.calculationQueue.length > 0) {
            setTimeout(() => this.processBatch(), 50);
        }
    }

    async calculatePrecision(item) {
        const cacheKey = this.generateCacheKey(item);

        // Check browser cache first
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return {...cached, cached: true};
        }

        // Make API request
        const response = await fetch('/wp-json/yprint/v1/precision-calculate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                canvas_coords: item.coords,
                template_id: item.templateId,
                size: item.size,
                dpi: item.dpi
            })
        });

        const result = await response.json();

        // Cache successful results
        if (result.success) {
            this.setCache(cacheKey, result.data);
        }

        return result;
    }

    generateCacheKey(item) {
        return btoa(JSON.stringify([item.coords, item.templateId, item.size, item.dpi]));
    }

    getFromCache(key) {
        const cached = localStorage.getItem(`yprint_calc_${key}`);
        if (!cached) return null;

        const data = JSON.parse(cached);
        if (Date.now() - data.timestamp > 3600000) { // 1 hour
            localStorage.removeItem(`yprint_calc_${key}`);
            return null;
        }

        return data.result;
    }

    setCache(key, result) {
        try {
            localStorage.setItem(`yprint_calc_${key}`, JSON.stringify({
                result,
                timestamp: Date.now()
            }));
        } catch (e) {
            // Handle storage quota exceeded
            this.clearOldCache();
        }
    }
}

// Initialize optimizer
const precisionOptimizer = new YPrintPerformanceOptimizer();
```

### Memory Management

```php
class YPrintMemoryManager {

    private static $instance = null;
    private $memory_threshold = 400 * 1024 * 1024; // 400MB
    private $cache_cleanup_ratio = 0.3; // Clean 30% when threshold reached

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function checkMemoryUsage() {
        $current_usage = memory_get_usage(true);

        if ($current_usage > $this->memory_threshold) {
            $this->performCleanup();
        }

        return $current_usage;
    }

    private function performCleanup() {
        // Clear object cache
        wp_cache_flush_group('yprint');
        wp_cache_flush_group('yprint_calculations');

        // Clear precision calculator cache
        if (class_exists('PrecisionCalculator')) {
            $calculator = new PrecisionCalculator();
            $calculator->clearCache();
        }

        // Force garbage collection
        if (function_exists('gc_collect_cycles')) {
            gc_collect_cycles();
        }

        error_log('YPrint memory cleanup performed at ' . date('Y-m-d H:i:s'));
    }

    public function monitorCalculation(callable $callback) {
        $initial_memory = memory_get_usage(true);
        $initial_peak = memory_get_peak_usage(true);

        $result = $callback();

        $final_memory = memory_get_usage(true);
        $final_peak = memory_get_peak_usage(true);

        $memory_used = $final_memory - $initial_memory;
        $peak_increase = $final_peak - $initial_peak;

        if ($memory_used > 10 * 1024 * 1024) { // 10MB
            error_log("High memory usage detected: {$memory_used} bytes");
        }

        return [
            'result' => $result,
            'memory_used' => $memory_used,
            'peak_increase' => $peak_increase
        ];
    }
}

// Use memory monitoring
$memory_manager = YPrintMemoryManager::getInstance();
$monitored_result = $memory_manager->monitorCalculation(function() use ($calculator, $coords) {
    return $calculator->calculatePreciseCoordinates($coords, 999, 'M', 300);
});
```

---

## 🔍 Troubleshooting

### Common Development Issues

#### Issue: Precision Calculations Returning WP_Error

**Symptoms:**
- `calculatePreciseCoordinates()` returns WP_Error objects
- Error messages about invalid parameters or calculations

**Debugging Steps:**

```php
$calculator = new PrecisionCalculator();
$result = $calculator->calculatePreciseCoordinates($coords, $template_id, $size, $dpi);

if (is_wp_error($result)) {
    error_log('Precision calculation error:');
    error_log('Code: ' . $result->get_error_code());
    error_log('Message: ' . $result->get_error_message());
    error_log('Data: ' . print_r($result->get_error_data(), true));

    // Check input parameters
    error_log('Input coords: ' . print_r($coords, true));
    error_log('Template ID: ' . $template_id);
    error_log('Size: ' . $size);
    error_log('DPI: ' . $dpi);
}
```

**Common Causes and Solutions:**

1. **Invalid DPI Value**
   ```php
   // Problem: DPI not in supported list
   $result = $calculator->calculatePreciseCoordinates($coords, 999, 'M', 200); // 200 not supported

   // Solution: Use supported DPI values
   $supported_dpis = [72, 96, 150, 300];
   $dpi = in_array($requested_dpi, $supported_dpis) ? $requested_dpi : 96;
   ```

2. **Missing Template Measurements**
   ```php
   // Check if template has measurements
   $manager = new TemplateMeasurementManager();
   $measurements = $manager->get_measurements($template_id, $size);

   if (empty($measurements)) {
       error_log("No measurements found for template {$template_id}, size {$size}");
       // Create default measurements or handle gracefully
   }
   ```

3. **Invalid Coordinate Format**
   ```php
   // Problem: Missing required keys
   $coords = ['x' => 100, 'y' => 150]; // Missing width, height

   // Solution: Validate coordinate structure
   $required_keys = ['x', 'y', 'width', 'height'];
   foreach ($required_keys as $key) {
       if (!isset($coords[$key]) || !is_numeric($coords[$key])) {
           return new WP_Error('invalid_coords', "Missing or invalid {$key} coordinate");
       }
   }
   ```

#### Issue: Performance Degradation

**Symptoms:**
- Calculations taking longer than 100ms
- High memory usage
- Timeouts on API requests

**Performance Debugging:**

```php
class PrecisionDebugger {

    public static function profileCalculation($coords, $template_id, $size, $dpi) {
        $start_time = microtime(true);
        $start_memory = memory_get_usage(true);

        $calculator = new PrecisionCalculator();
        $result = $calculator->calculatePreciseCoordinates($coords, $template_id, $size, $dpi);

        $end_time = microtime(true);
        $end_memory = memory_get_usage(true);

        $profile = [
            'execution_time_ms' => ($end_time - $start_time) * 1000,
            'memory_used_kb' => ($end_memory - $start_memory) / 1024,
            'peak_memory_mb' => memory_get_peak_usage(true) / 1024 / 1024,
            'result_valid' => !is_wp_error($result)
        ];

        if ($profile['execution_time_ms'] > 100) {
            error_log('Performance warning: ' . print_r($profile, true));
        }

        return $profile;
    }

    public static function analyzeDatabaseQueries() {
        global $wpdb;

        $queries_before = $wpdb->num_queries;

        // Perform test calculation
        $calculator = new PrecisionCalculator();
        $result = $calculator->calculatePreciseCoordinates(
            ['x' => 100, 'y' => 100, 'width' => 200, 'height' => 300],
            999, 'M', 300
        );

        $queries_after = $wpdb->num_queries;
        $query_count = $queries_after - $queries_before;

        if ($query_count > 5) {
            error_log("High query count detected: {$query_count} queries");

            if (defined('SAVEQUERIES') && SAVEQUERIES) {
                $recent_queries = array_slice($wpdb->queries, -$query_count);
                foreach ($recent_queries as $query_data) {
                    error_log("Query: {$query_data[0]} (Time: {$query_data[1]}s)");
                }
            }
        }

        return $query_count;
    }
}

// Usage
$profile = PrecisionDebugger::profileCalculation($coords, 999, 'M', 300);
$query_count = PrecisionDebugger::analyzeDatabaseQueries();
```

#### Issue: Cache-Related Problems

**Symptoms:**
- Stale precision calculations
- Memory leaks from caching
- Cache not improving performance

**Cache Debugging:**

```php
class CacheDebugger {

    public static function analyzeCacheEfficiency() {
        $calculator = new PrecisionCalculator();
        $test_coords = ['x' => 100, 'y' => 100, 'width' => 200, 'height' => 300];

        // Clear cache to start fresh
        wp_cache_flush_group('yprint');

        $metrics = [];

        // First calculation (cache miss expected)
        $start = microtime(true);
        $result1 = $calculator->calculatePreciseCoordinates($test_coords, 999, 'M', 300);
        $time1 = microtime(true) - $start;

        // Second calculation (cache hit expected)
        $start = microtime(true);
        $result2 = $calculator->calculatePreciseCoordinates($test_coords, 999, 'M', 300);
        $time2 = microtime(true) - $start;

        $metrics['first_calculation_ms'] = $time1 * 1000;
        $metrics['second_calculation_ms'] = $time2 * 1000;
        $metrics['cache_effectiveness'] = ($time1 - $time2) / $time1 * 100;

        $perf_metrics = $calculator->getPerformanceMetrics();
        $metrics['cache_hit_ratio'] = $perf_metrics['cache_hit_ratio'];
        $metrics['cache_entries'] = $perf_metrics['cache_entries'];

        error_log('Cache analysis: ' . print_r($metrics, true));

        return $metrics;
    }

    public static function clearAllCaches() {
        // WordPress object cache
        wp_cache_flush();
        wp_cache_flush_group('yprint');
        wp_cache_flush_group('yprint_calculations');
        wp_cache_flush_group('yprint_templates');

        // Redis cache (if available)
        if (class_exists('Redis')) {
            $redis = new Redis();
            if ($redis->connect('127.0.0.1', 6379)) {
                $redis->flushAll();
                $redis->close();
            }
        }

        // Precision calculator internal cache
        if (class_exists('PrecisionCalculator')) {
            $calculator = new PrecisionCalculator();
            if (method_exists($calculator, 'clearCache')) {
                $calculator->clearCache();
            }
        }

        error_log('All YPrint caches cleared');
    }
}
```

### API Integration Issues

#### Issue: REST API Endpoints Not Working

**Debugging REST API:**

```php
// Add debugging to REST API endpoints
add_action('rest_api_init', function() {
    register_rest_route('yprint/v1', '/precision-calculate', [
        'methods' => 'POST',
        'callback' => 'yprint_debug_precision_calculate',
        'permission_callback' => '__return_true',
        'args' => [
            'canvas_coords' => ['required' => true, 'type' => 'array'],
            'template_id' => ['required' => true, 'type' => 'integer'],
            'size' => ['required' => true, 'type' => 'string'],
            'dpi' => ['default' => 96, 'type' => 'integer']
        ]
    ]);
});

function yprint_debug_precision_calculate($request) {
    // Log all incoming requests
    error_log('YPrint API Request: ' . print_r($request->get_params(), true));

    try {
        $calculator = new PrecisionCalculator();

        $result = $calculator->calculatePreciseCoordinates(
            $request['canvas_coords'],
            $request['template_id'],
            $request['size'],
            $request['dpi']
        );

        if (is_wp_error($result)) {
            error_log('YPrint API Error: ' . $result->get_error_message());
            return new WP_REST_Response([
                'success' => false,
                'error' => [
                    'code' => $result->get_error_code(),
                    'message' => $result->get_error_message(),
                    'data' => $result->get_error_data()
                ]
            ], 400);
        }

        error_log('YPrint API Success: Accuracy ' . $result['accuracy_score'] . '%');

        return new WP_REST_Response([
            'success' => true,
            'data' => $result
        ]);

    } catch (Exception $e) {
        error_log('YPrint API Exception: ' . $e->getMessage());
        return new WP_REST_Response([
            'success' => false,
            'error' => [
                'code' => 'EXCEPTION',
                'message' => $e->getMessage()
            ]
        ], 500);
    }
}

// Test API endpoint
function test_yprint_api() {
    $response = wp_remote_post(home_url('/wp-json/yprint/v1/precision-calculate'), [
        'body' => json_encode([
            'canvas_coords' => ['x' => 100, 'y' => 100, 'width' => 200, 'height' => 300],
            'template_id' => 999,
            'size' => 'M',
            'dpi' => 300
        ]),
        'headers' => ['Content-Type' => 'application/json']
    ]);

    if (is_wp_error($response)) {
        error_log('API Test Error: ' . $response->get_error_message());
        return false;
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    error_log('API Test Response: ' . print_r($data, true));

    return $data;
}
```

---

## 🤝 Contributing

### Development Setup

#### Local Development Environment

```bash
# Clone repository
git clone https://github.com/your-org/yprint-designtool.git
cd yprint-designtool

# Install dependencies
composer install
npm install

# Setup testing environment
./bin/install-wp-tests.sh wordpress_test root password localhost latest

# Run tests
composer test

# Start development server
docker-compose up -d
```

#### Code Standards

The project follows WordPress coding standards with additional precision-specific requirements:

**PHP Code Standards:**
```bash
# Install PHP CodeSniffer with WordPress rules
composer global require "squizlabs/php_codesniffer=*"
composer global require wp-coding-standards/wpcs

# Check code standards
phpcs --standard=WordPress includes/

# Fix auto-fixable issues
phpcbf --standard=WordPress includes/
```

**Precision-Specific Standards:**
- All mathematical calculations must include error handling
- Precision tolerance must be configurable via constants
- Performance must be monitored and logged
- All public methods must have comprehensive documentation

### Contributing Guidelines

#### Pull Request Process

1. **Fork and Branch**
   ```bash
   git checkout -b feature/precision-improvement
   ```

2. **Development and Testing**
   ```bash
   # Make changes
   # Add tests for new functionality
   composer test

   # Check code standards
   phpcs --standard=WordPress includes/
   ```

3. **Documentation**
   - Update API documentation for any new methods
   - Add usage examples for new features
   - Update performance benchmarks if applicable

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: improve precision calculation accuracy by 0.02mm"
   git push origin feature/precision-improvement
   ```

5. **Pull Request**
   - Create detailed pull request description
   - Include test results and performance impact
   - Reference related issues

#### Development Workflow

```php
// Example contribution: Adding new precision validation level

class ContributedPrecisionValidator {

    /**
     * Validates precision using statistical analysis
     *
     * @param float $calculated_value Calculated measurement
     * @param float $expected_value Expected measurement
     * @param array $historical_data Historical measurement data for analysis
     * @return array Validation result with statistical confidence
     */
    public function validateWithStatisticalAnalysis($calculated_value, $expected_value, $historical_data = []) {
        // Implementation with proper error handling
        try {
            $z_score = $this->calculateZScore($calculated_value, $expected_value, $historical_data);
            $confidence = $this->calculateStatisticalConfidence($z_score);

            return [
                'valid' => abs($z_score) <= 2.0,
                'z_score' => $z_score,
                'statistical_confidence' => $confidence,
                'precision_grade' => $this->getStatisticalGrade($z_score),
                'recommendation' => $this->generateRecommendation($z_score)
            ];

        } catch (Exception $e) {
            error_log('Statistical validation error: ' . $e->getMessage());
            return new WP_Error('statistical_validation_failed', $e->getMessage());
        }
    }

    private function calculateZScore($calculated, $expected, $historical) {
        if (empty($historical)) {
            return 0; // No statistical basis
        }

        $mean = array_sum($historical) / count($historical);
        $variance = array_sum(array_map(function($x) use ($mean) {
            return pow($x - $mean, 2);
        }, $historical)) / count($historical);

        $std_dev = sqrt($variance);

        if ($std_dev == 0) {
            return 0;
        }

        return ($calculated - $expected) / $std_dev;
    }
}

// Add comprehensive tests for new functionality
class ContributedPrecisionValidatorTest extends \PHPUnit\Framework\TestCase {

    private $validator;

    protected function setUp(): void {
        $this->validator = new ContributedPrecisionValidator();
    }

    public function testStatisticalValidationWithNormalDistribution() {
        $historical_data = [25.4, 25.3, 25.5, 25.4, 25.2, 25.6, 25.3, 25.4, 25.5, 25.3];

        $result = $this->validator->validateWithStatisticalAnalysis(25.4, 25.4, $historical_data);

        $this->assertIsArray($result);
        $this->assertTrue($result['valid']);
        $this->assertLessThan(2.0, abs($result['z_score']));
        $this->assertGreaterThan(0.8, $result['statistical_confidence']);
    }

    public function testStatisticalValidationWithOutlier() {
        $historical_data = [25.4, 25.3, 25.5, 25.4, 25.2];

        // Test with outlier value
        $result = $this->validator->validateWithStatisticalAnalysis(27.0, 25.4, $historical_data);

        $this->assertFalse($result['valid']);
        $this->assertGreaterThan(2.0, abs($result['z_score']));
        $this->assertStringContains('outlier', strtolower($result['recommendation']));
    }
}
```

### Issue Reporting

#### Bug Report Template

```markdown
## Bug Report: Precision Calculation Issue

**Summary:**
Brief description of the issue

**Environment:**
- WordPress Version: 6.0+
- YPrint Version: 1.0.9
- PHP Version: 8.1
- Browser: Chrome 100+

**Steps to Reproduce:**
1. Step one
2. Step two
3. Expected vs actual result

**Code Example:**
```php
// Minimal code to reproduce issue
$calculator = new PrecisionCalculator();
$result = $calculator->calculatePreciseCoordinates(...);
```

**Error Messages:**
```
Copy exact error messages here
```

**Performance Impact:**
- Calculation time: XXXms (expected: <100ms)
- Memory usage: XXXKB
- Precision accuracy: XX% (expected: >95%)

**Additional Context:**
Any other relevant information
```

#### Feature Request Template

```markdown
## Feature Request: Enhanced Precision Feature

**Use Case:**
Describe the business need or use case

**Proposed Solution:**
Detailed description of proposed feature

**API Design:**
```php
// Proposed method signature
public function newPrecisionFeature($param1, $param2): array
```

**Performance Considerations:**
- Expected performance impact
- Memory usage implications
- Caching requirements

**Testing Strategy:**
- How feature will be tested
- Performance benchmarks
- Edge cases to consider

**Documentation Needs:**
- API documentation updates
- User manual additions
- Example usage scenarios
```

---

*This developer documentation is part of the YPrint Design Tool Precision System v1.0.9*
*Last updated: September 26, 2025*
*For user instructions, see: USER-MANUAL-PRECISION-SYSTEM.md*
*For deployment guide, see: PRODUCTION-DEPLOYMENT-GUIDE.md*
*For technical details, see: ISSUE-23-PRECISION-TESTING.md*
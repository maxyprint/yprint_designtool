<?php
#!/usr/bin/env php
<?php
/**
 * Test Infrastructure Verification Script
 *
 * Comprehensive test runner and infrastructure validator for the
 * PHPUnit testing framework created for the YPrint Design Tool.
 *
 * @package OctoPrintDesigner
 * @since 1.0.0
 */

// Set script timeout and memory limit
set_time_limit(300); // 5 minutes
ini_set('memory_limit', '512M');

echo "🧪 YPrint Design Tool - PHPUnit Infrastructure Verification\n";
echo "============================================================\n\n";

// Check PHP version
$php_version = PHP_VERSION;
$min_php_version = '7.4.0';

if (version_compare($php_version, $min_php_version, '<')) {
    echo "❌ PHP Version: {$php_version} (Minimum required: {$min_php_version})\n";
    exit(1);
} else {
    echo "✅ PHP Version: {$php_version}\n";
}

// Check required extensions
$required_extensions = ['json', 'mbstring', 'curl'];
$missing_extensions = [];

foreach ($required_extensions as $extension) {
    if (!extension_loaded($extension)) {
        $missing_extensions[] = $extension;
    }
}

if (!empty($missing_extensions)) {
    echo "❌ Missing PHP extensions: " . implode(', ', $missing_extensions) . "\n";
    exit(1);
} else {
    echo "✅ Required PHP extensions: " . implode(', ', $required_extensions) . "\n";
}

// Check if Composer autoloader exists
$autoloader = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoloader)) {
    echo "\n❌ Composer autoloader not found. Run: composer install\n";
    exit(1);
} else {
    echo "✅ Composer autoloader found\n";
    require_once $autoloader;
}

// Check PHPUnit availability
$phpunit_path = __DIR__ . '/vendor/bin/phpunit';
if (!file_exists($phpunit_path)) {
    echo "❌ PHPUnit not found. Run: composer install\n";
    exit(1);
} else {
    echo "✅ PHPUnit installation found\n";
}

// Verify test infrastructure files
echo "\n📁 Verifying Test Infrastructure Files...\n";

$required_files = [
    'composer.json' => 'Composer configuration',
    'phpunit.xml' => 'PHPUnit configuration',
    'tests/bootstrap.php' => 'Test bootstrap',
    'tests/TestCase.php' => 'Base test case',
    'tests/PrecisionTestCase.php' => 'Precision test utilities',
    'tests/MockWordPressEnvironment.php' => 'WordPress mock environment',
    'tests/Unit/PrecisionCalculatorTest.php' => 'Precision calculator tests',
    'tests/Unit/MeasurementValidationTest.php' => 'Measurement validation tests',
    'tests/Unit/CoordinateConversionTest.php' => 'Coordinate conversion tests',
    'tests/Integration/APIIntegrationTest.php' => 'API integration tests',
    'tests/Integration/DatabaseIntegrationTest.php' => 'Database integration tests',
    'tests/Integration/EndToEndPrecisionTest.php' => 'End-to-end precision tests',
    'tests/Integration/LegacyTestIntegrationTest.php' => 'Legacy test integration',
    'tests/Performance/CalculationBenchmarkTest.php' => 'Calculation benchmarks',
    'tests/Performance/ConcurrencyTest.php' => 'Concurrency tests',
    'tests/README.md' => 'Test documentation'
];

$missing_files = [];

foreach ($required_files as $file => $description) {
    if (file_exists(__DIR__ . '/' . $file)) {
        echo "  ✅ {$description}: {$file}\n";
    } else {
        echo "  ❌ {$description}: {$file}\n";
        $missing_files[] = $file;
    }
}

if (!empty($missing_files)) {
    echo "\n❌ Missing required files. Cannot proceed.\n";
    exit(1);
}

// Verify test directory structure
echo "\n📂 Verifying Test Directory Structure...\n";

$required_dirs = [
    'tests/Unit' => 'Unit test directory',
    'tests/Integration' => 'Integration test directory',
    'tests/Performance' => 'Performance test directory'
];

foreach ($required_dirs as $dir => $description) {
    if (is_dir(__DIR__ . '/' . $dir)) {
        echo "  ✅ {$description}: {$dir}\n";
    } else {
        echo "  ❌ {$description}: {$dir}\n";
        exit(1);
    }
}

// Test configuration validation
echo "\n⚙️ Validating Test Configuration...\n";

$phpunit_config = __DIR__ . '/phpunit.xml';
if (file_exists($phpunit_config)) {
    $xml = simplexml_load_file($phpunit_config);

    // Check test suites
    $testsuites = $xml->xpath('//testsuite');
    if (count($testsuites) >= 3) {
        echo "  ✅ Test suites configured: " . count($testsuites) . "\n";
    } else {
        echo "  ❌ Insufficient test suites configured\n";
    }

    // Check bootstrap
    $bootstrap = (string)$xml['bootstrap'];
    if ($bootstrap === 'tests/bootstrap.php') {
        echo "  ✅ Bootstrap configured: {$bootstrap}\n";
    } else {
        echo "  ❌ Bootstrap not properly configured\n";
    }

    // Check coverage
    $coverage = $xml->xpath('//coverage');
    if (!empty($coverage)) {
        echo "  ✅ Code coverage configured\n";
    } else {
        echo "  ⚠️ Code coverage not configured\n";
    }
} else {
    echo "  ❌ phpunit.xml configuration not found\n";
    exit(1);
}

// Test composer configuration
echo "\n📦 Validating Composer Configuration...\n";

$composer_config = __DIR__ . '/composer.json';
if (file_exists($composer_config)) {
    $composer = json_decode(file_get_contents($composer_config), true);

    // Check PHPUnit dependency
    if (isset($composer['require-dev']['phpunit/phpunit'])) {
        echo "  ✅ PHPUnit dependency: " . $composer['require-dev']['phpunit/phpunit'] . "\n";
    } else {
        echo "  ❌ PHPUnit dependency not found in composer.json\n";
    }

    // Check Brain/Monkey dependency
    if (isset($composer['require-dev']['brain/monkey'])) {
        echo "  ✅ Brain/Monkey dependency: " . $composer['require-dev']['brain/monkey'] . "\n";
    } else {
        echo "  ⚠️ Brain/Monkey dependency not found\n";
    }

    // Check autoload configuration
    if (isset($composer['autoload']['psr-4'])) {
        echo "  ✅ PSR-4 autoload configured\n";
    } else {
        echo "  ❌ PSR-4 autoload not configured\n";
    }

    // Check test scripts
    if (isset($composer['scripts']['test'])) {
        echo "  ✅ Test scripts configured\n";
    } else {
        echo "  ⚠️ Test scripts not configured\n";
    }
}

// Run syntax check on test files
echo "\n🔍 Running Syntax Check on Test Files...\n";

$test_files = glob(__DIR__ . '/tests/**/*.php');
$syntax_errors = 0;

foreach ($test_files as $file) {
    $output = [];
    $return_code = 0;

    exec("php -l " . escapeshellarg($file) . " 2>&1", $output, $return_code);

    if ($return_code !== 0) {
        echo "  ❌ Syntax error in: " . basename($file) . "\n";
        echo "     " . implode("\n     ", $output) . "\n";
        $syntax_errors++;
    }
}

if ($syntax_errors === 0) {
    echo "  ✅ All test files passed syntax check (" . count($test_files) . " files)\n";
} else {
    echo "  ❌ {$syntax_errors} files have syntax errors\n";
    exit(1);
}

// Test environment check
echo "\n🌍 Testing Environment Check...\n";

// Memory limit check
$memory_limit = ini_get('memory_limit');
$memory_bytes = $memory_limit;
if (is_numeric($memory_limit)) {
    $memory_bytes = $memory_limit;
} elseif (preg_match('/^(\d+)(.)$/', $memory_limit, $matches)) {
    $memory_bytes = $matches[1];
    switch (strtoupper($matches[2])) {
        case 'G': $memory_bytes *= 1024;
        case 'M': $memory_bytes *= 1024;
        case 'K': $memory_bytes *= 1024;
    }
}

if ($memory_bytes >= 256 * 1024 * 1024 || $memory_limit === '-1') {
    echo "  ✅ Memory limit: {$memory_limit}\n";
} else {
    echo "  ⚠️ Memory limit might be too low: {$memory_limit} (recommended: 256M+)\n";
}

// Time limit check
$time_limit = ini_get('max_execution_time');
if ($time_limit >= 60 || $time_limit == 0) {
    echo "  ✅ Execution time limit: {$time_limit}s\n";
} else {
    echo "  ⚠️ Execution time limit might be too low: {$time_limit}s\n";
}

// Quick smoke test
echo "\n🚀 Running Quick Smoke Test...\n";

$test_command = "cd " . escapeshellarg(__DIR__) . " && " . escapeshellarg($phpunit_path) . " --no-coverage --stop-on-error --quiet tests/Unit/PrecisionCalculatorTest.php::testMeasurementPrecisionRounding 2>&1";

$smoke_output = [];
$smoke_return_code = 0;

exec($test_command, $smoke_output, $smoke_return_code);

if ($smoke_return_code === 0) {
    echo "  ✅ Smoke test passed - Basic precision calculation working\n";
} else {
    echo "  ❌ Smoke test failed:\n";
    echo "     " . implode("\n     ", $smoke_output) . "\n";
    echo "     Command: {$test_command}\n";
}

// Final summary
echo "\n📊 Infrastructure Summary\n";
echo "========================\n";

$total_test_files = count(glob(__DIR__ . '/tests/**/*Test.php'));
$total_test_classes = 0;
$total_test_methods = 0;

// Count test classes and methods
foreach (glob(__DIR__ . '/tests/**/*Test.php') as $test_file) {
    $content = file_get_contents($test_file);

    // Count classes
    if (preg_match_all('/class\s+\w+.*Test.*extends/i', $content)) {
        $total_test_classes++;
    }

    // Count test methods
    $method_count = preg_match_all('/public\s+function\s+test\w+/i', $content);
    $total_test_methods += $method_count;
}

echo "📁 Test Files: {$total_test_files}\n";
echo "🏗️ Test Classes: {$total_test_classes}\n";
echo "🧪 Test Methods: {$total_test_methods}\n";

// Display usage instructions
echo "\n🎯 Usage Instructions\n";
echo "===================\n";
echo "Run all tests:              vendor/bin/phpunit\n";
echo "Run unit tests only:        vendor/bin/phpunit --testsuite=unit\n";
echo "Run integration tests:      vendor/bin/phpunit --testsuite=integration\n";
echo "Run performance tests:      vendor/bin/phpunit --testsuite=performance\n";
echo "Run with coverage:          vendor/bin/phpunit --coverage-html coverage/\n";
echo "Run specific test:          vendor/bin/phpunit tests/Unit/PrecisionCalculatorTest.php\n";
echo "Run with verbose output:    vendor/bin/phpunit --verbose\n";

// Display composer scripts
echo "\n📦 Composer Scripts\n";
echo "==================\n";
echo "composer test                # Run all tests\n";
echo "composer test:unit          # Run unit tests only\n";
echo "composer test:integration   # Run integration tests only\n";
echo "composer test:performance   # Run performance tests only\n";
echo "composer test:coverage      # Run with HTML coverage report\n";

// Final status
if ($syntax_errors === 0 && $smoke_return_code === 0) {
    echo "\n🎉 SUCCESS: PHPUnit Infrastructure Ready!\n";
    echo "=========================================\n";
    echo "✅ All checks passed\n";
    echo "✅ {$total_test_files} test files with {$total_test_methods} test methods\n";
    echo "✅ Infrastructure validated and ready for precision testing\n";
    echo "\n🚀 You can now run the complete test suite with: vendor/bin/phpunit\n\n";
    exit(0);
} else {
    echo "\n❌ FAILURE: Issues detected in test infrastructure\n";
    echo "================================================\n";
    echo "Please resolve the issues above before running tests.\n\n";
    exit(1);
}
?>
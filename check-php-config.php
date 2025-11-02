<?php
/**
 * 🔧 PHP CONFIGURATION DIAGNOSTIC
 * Check PHP limits that could prevent database writes
 */

echo "🔧 PHP CONFIGURATION DIAGNOSTIC:\n";
echo "=================================\n\n";

// Critical PHP settings for large data operations
$critical_settings = [
    'memory_limit' => 'Memory available for PHP script execution',
    'max_execution_time' => 'Maximum script execution time',
    'post_max_size' => 'Maximum POST data size',
    'upload_max_filesize' => 'Maximum upload file size',
    'max_input_time' => 'Maximum input parsing time',
    'max_input_vars' => 'Maximum input variables'
];

echo "📊 CURRENT PHP SETTINGS:\n";
echo "========================\n\n";

foreach ($critical_settings as $setting => $description) {
    $value = ini_get($setting);
    echo sprintf("%-20s: %-10s (%s)\n", $setting, $value ?: 'Not set', $description);
}

echo "\n🎯 RECOMMENDED SETTINGS FOR 3MB PNG:\n";
echo "=====================================\n\n";

$recommended = [
    'memory_limit' => '512M',
    'max_execution_time' => '300',
    'post_max_size' => '64M',
    'upload_max_filesize' => '64M',
    'max_input_time' => '300',
    'max_input_vars' => '5000'
];

foreach ($recommended as $setting => $value) {
    echo sprintf("%-20s: %s\n", $setting, $value);
}

echo "\n🔍 MEMORY USAGE CHECK:\n";
echo "=====================\n\n";

echo "Current memory usage: " . memory_get_usage(true) . " bytes\n";
echo "Peak memory usage: " . memory_get_peak_usage(true) . " bytes\n";
echo "Memory limit: " . ini_get('memory_limit') . "\n\n";

// Calculate required memory for 3MB PNG
$png_size_mb = 3;
$base64_overhead = 1.33; // Base64 encoding adds ~33% overhead
$required_memory_mb = $png_size_mb * $base64_overhead * 2; // Double for processing

echo "💾 MEMORY CALCULATION:\n";
echo "======================\n\n";
echo "PNG size: {$png_size_mb}MB\n";
echo "Base64 overhead: " . ($base64_overhead * 100 - 100) . "%\n";
echo "Required memory: ~{$required_memory_mb}MB\n\n";

echo "🚨 LIKELY ISSUES:\n";
echo "=================\n\n";

$current_memory = ini_get('memory_limit');
if (preg_match('/(\d+)([KMG]?)/i', $current_memory, $matches)) {
    $memory_bytes = $matches[1];
    $unit = strtoupper($matches[2]);

    switch ($unit) {
        case 'G':
            $memory_mb = $memory_bytes * 1024;
            break;
        case 'M':
            $memory_mb = $memory_bytes;
            break;
        case 'K':
            $memory_mb = $memory_bytes / 1024;
            break;
        default:
            $memory_mb = $memory_bytes / (1024 * 1024);
    }

    if ($memory_mb < $required_memory_mb) {
        echo "❌ Memory limit ({$current_memory}) is too low!\n";
        echo "   Need at least {$required_memory_mb}MB for 3MB PNG processing\n\n";
    } else {
        echo "✅ Memory limit ({$current_memory}) should be sufficient\n\n";
    }
}

$max_exec = ini_get('max_execution_time');
if ($max_exec < 60) {
    echo "❌ Execution time ({$max_exec}s) might be too short for large PNG processing\n\n";
} else {
    echo "✅ Execution time ({$max_exec}s) should be sufficient\n\n";
}

echo "🔧 QUICK FIX INSTRUCTIONS:\n";
echo "==========================\n\n";
echo "Add these to your .htaccess file:\n\n";
echo "php_value memory_limit 512M\n";
echo "php_value max_execution_time 300\n";
echo "php_value post_max_size 64M\n";
echo "php_value upload_max_filesize 64M\n\n";

echo "Or add to wp-config.php:\n\n";
echo "ini_set('memory_limit', '512M');\n";
echo "ini_set('max_execution_time', 300);\n\n";

echo "📋 NEXT STEPS:\n";
echo "==============\n\n";
echo "1. Run this script: php check-php-config.php\n";
echo "2. Apply the recommended PHP settings\n";
echo "3. Check WordPress debug.log for specific errors\n";
echo "4. Test PNG generation again\n";
?>
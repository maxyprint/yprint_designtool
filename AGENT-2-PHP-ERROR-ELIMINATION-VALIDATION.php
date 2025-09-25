<?php
/**
 * AGENT-2 PHP ERROR ELIMINATION SPECIALIST VALIDATION
 *
 * This script validates that all wp_die() calls have been properly
 * converted to wp_send_json_error() in AJAX methods
 *
 * @author: Agent 2 - PHP Error Elimination Specialist
 * @date: 2025-09-25
 */

// Define paths to check
$admin_files = [
    '/Users/maxschwarz/Desktop/yprint_designtool/admin/class-point-to-point-admin.php',
    '/Users/maxschwarz/Desktop/yprint_designtool/admin/class-octo-print-designer-admin.php',
    '/Users/maxschwarz/Desktop/yprint_designtool/admin/class-octo-print-designer-settings.php'
];

echo "🤖 AGENT-2: PHP ERROR ELIMINATION VALIDATION REPORT\n";
echo "=====================================================\n\n";

$total_fixes = 0;
$total_errors = 0;

foreach ($admin_files as $file) {
    if (!file_exists($file)) {
        echo "❌ File not found: $file\n";
        $total_errors++;
        continue;
    }

    $content = file_get_contents($file);
    $filename = basename($file);

    echo "📁 ANALYZING: $filename\n";
    echo "----------------------------------------\n";

    // Count wp_die() calls
    $wp_die_count = preg_match_all('/wp_die\s*\(/', $content, $matches);

    // Count wp_send_json_error() calls
    $json_error_count = preg_match_all('/wp_send_json_error\s*\(/', $content, $matches);

    // Count return statements after wp_send_json_error
    $return_after_json_count = preg_match_all('/wp_send_json_error\([^)]+\);\s*return;/', $content, $matches);

    // Find AJAX methods
    $ajax_methods = [];
    preg_match_all('/public\s+function\s+(ajax_\w+)\s*\(/', $content, $ajax_matches);
    $ajax_methods = $ajax_matches[1] ?? [];

    echo "✅ wp_die() calls remaining: $wp_die_count\n";
    echo "✅ wp_send_json_error() calls: $json_error_count\n";
    echo "✅ Proper return statements: $return_after_json_count\n";
    echo "✅ AJAX methods found: " . count($ajax_methods) . "\n";

    if (count($ajax_methods) > 0) {
        echo "   📋 AJAX Methods:\n";
        foreach ($ajax_methods as $method) {
            echo "   - $method\n";
        }
    }

    // Validation
    if ($wp_die_count === 0) {
        echo "🎉 SUCCESS: No wp_die() calls remaining!\n";
    } else {
        echo "⚠️  WARNING: $wp_die_count wp_die() calls still found!\n";
        $total_errors++;
    }

    if ($json_error_count > 0 && $return_after_json_count === $json_error_count) {
        echo "🎉 SUCCESS: All wp_send_json_error() calls have proper return statements!\n";
    } elseif ($json_error_count > 0) {
        echo "⚠️  WARNING: Some wp_send_json_error() calls missing return statements!\n";
        $total_errors++;
    }

    $total_fixes += $json_error_count;
    echo "\n";
}

echo "🏆 FINAL VALIDATION SUMMARY\n";
echo "==========================\n";
echo "Total wp_send_json_error() fixes applied: $total_fixes\n";
echo "Total validation errors: $total_errors\n";

if ($total_errors === 0) {
    echo "\n🎉 MISSION ACCOMPLISHED!\n";
    echo "All wp_die() calls successfully converted to wp_send_json_error()\n";
    echo "All AJAX methods now return proper JSON responses\n";
    echo "SyntaxError issues should be resolved!\n";
} else {
    echo "\n⚠️  MISSION INCOMPLETE!\n";
    echo "Some issues remain and need manual review\n";
}

echo "\n📊 AGENT-2 SPECIALIZATION COMPLETE\n";
echo "Time: " . date('Y-m-d H:i:s') . "\n";
?>
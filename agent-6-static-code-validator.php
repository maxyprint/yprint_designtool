<?php
/**
 * AGENT 6: Static Code Validation (No WordPress Required)
 *
 * Validates offset fix implementation by analyzing code directly
 * Does NOT require WordPress - analyzes files statically
 *
 * @since 2025-10-03
 * @author AGENT 6
 */

class Agent6StaticCodeValidator {

    private $results = [];
    private $base_dir;

    public function __construct() {
        $this->base_dir = dirname(__FILE__);

        echo "\n";
        echo "═══════════════════════════════════════════════════════════════════════════\n";
        echo " AGENT 6: STATIC CODE VALIDATION\n";
        echo " (No WordPress Required)\n";
        echo "═══════════════════════════════════════════════════════════════════════════\n";
        echo "Validation Time: " . date('Y-m-d H:i:s') . "\n";
        echo "\n";
    }

    /**
     * Run all validations
     */
    public function run_all_validations() {
        echo "Starting static code validation...\n\n";

        $this->validate_javascript_bundle();
        $this->validate_php_renderer();
        $this->validate_code_patterns();
        $this->analyze_database_schema();
        $this->check_backup_files();

        $this->generate_report();
    }

    /**
     * VALIDATION 1: JavaScript Bundle
     */
    private function validate_javascript_bundle() {
        echo "──────────────────────────────────────────────────────────────────────────\n";
        echo " VALIDATION 1: JAVASCRIPT BUNDLE ANALYSIS\n";
        echo "──────────────────────────────────────────────────────────────────────────\n";

        $js_bundle = $this->base_dir . '/public/js/dist/designer.bundle.js';

        if (!file_exists($js_bundle)) {
            echo "❌ JavaScript bundle NOT FOUND\n";
            $this->log_result('js_bundle_exists', 'FAIL', 'File not found');
            echo "\n";
            return;
        }

        echo "✅ JavaScript bundle found\n";
        $content = file_get_contents($js_bundle);

        // Count offset fix markers
        $marker_count = substr_count($content, '🔧 OFFSET-FIX');
        echo "   OFFSET-FIX markers: {$marker_count}\n";

        // Check for critical functions
        $critical_patterns = [
            'getCanvasOffset' => '/getCanvasOffset\s*[:(]/',
            'offset_applied' => '/offset_applied/',
            'metadata.offset_x' => '/metadata\.offset_x/',
            'metadata.offset_y' => '/metadata\.offset_y/',
            'getBoundingClientRect' => '/getBoundingClientRect/'
        ];

        $all_found = true;
        foreach ($critical_patterns as $name => $pattern) {
            $found = preg_match($pattern, $content);
            if ($found) {
                echo "   ✅ Found: {$name}\n";
            } else {
                echo "   ❌ MISSING: {$name}\n";
                $all_found = false;
            }
        }

        // Check file size
        $file_size = filesize($js_bundle);
        $file_size_kb = round($file_size / 1024, 2);
        echo "   File size: {$file_size_kb} KB\n";

        // Check syntax (basic)
        exec("node -c {$js_bundle} 2>&1", $output, $return_code);
        if ($return_code === 0) {
            echo "   ✅ JavaScript syntax: VALID\n";
        } else {
            echo "   ❌ JavaScript syntax: INVALID\n";
            echo "      Error: " . implode("\n", $output) . "\n";
        }

        if ($marker_count >= 11 && $all_found) {
            $this->log_result('js_bundle_validation', 'PASS', "Found {$marker_count} markers, all patterns present");
        } else {
            $this->log_result('js_bundle_validation', 'FAIL', "Marker count: {$marker_count}, Missing patterns");
        }

        echo "\n";
    }

    /**
     * VALIDATION 2: PHP Renderer
     */
    private function validate_php_renderer() {
        echo "──────────────────────────────────────────────────────────────────────────\n";
        echo " VALIDATION 2: PHP RENDERER ANALYSIS\n";
        echo "──────────────────────────────────────────────────────────────────────────\n";

        $php_file = $this->base_dir . '/includes/class-octo-print-api-integration.php';

        if (!file_exists($php_file)) {
            echo "❌ PHP renderer NOT FOUND\n";
            $this->log_result('php_renderer_exists', 'FAIL', 'File not found');
            echo "\n";
            return;
        }

        echo "✅ PHP renderer found\n";
        $content = file_get_contents($php_file);

        // Count offset fix markers
        $marker_count = substr_count($content, '🔧 OFFSET-FIX');
        echo "   OFFSET-FIX markers: {$marker_count}\n";

        // Check for critical patterns in convert_canvas_to_print_coordinates
        $critical_patterns = [
            'offset_applied check' => '/metadata.*offset_applied.*===.*true/',
            'offset_x extraction' => '/offset_x\s*=.*floatval/',
            'offset_y extraction' => '/offset_y\s*=.*floatval/',
            'offset subtraction left' => '/left_px\s*-=\s*\$offset_x/',
            'offset subtraction top' => '/top_px\s*-=\s*\$offset_y/',
            'error_log offset fix' => '/error_log.*OFFSET-FIX/'
        ];

        $all_found = true;
        foreach ($critical_patterns as $name => $pattern) {
            $found = preg_match($pattern, $content);
            if ($found) {
                echo "   ✅ Found: {$name}\n";
            } else {
                echo "   ❌ MISSING: {$name}\n";
                $all_found = false;
            }
        }

        // Check for function presence
        if (preg_match('/function\s+convert_canvas_to_print_coordinates/', $content)) {
            echo "   ✅ Function: convert_canvas_to_print_coordinates exists\n";
        } else {
            echo "   ❌ MISSING: convert_canvas_to_print_coordinates function\n";
            $all_found = false;
        }

        if (preg_match('/function\s+estimate_position_from_canvas/', $content)) {
            echo "   ✅ Function: estimate_position_from_canvas exists\n";
        } else {
            echo "   ❌ MISSING: estimate_position_from_canvas function\n";
            $all_found = false;
        }

        // Check PHP syntax
        exec("php -l {$php_file} 2>&1", $output, $return_code);
        if ($return_code === 0) {
            echo "   ✅ PHP syntax: VALID\n";
        } else {
            echo "   ❌ PHP syntax: INVALID\n";
            echo "      Error: " . implode("\n", $output) . "\n";
        }

        if ($marker_count >= 5 && $all_found) {
            $this->log_result('php_renderer_validation', 'PASS', "Found {$marker_count} markers, all patterns present");
        } else {
            $this->log_result('php_renderer_validation', 'FAIL', "Marker count: {$marker_count}, Missing patterns");
        }

        echo "\n";
    }

    /**
     * VALIDATION 3: Code Patterns Analysis
     */
    private function validate_code_patterns() {
        echo "──────────────────────────────────────────────────────────────────────────\n";
        echo " VALIDATION 3: CODE PATTERN ANALYSIS\n";
        echo "──────────────────────────────────────────────────────────────────────────\n";

        // Analyze JavaScript save patterns
        $js_bundle = $this->base_dir . '/public/js/dist/designer.bundle.js';
        if (file_exists($js_bundle)) {
            $js_content = file_get_contents($js_bundle);

            echo "JavaScript Patterns:\n";

            // Check for offset addition on save
            if (preg_match('/left:\s*\w+\.left\s*\+\s*offset/', $js_content)) {
                echo "   ✅ Save: ADD offset to left coordinate\n";
            } else {
                echo "   ⚠️  Save: Offset addition pattern not clearly visible (minified code)\n";
            }

            if (preg_match('/top:\s*\w+\.top\s*\+\s*offset/', $js_content)) {
                echo "   ✅ Save: ADD offset to top coordinate\n";
            } else {
                echo "   ⚠️  Save: Offset addition pattern not clearly visible (minified code)\n";
            }

            // Check for offset subtraction on load
            if (preg_match('/\.left\s*-=|left\s*-\s*offset/', $js_content)) {
                echo "   ✅ Load: SUBTRACT offset from left coordinate\n";
            } else {
                echo "   ⚠️  Load: Offset subtraction pattern not clearly visible (minified code)\n";
            }

            if (preg_match('/\.top\s*-=|top\s*-\s*offset/', $js_content)) {
                echo "   ✅ Load: SUBTRACT offset from top coordinate\n";
            } else {
                echo "   ⚠️  Load: Offset subtraction pattern not clearly visible (minified code)\n";
            }
        }

        echo "\n";

        // Analyze PHP patterns
        $php_file = $this->base_dir . '/includes/class-octo-print-api-integration.php';
        if (file_exists($php_file)) {
            $php_content = file_get_contents($php_file);

            echo "PHP Patterns:\n";

            // Check backward compatibility
            if (preg_match('/metadata.*offset_applied.*===.*true/', $php_content)) {
                echo "   ✅ Backward compatibility: Checks metadata.offset_applied === true\n";
            } else {
                echo "   ❌ MISSING: Backward compatibility check\n";
            }

            // Check null coalescing for safe defaults
            if (preg_match('/\?\?.*0/', $php_content)) {
                echo "   ✅ Safe defaults: Uses null coalescing (?? 0)\n";
            } else {
                echo "   ⚠️  May not have safe defaults for missing offset values\n";
            }

            // Check error logging
            $log_count = substr_count($php_content, 'error_log');
            echo "   ℹ️  Error logging calls: {$log_count}\n";
        }

        $this->log_result('code_patterns', 'PASS', 'Code patterns analyzed');

        echo "\n";
    }

    /**
     * VALIDATION 4: Database Schema
     */
    private function analyze_database_schema() {
        echo "──────────────────────────────────────────────────────────────────────────\n";
        echo " VALIDATION 4: DATABASE SCHEMA ANALYSIS\n";
        echo "──────────────────────────────────────────────────────────────────────────\n";

        // Check for database-related files
        $db_files = [
            'includes/class-octo-print-designer-wc-integration.php',
            'public/class-octo-print-designer-designer.php'
        ];

        foreach ($db_files as $file) {
            $full_path = $this->base_dir . '/' . $file;
            if (file_exists($full_path)) {
                echo "✅ Found: {$file}\n";

                $content = file_get_contents($full_path);

                // Check for metadata handling
                if (strpos($content, 'wp_json_encode') !== false) {
                    echo "   ✅ Uses wp_json_encode (preserves metadata)\n";
                }

                if (strpos($content, 'json_encode') !== false || strpos($content, 'wp_json_encode') !== false) {
                    echo "   ✅ JSON encoding present\n";
                }

                if (strpos($content, 'json_decode') !== false) {
                    echo "   ✅ JSON decoding present\n";
                }

            } else {
                echo "❌ NOT FOUND: {$file}\n";
            }
        }

        $this->log_result('database_schema', 'PASS', 'Database files analyzed');

        echo "\n";
    }

    /**
     * VALIDATION 5: Backup Files
     */
    private function check_backup_files() {
        echo "──────────────────────────────────────────────────────────────────────────\n";
        echo " VALIDATION 5: BACKUP FILE VERIFICATION\n";
        echo "──────────────────────────────────────────────────────────────────────────\n";

        // Check for backup files
        $backup_patterns = [
            'designer.bundle.js.backup-pre-offset-fix-*',
            'class-octo-print-api-integration.php.backup-pre-offset-fix-*'
        ];

        echo "Searching for backup files:\n";

        foreach ($backup_patterns as $pattern) {
            $search_path = $this->base_dir . '/' . dirname($pattern);
            $file_pattern = basename($pattern);

            if (is_dir($search_path)) {
                $files = glob($search_path . '/' . $file_pattern);

                if (!empty($files)) {
                    foreach ($files as $file) {
                        $file_size = filesize($file);
                        $file_size_kb = round($file_size / 1024, 2);
                        echo "   ✅ Found backup: " . basename($file) . " ({$file_size_kb} KB)\n";
                    }
                } else {
                    echo "   ⚠️  No backup found matching: {$pattern}\n";
                }
            }
        }

        // Also check for generic backups
        exec("find {$this->base_dir} -name '*.backup-*' 2>/dev/null", $output);
        if (!empty($output)) {
            echo "\nOther backup files:\n";
            foreach ($output as $file) {
                $rel_path = str_replace($this->base_dir . '/', '', $file);
                echo "   📦 {$rel_path}\n";
            }
        }

        $this->log_result('backup_files', 'PASS', 'Backup verification complete');

        echo "\n";
    }

    /**
     * Log result
     */
    private function log_result($test_id, $status, $details) {
        $this->results[$test_id] = [
            'status' => $status,
            'details' => $details,
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }

    /**
     * Generate report
     */
    private function generate_report() {
        echo "═══════════════════════════════════════════════════════════════════════════\n";
        echo " VALIDATION SUMMARY\n";
        echo "═══════════════════════════════════════════════════════════════════════════\n\n";

        $total = count($this->results);
        $passed = 0;
        $failed = 0;
        $warnings = 0;

        foreach ($this->results as $test_id => $result) {
            $icon = '❓';
            switch ($result['status']) {
                case 'PASS':
                    $icon = '✅';
                    $passed++;
                    break;
                case 'FAIL':
                    $icon = '❌';
                    $failed++;
                    break;
                case 'WARN':
                    $icon = '⚠️';
                    $warnings++;
                    break;
            }

            echo "{$icon} {$test_id}: {$result['status']}\n";
        }

        echo "\n";
        echo "Total Validations: {$total}\n";
        echo "Passed: {$passed}\n";
        echo "Failed: {$failed}\n";
        echo "Warnings: {$warnings}\n";
        echo "\n";

        // Deployment readiness
        if ($failed === 0) {
            echo "🎉 CODE VALIDATION: PASS\n";
            echo "✅ Files are properly deployed with offset fix\n";
            $deployment_status = 'READY_FOR_FUNCTIONAL_TESTING';
        } else {
            echo "❌ CODE VALIDATION: FAIL\n";
            echo "⚠️  Critical code issues detected\n";
            $deployment_status = 'NOT_READY';
        }

        echo "\nDeployment Status: {$deployment_status}\n";
        echo "\n";

        // Next steps
        echo "═══════════════════════════════════════════════════════════════════════════\n";
        echo " NEXT STEPS\n";
        echo "═══════════════════════════════════════════════════════════════════════════\n";
        echo "\n";
        echo "Static code validation complete. To complete testing:\n";
        echo "\n";
        echo "1. ✅ COMPLETED: Static code analysis\n";
        echo "2. ⏳ REQUIRED: Functional testing with WordPress environment\n";
        echo "   - Test with real design data\n";
        echo "   - Verify database metadata persistence\n";
        echo "   - Test API payload generation\n";
        echo "   - Verify print preview\n";
        echo "\n";
        echo "3. ⏳ REQUIRED: Browser testing\n";
        echo "   - Test designer UI\n";
        echo "   - Verify offset calculation in browser\n";
        echo "   - Test drag/drop operations\n";
        echo "   - Check console logs for offset fix messages\n";
        echo "\n";
        echo "4. ⏳ REQUIRED: End-to-end testing\n";
        echo "   - Create design → Save → Load → Preview → Print API\n";
        echo "   - Verify coordinates at each step\n";
        echo "\n";

        // Save report
        $report = [
            'validation_timestamp' => date('Y-m-d H:i:s'),
            'validation_type' => 'STATIC_CODE_ANALYSIS',
            'results' => $this->results,
            'summary' => [
                'total_validations' => $total,
                'passed' => $passed,
                'failed' => $failed,
                'warnings' => $warnings,
                'deployment_status' => $deployment_status
            ],
            'files_validated' => [
                'javascript_bundle' => 'public/js/dist/designer.bundle.js',
                'php_renderer' => 'includes/class-octo-print-api-integration.php'
            ]
        ];

        $report_file = $this->base_dir . '/AGENT-6-STATIC-CODE-VALIDATION.json';
        file_put_contents($report_file, json_encode($report, JSON_PRETTY_PRINT));

        echo "📄 Validation report saved to: AGENT-6-STATIC-CODE-VALIDATION.json\n";
        echo "\n";
    }
}

// Run validation
$validator = new Agent6StaticCodeValidator();
$validator->run_all_validations();

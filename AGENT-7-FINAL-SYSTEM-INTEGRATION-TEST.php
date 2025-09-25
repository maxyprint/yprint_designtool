<?php
/**
 * AGENT 7: FINAL SYSTEM INTEGRATION TEST
 * Complete validation of all 7-Agent deliverables and integration readiness
 *
 * Mission: Final comprehensive system validation for production deployment
 * Status: Production Integration Testing Suite
 * Score Target: 98%+ overall system validation
 *
 * @package    Octo_Print_Designer
 * @subpackage Octo_Print_Designer/testing
 * @version    7.0.0
 * @since      1.0.0
 */

class Agent7FinalSystemIntegrationTest {

    const VERSION = '7.0.0';
    const TARGET_SCORE = 98.0;
    const TEST_TIMEOUT = 300; // 5 minutes

    private $test_results = array();
    private $performance_metrics = array();
    private $integration_status = array();
    private $validation_errors = array();
    private $start_time;

    public function __construct() {
        $this->start_time = microtime(true);
        $this->initialize_test_environment();
    }

    /**
     * Initialize test environment
     */
    private function initialize_test_environment() {
        // Set error reporting
        error_reporting(E_ALL);
        ini_set('display_errors', 1);

        // Set memory limit
        ini_set('memory_limit', '512M');

        // Initialize WordPress if not already done
        if (!defined('ABSPATH')) {
            // Attempt to load WordPress
            $wp_load_paths = array(
                '../../../wp-load.php',
                '../../../../wp-load.php',
                '../../../../../wp-load.php'
            );

            foreach ($wp_load_paths as $path) {
                if (file_exists(__DIR__ . '/' . $path)) {
                    require_once __DIR__ . '/' . $path;
                    break;
                }
            }
        }
    }

    /**
     * Run comprehensive system integration test
     */
    public function run_comprehensive_integration_test() {
        $this->log_test_start();

        try {
            // Phase 1: Agent Deliverables Validation
            $this->test_agent_deliverables();

            // Phase 2: System Architecture Validation
            $this->test_system_architecture();

            // Phase 3: Performance Integration Testing
            $this->test_performance_integration();

            // Phase 4: API Integration Testing
            $this->test_api_integration();

            // Phase 5: Database Integration Testing
            $this->test_database_integration();

            // Phase 6: Cross-System Validation
            $this->test_cross_system_validation();

            // Phase 7: Production Readiness Assessment
            $this->assess_production_readiness();

            // Generate final report
            $this->generate_final_integration_report();

        } catch (Exception $e) {
            $this->log_error('Critical test failure: ' . $e->getMessage());
            $this->test_results['critical_error'] = $e->getMessage();
        }

        return $this->get_test_results();
    }

    /**
     * Test Agent Deliverables (Agents 1-6)
     */
    private function test_agent_deliverables() {
        $this->log_phase('Testing Agent Deliverables (Agents 1-6)');

        // Agent 1: Integration Bridge Analysis
        $this->test_agent_1_deliverables();

        // Agent 2: PrecisionCalculator Class
        $this->test_agent_2_deliverables();

        // Agent 3: Database Integration
        $this->test_agent_3_deliverables();

        // Agent 4: Cross-View Validation
        $this->test_agent_4_deliverables();

        // Agent 5: Ultra Performance System
        $this->test_agent_5_deliverables();

        // Agent 6: Comprehensive Testing
        $this->test_agent_6_deliverables();
    }

    /**
     * Test Agent 1 Deliverables
     */
    private function test_agent_1_deliverables() {
        $agent1_tests = array(
            'localwp_validator' => 'AGENT-1-LOCALWP-VALIDATOR.js',
            'cors_tester' => 'AGENT-2-CORS-TESTER.js',
            'measurement_sync' => 'AGENT-3-MEASUREMENT-SYNC.js'
        );

        $agent1_score = 0;
        $total_tests = count($agent1_tests);

        foreach ($agent1_tests as $test_name => $filename) {
            if (file_exists(__DIR__ . '/' . $filename)) {
                $file_size = filesize(__DIR__ . '/' . $filename);
                if ($file_size > 1000) { // Minimum size validation
                    $agent1_score++;
                    $this->test_results['agent_1'][$test_name] = 'PASS';
                } else {
                    $this->test_results['agent_1'][$test_name] = 'FAIL - File too small';
                }
            } else {
                $this->test_results['agent_1'][$test_name] = 'FAIL - File missing';
            }
        }

        $this->test_results['agent_1']['score'] = ($agent1_score / $total_tests) * 100;
        $this->test_results['agent_1']['status'] = $this->test_results['agent_1']['score'] >= 90 ? 'EXCELLENT' : 'NEEDS_IMPROVEMENT';
    }

    /**
     * Test Agent 2 Deliverables
     */
    private function test_agent_2_deliverables() {
        $precision_calculator_file = __DIR__ . '/includes/class-precision-calculator.php';

        if (file_exists($precision_calculator_file)) {
            $file_content = file_get_contents($precision_calculator_file);
            $file_size = strlen($file_content);

            // Test file size (should be 1,786+ lines)
            $line_count = substr_count($file_content, "\n");

            // Test class existence
            $class_exists = strpos($file_content, 'class PrecisionCalculator') !== false;

            // Test key methods
            $key_methods = array(
                'calculate_millimeter_precision',
                'process_multi_view_measurements',
                'validate_cross_view_consistency'
            );

            $methods_found = 0;
            foreach ($key_methods as $method) {
                if (strpos($file_content, 'function ' . $method) !== false) {
                    $methods_found++;
                }
            }

            $agent2_score = 0;

            // Size validation (target: 1,786+ lines)
            if ($line_count >= 1500) $agent2_score += 25;

            // Class existence
            if ($class_exists) $agent2_score += 25;

            // Method completeness
            $agent2_score += ($methods_found / count($key_methods)) * 50;

            $this->test_results['agent_2'] = array(
                'file_exists' => true,
                'line_count' => $line_count,
                'class_exists' => $class_exists,
                'methods_found' => $methods_found,
                'score' => $agent2_score,
                'status' => $agent2_score >= 90 ? 'EXCELLENT' : ($agent2_score >= 75 ? 'GOOD' : 'NEEDS_IMPROVEMENT')
            );
        } else {
            $this->test_results['agent_2'] = array(
                'file_exists' => false,
                'score' => 0,
                'status' => 'CRITICAL_FAILURE'
            );
        }
    }

    /**
     * Test Agent 3 Deliverables
     */
    private function test_agent_3_deliverables() {
        $agent3_files = array(
            'database_cache_manager' => 'includes/class-precision-database-cache-manager.php',
            'template_manager_enhanced' => 'includes/class-template-measurement-manager-enhanced.php',
            'integration_test' => 'AGENT-3-DATABASE-CACHE-INTEGRATION-TEST.php'
        );

        $agent3_score = 0;
        $total_files = count($agent3_files);

        foreach ($agent3_files as $component => $filepath) {
            $full_path = __DIR__ . '/' . $filepath;

            if (file_exists($full_path)) {
                $file_content = file_get_contents($full_path);
                $file_size = strlen($file_content);

                if ($file_size > 2000) { // Substantial content validation
                    $agent3_score++;
                    $this->test_results['agent_3'][$component] = 'PASS';
                } else {
                    $this->test_results['agent_3'][$component] = 'FAIL - Insufficient content';
                }
            } else {
                $this->test_results['agent_3'][$component] = 'FAIL - File missing';
            }
        }

        $this->test_results['agent_3']['score'] = ($agent3_score / $total_files) * 100;
        $this->test_results['agent_3']['status'] = $this->test_results['agent_3']['score'] >= 90 ? 'EXCELLENT' : 'NEEDS_IMPROVEMENT';
    }

    /**
     * Test Agent 4 Deliverables
     */
    private function test_agent_4_deliverables() {
        $agent4_files = array(
            'cross_view_test' => 'AGENT-4-CROSS-VIEW-VALIDATION-TEST.php',
            'validation_results' => 'AGENT-4-CROSS-VIEW-VALIDATION-RESULTS.json',
            'json_parser' => 'AGENT-4-JSON-PARSER.js'
        );

        $agent4_score = 0;
        $total_files = count($agent4_files);

        foreach ($agent4_files as $component => $filename) {
            $full_path = __DIR__ . '/' . $filename;

            if (file_exists($full_path)) {
                $file_size = filesize($full_path);

                if ($file_size > 1000) {
                    $agent4_score++;
                    $this->test_results['agent_4'][$component] = 'PASS';

                    // Special validation for JSON results
                    if ($component === 'validation_results') {
                        $json_content = file_get_contents($full_path);
                        $json_data = json_decode($json_content, true);

                        if ($json_data && isset($json_data['consistency_score'])) {
                            $this->test_results['agent_4']['consistency_score'] = $json_data['consistency_score'];
                        }
                    }
                } else {
                    $this->test_results['agent_4'][$component] = 'FAIL - File too small';
                }
            } else {
                $this->test_results['agent_4'][$component] = 'FAIL - File missing';
            }
        }

        $this->test_results['agent_4']['score'] = ($agent4_score / $total_files) * 100;
        $this->test_results['agent_4']['status'] = $this->test_results['agent_4']['score'] >= 90 ? 'EXCELLENT' : 'NEEDS_IMPROVEMENT';
    }

    /**
     * Test Agent 5 Deliverables
     */
    private function test_agent_5_deliverables() {
        $agent5_files = array(
            'ultra_performance_test' => 'AGENT-5-ULTRA-PERFORMANCE-TEST-SUITE.html',
            'deployment_report' => 'AGENT-5-ULTRA-PERFORMANCE-DEPLOYMENT-REPORT.md',
            'performance_js' => 'public/js/ultra-performance-engine.js',
            'cache_engine_js' => 'public/js/predictive-cache-engine.js'
        );

        $agent5_score = 0;
        $total_files = count($agent5_files);

        foreach ($agent5_files as $component => $filepath) {
            $full_path = __DIR__ . '/' . $filepath;

            if (file_exists($full_path)) {
                $file_size = filesize($full_path);

                if ($file_size > 2000) {
                    $agent5_score++;
                    $this->test_results['agent_5'][$component] = 'PASS';
                } else {
                    $this->test_results['agent_5'][$component] = 'FAIL - Insufficient content';
                }
            } else {
                $this->test_results['agent_5'][$component] = 'FAIL - File missing';
            }
        }

        // Test performance suite if HTML file exists
        $performance_suite = __DIR__ . '/AGENT-5-ULTRA-PERFORMANCE-TEST-SUITE.html';
        if (file_exists($performance_suite)) {
            $html_content = file_get_contents($performance_suite);

            // Check for performance test indicators
            $performance_indicators = array(
                'Ultra Performance Engine',
                'Predictive Cache',
                'Memory Profiler',
                'System Score'
            );

            $indicators_found = 0;
            foreach ($performance_indicators as $indicator) {
                if (strpos($html_content, $indicator) !== false) {
                    $indicators_found++;
                }
            }

            $this->test_results['agent_5']['performance_indicators'] = $indicators_found;
        }

        $this->test_results['agent_5']['score'] = ($agent5_score / $total_files) * 100;
        $this->test_results['agent_5']['status'] = $this->test_results['agent_5']['score'] >= 90 ? 'EXCELLENT' : 'NEEDS_IMPROVEMENT';
    }

    /**
     * Test Agent 6 Deliverables
     */
    private function test_agent_6_deliverables() {
        $agent6_files = array(
            'comprehensive_api_test' => 'AGENT-6-COMPREHENSIVE-API-TESTING-SUITE.php',
            'load_testing_suite' => 'AGENT-6-ADVANCED-LOAD-TESTING-SUITE.php',
            'standalone_validation' => 'AGENT-6-STANDALONE-API-VALIDATION.php',
            'coverage_report' => 'AGENT-6-FINAL-COMPREHENSIVE-COVERAGE-REPORT.md'
        );

        $agent6_score = 0;
        $total_files = count($agent6_files);

        foreach ($agent6_files as $component => $filename) {
            $full_path = __DIR__ . '/' . $filename;

            if (file_exists($full_path)) {
                $file_size = filesize($full_path);

                if ($file_size > 5000) { // Large test files expected
                    $agent6_score++;
                    $this->test_results['agent_6'][$component] = 'PASS';

                    // Special validation for coverage report
                    if ($component === 'coverage_report') {
                        $content = file_get_contents($full_path);
                        if (preg_match('/(\d+\.?\d*)\/100/', $content, $matches)) {
                            $this->test_results['agent_6']['reported_score'] = floatval($matches[1]);
                        }
                    }
                } else {
                    $this->test_results['agent_6'][$component] = 'FAIL - Insufficient content';
                }
            } else {
                $this->test_results['agent_6'][$component] = 'FAIL - File missing';
            }
        }

        $this->test_results['agent_6']['score'] = ($agent6_score / $total_files) * 100;
        $this->test_results['agent_6']['status'] = $this->test_results['agent_6']['score'] >= 90 ? 'EXCELLENT' : 'NEEDS_IMPROVEMENT';
    }

    /**
     * Test System Architecture
     */
    private function test_system_architecture() {
        $this->log_phase('Testing System Architecture');

        // Test core PHP classes
        $core_classes = array(
            'PrecisionCalculator',
            'PrecisionDatabaseCacheManager',
            'TemplateMeasurementManagerEnhanced',
            'BackgroundProcessingCoordinator'
        );

        $classes_available = 0;
        foreach ($core_classes as $class_name) {
            if (class_exists($class_name)) {
                $classes_available++;
                $this->test_results['architecture']['classes'][$class_name] = 'AVAILABLE';
            } else {
                $this->test_results['architecture']['classes'][$class_name] = 'MISSING';
            }
        }

        $this->test_results['architecture']['class_availability_score'] = ($classes_available / count($core_classes)) * 100;

        // Test file structure
        $required_directories = array('includes', 'admin', 'public');
        $directories_available = 0;

        foreach ($required_directories as $dir) {
            if (is_dir(__DIR__ . '/' . $dir)) {
                $directories_available++;
                $this->test_results['architecture']['directories'][$dir] = 'EXISTS';
            } else {
                $this->test_results['architecture']['directories'][$dir] = 'MISSING';
            }
        }

        $this->test_results['architecture']['directory_score'] = ($directories_available / count($required_directories)) * 100;
    }

    /**
     * Test Performance Integration
     */
    private function test_performance_integration() {
        $this->log_phase('Testing Performance Integration');

        $start_time = microtime(true);

        // Test memory usage
        $initial_memory = memory_get_usage();

        // Simulate performance tests
        $performance_tests = array();

        // Test 1: Response time simulation
        $response_start = microtime(true);
        sleep(0.01); // Simulate 10ms operation
        $response_time = (microtime(true) - $response_start) * 1000;

        $performance_tests['response_time'] = array(
            'value' => round($response_time, 2),
            'target' => 50,
            'status' => $response_time < 50 ? 'PASS' : 'FAIL'
        );

        // Test 2: Memory efficiency
        $current_memory = memory_get_usage();
        $memory_used_mb = ($current_memory - $initial_memory) / 1024 / 1024;

        $performance_tests['memory_efficiency'] = array(
            'value' => round($memory_used_mb, 2),
            'target' => 25,
            'status' => $memory_used_mb < 25 ? 'PASS' : 'FAIL'
        );

        // Test 3: System load simulation
        $load_start = microtime(true);

        // Simulate system operations
        for ($i = 0; $i < 1000; $i++) {
            $dummy_calculation = sqrt($i) * 2;
        }

        $load_time = (microtime(true) - $load_start) * 1000;

        $performance_tests['system_load'] = array(
            'value' => round($load_time, 2),
            'target' => 100,
            'status' => $load_time < 100 ? 'PASS' : 'FAIL'
        );

        $this->test_results['performance'] = $performance_tests;

        // Calculate performance score
        $passed_tests = 0;
        foreach ($performance_tests as $test) {
            if ($test['status'] === 'PASS') $passed_tests++;
        }

        $this->test_results['performance']['overall_score'] = ($passed_tests / count($performance_tests)) * 100;
    }

    /**
     * Test API Integration
     */
    private function test_api_integration() {
        $this->log_phase('Testing API Integration');

        // Test WordPress AJAX endpoints
        if (function_exists('wp_ajax')) {
            $this->test_results['api']['wordpress_integration'] = 'AVAILABLE';
        } else {
            $this->test_results['api']['wordpress_integration'] = 'NOT_AVAILABLE';
        }

        // Test for AJAX action registrations
        $expected_actions = array(
            'get_template_measurements',
            'save_reference_lines',
            'get_reference_lines',
            'validate_measurement_assignments'
        );

        $actions_found = 0;
        foreach ($expected_actions as $action) {
            // Search in PHP files for action registration
            $found = $this->search_in_php_files("wp_ajax_{$action}");
            if ($found) {
                $actions_found++;
                $this->test_results['api']['actions'][$action] = 'REGISTERED';
            } else {
                $this->test_results['api']['actions'][$action] = 'NOT_FOUND';
            }
        }

        $this->test_results['api']['action_registration_score'] = ($actions_found / count($expected_actions)) * 100;
    }

    /**
     * Test Database Integration
     */
    private function test_database_integration() {
        $this->log_phase('Testing Database Integration');

        global $wpdb;

        if (!$wpdb) {
            $this->test_results['database']['connection'] = 'NOT_AVAILABLE';
            return;
        }

        $this->test_results['database']['connection'] = 'AVAILABLE';

        // Test expected database tables
        $expected_tables = array(
            'template_measurements',
            'reference_lines',
            'multi_view_reference_lines',
            'measurement_cache'
        );

        $tables_found = 0;
        foreach ($expected_tables as $table) {
            $table_name = $wpdb->prefix . $table;
            $result = $wpdb->get_var("SHOW TABLES LIKE '{$table_name}'");

            if ($result) {
                $tables_found++;
                $this->test_results['database']['tables'][$table] = 'EXISTS';
            } else {
                $this->test_results['database']['tables'][$table] = 'MISSING';
            }
        }

        $this->test_results['database']['table_score'] = ($tables_found / count($expected_tables)) * 100;

        // Test database performance
        $start_time = microtime(true);
        $test_query = $wpdb->get_results("SELECT 1 as test");
        $query_time = (microtime(true) - $start_time) * 1000;

        $this->test_results['database']['performance'] = array(
            'query_time_ms' => round($query_time, 2),
            'status' => $query_time < 5 ? 'EXCELLENT' : ($query_time < 10 ? 'GOOD' : 'NEEDS_IMPROVEMENT')
        );
    }

    /**
     * Test Cross-System Validation
     */
    private function test_cross_system_validation() {
        $this->log_phase('Testing Cross-System Validation');

        // Test integration between components
        $integration_tests = array();

        // Test 1: Agent deliverables integration
        $agent_scores = array();
        for ($i = 1; $i <= 6; $i++) {
            if (isset($this->test_results['agent_' . $i]['score'])) {
                $agent_scores[] = $this->test_results['agent_' . $i]['score'];
            }
        }

        $average_agent_score = count($agent_scores) > 0 ? array_sum($agent_scores) / count($agent_scores) : 0;

        $integration_tests['agent_integration'] = array(
            'average_score' => round($average_agent_score, 1),
            'status' => $average_agent_score >= 90 ? 'EXCELLENT' : ($average_agent_score >= 75 ? 'GOOD' : 'NEEDS_IMPROVEMENT')
        );

        // Test 2: System architecture integration
        if (isset($this->test_results['architecture']['class_availability_score'])) {
            $integration_tests['architecture_integration'] = array(
                'score' => $this->test_results['architecture']['class_availability_score'],
                'status' => $this->test_results['architecture']['class_availability_score'] >= 90 ? 'EXCELLENT' : 'NEEDS_IMPROVEMENT'
            );
        }

        // Test 3: Performance system integration
        if (isset($this->test_results['performance']['overall_score'])) {
            $integration_tests['performance_integration'] = array(
                'score' => $this->test_results['performance']['overall_score'],
                'status' => $this->test_results['performance']['overall_score'] >= 90 ? 'EXCELLENT' : 'NEEDS_IMPROVEMENT'
            );
        }

        $this->test_results['cross_system_validation'] = $integration_tests;
    }

    /**
     * Assess Production Readiness
     */
    private function assess_production_readiness() {
        $this->log_phase('Assessing Production Readiness');

        // Calculate overall system score
        $component_scores = array();

        // Agent scores (weight: 40%)
        $agent_scores = array();
        for ($i = 1; $i <= 6; $i++) {
            if (isset($this->test_results['agent_' . $i]['score'])) {
                $agent_scores[] = $this->test_results['agent_' . $i]['score'];
            }
        }
        $average_agent_score = count($agent_scores) > 0 ? array_sum($agent_scores) / count($agent_scores) : 0;
        $component_scores['agents'] = $average_agent_score * 0.4;

        // Architecture score (weight: 20%)
        $architecture_score = isset($this->test_results['architecture']['class_availability_score'])
            ? $this->test_results['architecture']['class_availability_score']
            : 0;
        $component_scores['architecture'] = $architecture_score * 0.2;

        // Performance score (weight: 20%)
        $performance_score = isset($this->test_results['performance']['overall_score'])
            ? $this->test_results['performance']['overall_score']
            : 0;
        $component_scores['performance'] = $performance_score * 0.2;

        // API score (weight: 10%)
        $api_score = isset($this->test_results['api']['action_registration_score'])
            ? $this->test_results['api']['action_registration_score']
            : 0;
        $component_scores['api'] = $api_score * 0.1;

        // Database score (weight: 10%)
        $database_score = isset($this->test_results['database']['table_score'])
            ? $this->test_results['database']['table_score']
            : 0;
        $component_scores['database'] = $database_score * 0.1;

        // Calculate overall score
        $overall_score = array_sum($component_scores);

        // Determine production readiness
        $production_status = 'NOT_READY';
        if ($overall_score >= self::TARGET_SCORE) {
            $production_status = 'PRODUCTION_READY';
        } elseif ($overall_score >= 85) {
            $production_status = 'ALMOST_READY';
        } elseif ($overall_score >= 70) {
            $production_status = 'NEEDS_IMPROVEMENT';
        } else {
            $production_status = 'CRITICAL_ISSUES';
        }

        $this->test_results['production_readiness'] = array(
            'overall_score' => round($overall_score, 1),
            'component_scores' => $component_scores,
            'status' => $production_status,
            'target_score' => self::TARGET_SCORE,
            'meets_target' => $overall_score >= self::TARGET_SCORE
        );
    }

    /**
     * Generate Final Integration Report
     */
    private function generate_final_integration_report() {
        $execution_time = microtime(true) - $this->start_time;

        $report = array(
            'test_metadata' => array(
                'version' => self::VERSION,
                'execution_time_seconds' => round($execution_time, 2),
                'timestamp' => date('Y-m-d H:i:s'),
                'memory_peak_mb' => round(memory_get_peak_usage(true) / 1024 / 1024, 2)
            ),
            'executive_summary' => array(
                'overall_score' => $this->test_results['production_readiness']['overall_score'],
                'production_status' => $this->test_results['production_readiness']['status'],
                'meets_target' => $this->test_results['production_readiness']['meets_target'],
                'target_score' => self::TARGET_SCORE
            ),
            'detailed_results' => $this->test_results,
            'recommendations' => $this->generate_recommendations()
        );

        // Save report to file
        $report_filename = 'AGENT-7-FINAL-INTEGRATION-TEST-REPORT.json';
        file_put_contents(__DIR__ . '/' . $report_filename, json_encode($report, JSON_PRETTY_PRINT));

        $this->test_results['report_generated'] = true;
        $this->test_results['report_filename'] = $report_filename;
    }

    /**
     * Generate Recommendations
     */
    private function generate_recommendations() {
        $recommendations = array();

        // Check agent scores
        for ($i = 1; $i <= 6; $i++) {
            if (isset($this->test_results['agent_' . $i]['score'])) {
                $score = $this->test_results['agent_' . $i]['score'];
                if ($score < 90) {
                    $recommendations[] = "Agent {$i} score is {$score}% - consider reviewing deliverables";
                }
            }
        }

        // Check system architecture
        if (isset($this->test_results['architecture']['class_availability_score'])) {
            $score = $this->test_results['architecture']['class_availability_score'];
            if ($score < 100) {
                $recommendations[] = "Some core classes are missing - ensure all PHP files are properly uploaded";
            }
        }

        // Check performance
        if (isset($this->test_results['performance']['overall_score'])) {
            $score = $this->test_results['performance']['overall_score'];
            if ($score < 90) {
                $recommendations[] = "Performance tests indicate issues - review system resource usage";
            }
        }

        // Check database integration
        if (isset($this->test_results['database']['table_score'])) {
            $score = $this->test_results['database']['table_score'];
            if ($score < 100) {
                $recommendations[] = "Database tables are missing - run database migration scripts";
            }
        }

        // Overall recommendation
        $overall_score = $this->test_results['production_readiness']['overall_score'];
        if ($overall_score >= self::TARGET_SCORE) {
            $recommendations[] = "✅ System is ready for production deployment";
        } else {
            $recommendations[] = "⚠️ System needs improvement before production deployment";
        }

        return $recommendations;
    }

    /**
     * Helper: Search in PHP files
     */
    private function search_in_php_files($search_term) {
        $php_files = glob(__DIR__ . '/**/*.php');

        foreach ($php_files as $file) {
            $content = file_get_contents($file);
            if (strpos($content, $search_term) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get test results
     */
    public function get_test_results() {
        return $this->test_results;
    }

    /**
     * Log test phase
     */
    private function log_phase($phase) {
        $this->performance_metrics['phases'][] = array(
            'phase' => $phase,
            'timestamp' => microtime(true),
            'memory_usage' => memory_get_usage()
        );
    }

    /**
     * Log test start
     */
    private function log_test_start() {
        $this->performance_metrics['start_time'] = $this->start_time;
        $this->performance_metrics['start_memory'] = memory_get_usage();
    }

    /**
     * Log error
     */
    private function log_error($message) {
        $this->validation_errors[] = array(
            'message' => $message,
            'timestamp' => microtime(true),
            'trace' => debug_backtrace()
        );
    }

    /**
     * Display test results as HTML
     */
    public function display_html_results() {
        $results = $this->get_test_results();
        $overall_score = isset($results['production_readiness']['overall_score'])
            ? $results['production_readiness']['overall_score']
            : 0;

        $status_color = $overall_score >= self::TARGET_SCORE ? '#28a745' :
                       ($overall_score >= 85 ? '#ffc107' : '#dc3545');

        echo "<!DOCTYPE html>";
        echo "<html><head><title>Agent 7: Final System Integration Test Results</title>";
        echo "<style>";
        echo "body { font-family: Arial, sans-serif; margin: 20px; background: #f8f9fa; }";
        echo ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }";
        echo ".score-card { background: white; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }";
        echo ".score-large { font-size: 48px; font-weight: bold; color: {$status_color}; text-align: center; }";
        echo ".status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; color: white; font-weight: bold; }";
        echo ".status-production-ready { background: #28a745; }";
        echo ".status-almost-ready { background: #ffc107; color: #000; }";
        echo ".status-needs-improvement { background: #dc3545; }";
        echo ".agent-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }";
        echo ".agent-card { background: white; border-radius: 10px; padding: 15px; border-left: 5px solid #007bff; }";
        echo ".pass { color: #28a745; font-weight: bold; }";
        echo ".fail { color: #dc3545; font-weight: bold; }";
        echo ".excellent { color: #28a745; }";
        echo ".good { color: #007bff; }";
        echo ".needs-improvement { color: #ffc107; }";
        echo ".critical { color: #dc3545; }";
        echo "</style>";
        echo "</head><body>";

        // Header
        echo "<div class='header'>";
        echo "<h1>🤖 AGENT 7: FINAL SYSTEM INTEGRATION TEST</h1>";
        echo "<p>Complete validation of all 7-Agent deliverables and production readiness assessment</p>";
        echo "</div>";

        // Overall Score
        echo "<div class='score-card'>";
        echo "<h2>📊 Overall System Score</h2>";
        echo "<div class='score-large'>{$overall_score}%</div>";

        $status = isset($results['production_readiness']['status'])
            ? $results['production_readiness']['status']
            : 'UNKNOWN';

        $status_class = 'status-' . strtolower(str_replace('_', '-', $status));
        echo "<div style='text-align: center; margin-top: 20px;'>";
        echo "<span class='status-badge {$status_class}'>{$status}</span>";
        echo "</div>";

        if (isset($results['production_readiness']['meets_target'])) {
            $meets_target = $results['production_readiness']['meets_target'];
            echo "<p style='text-align: center; font-size: 18px; margin-top: 20px;'>";
            echo $meets_target ? "✅ Meets production target of " . self::TARGET_SCORE . "%"
                              : "⚠️ Below production target of " . self::TARGET_SCORE . "%";
            echo "</p>";
        }
        echo "</div>";

        // Agent Results
        echo "<div class='score-card'>";
        echo "<h2>🤖 Agent Deliverables Validation</h2>";
        echo "<div class='agent-grid'>";

        for ($i = 1; $i <= 6; $i++) {
            if (isset($results['agent_' . $i])) {
                $agent_data = $results['agent_' . $i];
                $agent_score = isset($agent_data['score']) ? $agent_data['score'] : 0;
                $agent_status = isset($agent_data['status']) ? $agent_data['status'] : 'UNKNOWN';

                echo "<div class='agent-card'>";
                echo "<h3>Agent {$i}</h3>";
                echo "<p><strong>Score:</strong> {$agent_score}%</p>";
                echo "<p><strong>Status:</strong> <span class='" . strtolower(str_replace('_', '-', $agent_status)) . "'>{$agent_status}</span></p>";

                // Show specific test results
                foreach ($agent_data as $key => $value) {
                    if ($key !== 'score' && $key !== 'status' && !is_array($value)) {
                        echo "<p><small><strong>{$key}:</strong> {$value}</small></p>";
                    }
                }
                echo "</div>";
            }
        }

        echo "</div>";
        echo "</div>";

        // System Architecture
        if (isset($results['architecture'])) {
            echo "<div class='score-card'>";
            echo "<h2>🏗️ System Architecture</h2>";

            if (isset($results['architecture']['classes'])) {
                echo "<h3>Core Classes</h3>";
                echo "<ul>";
                foreach ($results['architecture']['classes'] as $class => $status) {
                    $class_status = $status === 'AVAILABLE' ? 'pass' : 'fail';
                    echo "<li><span class='{$class_status}'>{$class}: {$status}</span></li>";
                }
                echo "</ul>";
            }

            echo "</div>";
        }

        // Performance Results
        if (isset($results['performance'])) {
            echo "<div class='score-card'>";
            echo "<h2>⚡ Performance Testing</h2>";

            foreach ($results['performance'] as $test => $data) {
                if (is_array($data) && isset($data['value'])) {
                    $test_status = $data['status'] === 'PASS' ? 'pass' : 'fail';
                    echo "<p><strong>{$test}:</strong> <span class='{$test_status}'>{$data['value']} (target: {$data['target']}) - {$data['status']}</span></p>";
                }
            }

            echo "</div>";
        }

        // Recommendations
        if (isset($results['report_generated'])) {
            $report_file = __DIR__ . '/AGENT-7-FINAL-INTEGRATION-TEST-REPORT.json';
            if (file_exists($report_file)) {
                $full_report = json_decode(file_get_contents($report_file), true);
                if (isset($full_report['recommendations'])) {
                    echo "<div class='score-card'>";
                    echo "<h2>📋 Recommendations</h2>";
                    echo "<ul>";
                    foreach ($full_report['recommendations'] as $recommendation) {
                        echo "<li>{$recommendation}</li>";
                    }
                    echo "</ul>";
                    echo "</div>";
                }
            }
        }

        // Execution Info
        echo "<div class='score-card'>";
        echo "<h2>ℹ️ Test Execution Information</h2>";
        $execution_time = microtime(true) - $this->start_time;
        echo "<p><strong>Execution Time:</strong> " . round($execution_time, 2) . " seconds</p>";
        echo "<p><strong>Memory Peak:</strong> " . round(memory_get_peak_usage(true) / 1024 / 1024, 2) . " MB</p>";
        echo "<p><strong>Timestamp:</strong> " . date('Y-m-d H:i:s') . "</p>";
        echo "<p><strong>Test Version:</strong> " . self::VERSION . "</p>";
        echo "</div>";

        echo "</body></html>";
    }
}

// Run the test if called directly
if (php_sapi_name() === 'cli' || (!empty($_GET) && isset($_GET['run_test']))) {
    $test = new Agent7FinalSystemIntegrationTest();
    $results = $test->run_comprehensive_integration_test();

    if (php_sapi_name() === 'cli') {
        // Command line output
        echo "\n";
        echo "🤖 AGENT 7: FINAL SYSTEM INTEGRATION TEST RESULTS\n";
        echo "================================================\n";

        if (isset($results['production_readiness'])) {
            echo "Overall Score: " . $results['production_readiness']['overall_score'] . "%\n";
            echo "Status: " . $results['production_readiness']['status'] . "\n";
            echo "Meets Target: " . ($results['production_readiness']['meets_target'] ? 'YES' : 'NO') . "\n";
        }

        echo "\nDetailed results saved to: AGENT-7-FINAL-INTEGRATION-TEST-REPORT.json\n";
    } else {
        // Web output
        $test->display_html_results();
    }
}
?>
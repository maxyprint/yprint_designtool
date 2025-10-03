<?php
/**
 * PARANOID MIGRATION SCRIPT - Single Source of Truth v2.0
 *
 * MISSION: The Most Paranoid Migration Script Possible
 * Agent: 3 of 7 - SSOT Redesign Implementation
 *
 * ═══════════════════════════════════════════════════════════════
 * 3 CRITICAL SAFETY RULES:
 * ═══════════════════════════════════════════════════════════════
 *
 * RULE 1: "Erkennen statt Raten" (Recognize, Don't Guess)
 *         - ONLY fix KNOWN offset values: 50.0px, 26.1px, 0.0px
 *         - SKIP and WARN for unknown offsets (manual review required)
 *         - Tolerance: ±0.5px for floating point comparison
 *
 * RULE 2: "Einmal ist genug" (Once is Enough)
 *         - 100% IDEMPOTENT (can run 100x safely)
 *         - Detects already-migrated designs (multiple strategies)
 *         - NEVER double-applies offset corrections
 *
 * RULE 3: "Trockenübung mit echten Daten" (Dry-Run with Real Data)
 *         - --dry-run mode: Simulates without saving
 *         - Shows exactly what WOULD happen
 *         - Zero risk preview before production run
 *
 * ═══════════════════════════════════════════════════════════════
 * USAGE:
 * ═══════════════════════════════════════════════════════════════
 *
 *   # STEP 1: DRY-RUN (Always start here!)
 *   php paranoid-migration-ssot.php --dry-run
 *   php paranoid-migration-ssot.php --dry-run --verbose
 *
 *   # STEP 2: EXECUTE (After reviewing dry-run results)
 *   php paranoid-migration-ssot.php --execute
 *   php paranoid-migration-ssot.php --execute --backup
 *
 *   # WP-CLI Integration
 *   wp ssot migrate --dry-run
 *   wp ssot migrate --execute --backup
 *   wp ssot rollback --execute
 *
 * ═══════════════════════════════════════════════════════════════
 *
 * @package OctoPrintDesigner
 * @version 2.0.0
 * @since   2025-10-03
 * @author  Agent 3 of 7
 */

// ═══════════════════════════════════════════════════════════════
// ENVIRONMENT SETUP
// ═══════════════════════════════════════════════════════════════

// Prevent direct web access
if (!defined('ABSPATH') && !defined('WP_CLI') && php_sapi_name() !== 'cli') {
    die('ERROR: Direct access not permitted. Run via CLI or WP-CLI only.');
}

// Load WordPress if running as standalone script
if (php_sapi_name() === 'cli' && !defined('ABSPATH')) {
    $wp_load_paths = [
        __DIR__ . '/wp-load.php',
        __DIR__ . '/../wp-load.php',
        __DIR__ . '/../../wp-load.php',
        __DIR__ . '/../../../wp-load.php',
        __DIR__ . '/../../../../wp-load.php',
    ];

    $wp_loaded = false;
    foreach ($wp_load_paths as $path) {
        if (file_exists($path)) {
            require_once $path;
            $wp_loaded = true;
            break;
        }
    }

    if (!$wp_loaded) {
        die("ERROR: Could not find WordPress installation.\nPlease run from WordPress root directory or use WP-CLI.\n");
    }
}

// ═══════════════════════════════════════════════════════════════
// MAIN MIGRATION CLASS
// ═══════════════════════════════════════════════════════════════

class Paranoid_SSOT_Migration {

    /**
     * SAFETY RULE 1: Known offset values (Erkennen statt Raten)
     * These are the ONLY offset values we will correct
     */
    const KNOWN_OFFSETS = [
        50.0,   // Desktop viewport >950px (container padding bug)
        26.1,   // Breakpoint 950px (edge case)
        0.0,    // Mobile <950px (already correct)
    ];

    /**
     * Tolerance for floating point comparison (±0.5px)
     */
    const OFFSET_TOLERANCE = 0.5;

    /**
     * SSOT v2.0 coordinate system identifier
     */
    const COORDINATE_SYSTEM = 'fabric_native';

    /**
     * Migration version
     */
    const MIGRATION_VERSION = '2.0';

    /**
     * Database instance
     * @var wpdb
     */
    private $wpdb;

    /**
     * Configuration
     * @var array
     */
    private $config = [
        'dry_run'         => true,
        'verbose'         => false,
        'backup'          => true,
        'batch_size'      => 50,
        'table_name'      => 'wp_octo_user_designs',
    ];

    /**
     * Migration statistics
     * @var array
     */
    private $stats = [
        'total_scanned'       => 0,
        'already_migrated'    => 0,
        'needs_migration'     => 0,
        'migrated_success'    => 0,
        'unknown_offsets'     => 0,
        'errors'              => 0,
        'skipped_reasons'     => [],
    ];

    /**
     * Warnings and errors for final report
     * @var array
     */
    private $warnings = [];
    private $errors = [];

    /**
     * Constructor
     */
    public function __construct($args = []) {
        global $wpdb;
        $this->wpdb = $wpdb;

        // Update table name with proper prefix
        $this->config['table_name'] = $wpdb->prefix . 'octo_user_designs';

        // Parse CLI arguments
        $this->parse_arguments($args);
    }

    /**
     * Parse command line arguments
     */
    private function parse_arguments($args) {
        foreach ($args as $arg) {
            switch ($arg) {
                case '--execute':
                    $this->config['dry_run'] = false;
                    break;
                case '--dry-run':
                    $this->config['dry_run'] = true;
                    break;
                case '--verbose':
                    $this->config['verbose'] = true;
                    break;
                case '--no-backup':
                    $this->config['backup'] = false;
                    break;
                case '--backup':
                    $this->config['backup'] = true;
                    break;
                default:
                    if (strpos($arg, '--batch-size=') === 0) {
                        $this->config['batch_size'] = (int)substr($arg, 13);
                    }
                    break;
            }
        }

        // SAFETY CHECK: Require explicit mode
        if (empty($args) || (!in_array('--dry-run', $args) && !in_array('--execute', $args))) {
            $this->log_error("SAFETY ERROR: Must specify --dry-run or --execute mode");
            $this->log_info("Usage:");
            $this->log_info("  php paranoid-migration-ssot.php --dry-run");
            $this->log_info("  php paranoid-migration-ssot.php --execute");
            exit(1);
        }
    }

    /**
     * Main migration execution
     */
    public function run() {
        $this->log_header();

        // Step 1: Validate environment
        if (!$this->validate_environment()) {
            $this->log_error("Environment validation failed. Aborting.");
            return false;
        }

        // Step 2: Create backup column if needed
        if ($this->config['backup'] && !$this->config['dry_run']) {
            if (!$this->ensure_backup_column()) {
                $this->log_error("Failed to create backup column. Aborting for safety.");
                return false;
            }
        }

        // Step 3: Get all designs
        $designs = $this->get_all_designs();
        $this->stats['total_scanned'] = count($designs);

        if (empty($designs)) {
            $this->log_success("No designs found in database.");
            return true;
        }

        $this->log_info("Found {$this->stats['total_scanned']} design(s) to scan\n");

        // Step 4: Confirm execution (if not dry-run)
        if (!$this->config['dry_run']) {
            $this->log_warning("⚠️  PRODUCTION MODE - Changes will be written to database!");
            if (!$this->confirm_execution()) {
                $this->log_info("Migration cancelled by user.");
                return false;
            }
            echo "\n";
        }

        // Step 5: Process each design
        $progress = 0;
        foreach ($designs as $design) {
            $progress++;
            $this->process_design($design, $progress, $this->stats['total_scanned']);
        }

        // Step 6: Display results
        $this->display_results();

        return true;
    }

    /**
     * Validate environment before migration
     */
    private function validate_environment() {
        $this->log_info("Validating environment...");

        // Check if table exists
        $table_exists = $this->wpdb->get_var(
            $this->wpdb->prepare(
                "SHOW TABLES LIKE %s",
                $this->config['table_name']
            )
        );

        if (!$table_exists) {
            $this->log_error("Table {$this->config['table_name']} does not exist!");
            return false;
        }

        $this->log_success("Database table exists");

        // Check disk space if backup enabled
        if ($this->config['backup'] && !$this->config['dry_run']) {
            if (!$this->check_disk_space()) {
                $this->log_error("Insufficient disk space for backup!");
                return false;
            }
        }

        $this->log_separator();
        return true;
    }

    /**
     * Get all designs from database
     */
    private function get_all_designs() {
        $query = "SELECT id, design_data FROM {$this->config['table_name']}
                  WHERE design_data IS NOT NULL
                  ORDER BY id ASC";

        return $this->wpdb->get_results($query, ARRAY_A);
    }

    /**
     * Process a single design
     */
    private function process_design($design, $current, $total) {
        $id = $design['id'];
        $design_data = json_decode($design['design_data'], true);

        // Validate JSON
        if ($design_data === null) {
            $this->stats['errors']++;
            $this->errors[] = "Design #{$id}: Invalid JSON data";
            $this->log_verbose("Design #{$id}: Invalid JSON, skipping", 'error');
            return false;
        }

        // Check if design has objects
        if (!isset($design_data['objects']) || !is_array($design_data['objects'])) {
            $this->log_verbose("Design #{$id}: No objects array (old format), skipping", 'skip');
            $this->track_skip_reason('no_objects_array');
            return true;
        }

        // SAFETY RULE 2: Check if already migrated (Einmal ist genug)
        if ($this->is_already_migrated($design_data)) {
            $this->stats['already_migrated']++;
            $this->log_verbose("Design #{$id}: Already migrated (SSOT v2.0), skipping", 'skip');
            $this->track_skip_reason('already_migrated_ssot_v2');
            return true;
        }

        // Extract offset metadata
        $offset_x = $this->get_offset_value($design_data, 'offset_x');
        $offset_y = $this->get_offset_value($design_data, 'offset_y');

        // SAFETY RULE 1: Only handle KNOWN offsets (Erkennen statt Raten)
        if (!$this->is_known_offset($offset_x, $offset_y)) {
            $this->stats['unknown_offsets']++;
            $this->warnings[] = "Design #{$id}: Unknown offset ({$offset_x}, {$offset_y}) - SKIPPED for manual review";
            $this->log_verbose(
                "Design #{$id}: Unknown offset ({$offset_x}, {$offset_y}) - SKIPPED",
                'warning'
            );
            $this->track_skip_reason('unknown_offset_values');
            return true;
        }

        // Skip if already correct (offset = 0)
        if ($offset_x == 0 && $offset_y == 0) {
            $this->stats['already_migrated']++;
            $this->log_verbose("Design #{$id}: Already correct (offset 0,0), skipping", 'skip');
            $this->track_skip_reason('already_zero_offset');
            return true;
        }

        // This design NEEDS migration
        $this->stats['needs_migration']++;

        $object_count = count($design_data['objects']);

        // SAFETY RULE 3: Dry-run or execute (Trockenübung mit echten Daten)
        if ($this->config['dry_run']) {
            // DRY-RUN MODE: Show what WOULD happen
            $this->log_dry_run_action($id, $offset_x, $offset_y, $object_count, $current, $total);
            $this->stats['migrated_success']++; // Track as "would migrate"
            return true;
        } else {
            // PRODUCTION MODE: Actually migrate
            return $this->execute_migration($id, $design, $design_data, $offset_x, $offset_y, $object_count);
        }
    }

    /**
     * SAFETY RULE 2: Check if design is already migrated (Idempotent check)
     */
    private function is_already_migrated($design_data) {
        // Strategy 1: Check for SSOT v2.0 coordinate system marker
        if (isset($design_data['metadata']['coordinate_system']) &&
            $design_data['metadata']['coordinate_system'] === self::COORDINATE_SYSTEM) {
            return true;
        }

        // Strategy 2: Check for SSOT v2.0 version marker
        if (isset($design_data['metadata']['version']) &&
            $design_data['metadata']['version'] === self::MIGRATION_VERSION) {
            return true;
        }

        // Strategy 3: Check for migration timestamp
        if (isset($design_data['metadata']['migrated_at'])) {
            return true;
        }

        // Strategy 4: Check if offset is zero AND has offset_applied flag
        if (isset($design_data['metadata']['offset_applied']) &&
            $design_data['metadata']['offset_applied'] === true &&
            isset($design_data['metadata']['offset_x']) &&
            $design_data['metadata']['offset_x'] == 0 &&
            isset($design_data['metadata']['offset_y']) &&
            $design_data['metadata']['offset_y'] == 0) {
            return true;
        }

        return false;
    }

    /**
     * SAFETY RULE 1: Check if offset is a KNOWN value (Erkennen statt Raten)
     */
    private function is_known_offset($offset_x, $offset_y) {
        foreach (self::KNOWN_OFFSETS as $known) {
            if (abs($offset_x - $known) <= self::OFFSET_TOLERANCE &&
                abs($offset_y - $known) <= self::OFFSET_TOLERANCE) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get offset value from design data with fallback
     */
    private function get_offset_value($design_data, $key) {
        if (isset($design_data['metadata'][$key])) {
            return floatval($design_data['metadata'][$key]);
        }
        return 0.0;
    }

    /**
     * Log dry-run action (SAFETY RULE 3)
     */
    private function log_dry_run_action($id, $offset_x, $offset_y, $object_count, $current, $total) {
        if ($this->config['verbose']) {
            echo sprintf(
                "[%d/%d] DRY-RUN: Design #%d\n",
                $current,
                $total,
                $id
            );
            echo "  • Current offset: ({$offset_x}, {$offset_y})\n";
            echo "  • Objects to correct: {$object_count}\n";
            echo "  • Would subtract offset from all object coordinates\n";
            echo "  • Would set: offset_x=0, offset_y=0\n";
            echo "  • Would mark: coordinate_system='" . self::COORDINATE_SYSTEM . "'\n";
            echo "  • Would mark: version='" . self::MIGRATION_VERSION . "'\n";
            echo "\n";
        } else {
            echo sprintf(
                "[%d/%d] DRY-RUN: Would migrate Design #%d (offset: %.1f, %.1f) - %d objects\n",
                $current,
                $total,
                $id,
                $offset_x,
                $offset_y,
                $object_count
            );
        }
    }

    /**
     * Execute actual migration (PRODUCTION MODE)
     */
    private function execute_migration($id, $original_design, $design_data, $offset_x, $offset_y, $object_count) {
        try {
            // Apply offset correction to all objects
            foreach ($design_data['objects'] as &$obj) {
                if (isset($obj['left'])) {
                    $obj['left'] = $obj['left'] - $offset_x;
                }
                if (isset($obj['top'])) {
                    $obj['top'] = $obj['top'] - $offset_y;
                }
            }
            unset($obj); // Break reference

            // Update metadata to SSOT v2.0
            $design_data['metadata']['offset_x'] = 0;
            $design_data['metadata']['offset_y'] = 0;
            $design_data['metadata']['coordinate_system'] = self::COORDINATE_SYSTEM;
            $design_data['metadata']['version'] = self::MIGRATION_VERSION;
            $design_data['metadata']['migrated_at'] = current_time('mysql');

            // Store original offset for audit trail
            $design_data['metadata']['original_offset_x'] = $offset_x;
            $design_data['metadata']['original_offset_y'] = $offset_y;

            // Prepare update data
            $update_data = [
                'design_data' => wp_json_encode($design_data),
            ];

            // Add backup if enabled
            if ($this->config['backup']) {
                $update_data['design_data_backup_ssot'] = $original_design['design_data'];
            }

            // Save to database
            $result = $this->wpdb->update(
                $this->config['table_name'],
                $update_data,
                ['id' => $id],
                ['%s', '%s'],
                ['%d']
            );

            if ($result === false) {
                throw new Exception("Database update failed: " . $this->wpdb->last_error);
            }

            $this->stats['migrated_success']++;
            $this->log_verbose(
                "Design #{$id}: Successfully migrated (offset {$offset_x},{$offset_y} → 0,0)",
                'success'
            );

            return true;

        } catch (Exception $e) {
            $this->stats['errors']++;
            $this->errors[] = "Design #{$id}: " . $e->getMessage();
            $this->log_verbose("Design #{$id}: Migration failed - " . $e->getMessage(), 'error');
            return false;
        }
    }

    /**
     * Track skip reasons for statistics
     */
    private function track_skip_reason($reason) {
        if (!isset($this->stats['skipped_reasons'][$reason])) {
            $this->stats['skipped_reasons'][$reason] = 0;
        }
        $this->stats['skipped_reasons'][$reason]++;
    }

    /**
     * Ensure backup column exists
     */
    private function ensure_backup_column() {
        $backup_column = 'design_data_backup_ssot';

        $column_exists = $this->wpdb->get_results(
            $this->wpdb->prepare(
                "SHOW COLUMNS FROM {$this->config['table_name']} LIKE %s",
                $backup_column
            )
        );

        if (empty($column_exists)) {
            $this->log_info("Creating backup column: {$backup_column}");

            $result = $this->wpdb->query(
                "ALTER TABLE {$this->config['table_name']}
                 ADD COLUMN {$backup_column} LONGTEXT NULL
                 COMMENT 'SSOT v2.0 migration backup'
                 AFTER design_data"
            );

            if ($result === false) {
                $this->log_error("Failed to create backup column!");
                return false;
            }

            $this->log_success("Backup column created successfully");
        } else {
            $this->log_info("Backup column already exists");
        }

        return true;
    }

    /**
     * Check available disk space
     */
    private function check_disk_space() {
        if (!function_exists('disk_free_space')) {
            $this->log_warning("Cannot check disk space (function not available), proceeding anyway");
            return true;
        }

        // Calculate required space
        $avg_size_query = "SELECT AVG(LENGTH(design_data)) as avg_size FROM {$this->config['table_name']}";
        $avg_size = (float)$this->wpdb->get_var($avg_size_query) ?: 10240;
        $required_space = $avg_size * $this->stats['total_scanned'] * 1.5; // 50% buffer

        // Check available space
        $upload_dir = wp_upload_dir();
        $available_space = @disk_free_space($upload_dir['basedir']);

        if ($available_space === false) {
            $this->log_warning("Cannot determine available disk space, proceeding anyway");
            return true;
        }

        $required_mb = round($required_space / 1048576, 2);
        $available_mb = round($available_space / 1048576, 2);

        $this->log_info("Disk space check: Required ~{$required_mb}MB, Available {$available_mb}MB");

        if ($available_space < $required_space) {
            $this->log_error("Insufficient disk space!");
            return false;
        }

        $this->log_success("Sufficient disk space available");
        return true;
    }

    /**
     * Confirm execution with user
     */
    private function confirm_execution() {
        if (defined('WP_CLI') && WP_CLI) {
            WP_CLI::confirm("Proceed with migration?");
            return true;
        } else {
            echo "\n⚠️  Are you SURE you want to proceed with migration? [y/N]: ";
            $handle = fopen("php://stdin", "r");
            $line = fgets($handle);
            fclose($handle);
            return strtolower(trim($line)) === 'y';
        }
    }

    /**
     * Display migration results
     */
    private function display_results() {
        $this->log_separator();
        $this->log_header_text('MIGRATION RESULTS');
        $this->log_separator();

        echo "\n";
        echo "📊 STATISTICS:\n";
        echo "───────────────────────────────────────────────────────────────────────\n";
        echo sprintf("Total scanned:           %d designs\n", $this->stats['total_scanned']);
        echo sprintf("Already migrated:        %d designs (skipped safely)\n", $this->stats['already_migrated']);
        echo sprintf("Needs migration:         %d designs\n", $this->stats['needs_migration']);
        echo sprintf("Migrated successfully:   %d designs\n", $this->stats['migrated_success']);
        echo sprintf("Unknown offsets (skip):  %d designs\n", $this->stats['unknown_offsets']);
        echo sprintf("Errors:                  %d designs\n", $this->stats['errors']);
        echo "\n";

        // Skip reasons breakdown
        if (!empty($this->stats['skipped_reasons'])) {
            echo "📋 SKIP REASONS:\n";
            echo "───────────────────────────────────────────────────────────────────────\n";
            foreach ($this->stats['skipped_reasons'] as $reason => $count) {
                $reason_label = str_replace('_', ' ', ucwords($reason, '_'));
                echo sprintf("  • %-40s %d designs\n", $reason_label . ':', $count);
            }
            echo "\n";
        }

        // Warnings
        if (!empty($this->warnings)) {
            echo "⚠️  WARNINGS:\n";
            echo "───────────────────────────────────────────────────────────────────────\n";
            foreach ($this->warnings as $warning) {
                echo "  {$warning}\n";
            }
            echo "\n";
        }

        // Errors
        if (!empty($this->errors)) {
            echo "❌ ERRORS:\n";
            echo "───────────────────────────────────────────────────────────────────────\n";
            foreach ($this->errors as $error) {
                echo "  {$error}\n";
            }
            echo "\n";
        }

        // Success rate
        if ($this->stats['needs_migration'] > 0) {
            $success_rate = ($this->stats['migrated_success'] / $this->stats['needs_migration']) * 100;
            echo sprintf("📈 Success Rate: %.1f%%\n\n", $success_rate);
        }

        // Final status
        $this->log_separator();
        if ($this->config['dry_run']) {
            $this->log_warning("🔍 DRY-RUN COMPLETE - No data was modified");
            $this->log_info("   Run with --execute to perform actual migration");
        } else {
            if ($this->stats['errors'] > 0) {
                $this->log_warning("✅ Migration completed with some errors (see above)");
            } else {
                $this->log_success("✅ Migration completed successfully!");
            }

            if ($this->config['backup']) {
                $this->log_info("   Backup saved to column: design_data_backup_ssot");
                $this->log_info("   Use rollback script to restore if needed");
            }
        }
        $this->log_separator();
        echo "\n";
    }

    // ═══════════════════════════════════════════════════════════════
    // LOGGING UTILITIES
    // ═══════════════════════════════════════════════════════════════

    private function log_header() {
        $border = str_repeat('═', 75);
        echo "\n{$border}\n";
        echo "  PARANOID MIGRATION SCRIPT - Single Source of Truth v2.0\n";
        echo "  Agent 3 of 7 - SSOT Redesign Implementation\n";
        echo "{$border}\n\n";

        echo "🛡️  SAFETY RULES:\n";
        echo "  1. Erkennen statt Raten    - Only fix KNOWN offsets (50px, 26.1px)\n";
        echo "  2. Einmal ist genug        - Idempotent (can run 100x safely)\n";
        echo "  3. Trockenübung            - Dry-run mode simulates without saving\n";
        echo "\n";

        echo "⚙️  CONFIGURATION:\n";
        echo "  Mode:       " . ($this->config['dry_run'] ? '🔍 DRY-RUN' : '🚀 PRODUCTION') . "\n";
        echo "  Backup:     " . ($this->config['backup'] ? 'ENABLED' : 'DISABLED') . "\n";
        echo "  Verbose:    " . ($this->config['verbose'] ? 'ENABLED' : 'DISABLED') . "\n";
        echo "  Table:      " . $this->config['table_name'] . "\n";
        echo "\n";
        $this->log_separator();
    }

    private function log_header_text($text) {
        $border = str_repeat('═', 75);
        echo "\n{$border}\n";
        echo "  {$text}\n";
        echo "{$border}\n";
    }

    private function log_separator() {
        echo str_repeat('─', 75) . "\n";
    }

    private function log_info($message) {
        echo "ℹ️  {$message}\n";
    }

    private function log_success($message) {
        echo "✅ {$message}\n";
    }

    private function log_warning($message) {
        echo "⚠️  {$message}\n";
    }

    private function log_error($message) {
        echo "❌ ERROR: {$message}\n";
    }

    private function log_verbose($message, $type = 'info') {
        if (!$this->config['verbose']) {
            return;
        }

        $prefix = [
            'info'    => '  ℹ️  ',
            'success' => '  ✅ ',
            'error'   => '  ❌ ',
            'warning' => '  ⚠️  ',
            'skip'    => '  ⊗ ',
        ][$type] ?? '  ';

        echo "{$prefix}{$message}\n";
    }
}

// ═══════════════════════════════════════════════════════════════
// ROLLBACK CLASS
// ═══════════════════════════════════════════════════════════════

class Paranoid_SSOT_Rollback {

    private $wpdb;
    private $config;
    private $stats = [
        'total_found'    => 0,
        'rolled_back'    => 0,
        'errors'         => 0,
    ];

    public function __construct($args = []) {
        global $wpdb;
        $this->wpdb = $wpdb;

        $this->config = [
            'dry_run'       => true,
            'verbose'       => false,
            'table_name'    => $wpdb->prefix . 'octo_user_designs',
            'backup_column' => 'design_data_backup_ssot',
        ];

        $this->parse_arguments($args);
    }

    private function parse_arguments($args) {
        foreach ($args as $arg) {
            if ($arg === '--execute') $this->config['dry_run'] = false;
            if ($arg === '--dry-run') $this->config['dry_run'] = true;
            if ($arg === '--verbose') $this->config['verbose'] = true;
        }

        // SAFETY CHECK: Require explicit mode
        if (empty($args) || (!in_array('--dry-run', $args) && !in_array('--execute', $args))) {
            echo "❌ ERROR: Must specify --dry-run or --execute mode\n";
            echo "Usage:\n";
            echo "  php paranoid-migration-ssot.php --rollback --dry-run\n";
            echo "  php paranoid-migration-ssot.php --rollback --execute\n";
            exit(1);
        }
    }

    public function run() {
        echo "\n" . str_repeat('═', 75) . "\n";
        echo "  PARANOID ROLLBACK - SSOT v2.0 Migration\n";
        echo str_repeat('═', 75) . "\n\n";

        echo "MODE: " . ($this->config['dry_run'] ? '🔍 DRY-RUN' : '🚀 PRODUCTION') . "\n\n";

        // Check if backup column exists
        $column_exists = $this->wpdb->get_results(
            $this->wpdb->prepare(
                "SHOW COLUMNS FROM {$this->config['table_name']} LIKE %s",
                $this->config['backup_column']
            )
        );

        if (empty($column_exists)) {
            echo "❌ ERROR: Backup column '{$this->config['backup_column']}' does not exist!\n";
            echo "   Cannot perform rollback without backup data.\n\n";
            return false;
        }

        // Find designs with backup
        $query = "SELECT id, {$this->config['backup_column']} as backup
                  FROM {$this->config['table_name']}
                  WHERE {$this->config['backup_column']} IS NOT NULL";

        $designs = $this->wpdb->get_results($query, ARRAY_A);
        $this->stats['total_found'] = count($designs);

        if (empty($designs)) {
            echo "✅ No backup data found. Nothing to rollback.\n\n";
            return true;
        }

        echo "📊 Found {$this->stats['total_found']} design(s) with backup data\n\n";

        if (!$this->config['dry_run']) {
            echo "⚠️  WARNING: This will OVERWRITE current design_data with backup!\n";
            echo "⚠️  This action CANNOT be undone!\n\n";
            echo "Proceed with rollback? [y/N]: ";
            $handle = fopen("php://stdin", "r");
            $line = fgets($handle);
            fclose($handle);

            if (strtolower(trim($line)) !== 'y') {
                echo "\nRollback cancelled by user.\n\n";
                return false;
            }
            echo "\n";
        }

        foreach ($designs as $design) {
            $id = $design['id'];

            if (!$this->config['dry_run']) {
                $result = $this->wpdb->update(
                    $this->config['table_name'],
                    ['design_data' => $design['backup']],
                    ['id' => $id],
                    ['%s'],
                    ['%d']
                );

                if ($result !== false) {
                    $this->stats['rolled_back']++;
                    if ($this->config['verbose']) {
                        echo "  ✅ Design #{$id}: Rolled back successfully\n";
                    }
                } else {
                    $this->stats['errors']++;
                    echo "  ❌ Design #{$id}: Rollback failed\n";
                }
            } else {
                $this->stats['rolled_back']++;
                if ($this->config['verbose']) {
                    echo "  🔍 Design #{$id}: Would rollback from backup\n";
                }
            }
        }

        echo "\n" . str_repeat('─', 75) . "\n";
        echo "ROLLBACK RESULTS\n";
        echo str_repeat('─', 75) . "\n\n";
        echo "Total with backup:  {$this->stats['total_found']} designs\n";
        echo "Rolled back:        {$this->stats['rolled_back']} designs\n";
        echo "Errors:             {$this->stats['errors']} designs\n\n";

        if ($this->config['dry_run']) {
            echo "⚠️  DRY-RUN COMPLETE - No changes were made\n";
            echo "Run with --execute to perform actual rollback\n\n";
        } else {
            if ($this->stats['errors'] > 0) {
                echo "⚠️  Rollback completed with some errors\n\n";
            } else {
                echo "✅ Rollback completed successfully!\n\n";
            }
        }

        return true;
    }
}

// ═══════════════════════════════════════════════════════════════
// CLI EXECUTION
// ═══════════════════════════════════════════════════════════════

if (php_sapi_name() === 'cli' || (defined('WP_CLI') && WP_CLI)) {
    $args = array_slice($argv ?? [], 1);

    // Check if rollback mode
    if (in_array('--rollback', $args)) {
        $rollback = new Paranoid_SSOT_Rollback($args);
        $rollback->run();
    } else {
        $migration = new Paranoid_SSOT_Migration($args);
        $migration->run();
    }
}

// ═══════════════════════════════════════════════════════════════
// WP-CLI COMMAND INTEGRATION
// ═══════════════════════════════════════════════════════════════

if (defined('WP_CLI') && WP_CLI) {

    /**
     * SSOT v2.0 Migration Commands
     */
    class SSOT_Migration_Command {

        /**
         * Migrate designs to Single Source of Truth v2.0
         *
         * ## OPTIONS
         *
         * [--dry-run]
         * : Preview changes without writing to database
         *
         * [--execute]
         * : Execute migration and write changes to database
         *
         * [--verbose]
         * : Show detailed output for each design
         *
         * [--backup]
         * : Create backup before migration (default: true)
         *
         * [--no-backup]
         * : Skip backup creation (not recommended)
         *
         * ## EXAMPLES
         *
         *     # Always start with dry-run!
         *     wp ssot migrate --dry-run --verbose
         *
         *     # Execute migration with backup
         *     wp ssot migrate --execute --backup
         *
         * @when after_wp_load
         */
        public function migrate($args, $assoc_args) {
            $cli_args = [];

            if (isset($assoc_args['dry-run'])) $cli_args[] = '--dry-run';
            if (isset($assoc_args['execute'])) $cli_args[] = '--execute';
            if (isset($assoc_args['verbose'])) $cli_args[] = '--verbose';
            if (isset($assoc_args['backup'])) $cli_args[] = '--backup';
            if (isset($assoc_args['no-backup'])) $cli_args[] = '--no-backup';

            // Safety: Must specify mode
            if (empty($cli_args) || (!isset($assoc_args['dry-run']) && !isset($assoc_args['execute']))) {
                WP_CLI::error("Must specify --dry-run or --execute mode");
            }

            $migration = new Paranoid_SSOT_Migration($cli_args);
            $migration->run();
        }

        /**
         * Rollback SSOT v2.0 migration using backup data
         *
         * ## OPTIONS
         *
         * [--dry-run]
         * : Preview rollback without making changes
         *
         * [--execute]
         * : Execute rollback
         *
         * [--verbose]
         * : Show detailed output
         *
         * ## EXAMPLES
         *
         *     # Preview rollback
         *     wp ssot rollback --dry-run --verbose
         *
         *     # Execute rollback (DANGER!)
         *     wp ssot rollback --execute
         *
         * @when after_wp_load
         */
        public function rollback($args, $assoc_args) {
            $cli_args = ['--rollback'];

            if (isset($assoc_args['dry-run'])) $cli_args[] = '--dry-run';
            if (isset($assoc_args['execute'])) $cli_args[] = '--execute';
            if (isset($assoc_args['verbose'])) $cli_args[] = '--verbose';

            // Safety: Must specify mode
            if (!isset($assoc_args['dry-run']) && !isset($assoc_args['execute'])) {
                WP_CLI::error("Must specify --dry-run or --execute mode");
            }

            $rollback = new Paranoid_SSOT_Rollback($cli_args);
            $rollback->run();
        }
    }

    WP_CLI::add_command('ssot', 'SSOT_Migration_Command');
}

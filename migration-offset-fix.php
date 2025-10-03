<?php
/**
 * Canvas Offset Bug Migration Script
 *
 * MISSION: Fix corrupted design coordinates caused by viewport-dependent offset bug
 * Agent: 3 of 7 - Architecture A (MINIMAL FIX)
 *
 * BUG SUMMARY:
 * - Container selector bug (.designer-editor instead of .designer-canvas-container)
 *   caused viewport-dependent offset values to be saved
 * - Type A: offset_x = 50 (Desktop viewport >950px)
 * - Type B: offset_x = 26.1 (Breakpoint 950px)
 * - Type C: offset_x = 0 (Mobile <950px) - already correct
 *
 * MIGRATION STRATEGY:
 * 1. Identify corrupted designs (offset_x != 0 or offset_y != 0)
 * 2. Subtract offset from all object coordinates
 * 3. Set offset to 0 and mark as migrated
 * 4. Preserve backup for rollback capability
 *
 * USAGE:
 *   php migration-offset-fix.php --dry-run --verbose
 *   php migration-offset-fix.php --execute --backup
 *
 * @package OctoPrintDesigner
 * @version 1.0.0
 * @since   2025-10-03
 */

// Prevent direct access
if (!defined('ABSPATH') && !defined('WP_CLI') && php_sapi_name() !== 'cli') {
    die('Direct access not permitted');
}

// Load WordPress if running as standalone script
if (php_sapi_name() === 'cli' && !defined('ABSPATH')) {
    // Try to find wp-load.php
    $wp_load_paths = [
        __DIR__ . '/wp-load.php',
        __DIR__ . '/../../../wp-load.php',
        __DIR__ . '/../../../../wp-load.php',
        __DIR__ . '/../../../../../wp-load.php',
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
        die("ERROR: Could not find WordPress installation. Please run from WordPress root or via WP-CLI.\n");
    }
}

class Canvas_Offset_Migration {

    /**
     * Database instance
     * @var wpdb
     */
    private $wpdb;

    /**
     * Migration statistics
     * @var array
     */
    private $stats = [
        'total_scanned'       => 0,
        'corrupted_found'     => 0,
        'migrated_success'    => 0,
        'already_correct'     => 0,
        'errors'              => 0,
        'by_corruption_type'  => [
            'type_a_50px'     => 0,  // Desktop
            'type_b_26px'     => 0,  // 950px breakpoint
            'type_c_correct'  => 0,  // Mobile (already 0)
            'other_values'    => 0,
        ],
        'offset_ranges'       => [],
        'error_details'       => [],
    ];

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
        'backup_column'   => 'design_data_backup_offset_fix',
        'migration_flag'  => 'offset_migration_applied',
        'migration_date'  => 'offset_migration_date',
    ];

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
                $this->log_error("Failed to create backup column. Aborting.");
                return false;
            }
        }

        // Step 3: Count and analyze designs
        $designs = $this->get_designs_to_migrate();
        $this->stats['total_scanned'] = count($designs);

        if (empty($designs)) {
            $this->log_success("No designs found to scan. Database is empty or table doesn't exist.");
            return true;
        }

        $this->log_info("Found {$this->stats['total_scanned']} design(s) to analyze");
        $this->log_separator();

        // Step 4: Confirm execution (if not dry-run)
        if (!$this->config['dry_run']) {
            $this->log_warning("PRODUCTION MODE - Changes will be written to database!");
            if (!$this->confirm_execution()) {
                $this->log_info("Migration cancelled by user.");
                return false;
            }
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

        // Check disk space if backup enabled
        if ($this->config['backup'] && !$this->config['dry_run']) {
            if (!$this->check_disk_space()) {
                $this->log_error("Insufficient disk space for backup!");
                return false;
            }
        }

        return true;
    }

    /**
     * Get all designs from database
     */
    private function get_designs_to_migrate() {
        $query = $this->wpdb->prepare(
            "SELECT id, design_data FROM {$this->config['table_name']}
             WHERE design_data IS NOT NULL
             ORDER BY id ASC"
        );

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
            $this->stats['error_details'][] = "ID {$id}: Invalid JSON";
            $this->log_verbose("ID {$id}: Invalid JSON, skipping", 'error');
            return false;
        }

        // Check if design has metadata with offset information
        $analysis = $this->analyze_design($design_data);

        if (!$analysis['has_offset_metadata']) {
            $this->log_verbose("ID {$id}: No offset metadata (OLD design format), skipping", 'skip');
            return true;
        }

        // Classify corruption type
        $corruption_type = $this->classify_corruption($analysis['offset_x'], $analysis['offset_y']);
        $this->stats['by_corruption_type'][$corruption_type]++;

        // Track offset values
        $offset_key = "{$analysis['offset_x']},{$analysis['offset_y']}";
        if (!isset($this->stats['offset_ranges'][$offset_key])) {
            $this->stats['offset_ranges'][$offset_key] = 0;
        }
        $this->stats['offset_ranges'][$offset_key]++;

        // Skip if already correct (offset = 0)
        if ($analysis['offset_x'] == 0 && $analysis['offset_y'] == 0) {
            $this->stats['already_correct']++;
            $this->log_verbose("ID {$id}: Already correct (offset 0,0), skipping", 'skip');
            return true;
        }

        // Skip if already migrated
        if ($analysis['already_migrated']) {
            $this->stats['already_correct']++;
            $this->log_verbose("ID {$id}: Already migrated, skipping", 'skip');
            return true;
        }

        // This design is corrupted and needs migration
        $this->stats['corrupted_found']++;

        $this->log_verbose(
            sprintf(
                "[%d/%d] ID %d: CORRUPTED - Type %s (offset: %.1f,%.1f) - %d objects",
                $current,
                $total,
                $id,
                $this->get_corruption_type_label($corruption_type),
                $analysis['offset_x'],
                $analysis['offset_y'],
                $analysis['object_count']
            ),
            'migrate'
        );

        // Apply migration
        if (!$this->config['dry_run']) {
            $migrated_data = $this->migrate_design_data($design_data, $analysis);

            if ($this->save_migrated_design($id, $design['design_data'], $migrated_data)) {
                $this->stats['migrated_success']++;
                $this->log_verbose("ID {$id}: Migration successful", 'success');
                return true;
            } else {
                $this->stats['errors']++;
                $this->stats['error_details'][] = "ID {$id}: Failed to save migrated data";
                $this->log_verbose("ID {$id}: Failed to save", 'error');
                return false;
            }
        } else {
            // Dry run - simulate success
            $this->stats['migrated_success']++;
            return true;
        }
    }

    /**
     * Analyze design data structure
     */
    private function analyze_design($design_data) {
        $analysis = [
            'has_offset_metadata' => false,
            'already_migrated'    => false,
            'offset_x'            => 0,
            'offset_y'            => 0,
            'offset_applied'      => false,
            'object_count'        => 0,
            'has_objects'         => false,
        ];

        // Check for metadata.offset_applied flag (NEW designs)
        if (isset($design_data['metadata']['offset_applied'])
            && $design_data['metadata']['offset_applied'] === true
        ) {
            $analysis['has_offset_metadata'] = true;
            $analysis['offset_applied'] = true;
            $analysis['offset_x'] = floatval($design_data['metadata']['offset_x'] ?? 0);
            $analysis['offset_y'] = floatval($design_data['metadata']['offset_y'] ?? 0);
        }

        // Check if already migrated
        if (isset($design_data['metadata'][$this->config['migration_flag']])
            && $design_data['metadata'][$this->config['migration_flag']] === true
        ) {
            $analysis['already_migrated'] = true;
        }

        // Count objects
        if (isset($design_data['objects']) && is_array($design_data['objects'])) {
            $analysis['object_count'] = count($design_data['objects']);
            $analysis['has_objects'] = $analysis['object_count'] > 0;
        }

        return $analysis;
    }

    /**
     * Classify corruption type based on offset values
     */
    private function classify_corruption($offset_x, $offset_y) {
        // Type A: Desktop (50px)
        if (abs($offset_x - 50) < 0.1 || abs($offset_y - 50) < 0.1) {
            return 'type_a_50px';
        }

        // Type B: 950px breakpoint (26.1px)
        if (abs($offset_x - 26.1) < 0.5 || abs($offset_y - 26.1) < 0.5) {
            return 'type_b_26px';
        }

        // Type C: Mobile/Correct (0px)
        if ($offset_x == 0 && $offset_y == 0) {
            return 'type_c_correct';
        }

        // Other values
        return 'other_values';
    }

    /**
     * Get human-readable label for corruption type
     */
    private function get_corruption_type_label($type) {
        $labels = [
            'type_a_50px'    => 'Desktop (50px)',
            'type_b_26px'    => 'Breakpoint (26px)',
            'type_c_correct' => 'Mobile (0px - OK)',
            'other_values'   => 'Unknown offset',
        ];

        return $labels[$type] ?? $type;
    }

    /**
     * Migrate design data by correcting coordinates
     */
    private function migrate_design_data($design_data, $analysis) {
        $offset_x = $analysis['offset_x'];
        $offset_y = $analysis['offset_y'];

        // Correct each object's coordinates
        if (isset($design_data['objects']) && is_array($design_data['objects'])) {
            foreach ($design_data['objects'] as &$object) {
                if (isset($object['left'])) {
                    $old_left = $object['left'];
                    $object['left'] = $old_left - $offset_x;

                    if ($this->config['verbose']) {
                        $this->log_verbose(
                            "  Object {$object['id']}: left {$old_left} -> {$object['left']}"
                        );
                    }
                }

                if (isset($object['top'])) {
                    $old_top = $object['top'];
                    $object['top'] = $old_top - $offset_y;

                    if ($this->config['verbose']) {
                        $this->log_verbose(
                            "  Object {$object['id']}: top {$old_top} -> {$object['top']}"
                        );
                    }
                }
            }
            unset($object); // Break reference
        }

        // Update metadata
        $design_data['metadata']['offset_x'] = 0;
        $design_data['metadata']['offset_y'] = 0;
        $design_data['metadata'][$this->config['migration_flag']] = true;
        $design_data['metadata'][$this->config['migration_date']] = current_time('mysql');

        // Store original offset values for reference
        $design_data['metadata']['original_offset_x'] = $offset_x;
        $design_data['metadata']['original_offset_y'] = $offset_y;

        return $design_data;
    }

    /**
     * Save migrated design to database
     */
    private function save_migrated_design($id, $original_data, $migrated_data) {
        $update_data = [
            'design_data' => wp_json_encode($migrated_data),
        ];

        // Add backup if enabled
        if ($this->config['backup']) {
            $update_data[$this->config['backup_column']] = $original_data;
        }

        $result = $this->wpdb->update(
            $this->config['table_name'],
            $update_data,
            ['id' => $id],
            ['%s', '%s'],
            ['%d']
        );

        return $result !== false;
    }

    /**
     * Ensure backup column exists
     */
    private function ensure_backup_column() {
        $column_exists = $this->wpdb->get_results(
            $this->wpdb->prepare(
                "SHOW COLUMNS FROM {$this->config['table_name']} LIKE %s",
                $this->config['backup_column']
            )
        );

        if (empty($column_exists)) {
            $this->log_info("Creating backup column: {$this->config['backup_column']}");

            $result = $this->wpdb->query(
                "ALTER TABLE {$this->config['table_name']}
                 ADD COLUMN {$this->config['backup_column']} LONGTEXT NULL
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
            $this->log_warning("Cannot check disk space (function not available)");
            return true; // Proceed anyway
        }

        // Calculate required space
        $avg_size_query = "SELECT AVG(LENGTH(design_data)) as avg_size FROM {$this->config['table_name']}";
        $avg_size = (float)$this->wpdb->get_var($avg_size_query) ?: 10240;
        $required_space = $avg_size * $this->stats['total_scanned'] * 1.5; // 50% buffer

        // Check available space
        $upload_dir = wp_upload_dir();
        $available_space = @disk_free_space($upload_dir['basedir']);

        if ($available_space === false) {
            $this->log_warning("Cannot determine available disk space");
            return true; // Proceed anyway
        }

        $required_mb = round($required_space / 1048576, 2);
        $available_mb = round($available_space / 1048576, 2);

        $this->log_info("Disk space: Required ~{$required_mb}MB, Available {$available_mb}MB");

        if ($available_space < $required_space) {
            $this->log_error("Insufficient disk space!");
            return false;
        }

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
            echo "\nProceed with migration? [y/N]: ";
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
        $this->log_header('MIGRATION RESULTS');
        $this->log_separator();

        echo sprintf("\n📊 Total Scanned:      %d designs\n", $this->stats['total_scanned']);
        echo sprintf("🔍 Corrupted Found:    %d designs\n", $this->stats['corrupted_found']);
        echo sprintf("✅ Migrated Success:   %d designs\n", $this->stats['migrated_success']);
        echo sprintf("✓  Already Correct:    %d designs\n", $this->stats['already_correct']);
        echo sprintf("❌ Errors:             %d designs\n", $this->stats['errors']);

        echo "\n📈 Corruption Type Breakdown:\n";
        echo sprintf("   • Type A (50px Desktop):      %d\n", $this->stats['by_corruption_type']['type_a_50px']);
        echo sprintf("   • Type B (26px Breakpoint):   %d\n", $this->stats['by_corruption_type']['type_b_26px']);
        echo sprintf("   • Type C (0px Mobile - OK):   %d\n", $this->stats['by_corruption_type']['type_c_correct']);
        echo sprintf("   • Other offset values:        %d\n", $this->stats['by_corruption_type']['other_values']);

        if (!empty($this->stats['offset_ranges'])) {
            echo "\n📏 Unique Offset Values Found:\n";
            arsort($this->stats['offset_ranges']);
            foreach ($this->stats['offset_ranges'] as $offset => $count) {
                echo sprintf("   • (%s): %d design(s)\n", $offset, $count);
            }
        }

        if (!empty($this->stats['error_details'])) {
            echo "\n❌ Error Details:\n";
            foreach ($this->stats['error_details'] as $error) {
                echo "   • {$error}\n";
            }
        }

        $success_rate = $this->stats['total_scanned'] > 0
            ? ($this->stats['migrated_success'] / $this->stats['corrupted_found']) * 100
            : 0;

        echo sprintf("\n📈 Success Rate: %.1f%%\n\n", $success_rate);

        if ($this->config['dry_run']) {
            $this->log_warning("DRY RUN MODE - No changes were made to the database");
            $this->log_info("Run with --execute to perform actual migration");
        } else {
            $this->log_success("Migration completed!");

            if ($this->config['backup']) {
                $this->log_info("Backup saved to column: {$this->config['backup_column']}");
                $this->log_info("To rollback: Use the rollback script or restore from backup");
            }
        }

        echo "\n";
    }

    // ===== LOGGING UTILITIES =====

    private function log_header($title = null) {
        $border = str_repeat('=', 70);
        echo "\n{$border}\n";
        if ($title) {
            echo "  {$title}\n";
            echo "{$border}\n";
        } else {
            echo "  CANVAS OFFSET BUG - DATABASE MIGRATION SCRIPT\n";
            echo "  Agent 3 of 7 - Architecture A (MINIMAL FIX)\n";
            echo "{$border}\n";
            echo "\n";
            echo "MODE: " . ($this->config['dry_run'] ? 'DRY RUN' : 'PRODUCTION') . "\n";
            echo "BACKUP: " . ($this->config['backup'] ? 'ENABLED' : 'DISABLED') . "\n";
            echo "VERBOSE: " . ($this->config['verbose'] ? 'ENABLED' : 'DISABLED') . "\n";
        }
    }

    private function log_separator() {
        echo str_repeat('-', 70) . "\n";
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
            'info'    => '  ',
            'success' => '  ✓ ',
            'error'   => '  ✗ ',
            'skip'    => '  ⊗ ',
            'migrate' => '  → ',
        ][$type] ?? '  ';

        echo "{$prefix}{$message}\n";
    }
}

// ===== ROLLBACK SCRIPT =====

class Canvas_Offset_Rollback {

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
            'backup_column' => 'design_data_backup_offset_fix',
        ];

        $this->parse_arguments($args);
    }

    private function parse_arguments($args) {
        foreach ($args as $arg) {
            if ($arg === '--execute') $this->config['dry_run'] = false;
            if ($arg === '--verbose') $this->config['verbose'] = true;
        }
    }

    public function run() {
        echo "\n" . str_repeat('=', 70) . "\n";
        echo "  CANVAS OFFSET MIGRATION - ROLLBACK SCRIPT\n";
        echo str_repeat('=', 70) . "\n\n";

        echo "MODE: " . ($this->config['dry_run'] ? 'DRY RUN' : 'PRODUCTION') . "\n\n";

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
            echo "Proceed with rollback? [y/N]: ";
            $handle = fopen("php://stdin", "r");
            $line = fgets($handle);
            fclose($handle);

            if (strtolower(trim($line)) !== 'y') {
                echo "Rollback cancelled.\n\n";
                return false;
            }
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
                        echo "  ✓ ID {$id}: Rolled back\n";
                    }
                } else {
                    $this->stats['errors']++;
                    echo "  ✗ ID {$id}: Rollback failed\n";
                }
            } else {
                $this->stats['rolled_back']++;
                if ($this->config['verbose']) {
                    echo "  → ID {$id}: Would rollback\n";
                }
            }
        }

        echo "\n" . str_repeat('-', 70) . "\n";
        echo "ROLLBACK RESULTS\n";
        echo str_repeat('-', 70) . "\n\n";
        echo "✅ Rolled back: {$this->stats['rolled_back']} designs\n";
        echo "❌ Errors:      {$this->stats['errors']} designs\n\n";

        if ($this->config['dry_run']) {
            echo "⚠️  DRY RUN - No changes were made\n";
            echo "Run with --execute to perform actual rollback\n\n";
        } else {
            echo "✅ Rollback completed!\n\n";
        }

        return true;
    }
}

// ===== CLI EXECUTION =====

if (php_sapi_name() === 'cli' || (defined('WP_CLI') && WP_CLI)) {
    $args = array_slice($argv ?? [], 1);

    // Check if rollback mode
    if (in_array('--rollback', $args)) {
        $rollback = new Canvas_Offset_Rollback($args);
        $rollback->run();
    } else {
        $migration = new Canvas_Offset_Migration($args);
        $migration->run();
    }
}

// ===== WP-CLI COMMAND INTEGRATION =====

if (defined('WP_CLI') && WP_CLI) {

    /**
     * Migrate canvas offset corrupted designs
     */
    class Canvas_Offset_Migration_Command {

        /**
         * Fix corrupted design coordinates from canvas offset bug
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
         * [--batch-size=<number>]
         * : Number of records to process in each batch (default: 50)
         *
         * ## EXAMPLES
         *
         *     # Dry run to preview changes
         *     wp canvas-offset migrate --dry-run --verbose
         *
         *     # Execute migration with backup
         *     wp canvas-offset migrate --execute --backup
         *
         *     # Execute without backup (fast but risky)
         *     wp canvas-offset migrate --execute --no-backup
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
            if (isset($assoc_args['batch-size'])) $cli_args[] = '--batch-size=' . $assoc_args['batch-size'];

            $migration = new Canvas_Offset_Migration($cli_args);
            $migration->run();
        }

        /**
         * Rollback migration using backup data
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
         *     wp canvas-offset rollback --dry-run --verbose
         *
         *     # Execute rollback
         *     wp canvas-offset rollback --execute
         *
         * @when after_wp_load
         */
        public function rollback($args, $assoc_args) {
            $cli_args = ['--rollback'];

            if (isset($assoc_args['dry-run'])) $cli_args[] = '--dry-run';
            if (isset($assoc_args['execute'])) $cli_args[] = '--execute';
            if (isset($assoc_args['verbose'])) $cli_args[] = '--verbose';

            $rollback = new Canvas_Offset_Rollback($cli_args);
            $rollback->run();
        }
    }

    WP_CLI::add_command('canvas-offset', 'Canvas_Offset_Migration_Command');
}

<?php
/**
 * WP-CLI command for migrating design data to Golden Standard format
 *
 * @package OctoPrintDesigner
 * @subpackage CLI
 * @version 3.0.0
 */

if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) {
	return;
}

/**
 * Migrate design data from variationImages and legacy formats to Golden Standard
 */
class Design_Data_Migration_Command {

	/**
	 * Database table name
	 *
	 * @var string
	 */
	private $table_name;

	/**
	 * Migration statistics
	 *
	 * @var array
	 */
	private $stats = array(
		'total'       => 0,
		'migrated'    => 0,
		'skipped'     => 0,
		'errors'      => 0,
		'formats'     => array(
			'variation_images' => 0,
			'legacy_nested'    => 0,
			'already_golden'   => 0,
			'unknown'          => 0,
		),
	);

	/**
	 * Constructor
	 */
	public function __construct() {
		global $wpdb;
		$this->table_name = $wpdb->prefix . 'octo_user_designs';
	}

	/**
	 * Migrate design data to Golden Standard format
	 *
	 * ## OPTIONS
	 *
	 * [--batch-size=<number>]
	 * : Number of records to process in each batch (default: 50)
	 *
	 * [--dry-run]
	 * : Preview changes without writing to database
	 *
	 * [--verbose]
	 * : Show detailed output for each record
	 *
	 * [--force]
	 * : Migrate even records that appear to be in Golden Standard format
	 *
	 * [--backup]
	 * : Create backup column before migration (recommended)
	 *
	 * [--limit=<number>]
	 * : Limit total number of records to process (for testing)
	 *
	 * ## EXAMPLES
	 *
	 *     # Dry run to preview changes
	 *     wp octo-migrate design-data --dry-run --verbose
	 *
	 *     # Run migration with backup
	 *     wp octo-migrate design-data --backup --batch-size=100
	 *
	 *     # Test on first 10 records
	 *     wp octo-migrate design-data --dry-run --limit=10 --verbose
	 *
	 * @when after_wp_load
	 */
	public function design_data( $args, $assoc_args ) {
		global $wpdb;

		$batch_size = isset( $assoc_args['batch-size'] ) ? (int) $assoc_args['batch-size'] : 50;
		$dry_run    = isset( $assoc_args['dry-run'] );
		$verbose    = isset( $assoc_args['verbose'] );
		$force      = isset( $assoc_args['force'] );
		$backup     = isset( $assoc_args['backup'] );
		$limit      = isset( $assoc_args['limit'] ) ? (int) $assoc_args['limit'] : null;

		WP_CLI::line( '' );
		WP_CLI::line( '═══════════════════════════════════════════════════════════════' );
		WP_CLI::line( '  Design Data Migration to Golden Standard Format (v3.0.0)' );
		WP_CLI::line( '═══════════════════════════════════════════════════════════════' );
		WP_CLI::line( '' );

		// Step 1: Check if backup column exists, create if needed
		if ( $backup && ! $dry_run ) {
			$this->ensure_backup_column();
		}

		// Step 2: Count total records
		$where_clause = $force ? '' : "WHERE design_data NOT LIKE '%capture_version%'";
		$count_query  = "SELECT COUNT(*) FROM {$this->table_name} {$where_clause}";
		$total_count  = (int) $wpdb->get_var( $count_query );

		if ( $limit && $limit < $total_count ) {
			$total_count = $limit;
		}

		$this->stats['total'] = $total_count;

		if ( 0 === $total_count ) {
			WP_CLI::success( 'No records need migration. All designs are already in Golden Standard format!' );
			return;
		}

		WP_CLI::line( sprintf( '📊 Found %d record(s) to process', $total_count ) );
		WP_CLI::line( sprintf( '🔧 Batch size: %d', $batch_size ) );
		WP_CLI::line( sprintf( '🔍 Mode: %s', $dry_run ? 'DRY RUN (no changes will be made)' : 'PRODUCTION' ) );
		if ( $backup && ! $dry_run ) {
			WP_CLI::line( '💾 Backup: ENABLED' );
		}
		WP_CLI::line( '' );

		if ( ! $dry_run ) {
			WP_CLI::confirm( 'Are you sure you want to proceed with the migration?', $assoc_args );
		}

		// Step 3: Process records in batches
		$offset = 0;
		$progress = \WP_CLI\Utils\make_progress_bar( 'Migrating designs', $total_count );

		while ( $offset < $total_count ) {
			$limit_clause = $limit ? "LIMIT {$limit}" : '';
			$query        = "SELECT id, design_data FROM {$this->table_name} {$where_clause} ORDER BY id ASC LIMIT {$batch_size} OFFSET {$offset} {$limit_clause}";
			$results      = $wpdb->get_results( $query, ARRAY_A );

			if ( empty( $results ) ) {
				break;
			}

			foreach ( $results as $row ) {
				$this->process_single_record( $row, $dry_run, $verbose, $backup );
				$progress->tick();
			}

			$offset += $batch_size;

			// Prevent memory issues
			if ( ! $dry_run ) {
				wp_cache_flush();
			}
		}

		$progress->finish();

		// Step 4: Display results
		$this->display_results( $dry_run );
	}

	/**
	 * Process a single design record
	 *
	 * @param array $row     Database row with id and design_data
	 * @param bool  $dry_run Whether this is a dry run
	 * @param bool  $verbose Show detailed output
	 * @param bool  $backup  Create backup before updating
	 * @return bool Success status
	 */
	private function process_single_record( $row, $dry_run, $verbose, $backup ) {
		global $wpdb;

		$id          = $row['id'];
		$design_data = json_decode( $row['design_data'], true );

		if ( null === $design_data ) {
			if ( $verbose ) {
				WP_CLI::warning( sprintf( 'ID %d: Invalid JSON, skipping', $id ) );
			}
			$this->stats['errors']++;
			return false;
		}

		// Detect format
		$format = $this->detect_format( $design_data );
		$this->stats['formats'][ $format ]++;

		if ( 'already_golden' === $format ) {
			if ( $verbose ) {
				WP_CLI::line( sprintf( 'ID %d: Already in Golden Standard format, skipping', $id ) );
			}
			$this->stats['skipped']++;
			return true;
		}

		// Convert to Golden Standard
		$converted = $this->convert_to_golden_standard( $design_data, $format );

		if ( false === $converted ) {
			if ( $verbose ) {
				WP_CLI::warning( sprintf( 'ID %d: Conversion failed for format %s', $id, $format ) );
			}
			$this->stats['errors']++;
			return false;
		}

		if ( $verbose ) {
			WP_CLI::line( sprintf( 'ID %d: Converting from %s → Golden Standard', $id, $format ) );
			WP_CLI::line( sprintf( '  Objects: %d', count( $converted['objects'] ?? array() ) ) );
		}

		// Update database
		if ( ! $dry_run ) {
			$update_data = array(
				'design_data' => wp_json_encode( $converted ),
			);

			if ( $backup ) {
				$update_data['design_data_backup'] = $row['design_data'];
			}

			$result = $wpdb->update(
				$this->table_name,
				$update_data,
				array( 'id' => $id ),
				array( '%s', '%s' ),
				array( '%d' )
			);

			if ( false === $result ) {
				if ( $verbose ) {
					WP_CLI::warning( sprintf( 'ID %d: Database update failed', $id ) );
				}
				$this->stats['errors']++;
				return false;
			}
		}

		$this->stats['migrated']++;
		return true;
	}

	/**
	 * Detect the format of design data
	 *
	 * @param array $data Design data
	 * @return string Format identifier
	 */
	private function detect_format( $data ) {
		// Golden Standard format
		if ( isset( $data['objects'] ) && isset( $data['metadata']['capture_version'] ) ) {
			return 'already_golden';
		}

		// variationImages format
		if ( isset( $data['variationImages'] ) ) {
			return 'variation_images';
		}

		// Legacy nested format (has view keys with images arrays)
		foreach ( $data as $key => $value ) {
			if ( preg_match( '/^\d+_\d+$/', $key ) && isset( $value['images'] ) ) {
				return 'legacy_nested';
			}
		}

		return 'unknown';
	}

	/**
	 * Convert design data to Golden Standard format
	 *
	 * @param array  $data   Original design data
	 * @param string $format Detected format
	 * @return array|false Converted data or false on failure
	 */
	private function convert_to_golden_standard( $data, $format ) {
		switch ( $format ) {
			case 'variation_images':
				return $this->convert_variation_images( $data );

			case 'legacy_nested':
				return $this->convert_legacy_nested( $data );

			default:
				return false;
		}
	}

	/**
	 * Convert variationImages format to Golden Standard
	 *
	 * @param array $data Original data
	 * @return array Converted data
	 */
	private function convert_variation_images( $data ) {
		$objects = array();

		if ( isset( $data['variationImages'] ) && is_array( $data['variationImages'] ) ) {
			foreach ( $data['variationImages'] as $view_key => $elements ) {
				// Extract variation_id and view_id from key (e.g., "167359_189542")
				list( $variation_id, $view_id ) = explode( '_', $view_key );

				if ( is_array( $elements ) ) {
					foreach ( $elements as $element ) {
						// Flatten nested transform coordinates
						$obj = array(
							'type'   => $element['type'] ?? 'image',
							'id'     => $element['id'] ?? uniqid( 'obj_' ),
							'src'    => $element['src'] ?? $element['url'] ?? '',
							'left'   => $element['transform']['left'] ?? $element['left'] ?? 0,
							'top'    => $element['transform']['top'] ?? $element['top'] ?? 0,
							'scaleX' => $element['transform']['scaleX'] ?? $element['scaleX'] ?? 1,
							'scaleY' => $element['transform']['scaleY'] ?? $element['scaleY'] ?? 1,
							'angle'  => $element['transform']['angle'] ?? $element['angle'] ?? 0,
							'width'  => $element['width'] ?? 100,
							'height' => $element['height'] ?? 100,
						);

						// Add element metadata
						$obj['elementMetadata'] = array(
							'variation_id' => $variation_id,
							'view_id'      => $view_id,
						);

						$objects[] = $obj;
					}
				}
			}
		}

		return array(
			'objects'  => $objects,
			'metadata' => array(
				'capture_version'   => '2.1-migrated',
				'source'            => 'migration_variationImages',
				'template_id'       => $data['templateId'] ?? '',
				'migrated_at'       => current_time( 'mysql' ),
				'original_format'   => 'variationImages',
			),
		);
	}

	/**
	 * Convert legacy nested format to Golden Standard
	 *
	 * @param array $data Original data
	 * @return array Converted data
	 */
	private function convert_legacy_nested( $data ) {
		$objects = array();

		foreach ( $data as $view_key => $view_data ) {
			if ( ! preg_match( '/^\d+_\d+$/', $view_key ) ) {
				continue;
			}

			list( $variation_id, $view_id ) = explode( '_', $view_key );

			if ( isset( $view_data['images'] ) && is_array( $view_data['images'] ) ) {
				foreach ( $view_data['images'] as $element ) {
					$obj = array(
						'type'   => 'image',
						'id'     => $element['id'] ?? uniqid( 'obj_' ),
						'src'    => $element['src'] ?? $element['url'] ?? '',
						'left'   => $element['left'] ?? 0,
						'top'    => $element['top'] ?? 0,
						'scaleX' => $element['scaleX'] ?? 1,
						'scaleY' => $element['scaleY'] ?? 1,
						'angle'  => $element['angle'] ?? 0,
						'width'  => $element['width'] ?? 100,
						'height' => $element['height'] ?? 100,
					);

					$obj['elementMetadata'] = array(
						'variation_id' => $variation_id,
						'view_id'      => $view_id,
					);

					$objects[] = $obj;
				}
			}
		}

		return array(
			'objects'  => $objects,
			'metadata' => array(
				'capture_version'   => '1.0-legacy-migrated',
				'source'            => 'migration_legacy_nested',
				'migrated_at'       => current_time( 'mysql' ),
				'original_format'   => 'legacy_nested',
			),
		);
	}

	/**
	 * Ensure backup column exists in database
	 */
	private function ensure_backup_column() {
		global $wpdb;

		$column_exists = $wpdb->get_results(
			$wpdb->prepare(
				'SHOW COLUMNS FROM %i LIKE %s',
				$this->table_name,
				'design_data_backup'
			)
		);

		if ( empty( $column_exists ) ) {
			WP_CLI::line( '💾 Creating design_data_backup column...' );

			$result = $wpdb->query(
				"ALTER TABLE {$this->table_name} ADD COLUMN design_data_backup LONGTEXT NULL AFTER design_data"
			);

			if ( false === $result ) {
				WP_CLI::error( 'Failed to create backup column' );
			}

			WP_CLI::success( 'Backup column created successfully' );
		} else {
			WP_CLI::line( '💾 Backup column already exists' );
		}
	}

	/**
	 * Display migration results
	 *
	 * @param bool $dry_run Whether this was a dry run
	 */
	private function display_results( $dry_run ) {
		WP_CLI::line( '' );
		WP_CLI::line( '═══════════════════════════════════════════════════════════════' );
		WP_CLI::line( '  Migration Results' );
		WP_CLI::line( '═══════════════════════════════════════════════════════════════' );
		WP_CLI::line( '' );

		WP_CLI::line( sprintf( '📊 Total records:    %d', $this->stats['total'] ) );
		WP_CLI::line( sprintf( '✅ Migrated:         %d', $this->stats['migrated'] ) );
		WP_CLI::line( sprintf( '⏭️  Skipped:          %d', $this->stats['skipped'] ) );
		WP_CLI::line( sprintf( '❌ Errors:           %d', $this->stats['errors'] ) );
		WP_CLI::line( '' );

		WP_CLI::line( 'Format breakdown:' );
		WP_CLI::line( sprintf( '  • variationImages:  %d', $this->stats['formats']['variation_images'] ) );
		WP_CLI::line( sprintf( '  • legacy_nested:    %d', $this->stats['formats']['legacy_nested'] ) );
		WP_CLI::line( sprintf( '  • already_golden:   %d', $this->stats['formats']['already_golden'] ) );
		WP_CLI::line( sprintf( '  • unknown:          %d', $this->stats['formats']['unknown'] ) );
		WP_CLI::line( '' );

		$success_rate = $this->stats['total'] > 0 ? ( $this->stats['migrated'] / $this->stats['total'] ) * 100 : 0;
		WP_CLI::line( sprintf( '📈 Success rate: %.1f%%', $success_rate ) );
		WP_CLI::line( '' );

		if ( $dry_run ) {
			WP_CLI::warning( 'This was a DRY RUN. No changes were made to the database.' );
			WP_CLI::line( 'Run without --dry-run to perform the actual migration.' );
		} else {
			WP_CLI::success( 'Migration completed!' );

			if ( $this->stats['errors'] > 0 ) {
				WP_CLI::warning( sprintf( '%d record(s) had errors. Check logs for details.', $this->stats['errors'] ) );
			}
		}
	}

	/**
	 * Rollback migration using backup data
	 *
	 * ## OPTIONS
	 *
	 * [--limit=<number>]
	 * : Limit number of records to rollback (for testing)
	 *
	 * [--dry-run]
	 * : Preview rollback without making changes
	 *
	 * [--verbose]
	 * : Show detailed output
	 *
	 * ## EXAMPLES
	 *
	 *     # Dry run rollback
	 *     wp octo-migrate rollback --dry-run --verbose
	 *
	 *     # Perform rollback
	 *     wp octo-migrate rollback
	 *
	 * @when after_wp_load
	 */
	public function rollback( $args, $assoc_args ) {
		global $wpdb;

		$dry_run = isset( $assoc_args['dry-run'] );
		$verbose = isset( $assoc_args['verbose'] );
		$limit   = isset( $assoc_args['limit'] ) ? (int) $assoc_args['limit'] : null;

		WP_CLI::line( '' );
		WP_CLI::line( '═══════════════════════════════════════════════════════════════' );
		WP_CLI::line( '  Design Data Rollback from Backup' );
		WP_CLI::line( '═══════════════════════════════════════════════════════════════' );
		WP_CLI::line( '' );

		// Check if backup column exists
		$column_exists = $wpdb->get_results(
			$wpdb->prepare(
				'SHOW COLUMNS FROM %i LIKE %s',
				$this->table_name,
				'design_data_backup'
			)
		);

		if ( empty( $column_exists ) ) {
			WP_CLI::error( 'Backup column does not exist. Cannot perform rollback.' );
		}

		// Count records with backup
		$count_query = "SELECT COUNT(*) FROM {$this->table_name} WHERE design_data_backup IS NOT NULL";
		$count       = (int) $wpdb->get_var( $count_query );

		if ( 0 === $count ) {
			WP_CLI::error( 'No backup data found. Cannot perform rollback.' );
		}

		WP_CLI::line( sprintf( '📊 Found %d record(s) with backup data', $count ) );
		WP_CLI::line( '' );

		if ( ! $dry_run ) {
			WP_CLI::confirm( '⚠️  Are you SURE you want to rollback? This will restore backup data and OVERWRITE current design_data.' );
		}

		$limit_clause = $limit ? "LIMIT {$limit}" : '';
		$query        = "SELECT id FROM {$this->table_name} WHERE design_data_backup IS NOT NULL {$limit_clause}";
		$ids          = $wpdb->get_col( $query );

		$progress   = \WP_CLI\Utils\make_progress_bar( 'Rolling back', count( $ids ) );
		$rolled_back = 0;

		foreach ( $ids as $id ) {
			if ( ! $dry_run ) {
				$result = $wpdb->query(
					$wpdb->prepare(
						"UPDATE {$this->table_name} SET design_data = design_data_backup WHERE id = %d",
						$id
					)
				);

				if ( false !== $result ) {
					$rolled_back++;
				}
			} else {
				$rolled_back++;
			}

			$progress->tick();
		}

		$progress->finish();

		WP_CLI::line( '' );
		WP_CLI::line( sprintf( '✅ Rolled back %d record(s)', $rolled_back ) );

		if ( $dry_run ) {
			WP_CLI::warning( 'This was a DRY RUN. No changes were made.' );
		} else {
			WP_CLI::success( 'Rollback completed!' );
		}
	}
}

// Register the command
WP_CLI::add_command( 'octo-migrate', 'Design_Data_Migration_Command' );

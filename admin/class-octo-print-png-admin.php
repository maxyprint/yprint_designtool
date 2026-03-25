<?php
if ( ! defined( 'ABSPATH' ) ) exit;

if ( ! class_exists( 'WP_List_Table' ) ) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
}

/**
 * PNG_List_Table — Phase 1 read-only WP_List_Table
 * Columns: design-level + view-level + diagnostic DB Status
 * No file URL, no file path, no filesystem checks
 */
class PNG_List_Table extends WP_List_Table {

    public function get_columns() {
        return array(
            'design_id'        => __( 'Design ID', 'octo-print-designer' ),
            'linked_png_count' => __( 'Linked PNGs', 'octo-print-designer' ),
            'design_name'      => __( 'Design Name', 'octo-print-designer' ),
            'user'             => __( 'Owner', 'octo-print-designer' ),
            'template'         => __( 'Template', 'octo-print-designer' ),
            'view_name'        => __( 'View', 'octo-print-designer' ),
            'view_id'          => __( 'View ID', 'octo-print-designer' ),
            'png_generated_at' => __( 'Generated', 'octo-print-designer' ),
            'save_type'        => __( 'Save Type', 'octo-print-designer' ),
            'png_size_kb'      => __( 'Size in DB', 'octo-print-designer' ),
            'db_status'        => __( 'DB Status', 'octo-print-designer' ),
            'png_preview'      => __( 'Preview', 'octo-print-designer' ),
        );
    }

    public function get_sortable_columns() {
        return array(
            'design_id'        => array( 'design_id', true ),
            'design_name'      => array( 'design_name', false ),
            'png_generated_at' => array( 'png_generated_at', false ),
        );
    }

    protected function column_default( $item, $column_name ) {
        switch ( $column_name ) {
            case 'design_id':
                return esc_html( $item->design_id )
                    . ' <a href="#raw-png-records" style="font-size:11px;">[PNG Records ↓]</a>';
            case 'design_name':
                return esc_html( $item->design_name ?: '—' );
            case 'user':
                $user = get_userdata( $item->user_id );
                return $user ? esc_html( $user->display_name ) : '—';
            case 'template':
                return $item->template_id
                    ? esc_html( get_the_title( $item->template_id ) ?: '#' . $item->template_id )
                    : '—';
            case 'view_name':
                return $item->view_name !== null ? esc_html( $item->view_name ) : '—';
            case 'view_id':
                return $item->view_id !== null ? esc_html( $item->view_id ) : '—';
            case 'png_generated_at':
                return $item->png_generated_at ? esc_html( $item->png_generated_at ) : '—';
            case 'save_type':
                return $item->save_type ? esc_html( $item->save_type ) : '—';
            case 'linked_png_count':
                return $item->linked_png_count > 0
                    ? esc_html( $item->linked_png_count )
                    : '<span style="color:#999;">0</span>';
            case 'png_size_kb':
                if ( $item->png_record_id === null ) return '—';
                return $item->png_size_bytes > 0
                    ? esc_html( round( $item->png_size_bytes / 1024, 1 ) ) . ' KB'
                    : '0 KB';
            default:
                return '';
        }
    }

    protected function column_db_status( $item ) {
        if ( $item->png_record_id === null ) {
            return '<span style="color:#999;" title="No print PNG record in database">—</span>';
        }
        if ( $item->png_size_bytes > 0 ) {
            return '<span style="color:#46b450;" title="Binary PNG present in database">&#10003; Has data</span>';
        }
        return '<span style="color:#dc3232;" title="Record exists but binary data is empty">&#9888; Empty record</span>';
    }

    protected function column_png_preview( $item ) {
        if ( $item->png_record_id === null || $item->png_size_bytes === 0 ) {
            return '<span style="color:#999;">—</span>';
        }
        $url = add_query_arg( array(
            'action' => 'yprint_admin_preview_png',
            'png_id' => absint( $item->png_record_id ),
            'nonce'  => wp_create_nonce( 'yprint_preview_png' ),
        ), admin_url( 'admin-ajax.php' ) );
        return '<a href="' . esc_url( $url ) . '" target="_blank">View PNG</a>';
    }

    public function prepare_items() {
        $per_page     = 50;
        $current_page = $this->get_pagenum();

        $args = array(
            'orderby'       => sanitize_key( $_GET['orderby'] ?? 'design_id' ),
            'order'         => strtoupper( sanitize_key( $_GET['order'] ?? 'DESC' ) ) === 'ASC' ? 'ASC' : 'DESC',
            'paged'         => $current_page,
            'per_page'      => $per_page,
            'filter_user'   => absint( $_GET['filter_user'] ?? 0 ),
            'filter_view'   => sanitize_text_field( $_GET['filter_view'] ?? '' ),
            'filter_status' => sanitize_key( $_GET['filter_status'] ?? '' ),
        );

        $this->set_pagination_args( array(
            'total_items' => $this->get_png_records_count( $args ),
            'per_page'    => $per_page,
        ) );

        $this->_column_headers = array( $this->get_columns(), array(), $this->get_sortable_columns() );
        $this->items = $this->get_png_records( $args );
    }

    private function build_where( $args ) {
        $where  = array( '1=1' );
        $params = array();

        if ( ! empty( $args['filter_user'] ) ) {
            $where[]  = 'd.user_id = %d';
            $params[] = $args['filter_user'];
        }
        if ( ! empty( $args['filter_view'] ) ) {
            $where[]  = 'p.view_name = %s';
            $params[] = $args['filter_view'];
        }
        if ( $args['filter_status'] === 'has_data' ) {
            $where[] = 'p.id IS NOT NULL AND LENGTH(p.print_png) > 0';
        } elseif ( $args['filter_status'] === 'empty' ) {
            $where[] = 'p.id IS NOT NULL AND (p.print_png IS NULL OR LENGTH(p.print_png) = 0)';
        } elseif ( $args['filter_status'] === 'missing' ) {
            $where[] = 'p.id IS NULL';
        }

        return array( $where, $params );
    }

    private function get_png_records( $args ) {
        global $wpdb;
        $designs_table = $wpdb->prefix . 'octo_user_designs';
        $pngs_table    = $wpdb->prefix . 'yprint_design_pngs';

        list( $where, $params ) = $this->build_where( $args );

        $allowed_orderby = array( 'design_id', 'design_name', 'png_generated_at' );
        $orderby = in_array( $args['orderby'], $allowed_orderby, true ) ? $args['orderby'] : 'design_id';
        $order   = $args['order'];
        $offset  = ( $args['paged'] - 1 ) * $args['per_page'];

        $sql = "
            SELECT
                d.id            AS design_id,
                d.name          AS design_name,
                d.user_id,
                d.template_id,
                d.created_at    AS design_created_at,
                p.id            AS png_record_id,
                p.view_id,
                p.view_name,
                p.generated_at  AS png_generated_at,
                p.save_type,
                LENGTH(p.print_png) AS png_size_bytes,
                (SELECT COUNT(*)
                 FROM {$pngs_table} pcount
                 WHERE pcount.design_id = CAST(d.id AS CHAR)) AS linked_png_count
            FROM {$designs_table} d
            LEFT JOIN {$pngs_table} p ON CAST(p.design_id AS UNSIGNED) = d.id
            WHERE " . implode( ' AND ', $where ) . "
            ORDER BY {$orderby} {$order}
            LIMIT %d OFFSET %d
        ";

        $params[] = $args['per_page'];
        $params[] = $offset;

        return $wpdb->get_results( $wpdb->prepare( $sql, $params ) );
    }

    private function get_png_records_count( $args ) {
        global $wpdb;
        $designs_table = $wpdb->prefix . 'octo_user_designs';
        $pngs_table    = $wpdb->prefix . 'yprint_design_pngs';

        list( $where, $params ) = $this->build_where( $args );

        $sql = "
            SELECT COUNT(*)
            FROM {$designs_table} d
            LEFT JOIN {$pngs_table} p ON CAST(p.design_id AS UNSIGNED) = d.id
            WHERE " . implode( ' AND ', $where );

        return (int) ( empty( $params )
            ? $wpdb->get_var( $sql )
            : $wpdb->get_var( $wpdb->prepare( $sql, $params ) ) );
    }

    protected function extra_tablenav( $which ) {
        if ( $which !== 'top' ) return;
        global $wpdb;

        $designs_table = $wpdb->prefix . 'octo_user_designs';
        $pngs_table    = $wpdb->prefix . 'yprint_design_pngs';

        $filter_user   = absint( $_GET['filter_user'] ?? 0 );
        $filter_view   = sanitize_text_field( $_GET['filter_view'] ?? '' );
        $filter_status = sanitize_key( $_GET['filter_status'] ?? '' );

        // User filter: distinct user_ids from designs table
        $user_ids  = $wpdb->get_col( "SELECT DISTINCT user_id FROM {$designs_table} ORDER BY user_id ASC" );

        // View name filter: distinct view names from pngs table
        $view_names = $wpdb->get_col( "SELECT DISTINCT view_name FROM {$pngs_table} WHERE view_name IS NOT NULL ORDER BY view_name ASC" );

        echo '<div class="alignleft actions">';

        // User dropdown
        echo '<select name="filter_user">';
        echo '<option value="0">' . esc_html__( 'All Users', 'octo-print-designer' ) . '</option>';
        foreach ( $user_ids as $uid ) {
            $user = get_userdata( $uid );
            $label = $user ? $user->display_name . ' (#' . $uid . ')' : '#' . $uid;
            printf(
                '<option value="%d"%s>%s</option>',
                (int) $uid,
                selected( $filter_user, $uid, false ),
                esc_html( $label )
            );
        }
        echo '</select>';

        // View name dropdown
        echo '<select name="filter_view">';
        echo '<option value="">' . esc_html__( 'All Views', 'octo-print-designer' ) . '</option>';
        foreach ( $view_names as $vn ) {
            printf(
                '<option value="%s"%s>%s</option>',
                esc_attr( $vn ),
                selected( $filter_view, $vn, false ),
                esc_html( $vn )
            );
        }
        echo '</select>';

        // DB Status dropdown
        echo '<select name="filter_status">';
        echo '<option value="">'           . esc_html__( 'All Statuses',   'octo-print-designer' ) . '</option>';
        echo '<option value="has_data"'  . selected( $filter_status, 'has_data', false ) . '>' . esc_html__( '✓ Has Data',     'octo-print-designer' ) . '</option>';
        echo '<option value="empty"'     . selected( $filter_status, 'empty',    false ) . '>' . esc_html__( '⚠ Empty Record', 'octo-print-designer' ) . '</option>';
        echo '<option value="missing"'   . selected( $filter_status, 'missing',  false ) . '>' . esc_html__( '— No Record',    'octo-print-designer' ) . '</option>';
        echo '</select>';

        submit_button( __( 'Filter', 'octo-print-designer' ), 'button', 'filter_action', false );
        echo '</div>';
    }
}

/**
 * PNG_Raw_Records_Table — direct view of wp_yprint_design_pngs, no JOIN.
 * Columns: id, design_id (raw string), view_name, save_type, generated_at, size_kb, preview.
 */
class PNG_Raw_Records_Table extends WP_List_Table {

    public function get_columns() {
        return array(
            'png_id'        => __( 'PNG ID', 'octo-print-designer' ),
            'raw_design_id' => __( 'design_id (raw)', 'octo-print-designer' ),
            'view_name'     => __( 'View', 'octo-print-designer' ),
            'save_type'     => __( 'Save Type', 'octo-print-designer' ),
            'generated_at'  => __( 'Generated', 'octo-print-designer' ),
            'size_kb'       => __( 'Size', 'octo-print-designer' ),
            'preview'       => __( 'Preview', 'octo-print-designer' ),
        );
    }

    public function get_sortable_columns() {
        return array(
            'png_id'       => array( 'id', true ),
            'generated_at' => array( 'generated_at', false ),
            'size_kb'      => array( 'size_bytes', false ),
        );
    }

    protected function column_default( $item, $column_name ) {
        switch ( $column_name ) {
            case 'png_id':
                return esc_html( $item->id );
            case 'raw_design_id':
                return '<span style="font-family:monospace;font-size:11px;word-break:break-all;">'
                    . esc_html( $item->design_id ) . '</span>';
            case 'view_name':
                return $item->view_name !== null ? esc_html( $item->view_name ) : '—';
            case 'save_type':
                return $item->save_type ? esc_html( $item->save_type ) : '—';
            case 'generated_at':
                return $item->generated_at ? esc_html( $item->generated_at ) : '—';
            case 'size_kb':
                return $item->size_bytes > 0
                    ? esc_html( round( $item->size_bytes / 1024, 1 ) ) . ' KB'
                    : '0 KB';
            default:
                return '';
        }
    }

    protected function column_preview( $item ) {
        if ( empty( $item->size_bytes ) ) {
            return '<span style="color:#999;">—</span>';
        }
        $url = add_query_arg( array(
            'action' => 'yprint_admin_preview_png',
            'png_id' => absint( $item->id ),
            'nonce'  => wp_create_nonce( 'yprint_preview_png' ),
        ), admin_url( 'admin-ajax.php' ) );
        return '<a href="' . esc_url( $url ) . '" target="_blank">View PNG</a>';
    }

    public function prepare_items() {
        $search = sanitize_text_field( $_GET['raw_search'] ?? '' );
        $this->_column_headers = array( $this->get_columns(), array(), $this->get_sortable_columns() );
        $this->items = $this->get_raw_records( $search );
    }

    private function get_raw_records( $search ) {
        global $wpdb;
        $table = $wpdb->prefix . 'yprint_design_pngs';

        if ( $search !== '' ) {
            return $wpdb->get_results( $wpdb->prepare(
                "SELECT id, design_id, view_name, save_type, generated_at,
                        LENGTH(print_png) AS size_bytes
                 FROM {$table}
                 WHERE design_id LIKE %s
                 ORDER BY generated_at DESC
                 LIMIT 100",
                '%' . $wpdb->esc_like( $search ) . '%'
            ) );
        }

        return $wpdb->get_results(
            "SELECT id, design_id, view_name, save_type, generated_at,
                    LENGTH(print_png) AS size_bytes
             FROM {$table}
             ORDER BY generated_at DESC
             LIMIT 100"
        );
    }

    protected function extra_tablenav( $which ) {
        if ( $which !== 'top' ) return;
        $search = esc_attr( sanitize_text_field( $_GET['raw_search'] ?? '' ) );
        echo '<div class="alignleft actions">';
        echo '<input type="text" name="raw_search" value="' . $search . '" '
            . 'placeholder="' . esc_attr__( 'Search design_id…', 'octo-print-designer' ) . '" '
            . 'style="width:300px;" />';
        submit_button( __( 'Search', 'octo-print-designer' ), 'button', 'raw_search_submit', false );
        echo '</div>';
    }
}

/**
 * Octo_Print_PNG_Admin — render callback only.
 * Submenu registration lives in class-octo-print-designer-settings.php::add_api_admin_menu()
 */
class Octo_Print_PNG_Admin {

    public function render_page() {
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( __( 'You do not have permission to access this page.', 'octo-print-designer' ) );
        }

        $table = new PNG_List_Table();
        $table->prepare_items();

        $raw_table = new PNG_Raw_Records_Table();
        $raw_table->prepare_items();
        ?>
        <div class="wrap">
            <h1><?php esc_html_e( 'PNG Manager', 'octo-print-designer' ); ?></h1>
            <p style="color:#666;">
                <?php esc_html_e( 'Read-only view. Design-level columns: ID, Name, Owner, Template. View-level columns: View, View ID, Generated, Save Type, Size in DB, DB Status. Linked PNGs counts only numerically-linked PNG records (direct design ID match).', 'octo-print-designer' ); ?>
            </p>
            <form method="get">
                <input type="hidden" name="page" value="octo-png-manager" />
                <?php $table->display(); ?>
            </form>

            <hr style="margin:30px 0;" />

            <h2 id="raw-png-records"><?php esc_html_e( 'PNG Records (Direct)', 'octo-print-designer' ); ?></h2>
            <p style="color:#666;">
                <?php esc_html_e( 'Direct view of wp_yprint_design_pngs — no join. Shows up to 100 records. Use search to filter by design_id string.', 'octo-print-designer' ); ?>
            </p>
            <form method="get">
                <input type="hidden" name="page" value="octo-png-manager" />
                <?php $raw_table->display(); ?>
            </form>

            <hr style="margin:30px 0;" />

            <h2 id="discover-pngs-by-order"><?php esc_html_e( 'Discover PNGs by Order', 'octo-print-designer' ); ?></h2>
            <p style="color:#666;">
                <?php esc_html_e( 'Enter a WooCommerce Order ID to find all PNG files associated with that order.', 'octo-print-designer' ); ?>
            </p>
            <div style="margin-bottom:16px;">
                <input type="number" id="png-discover-order-id" min="1" step="1"
                       placeholder="<?php esc_attr_e( 'Order ID…', 'octo-print-designer' ); ?>"
                       style="width:180px; margin-right:8px;" />
                <button type="button" id="png-discover-btn" class="button button-primary">
                    <?php esc_html_e( 'Discover PNGs', 'octo-print-designer' ); ?>
                </button>
            </div>
            <div id="png-discover-result" style="padding:12px; background:#f8f9fa; border:1px solid #ddd; border-radius:4px; min-height:40px; color:#666;">
                <?php esc_html_e( 'Enter an order ID above and click Discover PNGs.', 'octo-print-designer' ); ?>
            </div>

            <script>
            (function () {
                function escapeHtml(str) {
                    return String(str)
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#39;');
                }

                async function yprintDiscoverPNGsForOrder() {
                    var container = document.getElementById('png-discover-result');
                    var input     = document.getElementById('png-discover-order-id');
                    var orderId   = input ? input.value.trim() : '';

                    if (!orderId || isNaN(parseInt(orderId, 10)) || parseInt(orderId, 10) < 1) {
                        container.innerHTML = '<span style="color:#dc3232;"><?php echo esc_js( __( 'Please enter a valid Order ID.', 'octo-print-designer' ) ); ?></span>';
                        return;
                    }

                    if (!window.ajaxurl) {
                        container.innerHTML = '<span style="color:#dc3232;"><?php echo esc_js( __( 'WordPress ajaxurl is not defined. This page may not have loaded correctly.', 'octo-print-designer' ) ); ?></span>';
                        return;
                    }

                    container.innerHTML = '<span style="color:#666;"><?php echo esc_js( __( 'Searching…', 'octo-print-designer' ) ); ?></span>';

                    var formData = new FormData();
                    formData.append('action', 'yprint_discover_png_files');
                    formData.append('identifier', orderId);
                    formData.append('order_id', orderId);
                    formData.append('nonce', '<?php echo esc_js( wp_create_nonce( 'admin' ) ); ?>');

                    try {
                        var response = await fetch(window.ajaxurl, { method: 'POST', body: formData });
                        var data = await response.json();

                        if (data.success && data.data && data.data.png_files && data.data.png_files.length > 0) {
                            var html = '<strong>' + escapeHtml('<?php echo esc_js( __( 'Found', 'octo-print-designer' ) ); ?> ' + data.data.png_files.length + ' <?php echo esc_js( __( 'PNG file(s):', 'octo-print-designer' ) ); ?>') + '</strong>';
                            data.data.png_files.forEach(function (png) {
                                var title = png.view_name
                                    ? escapeHtml(png.view_name) + ': ' + escapeHtml(png.design_name || 'Design #' + png.design_id)
                                    : escapeHtml(png.design_name || 'Design #' + png.design_id);
                                var meta = [];
                                meta.push('Design ID: ' + escapeHtml(String(png.design_id)));
                                if (png.view_id) { meta.push('View ID: ' + escapeHtml(String(png.view_id))); }
                                meta.push('Source: ' + escapeHtml(String(png.source)));
                                if (png.generated_at && png.generated_at !== 'unknown') {
                                    try { meta.push('Generated: ' + escapeHtml(new Date(png.generated_at).toLocaleDateString())); } catch (e) {}
                                }
                                html += '<div style="margin:8px 0;padding:8px;background:#fff;border:1px solid #ddd;border-radius:3px;">';
                                html += '<strong>' + title + '</strong><br>';
                                html += '<small>' + meta.join(' | ') + '</small><br>';
                                html += '<a href="' + escapeHtml(png.print_file_url) + '" target="_blank" rel="noopener noreferrer">View PNG</a>';
                                html += '</div>';
                            });
                            container.innerHTML = html;

                        } else if (data.success && data.data && data.data.files && data.data.files.length > 0) {
                            var html = '<strong>' + escapeHtml('<?php echo esc_js( __( 'Found', 'octo-print-designer' ) ); ?> ' + data.data.files.length + ' <?php echo esc_js( __( 'PNG file(s) (filesystem):', 'octo-print-designer' ) ); ?>') + '</strong>';
                            data.data.files.forEach(function (file) {
                                html += '<div style="margin:8px 0;padding:8px;background:#fff;border:1px solid #ddd;border-radius:3px;">';
                                html += '<strong>' + escapeHtml(file.filename) + '</strong><br>';
                                html += '<small>Design ID: ' + escapeHtml(String(file.matched_identifier)) + ' | Size: ' + escapeHtml((file.size / 1024).toFixed(1)) + ' KB</small><br>';
                                html += '<a href="' + escapeHtml(file.url) + '" target="_blank" rel="noopener noreferrer">View PNG</a>';
                                html += '</div>';
                            });
                            container.innerHTML = html;

                        } else {
                            container.innerHTML = '<span style="color:#dc3232;"><?php echo esc_js( __( 'No PNG files found for Order ID', 'octo-print-designer' ) ); ?> ' + escapeHtml(orderId) + '.</span>';
                        }
                    } catch (e) {
                        container.innerHTML = '<span style="color:#dc3232;"><?php echo esc_js( __( 'Request failed:', 'octo-print-designer' ) ); ?> ' + escapeHtml(e.message) + '</span>';
                    }
                }

                document.addEventListener('DOMContentLoaded', function () {
                    var btn   = document.getElementById('png-discover-btn');
                    var input = document.getElementById('png-discover-order-id');
                    if (btn)   { btn.addEventListener('click', yprintDiscoverPNGsForOrder); }
                    if (input) {
                        input.addEventListener('keydown', function (e) {
                            if (e.key === 'Enter') { e.preventDefault(); yprintDiscoverPNGsForOrder(); }
                        });
                    }
                });
            }());
            </script>
        </div>
        <?php
    }
}

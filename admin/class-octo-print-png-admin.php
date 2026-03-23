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
            'design_name'      => __( 'Design Name', 'octo-print-designer' ),
            'user'             => __( 'Owner', 'octo-print-designer' ),
            'template'         => __( 'Template', 'octo-print-designer' ),
            'view_name'        => __( 'View', 'octo-print-designer' ),
            'view_id'          => __( 'View ID', 'octo-print-designer' ),
            'png_generated_at' => __( 'Generated', 'octo-print-designer' ),
            'save_type'        => __( 'Save Type', 'octo-print-designer' ),
            'png_size_kb'      => __( 'Size in DB', 'octo-print-designer' ),
            'db_status'        => __( 'DB Status', 'octo-print-designer' ),
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
                return esc_html( $item->design_id );
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
                LENGTH(p.print_png) AS png_size_bytes
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
        ?>
        <div class="wrap">
            <h1><?php esc_html_e( 'PNG Manager', 'octo-print-designer' ); ?></h1>
            <p style="color:#666;">
                <?php esc_html_e( 'Read-only view. Design-level columns: ID, Name, Owner, Template. View-level columns: View, View ID, Generated, Save Type, Size in DB, DB Status.', 'octo-print-designer' ); ?>
            </p>
            <form method="get">
                <input type="hidden" name="page" value="octo-png-manager" />
                <?php $table->display(); ?>
            </form>
        </div>
        <?php
    }
}

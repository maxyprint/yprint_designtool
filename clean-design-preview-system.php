<?php
/**
 * 🎨 CLEAN DESIGN PREVIEW SYSTEM
 *
 * Completely rewritten design preview system with clean, working code
 */

// This will replace the entire design preview section

?>

    /**
     * 🎨 DESIGN PREVIEW SYSTEM: Add preview button to WooCommerce order details
     */
    public function add_design_preview_button($order) {
        if (!$order instanceof WC_Order) {
            return;
        }

        $order_id = $order->get_id();

        // Check if order has design items
        $has_design_items = false;
        foreach ($order->get_items() as $item) {
            if ($this->get_design_meta($item, 'design_id')) {
                $has_design_items = true;
                break;
            }
        }

        if (!$has_design_items) {
            return; // No design items, no preview needed
        }

        // Check if we should enable the preview button
        $stored_design_data = get_post_meta($order_id, '_design_data', true);
        $has_design_ids = false;

        foreach ($order->get_items() as $item) {
            if ($this->get_design_meta($item, 'design_id')) {
                $has_design_ids = true;
                break;
            }
        }

        // Enable button if we have design data OR design IDs
        $button_enabled = !empty($stored_design_data) || $has_design_ids;

        ?>
        <div class="design-preview-section" style="margin-top: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background: #f9f9f9;">
            <h3 style="margin: 0 0 15px 0;">
                <span class="dashicons dashicons-visibility" style="font-size: 18px;"></span>
                Design Preview
            </h3>

            <?php if ($button_enabled): ?>
                <button
                    type="button"
                    id="design-preview-btn"
                    class="button button-primary"
                    data-order-id="<?php echo esc_attr($order_id); ?>"
                    aria-label="Open design preview modal"
                >
                    <span class="dashicons dashicons-visibility"></span>
                    View Design Preview
                </button>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
                    Click to view print-ready PNG files for this order
                </p>
            <?php else: ?>
                <button
                    type="button"
                    class="button"
                    disabled
                    title="No design data available for this order"
                >
                    <span class="dashicons dashicons-hidden"></span>
                    No Design Data
                </button>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
                    Design preview is not available for this order
                </p>
            <?php endif; ?>
        </div>

        <!-- Modal for Design Preview -->
        <div id="design-preview-modal" style="
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 999999;
        ">
            <div style="
                position: absolute;
                top: 5%;
                left: 5%;
                width: 90%;
                height: 90%;
                background: white;
                border-radius: 8px;
                overflow: auto;
                padding: 20px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 15px;">
                    <h2 style="margin: 0; color: #23282d;">
                        <span class="dashicons dashicons-visibility"></span>
                        Design Preview - Order #<?php echo esc_html($order_id); ?>
                    </h2>
                    <button
                        type="button"
                        id="close-preview-modal"
                        class="button"
                        style="font-size: 18px; line-height: 1;"
                    >
                        <span class="dashicons dashicons-no-alt"></span>
                    </button>
                </div>

                <!-- Loading State -->
                <div id="design-preview-loading" style="text-align: center; padding: 50px;">
                    <div class="spinner is-active" style="float: none; margin: 0 auto 20px auto;"></div>
                    <p>Loading design preview...</p>
                </div>

                <!-- Content Container -->
                <div id="design-preview-content" style="display: none;">
                    <!-- Content will be loaded here via AJAX -->
                </div>
            </div>
        </div>

        <script type="text/javascript">
        jQuery(document).ready(function($) {
            console.log('🎨 [DESIGN PREVIEW] Initializing clean system...');

            // Preview button click handler
            $('#design-preview-btn').on('click', function() {
                var $button = $(this);
                var orderId = $button.data('order-id');

                console.log('🖼️ [PREVIEW] Opening preview for order:', orderId);

                // Show modal and loading state
                $('#design-preview-modal').show();
                $('#design-preview-loading').show();
                $('#design-preview-content').hide();

                // Get nonce
                var nonce = (typeof octoAdminContext !== 'undefined' && octoAdminContext.nonce)
                    ? octoAdminContext.nonce
                    : '<?php echo wp_create_nonce('design_preview_nonce'); ?>';

                // Make AJAX request
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'octo_load_design_preview',
                        order_id: orderId,
                        nonce: nonce
                    },
                    success: function(response) {
                        console.log('✅ [PREVIEW] Success:', response);

                        $('#design-preview-loading').hide();

                        if (response.success && response.data && response.data.html) {
                            $('#design-preview-content').html(response.data.html).show();
                        } else {
                            $('#design-preview-content').html(
                                '<div style="padding: 20px; text-align: center; color: #d63384;">' +
                                '<h3>⚠️ Preview Error</h3>' +
                                '<p>' + (response.data?.message || 'Failed to load design preview') + '</p>' +
                                '</div>'
                            ).show();
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('❌ [PREVIEW] Error:', {status, error});

                        $('#design-preview-loading').hide();
                        $('#design-preview-content').html(
                            '<div style="padding: 20px; text-align: center; color: #d63384;">' +
                            '<h3>🌐 Network Error</h3>' +
                            '<p>Failed to load preview: ' + error + '</p>' +
                            '</div>'
                        ).show();
                    }
                });
            });

            // Modal close handlers
            $('#close-preview-modal, #design-preview-modal').on('click', function(e) {
                if (e.target === this) {
                    $('#design-preview-modal').hide();
                    $('#design-preview-content').empty();
                }
            });

            console.log('✅ [DESIGN PREVIEW] System initialized successfully');
        });
        </script>

        <?php
    }

    /**
     * 🎨 DESIGN PREVIEW SYSTEM: AJAX handler to load and display print PNG files
     */
    public function ajax_load_design_preview() {
        // Security check
        $nonce_valid = false;
        if (isset($_POST['nonce'])) {
            $nonce_valid = wp_verify_nonce($_POST['nonce'], 'design_preview_nonce') ||
                          wp_verify_nonce($_POST['nonce'], 'admin_design_preview_nonce');
        }

        if (!$nonce_valid) {
            wp_send_json_error(['message' => 'Security check failed']);
            return;
        }

        $order_id = intval($_POST['order_id']);
        if (!$order_id) {
            wp_send_json_error(['message' => 'Invalid order ID']);
            return;
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            wp_send_json_error(['message' => 'Order not found']);
            return;
        }

        try {
            // Get print files from database
            global $wpdb;
            $design_table = $wpdb->prefix . 'octo_user_designs';

            $print_files = [];
            $files_count = 0;

            foreach ($order->get_items() as $item_id => $item) {
                $design_id = $this->get_design_meta($item, 'design_id');

                if ($design_id) {
                    $design_data = $wpdb->get_row($wpdb->prepare(
                        "SELECT name, print_file_path, print_file_url FROM {$design_table} WHERE id = %d",
                        $design_id
                    ));

                    if ($design_data && $design_data->print_file_url) {
                        $print_files[] = [
                            'design_id' => $design_id,
                            'name' => $design_data->name,
                            'url' => $design_data->print_file_url,
                            'path' => $design_data->print_file_path,
                            'item_name' => $item->get_name()
                        ];
                        $files_count++;
                    }
                }
            }

            if (empty($print_files)) {
                wp_send_json_error(['message' => 'No PNG files found for this order']);
                return;
            }

            // Generate HTML for the preview
            $html = '<div class="design-preview-container">';
            $html .= '<h3 style="margin: 0 0 20px 0; color: #23282d;">Print-Ready Files (' . $files_count . ' files)</h3>';

            foreach ($print_files as $file) {
                $html .= '<div style="margin-bottom: 30px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">';
                $html .= '<div style="padding: 15px; background: #f8f9fa; border-bottom: 1px solid #ddd;">';
                $html .= '<h4 style="margin: 0; color: #495057;">' . esc_html($file['name']) . '</h4>';
                $html .= '<p style="margin: 5px 0 0 0; color: #6c757d; font-size: 12px;">Item: ' . esc_html($file['item_name']) . ' | Design ID: ' . esc_html($file['design_id']) . '</p>';
                $html .= '</div>';
                $html .= '<div style="padding: 20px; text-align: center; background: white;">';
                $html .= '<img src="' . esc_url($file['url']) . '" style="max-width: 100%; height: auto; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" alt="Design Preview" />';
                $html .= '<div style="margin-top: 15px;">';
                $html .= '<a href="' . esc_url($file['url']) . '" target="_blank" class="button button-primary" style="margin-right: 10px;">📁 Open Full Size</a>';
                $html .= '<a href="' . esc_url($file['url']) . '" download class="button">💾 Download PNG</a>';
                $html .= '</div>';
                $html .= '</div>';
                $html .= '</div>';
            }

            $html .= '</div>';

            wp_send_json_success([
                'html' => $html,
                'print_files' => $print_files,
                'files_count' => $files_count,
                'order_info' => [
                    'id' => $order_id,
                    'number' => $order->get_order_number(),
                    'customer' => $order->get_formatted_billing_full_name()
                ],
                'message' => "Found {$files_count} print-ready PNG files"
            ]);

        } catch (Exception $e) {
            wp_send_json_error(['message' => 'Error loading preview: ' . $e->getMessage()]);
        }
    }
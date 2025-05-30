<?php
/**
 * Printing Provider Order Email
 *
 * This template defines the email sent to printing providers
 *
 * @package Octo_Print_Designer
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=<?php bloginfo('charset'); ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?php echo get_bloginfo('name'); ?></title>
    <style type="text/css">
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #e5e5e5;
            border-radius: 4px;
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        .logo img {
            max-width: 200px;
            height: auto;
        }
        h1 {
            font-size: 24px;
            font-weight: 600;
            text-align: center;
            margin: 0 0 20px 0;
        }
        .design-details {
            margin: 30px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 4px;
        }
        .design-preview {
            margin: 20px 0;
            text-align: center;
        }
        .design-preview img {
            max-width: 100%;
            height: auto;
            border: 1px solid #ddd;
        }
        .design-files {
            margin: 20px 0;
        }
        .design-file {
            margin-bottom: 10px;
            padding: 10px;
            background-color: #f0f0f0;
            border-radius: 4px;
        }
        .design-file a {
            color: #0073aa;
            text-decoration: none;
        }
        .dimensions {
            font-weight: bold;
            margin: 15px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #777;
            font-size: 12px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="logo">
            <img src="<?php echo esc_url(get_site_url() . '/wp-content/plugins/octo-print-designer/public/img/yprint-logo.svg'); ?>" alt="yprint">
        </div>
        
        <h1>New yprint Order</h1>
        
        <p>Hi <?php echo isset($provider_name) ? esc_html($provider_name) : ''; ?>,</p>
        
        <p>A new order has been placed that requires printing. Order details are below:</p>
        
        <div class="order-details">
            <p><strong>Order #:</strong> <?php echo esc_html($order->get_order_number()); ?></p>
            <p><strong>Date:</strong> <?php echo esc_html(wc_format_datetime($order->get_date_created())); ?></p>
        </div>
        
        <div class="design-details">
            <?php foreach ($design_items as $item) : ?>
                <h3>Product: <?php echo esc_html($item['name']); ?></h3>
                
                <p>
                    <strong>Variation:</strong> <?php echo esc_html($item['variation_name']); ?><br>
                    <strong>Size:</strong> <?php echo esc_html($item['size_name']); ?>
                </p>
                
                <div class="dimensions">
                    <p>Print Dimensions: <?php echo esc_html($item['width_cm']); ?>cm × <?php echo esc_html($item['height_cm']); ?>cm</p>
                </div>
                
                <div class="design-preview">
                    <h4>Design Previews</h4>
                    <?php 

                    // Check if we have product images with view information
                    $product_images = isset($item['product_images']) ? $item['product_images'] : null;
                    if (!empty($product_images) && is_array($product_images)) {
                        foreach ($product_images as $image) {
                            if (isset($image['url']) && !empty($image['url'])) {
                                $view_name = isset($image['view_name']) && !empty($image['view_name']) 
                                    ? $image['view_name'] 
                                    : (isset($image['view_id']) ? __('View', 'octo-print-designer') . ' ' . $image['view_id'] : __('Additional View', 'octo-print-designer'));
                                
                                $previews[] = array(
                                    'url' => $image['url'],
                                    'view_name' => $view_name
                                );
                            }
                        }
                    }
                    
                    // Display all previews
                    if (!empty($previews)) :
                        foreach ($previews as $preview) : ?>
                            <div style="margin-bottom: 15px; border: 1px solid #eee; padding: 10px; border-radius: 4px; background-color: #ffffff;">
                                <strong><?php echo esc_html($preview['view_name']); ?></strong>
                                <img src="<?php echo esc_url($preview['url']); ?>" alt="<?php echo esc_attr($preview['view_name']); ?>" style="max-width: 100%; display: block; margin-top: 5px;">
                            </div>
                        <?php endforeach;
                    else : ?>
                        <p><?php _e('No preview images available', 'octo-print-designer'); ?></p>
                    <?php endif; ?>
                </div>
                
                <div class="design-files">
                    <h4>Design Files:</h4>
                    <?php if (!empty($item['design_images']) && is_array($item['design_images'])) : ?>
                        <?php foreach ($item['design_images'] as $image) : ?>
                            <div class="design-file">
                                <strong><?php echo isset($image['view_name']) ? esc_html($image['view_name']) : 'Design File'; ?></strong>
                                <br>
                                <a href="<?php echo esc_url($image['url']); ?>" target="_blank">
                                    Download Original File
                                </a>
                                <?php if (isset($image['width_cm']) && isset($image['height_cm'])) : ?>
                                    <br>
                                    <small>
                                        Size: <?php echo esc_html($image['width_cm']); ?>cm × <?php echo esc_html($image['height_cm']); ?>cm
                                    </small>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                    <?php else : ?>
                        <div class="design-file">
                            <a href="<?php echo esc_url($item['design_image_url']); ?>" target="_blank">
                                Download Original File
                            </a>
                        </div>
                    <?php endif; ?>
                </div>
                
                <hr style="margin: 30px 0; border: 0; border-top: 1px dashed #ccc;">
            <?php endforeach; ?>
        </div>
        
        <?php if (!empty($additional_notes)) : ?>
            <div class="additional-notes">
                <h4>Additional Notes:</h4>
                <p><?php echo wp_kses_post($additional_notes); ?></p>
            </div>
        <?php endif; ?>
        
        <div class="footer">
            © <?php echo date('Y'); ?> <a href="<?php echo esc_url(home_url()); ?>">yprint</a> – Alle Rechte vorbehalten.
        </div>
    </div>
</body>
</html>
<?php
class Octo_Print_Designer_Settings {
    private static $instance;
    private $options;
    private $option_name = 'octo_print_designer_settings';

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->options = get_option($this->option_name, array());
        
        add_action('admin_menu', array($this, 'add_plugin_page'));
        add_action('admin_init', array($this, 'page_init'));
    }

    public function add_plugin_page() {
        add_menu_page(
            'Print Designer Settings',
            'Print Designer',
            'manage_options',
            'octo-print-designer',
            array($this, 'create_admin_page'),
            'dashicons-art',
            20
        );
    }

    public function create_admin_page() {
        ?>
        <div class="wrap">
            <h2>Print Designer Settings</h2>
            <form method="post" action="options.php">
                <?php
                settings_fields('octo_print_designer_group');
                do_settings_sections('octo-print-designer-settings');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }

    public function page_init() {
        register_setting(
            'octo_print_designer_group',
            $this->option_name,
            array($this, 'sanitize')
        );

        add_settings_section(
            'octo_print_designer_general_section',
            'General Settings',
            array($this, 'print_section_info'),
            'octo-print-designer-settings'
        );

        add_settings_field(
            'redirect_slug',
            'Redirect Slug',
            array($this, 'redirect_slug_callback'),
            'octo-print-designer-settings',
            'octo_print_designer_general_section'
        );

        add_settings_field(
            'login_url',
            'Login URL',
            array($this, 'login_url_callback'),
            'octo-print-designer-settings',
            'octo_print_designer_general_section'
        );

        add_settings_field(
            'dpi',
            'Default DPI',
            array($this, 'dpi_callback'),
            'octo-print-designer-settings',
            'octo_print_designer_general_section'
        );

        add_settings_section(
            'octo_print_designer_wc_section',
            'WooCommerce Integration',
            array($this, 'print_wc_section_info'),
            'octo-print-designer-settings'
        );

        // Add base product setting
        add_settings_field(
            'base_product_id',
            'Base Product ID',
            array($this, 'base_product_id_callback'),
            'octo-print-designer-settings',
            'octo_print_designer_wc_section'
        );
    }

    public function sanitize($input) {
        $new_input = array();

        if (isset($input['redirect_slug'])) {
            $new_input['redirect_slug'] = sanitize_text_field($input['redirect_slug']);
        }

        if (isset($input['login_url'])) {
            $new_input['login_url'] = esc_url_raw($input['login_url']);
        }

        if (isset($input['dpi'])) {
            $new_input['dpi'] = absint($input['dpi']);
            if ($new_input['dpi'] < 72) { // Minimum standard screen DPI
                $new_input['dpi'] = 72;
            }
        }

        if (isset($input['base_product_id'])) {
            $product_id = absint($input['base_product_id']);
            
            // Verify product exists and is valid
            if ($product_id) {
                $product = wc_get_product($product_id);
                if (!$product) {
                    add_settings_error(
                        'base_product_id',
                        'invalid_product',
                        __('The specified product ID does not exist.', 'octo-print-designer')
                    );
                } else {
                    $new_input['base_product_id'] = $product_id;
                }
            }
        }

        return $new_input;
    }

    public function print_section_info() {
        print 'Enter your settings below:';
    }

    public function print_wc_section_info() {
        echo '<p>' . esc_html__('Configure WooCommerce integration settings for Print Designer.', 'octo-print-designer') . '</p>';
    }

    public function redirect_slug_callback() {
        $value = isset($this->options['redirect_slug']) ? esc_attr($this->options['redirect_slug']) : 'my-account';
        printf(
            '<input type="text" id="redirect_slug" name="%s[redirect_slug]" value="%s" /><p class="description">The slug to redirect to after saving a design (e.g., my-account)</p>',
            esc_attr($this->option_name),
            $value
        );
    }

    public function login_url_callback() {
        $value = isset($this->options['login_url']) ? esc_attr($this->options['login_url']) : wp_login_url();
        printf(
            '<input type="text" id="login_url" name="%s[login_url]" value="%s" class="regular-text" /><p class="description">%s</p>',
            esc_attr($this->option_name),
            $value,
            esc_html__('The URL where users will be redirected to login (e.g., /wp-login.php)', 'octo-print-designer')
        );
    }

    public function dpi_callback() {
        $value = isset($this->options['dpi']) ? absint($this->options['dpi']) : 300;
        printf(
            '<input type="number" id="dpi" name="%s[dpi]" value="%s" min="72" step="1" class="small-text" /><p class="description">%s</p>',
            esc_attr($this->option_name),
            $value,
            esc_html__('The DPI (Dots Per Inch) used for pixel to centimeter conversion. Standard print quality is 300 DPI.', 'octo-print-designer')
        );
    }

    public function base_product_id_callback() {
        $value = isset($this->options['base_product_id']) ? absint($this->options['base_product_id']) : '';
        
        // Get product title if ID exists
        $product_title = '';
        if ($value) {
            $product = wc_get_product($value);
            if ($product) {
                $product_title = $product->get_title();
            }
        }

        printf(
            '<input type="number" id="base_product_id" name="%s[base_product_id]" value="%s" class="regular-text" />',
            esc_attr($this->option_name),
            esc_attr($value)
        );

        if ($product_title) {
            printf(
                '<p class="description">%s: %s</p>',
                esc_html__('Current product', 'octo-print-designer'),
                esc_html($product_title)
            );
        }

        printf(
            '<p class="description">%s</p>',
            esc_html__('Enter the ID of the WooCommerce product to use as the base for print designs.', 'octo-print-designer')
        );
    }

    public static function get_redirect_slug() {
        $instance = self::get_instance();
        return isset($instance->options['redirect_slug']) ? $instance->options['redirect_slug'] : 'my-account';
    }

    public static function get_login_url() {
        $instance = self::get_instance();
        return isset($instance->options['login_url']) ? $instance->options['login_url'] : wp_login_url();
    }

    public static function get_dpi() {
        $instance = self::get_instance();
        return isset($instance->options['dpi']) ? absint($instance->options['dpi']) : 300;
    }

    public static function get_base_product_id() {
        $instance = self::get_instance();
        return isset($instance->options['base_product_id']) ? absint($instance->options['base_product_id']) : 0;
    }
}
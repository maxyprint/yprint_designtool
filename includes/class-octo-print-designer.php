<?php
class Octo_Print_Designer {
    protected $loader;
    protected $plugin_name;
    protected $version;
    protected $wc_integration;
    protected $api_integration;

    public function __construct() {
        $this->version = OCTO_PRINT_DESIGNER_VERSION;
        $this->plugin_name = 'octo-print-designer';
        
        $this->load_dependencies();

        new Octo_Print_Designer_User_Images();
        $this->wc_integration = Octo_Print_Designer_WC_Integration::get_instance();
        $this->api_integration = Octo_Print_API_Integration::get_instance();

        $plugin_admin = new Octo_Print_Designer_Admin($this->plugin_name, $this->version);
        $plugin_public = new Octo_Print_Designer_Public($this->plugin_name, $this->version);
    }

    private function load_dependencies() {
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-octo-print-designer-loader.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-octo-print-designer-user-images.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-octo-print-designer-wc-integration.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-octo-print-api-integration.php';

        // 🧠 Agent Implementation: Measurement Database Classes
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-template-measurement-manager.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-measurement-validation-framework.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-measurement-migration-script.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-template-sizes-integration-tester.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-deployment-readiness-certification.php';

        require_once plugin_dir_path(dirname(__FILE__)) . 'admin/class-octo-print-designer-template.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'admin/class-octo-print-designer-admin.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'admin/class-octo-print-designer-settings.php';

        require_once plugin_dir_path(dirname(__FILE__)) . 'public/class-octo-print-designer-public.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'public/class-octo-print-designer-designer.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'public/class-octo-print-designer-products.php';

        $this->loader = new Octo_Print_Designer_Loader();
        Octo_Print_Designer_Settings::get_instance();

    }

    public function run() {
        $this->loader->run();
    }
}
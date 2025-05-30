<?php

/**
 * Handles user image management for the Print Designer plugin
 *
 * @link       https://octonove.com
 * @since      1.0.0
 *
 * @package    Octo_Print_Designer
 * @subpackage Octo_Print_Designer/includes
 */

class Octo_Print_Designer_User_Images {

    public static $instance;
    /**
     * Maximum number of images allowed per user for the gallery type
     */
    const MAX_IMAGES_PER_USER = 20;

    /**
     * Maximum file size in bytes (5MB)
     */
    const MAX_FILE_SIZE = 5242880;

    /**
     * Allowed mime types
     */
    private $allowed_mime_types = array(
        'image/jpeg' => 'jpg',
        'image/png'  => 'png'
    );

    /**
     * Base upload directory path
     */
    private $base_upload_dir;

    /**
     * Table name for storing image data
     */
    private $table_name;

    /**
     * Initialize the class
     */
    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'octo_user_images';
        
        $wp_upload_dir = wp_upload_dir();
        $this->base_upload_dir = $wp_upload_dir['basedir'] . '/octo-print-designer/user-images';
        
        // Create base directory if it doesn't exist
        if (!file_exists($this->base_upload_dir)) {
            wp_mkdir_p($this->base_upload_dir);

            // Create .htaccess to prevent direct access
            // $htaccess_content = "Options -Indexes\nDeny from all";
            // file_put_contents($this->base_upload_dir . '/.htaccess', $htaccess_content);
        }

        self::$instance = $this;
    }

    /**
     * Create the database table on plugin activation
     */
    public static function create_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'octo_user_images';
        
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            image_id varchar(32) NOT NULL,
            filename varchar(255) NOT NULL,
            file_path varchar(255) NOT NULL,
            file_url varchar(255) NOT NULL,
            image_type enum('gallery', 'design') NOT NULL DEFAULT 'gallery',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY user_id (user_id),
            KEY image_id (image_id),
            KEY image_type (image_type)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    /**
     * Save user uploaded image
     *
     * @param array  $file    The uploaded file data ($_FILES array item)
     * @param int    $user_id WordPress user ID
     * @return array|WP_Error Array with file info on success, WP_Error on failure
     */
    public function save_image($file, $user_id, $image_type = 'gallery') {
        // Basic validation
        if (!is_user_logged_in() || get_current_user_id() != $user_id) {
            return new WP_Error('unauthorized', __('Unauthorized access', 'octo-print-designer'));
        }

        // Validate file size
        if ($file['size'] > self::MAX_FILE_SIZE) {
            return new WP_Error('file_size', __('File size exceeds maximum limit of 5MB', 'octo-print-designer'));
        }

        // Check user image quota
        if ($image_type === 'gallery' && $this->get_user_image_count($user_id) >= self::MAX_IMAGES_PER_USER) {
            return new WP_Error('quota_exceeded', __('Maximum number of images reached', 'octo-print-designer'));
        }

        // Validate mime type
        if (!in_array($file['type'], array_keys($this->allowed_mime_types))) {
            return new WP_Error('invalid_type', __('Invalid file type. Only JPG and PNG allowed.', 'octo-print-designer'));
        }

        // Create user directory if it doesn't exist
        $user_dir = $this->get_user_directory($user_id);
        if (!file_exists($user_dir)) {
            wp_mkdir_p($user_dir);
        }

        // Generate unique filename
        $filename = sanitize_file_name($file['name']);
        $filename = wp_unique_filename($user_dir, $filename);
        $file_path = $user_dir . '/' . $filename;

        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $file_path)) {
            return new WP_Error('upload_failed', __('Failed to save image', 'octo-print-designer'));
        }

        // Get relative path for storage
        $wp_upload_dir = wp_upload_dir();
        $relative_path = str_replace($wp_upload_dir['basedir'] . '/', '', $file_path);

        $image_data = array(
            'id' => md5($relative_path), // Unique identifier for the image
            'filename' => $filename,
            'path' => $relative_path,
            'url' => $wp_upload_dir['baseurl'] . '/' . $relative_path
        );

        // Store in database
        $this->store_image_data($image_data, $user_id, $image_type);

        return $image_data;
    }

    /**
     * Delete user image
     *
     * @param string $image_id The image identifier
     * @param int    $user_id  WordPress user ID
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    public function delete_image($image_id, $user_id) {
        // Basic validation
        if (!is_user_logged_in() || get_current_user_id() != $user_id) {
            return new WP_Error('unauthorized', __('Unauthorized access', 'octo-print-designer'));
        }

        // Get image path from ID
        $image_path = $this->get_image_path_by_id($image_id, $user_id);
        if (!$image_path) {
            return new WP_Error('not_found', __('Image not found', 'octo-print-designer'));
        }

        // Verify the file is within user's directory
        $user_dir = $this->get_user_directory($user_id);
        if (strpos($image_path, $user_dir) !== 0) {
            return new WP_Error('unauthorized', __('Unauthorized access', 'octo-print-designer'));
        }

        // Delete the file
        if (!unlink($image_path)) {
            return new WP_Error('delete_failed', __('Failed to delete image', 'octo-print-designer'));
        }

        global $wpdb;
        $wpdb->delete(
            $this->table_name,
            array(
                'image_id' => $image_id,
                'user_id' => $user_id
            ),
            array('%s', '%d')
        );

        return true;
    }

    /**
     * Get number of images for a user
     *
     * @param int $user_id WordPress user ID
     * @return int Number of images
     */
    public function get_user_image_count($user_id, $type = 'gallery') {
        global $wpdb;
        return (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$this->table_name} 
            WHERE user_id = %d AND image_type = %s",
            $user_id,
            $type
        ));
    }

    /**
     * Get user directory path
     *
     * @param int $user_id WordPress user ID
     * @return string Directory path
     */
    private function get_user_directory($user_id) {
        return $this->base_upload_dir . '/' . absint($user_id);
    }

    /**
     * Get image path by ID
     *
     * @param string $image_id The image identifier
     * @param int    $user_id  WordPress user ID
     * @return string|false Full path to image or false if not found
     */
    private function get_image_path_by_id($image_id, $user_id) {
        $user_dir = $this->get_user_directory($user_id);
        if (!file_exists($user_dir)) {
            return false;
        }

        $wp_upload_dir = wp_upload_dir();
        $files = glob($user_dir . '/*');
        
        foreach ($files as $file) {
            $relative_path = str_replace($wp_upload_dir['basedir'] . '/', '', $file);
            if (md5($relative_path) === $image_id) {
                return $file;
            }
        }

        return false;
    }

    /**
     * Store image data in the database
     *
     * @param array $image_data Image information
     * @param int   $user_id    WordPress user ID
     * @return bool|WP_Error True on success, WP_Error on failure
     */
    private function store_image_data($image_data, $user_id, $image_type) {
        global $wpdb;

        $result = $wpdb->insert(
            $this->table_name,
            array(
                'user_id' => $user_id,
                'image_id' => $image_data['id'],
                'filename' => $image_data['filename'],
                'file_path' => $image_data['path'],
                'file_url' => $image_data['url'],
                'image_type' => $image_type
            ),
            array('%d', '%s', '%s', '%s', '%s', '%s')
        );

        if ($result === false) {
            return new WP_Error('db_error', __('Failed to store image data', 'octo-print-designer'));
        }

        return true;
    }

    /**
     * Get all images for a user
     *
     * @param int $user_id WordPress user ID
     * @return array Array of image data
     */
    public function get_user_images($user_id, $type = 'gallery') {
        global $wpdb;
    
        return $wpdb->get_results(
            $wpdb->prepare(
                "SELECT image_id as id, filename, file_path as path, file_url as url, created_at 
                FROM {$this->table_name} 
                WHERE user_id = %d AND image_type = %s
                ORDER BY created_at DESC",
                $user_id,
                $type
            ),
            ARRAY_A
        );
    }

    /**
     * Get single image data
     *
     * @param string $image_id The image identifier
     * @param int    $user_id  WordPress user ID
     * @return array|false Image data or false if not found
     */
    public function get_image_data($image_id, $user_id) {
        global $wpdb;

        $result = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT image_id as id, filename, file_path as path, file_url as url, created_at 
                FROM {$this->table_name} 
                WHERE image_id = %s AND user_id = %d",
                $image_id,
                $user_id
            ),
            ARRAY_A
        );

        return $result ?: false;
    }
}
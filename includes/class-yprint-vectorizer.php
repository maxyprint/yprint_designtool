<?php
/**
 * YPrint Vectorizer Class
 *
 * Diese Klasse stellt Funktionen zur Vektorisierung von Bildern bereit.
 *
 * @package YPrint_DesignTool
 * @subpackage Vectorizer
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Main Vectorizer Class
 */
class YPrint_Vectorizer {
    
    /**
     * Instance of this class
     *
     * @var object
     */
    protected static $instance = null;
    
    /**
     * Default vectorization options
     *
     * @var array
     */
    protected $default_options = array(
        // General options
        'detail_level'       => 'medium',   // low, medium, high
        'invert'             => false,
        'remove_background'  => true,
        
        // Trace options
        'brightness_threshold' => 0.45,
        'turdsize'           => 2,          // Noise removal
        'opticurve'          => true,       // Optimize curves
        'optitolerance'      => 0.2,        // Optimization tolerance
        'alphamax'           => 1.0,        // Corner threshold
        
        // Color options
        'color_type'         => 'mono',     // mono, color, gray
        'colors'             => 8,
        'stack_colors'       => true,
        'smooth_colors'      => false,
    );
    
    /**
     * Get singleton instance
     *
     * @return YPrint_Vectorizer
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
    }
    
    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // AJAX handlers for vectorization
        add_action('wp_ajax_yprint_vectorize_image', array($this, 'ajax_vectorize_image'));
        add_action('wp_ajax_nopriv_yprint_vectorize_image', array($this, 'ajax_vectorize_image'));
    }
    
    /**
     * AJAX handler for image vectorization
     */
    public function ajax_vectorize_image() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'yprint-designtool-nonce')) {
            wp_send_json_error(array('message' => 'Invalid security token'));
            return;
        }
        
        // Check if an image was uploaded
        if (empty($_FILES['image'])) {
            wp_send_json_error(array('message' => 'No image uploaded'));
            return;
        }
        
        $file = $_FILES['image'];
        
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            wp_send_json_error(array(
                'message' => 'Upload error: ' . $this->get_upload_error_message($file['error'])
            ));
            return;
        }
        
        // Check file type
        $allowed_types = array('image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp');
        if (!in_array($file['type'], $allowed_types)) {
            wp_send_json_error(array('message' => 'Invalid file type. Please upload a JPEG, PNG, GIF, BMP, or WebP image.'));
            return;
        }
        
        // Create temporary file
        $upload_dir = wp_upload_dir();
        $temp_dir = $upload_dir['basedir'] . '/yprint-designtool/temp';
        
        if (!file_exists($temp_dir)) {
            wp_mkdir_p($temp_dir);
        }
        
        $temp_file = $temp_dir . '/' . sanitize_file_name($file['name']);
        move_uploaded_file($file['tmp_name'], $temp_file);
        
        // Get vectorization options
        $options = array(
            'detail_level' => isset($_POST['detail_level']) ? sanitize_text_field($_POST['detail_level']) : 'medium',
            'color_type' => isset($_POST['color_type']) ? sanitize_text_field($_POST['color_type']) : 'mono',
            'colors' => isset($_POST['colors']) ? intval($_POST['colors']) : 8,
            'invert' => isset($_POST['invert']) ? (bool) $_POST['invert'] : false,
            'remove_background' => isset($_POST['remove_background']) ? (bool) $_POST['remove_background'] : true,
        );
        
        // Process the image
        $result = $this->vectorize_image($temp_file, $options);
        
        // Clean up temporary file
        @unlink($temp_file);
        
        // Check for errors
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
            return;
        }
        
        // Return success response
        wp_send_json_success(array(
            'svg' => $result['content'],
            'file_url' => $result['file_url']
        ));
    }
    
    /**
     * Vectorize an image
     *
     * @param string $image_path Path to the image file
     * @param array $options Vectorization options
     * @return array|WP_Error Result array or error
     */
    public function vectorize_image($image_path, $options = array()) {
        // Merge with default options
        $options = wp_parse_args($options, $this->default_options);
        
        // Create temp directory for processing
        $upload_dir = wp_upload_dir();
        $temp_dir = $upload_dir['basedir'] . '/yprint-designtool/temp';
        
        if (!file_exists($temp_dir)) {
            wp_mkdir_p($temp_dir);
        }
        
        $temp_base = $temp_dir . '/' . uniqid('vector_');
        $temp_bmp = $temp_base . '.bmp';
        $temp_svg = $temp_base . '.svg';
        
        // Check which method to use for vectorization
        $vectorization_method = $this->determine_vectorization_method();
        
        switch ($vectorization_method) {
            case 'potrace':
                $svg_content = $this->vectorize_with_potrace($image_path, $temp_bmp, $temp_svg, $options);
                break;
                
            case 'internal':
                $svg_content = $this->vectorize_internally($image_path, $options);
                break;
                
            default:
                return new WP_Error('no_vectorization_method', 'No suitable vectorization method available.');
        }
        
        // Clean up temporary files
        @unlink($temp_bmp);
        @unlink($temp_svg);
        
        // If we got a WP_Error, return it
        if (is_wp_error($svg_content)) {
            return $svg_content;
        }
        
        // Generate output file
        $file_info = pathinfo($image_path);
        $result_filename = sanitize_file_name($file_info['filename'] . '.svg');
        $result_dir = $upload_dir['basedir'] . '/yprint-designtool/exports';
        
        if (!file_exists($result_dir)) {
            wp_mkdir_p($result_dir);
        }
        
        $result_file = $result_dir . '/' . $result_filename;
        file_put_contents($result_file, $svg_content);
        
        return array(
            'content' => $svg_content,
            'file_path' => $result_file,
            'file_url' => $upload_dir['baseurl'] . '/yprint-designtool/exports/' . $result_filename
        );
    }
    
    /**
     * Determine the best available vectorization method
     *
     * @return string Method to use ('potrace', 'internal', etc.)
     */
    private function determine_vectorization_method() {
        // Check if potrace is available
        if ($this->check_potrace_exists()) {
            return 'potrace';
        }
        
        // Fallback to internal method
        return 'internal';
    }
    
    /**
     * Check if potrace exists on the server
     *
     * @return bool True if potrace is available
     */
    public function check_potrace_exists() {
        // Check for bundled potrace in plugin
        $plugin_potrace = YPRINT_DESIGNTOOL_PLUGIN_DIR . 'bin/potrace';
        if (file_exists($plugin_potrace) && is_executable($plugin_potrace)) {
            return true;
        }
        
        // Common paths for potrace on various hosting environments
        $common_paths = array(
            '/usr/bin/potrace',
            '/usr/local/bin/potrace',
            '/opt/homebrew/bin/potrace',
            '/homepages/31/d4298451771/htdocs/.local/bin/potrace' // IONOS specific path
        );
        
        foreach ($common_paths as $path) {
            if (file_exists($path) && is_executable($path)) {
                return true;
            }
        }
        
        // Check if potrace exists in system path
        $output = array();
        $return_var = -1;
        
        // Windows and Unix compatible command
        if (function_exists('exec')) {
            @exec('potrace --version 2>&1', $output, $return_var);
            if ($return_var === 0) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Vectorize an image using potrace
     *
     * @param string $image_path Original image path
     * @param string $temp_bmp Temporary BMP file path
     * @param string $temp_svg Temporary SVG output path
     * @param array $options Vectorization options
     * @return string|WP_Error SVG content or error
     */
    private function vectorize_with_potrace($image_path, $temp_bmp, $temp_svg, $options) {
        // Prepare image for potrace (convert to BMP)
        $this->prepare_image_for_potrace($image_path, $temp_bmp, $options);
        
        // Find potrace binary
        $potrace_path = $this->get_potrace_path();
        if (!$potrace_path) {
            return new WP_Error('potrace_not_found', 'Potrace executable not found.');
        }
        
        // Build potrace command
        $command = sprintf(
            '"%s" %s -s -o "%s" "%s"',
            $potrace_path,
            $this->build_potrace_options($options),
            $temp_svg,
            $temp_bmp
        );
        
        // Execute command
        $output = array();
        $return_var = -1;
        
        if (function_exists('exec')) {
            @exec($command, $output, $return_var);
            
            if ($return_var !== 0) {
                return new WP_Error(
                    'potrace_execution_failed', 
                    'Potrace execution failed: ' . implode(' ', $output)
                );
            }
            
            // Check if SVG was created
            if (!file_exists($temp_svg)) {
                return new WP_Error('svg_not_created', 'SVG file was not created.');
            }
            
            // Read SVG content
            $svg_content = file_get_contents($temp_svg);
            
            if (empty($svg_content)) {
                return new WP_Error('empty_svg', 'Generated SVG is empty.');
            }
            
            return $svg_content;
        } else {
            return new WP_Error('exec_disabled', 'PHP exec function is disabled.');
        }
    }
    
    /**
     * Get the path to potrace binary
     *
     * @return string|false Path to potrace or false if not found
     */
    private function get_potrace_path() {
        // Check for bundled potrace
        $plugin_potrace = YPRINT_DESIGNTOOL_PLUGIN_DIR . 'bin/potrace';
        if (file_exists($plugin_potrace) && is_executable($plugin_potrace)) {
            return $plugin_potrace;
        }
        
        // Common paths
        $common_paths = array(
            '/usr/bin/potrace',
            '/usr/local/bin/potrace',
            '/opt/homebrew/bin/potrace',
            '/homepages/31/d4298451771/htdocs/.local/bin/potrace' // IONOS specific path
        );
        
        foreach ($common_paths as $path) {
            if (file_exists($path) && is_executable($path)) {
                return $path;
            }
        }
        
        // Assume potrace is in PATH
        return 'potrace';
    }
    
    /**
     * Build potrace command options
     *
     * @param array $options Vectorization options
     * @return string Command line options string
     */
    private function build_potrace_options($options) {
        $cmd_options = array();
        
        // Optimization
        if ($options['opticurve']) {
            $cmd_options[] = '-O ' . $options['optitolerance'];
        } else {
            $cmd_options[] = '-n';
        }
        
        // Alphamax (corner threshold)
        $cmd_options[] = '-a ' . $options['alphamax'];
        
        // Turdsize (noise removal)
        $cmd_options[] = '-t ' . $options['turdsize'];
        
        // Detail level specific options
        switch ($options['detail_level']) {
            case 'low':
                $cmd_options[] = '-a 2.0 -O 0.8';
                break;
            case 'high':
                $cmd_options[] = '-a 0.5 -O 0.1';
                break;
            case 'ultra':
                $cmd_options[] = '-a 0.2 -O 0.05';
                break;
        }
        
        return implode(' ', $cmd_options);
    }
    
    /**
     * Prepare image for potrace by converting to 1-bit BMP
     *
     * @param string $input_file Input image path
     * @param string $output_file Output BMP path
     * @param array $options Conversion options
     * @return bool Success or failure
     */
    private function prepare_image_for_potrace($input_file, $output_file, $options) {
        // Check if GD is available
        if (!function_exists('imagecreatefromstring')) {
            return false;
        }
        
        // Load image
        $img_string = file_get_contents($input_file);
        if (!$img_string) {
            return false;
        }
        
        $image = imagecreatefromstring($img_string);
        if (!$image) {
            return false;
        }
        
        // Convert to grayscale if needed
        if ($options['color_type'] !== 'color') {
            imagefilter($image, IMG_FILTER_GRAYSCALE);
        }
        
        // Apply threshold for black and white conversion
        $threshold = (int)(255 * $options['brightness_threshold']);
        $width = imagesx($image);
        $height = imagesy($image);
        
        // Create black and white image
        $bw_image = imagecreate($width, $height);
        $white = imagecolorallocate($bw_image, 255, 255, 255);
        $black = imagecolorallocate($bw_image, 0, 0, 0);
        
        // Fill with white
        imagefill($bw_image, 0, 0, $white);
        
        // Apply threshold
        for ($y = 0; $y < $height; $y++) {
            for ($x = 0; $x < $width; $x++) {
                $rgb = imagecolorat($image, $x, $y);
                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;
                
                // Simple grayscale calculation
                $gray = (int)(($r + $g + $b) / 3);
                
                // Set pixel based on threshold and invert option
                if ($gray < $threshold) {
                    imagesetpixel($bw_image, $x, $y, $options['invert'] ? $white : $black);
                } else {
                    imagesetpixel($bw_image, $x, $y, $options['invert'] ? $black : $white);
                }
            }
        }
        
        // Save as BMP
        if (function_exists('imagebmp')) {
            $result = imagebmp($bw_image, $output_file);
        } else {
            // Fallback for older PHP versions without imagebmp
            $result = $this->save_as_bmp($bw_image, $output_file);
        }
        
        // Clean up
        imagedestroy($image);
        imagedestroy($bw_image);
        
        return $result;
    }
    
    /**
     * Fallback function to save an image as BMP
     *
     * @param resource $image GD image resource
     * @param string $filename Output filename
     * @return bool Success or failure
     */
    private function save_as_bmp($image, $filename) {
        $width = imagesx($image);
        $height = imagesy($image);
        
        $bmp = '';
        
        // BMP File Header
        $bmp .= pack('C2S1L1S2', 0x42, 0x4D, 0, 0, 0, 0);
        
        // DIB Header
        $bmp .= pack('L1L2S2L2S2L6', 40, $width, $height, 1, 1, 0, 0, 0, 0, 0, 0);
        
        // Color Palette (2 colors for 1-bit)
        $bmp .= pack('C4C4', 255, 255, 255, 0, 0, 0, 0, 0);
        
        // Calculate row size (must be multiple of 4 bytes)
        $row_size = floor(($width + 31) / 32) * 4;
        
        // Image Data
        for ($y = $height - 1; $y >= 0; $y--) {
            $row = '';
            for ($x = 0; $x < $width; $x += 8) {
                $byte = 0;
                for ($bit = 0; $bit < 8; $bit++) {
                    if ($x + $bit < $width) {
                        $rgb = imagecolorat($image, $x + $bit, $y);
                        $r = ($rgb >> 16) & 0xFF;
                        $g = ($rgb >> 8) & 0xFF;
                        $b = $rgb & 0xFF;
                        
                        // White is 0, Black is 1
                        if ($r < 128 && $g < 128 && $b < 128) {
                            $byte |= (1 << (7 - $bit));
                        }
                    }
                }
                $row .= chr($byte);
            }
            
            // Pad row to required length
            $padding = str_repeat("\0", $row_size - strlen($row));
            $bmp .= $row . $padding;
        }
        
        // Write to file
        return file_put_contents($filename, $bmp) !== false;
    }
    
    /**
     * Vectorize an image using internal PHP method (fallback)
     *
     * @param string $image_path Path to the image
     * @param array $options Vectorization options
     * @return string|WP_Error SVG content or error
     */
    private function vectorize_internally($image_path, $options) {
        // This is a simplified internal vectorization method
        // It creates a very basic SVG tracing the image
        
        // Load image
        $img_string = file_get_contents($image_path);
        if (!$img_string) {
            return new WP_Error('file_read_error', 'Could not read image file.');
        }
        
        $image = @imagecreatefromstring($img_string);
        if (!$image) {
            return new WP_Error('image_creation_error', 'Could not create image from file.');
        }
        
        $width = imagesx($image);
        $height = imagesy($image);
        
        // Start SVG
        $svg = '<?xml version="1.0" standalone="no"?>' . "\n";
        $svg .= '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' . "\n";
        $svg .= '<svg width="' . $width . '" height="' . $height . '" viewBox="0 0 ' . $width . ' ' . $height . '" ';
        $svg .= 'xmlns="http://www.w3.org/2000/svg" version="1.1">' . "\n";
        
        // If using color mode
        if ($options['color_type'] === 'color') {
            $svg .= $this->generate_color_svg_content($image, $options);
        } else {
            // Convert to BW and create simple path tracing
            $svg .= $this->generate_bw_svg_content($image, $options);
        }
        
        // Close SVG
        $svg .= '</svg>';
        
        // Clean up
        imagedestroy($image);
        
        return $svg;
    }
    
    /**
     * Generate SVG content for black and white mode
     *
     * @param resource $image GD image resource
     * @param array $options Vectorization options
     * @return string SVG path content
     */
    private function generate_bw_svg_content($image, $options) {
        $width = imagesx($image);
        $height = imagesy($image);
        $threshold = (int)(255 * $options['brightness_threshold']);
        $content = '';
        
        // Convert to grayscale
        imagefilter($image, IMG_FILTER_GRAYSCALE);
        
        // Sample the image at reduced resolution for faster processing
        $sample_factor = ($options['detail_level'] === 'low') ? 4 : (($options['detail_level'] === 'medium') ? 2 : 1);
        
        // Create a path of rectangles for black pixels
        $content .= '<path d="';
        
        for ($y = 0; $y < $height; $y += $sample_factor) {
            for ($x = 0; $x < $width; $x += $sample_factor) {
                $rgb = imagecolorat($image, $x, $y);
                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;
                
                // Simple grayscale check
                $gray = (int)(($r + $g + $b) / 3);
                
                if (($gray < $threshold && !$options['invert']) || 
                    ($gray >= $threshold && $options['invert'])) {
                    $content .= "M{$x},{$y} h{$sample_factor}v{$sample_factor}h-{$sample_factor}z ";
                }
            }
        }
        
        $content .= '" fill="black" />' . "\n";
        
        return $content;
    }
    
    /**
     * Generate SVG content for color mode
     *
     * @param resource $image GD image resource
     * @param array $options Vectorization options
     * @return string SVG group content with color regions
     */
    private function generate_color_svg_content($image, $options) {
        $width = imagesx($image);
        $height = imagesy($image);
        $content = '';
        
        // Reduce colors to make vectorization manageable
        $num_colors = min(intval($options['colors']), 256);
        
        // Create a temporary image with reduced colors
        $reduced = imagecreatetruecolor($width, $height);
        imagecopy($reduced, $image, 0, 0, 0, 0, $width, $height);
        imagetruecolortopalette($reduced, false, $num_colors);
        
        // Sample factor based on detail level
        $sample_factor = ($options['detail_level'] === 'low') ? 4 : 
                         (($options['detail_level'] === 'medium') ? 2 : 1);
        
        // Get color palette
        $colors = array();
        for ($i = 0; $i < imagecolorstotal($reduced); $i++) {
            $colors[] = imagecolorsforindex($reduced, $i);
        }
        
        // Sort colors from darkest to lightest
        usort($colors, function($a, $b) {
            $brightness_a = ($a['red'] + $a['green'] + $a['blue']) / 3;
            $brightness_b = ($b['red'] + $b['green'] + $b['blue']) / 3;
            return $brightness_a - $brightness_b;
        });
        
        // Create separate path for each color
        foreach ($colors as $color) {
            // Skip very light colors if remove_background is true
            if ($options['remove_background'] && 
                (($color['red'] + $color['green'] + $color['blue']) / 3) > 240) {
                continue;
            }
            
            $hex_color = sprintf('#%02x%02x%02x', $color['red'], $color['green'], $color['blue']);
            $content .= '<path d="';
            
            // Find all pixels of this color
            for ($y = 0; $y < $height; $y += $sample_factor) {
                for ($x = 0; $x < $width; $x += $sample_factor) {
                    $rgb = imagecolorat($reduced, $x, $y);
                    $rgb_color = imagecolorsforindex($reduced, $rgb);
                    
                    // If the colors approximately match
                    if (abs($rgb_color['red'] - $color['red']) < 20 && 
                        abs($rgb_color['green'] - $color['green']) < 20 && 
                        abs($rgb_color['blue'] - $color['blue']) < 20) {
                        $content .= "M{$x},{$y} h{$sample_factor}v{$sample_factor}h-{$sample_factor}z ";
                    }
                }
            }
            
            $content .= '" fill="' . $hex_color . '" />' . "\n";
        }
        
        // Clean up
        imagedestroy($reduced);
        
        return $content;
    }
    
    /**
     * Get human-readable upload error message
     *
     * @param int $error_code PHP upload error code
     * @return string Error message
     */
    private function get_upload_error_message($error_code) {
        switch ($error_code) {
            case UPLOAD_ERR_INI_SIZE:
                return 'The uploaded file exceeds the upload_max_filesize directive in php.ini.';
            case UPLOAD_ERR_FORM_SIZE:
                return 'The uploaded file exceeds the MAX_FILE_SIZE directive in the HTML form.';
            case UPLOAD_ERR_PARTIAL:
                return 'The uploaded file was only partially uploaded.';
            case UPLOAD_ERR_NO_FILE:
                return 'No file was uploaded.';
            case UPLOAD_ERR_NO_TMP_DIR:
                return 'Missing a temporary folder.';
            case UPLOAD_ERR_CANT_WRITE:
                return 'Failed to write file to disk.';
            case UPLOAD_ERR_EXTENSION:
                return 'A PHP extension stopped the file upload.';
            default:
                return 'Unknown upload error.';
        }
    }
}
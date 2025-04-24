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
        
        // Check for image source
        if (!empty($_FILES['image'])) {
            // Handle direct file upload
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
            
        } elseif (isset($_POST['image_id']) && intval($_POST['image_id']) > 0) {
            // Handle image from media library
            $image_id = intval($_POST['image_id']);
            $temp_file = get_attached_file($image_id);
            
            if (!$temp_file || !file_exists($temp_file)) {
                wp_send_json_error(array('message' => 'Image file not found'));
                return;
            }
        } else {
            wp_send_json_error(array('message' => 'No image provided'));
            return;
        }
        
        // Get vectorization options
        $options = array(
            'detail_level' => isset($_POST['detail_level']) ? sanitize_text_field($_POST['detail_level']) : 'medium',
            'color_type' => isset($_POST['color_type']) ? sanitize_text_field($_POST['color_type']) : 'mono',
            'colors' => isset($_POST['colors']) ? intval($_POST['colors']) : 8,
            'invert' => isset($_POST['invert']) ? (bool) $_POST['invert'] : false,
            'remove_background' => isset($_POST['remove_background']) ? (bool) $_POST['remove_background'] : true,
            'brightness_threshold' => isset($_POST['brightness']) ? (float) $_POST['brightness'] : 0.45,
            'turdsize' => isset($_POST['turdsize']) ? intval($_POST['turdsize']) : 2,
            'opticurve' => isset($_POST['opticurve']) ? (bool) $_POST['opticurve'] : true,
        );
        
        // Set detail level parameters
        switch ($options['detail_level']) {
            case 'low':
                $options['alphamax'] = 2.0;
                $options['optitolerance'] = 0.8;
                break;
            
            case 'medium':
                $options['alphamax'] = 1.0;
                $options['optitolerance'] = 0.2;
                break;
            
            case 'high':
                $options['alphamax'] = 0.5;
                $options['optitolerance'] = 0.1;
                break;
                
            case 'ultra':
                $options['alphamax'] = 0.2;
                $options['optitolerance'] = 0.05;
                break;
        }
        
        // Process the image
        $result = $this->vectorize_image($temp_file, $options);
        
        // Clean up temporary file (only if it's an uploaded file, not from media library)
        if (empty($_POST['image_id'])) {
            @unlink($temp_file);
        }
        
        // Check for errors
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
            return;
        }
        
        // Generate transient key for the result
        $transient_key = 'yprint_vector_' . md5(basename($temp_file) . serialize($options));
        set_transient($transient_key, $result['content'], HOUR_IN_SECONDS);
        
        // Return success response
        wp_send_json_success(array(
            'svg' => $result['content'],
            'file_url' => $result['file_url'],
            'transient_key' => $transient_key
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
            // Create .htaccess to protect temp files
            file_put_contents($temp_dir . '/.htaccess', 'deny from all');
        }
        
        $temp_base = $temp_dir . '/' . uniqid('vector_');
        $temp_bmp = $temp_base . '.bmp';
        $temp_svg = $temp_base . '.svg';
        
        // Always use internal vectorization for now
        $svg_content = $this->vectorize_internally($image_path, $options);
        
        // Clean up temporary files
        @unlink($temp_bmp);
        
        // If we got a WP_Error, return it
        if (is_wp_error($svg_content)) {
            return $svg_content;
        }
        
        // Generate output file
        $file_info = pathinfo($image_path);
        $result_filename = sanitize_file_name(uniqid() . '-' . $file_info['filename'] . '.svg');
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
     * Vectorize an image using internal PHP method
     *
     * @param string $image_path Path to the image
     * @param array $options Vectorization options
     * @return string|WP_Error SVG content or error
     */
    private function vectorize_internally($image_path, $options) {
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
        
        // Check if image dimensions are reasonable
        if ($width > 3000 || $height > 3000) {
            // Resize image to more manageable dimensions
            $ratio = $width / $height;
            if ($width > $height) {
                $new_width = 2000;
                $new_height = 2000 / $ratio;
            } else {
                $new_height = 2000;
                $new_width = 2000 * $ratio;
            }
            
            $resized = imagecreatetruecolor($new_width, $new_height);
            imagecopyresampled($resized, $image, 0, 0, 0, 0, $new_width, $new_height, $width, $height);
            imagedestroy($image);
            $image = $resized;
            $width = $new_width;
            $height = $new_height;
        }
        
        // Start SVG
        $svg = '<?xml version="1.0" standalone="no"?>' . "\n";
        $svg .= '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' . "\n";
        $svg .= '<svg width="' . $width . '" height="' . $height . '" viewBox="0 0 ' . $width . ' ' . $height . '" ';
        $svg .= 'xmlns="http://www.w3.org/2000/svg" version="1.1">' . "\n";
        
        // Process based on color mode
        if ($options['color_type'] === 'color') {
            $svg .= $this->generate_color_svg_content($image, $options);
        } else if ($options['color_type'] === 'gray') {
            $svg .= $this->generate_grayscale_svg_content($image, $options);
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
     * Generate grayscale SVG content
     *
     * @param resource $image GD image resource
     * @param array $options Vectorization options
     * @return string SVG content
     */
    private function generate_grayscale_svg_content($image, $options) {
        $width = imagesx($image);
        $height = imagesy($image);
        $content = '';
        
        // Convert to grayscale
        imagefilter($image, IMG_FILTER_GRAYSCALE);
        
        // Determine sampling based on detail level
        $sample_factor = $this->get_sample_factor_for_detail($options['detail_level'], $width, $height);
        
        // Create gray levels (number based on options)
        $gray_levels = min(max(intval($options['colors']), 3), 8);
        $step = 255 / ($gray_levels - 1);
        
        // Create an SVG path for each gray level
        for ($level = 0; $level < $gray_levels; $level++) {
            $threshold = $level * $step;
            $gray_value = 255 - $threshold;
            
            // Skip very light or very dark levels based on options
            if ($options['remove_background'] && $gray_value > 230) {
                continue;
            }
            
            $hex_color = sprintf('#%02x%02x%02x', $gray_value, $gray_value, $gray_value);
            $paths = [];
            
            for ($y = 0; $y < $height; $y += $sample_factor) {
                for ($x = 0; $x < $width; $x += $sample_factor) {
                    $rgb = imagecolorat($image, $x, $y);
                    $r = ($rgb >> 16) & 0xFF;
                    $g = ($rgb >> 8) & 0xFF;
                    $b = $rgb & 0xFF;
                    
                    // Average for gray
                    $avg = ($r + $g + $b) / 3;
                    
                    // Check if this pixel belongs to this gray level
                    $lower_bound = $threshold - ($step/2);
                    $upper_bound = $threshold + ($step/2);
                    
                    if ($avg >= $lower_bound && $avg <= $upper_bound) {
                        $paths[] = "M{$x},{$y} h{$sample_factor}v{$sample_factor}h-{$sample_factor}z";
                    }
                }
            }
            
            if (!empty($paths)) {
                $content .= '<path d="' . implode(' ', $paths) . '" fill="' . $hex_color . '" />' . "\n";
            }
        }
        
        return $content;
    }
    
    /**
     * Get appropriate sampling factor based on detail level and image dimensions
     *
     * @param string $detail_level Detail level (low, medium, high, ultra)
     * @param int $width Image width
     * @param int $height Image height
     * @return int Sampling factor
     */
    private function get_sample_factor_for_detail($detail_level, $width, $height) {
        $size = max($width, $height);
        
        switch ($detail_level) {
            case 'low':
                if ($size > 1000) return 8;
                if ($size > 500) return 6;
                return 4;
                
            case 'medium':
                if ($size > 1000) return 4;
                if ($size > 500) return 3;
                return 2;
                
            case 'high':
                if ($size > 1000) return 2;
                return 1;
                
            case 'ultra':
                return 1;
                
            default:
                return 3;
        }
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
        
        // Convert to grayscale
        imagefilter($image, IMG_FILTER_GRAYSCALE);
        
        // Apply additional contrast to make black/white separation clearer
        imagefilter($image, IMG_FILTER_CONTRAST, -10);
        
        // Sample the image at reduced resolution based on detail level and image size
        $sample_factor = $this->get_sample_factor_for_detail($options['detail_level'], $width, $height);
        
        // Create a path of rectangles for black pixels
        $paths = [];
        
        for ($y = 0; $y < $height; $y += $sample_factor) {
            for ($x = 0; $x < $width; $x += $sample_factor) {
                $rgb = imagecolorat($image, $x, $y);
                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;
                
                // Simple grayscale check
                $gray = (int)(($r + $g + $b) / 3);
                
                // Apply noise reduction (turdsize) - skip isolated pixels
                if ($options['turdsize'] > 0) {
                    $isolated = true;
                    
                    // Check surrounding pixels (if not at the edge)
                    if ($x > 0 && $y > 0 && $x < ($width - $sample_factor) && $y < ($height - $sample_factor)) {
                        for ($i = -1; $i <= 1; $i++) {
                            for ($j = -1; $j <= 1; $j++) {
                                if ($i === 0 && $j === 0) continue; // Skip self
                                
                                $nx = $x + ($i * $sample_factor);
                                $ny = $y + ($j * $sample_factor);
                                
                                if ($nx >= 0 && $ny >= 0 && $nx < $width && $ny < $height) {
                                    $neighbor_rgb = imagecolorat($image, $nx, $ny);
                                    $neighbor_r = ($neighbor_rgb >> 16) & 0xFF;
                                    $neighbor_g = ($neighbor_rgb >> 8) & 0xFF;
                                    $neighbor_b = $neighbor_rgb & 0xFF;
                                    $neighbor_gray = (int)(($neighbor_r + $neighbor_g + $neighbor_b) / 3);
                                    
                                    // If neighbor is similar, this pixel is not isolated
                                    if (($neighbor_gray < $threshold && !$options['invert']) || 
                                        ($neighbor_gray >= $threshold && $options['invert'])) {
                                        $isolated = false;
                                        break 2;
                                    }
                                }
                            }
                        }
                    } else {
                        $isolated = false; // Edge pixels are not considered isolated
                    }
                    
                    // Skip if this is an isolated pixel/group (noise)
                    if ($isolated && rand(1, 10) <= $options['turdsize']) {
                        continue;
                    }
                }
                
                if (($gray < $threshold && !$options['invert']) || 
                    ($gray >= $threshold && $options['invert'])) {
                    $paths[] = "M{$x},{$y} h{$sample_factor}v{$sample_factor}h-{$sample_factor}z";
                }
            }
        }
        
        if (empty($paths)) {
            return ""; // No paths found
        }
        
        // Group paths to optimize SVG size
        $content = '<path d="' . implode(' ', $paths) . '" fill="black" />' . "\n";
        
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
        
        // Reduce colors to make vectorization manageable
        $num_colors = min(intval($options['colors']), 64);
        
        // Create a temporary image with reduced colors
        $reduced = imagecreatetruecolor($width, $height);
        imagecopy($reduced, $image, 0, 0, 0, 0, $width, $height);
        
        // Apply some optional smoothing to improve results
        if (!empty($options['smooth_colors'])) {
            imagefilter($reduced, IMG_FILTER_SMOOTH, 4);
        }
        
        // Reduce to palette
        imagetruecolortopalette($reduced, false, $num_colors);
        
        // Sample factor based on detail level and image size
        $sample_factor = $this->get_sample_factor_for_detail($options['detail_level'], $width, $height);
        
        // Get color palette
        $colors = array();
        for ($i = 0; $i < imagecolorstotal($reduced); $i++) {
            $colors[] = imagecolorsforindex($reduced, $i);
        }
        
        // Sort colors - if stack_colors is enabled, we sort from darkest to lightest
        // This creates a "stacking" effect where darker colors appear on top
        if (!empty($options['stack_colors'])) {
            usort($colors, function($a, $b) {
                $brightness_a = ($a['red'] + $a['green'] + $a['blue']) / 3;
                $brightness_b = ($b['red'] + $b['green'] + $b['blue']) / 3;
                return $brightness_a - $brightness_b; // Dark to light
            });
        }
        
        $content = '';
        
        // Create separate path for each color
        foreach ($colors as $color) {
            // Skip very light colors if remove_background is true
            if ($options['remove_background'] && 
                (($color['red'] + $color['green'] + $color['blue']) / 3) > 240) {
                continue;
            }
            
            $hex_color = sprintf('#%02x%02x%02x', $color['red'], $color['green'], $color['blue']);
            
            // Collect path segments for this color
            $paths = [];
            
            // Find all pixels of this color
            for ($y = 0; $y < $height; $y += $sample_factor) {
                for ($x = 0; $x < $width; $x += $sample_factor) {
                    $rgb = imagecolorat($reduced, $x, $y);
                    $rgb_color = imagecolorsforindex($reduced, $rgb);
                    
                    // If the colors approximately match
                    if (abs($rgb_color['red'] - $color['red']) < 20 && 
                        abs($rgb_color['green'] - $color['green']) < 20 && 
                        abs($rgb_color['blue'] - $color['blue']) < 20) {
                        $paths[] = "M{$x},{$y} h{$sample_factor}v{$sample_factor}h-{$sample_factor}z";
                    }
                }
            }
            
            // Only add path if there are segments (otherwise we get empty paths)
            if (!empty($paths)) {
                $content .= '<path d="' . implode(' ', $paths) . '" fill="' . $hex_color . '" />' . "\n";
            }
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
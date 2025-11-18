-- Initialize WordPress test database with standard configuration

USE wordpress_test;

-- Insert admin user
INSERT INTO wp_users (user_login, user_pass, user_nicename, user_email, user_status, display_name)
VALUES ('admin', MD5('admin123'), 'admin', 'admin@test.local', 0, 'Test Admin');

-- Set admin user capabilities
INSERT INTO wp_usermeta (user_id, meta_key, meta_value) VALUES
(1, 'wp_capabilities', 'a:1:{s:13:"administrator";b:1;}'),
(1, 'wp_user_level', '10');

-- WordPress options for testing
INSERT INTO wp_options (option_name, option_value, autoload) VALUES
('siteurl', 'http://localhost:8081', 'yes'),
('home', 'http://localhost:8081', 'yes'),
('blogname', 'YPrint Designer Test', 'yes'),
('blogdescription', 'WordPress Test Environment for YPrint Designer Plugin', 'yes'),
('active_plugins', 'a:1:{i:0;s:31:"octo-print-designer/plugin.php";}', 'yes'),
('template', 'twentytwentythree', 'yes'),
('stylesheet', 'twentytwentythree', 'yes');

-- Plugin specific options (if any)
INSERT INTO wp_options (option_name, option_value, autoload) VALUES
('octo_print_designer_debug', '1', 'yes'),
('octo_print_designer_test_mode', '1', 'yes');

-- Create test products and categories for plugin testing
INSERT INTO wp_terms (name, slug, term_group) VALUES
('Test Products', 'test-products', 0),
('T-Shirts', 't-shirts', 0);

INSERT INTO wp_term_taxonomy (term_id, taxonomy, description, parent, count) VALUES
(1, 'product_cat', 'Test product category', 0, 1),
(2, 'product_cat', 'T-shirt category', 1, 1);

-- Test product
INSERT INTO wp_posts (post_title, post_content, post_status, post_type, post_author) VALUES
('Test T-Shirt', 'A test t-shirt for designer plugin testing', 'publish', 'product', 1);

INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES
(1, '_product_type', 'simple'),
(1, '_designer_enabled', '1'),
(1, '_canvas_width', '800'),
(1, '_canvas_height', '600');
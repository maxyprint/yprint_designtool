<?php
/**
 * AGENT 4: Local by Flywheel Site Status Checker
 * Verifies if the WordPress test site is running and accessible
 */

echo "🚀 AGENT 4: Local by Flywheel Site Status Check\n";
echo "===============================================\n\n";

// Check if Local by Flywheel sites directory exists
$local_sites_paths = [
    '/Users/maxschwarz/Local Sites',
    '/Users/maxschwarz/Desktop/Local Sites',
    '$HOME/Local Sites'
];

$sites_found = false;
$active_sites = [];

foreach ($local_sites_paths as $path) {
    if (is_dir($path)) {
        echo "✅ Local Sites directory found: $path\n";
        $sites_found = true;

        // Look for test-site specifically
        $test_site_path = $path . '/test-site';
        if (is_dir($test_site_path)) {
            echo "✅ test-site directory found: $test_site_path\n";

            // Check WordPress installation
            $wp_config = $test_site_path . '/app/public/wp-config.php';
            if (file_exists($wp_config)) {
                echo "✅ WordPress wp-config.php found\n";

                // Extract database info
                $config_content = file_get_contents($wp_config);
                if (preg_match("/define\\s*\\(\\s*['\"]DB_NAME['\"]\\s*,\\s*['\"]([^'\"]+)['\"]\\s*\\)/", $config_content, $matches)) {
                    echo "✅ Database name: " . $matches[1] . "\n";
                }
                if (preg_match("/define\\s*\\(\\s*['\"]DB_HOST['\"]\\s*,\\s*['\"]([^'\"]+)['\"]\\s*\\)/", $config_content, $matches)) {
                    echo "✅ Database host: " . $matches[1] . "\n";
                }

                // Check if WordPress core files exist
                $wp_core_files = [
                    'wp-admin/admin.php',
                    'wp-includes/wp-db.php',
                    'wp-content/plugins'
                ];

                $wp_public = $test_site_path . '/app/public';
                foreach ($wp_core_files as $file) {
                    $full_path = $wp_public . '/' . $file;
                    if (file_exists($full_path)) {
                        echo "✅ WordPress core: $file\n";
                    } else {
                        echo "❌ WordPress core missing: $file\n";
                    }
                }

                // Check if our plugin is in the plugins directory
                $our_plugin_path = $wp_public . '/wp-content/plugins/yprint_designtool';
                if (is_dir($our_plugin_path)) {
                    echo "✅ Our plugin directory exists in WordPress\n";

                    // Check main plugin file
                    $main_plugin = $our_plugin_path . '/octo-print-designer.php';
                    if (file_exists($main_plugin)) {
                        echo "✅ Main plugin file exists in WordPress plugins\n";
                    } else {
                        echo "❌ Main plugin file missing from WordPress plugins\n";
                    }
                } else {
                    echo "❌ Our plugin not found in WordPress plugins directory\n";
                    echo "   Expected: $our_plugin_path\n";
                    echo "   💡 Need to copy plugin to WordPress plugins directory\n";
                }

            } else {
                echo "❌ wp-config.php not found\n";
            }

            // Check if site is running (test HTTP connection)
            echo "\n🌐 TESTING SITE CONNECTIVITY:\n";
            echo "==============================\n";

            $test_urls = [
                'http://test-site.local',
                'http://localhost:8080',
                'http://localhost:3000',
                'http://localhost:80'
            ];

            foreach ($test_urls as $url) {
                echo "Testing: $url ... ";

                $context = stream_context_create([
                    'http' => [
                        'timeout' => 5,
                        'ignore_errors' => true
                    ]
                ]);

                $response = @file_get_contents($url, false, $context);

                if ($response !== false) {
                    if (strpos($response, 'WordPress') !== false || strpos($response, 'wp-') !== false) {
                        echo "✅ WordPress site responding!\n";
                        $active_sites[] = $url;
                    } else {
                        echo "⚠️ Site responding but not WordPress\n";
                    }
                } else {
                    echo "❌ No response\n";
                }
            }

        } else {
            echo "❌ test-site directory not found in $path\n";
        }
        break; // Use first found directory
    }
}

if (!$sites_found) {
    echo "❌ No Local Sites directory found\n";
    echo "💡 Local by Flywheel may not be installed or configured\n";
}

// Check Local by Flywheel application status
echo "\n🔍 LOCAL BY FLYWHEEL STATUS:\n";
echo "============================\n";

// Check if Local is running (process check)
$local_processes = shell_exec('ps aux | grep -i local | grep -v grep');
if ($local_processes) {
    echo "✅ Local by Flywheel processes found:\n";
    $lines = explode("\n", trim($local_processes));
    foreach ($lines as $line) {
        if (trim($line)) {
            echo "  📱 " . preg_replace('/\s+/', ' ', trim($line)) . "\n";
        }
    }
} else {
    echo "❌ Local by Flywheel not running\n";
    echo "💡 Start Local by Flywheel application\n";
}

// Check for Local sites configuration
$local_config_paths = [
    '/Users/maxschwarz/Library/Application Support/Local/sites.json',
    '$HOME/Library/Application Support/Local/sites.json'
];

foreach ($local_config_paths as $config_path) {
    $expanded_path = str_replace('$HOME', $_SERVER['HOME'], $config_path);
    if (file_exists($expanded_path)) {
        echo "\n✅ Local sites configuration found: $expanded_path\n";

        $config = json_decode(file_get_contents($expanded_path), true);
        if ($config && isset($config['sites'])) {
            echo "📊 Configured sites: " . count($config['sites']) . "\n";

            foreach ($config['sites'] as $site_id => $site_info) {
                $site_name = $site_info['name'] ?? 'Unknown';
                $site_status = $site_info['status'] ?? 'unknown';
                echo "  🌐 $site_name: $site_status\n";

                if ($site_name === 'test-site') {
                    echo "    🎯 This is our target site!\n";
                    if ($site_status !== 'running') {
                        echo "    🚨 Site is not running - start it in Local\n";
                    }
                }
            }
        }
        break;
    }
}

echo "\n📋 DIAGNOSIS SUMMARY:\n";
echo "=====================\n";

if (count($active_sites) > 0) {
    echo "✅ WordPress site is accessible at: " . implode(', ', $active_sites) . "\n";
    echo "🎯 Next step: Check plugin activation in WordPress admin\n";
    echo "   Visit: " . $active_sites[0] . "/wp-admin/plugins.php\n";
} else {
    echo "❌ WordPress site is not accessible\n";
    echo "🚨 REQUIRED ACTIONS:\n";
    echo "1. Start Local by Flywheel application\n";
    echo "2. Start the 'test-site' in Local\n";
    echo "3. Ensure database is running\n";
    echo "4. Copy plugin to wp-content/plugins/ if missing\n";
}

echo "\n🔧 PLUGIN INSTALLATION CHECK:\n";
echo "==============================\n";

// Check if our plugin files are in the WordPress plugins directory
$current_dir = __DIR__;
$plugin_files = [
    'octo-print-designer.php',
    'includes/class-octo-print-designer.php',
    'public/class-octo-print-designer-public.php'
];

echo "Current plugin directory: $current_dir\n";

foreach ($plugin_files as $file) {
    $file_path = $current_dir . '/' . $file;
    if (file_exists($file_path)) {
        echo "✅ Plugin file exists: $file\n";
    } else {
        echo "❌ Plugin file missing: $file\n";
    }
}

echo "\n🎯 AGENT 4 STATUS CHECK COMPLETE\n";
echo "=================================\n";

if (count($active_sites) === 0) {
    echo "🚨 PRIMARY ISSUE: WordPress site not running\n";
    echo "🎯 SOLUTION: Start Local by Flywheel and the test-site\n";
} else {
    echo "✅ WordPress appears to be running\n";
    echo "🔍 Next: Check plugin activation status\n";
}
?>
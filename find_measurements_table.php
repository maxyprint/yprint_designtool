<?php
/**
 * Script to find where measurement data is stored in the database
 * Run this in your WordPress environment to locate the correct table
 */

// WordPress Database Connection (adjust these values)
$host = 'localhost';
$dbname = 'dbs13227305'; // Your database name
$username = 'your_username';
$password = 'your_password';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "🔍 Searching for measurement data in database: $dbname\n\n";
    
    // 1. List all tables in the database
    echo "📋 All tables in database:\n";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($tables as $table) {
        echo "- $table\n";
    }
    echo "\n";
    
    // 2. Look for tables that might contain measurement data
    $possible_tables = [
        'wp_postmeta',
        'postmeta',
        'wp_posts',
        'posts',
        'templates',
        'measurements',
        'template_measurements',
        'product_dimensions',
        'view_print_areas'
    ];
    
    echo "🎯 Checking possible measurement tables:\n";
    foreach ($possible_tables as $table) {
        if (in_array($table, $tables)) {
            echo "✅ Found table: $table\n";
            
            // Check table structure
            $stmt = $pdo->query("DESCRIBE $table");
            $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "   Columns:\n";
            foreach ($columns as $column) {
                echo "   - {$column['Field']} ({$column['Type']})\n";
            }
            echo "\n";
            
            // Check for measurement-related data
            $stmt = $pdo->query("SELECT * FROM $table LIMIT 5");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (!empty($rows)) {
                echo "   Sample data:\n";
                foreach ($rows as $i => $row) {
                    echo "   Row " . ($i + 1) . ":\n";
                    foreach ($row as $key => $value) {
                        if (strlen($value) > 100) {
                            $value = substr($value, 0, 100) . "...";
                        }
                        echo "     $key: $value\n";
                    }
                    echo "\n";
                }
            }
        } else {
            echo "❌ Table not found: $table\n";
        }
    }
    
    // 3. Search for measurement-related content in all tables
    echo "🔍 Searching for measurement-related content:\n";
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW COLUMNS FROM $table");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        foreach ($columns as $column) {
            // Search for measurement-related keywords
            $keywords = ['measurement', 'template', 'product', 'dimension', 'view', 'print', 'area'];
            
            foreach ($keywords as $keyword) {
                if (stripos($column, $keyword) !== false) {
                    echo "✅ Found relevant column: $table.$column\n";
                    
                    // Check for data in this column
                    $stmt = $pdo->query("SELECT $column FROM $table WHERE $column IS NOT NULL LIMIT 3");
                    $values = $stmt->fetchAll(PDO::FETCH_COLUMN);
                    
                    foreach ($values as $value) {
                        if (!empty($value)) {
                            if (strlen($value) > 200) {
                                $value = substr($value, 0, 200) . "...";
                            }
                            echo "   Sample value: $value\n";
                        }
                    }
                    echo "\n";
                }
            }
        }
    }
    
    // 4. Look for serialized data that might contain measurements
    echo "🔍 Searching for serialized measurement data:\n";
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW COLUMNS FROM $table");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        foreach ($columns as $column) {
            // Look for data that might be serialized arrays
            $stmt = $pdo->query("SELECT $column FROM $table WHERE $column LIKE '%measurement%' OR $column LIKE '%template%' OR $column LIKE '%product%' LIMIT 3");
            $values = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            foreach ($values as $value) {
                if (!empty($value) && (strpos($value, 'a:') === 0 || strpos($value, '{') === 0)) {
                    echo "✅ Found serialized data in $table.$column:\n";
                    echo "   $value\n\n";
                }
            }
        }
    }
    
} catch (PDOException $e) {
    echo "❌ Database connection error: " . $e->getMessage() . "\n";
    echo "\n💡 Please update the database connection details at the top of this script:\n";
    echo "- host: $host\n";
    echo "- dbname: $dbname\n";
    echo "- username: $username\n";
    echo "- password: [your_password]\n";
}
?> 
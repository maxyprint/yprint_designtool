# YPrint Design Tool - Production Deployment Guide

**Version**: 1.0.9
**Last Updated**: September 26, 2025
**Target Audience**: DevOps Engineers, System Administrators, Production Teams

---

## 📖 Table of Contents

1. [Pre-Deployment Requirements](#pre-deployment-requirements)
2. [Production Environment Setup](#production-environment-setup)
3. [Database Configuration](#database-configuration)
4. [Security Configuration](#security-configuration)
5. [Performance Optimization](#performance-optimization)
6. [Monitoring Setup](#monitoring-setup)
7. [Backup and Recovery](#backup-and-recovery)
8. [Deployment Process](#deployment-process)
9. [Post-Deployment Validation](#post-deployment-validation)
10. [Rollback Procedures](#rollback-procedures)
11. [Maintenance and Updates](#maintenance-and-updates)

---

## 🔧 Pre-Deployment Requirements

### System Requirements

#### Minimum Production Specifications
```
Server Requirements:
- CPU: 4 cores minimum (8 cores recommended)
- RAM: 8GB minimum (16GB recommended)
- Storage: 50GB SSD minimum (100GB recommended)
- Network: 100Mbps minimum (1Gbps recommended)

Software Stack:
- Ubuntu 20.04 LTS or CentOS 8+ (recommended)
- Apache 2.4+ or Nginx 1.18+
- PHP 8.0+ (8.1 recommended)
- MySQL 8.0+ or MariaDB 10.5+
- Redis 6.0+ (for caching)
- Composer 2.0+
```

#### WordPress Requirements
```
WordPress Core:
- WordPress 6.0+ (latest stable recommended)
- WooCommerce 6.0+ (if e-commerce features used)
- Multisite support (if applicable)

PHP Extensions (required):
- php-mysql / php-pdo
- php-gd
- php-curl
- php-mbstring
- php-xml
- php-zip
- php-intl
- php-redis
```

### Infrastructure Prerequisites

#### Load Balancer Configuration
```nginx
upstream yprint_backend {
    server web1.yprint.com:80 weight=3;
    server web2.yprint.com:80 weight=2;
    server web3.yprint.com:80 weight=1;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    location / {
        proxy_pass http://yprint_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### CDN Configuration
```
Recommended CDN Settings:
- Static Assets: 1 year cache
- Images: 6 months cache
- CSS/JS: 1 month cache with versioning
- API Responses: No cache
- Precision Calculations: No cache
```

### Security Prerequisites

#### SSL/TLS Configuration
```apache
# Apache SSL Configuration
<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot /var/www/html

    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/private.key

    # Security Headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000"
</VirtualHost>
```

#### Firewall Rules
```bash
# UFW Firewall Configuration
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow from 10.0.0.0/8 to any port 3306  # Database (internal only)
sudo ufw allow from 10.0.0.0/8 to any port 6379  # Redis (internal only)
sudo ufw enable
```

---

## 🏗️ Production Environment Setup

### Step 1: Server Preparation

#### System Updates
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget unzip git

# CentOS/RHEL
sudo yum update -y
sudo yum install -y curl wget unzip git
```

#### PHP Installation and Configuration
```bash
# Install PHP 8.1 (Ubuntu)
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install -y php8.1 php8.1-cli php8.1-fpm php8.1-mysql php8.1-gd \
                    php8.1-curl php8.1-mbstring php8.1-xml php8.1-zip \
                    php8.1-intl php8.1-redis

# Configure PHP for production
sudo cp /etc/php/8.1/fpm/php.ini /etc/php/8.1/fpm/php.ini.backup
```

#### PHP Configuration for YPrint
```ini
; /etc/php/8.1/fpm/php.ini

; Memory and Execution
memory_limit = 512M
max_execution_time = 300
max_input_time = 300

; File Uploads
upload_max_filesize = 64M
post_max_size = 64M
max_file_uploads = 20

; Error Handling (Production)
display_errors = Off
display_startup_errors = Off
log_errors = On
error_log = /var/log/php/error.log

; Session Configuration
session.cookie_secure = 1
session.cookie_httponly = 1
session.use_strict_mode = 1

; OPcache Configuration
opcache.enable = 1
opcache.memory_consumption = 256
opcache.interned_strings_buffer = 16
opcache.max_accelerated_files = 10000
opcache.validate_timestamps = 0
opcache.revalidate_freq = 0
```

### Step 2: Web Server Configuration

#### Apache Configuration
```apache
# /etc/apache2/sites-available/yprint.conf
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/html

    # Redirect HTTP to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot /var/www/html

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/ssl/cert.pem
    SSLCertificateKeyFile /path/to/ssl/private.key

    # Performance Optimizations
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/x-javascript application/xml+rss
    </IfModule>

    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType text/css "access plus 1 month"
        ExpiresByType application/javascript "access plus 1 month"
        ExpiresByType image/png "access plus 6 months"
        ExpiresByType image/jpg "access plus 6 months"
        ExpiresByType image/jpeg "access plus 6 months"
    </IfModule>

    # WordPress Configuration
    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted

        # Security Headers
        Header always set X-Content-Type-Options nosniff
        Header always set X-Frame-Options SAMEORIGIN
        Header always set X-XSS-Protection "1; mode=block"
    </Directory>

    # Precision System Specific
    <Location "/wp-admin/admin-ajax.php">
        # Ensure AJAX requests for precision calculations are not cached
        Header set Cache-Control "no-cache, no-store, must-revalidate"
        Header set Pragma "no-cache"
        Header set Expires "0"
    </Location>
</VirtualHost>
```

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/yprint
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    root /var/www/html;
    index index.php index.html;

    # SSL Configuration
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000";

    # WordPress Configuration
    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;

        # Increase timeouts for precision calculations
        fastcgi_read_timeout 300;
        fastcgi_send_timeout 300;
    }

    # Static Assets Optimization
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Precision System AJAX - No Cache
    location /wp-admin/admin-ajax.php {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;

        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
}
```

---

## 💾 Database Configuration

### MySQL/MariaDB Production Setup

#### Database Server Configuration
```ini
# /etc/mysql/mysql.conf.d/mysqld.cnf

[mysqld]
# Basic Configuration
bind-address = 127.0.0.1
port = 3306

# Memory and Performance
innodb_buffer_pool_size = 4G
innodb_log_file_size = 512M
innodb_flush_log_at_trx_commit = 2
innodb_file_per_table = 1

# Connection Management
max_connections = 200
connect_timeout = 10
wait_timeout = 600
interactive_timeout = 600

# Query Cache
query_cache_type = 1
query_cache_size = 256M

# Logging
log_error = /var/log/mysql/error.log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# Binary Logging (for replication/backup)
log_bin = /var/log/mysql/mysql-bin.log
binlog_expire_logs_seconds = 2592000
max_binlog_size = 100M
```

#### Database Creation and User Setup
```sql
-- Create YPrint Database
CREATE DATABASE yprint_production
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create Production User
CREATE USER 'yprint_prod'@'localhost'
  IDENTIFIED BY 'STRONG_RANDOM_PASSWORD_HERE';

-- Grant Privileges
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, INDEX
  ON yprint_production.*
  TO 'yprint_prod'@'localhost';

-- Create Read-Only User for Reporting
CREATE USER 'yprint_readonly'@'localhost'
  IDENTIFIED BY 'READONLY_PASSWORD_HERE';
GRANT SELECT ON yprint_production.*
  TO 'yprint_readonly'@'localhost';

FLUSH PRIVILEGES;
```

#### YPrint-Specific Database Optimizations
```sql
-- Optimize template_measurements table for precision system
ALTER TABLE wp_template_measurements
  ADD INDEX idx_template_size_key (template_id, size_key, measurement_key),
  ADD INDEX idx_value_cm (value_cm),
  ADD INDEX idx_template_lookup (template_id, size_key);

-- Optimize WordPress tables for YPrint usage
ALTER TABLE wp_posts
  ADD INDEX idx_post_type_status (post_type, post_status);
ALTER TABLE wp_postmeta
  ADD INDEX idx_meta_key_value (meta_key, meta_value(50));

-- Create performance monitoring tables
CREATE TABLE yprint_performance_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    operation_type VARCHAR(100) NOT NULL,
    execution_time_ms DECIMAL(10,3) NOT NULL,
    memory_usage_kb INT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT,
    template_id BIGINT,
    INDEX idx_operation_time (operation_type, timestamp),
    INDEX idx_performance_analysis (timestamp, execution_time_ms)
);
```

### Redis Configuration for Caching

#### Redis Server Setup
```ini
# /etc/redis/redis.conf

# Network
bind 127.0.0.1
port 6379
protected-mode yes

# Memory Management
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Security
requirepass YOUR_REDIS_PASSWORD_HERE

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log

# Performance
tcp-keepalive 300
timeout 300
```

#### WordPress Redis Configuration
```php
// wp-config.php additions for Redis
define('WP_REDIS_HOST', '127.0.0.1');
define('WP_REDIS_PORT', 6379);
define('WP_REDIS_PASSWORD', 'YOUR_REDIS_PASSWORD_HERE');
define('WP_REDIS_DATABASE', 0);
define('WP_REDIS_TIMEOUT', 1);
define('WP_REDIS_READ_TIMEOUT', 1);

// YPrint-specific cache configuration
define('YPRINT_CACHE_ENABLED', true);
define('YPRINT_CACHE_TTL', 3600); // 1 hour
define('YPRINT_PRECISION_CACHE_TTL', 86400); // 24 hours
```

---

## 🔒 Security Configuration

### WordPress Security Hardening

#### wp-config.php Security Settings
```php
<?php
// Production wp-config.php

// Database Configuration
define('DB_NAME', 'yprint_production');
define('DB_USER', 'yprint_prod');
define('DB_PASSWORD', 'STRONG_DATABASE_PASSWORD');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

// Security Keys (Generate from https://api.wordpress.org/secret-key/1.1/salt/)
define('AUTH_KEY',         'UNIQUE_AUTH_KEY_HERE');
define('SECURE_AUTH_KEY',  'UNIQUE_SECURE_AUTH_KEY_HERE');
define('LOGGED_IN_KEY',    'UNIQUE_LOGGED_IN_KEY_HERE');
define('NONCE_KEY',        'UNIQUE_NONCE_KEY_HERE');
define('AUTH_SALT',        'UNIQUE_AUTH_SALT_HERE');
define('SECURE_AUTH_SALT', 'UNIQUE_SECURE_AUTH_SALT_HERE');
define('LOGGED_IN_SALT',   'UNIQUE_LOGGED_IN_SALT_HERE');
define('NONCE_SALT',       'UNIQUE_NONCE_SALT_HERE');

// WordPress Security
define('DISALLOW_FILE_EDIT', true);
define('DISALLOW_FILE_MODS', true);
define('FORCE_SSL_ADMIN', true);
define('WP_AUTO_UPDATE_CORE', 'minor');

// Debug Configuration (Production)
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);
define('SCRIPT_DEBUG', false);

// YPrint Plugin Configuration
define('OCTO_PRINT_DESIGNER_VERSION', '1.0.9');
define('YPRINT_PRODUCTION_MODE', true);
define('MEASUREMENT_PRECISION_TOLERANCE', 0.1);
define('YPRINT_MAX_CALCULATION_TIME_MS', 100);
define('YPRINT_MAX_API_RESPONSE_TIME_MS', 2000);

// Performance Settings
define('WP_MEMORY_LIMIT', '512M');
define('WP_MAX_MEMORY_LIMIT', '512M');
define('WP_CACHE', true);

// Database Table Prefix
$table_prefix = 'wp_prod_';

// WordPress URL Configuration
define('WP_HOME', 'https://your-domain.com');
define('WP_SITEURL', 'https://your-domain.com');

if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}

require_once ABSPATH . 'wp-settings.php';
?>
```

#### .htaccess Security Configuration
```apache
# .htaccess Security Configuration

# Prevent Access to wp-config.php
<Files wp-config.php>
    Order allow,deny
    Deny from all
</Files>

# Prevent Access to .htaccess
<Files .htaccess>
    Order allow,deny
    Deny from all
</Files>

# Prevent Directory Browsing
Options -Indexes

# Protect Include Files
<FilesMatch "^.*(error_log|wp-config\.php|php.ini|\.[hH][tT][aApP].*)$">
    Order allow,deny
    Deny from all
    Satisfy All
</FilesMatch>

# Block WordPress xmlrpc.php
<Files xmlrpc.php>
    Order allow,deny
    Deny from all
</Files>

# WordPress Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options nosniff
    Header set X-Frame-Options SAMEORIGIN
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
    Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"
</IfModule>

# WordPress Rewrite Rules
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
    RewriteBase /
    RewriteRule ^index\.php$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.php [L]
</IfModule>
```

### SSL/TLS Configuration

#### Let's Encrypt SSL Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache

# Obtain SSL Certificate
sudo certbot --apache -d your-domain.com

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## ⚡ Performance Optimization

### Object Caching Setup

#### Redis Object Cache Plugin Configuration
```php
// wp-content/mu-plugins/yprint-cache-config.php
<?php
// YPrint-specific cache configuration

// Enable object caching for precision calculations
add_filter('wp_redis_get_salt', function($salt) {
    return 'yprint_precision_' . $salt;
});

// Cache precision calculation results
add_action('init', function() {
    if (!wp_cache_get('yprint_cache_test')) {
        wp_cache_set('yprint_cache_test', true, 'yprint', 3600);
    }
});

// Clear precision cache on template updates
add_action('save_post', function($post_id) {
    if (get_post_type($post_id) === 'template') {
        wp_cache_flush_group('yprint_precision');
        wp_cache_flush_group('yprint_calculations');
    }
});
?>
```

### Database Optimization

#### MySQL Performance Tuning
```bash
# Install MySQL Tuner
wget http://mysqltuner.pl/ -O mysqltuner.pl
chmod +x mysqltuner.pl

# Run performance analysis
./mysqltuner.pl

# Optimize based on recommendations
# Common optimizations for YPrint:
```

```sql
-- Create optimized indexes for YPrint queries
CREATE INDEX idx_yprint_performance ON wp_options (option_name, option_value(50));
CREATE INDEX idx_template_meta ON wp_postmeta (post_id, meta_key, meta_value(50));

-- Optimize precision calculation queries
OPTIMIZE TABLE wp_template_measurements;
OPTIMIZE TABLE wp_posts;
OPTIMIZE TABLE wp_postmeta;
```

### PHP Performance Optimization

#### OPcache Configuration
```ini
; /etc/php/8.1/mods-available/opcache.ini

[opcache]
opcache.enable = 1
opcache.enable_cli = 1
opcache.memory_consumption = 256
opcache.interned_strings_buffer = 16
opcache.max_accelerated_files = 10000
opcache.validate_timestamps = 0
opcache.revalidate_freq = 0
opcache.fast_shutdown = 1
opcache.save_comments = 0
opcache.enable_file_override = 1

; YPrint-specific optimizations
opcache.optimization_level = 0x7FFFBFFF
opcache.huge_code_pages = 1
```

---

## 📊 Monitoring Setup

### System Monitoring

#### Prometheus Configuration
```yaml
# /etc/prometheus/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'yprint-system'
    static_configs:
      - targets: ['localhost:9100']  # Node Exporter

  - job_name: 'yprint-mysql'
    static_configs:
      - targets: ['localhost:9104']  # MySQL Exporter

  - job_name: 'yprint-redis'
    static_configs:
      - targets: ['localhost:9121']  # Redis Exporter

  - job_name: 'yprint-apache'
    static_configs:
      - targets: ['localhost:9117']  # Apache Exporter
```

#### Grafana Dashboard for YPrint
```json
{
  "dashboard": {
    "title": "YPrint Precision System Monitor",
    "panels": [
      {
        "title": "Precision Calculation Performance",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(yprint_precision_calculations_total[5m])",
            "legendFormat": "Calculations/sec"
          },
          {
            "expr": "yprint_precision_calculation_duration_seconds",
            "legendFormat": "Avg Duration"
          }
        ]
      },
      {
        "title": "System Resources",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg by (instance) (rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "CPU Usage %"
          },
          {
            "expr": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100",
            "legendFormat": "Memory Usage %"
          }
        ]
      }
    ]
  }
}
```

### Application Monitoring

#### WordPress Plugin for YPrint Monitoring
```php
<?php
// wp-content/mu-plugins/yprint-monitoring.php

class YPrint_Monitoring {

    public function __construct() {
        add_action('wp_ajax_yprint_precision_calculate', [$this, 'monitor_precision_calculation']);
        add_action('wp_ajax_nopriv_yprint_precision_calculate', [$this, 'monitor_precision_calculation']);
    }

    public function monitor_precision_calculation() {
        $start_time = microtime(true);
        $start_memory = memory_get_usage();

        // Execute original precision calculation
        do_action('yprint_original_precision_calculation');

        $end_time = microtime(true);
        $end_memory = memory_get_usage();

        // Log performance metrics
        $this->log_performance_metrics([
            'operation' => 'precision_calculation',
            'duration_ms' => ($end_time - $start_time) * 1000,
            'memory_used_kb' => ($end_memory - $start_memory) / 1024,
            'timestamp' => current_time('mysql'),
            'user_id' => get_current_user_id()
        ]);
    }

    private function log_performance_metrics($metrics) {
        global $wpdb;

        $wpdb->insert(
            $wpdb->prefix . 'yprint_performance_log',
            $metrics,
            ['%s', '%f', '%f', '%s', '%d']
        );

        // Also send to monitoring system if configured
        if (defined('YPRINT_MONITORING_ENDPOINT')) {
            wp_remote_post(YPRINT_MONITORING_ENDPOINT, [
                'body' => json_encode($metrics),
                'headers' => ['Content-Type' => 'application/json']
            ]);
        }
    }
}

new YPrint_Monitoring();
?>
```

### Log Management

#### Centralized Logging Configuration
```bash
# Install and configure rsyslog
sudo apt install rsyslog

# Configure log rotation
sudo nano /etc/logrotate.d/yprint
```

```
# /etc/logrotate.d/yprint
/var/log/yprint/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        systemctl reload rsyslog
    endscript
}
```

---

## 💾 Backup and Recovery

### Database Backup Strategy

#### Automated Daily Backups
```bash
#!/bin/bash
# /opt/yprint/scripts/backup-database.sh

# Configuration
DB_NAME="yprint_production"
DB_USER="yprint_prod"
DB_PASSWORD="DATABASE_PASSWORD"
BACKUP_DIR="/opt/yprint/backups/database"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate backup filename
BACKUP_FILE="$BACKUP_DIR/yprint_$(date +%Y%m%d_%H%M%S).sql"

# Create database backup
mysqldump -u$DB_USER -p$DB_PASSWORD --single-transaction --routines --triggers $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Remove old backups
find $BACKUP_DIR -name "yprint_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Upload to S3 (optional)
if [ -n "$AWS_S3_BUCKET" ]; then
    aws s3 cp $BACKUP_FILE.gz s3://$AWS_S3_BUCKET/database/
fi

# Log backup completion
echo "$(date): Database backup completed: $BACKUP_FILE.gz" >> /var/log/yprint/backup.log
```

#### Database Restoration Procedure
```bash
#!/bin/bash
# /opt/yprint/scripts/restore-database.sh

# Usage: ./restore-database.sh backup_file.sql.gz

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    exit 1
fi

BACKUP_FILE=$1
DB_NAME="yprint_production"
DB_USER="yprint_prod"
DB_PASSWORD="DATABASE_PASSWORD"

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file $BACKUP_FILE not found"
    exit 1
fi

# Create restoration confirmation
echo "WARNING: This will overwrite the current database!"
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"
read -p "Are you sure you want to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restoration cancelled"
    exit 1
fi

# Stop web server to prevent connections
sudo systemctl stop apache2

# Restore database
echo "Restoring database from $BACKUP_FILE..."
gunzip -c $BACKUP_FILE | mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME

# Start web server
sudo systemctl start apache2

echo "Database restoration completed"
echo "$(date): Database restored from $BACKUP_FILE" >> /var/log/yprint/restore.log
```

### File System Backup

#### WordPress Files Backup
```bash
#!/bin/bash
# /opt/yprint/scripts/backup-files.sh

WP_PATH="/var/www/html"
BACKUP_DIR="/opt/yprint/backups/files"
RETENTION_DAYS=14

# Create backup directory
mkdir -p $BACKUP_DIR

# Create tarball of WordPress files
tar -czf $BACKUP_DIR/yprint_files_$(date +%Y%m%d_%H%M%S).tar.gz \
    --exclude='wp-content/cache/*' \
    --exclude='wp-content/uploads/cache/*' \
    --exclude='*.log' \
    $WP_PATH

# Remove old backups
find $BACKUP_DIR -name "yprint_files_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "$(date): File system backup completed" >> /var/log/yprint/backup.log
```

---

## 🚀 Deployment Process

### Automated Deployment Script

#### Production Deployment
```bash
#!/bin/bash
# /opt/yprint/scripts/deploy.sh

set -e  # Exit on any error

# Configuration
WP_PATH="/var/www/html"
BACKUP_DIR="/opt/yprint/backups/deployment"
REPO_URL="https://github.com/your-org/yprint-designtool.git"
BRANCH="main"

# Create deployment backup
echo "Creating pre-deployment backup..."
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/pre_deploy_$(date +%Y%m%d_%H%M%S).tar.gz $WP_PATH

# Clone/update repository
echo "Updating codebase..."
if [ ! -d "/tmp/yprint-deploy" ]; then
    git clone -b $BRANCH $REPO_URL /tmp/yprint-deploy
else
    cd /tmp/yprint-deploy
    git pull origin $BRANCH
fi

# Run tests
echo "Running deployment tests..."
cd /tmp/yprint-deploy
composer install --no-dev --optimize-autoloader
./vendor/bin/phpunit tests/

# Deploy files
echo "Deploying files..."
rsync -av --exclude='.git' --exclude='tests' --exclude='node_modules' \
    /tmp/yprint-deploy/ $WP_PATH/wp-content/plugins/octoprint-designer/

# Set proper permissions
chown -R www-data:www-data $WP_PATH
chmod -R 755 $WP_PATH

# Update database if needed
echo "Running database updates..."
wp --path=$WP_PATH plugin activate octoprint-designer --allow-root

# Clear caches
echo "Clearing caches..."
wp --path=$WP_PATH cache flush --allow-root
redis-cli -a $REDIS_PASSWORD FLUSHALL

# Validate deployment
echo "Validating deployment..."
php $WP_PATH/wp-content/plugins/octoprint-designer/validate-system.php

echo "Deployment completed successfully!"
```

### Zero-Downtime Deployment

#### Blue-Green Deployment Setup
```bash
#!/bin/bash
# /opt/yprint/scripts/blue-green-deploy.sh

# Configuration
BLUE_PATH="/var/www/html"
GREEN_PATH="/var/www/html-green"
NGINX_CONFIG="/etc/nginx/sites-available/yprint"
CURRENT_UPSTREAM="yprint_blue"

# Determine which environment is currently active
if grep -q "yprint_green" $NGINX_CONFIG; then
    CURRENT_UPSTREAM="yprint_green"
    DEPLOY_PATH=$BLUE_PATH
    NEW_UPSTREAM="yprint_blue"
else
    DEPLOY_PATH=$GREEN_PATH
    NEW_UPSTREAM="yprint_green"
fi

echo "Deploying to: $DEPLOY_PATH"
echo "Will switch from: $CURRENT_UPSTREAM to: $NEW_UPSTREAM"

# Deploy to inactive environment
rsync -av --exclude='.git' $BLUE_PATH/ $DEPLOY_PATH/

# Update the new environment
cd $DEPLOY_PATH
composer install --no-dev --optimize-autoloader

# Run health checks on new environment
echo "Running health checks..."
php validate-system.php

# Switch traffic to new environment
echo "Switching traffic..."
sed -i "s/$CURRENT_UPSTREAM/$NEW_UPSTREAM/g" $NGINX_CONFIG
sudo systemctl reload nginx

# Verify switch was successful
sleep 5
curl -f http://localhost/wp-admin/admin-ajax.php?action=yprint_health_check

echo "Blue-green deployment completed!"
```

---

## ✅ Post-Deployment Validation

### Automated Validation Script

```bash
#!/bin/bash
# /opt/yprint/scripts/post-deploy-validation.sh

echo "Starting post-deployment validation..."

# Test 1: System Health Check
echo "1. System health check..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://your-domain.com)
if [ $HTTP_CODE -eq 200 ]; then
    echo "   ✅ Website responding (HTTP $HTTP_CODE)"
else
    echo "   ❌ Website error (HTTP $HTTP_CODE)"
    exit 1
fi

# Test 2: WordPress Admin Access
echo "2. WordPress admin check..."
ADMIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://your-domain.com/wp-admin/)
if [ $ADMIN_CODE -eq 200 ] || [ $ADMIN_CODE -eq 302 ]; then
    echo "   ✅ WordPress admin accessible"
else
    echo "   ❌ WordPress admin error (HTTP $ADMIN_CODE)"
    exit 1
fi

# Test 3: Database Connectivity
echo "3. Database connectivity..."
DB_TEST=$(mysql -u yprint_prod -p$DB_PASSWORD -e "SELECT 1" yprint_production 2>&1)
if [ $? -eq 0 ]; then
    echo "   ✅ Database connection successful"
else
    echo "   ❌ Database connection failed"
    exit 1
fi

# Test 4: Redis Connectivity
echo "4. Redis connectivity..."
REDIS_TEST=$(redis-cli -a $REDIS_PASSWORD ping 2>&1)
if [ "$REDIS_TEST" = "PONG" ]; then
    echo "   ✅ Redis connection successful"
else
    echo "   ❌ Redis connection failed"
    exit 1
fi

# Test 5: YPrint Plugin Status
echo "5. YPrint plugin status..."
PLUGIN_STATUS=$(wp --path=/var/www/html plugin status octoprint-designer --allow-root | grep "Status")
if [[ $PLUGIN_STATUS == *"Active"* ]]; then
    echo "   ✅ YPrint plugin active"
else
    echo "   ❌ YPrint plugin not active"
    exit 1
fi

# Test 6: Precision System Functionality
echo "6. Precision system test..."
PRECISION_TEST=$(php /var/www/html/wp-content/plugins/octoprint-designer/validate-system.php 2>&1)
if [[ $PRECISION_TEST == *"SUCCESS"* ]]; then
    echo "   ✅ Precision system operational"
else
    echo "   ❌ Precision system error"
    echo "   Error details: $PRECISION_TEST"
    exit 1
fi

# Test 7: Performance Benchmarks
echo "7. Performance benchmarks..."
PERF_TEST=$(curl -s -w "Time: %{time_total}s\n" https://your-domain.com/wp-admin/admin-ajax.php?action=yprint_performance_test)
RESPONSE_TIME=$(echo $PERF_TEST | grep "Time:" | cut -d' ' -f2 | sed 's/s//')
if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
    echo "   ✅ Performance within limits ($RESPONSE_TIME seconds)"
else
    echo "   ⚠️  Performance warning ($RESPONSE_TIME seconds)"
fi

echo "Post-deployment validation completed successfully!"
```

### Manual Validation Checklist

#### Functional Testing
- [ ] Website loads correctly
- [ ] WordPress admin accessible
- [ ] YPrint plugin active and functional
- [ ] Design interface loads properly
- [ ] Precision calculations working
- [ ] Template measurements accessible
- [ ] Save functionality operational
- [ ] API integration functional

#### Performance Testing
- [ ] Page load times < 3 seconds
- [ ] Precision calculations < 100ms
- [ ] Database queries optimized
- [ ] Cache hit ratios > 80%
- [ ] Memory usage within limits
- [ ] CPU usage reasonable

#### Security Testing
- [ ] SSL certificate valid
- [ ] Security headers present
- [ ] File permissions correct
- [ ] Database access restricted
- [ ] Admin access secured
- [ ] API endpoints protected

---

## 🔄 Rollback Procedures

### Immediate Rollback

#### Emergency Rollback Script
```bash
#!/bin/bash
# /opt/yprint/scripts/emergency-rollback.sh

echo "EMERGENCY ROLLBACK INITIATED"

# Find latest pre-deployment backup
LATEST_BACKUP=$(ls -t /opt/yprint/backups/deployment/pre_deploy_*.tar.gz | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "ERROR: No backup found for rollback!"
    exit 1
fi

echo "Rolling back to: $LATEST_BACKUP"

# Stop web server
sudo systemctl stop apache2

# Restore files from backup
tar -xzf $LATEST_BACKUP -C /

# Restore database if available
DB_BACKUP=$(ls -t /opt/yprint/backups/database/yprint_*.sql.gz | head -1)
if [ -n "$DB_BACKUP" ]; then
    echo "Restoring database from: $DB_BACKUP"
    gunzip -c $DB_BACKUP | mysql -u yprint_prod -p$DB_PASSWORD yprint_production
fi

# Clear caches
redis-cli -a $REDIS_PASSWORD FLUSHALL

# Start web server
sudo systemctl start apache2

# Validate rollback
sleep 5
curl -f http://localhost/

echo "Emergency rollback completed!"
```

### Partial Rollback

#### Plugin-Only Rollback
```bash
#!/bin/bash
# /opt/yprint/scripts/rollback-plugin.sh

PLUGIN_PATH="/var/www/html/wp-content/plugins/octoprint-designer"
BACKUP_DIR="/opt/yprint/backups/plugin"

# Find latest plugin backup
LATEST_PLUGIN_BACKUP=$(ls -t $BACKUP_DIR/plugin_*.tar.gz | head -1)

if [ -z "$LATEST_PLUGIN_BACKUP" ]; then
    echo "ERROR: No plugin backup found!"
    exit 1
fi

echo "Rolling back plugin to: $LATEST_PLUGIN_BACKUP"

# Deactivate plugin
wp --path=/var/www/html plugin deactivate octoprint-designer --allow-root

# Remove current plugin
rm -rf $PLUGIN_PATH

# Restore plugin from backup
mkdir -p $PLUGIN_PATH
tar -xzf $LATEST_PLUGIN_BACKUP -C $PLUGIN_PATH

# Reactivate plugin
wp --path=/var/www/html plugin activate octoprint-designer --allow-root

# Clear caches
wp --path=/var/www/html cache flush --allow-root

echo "Plugin rollback completed!"
```

---

## 🔧 Maintenance and Updates

### Regular Maintenance Tasks

#### Daily Maintenance Script
```bash
#!/bin/bash
# /opt/yprint/scripts/daily-maintenance.sh

echo "Starting daily maintenance..."

# Update WordPress core (minor updates only)
wp --path=/var/www/html core update --minor --allow-root

# Update plugins (excluding YPrint)
wp --path=/var/www/html plugin update --exclude=octoprint-designer --allow-root

# Optimize database
wp --path=/var/www/html db optimize --allow-root

# Clear expired transients
wp --path=/var/www/html transient delete --expired --allow-root

# Clean up log files
find /var/log/yprint -name "*.log" -size +100M -exec truncate -s 50M {} \;

# Update SSL certificate if needed
certbot renew --quiet

echo "Daily maintenance completed"
```

#### Weekly Maintenance Script
```bash
#!/bin/bash
# /opt/yprint/scripts/weekly-maintenance.sh

echo "Starting weekly maintenance..."

# Full database backup
/opt/yprint/scripts/backup-database.sh

# File system backup
/opt/yprint/scripts/backup-files.sh

# Analyze slow queries
mysqldumpslow /var/log/mysql/slow.log > /opt/yprint/reports/slow-queries-$(date +%Y%m%d).txt

# Generate performance report
php /var/www/html/wp-content/plugins/octoprint-designer/generate-performance-report.php > /opt/yprint/reports/performance-$(date +%Y%m%d).txt

# Clean old backups
find /opt/yprint/backups -type f -mtime +30 -delete

echo "Weekly maintenance completed"
```

### Update Procedures

#### YPrint Plugin Update Process
```bash
#!/bin/bash
# /opt/yprint/scripts/update-yprint.sh

NEW_VERSION=$1

if [ -z "$NEW_VERSION" ]; then
    echo "Usage: $0 <new_version>"
    exit 1
fi

echo "Updating YPrint to version $NEW_VERSION..."

# Create backup
/opt/yprint/scripts/backup-database.sh
/opt/yprint/scripts/backup-files.sh

# Download and validate new version
cd /tmp
wget https://releases.yprint.com/v$NEW_VERSION/yprint-designtool-$NEW_VERSION.zip
unzip yprint-designtool-$NEW_VERSION.zip

# Run pre-update tests
cd yprint-designtool-$NEW_VERSION
composer install --no-dev
./vendor/bin/phpunit tests/

# Deploy update
rsync -av --exclude='.git' --exclude='tests' \
    /tmp/yprint-designtool-$NEW_VERSION/ \
    /var/www/html/wp-content/plugins/octoprint-designer/

# Run database migrations if needed
if [ -f "migrations/migrate-$NEW_VERSION.php" ]; then
    php migrations/migrate-$NEW_VERSION.php
fi

# Clear caches
wp --path=/var/www/html cache flush --allow-root
redis-cli -a $REDIS_PASSWORD FLUSHALL

# Validate update
php /var/www/html/wp-content/plugins/octoprint-designer/validate-system.php

echo "YPrint update to version $NEW_VERSION completed!"
```

---

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] System requirements verified
- [ ] Security configurations applied
- [ ] Database optimizations completed
- [ ] Backup systems tested
- [ ] Monitoring systems configured
- [ ] SSL certificates obtained
- [ ] DNS records configured
- [ ] Load balancer setup (if applicable)
- [ ] CDN configuration (if applicable)

### During Deployment

- [ ] Pre-deployment backup created
- [ ] Code deployed to staging environment
- [ ] Tests executed successfully
- [ ] Database migrations applied
- [ ] Configuration files updated
- [ ] File permissions set correctly
- [ ] Caches cleared
- [ ] Services restarted

### Post-Deployment

- [ ] Website accessibility verified
- [ ] Admin panel functional
- [ ] Plugin activation successful
- [ ] Precision system operational
- [ ] Performance benchmarks met
- [ ] Security scan passed
- [ ] Monitoring systems active
- [ ] Backup verification completed
- [ ] Documentation updated
- [ ] Team notified

---

*This deployment guide is part of the YPrint Design Tool Precision System v1.0.9*
*Last updated: September 26, 2025*
*For technical details, see: ISSUE-23-PRECISION-TESTING.md*
*For user instructions, see: USER-MANUAL-PRECISION-SYSTEM.md*
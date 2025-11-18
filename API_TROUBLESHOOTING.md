# AllesKlarDruck API Connection Troubleshooting

## Problem
You're getting a "Could not connect to server" error with HTTP Status 500 when testing the API connection, even though your credentials are correct.

## Recent Improvements
I've enhanced the API connection testing with better error handling and debugging information. The improvements include:

1. **Enhanced Error Handling**: More detailed error messages and debugging information
2. **Step-by-step Testing**: Tests basic connectivity before attempting authenticated requests
3. **Multiple Endpoint Testing**: Tries different API endpoints to find one that works
4. **Credential Validation**: Validates the format of your API credentials
5. **Debug Information**: Shows detailed information about what's being tested

## Quick Diagnosis Steps

### 1. Run the Network Test
First, test basic network connectivity:

```bash
php test_curl.php
```

This will test:
- Basic connectivity to the API server
- DNS resolution
- SSL certificate validity
- Port 443 accessibility

### 2. Run the WordPress API Test
If the network test passes, run the WordPress-specific test:

```bash
php test_api_connection.php
```

This will test:
- WordPress HTTP functions
- API credentials configuration
- Authenticated API requests
- Specific API endpoints

### 3. Check WordPress Debug Log
Enable WordPress debugging to see detailed error messages:

Add this to your `wp-config.php`:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Then check the debug log at `wp-content/debug.log` for detailed error messages.

## Common Issues and Solutions

### Issue 1: Network Connectivity Problems
**Symptoms**: All tests fail with network errors
**Solutions**:
- Check your internet connection
- Verify your server can reach external HTTPS sites
- Contact your hosting provider if the server is behind a firewall

### Issue 2: SSL Certificate Problems
**Symptoms**: SSL verification errors
**Solutions**:
- Update your server's SSL certificates
- Check if your server supports modern SSL protocols
- Contact your hosting provider

### Issue 3: API Credentials Issues
**Symptoms**: 401 Unauthorized errors
**Solutions**:
- Double-check your App ID and API Key
- Ensure there are no extra spaces or characters
- Verify the credentials are active in your AllesKlarDruck account

### Issue 4: API Server Issues
**Symptoms**: 500 Server Error responses
**Solutions**:
- The API server might be temporarily down
- Contact AllesKlarDruck support
- Try again later

### Issue 5: WordPress Configuration Issues
**Symptoms**: Tests pass but WordPress plugin fails
**Solutions**:
- Check WordPress HTTP timeout settings
- Verify WordPress can make external HTTP requests
- Check for conflicting plugins

## Enhanced Test Connection

The improved test connection now:

1. **Validates Credentials Format**: Checks if App ID and API Key are properly formatted
2. **Tests Basic Connectivity**: Verifies the server is reachable before attempting authenticated requests
3. **Tries Multiple Endpoints**: Tests `/api/v1/health`, `/api/health`, `/health`, `/status`, and `/`
4. **Provides Debug Information**: Shows exactly what's being tested and where it fails
5. **Better Error Messages**: More specific error messages to help identify the issue

## Debug Information

When you click "Test Connection", you'll now see detailed debug information including:
- Which endpoints were tested
- What errors occurred for each endpoint
- Response times and status codes
- Step-by-step testing process

## Getting Help

If you're still having issues:

1. **Run the test scripts** and share the output
2. **Check the WordPress debug log** for detailed error messages
3. **Contact AllesKlarDruck support** if the API server is unreachable
4. **Contact your hosting provider** if network tests fail

## Test Scripts

### test_curl.php
Tests basic network connectivity without WordPress dependencies.

### test_api_connection.php
Tests API connectivity using WordPress functions and your configured credentials.

Run these scripts from your WordPress root directory to get detailed diagnostic information. 
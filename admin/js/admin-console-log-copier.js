/**
 * Admin Console Log Copier
 * Adds a button for admins to copy all console logs to clipboard
 */
(function() {
    'use strict';

    // Only load for admin users
    if (typeof octoPrintDesignerAdmin === 'undefined' || !octoPrintDesignerAdmin.isAdmin) {
        return;
    }

    let consoleLogBuffer = [];
    let originalConsoleLog = console.log;
    let originalConsoleError = console.error;
    let originalConsoleWarn = console.warn;
    let originalConsoleInfo = console.info;

    // Override console methods to capture logs
    console.log = function(...args) {
        consoleLogBuffer.push({
            type: 'log',
            timestamp: new Date().toISOString(),
            args: args
        });
        originalConsoleLog.apply(console, args);
    };

    console.error = function(...args) {
        consoleLogBuffer.push({
            type: 'error',
            timestamp: new Date().toISOString(),
            args: args
        });
        originalConsoleError.apply(console, args);
    };

    console.warn = function(...args) {
        consoleLogBuffer.push({
            type: 'warn',
            timestamp: new Date().toISOString(),
            args: args
        });
        originalConsoleWarn.apply(console, args);
    };

    console.info = function(...args) {
        consoleLogBuffer.push({
            type: 'info',
            timestamp: new Date().toISOString(),
            args: args
        });
        originalConsoleInfo.apply(console, args);
    };

    // Function to copy all console logs
    function copyAllConsoleLogs() {
        if (consoleLogBuffer.length === 0) {
            alert('No console logs to copy');
            return;
        }

        let logText = '=== CONSOLE LOGS ===\n\n';

        consoleLogBuffer.forEach(function(logEntry) {
            logText += `[${logEntry.timestamp}] ${logEntry.type.toUpperCase()}: `;

            let argsText = logEntry.args.map(function(arg) {
                if (typeof arg === 'object') {
                    try {
                        return JSON.stringify(arg, null, 2);
                    } catch (e) {
                        return String(arg);
                    }
                } else {
                    return String(arg);
                }
            }).join(' ');

            logText += argsText + '\n';
        });

        // Copy to clipboard
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(logText).then(function() {
                alert('Console logs copied to clipboard!');
            }).catch(function(err) {
                fallbackCopyTextToClipboard(logText);
            });
        } else {
            fallbackCopyTextToClipboard(logText);
        }
    }

    // Fallback for older browsers
    function fallbackCopyTextToClipboard(text) {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            if (successful) {
                alert('Console logs copied to clipboard!');
            } else {
                alert('Failed to copy console logs');
            }
        } catch (err) {
            alert('Failed to copy console logs: ' + err);
        }

        document.body.removeChild(textArea);
    }

    // Add button to admin bar when DOM is ready
    function addConsoleLogButton() {
        // Check if admin bar exists
        var adminBar = document.getElementById('wpadminbar');
        if (!adminBar) {
            // If no admin bar, add to page content
            addButtonToPageContent();
            return;
        }

        // Create button element
        var buttonContainer = document.createElement('li');
        buttonContainer.id = 'wp-admin-bar-console-logs';
        buttonContainer.className = 'menupop';

        var button = document.createElement('a');
        button.className = 'ab-item';
        button.href = '#';
        button.title = 'Copy all console logs to clipboard';
        button.innerHTML = '<span class="ab-icon dashicons dashicons-admin-tools"></span><span class="ab-label">Copy Console Logs</span>';
        button.style.cssText = 'color: #ff6b35 !important; text-decoration: none !important;';

        button.addEventListener('click', function(e) {
            e.preventDefault();
            copyAllConsoleLogs();
        });

        buttonContainer.appendChild(button);

        // Add to admin bar top menu
        var topMenu = adminBar.querySelector('#wp-admin-bar-top-secondary');
        if (topMenu) {
            topMenu.appendChild(buttonContainer);
        } else {
            var rootGroup = adminBar.querySelector('#wp-admin-bar-root-default');
            if (rootGroup) {
                rootGroup.appendChild(buttonContainer);
            }
        }
    }

    // Fallback: Add button to page content if admin bar not available
    function addButtonToPageContent() {
        var button = document.createElement('button');
        button.id = 'console-log-copy-button';
        button.innerHTML = '📋 Copy All Console Logs';
        button.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 999999;
            background: #ff6b35;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;

        button.addEventListener('click', function(e) {
            e.preventDefault();
            copyAllConsoleLogs();
        });

        document.body.appendChild(button);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addConsoleLogButton);
    } else {
        addConsoleLogButton();
    }

    // Add clear logs functionality (optional)
    window.clearConsoleLogs = function() {
        consoleLogBuffer = [];
        console.log('Console log buffer cleared by admin');
    };

})();
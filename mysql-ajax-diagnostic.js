/**
 * 🔍 MYSQL LIMITS AJAX DIAGNOSTIC
 * Client-side script to check MySQL limits via WordPress AJAX
 */

console.log('🔍 MYSQL DIAGNOSTIC: Starting MySQL limits check...');

// Function to check MySQL limits via AJAX
async function checkMySQLLimits() {
    const config = window.octo_print_designer_config;

    if (!config || !config.ajax_url) {
        console.error('❌ MYSQL DIAGNOSTIC: WordPress AJAX configuration not available');
        return false;
    }

    console.log('🔍 MYSQL DIAGNOSTIC: Sending AJAX request to check MySQL limits...');

    try {
        const response = await fetch(config.ajax_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'yprint_mysql_diagnostic',
                nonce: config.nonce || 'test'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        console.log('🔍 MYSQL DIAGNOSTIC RESULTS:');
        console.log('============================');
        console.log(result);

        if (result.success && result.data) {
            const data = result.data;

            console.log('📊 MYSQL CONFIGURATION:');
            if (data.max_allowed_packet) {
                const mb = Math.round(data.max_allowed_packet / 1024 / 1024 * 100) / 100;
                console.log(`   max_allowed_packet: ${data.max_allowed_packet.toLocaleString()} bytes (${mb} MB)`);

                // Check if sufficient for PNG storage
                const minRecommended = 10 * 1024 * 1024; // 10MB
                if (data.max_allowed_packet < minRecommended) {
                    console.error(`❌ MYSQL: max_allowed_packet too small for PNG storage!`);
                    console.error(`   Current: ${mb} MB, Recommended: 10+ MB`);
                } else {
                    console.log(`✅ MYSQL: max_allowed_packet sufficient for PNG storage`);
                }
            }

            if (data.mysql_version) {
                console.log(`   MySQL Version: ${data.mysql_version}`);
            }

            if (data.table_info) {
                console.log('📋 TABLE ANALYSIS:');
                Object.entries(data.table_info).forEach(([key, value]) => {
                    console.log(`   ${key}: ${value}`);
                });
            }

            if (data.recommendations) {
                console.log('💡 RECOMMENDATIONS:');
                data.recommendations.forEach(rec => {
                    console.log(`   ${rec}`);
                });
            }

            return data;
        } else {
            console.error('❌ MYSQL DIAGNOSTIC: Failed to get MySQL information');
            console.error('Response:', result);
            return false;
        }

    } catch (error) {
        console.error('❌ MYSQL DIAGNOSTIC: Error during AJAX request:', error);
        return false;
    }
}

// Auto-run the diagnostic
setTimeout(() => {
    checkMySQLLimits().then(result => {
        if (result) {
            console.log('✅ MYSQL DIAGNOSTIC: Completed successfully');
            window.mysqlDiagnosticResult = result;
        } else {
            console.log('❌ MYSQL DIAGNOSTIC: Failed to complete');
        }
    });
}, 2000);

// Make function globally available
window.checkMySQLLimits = checkMySQLLimits;

console.log('🔍 MYSQL DIAGNOSTIC: Script loaded, diagnostic will run in 2 seconds...');
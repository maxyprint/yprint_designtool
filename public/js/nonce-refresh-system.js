/**
 * YPrint Nonce Refresh System
 * Prevents 403 nonce errors for users working on designs for extended periods
 *
 * Automatically refreshes WordPress nonces every 10 minutes to prevent expiration
 */

class YPrintNonceRefreshSystem {
    constructor() {
        this.refreshInterval = 10 * 60 * 1000; // 10 minutes
        this.maxRetries = 3;
        this.isRefreshing = false;
        this.intervalId = null;

        this.init();
    }

    init() {
        // Only initialize if WordPress config is available
        if (!window.octo_print_designer_config) {
            console.warn('⚠️ NONCE REFRESH: WordPress config not available, skipping nonce refresh system');
            return;
        }

        console.log('🔄 NONCE REFRESH: Initializing automatic nonce refresh system');

        // Start the refresh interval
        this.startRefreshInterval();

        // Refresh nonce before each critical operation
        this.attachToSaveOperations();

        // Refresh on focus (user returns to tab)
        this.attachFocusListener();
    }

    startRefreshInterval() {
        this.intervalId = setInterval(() => {
            this.refreshNonce();
        }, this.refreshInterval);

        console.log(`🔄 NONCE REFRESH: Auto-refresh started (every ${this.refreshInterval/60000} minutes)`);
    }

    stopRefreshInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('🔄 NONCE REFRESH: Auto-refresh stopped');
        }
    }

    async refreshNonce(retryCount = 0) {
        if (this.isRefreshing) {
            console.log('🔄 NONCE REFRESH: Already refreshing, skipping...');
            return;
        }

        this.isRefreshing = true;

        try {
            console.log('🔄 NONCE REFRESH: Requesting new nonce...');

            const response = await fetch(window.octo_print_designer_config.ajax_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    action: 'yprint_refresh_nonce'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success && result.data && result.data.nonce) {
                // Update the global nonce
                window.octo_print_designer_config.nonce = result.data.nonce;

                console.log('✅ NONCE REFRESH: Successfully updated nonce');

                // Dispatch event for other systems to update their nonces
                window.dispatchEvent(new CustomEvent('yprintNonceRefreshed', {
                    detail: { nonce: result.data.nonce }
                }));

            } else {
                throw new Error(result.data || 'Unknown error refreshing nonce');
            }

        } catch (error) {
            console.error('❌ NONCE REFRESH: Failed to refresh nonce:', error);

            // Retry logic
            if (retryCount < this.maxRetries) {
                const delay = (retryCount + 1) * 2000; // 2s, 4s, 6s
                console.log(`🔄 NONCE REFRESH: Retrying in ${delay/1000}s... (attempt ${retryCount + 1}/${this.maxRetries})`);

                setTimeout(() => {
                    this.refreshNonce(retryCount + 1);
                }, delay);
            } else {
                console.error('❌ NONCE REFRESH: Maximum retries exceeded. Manual page refresh may be required.');
            }
        } finally {
            this.isRefreshing = false;
        }
    }

    attachToSaveOperations() {
        // Listen for save events and refresh nonce beforehand
        document.addEventListener('click', async (event) => {
            const button = event.target;

            // Check if this is a save button
            if (this.isSaveButton(button)) {
                console.log('🔄 NONCE REFRESH: Save operation detected, ensuring fresh nonce...');

                // Refresh nonce before save operation
                await this.refreshNonce();
            }
        }, true); // Use capture phase to run before other handlers

        console.log('🔄 NONCE REFRESH: Attached to save operations');
    }

    isSaveButton(element) {
        if (!element || !element.tagName) return false;

        const isButton = element.tagName.toLowerCase() === 'button';
        const hasClass = element.classList.contains('designer-action-button') ||
                        element.classList.contains('designer-modal-save');
        const hasText = element.textContent &&
                       (element.textContent.includes('Save') ||
                        element.textContent.includes('speichern'));

        return isButton && (hasClass || hasText);
    }

    attachFocusListener() {
        let isHidden = false;

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                isHidden = true;
            } else if (isHidden) {
                // User returned to tab, refresh nonce
                console.log('🔄 NONCE REFRESH: User returned to tab, refreshing nonce...');
                this.refreshNonce();
                isHidden = false;
            }
        });

        console.log('🔄 NONCE REFRESH: Attached focus listener');
    }

    // Manual refresh method for debugging
    async forceRefresh() {
        console.log('🔄 NONCE REFRESH: Manual refresh requested');
        await this.refreshNonce();
    }

    // Get current nonce status
    getStatus() {
        return {
            nonceExists: !!window.octo_print_designer_config?.nonce,
            currentNonce: window.octo_print_designer_config?.nonce ? 'present' : 'missing',
            isRefreshing: this.isRefreshing,
            refreshInterval: this.refreshInterval,
            intervalActive: !!this.intervalId
        };
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.yprintNonceRefresh = new YPrintNonceRefreshSystem();
    });
} else {
    window.yprintNonceRefresh = new YPrintNonceRefreshSystem();
}

// Debug commands
window.debugNonceRefresh = () => {
    console.log('🔄 NONCE REFRESH DEBUG:', window.yprintNonceRefresh?.getStatus());
    if (window.yprintNonceRefresh) {
        window.yprintNonceRefresh.forceRefresh();
    }
};

console.log('🔄 NONCE REFRESH: System loaded and ready');
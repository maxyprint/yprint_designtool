export class ToastManager {
    constructor(container) {
        if (!container) throw new Error('Container element is required');
        
        this.container = container;
        this.toastContainer = null;
        
        this.initialize();
    }

    initialize() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'toast-container';
        this.container.appendChild(this.toastContainer);
    }

    /**
     * Show a toast message
     * @param {string} message - The message to display
     * @param {string} type - Type of toast (success, error, info)
     * @param {Object} options - Configuration options
     * @param {number|null} options.duration - Duration in ms before auto-close (null for manual close)
     */
    show(message, type = 'info', options = {}) {
        const defaultOptions = {
            duration: 1500 // null means manual close only
        };

        const config = { ...defaultOptions, ...options };
        const toastElement = this.createToastElement(message, type, config);
        
        this.toastContainer.appendChild(toastElement);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toastElement.classList.add('show');
        });

        // Set up auto-close if duration is provided
        if (config.duration !== null) {
            setTimeout(() => {
                this.removeToast(toastElement);
            }, config.duration);
        }
    }

    createToastElement(message, type, config) {
        const toast = document.createElement('div');
        toast.className = `toast-item ${type}`;
        
        // Create icon
        const icon = document.createElement('div');
        icon.className = `toast-icon ${type}`;
        
        switch (type) {
            case 'success':
                icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>`;
                break;
            case 'error':
                icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>`;
                break;
            default:
                icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>`;
        }
        
        // Create message container
        const messageSpan = document.createElement('span');
        messageSpan.className = 'toast-content';
        messageSpan.textContent = message;
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'toast-close';
        closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>`;
        
        closeButton.addEventListener('click', () => {
            this.removeToast(toast);
        });
        
        // Assemble toast
        toast.appendChild(icon);
        toast.appendChild(messageSpan);
        toast.appendChild(closeButton);
        
        return toast;
    }

    removeToast(element) {
        element.classList.remove('show');
        
        // Remove element after animation
        element.addEventListener('transitionend', () => {
            element.remove();
        }, { once: true });
    }
}
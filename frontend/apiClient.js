class ApiClient {
    static cache = new Map();
    static pendingControllers = new Map();

    /**
     * Perform an optimized fetch request
     * @param {string} url - API Endpoint
     * @param {Object} [options={}] - Fetch options
     * @param {number} [cacheTtl=5000] - Cache TTL in ms (default 5 seconds for GET)
     */
    static async fetch(url, options = {}, cacheTtl = 5000) {
        const method = (options.method || 'GET').toUpperCase();
        
        // 1. Request Cancellation: Cancel duplicate pending requests of same URL/method
        const reqKey = `${method}:${url}`;
        if (this.pendingControllers.has(reqKey)) {
            this.pendingControllers.get(reqKey).abort();
        }

        const controller = new AbortController();
        this.pendingControllers.set(reqKey, controller);
        options.signal = controller.signal;

        try {
            // 2. Memory Caching for GET requests
            if (method === 'GET') {
                const cached = this.cache.get(url);
                if (cached && (Date.now() - cached.time < cacheTtl)) {
                    return cached.data;
                }
            }

            const response = await fetch(url, options);
            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: 'API Error' }));
                throw new Error(err.error || `HTTP ${response.status}`);
            }

            const data = await response.json();

            // Store in cache if GET
            if (method === 'GET') {
                this.cache.set(url, { data, time: Date.now() });
            }

            return data;
        } catch (err) {
            if (err.name === 'AbortError') {
                return { aborted: true };
            }
            throw err;
        } finally {
            if (this.pendingControllers.get(reqKey) === controller) {
                this.pendingControllers.delete(reqKey);
            }
        }
    }

    /**
     * Debounce wrapper to prevent double-saving or spam clicking
     */
    static debounce(fn, delay) {
        let timer = null;
        return function (...args) {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                fn.apply(this, args);
            }, delay);
        };
    }
}

// Expose to window
if (typeof window !== 'undefined') {
    window.ApiClient = ApiClient;
}

export default ApiClient;

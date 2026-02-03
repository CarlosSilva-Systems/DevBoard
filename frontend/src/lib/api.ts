export const api = {
    async request(endpoint: string, options: RequestInit = {}) {
        const token = localStorage.getItem('token');

        const defaultHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (options.body instanceof FormData || options.body instanceof URLSearchParams) {
            delete defaultHeaders['Content-Type'];
        }

        const headers: HeadersInit = {
            ...defaultHeaders,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const res = await fetch(endpoint, {
            ...options,
            headers,
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || res.statusText);
        }

        // Return null for 204 No Content
        if (res.status === 204) return null;

        try {
            return await res.json();
        } catch (e) {
            return null;
        }
    },

    get(endpoint: string) {
        return this.request(endpoint);
    },

    post(endpoint: string, body: any) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    postForm(endpoint: string, formData: BodyInit) {
        // Content-Type header not set manually to let browser set boundary for FormData, 
        // BUT for x-www-form-urlencoded it is different.
        // Backend expects x-www-form-urlencoded for login.
        // This function needs to be careful.
        // If it's URLSearchParams, browser sets standard form-urlencoded header.
        return this.request(endpoint, {
            method: 'POST',
            body: formData,
            headers: {
                // Fetch handles Content-Type for FormData and URLSearchParams automatically
            }
        });
    },

    put(endpoint: string, body: any) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },

    delete(endpoint: string) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }
};

import axios from 'axios';

export async function getCsrfToken() {
    try {
        // 1: Request CSRF cookie
        await axios.get(`${process.env.NEXT_PUBLIC_URL}/sanctum/csrf-cookie`, {
            withCredentials: true
        });

        // 2: Extract XSRF-TOKEN from document.cookie
        const xsrfToken = document.cookie
            .split('; ')
            .find(cookie => cookie.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];
        console.log(xsrfToken)
        if (!xsrfToken) {
            console.error('XSRF-TOKEN not found in cookies');
            return null;
        }

        return decodeURIComponent(xsrfToken);
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        return null;
    }
}

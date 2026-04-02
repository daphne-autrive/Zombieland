// Axios instance configured with CSRF token support
// Reads the XSRF-TOKEN cookie and sends it automatically as X-XSRF-TOKEN header

import axios from 'axios'
import { API_URL } from '@/config/api'

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,        // sends httpOnly JWT cookie
    xsrfCookieName: 'XSRF-TOKEN', // reads this cookie
    xsrfHeaderName: 'X-XSRF-TOKEN' // sends it in this header
})

// Manually read XSRF-TOKEN cookie and add it to every request header
// Needed because Axios doesn't send XSRF header automatically in cross-origin requests
axiosInstance.interceptors.request.use((config) => {
    const match = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
    const csrfToken = match?.split('=')[1]
    if (csrfToken) {
        config.headers['X-XSRF-TOKEN'] = csrfToken
    }
    return config
})

export default axiosInstance
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Helper function to get access token from cookies
const getAccessToken = () => {
	const cookies = document.cookie.split(';')
	const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='))
	return accessTokenCookie ? accessTokenCookie.split('=')[1] : null
}

// Create axios instance with default config
const api = axios.create({
	baseURL: API_URL,
	withCredentials: true, // This ensures cookies are sent with requests
	headers: {
		'Content-Type': 'application/json',
	},
})

// Request interceptor to add Authorization header
api.interceptors.request.use(
	(config) => {
		const accessToken = getAccessToken()
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`
		}
		return config
	},
	(error) => {
		return Promise.reject(error)
	}
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config

		// Only retry if it's a 401 error, not already retried, and not a refresh request
		if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
			originalRequest._retry = true

			try {
				// Try to refresh the token
				await api.post('/auth/refresh')
				// Retry the original request
				return api(originalRequest)
			} catch (refreshError) {
				// If refresh fails, clear any existing auth state and redirect
				// Use window.location to force a full page reload and clear any cached state
				if (window.location.pathname !== '/login') {
					window.location.href = '/login'
				}
				return Promise.reject(refreshError)
			}
		}

		return Promise.reject(error)
	}
)

export { API_URL }
export default api

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import api from '@/services/api'
import AuthContext from './auth-context'

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	async function fetchMe() {
		try {
			const res = await api.get('/auth/me')
			setUser(res.data.user)
		} catch {
			setUser(null)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchMe()
	}, [])

	const login = useCallback(async (username, password) => {
		setError(null)
		try {
			const res = await api.post('/auth/login', { username, password })
			// Set user immediately from login response
			setUser(res.data.user)
			return res.data
		} catch (err) {
			const message = err.response?.data?.message || err.message || 'Login failed'
			setError(message)
			throw new Error(message)
		}
	}, [])

	const logout = useCallback(async () => {
		try {
			await api.post('/auth/logout')
		} catch {
			// Ignore logout errors
		} finally {
			setUser(null)
		}
	}, [])

	const clearAuth = useCallback(() => {
		setUser(null)
		setLoading(false)
		setError(null)
	}, [])

	const updateUser = useCallback((userData) => {
		setUser(userData)
	}, [])

	const value = useMemo(() => {
		return {
			user,
			setUser,
			loading,
			error,
			login,
			logout,
			clearAuth,
			updateUser
		}
	}, [user, loading, error, login, logout, clearAuth, updateUser])

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}

// Only export provider from this file to keep fast refresh happy. The hook lives in '@/hooks/useAuth'.


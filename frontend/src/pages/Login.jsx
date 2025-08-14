import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import useAuth from '@/hooks/useAuth'
import logo from '@/assets/logo.png'

const Login = () => {
	const { user, login, loading } = useAuth()
	const navigate = useNavigate()
	const [form, setForm] = useState({ username: '', password: '' })
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')

	// Redirect if already authenticated
	useEffect(() => {
		if (user && !loading) {
			navigate('/admin', { replace: true })
		}
	}, [user, loading, navigate])

	async function handleSubmit(e) {
		e.preventDefault()
		setError('')
		setSubmitting(true)
		try {
			await login(form.username.trim(), form.password)
			// Navigate after successful login
			navigate('/admin', { replace: true })
		} catch (err) {
			setError(err?.message || 'Login failed')
		} finally {
			setSubmitting(false)
		}
	}

	// Show loading while checking authentication
	if (loading) {
		return (
			<div className="min-h-svh grid place-items-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
					<p className="mt-2 text-sm text-gray-600">Loading...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-svh grid place-items-center px-4">
			<Card className="w-full max-w-sm">
				<CardHeader className="text-center">
					<div className="mx-auto mb-2 size-16 rounded-full bg-black grid place-items-center">
						<img src={logo} alt="Cockpit" className="size-12 object-contain invert" />
					</div>
					<CardTitle>Cockpit Management System</CardTitle>
					<CardDescription>Sign in to continue</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="username">Username or Email</Label>
							<Input id="username" autoComplete="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="jdoe or jdoe@gmail.com" required />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input id="password" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
						</div>
						{error ? <p className="text-red-600 text-sm">{error}</p> : null}
						<Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'}</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}

export default Login

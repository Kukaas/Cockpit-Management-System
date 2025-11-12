import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import useAuth from '@/hooks/useAuth'
import InputField from '@/components/custom/InputField'
import { User, Lock } from 'lucide-react'
import logo from '@/assets/logo.png'
import { toast } from 'sonner'
import api from '@/services/api'

const Login = () => {
	const { user, login, loading } = useAuth()
	const navigate = useNavigate()
	const [form, setForm] = useState({ username: '', password: '' })
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')
	const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
	const [resetEmail, setResetEmail] = useState('')
	const [resetSubmitting, setResetSubmitting] = useState(false)
	const [resetError, setResetError] = useState('')

	// Redirect if already authenticated
	useEffect(() => {
		if (user && !loading) {
			redirectBasedOnRole(user)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, loading])

	// Function to redirect based on user role and password status
	const redirectBasedOnRole = (userData) => {
		// Check if user needs to change password
		if (!userData.passwordChanged) {
			navigate('/change-password', { replace: true })
			return
		}

		// Redirect to appropriate dashboard
		switch (userData.role) {
			case 'admin':
				navigate('/admin', { replace: true })
				break
			case 'entrance_staff':
				navigate('/entrance-staff', { replace: true })
				break
			case 'tangkal_staff':
				navigate('/tangkal-staff', { replace: true })
				break
			case 'bet_staff':
				navigate('/bet-staff', { replace: true })
				break
			case 'registration_staff':
				navigate('/registration-staff', { replace: true })
				break
			default:
				navigate('/admin', { replace: true })
		}
	}

	async function handleSubmit(e) {
		e.preventDefault()
		setError('')
		setSubmitting(true)
		try {
			const userData = await login(form.username.trim(), form.password)
			// Redirect based on role after successful login
			redirectBasedOnRole(userData)
		} catch (err) {
			console.error('Login error details:', err)

			// Handle different types of errors
			let errorMessage = 'Login failed'

			if (err?.response?.data?.message) {
				// Backend error message
				errorMessage = err.response.data.message
			} else if (err?.message) {
				// Frontend error message
				errorMessage = err.message
			} else if (err?.response?.status === 401) {
				// Generic 401 error
				errorMessage = 'Invalid credentials'
			} else if (err?.response?.status === 500) {
				// Server error
				errorMessage = 'Server error. Please try again.'
			}

			setError(errorMessage)
		} finally {
			setSubmitting(false)
		}
	}

	const handleResetDialogChange = (open) => {
		setIsResetDialogOpen(open)
		if (!open) {
			setResetEmail('')
			setResetError('')
			setResetSubmitting(false)
		}
	}

	const handleForgotPasswordSubmit = async (e) => {
		e.preventDefault()
		setResetError('')

		const email = resetEmail.trim()
		if (!email) {
			setResetError('Email is required')
			return
		}

		setResetSubmitting(true)
		try {
			const response = await api.post('/auth/forgot-password', { email })

			if (response.data?.success) {
				toast.success('Password reset link sent. Please check your email.')
				handleResetDialogChange(false)
			} else {
				const message = response.data?.message || 'Failed to send password reset email.'
				setResetError(message)
				toast.error(message)
			}
		} catch (err) {
			const message = err?.response?.data?.message || 'Failed to send password reset email.'
			setResetError(message)
			toast.error(message)
		} finally {
			setResetSubmitting(false)
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
					<form onSubmit={handleSubmit} className="space-y-6">
						<InputField
							id="username"
							label="Username or Email"
							icon={User}
							value={form.username}
							onChange={(e) => setForm({ ...form, username: e.target.value })}
							placeholder="jdoe or jdoe@gmail.com"
							autoComplete="username"
							required
						/>
						<InputField
							id="password"
							label="Password"
							icon={Lock}
							type="password"
							showPasswordToggle={true}
							value={form.password}
							onChange={(e) => setForm({ ...form, password: e.target.value })}
							autoComplete="current-password"
							required
						/>
						{error ? (
							<div className="p-3 bg-red-50 border border-red-200 rounded-md">
								<p className="text-red-600 text-sm">{error}</p>
							</div>
						) : null}
						<div className="flex items-center justify-end">
							<button
								type="button"
								onClick={() => handleResetDialogChange(true)}
								className="text-sm font-medium hover:text-blue-700 focus:outline-none focus:underline"
								disabled={submitting}
							>
								Forgot password?
							</button>
						</div>
						<Button type="submit" className="w-full" disabled={submitting}>
							{submitting ? 'Signing in...' : 'Sign in'}
						</Button>
					</form>
				</CardContent>
			</Card>

			<Dialog open={isResetDialogOpen} onOpenChange={handleResetDialogChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reset your password</DialogTitle>
						<DialogDescription>
							Enter the email associated with your account and we&apos;ll send you a link to reset your password.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="reset-email">Email address</Label>
							<Input
								id="reset-email"
								type="email"
								value={resetEmail}
								onChange={(e) => setResetEmail(e.target.value)}
								placeholder="you@example.com"
								autoComplete="email"
								required
							/>
						</div>
						{resetError ? <p className="text-sm text-red-600">{resetError}</p> : null}
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => handleResetDialogChange(false)}
								disabled={resetSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={resetSubmitting}>
								{resetSubmitting ? 'Sending...' : 'Send reset link'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default Login

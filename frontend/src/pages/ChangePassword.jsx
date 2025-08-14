import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import useAuth from '@/hooks/useAuth'
import api from '@/services/api'
import InputField from '@/components/custom/InputField'
import { Lock, Eye, EyeOff } from 'lucide-react'
import logo from '@/assets/logo.png'

const ChangePassword = () => {
	const { user, updateUser } = useAuth()
	const navigate = useNavigate()
	const [form, setForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	})
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')


	// Redirect if user has already changed password
	if (user?.passwordChanged) {
		navigate(`/${user.role.replace('_', '-')}`, { replace: true })
		return null
	}

	async function handleSubmit(e) {
		e.preventDefault()
		setError('')

		// Validation
		if (form.newPassword.length < 6) {
			setError('New password must be at least 6 characters long')
			return
		}

		if (form.newPassword !== form.confirmPassword) {
			setError('New passwords do not match')
			return
		}

		setSubmitting(true)

		try {
			const response = await api.post('/auth/change-password', {
				currentPassword: form.currentPassword,
				newPassword: form.newPassword
			})

			if (response.data.success) {
				// Update user context with new passwordChanged status
				updateUser(response.data.user)

				toast.success('Password changed successfully!')

				// Redirect to appropriate dashboard
				const role = response.data.user.role
				navigate(`/${role.replace('_', '-')}`, { replace: true })
			}
		} catch (err) {
			console.error('Change password error:', err)

			let errorMessage = 'Failed to change password'
			if (err?.response?.data?.message) {
				errorMessage = err.response.data.message
			}

			setError(errorMessage)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="min-h-svh grid place-items-center px-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-2 size-16 rounded-full bg-black grid place-items-center">
						<img src={logo} alt="Cockpit" className="size-12 object-contain invert" />
					</div>
					<CardTitle>Change Password Required</CardTitle>
					<CardDescription>
						For security reasons, you must change your default password before continuing.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						<InputField
							id="currentPassword"
							label="Current Password"
							icon={Lock}
							type="password"
							showPasswordToggle={true}
							value={form.currentPassword}
							onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
							placeholder="Enter your current password"
							required
							description="Enter your current password to verify your identity"
						/>

						<InputField
							id="newPassword"
							label="New Password"
							icon={Lock}
							type="password"
							showPasswordToggle={true}
							value={form.newPassword}
							onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
							placeholder="Enter new password (min. 6 characters)"
							required
							description="Choose a strong password with at least 6 characters"
						/>

						<InputField
							id="confirmPassword"
							label="Confirm New Password"
							icon={Lock}
							type="password"
							showPasswordToggle={true}
							value={form.confirmPassword}
							onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
							placeholder="Confirm new password"
							required
							description="Re-enter your new password to confirm"
						/>

						{error ? (
							<div className="p-3 bg-red-50 border border-red-200 rounded-md">
								<p className="text-red-600 text-sm">{error}</p>
							</div>
						) : null}

						<Button type="submit" className="w-full" disabled={submitting}>
							{submitting ? 'Changing Password...' : 'Change Password'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}

export default ChangePassword

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import useAuth from '@/hooks/useAuth'
import api from '@/services/api'
import { User, Lock, Mail, Shield, Calendar, Clock } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import InputField from '@/components/custom/InputField'

const Settings = () => {
	const { user, updateUser } = useAuth()
	const [passwordForm, setPasswordForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	})
	const [profileForm, setProfileForm] = useState({
		firstName: user?.firstName || '',
		lastName: user?.lastName || '',
		username: user?.username || ''
	})
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')
	const [profileError, setProfileError] = useState('')
	const [isEditingProfile, setIsEditingProfile] = useState(false)

	const handlePasswordChange = async (e) => {
		e.preventDefault()
		setError('')

		// Validation
		if (passwordForm.newPassword.length < 6) {
			setError('New password must be at least 6 characters long')
			return
		}

		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			setError('New passwords do not match')
			return
		}

		setSubmitting(true)

		try {
			const response = await api.post('/auth/change-password', {
				currentPassword: passwordForm.currentPassword,
				newPassword: passwordForm.newPassword
			})

			if (response.data.success) {
				// Update user context with new passwordChanged status
				updateUser(response.data.user)

				toast.success('Password changed successfully!')

				// Reset form
				setPasswordForm({
					currentPassword: '',
					newPassword: '',
					confirmPassword: ''
				})
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

	const handleProfileUpdate = async (e) => {
		e.preventDefault()
		setProfileError('')

		// Validation
		if (!profileForm.firstName.trim() || !profileForm.lastName.trim() || !profileForm.username.trim()) {
			setProfileError('All fields are required')
			return
		}

		if (profileForm.username.length < 3) {
			setProfileError('Username must be at least 3 characters long')
			return
		}

		setSubmitting(true)

		try {
			const response = await api.put('/auth/profile', {
				firstName: profileForm.firstName.trim(),
				lastName: profileForm.lastName.trim(),
				username: profileForm.username.trim()
			})

			if (response.data.success) {
				// Update user context with new profile data
				updateUser(response.data.user)

				toast.success('Profile updated successfully!')
				setIsEditingProfile(false)
			}
		} catch (err) {
			console.error('Profile update error:', err)

			let errorMessage = 'Failed to update profile'
			if (err?.response?.data?.message) {
				errorMessage = err.response.data.message
			}

			setProfileError(errorMessage)
		} finally {
			setSubmitting(false)
		}
	}

	const startEditingProfile = () => {
		setProfileForm({
			firstName: user?.firstName || '',
			lastName: user?.lastName || '',
			username: user?.username || ''
		})
		setIsEditingProfile(true)
		setProfileError('')
	}

	const cancelEditingProfile = () => {
		setIsEditingProfile(false)
		setProfileError('')
	}

	const formatDate = (dateString) => {
		if (!dateString) return 'Never'
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	return (
		<PageLayout
			title="Settings"
			description="Manage your account settings and preferences."
		>
			<Tabs defaultValue="profile" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="profile" className="flex items-center gap-2">
						<User className="h-4 w-4" />
						Profile
					</TabsTrigger>
					<TabsTrigger value="security" className="flex items-center gap-2">
						<Shield className="h-4 w-4" />
						Security
					</TabsTrigger>
				</TabsList>

				<TabsContent value="profile">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle>Profile Information</CardTitle>
									<CardDescription>
										View and edit your account details.
									</CardDescription>
								</div>
								{!isEditingProfile && (
									<Button onClick={startEditingProfile} variant="outline" size="sm">
										Edit Profile
									</Button>
								)}
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							{isEditingProfile ? (
								<form onSubmit={handleProfileUpdate}>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<InputField
											id="email"
											label="Email"
											icon={Mail}
											value={user?.email || ''}
											disabled
											description="Email cannot be changed"
										/>
										<InputField
											id="username"
											label="Username"
											icon={User}
											value={profileForm.username}
											onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
											placeholder="Enter username"
											required
											description="Username must be at least 3 characters"
										/>
										<InputField
											id="firstName"
											label="First Name"
											icon={User}
											value={profileForm.firstName}
											onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
											placeholder="Enter first name"
											required
										/>
										<InputField
											id="lastName"
											label="Last Name"
											icon={User}
											value={profileForm.lastName}
											onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
											placeholder="Enter last name"
											required
										/>
									</div>

									{profileError && (
										<div className="p-3 bg-red-50 border border-red-200 rounded-md mt-4">
											<p className="text-red-600 text-sm">{profileError}</p>
										</div>
									)}

									<div className="flex gap-2 mt-6">
										<Button type="submit" disabled={submitting}>
											{submitting ? 'Saving...' : 'Save Changes'}
										</Button>
										<Button type="button" variant="outline" onClick={cancelEditingProfile}>
											Cancel
										</Button>
									</div>
								</form>
							) : (
								<>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<InputField
											id="email"
											label="Email"
											icon={Mail}
											value={user?.email || ''}
											disabled
										/>
										<InputField
											id="username"
											label="Username"
											icon={User}
											value={user?.username || ''}
											disabled
										/>
										<InputField
											id="firstName"
											label="First Name"
											icon={User}
											value={user?.firstName || ''}
											disabled
										/>
										<InputField
											id="lastName"
											label="Last Name"
											icon={User}
											value={user?.lastName || ''}
											disabled
										/>
										<InputField
											id="role"
											label="Role"
											icon={Shield}
											value={user?.role ? user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''}
											disabled
										/>
										<InputField
											id="status"
											label="Account Status"
											icon={Shield}
											value={user?.isActive ? 'Active' : 'Inactive'}
											disabled
										/>
									</div>

									<Separator />

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<InputField
											id="createdAt"
											label="Account Created"
											icon={Calendar}
											value={formatDate(user?.createdAt)}
											disabled
										/>
										<InputField
											id="lastLogin"
											label="Last Login"
											icon={Clock}
											value={formatDate(user?.lastLogin)}
											disabled
										/>
									</div>
								</>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="security">
					<Card>
						<CardHeader>
							<CardTitle>Security Settings</CardTitle>
							<CardDescription>
								Change your password and manage security settings.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handlePasswordChange} className="space-y-6">
								<div className="space-y-4">
									<InputField
										id="currentPassword"
										label="Current Password"
										icon={Lock}
										type="password"
										showPasswordToggle={true}
										value={passwordForm.currentPassword}
										onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
										placeholder="Enter your current password"
										required
									/>

									<InputField
										id="newPassword"
										label="New Password"
										icon={Lock}
										type="password"
										showPasswordToggle={true}
										value={passwordForm.newPassword}
										onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
										placeholder="Enter new password (min. 6 characters)"
										required
										description="Password must be at least 6 characters long"
									/>

									<InputField
										id="confirmPassword"
										label="Confirm New Password"
										icon={Lock}
										type="password"
										showPasswordToggle={true}
										value={passwordForm.confirmPassword}
										onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
										placeholder="Confirm new password"
										required
									/>
								</div>

								{error && (
									<div className="p-3 bg-red-50 border border-red-200 rounded-md">
										<p className="text-red-600 text-sm">{error}</p>
									</div>
								)}

								<Button type="submit" disabled={submitting}>
									{submitting ? 'Changing Password...' : 'Change Password'}
								</Button>
							</form>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</PageLayout>
	)
}

export default Settings

import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import InputField from '@/components/custom/InputField'
import { Lock } from 'lucide-react'
import logo from '@/assets/logo.png'
import api from '@/services/api'
import { toast } from 'sonner'

const ResetPassword = () => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [form, setForm] = useState({ password: '', confirmPassword: '' })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token. Please request a new password reset link.')
        }
    }, [token])

    const handleChange = (field) => (event) => {
        setForm((prev) => ({
            ...prev,
            [field]: event.target.value
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')

        if (!token) {
            setError('Invalid or missing reset token. Please request a new password reset link.')
            return
        }

        if (!form.password.trim() || !form.confirmPassword.trim()) {
            setError('Please fill in all required fields.')
            return
        }

        if (form.password.length < 6) {
            setError('Password must be at least 6 characters long.')
            return
        }

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match. Please try again.')
            return
        }

        setSubmitting(true)
        try {
            const response = await api.post('/auth/reset-password', {
                token,
                newPassword: form.password.trim()
            })

            if (response.data?.success) {
                toast.success('Password updated successfully. You can now sign in with your new password.')
                setSuccess(true)
                setTimeout(() => navigate('/login'), 2500)
            } else {
                const message = response.data?.message || 'Failed to reset password.'
                setError(message)
                toast.error(message)
            }
        } catch (err) {
            const message = err?.response?.data?.message || 'Failed to reset password.'
            setError(message)
            toast.error(message)
        } finally {
            setSubmitting(false)
        }
    }

    const renderContent = () => {
        if (success) {
            return (
                <div className="space-y-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <svg
                            className="w-8 h-8 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            Password reset successfully
                        </h2>
                        <p className="text-sm text-gray-600">
                            You will be redirected to the login page shortly. If not, click the button below.
                        </p>
                    </div>
                    <Button className="w-full" onClick={() => navigate('/login')}>
                        Back to login
                    </Button>
                </div>
            )
        }

        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField
                    id="new-password"
                    label="New Password"
                    type="password"
                    icon={Lock}
                    showPasswordToggle
                    value={form.password}
                    onChange={handleChange('password')}
                    autoComplete="new-password"
                    required
                />
                <InputField
                    id="confirm-password"
                    label="Confirm Password"
                    type="password"
                    icon={Lock}
                    showPasswordToggle
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    autoComplete="new-password"
                    required
                />

                {error ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                ) : null}

                <Button type="submit" className="w-full" disabled={submitting || !token}>
                    {submitting ? 'Resetting password...' : 'Reset password'}
                </Button>
            </form>
        )
    }

    return (
        <div className="min-h-svh grid place-items-center px-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-2 size-16 rounded-full bg-black grid place-items-center">
                        <img src={logo} alt="Cockpit" className="size-12 object-contain invert" />
                    </div>
                    <CardTitle>Reset Password</CardTitle>
                    <CardDescription>
                        Choose a new password for your Cockpit Management System account
                    </CardDescription>
                </CardHeader>
                <CardContent>{renderContent()}</CardContent>
            </Card>
        </div>
    )
}

export default ResetPassword


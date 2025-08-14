import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './components/AuthContext'
import { Toaster } from './components/ui/sonner'
import useAuth from './hooks/useAuth'

// Pages
import Login from './pages/Login'
import VerifyEmail from './pages/VerifyEmail'
import ChangePassword from './pages/ChangePassword'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/user-management/UserManagement'
import EntranceDashboard from './pages/entrance-staff/EntranceDashboard'
import Events from './pages/event-staff/events/Events'
import EventDashboard from './pages/event-staff/EventDashboard'

function PrivateRoute({ children }) {
	const { user, loading } = useAuth()

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

	// Check if user needs to change password
	if (user && !user.passwordChanged) {
		return <Navigate to="/change-password" replace />
	}

	return user ? children : <Navigate to="/login" replace />
}

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/verify" element={<VerifyEmail />} />
					<Route path="/change-password" element={<ChangePassword />} />
					<Route path="/" element={<Navigate to="/admin" replace />} />

					{/* Admin Routes */}
					<Route path="/admin" element={
						<PrivateRoute>
							<AdminDashboard />
						</PrivateRoute>
					} />
					<Route path="/admin/users" element={
						<PrivateRoute>
							<UserManagement />
						</PrivateRoute>
					} />

					{/* Entrance Staff Routes */}
					<Route path="/entrance-staff" element={
						<PrivateRoute>
							<EntranceDashboard />
						</PrivateRoute>
					} />

					{/* Event Staff Routes */}
					<Route path="/event-staff" element={
						<PrivateRoute>
							<EventDashboard />
						</PrivateRoute>
					} />

					<Route path="/event-staff/events" element={
						<PrivateRoute>
							<Events />
						</PrivateRoute>
					} />

				</Routes>
			</BrowserRouter>
			<Toaster position="top-center" closeButton />
		</AuthProvider>
	)
}

export default App

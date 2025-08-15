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
import Events from './pages/admin/events/Events'
import EventDetails from './pages/admin/events/EventDetails'
import AdminEventSelection from './pages/admin/fight-schedule/EventSelection'
import AdminFightSchedule from './pages/admin/fight-schedule/FightSchedule'
import EventDashboard from './pages/event-staff/EventDashboard'
import RegistrationDashboard from './pages/registration-staff/RegistrationDashboard'
import EventSelection from './pages/registration-staff/participant-registration/EventSelection'
import ParticipantRegistration from './pages/registration-staff/participant-registration/ParticipantRegistration'
import StaffEventSelection from './pages/event-staff/fight-schedule/EventSelection'
import FightSchedule from './pages/event-staff/fight-schedule/FightSchedule'
import EntranceEventSelection from './pages/entrance-staff/entrance-registration/EventSelection'
import Entrance from './pages/entrance-staff/entrance-registration/Entrance'
import TangkalDashboard from './pages/tangkal-staff/TangkalDashboard'
import Rentals from './pages/tangkal-staff/rentals/Rentals'
import CageAvailability from './pages/tangkal-staff/cage-availability/CageAvailability'

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

					<Route path="/admin/events" element={
						<PrivateRoute>
							<Events />
						</PrivateRoute>
					} />
					<Route path="/admin/events/:eventId" element={
						<PrivateRoute>
							<EventDetails />
						</PrivateRoute>
					} />

					{/* Admin Fight Schedule Routes */}
					<Route path="/admin/fight-schedule" element={
						<PrivateRoute>
							<AdminEventSelection />
						</PrivateRoute>
					} />
					<Route path="/admin/fight-schedule/:eventId" element={
						<PrivateRoute>
							<AdminFightSchedule />
						</PrivateRoute>
					} />

					{/* Event Staff Routes */}
					<Route path="/event-staff" element={
						<PrivateRoute>
							<EventDashboard />
						</PrivateRoute>
					} />
					<Route path="/event-staff/fight-schedule" element={
						<PrivateRoute>
							<StaffEventSelection />
						</PrivateRoute>
					} />
					<Route path="/event-staff/fight-schedule/:eventId" element={
						<PrivateRoute>
							<FightSchedule />
						</PrivateRoute>
					} />

					{/* Entrance Staff Routes */}
					<Route path="/entrance-staff" element={
						<PrivateRoute>
							<EntranceDashboard />
						</PrivateRoute>
					} />
					<Route path="/entrance-staff/entrance-registration" element={
						<PrivateRoute>
							<EntranceEventSelection />
						</PrivateRoute>
					} />
					<Route path="/entrance-staff/entrance-registration/:eventId" element={
						<PrivateRoute>
							<Entrance />
						</PrivateRoute>
					} />

					{/* Registration Staff Routes */}
					<Route path="/registration-staff" element={
						<PrivateRoute>
							<RegistrationDashboard />
						</PrivateRoute>
					} />

					<Route path="/registration-staff/participant-registration" element={
						<PrivateRoute>
							<EventSelection />
						</PrivateRoute>
					} />
					<Route path="/registration-staff/participant-registration/:eventId" element={
						<PrivateRoute>
							<ParticipantRegistration />
						</PrivateRoute>
					} />

					{/* Tangkal Staff Routes */}
					<Route path="/tangkal-staff" element={
						<PrivateRoute>
							<TangkalDashboard />
						</PrivateRoute>
					} />
					<Route path="/tangkal-staff/cage-rentals" element={
						<PrivateRoute>
							<Rentals />
						</PrivateRoute>
					} />
					<Route path="/tangkal-staff/cage-availability" element={
						<PrivateRoute>
							<CageAvailability />
						</PrivateRoute>
					} />

				</Routes>
			</BrowserRouter>
			<Toaster position="top-center" closeButton />
		</AuthProvider>
	)
}

export default App

import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import PrivateLayout from './layouts/PrivateLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import { AuthProvider } from './components/AuthContext'
import useAuth from './hooks/useAuth'

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

	return user ? children : <Navigate to="/login" replace />
}

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/" element={<Navigate to="/admin" replace />} />
					<Route path="/admin" element={<PrivateRoute><PrivateLayout /></PrivateRoute>}>
						<Route index element={<AdminDashboard />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	)
}

export default App

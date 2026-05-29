import { Navigate, Outlet } from "react-router-dom"

function ProtectedRoute({ isAuthenticated }: { isAuthenticated: boolean }) {
	if (!isAuthenticated) {
		return <Navigate to="/" replace />
	}

	return <Outlet />
}

export default ProtectedRoute

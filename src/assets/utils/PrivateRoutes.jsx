import { Navigate, Outlet } from 'react-router-dom';

export function PrivateRoutes() {
    const isLoggedIn = false;

    return isLoggedIn ? <Outlet /> : <Navigate to="login" />;
}

import { Navigate, Outlet } from 'react-router-dom';
import { loginPath } from '../global/global_variables';
import { auth } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export function PrivateRoutes() {
    const [user, loading] = useAuthState(auth);

    if (loading) return <div>Loading...</div>;

    return user ? <Outlet /> : <Navigate to={loginPath} />;
}

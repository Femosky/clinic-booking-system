import { Navigate, Outlet } from 'react-router-dom';
import { dashboardPath } from '../global/global_variables';
import { auth } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { LogoLoadingScreen } from '../components/LogoLoadingScreen';

export function PublicRoutes() {
    const [user, loading] = useAuthState(auth);

    if (loading) {
        return <LogoLoadingScreen />;
    }

    return user ? <Navigate to={dashboardPath} /> : <Outlet />;
}

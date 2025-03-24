import { Navigate, Outlet } from 'react-router-dom';
import { loginPath } from '../global/global_variables';
import { auth } from '../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { LogoLoadingScreen } from '../components/LogoLoadingScreen';

export function PrivateRoutes() {
    const [user, loading] = useAuthState(auth);

    if (loading) {
        return <LogoLoadingScreen />;
    }

    return user ? <Outlet /> : <Navigate to={loginPath} />;
}

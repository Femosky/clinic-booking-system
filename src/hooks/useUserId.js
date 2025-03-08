import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebase';

export function useUserId() {
    const [user, loading, error] = useAuthState(auth);

    return { uid: user?.uid || null, loading, error };
}

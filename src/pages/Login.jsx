import { Button } from '../components/Button';
import { useEffect } from 'react';
import { dashboardPath } from '../global/global_variables';
import { auth, provider } from '../firebase/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';

export function Login() {
    const navigate = useNavigate();
    const [user] = useAuthState(auth);

    // METHODS
    async function signInWithGoogle() {
        try {
            await signInWithPopup(auth, provider);
            navigate(dashboardPath);
        } catch (error) {
            console.error('Error signing in:', error);
        }
    }

    // STATE LISTENERS
    // Redirect back to the homepage when logged in
    useEffect(() => {
        if (user) {
            navigate(dashboardPath);
        }
    }, [user, navigate]);

    return (
        <div className="border border-blue-400 ">
            <div>login</div>
            <form action="" className="flex flex-col ">
                <input type="email" name="email" id="email" />
                <input type="password" name="password" id="password" />

                <Button>Sign In</Button>
            </form>

            <Button onClick={signInWithGoogle} variant="dark">
                Sign in with google
            </Button>
        </div>
    );
}

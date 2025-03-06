import { Button } from '../components/Button';
import { useEffect } from 'react';
import { dashboardPath } from '../global/global_variables';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebase';

export function Register() {
    const navigate = useNavigate();
    const [user] = useAuthState(auth);

    // STATE LISTENERS
    // Redirect back to the homepage when logged in
    useEffect(() => {
        if (user) {
            navigate(dashboardPath);
        }
    }, [user, navigate]);

    return (
        <div className="border border-blue-400">
            <div>register</div>
            <form action="" className="flex flex-col ">
                <input type="email" name="email" id="email" />
                <input type="password" name="password" id="password" />

                <Button>Create an account</Button>
            </form>
            <Button variant="dark">Sign up with google</Button>
        </div>
    );
}

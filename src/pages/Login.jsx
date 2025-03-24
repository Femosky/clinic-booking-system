import { Button } from '../components/Button';
import { useEffect, useState } from 'react';
import { dashboardPath, resetPasswordPath, registerPath } from '../global/global_variables';
import { auth, provider } from '../firebase/firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { PropTypes } from 'prop-types';
import rectangleShape from '../assets/Rectangle 64.png';
import image1 from '../assets/image 15.png';
import image2 from '../assets/image 13.png';
import image3 from '../assets/image 14.png';
import { Input } from '../components/Input';
import { SignupButton } from '../components/SignupButton';
import { BorderLine } from '../components/BorderLine';
import { ErrorMessageView } from '../components/ErrorMessageView';
import { isValidEmail } from '../global/global_methods';

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
        <div className="flex w-full min-h-[50rem]">
            <section className="w-full flex justify-center md:justify-start md:w-1/2">
                <LoginForm signInWithGoogle={signInWithGoogle} />
            </section>

            <section className="hidden md:flex flex-col items-end w-1/2">
                <div className="absolute inset-0 -z-10 w-full">
                    <img
                        className="w-full max-w-[40rem] h-full max-h-[55rem] top-0 right-40 absolute"
                        src={rectangleShape}
                        alt="rectangle background shape"
                    />
                </div>

                <div className="w-full h-full flex flex-col">
                    <div className="self-end px-10 text-3xl">
                        <p>Invest For Your Health Today</p>
                        <p>Get the Service You Need</p>
                        <p>From the Best Health Professionals!</p>
                    </div>

                    <div className="w-full flex flex-col pl-56 pt-10">
                        <div className="self-end z-1">
                            <img className="w-[17rem] h-[13rem]" src={image1} alt="image 1" />
                        </div>
                        <div className="self-start -mt-5">
                            <img className="w-[17rem] h-[13rem]" src={image2} alt="image 2" />
                        </div>
                        <div className="self-end z-1 -mt-5">
                            <img className="w-[17rem] h-[13rem]" src={image3} alt="image 3" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function LoginForm({ signInWithGoogle }) {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    function areInputsValid() {
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return false;
        }

        setError('');
        return true;
    }

    async function handleEmailLogin(event) {
        event.preventDefault();

        if (!areInputsValid()) {
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate(dashboardPath);
        } catch (error) {
            setError('Invalid email or password. Please try again.');
            console.error('Login error:', error);
        }
    }

    return (
        <div className="w-full max-w-[35rem] flex flex-col gap-4 items-center">
            <div className="text-7xl pb-13 w-full">Log In</div>

            <form onSubmit={handleEmailLogin} className="w-full flex flex-col gap-4">
                <div>
                    <h3 className="text-2xl text-dark">E-mail Address</h3>
                    <Input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <h3 className="text-2xl text-dark">Password</h3>
                    <Input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="text-normal w-full flex justify-end">
                    <Link to={resetPasswordPath}>Forgot password?</Link>
                </div>

                <ErrorMessageView error={error} />

                <Button
                    type="submit"
                    size="special"
                    variant="border_1"
                    className="font-semibold text-xl w-full self-center"
                >
                    <img src="" alt="" />
                    Sign In
                </Button>
            </form>

            <div className="flex items-center gap-2 px-10 py-2">
                <BorderLine className="opacity-30" />
                or
                <BorderLine className="opacity-30" />
            </div>

            <SignupButton iconName="google" onClick={signInWithGoogle} buttonText="Sign in with Google" />

            <div className="text-dark w-full flex justify-center gap-1">
                <Link to={registerPath}>
                    {"Don't have an account?"} <span className="font-semibold">Register</span>
                </Link>
            </div>
        </div>
    );
}

LoginForm.propTypes = {
    signInWithGoogle: PropTypes.func.isRequired,
};

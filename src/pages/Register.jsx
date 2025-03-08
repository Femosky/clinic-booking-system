import { Button } from '../components/Button';
import { useEffect, useState } from 'react';
import { dashboardPath, loginPath, resetPasswordPath, userType1, userType2 } from '../global/global_variables';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, provider } from '../firebase/firebase';
import { signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import PropTypes from 'prop-types';
import rectangleShape from '../assets/Rectangle 64.png';
import image1 from '../assets/image 15.png';
import image2 from '../assets/image 13.png';
import image3 from '../assets/image 14.png';
import { SignupButton } from '../components/SignupButton';
import { BorderLine } from '../components/BorderLine';
import { Input } from '../components/Input';
import { getDatabase, ref, set } from 'firebase/database';
import { capitalize } from '../global/global_methods';

export function Register() {
    const navigate = useNavigate();
    const [user] = useAuthState(auth);

    // METHODS

    // STATE LISTENERS
    // Redirect back to the homepage when logged in
    useEffect(() => {
        if (user) {
            navigate(dashboardPath);
        }
    }, [user, navigate]);

    return (
        <div className="flex w-full min-h-[50rem]">
            <section className="w-1/2">
                <SignUpForm />
            </section>

            <section className="flex flex-col items-end w-1/2">
                <div className="absolute inset-0 -z-10 w-full">
                    <img
                        className="w-[40rem] h-[55rem] top-0 right-40 absolute"
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

function SignUpForm() {
    const navigate = useNavigate();
    const db = getDatabase();

    const [fullName, setFullName] = useState('');
    const [clinicName, setClinicName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userType, setUserType] = useState(false);
    const [error, setError] = useState('');

    const [isEmailSignup, setIsEmailSignup] = useState(false);

    function toggleUserType() {
        setUserType(!userType);

        if (!userType) {
            setIsEmailSignup(true);
        } else {
            setIsEmailSignup(false);
        }
    }

    function toggleSignupMethod() {
        setIsEmailSignup(!isEmailSignup);
    }

    async function signUpWithGoogle() {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const db = getDatabase();
            const userPath = `patients/${user.uid}`;

            const selectedUserType = userType ? userType1 : userType2;

            await set(ref(db, userPath), {
                fullName: user.displayName,
                email: user.email,
                selectedUserType,
            });

            navigate(dashboardPath);
        } catch (error) {
            console.error('Error signing in:', error);
        }
    }

    async function handleRegister(event) {
        event.preventDefault();

        // VALIDATIONS FIRST

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        // POSTING TO DB

        try {
            // Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Define user path based on user type
            const userPath = userType === userType1 ? `clinics/${user.uid}` : `patients/${user.uid}`;

            const selectedUserType = userType ? userType1 : userType2;
            const name = userType ? clinicName : fullName;

            // Save user details in Firebase Realtime Database
            const result = await set(ref(db, userPath), {
                name,
                email,
                selectedUserType,
            });

            console.log(result);
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <div className="w-full max-w-[35rem] flex flex-col gap-8 items-center">
            <div className="text-7xl pb-4 w-full">Sign Up</div>

            <section className="w-full flex">
                <h3 className="w-1/2 text-dark font-semibold text-lg">What type of user are you?</h3>
                <div className="w-1/2 flex">
                    <Button className="w-full" onClick={toggleUserType} variant={!userType ? 'dark' : 'default'}>
                        {capitalize(userType2)}
                    </Button>
                    <Button className="w-full" onClick={toggleUserType} variant={userType ? 'dark' : 'default'}>
                        {capitalize(userType1)}
                    </Button>
                </div>
            </section>

            <div className={`w-full flex flex-col items-center ${isEmailSignup ? 'py-0' : 'py-10'}`}>
                {!isEmailSignup && (
                    <>
                        <SignupButton onClick={signUpWithGoogle} iconName="google" buttonText="Sign up with Google" />

                        <div className="flex items-center gap-2 px-10">
                            <BorderLine className="opacity-30" />
                            or
                            <BorderLine className="opacity-30" />
                        </div>
                    </>
                )}

                <SignupButton
                    onClick={toggleSignupMethod}
                    className={isEmailSignup && 'bg-dark text-normal'}
                    buttonText="Sign up with Email"
                />
            </div>

            {isEmailSignup && (
                <form onSubmit={handleRegister} className="w-full flex flex-col gap-4">
                    {userType ? (
                        <div>
                            <h3 className="text-2xl text-dark">Clinic name</h3>
                            <Input
                                type="text"
                                value={clinicName}
                                onChange={(e) => setClinicName(e.target.value)}
                                name="text"
                                id="text"
                                placeholder="Enter the name of your Clinic"
                                required
                            />
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-2xl text-dark">Full name</h3>
                            <Input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                name="text"
                                id="text"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <h3 className="text-2xl text-dark">E-mail Address</h3>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            name="email"
                            id="email"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div>
                        <h3 className="text-2xl text-dark">Password</h3>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            name="password"
                            id="password"
                            placeholder="Enter a password"
                            required
                        />
                    </div>

                    <div>
                        <h3 className="text-2xl text-dark">Confirm password</h3>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            name="confirm-password"
                            id="confirm-password"
                            placeholder="Enter your password again"
                            required
                        />
                    </div>

                    <div className="text-normal w-full flex justify-end">
                        <Link to={resetPasswordPath}>Forgot password?</Link>
                    </div>

                    {error && <p className="text-red-500">{error}</p>}

                    <Button type="submit" size="special" className="font-semibold text-xl w-full self-center">
                        <img src="" alt="" />
                        Register
                    </Button>
                </form>
            )}

            <div className="text-dark w-full flex justify-center gap-1">
                <Link to={loginPath}>
                    Already have an account? <span className="font-semibold">Log In</span>
                </Link>
            </div>
        </div>
    );
}

SignUpForm.propTypes = {
    signUpWithGoogle: PropTypes.func.isRequired,
};

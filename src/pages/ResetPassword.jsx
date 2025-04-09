import { useState } from 'react';
import { PageTitle } from '../components/PageTitle';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { isValidEmail } from '../global/global_methods';
import { ErrorMessageView } from '../components/ErrorMessageView';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { SuccessMessageView } from '../components/SuccessMessageView';
import { useNavigate } from 'react-router-dom';
import { loginPath } from '../global/global_variables';
import { BackButton } from '../components/BackButton';

export function ResetPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function handleReset(event) {
        event.preventDefault();

        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            console.log('Please enter a valid email address.');
            return;
        }

        await sendPasswordResetEmail(auth, email)
            .then(() => {
                setError('');
                setSuccess(
                    'Password reset email sent! Check your email for the link to reset your password. Redirecting to login page.'
                );
                setTimeout(() => {
                    navigate(loginPath);
                }, 3000);
            })
            .catch((err) => {
                console.error('Error sending password reset email:', err.message);
            });
    }

    return (
        <div className="w-full">
            <BackButton className="mb-5" buttonText="Back" />
            <PageTitle pageTitle="Reset Password" />

            <main className="w-full">
                <form onSubmit={handleReset} className="mt-10 sm:mt-20 flex flex-col gap-5">
                    <Input
                        type="text"
                        name="email"
                        id="email"
                        className="text-center"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <ErrorMessageView error={error} />
                    <SuccessMessageView success={success} />

                    <Button className="self-center" type="submit">
                        Reset
                    </Button>
                </form>
            </main>
        </div>
    );
}

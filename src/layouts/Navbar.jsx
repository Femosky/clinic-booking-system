import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import logo from '../assets/react.svg';
import { Menu, ShoppingCartIcon, X } from 'lucide-react';
import { Button } from '../components/Button';
import {
    APP_NAME,
    bookingPath,
    contactPath,
    dashboardPath,
    loginPath,
    servicesPath,
    userType2,
} from '../global/global_variables';
import { PropTypes } from 'prop-types';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import { useUserData } from '../hooks/useUserData';
import { twMerge } from 'tailwind-merge';
import { useCart } from '../hooks/useCart';

export function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { pathname } = location;
    const [user] = useAuthState(auth);

    const { userData } = useUserData();

    const isInHomePage = pathname === (dashboardPath || loginPath);
    const isInBookingPage = pathname === bookingPath;
    const isInServicesPage = pathname === servicesPath;
    const isInContactPage = pathname === contactPath;

    const [isNavOpen, setIsNavOpen] = useState(false);

    async function logout() {
        try {
            await signOut(auth);

            if (isNavOpen) {
                toggleNav();
            }

            navigate(loginPath);
        } catch (error) {
            console.error('Unable to log out: ', error);
        }
    }

    function goToLogin() {
        if (isNavOpen) {
            toggleNav();
        }

        navigate(loginPath);
    }

    function goToRegister() {
        if (isNavOpen) {
            toggleNav();
        }

        navigate('/register');
    }

    function goToCheckout() {
        if (isNavOpen) {
            toggleNav();
        }

        navigate('/checkout');
    }

    function toggleNav() {
        setIsNavOpen(!isNavOpen);
        if (!isNavOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    }

    function closeNav() {
        setIsNavOpen(false);
        document.body.classList.remove('no-scroll');
    }

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth >= 768) {
                closeNav();
            }
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <header className="mt-4 p-2 w-full flex flex-col gap-2">
            <section className="w-full flex items-center justify-between">
                <LogoSection />

                <NavItemsSection
                    user={user}
                    isInHomePage={isInHomePage}
                    isInBookingPage={isInBookingPage}
                    isInServicesPage={isInServicesPage}
                    isInContactPage={isInContactPage}
                />

                <Button className={`md:hidden ${isNavOpen && 'hidden'}`} onClick={toggleNav}>
                    <Menu />
                </Button>

                <LogoutSection
                    classAdded="hidden md:flex"
                    userData={userData}
                    user={user}
                    goToLogin={goToLogin}
                    goToRegister={goToRegister}
                    goToCheckout={goToCheckout}
                    logout={logout}
                />
            </section>

            {user && (
                <section className="w-full flex justify-end text-dark">
                    <div className="flex gap-2">
                        <p className="font-semibold">Logged in:</p>
                        <p>{userData?.name}</p>
                    </div>
                </section>
            )}

            {isNavOpen && (
                <ClosedNavItemsSection
                    user={user}
                    closeNav={closeNav}
                    isInHomePage={isInHomePage}
                    isInServicesPage={isInServicesPage}
                    isInContactPage={isInContactPage}
                    goToLogin={goToLogin}
                    goToRegister={goToRegister}
                    logout={logout}
                />
            )}
        </header>
    );
}

function LogoSection() {
    return (
        <Link to="/">
            <div className="flex items-center gap-2">
                <img src={logo} className="w-10 rounded-full" alt="logo" />
                <h1 className="text-xl">{APP_NAME}</h1>
            </div>
        </Link>
    );
}

function LoginLinks({ goToLogin, goToRegister }) {
    return (
        <div className="gap-5">
            <Button className="text-sm md:text-base" onClick={goToLogin} variant="dark">
                Login
            </Button>
            <Button className="text-sm md:text-base" onClick={goToRegister} variant="light_border">
                Register
            </Button>
        </div>
    );
}

LoginLinks.propTypes = {
    goToLogin: PropTypes.func.isRequired,
    goToRegister: PropTypes.func.isRequired,
};

function LogoutButton({ logout }) {
    return (
        <Button className="text-sm md:text-base" onClick={logout} variant="hot">
            Logout
        </Button>
    );
}

LogoutButton.propTypes = {
    logout: PropTypes.func.isRequired,
};

function LogoutSection({ userData, classAdded, user, goToLogin, goToRegister, goToCheckout, logout }) {
    const { cart } = useCart();

    return (
        <div className={twMerge('flex items-center gap-5', classAdded)}>
            {userData && userData.userType === userType2 && (
                <div className="relative max-w-30">
                    {cart && cart.length > 0 && (
                        <span className="absolute flex justify-center items-center top-0 right-0 z-0 w-fit px-2 rounded-full bg-red-500 text-xs text-white">
                            {cart.length}
                        </span>
                    )}
                    <Button onClick={goToCheckout} variant="transparent" size="round">
                        <ShoppingCartIcon />
                    </Button>
                </div>
            )}
            {!user ? (
                <LoginLinks goToLogin={goToLogin} goToRegister={goToRegister} />
            ) : (
                <LogoutButton logout={logout} />
            )}
        </div>
    );
}

LogoutSection.propTypes = {
    userData: PropTypes.object.isRequired,
    classAdded: PropTypes.string,
    user: PropTypes.object,
    goToLogin: PropTypes.func.isRequired,
    goToRegister: PropTypes.func.isRequired,
    goToCheckout: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
};

function NavItemsSection({ user, isInHomePage, isInServicesPage, isInContactPage }) {
    return (
        <nav className="mx-auto flex items-end md:items-center justify-between md:gap-1 lg:gap-3 px-4 py-3 md:px-6">
            <ul className="hidden md:flex md:gap-10">
                <li
                    className={`text-sm hover:text-normal transition-colors bg-secondary text-primary ${
                        isInHomePage && 'text-primary-hover font-medium'
                    }`}
                >
                    <Link to={user ? dashboardPath : loginPath}>Home</Link>
                </li>
                <li
                    className={`text-sm hover:text-normal transition-colors bg-secondary text-primary ${
                        isInServicesPage && 'text-primary-hover font-medium'
                    }`}
                >
                    <Link to={servicesPath}>Services</Link>
                </li>
                <li
                    className={`text-sm hover:text-normal transition-colors bg-secondary text-primary ${
                        isInContactPage && 'text-primary-hover font-medium'
                    }`}
                >
                    <Link to={contactPath}>Contact</Link>
                </li>
            </ul>
        </nav>
    );
}

NavItemsSection.propTypes = {
    user: PropTypes.object, // COME BACK TO THIS
    isInHomePage: PropTypes.bool.isRequired,
    isInServicesPage: PropTypes.bool.isRequired,
    isInContactPage: PropTypes.bool.isRequired,
};

function ClosedNavItemsSection({
    user,
    closeNav,
    isInHomePage,
    isInServicesPage,
    isInContactPage,
    goToLogin,
    goToRegister,
    logout,
}) {
    return (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-95 flex flex-col items-center justify-center">
            <Button className="absolute top-9 right-6" onClick={closeNav}>
                <X className="w-8 h-8" />
            </Button>
            <ul className="flex flex-col gap-6 text-center">
                <li
                    className={`text-lg text-primary hover:text-primary-hover transition-colors ${
                        isInHomePage && 'text-primary-hover font-medium'
                    }`}
                    onClick={closeNav}
                >
                    <Link to={user ? dashboardPath : loginPath}>Home</Link>
                </li>
                <li
                    className={`text-lg text-primary hover:text-primary-hover transition-colors ${
                        isInServicesPage && 'text-primary-hover font-medium'
                    }`}
                    onClick={closeNav}
                >
                    <Link to={servicesPath}>Services</Link>
                </li>
                <li
                    className={`text-lg text-primary hover:text-primary-hover transition-colors ${
                        isInContactPage && 'text-primary-hover font-medium'
                    }`}
                    onClick={closeNav}
                >
                    <Link to={contactPath}>Contact</Link>
                </li>
                <li>
                    <LogoutSection
                        class="flex"
                        user={user}
                        goToLogin={goToLogin}
                        goToRegister={goToRegister}
                        logout={logout}
                    />
                </li>
            </ul>
        </div>
    );
}

ClosedNavItemsSection.propTypes = {
    user: PropTypes.object, // COME BACK TO THIS
    closeNav: PropTypes.func.isRequired,
    isInHomePage: PropTypes.bool.isRequired,
    isInServicesPage: PropTypes.bool.isRequired,
    isInContactPage: PropTypes.bool.isRequired,
    goToLogin: PropTypes.func.isRequired,
    goToRegister: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
};

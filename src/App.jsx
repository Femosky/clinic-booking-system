// import reactLogo from './assets/react.svg'
import { Route, Routes } from 'react-router-dom';
import './App.css';
import { Homepage } from './pages/Homepage';
import { Dashboard } from './pages/Dashboard';
import { Navbar } from './layouts/Navbar';
import { Footer } from './layouts/Footer';
import { PrivateRoutes } from './utils/PrivateRoutes';
import { Login } from './pages/Login';
import { Error404 } from './pages/Error404';
import { Booking } from './pages/Booking';
import { ServicesPage } from './pages/ServicesPage';
import { Contact } from './pages/Contact';
import { Register } from './pages/Register';
import {
    bookingPath,
    contactPath,
    dashboardPath,
    error404Path,
    homePath,
    loginPath,
    PAGE_MAX_WIDTH,
    registerPath,
    servicesPath,
} from './global/global_variables';
import { twMerge } from 'tailwind-merge';
import { PublicRoutes } from './utils/PublicRoutes';

function App() {
    return (
        <div className="flex-1 flex flex-col min-w-[20rem] w-full min-h-screen justify-between md:items-center">
            <div className={twMerge('flex flex-col items-center px-6 w-full', PAGE_MAX_WIDTH)}>
                <Navbar />
                <div className="w-full my-10 flex flex-col items-center border border-red-600">
                    <Routes>
                        <Route element={<PublicRoutes />}>
                            <Route path={homePath} element={<Homepage />} />
                            <Route path={loginPath} element={<Login />} />
                            <Route path={registerPath} element={<Register />} />
                        </Route>
                        <Route element={<PrivateRoutes />}>
                            <Route path={dashboardPath} element={<Dashboard />} />
                            <Route path={bookingPath} element={<Booking />} />
                            <Route path={servicesPath} element={<ServicesPage />} />
                            <Route path={contactPath} element={<Contact />} />
                        </Route>
                        <Route path={error404Path} element={<Error404 />} />
                    </Routes>
                </div>
            </div>

            <Footer className="bg-dark flex justify-center px-6" />
        </div>
    );
}

export default App;

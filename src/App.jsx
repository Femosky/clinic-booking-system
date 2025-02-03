// import reactLogo from './assets/react.svg'
import { Route, Routes } from 'react-router-dom';
import './App.css';
import { Homepage } from './assets/pages/Homepage';
import { Navbar } from './assets/layouts/Navbar';
import { PrivateRoutes } from './assets/utils/PrivateRoutes';
import { Login } from './assets/pages/Login';
import { Error404 } from './assets/pages/Error404';

function App() {
    return (
        <>
            <div>
                <Navbar />
                <div>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route element={<PrivateRoutes />}>
                            <Route path="/" element={<Homepage />} />
                        </Route>
                        <Route path="*" element={<Error404 />} />
                    </Routes>
                </div>
            </div>
        </>
    );
}

export default App;

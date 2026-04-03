import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Success from './pages/Success';
import Admin from './pages/Admin';
import ServicesManagement from './pages/ServicesManagement';
import { SettingsProvider } from './context/SettingsContext';

function App() {
    return (
        <SettingsProvider>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="reservar" element={<Booking />} />
                    <Route path="exito" element={<Success />} />
                    <Route path="admin" element={<Admin />} />
                    <Route path="admin/servicios" element={<ServicesManagement />} />
                </Route>
            </Routes>
        </SettingsProvider>
    );
}

export default App;

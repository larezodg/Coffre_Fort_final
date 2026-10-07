import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import TopBar from './TopBar';

const AppLayout = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    // Ferme le menu mobile à chaque changement de page
    useEffect(() => { setMenuOpen(false); }, [location.pathname]);

    return (
        <div className="min-h-screen bg-background">
            <AppSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
            <div className="lg:ml-64 min-w-0">
                <TopBar onMenuClick={() => setMenuOpen(true)} />
                <main className="p-4 sm:p-6 animate-fade-in min-w-0" role="main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;

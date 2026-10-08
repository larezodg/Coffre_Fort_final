import PageMotion from '@/components/shared/PageMotion';
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
                <main className="mx-auto max-w-[1440px] p-4 sm:p-8 min-w-0" role="main">
                    <PageMotion key={location.pathname}><Outlet /></PageMotion>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;

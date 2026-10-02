import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import TopBar from './TopBar';

const AppLayout = () => {
    return (
        <div className="min-h-screen bg-background">
            <AppSidebar />
            <div className="ml-64">
                <TopBar />
                <main className="p-6 animate-fade-in" role="main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;

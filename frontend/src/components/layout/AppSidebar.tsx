import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/user';
import { useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard, Users, FileText, Upload, History, Shield,
    Activity, Settings, LogOut, Heart, FolderLock, UserCheck, UserCircle
} from 'lucide-react';

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    roles: UserRole[];
}

const navItems: NavItem[] = [
    { label: 'Tableau de bord', path: '/dashboard', icon: <LayoutDashboard size={18} />, roles: ['admin', 'doctor', 'patient'] },
    { label: 'Patients', path: '/patients', icon: <Users size={18} />, roles: ['admin', 'doctor'] },
    { label: 'Téléverser', path: '/upload', icon: <Upload size={18} />, roles: ['doctor'] },
    { label: 'Documents', path: '/documents', icon: <FileText size={18} />, roles: ['admin', 'doctor'] },
    { label: 'Mes Documents', path: '/my-documents', icon: <FolderLock size={18} />, roles: ['patient'] },
    { label: 'Utilisateurs', path: '/admin/users', icon: <UserCheck size={18} />, roles: ['admin'] },
    { label: 'Gestion Patients', path: '/admin/patients', icon: <Users size={18} />, roles: ['admin'] },
    { label: 'Journal d\'audit', path: '/audit', icon: <History size={18} />, roles: ['admin'] },
    { label: 'Surveillance', path: '/admin/monitoring', icon: <Activity size={18} />, roles: ['admin'] },
    { label: 'Sécurité', path: '/admin/security', icon: <Shield size={18} />, roles: ['admin'] },
    { label: 'Mon profil', path: '/profile', icon: <UserCircle size={18} />, roles: ['admin', 'doctor', 'patient'] },
];

const AppSidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    if (!user) return null;

    const filteredNav = navItems.filter(item => item.roles.includes(user.role));

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col" role="navigation" aria-label="Menu principal">
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
                <div className="w-9 h-9 rounded-lg medical-gradient-bg flex items-center justify-center">
                    <Heart size={18} className="text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-sm font-display font-bold text-sidebar-accent-foreground">Coffre-fort</h1>
                    <p className="text-xs text-sidebar-foreground/50">Dossier Patient</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Navigation principale">
                {filteredNav.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={location.pathname === item.path ? 'sidebar-link-active' : 'sidebar-link'}
                        aria-current={location.pathname === item.path ? 'page' : undefined}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* User */}
            <div className="border-t border-sidebar-border px-4 py-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-medium text-sidebar-primary">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{user.name}</p>
                        <p className="text-xs text-sidebar-foreground/50 capitalize">{user.role}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => void logout()}
                    className="sidebar-link w-full text-destructive/80 hover:text-destructive"
                    aria-label="Se déconnecter"
                >
                    <LogOut size={18} />
                    <span>Déconnexion</span>
                </button>
            </div>
        </aside>
    );
};

export default AppSidebar;

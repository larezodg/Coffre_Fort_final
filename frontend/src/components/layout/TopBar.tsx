import { useAuth } from '@/contexts/AuthContext';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

const TopBar = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between" role="banner">
            <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="search"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="medical-input pl-9 py-2"
                    aria-label="Recherche globale"
                />
            </div>
            <div className="flex items-center gap-3">
                <NotificationDropdown />
                <Link to="/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Mon profil">
                    <Avatar className="w-8 h-8 text-xs">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
                </Link>
            </div>
        </header>
    );
};

export default TopBar;

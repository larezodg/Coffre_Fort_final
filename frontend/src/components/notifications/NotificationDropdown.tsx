import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, Check, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

const typeConfig: Record<Notification['type'], { icon: React.ReactNode; color: string }> = {
    info: { icon: <Info size={14} />, color: 'text-info bg-info/10' },
    warning: { icon: <AlertTriangle size={14} />, color: 'text-warning bg-warning/10' },
    success: { icon: <CheckCircle size={14} />, color: 'text-success bg-success/10' },
    error: { icon: <XCircle size={14} />, color: 'text-destructive bg-destructive/10' },
};

const NotificationDropdown = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="relative p-2 rounded-lg hover:bg-muted transition-colors" aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}>
                    <Bell size={18} className="text-muted-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-primary hover:underline flex items-center gap-1 px-2 py-1 rounded hover:bg-muted" aria-label="Tout marquer comme lu">
                                <CheckCheck size={13} /> Tout lire
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-destructive px-2 py-1 rounded hover:bg-muted" aria-label="Effacer toutes les notifications">
                                <Trash2 size={13} />
                            </button>
                        )}
                    </div>
                </div>

                <ScrollArea className="max-h-80">
                    {notifications.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">Aucune notification</div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map(n => {
                                const cfg = typeConfig[n.type];
                                return (
                                    <div
                                        key={n.id}
                                        className={`px-4 py-3 flex gap-3 hover:bg-muted/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${cfg.color}`}>
                                            {cfg.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm leading-tight ${!n.read ? 'font-semibold' : 'font-medium text-muted-foreground'}`}>{n.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                                            <p className="text-[11px] text-muted-foreground/70 mt-1">
                                                {formatDistanceToNow(n.createdAt, { addSuffix: true, locale: fr })}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1 shrink-0">
                                            {!n.read && (
                                                <button onClick={() => markAsRead(n.id)} className="p-1 rounded hover:bg-muted" aria-label="Marquer comme lu">
                                                    <Check size={13} className="text-primary" />
                                                </button>
                                            )}
                                            <button onClick={() => removeNotification(n.id)} className="p-1 rounded hover:bg-muted" aria-label="Supprimer">
                                                <Trash2 size={13} className="text-muted-foreground" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationDropdown;

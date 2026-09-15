import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
    read: boolean;
    createdAt: Date;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const initialNotifications: Notification[] = [
    { id: '1', title: 'Nouveau document', message: 'Dr. Laurent a téléversé un document pour Jean Dupont.', type: 'info', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 5) },
    { id: '2', title: 'Sauvegarde réussie', message: 'La sauvegarde quotidienne a été effectuée avec succès.', type: 'success', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 30) },
    { id: '3', title: 'Alerte sécurité', message: 'Tentative de connexion suspecte détectée depuis une IP inconnue.', type: 'warning', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: '4', title: 'Mise à jour système', message: 'Le système sera mis à jour ce soir à 23h00.', type: 'info', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) },
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = useCallback((n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
        setNotifications(prev => [{
            ...n,
            id: crypto.randomUUID(),
            read: false,
            createdAt: new Date(),
        }, ...prev]);
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, removeNotification, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
};

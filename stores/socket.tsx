'use client';

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';
import { useAuth } from './auth';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@/types';

interface SocketState {
    socket: Socket | null;
    isConnected: boolean;
    notifications: Notification[];
    unreadCount: number;
    activeConversationId: string | null;
    // Actions
    setSocket: (socket: Socket | null) => void;
    setIsConnected: (connected: boolean) => void;
    setActiveConversationId: (id: string | null) => void;
    addNotification: (notification: Notification) => void;
    markAsRead: (id: string) => void;
    markAllAsReadLocal: () => void;
    clearNotifications: () => void;
    setNotifications: (notifications: Notification[]) => void;
    setUnreadCount: (count: number) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
    socket: null,
    isConnected: false,
    notifications: [],
    unreadCount: 0,
    activeConversationId: null,
    setSocket: (socket) => set({ socket }),
    setIsConnected: (isConnected) => set({ isConnected }),
    setActiveConversationId: (id) => set({ activeConversationId: id }),
    addNotification: (notification) => set((state) => {
        // Suppress message notifications if user is currently viewing that conversation
        const notifConversationId = notification.metadata?.conversationId || notification.relatedId;
        if (notification.type === 'new_message' && notifConversationId === state.activeConversationId) {
            return { notifications: state.notifications, unreadCount: state.unreadCount };
        }

        const existingIndex = state.notifications.findIndex(n => n._id === notification._id);

        if (existingIndex !== -1) {
            // Update existing notification
            const updatedNotifications = [...state.notifications];
            updatedNotifications[existingIndex] = notification;
            // Move to top if updated? Or keep position? Usually move to top.
            updatedNotifications.splice(existingIndex, 1);
            updatedNotifications.unshift(notification);

            return {
                notifications: updatedNotifications,
                // Unread count doesn't change if we are just updating an existing unread one
                unreadCount: state.unreadCount
            };
        }

        return {
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1
        };
    }),
    markAsRead: (id) => set((state) => {
        const wasUnread = state.notifications.find(n => n._id === id && !n.isRead);
        return {
            notifications: state.notifications.map((n) =>
                n._id === id ? { ...n, isRead: true } : n
            ),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        };
    }),
    markAllAsReadLocal: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
    })),
    clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
    setNotifications: (notifications) => set({ notifications }),
    setUnreadCount: (unreadCount) => set({ unreadCount }),
}));

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const { user, isAuthenticated } = useAuth() as any;
    const {
        setSocket,
        setIsConnected,
        addNotification,
        setUnreadCount,
        socket: currentSocket,
        activeConversationId
    } = useSocketStore();

    useEffect(() => {
        // If not authenticated, ensure socket is disconnected
        if (!isAuthenticated || !user) {
            if (currentSocket) {
                currentSocket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // Initialize new connection
        const newSocket = io(SOCKET_URL, {
            withCredentials: true,
            auth: {
                userId: user._id,
            },
            transports: ['websocket', 'polling'],
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
            // Fetch initial unread count
            api.notification.getUnreadCount()
                .then(res => setUnreadCount(res.count))
                .catch(err => console.error('Failed to fetch unread count', err));
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('notification', (notification: Notification) => {
            console.log('Received notification:', notification);

            // Check active conversation here as well for redundancy, though store action handles strictly local state updates
            // But we might want to avoid invalidating queries if it's suppressed
            const currentActiveId = useSocketStore.getState().activeConversationId;
            const notifConversationId = notification.metadata?.conversationId || notification.relatedId;

            if (notification.type === 'new_message' && notifConversationId === currentActiveId) {
                return;
            }

            addNotification(notification);
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });

        newSocket.on('connect_error', (error: any) => {
            console.error('Socket connection error:', error.message);
        });

        setSocket(newSocket);

        // Cleanup on unmount or dependency change
        return () => {
            newSocket.disconnect();
        };
    }, [isAuthenticated, user?._id]);

    return <>{children}</>;
}

export function useSocket() {
    return useSocketStore();
}






'use client';
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { AuthState, SignupPayload, LoginPayload } from '@/types';
import { authApi, ApiClientError } from '@/lib/api';
import { create } from 'zustand';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// ====================
// AUTH STORE TYPES
// ====================

interface AuthStore extends AuthState {
    login: (payload: LoginPayload, options?: { redirect?: boolean }) => Promise<void>;
    signup: (payload: SignupPayload, options?: { redirect?: boolean }) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
    refreshUser: () => Promise<void>;
    init: () => Promise<void>;
}

// ====================
// ZUSTAND STORE
// ====================

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,

    init: async () => {
        // Prevent double initialization if already loaded/loading? 
        // But for strict replacement of useEffect(() => { init() }, []), we just run it.
        try {
            console.log('[Auth] Checking session...');
            const { user } = await authApi.getMe();
            console.log('[Auth] Session found:', user.email);
            set({
                user,
                isLoading: false,
                isAuthenticated: true,
                error: null,
            });
        } catch (err) {
            console.log('[Auth] No session found (this is normal for guests)');
            set({
                user: null,
                isLoading: false,
                isAuthenticated: false,
                error: null,
            });
        }
    },

    login: async (payload: LoginPayload) => {
        set({ isLoading: true, error: null });
        try {
            const { user } = await authApi.login(payload);
            set({
                user,
                isLoading: false,
                isAuthenticated: true,
                error: null,
            });
        } catch (err) {
            const message = err instanceof ApiClientError ? err.message : 'Login failed';
            set({
                isLoading: false,
                error: message,
            });
            throw err;
        }
    },

    signup: async (payload: SignupPayload) => {
        set({ isLoading: true, error: null });
        try {
            const { user } = await authApi.signup(payload);
            set({
                user,
                isLoading: false,
                isAuthenticated: true,
                error: null,
            });
        } catch (err) {
            const message = err instanceof ApiClientError ? err.message : 'Signup failed';
            set({
                isLoading: false,
                error: message,
            });
            throw err;
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await authApi.logout();
        } catch {
            // Ignore logout errors
        }
        set({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
        });
    },

    clearError: () => {
        set({ error: null });
    },

    refreshUser: async () => {
        try {
            const { user } = await authApi.getMe();
            set({ user });
        } catch {
            // Silently fail
        }
    },
}));

// ====================
// HELPER HOOK
// ====================

// Wrap the store to add navigation logic which depends on useRouter
// The original Context mixed state management with navigation side-effects in 'login'/'signup' and 'logout'.
// Zustand actions are pure functions often, but can have side effects. However, hooks like useRouter are not available inside vanilla JS functions (the store actions).
// So we need to handle navigation separately or inject the router.
// Strategy: The useAuth hook will return the store state + wrapped functions that handle navigation.

export function useAuth() {
    const store = useAuthStore();
    const router = useRouter();

    // Wrapping actions to include navigation, replicating the original Context behavior
    const loginWithRedirect = async (payload: LoginPayload, options?: { redirect?: boolean }) => {
        await store.login(payload);
        if (options?.redirect === false) return;

        const user = useAuthStore.getState().user; // Get fresh state
        if (user?.role === 'creator') {
            router.push('/dashboard');
        } else {
            router.push('/explore');
        }
    };

    const signupWithRedirect = async (payload: SignupPayload, options?: { redirect?: boolean }) => {
        await store.signup(payload);
        if (options?.redirect === false) return;

        const user = useAuthStore.getState().user;
        if (user?.role === 'creator') {
            router.push('/dashboard');
        } else {
            router.push('/explore');
        }
    };

    const logoutWithRedirect = async () => {
        await store.logout();
        router.push('/login');
    };

    return {
        ...store,
        login: loginWithRedirect,
        signup: signupWithRedirect,
        logout: logoutWithRedirect,
    };
}

// ====================
// AUTH PROVIDER COMPONENT
// ====================

// Acts as an initializer for the store
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const init = useAuthStore((state) => state.init);

    useEffect(() => {
        init();
    }, [init]);

    return <>{children}</>;
}

// ====================
// AUTH GUARD COMPONENTS
// ====================

interface RouteGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Requires user to be authenticated
 */
export function RequireAuth({ children, fallback }: RouteGuardProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Store intended destination for redirect after login
            sessionStorage.setItem('redirectAfterLogin', pathname);
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router, pathname]);

    if (isLoading) {
        return fallback || null;
    }

    if (!isAuthenticated) {
        return fallback || null;
    }

    return <>{children}</>;
}

/**
 * Requires user to be a creator
 */
export function RequireCreator({ children, fallback }: RouteGuardProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role !== 'creator') {
                router.push('/explore');
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading) {
        return fallback || null;
    }

    if (!isAuthenticated || user?.role !== 'creator') {
        return fallback || null;
    }

    return <>{children}</>;
}

/**
 * Requires user to be a member (not creator)
 */
export function RequireMember({ children, fallback }: RouteGuardProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role === 'creator') {
                router.push('/dashboard');
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading) {
        return fallback || <LoadingSpinner />;
    }

    if (!isAuthenticated || user?.role !== 'member') {
        return fallback || <LoadingSpinner />;
    }

    return <>{children}</>;
}

/**
 * Redirects authenticated users away (for login/signup pages)
 */
export function RedirectIfAuthenticated({ children, fallback }: RouteGuardProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            // Check for stored redirect path
            const redirectPath = sessionStorage.getItem('redirectAfterLogin');
            sessionStorage.removeItem('redirectAfterLogin');

            if (redirectPath) {
                router.push(redirectPath);
            } else if (user?.role === 'creator') {
                router.push('/dashboard');
            } else {
                router.push('/explore');
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    // Allow the login/signup form to render immediately even while loading (optimistic UI),
    // because these pages are server-rendered and we want to avoid a spinner flash for guests.

    if (!isLoading && isAuthenticated) {
        return fallback || null;
    }

    return <>{children}</>;
}

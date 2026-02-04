
import { useMemo } from 'react';
import { navigation } from '@/constants/navigation';
import { useAuth } from '@/stores/auth';
import { hasPermission } from '@/constants/permissions';
import { Permission } from '@/types';
import { useMyPage } from '@/hooks/useQueries';

export type NavigationItem = {
    title: string;
    icon: string;
    url: string;
    roles?: string[];
    permissions?: Permission[];
    target?: string;
    onClick?: () => void;
};

export const useNavigation = () => {
    const { user } = useAuth();

    // Fetch user's page data using cached query
    const { data: myPage } = useMyPage();

    // Determine the correct slug: prefer server page slug, fallback to username
    const pageSlug = myPage?.pageSlug || user?.username || null;

    // Compute Final Navigation
    const navItems = useMemo(() => {
        if (!user?.role) return [];

        const filteredNav = navigation.filter((link) => {
            // Check permissions first
            if (link.permissions) {
                return link.permissions.some(permission => hasPermission(user.role, permission));
            }
            // Fallback to roles
            if (link.roles) {
                return link.roles.includes(user.role);
            }
            return true;
        });

        // Inject "Your Page" for creators (or those with page:manage)
        if (hasPermission(user.role, 'page:manage') && pageSlug) {
            // Find index of Dashboard to insert after
            const dashboardIndex = filteredNav.findIndex(item => item.url === '/dashboard');

            if (dashboardIndex !== -1) {
                const yourPageLink: NavigationItem = {
                    title: "Your Page",
                    icon: "profile", // Ensure this icon exists in your Icon component
                    url: `/${pageSlug}`,
                    target: "_blank"
                };

                // Insert after Dashboard
                const newNav = [...filteredNav];
                newNav.splice(dashboardIndex + 1, 0, yourPageLink);
                return newNav;
            }
        }

        return filteredNav;
    }, [user?.role, pageSlug]);

    return navItems;
};

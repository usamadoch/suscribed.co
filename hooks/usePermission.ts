import { useAuth } from '@/stores/auth';
import { hasPermission, ROLE_PERMISSIONS } from '@/constants/permissions';
import { Permission } from '@/types';

export const usePermission = (permission: Permission): boolean => {
    const { user } = useAuth();
    // Assuming user.role matches UserRole type. If user is null, role is undefined.
    return hasPermission(user?.role, permission);
};

export const usePermissions = (): Permission[] => {
    const { user } = useAuth();
    if (!user?.role) return [];
    return ROLE_PERMISSIONS[user.role] || [];
};

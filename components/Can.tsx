import { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { Permission } from '@/types';

type CanProps = {
    permission: Permission;
    children: ReactNode;
    fallback?: ReactNode;
};

const Can = ({ permission, children, fallback = null }: CanProps) => {
    const allowed = usePermission(permission);

    if (allowed) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};

export default Can;

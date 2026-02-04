import { Permission } from '@/types';

type NavigationItem = {
    title: string;
    icon: string;
    url: string;
    roles?: string[]; // Keep for backward compatibility if needed, or deprecate
    permissions?: Permission[];
    target?: string;
};

export const navigation: NavigationItem[] = [
    // Creator Pages

    {
        title: "Dashboard",
        icon: "dashboard",
        url: "/dashboard",
        permissions: ["dashboard:view"],
    },
    {
        title: "Home",
        icon: "dashboard",
        url: "/home",
        permissions: ["explore:view"], // Or feed:view? Using explore:view based on previous analysis
    },
    {
        title: "Posts",
        icon: "document",
        url: "/posts",
        permissions: ["post:create"], // Only creators see "Posts" management
    },
    {
        title: "Members",
        icon: "team",
        url: "/members",
        permissions: ["members:view"],
    },
    // Member Pages
    {
        title: "Explore",
        icon: "search",
        url: "/explore",
        permissions: ["explore:view"],
    },

    // Shared Pages
    {
        title: "Notifications",
        icon: "notification",
        url: "/notifications",
        // No restriction implies everyone, or we can add explicit common permission
    },
    {
        title: "Messages",
        icon: "comments",
        url: "/messages",
    },
    {
        title: "Analytics",
        icon: "chart",
        url: "/analytics",
        permissions: ["analytics:view"],
    },
    {
        title: "Settings",
        icon: "setup",
        url: "/settings",
    },
];

export const navigationMobile = [
    {
        icon: "dashboard",
        url: "/dashboard/ecommerce",
    },
    // {
    //     icon: "projects",
    //     url: "/projects/projects-list-v1",
    // },
    // {
    //     icon: "tasks",
    //     url: "/projects/tasks-list-v1",
    // },
    // {
    //     icon: "layers",
    //     url: "/projects/kanban-desc",
    // },
    {
        icon: "dots",
        onClick: () => console.log("Click on dots"),
    },
];

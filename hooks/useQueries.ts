import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { pageApi, postApi, membershipApi, notificationApi } from "@/lib/api";
import { useAuth } from "@/stores/auth";

// Hook to fetch Creator Page Data (Profile, Banner, etc.)
export const useCreatorPage = (slug: string) => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['creator-page', slug, user?._id],
        queryFn: async () => {
            if (!slug) return null;
            const { page, isOwner, isMember } = await pageApi.getBySlug(slug);
            return { page, isOwner, isMember };
        },
        enabled: !!slug,
        staleTime: 1000 * 60 * 10, // 10 minutes cache for profile info
        refetchOnWindowFocus: false,
    });
};

// Hook to fetch Creator Posts
export const useCreatorPosts = (slug: string) => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['creator-posts', slug, user?._id],
        queryFn: async () => {
            if (!slug) return [];
            const { posts } = await postApi.getAll({ pageSlug: slug, limit: 100 });
            return posts;
        },
        enabled: !!slug,
        staleTime: 1000 * 60 * 2, // 2 minutes cache for posts
    });
};


// Hook to fetch Current User's Page (for Navigation)
export const useMyPage = () => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['my-creation-page', user?._id],
        queryFn: async () => {
            const res = await pageApi.getMyPage();
            return res?.page || null;
        },
        enabled: !!user && (user.role === 'creator' || user.role === 'admin'),
        staleTime: 1000 * 60 * 30, // 30 minutes
        retry: false,
    });
};

// Hook for User Memberships
export const useMyMemberships = (enabled: boolean = true) => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['my-memberships', user?._id],
        queryFn: async () => {
            const { memberships } = await membershipApi.getMyMemberships({ limit: 100 });
            return memberships || [];
        },
        enabled: !!user && enabled,
        staleTime: 1000 * 60 * 15, // 15 minutes
    });
};

// Hook to fetch Members of the Creator's Page
export const useMyMembers = (params: { page: number; limit: number }) => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['my-members', params, user?._id],
        queryFn: async () => {
            return await membershipApi.getMyMembers(params);
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 1, // 1 minute
        placeholderData: keepPreviousData,
    });
};


// Hook for Explore Page
export const useExploreCreators = () => {
    return useQuery({
        queryKey: ['explore-creators'],
        queryFn: async () => {
            const { pages } = await pageApi.getAll();
            return pages || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Hook to fetch Posts (Paginated)
export const usePosts = (params: { page: number; limit: number }) => {
    return useQuery({
        queryKey: ['posts', params],
        queryFn: async () => {
            return await postApi.getAll(params);
        },
        staleTime: 1000 * 60 * 1, // 1 minute
        placeholderData: keepPreviousData,
    });
};

// Hook to fetch a single Post
export const usePost = (id: string) => {
    return useQuery({
        queryKey: ['post', id],
        queryFn: async () => {
            if (!id) return null;
            const data = await postApi.getById(id);
            return data.post;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Hook to fetch Post Comments
export const usePostComments = (postId: string) => {
    return useQuery({
        queryKey: ['post-comments', postId],
        queryFn: async () => {
            if (!postId) return [];
            const data = await postApi.getComments(postId, { limit: 100 });
            return data.comments;
        },
        enabled: !!postId,
        staleTime: 1000 * 60 * 1, // 1 minute
    });
};

// Hook to delete a Post
export const useDeletePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (postId: string) => {
            return await postApi.delete(postId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['creator-posts'] });
        },
    });
};

// Hook to join a page
export const useJoinPage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ creatorId, pageId }: { creatorId: string; pageId: string }) => {
            return await membershipApi.join({ creatorId, pageId });
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['check-membership', variables.pageId] });
            queryClient.invalidateQueries({ queryKey: ['my-memberships'] });
            queryClient.invalidateQueries({ queryKey: ['post', variables.pageId] }); // Potentially helpful
        },
    });
};

// Hook to check membership status
export const useCheckMembership = (pageId: string) => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['check-membership', pageId, user?._id],
        queryFn: async () => {
            if (!pageId || !user) return { isMember: false };
            return await membershipApi.checkMembership(pageId);
        },
        enabled: !!pageId && !!user,
        staleTime: 1000 * 60 * 5,
    });
};

// Hook to fetch Notifications
export const useNotifications = () => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['notifications', user?._id],
        queryFn: async () => {
            return await notificationApi.getAll();
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 1, // 1 minute
        refetchInterval: 1000 * 60 * 2, // Auto refetch every 2 minutes
    });
};

// Hook to mark all notifications as read
export const useMarkNotificationsAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            return await notificationApi.markAllAsRead();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

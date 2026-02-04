
"use client";

import { useCallback } from "react";
import { useParams, notFound } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import CreatorHeader from "@/components/CreatorHeader";
import CreatorBanner from "./components/CreatorBanner";
import CreatorProfileHeader from "./components/CreatorProfileHeader";
import CreatorContent from "./components/CreatorContent";
import { useCreatorPage } from "@/hooks/useQueries";
import { useAuth } from "@/stores/auth";

const CreatorPage = () => {
    const params = useParams();
    const slug = params?.pageSlug as string;
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const { data, isLoading, error } = useCreatorPage(slug);

    const { page, isOwner, isMember } = data || {};

    const handleImageSuccess = useCallback((type: 'banner' | 'avatar', url: string) => {
        queryClient.setQueryData(['creator-page', slug, user?._id], (old: any) => {
            if (!old || !old.page) return old;
            return {
                ...old,
                page: {
                    ...old.page,
                    [type === 'banner' ? 'bannerUrl' : 'avatarUrl']: url
                }
            };
        });
    }, [queryClient, slug, user?._id]);

    const handleJoinSuccess = useCallback(() => {
        queryClient.setQueryData(['creator-page', slug, user?._id], (old: any) => {
            if (!old) return old;
            return {
                ...old,
                isMember: true,
                page: {
                    ...old.page,
                    memberCount: (old.page.memberCount || 0) + 1
                }
            };
        });
    }, [queryClient, slug, user?._id]);

    if (error && (error as any).code === 'NOT_PUBLISHED') {
        return (
            <div className="flex items-center justify-center h-screen bg-n-1 text-white">
                <div className="text-center">
                    <h1 className="text-h3 mb-2">Page Not Published Yet</h1>
                    <p className="text-n-3">This creator page is currently in draft mode and hasn't been published yet.</p>
                </div>
            </div>
        );
    }


    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!page) {
        notFound();
    }

    // Check for missing fields for warning
    const missingFields = [];
    if (!page.bannerUrl) missingFields.push('Banner image');
    if (!page.avatarUrl) missingFields.push('Profile picture');
    if (!page.about) missingFields.push('About section');

    return (
        <>
            <CreatorHeader />


            <CreatorBanner
                page={page}
                isOwner={!!isOwner}
                onUpdate={handleImageSuccess}
            />

            <div className="max-w-[90rem] mx-auto">
                <CreatorProfileHeader
                    page={page}
                    isOwner={!!isOwner}
                    isMember={!!isMember}
                    onUpdate={handleImageSuccess}
                    onJoinSuccess={handleJoinSuccess}
                />

                {/* Content section handles its own loading */}
                <CreatorContent pageSlug={slug} />
            </div>
        </>
    );
};

export default CreatorPage;


"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import Modal from "@/components/Modal";
import { api } from "@/lib/api";
import { useCreatorPage } from "@/hooks/useQueries";
import { CreatorPage as CreatorPageType } from "@/types";
import Loader from "../Loader";

const DraftBanner = () => {
    const params = useParams();
    const slug = params?.pageSlug as string;
    const queryClient = useQueryClient();
    const [showPublishModal, setShowPublishModal] = useState(false);

    const { data } = useCreatorPage(slug);
    const { page, isOwner } = data || {};

    const publishMutation = useMutation({
        mutationFn: async () => {
            return await api.page.updateMyPage({ status: 'published' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['creator-page', slug] });
            queryClient.invalidateQueries({ queryKey: ['explore-creators'] });
            setShowPublishModal(false);
        }
    });

    const isDraft = page?.status === 'draft';
    // Only show banner if owner and draft
    const showDraftBanner = isOwner && isDraft;

    // Check for missing fields for warning
    const missingFields = [];
    if (page && !page.bannerUrl) missingFields.push('Banner image');
    if (page && !page.avatarUrl) missingFields.push('Profile picture');
    if (page && !page.about) missingFields.push('About section');

    if (!showDraftBanner) return null;

    return (
        <>
            <div className="w-full bg-yellow-100 border-b border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-900 text-yellow-800 dark:text-yellow-200 py-3 px-4 z-40 relative">
                <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center justify-between w-full gap-4">
                        <div className="flex items-center gap-2">
                            <span className="bg-yellow-200 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">Draft</span>
                            <span className="font-medium">Your page is unpublished. Only you can see it.</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowPublishModal(true)}
                                className="btn-purple btn-medium bg-yellow-600 hover:bg-yellow-700 px-12"
                            >
                                Publish Page
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                visible={showPublishModal}
                onClose={() => setShowPublishModal(false)}
                title="Publish Page"
            >
                <div className="space-y-4">
                    <p className="text-n-3">
                        Are you sure you want to publish your page? It will become visible to everyone.
                    </p>

                    {missingFields.length > 0 && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-100 dark:border-orange-900/30">
                            <h4 className="text-orange-800 dark:text-orange-200 font-medium mb-2 flex items-center gap-2">
                                <span className="text-lg">⚠️</span> Complete your profile
                            </h4>
                            <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
                                Your page is looking a bit empty! Consider adding the following before publishing:
                            </p>
                            <ul className="list-disc pl-5 text-sm text-orange-700 dark:text-orange-300 space-y-1">
                                {missingFields.map(field => (
                                    <li key={field}>{field}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex gap-3 mt-6 pt-4 border-t border-n-3/10">

                        <button
                            className="btn-stroke w-full btn-medium px-10"
                            type="button"
                            onClick={() => setShowPublishModal(false)}
                        >
                            Cancel
                        </button>

                        <button
                            className="btn-purple w-full btn-medium px-10 md:!bg-transparent md:border-none md:w-6 md:h-6 md:p-0 md:text-0"

                            onClick={() => publishMutation.mutate()}
                            disabled={publishMutation.isPending}
                        >
                            {publishMutation.isPending ? <Loader /> : 'Publish'}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default DraftBanner;

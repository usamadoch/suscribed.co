
"use client"

import { usePost } from "@/hooks/useQueries";
import { useRouter } from "next/navigation";
import { useEffect, use, useState } from "react";
import { usePostForm } from "../NewPostPage/usePostForm";
import Layout from "@/components/Layout";
import PostForm from "../NewPostPage/components/PostForm";
import Modal from "@/components/Modal";
import { LoadingSpinner } from "@/components/LoadingSpinner";




type EditPostProps = {
    params: Promise<{
        id: string;
    }>;
};

const EditPostPage = ({ params }: EditPostProps) => {
    const { id } = use(params);

    const { data: post, isLoading, isError } = usePost(id);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
    const router = useRouter();

    const formState = usePostForm({
        initialData: post || undefined,
        isEditing: true
    });

    const { isDirty } = formState;

    // Handle browser back/refresh
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);


    const handleBack = () => {
        if (isDirty) {
            setPendingNavigation('back');
            setShowUnsavedModal(true);
        } else {
            router.back();
        }
    };

    const confirmNavigation = () => {
        setShowUnsavedModal(false);
        if (pendingNavigation === 'back') {
            router.back();
        }
        // Add other navigation types if needed
    };

    if (isLoading) {
        return (
            <Layout title="Edit Post" createBtn={false} back onBack={handleBack}>
                <LoadingSpinner />
            </Layout>
        );
    }

    if (isError || !post) {
        return (
            <Layout title="Edit Post" createBtn={false} back onBack={() => router.push('/posts')}>
                <div className="text-center py-20">
                    <div className="h4 mb-4">Post not found</div>
                    <button className="btn-purple" onClick={() => router.push('/posts')}>
                        Go back to posts
                    </button>
                </div>
            </Layout>
        );
    }
    return (
        <Layout title="Edit Post" createBtn={false} back onBack={handleBack}>
            <PostForm formState={formState} submitLabel="Update Post" />

            <Modal
                title="Unsaved Changes"
                visible={showUnsavedModal}
                onClose={() => setShowUnsavedModal(false)}
            >
                <div className="text-n-1 dark:text-white mb-8">
                    Are you sure you want to leave this page? Your changes will not be saved.
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        className="btn-stroke btn-medium"
                        onClick={() => setShowUnsavedModal(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-purple btn-medium"
                        onClick={confirmNavigation}
                    >
                        OK
                    </button>
                </div>
            </Modal>
        </Layout>
    );
};


export default EditPostPage;

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import MediaBlock from "./MediaBlock";
import MediaCarousel from "./MediaCarousel";
import LockedContent from "./LockedContent";
import CommentsSection from "./CommentsSection";
import { usePost, usePostComments, useCheckMembership, useJoinPage } from "@/hooks/useQueries";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/stores/auth";
import Icon from "@/components/Icon";
import Image from "@/components/Image";
import { getFullImageUrl } from "@/lib/utils";

import CreatorHeader from "@/components/CreatorHeader";

const PostDetailPage = () => {
    const params = useParams();
    const postId = params.id as string;
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const { data: post, isLoading: isPostLoading } = usePost(postId);
    const { data: comments, isLoading: isCommentsLoading } = usePostComments(postId);

    // Check membership only if we have a post
    const { data: membershipData, isLoading: isMembershipLoading } = useCheckMembership(post?.pageId || "");
    const isMember = !!membershipData?.isMember;

    const { mutate: joinPage, isPending: isJoining } = useJoinPage();

    const [value, setValue] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const isLoading = isPostLoading || isCommentsLoading || isMembershipLoading;

    const handleCommentSubmit = async () => {
        if (!value.trim()) return;

        setIsSubmittingComment(true);
        try {
            const { comment } = await api.post.addComment(postId, { content: value });
            toast.success("Comment added");
            setValue("");

            // Update cache immediately to show new comment
            queryClient.setQueryData(['post-comments', postId], (oldComments: any[] | undefined) => {
                return oldComments ? [comment, ...oldComments] : [comment];
            });

            // Invalidate/refetch comments to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
            // Optionally update post comment count
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
        } catch (error) {
            console.error(error);
            toast.error("Failed to add comment");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    // Determine media to show. Prioritize attachments
    const mediaItems = post?.mediaAttachments && post.mediaAttachments.length > 0
        ? post.mediaAttachments
        : [];

    const isOwner = user?._id === (typeof post?.creatorId === 'object' ? post.creatorId._id : post?.creatorId);

    const locked = (() => {
        if (!post) return false;
        if (isOwner) return false;
        if (post.visibility === 'public') return false;
        if (post.visibility === 'members' && isMember) return false;
        return true;
    })();

    const handleJoin = () => {
        if (!post) return;
        if (user) {
            const creatorId = typeof post.creatorId === 'object' ? post.creatorId._id : post.creatorId;
            joinPage({ creatorId, pageId: post.pageId }, {
                onSuccess: () => toast.success("Joined successfully!")
            });
        } else {
            setIsLoginModalOpen(true);
        }
    };

    return (
        <>
            {isLoading ? (
                <div className="w-full h-96 flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            ) : !post ? (
                <div className="p-10 text-center text-n-1 dark:text-white">Post not found</div>
            ) : (
                <>

                    <CreatorHeader />
                    <div className="w-full">
                        {/* Media Gallery */}
                        {mediaItems.length > 0 && locked ? (
                            <div className="relative w-full h-[512px] bg-n-2 mb-6 rounded-2xl overflow-hidden">
                                <LockedContent type="overlay" text="Join to unlock this content" />
                                <Image
                                    className="object-cover blur-md scale-105 opacity-50"
                                    src={getFullImageUrl(mediaItems[0].url) || "/images/img-1.jpg"}
                                    fill
                                    alt="Locked content shadow"
                                    unoptimized
                                />
                            </div>
                        ) : (
                            mediaItems.length > 1 ? (
                                <MediaCarousel items={mediaItems} />
                            ) : (
                                mediaItems.map((media: any, index: number) => (
                                    <MediaBlock
                                        key={index}
                                        url={media.url}
                                        type={media.type === 'video' ? 'video' : 'image'}
                                        className="mb-4"
                                    />
                                ))
                            )
                        )}

                        <div className="max-w-4xl mx-auto p-5">
                            <div className="relative">
                                {/* {locked && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-n-1/80 backdrop-blur-sm rounded-2xl">
                                    <div className="w-12 h-12 rounded-full bg-n-1 flex items-center justify-center mb-3 shadow-lg">
                                        <Icon name="lock" className="w-6 h-6 fill-purple-1" />
                                    </div>
                                    <div className="text-h6 text-white">Members Only</div>
                                </div>
                            )} */}

                                <div className={`text-sm whitespace-pre-wrap mb-6 text-n-1 dark:text-white ${locked ? "blur-xs select-none" : ""}`}>
                                    {post.caption}
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm text-n-3 border-b border-n-1 dark:border-white/10 pb-4 mb-6">
                                <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                                <div className="flex gap-4">
                                    <span>{post.viewCount} views</span>
                                    <span>{post.likeCount} likes</span>
                                </div>
                            </div>

                            {locked ? (
                                <LockedContent
                                    handleJoin={handleJoin}
                                    isJoining={isJoining}
                                    user={user}
                                    isLoginModalOpen={isLoginModalOpen}
                                    setIsLoginModalOpen={setIsLoginModalOpen}
                                />
                            ) : (
                                <CommentsSection
                                    user={user}
                                    value={value}
                                    setValue={setValue}
                                    handleCommentSubmit={handleCommentSubmit}
                                    isSubmittingComment={isSubmittingComment}
                                    comments={comments || []}
                                />
                            )}
                        </div>

                    </div>

                </>
            )}
        </>
    );
};

export default PostDetailPage;

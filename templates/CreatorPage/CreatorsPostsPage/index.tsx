"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Tabs from "@/components/Tabs";
import Icon from "@/components/Icon";
import Image from "@/components/Image";
import { Post } from "@/types";
import { getFullImageUrl } from "@/lib/utils";
import { useAuth } from "@/stores/auth";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useCreatorPage, useCreatorPosts } from "@/hooks/useQueries";
import CreatorHeader from "@/components/CreatorHeader";


import Link from "next/link";
import LockedContent from "@/templates/PostsPage/PostDetailPage/LockedContent";
import Review from "@/components/Review";

type TabValue = "posts" | "media";

const tabs = [
    {
        title: "posts",
        value: "posts",
    },
    {
        title: "Media",
        value: "media",
    },
];

const CreatorsPostsPage = () => {
    const params = useParams();
    const slug = params?.pageSlug as string;
    const { isAuthenticated, user } = useAuth();

    // Using cached queries
    const { data: pageData, isLoading: isLoadingPage } = useCreatorPage(slug);
    const { data: postsData, isLoading: isLoadingPosts } = useCreatorPosts(slug);

    const page = pageData?.page;
    const isOwner = !!pageData?.isOwner;
    const isMember = !!pageData?.isMember;

    const [activeTab, setActiveTab] = useState<TabValue>("posts");

    const posts = postsData || [];

    const filteredPosts = posts.filter((post: Post) => {
        const hasVideo = post.mediaAttachments?.some(m => m.type === 'video');
        if (activeTab === "media") return hasVideo;
        return !hasVideo; // Text and Image posts
    });

    const isLocked = (post: Post) => {
        if (isOwner) return false;
        if (post.visibility === 'public') return false;
        if (post.visibility === 'members' && isMember) return false;
        return true;
    };

    if (isLoadingPage) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!page) {
        notFound();
    }

    return (
        <>
            <CreatorHeader />
            <div className="max-w-[90rem] mx-auto px-6 2xl:px-8 lg:px-6 md:px-5 pt-24 pb-20">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-h3">Posts</h1>
                    <div className="md:ml-auto">
                        <Tabs
                            className="mr-auto md:ml-0"
                            classButton="md:ml-0 md:flex-1"
                            items={tabs}
                            value={activeTab}
                            setValue={setActiveTab}
                        />
                    </div>
                </div>

                <div className="grid gap-6">
                    {isLoadingPosts ? (
                        <div className="flex items-center justify-center py-20">
                            <LoadingSpinner />
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center py-10 text-n-3">No posts found in this category.</div>
                    ) : (
                        <div className={`grid ${activeTab === 'media' ? 'grid-cols-3 md:grid-cols-2 lg:grid-cols-3 sm:grid-cols-1' : 'grid-cols-1'} gap-6`}>
                            {filteredPosts.map((post) => {
                                const locked = isLocked(post);
                                const media = post.mediaAttachments?.[0];

                                if (activeTab === 'media') {
                                    return (
                                        <Link

                                            href={`/posts/${post._id}`}
                                            target="_blank" key={post._id}
                                            // className="relative group bg-white dark:bg-n-1 rounded-2xl overflow-hidden shadow-sm border border-n-3/10"
                                            className="card"

                                        >


                                            {/* Video Preview */}
                                            <div className="relative aspect-video bg-n-2">
                                                {locked ? (
                                                    <LockedContent type="overlay" text="Join to unlock this content" />
                                                ) : null}

                                                <div className="w-full h-full flex items-center justify-center bg-black">
                                                    <Icon name="video" className="w-8 h-8 fill-white/50" />
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <h4 className="text-sm truncate mb-2">{post.caption || "Untitled Post"}</h4>
                                                <div className="flex items-center text-xs text-n-3">
                                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                                    <span className="mx-2">•</span>
                                                    <span className="flex items-center">
                                                        <Icon name="like" className="w-3 h-3 mr-1 fill-n-3" />
                                                        {post.likeCount}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                } else {
                                    // Text & Image Post
                                    const postItem = {
                                        id: post._id,
                                        author: page?.displayName,
                                        avatar: getFullImageUrl(page?.avatarUrl) || "/images/content/avatar-1.jpg",
                                        time: new Date(post.createdAt).toLocaleDateString(),
                                        content: post.caption,
                                        images: post.mediaAttachments?.filter(m => m.type === 'image').map(m => getFullImageUrl(m.url)) || undefined
                                    };

                                    return (
                                        <div className="w-[calc(66.666%-1.25rem)] lg:w-full lg:mx-0 lg:mb-6" key={post._id}>
                                            <div className="relative">
                                                {locked && (
                                                    <LockedContent type="overlay" text="" />
                                                )}
                                                <div className={locked ? "blur-sm select-none" : ""}>
                                                    <Review item={postItem} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CreatorsPostsPage;

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import { postApi } from "@/lib/api";
import { Post } from "@/types";
import { getFullImageUrl } from "@/lib/utils";

type CreatorContentProps = {
    pageSlug: string;
};

const CreatorContent = ({ pageSlug }: CreatorContentProps) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const { posts } = await postApi.getAll({ pageSlug, limit: 5 });
                setPosts(posts);
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (pageSlug) fetchPosts();
    }, [pageSlug]);

    const getThumbnail = (post: Post) => {
        if (post.mediaAttachments && post.mediaAttachments.length > 0) {
            return post.mediaAttachments[0].thumbnailUrl || post.mediaAttachments[0].url;
        }
        return "/images/course-photo-1.jpg"; // Default fallback
    };

    return (
        <div className="pb-20">


            <h4 className="px-16 text-h4">Latest Posts</h4>
            <div>

                <Link
                    className="mx-16 group flex flex-row w-full max-w-5xl mt-5"
                    href="/education/course-details"
                >
                    <div className="relative h-80 w-1/2 overflow-hidden border border-black">
                        <Image
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            src="/images/course-photo-1.jpg"
                            fill
                            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33.33vw"
                            alt=""
                        />
                    </div>
                    {/* <div className="flex flex-col w-1/2 pt-4 px-5 pb-5">
                            <div className="mb-1 text-h6">Beyond The Game With Jamal Merrell</div>
                            <div className="mb-3.5 text-sm text-n-3 dark:text-white/75">
                                School Name
                                        </div>

                        </div> */}

                    <div className="flex flex-col  w-1/2  pt-4 px-5 pb-5">
                        {/* <div className="mb-1 text-h6">Beyond The Game With Jamal Merrell</div> */}
                        <div className="mb-3.5 text-sm text-n-3 dark:text-white/75">
                            What makes this Video special is that this is the very first time BOHEMIA and Asim Riaz met and finally connect.
                            Sahi Ayy by Asim Riaz X BOHEMIA. Music by Showkidd.
                            Video: Shot/Edit - Ruthvik Anil Jadhav Instagram.com/ruthvik._.10
                            Lyrics: Asim Riaz, Diljan, BOHEMIA.

                        </div>
                        <div className="flex justify-start gap-5 items-center">
                            <div className="text-sm flex items-center gap-1">
                                <Icon name="like" />
                                36
                            </div>
                            <div className="text-sm flex items-center gap-1">
                                <Icon name="comments" />
                                25
                            </div>
                        </div>
                    </div>
                </Link>


            </div>
        </div>
    );
};

export default CreatorContent;

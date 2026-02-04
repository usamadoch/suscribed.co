


"use client";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import Layout from "@/components/Layout";
import Sorting from "@/components/Sorting";
import TablePagination from "@/components/TablePagination";
import Row from "./Row";
import Item from "./Item";
import DataListWrapper from "@/components/DataListWrapper";

import { useHydrated } from "@/hooks/useHydrated";
import { RequireCreator } from "@/stores/auth";
import { usePosts } from "@/hooks/useQueries";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Empty from "@/components/Empty";
import Icon from "@/components/Icon";

const PostsPage = () => {
    const { mounted } = useHydrated();

    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10;

    // React Query Hook
    const { data, isLoading, isError, error } = usePosts({ page, limit });

    const posts = data?.posts || [];
    const pagination = data?.pagination || {
        page: 1,
        limit,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
    };

    console.log(posts);

    const isTablet = useMediaQuery({
        query: "(max-width: 1023px)",
    });

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPage(newPage);
        }
    };

    if (!mounted) return null;

    // Error Message Handling
    const errorMessage = isError
        ? (error instanceof Error ? error.message : "Failed to fetch posts")
        : null;


    console.log(posts.length);

    return (
        <RequireCreator>
            <Layout title="Posts">
                <DataListWrapper isLoading={isLoading} isError={isError} errorMessage={errorMessage}>
                    <>
                        {isTablet ? (
                            <div className="card">
                                {posts.length > 0 ? (
                                    posts.map((post) => (
                                        <Item item={post} key={post._id} />
                                    ))
                                ) : (
                                    <Empty
                                        title="No notifications yet"
                                        content="You’ll get updates when people join your community, interact with your posts and more."
                                        imageSvg={
                                            <Icon
                                                name="notification"
                                                className="w-24 h-24 fill-n-1 dark:fill-white"
                                            />
                                        }
                                    // buttonText="Return Home"
                                    // onClick={() => router.push("/")}
                                    />
                                )}
                            </div>
                        ) : (
                            <table className="table-custom">
                                <thead>
                                    <tr>
                                        <th className="th-custom w-[60%] text-left">
                                            <Sorting title="Caption" />
                                        </th>
                                        <th className="th-custom text-left">
                                            <Sorting title="Views" />
                                        </th>

                                        <th className="th-custom text-left">
                                            <Sorting title="Likes" />
                                        </th>
                                        <th className="th-custom text-left">
                                            <Sorting title="Comments" />
                                        </th>
                                        <th className="th-custom text-left"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.length > 0 ? (
                                        posts.map((post) => (
                                            <Row item={post} key={post._id} />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-gray-500">
                                                No posts found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                        <TablePagination
                            page={pagination.page}
                            totalPages={pagination.totalPages}
                            hasNextPage={pagination.hasNextPage}
                            hasPrevPage={pagination.hasPrevPage}
                            onPageChange={handlePageChange}
                        />
                    </>
                </DataListWrapper>
            </Layout>
        </RequireCreator>
    );
};

export default PostsPage;

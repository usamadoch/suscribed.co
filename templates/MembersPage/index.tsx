





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
import { useMyMembers } from "@/hooks/useQueries";

const MembersPage = () => {
    const { mounted } = useHydrated();

    // Pagination State
    const [page, setPage] = useState(1);
    const limit = 10;

    // React Query Hook
    const { data, isLoading, isError, error } = useMyMembers({ page, limit });

    const memberships = data?.memberships || [];
    const pagination = data?.pagination || {
        page: 1,
        limit,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
    };

    const isMobile = useMediaQuery({
        query: "(max-width: 767px)",
    });

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPage(newPage);
        }
    };

    if (!mounted) return null;

    // Error Message Handling
    const errorMessage = isError
        ? (error instanceof Error ? error.message : "Failed to fetch members")
        : null;


    return (
        <RequireCreator>
            <Layout title="Members">

                <DataListWrapper isLoading={isLoading} isError={isError} errorMessage={errorMessage}>
                    <>
                        {isMobile ? (
                            <div className="card">
                                {memberships.map((membership) => (
                                    <Item item={membership} key={membership._id} />
                                ))}
                            </div>
                        ) : (
                            <table className="table-custom">
                                <thead>
                                    <tr>
                                        <th className="th-custom">
                                            {/* <Checkbox /> */}
                                        </th>
                                        <th className="th-custom">
                                            <Sorting title="Name" />
                                        </th>
                                        <th className="th-custom">
                                            <Sorting title="Tier" />
                                        </th>
                                        <th className="th-custom">
                                            <Sorting title="Joined" />
                                        </th>
                                        <th className="th-custom text-right">
                                            <Sorting title="Status" />
                                        </th>
                                        <th className="th-custom text-right"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {memberships.length > 0 ? (
                                        memberships.map((membership) => (
                                            <Row item={membership} key={membership._id} />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-gray-500">
                                                No members found.
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

export default MembersPage;

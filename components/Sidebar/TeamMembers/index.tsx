
import { useState } from "react";
import Link from "next/link";

import Image from "@/components/Image";
import Icon from "@/components/Icon";
import { useAuth } from "@/stores/auth";
import { usePermission } from "@/hooks/usePermission";
import { useMyMemberships } from "@/hooks/useQueries";
import { getFullImageUrl } from "@/lib/utils";

type TeamMembersProps = {
    visible?: boolean;
};

const TeamMembers = ({ visible }: TeamMembersProps) => {
    const { user } = useAuth();
    const canViewSubscriptions = usePermission('subscriptions:view');
    const { data: rawMemberships } = useMyMemberships(canViewSubscriptions);

    // Filter active and ensure page data exists
    const memberships = (rawMemberships || []).filter((m: any) =>
        m.status === 'active' && m.pageId
    );

    const [isExpanded, setIsExpanded] = useState(false);

    if (!canViewSubscriptions) return null;

    const displayedMemberships = isExpanded ? memberships : memberships.slice(0, 4);
    console.log("displayedMemberships: ", displayedMemberships);


    return (
        <>
            <div
                className={`mb-3 overflow-hidden whitespace-nowrap text-xs font-medium text-white/50 ${visible ? "w-full opacity-100" : "xl:w-0 xl:opacity-0"
                    }`}
            >
                My Memberships
            </div>
            <div className="-mx-4">
                {displayedMemberships.map((item: any) => {
                    const page = item.pageId;
                    return (
                        <Link
                            className={`flex items-center h-9.5 mb-1.5 px-4 text-sm text-white font-bold last:mb-0 transition-colors hover:bg-[#161616] ${visible ? "px-4 text-sm" : "xl:px-0 xl:text-0"
                                }`}
                            href={`/${page.pageSlug}`}
                            key={item._id}
                        >
                            <div
                                className={`relative shrink-0 w-5.5 h-5.5 mr-2.5 rounded-full overflow-hidden ${visible ? "mr-2.5 ml-0" : "xl:mx-auto"
                                    }`}
                            >
                                <Image
                                    className="object-cover scale-105"
                                    src={getFullImageUrl(page.avatarUrl) || "/images/avatars/avatar.jpg"}
                                    fill
                                    alt={page.displayName || "Page"}
                                    unoptimized
                                />
                            </div>
                            {page.displayName}
                        </Link>
                    );
                })}
            </div>
            {memberships.length > 4 && (
                <button
                    className={`group flex items-center w-full mt-4 pl-0.5 text-xs font-medium text-white transition-colors hover:text-purple-1 ${visible ? "text-xs" : "xl:text-0"
                        }`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <Icon
                        className={`mr-3 icon-18 fill-white transition-colors group-hover:fill-purple-1 ${visible ? "mr-3" : "xl:mr-0"
                            } ${isExpanded ? "rotate-180" : ""}`}
                        name="arrow-bottom"
                    />
                    {isExpanded ? "See Less" : "See More"}
                </button>
            )}
        </>
    );
};

export default TeamMembers;

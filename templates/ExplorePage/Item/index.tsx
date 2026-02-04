import Link from "next/link";
import Image from "@/components/Image";
import { getFullImageUrl } from "@/lib/utils";
import type { CreatorPage } from "@/types";

type ItemProps = {
    item: CreatorPage;
};

const Item = ({ item }: ItemProps) => {
    return (
        <Link
            className="flex flex-col w-[calc(25%-1.25rem)] mt-5 mx-2.5 card text-center lg:w-[calc(50%-1.25rem)] md:w-[calc(100%-1.25rem)] md:mt-3"
            href={`/${item.pageSlug}`}
        >
            <div className="relative grow pt-12 px-5 pb-7 md:pt-4 md:pb-4">
                <div className="relative w-[8.25rem] h-[8.25rem] mx-auto mb-3.5">
                    <Image
                        className="object-cover rounded-full"
                        src={getFullImageUrl(item.avatarUrl) || "/images/avatar-1.jpg"}
                        fill
                        alt={item.displayName}
                        unoptimized
                    />
                </div>
                <div className="text-sm font-bold truncate">{item.displayName}</div>
                <div className="mb-4 text-xs font-medium text-n-3 truncate">
                    {item.tagline}
                </div>
            </div>

            <div className="flex border-t border-n-1 dark:border-white/10">
                <div className="flex-1 p-3 border-r border-n-1 dark:border-white/10">
                    <div className="text-sm font-bold">{item.postCount}</div>
                    <div className="text-xs font-medium text-n-3 dark:text-white/75">
                        Posts
                    </div>
                </div>
                <div className="flex-1 p-3">
                    <div className="text-sm font-bold">{item.memberCount}</div>
                    <div className="text-xs font-medium text-n-3 dark:text-white/75">
                        Members
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default Item;

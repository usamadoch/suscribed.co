import { useState } from "react";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import Link from "next/link";

type RowProps = {
    item: any;
};

const Row = ({ item }: RowProps) => {
    const member = item.memberId || {};

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-1 text-white';
            case 'paused': return 'bg-yellow-1 text-white';
            case 'cancelled':
            default: return 'bg-pink-1 text-white';
        }
    };

    return (
        <tr className="">
            <td className="td-custom">
                {/* <Checkbox value={value} onChange={() => setValue(!value)} /> */}
            </td>
            <td className="td-custom">
                <div className="flex items-center">
                    <div className="relative w-10 h-10 mr-4">
                        <Image
                            className="object-cover rounded-full"
                            src={member.avatarUrl || "/images/avatars/avatar.jpg"}
                            fill
                            alt={member.displayName || "Member"}
                        />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-n-1 dark:text-white">
                            {member.displayName || "Unknown Member"}
                        </div>
                        <div className="text-xs text-n-3 dark:text-white/50">
                            @{member.username || "unknown"}
                        </div>
                    </div>
                </div>
            </td>
            <td className="td-custom font-medium">
                {item.tier || "-"}
            </td>
            <td className="td-custom text-n-3 dark:text-white/75">
                {new Date(item.joinedAt).toLocaleDateString()}
            </td>
            <td className="td-custom text-right">
                <div className={`inline-block px-3 py-1 rounded-sm text-xs font-bold ${getStatusColor(item.status)}`}>
                    {item.status}
                </div>
            </td>
            <td className="td-custom text-right">
                {/* <button className="btn-transparent-dark btn-small btn-square">
                    <Icon name="dots" />
                </button> */}

                <Link
                    href={`/messages?to=${member._id}`}
                    className="btn-purple btn-square btn-small cursor-pointer"
                    type="submit"
                >
                    <Icon name="send" />
                </Link>
            </td>
        </tr>
    );
};

export default Row;

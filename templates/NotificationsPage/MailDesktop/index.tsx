import { useState } from "react";
import Link from "next/link";
import Checkbox from "@/components/Checkbox";
import Icon from "@/components/Icon";
import Image from "@/components/Image";

type MailDesktopProps = {
    item: any;
};

const MailDesktop = ({ item }: MailDesktopProps) => {
    const [value, setValue] = useState<boolean>(item.isChecked);

    const getNotificationIcon = (type: any) => {
        switch (type) {
            case 'new_member':
                return '👤';
            case 'new_message':
                return '💬';
            case 'new_comment':
                return '💭';
            case 'new_like':
                return '❤️';
            case 'membership_expired':
                return '⏰';
            default:
                return '🔔';
        }
    };

    const getNotificationLink = (notification: any) => {
        switch (notification.type) {
            case 'new_member':
                return '/members';
            case 'new_message':
                return '/messages';
            case 'new_comment':
            case 'new_like':
                return notification.relatedId ? `/posts/${notification.relatedId}` : '#';
            default:
                return '#';
        }
    };

    const formatTime = (date: string) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diffMs = now.getTime() - notifDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return notifDate.toLocaleDateString();
    };

    return (
        <div className="flex items-start border-b border-n-1 text-sm last:border-none dark:border-white">
            <Link
                href={getNotificationLink(item)}
                className="flex items-start grow p-4 transition-colors hover:bg-n-3/5 dark:hover:bg-white/10"
            >
                <div className="flex items-center shrink-0 pr-4 font-bold w-[14.7rem]">
                    <div className="relative flex items-center justify-center shrink-0 w-8 h-8 mr-3 text-2xl">
                        {getNotificationIcon(item.type)}
                    </div>
                    {item.title || "Notification"}
                </div>
                <div className="grow pt-1.5 truncate" >
                    {item.content}{" "}
                    {/* <span className="text-n-3 dark:text-white/75">
                        {item.theme}
                    </span> */}
                </div>
                <div className="shrink-0 w-28 ml-4 pt-1.5 text-right font-medium">
                    {formatTime(item.createdAt)}
                </div>
            </Link>
            {/* <button className="btn-transparent-dark btn-small btn-square shrink-0 m-4 ml-0">
                <Icon name="dots" />
            </button> */}
        </div>
    );
};

export default MailDesktop;

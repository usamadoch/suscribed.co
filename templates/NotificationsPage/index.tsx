



"use client"
import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import Layout from "@/components/Layout";
import MailDesktop from "./MailDesktop";
import MailTablet from "./MailTablet";
import Empty from "@/components/Empty";
import Icon from "@/components/Icon";
import { useRouter } from "next/navigation";

import { useHydrated } from "@/hooks/useHydrated";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useNotifications, useMarkNotificationsAsRead } from "@/hooks/useQueries";
import { useSocket } from "@/stores/socket";

const NotificationsPage = () => {
    const router = useRouter();
    const { mounted } = useHydrated();
    const { data, isLoading, error } = useNotifications();
    const markAllReadMutation = useMarkNotificationsAsRead();
    const { markAllAsReadLocal } = useSocket();

    // Auto-mark as read on visit
    useEffect(() => {
        markAllReadMutation.mutate(undefined, {
            onSuccess: () => {
                markAllAsReadLocal();
            }
        });
    }, []);

    const notifications = data?.notifications || [];

    const isTablet = useMediaQuery({
        query: "(max-width: 1023px)",
    });

    return (
        <Layout title="Notifications" background={!isLoading && notifications.length === 0}>
            {isLoading ? (
                <LoadingSpinner />
            ) : error ? (
                <div className="flex items-center justify-center h-full">
                    Error: Failed to load notifications
                </div>
            ) : notifications.length === 0 ? (
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
            ) : (
                <>
                    <div className="card">
                        {notifications.map((notification: any) =>
                            mounted && isTablet ? (
                                <MailTablet item={notification} key={notification._id} />
                            ) : (
                                <MailDesktop item={notification} key={notification._id} />
                            )
                        )}
                    </div>
                    {/* <TablePagination /> */}
                </>
            )}
        </Layout>
    );
};

export default NotificationsPage;





import { Suspense } from "react";
import MessagesPage from "@/templates/Inbox/MessagesPage";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const Messages = () => {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <MessagesPage />
        </Suspense>
    );
};

export default Messages;
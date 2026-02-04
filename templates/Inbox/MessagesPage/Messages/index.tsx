import { useState } from "react";
import Icon from "@/components/Icon";
import Image from "next/image";
import { Conversation, User } from "@/types";

type MessagesProps = {
    setVisible: (visible: boolean) => void;
    conversations: Conversation[];
    activeId: string | null;
    setActiveId: (id: string | null) => void;
    user: User | null;
};

const Messages = ({ setVisible, conversations = [], activeId, setActiveId, user }: MessagesProps) => {

    const handleClick = (id: string) => {
        setActiveId(id);
        setVisible(true);
    };

    const getOtherParticipant = (conversation: Conversation): User | null => {
        // Try to get from creatorId/memberId first
        if (user?.role === 'creator' && conversation.memberId) {
            const member = conversation.memberId;
            if (member && typeof member === 'object') return member as User;
        }
        if (user?.role === 'member' && conversation.creatorId) {
            const creator = conversation.creatorId;
            if (creator && typeof creator === 'object') return creator as User;
        }

        // Fallback to participants
        const participants = conversation.participants;
        if (Array.isArray(participants)) {
            const other = participants.find((p) => {
                const pId = typeof p === 'string' ? p : p._id;
                return pId !== user?._id;
            });
            if (other && typeof other === 'object') return other as User;

            const first = participants[0];
            if (first && typeof first === 'object') return first as User;
        }
        return null;
    };

    const formatTime = (date: string) => {
        if (!date) return '';
        const now = new Date();
        const msgDate = new Date(date);
        const diffMs = now.getTime() - msgDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return msgDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex flex-col w-[28rem] border-r border-n-1 4xl:w-[23.125rem] lg:w-full lg:border-none dark:border-white">
            <div className="flex p-5 border-b border-n-1 dark:border-white">
                <button className="btn-purple btn-small mr-auto px-4">
                    <Icon name="edit" />
                    <span>Compose</span>
                </button>
                <button className="btn-stroke btn-square btn-small mr-1.5">
                    <Icon name="filters" />
                </button>
                <button className="btn-stroke btn-square btn-small">
                    <Icon name="search" />
                </button>
            </div>
            <div className="grow overflow-auto scroll-smooth">
                {conversations.map((conversation: Conversation) => {
                    const otherUser = getOtherParticipant(conversation);
                    const lastMessage = conversation.lastMessage;
                    if (!otherUser) return null;

                    return (
                        <button
                            className={`flex w-full px-5 py-3 border-b border-n-1 text-left last:border-none transition-colors hover:bg-n-3/5 dark:border-white dark:hover:bg-white/10 ${conversation._id === activeId
                                ? "!bg-n-3/20 dark:!bg-white/20"
                                : ""
                                }`}
                            key={conversation._id}
                            onClick={() => handleClick(conversation._id)}
                        >
                            <div className="relative w-8 h-8">
                                <Image
                                    className="object-cover rounded-full"
                                    src={otherUser.avatarUrl || "/images/avatars/avatar.jpg"}
                                    fill
                                    alt="Avatar"
                                />
                            </div>
                            <div className="w-[calc(100%-2rem)] pl-3">
                                <div className="flex justify-between mb-1 text-xs font-medium text-n-3 dark:text-white/75">
                                    <div className="line-clamp-1 mr-2">{otherUser.displayName || 'Unknown'}</div>
                                    <div className="shrink-0">{formatTime(lastMessage?.sentAt || conversation.createdAt)}</div>
                                </div>
                                <div className="truncate text-sm font-bold text-n-1 dark:text-white">
                                    {/* Using display name as title for now, or last message preview */}
                                    {lastMessage ? (
                                        <span className={lastMessage.senderId === user?._id ? "text-n-3 dark:text-white/75" : ""}>
                                            {lastMessage.senderId === user?._id && "You: "}
                                            {lastMessage.content}
                                        </span>
                                    ) : (
                                        <span className="italic text-n-3">No messages yet</span>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Messages;

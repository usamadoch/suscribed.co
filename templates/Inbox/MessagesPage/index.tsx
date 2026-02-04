




"use client"
import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import Messages from "./Messages";
import Chat from "./Chat";
import Empty from "@/components/Empty";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { conversationApi, userApi, ApiClientError } from '@/lib/api';
import { Conversation, Message, User } from "@/types";

import { useSearchParams } from "next/navigation";
import { useAuth } from "@/stores/auth";
import { useSocket } from "@/stores/socket";

const MessagesPage = () => {
    const searchParams = useSearchParams();
    const recipientId = searchParams.get("to");

    const { user } = useAuth();
    const { socket, isConnected } = useSocket();
    const [visible, setVisible] = useState<boolean>(false);
    // const [conversations, setConversations] = useState<Conversation[]>([]); // Removed: Managed by React Query
    // const [recipientUser, setRecipientUser] = useState<User | null>(null); // Removed: Managed by separate query/effect
    // const [isLoading, setIsLoading] = useState(true); // Removed: Managed by React Query
    const [error, setError] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Fetch conversations
    const {
        data: conversationsData,
        isLoading: isConversationsLoading,
        isError,
        error: queryError
    } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const { conversations } = await conversationApi.getAll();
            return conversations;
        }
    });

    const conversations = conversationsData || [];

    // Fetch recipient user if needed (when not in existing conversations)
    const {
        data: recipientUser,
        isLoading: isRecipientLoading
    } = useQuery({
        queryKey: ['user', recipientId],
        queryFn: async () => {
            if (!recipientId) return null;
            const { user } = await userApi.getById(recipientId);
            return user;
        },
        enabled: !!recipientId && !conversations.some(c =>
            c.participants.some((p: any) => (typeof p === 'string' ? p : p._id) === recipientId)
        )
    });

    // Handle Active ID and "New" Conversation Logic
    const finalConversations = useMemo(() => {
        if (!recipientId) return conversations;

        // Check if exists
        const exists = conversations.find(c =>
            c.participants.some((p: any) => (typeof p === 'string' ? p : p._id) === recipientId)
        );

        if (exists) {
            return conversations;
        }

        if (recipientUser && user) {
            const fakeConv: Conversation = {
                _id: 'new',
                participants: [user, recipientUser],
                creatorId: user._id,
                memberId: recipientUser._id,
                isActive: true,
                lastMessage: null,
                unreadCounts: {},
                createdAt: new Date().toISOString(),
            };
            return [fakeConv, ...conversations];
        }

        return conversations;
    }, [conversations, recipientId, recipientUser, user]);

    useEffect(() => {
        if (recipientId) {
            const exists = conversations.find(c =>
                c.participants.some((p: any) => (typeof p === 'string' ? p : p._id) === recipientId)
            );
            if (exists) {
                setActiveId(exists._id);
            } else if (recipientUser) {
                setActiveId('new');
            }
            if (window.innerWidth < 1024) setVisible(true);
        } else if (conversations.length > 0 && !activeId) {
            setActiveId(conversations[0]._id);
        }
    }, [recipientId, conversations, recipientUser, activeId]);


    // Loading State
    const isLoading = isConversationsLoading || (!!recipientId && isRecipientLoading);






    const queryClient = useQueryClient();

    // Listen for real-time updates to conversations
    useEffect(() => {
        if (!socket || !isConnected) return;

        // Listen for new message notifications
        const handleNewMessageNotification = ({ conversationId, message }: any) => {
            queryClient.setQueryData(['conversations'], (oldData: Conversation[] | undefined) => {
                if (!oldData) return oldData;

                const prev = [...oldData];
                const updated = prev.map(conv => {
                    if (conv._id === conversationId) {
                        return {
                            ...conv,
                            lastMessage: {
                                content: message.content,
                                senderId: message.senderId,
                                sentAt: message.createdAt,
                            },
                            unreadCounts: {
                                ...conv.unreadCounts,
                                [user?._id || '']: (conv.unreadCounts?.[user?._id || ''] || 0) + 1,
                            },
                        };
                    }
                    return conv;
                });

                // Move updated conversation to top
                const index = updated.findIndex(c => c._id === conversationId);
                // If conversation doesn't exist in list (new incoming), we might need to invalidate or fetch?
                // For now, if index > 0, move it. If not found, maybe invalidate.
                if (index > 0) {
                    const [conv] = updated.splice(index, 1);
                    updated.unshift(conv);
                } else if (index === -1) {
                    // New conversation started by someone else?
                    queryClient.invalidateQueries({ queryKey: ['conversations'] });
                }

                return updated;
            });
        };

        socket.on('new_message_notification', handleNewMessageNotification);

        return () => {
            socket.off('new_message_notification', handleNewMessageNotification);
        };
    }, [socket, isConnected, user?._id, queryClient]);


    const handleMessageSent = (message: Message) => {
        // Optimistically update or invalidate
        // Since we are the sender, we might want to update the conversations list "last message"
        // The Chat component calls this.
        queryClient.setQueryData(['conversations'], (oldData: Conversation[] | undefined) => {
            if (!oldData) return oldData;

            let updated = oldData.map(conv => {
                if (conv._id === message.conversationId) {
                    return {
                        ...conv,
                        lastMessage: {
                            content: message.content,
                            senderId: typeof message.senderId === 'string' ? message.senderId : message.senderId._id,
                            sentAt: message.createdAt,
                        },
                    };
                }
                return conv;
            });

            // Move to top
            const index = updated.findIndex(c => c._id === message.conversationId);
            if (index > 0) {
                const [conv] = updated.splice(index, 1);
                updated.unshift(conv);
            }
            return updated;
        });
    };

    const isInboxEmpty = !isLoading && finalConversations.length === 0 && !recipientId;

    if (isLoading) {
        return (
            <Layout title="Inbox">
                <LoadingSpinner />
            </Layout>
        );
    }

    return (
        <Layout title="Inbox" background={isInboxEmpty}>
            {isInboxEmpty ? (
                <Empty
                    title="No messages found?"
                    content="Try to add more contacts from your personal account or start new discussion"
                    imageSvg={
                        <svg
                            className="fill-n-1 dark:fill-white"
                            xmlns="http://www.w3.org/2000/svg"
                            width="92"
                            height="72"
                            viewBox="0 0 92 72"
                        >
                            <path d="M26.098 46.886L12.693 66.571h6.385L8.406 49.257l-1.524-2.473c-1.034-1.678-3.316-2.306-5.058-1.304-1.707.982-2.365 3.288-1.326 4.974l10.671 17.314 1.524 2.473c1.499 2.433 4.848 2.257 6.385 0l13.405-19.686c1.111-1.632.322-4.026-1.326-4.974-1.815-1.044-3.944-.332-5.058 1.304z" />
                            <path d="M88.303.444C73.536 2.086 59.861 10.841 52.769 24.064c-3.815 7.114-6.106 16.486-1.562 23.839 4.084 6.61 12.99 10.176 19.785 5.295 6.878-4.94 7.997-13.692 6.166-21.442-.937-3.967-2.444-7.844-3.958-11.622-1.37-3.418-2.863-6.836-4.959-9.879C63.867 3.906 57.237-.38 49.323.027c-7.988.41-15.194 4.683-20.209 10.8-5.88 7.171-9.492 16.067-12.352 24.812-3.141 9.601-4.999 19.586-5.753 29.656-.15 1.998 1.806 3.706 3.697 3.706 2.125 0 3.547-1.702 3.697-3.706 1.066-14.25 4.602-28.832 11.146-41.588 2.879-5.613 6.657-11.037 12.328-14.084 4.93-2.648 11.085-3.215 15.844.092 4.505 3.13 6.94 8.714 8.851 13.669 2.229 5.782 5.484 12.825 3.473 19.084-1.511 4.704-6.213 7.418-10.423 3.999-4.922-3.999-3.894-11.105-1.641-16.28C63.205 18.185 75.329 9.299 88.303 7.856 90.287 7.635 92 6.311 92 4.15 92 2.318 90.3.221 88.303.444h0z" />
                        </svg>
                    }
                    buttonText="Create a message"
                    onClick={() => console.log("Create a message")}
                />
            ) : (
                <div className="flex h-[calc(100vh-10.7rem)] card lg:block lg:h-auto">
                    <Messages
                        setVisible={setVisible}
                        conversations={finalConversations}
                        activeId={activeId}
                        setActiveId={setActiveId}
                        user={user}
                    />
                    <Chat
                        visible={visible}
                        onClose={() => setVisible(false)}
                        activeId={activeId}
                        recipientUser={recipientUser}
                        setActiveId={setActiveId}
                        onMessageSent={handleMessageSent}
                    />
                </div>
            )}
        </Layout>
    );
};

export default MessagesPage;

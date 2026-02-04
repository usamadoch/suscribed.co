import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Icon from "@/components/Icon";
import Image from "@/components/Image";
import Comment from "@/components/Comment";
import Answer from "./Answer";
import Question from "./Question";
import { conversationApi, ApiClientError } from '@/lib/api';

import type { Message, User } from '@/types';
import { useAuth } from "@/stores/auth";
import { useSocket } from "@/stores/socket";

type MessagesProps = {
    visible?: boolean;
    onClose?: () => void;
    activeId?: any;
    recipientUser?: User | null;
    setActiveId?: (id: string) => void;
    onMessageSent?: (message: Message) => void;
};

const Messages = ({ visible, onClose, activeId, recipientUser, setActiveId, onMessageSent }: MessagesProps) => {
    const { user } = useAuth();
    const { socket, isConnected } = useSocket();
    const [value, setValue] = useState<string>("");
    // const [messages, setMessages] = useState<Message[]>([]); // Removed
    // const [isLoading, setIsLoading] = useState(false); // Removed
    const [error, setError] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [otherUser, setOtherUser] = useState<{ displayName: string; avatarUrl?: string } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const conversationId = activeId;

    const {
        data: messagesData,
        isLoading: isMessagesLoading
    } = useQuery({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
            const { messages } = await conversationApi.getMessages(conversationId);
            return messages;
        },
        enabled: !!conversationId && conversationId !== 'new',
        staleTime: 0, // Always fetch fresh messages when switching?
    });

    const messages = useMemo(() => messagesData || [], [messagesData]);

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();

            // Extract other user logic logic moved here
            if (!recipientUser) {
                for (const msg of messages) {
                    const sender = msg.senderId as unknown as { _id: string; displayName: string; avatarUrl?: string };
                    // If sender is populated object and not me
                    if (sender && typeof sender === 'object' && sender._id !== user?._id) {
                        setOtherUser({ displayName: sender.displayName, avatarUrl: sender.avatarUrl });
                        break;
                    }
                }
            }
        }
    }, [messages, recipientUser, user?._id]);

    useEffect(() => {
        if (recipientUser) {
            setOtherUser({ displayName: recipientUser.displayName, avatarUrl: recipientUser.avatarUrl || undefined });
        }
    }, [recipientUser]);

    // Join conversation room for real-time messages
    useEffect(() => {
        if (!socket || !isConnected || !conversationId || conversationId === 'new') return;

        // Join the conversation room
        socket.emit('join_room', { conversationId });

        // Listen for new messages from OTHER users only
        const handleNewMessage = (message: Message) => {
            const senderId = typeof message.senderId === 'string'
                ? message.senderId
                : (message.senderId as any)._id;

            // Skip if this is our own message (we already added it via API response / optimistic)
            if (senderId === user?._id) return;

            queryClient.setQueryData(['messages', conversationId], (oldData: Message[] | undefined) => {
                if (!oldData) return [message];
                // Check for duplicates
                if (oldData.some(m => m._id === message._id)) return oldData;
                return [...oldData, message];
            });
            scrollToBottom();
        };

        socket.on('new_message', handleNewMessage);

        // Listen for typing indicator
        const handleTyping = ({ userId }: { userId: string; conversationId: string }) => {
            if (userId !== user?._id) {
                setIsTyping(true);
            }
        };

        const handleStopTyping = ({ userId }: { userId: string }) => {
            if (userId !== user?._id) {
                setIsTyping(false);
            }
        };

        socket.on('user_typing', handleTyping);
        socket.on('user_stopped_typing', handleStopTyping);

        // Listen for message read status
        const handleMessageRead = ({ messageId }: { messageId: string }) => {
            queryClient.setQueryData(['messages', conversationId], (oldData: Message[] | undefined) => {
                if (!oldData) return oldData;
                return oldData.map(m => (m._id === messageId ? { ...m, isRead: true } : m));
            });
        };

        socket.on('message_read', handleMessageRead);

        return () => {
            // Leave room and remove listeners on cleanup
            socket.emit('leave_room', { conversationId });
            socket.off('new_message', handleNewMessage);
            socket.off('user_typing', handleTyping);
            socket.off('user_stopped_typing', handleStopTyping);
            socket.off('message_read', handleMessageRead);
        };
    }, [socket, isConnected, conversationId, user?._id, queryClient]);


    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const { setActiveConversationId } = useSocket();

    useEffect(() => {
        if (conversationId && conversationId !== 'new') {
            setActiveConversationId(conversationId);
        }
        return () => setActiveConversationId(null);
    }, [conversationId, setActiveConversationId]);

    const handleSend = async () => {
        if (!value.trim() || !conversationId) return;

        try {
            let currentConversationId = conversationId;
            if (currentConversationId === 'new' && recipientUser) {
                // Create conversation first
                const { conversation } = await conversationApi.start({ recipientId: recipientUser._id });
                currentConversationId = conversation._id;
                if (setActiveId) setActiveId(currentConversationId); // Update parent
            }

            const tempId = `temp-${Date.now()}`;
            // Use Omit to avoid conflict with Message status type
            const tempMessage: Omit<Message, 'status'> & { status: 'sending' } = {
                _id: tempId,
                conversationId: currentConversationId,
                senderId: user?._id || '',
                content: value,
                contentType: 'text',
                attachments: [],
                status: 'sending', // Local status
                isRead: false,
                readAt: null,
                createdAt: new Date().toISOString(),
            };

            // Optimistically update
            queryClient.setQueryData(['messages', currentConversationId], (oldData: Message[] | undefined) => {
                const newData = oldData ? [...oldData, tempMessage] : [tempMessage];
                return newData;
            });

            setValue("");
            scrollToBottom();

            const { message } = await conversationApi.sendMessage(currentConversationId, { content: value });

            // Replace temporary message with real one
            queryClient.setQueryData(['messages', currentConversationId], (oldData: Message[] | undefined) => {
                if (!oldData) return [message];
                return oldData.map(m => m._id === tempId ? message : m);
            });

            if (onMessageSent) onMessageSent(message);
        } catch (e) {
            console.error(e);
            // Revert on error? Or show error state on message
        }
    };

    const formatTime = (date?: string) => {
        if (!date) return "";
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div
            className={`flex flex-col grow lg:fixed lg:inset-0 lg:z-100 lg:bg-white lg:transition-opacity dark:bg-n-1 ${visible
                ? "lg:visible lg:opacity-100"
                : "lg:invisible lg:opacity-0"
                }`}
        >
            <div className="flex mb-5 p-5 border-b border-n-1 dark:border-white">
                <button
                    className="btn-stroke btn-square btn-small hidden mr-2 lg:block"
                    onClick={onClose}
                >
                    <Icon name="close" />
                </button>
                {/* <button className="btn-stroke btn-square btn-small">
                    <Icon name="arrow-prev" />
                </button> */}
                <div className="flex items-center mx-auto pl-12 pr-2 text-sm font-bold lg:px-3">
                    {otherUser && (
                        <>
                            <div className="relative w-6 h-6 mr-2">
                                <Image
                                    className="object-cover rounded-full"
                                    src={otherUser.avatarUrl || "/images/avatars/avatar.jpg"}
                                    fill
                                    alt="Avatar"
                                />
                            </div>
                            {otherUser.displayName}
                        </>
                    )}
                </div>
                {/* <button className="btn-stroke btn-square btn-small mr-2">
                    <Icon name="forward" />
                </button> */}
                <button className="btn-stroke btn-square btn-small">
                    <Icon name="dots" />
                </button>
            </div>
            <div className="grow px-5 space-y-4 overflow-auto scroll-smooth">
                {messages.map((msg) => {
                    const isMe = (typeof msg.senderId === 'string' ? msg.senderId : msg.senderId._id) === user?._id;
                    const sender = typeof msg.senderId === 'object' ? msg.senderId : { displayName: 'User', avatarUrl: '' };

                    if (isMe) {
                        return (
                            <Answer
                                key={msg._id}
                                time={formatTime(msg.createdAt)}
                                content={msg.content}
                                author={{ name: "You", avatar: user?.avatarUrl || "/images/avatars/avatar.jpg" }}
                                status={(msg as any).status}
                            />
                        );
                    } else {
                        return (
                            <Question
                                key={msg._id}
                                time={formatTime(msg.createdAt)}
                                content={msg.content}
                                author={{ name: sender.displayName || otherUser?.displayName || "User", avatar: sender.avatarUrl || otherUser?.avatarUrl || "/images/avatars/avatar.jpg" }}
                            />
                        );
                    }
                })}
                {isTyping && <div className="text-xs text-n-3 ml-12">Typing...</div>}
                <div ref={messagesEndRef} />
            </div>
            <Comment
                className="m-5"
                avatar={user?.avatarUrl || "/images/avatars/avatar.jpg"}
                placeholder="Type to add something"
                value={value}
                setValue={(e: any) => setValue(e.target.value)}
                onSend={handleSend} // Assuming Comment supports onSend or we need to wrap it
            />
        </div>
    );
};

export default Messages;

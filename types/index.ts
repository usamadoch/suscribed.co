// ====================
// CORE TYPES - Aligned with Backend API Contracts
// ====================

// User Types
export type UserRole = 'member' | 'creator' | 'admin';

export type Permission =
    | 'post:create'
    | 'post:read'
    | 'post:update'
    | 'post:delete'
    | 'dashboard:view'
    | 'analytics:view'
    | 'members:view'
    | 'payouts:view'
    | 'page:manage'
    | 'explore:view'
    | 'subscriptions:view' // viewing own memberships
    | 'security:manage'
    | 'admin:access';

export interface NotificationPreferences {
    email: {
        newMembers: boolean;
        newComments: boolean;
        newMessages: boolean;
        weeklyDigest: boolean;
    };
    push: {
        newMembers: boolean;
        newPosts: boolean;
        newComments: boolean;
        newMessages: boolean;
        mentions: boolean;
    };
    inApp: {
        all: boolean;
    };
    quietHours: {
        enabled: boolean;
        startTime: string;
        endTime: string;
        timezone: string;
    };
}

export interface User {
    _id: string;
    email: string;
    role: UserRole;
    displayName: string;
    username: string;
    bio: string;
    avatarUrl: string | null;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    specifications?: string[];
    googleId?: string;
    notificationPreferences?: NotificationPreferences;
}

// Creator Page
export interface SocialLink {
    platform: 'twitter' | 'instagram' | 'youtube' | 'tiktok' | 'facebook' | 'linkedin' | 'pinterest' | 'website';
    url: string;
    label?: string;
}

export interface PageTheme {
    primaryColor: string;
    accentColor: string;
    layout: 'default' | 'minimal' | 'featured';
}

export interface CreatorPage {
    _id: string;
    userId: string | User;
    pageSlug: string;
    displayName: string;
    tagline: string;
    category?: string[];
    avatarUrl: string | null;
    bannerUrl: string | null;
    about: string;
    socialLinks: SocialLink[];
    theme: PageTheme;
    isPublic: boolean;
    status: 'draft' | 'published';
    memberCount: number;
    postCount: number;
    createdAt: string;
    updatedAt: string;
}

// Post Types
export type PostType = 'text' | 'image' | 'video' | 'audio' | 'poll' | 'link';
export type PostStatus = 'draft' | 'scheduled' | 'published';
export type PostVisibility = 'public' | 'members';

export interface EditorJSBlock {
    id?: string;
    type: string;
    data: Record<string, unknown>;
}

export interface EditorJSContent {
    time?: number;
    blocks: EditorJSBlock[];
    version?: string;
}

export interface MediaAttachment {
    type: 'image' | 'video';
    url: string;
    thumbnailUrl?: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    duration?: number;
    dimensions?: { width: number; height: number };
}

export interface Post {
    _id: string;
    creatorId: string | User;
    pageId: string;
    caption: string;
    // featuredImage removed
    mediaAttachments: MediaAttachment[];
    postType: PostType;
    tags: string[];
    visibility: PostVisibility;
    status: PostStatus;
    publishedAt: string | null;
    scheduledFor: string | null;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    allowComments: boolean;
    isPinned: boolean;
    createdAt: string;
    updatedAt: string;
}

// Membership
export type MembershipStatus = 'active' | 'paused' | 'cancelled';

export interface Membership {
    _id: string;
    memberId: string | User;
    creatorId: string | User;
    pageId: string | CreatorPage;
    status: MembershipStatus;
    tier?: string;
    joinedAt: string;
    cancelledAt: string | null;
    updatedAt?: string;
}

// Conversation & Message
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface MessageAttachment {
    type: 'image' | 'file';
    url: string;
    filename: string;
    fileSize: number;
    mimeType: string;
}

export interface Message {
    _id: string;
    conversationId: string;
    senderId: string | User;
    content: string;
    contentType: 'text' | 'image' | 'file';
    attachments: MessageAttachment[];
    status: MessageStatus;
    isRead?: boolean;
    readAt: string | null;
    createdAt: string;
}

export interface Conversation {
    _id: string;
    participants: (string | User)[];
    creatorId: string | User;
    memberId: string | User;
    isActive: boolean;
    lastMessage: {
        content: string;
        senderId: string;
        sentAt: string;
    } | null;
    unreadCounts: Record<string, number>;
    createdAt: string;
    updatedAt?: string;
}

// Notification
export type NotificationType =
    | 'new_member' | 'member_left' | 'new_post' | 'post_liked' | 'new_like'
    | 'new_comment' | 'comment_reply' | 'new_message' | 'mention'
    | 'creator_went_live' | 'membership_expired' | 'system';

export interface Notification {
    _id: string;
    recipientId: string;
    type: NotificationType;
    title: string;
    body: string;
    message?: string;
    imageUrl: string | null;
    actionUrl: string;
    actionLabel: string;
    relatedId?: string;
    metadata?: Record<string, any>; // Added for richer context
    isRead: boolean;
    readAt: string | null;
    createdAt: string;
}

// Comment
export interface Comment {
    _id: string;
    postId: string;
    authorId: string | User;
    content: string;
    parentId: string | null;
    depth: number;
    likeCount: number;
    replyCount: number;
    createdAt: string;
    updatedAt: string;
    replies?: Comment[];
}

// ====================
// API RESPONSE TYPES
// ====================

export interface Pagination {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]>;
}

export interface SuccessResponse<T> {
    success: true;
    data: T;
    meta?: {
        pagination?: Pagination;
        [key: string]: unknown;
    };
}

export interface ErrorResponse {
    success: false;
    error: ApiError;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// ====================
// AUTH TYPES
// ====================

export interface SignupPayload {
    email: string;
    password: string;
    displayName: string;
    username: string;
    role?: 'member' | 'creator';
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
}

// ====================
// API PAYLOAD TYPES
// ====================

export interface CreatePostPayload {
    caption: string;
    mediaAttachments?: MediaAttachment[];
    visibility?: PostVisibility;
    postType?: PostType;
    tags?: string[];
    allowComments?: boolean;
    status?: 'draft' | 'published';
    scheduledFor?: string;
}

export type UpdatePostPayload = Partial<CreatePostPayload>;

export interface UpdateUserPayload {
    displayName?: string;
    username?: string;
    bio?: string;
    avatarUrl?: string;
    specifications?: string[];
    notificationPreferences?: Partial<NotificationPreferences>;
}

export interface UpdatePagePayload {
    displayName?: string;
    tagline?: string;
    pageSlug?: string;
    specifications?: string[];
    category?: string[];
    about?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    socialLinks?: SocialLink[];
    theme?: PageTheme;
    isPublic?: boolean;
    status?: 'draft' | 'published';
}

export interface JoinMembershipPayload {
    creatorId: string;
    pageId: string;
}

export interface StartConversationPayload {
    recipientId: string;
}

export interface SendMessagePayload {
    content: string;
    contentType?: 'text' | 'image' | 'file';
}

export interface CreateCommentPayload {
    content: string;
    parentId?: string;
}

// ====================
// UPLOAD TYPES
// ====================

export interface UploadedFile {
    url: string;
    filename: string;
    fileSize: number;
    mimeType: string;
}

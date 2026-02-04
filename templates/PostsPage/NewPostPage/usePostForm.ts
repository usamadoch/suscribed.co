
import { useState, useRef, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { PostVisibility, MediaAttachment, Post } from "@/types";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getFullImageUrl } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type MediaFile = {
    id: string;
    url: string;
    type: "image" | "video";
    file?: File;
    isNew?: boolean;
};

export type UsePostFormProps = {
    initialData?: Post;
    isEditing?: boolean;
};

export const usePostForm = ({ initialData, isEditing = false }: UsePostFormProps = {}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const queryClient = useQueryClient();

    // State
    const [attachments, setAttachments] = useState<MediaFile[]>([]);
    const [caption, setCaption] = useState("");
    const [visibility, setVisibility] = useState<PostVisibility>("public");
    const [allowComments, setAllowComments] = useState(true);
    const [isDirty, setIsDirty] = useState(false);

    // Initialize state from initialData
    useEffect(() => {
        if (initialData) {
            setCaption(initialData.caption || "");
            setVisibility(initialData.visibility || "public");
            setAllowComments(initialData.allowComments ?? true);

            if (initialData.mediaAttachments?.length) {
                const formattedAttachments: MediaFile[] = initialData.mediaAttachments.map(m => ({
                    id: m.url, // Use URL as ID for existing files
                    url: getFullImageUrl(m.url) || "",
                    type: m.type,
                    isNew: false
                }));
                setAttachments(formattedAttachments);
            }
        }
    }, [initialData]);

    // Track dirty state
    useEffect(() => {
        if (!initialData) {
            if (caption || attachments.length > 0) setIsDirty(true);
            else setIsDirty(false);
            return;
        }

        const isCaptionChanged = caption !== (initialData.caption || "");
        const isVisibilityChanged = visibility !== (initialData.visibility || "public");
        const isCommentsChanged = allowComments !== (initialData.allowComments ?? true);

        const isAttachmentsChanged =
            attachments.length !== (initialData.mediaAttachments?.length || 0) ||
            attachments.some(a => a.isNew) ||
            !areAttachmentsEqual(attachments, initialData.mediaAttachments || []);

        setIsDirty(isCaptionChanged || isVisibilityChanged || isCommentsChanged || isAttachmentsChanged);

    }, [caption, visibility, allowComments, attachments, initialData]);

    const openFileSelector = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileSelection = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const newFiles = Array.from(e.target.files).map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file), // Preview URL
            type: file.type.startsWith("video/") ? "video" : "image",
            file,
            isNew: true
        })) as MediaFile[];

        setAttachments((prev) => [...prev, ...newFiles]);
        e.target.value = "";
    }, []);

    const removeAttachment = useCallback((id: string) => {
        setAttachments((prev) => prev.filter((f) => f.id !== id));
    }, []);

    const removeAllAttachments = useCallback(() => {
        setAttachments([]);
    }, []);

    const uploadMediaFiles = async (filesToUpload: MediaFile[]): Promise<MediaAttachment[]> => {
        const uploadPromises = filesToUpload.map(async (fileObj) => {
            if (!fileObj.isNew) {
                const original = initialData?.mediaAttachments?.find(m => getFullImageUrl(m.url) === fileObj.url || m.url === fileObj.url);
                if (original) return original;

                return {
                    type: fileObj.type,
                    url: fileObj.url,
                    filename: 'existing',
                    fileSize: 0,
                    mimeType: fileObj.type === 'image' ? 'image/jpeg' : 'video/mp4'
                } as MediaAttachment;
            }

            if (!fileObj.file) throw new Error("New file missing content");

            const uploadFn = fileObj.type === "video" ? api.upload.uploadVideo : api.upload.uploadImage;
            const uploaded = await uploadFn(fileObj.file);

            return {
                type: fileObj.type,
                url: uploaded.url,
                filename: uploaded.filename,
                fileSize: uploaded.fileSize,
                mimeType: uploaded.mimeType,
            };
        });

        return Promise.all(uploadPromises);
    };

    const mutation = useMutation({
        mutationFn: async () => {
            const finalAttachments = await uploadMediaFiles(attachments);

            const payload = {
                caption,
                mediaAttachments: finalAttachments,
                visibility,
                allowComments,
                postType: (finalAttachments.length > 0
                    ? (finalAttachments[0].type === 'video' ? 'video' : 'image')
                    : 'text') as import("@/types").PostType,
                status: 'published' as const,
            };

            if (isEditing && initialData) {
                return await api.post.update(initialData._id, payload);
            } else {
                return await api.post.create(payload);
            }
        },
        onSuccess: (data) => {
            const isUpdate = isEditing && initialData;

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['creator-posts'] });

            if (isUpdate) {
                // Invalidate specific post query to force refetch on detail page
                queryClient.invalidateQueries({ queryKey: ['post', initialData._id] });
                toast.success("Post updated successfully");
                // Navigate to post detail page
                router.push(`/posts/${initialData._id}`);
            } else {
                toast.success("Post created successfully");
                router.push('/posts');
                // Reset form only on create success (if we didn't redirect, but we do now)
                if (!isEditing) {
                    setCaption("");
                    setAttachments([]);
                }
            }
        },
        onError: (error) => {
            console.error("Failed to save post:", error);
            toast.error("Failed to save post");
        }
    });

    const handleSubmit = async () => {
        if (!caption.trim() && attachments.length === 0) {
            toast.error("Please add some content to your post");
            return;
        }
        mutation.mutate();
    };

    return {
        attachments,
        caption,
        setCaption,
        visibility,
        setVisibility,
        allowComments,
        setAllowComments,
        fileInputRef,
        openFileSelector,
        handleFileSelection,
        removeAttachment,
        removeAllAttachments,
        handleSubmit,
        isSubmitting: mutation.isPending,
        isDirty
    };
};

function areAttachmentsEqual(current: MediaFile[], original: MediaAttachment[]) {
    if (current.length !== original.length) return false;
    return current.every((c, i) => {
        if (c.isNew) return false;
        const originalUrl = getFullImageUrl(original[i].url);
        return c.url === originalUrl;
    });
}

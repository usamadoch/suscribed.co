


import { useState, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import { PostVisibility, MediaAttachment } from "@/types";

export type MediaFile = {
    id: string;
    url: string;
    type: "image" | "video";
    file: File;
};

export const useNewPost = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State with improved naming
    const [attachments, setAttachments] = useState<MediaFile[]>([]);
    const [caption, setCaption] = useState("");
    const [visibility, setVisibility] = useState<PostVisibility>("public");
    const [allowComments, setAllowComments] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        })) as MediaFile[];

        setAttachments((prev) => [...prev, ...newFiles]);

        // Reset input to allow selecting the same file again if needed
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
            const uploadFn = fileObj.type === "video"
                ? api.upload.uploadVideo
                : api.upload.uploadImage;

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

    const handleCreatePost = async () => {
        if (!caption.trim()) return;

        setIsSubmitting(true);
        try {
            const uploadedAttachments = await uploadMediaFiles(attachments);

            await api.post.create({
                caption,
                mediaAttachments: uploadedAttachments,
                visibility,
                allowComments,
                postType: attachments.length > 0
                    ? (attachments[0].type === 'video' ? 'video' : 'image')
                    : 'text',
            });

        } catch (error) {
            console.error("Failed to create post:", error);
            // Ideally add toast notification here
        } finally {
            setIsSubmitting(false);
        }
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
        handleCreatePost,
        isSubmitting,
    };
};

import { useState } from 'react';
import { pageApi, uploadApi } from '@/lib/api';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

export type ImageType = 'banner' | 'avatar';

interface UsePageImageUploadProps {
    onUploadSuccess?: (type: ImageType, url: string) => void;
}

export const usePageImageUpload = ({ onUploadSuccess }: UsePageImageUploadProps = {}) => {
    const [uploadingType, setUploadingType] = useState<ImageType | null>(null);
    const [optimisticBanner, setOptimisticBanner] = useState<string | null>(null);
    const [optimisticAvatar, setOptimisticAvatar] = useState<string | null>(null);

    const uploadImage = async (file: File, type: ImageType) => {
        if (file.size > MAX_FILE_SIZE) {
            alert("File is too large. Max 5MB.");
            return null;
        }

        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            alert("Invalid file type. Only JPG, PNG, and GIF are allowed.");
            return null;
        }

        setUploadingType(type);
        try {
            const uploadedFile = await uploadApi.uploadImage(file);
            if (uploadedFile?.url) {
                // Apply cache busting for immediate update
                const newUrl = `${uploadedFile.url}?t=${Date.now()}`;

                if (type === 'banner') setOptimisticBanner(newUrl);
                else setOptimisticAvatar(newUrl);

                // Update backend
                // Note: We use pageApi.updateMyPage here which assumes the context is "My Page"
                // For public page editing, this hook might need to be adapted or 'updateMyPage' needs to be swappable.
                // However, user specifically asked for this functionality 'in /[publicSlug]' which implies editing.
                // Assuming the user is the owner editing their page, updateMyPage is correct.
                const payload = type === 'banner'
                    ? { bannerUrl: uploadedFile.url }
                    : { avatarUrl: uploadedFile.url };

                await pageApi.updateMyPage(payload);

                if (onUploadSuccess) {
                    onUploadSuccess(type, uploadedFile.url);
                }

                return newUrl;
            }
        } catch (error) {
            console.error(`Failed to upload ${type}`, error);
            alert(`Failed to upload ${type}`);
        } finally {
            setUploadingType(null);
        }
        return null;
    };

    return {
        isUploading: !!uploadingType,
        uploadingType,
        optimisticBanner,
        optimisticAvatar,
        uploadImage
    };
};

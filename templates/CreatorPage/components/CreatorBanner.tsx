

"use client";

import React, { useCallback } from "react";
import Image from "@/components/Image";
import { usePageImageUpload } from "@/templates/SettingsPage/CreatorAccount/hooks/usePageImageUpload";
import PageImageUploader from "@/templates/SettingsPage/CreatorAccount/components/PageImageUploader";
import { getFullImageUrl } from "@/lib/utils";
import { CreatorPage } from "@/types";

type CreatorBannerProps = {
    page: CreatorPage;
    isOwner: boolean;
    onUpdate?: (type: 'banner', url: string) => void;
};

const CreatorBanner = ({ page, isOwner, onUpdate }: CreatorBannerProps) => {
    const handleSuccess = useCallback((type: 'banner' | 'avatar', url: string) => {
        if (type === 'banner' && onUpdate) {
            onUpdate('banner', url);
        }
    }, [onUpdate]);

    const {
        uploadImage,
        optimisticBanner,
        uploadingType
    } = usePageImageUpload({
        onUploadSuccess: handleSuccess
    });

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isOwner) return;
        const file = e.target.files?.[0];
        if (file) await uploadImage(file, 'banner');
    };

    return (
        <div className="relative  w-full h-80 md:h-52 bg-n-2">
            {isOwner ? (
                <PageImageUploader
                    containerClassName="w-full h-full"
                    imageSrc={optimisticBanner || page.bannerUrl}
                    fallbackSrc="/images/img-1.jpg"
                    alt="Banner"
                    onFileChange={handleBannerUpload}
                    isLoading={uploadingType === 'banner'}
                />
            ) : (
                <Image
                    className="object-cover"
                    src={getFullImageUrl(page.bannerUrl) || "/images/img-1.jpg"}
                    fill
                    alt="Banner"
                    priority
                    unoptimized
                />
            )}
        </div>
    );
};

export default CreatorBanner;

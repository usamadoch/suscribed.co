import { getFullImageUrl } from '@/lib/utils';
import React from 'react';

interface MediaBlockProps {
    url?: string;
    type?: 'image' | 'video';
    className?: string;
}

const MediaBlock = ({ url, type, className = '' }: MediaBlockProps) => {
    if (!url) return null;

    // constant height 512px as requested
    // full width

    // Simple extension check if type not strictly provided
    const isVideo = type === 'video' || (!type && !!url.match(/\.(mp4|webm|ogg|mov)$/i));

    return (
        <div className={`w-full h-[512px] bg-gray-100 dark:bg-neutral-800 relative overflow-hidden ${className}`}>
            {isVideo ? (
                <video
                    src={getFullImageUrl(url)}
                    className="w-full h-full object-contain"
                    controls
                    playsInline
                />
            ) : (
                <img
                    src={getFullImageUrl(url)}
                    alt="Post media"
                    className="w-full h-full object-contain"
                />
            )}
        </div>
    );
};

export default MediaBlock;

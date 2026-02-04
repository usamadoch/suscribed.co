import { useRef } from "react";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import Loader from "@/components/Loader";
import { getFullImageUrl } from "@/lib/utils";

interface PageImageUploaderProps {
    imageSrc: string | null | undefined;
    fallbackSrc: string;
    alt: string;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    containerClassName?: string;
    imageClassName?: string;
    children?: React.ReactNode;
    iconClassName?: string;
    uploadIconWrapperClassName?: string;
    isLoading?: boolean;
}

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

export const PageImageUploader = ({
    imageSrc,
    fallbackSrc,
    alt,
    onFileChange,
    containerClassName = "",
    imageClassName = "object-cover",
    children,
    uploadIconWrapperClassName,
    iconClassName = "w-5 h-5 fill-n-1",
    isLoading = false
}: PageImageUploaderProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        if (!isLoading) {
            inputRef.current?.click();
        }
    };

    return (
        <div className={`relative group cursor-pointer ${containerClassName}`} onClick={handleClick}>
            <Image
                className={imageClassName}
                src={getFullImageUrl(imageSrc) || fallbackSrc}
                fill
                alt={alt}
                unoptimized
            />

            {/* Hover/Loading Overlay */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity border-2 border-transparent 
                ${isLoading ? 'opacity-100 bg-black/50' : 'opacity-0 group-hover:opacity-100 hover:bg-n-3/5 dark:hover:bg-white/10 dark:border-white'} 
                ${imageClassName.includes("rounded-full") ? "rounded-full" : ""}`}>

                {isLoading ? (
                    <Loader className="w-6 h-6 text-white" />
                ) : (
                    <div className={`flex items-center justify-center ${uploadIconWrapperClassName || "w-10 h-10"} rounded-full bg-white text-n-1`}>
                        <Icon name="upload" className={iconClassName} />
                    </div>
                )}
            </div>

            {/* Hidden Input */}
            <input
                type="file"
                className="hidden"
                ref={inputRef}
                onChange={onFileChange}
                accept={ALLOWED_FILE_TYPES.join(', ')}
                disabled={isLoading}
            />
            {children}
        </div>
    );
};

export default PageImageUploader;

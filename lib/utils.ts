import { SocialLink } from "@/types";

export const getPlatformFromUrl = (url: string): SocialLink['platform'] => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return 'twitter';
    if (lowerUrl.includes('instagram.com')) return 'instagram';
    if (lowerUrl.includes('facebook.com')) return 'facebook';
    if (lowerUrl.includes('youtube.com')) return 'youtube';
    if (lowerUrl.includes('linkedin.com')) return 'linkedin';
    if (lowerUrl.includes('pinterest.com')) return 'pinterest';
    if (lowerUrl.includes('tiktok.com')) return 'tiktok';
    return 'website';
};

export const getFullImageUrl = (url: string | null | undefined): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }
    // Remove leading slash if present in url to avoid double slash
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    const cleanBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

    return `${cleanBaseUrl}/${cleanUrl}`;
};


export const generateUsername = (name: string, email: string) => {
    let base = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (base.length < 3) {
        base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    if (base.length < 3) base = "user" + base;
    return base + Math.floor(Math.random() * 1000);
};


export const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
};

export const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
};

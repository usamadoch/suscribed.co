"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MenuButton, Menu as MenuDropdown, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { toast } from "react-hot-toast";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import { usePageImageUpload } from "@/templates/SettingsPage/CreatorAccount/hooks/usePageImageUpload";
import PageImageUploader from "@/templates/SettingsPage/CreatorAccount/components/PageImageUploader";
import { getFullImageUrl, truncateText } from "@/lib/utils";
import { useAuth } from "@/stores/auth";
import { useJoinPage } from "@/hooks/useQueries";
import { CreatorPage } from "@/types";
import Loader from "@/components/Loader";
import LoginModal from "@/components/LoginModal";
import Modal from "@/components/Modal";

type CreatorProfileHeaderProps = {
    page: CreatorPage;
    isOwner: boolean;
    isMember: boolean;
    onUpdate?: (type: 'avatar', url: string) => void;
    onJoinSuccess?: () => void;
};

const CreatorProfileHeader = ({ page, isOwner, isMember, onUpdate, onJoinSuccess }: CreatorProfileHeaderProps) => {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { mutate: joinPage, isPending: isJoining } = useJoinPage();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [visible, setVisible] = useState(false);

    const handleSuccess = useCallback((type: 'banner' | 'avatar', url: string) => {
        if (type === 'avatar' && onUpdate) {
            onUpdate('avatar', url);
        }
    }, [onUpdate]);

    const {
        uploadImage,
        optimisticAvatar,
        uploadingType
    } = usePageImageUpload({
        onUploadSuccess: handleSuccess
    });

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isOwner) return;
        const file = e.target.files?.[0];
        if (file) await uploadImage(file, 'avatar');
    };

    const handleJoin = async () => {
        if (!isAuthenticated) return setIsLoginModalOpen(true);
        if (!page) return;

        const creatorId = typeof page.userId === 'object' ? page.userId._id : page.userId;
        joinPage({ creatorId, pageId: page._id }, {
            onSuccess: () => {
                if (onJoinSuccess) onJoinSuccess();
            }
        });
    };




    return (
        <div className="relative z-1 flex items-end h-full pb-10 px-16 2xl:px-8 lg:px-6 md:px-5 md:pb-8">
            <div className="flex items-start justify-between w-full pt-4">
                <div className="flex items-start">
                    {/* Avatar Section */}
                    <div className="relative shrink-0 w-27.5 h-27.5 mb-3 rounded-full shadow-primary-4 bg-n-1">
                        {isOwner ? (
                            <PageImageUploader
                                containerClassName="w-full h-full rounded-full"
                                imageClassName="object-cover rounded-full"
                                imageSrc={optimisticAvatar || page.avatarUrl}
                                fallbackSrc="/images/avatar-2.jpg"
                                alt="Avatar"
                                onFileChange={handleAvatarUpload}
                                uploadIconWrapperClassName="w-8 h-8"
                                iconClassName="w-4 h-4 fill-n-1"
                                isLoading={uploadingType === 'avatar'}
                            />
                        ) : (
                            <div className="relative w-full h-full rounded-full overflow-hidden">
                                <Image
                                    className="object-cover"
                                    src={getFullImageUrl(page.avatarUrl) || "/images/avatar-2.jpg"}
                                    fill
                                    alt="Avatar"
                                    unoptimized
                                />
                            </div>
                        )}
                    </div>

                    <div className="text-n-1 dark:text-white pl-4">
                        <div className="mb-2 text-h4 md:text-h3">{page.displayName}</div>
                        <div className="flex items-center text-sm font-medium text-n-3">
                            <span className="mr-6 md:mr-4">{page.memberCount || 0} Members</span>
                            <span>{page.postCount || 0} Posts</span>
                        </div>
                        <div className="max-w-[50%] mt-4 text-sm">
                            {(
                                () => {
                                    const description = page.tagline || page.about || "No description available.";
                                    const shouldTruncate = description.length > 120;
                                    const displayText = !isExpanded && shouldTruncate
                                        ? truncateText(description, 120)
                                        : description;

                                    return (
                                        <>
                                            {displayText}
                                            {shouldTruncate && (
                                                <button
                                                    onClick={() => setIsExpanded(!isExpanded)}
                                                    className="inline-block ml-1 font-bold text-n-1 dark:text-white hover:text-purple-1 cursor-pointer"
                                                >
                                                    {isExpanded ? "See less" : "See more"}
                                                </button>
                                            )}
                                        </>
                                    );
                                }
                            )()}
                        </div>
                    </div>
                </div>

                <div className="flex items-center shrink-0">
                    {page.socialLinks && page.socialLinks.length > 0 && (
                        <div className="flex items-center mr-8 space-x-5 md:mr-4 md:space-x-3">
                            {page.socialLinks.map((link, index) => {
                                const getSocialIcon = (platform: string) => {
                                    switch (platform.toLowerCase()) {
                                        case 'facebook': return '/socialSVGs/facebook.svg';
                                        case 'instagram': return '/socialSVGs/instagram.svg';
                                        case 'linkedin': return '/socialSVGs/linkedin.svg';
                                        case 'pinterest': return '/socialSVGs/pinterest.svg';
                                        case 'tiktok': return '/socialSVGs/tiktok.svg';
                                        case 'twitter':
                                        case 'x': return '/socialSVGs/x.svg';
                                        case 'youtube': return '/socialSVGs/youtube.svg';
                                        default: return null;
                                    }
                                };

                                const iconPath = getSocialIcon(link.platform);

                                return (
                                    <Link
                                        key={index}
                                        href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                                        className="group relative"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {iconPath ? (
                                            <div className="relative w-6 h-6 transition-transform group-hover:scale-110">
                                                <Image
                                                    src={iconPath}
                                                    fill
                                                    alt={link.platform}
                                                    className="object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <Icon
                                                className="w-5 h-5 fill-n-4 transition-colors group-hover:fill-purple-1 dark:fill-n-3"
                                                name={link.platform === 'website' ? 'link' : link.platform}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {!isOwner && (
                        <div className="flex shrink-0 w-[20rem] 4xl:w-59">
                            {isMember ? (
                                <button
                                    className="btn-purple btn-medium grow opacity-75 "
                                    disabled
                                >
                                    <Icon name="check" />
                                    <span>Member</span>
                                </button>
                            ) : (
                                <button
                                    className={`btn-purple btn-medium grow ${isJoining ? "opacity-75 cursor-not-allowed" : ""}`}
                                    onClick={handleJoin}
                                    disabled={isJoining}
                                >
                                    {isJoining ? <Loader /> : <span>Become a Member</span>}
                                </button>
                            )}

                            <MenuDropdown className="relative ml-1.5 shrink-0" as="div">
                                <MenuButton className="btn-purple btn-medium btn-square">
                                    <Icon name="dots" />
                                </MenuButton>
                                <Transition
                                    enter="transition duration-100 ease-out"
                                    enterFrom="transform scale-95 opacity-0"
                                    enterTo="transform scale-100 opacity-100"
                                    leave="transition duration-75 ease-out"
                                    leaveFrom="transform scale-100 opacity-100"
                                    leaveTo="transform scale-95 opacity-0"
                                >
                                    <MenuItems className="absolute right-0 top-full mt-2 w-[14.69rem] py-2 border border-n-1 rounded-sm bg-white shadow-primary-4 dark:bg-n-1 dark:border-white z-10">
                                        <MenuItem
                                            className="flex items-center cursor-pointer w-full h-10 mb-1.5 px-6.5 text-sm font-bold text-n-1 transition-colors hover:bg-n-3/10 dark:text-white dark:hover:bg-white/20"
                                            as="button"
                                            onClick={() => setVisible(true)}
                                        >
                                            <Icon
                                                className="-mt-0.25 mr-3 fill-n-1 dark:fill-white"
                                                name="share"
                                            />
                                            Share
                                        </MenuItem>
                                    </MenuItems>
                                </Transition>
                            </MenuDropdown>
                        </div>
                    )}

                    {isOwner && (
                        <Link href="/settings" className="btn-purple btn-medium ">
                            <Icon name="setup" />
                            <span className="">Edit Profile</span>
                        </Link>
                    )}
                </div>
            </div>
            <LoginModal visible={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />



            <Modal
                classWrap="relative border-b-none"
                classButtonClose="z-2 fill-white"
                visible={visible}
                onClose={() => setVisible(false)}
            >
                <div className="relative z-1 card-title text-white">
                    Share this
                </div>
                <div className=" px-5 pb-7 md:pt-8">
                    <div className="mb-6 text-center">
                        <div className="relative w-full mt-5 aspect-[3/1] overflow-hidden bg-n-2 dark:bg-n-7">
                            <Image
                                className="object-cover"
                                src={getFullImageUrl(page.bannerUrl) || "/images/bg-1.jpg"}
                                fill
                                alt="Banner"
                                unoptimized
                            />
                        </div>

                        <div className="relative z-1 -mt-10 w-20 h-20 mx-auto mb-3 border-4 border-white rounded-full dark:border-n-1 bg-n-1">
                            <Image
                                className="object-cover rounded-full"
                                src={getFullImageUrl(page.avatarUrl) || "/images/avatars/avatar.jpg"}
                                fill
                                alt="Creator Avatar"
                                unoptimized
                            />
                        </div>
                        {/* <div className="mb-1 text-h4">Rustem Tolstobrov</div>
                        <div className="text-sm font-medium text-n-3 dark:text-white/50">
                            Account ending in 3456
                        </div> */}
                    </div>


                    <button
                        className="flex items-center w-full h-10 mb-1.5 px-6.5 text-sm font-bold last:mb-0 transition-colors hover:bg-n-3/10 dark:hover:bg-white/20"
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success("Link copied to clipboard");
                            // setVisible(false);
                        }}
                    >
                        <Icon
                            className="-mt-0.25 mr-3 fill-n-1 dark:fill-white"
                            name="link"
                        />
                        Copy link
                    </button>


                </div>
            </Modal>
        </div>
    );
};

export default CreatorProfileHeader;

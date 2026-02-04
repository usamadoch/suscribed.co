import { useState, useRef } from "react";
import { useForm } from "react-hook-form";

import Image from "@/components/Image";
import Icon from "@/components/Icon";
import { useAuth } from "@/stores/auth";
import Field from "@/components/Field";
import { api } from "@/lib/api";

type AccountFormValues = {
    displayName: string;
    username: string;
    bio: string;
};

const MemberAccount = () => {
    const { user, refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // For local preview of avatar if user changes it
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<AccountFormValues>({
        defaultValues: {
            displayName: user?.displayName || "",
            username: user?.username || "",
            bio: user?.bio || "",
        },
    });

    const bio = watch("bio");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Create a preview URL
            const objectUrl = URL.createObjectURL(file);
            setPreviewAvatar(objectUrl);
            setSelectedFile(file);
        }
    };

    const onSubmit = async (data: AccountFormValues) => {
        setIsLoading(true);
        setMessage(null);

        try {
            let avatarUrl = user?.avatarUrl || undefined;

            // 1. Upload avatar if selected
            if (selectedFile) {
                const uploaded = await api.upload.uploadImage(selectedFile);
                avatarUrl = uploaded.url;
            }

            // 2. Update User Profile
            await api.user.updateMe({
                displayName: data.displayName,
                username: data.username,
                bio: data.bio,
                avatarUrl,
            });

            // 3. Refresh local user state
            await refreshUser();

            setMessage({ type: 'success', text: 'Profile updated successfully' });
            setSelectedFile(null); // Reset file selection
        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-title">Profile Settings</div>
            <div className="">
                <div className="p-5">
                    {message && (
                        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}
                    <div className="flex items-center w-[calc(50%-1.5rem)] -mt-2 mx-3 md:w-full md:mb-6 md:mt-0 md:mx-0 md:last:mb-0">
                        <div className="mt-8 relative shrink-0 w-[6.875rem] h-[6.875rem] mr-3 cursor-pointer shadow-primary-4 rounded-full group" onClick={handleAvatarClick}>
                            <Image
                                className="object-cover rounded-full"
                                src={(previewAvatar || user?.avatarUrl || "/images/avatars/avatar-1.jpg") as string}
                                fill
                                alt="Avatar"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 rounded-full border-2 border-transparent hover:bg-n-3/5 dark:hover:bg-white/10 dark:border-white">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-n-1">
                                    <Icon name="upload" className="w-4 h-4 fill-n-1" />
                                </div>
                            </div>
                        </div>
                        <div className="grow">
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg, image/gif"
                            />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
                        <div className="flex flex-wrap -mt-4 -mx-2.5">
                            <Field
                                className="w-[calc(50%-1.25rem)] mx-2.5 mt-4"
                                label="Display Name"
                                placeholder="Enter display name"
                                error={errors.displayName}
                                {...register("displayName", { required: "Display name is required" })}
                            />
                            <Field
                                className="w-[calc(50%-1.25rem)] mx-2.5 mt-4"
                                label="Username"
                                placeholder="Enter username"
                                error={errors.username}
                                {...register("username", { required: "Username is required" })}
                            />
                            <Field
                                className="w-[calc(100%-1.25rem)] mt-4 mx-2.5"
                                label={`Bio (${bio?.length || 0}/500)`}
                                placeholder="Enter bio"
                                textarea
                                maxLength={500}
                                {...register("bio", { maxLength: 500 })}
                            />
                        </div>

                        <div className="flex justify-between mt-16 md:block md:mt-8">
                            <button
                                type="submit"
                                className="btn-purple min-w-[11.7rem] md:w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? "Updating..." : "Update Settings"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MemberAccount;

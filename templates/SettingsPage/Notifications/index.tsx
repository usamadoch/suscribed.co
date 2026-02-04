import { useState, useEffect } from "react";
import Switch from "@/components/Switch";
import { useAuth } from "@/stores/auth";
import { api } from "@/lib/api";
import { NotificationPreferences } from "@/types";
import { hasPermission } from "@/constants/permissions";

type NotificationSetting = {
    id: keyof NotificationPreferences['email'] | keyof NotificationPreferences['push'];
    label: string;
    description: string;
    type: 'email' | 'push';
};

type NotificationCategory = {
    title: string;
    description: string;
    items: NotificationSetting[];
};

const Notifications = () => {
    const { user, refreshUser } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Initialize state from user preferences or defaults
    const [prefs, setPrefs] = useState<NotificationPreferences>(() => {
        return user?.notificationPreferences || {
            email: {
                newMembers: true,
                newComments: true,
                newMessages: true,
                weeklyDigest: true
            },
            push: {
                newMembers: true,
                newPosts: true,
                newComments: true,
                newMessages: true,
                mentions: true
            },
            inApp: { all: true },
            quietHours: { enabled: false, startTime: '22:00', endTime: '08:00', timezone: 'UTC' }
        };
    });

    // Update state when user loads
    useEffect(() => {
        if (user?.notificationPreferences) {
            setPrefs(user.notificationPreferences);
        }
    }, [user?.notificationPreferences]);


    const isCreator = hasPermission(user?.role, 'page:manage');

    const emailSettings: NotificationCategory = {
        title: 'Email Notifications',
        description: 'Receive emails for important updates',
        items: [
            ...(isCreator ? [
                { id: 'newMembers', label: 'New Members', description: 'When someone joins your page', type: 'email' } as NotificationSetting,
            ] : []),
            { id: 'newComments', label: 'Comments', description: 'When someone comments on your posts', type: 'email' },
            { id: 'newMessages', label: 'Direct Messages', description: 'When you receive a new message', type: 'email' },
            { id: 'weeklyDigest', label: 'Weekly Digest', description: 'Summary of your weekly activity', type: 'email' },
        ]
    };

    const pushSettings: NotificationCategory = {
        title: 'Push Notifications',
        description: 'Real-time notifications on your device',
        items: [
            ...(isCreator ? [
                { id: 'newMembers', label: 'New Members', description: 'When someone joins your page', type: 'push' } as NotificationSetting,
            ] : []),
            ...(!isCreator ? [
                { id: 'newPosts', label: 'New Posts', description: 'When creators you follow post', type: 'push' } as NotificationSetting,
            ] : []),
            { id: 'newComments', label: 'Comments', description: 'When someone comments on your posts', type: 'push' },
            { id: 'newMessages', label: 'Direct Messages', description: 'When you receive a new message', type: 'push' },
            { id: 'mentions', label: 'Mentions', description: 'When someone mentions you', type: 'push' },
        ]
    };

    const categories = [emailSettings, pushSettings];

    const handleToggle = (type: 'email' | 'push', key: string) => {
        setPrefs(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [key]: !prev[type][key as keyof typeof prev[typeof type]]
            }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSuccessMessage(null);

        try {
            await api.user.updateMe({
                notificationPreferences: prefs
            });
            await refreshUser();
            setSuccessMessage('Notification preferences saved');

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            console.error("Failed to save preferences", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="card">
            <div className="card-title">Notifications</div>
            <div className="p-5">
                {categories.map((category, index) => (
                    <div key={index} className="mb-8 last:mb-0">
                        <div className="mb-6">
                            <div className="text-h6">{category.title}</div>
                            <div className="text-sm text-n-3 dark:text-white/50">{category.description}</div>
                        </div>
                        <div>
                            {category.items.map((setting) => (
                                <div
                                    className="flex items-center justify-between mb-4 pb-4 border-b border-n-1 dark:border-white last:mb-0 last:pb-0 last:border-0"
                                    key={`${setting.type}-${setting.id}`}
                                >
                                    <div className="mr-8">
                                        <div className="text-sm font-bold mb-1">
                                            {setting.label}
                                        </div>
                                        <div className="text-xs text-n-3 dark:text-white/75">
                                            {setting.description}
                                        </div>
                                    </div>
                                    <div className="flex gap-4 shrink-0">
                                        <Switch
                                            value={(prefs[setting.type] as any)[setting.id]}
                                            setValue={() => handleToggle(setting.type, setting.id as string)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="flex justify-between mt-16 md:block md:mt-8 items-center">
                    {successMessage && (
                        <div className="text-sm text-green-500 font-bold mr-4">
                            {successMessage}
                        </div>
                    )}
                    <button
                        className="btn-purple min-w-[11.7rem] md:w-full ml-auto"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Update Settings"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Notifications;

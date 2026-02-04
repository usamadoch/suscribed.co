import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/stores/auth";
import { authApi } from "@/lib/api";
import Field from "@/components/Field";
import Loader from "@/components/Loader";

type SecurityProps = {};

const Security = ({ }: SecurityProps) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // If registered via Google, don't show password settings
    const isGoogleUser = !!user?.googleId;

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const newPassword = watch("newPassword");

    const onSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await authApi.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            alert("Password updated successfully");
            reset();
        } catch (error: any) {
            console.error("Failed to update password", error);
            alert(error.message || "Failed to update password");
        } finally {
            setIsLoading(false);
        }
    };

    if (isGoogleUser) {
        return (
            <div className="card">
                <div className="card-title">Security Settings</div>
                <div className="p-5 text-n-3 dark:text-white/75">
                    Your account is managed via Google Login. You don't need to set a password.
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-title">Security Settings</div>
            <div className="p-5">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-wrap -mt-4 -mx-2.5">
                        <Field
                            className="w-[calc(100%-1.25rem)] mt-4 mx-2.5"
                            label="Current Password"
                            type="password"
                            placeholder="Enter current password"
                            error={errors.currentPassword}
                            {...register("currentPassword", { required: "Current password is required" })}
                        />
                        <Field
                            className="w-[calc(50%-1.25rem)] mt-4 mx-2.5 md:w-[calc(100%-1.25rem)]"
                            label="New Password"
                            type="password"
                            placeholder="Enter new password"
                            error={errors.newPassword}
                            {...register("newPassword", {
                                required: "New password is required",
                                minLength: {
                                    value: 8,
                                    message: "Password must be at least 8 characters"
                                }
                            })}
                        />
                        <Field
                            className="w-[calc(50%-1.25rem)] mt-4 mx-2.5 md:w-[calc(100%-1.25rem)]"
                            label="Confirm New Password"
                            type="password"
                            placeholder="Confirm new password"
                            error={errors.confirmPassword}
                            {...register("confirmPassword", {
                                required: "Please confirm your new password",
                                validate: (value) =>
                                    value === newPassword || "The passwords do not match",
                            })}
                        />
                    </div>

                    <div className="flex justify-between mt-16 md:block md:mt-8">
                        <button
                            type="submit"
                            className="btn-purple min-w-[11.7rem] md:w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader /> : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Security;

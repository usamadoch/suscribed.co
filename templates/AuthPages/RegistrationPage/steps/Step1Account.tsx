



import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import Field from "@/components/Field";
import Icon from "@/components/Icon";
import { useGoogleLogin, CodeResponse } from "@react-oauth/google";

import StepActions from "./StepActions";
import { useAuth, useAuthStore } from "@/stores/auth";
import { authApi } from "@/lib/api";
import { SignUpFormValues } from "../../../../lib/validation";
import { generateUsername } from "@/lib/utils";
import Loader from "@/components/Loader";

type Step1Props = {
    onNext: () => void;
};

const Step1Account = ({ onNext }: Step1Props) => {
    const { register, trigger, getValues, setError, setValue, formState: { errors } } = useFormContext<SignUpFormValues>();
    const { signup } = useAuth();
    const router = useRouter(); // Initialize router here
    const [isLoading, setIsLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleLogin = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: async (codeResponse: CodeResponse) => {
            setGoogleLoading(true);
            try {
                // Request creator role specifically
                const { user, isNewUser } = await authApi.googleLogin(codeResponse.code, 'creator');

                // Manually update store state
                useAuthStore.setState({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });

                if (!isNewUser) {
                    // If existing user, go straight to dashboard
                    router.push('/dashboard');
                    return;
                }

                // Pre-fill form data with Google info if available
                setValue('email', user.email);
                setValue('displayName', user.displayName);

                // Go to next step (Creator Details)
                onNext();
            } catch (error) {
                setGoogleLoading(false);
                console.error("Google login failed", error);
                setError("email", { message: "Google login failed" });
            }
        },
        onError: () => {
            setGoogleLoading(false);
            setError("email", { message: "Google login failed" });
        }
    });

    const handleNext = async () => {
        setIsLoading(true);
        const valid = await trigger(["email", "displayName", "password"]);

        if (valid) {
            const { email, password, displayName } = getValues();
            const username = generateUsername(displayName, email);

            try {
                await signup({
                    email,
                    password,
                    displayName,
                    username,
                    role: 'creator'
                }, { redirect: false });
                onNext();
            } catch (error: any) {
                console.error("Signup failed", error);
                setError("email", {
                    type: "manual",
                    message: error.message || "Failed to create account"
                });
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="mb-5 text-h3">Create your account</div>
            <button
                className="btn-stroke w-full h-14 mb-6"
                type="button"
                onClick={() => handleGoogleLogin()}
            >
                {googleLoading ? (
                    <Loader className="w-6 h-6 text-n-1 dark:text-white" />
                ) : (
                    <>
                        <Icon name="google" />
                        <span>Log in with Google</span>
                    </>
                )}
            </button>

            <div className="flex justify-center items-center pb-6">
                <span className="w-full max-w-[8.25rem] h-0.25 bg-n-1 dark:bg-white"></span>
                <span className="mx-4 text-sm font-medium">or</span>
                <span className="w-full max-w-[8.25rem] h-0.25 bg-n-1 dark:bg-white"></span>
            </div>

            <Field
                className="mb-4"
                label="Full Name"
                placeholder="Full Name"
                type="text"
                icon="profile"
                error={errors.displayName}
                {...register("displayName")}
            />
            <Field
                className="mb-4"
                label="Email"
                type="email"
                placeholder="Email address"
                icon="email"
                error={errors.email}
                {...register("email")}
                autoFocus
            />

            <Field
                className="mb-4"
                label="Password"
                type="password"
                placeholder="Password"
                icon="lock"
                error={errors.password}
                {...register("password")}
            />

            <StepActions
                onNext={handleNext}
                isLoading={isLoading}
            />
        </div>
    );
};

export default Step1Account;

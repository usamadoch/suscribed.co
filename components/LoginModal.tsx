import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGoogleLogin, CodeResponse } from "@react-oauth/google";

import Modal from "@/components/Modal";
import Field from "@/components/Field";
import Checkbox from "@/components/Checkbox";
import Icon from "@/components/Icon";
import Loader from "@/components/Loader";

import { ApiClientError, authApi } from "@/lib/api";
import { LoginSchema } from "@/lib/validation";
import { useAuth, useAuthStore } from "@/stores/auth";

// Extended schema for signup flow (name + password)
const SignupSchema = LoginSchema.extend({
    displayName: z.string().min(1, "Full name is required"),
});

type FormData = z.infer<typeof SignupSchema>;

type LoginModalProps = {
    visible: boolean;
    onClose: () => void;
};

const LoginModal = ({ visible, onClose }: LoginModalProps) => {
    const { login, signup, isLoading: authLoading } = useAuth();

    // State
    const [step, setStep] = useState<1 | 2>(1);
    const [flow, setFlow] = useState<'login' | 'signup'>('login');
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setError,
        trigger,
        getValues,
        formState: { errors },
        reset
    } = useForm<FormData>({
        resolver: zodResolver(step === 1 ? LoginSchema.pick({ email: true }) : (flow === 'login' ? LoginSchema : SignupSchema)) as any,
        defaultValues: {
            email: "",
            password: "",
            displayName: "",
            remember: false,
        },
        mode: "onChange"
    });

    const handleClose = () => {
        setStep(1);
        setFlow('login');
        reset();
        onClose();
    };

    const handleEmailCheck = async () => {
        setIsCheckingEmail(true);
        const valid = await trigger("email");
        if (!valid) {
            setIsCheckingEmail(false);
            return;
        }

        const email = getValues("email");
        try {
            const { exists } = await authApi.checkEmail(email);
            setFlow(exists ? 'login' : 'signup');
            setStep(2);
        } catch (error) {
            console.error("Email check failed", error);
            setError("root", { message: "Failed to verify email. Please try again." });
        } finally {
            setIsCheckingEmail(false);
        }
    };

    const onSubmit = async (data: any) => {
        if (step === 1) {
            await handleEmailCheck();
            return;
        }

        try {
            if (flow === 'login') {
                await login(data, { redirect: false });
                handleClose();
            } else {
                // Generate username from name or email
                const base = data.displayName.toLowerCase().replace(/[^a-z0-9]/g, '') || data.email.split('@')[0];
                const username = `user${base}${Math.floor(Math.random() * 1000)}`;

                await signup({
                    email: data.email,
                    password: data.password,
                    displayName: data.displayName,
                    username,
                    role: 'member'
                }, { redirect: false });
                handleClose();
            }
        } catch (error) {
            if (error instanceof ApiClientError) {
                // Handle API errors...
                if (error.details) {
                    Object.keys(error.details).forEach((key) => {
                        // Cast to any to handle extended schema keys
                        setError(key as any, {
                            type: "manual",
                            message: error.details![key][0],
                        });
                    });
                } else {
                    setError("root", {
                        type: "manual",
                        message: error.message,
                    });
                }
            } else {
                setError("root", { message: "An unexpected error occurred." });
            }
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: async (codeResponse: CodeResponse) => {
            setGoogleLoading(true);
            try {
                const { user } = await authApi.googleLogin(codeResponse.code);
                // Manually update store state since we bypassed the wrapper
                useAuthStore.setState({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });

                handleClose();
            } catch (error) {
                console.error("Google login failed", error);
                setError("root", { message: "Google login failed" });
                setGoogleLoading(false);
            }
        },
        onError: () => {
            setError("root", { message: "Google login failed" });
            setGoogleLoading(false);
        }
    });

    const remember = watch("remember");

    return (
        <Modal
            key="login-modal"
            visible={visible}
            onClose={handleClose}
            title={step === 1 ? "Sign in / Sign up" : (flow === "login" ? "Sign in" : "Sign up")}
        >
            {step === 1 && (
                <>
                    <button
                        className="btn-stroke w-full h-14"
                        type="button"
                        onClick={() => handleGoogleLogin()}
                        disabled={googleLoading}
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
                    <div className="flex justify-center items-center py-6">
                        <span className="w-full max-w-33 h-0.25 bg-n-1 dark:bg-white"></span>
                        <span className="mx-4 text-sm font-medium">or</span>
                        <span className="w-full max-w-33 h-0.25 bg-n-1 dark:bg-white"></span>
                    </div>
                </>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>

                {errors.root && (
                    <div className="mb-4 p-3 bg-pink-1/10 border border-pink-1 rounded text-pink-1 text-sm font-bold">
                        {errors.root.message}
                    </div>
                )}

                <Field
                    className={`mb-4.5 ${step === 2 && flow === 'signup' ? 'hidden' : ''}`}
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    icon="email"
                    {...register("email")}
                    error={errors.email}
                    required
                    readOnly={step === 2} // Read-only in step 2
                />

                {step === 2 && (
                    <>
                        {flow === 'signup' && (
                            <Field
                                className="mb-4.5"
                                label="Full Name"
                                type="text"
                                placeholder="Enter your full name"
                                icon="profile"
                                {...register("displayName")}
                                error={errors.displayName}
                                required
                                autoFocus
                            />
                        )}
                        <Field
                            className="mb-6.5"
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            {...register("password")}
                            error={errors.password}
                            required
                            autoFocus={flow === 'login'}
                        />
                    </>
                )}

                {step === 2 && flow === 'login' && (
                    <div className="flex justify-between items-center mb-6.5">
                        <Checkbox
                            label="Remember me"
                            {...register("remember")}
                            checked={remember}
                        />
                        <button
                            className="mt-0.5 text-xs font-bold transition-colors hover:text-purple-1"
                            type="button"
                        >
                            Recover password
                        </button>
                    </div>
                )}

                <button
                    className="btn-purple btn-shadow w-full h-14"
                    type="submit"
                    disabled={authLoading || isCheckingEmail}
                >
                    {authLoading || isCheckingEmail ? (
                        <Loader className="w-6 h-6 text-white" />
                    ) : (
                        step === 1
                            ? "Continue"
                            : (flow === 'login' ? "Sign in" : "Create account")
                    )}
                </button>

                {step === 2 && (
                    <button
                        className="btn-stroke w-full h-14 mt-4"
                        type="button"
                        onClick={() => setStep(1)}
                    >
                        Back
                    </button>
                )}
            </form>
        </Modal>
    );
};

export default LoginModal;

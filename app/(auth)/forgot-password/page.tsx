



"use client";
import Link from "next/link";
import ForgotPasswordPage from "@/templates/AuthPages/ForgotPasswordPage";

const ForgotPassword = () => {
    return (
        <>
            <ForgotPasswordPage />
            <div className="mt-12 text-sm">
                Already registered?
                <Link
                    href="/login"
                    className="ml-1.5 font-bold transition-colors hover:text-purple-1"
                >
                    Sign in to your account
                </Link>
            </div>
        </>
    );
};

export default ForgotPassword;

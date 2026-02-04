



import Link from "next/link";
import LoginPage from "@/templates/AuthPages/LoginPage";
import { RedirectIfAuthenticated } from "@/stores/auth";

const SigninPage = () => {

    return (
        <RedirectIfAuthenticated>
            <div className="mb-1 text-h1">Sign in</div>
            <div className="mb-12 text-sm text-n-2 dark:text-white/50">
                Enter your email to continue
            </div>


            <LoginPage />
            <div className="mt-12 text-sm">
                You don’t have an account
                <Link
                    href="/register"
                    className="ml-1.5 font-bold transition-colors hover:text-purple-1"
                >
                    Create an account
                </Link>
            </div>
        </RedirectIfAuthenticated>
    );
};

export default SigninPage;

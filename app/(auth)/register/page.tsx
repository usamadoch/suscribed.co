




import Link from "next/link";
import RegistrationPage from "@/templates/AuthPages/RegistrationPage";

const Registration = () => {
    return (
        <>
            <RegistrationPage />
            <div className="mt-12 text-sm">
                Already registered?

                <Link
                    href="/login"
                    className="ml-1.5 font-bold transition-colors hover:text-purple-1"
                >
                    Login to your account
                </Link>
            </div>
        </>
    );
};

export default Registration;

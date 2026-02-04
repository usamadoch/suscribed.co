"use client";

import Link from "next/link";

const NotFound = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-n-1 text-white">
            <div className="text-center">
                <h1 className="text-h3 mb-2">Page Not Found</h1>
                <p className="text-n-3 mb-6">The creator page you are looking for does not exist.</p>
                <Link
                    href="/"
                    className="btn-purple btn-medium inline-flex"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;

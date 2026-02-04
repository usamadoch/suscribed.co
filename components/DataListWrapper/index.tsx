
import { ReactNode } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface DataListWrapperProps {
    isLoading: boolean;
    isError: boolean;
    errorMessage?: string | null;
    children: ReactNode;
}

const DataListWrapper = ({
    isLoading,
    isError,
    errorMessage,
    children
}: DataListWrapperProps) => {
    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center h-64 text-red-500">
                {errorMessage || "Failed to load data"}
            </div>
        );
    }

    return <>{children}</>;
};

export default DataListWrapper;

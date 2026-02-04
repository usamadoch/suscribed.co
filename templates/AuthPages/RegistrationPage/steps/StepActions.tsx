



import Loader from "@/components/Loader";

type StepActionsProps = {
    onBack?: () => void;
    onNext: () => void;
    isLoading?: boolean;
    nextLabel?: string;
    showSkip?: boolean;
    onSkip?: () => void;
};

const StepActions = ({
    onBack,
    onNext,
    isLoading = false,
    nextLabel = "Continue",
    showSkip = false,
    onSkip
}: StepActionsProps) => {
    return (
        <div className="flex justify-between mt-12 gap-4">
            {showSkip ? (
                <button
                    className="btn-stroke w-full"
                    type="button"
                    onClick={onSkip}
                    disabled={isLoading}
                >
                    Skip
                </button>
            ) : onBack && (
                <button
                    className="btn-stroke w-full"
                    type="button"
                    onClick={onBack}
                    disabled={isLoading}
                >
                    Back
                </button>
            )}

            <button
                className="btn-purple btn-shadow w-full h-14"
                type="button"
                onClick={onNext}
                disabled={isLoading}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <Loader className="h-6 w-6 text-white" />
                    </div>
                ) : (
                    nextLabel
                )}
            </button>
        </div>
    );
};

export default StepActions;

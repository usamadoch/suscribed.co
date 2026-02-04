import Loader from "@/components/Loader";
import LoginModal from "@/components/LoginModal";
import Icon from "@/components/Icon";

interface LockedContentProps {
    type?: 'box' | 'overlay';
    title?: string;
    text?: string;
    // Box props
    handleJoin?: () => void;
    isJoining?: boolean;
    user?: any;
    isLoginModalOpen?: boolean;
    setIsLoginModalOpen?: (open: boolean) => void;
}

const LockedContent = ({
    type = 'box',
    title = "Members Only",
    text,
    handleJoin,
    isJoining,
    user,
    isLoginModalOpen,
    setIsLoginModalOpen
}: LockedContentProps) => {

    if (type === 'overlay') {
        return (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-n-1/80 backdrop-blur-sm p-6 text-center rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-n-1 flex items-center justify-center mb-3 shadow-lg">
                    <Icon name="lock" className="w-6 h-6 fill-purple-1" />
                </div>
                <h3 className="text-h6 text-white mb-1">{title}</h3>
                {text && <p className="text-sm text-n-3">{text}</p>}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between text-center p-10 border rounded border-n-1 dark:border-white/10 mt-6 md:p-12 bg-n-1/5">
            <div className="flex flex-col items-start  max-w-[50%]">
                <h4 className="text-h6 mb-2">{title} Content</h4>
                <p className="text-n-3 mb-4 text-left">{text || "Join this creator's community to access full posts, excessive media, and comments."}</p>
            </div>

            <button
                className="btn-purple btn-medium px-8 max-w-[50%] "
                onClick={handleJoin}
                disabled={isJoining}
            >
                {isJoining ? <Loader /> : user ? "Join to unlock" : "Log in to unlock"}

            </button>
            {(isLoginModalOpen !== undefined && setIsLoginModalOpen) && (
                <LoginModal visible={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            )}
        </div>
    );
};

export default LockedContent;

import Icon from "@/components/Icon";

type ToolbarProps = {
    openFileSelector: () => void;
    onFileSelection: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
};

const PostToolbar = ({ openFileSelector, onFileSelection, fileInputRef }: ToolbarProps) => {
    const triggerUpload = (acceptType: string) => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = acceptType;
            openFileSelector();
        }
    };

    return (
        <div className="flex items-center justify-between w-full h-13.5 md:px-3">
            <div className="flex items-center ml-2 gap-2">
                <button
                    className="btn-stroke btn-small md:grow"
                    type="button"
                    onClick={() => triggerUpload("video/*")}
                >
                    <Icon name="forward" />
                    <span>Video</span>
                </button>
                <button
                    className="btn-stroke btn-small md:grow"
                    type="button"
                    onClick={() => triggerUpload("image/*")}
                >
                    <Icon name="forward" />
                    <span>Image</span>
                </button>


                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={onFileSelection}
                    accept="image/*,video/*"
                    multiple
                />
            </div>
        </div>
    );
};

export default PostToolbar;

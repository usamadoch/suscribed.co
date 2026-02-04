
import { usePostForm } from "../usePostForm";
import PostInput from "./PostInput";
import MediaPreview from "./MediaPreview";
import PostToolbar from "./PostToolbar";
import NewPostSettings from "./NewPostSettings";

type PostFormProps = {
    formState: ReturnType<typeof usePostForm>;
    submitLabel?: string;
};

const PostForm = ({ formState, submitLabel = "Post" }: PostFormProps) => {
    const {
        attachments,
        caption,
        setCaption,
        visibility,
        setVisibility,
        allowComments,
        setAllowComments,
        fileInputRef,
        openFileSelector,
        handleFileSelection,
        removeAttachment,
        removeAllAttachments,
        handleSubmit,
        isSubmitting,
    } = formState;

    return (
        <div className="flex lg:block">
            <div className="grow lg:mb-6 lg:bg-transparent lg:p-0 lg:border-none dark:lg:bg-transparent">
                <form
                    className="flex  flex-col gap-10 pl-1 py-1 pr-5 bg-white border border-n-1 shadow-primary-4 md:pr-4 dark:bg-n-1 dark:border-white"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <PostInput
                        content={caption}
                        setContent={setCaption}
                        attachmentCount={attachments.length}
                    />

                    <MediaPreview
                        attachments={attachments}
                        removeAttachment={removeAttachment}
                        removeAllAttachments={removeAllAttachments}
                    />

                    <PostToolbar
                        openFileSelector={openFileSelector}
                        onFileSelection={handleFileSelection}
                        fileInputRef={fileInputRef}
                    />
                </form>
            </div>

            <NewPostSettings
                visibility={visibility}
                setVisibility={setVisibility}
                allowComments={allowComments}
                setAllowComments={setAllowComments}
                onPublish={handleSubmit}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default PostForm;

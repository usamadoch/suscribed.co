import Image from "@/components/Image";
import TextareaAutosize from "react-textarea-autosize";

type PostInputProps = {
    content: string;
    setContent: (content: string) => void;
    attachmentCount: number;
};

const PostInput = ({ content, setContent, attachmentCount }: PostInputProps) => {
    return (
        <div className="flex items-center text-sm font-bold">
            <div className="relative ml-2 mt-2 w-10 h-10 mr-2.5">
                <Image
                    className="object-cover rounded-full"
                    src="/images/avatar-1.jpg"
                    fill
                    alt="Avatar"
                />
            </div>

            <TextareaAutosize
                className="grow py-2 pr-4 bg-transparent text-sm font-medium text-n-1 outline-none resize-none placeholder:text-n-1 md:px-3 dark:text-white dark:placeholder:text-white"
                maxRows={12}
                minRows={1}
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                required={attachmentCount === 0}
            />
        </div>
    );
};

export default PostInput;

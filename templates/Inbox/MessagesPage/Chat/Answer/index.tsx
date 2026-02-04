import Image from "@/components/Image";

type AnswerProps = {
    time: string;
    content: string;
    status?: 'sending' | 'sent' | 'error';
    author?: {
        name: string;
        avatar: string;
    };
};

const Answer = ({ time, content, author, status }: AnswerProps) => (
    <div className="flex justify-end">
        <div className="flex flex-col items-end grow">
            <div className="flex justify-end mb-1.5 text-xs items-center">
                {status === 'sending' && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-n-3 mr-1.5"></div>
                )}
                <div className="">{time}</div>
                <div className="ml-1 font-bold">{author?.name || "You"}</div>
            </div>
            <div
                className="inline-block px-4 py-1.5 bg-purple-1 text-sm font-medium text-n-1"
                style={{
                    clipPath:
                        "polygon(0 0, calc(100% - 0.7rem) 0, 100% 0.7rem, 100% 100%, 0 100%)",
                }}
            >
                {content}
            </div>
        </div>
        <div className="relative w-8 h-8 ml-2">
            <Image
                className="object-cover rounded-full"
                src={author?.avatar || "/images/avatars/avatar.jpg"}
                fill
                alt="Avatar"
            />
        </div>
    </div>
);

export default Answer;

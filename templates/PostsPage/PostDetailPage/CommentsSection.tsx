import Comment from "@/components/Comment";

interface CommentsSectionProps {
    user: any;
    value: string;
    setValue: (value: string) => void;
    handleCommentSubmit: () => void;
    isSubmittingComment: boolean;
    comments: any[];
}

const CommentsSection = ({
    user,
    value,
    setValue,
    handleCommentSubmit,
    isSubmittingComment,
    comments
}: CommentsSectionProps) => {
    return (
        <>
            <div className="text-2xl font-bold mb-6">Comments</div>
            <Comment
                className="mb-6"
                avatar={user?.avatarUrl || "/images/avatars/avatar.jpg"}
                placeholder="Type to add something"
                value={value}
                setValue={(e: any) => setValue(e.target.value)}
                onSend={handleCommentSubmit}
                disabled={!value.trim() || isSubmittingComment}
            />



            <div>
                {comments && comments.length > 0 ? (
                    comments.map((comment: any) => (
                        <div key={comment._id} className="mb-4 p-4 border rounded border-n-1 dark:border-white/10">
                            <div className="font-bold text-sm mb-1">{comment.author?.displayName || 'User'}</div>
                            <div className="text-sm">{comment.content}</div>
                        </div>
                    ))
                ) : (
                    <div className="text-n-3 text-sm">No comments yet.</div>
                )}
            </div>
        </>
    );
};

export default CommentsSection;

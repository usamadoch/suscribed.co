
import EditPostPage from "@/templates/PostsPage/EditPostPage";

type EditPostProps = {
    params: Promise<{
        id: string;
    }>;
};

const EditPost = ({ params }: EditPostProps) => {


    return (
        <EditPostPage params={params} />

    );
};

export default EditPost;

import { useState } from "react";
import Link from "next/link";
import { getFullImageUrl } from "@/lib/utils";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { Post } from "@/types";
import { useDeletePost } from "@/hooks/useQueries";
import { toast } from "react-hot-toast";
import Modal from "@/components/Modal";
import Loader from "@/components/Loader";

type RowProps = {
    item: Post;
};

const Row = ({ item }: RowProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const { mutate: deletePost, isPending } = useDeletePost();

    // Caption preview
    const captionPreview = item.caption || "No caption";
    const truncatedPreview = captionPreview.length > 50 ? captionPreview.substring(0, 50) + "..." : captionPreview;

    // Thumbnail
    const mediaItem = item.mediaAttachments?.find(m => m.type === 'image' || m.type === 'video');
    const isVideo = mediaItem?.type === 'video';
    const remoteUrl = mediaItem?.url ? getFullImageUrl(mediaItem.url) : undefined;
    const thumbnail = remoteUrl || "/images/content/product-1.jpg";

    const handleDelete = () => {
        deletePost(item._id, {
            onSuccess: () => {
                toast.success("Post deleted successfully");
                setIsOpen(false);
            },
            onError: () => {
                toast.error("Failed to delete post");
            }
        });
    };

    return (
        <>
            <tr className="">
                <td className="td-custom py-3.5">
                    <Link
                        className="inline-flex items-center text-sm  transition-colors hover:text-purple-1"
                        href={`/posts/${item._id}`}
                    >
                        <div className={`shrink-0 w-18 mr-5 border border-n-1 rounded overflow-hidden aspect-square relative flex justify-center items-center ${isVideo ? 'bg-n-2 dark:bg-n-7' : ''}`}>
                            {isVideo ? (
                                <Icon name="video" className="w-6 h-6 fill-n-4 dark:fill-n-4" />
                            ) : (
                                <Image
                                    className="object-cover"
                                    src={thumbnail}
                                    fill
                                    alt={item.caption || "Post thumbnail"}
                                    unoptimized
                                />
                            )}
                        </div>

                        {truncatedPreview}
                    </Link>
                </td>


                <td className="td-custom py-3.5 font-medium">
                    {item.viewCount || 0}
                </td>
                <td className="td-custom py-3.5 font-medium">
                    <div className="inline-flex items-center shrink-0">
                        {item.likeCount || 0}
                    </div>
                </td>
                <td className="td-custom py-3.5 font-bold">
                    {item.commentCount || 0}
                </td>


                <td className="td-custom py-3.5 text-right">
                    <Menu as="div" className="relative inline-block text-left">
                        <MenuButton className="btn-stroke btn-small btn-square">
                            <Icon name="dots" />
                        </MenuButton>
                        <Transition
                            enter="transition duration-100 ease-out"
                            enterFrom="transform scale-95 opacity-0"
                            enterTo="transform scale-100 opacity-100"
                            leave="transition duration-75 ease-out"
                            leaveFrom="transform scale-100 opacity-100"
                            leaveTo="transform scale-95 opacity-0"
                        >
                            <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right bg-white border border-n-1 rounded-sm shadow-primary-4 dark:bg-n-1 dark:border-white z-10">
                                <MenuItem>
                                    {({ active }) => (
                                        <Link
                                            href={`/posts/${item._id}/edit`}
                                            className={`flex items-center w-full px-4 py-2 text-sm font-bold transition-colors ${active ? "bg-n-3/10 dark:bg-white/20" : ""
                                                } text-n-1 dark:text-white`}
                                        >
                                            <Icon className="mr-3 fill-n-1 dark:fill-white icon-18" name="edit" />
                                            Edit
                                        </Link>
                                    )}
                                </MenuItem>
                                <MenuItem>
                                    {({ active }) => (
                                        <button
                                            className={`flex items-center w-full px-4 py-2 text-sm font-bold transition-colors ${active ? "bg-n-3/10 dark:bg-white/20" : ""
                                                } text-pink-1`}
                                            onClick={() => setIsOpen(true)}
                                        >
                                            <Icon className="mr-3 fill-pink-1 icon-18" name="trash" />
                                            Delete
                                        </button>
                                    )}
                                </MenuItem>
                            </MenuItems>
                        </Transition>
                    </Menu>
                </td>
            </tr>

            <Modal
                title="Delete Post"
                visible={isOpen}
                onClose={() => setIsOpen(false)}
            >
                <div className="text-sm text-n-3">
                    Are you sure you want to delete this post? This action cannot be undone.
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        className="btn-stroke px-5 btn-medium cursor-pointer"
                        onClick={() => setIsOpen(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </button>
                    {/* <button
                        type="button"
                        className="btn-pink btn-small"
                        onClick={handleDelete}
                        disabled={isPending}
                    >
                        {isPending ? "Deleting..." : "Delete"}
                    </button> */}

                    <button
                        className="btn-purple btn-medium bg-pink-1 hover:bg-pink-1/80 cursor-pointer px-5 md:!bg-transparent md:border-none md:w-6 md:h-6 md:p-0 md:text-0"
                        onClick={handleDelete}
                        disabled={isPending}
                    >
                        {isPending ? <Loader className="w-6 h-6 text-white" /> : "Delete"}
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default Row;

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import Icon from "@/components/Icon";
import { MediaFile } from "../usePostForm";

type MediaPreviewProps = {
    attachments: MediaFile[];
    removeAttachment: (id: string) => void;
    removeAllAttachments: () => void;
};

const MediaPreview = ({ attachments, removeAttachment, removeAllAttachments }: MediaPreviewProps) => {
    if (attachments.length === 0) return null;

    return (
        <div className={`grid mt-4 gap-4 pl-4 pb-4 ${attachments.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {attachments.map((file, index) => (
                <div
                    key={file.id}
                    className={`relative w-full group ${index === 0 ? 'col-span-full h-96' : 'h-40'}`}
                >
                    {file.type === "image" ? (
                        <img
                            src={file.url}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg border border-n-1"
                        />
                    ) : (
                        <video
                            src={file.url}
                            className="w-full h-full object-contain rounded-lg border border-n-1"
                            controls
                        />
                    )}

                    {/* absolute top-2.5 right-2.5 w-8 h-8 bg-purple-1 border border-n-1 rounded-sm text-0 transition-colors hover:bg-purple-2 */}
                    <div className="absolute top-2 right-2">
                        {index === 0 ? (
                            <Menu className="relative" as="div">
                                <MenuButton className=" btn-square border border-black btn-small mr-1 md:mr-0 cursor-pointer bg-purple-1 rounded-sm text-0 transition-colors hover:bg-purple-2">
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
                                    <MenuItems className="absolute right-0 mt-2 w-32 py-2 border border-n-1 rounded-sm bg-white shadow-primary-4 dark:bg-n-1 dark:border-white">
                                        <MenuItem>
                                            <button
                                                className="flex items-center w-full px-4 py-2 text-sm font-bold text-n-1 transition-colors hover:bg-n-3/10 dark:text-white dark:hover:bg-white/20"
                                                onClick={() => removeAttachment(file.id)}
                                            >
                                                <Icon className="w-4 h-4 mr-2 fill-n-1 dark:fill-white" name="trash" />
                                                Delete
                                            </button>

                                        </MenuItem>
                                        {attachments.length > 1 && (
                                            <MenuItem>
                                                <button
                                                    className="flex items-center w-full px-4 py-2 text-sm font-bold text-red-500 transition-colors hover:bg-n-3/10 dark:text-red-500 dark:hover:bg-white/20"
                                                    onClick={removeAllAttachments}
                                                >
                                                    <Icon className="w-4 h-4 mr-2 fill-red-500" name="trash" />
                                                    Delete All
                                                </button>
                                            </MenuItem>
                                        )}
                                    </MenuItems>
                                </Transition>
                            </Menu>
                        ) : (
                            <button
                                className="absolute top-2.5 right-2.5 w-8 h-8 bg-purple-1 border border-n-1 rounded-sm text-0 transition-colors hover:bg-purple-2"
                                onClick={() => removeAttachment(file.id)}
                                type="button"
                            >
                                <Icon name="close" />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MediaPreview;

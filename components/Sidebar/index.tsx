import { useState } from "react";
import Link from "next/link";
import { MenuButton, Menu as MenuDropdown, MenuItem, MenuItems, Transition } from "@headlessui/react";
import Logo from "@/components/Logo";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import Menu from "./Menu";
import TeamMembers from "./TeamMembers";
import { useAuth } from "@/stores/auth";

type SidebarProps = {};

const Sidebar = ({ }: SidebarProps) => {
    const { user, logout } = useAuth();
    const [visible, setVisible] = useState<boolean>(false);

    return (
        <div
            className={`fixed top-0 left-0 bottom-0 flex flex-col w-[18.75rem] pt-6 px-8 pb-4.5 bg-n-1 xl:z-30 md:hidden ${visible ? "w-[18.75rem]" : "xl:w-20"
                }`}
        >
            <div className="flex justify-between items-center h-[1.625rem] mb-11">
                <Logo className={visible ? "flex" : "xl:hidden"} light />
                <button
                    className="hidden xl:flex"
                    onClick={() => setVisible(!visible)}
                >
                    <Icon
                        className="fill-white"
                        name={visible ? "close" : "burger"}
                    />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto scroll-smooth -mr-4 pr-4">
                <Menu visible={visible} />
                <TeamMembers visible={visible} />
            </div>
            <div
                className={`flex items-center h-18 mt-auto mx-0 pt-10 ${visible ? "mx-0" : "xl:-mx-4"
                    }`}
            >
                <div
                    className={`inline-flex items-center font-bold text-white text-sm transition-colors ${visible ? "mx-0 text-sm" : "xl:mx-auto xl:text-0"
                        }`}
                // href="/settings"
                >
                    <div
                        className={`relative w-5.5 h-5.5 mr-2.5 rounded-full overflow-hidden ${visible ? "mr-2.5" : "xl:mr-0"
                            }`}
                    >
                        <Image
                            className="object-cover scale-105"
                            src={user?.avatarUrl || "/images/avatars/avatar.jpg"}
                            fill
                            alt="Avatar"
                        />
                    </div>
                    {user?.displayName || "User"}
                </div>

                <MenuDropdown className={`relative ml-auto ${visible ? "block" : "xl:hidden"}`} as="div">
                    <MenuButton className="btn-transparent-light btn-square btn-small cursor-pointer">
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
                        <MenuItems className="absolute bottom-full left-0 w-[14.69rem] mb-2.5 py-2 border border-n-1 rounded-sm bg-white shadow-primary-4 dark:bg-n-1 dark:border-white">
                            <MenuItem
                                className="flex items-center cursor-pointer w-full h-10 mb-1.5 px-6.5 text-sm font-bold text-n-1 transition-colors hover:bg-n-3/10 dark:text-white dark:hover:bg-white/20"
                                as="button"
                                onClick={logout}
                            >
                                <Icon
                                    className="-mt-0.25 mr-3 fill-n-1 dark:fill-white"
                                    name="arrow-next"
                                />
                                Logout
                            </MenuItem>
                        </MenuItems>
                    </Transition>
                </MenuDropdown>
            </div>
        </div>
    );
};

export default Sidebar;

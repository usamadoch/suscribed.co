import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";
import { twMerge } from "tailwind-merge";
import { useNavigation } from "@/hooks/useNavigation";
import { useSocket } from "@/stores/socket";

type MenuProps = {
    visible?: boolean;
};

const Menu = ({ visible }: MenuProps) => {
    const pathname = usePathname();
    const navigationItems = useNavigation();
    const { unreadCount } = useSocket();



    return (
        <>
            <div
                className={`mb-3 overflow-hidden whitespace-nowrap text-xs font-medium text-white/50 ${visible ? "w-full opacity-100" : "xl:w-0 xl:opacity-0"
                    }`}
            >
                Navigation
            </div>
            <div className="-mx-4 mb-10">
                {navigationItems.map((link: any, index: number) => {
                    // Centralized configuration for dynamic counters
                    // Add new counters here mapping the URL to the count value
                    const dynamicCounters: Record<string, number> = {
                        "/notifications": unreadCount,
                        "/messages": 0, // Placeholder for future message count
                    };

                    const dynamicCount = dynamicCounters[link.url];
                    const hasDynamicCounter = typeof dynamicCount === "number";

                    // Determine what to show:
                    // 1. If it's a dynamic counter link (e.g. notifications), show only if count > 0
                    // 2. If it has a static counter defined in navigation config, show it
                    const showCounter = hasDynamicCounter ? dynamicCount > 0 : !!link.counter;
                    const counterValue = hasDynamicCounter ? dynamicCount : link.counter;

                    return (
                        <Link
                            className={twMerge(
                                `flex items-center h-9.5 mb-2 px-4 text-sm text-white fill-white font-bold last:mb-0 transition-colors hover:bg-n-2 ${pathname === link.url &&
                                "bg-n-2 text-purple-1 fill-purple-1"
                                } ${visible ? "text-sm" : "xl:text-0"}`
                            )}
                            href={link.url}
                            key={index}
                            target={link.target}
                        >
                            <Icon
                                className={`mr-3 fill-inherit ${visible ? "mr-3" : "xl:mr-0"
                                    }`}
                                name={link.icon}
                            />
                            {link.title}

                            {showCounter && (
                                <div
                                    className={`min-w-[1.625rem] ml-auto px-1 py-0.25 text-center text-xs font-bold text-n-1 ${visible ? "block" : "xl:hidden"
                                        }`}
                                    style={{
                                        backgroundColor:
                                            "#AE7AFF", // Could also be dynamic based on link.counterColor if needed in future
                                    }}
                                >
                                    {counterValue}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>
        </>
    );
};

export default Menu;

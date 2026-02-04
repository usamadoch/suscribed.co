import { useState } from "react";
import { useWindowScrollPosition } from "@n8tb1t/use-scroll-position";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import Image from "@/components/Image";
import Link from "next/link";
import { useAuth } from "@/stores/auth";
import Can from "@/components/Can";

type HeaderProps = {
    back?: boolean;
    title?: string;
    createBtn?: boolean;
    onBack?: () => void;
};

const Header = ({ back, title, createBtn = true, onBack }: HeaderProps) => {
    const [headerStyle, setHeaderStyle] = useState<boolean>(false);
    const router = useRouter();
    const { user } = useAuth();

    useWindowScrollPosition(({ currPos }) => {
        setHeaderStyle(currPos.y <= -1);
    });

    return (
        <header
            className={`fixed top-0 right-0 left-[18.75rem] z-20 border-b border-n-1 xl:left-20 md:left-0 md:relative dark:border-white ${headerStyle
                ? "bg-background dark:bg-n-2 md:!bg-transparent"
                : ""
                }`}
        >
            <div className="flex items-center max-w-[90rem] m-auto w-full h-18 px-16 2xl:px-8 lg:px-6 md:px-5">
                {back && (
                    <button
                        className="btn-stroke btn-square btn-medium shrink-0 mr-6 2xl:mr-4 md:!w-6 md:h-6 md:mr-3"
                        onClick={onBack || (() => router.back())}
                    >
                        <Icon name="arrow-prev" />
                    </button>
                )}
                {title && (
                    <div className="mr-4 text-h3 truncate md:mr-2 md:text-h4">
                        {title}
                    </div>
                )}
                <div className="flex items-center shrink-0 ml-auto">
                    {createBtn && (
                        <Can permission="post:create">
                            <Link
                                href="/posts/new"
                                className="btn-purple btn-medium px-5 md:!bg-transparent md:border-none md:w-6 md:h-6 md:p-0 md:text-0"
                            >
                                <Icon className="md:!m-0" name="add-circle" />
                                <span>Create new</span>
                            </Link>
                        </Can>
                    )}
                    <button className="relative hidden w-8 h-8 ml-1 md:block">
                        <Image
                            className="rounded-full object-cover"
                            src="/images/avatars/avatar.jpg"
                            fill
                            alt="Avatar"
                        />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;

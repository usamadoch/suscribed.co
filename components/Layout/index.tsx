


"use client"

import Image from "@/components/Image";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Menu from "./Menu";
import { RequireAuth } from "@/stores/auth";
import CreatorHeader from "@/components/CreatorHeader";

type LayoutProps = {
    background?: boolean;
    back?: boolean;
    title?: string;
    children: React.ReactNode;
    headerVariant?: "default" | "public";
    requireAuth?: boolean;
    createBtn?: boolean;
    onBack?: () => void;
};

const Layout = ({
    background,
    back,
    title,
    children,
    headerVariant = "default",
    requireAuth = true,
    createBtn = true,
    onBack
}: LayoutProps) => {
    const isPublic = headerVariant === "public";

    const content = (
        <div className={`relative ${!isPublic ? "pl-[18.75rem] xl:pl-20 md:pl-0 md:pb-20" : ""}`}>
            {!isPublic && <Sidebar />}
            <div className={`flex flex-col min-h-screen ${!isPublic ? "pt-18 md:pt-0" : ""} md:min-h-[calc(100vh-5rem)]`}>
                {isPublic ? (
                    <CreatorHeader pageName={title} />
                ) : (
                    <Header back={back} title={title} createBtn={createBtn} onBack={onBack} />
                )}
                <div className="flex grow">
                    <div className={`flex flex-col grow max-w-[90rem] mx-auto pt-6 px-16 pb-2 2xl:px-8 lg:px-6 md:px-5 ${isPublic ? "4xl:max-w-full mt-18" : "4xl:max-w-full"}`}>
                        {children}
                    </div>
                </div>
                {!isPublic && <Footer />}

                {background && (
                    <div className="absolute inset-0 -z-1 overflow-hidden pointer-events-none dark:opacity-70">
                        <div className="absolute z-1 inset-0 bg-n-1 opacity-0 dark:opacity-80"></div>
                        <div className="absolute top-1/2 left-[40vw] -translate-y-[72%] w-[85vw] rotate-180 4xl:w-[85rem] xl:left-[30vw] xl:-top-[20rem] xl:w-[60rem] xl:-translate-y-0 md:-top-[13rem] md:left-[15vw] md:w-[40rem]">
                            <Image
                                className="w-full"
                                src="/images/bg.svg"
                                width={1349}
                                height={1216}
                                alt=""
                            />
                        </div>
                    </div>
                )}
            </div>
            {!isPublic && <Menu />}
        </div>
    );

    if (requireAuth) {
        return (
            <RequireAuth>
                {content}
            </RequireAuth>
        );
    }

    return content;
};

export default Layout;

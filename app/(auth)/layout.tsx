"use client";
import React from "react";
import { useColorMode } from "@chakra-ui/color-mode";
import Logo from "@/components/Logo";
import Image from "@/components/Image";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { colorMode } = useColorMode();
    const isDarkMode = colorMode === "dark";

    return (
        <div className="relative overflow-hidden">
            <div className="relative z-3 flex flex-col max-w-[75rem]  min-h-screen mx-auto px-7.5 py-12 xls:px-20 lg:px-8 md:px-6 md:py-8">
                <div className="flex flex-col grow max-w-[27.31rem] lg:max-w-[25rem]">
                    <Logo className="w-[6.25rem]" />
                    <div className="flex flex-col justify-center grow">
                        {children}
                    </div>
                </div>
            </div>
            <div className="absolute -z-1 inset-0 overflow-hidden pointer-events-none">
                <div className="absolute z-1 inset-0 bg-n-2 opacity-0 dark:opacity-80"></div>
                <div className="absolute top-[50%] left-[45vw] -translate-y-1/2 w-[85rem] xl:w-[60rem] lg:left-[50vw] md:-top-[25%] md:-left-[30%] md:translate-y-0 md:w-[30rem]">
                    <Image
                        className=""
                        src="/images/bg.svg"
                        width={1349}
                        height={1216}
                        alt=""
                    />
                </div>
            </div>
            <div className="absolute top-1/2 right-[calc(50%-61.8125rem)] w-[61.8125rem] -translate-y-1/2 xls:right-[calc(50%-61rem)] xls:w-[55rem] lg:right-[calc(50%-64rem)] md:hidden">
                <Image
                    className="w-full"
                    src={
                        isDarkMode
                            ? "/images/mockup-dark.png"
                            : "/images/mockup-light.png"
                    }
                    width={989}
                    height={862}
                    alt=""
                />
            </div>
        </div>
    );
}

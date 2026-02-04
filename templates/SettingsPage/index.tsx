"use client"

import { useState } from "react";
import Layout from "@/components/Layout";
// import Profile from "@/components/Profile";
import Tabs from "@/components/Tabs";
// import Icon from "@/components/Icon";
import CreatorAccount from "./CreatorAccount";
import Security from "./Security";
import SocialNetworks from "./SocialNetworks";
import Notifications from "./Notifications";
import { useAuth } from "@/stores/auth";
import MemberAccount from "./MemberAccount";
import { usePermission } from "@/hooks/usePermission";

const SettingsPage = () => {
    const { user } = useAuth();
    const canManagePage = usePermission('page:manage');
    const canManageSecurity = usePermission('security:manage');

    const [type, setType] = useState<string>("account");

    const allTypes = [
        {
            title: "Account",
            value: "account",
        },
        {
            title: "Security",
            value: "security",
        },
        {
            title: "Social Networks",
            value: "social-networks",
        },

        {
            title: "Notifications",
            value: "notifications",
        },
    ];

    const types = allTypes.filter(item => {
        // Social networks specifically for page management
        if (item.value === 'social-networks' && !canManagePage) {
            return false;
        }

        // Security specifically for members (per current logic)
        // If creators should also have it, we would add the permission to them.
        if (item.value === 'security' && !canManageSecurity) {
            return false;
        }

        return true;
    });

    return (
        <Layout title="Profile Settings">
            <div className="flex pt-4 lg:block">
                {/* <div className="shrink-0 w-[20rem] 4xl:w-[14.7rem] lg:w-full lg:mb-8">
                    <Profile />
                </div> */}
                <div className="w-[calc(100%-20rem)] pl-[6.625rem] 4xl:w-[calc(100%-14.7rem)] 2xl:pl-10 lg:w-full lg:pl-0">
                    <div className="flex justify-between mb-6 md:overflow-auto md:-mx-5 md:scrollbar-none md:before:w-5 md:before:shrink-0 md:after:w-5 md:after:shrink-0">
                        <Tabs
                            className="2xl:ml-0 md:flex-nowrap"
                            classButton="2xl:ml-0 md:whitespace-nowrap"
                            items={types}
                            value={type}
                            setValue={setType}
                        />
                        {/* <button className="btn-stroke btn-small shrink-0 min-w-[6rem] ml-4 md:hidden">
                            <Icon name="dots" />
                            <span>Actions</span>
                        </button> */}
                    </div>
                    {type === "account" && (canManagePage ? <CreatorAccount /> : <MemberAccount />)}
                    {type === "security" && canManageSecurity && <Security />}
                    {type === "social-networks" && canManagePage && <SocialNetworks />}
                    {type === "notifications" && <Notifications />}
                </div>
            </div>
        </Layout>
    );
};

export default SettingsPage;

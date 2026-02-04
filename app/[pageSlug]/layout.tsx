
import CreatorHeader from "@/components/CreatorHeader";
import DraftBanner from "@/components/DraftBanner";


const PageLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <DraftBanner />
            {children}
        </>
    );
};

export default PageLayout;
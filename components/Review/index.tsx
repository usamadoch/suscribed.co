import Image from "@/components/Image";
import Icon from "@/components/Icon";
import Images from "./Images";


type ReviewProps = {
    item: any;
    imageBig?: boolean;
};

const Review = ({ item, imageBig }: ReviewProps) => {
    return (
        <div className="flex mb-4 p-5 pb-3 card last:mb-0">
            <div className="relative shrink-0 w-8.5 h-8.5">
                <Image
                    className="object-cover rounded-full"
                    src={item.avatar}
                    fill
                    alt="Avatar"
                    unoptimized
                />
            </div>
            <div className="w-[calc(100%-2.125rem)] pl-3.5">
                <div className="flex">
                    <div className="whitespace-nowrap text-sm font-bold">
                        {item.author}
                    </div>
                    <div className="ml-2 pt-0.75 truncate text-xs font-medium text-n-3 dark:text-white/75">
                        {item.time}
                    </div>
                    <button className="btn-transparent-dark btn-square btn-small -mt-1.5 -mr-2 ml-auto">
                        <Icon name="dots" />
                    </button>
                </div>

                <div className="text-sm">{item.content}</div>

                {item.images && (
                    <Images items={item.images} imageBig={imageBig} />
                )}

            </div>
        </div>
    );
};

export default Review;

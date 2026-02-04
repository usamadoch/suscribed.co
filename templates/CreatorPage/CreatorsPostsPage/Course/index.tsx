import Link from "next/link";
import Image from "@/components/Image";
import Icon from "@/components/Icon";

type CourseProps = {
    item: any;
};

const Course = ({ item }: CourseProps) => (
    <Link
        className="group flex flex-col w-[calc(33.333%-1.25rem)] mt-5 mx-2.5 border border-n-1 bg-white md:w-[calc(100%-1.25rem)] dark:border-white dark:bg-n-1"
        href="/education/course-details"
    >
        <div className="relative aspect-video overflow-hidden">
            <Image
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                src={item.image}
                fill
                sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33.33vw"
                alt=""
            />
            <div className="absolute top-2.5 right-2.5 flex justify-center items-center w-8 h-8 rounded-full bg-n-1/50 backdrop-blur-sm md:top-4 md:right-4">
                <Icon className="w-4 h-4" name="upload" fill="#FFFFFF" />
            </div>
        </div>
        <div className="flex flex-col grow pt-4 px-5 pb-5">
            {/* <div className="mb-1 text-h6">{item.title}</div> */}
            <div className="mb-3.5 text-sm text-n-3 dark:text-white/75">
                {item.school}
            </div>
            <div className="flex justify-start gap-5 items-center mt-auto">
                <div className="text-sm flex items-center gap-1">
                    <Icon name="like" />
                    36
                </div>
                <div className="text-sm flex items-center gap-1">
                    <Icon name="comments" />
                    25
                </div>
            </div>
        </div>
    </Link>
);

export default Course;

import { useState } from "react";
import Image from "@/components/Image";
import Icon from "@/components/Icon";

type ImagesProps = {
    items: any;
    imageBig?: boolean;
};

const Images = ({ items, imageBig }: ImagesProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = (e: React.MouseEvent) => {
        e.preventDefault();
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? items.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const nextSlide = (e: React.MouseEvent) => {
        e.preventDefault();
        const isLastSlide = currentIndex === items.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    if (!items || items.length === 0) return null;

    return (
        <div className={`relative mt-4 group w-full ${imageBig ? "h-[20rem]" : "h-[30rem]"}`}>
            <div className="w-full h-full relative border border-n-1 dark:border-white rounded-lg overflow-hidden">
                <Image
                    className="object-contin"
                    src={items[currentIndex]}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 100vw, 50vw"
                    alt=""
                    unoptimized
                />
            </div>

            {items.length > 1 && (
                <>
                    {/* Image Count */}
                    <div className="absolute top-4 right-4 bg-n-1/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-white pointer-events-none z-10">
                        {currentIndex + 1} / {items.length}
                    </div>

                    {/* Left Arrow */}
                    <button
                        onClick={prevSlide}
                        className="absolute top-[50%] -translate-y-[50%] left-4 w-8 h-8 rounded-full bg-n-1/50 hover:bg-n-1/75 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 duration-300"
                    >
                        <Icon name="arrow-prev" className="w-4 h-4 fill-white" />
                    </button>

                    {/* Right Arrow */}
                    <button
                        onClick={nextSlide}
                        className="absolute top-[50%] -translate-y-[50%] right-4 w-8 h-8 rounded-full bg-n-1/50 hover:bg-n-1/75 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 duration-300"
                    >
                        <Icon name="arrow-next" className="w-4 h-4 fill-white" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-4 w-full flex justify-center py-2 space-x-2">
                        {items.map((_: any, slideIndex: number) => (
                            <div
                                key={slideIndex}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentIndex(slideIndex);
                                }}
                                className={`h-2 w-2 rounded-full cursor-pointer shadow-sm transition-all ${currentIndex === slideIndex
                                    ? "bg-white scale-125"
                                    : "bg-white/60 hover:bg-white/80"
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Images;

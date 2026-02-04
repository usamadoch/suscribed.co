
import React, { useState } from 'react';
import MediaBlock from './MediaBlock';

import { MediaAttachment } from '@/types';

interface MediaCarouselProps {
    items: MediaAttachment[];
}

const MediaCarousel = ({ items }: MediaCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => {
        if (currentIndex < items.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    if (!items || items.length === 0) return null;

    return (
        <div className="relative group w-full mb-4">
            {/* Main Carousel Container */}
            <div className="w-full h-[512px] overflow-hidden rounded-2xl relative">
                <div
                    className="flex h-full transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {items.map((item, index) => (
                        <div key={index} className="min-w-full h-full shrink-0">
                            <MediaBlock
                                url={item.url}
                                type={item.type === 'video' ? 'video' : 'image'}
                                className="mb-0! rounded-none h-full"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Previous Button */}
            <button
                onClick={prev}
                disabled={currentIndex === 0}
                className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all duration-200 z-10 disabled:opacity-0 disabled:pointer-events-none scale-100 hover:scale-110`}
                aria-label="Previous slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>

            {/* Next Button */}
            <button
                onClick={next}
                disabled={currentIndex === items.length - 1}
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-all duration-200 z-10 disabled:opacity-0 disabled:pointer-events-none scale-100 hover:scale-110`}
                aria-label="Next slide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {items.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`transition-all duration-300 rounded-full h-2 ${currentIndex === index
                            ? 'w-6 bg-white shadow-lg'
                            : 'w-2 bg-white/50 hover:bg-white/80'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Image Counter Badge */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium z-10 border border-white/10">
                {currentIndex + 1} / {items.length}
            </div>
        </div>
    );
};

export default MediaCarousel;

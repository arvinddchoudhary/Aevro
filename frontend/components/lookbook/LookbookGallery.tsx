'use client';

import { useState } from 'react';

type LookbookCategory = 'all' | 'day-to-day' | 'workwear' | 'weekend';

type LookbookImage = {
  src: string;
  title: string;
  description: string;
  category: LookbookCategory;
};

type LookbookGalleryProps = {
  images: LookbookImage[];
};

const tabs: { label: string; value: LookbookCategory }[] = [
  { label: 'All looks', value: 'all' },
  { label: 'Day to day', value: 'day-to-day' },
  { label: 'Workwear', value: 'workwear' },
  { label: 'Weekend', value: 'weekend' },
];

export function LookbookGallery({ images }: LookbookGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<LookbookCategory>('all');
  const filteredImages =
    activeCategory === 'all'
      ? images
      : images.filter((image) => image.category === activeCategory);

  return (
    <section className="aevro-container py-12">
      <div className="mb-8 flex flex-wrap justify-center gap-6 text-xs font-medium uppercase tracking-[0.08em] sm:gap-12">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveCategory(tab.value)}
            className={`pb-2 transition ${
              activeCategory === tab.value
                ? 'border-b border-[#111111] text-[#111111]'
                : 'text-[#514c45] hover:text-[#111111]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredImages.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredImages.map((image, index) => (
            <article
              key={image.src}
              className="group overflow-hidden border border-[#ddd4c8] bg-[#fffaf3]"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-[#eee8de]">
                <img
                  src={image.src}
                  alt={image.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="p-4">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-[#111111]">
                  {image.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#514c45]">
                  {image.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center border border-[#ddd4c8] bg-[#eee8de] text-xs uppercase tracking-[0.18em] text-[#777777]">
          No looks found in this category
        </div>
      )}
    </section>
  );
}

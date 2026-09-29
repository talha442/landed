"use client";

import { useState } from "react";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  return (
    <div className="flex flex-col-reverse gap-3 md:sticky md:top-28 md:flex-row md:self-start">
      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto md:flex-col" aria-label="Product images">
          {images.map((src, i) => (
            <li key={src}>
              <button
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                className={`block size-14 overflow-hidden rounded-md border-2 bg-[#f7f8f8] p-1 ${i === active ? "border-link" : "border-line hover:border-[#888c8c]"}`}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={i === active}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-full object-contain mix-blend-multiply" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex-1 rounded-lg bg-[#f7f8f8] p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[active]} alt={title} className="mx-auto aspect-square w-full max-w-[520px] object-contain mix-blend-multiply" />
      </div>
    </div>
  );
}

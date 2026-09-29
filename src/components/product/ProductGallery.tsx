"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Desktop: thumbnails on the side, the main image cross-fades on hover or click.
 * Mobile: a swipeable strip with dots, because tapping tiny thumbnails isn't a thing
 * anyone enjoys.
 */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const strip = useRef<HTMLDivElement>(null);

  return (
    <div className="md:sticky md:top-32 md:self-start">
      {/* Mobile swipe strip */}
      <div className="md:hidden">
        <div
          ref={strip}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-3xl bg-[#f3f2ee] [scrollbar-width:none]"
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(Math.round(el.scrollLeft / el.clientWidth));
          }}
          aria-label={`${name} images`}
        >
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt={i === 0 ? name : `${name}, view ${i + 1}`} className="aspect-square w-full shrink-0 snap-center object-contain p-6 mix-blend-multiply" />
          ))}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active}
                onClick={() => strip.current?.scrollTo({ left: i * strip.current.clientWidth, behavior: "smooth" })}
                className={cn("h-1.5 rounded-full transition-all", i === active ? "w-5 bg-foreground" : "w-1.5 bg-foreground/25")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden gap-4 md:flex">
        {images.length > 1 && (
          <ul className="flex w-16 shrink-0 flex-col gap-2.5" aria-label="Product images">
            {images.map((src, i) => (
              <li key={src}>
                <button
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  aria-label={`Show image ${i + 1} of ${images.length}`}
                  aria-current={i === active}
                  className={cn(
                    "block size-16 overflow-hidden rounded-xl border-2 bg-[#f3f2ee] p-1 transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    i === active ? "border-foreground" : "border-transparent hover:border-border",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="size-full object-contain mix-blend-multiply" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="relative aspect-square flex-1 overflow-hidden rounded-3xl bg-[#f3f2ee]">
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={i === active ? name : ""}
              aria-hidden={i !== active}
              loading={i === 0 ? "eager" : "lazy"}
              className={cn("absolute inset-0 size-full object-contain p-10 mix-blend-multiply transition-opacity duration-300", i === active ? "opacity-100" : "opacity-0")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

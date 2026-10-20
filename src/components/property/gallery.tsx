"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { cn } from "@/lib/utils";

const CAPTION = "Representative photograph — not the actual property";

/** Four-photo mosaic with a keyboard-accessible lightbox (←/→/Esc). */
export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const n = images.length;
  const go = useCallback((d: number) => setOpen((i) => (i == null ? i : (i + d + n) % n)), [n]);

  useEffect(() => {
    if (open == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go]);

  const tiles = ["col-span-4 row-span-2 sm:col-span-2", "hidden sm:block", "hidden sm:block", "hidden sm:col-span-2 sm:block"];

  return (
    <>
      <div className="relative grid h-[300px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl sm:h-[440px] lg:h-[500px]">
        {images.slice(0, 4).map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setOpen(i)}
            className={cn("group relative overflow-hidden bg-mint", tiles[i])}
            aria-label={`Open photo ${i + 1} of ${n}`}
          >
            <Image
              src={src}
              alt={`${title} — ${CAPTION.toLowerCase()} ${i + 1}`}
              fill
              priority={i === 0}
              sizes={i === 0 ? "(min-width: 640px) 50vw, 100vw" : "25vw"}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <span className="absolute inset-0 bg-emerald/0 transition-colors group-hover:bg-emerald/10" />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpen(0)}
          className="absolute bottom-4 right-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-white/95 px-4 font-sans text-sm font-semibold text-emerald shadow-raised backdrop-blur hover:bg-white"
        >
          <Images className="h-4 w-4" /> View {n} photos
        </button>
        <span className="pointer-events-none absolute bottom-4 left-4 hidden rounded-full sm:block bg-black/40 px-3 py-1 font-sans text-[11px] text-white backdrop-blur">{CAPTION}</span>
      </div>

      {open != null ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[#06120f]/95 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${title} photos`}>
          <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
            <p className="tabular font-sans text-sm text-white/70">{open + 1} / {n} · {CAPTION}</p>
            <button type="button" onClick={() => setOpen(null)} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10" aria-label="Close gallery" autoFocus>
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="relative flex-1">
            <Image src={images[open]} alt={`${title} — ${CAPTION.toLowerCase()}`} fill sizes="100vw" className="object-contain" />
            <button type="button" onClick={() => go(-1)} className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6" aria-label="Previous photo">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button type="button" onClick={() => go(1)} className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6" aria-label="Next photo">
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
          <div className="flex justify-center gap-2 overflow-x-auto px-4 py-4">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setOpen(i)}
                className={cn("relative h-14 w-20 shrink-0 overflow-hidden rounded-lg ring-2", i === open ? "ring-gold" : "opacity-60 ring-transparent hover:opacity-100")}
                aria-label={`Show photo ${i + 1}`}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

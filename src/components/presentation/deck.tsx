"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, X, StickyNote, Maximize2 } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { StageBadge } from "@/components/site/stage-badge";
import { cn } from "@/lib/utils";
import { SLIDES, DeepLink } from "./slides";

/** Representative photography behind each slide, in slide order (Pexels, see public/images/CREDITS.md). */
const BACKDROPS = ["/images/street.webp", "/images/hero-door.webp", "/images/fanlight.webp", "/images/cork-1.webp", "/images/lim-1.webp", "/images/d8-2.webp", "/images/d8-1.webp", "/images/galway-1.webp", "/images/cork-4.webp", "/images/reno.webp", "/images/lim-2.webp", "/images/hero-door.webp"];

export function Deck({ exitHref }: { exitHref: string }) {
  const [i, setI] = useState(0);
  const [notes, setNotes] = useState(false);
  const router = useRouter();
  const reduce = useReducedMotion();
  const slide = SLIDES[i];
  const n = SLIDES.length;

  const go = useCallback((d: number) => setI((x) => Math.min(n - 1, Math.max(0, x + d))), [n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
      else if (e.key === "Escape") router.push(exitHref);
      else if (e.key.toLowerCase() === "n") setNotes((v) => !v);
      else if (e.key === "Home") setI(0);
      else if (e.key === "End") setI(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, router, exitHref, n]);

  const fullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  };

  return (
    <div className="relative isolate flex min-h-[calc(100dvh-40px)] flex-col overflow-hidden bg-emerald text-white">
      <AnimatePresence initial={false}>
        <motion.div key={BACKDROPS[i % BACKDROPS.length]} className="absolute inset-0 -z-10" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.5 }} aria-hidden>
          <Image src={BACKDROPS[i % BACKDROPS.length]} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald via-emerald/90 to-emerald/60" />
        </motion.div>
      </AnimatePresence>
      <div className="h-1.5 w-full bg-white/10" role="progressbar" aria-valuemin={1} aria-valuemax={n} aria-valuenow={i + 1} aria-label="Slide progress">
        <div className="h-full bg-gold transition-all" style={{ width: `${((i + 1) / n) * 100}%` }} />
      </div>
      <header className="flex items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <Logo inverse />
        <div className="flex items-center gap-2">
          <StageBadge stage={slide.stage} className="!bg-white/15 !text-white" />
          <span className="tabular hidden font-sans text-sm text-white/70 sm:inline">{i + 1} / {n}</span>
          <button type="button" onClick={() => setNotes(!notes)} className={cn("flex h-11 w-11 items-center justify-center rounded-xl hover:bg-white/10", notes && "bg-white/15")} aria-pressed={notes} aria-label="Toggle speaker notes (N)"><StickyNote className="h-5 w-5" /></button>
          <button type="button" onClick={fullscreen} className="hidden h-11 w-11 items-center justify-center rounded-xl hover:bg-white/10 sm:flex" aria-label="Toggle full screen"><Maximize2 className="h-5 w-5" /></button>
          <button type="button" onClick={() => router.push(exitHref)} className="flex h-11 items-center gap-1 rounded-xl px-3 font-sans text-sm font-semibold hover:bg-white/10" aria-label="Exit presentation (Esc)"><X className="h-5 w-5" /> Exit</button>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-4 py-6 sm:px-8 lg:px-16" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={slide.id}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
            className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center"
          >
            <p className="font-sans text-sm font-semibold uppercase tracking-[0.08em] text-gold">{slide.kicker}</p>
            <h1 className="mt-3 max-w-4xl font-serif text-3xl font-medium leading-tight tracking-tight sm:text-5xl">{slide.title}</h1>
            <div className="mt-8">{slide.body}</div>
            {slide.deepLink ? <div className="mt-8"><DeepLink href={slide.deepLink.href} label={slide.deepLink.label} /></div> : null}
          </motion.section>
        </AnimatePresence>
        {notes ? (
          <aside className="mx-auto mt-6 w-full max-w-6xl rounded-2xl border border-gold/40 bg-black/25 p-4 text-sm text-white/85" aria-label="Speaker notes">
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-gold">Speaker notes</p>
            <p className="mt-1 leading-relaxed">{slide.notes}</p>
          </aside>
        ) : null}
      </main>

      <footer className="flex items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <button type="button" onClick={() => go(-1)} disabled={i === 0} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 px-4 font-sans text-sm font-semibold disabled:opacity-40"><ArrowLeft className="h-4 w-4" /> Previous</button>
        <div className="hidden gap-1 sm:flex" aria-hidden>
          {SLIDES.map((s, k) => <button key={s.id} type="button" onClick={() => setI(k)} className={cn("h-2.5 w-2.5 rounded-full", k === i ? "bg-gold" : "bg-white/25 hover:bg-white/50")} aria-label={`Go to slide ${k + 1}`} />)}
        </div>
        <p className="hidden text-xs text-white/50 md:block">← → navigate · N notes · Esc exit</p>
        <button type="button" onClick={() => go(1)} disabled={i === n - 1} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 font-sans text-sm font-semibold text-emerald disabled:opacity-40">Next <ArrowRight className="h-4 w-4" /></button>
      </footer>
    </div>
  );
}

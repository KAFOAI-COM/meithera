import Image from "next/image";
import { FlaskConical } from "lucide-react";

/** Split layout for /login and /register: photography on the left, form on the right. */
export function AuthShell({ children, quote }: { children: React.ReactNode; quote: string }) {
  return (
    <div className="mx-auto grid max-w-7xl gap-0 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:py-16">
      <div className="relative hidden min-h-[640px] overflow-hidden rounded-3xl lg:block">
        <Image src="/images/hero-door.webp" alt="" fill sizes="45vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald via-emerald/50 to-emerald/10" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-white">
          <span className="block h-px w-10 bg-gold" />
          <p className="mt-5 font-serif text-3xl leading-snug">{quote}</p>
          <p className="mt-5 flex items-center gap-2 text-sm text-white/70"><FlaskConical className="h-4 w-4" /> Every persona is fictional. Nothing you do here is real.</p>
        </div>
      </div>
      <div className="py-4 lg:py-8">{children}</div>
    </div>
  );
}

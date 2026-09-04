import Link from "next/link";
import Image from "next/image";

export function HomeHero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Full-width banner image */}
      <Image
        src="/memorial-day-hero.jpg"
        alt="Memorial Day Sale — Buy 1 Get 1 Free"
        width={1200}
        height={675}
        priority
        style={{ width: "100%", height: "auto", display: "block" }}
      />

      {/* CTA button — centered, overlaid at the bottom */}
      <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 left-0 right-0 flex justify-center">
        <Link
          href="/products"
          className="rounded-full h-12 px-10 text-sm font-semibold uppercase tracking-[0.12em] flex items-center justify-center shadow-lg bg-[#14274E] text-[#F1F6F9] hover:bg-[#0f1d3b] transition-all duration-300"
        >
          Shop the Sale →
        </Link>
      </div>
    </section>
  );
}

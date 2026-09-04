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

      {/* CTA button — bottom-left, aligned with banner text */}
      <div className="absolute bottom-[12%] left-[4%] sm:left-[5%] md:left-[6%]">
        <Link
          href="/products"
          className="rounded-md h-12 px-8 text-sm font-bold uppercase tracking-[0.15em] flex items-center justify-center shadow-lg bg-[#14274E] text-[#F1F6F9] hover:bg-[#0f1d3b] transition-all duration-300"
        >
          Shop the Sale →
        </Link>
      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";

export function HomeHero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Whole banner is clickable */}
      <Link href="/products" className="block w-full">
        <Image
          src="/memorial-day-hero.jpg"
          alt="Memorial Day Sale — Buy 1 Get 1 Free"
          width={1200}
          height={675}
          priority
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </Link>

      {/* Visible button overlaid bottom-left */}
      <div className="absolute bottom-[8%] left-[5%] pointer-events-none">
        <span className="inline-flex items-center justify-center rounded-full bg-[#14274E] text-white text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] px-5 py-2 sm:px-6 sm:py-2.5 shadow-md">
          Shop the Sale →
        </span>
      </div>
    </section>
  );
}

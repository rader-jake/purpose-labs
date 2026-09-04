import Link from "next/link";
import Image from "next/image";

export function HomeHero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Entire banner is clickable — image already has "Shop the Sale" baked in */}
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
    </section>
  );
}

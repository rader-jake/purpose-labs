import Link from "next/link";
import Image from "next/image";

export function HomeHero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Entire banner links to the catalog — button is baked into the image */}
      <Link href="/products" className="block w-full cursor-pointer">
        <Image
          src="/memorial-day-hero-v2.jpg"
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

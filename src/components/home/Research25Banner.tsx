import Image from "next/image";
import Link from "next/link";

export function Research25Banner() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: "#EDE8E0" }}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="flex flex-col items-center justify-between gap-6 py-12 md:flex-row md:py-16 lg:py-20">

          {/* Left — Copy */}
          <div className="flex flex-col items-start gap-4 md:max-w-lg">
            <p
              className="text-xs font-bold uppercase tracking-[0.25em]"
              style={{ color: "#1B2A4A", opacity: 0.6 }}
            >
              A little extra for your research
            </p>

            <h2
              className="text-5xl font-black uppercase tracking-tight sm:text-6xl lg:text-7xl"
              style={{
                color: "#1B2A4A",
                fontFamily: "var(--pl-font-display)",
                lineHeight: 1.0,
              }}
            >
              Take 25% Off
            </h2>

            {/* Code pill */}
            <div
              className="flex items-center gap-2 rounded-full border-2 px-6 py-3"
              style={{ borderColor: "#1B2A4A" }}
            >
              <span
                className="text-sm uppercase tracking-[0.18em]"
                style={{ color: "#1B2A4A" }}
              >
                Code:
              </span>
              <span
                className="text-sm font-black uppercase tracking-[0.18em]"
                style={{ color: "#1B2A4A" }}
              >
                RESEARCH25
              </span>
            </div>

            <p
              className="text-xs font-medium uppercase tracking-[0.18em]"
              style={{ color: "#1B2A4A", opacity: 0.5 }}
            >
              Apply at checkout
            </p>

            <Link
              href="/products"
              className="mt-2 rounded-full px-8 py-3 text-xs font-black uppercase tracking-[0.15em] text-white transition-opacity duration-200 hover:opacity-85"
              style={{ backgroundColor: "#1B2A4A" }}
            >
              Shop Now →
            </Link>
          </div>

          {/* Right — Kit image */}
          <div className="relative w-full max-w-sm shrink-0 md:max-w-md lg:max-w-lg">
            <Image
              src="/images/pl-box.jpg"
              alt="Purpose Labs Research Supply Kit"
              width={640}
              height={420}
              className="h-auto w-full object-contain drop-shadow-xl"
              priority={false}
            />
          </div>

        </div>
      </div>
    </section>
  );
}

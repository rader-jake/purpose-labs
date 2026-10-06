import Image from "next/image";
import Link from "next/link";

const STEPS = [
  {
    number: "01",
    title: "Add Any Vial to Cart",
    description: "Browse our catalog and add any peptide vial to your cart.",
  },
  {
    number: "02",
    title: "Claim Your Free Pick",
    description: "A green banner appears in your cart — click it to choose your free vial.",
  },
  {
    number: "03",
    title: "Mix & Match Any Tier",
    description: "Pick any vial from the same tier as your paid item. It ships free in the same box.",
  },
];

export function HowToClaimFreeVial() {
  return (
    <section
      className="relative overflow-hidden py-16 md:py-20"
      style={{ backgroundColor: "#F1F6F9" }}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">

          {/* Left — Steps */}
          <div className="flex flex-1 flex-col gap-8">
            <div>
              <p
                className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em]"
                style={{ color: "#1B2A4A", opacity: 0.5 }}
              >
                It&apos;s that simple
              </p>
              <h2
                className="text-4xl font-black uppercase tracking-tight sm:text-5xl"
                style={{
                  color: "#1B2A4A",
                  fontFamily: "var(--pl-font-display)",
                  lineHeight: 1.05,
                }}
              >
                How to Claim<br />Your Free Vial
              </h2>
            </div>

            <div className="flex flex-col gap-6">
              {STEPS.map((step) => (
                <div key={step.number} className="flex items-start gap-5">
                  <span
                    className="shrink-0 text-4xl font-black leading-none"
                    style={{ color: "#1B2A4A", opacity: 0.12, fontFamily: "var(--pl-font-display)" }}
                  >
                    {step.number}
                  </span>
                  <div>
                    <p
                      className="mb-1 text-sm font-bold uppercase tracking-wide"
                      style={{ color: "#1B2A4A" }}
                    >
                      {step.title}
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "#1B2A4A", opacity: 0.6 }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/products"
              className="inline-flex w-fit items-center gap-2 rounded-full px-8 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-opacity duration-200 hover:opacity-85"
              style={{ background: "linear-gradient(90deg, #0B1728 0%, #2E4A8A 100%)" }}
            >
              Shop Now →
            </Link>
          </div>

          {/* Right — Floating box image */}
          <div className="relative flex flex-1 items-center justify-center">
            <style>{`
              @keyframes box-float {
                0%, 100% { transform: translateY(0px); }
                50%       { transform: translateY(-16px); }
              }
              .kit-box-img {
                animation: box-float 6s ease-in-out infinite;
                mix-blend-mode: multiply;
                filter: drop-shadow(0 20px 40px rgba(27,42,74,0.12));
                max-width: 480px;
                width: 100%;
                height: auto;
                object-fit: contain;
              }
            `}</style>
            <Image
              src="/pl-research-kit-box.jpg"
              alt="Purpose Labs Research Supply Kit"
              width={580}
              height={440}
              className="kit-box-img"
              priority={false}
            />
          </div>

        </div>
      </div>
    </section>
  );
}

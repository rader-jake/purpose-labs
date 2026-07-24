// src/app/about/page.tsx

const STATS = [
  { label: "Purity Guarantee", value: "≥99%" },
  { label: "Batches Tested", value: "100%" },
  { label: "Dispatch Time", value: "48HR" },
  { label: "Based In", value: "USA" },
];

const VALUES = [
  {
    number: "01",
    title: "Purity First",
    text: "Every compound is independently verified to ≥99% purity. No exceptions, no shortcuts.",
  },
  {
    number: "02",
    title: "Full Transparency",
    text: "Batch-specific COAs published for every product. Verify what you're working with before it arrives.",
  },
  {
    number: "03",
    title: "Research Grade",
    text: "Built for serious laboratory and pre-clinical research. Not mass-market supplements — precision compounds.",
  },
];

export default function AboutPage() {
  return (
    <main style={{ fontFamily: "var(--pl-font-body)" }}>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center sm:px-10">
        <p
          className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--pl-slate)" }}
        >
          Who We Are
        </p>
        <h1
          className="mb-6 text-5xl sm:text-6xl"
          style={{
            color: "var(--pl-navy)",
            fontFamily: "var(--pl-font-display)",
            fontWeight: 500,
          }}
        >
          Purpose Labs
        </h1>
        <p
          className="mx-auto max-w-xl text-base leading-relaxed"
          style={{ color: "var(--pl-text-secondary)" }}
        >
          A research chemical supplier built on one principle —
          uncompromising quality for serious researchers.
        </p>
      </section>

      {/* Mission */}
      <section
        className="px-6 py-20 sm:px-10"
        style={{ backgroundColor: "var(--pl-ivory-soft)" }}
      >
        <div className="mx-auto max-w-3xl">
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--pl-slate)" }}
          >
            Our Mission
          </p>
          <h2
            className="mb-6 text-3xl sm:text-4xl"
            style={{
              color: "var(--pl-navy)",
              fontFamily: "var(--pl-font-display)",
              fontWeight: 500,
            }}
          >
            Precision Chemistry. No Compromises.
          </h2>
          <p
            className="mb-4 text-sm leading-relaxed"
            style={{ color: "var(--pl-text-secondary)" }}
          >
            Purpose Labs was founded with a single focus — to provide
            researchers with the highest quality peptides and research
            compounds available. We believe that the integrity of your
            research starts with the integrity of your materials.
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--pl-text-secondary)" }}
          >
            Every product we carry is independently verified by third-party
            laboratories using HPLC and FTIR analysis. We publish
            batch-specific Certificates of Analysis for every product —
            because transparency isn&rsquo;t optional, it&rsquo;s the
            standard.
          </p>
        </div>
      </section>

      {/* By the numbers */}
      <section className="px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <p
            className="mb-10 text-center text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--pl-slate)" }}
          >
            By The Numbers
          </p>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="mb-2 text-4xl sm:text-5xl"
                  style={{
                    color: "var(--pl-navy)",
                    fontFamily: "var(--pl-font-display)",
                    fontWeight: 500,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-xs uppercase tracking-[0.08em]"
                  style={{ color: "var(--pl-muted)" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we stand for */}
      <section
        className="px-6 py-20 sm:px-10"
        style={{ backgroundColor: "var(--pl-ivory-soft)" }}
      >
        <div className="mx-auto max-w-5xl">
          <p
            className="mb-10 text-center text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--pl-slate)" }}
          >
            What We Stand For
          </p>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.number}>
                <p
                  className="mb-3 text-xs font-semibold"
                  style={{ color: "var(--pl-muted)" }}
                >
                  {v.number}
                </p>
                <h3
                  className="mb-3 text-xl"
                  style={{
                    color: "var(--pl-navy)",
                    fontFamily: "var(--pl-font-display)",
                    fontWeight: 500,
                  }}
                >
                  {v.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--pl-text-secondary)" }}
                >
                  {v.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

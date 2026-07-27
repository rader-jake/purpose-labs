import { COA_DIRECTORY, COA_STATS } from "@/lib/coaDirectory";

export default function QualityPage() {
  return (
    <main style={{ fontFamily: "var(--pl-font-body)" }}>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center sm:px-10">
        <p
          className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--pl-slate)" }}
        >
          Third-Party Verified
        </p>
        <h1
          className="mb-6 text-5xl sm:text-6xl"
          style={{
            color: "var(--pl-navy)",
            fontFamily: "var(--pl-font-display)",
            fontWeight: 500,
          }}
        >
          Quality &amp; COAs
        </h1>
        <p
          className="mx-auto max-w-xl text-base leading-relaxed"
          style={{ color: "var(--pl-text-secondary)" }}
        >
          Every batch independently tested by third-party labs. FTIR + HPLC
          analysis. ≥99% purity guaranteed.
        </p>
      </section>

      {/* Stats strip */}
      <section
        className="border-y"
        style={{
          borderColor: "var(--pl-border)",
          backgroundColor: "var(--pl-ivory-soft)",
        }}
      >
        <div className="mx-auto grid max-w-5xl grid-cols-2 sm:grid-cols-4">
          {COA_STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="px-6 py-8 text-center"
              style={{
                borderRight:
                  i < COA_STATS.length - 1
                    ? "1px solid var(--pl-border)"
                    : "none",
              }}
            >
              <p
                className="text-3xl"
                style={{
                  color: "var(--pl-navy)",
                  fontFamily: "var(--pl-font-display)",
                  fontWeight: 500,
                }}
              >
                {stat.value}
              </p>
              <p
                className="mt-1 text-[10px] uppercase tracking-[0.14em]"
                style={{ color: "var(--pl-muted)" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* COA grid */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <p
          className="mb-8 text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--pl-slate)" }}
        >
          Batch Certificates
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COA_DIRECTORY.map((entry) => (
            <CoaCard key={entry.slug} entry={entry} />
          ))}
        </div>
      </section>
    </main>
  );
}

function CoaCard({
  entry,
}: {
  entry: (typeof COA_DIRECTORY)[number];
}) {
  return (
    <div
      className="flex flex-col gap-4 rounded-lg border border-t-[3px] p-8 transition-all duration-200 hover:shadow-lg"
      style={{
        borderColor: "var(--pl-border)",
        borderTopColor: "var(--pl-navy)",
        backgroundColor: "var(--pl-white)",
      }}
    >
      <p
        className="text-[9px] font-semibold uppercase tracking-[0.24em]"
        style={{ color: "var(--pl-navy)" }}
      >
        {entry.lab}
      </p>

      <h3
        className="text-2xl leading-tight"
        style={{
          color: "var(--pl-navy)",
          fontFamily: "var(--pl-font-display)",
          fontWeight: 500,
        }}
      >
        {entry.title}
      </h3>

      <div
        className="flex flex-col gap-1 text-[10px] uppercase tracking-[0.1em] leading-relaxed"
        style={{ color: "var(--pl-muted)" }}
      >
        <span>Purity: {entry.purity}</span>
        {entry.method && <span>Method: {entry.method}</span>}
        {entry.storage && <span>Storage: {entry.storage}</span>}
        {entry.lot && <span>Lot: {entry.lot}</span>}
        {entry.endotoxinTested && (
          <span style={{ color: "var(--pl-navy)", fontWeight: 600 }}>
            Endotoxin Tested ✔
          </span>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        {entry.docs.map((doc) => (
          <a
            key={doc.url}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200 hover:bg-[rgba(20,39,78,0.06)]"
            style={{
              borderColor: "var(--pl-border-strong)",
              color: "var(--pl-navy)",
            }}
          >
            {doc.label} →
          </a>
        ))}
      </div>
    </div>
  );
}

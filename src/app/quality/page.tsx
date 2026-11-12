import Image from "next/image";
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

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
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
  const primaryDoc = entry.docs[0];
  const extraDocs = entry.docs.slice(1);

  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      style={{
        borderColor: "var(--pl-border)",
        backgroundColor: "var(--pl-white)",
      }}
    >
      {/* Product image area */}
      <div
        className="relative flex items-center justify-center px-6 py-8"
        style={{ backgroundColor: "#F7F8FA", minHeight: 180 }}
      >
        {/* Purity badge — top right */}
        <span
          className="absolute top-3 right-3 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]"
          style={{
            backgroundColor: "rgba(16,185,129,0.12)",
            color: "#059669",
            border: "1px solid rgba(16,185,129,0.3)",
          }}
        >
          {entry.purity}
        </span>

        {entry.image ? (
          <Image
            src={entry.image}
            alt={entry.title}
            width={120}
            height={160}
            className="object-contain drop-shadow-md"
            style={{ maxHeight: 160 }}
          />
        ) : (
          <div
            className="flex h-32 w-20 items-center justify-center rounded-lg text-xs"
            style={{
              backgroundColor: "var(--pl-border)",
              color: "var(--pl-muted)",
            }}
          >
            No image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 px-4 py-4">
        <p
          className="text-[8px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--pl-slate)" }}
        >
          {entry.lab}
        </p>

        <h3
          className="text-sm font-bold leading-tight whitespace-pre-line"
          style={{ color: "var(--pl-navy)" }}
        >
          {entry.title}
        </h3>

        <div
          className="flex flex-wrap gap-1 text-[8px] uppercase tracking-[0.08em]"
          style={{ color: "var(--pl-muted)" }}
        >
          {entry.method && <span>{entry.method}</span>}
          {entry.lot && (
            <>
              <span>·</span>
              <span>Lot: {entry.lot}</span>
            </>
          )}
        </div>

        {(entry.endotoxinTested || entry.sevenXTested) && (
          <div className="flex flex-wrap gap-1">
            {entry.endotoxinTested && (
              <span
                className="rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em]"
                style={{
                  backgroundColor: "rgba(27,42,74,0.07)",
                  color: "var(--pl-navy)",
                }}
              >
                Endotoxin ✔
              </span>
            )}
            {entry.sevenXTested && (
              <span
                className="rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em]"
                style={{
                  backgroundColor: "rgba(27,42,74,0.07)",
                  color: "var(--pl-navy)",
                }}
              >
                7X Tested ✔
              </span>
            )}
          </div>
        )}

        {/* CTA buttons */}
        <div className="mt-auto flex flex-col gap-2 pt-3">
          <a
            href={primaryDoc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-lg py-2.5 text-center text-[10px] font-black uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-85"
            style={{ backgroundColor: "var(--pl-navy)" }}
          >
            View COA →
          </a>

          {extraDocs.map((doc) => (
            <a
              key={doc.url}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-lg border py-2 text-center text-[9px] font-semibold uppercase tracking-[0.1em] transition-colors hover:bg-[rgba(27,42,74,0.05)]"
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
    </div>
  );
}

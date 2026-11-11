import { Reveal } from "./Reveal";

const ROWS = [
  {
    feature: "Purity reporting",
    purposeLabs: "Exact batch value",
    others: "Specification only",
  },
  {
    feature: "Independent testing",
    purposeLabs: "Every batch",
    others: "Periodic or in-house",
  },
  {
    feature: "Documentation",
    purposeLabs: "COA + chromatogram",
    others: "On request",
  },
  {
    feature: "Traceability",
    purposeLabs: "1:1 lot match",
    others: "Generic label",
  },
  {
    feature: "Shipping",
    purposeLabs: "FedEx 2Day",
    others: "Varies",
  },
  {
    feature: "Catalogue",
    purposeLabs: "Vetted compounds",
    others: "Hundreds of variants",
  },
];

export function ComparisonTable() {
  return (
    <section
      className="bg-white py-16 md:py-24"
      style={{ fontFamily: "var(--pl-font-body)" }}
    >
      <div className="mx-auto max-w-4xl px-6 sm:px-10">
        <Reveal>
          <div className="mb-10 text-center">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
              style={{ color: "#6C7688" }}
            >
              Why Purpose Labs
            </p>
            <h2
              className="font-black tracking-tight mb-3"
              style={{
                color: "#14274E",
                fontFamily: "var(--pl-font-display)",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                lineHeight: 1.1,
              }}
            >
              The Difference, Line by Line.
            </h2>
            <p className="text-sm" style={{ color: "#6C7688" }}>
              Same molecules. Different standards. We choose better.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid rgba(20,39,78,0.10)" }}>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ background: "#14274E" }}>
                  <th
                    className="py-4 px-5 text-left text-[10px] font-bold uppercase tracking-[0.16em]"
                    style={{ color: "rgba(255,255,255,0.6)", width: "34%" }}
                  >
                    Feature
                  </th>
                  <th
                    className="py-4 px-5 text-left text-[10px] font-bold uppercase tracking-[0.16em]"
                    style={{ color: "#ffffff", width: "33%" }}
                  >
                    Purpose Labs
                  </th>
                  <th
                    className="py-4 px-5 text-left text-[10px] font-bold uppercase tracking-[0.16em]"
                    style={{ color: "rgba(255,255,255,0.6)", width: "33%" }}
                  >
                    Other Sources
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, idx) => (
                  <tr
                    key={row.feature}
                    style={{
                      background: idx % 2 === 0 ? "#ffffff" : "#F8FAFC",
                      borderBottom: "1px solid rgba(20,39,78,0.06)",
                    }}
                  >
                    <td
                      className="py-4 px-5 text-xs font-semibold"
                      style={{ color: "#14274E" }}
                    >
                      {row.feature}
                    </td>
                    <td className="py-4 px-5 text-xs font-medium" style={{ color: "#15803d" }}>
                      <span className="mr-2 font-black">✓</span>
                      {row.purposeLabs}
                    </td>
                    <td className="py-4 px-5 text-xs" style={{ color: "#9ca3af" }}>
                      <span className="mr-2">✗</span>
                      {row.others}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

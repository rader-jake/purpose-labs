import { Reveal } from "./Reveal";

const STEPS = [
  {
    number: "01",
    status: "Verified",
    title: "ORDER PLACED",
    description: "Research credentials checked, lot reserved against your order.",
  },
  {
    number: "02",
    status: "Picked",
    title: "PULLED FROM COLD",
    description: "Vials matched to the certificate on file for your lot.",
  },
  {
    number: "03",
    status: "Sealed",
    title: "PACKED COLD",
    description: "Lyophilized powder, sealed tamper-evident in plain packaging.",
  },
  {
    number: "04",
    status: "Tracked",
    title: "IN TRANSIT",
    description: "Dispatched with tracking and COA documentation for your exact lot.",
  },
];

export function ProcessSteps() {
  return (
    <section
      className="bg-[#F8FAFC] py-16 md:py-24"
      style={{ fontFamily: "var(--pl-font-body)" }}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <Reveal>
          <div className="mb-12 text-center">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2"
              style={{ color: "#6C7688" }}
            >
              How It Works
            </p>
            <h2
              className="font-black tracking-tight"
              style={{
                color: "#14274E",
                fontFamily: "var(--pl-font-display)",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                lineHeight: 1.1,
              }}
            >
              Four Steps. Fully Documented.
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, idx) => (
            <Reveal key={step.number} delay={idx * 100}>
              <div
                className="rounded-2xl bg-white p-6 h-full"
                style={{ border: "1px solid rgba(20,39,78,0.08)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="font-black"
                    style={{
                      fontSize: "2rem",
                      color: "#14274E",
                      lineHeight: 1,
                      opacity: 0.15,
                    }}
                  >
                    {step.number}
                  </span>
                  <span
                    className="rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em]"
                    style={{
                      background: "rgba(20,39,78,0.06)",
                      color: "#14274E",
                    }}
                  >
                    {step.status}
                  </span>
                </div>
                <p
                  className="text-[10px] font-black uppercase tracking-[0.18em] mb-2"
                  style={{ color: "#14274E" }}
                >
                  {step.title}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#6C7688" }}>
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

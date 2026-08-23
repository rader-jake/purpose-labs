import { FaqAccordion } from "@/components/FaqAccordion";

const SECTIONS = [
  {
    heading: "Products",
    items: [
      {
        question: "What are peptides?",
        answer:
          "Peptides are short chains of amino acids — the building blocks of proteins. They occur naturally in the body and play key roles in cellular signaling, tissue repair, and metabolic function. Our peptides are synthetic research-grade compounds used exclusively for laboratory and pre-clinical research purposes.",
      },
      {
        question: "What purity levels do your products have?",
        answer:
          "All Purpose Labs products are ≥99% purity, verified by independent third-party HPLC and FTIR analysis through BT Labs. Every batch receives its own Certificate of Analysis (COA), viewable directly on each product page.",
      },
      {
        question: "What form do the peptides come in?",
        answer:
          "Our peptides are supplied in lyophilized (freeze-dried) powder form in sealed vials. This format ensures maximum stability during storage and shipping. Reconstitution water is required for reconstitution and is available separately in our store.",
      },
      {
        question: "How should peptides be stored?",
        answer:
          "Lyophilized peptides should be stored at −20°C (in a freezer) and kept away from light and moisture. Once reconstituted with reconstitution water, store at 4°C (refrigerated) and use within 30 days for optimal stability.",
      },
    ],
  },
  {
    heading: "Ordering",
    items: [
      {
        question: "Do you offer free shipping?",
        answer:
          "Yes — we offer free shipping on all orders over $200. Orders are processed and shipped within 48 hours from our US-based facility.",
      },
      {
        question: "Where do you ship?",
        answer:
          "We currently ship within the United States. All products are dispatched from our US facility. International shipping availability may vary — contact us for more information.",
      },
      {
        question: "What is your refund policy?",
        answer:
          "Due to the nature of research chemicals and strict quality control requirements, we do not accept returns on opened products. If your order arrives damaged or incorrect, please contact us within 48 hours of delivery and we will make it right.",
      },
      {
        question: "How long does shipping take?",
        answer:
          "Orders are processed within 48 hours. Standard shipping typically takes 3–5 business days within the continental US. Expedited options may be available at checkout.",
      },
    ],
  },
  {
    heading: "Research & Legal",
    items: [
      {
        question: "Are these products for human consumption?",
        answer:
          "No. All products sold by Purpose Labs are strictly for laboratory research use only and are not intended for human or animal consumption. By purchasing, you confirm that you are a qualified researcher and will use products in compliance with all applicable laws and regulations.",
      },
      {
        question: "Are your products independently tested and certified?",
        answer:
          "No. Our products have not been evaluated or approved by the FDA. They are not intended to diagnose, treat, cure, or prevent any disease. Purpose Labs operates as a chemical supplier for research purposes only, not as a pharmacy or medical provider.",
      },
      {
        question: "How do I verify product quality?",
        answer: (
          <>
            Every batch comes with a Certificate of Analysis (COA) from BT
            Labs, an independent third-party testing facility. COAs confirm
            purity via HPLC and FTIR analysis. You can view COAs directly on
            each product page, or on our{" "}
            <a
              href="/quality"
              className="underline"
              style={{ color: "var(--pl-navy)" }}
            >
              Quality & COAs page
            </a>
            .
          </>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main
      className="mx-auto max-w-3xl px-6 py-20 sm:px-10"
      style={{ fontFamily: "var(--pl-font-body)" }}
    >
      <p
        className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: "var(--pl-slate)" }}
      >
        Got Questions
      </p>
      <h1
        className="mb-4 text-5xl sm:text-6xl"
        style={{
          color: "var(--pl-navy)",
          fontFamily: "var(--pl-font-display)",
          fontWeight: 500,
        }}
      >
        Frequently Asked
      </h1>
      <p
        className="mb-16 max-w-md text-sm leading-relaxed"
        style={{ color: "var(--pl-text-secondary)" }}
      >
        Everything you need to know about our products, ordering, and
        research use policies.
      </p>

      {SECTIONS.map((section) => (
        <div key={section.heading} className="mb-14 last:mb-0">
          <p
            className="mb-2 border-b pb-4 text-xs font-semibold uppercase tracking-[0.14em]"
            style={{
              color: "var(--pl-navy)",
              borderColor: "var(--pl-border)",
            }}
          >
            {section.heading}
          </p>
          <FaqAccordion items={section.items} />
        </div>
      ))}
    </main>
  );
}

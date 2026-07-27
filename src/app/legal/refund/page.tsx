// src/app/legal/refund/page.tsx

import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { Section } from "@/components/legal/Section";
import { Callout } from "@/components/legal/Callout";

const TOC = [
  { id: "philosophy", label: "Our Philosophy" },
  { id: "all-sales-final", label: "All Sales Final" },
  { id: "when-we-cover", label: "When We Make It Right" },
  { id: "not-covered", label: "What We Can't Cover" },
  { id: "how-to-request", label: "How To Request Help" },
  { id: "damaged", label: "Damaged Orders" },
  { id: "lost", label: "Lost Shipments" },
  { id: "timeframes", label: "Timeframes" },
  { id: "contact", label: "Contact Us" },
];

const COVERED = [
  "Order arrived damaged or broken",
  "Wrong product was shipped",
  "Product was missing from your order",
  "Order never arrived (confirmed lost)",
  "Significant quality deviation from COA",
  "Packaging was compromised or tampered",
  "Duplicate charge or billing error",
];

const NOT_COVERED = [
  "Changed your mind after ordering",
  "Ordered the wrong product",
  "Product didn't meet personal expectations",
  "Improper storage by customer",
  "Request made after 48-hour window",
  "Opened product with no issue reported",
  "International customs delays or seizures",
];

const STEPS = [
  {
    step: "Step 1",
    text: "Email us at info@purposelabs.shop within 48 hours of delivery",
  },
  {
    step: "Step 2",
    text: "Include your order number and a description of the issue",
  },
  {
    step: "Step 3",
    text: "Attach photos of any damage, incorrect items, or packaging issues",
  },
  { step: "Step 4", text: "We'll respond within 24 hours with a resolution" },
  {
    step: "Step 5",
    text: "Replacement shipped within 48 hours or refund processed within 3-5 business days",
  },
];

const TIMEFRAMES = [
  { label: "Report window", value: "Issues must be reported within 48 hours of confirmed delivery" },
  { label: "Our response time", value: "Within 24 hours of your email" },
  { label: "Replacement shipping", value: "Within 48 hours of issue confirmation" },
  { label: "Refund processing", value: "3–5 business days to your original payment method" },
  { label: "Tagada refunds", value: "May take an additional 5–10 business days to appear depending on your bank" },
];

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund & Returns Policy"
      metaLine="Purpose Labs LLC · Last Updated: April 2026 · Effective Date: January 2026"
      tocItems={TOC}
    >
      <Section id="philosophy" number="01" title="Our Philosophy">
        <p>
          At Purpose Labs, we&rsquo;re in the business of making sure our
          customers are taken care of. We stand behind the quality of every
          product we ship — every batch is independently verified to ≥99%
          purity with batch-specific COAs available for review before you
          order.
        </p>
        <p>
          Due to the nature of research-grade peptides and strict regulatory
          requirements around chemical compounds, we maintain an
          all-sales-final policy. However, if something goes wrong on our
          end — a damaged shipment, an incorrect order, a quality issue — we
          will always make it right. No questions asked.
        </p>
        <Callout label="Our Promise">
          If we made a mistake or your order arrived damaged, we will
          replace it or issue a full refund. Period. Just contact us within
          48 hours of delivery.
        </Callout>
      </Section>

      <Section id="all-sales-final" number="02" title="All Sales Are Final">
        <p>
          Due to the nature of research chemical compounds, all sales are
          final. We do not accept returns or exchanges on opened or used
          products under any circumstances. This policy exists to maintain
          the integrity of our quality control process and to comply with
          applicable regulations around research chemicals.
        </p>
        <Callout label="Why we can't accept returns">
          Research peptides are sensitive compounds that require strict
          chain-of-custody controls. Once a product leaves our facility and
          is received by a customer, we cannot verify storage conditions,
          handling, or integrity — and therefore cannot resell or reuse
          returned products.
        </Callout>
        <p>
          We encourage all customers to review the batch-specific
          Certificate of Analysis on our Quality & COAs page before placing
          an order to confirm our products meet your research
          specifications.
        </p>
      </Section>

      <Section id="when-we-cover" number="03" title="When We Make It Right">
        <p>We will issue a full replacement or refund in the following situations:</p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div
            className="rounded-lg border p-5"
            style={{ borderColor: "var(--pl-border)" }}
          >
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-[0.1em]"
              style={{ color: "var(--pl-navy)" }}
            >
              ✓ We&rsquo;ve Got You
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              {COVERED.map((item) => (
                <li key={item} className="flex gap-2">
                  <span style={{ color: "var(--pl-navy)" }}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-lg border p-5"
            style={{ borderColor: "var(--pl-border)" }}
          >
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-[0.1em]"
              style={{ color: "var(--pl-muted)" }}
            >
              ✕ Outside Our Policy
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              {NOT_COVERED.map((item) => (
                <li key={item} className="flex gap-2">
                  <span style={{ color: "var(--pl-muted)" }}>✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="not-covered" number="04" title="What We Can't Cover">
        <p>The following situations are outside our refund policy:</p>
        <ul>
          <li>Products that have been opened and used without a reported issue at delivery</li>
          <li>Change of mind, accidental orders, or ordering the wrong product</li>
          <li>Delays caused by carriers, customs, or circumstances outside our control</li>
          <li>Products stored improperly after delivery (peptides require −20°C storage)</li>
          <li>International orders seized or delayed by customs</li>
          <li>Requests submitted more than 48 hours after confirmed delivery</li>
        </ul>
        <p>
          If you&rsquo;re unsure whether your situation is covered, please
          reach out — we&rsquo;d rather talk through it than have an unhappy
          customer.
        </p>
      </Section>

      <Section id="how-to-request" number="05" title="How To Request Help">
        <p>If you have an issue with your order, here&rsquo;s how to get it resolved quickly:</p>
        <div className="flex flex-col gap-4">
          {STEPS.map((s) => (
            <div key={s.step} className="flex gap-4">
              <span
                className="shrink-0 text-xs font-semibold uppercase tracking-[0.08em]"
                style={{ color: "var(--pl-navy)" }}
              >
                {s.step}
              </span>
              <span>{s.text}</span>
            </div>
          ))}
        </div>
        <Callout label="Email Subject Line">
          &ldquo;Order Issue — [Your Order Number]&rdquo; — this helps us
          find your order immediately and prioritize your request.
        </Callout>
      </Section>

      <Section id="damaged" number="06" title="Damaged Orders">
        <p>If your order arrives damaged, please do the following immediately:</p>
        <ul>
          <li>Do not discard any packaging or damaged products</li>
          <li>Photograph the outer packaging, inner packaging, and damaged product</li>
          <li>Email us within 48 hours with photos and your order number</li>
          <li>We will ship a replacement at no charge within 48 hours of confirmation</li>
        </ul>
        <p>
          We take packaging seriously — every order is packed to maintain
          cold chain integrity during transit. In the rare event of damage,
          we&rsquo;ll make it right immediately.
        </p>
      </Section>

      <Section id="lost" number="07" title="Lost Shipments">
        <p>
          If your tracking shows delivered but you haven&rsquo;t received
          your package, or if your order has been in transit significantly
          longer than expected:
        </p>
        <ul>
          <li>Check with neighbors and building management first</li>
          <li>Wait 24 hours after the marked delivery date — carriers sometimes mark early</li>
          <li>Contact us at info@purposelabs.shop with your order number</li>
          <li>We&rsquo;ll open a carrier investigation on your behalf</li>
          <li>If confirmed lost, we&rsquo;ll ship a replacement or issue a full refund</li>
        </ul>
      </Section>

      <Section id="timeframes" number="08" title="Timeframes">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {TIMEFRAMES.map((t) => (
            <div key={t.label}>
              <dt
                className="mb-1 text-xs font-semibold uppercase tracking-[0.08em]"
                style={{ color: "var(--pl-navy)" }}
              >
                {t.label}
              </dt>
              <dd>{t.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="contact" number="09" title="Contact Us">
        <p>
          We genuinely want every customer to have a great experience. If
          something isn&rsquo;t right, please reach out — we&rsquo;re here
          to help.
        </p>
        <p>
          Purpose Labs LLC
          <br />
          Email: info@purposelabs.shop
          <br />
          Website: purposelabs.shop
          <br />
          Response Time: Within 24 hours
        </p>
        <p>
          For order issues please email with subject: &ldquo;Order Issue —
          [Your Order Number]&rdquo;
        </p>
      </Section>
    </LegalPageLayout>
  );
}

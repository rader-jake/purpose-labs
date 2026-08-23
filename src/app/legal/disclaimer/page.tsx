import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { Section } from "@/components/legal/Section";

const TOC = [
  { id: "research-only", label: "Research Use Only" },
  { id: "not-fda", label: "Not FDA Evaluated" },
  { id: "no-medical", label: "No Medical Advice" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "buyer", label: "Buyer Responsibility" },
];

export default function DisclaimerPage() {
  return (
    <LegalPageLayout title="Legal Disclaimer" metaLine="Last updated: August 2026" tocItems={TOC}>
      <Section id="research-only" number="1" title="Research Use Only">
        <p>All peptides and compounds sold by Purpose Labs are intended solely for laboratory and scientific research by qualified professionals. These products are not intended for use in humans or animals. By purchasing from Purpose Labs, you confirm that you are a qualified researcher or represent an authorized research institution.</p>
      </Section>
      <Section id="not-fda" number="2" title="Not FDA Evaluated">
        <p>The products offered by Purpose Labs have not been evaluated by the U.S. Food and Drug Administration (FDA). These products are not approved to diagnose, treat, cure, or prevent any disease or medical condition. All product descriptions, research references, and information provided on this website are for informational purposes only.</p>
      </Section>
      <Section id="no-medical" number="3" title="No Medical Advice">
        <p>Nothing on this website constitutes medical advice. The information provided is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition.</p>
        <p>Purpose Labs does not endorse, recommend, or promote the use of any of its products for human consumption, therapeutic use, or any application outside of controlled laboratory research.</p>
      </Section>
      <Section id="liability" number="4" title="Limitation of Liability">
        <p>Purpose Labs shall not be held liable for any misuse of its products. By purchasing from us, the buyer assumes full responsibility for ensuring that products are handled, stored, and used in compliance with all applicable laws and regulations. Purpose Labs disclaims all liability for damages arising from improper use, handling, or storage of its products.</p>
      </Section>
      <Section id="buyer" number="5" title="Buyer Responsibility">
        <p>It is the sole responsibility of the purchaser to verify the legality of importing and using these products in their jurisdiction. Purpose Labs makes no representations regarding the legality of its products in any specific country, state, or region outside of their intended research use context.</p>
        <p>By completing a purchase, you acknowledge that you have read and agree to this disclaimer in full.</p>
      </Section>
    </LegalPageLayout>
  );
}

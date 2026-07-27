// src/app/legal/terms/page.tsx

import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { Section } from "@/components/legal/Section";
import { Callout } from "@/components/legal/Callout";

const TOC = [
  { id: "agreement", label: "Agreement" },
  { id: "research-use", label: "Research Use Only" },
  { id: "eligibility", label: "Eligibility" },
  { id: "products-orders", label: "Products & Orders" },
  { id: "payment", label: "Payment" },
  { id: "shipping", label: "Shipping" },
  { id: "refunds", label: "Refunds" },
  { id: "ip", label: "Intellectual Property" },
  { id: "prohibited", label: "Prohibited Conduct" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "governing-law", label: "Governing Law" },
  { id: "changes", label: "Changes to Terms" },
  { id: "contact", label: "Contact" },
];

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      metaLine="Purpose Labs LLC · Last Updated: April 2026 · Effective Date: January 2026"
      tocItems={TOC}
    >
      <Section id="agreement" number="01" title="Agreement To Terms">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to
          and use of the Purpose Labs LLC website at purposelabs.shop and the
          purchase of products offered therein. By accessing our website or
          placing an order, you agree to be bound by these Terms and our
          Privacy Policy.
        </p>
        <p>
          If you do not agree to these Terms, you must immediately
          discontinue use of our website and services. Purpose Labs reserves
          the right to update these Terms at any time without prior notice.
        </p>
      </Section>

      <Section id="research-use" number="02" title="Research Use Only">
        <Callout label="Critical Notice">
          All products sold by Purpose Labs LLC are strictly for in vitro
          laboratory and academic research use only. They are not intended
          for human or animal consumption, diagnostic use, or therapeutic
          applications. These products have not been evaluated or approved
          by the FDA.
        </Callout>
        <p>
          By purchasing from Purpose Labs you expressly represent and
          warrant that:
        </p>
        <ul>
          <li>You are a qualified researcher purchasing products for legitimate research purposes</li>
          <li>You are 21 years of age or older</li>
          <li>You will use all products in strict compliance with all applicable federal, state, and local laws</li>
          <li>You will not use any product for human or animal consumption</li>
          <li>You understand that these products are not medications, supplements, or consumer goods</li>
          <li>You take full responsibility for the safe handling, storage, and disposal of all products</li>
        </ul>
        <p>
          Purpose Labs assumes no liability for any misuse, improper
          handling, or use outside of legitimate laboratory research
          settings.
        </p>
      </Section>

      <Section id="eligibility" number="03" title="Eligibility">
        <p>
          Our website and products are available only to individuals who
          meet all of the following requirements:
        </p>
        <ul>
          <li>21 years of age or older</li>
          <li>Located within the United States</li>
          <li>Not prohibited by any applicable law from purchasing research chemicals</li>
          <li>Using products exclusively for legitimate laboratory research purposes</li>
        </ul>
        <p>
          By using our website or placing an order, you represent that you
          meet all eligibility requirements. Purpose Labs reserves the right
          to refuse service to anyone at our sole discretion.
        </p>
      </Section>

      <Section id="products-orders" number="04" title="Products & Orders">
        <p>
          All product descriptions, specifications, and purity claims are
          based on independent third-party testing by BT Labs.
          Batch-specific Certificates of Analysis are available on our
          Quality & COAs page and are incorporated by reference into these
          Terms.
        </p>
        <p>We reserve the right to:</p>
        <ul>
          <li>Modify or discontinue any product without notice</li>
          <li>Limit quantities available for purchase</li>
          <li>Refuse or cancel any order at our sole discretion</li>
          <li>Correct pricing errors and cancel orders placed at incorrect prices</li>
        </ul>
        <Callout label="Order Confirmation">
          Receipt of an order confirmation email does not constitute
          acceptance of your order. We reserve the right to cancel any order
          after confirmation if we are unable to fulfill it for any reason,
          including stock unavailability or suspected misuse.
        </Callout>
      </Section>

      <Section id="payment" number="05" title="Payment">
        <p>
          All payments are processed securely through Tagada. By providing
          payment information, you represent that you are authorized to use
          the payment method provided and that the information is accurate.
        </p>
        <ul>
          <li>All prices are listed in US dollars and are subject to change without notice</li>
          <li>You are responsible for all applicable taxes</li>
          <li>Payment is due in full at the time of order</li>
          <li>We do not store credit card information on our servers</li>
          <li>Fraudulent orders will be reported to appropriate authorities</li>
        </ul>
      </Section>

      <Section id="shipping" number="06" title="Shipping">
        <p>
          We ship within the United States only. Orders are processed and
          dispatched within 48 hours of payment confirmation. Shipping times
          are estimates and are not guaranteed.
        </p>
        <ul>
          <li>Free shipping on orders over $200</li>
          <li>Free bacteriostatic water included with every order</li>
          <li>Risk of loss passes to you upon delivery to the carrier</li>
          <li>We are not responsible for carrier delays, customs holds, or lost packages after dispatch</li>
          <li>Incorrect shipping addresses provided by customers are not our responsibility</li>
        </ul>
        <p>
          If your order is lost or damaged in transit, please review our
          Refund Policy for next steps.
        </p>
      </Section>

      <Section id="refunds" number="07" title="Refunds & Returns">
        <p>
          All sales are final. Due to the nature of research-grade chemical
          compounds, we do not accept returns or exchanges on opened
          products. However, we will replace or refund orders that arrive
          damaged, incorrect, or are confirmed lost in transit.
        </p>
        <p>
          For complete details, please review our Refund & Returns Policy.
        </p>
      </Section>

      <Section id="ip" number="08" title="Intellectual Property">
        <p>
          All content on this website including text, graphics, logos,
          images, product descriptions, and software is the property of
          Purpose Labs LLC and is protected by applicable intellectual
          property laws.
        </p>
        <p>
          You may not reproduce, distribute, modify, or create derivative
          works from any content on this website without our express
          written consent. Unauthorized use of our content may result in
          legal action.
        </p>
      </Section>

      <Section id="prohibited" number="09" title="Prohibited Conduct">
        <p>You agree not to:</p>
        <ul>
          <li>Purchase products for human or animal consumption</li>
          <li>Resell products without written authorization from Purpose Labs</li>
          <li>Use our website for any unlawful purpose</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Submit false or fraudulent orders or payment information</li>
          <li>Violate any applicable federal, state, or local laws</li>
          <li>Use our products outside of a legitimate research context</li>
          <li>Misrepresent your identity, qualifications, or intended use</li>
        </ul>
        <p>
          Violation of these prohibitions may result in immediate
          termination of your account, cancellation of pending orders, and
          referral to law enforcement where appropriate.
        </p>
      </Section>

      <Section id="disclaimers" number="10" title="Disclaimers">
        <p>
          Our products are sold &ldquo;as is&rdquo; for research purposes
          only. Purpose Labs makes no representations or warranties of any
          kind regarding the suitability of products for any particular
          research application. We do not warrant that our website will be
          uninterrupted or error-free.
        </p>
        <p>
          Purpose Labs expressly disclaims all warranties, express or
          implied, including but not limited to warranties of
          merchantability, fitness for a particular purpose, and
          non-infringement. We do not provide medical, legal, or research
          advice.
        </p>
      </Section>

      <Section id="liability" number="11" title="Limitation of Liability">
        <p>
          To the maximum extent permitted by law, Purpose Labs LLC and its
          officers, directors, employees, and agents shall not be liable for
          any indirect, incidental, special, consequential, or punitive
          damages arising from your use of our products or website.
        </p>
        <p>
          Our total liability to you for any claim arising from these Terms
          or your use of our products shall not exceed the amount you paid
          for the specific product giving rise to the claim.
        </p>
      </Section>

      <Section id="indemnification" number="12" title="Indemnification">
        <p>
          You agree to indemnify, defend, and hold harmless Purpose Labs LLC
          and its officers, directors, employees, and agents from any
          claims, damages, losses, or expenses arising from:
        </p>
        <ul>
          <li>Your use of our products outside of legitimate research purposes</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any applicable law or regulation</li>
          <li>Any misrepresentation you make in connection with your purchase</li>
        </ul>
      </Section>

      <Section id="governing-law" number="13" title="Governing Law">
        <p>
          These Terms shall be governed by and construed in accordance with
          the laws of the United States and the state in which Purpose Labs
          LLC is registered, without regard to conflict of law principles.
        </p>
        <p>
          Any disputes arising from these Terms or your use of our website
          shall be resolved through binding arbitration in accordance with
          applicable law, except where prohibited.
        </p>
      </Section>

      <Section id="changes" number="14" title="Changes To Terms">
        <p>
          Purpose Labs reserves the right to modify these Terms at any time.
          Changes will be effective immediately upon posting to this page
          with an updated date. Your continued use of our website after any
          changes constitutes acceptance of the updated Terms.
        </p>
        <p>
          We encourage you to review these Terms periodically. Material
          changes will be communicated via email to registered customers
          where possible.
        </p>
      </Section>

      <Section id="contact" number="15" title="Contact Us">
        <p>
          If you have any questions about these Terms of Service, please
          contact us:
        </p>
        <p>
          Purpose Labs LLC
          <br />
          Email: info@purposelabs.shop
          <br />
          Website: purposelabs.shop
          <br />
          Response Time: Within 48 hours
        </p>
        <p>
          For legal inquiries please email with subject: &ldquo;Legal
          Inquiry — [Subject]&rdquo;
        </p>
      </Section>
    </LegalPageLayout>
  );
}

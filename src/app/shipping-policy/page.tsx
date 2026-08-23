import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { Section } from "@/components/legal/Section";
import { Callout } from "@/components/legal/Callout";

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "processing", label: "Processing Time" },
  { id: "carriers", label: "Carriers & Methods" },
  { id: "domestic", label: "Domestic Shipping" },
  { id: "international", label: "International Shipping" },
  { id: "tracking", label: "Tracking" },
  { id: "delays", label: "Delays & Issues" },
  { id: "address", label: "Address Accuracy" },
  { id: "contact", label: "Contact Us" },
];

export default function ShippingPolicyPage() {
  return (
    <LegalPageLayout
      title="Shipping Policy"
      subtitle="Last updated: August 2026"
      toc={TOC}
    >
      <Section id="overview" title="Overview">
        <p>
          Purpose Labs is committed to fast, reliable fulfillment. All orders are packed and shipped from our facility in Ocala, Florida. This policy outlines our shipping practices, timelines, and what to expect after placing an order.
        </p>
      </Section>

      <Section id="processing" title="Processing Time">
        <p>
          Orders are processed Monday through Friday. Orders placed before <strong>2:00 PM EST</strong> on a business day are typically shipped same day. Orders placed after 2:00 PM EST, on weekends, or on federal holidays will be processed the next business day.
        </p>
        <Callout>
          Processing time is separate from shipping transit time. Your tracking number will be emailed once your order ships.
        </Callout>
      </Section>

      <Section id="carriers" title="Carriers & Methods">
        <p>
          We ship via <strong>USPS</strong> and <strong>UPS</strong> depending on package size, destination, and selected shipping method. Carrier selection is at our discretion to ensure the fastest and most reliable delivery for your location.
        </p>
      </Section>

      <Section id="domestic" title="Domestic Shipping (United States)">
        <p>We currently ship to all 50 U.S. states. Estimated transit times after shipment:</p>
        <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
          <li><strong>Standard Shipping:</strong> 3–7 business days</li>
          <li><strong>Priority Shipping:</strong> 2–3 business days</li>
          <li><strong>Express Shipping:</strong> 1–2 business days (where available)</li>
        </ul>
        <p>
          Free shipping is available on qualifying orders as indicated at checkout or through active promotions.
        </p>
      </Section>

      <Section id="international" title="International Shipping">
        <p>
          At this time, Purpose Labs ships within the United States only. We do not currently offer international shipping. We hope to expand our shipping coverage in the future.
        </p>
      </Section>

      <Section id="tracking" title="Tracking Your Order">
        <p>
          Once your order ships, you will receive a shipping confirmation email containing your tracking number and a link to track your package. Tracking may take up to 24 hours to update after the label is created.
        </p>
        <p>
          If you did not receive a tracking email, please check your spam folder. You can also log into your account at <strong>purposelabs.shop</strong> to view order status.
        </p>
      </Section>

      <Section id="delays" title="Delays & Carrier Issues">
        <p>
          Once an order is in the hands of the carrier, transit times are outside of our control. Delays may occur due to weather, high volume periods, or other carrier-related issues. Purpose Labs is not responsible for carrier delays.
        </p>
        <p>
          If your package is significantly delayed (more than 7 business days past the estimated delivery date), please contact us and we will assist in filing a claim with the carrier.
        </p>
      </Section>

      <Section id="address" title="Address Accuracy">
        <p>
          Please double-check your shipping address before placing your order. Purpose Labs is not responsible for orders shipped to an incorrect address provided by the customer. If you notice an error immediately after placing your order, contact us as soon as possible and we will do our best to update it before shipment.
        </p>
        <Callout type="warning">
          Orders that are returned to us due to an incorrect address may be subject to a reshipping fee.
        </Callout>
      </Section>

      <Section id="contact" title="Contact Us">
        <p>
          For shipping questions or issues, please reach out to us:
        </p>
        <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
          <li>Email: <strong>info@purposelabs.shop</strong></li>
          <li>Phone: <strong>(904) 413-8593</strong></li>
        </ul>
      </Section>
    </LegalPageLayout>
  );
}

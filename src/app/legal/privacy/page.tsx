// src/app/legal/privacy/page.tsx

import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { Section } from "@/components/legal/Section";
import { Callout } from "@/components/legal/Callout";

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "info-we-collect", label: "Information We Collect" },
  { id: "how-we-use", label: "How We Use It" },
  { id: "sharing", label: "Sharing & Disclosure" },
  { id: "targeted-ads", label: "Targeted Advertising" },
  { id: "cookies", label: "Cookies" },
  { id: "your-rights", label: "Your Rights" },
  { id: "opt-out", label: "Opt-Out" },
  { id: "research-disclaimer", label: "Research Use Disclaimer" },
  { id: "security", label: "Data Security" },
  { id: "children", label: "Children's Privacy" },
  { id: "changes", label: "Policy Changes" },
  { id: "contact", label: "Contact Us" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      metaLine="Purpose Labs LLC · Last Updated: April 2026 · Effective Date: January 2026"
      tocItems={TOC}
    >
      <Section id="overview" number="01" title="Overview">
        <p>
          Purpose Labs LLC (&ldquo;Purpose Labs&rdquo;, &ldquo;we&rdquo;,
          &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates purposelabs.shop
          and is committed to protecting your personal information. This
          Privacy Policy explains how we collect, use, share, and protect
          information about you when you visit our website or make a
          purchase.
        </p>
        <p>
          By using our website, you agree to the collection and use of
          information in accordance with this policy. If you do not agree,
          please discontinue use of our website.
        </p>
        <Callout label="Research Use Only">
          Purpose Labs sells products exclusively for laboratory research
          use. Our website and services are intended for qualified
          researchers and adults 21 years of age or older only.
        </Callout>
      </Section>

      <Section id="info-we-collect" number="02" title="Information We Collect">
        <p>
          We collect information you provide directly to us and information
          collected automatically through your use of our website.
        </p>
        <p className="font-semibold" style={{ color: "var(--pl-slate)" }}>
          Information you provide:
        </p>
        <ul>
          <li>Name, email address, and billing/shipping address when placing an order</li>
          <li>Payment information processed securely through Tagada</li>
          <li>Account credentials if you create an account</li>
          <li>Communications you send us via email or contact forms</li>
          <li>Giveaway entry information including name, email, and age confirmation</li>
          <li>Affiliate program application information</li>
        </ul>
        <p className="font-semibold" style={{ color: "var(--pl-slate)" }}>
          Information collected automatically:
        </p>
        <ul>
          <li>IP address, browser type, device type, and operating system</li>
          <li>Pages visited, time spent on pages, and referring URLs</li>
          <li>Cookie identifiers and similar tracking technologies</li>
          <li>Purchase history and browsing behavior on our site</li>
        </ul>
      </Section>

      <Section id="how-we-use" number="03" title="How We Use Your Information">
        <p>We use the information we collect to:</p>
        <ul>
          <li>Process and fulfill your orders and send related communications</li>
          <li>Send transactional emails including order confirmations and shipping updates</li>
          <li>Send marketing communications if you have opted in</li>
          <li>Administer giveaways, promotions, and affiliate programs</li>
          <li>Improve our website, products, and customer experience</li>
          <li>Detect and prevent fraud and unauthorized access</li>
          <li>Comply with legal obligations</li>
          <li>Show you relevant advertising on other platforms</li>
        </ul>
      </Section>

      <Section id="sharing" number="04" title="Sharing & Disclosure">
        <p>
          We may share your personal information with the following
          categories of third parties:
        </p>
        <ul>
          <li>Payment processors — Tagada processes all payment transactions securely</li>
          <li>Shipping providers — to fulfill and deliver your orders</li>
          <li>Email marketing platforms — Klaviyo for order and marketing communications</li>
          <li>Affiliate tracking — Affiliatly to track and pay affiliate commissions</li>
          <li>Analytics providers — to understand website usage and improve our services</li>
          <li>Advertising partners — to show you relevant ads on other websites</li>
          <li>Legal authorities — when required by law or to protect our rights</li>
        </ul>
        <p>
          We do not sell your personal information to third parties for
          their own marketing purposes.
        </p>
      </Section>

      <Section id="targeted-ads" number="05" title="Targeted Advertising">
        <p>
          As described in this Privacy Policy, we collect personal
          information from your interactions with us and our website,
          including through cookies and similar technologies. We may also
          share this personal information with third parties, including
          advertising partners. We do this in order to show you ads on
          other websites that are more relevant to your interests and for
          other reasons outlined in this policy.
        </p>
        <p>
          Sharing of personal information for targeted advertising based on
          your interaction on different websites may be considered
          &ldquo;sales&rdquo;, &ldquo;sharing&rdquo;, or &ldquo;targeted
          advertising&rdquo; under certain U.S. state privacy laws.
          Depending on where you live, you may have the right to opt out of
          these activities.
        </p>
        <Callout label="Global Privacy Control">
          If you visit our website with the Global Privacy Control opt-out
          preference signal enabled, depending on where you are, we will
          treat this as a request to opt out of activity that may be
          considered a &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of
          personal information or other uses that may be considered
          targeted advertising for the device and browser you used to visit
          our website.
        </Callout>
      </Section>

      <Section id="cookies" number="06" title="Cookies & Tracking">
        <p>
          We use cookies and similar tracking technologies to enhance your
          experience on our website, analyze traffic, and support our
          advertising and affiliate programs.
        </p>
        <ul>
          <li>Essential cookies — required for the website to function, including cart and checkout</li>
          <li>Analytics cookies — help us understand how visitors use our site</li>
          <li>Marketing cookies — used to deliver relevant ads and track affiliate referrals</li>
          <li>Preference cookies — remember your settings and preferences</li>
        </ul>
        <p>
          You can control cookies through your browser settings. Disabling
          certain cookies may affect website functionality.
        </p>
      </Section>

      <Section id="your-rights" number="07" title="Your Rights">
        <p>
          Depending on your location you may have the following rights
          regarding your personal information:
        </p>
        <ul>
          <li>Right to access the personal information we hold about you</li>
          <li>Right to correct inaccurate or incomplete information</li>
          <li>Right to request deletion of your personal information</li>
          <li>Right to opt out of targeted advertising and data sharing</li>
          <li>Right to data portability</li>
          <li>Right to lodge a complaint with a supervisory authority</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at
          info@purposelabs.shop.
        </p>
      </Section>

      <Section id="opt-out" number="08" title="How To Opt Out">
        <p>
          You have several options to opt out of data collection and
          targeted advertising:
        </p>
        <ul>
          <li>Enable the Global Privacy Control browser setting or extension</li>
          <li>Click &ldquo;Unsubscribe&rdquo; in any marketing email we send you</li>
          <li>Email us at info@purposelabs.shop to request opt-out</li>
          <li>Adjust your browser cookie settings to block tracking cookies</li>
          <li>Use browser privacy modes when visiting our site</li>
        </ul>
        <Callout label="Marketing Emails">
          If you subscribed through our giveaway or newsletter, you can
          unsubscribe at any time by clicking the unsubscribe link at the
          bottom of any email or by contacting us directly.
        </Callout>
      </Section>

      <Section id="research-disclaimer" number="09" title="Research Use Disclaimer">
        <p>
          All products sold by Purpose Labs LLC are strictly for laboratory
          and academic research use only. They are not intended for human
          or animal consumption. By purchasing or registering on our site,
          you confirm that you are a qualified researcher, are 21 years of
          age or older, and will use products in full compliance with all
          applicable laws and regulations.
        </p>
        <p>
          We collect age confirmation and research use acknowledgment at the
          time of purchase and giveaway entry. This information is stored
          and may be used to verify compliance with our terms of service.
        </p>
      </Section>

      <Section id="security" number="10" title="Data Security">
        <p>
          We implement industry-standard security measures to protect your
          personal information including SSL encryption, secure payment
          processing through Tagada, and access controls on our systems.
          However, no method of transmission over the internet is 100%
          secure and we cannot guarantee absolute security.
        </p>
        <p>
          We retain your personal information for as long as necessary to
          fulfill the purposes outlined in this policy, comply with legal
          obligations, and resolve disputes.
        </p>
      </Section>

      <Section id="children" number="11" title="Children's Privacy">
        <p>
          Our website and products are intended for adults 21 years of age
          and older. We do not knowingly collect personal information from
          anyone under the age of 21. If you believe we have inadvertently
          collected information from a minor, please contact us immediately
          at info@purposelabs.shop and we will promptly delete it.
        </p>
      </Section>

      <Section id="changes" number="12" title="Policy Changes">
        <p>
          We may update this Privacy Policy from time to time to reflect
          changes in our practices or for other operational, legal, or
          regulatory reasons. We will notify you of any material changes by
          posting the new policy on this page with an updated effective
          date. We encourage you to review this policy periodically.
        </p>
        <p>
          Your continued use of our website after any changes constitutes
          your acceptance of the updated policy.
        </p>
      </Section>

      <Section id="contact" number="13" title="Contact Us">
        <p>
          If you have any questions about this Privacy Policy or how we
          handle your personal information, please contact us:
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
        {/*
          KNOWN GAP — not a bug: the source document this was copied from
          cut off mid-sentence here, so "Privacy Request" is a placeholder
          subject line, not confirmed real copy. Leave as-is until the
          actual wording is provided — do not invent a replacement.
        */}
        <p>
          For privacy-specific requests including data access, deletion, or
          opt-out — please email with subject line: &ldquo;Privacy
          Request&rdquo;
        </p>
      </Section>
    </LegalPageLayout>
  );
}

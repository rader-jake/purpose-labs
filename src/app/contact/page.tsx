// src/app/contact/page.tsx

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/purposelabs.shop/" },
  { label: "TikTok", href: "https://www.tiktok.com/@purposelabs.shop" },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61587139832831" },
];

export default function ContactPage() {
  return (
    <main
      className="mx-auto max-w-2xl px-6 py-20 text-center sm:px-10"
      style={{ fontFamily: "var(--pl-font-body)" }}
    >
      <p
        className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: "var(--pl-slate)" }}
      >
        Get In Touch
      </p>
      <h1
        className="mb-6 text-5xl sm:text-6xl"
        style={{
          color: "var(--pl-navy)",
          fontFamily: "var(--pl-font-display)",
          fontWeight: 500,
        }}
      >
        Contact Us
      </h1>
      <p
        className="mx-auto mb-14 max-w-md text-base leading-relaxed"
        style={{ color: "var(--pl-text-secondary)" }}
      >
        Questions about orders, products, or research use? We respond within
        24 hours.
      </p>

      <div className="mb-14">
        <p
          className="mb-2 text-xs font-semibold uppercase tracking-[0.1em]"
          style={{ color: "var(--pl-navy)" }}
        >
          Email
        </p>
        <a
          href="mailto:info@purposelabs.shop"
          className="text-lg transition-opacity duration-200 hover:opacity-70"
          style={{ color: "var(--pl-slate)" }}
        >
          info@purposelabs.shop
        </a>
        <p className="mt-1 text-xs" style={{ color: "var(--pl-muted)" }}>
          Response within 24 hours
        </p>
      </div>

      <div>
        <p
          className="mb-4 text-xs font-semibold uppercase tracking-[0.1em]"
          style={{ color: "var(--pl-navy)" }}
        >
          Social
        </p>
        <div className="flex justify-center gap-6">
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm transition-opacity duration-200 hover:opacity-70"
              style={{ color: "var(--pl-slate)" }}
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}

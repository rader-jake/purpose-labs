import Image from "next/image";
import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "Catalog", href: "/products" },
      { label: "Best Sellers", href: "/best-sellers" },
      { label: "Reconstitution Water", href: "/products/bac-water" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Quality & COAs", href: "/quality" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Disclaimer", href: "/legal/disclaimer" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Refund Policy", href: "/legal/refund" },
      { label: "Terms", href: "/legal/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--pl-ivory)",
        borderTop: "1px solid var(--pl-border)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <Image
                src="/purposeLabsLogo.png"
                alt="Purpose Labs"
                width={28}
                height={28}
              />
              <span
                className="text-xl"
                style={{
                  fontFamily: "var(--pl-font-display)",
                  color: "var(--pl-navy)",
                  fontWeight: 500,
                }}
              >
                Purpose Labs
              </span>
            </div>
            <p
              className="max-w-xs text-sm leading-relaxed"
              style={{
                color: "var(--pl-text-secondary)",
                fontFamily: "var(--pl-font-body)",
              }}
            >
              High-purity research compounds for serious laboratory and
              academic use. Third-party tested. Batch-specific COAs.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3
                className="mb-4 text-xs font-semibold uppercase tracking-[0.12em]"
                style={{
                  color: "var(--pl-navy)",
                  fontFamily: "var(--pl-font-body)",
                }}
              >
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-opacity duration-200 hover:opacity-70"
                      style={{
                        color: "var(--pl-slate)",
                        fontFamily: "var(--pl-font-body)",
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 border-t pt-8"
          style={{ borderColor: "var(--pl-border)" }}
        >
          <p
            className="text-xs leading-relaxed"
            style={{
              color: "var(--pl-muted)",
              fontFamily: "var(--pl-font-body)",
            }}
          >
            <strong style={{ color: "var(--pl-slate)" }}>
              For Research Use Only:
            </strong>{" "}
            All products sold by Purpose Labs LLC are for laboratory research
            use only and are not for human or animal consumption. By
            purchasing, the customer certifies compliance with all applicable
            laws.
          </p>
        </div>
      </div>
    </footer>
  );
}

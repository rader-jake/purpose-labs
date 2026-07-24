type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  align = "left",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "text-center" : "text-left";

  return (
    <div className={`mb-10 ${alignment}`}>
      <p
        className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{
          color: "var(--pl-slate)",
          fontFamily: "var(--pl-font-body)",
        }}
      >
        {eyebrow}
      </p>
      <h1
        className="text-5xl leading-[0.95] sm:text-6xl md:text-7xl"
        style={{
          color: "var(--pl-navy)",
          fontFamily: "var(--pl-font-display)",
          fontWeight: 500,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h1>
    </div>
  );
}

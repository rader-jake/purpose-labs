// Placeholder inline SVG standing in for the real molecule-icon logo
// asset. Swap this for an <Image src="/logo.svg" ... /> pointing at
// your actual logo file once you have it in /public.

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="14" cy="6" r="2" stroke="var(--pl-navy)" strokeWidth="1.2" />
      <circle cx="6" cy="18" r="2" stroke="var(--pl-navy)" strokeWidth="1.2" />
      <circle cx="22" cy="18" r="2" stroke="var(--pl-navy)" strokeWidth="1.2" />
      <circle cx="14" cy="14" r="2" stroke="var(--pl-navy)" strokeWidth="1.2" />
      <line x1="14" y1="8" x2="14" y2="12" stroke="var(--pl-navy)" strokeWidth="1" />
      <line x1="8" y1="17" x2="12" y2="15" stroke="var(--pl-navy)" strokeWidth="1" />
      <line x1="20" y1="17" x2="16" y2="15" stroke="var(--pl-navy)" strokeWidth="1" />
    </svg>
  );
}

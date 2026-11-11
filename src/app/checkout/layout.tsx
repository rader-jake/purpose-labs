/**
 * Checkout layout — strips the global Header/Footer so the checkout page
 * renders its own minimal header and clean white layout without clashes.
 */
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

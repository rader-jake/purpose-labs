"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCheckout = pathname?.startsWith("/checkout");

  return (
    <>
      {!isCheckout && <Header />}
      {children}
      {!isCheckout && <Footer />}
    </>
  );
}

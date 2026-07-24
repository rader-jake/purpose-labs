// src/components/legal/Callout.tsx

import { ReactNode } from "react";

export function Callout({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="rounded-lg border-l-2 p-5 text-sm leading-relaxed"
      style={{
        borderColor: "var(--pl-navy)",
        backgroundColor: "var(--pl-ivory-soft)",
        color: "var(--pl-text-secondary)",
      }}
    >
      {label && <strong style={{ color: "var(--pl-navy)" }}>{label}: </strong>}
      {children}
    </div>
  );
}

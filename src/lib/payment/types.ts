import type { ComponentType } from "react";

// Adapter contract for the checkout payment step. The goal is that wiring
// in a real processor (Tagada Pay, once it's live) means writing a new
// component that satisfies this same props shape and swapping it in at the
// call site in checkout — nothing else in the checkout flow should need to
// change. Mirrors the same "adapter, not hardcoded to one processor"
// principle discussed for the backend generally, applied here on the
// frontend's payment step.

export interface PaymentResult {
  /** Processor-specific transaction/order identifier. Opaque to checkout. */
  transactionId: string;
}

export interface PaymentError {
  message: string;
}

export interface PaymentStepProps {
  /** Amount due, in minor units (cents) — matches Store API's totals.total_price. */
  amountCents: number;
  currencyCode: string;
  onSuccess: (result: PaymentResult) => void;
  onError: (error: PaymentError) => void;
}

export type PaymentStepComponent = ComponentType<PaymentStepProps>;

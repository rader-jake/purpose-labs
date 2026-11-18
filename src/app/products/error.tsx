"use client";

export default function ProductsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 sm:px-10 text-center">
      <h1 className="text-2xl font-bold mb-4" style={{ color: "#0D1A30" }}>
        Unable to load products
      </h1>
      <p className="text-sm mb-6" style={{ color: "#6b7280" }}>
        We're having trouble connecting to our catalog. Please try again.
      </p>
      <button
        onClick={reset}
        className="rounded-full px-6 py-3 text-sm font-bold text-white"
        style={{ background: "#0D1A30" }}
      >
        Try Again
      </button>
    </main>
  );
}

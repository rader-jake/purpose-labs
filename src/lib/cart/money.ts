/** Store API amounts are minor-unit strings, e.g. "3500" for $35.00. */
export function formatMoney(minorUnits: string | number, currencyMinorUnit = 2): string {
  const cents = typeof minorUnits === "string" ? Number(minorUnits) : minorUnits;
  const value = cents / 10 ** currencyMinorUnit;
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

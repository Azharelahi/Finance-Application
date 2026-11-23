export function currencyDigits(currency: string) {
  try {
    if (!isCurrencyCode(currency)) return null;
    return new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return null;
  }
}

export function isCurrencyCode(currency: string) {
  try {
    return Intl.supportedValuesOf("currency").includes(currency);
  } catch {
    return false;
  }
}

export function parseMajorToMinor(value: string, currency: string) {
  const digits = currencyDigits(currency);
  if (digits === null || !/^\d+(?:\.\d+)?$/.test(value)) return null;

  const [whole, fraction = ""] = value.split(".");
  if (fraction.length > digits) return null;
  const minorText = `${whole}${(fraction + "0".repeat(digits)).slice(0, digits)}`;
  const minor = Number(minorText);
  if (!Number.isSafeInteger(minor) || minor <= 0 || minor > 2_000_000_000) return null;
  return minor;
}

export function formatMinor(amountMinor: number, currency: string) {
  const digits = currencyDigits(currency);
  if (digits === null) return `${amountMinor} ${currency}`;
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(amountMinor / 10 ** digits);
}

export function minorToMajorInput(amountMinor: number, currency: string) {
  const digits = currencyDigits(currency);
  if (digits === null) return String(amountMinor);
  const scale = 10 ** (digits ?? 2);
  const whole = Math.trunc(amountMinor / scale);
  const fraction = String(Math.abs(amountMinor % scale)).padStart(digits ?? 2, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : String(whole);
}

import type { SplitPrice } from "@/types/sites/order-hereserver-com-a6d29d9e/shared";

/**
 * Reproduces the target's `splitPrice()` helper: the yuan part renders large and the
 * fractional part (including the decimal point) renders small.
 *
 *   "1998.01" -> { yuan: "1998", fen: ".01" }
 *   "9.9"     -> { yuan: "9",    fen: ".9"  }
 *   "100"     -> { yuan: "100",  fen: ""    }
 */
export function splitPrice(value: string): SplitPrice {
  const raw = String(value ?? "");
  const dot = raw.indexOf(".");
  if (dot === -1) return { yuan: raw, fen: "" };
  return { yuan: raw.slice(0, dot), fen: raw.slice(dot) };
}

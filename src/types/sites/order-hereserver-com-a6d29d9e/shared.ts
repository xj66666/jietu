/**
 * Types shared by every order.hereserver.com mock-order generator page.
 * Field names mirror the target's Vue data keys so the specs stay greppable.
 */

/** Drives both the iOS and the Android status bar overlay on the preview canvas. */
export interface StatusBarState {
  /** `showAndroidBar` — swaps the iOS bar for the Material one. They are mutually exclusive. */
  showAndroidBar: boolean;
  /** `time_time` — `HH:mm`, fed straight from an `<input type="time">`. */
  time_time: string;
  /** `time_battery` — percentage, 9–91 on the target. */
  time_battery: number;
  /** `time_signal` — 2–4 bars. The icon PNG draws four; extra bars get masked out. */
  time_signal: number;
  /** `time_location` — reveals the location arrow next to the clock. */
  time_location: boolean;
  /** `time_charging` — turns the battery fill green and shows the bolt. */
  time_charging: boolean;
  /** `time_electricity` — renders the numeric percentage inside the battery. */
  time_electricity: boolean;
}

/** One row in the left-hand tool navigation. */
export interface ToolNavItem {
  label: string;
  href: string;
  /** Set for the two entries the target opens in a new tab. */
  external?: boolean;
}

/** Result of the target's `splitPrice()` helper: `"1998.01"` → `{ yuan: "1998", fen: ".01" }`. */
export interface SplitPrice {
  yuan: string;
  fen: string;
}

/** The four uploadable images. `null` means "not supplied" — some render nothing at all. */
export interface CanvasUploads {
  /** `selectedPic` — product photo. Defaults to the target's own sample image. */
  selectedPic: string;
  /** `selectedShopLogoSrc` — shop badge. Defaults to the target's own sample logo. */
  selectedShopLogoSrc: string;
  /** `userAvatar` — pdd only; the `<img>` is not rendered while this is empty. */
  userAvatar?: string | null;
  /** `logisticsLogo` — pdd only; the `<img>` is not rendered while this is empty. */
  logisticsLogo?: string | null;
}

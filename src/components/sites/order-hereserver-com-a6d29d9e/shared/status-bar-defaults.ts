import type { StatusBarState } from "@/types/sites/order-hereserver-com-a6d29d9e/shared";

/**
 * Status-bar defaults.
 *
 * The target randomises `time_time` and `time_battery` on every load (observed
 * 08:41/26, 19:51/54, 06:05/60, 09:23, 16:46). Randomising during render would make
 * the server and client markup disagree, so these are pinned: 08:41 is Apple's own
 * canonical marketing time, and 26 is one of the values actually observed.
 */
export const STATUS_BAR_DEFAULTS: StatusBarState = {
  showAndroidBar: false,
  time_time: "08:41",
  time_battery: 26,
  time_signal: 3,
  time_location: false,
  time_charging: false,
  time_electricity: true,
};

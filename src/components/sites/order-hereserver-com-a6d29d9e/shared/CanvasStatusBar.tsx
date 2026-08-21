import { cn } from "@/lib/utils";
import type { StatusBarState } from "@/types/sites/order-hereserver-com-a6d29d9e/shared";
import { MaterialBatteryIcon, MaterialCellIcon, MaterialWifiIcon } from "./icons";

/**
 * iOS status bar overlay, `ios-bar-v2` variant.
 *
 * The target appends this to the end of #screen and pins it `absolute top-0`, so it
 * paints over the canvas's 120px top padding. Icon art comes from f.css's base64
 * backgrounds, extracted to /sites/.../shared/status-bar/*.png and wired up by the
 * `.ios-*-icon-v2` rules in globals.css.
 *
 * Signal strength works by masking: the background PNG always draws four bars and
 * grey <i> blocks cover the ones that should be dark.
 *
 * Spec: docs/research/order-hereserver-com-a6d29d9e/SharedShell.spec.md#4-iosstatusbar
 */
function IosStatusBar({ state }: { state: StatusBarState }) {
  const { time_time, time_battery, time_signal, time_location, time_charging, time_electricity } = state;

  return (
    <div
      className={cn(
        // The target's own class string carries both `flex` and `block`; `.flex` is
        // emitted after `.block` so flex wins. Passing both through cn() would let
        // tailwind-merge drop `flex` as a conflicting display utility, so only `flex`
        // is declared here and `hidden` is layered on when the Android bar takes over.
        "ios-bar absolute top-0 left-0 w-full h-[74.5px] bg-white flex items-center px-[42px] pl-[47.5px] ios-bar-v2",
        state.showAndroidBar && "hidden",
      )}
    >
      <div className="ios-left flex-1 flex items-center">
        <span className="ios-time ml-4 text-[25px] font-semibold my-[7.5px]">{time_time}</span>
        <span
          className="ios-location block w-[21px] h-[21px] mr-[7.5px] relative left-[10px] indent-[-9999px] bg-cover ios-location-icon-v2"
          style={{ display: time_location ? "block" : "none" }}
        >
          定位
        </span>
      </div>
      <div className="ios-center" />
      <div className="ios-right flex items-center">
        <span className="ios_single ml-[7.5px] w-[28px] h-[19px] relative indent-[-9999px] bg-cover ios-signal-icon-v2">
          {time_signal <= 3 && (
            <i className="ios-single-1 absolute bg-[#9b9b9b] rounded-[1.2px] w-[4.8px] h-[17px] right-[0.1px] top-[1px]" />
          )}
          {time_signal <= 2 && (
            <i className="ios-single-2 absolute bg-[#9b9b9b] rounded-[1.2px] w-[4px] h-[14px] right-[7.8px] top-[4px]" />
          )}
        </span>
        <span className="ios_wifi ml-[5.5px] w-[32.5px] h-[20.5px] indent-[-9999px] bg-cover ios-wifi-icon-v2">
          wifi
        </span>
        <div
          className={cn(
            "group ios_battery flex relative ml-[5.5px] w-[39.5px] h-[19.5px] bg-cover ios-battery-icon-v2",
            time_charging && "ios_battery-charging",
          )}
        >
          <span className="mr-[5px] flex-1 flex flex-col rounded-[7px] overflow-hidden">
            {/* `z-11` is the target's own class; it generates nothing in Tailwind — the
                real stacking comes from `.battery-value { z-index: 1 }` in globals.css. */}
            <em
              className="flex-1 z-11 indent-[-9999px] battery-value"
              style={{ width: `${time_battery}%` }}
            >
              电量
            </em>
            <i className="flex items-center justify-center absolute w-full h-full text-[15px] font-semibold text-white not-italic battery-value-number z-10">
              {time_electricity ? time_battery : ""}
              <a className="hidden w-[6.5px] h-[10px] bg-cover ios-battery-charging-icon-v2" />
            </i>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Android (Material) status bar overlay.
 *
 * Deliberate deviation: the target randomises this icon set on every load — across
 * four observations `material-5g` and `material-clock` came and went and the cellular
 * glyph alternated between single- and dual-SIM art. Randomising during render would
 * break hydration, so this renders the three icons present in 100% of observations.
 * Recorded in SharedShell.spec.md#5-androidstatusbar.
 */
function AndroidStatusBar({ state }: { state: StatusBarState }) {
  return (
    <div
      className={cn(
        "material-top-bar py-[18px] px-[26px] h-[74.5px] absolute top-0 left-0 right-0 bg-white",
        state.showAndroidBar ? "block" : "hidden",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="material-left flex items-center gap-2 flex-row">
          <div className="font-semibold text-2xl">{state.time_time}</div>
        </div>
        <div className="material-right flex flex-row items-center gap-2">
          <div className="material-cell w-7 h-7">
            <MaterialCellIcon />
          </div>
          <div className="material-wifi w-7 h-7">
            <MaterialWifiIcon />
          </div>
          <div className="material-battery w-7 h-7 relative top-[1px]">
            <MaterialBatteryIcon />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Both bars stay mounted and toggle `display`, exactly as the target does — that keeps
 * the DOM shape identical for structural QA diffing.
 */
export function CanvasStatusBar({ state }: { state: StatusBarState }) {
  return (
    <>
      <IosStatusBar state={state} />
      <AndroidStatusBar state={state} />
    </>
  );
}

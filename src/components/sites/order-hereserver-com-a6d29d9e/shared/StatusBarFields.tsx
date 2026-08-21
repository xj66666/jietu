"use client";

import type { StatusBarState } from "@/types/sites/order-hereserver-com-a6d29d9e/shared";
import { CheckboxField, NumberField, TimeField } from "./fields";

/**
 * 「编辑信号与时间」panel. The target toggles this against the order-info panel with
 * `v-show`, so both stay mounted and only `display` changes — mirrored here with the
 * `hidden` class rather than conditional rendering, to keep input state alive.
 *
 * Note the label classes here omit `block`, unlike the order panel's. That is the
 * target's own inconsistency, reproduced.
 * Spec: docs/research/order-hereserver-com-a6d29d9e/SharedShell.spec.md#8-statusbarfields
 */
export function StatusBarFields({
  state,
  onChange,
  onBack,
  hidden,
}: {
  state: StatusBarState;
  onChange: (patch: Partial<StatusBarState>) => void;
  onBack: () => void;
  hidden: boolean;
}) {
  return (
    <div className={`p-6 pt-0 space-y-4${hidden ? " hidden" : ""}`}>
      <TimeField
        label="手机时间"
        value={state.time_time}
        onChange={(time_time) => onChange({ time_time })}
        labelBlock={false}
      />
      <NumberField
        label="电量"
        value={state.time_battery}
        min={9}
        max={91}
        onChange={(time_battery) => onChange({ time_battery })}
        labelBlock={false}
      />
      <NumberField
        label="蜂窝信号"
        value={state.time_signal}
        min={2}
        max={4}
        onChange={(time_signal) => onChange({ time_signal })}
        labelBlock={false}
      />
      <CheckboxField
        label="定位"
        checked={state.time_location}
        onChange={(time_location) => onChange({ time_location })}
        inline
      />
      <CheckboxField
        label="充电"
        checked={state.time_charging}
        onChange={(time_charging) => onChange({ time_charging })}
        inline
      />
      <CheckboxField
        label="电池百分比"
        checked={state.time_electricity}
        onChange={(time_electricity) => onChange({ time_electricity })}
        inline
      />
      <div className="mb-4">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 text-white font-medium py-2.5 px-5 rounded-[8px] transition-colors"
        >
          &larr; 编辑订单信息
        </button>
      </div>
    </div>
  );
}

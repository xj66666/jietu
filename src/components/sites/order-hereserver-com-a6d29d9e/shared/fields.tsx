"use client";

import type { ChangeEvent, ReactNode } from "react";

/** Shared row wrapper: `div.mb-4` on the target. */
function Row({ children }: { children: ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

const INPUT_CLASS =
  "border border-gray-300 bg-gray-50 text-gray-900 rounded-[8px] focus:ring-blue-500 focus:border-blue-500 w-full p-2.5";

const CHECKBOX_CLASS =
  "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-[4px] focus:ring-blue-500 focus:ring-2";

export function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <Row>
      <label className="block text-gray-700 mb-2">{label}</label>
      <input type="text" className={INPUT_CLASS} value={value} onChange={(e) => onChange(e.target.value)} />
    </Row>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  /** The status-bar panel's labels omit `block`; the order panel's include it. */
  labelBlock = true,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  labelBlock?: boolean;
}) {
  return (
    <Row>
      <label className={labelBlock ? "block text-gray-700 mb-2" : "text-gray-700 mb-2"}>{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        className={INPUT_CLASS}
        value={value}
        onChange={(e) => {
          // Keep the field usable while typing: an empty box reads as NaN, so fall
          // back to the lower bound rather than writing NaN into state.
          const next = Number.parseInt(e.target.value, 10);
          onChange(Number.isNaN(next) ? (min ?? 0) : next);
        }}
      />
    </Row>
  );
}

export function TimeField({
  label,
  value,
  onChange,
  labelBlock = true,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  labelBlock?: boolean;
}) {
  return (
    <Row>
      <label className={labelBlock ? "block text-gray-700 mb-2" : "text-gray-700 mb-2"}>{label}</label>
      <input type="time" className={INPUT_CLASS} value={value} onChange={(e) => onChange(e.target.value)} />
    </Row>
  );
}

/**
 * The target uses two different checkbox row layouts:
 *   - order panel: `div.mb-4` + `label.block`
 *   - status-bar panel: `div.mb-4.flex.items-center.gap-3` + `label` (no block)
 */
export function CheckboxField({
  label,
  checked,
  onChange,
  inline = false,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  inline?: boolean;
}) {
  if (inline) {
    return (
      <div className="mb-4 flex items-center gap-3">
        <label className="text-gray-700 mb-2">{label}</label>
        <input
          type="checkbox"
          className={CHECKBOX_CLASS}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
      </div>
    );
  }
  return (
    <Row>
      <label className="block text-gray-700 mb-2">{label}</label>
      <input
        type="checkbox"
        className={CHECKBOX_CLASS}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </Row>
  );
}

/** Reads the picked file as a data URL, matching the target's FileReader flow. */
export function FileField({
  label,
  onPick,
}: {
  label: string;
  onPick: (dataUrl: string) => void;
}) {
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onPick(reader.result);
    };
    reader.readAsDataURL(file);
  };
  return (
    <Row>
      <label className="block text-gray-700 mb-2">{label}</label>
      <input type="file" onChange={handle} />
    </Row>
  );
}

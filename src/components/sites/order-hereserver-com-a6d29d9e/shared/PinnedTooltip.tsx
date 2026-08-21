/**
 * The origin's always-on Tippy.js tooltip, reproduced as a plain absolutely positioned
 * box. It is `pointer-events: none` and never animates upstream, so Popper/Tippy buys
 * nothing here.
 *
 * Offsets are measured relative to #editor-ct at 1440px — see
 * docs/research/order-hereserver-com-a6d29d9e/tippy-overlays.json.
 * Spec: docs/research/order-hereserver-com-a6d29d9e/SharedShell.spec.md#9-pinnedtooltip
 *
 * Note: the origin also pins a second tooltip over the canvas reading
 * 「截图仅用于玩笑晒单,切勿用于非法目的」. It was removed on request; see
 * SharedShell.spec.md 「本地改动」 if you want to reinstate an equivalent notice.
 */
function TooltipBox({ children }: { children: string }) {
  return (
    <div className="bg-[#333] text-white text-[14px] leading-[19.6px] font-normal rounded-[4px] px-[9px] py-[5px] whitespace-nowrap">
      {children}
    </div>
  );
}

/**
 * 「点击这里使用支付宝登录以获得完整功能」 — anchored under the editor's login strip.
 *
 * Measured against the original at 1440px: x 57.5, y 34 relative to #editor-ct, 270 x 29.6.
 * `left-1/2 -translate-x-1/2` lands on x 57 in a 384px column — the remaining 0.5px is
 * Popper's sub-pixel centring.
 *
 * Hidden below 768px, where the three columns stack and the original anchor position no
 * longer applies.
 */
export function LoginHintTooltip() {
  return (
    <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-[34px] z-[9999] pointer-events-none">
      <TooltipBox>点击这里使用支付宝登录以获得完整功能</TooltipBox>
    </div>
  );
}

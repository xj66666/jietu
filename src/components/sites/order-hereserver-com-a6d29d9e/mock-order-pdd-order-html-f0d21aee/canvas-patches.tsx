/**
 * Local edits layered over the pdd canvas's baked-in background art.
 *
 * The background PNG (1179x2556, rendered 1:2 into 589.5x1278) has the row labels,
 * the 拼单时间 decorations and the whole bottom action bar painted into it — the target
 * only ever renders values on top. Changing any of that means covering the baked pixels
 * and redrawing, which is what these patches do.
 *
 * Every coordinate below is measured, not estimated. Provenance:
 *   scripts/clone-tools/measure-pdd-bg.mjs        → grey bands, bottom-bar column runs
 *   scripts/clone-tools/measure-pdd-bg-2.mjs      → button boxes, radius probe
 *   scripts/clone-tools/measure-pdd-bg-3.mjs      → border / fill / ink colours
 *   scripts/clone-tools/measure-pdd-bg-4.mjs      → label ink colour + 33px row pitch
 *   docs/research/order-hereserver-com-a6d29d9e/pdd-bg-measurements.json
 *
 * Measured reference values (canvas coordinates, 590x1278):
 *   baked row labels   x19 w88  h20  pitch 33px  ink rgb(156,156,156)
 *   拼单时间 decorations x327-377 y1043-1071 (divider | + hat + chevron)
 *   grey separator     y1119-1148 (h30) rgb(244,244,244)
 *   bottom bar         top y1149; buttons y1164 h49, radius ~4px
 *                      更多 x119 w45 · 申请发票 x206 w114 · 查看物流 x332 w114 · 确认收货 x458 w113
 *   outlined border    rgb(163,163,163) 1px · label ink rgb(21,21,22) 22px
 *   red button fill    rgb(224,46,36) · label white
 *   home indicator     x190 y1258 w211 h8
 */

/** Erases the divider, hat placeholder and chevron trailing the 拼单时间 value.
 *
 * Rendered *before* the canvas content root so the flow content paints on top: the hat
 * sits exactly where an uploaded `userAvatar` lands (x333.5 w28), and that upload must
 * stay visible.
 */
export function PddHatPatch() {
  return (
    <div
      aria-hidden="true"
      className="absolute bg-white"
      style={{ left: "325px", top: "1041px", width: "56px", height: "32px" }}
    />
  );
}

/** Covers the original 30px grey separator so the added 成交时间 row has room. */
export function PddGreyBandPatch() {
  return (
    <div
      aria-hidden="true"
      className="absolute left-0 right-0 bg-white"
      style={{ top: "1119px", height: "30px" }}
    />
  );
}

/**
 * The replacement separator, anchored to the bottom bar rather than to the row above it.
 * Thinner than the original 30px because the extra row consumes that space; 13px matches
 * the 9px band the design already uses higher up the canvas.
 */
export function PddGreyBandReplacement() {
  return (
    <div
      aria-hidden="true"
      className="absolute left-0 right-0 bg-[#f4f4f4]"
      style={{ bottom: "129px", height: "13px" }}
    />
  );
}

/**
 * Relabels two of the four baked bottom-bar buttons.
 *
 * Only the interior is repainted — inset 3px so the PNG's own 1px border and ~4px radius
 * still show through, which keeps the two edited buttons identical to the untouched
 * 查看物流 beside them. At a 4px radius the inset corner still falls inside the fill, so
 * there is no seam.
 */
export function PddBottomBarTextPatches({
  invoiceLabel,
  confirmLabel,
}: {
  invoiceLabel: string;
  confirmLabel: string;
}) {
  return (
    <>
      {/* 申请发票 → invoiceLabel. Button box x206 y1164 w114 h49. */}
      <div
        className="absolute bg-white flex items-center justify-center text-[22px] text-[#151516]"
        style={{ left: "209px", top: "1167px", width: "108px", height: "43px" }}
      >
        {invoiceLabel}
      </div>

      {/* 确认收货 → confirmLabel. Button box x458 y1164 w113 h49, fill rgb(224,46,36). */}
      <div
        className="absolute bg-[#e02e24] flex items-center justify-center text-[22px] text-white"
        style={{ left: "461px", top: "1167px", width: "107px", height: "43px" }}
      >
        {confirmLabel}
      </div>
    </>
  );
}

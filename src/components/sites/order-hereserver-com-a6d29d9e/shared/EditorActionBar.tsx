"use client";

import { cn } from "@/lib/utils";

/**
 * 「生成截图」/「导出」pair at the top of the editor column.
 *
 * On the target, `screenshot()` rasterises #screen, stores the data URL in
 * `screenMirrorData` (which reveals the `.screen-mirror` overlay) and unhides the
 * download anchor. Same contract here, with html2canvas-pro doing the rasterising.
 * Spec: docs/research/order-hereserver-com-a6d29d9e/SharedShell.spec.md#7-editoractionbar
 */
export function EditorActionBar({
  screenshotUrl,
  isCapturing,
  onCapture,
  downloadName,
}: {
  screenshotUrl: string | null;
  isCapturing: boolean;
  onCapture: () => void;
  downloadName: string;
}) {
  return (
    <div className="p-6">
      <button
        type="button"
        id="generatePic"
        onClick={onCapture}
        disabled={isCapturing}
        className="bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white font-medium py-2.5 px-5 rounded-[8px] transition-colors disabled:opacity-70"
      >
        生成截图
      </button>

      <a
        id="downdloadPic"
        download={downloadName}
        target="_blank"
        href={screenshotUrl ?? undefined}
        className={cn(
          "mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-[4px]",
          !screenshotUrl && "hidden",
        )}
      >
        导出
      </a>
    </div>
  );
}

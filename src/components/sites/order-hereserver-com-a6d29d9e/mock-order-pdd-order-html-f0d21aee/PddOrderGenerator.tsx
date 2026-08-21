"use client";

import { useRef, useState } from "react";
import type { PddOrderState } from "@/types/sites/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee";
import { EditorActionBar } from "@/components/sites/order-hereserver-com-a6d29d9e/shared/EditorActionBar";
import { EditorLoginStrip } from "@/components/sites/order-hereserver-com-a6d29d9e/shared/EditorLoginStrip";
import { MobileNavToggleRow } from "@/components/sites/order-hereserver-com-a6d29d9e/shared/MobileNavToggleRow";
import { LoginHintTooltip } from "@/components/sites/order-hereserver-com-a6d29d9e/shared/PinnedTooltip";
import { SiteTopbar } from "@/components/sites/order-hereserver-com-a6d29d9e/shared/SiteTopbar";
import { StatusBarFields } from "@/components/sites/order-hereserver-com-a6d29d9e/shared/StatusBarFields";
import { ToolNavSidebar } from "@/components/sites/order-hereserver-com-a6d29d9e/shared/ToolNavSidebar";
import { useScreenshot } from "@/components/sites/order-hereserver-com-a6d29d9e/shared/use-screenshot";
import { PDD_ORDER_DEFAULTS } from "@/components/sites/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee/defaults";
import { PddOrderCanvas } from "@/components/sites/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee/PddOrderCanvas";
import { PddOrderFields } from "@/components/sites/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee/PddOrderFields";

/**
 * 拼多多订单生成器 —— 页面级状态与三栏装配。
 *
 * 布局对应原站 `body#app` 下的结构:
 *   nav(sticky) → max-w-[1440px] → flex-col md:flex-row → [移动开关行, 左导航, 画布, 编辑器]
 *
 * 外层 `overflow-x-hidden md:overflow-visible` 是刻意的:768–1293px 区间原站确实横向
 * 溢出到 1294px(256 + 589.5 + 384 + 2×24 gap + 32 padding),可以左右拖。
 *
 * Topology: docs/research/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee/PAGE_TOPOLOGY.md
 */
export function PddOrderGenerator() {
  const [state, setState] = useState<PddOrderState>(PDD_ORDER_DEFAULTS);
  const [isShowNav, setIsShowNav] = useState(false);
  const [enableEditTopbar, setEnableEditTopbar] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const { screenshotUrl, isCapturing, capture } = useScreenshot(screenRef);

  const patch = (next: Partial<PddOrderState>) => setState((prev) => ({ ...prev, ...next }));

  /** The target's `scrollTop()` — jump the editor column back to the top on panel swap. */
  const toTopbarPanel = () => {
    setEnableEditTopbar(true);
    editorRef.current?.scrollTo({ top: 0 });
  };

  return (
    <>
      <SiteTopbar title="拼多多订单生成器" />

      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row md:gap-6 md:px-4 overflow-x-hidden md:overflow-visible">
          <MobileNavToggleRow isShowNav={isShowNav} onToggleNav={() => setIsShowNav((v) => !v)} />

          <ToolNavSidebar isShowNav={isShowNav} />

          <div className="screen-ct relative">
            {screenshotUrl ? (
              <div
                className="screen-mirror absolute top-0 left-0 bottom-0 right-0 z-50 bg-center bg-contain bg-no-repeat bg-[#fff] w-screen"
                style={{ backgroundImage: `url(${screenshotUrl})` }}
              />
            ) : null}
            <div ref={screenRef}>
              <PddOrderCanvas state={state} />
            </div>
          </div>

          <div
            ref={editorRef}
            id="editor-ct"
            className="sidebar md:w-96 md:min-w-[384px] md:sticky md:top-[60px] md:h-[calc(100vh-60px)] md:overflow-y-auto scrollbar-hide max-md:h-auto relative"
          >
            <EditorLoginStrip />
            <LoginHintTooltip />

            <EditorActionBar
              screenshotUrl={screenshotUrl}
              isCapturing={isCapturing}
              onCapture={capture}
              downloadName="pdd-order.png"
            />

            <PddOrderFields
              state={state}
              onChange={patch}
              onEditTopbar={toTopbarPanel}
              hidden={enableEditTopbar}
            />
            <StatusBarFields
              state={state}
              onChange={patch}
              onBack={() => setEnableEditTopbar(false)}
              hidden={!enableEditTopbar}
            />
          </div>
        </div>
      </div>
    </>
  );
}

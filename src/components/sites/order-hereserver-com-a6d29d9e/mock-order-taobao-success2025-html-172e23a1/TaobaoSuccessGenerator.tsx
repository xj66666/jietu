"use client";

import { useRef, useState } from "react";
import type {
  TaobaoSuccessState,
} from "@/types/sites/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1";
import { EditorActionBar } from "@/components/sites/order-hereserver-com-a6d29d9e/shared/EditorActionBar";
import { EditorLoginStrip } from "@/components/sites/order-hereserver-com-a6d29d9e/shared/EditorLoginStrip";
import { MobileNavToggleRow } from "@/components/sites/order-hereserver-com-a6d29d9e/shared/MobileNavToggleRow";
import { LoginHintTooltip } from "@/components/sites/order-hereserver-com-a6d29d9e/shared/PinnedTooltip";
import { SiteTopbar } from "@/components/sites/order-hereserver-com-a6d29d9e/shared/SiteTopbar";
import { StatusBarFields } from "@/components/sites/order-hereserver-com-a6d29d9e/shared/StatusBarFields";
import { ToolNavSidebar } from "@/components/sites/order-hereserver-com-a6d29d9e/shared/ToolNavSidebar";
import { useScreenshot } from "@/components/sites/order-hereserver-com-a6d29d9e/shared/use-screenshot";
import { TAOBAO_SUCCESS_DEFAULTS } from "@/components/sites/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1/defaults";
import { TaobaoOrderCanvas } from "@/components/sites/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1/TaobaoOrderCanvas";
import { TaobaoOrderFields } from "@/components/sites/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1/TaobaoOrderFields";

/**
 * 淘宝交易成功订单生成器(2025 新版)—— 页面级状态与三栏装配。
 *
 * 外壳与拼多多页完全相同;差异只在中间画布与编辑器字段。
 *
 * Topology: docs/research/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1/PAGE_TOPOLOGY.md
 */
export function TaobaoSuccessGenerator() {
  const [state, setState] = useState<TaobaoSuccessState>(TAOBAO_SUCCESS_DEFAULTS);
  const [isShowNav, setIsShowNav] = useState(false);
  const [enableEditTopbar, setEnableEditTopbar] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const { screenshotUrl, isCapturing, capture } = useScreenshot(screenRef);

  const patch = (next: Partial<TaobaoSuccessState>) => setState((prev) => ({ ...prev, ...next }));

  const toTopbarPanel = () => {
    setEnableEditTopbar(true);
    editorRef.current?.scrollTo({ top: 0 });
  };

  return (
    <>
      <SiteTopbar title="淘宝交易成功订单生成器 - 2025 新版" />

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
              <TaobaoOrderCanvas state={state} />
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
              downloadName="taobao-success-2025.png"
            />

            <TaobaoOrderFields
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

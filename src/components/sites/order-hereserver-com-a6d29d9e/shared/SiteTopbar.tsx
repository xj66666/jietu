import { SHARED_ASSETS } from "./assets";

/**
 * Sticky site header. Static — no scroll-triggered or hover state on the target.
 * Spec: docs/research/order-hereserver-com-a6d29d9e/SharedShell.spec.md#1-sitetopbar
 */
export function SiteTopbar({ title }: { title: string }) {
  return (
    <nav className="bg-white border-b border-gray-200 md:sticky md:top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 py-3 flex items-center justify-between md:justify-start gap-4">
        <a href="https://order.hereserver.com/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- 1:1 with the target's plain <img>; next/image would inject srcset and change layout */}
          <img src={SHARED_ASSETS.siteLogo} alt="魔猫订单" className="w-8 h-8" />
          <span className="text-xl font-semibold text-gray-900 hidden sm:inline">魔猫订单</span>
        </a>
        <div className="hidden md:block h-6 w-px bg-gray-300" />
        <h1 className="text-lg md:text-xl font-semibold text-gray-700">{title}</h1>
      </div>
    </nav>
  );
}

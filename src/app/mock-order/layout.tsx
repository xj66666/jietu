import type { ReactNode } from "react";
import localFont from "next/font/local";

/**
 * Self-hosted faces declared by https://order.hereserver.com/mock-order/font/f.css.
 * The PingFang SC declarations in that file are commented out upstream, so they are
 * intentionally not reproduced — the stack falls through to the system copy.
 */
const sfPro = localFont({
  src: [
    {
      path: "../../../public/sites/order-hereserver-com-a6d29d9e/shared/fonts/sf-pro-text-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/sites/order-hereserver-com-a6d29d9e/shared/fonts/sf-pro-text-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../public/sites/order-hereserver-com-a6d29d9e/shared/fonts/sf-pro-text-semibold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro",
  display: "swap",
});

/** Used by the shared `.money` class for WeChat-style figures. */
const weChatNum = localFont({
  src: "../../../public/sites/order-hereserver-com-a6d29d9e/shared/fonts/WeChatNum.ttf",
  weight: "400",
  style: "normal",
  variable: "--font-wechat-num",
  display: "swap",
});

/**
 * Route-scoped shell for the order.hereserver.com clones.
 *
 * The target sets its palette and font on <body> directly. The root layout of this
 * repo is shared with the template scaffold at /, so instead of mutating <body> we
 * reproduce those declarations on a wrapper that carries `.site-mock-order` — the
 * scope every ported rule in globals.css hangs off.
 */
export default function MockOrderLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${sfPro.variable} ${weChatNum.variable} site-mock-order min-h-screen bg-gray-100 text-gray-900`}
    >
      {children}
    </div>
  );
}

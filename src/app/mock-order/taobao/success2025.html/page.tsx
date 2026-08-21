import type { Metadata } from "next";
import { TaobaoSuccessGenerator } from "@/components/sites/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1/TaobaoSuccessGenerator";

/**
 * Route: /mock-order/taobao/success2025.html
 *
 * The `.html` folder name preserves the source pathname exactly, per the output plan.
 *
 * Metadata mirrors the target's own <title> / <meta name="description">.
 */
export const metadata: Metadata = {
  title: "2026淘宝交易成功截图生成器_成交详情模拟_订单页面制作工具 - 魔猫订单",
  description:
    "提供2026最新界面风格的淘宝成交截图制作。支持自定义实付金额、物流签收轨迹及评价内容。一键导出无损高清长图，适配社交分享与电商数据演示。",
  alternates: {
    canonical: "https://order.hereserver.com/mock-order/taobao/success2025.html",
  },
};

export default function Page() {
  return <TaobaoSuccessGenerator />;
}

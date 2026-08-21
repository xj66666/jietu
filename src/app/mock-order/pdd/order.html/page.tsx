import type { Metadata } from "next";
import { PddOrderGenerator } from "@/components/sites/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee/PddOrderGenerator";

/**
 * Route: /mock-order/pdd/order.html
 *
 * The `.html` folder name is intentional — the skill's output plan preserves the source
 * pathname exactly. A dot is an ordinary character in an App Router segment, so this
 * resolves literally and triggers none of the special folder syntaxes.
 *
 * Metadata mirrors the target's own <title> / <meta name="description">.
 */
export const metadata: Metadata = {
  title: "拼多多订单生成器_PDD拼单成功截图模拟器_物流详情生成-魔猫订单",
  description:
    "魔猫拼多多订单模拟工具：支持一键生成1:1仿真PDD订单详情截图。包含拼单成功、待收货、退款完成等全状态模拟，可高度自定义商品标题、规格、拼单成员头像及物流单号。导出高清长图，专为电商内容创作及朋友圈趣味分享设计。",
  alternates: {
    canonical: "https://order.hereserver.com/mock-order/pdd/order.html",
  },
};

export default function Page() {
  return <PddOrderGenerator />;
}

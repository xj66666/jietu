import type { ToolNavItem } from "@/types/sites/order-hereserver-com-a6d29d9e/shared";

/** `返回首页 - 更多功能` — the first list, on its own above the divider. */
export const TOOL_NAV_HOME: ToolNavItem = {
  label: "返回首页 - 更多功能",
  href: "https://order.hereserver.com/",
  external: true,
};

/**
 * The 18 generator links below the divider, in the target's own order.
 *
 * Two of them are built in this repo and point at local routes; the rest are real
 * pages on the origin that this clone does not cover, so they keep absolute URLs
 * rather than dead relative paths. See SHARED_SHELL.md 「已知不移植」.
 */
export const TOOL_NAV_ITEMS: ToolNavItem[] = [
  { label: "淘宝订单生成器", href: "/mock-order/taobao/success2025.html" },
  { label: "淘宝订单列表生成器", href: "https://order.hereserver.com/mock-order/taobao/list.html", external: true },
  { label: "京东订单生成器", href: "https://order.hereserver.com/mock-order/jd/order.html", external: true },
  { label: "京东订单列表生成器", href: "https://order.hereserver.com/mock-order/jd/list.html", external: true },
  { label: "拼多多订单生成器", href: "/mock-order/pdd/order.html" },
  { label: "退货退款订单生成器", href: "https://order.hereserver.com/mock-order/pdd/return.html", external: true },
  { label: "闲鱼订单生成器", href: "https://order.hereserver.com/mock-order/fish/order.html", external: true },
  { label: "美团订单生成器", href: "https://order.hereserver.com/mock-order/meituan/order.html", external: true },
  { label: "微信聊天与转账截图", href: "https://order.hereserver.com/mock-order/wechat/index.html", external: true },
  { label: "得物订单生成器", href: "https://order.hereserver.com/mock-order/dewu/order.html", external: true },
  { label: "携程酒店订单生成器", href: "https://order.hereserver.com/mock-order/xc/order-new.html", external: true },
  { label: "飞猪车票订单生成器", href: "https://order.hereserver.com/mock-order/feizhu/order.html", external: true },
  { label: "抖音订单生成器", href: "https://order.hereserver.com/mock-order/douyin/order.html", external: true },
  { label: "快手订单生成器", href: "https://order.hereserver.com/mock-order/kuaishou/order.html", external: true },
  { label: "去哪儿订单生成器", href: "https://order.hereserver.com/mock-order/qunaer/order.html", external: true },
  { label: "二维码生成器", href: "https://order.hereserver.com/mock-order/qrcode/index.html", external: true },
  { label: "微信转账收款截图", href: "https://jietuer.com/weixin-zhuanzhang.html", external: true },
  { label: "支付宝付款截图", href: "https://jietuer.com/alipay-fukuang.html", external: true },
];

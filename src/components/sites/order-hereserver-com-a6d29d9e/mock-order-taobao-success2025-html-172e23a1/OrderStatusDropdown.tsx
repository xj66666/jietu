"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "../shared/icons";

/**
 * 「订单状态」dropdown listing the seven Taobao order-state pages.
 *
 * On the target this is plain DOM, not Vue: the button carries an inline
 * `onclick="document.getElementById('dropdown').classList.toggle('hidden')"`. Same
 * effect here with local state, since nothing else observes it.
 *
 * Only 交易成功2025 exists in this repo; the rest keep absolute URLs to the origin.
 * Spec: docs/research/.../mock-order-taobao-success2025-html-172e23a1/BEHAVIORS.md#状态-l-细节
 */
const ORDER_STATUS_LINKS = [
  { label: "通用", href: "https://order.hereserver.com/mock-order/taobao/order.html", external: true },
  { label: "订单关闭", href: "https://order.hereserver.com/mock-order/taobao/close.html", external: true },
  { label: "交易成功", href: "https://order.hereserver.com/mock-order/taobao/success.html", external: true },
  { label: "交易成功2025", href: "/mock-order/taobao/success2025.html", external: false },
  { label: "已付款", href: "https://order.hereserver.com/mock-order/taobao/paid.html", external: true },
  { label: "待发货", href: "https://order.hereserver.com/mock-order/taobao/place.html", external: true },
  { label: "已发货", href: "https://order.hereserver.com/mock-order/taobao/shipped.html", external: true },
];

export function OrderStatusDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4">
      <button
        id="dropdownDefaultButton"
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-[8px] text-sm px-5 py-2.5 text-center inline-flex items-center"
      >
        订单状态 <ChevronDownIcon className="w-2.5 h-2.5 ms-3" />
      </button>

      <div
        id="dropdown"
        className={cn(
          "z-10 bg-white divide-y divide-gray-100 rounded-[8px] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] w-44",
          !open && "hidden",
        )}
      >
        <ul className="py-2 text-sm text-gray-700" aria-labelledby="dropdownDefaultButton">
          {ORDER_STATUS_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
                className="block px-4 py-2 hover:bg-gray-100"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

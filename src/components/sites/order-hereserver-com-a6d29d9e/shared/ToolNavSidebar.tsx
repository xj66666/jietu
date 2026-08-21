import { cn } from "@/lib/utils";
import { NavHomeIcon } from "./icons";
import { TOOL_NAV_HOME, TOOL_NAV_ITEMS } from "./tool-nav-items";

/**
 * Left-hand tool navigation. Sticky below the 60px header on md+, collapsed behind
 * `MobileNavToggleRow` below that. Only state is hover (bg-gray-100, 75ms).
 * Spec: docs/research/order-hereserver-com-a6d29d9e/SharedShell.spec.md#2-toolnavsidebar
 */
export function ToolNavSidebar({ isShowNav }: { isShowNav: boolean }) {
  return (
    <aside
      id="separator-sidebar"
      aria-label="Sidebar"
      className={cn(
        "md:w-64 md:min-w-[256px] md:h-[calc(100vh-60px)] md:overflow-y-auto md:sticky md:top-[60px] scrollbar-hide",
        isShowNav ? "block" : "hidden md:block",
      )}
    >
      <div className="h-full px-3 py-4 overflow-y-auto scrollbar-hide">
        <ul className="space-y-2 font-medium">
          <li>
            <a
              href={TOOL_NAV_HOME.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center p-2 text-gray-900 rounded-[8px] hover:bg-gray-100 group"
            >
              <NavHomeIcon className="icon shrink-0 w-5 h-5 text-gray-500" />
              <span className="ms-3">{TOOL_NAV_HOME.label}</span>
            </a>
          </li>
        </ul>
        <ul className="pt-4 mt-4 space-y-2 font-medium border-t border-gray-200">
          {TOOL_NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
                className="flex items-center p-2 text-gray-900 transition duration-75 rounded-[8px] hover:bg-gray-100 group"
              >
                <span className="ms-3">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

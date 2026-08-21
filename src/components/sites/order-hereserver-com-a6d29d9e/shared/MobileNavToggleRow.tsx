/**
 * The `md:hidden` row that appears below 768px: a nav toggle plus a jump link to the
 * editor. Button copy comes from the target's `openNavText` / `closeNavText`.
 * Spec: docs/research/order-hereserver-com-a6d29d9e/SharedShell.spec.md#3-mobilenavtogglerow
 */
export function MobileNavToggleRow({
  isShowNav,
  onToggleNav,
}: {
  isShowNav: boolean;
  onToggleNav: () => void;
}) {
  return (
    <div className="flex justify-center gap-4 py-4 md:hidden">
      <button
        type="button"
        onClick={onToggleNav}
        className="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-[8px] border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
      >
        {isShowNav ? "关闭导航" : "打开导航"}
      </button>
      <a
        className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-[8px] text-sm px-5 py-2.5"
        href="#editor-ct"
      >
        编辑截图
      </a>
    </div>
  );
}

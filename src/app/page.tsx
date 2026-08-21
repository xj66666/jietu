import Link from "next/link";

/**
 * Template scaffold landing page. The clone targets keep their own source pathnames,
 * so this stays in place — updated to point at what has been built.
 */
const CLONED_ROUTES = [
  { href: "/mock-order/pdd/order.html", label: "拼多多订单生成器" },
  { href: "/mock-order/taobao/success2025.html", label: "淘宝交易成功订单生成器 - 2025 新版" },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <p className="text-muted-foreground text-sm">
        Cloned from <code className="font-mono text-foreground">order.hereserver.com</code>
      </p>
      <ul className="flex flex-col gap-3 text-center">
        {CLONED_ROUTES.map((route) => (
          <li key={route.href}>
            <Link href={route.href} className="underline underline-offset-4 hover:no-underline">
              {route.label}
            </Link>
            <span className="text-muted-foreground ml-2 font-mono text-xs">{route.href}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

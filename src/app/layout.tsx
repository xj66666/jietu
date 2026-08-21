import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Website Clone",
  description: "Pixel-perfect website clone",
};

/**
 * The scaffold originally pulled Geist / Geist Mono via `next/font/google`. This
 * network cannot reach fonts.googleapis.com, so those calls are dropped and the font
 * stack falls through to the `ui-sans-serif, system-ui` fallbacks already declared by
 * `--font-sans` / `--font-mono` in globals.css.
 *
 * The cloned routes are unaffected: they self-host their own faces through
 * `src/app/mock-order/layout.tsx`, matching what the target actually serves.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
};

function getTabClassNames(isActive: boolean): string {
  return isActive
    ? "rounded-md px-3 py-2 text-sm font-medium border bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
    : "rounded-md px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800";
}

export default function Header() {
  const pathname = usePathname();

  const tabs: Tab[] = [
    {
      href: "/",
      label: "Home",
      isActive: (p) => p === "/",
    },
    {
      href: "/scan",
      label: "Scan",
      isActive: (p) => p.startsWith("/scan"),
    },
    {
      href: "/health",
      label: "Health",
      isActive: (p) => p.startsWith("/health"),
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur dark:bg-slate-900/70">
      <div className="mx-auto max-w-5xl px-4">
        <nav className="flex items-center justify-between h-14" aria-label="Primary">
          <div className="flex items-center gap-2 font-semibold">
            <span className="text-slate-900 dark:text-slate-100">UMBC Hackathon</span>
          </div>
          <ul className="flex items-center gap-1">
            {tabs.map((tab) => {
              const active = tab.isActive(pathname);
              return (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    className={getTabClassNames(active)}
                    aria-current={active ? "page" : undefined}
                  >
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}



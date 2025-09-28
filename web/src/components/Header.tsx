"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
};

function getTabClassNames(isActive: boolean): string {
  return isActive
    ? "relative rounded-xl px-6 py-3 text-sm font-semibold bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-2xl shadow-teal-500/40 hover:shadow-[0_25px_50px_-12px_rgba(20,184,166,0.4)] transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 ease-out border border-teal-500/30 active:scale-95 active:translate-y-0 active:shadow-lg active:shadow-teal-500/30"
    : "relative rounded-xl px-6 py-3 text-sm font-medium text-slate-600 hover:text-teal-700 bg-white/60 hover:bg-gradient-to-br hover:from-teal-50 hover:to-teal-100 hover:shadow-xl hover:shadow-teal-200/40 transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 ease-out border border-slate-200/60 hover:border-teal-300/60 dark:text-slate-300 dark:hover:text-teal-300 dark:bg-slate-800/60 dark:hover:bg-gradient-to-br dark:hover:from-teal-900/30 dark:hover:to-teal-800/30 dark:hover:shadow-teal-900/40 dark:border-slate-700/60 dark:hover:border-teal-600/60 active:scale-95 active:translate-y-0 active:shadow-lg";
}

export default function Header() {
  const pathname = usePathname();

  const handleClick = () => {
    // Create a subtle click sound effect using Web Audio API
    if (typeof window !== 'undefined') {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:bg-slate-900/80 dark:border-slate-700/60 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16" aria-label="Primary">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-slate-300 dark:group-hover:ring-slate-600 transition-all duration-200">
              <Image
                src="/logo_hackumbc.jpg"
                alt="Cybercane Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-200">
                cybercane
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Senior Care Technology
              </span>
            </div>
          </Link>
          <ul className="flex items-center gap-2 bg-gradient-to-r from-teal-50/80 to-teal-100/80 dark:from-teal-900/30 dark:to-teal-800/30 rounded-2xl p-2 backdrop-blur-md border border-teal-200/60 dark:border-teal-700/60 shadow-lg shadow-teal-200/20 dark:shadow-teal-900/20">
            {tabs.map((tab) => {
              const active = tab.isActive(pathname);
              return (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    onClick={handleClick}
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



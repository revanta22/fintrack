"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Wallet } from "lucide-react";

const nav = [
  { href: "/",             label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight  },
  { href: "/assets",       label: "Aset",      icon: Wallet          },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-52 min-w-[208px] bg-white border-r border-gray-100 flex-col py-5 gap-1">
        <div className="px-5 pb-5 border-b border-gray-100 mb-2">
          <p className="text-sm font-semibold text-gray-900">FinTrack</p>
          <p className="text-xs text-gray-400 mt-0.5">Personal Finance</p>
        </div>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm transition-colors
                ${active
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
              <Icon size={16} strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </aside>

      {/* Mobile Bottom Navbar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs transition-colors
                ${active ? "text-gray-900 font-medium" : "text-gray-400"}`}>
              <Icon size={20} strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
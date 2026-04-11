"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Wallet } from "lucide-react";

const nav = [
  { href: "/",             label: "Dashboard",  icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi",  icon: ArrowLeftRight  },
  { href: "/assets",       label: "Aset",       icon: Wallet          },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-52 min-w-[208px] bg-white border-r border-gray-100 flex flex-col py-5 gap-1">
      {/* Logo */}
      <div className="px-5 pb-5 border-b border-gray-100 mb-2">
        <p className="text-sm font-semibold text-gray-900">FinTrack</p>
        <p className="text-xs text-gray-400 mt-0.5">Personal Finance</p>
      </div>

      {/* Nav */}
      {nav.map(({ href, label, icon: Icon }) => {
        const active = path === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm transition-colors
              ${active
                ? "bg-gray-100 text-gray-900 font-medium"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
          >
            <Icon size={16} strokeWidth={1.8} />
            {label}
          </Link>
        );
      })}
    </aside>
  );
}

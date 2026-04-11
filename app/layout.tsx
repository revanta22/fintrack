import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FinanceProvider } from "@/lib/store";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinTrack — Personal Finance",
  description: "Personal finance & asset tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <FinanceProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto p-6 md:p-8">
              {children}
            </main>
          </div>
        </FinanceProvider>
      </body>
    </html>
  );
}

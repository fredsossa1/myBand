import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "../components/sidebar";
import { MobileMenu } from "../components/mobile-menu";
import { PageHeader } from "../components/page-header";
import { DatabaseInitializer } from "../components/database-initializer";
import { LanguageProvider } from "@/hooks/use-language";
import { AdminProvider } from "@/hooks/use-admin";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Band Availability System",
  description: "Modern band availability tracking system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <AdminProvider>
            <DatabaseInitializer />
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
              {/* Mobile Menu Button */}
              <MobileMenu />

              <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Desktop Sidebar (hidden on mobile) */}
                  <div className="w-full lg:w-64 flex-shrink-0 hidden lg:block">
                    <Sidebar />
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <PageHeader />
                    <main>{children}</main>
                  </div>
                </div>
              </div>
            </div>
          </AdminProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

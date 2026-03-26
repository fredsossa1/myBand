import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "../components/app-shell";
import { DatabaseInitializer } from "../components/database-initializer";
import { LanguageProvider } from "@/hooks/use-language";
import { AdminProvider } from "@/hooks/use-admin";
import { UserProvider } from "@/hooks/use-user";

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
          <UserProvider>
            <AdminProvider>
              <DatabaseInitializer />
              <AppShell>{children}</AppShell>
            </AdminProvider>
          </UserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

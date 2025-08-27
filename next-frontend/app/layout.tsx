import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "../components/navigation";
import { DatabaseInitializer } from "../components/database-initializer";

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
        <DatabaseInitializer />
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          {/* Navigation */}
          <div className="container mx-auto px-4 pt-4">
            <Navigation />
          </div>
          
          {/* Main Content */}
          <main className="pb-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

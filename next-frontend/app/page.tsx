"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card className="glass border-white/20">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-white text-4xl font-bold mb-4">
              🎵 Band Availability System
            </CardTitle>
            <p className="text-white/80 text-xl">
              Modern availability tracking for your band
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant="outline" className="border-green-500/50 text-green-300">
                ✅ Next.js 14
              </Badge>
              <Badge variant="outline" className="border-blue-500/50 text-blue-300">
                ✅ TypeScript
              </Badge>
              <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                ✅ shadcn/ui
              </Badge>
              <Badge variant="outline" className="border-yellow-500/50 text-yellow-300">
                ✅ Advanced Hooks
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/availability">
                <Card className="glass-dark border-white/10 hover:border-white/30 transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">�</div>
                    <h3 className="text-white font-semibold mb-2">Availability</h3>
                    <p className="text-white/70 text-sm">
                      Manage your availability for upcoming events
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/stats">
                <Card className="glass-dark border-white/10 hover:border-white/30 transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📊</div>
                    <h3 className="text-white font-semibold mb-2">Statistics</h3>
                    <p className="text-white/70 text-sm">
                      View detailed analytics and response patterns
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Card className="glass-dark border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">⚙️</div>
                  <h3 className="text-white font-semibold mb-2">Admin</h3>
                  <p className="text-white/70 text-sm">
                    Manage events and settings (Coming Soon)
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Migration Progress */}
        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl">🎉 Migration Complete!</CardTitle>
            <p className="text-white/70">
              Full-stack Next.js application with modern React patterns and API routes
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="outline" className="border-green-500/50 text-green-300 text-lg px-4 py-2">
                  ✅ Next.js 14 + TypeScript
                </Badge>
                <Badge variant="outline" className="border-blue-500/50 text-blue-300 text-lg px-4 py-2">
                  ✅ 15+ API Routes
                </Badge>
                <Badge variant="outline" className="border-purple-500/50 text-purple-300 text-lg px-4 py-2">
                  ✅ Supabase Database
                </Badge>
                <Badge variant="outline" className="border-yellow-500/50 text-yellow-300 text-lg px-4 py-2">
                  ✅ Production Ready
                </Badge>
              </div>
              <div className="text-white/60 text-sm mt-4">
                Migrated from Express.js to unified Next.js full-stack application
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-xl">🚀 Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/availability">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  📅 Manage Availability
                </Button>
              </Link>
              <Link href="/stats">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  📊 View Statistics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="glass border-white/20">
          <CardContent className="p-6 text-center">
            <p className="text-white/60">
              🎵 Built with Next.js 14, TypeScript, TailwindCSS, and shadcn/ui
            </p>
            <p className="text-white/40 text-sm mt-2">
              Modern full-stack application for worship team management
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

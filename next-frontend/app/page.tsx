"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ApiDemo } from "../lib/api-demo";
import { ComponentShowcase } from "../components/component-showcase";
import { AdvancedHooksDemo } from "../components/advanced-hooks-demo";

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
            <CardTitle className="text-white text-2xl">🚧 Frontend Migration Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl mb-2">✅</div>
                <h4 className="text-white font-medium">Step 2A</h4>
                <p className="text-white/60 text-sm">TypeScript Types</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">✅</div>
                <h4 className="text-white font-medium">Step 2B</h4>
                <p className="text-white/60 text-sm">API Client</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">✅</div>
                <h4 className="text-white font-medium">Step 2C</h4>
                <p className="text-white/60 text-sm">shadcn/ui Components</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">✅</div>
                <h4 className="text-white font-medium">Step 2D</h4>
                <p className="text-white/60 text-sm">Advanced Hooks</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Badge variant="outline" className="border-green-500/50 text-green-300 text-lg px-4 py-2">
                🎉 Step 2E: Application Pages - COMPLETE!
              </Badge>
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
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              >
                🧪 View Technical Demos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Technical Demos */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              🧪 Technical Implementation Demos
            </h2>
            <p className="text-white/70">
              Showcasing the underlying technology and migration progress
            </p>
          </div>

          <div id="advanced-hooks">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              🚀 Advanced Hooks Demo - Step 2D
            </h3>
            <AdvancedHooksDemo />
          </div>

          <div id="api-demo">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              🔌 API Client Demo - Step 2B
            </h3>
            <ApiDemo />
          </div>

          <div id="component-showcase">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              🎨 shadcn/ui Components - Step 2C
            </h3>
            <ComponentShowcase />
          </div>
        </div>

        {/* Footer */}
        <Card className="glass border-white/20">
          <CardContent className="p-6 text-center">
            <p className="text-white/60">
              🎵 Built with Next.js 14, TypeScript, TailwindCSS, and shadcn/ui
            </p>
            <p className="text-white/40 text-sm mt-2">
              Frontend migration from vanilla JavaScript to modern React patterns
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

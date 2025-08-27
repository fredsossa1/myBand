"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  // Check if user is already logged in as admin
  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const handleAdminLogin = async () => {
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      
      const data = await response.json();
      if (data.isAdmin) {
        setIsAdmin(true);
        localStorage.setItem('isAdmin', 'true');
        setShowAdminLogin(false);
        setAdminPassword("");
      } else {
        alert('Invalid admin password');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      alert('Login failed');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Login/Logout */}
        <div className="fixed top-4 right-4 z-50">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500/50 text-green-300">
                👑 Admin
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAdminLogout}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {showAdminLogin ? (
                <div className="bg-black/50 p-4 rounded-lg border border-white/20">
                  <input
                    type="password"
                    placeholder="Admin password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                    className="w-full p-2 mb-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAdminLogin} size="sm">Login</Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowAdminLogin(false)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAdminLogin(true)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  🔐 Admin
                </Button>
              )}
            </div>
          )}
        </div>

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
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📅</div>
                    <h3 className="text-white font-semibold mb-2">Availability</h3>
                    <p className="text-white/70 text-sm">
                      Manage your availability for upcoming events
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {isAdmin ? (
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
              ) : (
                <Card className="glass-dark border-white/10 opacity-50">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">🔒</div>
                    <h3 className="text-white font-semibold mb-2">Statistics</h3>
                    <p className="text-white/70 text-sm">
                      Admin access required
                    </p>
                  </CardContent>
                </Card>
              )}

              {isAdmin ? (
                <Card className="glass-dark border-white/10">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">⚙️</div>
                    <h3 className="text-white font-semibold mb-2">Admin</h3>
                    <p className="text-white/70 text-sm">
                      Manage events and settings
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-dark border-white/10 opacity-50">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">🔒</div>
                    <h3 className="text-white font-semibold mb-2">Admin</h3>
                    <p className="text-white/70 text-sm">
                      Admin access required
                    </p>
                  </CardContent>
                </Card>
              )}
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
